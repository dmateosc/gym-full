import { Injectable, Inject } from '@nestjs/common';
import {
  DAILY_ROUTINE_REPOSITORY,
  DailyRoutineRepositoryPort,
} from '../../domain/repositories/daily-routine.repository.port';

@Injectable()
export class DailyRoutineQueriesUseCase {
  constructor(
    @Inject(DAILY_ROUTINE_REPOSITORY)
    private readonly routineRepo: DailyRoutineRepositoryPort,
  ) {}

  async findByDate(date: string) {
    return this.routineRepo.findByDate(date);
  }

  async findByDateRange(startDate: string, endDate: string) {
    return this.routineRepo.findByDateRange(startDate, endDate);
  }

  async findToday() {
    return this.routineRepo.findToday();
  }

  async findUpcoming(days = 7) {
    return this.routineRepo.findUpcoming(days);
  }

  async getWeekRoutines(startDate: string) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return this.routineRepo.findByDateRange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    );
  }

  async getMonthRoutines(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return this.routineRepo.findByDateRange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    );
  }
}
