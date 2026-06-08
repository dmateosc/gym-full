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
    return this.bookings.cancelAtomically({ bookingId: cmd.bookingId });
  }
}
