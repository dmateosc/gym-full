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
} from '../../persistence/daily-routine.orm-entity';

export class CreateDailyRoutineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  routineDate: string;

  @IsOptional()
  @IsEnum(RoutineIntensity)
  intensity?: RoutineIntensity;

  @IsOptional()
  @IsEnum(RoutineStatus)
  status?: RoutineStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480)
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
