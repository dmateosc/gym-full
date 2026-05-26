import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  DAILY_ROUTINE_REPOSITORY,
  DailyRoutineRepositoryPort,
} from '../../domain/repositories/daily-routine.repository.port';
import {
  ROUTINE_EXERCISE_REPOSITORY,
  RoutineExerciseRepositoryPort,
} from '../../domain/repositories/routine-exercise.repository.port';
import { CreateRoutineExerciseDto } from '../../infrastructure/http/dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from '../../infrastructure/http/dto/update-routine-exercise.dto';
import { RoutineExerciseOrmEntity } from '../../infrastructure/persistence/routine-exercise.orm-entity';

@Injectable()
export class RoutineExerciseManagementUseCase {
  constructor(
    @Inject(DAILY_ROUTINE_REPOSITORY)
    private readonly routineRepo: DailyRoutineRepositoryPort,
    @Inject(ROUTINE_EXERCISE_REPOSITORY)
    private readonly exerciseRepo: RoutineExerciseRepositoryPort,
  ) {}

  async addExercise(dto: CreateRoutineExerciseDto) {
    const routine = await this.routineRepo.findById(dto.dailyRoutineId);
    if (!routine) {
      throw new NotFoundException(
        `Rutina con ID ${dto.dailyRoutineId} no encontrada`,
      );
    }

    const existing = await this.exerciseRepo.findByRoutineAndOrder(
      dto.dailyRoutineId,
      dto.orderInRoutine,
    );
    if (existing) {
      throw new BadRequestException(
        `Ya existe un ejercicio en la posición ${dto.orderInRoutine} de esta rutina`,
      );
    }

    return this.exerciseRepo.create(dto);
  }

  async updateExercise(id: string, dto: UpdateRoutineExerciseDto) {
    const routineExercise = await this.exerciseRepo.findById(id);
    if (!routineExercise) {
      throw new NotFoundException(
        `Ejercicio de rutina con ID ${id} no encontrado`,
      );
    }

    if (
      dto.orderInRoutine &&
      dto.orderInRoutine !== routineExercise.orderInRoutine
    ) {
      const conflict = await this.exerciseRepo.findByRoutineAndOrder(
        routineExercise.dailyRoutineId,
        dto.orderInRoutine,
      );
      if (conflict && conflict.id !== id) {
        throw new BadRequestException(
          `Ya existe un ejercicio en la posición ${dto.orderInRoutine} de esta rutina`,
        );
      }
    }

    return this.exerciseRepo.update(id, dto);
  }

  async removeExercise(id: string): Promise<void> {
    const routineExercise = await this.exerciseRepo.findById(id);
    if (!routineExercise) {
      throw new NotFoundException(
        `Ejercicio de rutina con ID ${id} no encontrado`,
      );
    }
    await this.exerciseRepo.delete(id);
  }

  async reorderExercises(
    routineId: string,
    exerciseOrders: { id: string; order: number }[],
  ) {
    const routine = await this.routineRepo.findById(routineId);
    if (!routine) {
      throw new NotFoundException(`Rutina con ID ${routineId} no encontrada`);
    }

    const updated: RoutineExerciseOrmEntity[] = [];
    for (const { id, order } of exerciseOrders) {
      const re = await this.exerciseRepo.findById(id);
      if (re && re.dailyRoutineId === routineId) {
        const result = await this.exerciseRepo.update(id, {
          orderInRoutine: order,
        });
        updated.push(result);
      }
    }

    return updated;
  }
}
