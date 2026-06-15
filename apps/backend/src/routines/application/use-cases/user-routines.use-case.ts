import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  DAILY_ROUTINE_REPOSITORY,
  DailyRoutineRepositoryPort,
} from '../../domain/repositories/daily-routine.repository.port';
import {
  ROUTINE_EXERCISE_REPOSITORY,
  RoutineExerciseRepositoryPort,
} from '../../domain/repositories/routine-exercise.repository.port';
import { CreateUserRoutineDto } from '../../infrastructure/http/dto/create-user-routine.dto';
import {
  DailyRoutineOrmEntity,
  RoutineVisibility,
} from '../../infrastructure/persistence/daily-routine.orm-entity';

@Injectable()
export class UserRoutinesUseCase {
  constructor(
    @Inject(DAILY_ROUTINE_REPOSITORY)
    private readonly routineRepo: DailyRoutineRepositoryPort,
    @Inject(ROUTINE_EXERCISE_REPOSITORY)
    private readonly exerciseRepo: RoutineExerciseRepositoryPort,
  ) {}

  async listMine(ownerUserId: string): Promise<DailyRoutineOrmEntity[]> {
    return this.routineRepo.findByOwner(ownerUserId);
  }

  async getMine(
    id: string,
    ownerUserId: string,
  ): Promise<DailyRoutineOrmEntity> {
    const routine = await this.routineRepo.findById(id);
    if (!routine || routine.ownerUserId !== ownerUserId) {
      throw new NotFoundException(`Rutina ${id} no encontrada`);
    }
    return routine;
  }

  async createMine(
    ownerUserId: string,
    dto: CreateUserRoutineDto,
  ): Promise<DailyRoutineOrmEntity> {
    const routine = await this.routineRepo.create({
      name: dto.name,
      description: dto.description,
      intensity: dto.intensity,
      estimatedDurationMinutes: dto.estimatedDurationMinutes,
      goals: dto.goals,
      ownerUserId,
      isTemplate: true,
      routineDate: null,
      visibility: RoutineVisibility.PRIVATE,
    });

    for (const ex of dto.exercises) {
      await this.exerciseRepo.create({
        dailyRoutineId: routine.id,
        exerciseId: ex.exerciseId,
        orderInRoutine: ex.orderInRoutine,
        exerciseType: ex.exerciseType,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        durationSeconds: ex.durationSeconds,
        distanceMeters: ex.distanceMeters,
        restSeconds: ex.restSeconds,
        notes: ex.notes,
      });
    }

    return this.routineRepo.findById(routine.id) as Promise<DailyRoutineOrmEntity>;
  }

  /**
   * Clona una rutina (de sistema o pública) como template propio del
   * usuario. Snapshot: copia los ejercicios tal cual; cambios futuros
   * en la rutina origen no afectan al clon.
   */
  async cloneToMine(
    sourceId: string,
    ownerUserId: string,
  ): Promise<DailyRoutineOrmEntity> {
    const source = await this.routineRepo.findById(sourceId);
    if (!source) {
      throw new NotFoundException(`Rutina ${sourceId} no encontrada`);
    }

    const isOwnedByMe = source.ownerUserId === ownerUserId;
    const isCloneable =
      source.ownerUserId === null ||
      source.visibility === RoutineVisibility.PUBLIC ||
      isOwnedByMe;
    if (!isCloneable) {
      throw new ForbiddenException('No tienes permiso para clonar esta rutina');
    }

    const clone = await this.routineRepo.create({
      name: source.name,
      description: source.description,
      intensity: source.intensity,
      estimatedDurationMinutes: source.estimatedDurationMinutes,
      estimatedCalories: source.estimatedCalories,
      goals: source.goals,
      warmUpNotes: source.warmUpNotes,
      coolDownNotes: source.coolDownNotes,
      ownerUserId,
      isTemplate: true,
      routineDate: null,
      clonedFromId: source.id,
      visibility: RoutineVisibility.PRIVATE,
    });

    for (const ex of source.routineExercises ?? []) {
      await this.exerciseRepo.create({
        dailyRoutineId: clone.id,
        exerciseId: ex.exerciseId,
        orderInRoutine: ex.orderInRoutine,
        exerciseType: ex.exerciseType,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        durationSeconds: ex.durationSeconds,
        distanceMeters: ex.distanceMeters,
        restSeconds: ex.restSeconds,
        notes: ex.notes,
        intensity: ex.intensity,
      });
    }

    return this.routineRepo.findById(clone.id) as Promise<DailyRoutineOrmEntity>;
  }

  async deleteMine(id: string, ownerUserId: string): Promise<void> {
    const routine = await this.routineRepo.findById(id);
    if (!routine || routine.ownerUserId !== ownerUserId) {
      throw new NotFoundException(`Rutina ${id} no encontrada`);
    }
    await this.routineRepo.delete(id);
  }
}
