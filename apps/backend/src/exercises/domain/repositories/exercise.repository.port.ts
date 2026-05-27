import { ExerciseOrmEntity } from '../../infrastructure/persistence/exercise.orm-entity';
import { ExerciseFiltersDto } from '../../infrastructure/http/dto/exercise-filters.dto';

/**
 * Puerto (interfaz) del repositorio de ejercicios.
 * El dominio depende de esta interfaz, no de TypeORM directamente.
 */
export abstract class ExerciseRepositoryPort {
  abstract findAll(filters?: ExerciseFiltersDto): Promise<ExerciseOrmEntity[]>;
  abstract findById(id: string): Promise<ExerciseOrmEntity | null>;
  abstract create(
    exercise: Partial<ExerciseOrmEntity>,
  ): Promise<ExerciseOrmEntity>;
  abstract update(
    id: string,
    exercise: Partial<ExerciseOrmEntity>,
  ): Promise<ExerciseOrmEntity>;
  abstract delete(id: string): Promise<void>;
  abstract getDistinctCategories(): Promise<string[]>;
  abstract getDistinctMuscleGroups(): Promise<string[]>;
  abstract getDistinctEquipment(): Promise<string[]>;
  abstract search(
    term: string,
    category?: string,
  ): Promise<ExerciseOrmEntity[]>;
  abstract getStatistics(): Promise<{
    totalExercises: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    totalEquipment: number;
    totalMuscleGroups: number;
  }>;
}

export const EXERCISE_REPOSITORY = Symbol('EXERCISE_REPOSITORY');
