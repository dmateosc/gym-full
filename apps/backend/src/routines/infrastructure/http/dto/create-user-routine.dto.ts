import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoutineIntensity } from '../../persistence/daily-routine.orm-entity';
import { ExerciseType } from '../../persistence/routine-exercise.orm-entity';

class UserRoutineExerciseItem {
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
}

export class CreateUserRoutineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RoutineIntensity)
  intensity?: RoutineIntensity;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480)
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UserRoutineExerciseItem)
  exercises: UserRoutineExerciseItem[];
}
