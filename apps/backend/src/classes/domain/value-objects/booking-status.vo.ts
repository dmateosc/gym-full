export enum BookingStatus {
  CONFIRMED = 'confirmed',
  WAITLIST = 'waitlist',
  CANCELLED = 'cancelled',
}

export const BOOKING_STATUSES = Object.values(BookingStatus);
