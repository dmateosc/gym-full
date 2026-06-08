import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { NotificationOrmEntity } from './notification.orm-entity';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationRepositoryPort } from '../../domain/repositories/notification.repository.port';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';

@Injectable()
export class NotificationTypeormRepository
  implements NotificationRepositoryPort
{
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repo: Repository<NotificationOrmEntity>,
  ) {}

  async findById(id: string): Promise<NotificationEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUser(
    userId: string,
    opts?: { unreadOnly?: boolean },
  ): Promise<NotificationEntity[]> {
    const rows = await this.repo.find({
      where: opts?.unreadOnly ? { userId, readAt: IsNull() } : { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, readAt: IsNull() } });
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    payload?: Record<string, unknown>;
  }): Promise<NotificationEntity> {
    const row = this.repo.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      payload: data.payload ?? {},
    });
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async markAsRead(id: string): Promise<void> {
    await this.repo.update({ id, readAt: IsNull() }, { readAt: new Date() });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update(
      { userId, readAt: IsNull() },
      { readAt: new Date() },
    );
  }

  private toDomain(row: NotificationOrmEntity): NotificationEntity {
    return new NotificationEntity({
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      body: row.body,
      payload: row.payload,
      readAt: row.readAt,
      createdAt: row.createdAt,
    });
  }
}
