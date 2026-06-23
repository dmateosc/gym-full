import { WorkoutSessionOrmEntity } from '../../infrastructure/persistence/workout-session.orm-entity';

export abstract class WorkoutSessionRepositoryPort {
  abstract create(
    data: Partial<WorkoutSessionOrmEntity>,
  ): Promise<WorkoutSessionOrmEntity>;
  abstract findById(id: string): Promise<WorkoutSessionOrmEntity | null>;
  abstract findByUser(userId: string): Promise<WorkoutSessionOrmEntity[]>;
  abstract update(
    id: string,
    data: Partial<WorkoutSessionOrmEntity>,
  ): Promise<WorkoutSessionOrmEntity>;
}

export const WORKOUT_SESSION_REPOSITORY = Symbol('WORKOUT_SESSION_REPOSITORY');
