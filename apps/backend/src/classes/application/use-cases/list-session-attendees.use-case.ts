import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  BookingRepositoryPort,
} from '../../domain/repositories/booking.repository.port';
import {
  CLASS_SESSION_REPOSITORY,
  ClassSessionRepositoryPort,
} from '../../domain/repositories/class-session.repository.port';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';

export interface AttendeeView {
  booking: BookingEntity;
  userEmail: string;
  userFullName: string | null;
}

export interface ListSessionAttendeesQuery {
  sessionId: string;
  requestingUserId: string;
  requestingUserRole: UserRole;
}

@Injectable()
export class ListSessionAttendeesUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookings: BookingRepositoryPort,
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly sessions: ClassSessionRepositoryPort,
    @Inject(CLASS_REPOSITORY)
    private readonly classes: ClassRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(q: ListSessionAttendeesQuery): Promise<AttendeeView[]> {
    const session = await this.sessions.findById(q.sessionId);
    if (!session) throw new NotFoundException('Sesión no encontrada');
    const klass = await this.classes.findById(session.classId);
    if (!klass) throw new NotFoundException('Clase no encontrada');

    if (
      q.requestingUserRole !== UserRole.ADMIN &&
      !klass.belongsTo(q.requestingUserId)
    ) {
      throw new ForbiddenException(
        'Solo el instructor de la clase o un admin pueden ver los asistentes',
      );
    }

    const bookings = await this.bookings.findActiveBySession(q.sessionId);
    if (bookings.length === 0) return [];

    const userIds = Array.from(new Set(bookings.map((b) => b.userId)));
    const users = await Promise.all(
      userIds.map((id) => this.users.findById(id)),
    );
    const userById = new Map<
      string,
      { email: string; fullName: string | null }
    >();
    for (const u of users) {
      if (u) userById.set(u.id, { email: u.email, fullName: u.fullName });
    }

    return bookings.map((b) => ({
      booking: b,
      userEmail: userById.get(b.userId)?.email ?? '—',
      userFullName: userById.get(b.userId)?.fullName ?? null,
    }));
  }
}
