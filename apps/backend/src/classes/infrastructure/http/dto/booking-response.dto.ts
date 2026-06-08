import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../domain/value-objects/booking-status.vo';
import { ClassEntity } from '../../../domain/entities/class.entity';
import { ClassSessionEntity } from '../../../domain/entities/class-session.entity';
import { ClassCategory } from '../../../domain/value-objects/class-category.vo';

export class BookingResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() sessionId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty({ enum: BookingStatus }) status!: BookingStatus;
  @ApiPropertyOptional({ nullable: true }) position!: number | null;
  @ApiProperty() createdAt!: Date;

  static fromDomain(b: BookingEntity): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = b.id;
    dto.sessionId = b.sessionId;
    dto.userId = b.userId;
    dto.status = b.status;
    dto.position = b.position;
    dto.createdAt = b.createdAt;
    return dto;
  }
}

export class MyBookingResponseDto {
  @ApiProperty() bookingId!: string;
  @ApiProperty({ enum: BookingStatus }) status!: BookingStatus;
  @ApiPropertyOptional({ nullable: true }) position!: number | null;
  @ApiProperty() sessionId!: string;
  @ApiProperty() classId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: ClassCategory }) category!: ClassCategory;
  @ApiProperty() scheduledAt!: Date;
  @ApiProperty() durationMin!: number;
  @ApiPropertyOptional({ nullable: true }) location!: string | null;

  static from(
    b: BookingEntity,
    s: ClassSessionEntity,
    k: ClassEntity,
  ): MyBookingResponseDto {
    const dto = new MyBookingResponseDto();
    dto.bookingId = b.id;
    dto.status = b.status;
    dto.position = b.position;
    dto.sessionId = s.id;
    dto.classId = k.id;
    dto.name = k.name;
    dto.category = k.category;
    dto.scheduledAt = s.scheduledAt;
    dto.durationMin = k.durationMin;
    dto.location = k.location;
    return dto;
  }
}

export class AttendeeResponseDto {
  @ApiProperty() bookingId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() userEmail!: string;
  @ApiPropertyOptional({ nullable: true }) userFullName!: string | null;
  @ApiProperty({ enum: BookingStatus }) status!: BookingStatus;
  @ApiPropertyOptional({ nullable: true }) position!: number | null;

  static from(
    b: BookingEntity,
    userEmail: string,
    userFullName: string | null,
  ): AttendeeResponseDto {
    const dto = new AttendeeResponseDto();
    dto.bookingId = b.id;
    dto.userId = b.userId;
    dto.userEmail = userEmail;
    dto.userFullName = userFullName;
    dto.status = b.status;
    dto.position = b.position;
    return dto;
  }
}
