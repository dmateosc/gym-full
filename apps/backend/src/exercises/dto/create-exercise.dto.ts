import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseCategory, Difficulty } from '../entities/exercise.entity';

export class CreateExerciseDto {
  @ApiProperty({
    description: 'Nombre del ejercicio',
    example: 'Flexiones de brazos',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del ejercicio',
    example: 'Ejercicio para fortalecer el pecho, tríceps y deltoides anteriores',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Categoría del ejercicio',
    enum: ExerciseCategory,
    example: ExerciseCategory.STRENGTH,
  })
  @IsNotEmpty()
  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;

  @ApiProperty({
    description: 'Nivel de dificultad',
    enum: Difficulty,
    example: Difficulty.INTERMEDIATE,
  })
  @IsNotEmpty()
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Grupos musculares que trabaja el ejercicio',
    type: [String],
    example: ['Pectorales', 'Tríceps', 'Deltoides'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  muscleGroups: string[];

  @ApiProperty({
    description: 'Equipamiento necesario para el ejercicio',
    type: [String],
    example: ['Ninguno', 'Peso corporal'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  equipment: string[];

  @ApiProperty({
    description: 'Instrucciones paso a paso del ejercicio',
    type: [String],
    example: [
      'Colócate en posición de plancha con los brazos extendidos',
      'Baja el cuerpo doblando los codos',
      'Empuja hacia arriba hasta la posición inicial'
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  instructions: string[];

  @ApiPropertyOptional({
    description: 'Duración estimada en minutos',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @ApiPropertyOptional({
    description: 'Calorías estimadas quemadas',
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiPropertyOptional({
    description: 'URL de imagen del ejercicio',
    example: 'https://example.com/exercise-image.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de video demostrativo',
    example: 'https://example.com/exercise-video.mp4',
  })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;
}
