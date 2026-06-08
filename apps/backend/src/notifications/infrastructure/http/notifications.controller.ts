import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/application/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/application/guards/roles.guard';
import { CurrentUser } from '../../../auth/application/decorators/current-user.decorator';
import { JwtPayload } from '../../../shared/infrastructure/jwt/jwt-verifier';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';

import {
  CountUnreadNotificationsUseCase,
  ListMyNotificationsUseCase,
} from '../../application/use-cases/list-my-notifications.use-case';
import {
  MarkAllNotificationsAsReadUseCase,
  MarkNotificationAsReadUseCase,
} from '../../application/use-cases/mark-notification.use-cases';
import { NotificationResponseDto } from './dto/notification-response.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listMine: ListMyNotificationsUseCase,
    private readonly countUnread: CountUnreadNotificationsUseCase,
    private readonly markRead: MarkNotificationAsReadUseCase,
    private readonly markAllRead: MarkAllNotificationsAsReadUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  @Get('mine')
  @ApiOperation({ summary: 'Notificaciones del usuario autenticado' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async mine(
    @CurrentUser() user: JwtPayload,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<NotificationResponseDto[]> {
    const me = await this.resolveLocalUserId(user);
    const list = await this.listMine.execute(me, {
      unreadOnly: unreadOnly === 'true',
    });
    return list.map((n) => NotificationResponseDto.fromDomain(n));
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contador de notificaciones no leídas' })
  async unreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ count: number }> {
    const me = await this.resolveLocalUserId(user);
    return { count: await this.countUnread.execute(me) };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  async markOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    const me = await this.resolveLocalUserId(user);
    await this.markRead.execute({ id, requestingUserId: me });
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  async markAll(@CurrentUser() user: JwtPayload): Promise<void> {
    const me = await this.resolveLocalUserId(user);
    await this.markAllRead.execute(me);
  }

  private async resolveLocalUserId(user: JwtPayload): Promise<string> {
    const local = await this.userRepo.findBySupabaseId(user.sub);
    if (!local) throw new NotFoundException('Perfil no sincronizado');
    return local.id;
  }
}
