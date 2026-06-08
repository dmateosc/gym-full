import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassCategory } from '../../../domain/value-objects/class-category.vo';

export class CreateClassDto {
  @ApiProperty({ example: 'Spinning matutino', minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'Sesión intensa de spinning con música motivadora' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiProperty({ enum: ClassCategory, example: ClassCategory.CYCLING })
  @IsEnum(ClassCategory)
  category!: ClassCategory;

  @ApiProperty({ description: '0 = domingo, 6 = sábado', minimum: 0, maximum: 6, example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ description: "Hora de inicio en formato 'HH:MM'", example: '19:00' })
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

  @ApiPropertyOptional({ example: 'Sala 1' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string | null;
}
