import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { ClassSessionOrmEntity } from './class-session.orm-entity';
import { ClassSessionEntity } from '../../domain/entities/class-session.entity';
import {
  ClassSessionRepositoryPort,
  UpsertSessionData,
} from '../../domain/repositories/class-session.repository.port';

@Injectable()
export class ClassSessionTypeormRepository implements ClassSessionRepositoryPort {
  constructor(
    @InjectRepository(ClassSessionOrmEntity)
    private readonly repo: Repository<ClassSessionOrmEntity>,
  ) {}

  async findById(id: string): Promise<ClassSessionEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async upsertScheduledSession(
    data: UpsertSessionData,
  ): Promise<ClassSessionEntity> {
    // ON CONFLICT (class_id, scheduled_at) DO NOTHING — idempotent.
    // Inserting RETURNING gives us the new row if created; if skipped,
    // we re-query so callers always get the canonical row.
    const inserted = await this.repo
      .createQueryBuilder()
      .insert()
      .into(ClassSessionOrmEntity)
      .values({
        classId: data.classId,
        scheduledAt: data.scheduledAt,
        status: 'scheduled' as never,
      })
      .orIgnore('ON CONSTRAINT class_sessions_unique_slot')
      .returning('*')
      .execute();

    if (inserted.raw && inserted.raw.length > 0) {
      return this.toDomain(inserted.raw[0] as ClassSessionOrmEntity);
    }
    const existing = await this.repo.findOne({
      where: { classId: data.classId, scheduledAt: data.scheduledAt },
    });
    if (!existing) {
      throw new Error('Session upsert failed: no row returned and none found');
    }
    return this.toDomain(existing);
  }

  async findInRange(opts: {
    fromUtc: Date;
    toUtc: Date;
    classIds?: string[];
  }): Promise<ClassSessionEntity[]> {
    const where: Record<string, unknown> = {
      scheduledAt: Between(opts.fromUtc, opts.toUtc),
    };
    if (opts.classIds && opts.classIds.length > 0) {
      where.classId = In(opts.classIds);
    }
    const rows = await this.repo.find({
      where,
      order: { scheduledAt: 'ASC' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: ClassSessionEntity): Promise<ClassSessionEntity> {
    const p = entity.toPlainObject();
    await this.repo.update(
      { id: entity.id },
      {
        capacityOverride: p.capacityOverride,
        status: p.status,
      },
    );
    const row = await this.repo.findOne({ where: { id: entity.id } });
    if (!row) throw new Error(`Sesión ${entity.id} no encontrada tras guardar`);
    return this.toDomain(row);
  }

  private toDomain(row: ClassSessionOrmEntity): ClassSessionEntity {
    return new ClassSessionEntity({
      id: row.id,
      classId: row.classId,
      scheduledAt: row.scheduledAt,
      capacityOverride: row.capacityOverride,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
