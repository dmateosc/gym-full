export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_PROMOTED = 'booking_promoted',
  DAILY_REMINDER = 'daily_reminder',
  CLASS_ASSIGNED = 'class_assigned',
}

export const NOTIFICATION_TYPES = Object.values(NotificationType);
