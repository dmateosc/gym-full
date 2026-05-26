import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  DAILY_ROUTINE_REPOSITORY,
  DailyRoutineRepositoryPort,
} from '../../domain/repositories/daily-routine.repository.port';
import { RoutineStatus } from '../../infrastructure/persistence/daily-routine.orm-entity';

@Injectable()
export class DailyRoutineLifecycleUseCase {
  constructor(
    @Inject(DAILY_ROUTINE_REPOSITORY)
    private readonly routineRepo: DailyRoutineRepositoryPort,
  ) {}

  private async getOrFail(id: string) {
    const routine = await this.routineRepo.findById(id);
    if (!routine) throw new NotFoundException(`Rutina con ID ${id} no encontrada`);
    return routine;
  }

  async startRoutine(id: string) {
    const routine = await this.getOrFail(id);
    return this.routineRepo.update(id, {
      status: RoutineStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
  }

  async completeRoutine(id: string, completionNotes?: string) {
    const routine = await this.getOrFail(id);
    const completedAt = new Date();
    let actualDurationMinutes: number | undefined;

    if (routine.startedAt) {
      const durationMs = completedAt.getTime() - routine.startedAt.getTime();
      actualDurationMinutes = Math.round(durationMs / (1000 * 60));
    }

    return this.routineRepo.update(id, {
      status: RoutineStatus.COMPLETED,
      completedAt,
      actualDurationMinutes,
      ...(completionNotes ? { completionNotes } : {}),
    });
  }

  async skipRoutine(id: string, reason?: string) {
    await this.getOrFail(id);
    return this.routineRepo.update(id, {
      status: RoutineStatus.SKIPPED,
      ...(reason ? { completionNotes: `Saltada: ${reason}` } : {}),
    });
  }
}
