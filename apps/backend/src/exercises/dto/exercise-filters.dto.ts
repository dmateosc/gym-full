import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ExerciseCategory, Difficulty } from '../entities/exercise.entity';

export class ExerciseFiltersDto {
  @IsOptional()
  @IsEnum(ExerciseCategory)
  category?: ExerciseCategory;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  muscleGroup?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  equipment?: string;
}
