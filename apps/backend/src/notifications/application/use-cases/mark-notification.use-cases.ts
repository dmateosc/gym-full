import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepositoryPort,
} from '../../domain/repositories/notification.repository.port';

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  async execute(cmd: { id: string; requestingUserId: string }): Promise<void> {
    const n = await this.repo.findById(cmd.id);
    if (!n) throw new NotFoundException('Notificación no encontrada');
    if (!n.belongsTo(cmd.requestingUserId)) {
      throw new ForbiddenException('No puedes marcar una notificación ajena');
    }
    await this.repo.markAsRead(cmd.id);
  }
}

@Injectable()
export class MarkAllNotificationsAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repo: NotificationRepositoryPort,
  ) {}

  execute(userId: string): Promise<void> {
    return this.repo.markAllAsRead(userId);
  }
}
