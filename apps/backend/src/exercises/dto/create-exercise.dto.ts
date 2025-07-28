import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { ExerciseCategory, Difficulty } from '../entities/exercise.entity';

export class CreateExerciseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;

  @IsNotEmpty()
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  muscleGroups: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  equipment: string[];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  instructions: string[];

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;
}
