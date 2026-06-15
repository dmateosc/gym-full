import { DailyRoutineOrmEntity } from '../../infrastructure/persistence/daily-routine.orm-entity';

export abstract class DailyRoutineRepositoryPort {
  abstract findAll(): Promise<DailyRoutineOrmEntity[]>;
  abstract findById(id: string): Promise<DailyRoutineOrmEntity | null>;
  abstract findByDate(date: string): Promise<DailyRoutineOrmEntity | null>;
  abstract findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<DailyRoutineOrmEntity[]>;
  abstract findToday(): Promise<DailyRoutineOrmEntity | null>;
  abstract findUpcoming(days?: number): Promise<DailyRoutineOrmEntity[]>;
  abstract create(
    data: Partial<DailyRoutineOrmEntity>,
  ): Promise<DailyRoutineOrmEntity>;
  abstract update(
    id: string,
    data: Partial<DailyRoutineOrmEntity>,
  ): Promise<DailyRoutineOrmEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findByOwner(ownerUserId: string): Promise<DailyRoutineOrmEntity[]>;
}

export const DAILY_ROUTINE_REPOSITORY = Symbol('DAILY_ROUTINE_REPOSITORY');
