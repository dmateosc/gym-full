import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { BookingOrmEntity } from './booking.orm-entity';
import { ClassSessionOrmEntity } from './class-session.orm-entity';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingStatus } from '../../domain/value-objects/booking-status.vo';
import {
  BookingCounts,
  BookingRepositoryPort,
} from '../../domain/repositories/booking.repository.port';

@Injectable()
export class BookingTypeormRepository implements BookingRepositoryPort {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly repo: Repository<BookingOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<BookingEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findActiveBySessionAndUser(
    sessionId: string,
    userId: string,
  ): Promise<BookingEntity | null> {
    const row = await this.repo
      .createQueryBuilder('b')
      .where('b.session_id = :sessionId', { sessionId })
      .andWhere('b.user_id = :userId', { userId })
      .andWhere('b.status <> :cancelled', {
        cancelled: BookingStatus.CANCELLED,
      })
      .getOne();
    return row ? this.toDomain(row) : null;
  }

  async findActiveBySession(sessionId: string): Promise<BookingEntity[]> {
    const rows = await this.repo
      .createQueryBuilder('b')
      .where('b.session_id = :sessionId', { sessionId })
      .andWhere('b.status <> :cancelled', {
        cancelled: BookingStatus.CANCELLED,
      })
      .orderBy(
        // confirmed before waitlist; within waitlist, ordered by position
        `CASE b.status WHEN 'confirmed' THEN 0 WHEN 'waitlist' THEN 1 ELSE 2 END`,
        'ASC',
      )
      .addOrderBy('b.position', 'ASC', 'NULLS FIRST')
      .addOrderBy('b.created_at', 'ASC')
      .getMany();
    return rows.map((r) => this.toDomain(r));
  }

  async findActiveByUser(userId: string): Promise<BookingEntity[]> {
    const rows = await this.repo
      .createQueryBuilder('b')
      .where('b.user_id = :userId', { userId })
      .andWhere('b.status <> :cancelled', {
        cancelled: BookingStatus.CANCELLED,
      })
      .orderBy('b.created_at', 'DESC')
      .getMany();
    return rows.map((r) => this.toDomain(r));
  }

  async countsBySession(
    sessionIds: string[],
  ): Promise<Map<string, BookingCounts>> {
    if (sessionIds.length === 0) return new Map();
    const rows = await this.repo
      .createQueryBuilder('b')
      .select('b.session_id', 'sessionId')
      .addSelect('b.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .where('b.session_id IN (:...sessionIds)', { sessionIds })
      .andWhere('b.status <> :cancelled', {
        cancelled: BookingStatus.CANCELLED,
      })
      .groupBy('b.session_id')
      .addGroupBy('b.status')
      .getRawMany<{
        sessionId: string;
        status: BookingStatus;
        count: number;
      }>();

    const map = new Map<string, BookingCounts>();
    for (const id of sessionIds) {
      map.set(id, { confirmed: 0, waitlist: 0 });
    }
    for (const r of rows) {
      const entry = map.get(r.sessionId) ?? { confirmed: 0, waitlist: 0 };
      if (r.status === BookingStatus.CONFIRMED) entry.confirmed = r.count;
      else if (r.status === BookingStatus.WAITLIST) entry.waitlist = r.count;
      map.set(r.sessionId, entry);
    }
    return map;
  }

  async findUserBookingsForSessions(
    userId: string,
    sessionIds: string[],
  ): Promise<BookingEntity[]> {
    if (sessionIds.length === 0) return [];
    const rows = await this.repo.find({
      where: { userId, sessionId: In(sessionIds) },
    });
    return rows.map((r) => this.toDomain(r));
  }

  /**
   * Reserva atómica. Locks the session row (FOR UPDATE) so the
   * confirmed-count can be trusted within the transaction; if there's
   * room, inserts a CONFIRMED row, otherwise inserts a WAITLIST row
   * with position = MAX(position)+1.
   */
  async bookAtomically(opts: {
    sessionId: string;
    userId: string;
    capacity: number;
  }): Promise<{
    booking: BookingEntity;
    status: BookingStatus;
    position: number | null;
  }> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // Lock the session row so concurrent bookings serialise here.
      const session = await manager
        .createQueryBuilder(ClassSessionOrmEntity, 's')
        .setLock('pessimistic_write')
        .where('s.id = :id', { id: opts.sessionId })
        .getOne();
      if (!session) {
        throw new NotFoundException(`Sesión ${opts.sessionId} no encontrada`);
      }

      // Reject if the user already has a non-cancelled booking on this session.
      const existing = await manager
        .createQueryBuilder(BookingOrmEntity, 'b')
        .where('b.session_id = :sessionId', { sessionId: opts.sessionId })
        .andWhere('b.user_id = :userId', { userId: opts.userId })
        .andWhere('b.status <> :cancelled', {
          cancelled: BookingStatus.CANCELLED,
        })
        .getOne();
      if (existing) {
        throw new ConflictException(
          'Ya tienes una reserva activa en esta sesión',
        );
      }

      const confirmedCount = await manager.count(BookingOrmEntity, {
        where: { sessionId: opts.sessionId, status: BookingStatus.CONFIRMED },
      });

      let row: BookingOrmEntity;
      let position: number | null = null;
      let status: BookingStatus;

      if (confirmedCount < opts.capacity) {
        status = BookingStatus.CONFIRMED;
        row = manager.create(BookingOrmEntity, {
          sessionId: opts.sessionId,
          userId: opts.userId,
          status,
          position: null,
        });
      } else {
        // Capacity reached → join waitlist at the next slot.
        const maxPos = await manager
          .createQueryBuilder(BookingOrmEntity, 'b')
          .select('COALESCE(MAX(b.position), 0)', 'max')
          .where('b.session_id = :sessionId', { sessionId: opts.sessionId })
          .andWhere('b.status = :status', { status: BookingStatus.WAITLIST })
          .getRawOne<{ max: number }>();
        position = (maxPos?.max ?? 0) + 1;
        status = BookingStatus.WAITLIST;
        row = manager.create(BookingOrmEntity, {
          sessionId: opts.sessionId,
          userId: opts.userId,
          status,
          position,
        });
      }

      const saved = await manager.save(BookingOrmEntity, row);
      return { booking: this.toDomain(saved), status, position };
    });
  }

  /**
   * Atomic cancellation. If the cancelled booking was confirmed and
   * there's a waitlist on the same session, promote the first one
   * (lowest position) to CONFIRMED in the same transaction.
   */
  async cancelAtomically(opts: { bookingId: string }): Promise<{
    cancelled: BookingEntity;
    promoted: BookingEntity | null;
  }> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const booking = await manager
        .createQueryBuilder(BookingOrmEntity, 'b')
        .setLock('pessimistic_write')
        .where('b.id = :id', { id: opts.bookingId })
        .getOne();
      if (!booking) {
        throw new NotFoundException(`Reserva ${opts.bookingId} no encontrada`);
      }
      if (booking.status === BookingStatus.CANCELLED) {
        return { cancelled: this.toDomain(booking), promoted: null };
      }

      // Lock the session too — we may promote a waitlist row in this txn.
      await manager
        .createQueryBuilder(ClassSessionOrmEntity, 's')
        .setLock('pessimistic_write')
        .where('s.id = :id', { id: booking.sessionId })
        .getOne();

      const wasConfirmed = booking.status === BookingStatus.CONFIRMED;
      booking.status = BookingStatus.CANCELLED;
      booking.position = null;
      const cancelled = await manager.save(BookingOrmEntity, booking);

      let promoted: BookingEntity | null = null;
      if (wasConfirmed) {
        const next = await manager
          .createQueryBuilder(BookingOrmEntity, 'b')
          .where('b.session_id = :sessionId', { sessionId: booking.sessionId })
          .andWhere('b.status = :status', { status: BookingStatus.WAITLIST })
          .orderBy('b.position', 'ASC', 'NULLS LAST')
          .addOrderBy('b.created_at', 'ASC')
          .getOne();
        if (next) {
          next.status = BookingStatus.CONFIRMED;
          next.position = null;
          const promotedRow = await manager.save(BookingOrmEntity, next);
          promoted = this.toDomain(promotedRow);
        }
      }
      return { cancelled: this.toDomain(cancelled), promoted };
    });
  }

  private toDomain(row: BookingOrmEntity): BookingEntity {
    return new BookingEntity({
      id: row.id,
      sessionId: row.sessionId,
      userId: row.userId,
      status: row.status,
      position: row.position,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
