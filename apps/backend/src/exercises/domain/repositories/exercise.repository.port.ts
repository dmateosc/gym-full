import { Exercise } from '../../entities/exercise.entity';
import { ExerciseFiltersDto } from '../../dto/exercise-filters.dto';

/**
 * Puerto (interfaz) del repositorio de ejercicios.
 * El dominio depende de esta interfaz, no de TypeORM directamente.
 */
export abstract class ExerciseRepositoryPort {
  abstract findAll(filters?: ExerciseFiltersDto): Promise<Exercise[]>;
  abstract findById(id: string): Promise<Exercise | null>;
  abstract create(exercise: Partial<Exercise>): Promise<Exercise>;
  abstract update(id: string, exercise: Partial<Exercise>): Promise<Exercise>;
  abstract delete(id: string): Promise<void>;
  abstract getDistinctCategories(): Promise<string[]>;
  abstract getDistinctMuscleGroups(): Promise<string[]>;
  abstract getDistinctEquipment(): Promise<string[]>;
}

export const EXERCISE_REPOSITORY = Symbol('EXERCISE_REPOSITORY');
