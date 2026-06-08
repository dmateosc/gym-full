import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationEntity } from '../../../domain/entities/notification.entity';
import { NotificationType } from '../../../domain/value-objects/notification-type.vo';

export class NotificationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: NotificationType }) type!: NotificationType;
  @ApiProperty() title!: string;
  @ApiProperty() body!: string;
  @ApiProperty({ type: Object }) payload!: Record<string, unknown>;
  @ApiPropertyOptional({ nullable: true }) readAt!: Date | null;
  @ApiProperty() createdAt!: Date;

  static fromDomain(n: NotificationEntity): NotificationResponseDto {
    const dto = new NotificationResponseDto();
    dto.id = n.id;
    dto.type = n.type;
    dto.title = n.title;
    dto.body = n.body;
    dto.payload = n.payload;
    dto.readAt = n.readAt;
    dto.createdAt = n.createdAt;
    return dto;
  }
}
