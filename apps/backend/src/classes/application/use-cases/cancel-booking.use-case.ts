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
import { BookingEntity } from '../../domain/entities/booking.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';
import {
  CLASS_SESSION_REPOSITORY,
  ClassSessionRepositoryPort,
} from '../../domain/repositories/class-session.repository.port';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import {
  NOTIFICATIONS_QUEUE,
  NotificationsQueuePort,
} from '../../../notifications/application/services/notifications-queue.port';

export interface CancelBookingCommand {
  bookingId: string;
  requestingUserId: string;
  requestingUserRole: UserRole;
}

@Injectable()
export class CancelBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookings: BookingRepositoryPort,
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly sessions: ClassSessionRepositoryPort,
    @Inject(CLASS_REPOSITORY)
    private readonly classes: ClassRepositoryPort,
    @Inject(NOTIFICATIONS_QUEUE)
    private readonly queue: NotificationsQueuePort,
  ) {}

  async execute(cmd: CancelBookingCommand): Promise<{
    cancelled: BookingEntity;
    promoted: BookingEntity | null;
  }> {
    const booking = await this.bookings.findById(cmd.bookingId);
    if (!booking) {
      throw new NotFoundException(`Reserva ${cmd.bookingId} no encontrada`);
    }

    if (
      cmd.requestingUserRole !== UserRole.ADMIN &&
      !booking.belongsTo(cmd.requestingUserId)
    ) {
      throw new ForbiddenException('Solo puedes cancelar tus propias reservas');
    }

    // Repo handles the atomic state change + waitlist promotion.
    const result = await this.bookings.cancelAtomically({
      bookingId: cmd.bookingId,
    });

    // If a waitlist booking was promoted, notify the new confirmee.
    if (result.promoted) {
      const session = await this.sessions.findById(result.promoted.sessionId);
      const klass = session
        ? await this.classes.findById(session.classId)
        : null;
      if (session && klass) {
        void this.queue.enqueue({
          type: 'booking-promoted',
          userId: result.promoted.userId,
          bookingId: result.promoted.id,
          sessionId: session.id,
          classId: klass.id,
          className: klass.name,
          scheduledAt: session.scheduledAt,
        });
      }
    }

    return result;
  }
}
