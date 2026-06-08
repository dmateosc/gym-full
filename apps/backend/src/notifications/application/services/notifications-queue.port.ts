/**
 * Eventos que los casos de uso de otros dominios pueden disparar.
 * El puerto desacopla "alguien quiere notificar" del transporte real
 * (BullMQ + Redis hoy; sin tocar callers el día que cambiemos).
 */
export interface BookingConfirmedEvent {
  type: 'booking-confirmed';
  userId: string;
  bookingId: string;
  sessionId: string;
  classId: string;
  className: string;
  scheduledAt: Date;
}

export interface BookingPromotedEvent {
  type: 'booking-promoted';
  userId: string;
  bookingId: string;
  sessionId: string;
  classId: string;
  className: string;
  scheduledAt: Date;
}

export type NotificationEvent = BookingConfirmedEvent | BookingPromotedEvent;

export abstract class NotificationsQueuePort {
  abstract enqueue(event: NotificationEvent): Promise<void>;
}

export const NOTIFICATIONS_QUEUE = Symbol('NOTIFICATIONS_QUEUE');
