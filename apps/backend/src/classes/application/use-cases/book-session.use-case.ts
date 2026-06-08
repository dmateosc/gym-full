import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../../domain/repositories/booking.repository.port';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import {
  CLASS_SESSION_REPOSITORY,
  ClassSessionRepositoryPort,
} from '../../domain/repositories/class-session.repository.port';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingStatus } from '../../domain/value-objects/booking-status.vo';
import { madridDayRangeUtc } from '../services/madrid-time';
import { ClassSessionStatus } from '../../domain/value-objects/class-session-status.vo';

export interface BookSessionCommand {
  sessionId: string;
  userId: string;
  now?: Date;
}

export interface BookSessionResult {
  booking: BookingEntity;
  status: BookingStatus;
  position: number | null;
}

@Injectable()
export class BookSessionUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookings: BookingRepositoryPort,
    @Inject(CLASS_REPOSITORY)
    private readonly classes: ClassRepositoryPort,
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly sessions: ClassSessionRepositoryPort,
  ) {}

  async execute(cmd: BookSessionCommand): Promise<BookSessionResult> {
    const session = await this.sessions.findById(cmd.sessionId);
    if (!session) {
      throw new NotFoundException(`Sesión ${cmd.sessionId} no encontrada`);
    }
    if (session.status !== ClassSessionStatus.SCHEDULED) {
      throw new BadRequestException(
        'Esta sesión ya no está programada (cancelada o completada)',
      );
    }

    const now = cmd.now ?? new Date();
    if (now >= session.scheduledAt) {
      throw new BadRequestException('La clase ya ha comenzado');
    }

    // Same-day rule: only book on the calendar day of the session (Madrid).
    const { fromUtc, toUtc } = madridDayRangeUtc(now);
    if (session.scheduledAt < fromUtc || session.scheduledAt >= toUtc) {
      throw new BadRequestException(
        'Solo se puede reservar el mismo día de la clase',
      );
    }

    const klass = await this.classes.findById(session.classId);
    if (!klass || !klass.isActive()) {
      throw new NotFoundException('Clase no disponible');
    }

    // Repo enforces uniqueness + concurrency via SELECT FOR UPDATE.
    try {
      return await this.bookings.bookAtomically({
        sessionId: session.id,
        userId: cmd.userId,
        capacity: session.effectiveCapacity(klass.capacity),
      });
    } catch (e) {
      if (e instanceof ConflictException || e instanceof NotFoundException) {
        throw e;
      }
      // Defensive: any other failure surface as a 400 to the caller.
      throw new BadRequestException((e as Error).message);
    }
  }
}
