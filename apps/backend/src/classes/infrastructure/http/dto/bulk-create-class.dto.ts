import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassCategory } from '../../../domain/value-objects/class-category.vo';

/**
 * Crear varias clases recurrentes a la vez, una por cada día de la
 * semana seleccionado. Útil cuando el instructor imparte la misma
 * clase varios días con el mismo horario (p.ej. TRX lunes y miércoles).
 * Se crea una fila de `classes` por día.
 */
export class BulkCreateClassesDto {
  @ApiProperty({ example: 'TRX', minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'Suspensión con TRX, full-body' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiProperty({ enum: ClassCategory, example: ClassCategory.FUNCTIONAL })
  @IsEnum(ClassCategory)
  category!: ClassCategory;

  @ApiProperty({
    description: 'Lista de días de la semana (0=domingo … 6=sábado)',
    example: [1, 3],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek!: number[];

  @ApiProperty({
    description: "Hora de inicio en formato 'HH:MM'",
    example: '19:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime debe ser HH:MM' })
  startTime!: string;

  @ApiProperty({ minimum: 1, maximum: 600, example: 60 })
  @IsInt()
  @Min(1)
  @Max(600)
  durationMin!: number;

  @ApiProperty({ minimum: 1, maximum: 1000, example: 20 })
  @IsInt()
  @Min(1)
  @Max(1000)
  capacity!: number;

  @ApiPropertyOptional({ example: 'Sala 2' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string | null;

  /** Solo lo respeta el backend cuando el caller es ADMIN. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  instructorId?: string;
}
