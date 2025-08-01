import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ExerciseType } from '../entities/routine-exercise.entity';

export class CreateRoutineExerciseDto {
  @IsUUID()
  dailyRoutineId: string;

  @IsUUID()
  exerciseId: string;

  @IsNumber()
  @Min(1)
  orderInRoutine: number;

  @IsOptional()
  @IsEnum(ExerciseType)
  exerciseType?: ExerciseType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sets?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceMeters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  restSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  intensity?: string;
}
