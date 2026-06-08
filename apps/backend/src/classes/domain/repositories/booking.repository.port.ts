import { BookingEntity } from '../entities/booking.entity';
import { BookingStatus } from '../value-objects/booking-status.vo';

export interface BookingCounts {
  confirmed: number;
  waitlist: number;
}

export abstract class BookingRepositoryPort {
  abstract findById(id: string): Promise<BookingEntity | null>;

  /** Encuentra la reserva ACTIVA (no cancelada) de un usuario en una sesión. */
  abstract findActiveBySessionAndUser(
    sessionId: string,
    userId: string,
  ): Promise<BookingEntity | null>;

  /** Reservas activas de una sesión ordenadas (confirmed primero, luego waitlist por posición). */
  abstract findActiveBySession(sessionId: string): Promise<BookingEntity[]>;

  /** Reservas activas de un usuario en sesiones futuras (o hoy todavía sin empezar). */
  abstract findActiveByUser(userId: string): Promise<BookingEntity[]>;

  /** Cuenta reservas por estado para varias sesiones de una sola query (para enriquecer la vista de hoy). */
  abstract countsBySession(
    sessionIds: string[],
  ): Promise<Map<string, BookingCounts>>;

  /** Devuelve las reservas activas del usuario en las sesiones dadas. */
  abstract findUserBookingsForSessions(
    userId: string,
    sessionIds: string[],
  ): Promise<BookingEntity[]>;

  /**
   * Operación atómica de reserva. Lockea la fila de la sesión, cuenta
   * confirmadas dentro de la transacción y crea la nueva reserva con
   * el estado correcto (`confirmed` o `waitlist` + posición).
   */
  abstract bookAtomically(opts: {
    sessionId: string;
    userId: string;
    capacity: number;
  }): Promise<{
    booking: BookingEntity;
    status: BookingStatus;
    position: number | null;
  }>;

  /**
   * Operación atómica de cancelación. Si la reserva estaba confirmada
   * y hay waitlist, promueve la primera fila de waitlist. Devuelve
   * la reserva cancelada y la posiblemente promovida.
   */
  abstract cancelAtomically(opts: { bookingId: string }): Promise<{
    cancelled: BookingEntity;
    promoted: BookingEntity | null;
  }>;
}

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');
