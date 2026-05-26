import { RoutineExerciseOrmEntity } from '../../infrastructure/persistence/routine-exercise.orm-entity';

export abstract class RoutineExerciseRepositoryPort {
  abstract create(
    data: Partial<RoutineExerciseOrmEntity>,
  ): Promise<RoutineExerciseOrmEntity>;
  abstract update(
    id: string,
    data: Partial<RoutineExerciseOrmEntity>,
  ): Promise<RoutineExerciseOrmEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<RoutineExerciseOrmEntity | null>;
  abstract findByRoutineAndOrder(
    routineId: string,
    order: number,
  ): Promise<RoutineExerciseOrmEntity | null>;
  abstract findByRoutineId(
    routineId: string,
  ): Promise<RoutineExerciseOrmEntity[]>;
}

export const ROUTINE_EXERCISE_REPOSITORY = Symbol(
  'ROUTINE_EXERCISE_REPOSITORY',
);
