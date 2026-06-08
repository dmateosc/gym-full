export type NotificationType =
  | 'booking_confirmed'
  | 'booking_promoted'
  | 'daily_reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}
