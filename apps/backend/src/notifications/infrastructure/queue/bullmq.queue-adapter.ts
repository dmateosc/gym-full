import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NotificationEvent,
  NotificationsQueuePort,
} from '../../application/services/notifications-queue.port';
import { NOTIFICATIONS_QUEUE_NAME } from './queue-tokens';

@Injectable()
export class BullmqNotificationsQueue implements NotificationsQueuePort {
  private readonly logger = new Logger('NotificationsQueue');

  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE_NAME) private readonly queue: Queue,
  ) {}

  async enqueue(event: NotificationEvent): Promise<void> {
    try {
      await this.queue.add(event.type, event, {
        removeOnComplete: { age: 24 * 3600, count: 1000 },
        removeOnFail: { age: 7 * 24 * 3600 },
      });
    } catch (err) {
      // Never let a queue outage break the booking flow. Just log.
      this.logger.error(
        `Failed to enqueue ${event.type} for user ${event.userId}: ${(err as Error).message}`,
      );
    }
  }
}

/**
 * Implementación no-op para cuando no hay Redis configurado (dev local,
 * entorno de test). Mantiene la app funcional aunque sin notificaciones.
 */
@Injectable()
export class NoopNotificationsQueue implements NotificationsQueuePort {
  private readonly logger = new Logger('NoopNotificationsQueue');

  enqueue(event: NotificationEvent): Promise<void> {
    this.logger.debug(
      `Redis no configurado; descartando evento ${event.type} para ${event.userId}`,
    );
    return Promise.resolve();
  }
}
