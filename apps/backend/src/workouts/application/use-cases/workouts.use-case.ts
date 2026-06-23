import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  WORKOUT_SESSION_REPOSITORY,
  WorkoutSessionRepositoryPort,
} from '../../domain/repositories/workout-session.repository.port';
import {
  WorkoutSessionOrmEntity,
  WorkoutSessionStatus,
  type WorkoutSetLog,
} from '../../infrastructure/persistence/workout-session.orm-entity';

interface StartWorkoutCmd {
  userId: string;
  dailyRoutineId: string;
}

interface LogSetCmd {
  userId: string;
  sessionId: string;
  routineExerciseId: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  notes?: string;
}

interface CompleteCmd {
  userId: string;
  sessionId: string;
  notes?: string;
}

@Injectable()
export class WorkoutsUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY)
    private readonly repo: WorkoutSessionRepositoryPort,
  ) {}

  async start(cmd: StartWorkoutCmd): Promise<WorkoutSessionOrmEntity> {
    return this.repo.create({
      userId: cmd.userId,
      dailyRoutineId: cmd.dailyRoutineId,
      startedAt: new Date(),
      status: WorkoutSessionStatus.IN_PROGRESS,
      logs: [],
    });
  }

  async listMine(userId: string): Promise<WorkoutSessionOrmEntity[]> {
    return this.repo.findByUser(userId);
  }

  async getMine(
    sessionId: string,
    userId: string,
  ): Promise<WorkoutSessionOrmEntity> {
    const s = await this.repo.findById(sessionId);
    if (!s || s.userId !== userId) {
      throw new NotFoundException(`Sesión ${sessionId} no encontrada`);
    }
    return s;
  }

  /**
   * Inserta o sobrescribe el log de una serie concreta. Idempotente
   * por (routineExerciseId, setNumber).
   */
  async logSet(cmd: LogSetCmd): Promise<WorkoutSessionOrmEntity> {
    const session = await this.getMine(cmd.sessionId, cmd.userId);
    if (session.status !== WorkoutSessionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Solo puedes registrar series mientras la sesión esté en curso',
      );
    }

    const logs = [...(session.logs ?? [])];
    let exerciseLog = logs.find(
      (l) => l.routineExerciseId === cmd.routineExerciseId,
    );
    if (!exerciseLog) {
      exerciseLog = { routineExerciseId: cmd.routineExerciseId, sets: [] };
      logs.push(exerciseLog);
    }

    const set: WorkoutSetLog = {
      setNumber: cmd.setNumber,
      weight: cmd.weight ?? null,
      reps: cmd.reps ?? null,
      completedAt: new Date().toISOString(),
      notes: cmd.notes ?? null,
    };
    const existingIdx = exerciseLog.sets.findIndex(
      (s) => s.setNumber === cmd.setNumber,
    );
    if (existingIdx >= 0) {
      exerciseLog.sets[existingIdx] = set;
    } else {
      exerciseLog.sets.push(set);
      exerciseLog.sets.sort((a, b) => a.setNumber - b.setNumber);
    }

    return this.repo.update(session.id, { logs });
  }

  async complete(cmd: CompleteCmd): Promise<WorkoutSessionOrmEntity> {
    const session = await this.getMine(cmd.sessionId, cmd.userId);
    return this.repo.update(session.id, {
      status: WorkoutSessionStatus.COMPLETED,
      completedAt: new Date(),
      notes: cmd.notes ?? session.notes,
    });
  }

  async abandon(sessionId: string, userId: string): Promise<void> {
    const session = await this.getMine(sessionId, userId);
    if (session.status === WorkoutSessionStatus.COMPLETED) return;
    await this.repo.update(session.id, {
      status: WorkoutSessionStatus.ABANDONED,
      completedAt: new Date(),
    });
  }
}
