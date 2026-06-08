import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
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
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/repositories/user.repository.port';

import { BookSessionUseCase } from '../../application/use-cases/book-session.use-case';
import { CancelBookingUseCase } from '../../application/use-cases/cancel-booking.use-case';
import { ListMyBookingsUseCase } from '../../application/use-cases/list-my-bookings.use-case';
import { ListSessionAttendeesUseCase } from '../../application/use-cases/list-session-attendees.use-case';

import {
  AttendeeResponseDto,
  BookingResponseDto,
  MyBookingResponseDto,
} from './dto/booking-response.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class BookingsController {
  constructor(
    private readonly bookSession: BookSessionUseCase,
    private readonly cancelBooking: CancelBookingUseCase,
    private readonly listMyBookings: ListMyBookingsUseCase,
    private readonly listAttendees: ListSessionAttendeesUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  @Post('class-sessions/:id/bookings')
  @ApiOperation({
    summary: 'Reservar plaza en una sesión (regla: solo el mismo día)',
  })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  async book(
    @CurrentUser() user: JwtPayload,
    @Param('id') sessionId: string,
  ): Promise<BookingResponseDto> {
    const me = await this.resolveLocalUserId(user);
    const { booking } = await this.bookSession.execute({
      sessionId,
      userId: me,
    });
    return BookingResponseDto.fromDomain(booking);
  }

  @Get('class-sessions/:id/bookings')
  @ApiOperation({
    summary: '[INSTRUCTOR/ADMIN] Listar asistentes de una sesión',
  })
  @ApiResponse({ status: 200, type: [AttendeeResponseDto] })
  async attendees(
    @CurrentUser() user: JwtPayload,
    @Param('id') sessionId: string,
  ): Promise<AttendeeResponseDto[]> {
    const me = await this.resolveLocalUserId(user);
    const views = await this.listAttendees.execute({
      sessionId,
      requestingUserId: me,
      requestingUserRole: user.role as UserRole,
    });
    return views.map((v) =>
      AttendeeResponseDto.from(v.booking, v.userEmail, v.userFullName),
    );
  }

  @Get('bookings/mine')
  @ApiOperation({ summary: 'Reservas activas del usuario autenticado' })
  @ApiResponse({ status: 200, type: [MyBookingResponseDto] })
  async mine(@CurrentUser() user: JwtPayload): Promise<MyBookingResponseDto[]> {
    const me = await this.resolveLocalUserId(user);
    const views = await this.listMyBookings.execute(me);
    return views.map((v) =>
      MyBookingResponseDto.from(v.booking, v.session, v.klass),
    );
  }

  @Delete('bookings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancelar reserva propia (admin puede cancelar cualquier)',
  })
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    const me = await this.resolveLocalUserId(user);
    await this.cancelBooking.execute({
      bookingId: id,
      requestingUserId: me,
      requestingUserRole: user.role as UserRole,
    });
  }

  private async resolveLocalUserId(user: JwtPayload): Promise<string> {
    const local = await this.userRepo.findBySupabaseId(user.sub);
    if (!local) {
      throw new NotFoundException(
        'Perfil local no encontrado — sincroniza tu cuenta antes de reservar',
      );
    }
    return local.id;
  }
}
