import {
  DynamicModule,
  Global,
  Logger,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { NotificationOrmEntity } from './infrastructure/persistence/notification.orm-entity';
import { NotificationTypeormRepository } from './infrastructure/persistence/notification.typeorm-repository';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository.port';

import { MAILER, LoggingMailer } from './application/services/mailer';
import {
  NOTIFICATIONS_QUEUE,
  NotificationsQueuePort,
} from './application/services/notifications-queue.port';
import {
  BullmqNotificationsQueue,
  NoopNotificationsQueue,
} from './infrastructure/queue/bullmq.queue-adapter';
import { NotificationsProcessor } from './infrastructure/queue/notifications.processor';
import {
  DAILY_REMINDER_JOB,
  NOTIFICATIONS_QUEUE_NAME,
} from './infrastructure/queue/queue-tokens';

import {
  ListMyNotificationsUseCase,
  CountUnreadNotificationsUseCase,
} from './application/use-cases/list-my-notifications.use-case';
import {
  MarkAllNotificationsAsReadUseCase,
  MarkNotificationAsReadUseCase,
} from './application/use-cases/mark-notification.use-cases';
import { NotificationsController } from './infrastructure/http/notifications.controller';
import { ClassesModule } from '../classes/classes.module';

const redisHost = (): string | undefined =>
  process.env.REDIS_HOST?.trim() || undefined;

/**
 * Daily fan-out: schedules a repeat job at 08:00 Europe/Madrid as
 * soon as the queue is ready. Idempotent — BullMQ keys repeats by
 * (jobName, repeatOpts), so re-running it after redeploys is a no-op.
 */
class DailyReminderScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger('DailyReminderScheduler');

  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE_NAME) private readonly queue: Queue,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.queue.add(
        DAILY_REMINDER_JOB,
        {},
        {
          repeat: { pattern: '0 8 * * *', tz: 'Europe/Madrid' },
          removeOnComplete: true,
          jobId: 'daily-reminder',
        },
      );
      this.logger.log('Daily reminder scheduled at 08:00 Europe/Madrid');
    } catch (err) {
      this.logger.error(
        `No se pudo programar el daily reminder: ${(err as Error).message}`,
      );
    }
  }
}

@Global()
@Module({})
export class NotificationsModule {
  static register(): DynamicModule {
    const redis = redisHost();
    const bullEnabled = !!redis;

    return {
      global: true,
      module: NotificationsModule,
      imports: [
        TypeOrmModule.forFeature([NotificationOrmEntity]),
        ClassesModule,
        ...(bullEnabled
          ? [
              BullModule.forRoot({
                connection: {
                  host: redis,
                  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                },
              }),
              BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE_NAME }),
            ]
          : []),
      ],
      controllers: [NotificationsController],
      providers: [
        {
          provide: NOTIFICATION_REPOSITORY,
          useClass: NotificationTypeormRepository,
        },
        { provide: MAILER, useClass: LoggingMailer },
        ListMyNotificationsUseCase,
        CountUnreadNotificationsUseCase,
        MarkNotificationAsReadUseCase,
        MarkAllNotificationsAsReadUseCase,
        ...(bullEnabled
          ? ([
              {
                provide: NOTIFICATIONS_QUEUE,
                useClass: BullmqNotificationsQueue,
              },
              NotificationsProcessor,
              DailyReminderScheduler,
            ] as const)
          : ([
              {
                provide: NOTIFICATIONS_QUEUE,
                useClass: NoopNotificationsQueue,
              },
            ] as const)),
      ],
      exports: [NOTIFICATIONS_QUEUE],
    };
  }
}

// Re-export for downstream modules that want to import from a stable path.
export type { NotificationsQueuePort };
