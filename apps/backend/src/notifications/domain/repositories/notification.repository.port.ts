import { NotificationEntity } from '../entities/notification.entity';
import { NotificationType } from '../value-objects/notification-type.vo';

export abstract class NotificationRepositoryPort {
  abstract findById(id: string): Promise<NotificationEntity | null>;
  abstract findByUser(
    userId: string,
    opts?: { unreadOnly?: boolean },
  ): Promise<NotificationEntity[]>;
  abstract countUnread(userId: string): Promise<number>;
  abstract create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    payload?: Record<string, unknown>;
  }): Promise<NotificationEntity>;
  abstract markAsRead(id: string): Promise<void>;
  abstract markAllAsRead(userId: string): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
