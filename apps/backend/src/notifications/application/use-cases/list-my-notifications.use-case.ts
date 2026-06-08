import { Inject, Injectable } from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../../domain/repositories/notification.repository.port';
import { NotificationEntity } from '../../domain/entities/notification.entity';

@Injectable()
export class ListMyNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  execute(
    userId: string,
    opts?: { unreadOnly?: boolean },
  ): Promise<NotificationEntity[]> {
    return this.repo.findByUser(userId, opts);
  }
}

@Injectable()
export class CountUnreadNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  execute(userId: string): Promise<number> {
    return this.repo.countUnread(userId);
  }
}
