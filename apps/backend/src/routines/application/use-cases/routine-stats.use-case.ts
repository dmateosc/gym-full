import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  DAILY_ROUTINE_REPOSITORY,
  DailyRoutineRepositoryPort,
} from '../../domain/repositories/daily-routine.repository.port';
import { RoutineStatus } from '../../infrastructure/persistence/daily-routine.orm-entity';

interface RoutineExerciseWithExercise {
  exercise?: {
    category?: string;
    muscleGroups?: string[];
  };
}

@Injectable()
export class RoutineStatsUseCase {
  constructor(
    @Inject(DAILY_ROUTINE_REPOSITORY)
    private readonly routineRepo: DailyRoutineRepositoryPort,
  ) {}

  async getRoutineStats(id: string) {
    const routine = await this.routineRepo.findById(id);
    if (!routine) throw new NotFoundException(`Rutina con ID ${id} no encontrada`);

    const totalExercises = routine.routineExercises.length;
    const categories = [
      ...new Set(
        routine.routineExercises
          .filter((re: RoutineExerciseWithExercise) => re.exercise)
          .map((re: RoutineExerciseWithExercise) => re.exercise?.category)
          .filter(Boolean),
      ),
    ];
    const totalEstimatedCalories = routine.estimatedCalories || 0;
    const totalEstimatedDuration = routine.estimatedDurationMinutes || 0;

    return {
      totalExercises,
      categories,
      totalEstimatedCalories,
      totalEstimatedDuration,
      intensityDistribution: routine.intensity,
      muscleGroups: [
        ...new Set(
          routine.routineExercises
            .filter(
              (re: RoutineExerciseWithExercise) =>
                re.exercise && re.exercise.muscleGroups,
            )
            .flatMap(
              (re: RoutineExerciseWithExercise) => re.exercise?.muscleGroups,
            )
            .filter(Boolean),
        ),
      ],
      status: routine.status,
      actualDuration: routine.actualDurationMinutes,
      startedAt: routine.startedAt,
      completedAt: routine.completedAt,
    };
  }

  async getProgressStats(startDate: string, endDate: string) {
    const routines = await this.routineRepo.findByDateRange(startDate, endDate);

    const totalRoutines = routines.length;
    const completedRoutines = routines.filter(
      (r) => r.status === RoutineStatus.COMPLETED,
    ).length;
    const skippedRoutines = routines.filter(
      (r) => r.status === RoutineStatus.SKIPPED,
    ).length;
    const totalCalories = routines
      .filter((r) => r.status === RoutineStatus.COMPLETED)
      .reduce((sum, r) => sum + (r.estimatedCalories || 0), 0);
    const totalDuration = routines
      .filter((r) => r.status === RoutineStatus.COMPLETED)
      .reduce(
        (sum, r) =>
          sum + (r.actualDurationMinutes || r.estimatedDurationMinutes || 0),
        0,
      );

    return {
      totalRoutines,
      completedRoutines,
      skippedRoutines,
      completionRate:
        totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0,
      totalCalories,
      totalDuration,
      averageRoutineTime:
        completedRoutines > 0 ? totalDuration / completedRoutines : 0,
    };
  }
}
