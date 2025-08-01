import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyRoutine, RoutineStatus } from './entities/daily-routine.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { CreateDailyRoutineDto } from './dto/create-daily-routine.dto';
import { UpdateDailyRoutineDto } from './dto/update-daily-routine.dto';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';


@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(DailyRoutine)
    private readonly dailyRoutineRepository: Repository<DailyRoutine>,
    @InjectRepository(RoutineExercise)
    private readonly routineExerciseRepository: Repository<RoutineExercise>,
  ) {}

  // CRUD para DailyRoutine
  async createDailyRoutine(
    createDto: CreateDailyRoutineDto,
  ): Promise<DailyRoutine> {
    // Verificar si ya existe una rutina para esa fecha
    const existingRoutine = await this.dailyRoutineRepository.findOne({
      where: { routineDate: new Date(createDto.routineDate) },
    });

    if (existingRoutine) {
      throw new BadRequestException(
        `Ya existe una rutina para la fecha ${createDto.routineDate}. Edita la existente o elige otra fecha.`,
      );
    }

    const routine = this.dailyRoutineRepository.create({
      ...createDto,
      routineDate: new Date(createDto.routineDate),
    });
    return await this.dailyRoutineRepository.save(routine);
  }

  async findAllDailyRoutines(): Promise<DailyRoutine[]> {
    return await this.dailyRoutineRepository.find({
      relations: ['routineExercises', 'routineExercises.exercise'],
      order: { routineDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDailyRoutinesByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<DailyRoutine[]> {
    return await this.dailyRoutineRepository.find({
      where: {
        routineDate: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['routineExercises', 'routineExercises.exercise'],
      order: { routineDate: 'ASC' },
    });
  }

  async findDailyRoutineByDate(date: string): Promise<DailyRoutine | null> {
    return await this.dailyRoutineRepository.findOne({
      where: { routineDate: new Date(date) },
      relations: ['routineExercises', 'routineExercises.exercise'],
    });
  }

  async findUpcomingRoutines(days: number = 7): Promise<DailyRoutine[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.dailyRoutineRepository.find({
      where: {
        routineDate: Between(today, futureDate),
        status: RoutineStatus.PLANNED,
      },
      relations: ['routineExercises', 'routineExercises.exercise'],
      order: { routineDate: 'ASC' },
    });
  }

  async findTodayRoutine(): Promise<DailyRoutine | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.dailyRoutineRepository.findOne({
      where: { routineDate: today },
      relations: ['routineExercises', 'routineExercises.exercise'],
    });
  }

  async findDailyRoutineById(id: string): Promise<DailyRoutine> {
    const routine = await this.dailyRoutineRepository.findOne({
      where: { id },
      relations: ['routineExercises', 'routineExercises.exercise'],
    });

    if (!routine) {
      throw new NotFoundException(`Rutina con ID ${id} no encontrada`);
    }

    return routine;
  }

  async updateDailyRoutine(
    id: string,
    updateDto: UpdateDailyRoutineDto,
  ): Promise<DailyRoutine> {
    const routine = await this.findDailyRoutineById(id);

    // Si se está cambiando la fecha, verificar que no haya conflicto
    if (
      updateDto.routineDate &&
      updateDto.routineDate !== routine.routineDate.toISOString().split('T')[0]
    ) {
      const existingRoutine = await this.dailyRoutineRepository.findOne({
        where: { routineDate: new Date(updateDto.routineDate) },
      });

      if (existingRoutine && existingRoutine.id !== id) {
        throw new BadRequestException(
          `Ya existe una rutina para la fecha ${updateDto.routineDate}`,
        );
      }
    }

    Object.assign(routine, updateDto);
    if (updateDto.routineDate) {
      routine.routineDate = new Date(updateDto.routineDate);
    }

    return await this.dailyRoutineRepository.save(routine);
  }

  async deleteDailyRoutine(id: string): Promise<void> {
    const routine = await this.findDailyRoutineById(id);
    await this.dailyRoutineRepository.remove(routine);
  }

  async startRoutine(id: string): Promise<DailyRoutine> {
    const routine = await this.findDailyRoutineById(id);
    routine.status = RoutineStatus.IN_PROGRESS;
    routine.startedAt = new Date();
    return await this.dailyRoutineRepository.save(routine);
  }

  async completeRoutine(
    id: string,
    completionNotes?: string,
  ): Promise<DailyRoutine> {
    const routine = await this.findDailyRoutineById(id);
    routine.status = RoutineStatus.COMPLETED;
    routine.completedAt = new Date();

    if (routine.startedAt) {
      const durationMs =
        routine.completedAt.getTime() - routine.startedAt.getTime();
      routine.actualDurationMinutes = Math.round(durationMs / (1000 * 60));
    }

    if (completionNotes) {
      routine.completionNotes = completionNotes;
    }

    return await this.dailyRoutineRepository.save(routine);
  }

  async skipRoutine(id: string, reason?: string): Promise<DailyRoutine> {
    const routine = await this.findDailyRoutineById(id);
    routine.status = RoutineStatus.SKIPPED;

    if (reason) {
      routine.completionNotes = `Saltada: ${reason}`;
    }

    return await this.dailyRoutineRepository.save(routine);
  }

  // CRUD para RoutineExercise
  async addExerciseToRoutine(
    createDto: CreateRoutineExerciseDto,
  ): Promise<RoutineExercise> {
    // Verificar que la rutina existe
    await this.findDailyRoutineById(createDto.dailyRoutineId);

    // Verificar que no hay otro ejercicio con el mismo orden
    const existingExercise = await this.routineExerciseRepository.findOne({
      where: {
        dailyRoutineId: createDto.dailyRoutineId,
        orderInRoutine: createDto.orderInRoutine,
      },
    });

    if (existingExercise) {
      throw new BadRequestException(
        `Ya existe un ejercicio en la posición ${createDto.orderInRoutine} de esta rutina`,
      );
    }

    const routineExercise = this.routineExerciseRepository.create(createDto);
    return await this.routineExerciseRepository.save(routineExercise);
  }

  async updateRoutineExercise(
    id: string,
    updateDto: UpdateRoutineExerciseDto,
  ): Promise<RoutineExercise> {
    const routineExercise = await this.routineExerciseRepository.findOne({
      where: { id },
      relations: ['exercise', 'dailyRoutine'],
    });

    if (!routineExercise) {
      throw new NotFoundException(
        `Ejercicio de rutina con ID ${id} no encontrado`,
      );
    }

    // Si se está cambiando el orden, verificar que no hay conflicto
    if (
      updateDto.orderInRoutine &&
      updateDto.orderInRoutine !== routineExercise.orderInRoutine
    ) {
      const existingExercise = await this.routineExerciseRepository.findOne({
        where: {
          dailyRoutineId: routineExercise.dailyRoutineId,
          orderInRoutine: updateDto.orderInRoutine,
        },
      });

      if (existingExercise && existingExercise.id !== id) {
        throw new BadRequestException(
          `Ya existe un ejercicio en la posición ${updateDto.orderInRoutine} de esta rutina`,
        );
      }
    }

    Object.assign(routineExercise, updateDto);
    return await this.routineExerciseRepository.save(routineExercise);
  }

  async removeExerciseFromRoutine(id: string): Promise<void> {
    const routineExercise = await this.routineExerciseRepository.findOne({
      where: { id },
    });

    if (!routineExercise) {
      throw new NotFoundException(
        `Ejercicio de rutina con ID ${id} no encontrado`,
      );
    }

    await this.routineExerciseRepository.remove(routineExercise);
  }

  async reorderRoutineExercises(
    routineId: string,
    exerciseOrders: { id: string; order: number }[],
  ): Promise<RoutineExercise[]> {
    // Verificar que la rutina existe
    await this.findDailyRoutineById(routineId);

    const updatedExercises: RoutineExercise[] = [];

    for (const { id, order } of exerciseOrders) {
      const routineExercise = await this.routineExerciseRepository.findOne({
        where: { id, dailyRoutineId: routineId },
        relations: ['exercise'],
      });

      if (routineExercise) {
        routineExercise.orderInRoutine = order;
        const updated =
          await this.routineExerciseRepository.save(routineExercise);
        updatedExercises.push(updated);
      }
    }

    return updatedExercises;
  }

  // Métodos utilitarios
  async getWeekRoutines(startDate: string): Promise<DailyRoutine[]> {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // 7 días

    return await this.findDailyRoutinesByDateRange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    );
  }

  async getMonthRoutines(year: number, month: number): Promise<DailyRoutine[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0); // Último día del mes

    return await this.findDailyRoutinesByDateRange(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    );
  }

  async getRoutineStats(id: string) {
    const routine = await this.findDailyRoutineById(id);

    const totalExercises = routine.routineExercises.length;
    const categories = [
      ...new Set(
        routine.routineExercises
          .filter((re: any) => re.exercise)
          .map((re: any) => re.exercise.category)
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
            .filter((re: any) => re.exercise && re.exercise.muscleGroups)
            .flatMap((re: any) => re.exercise.muscleGroups)
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
    const routines = await this.findDailyRoutinesByDateRange(
      startDate,
      endDate,
    );

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
