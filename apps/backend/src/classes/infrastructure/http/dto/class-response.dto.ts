import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassEntity } from '../../../domain/entities/class.entity';
import { ClassCategory } from '../../../domain/value-objects/class-category.vo';
import { ClassSessionEntity } from '../../../domain/entities/class-session.entity';
import { ClassSessionStatus } from '../../../domain/value-objects/class-session-status.vo';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../domain/value-objects/booking-status.vo';

export class ClassResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() instructorId!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty({ enum: ClassCategory }) category!: ClassCategory;
  @ApiProperty({ description: '0=domingo … 6=sábado' }) dayOfWeek!: number;
  @ApiProperty({ description: 'HH:MM' }) startTime!: string;
  @ApiProperty() durationMin!: number;
  @ApiProperty() capacity!: number;
  @ApiPropertyOptional({ nullable: true }) location!: string | null;
  @ApiProperty() active!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromDomain(e: ClassEntity): ClassResponseDto {
    const dto = new ClassResponseDto();
    Object.assign(dto, e.toPlainObject());
    return dto;
  }
}

export class TodaySessionResponseDto {
  @ApiProperty() sessionId!: string;
  @ApiProperty() classId!: string;
  @ApiProperty() instructorId!: string;
  @ApiPropertyOptional({
    nullable: true,
    description:
      'Nombre completo del instructor (cae a email si no hay nombre)',
  })
  instructorName!: string | null;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty({ enum: ClassCategory }) category!: ClassCategory;
  @ApiProperty({ description: 'ISO timestamp en UTC' }) scheduledAt!: Date;
  @ApiProperty() durationMin!: number;
  @ApiProperty() capacity!: number;
  @ApiPropertyOptional({ nullable: true }) location!: string | null;
  @ApiProperty({ enum: ClassSessionStatus }) status!: ClassSessionStatus;

  @ApiProperty({ description: 'Reservas confirmadas en esta sesión' })
  bookedCount!: number;
  @ApiProperty({ description: 'Personas en lista de espera' })
  waitlistCount!: number;
  @ApiProperty({ description: 'Plazas libres' })
  availableSpots!: number;

  @ApiPropertyOptional({ enum: BookingStatus, nullable: true })
  myBookingStatus!: BookingStatus | null;
  @ApiPropertyOptional({
    nullable: true,
    description: 'Posición del usuario en waitlist',
  })
  myWaitlistPosition!: number | null;
  @ApiPropertyOptional({
    nullable: true,
    description: 'Id de la reserva del usuario',
  })
  myBookingId!: string | null;

  static from(
    session: ClassSessionEntity,
    klass: ClassEntity,
    counts: { confirmed: number; waitlist: number },
    myBooking: BookingEntity | null,
    instructorName: string | null = null,
  ): TodaySessionResponseDto {
    const dto = new TodaySessionResponseDto();
    dto.sessionId = session.id;
    dto.classId = klass.id;
    dto.instructorId = klass.instructorId;
    dto.instructorName = instructorName;
    dto.name = klass.name;
    dto.description = klass.description;
    dto.category = klass.category;
    dto.scheduledAt = session.scheduledAt;
    dto.durationMin = klass.durationMin;
    dto.capacity = session.effectiveCapacity(klass.capacity);
    dto.location = klass.location;
    dto.status = session.status;
    dto.bookedCount = counts.confirmed;
    dto.waitlistCount = counts.waitlist;
    dto.availableSpots = Math.max(dto.capacity - counts.confirmed, 0);
    dto.myBookingStatus = myBooking?.status ?? null;
    dto.myWaitlistPosition = myBooking?.position ?? null;
    dto.myBookingId = myBooking?.id ?? null;
    return dto;
  }
}
