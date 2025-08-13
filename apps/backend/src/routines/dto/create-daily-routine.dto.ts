import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import {
  RoutineIntensity,
  RoutineStatus,
} from '../entities/daily-routine.entity';

export class CreateDailyRoutineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  routineDate: string; // ISO date string: "2025-08-01"

  @IsOptional()
  @IsEnum(RoutineIntensity)
  intensity?: RoutineIntensity;

  @IsOptional()
  @IsEnum(RoutineStatus)
  status?: RoutineStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480) // Máximo 8 horas
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCalories?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @IsOptional()
  @IsString()
  warmUpNotes?: string;

  @IsOptional()
  @IsString()
  coolDownNotes?: string;

  @IsOptional()
  @IsString()
  completionNotes?: string;
}
