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
import { CreateDailyRoutineDto } from '../../infrastructure/http/dto/create-daily-routine.dto';
import { UpdateDailyRoutineDto } from '../../infrastructure/http/dto/update-daily-routine.dto';
import { DailyRoutineOrmEntity } from '../../infrastructure/persistence/daily-routine.orm-entity';

@Injectable()
export class DailyRoutineCrudUseCase {
  constructor(
    @Inject(DAILY_ROUTINE_REPOSITORY)
    private readonly routineRepo: DailyRoutineRepositoryPort,
  ) {}

  async create(dto: CreateDailyRoutineDto) {
    const existing = await this.routineRepo.findByDate(dto.routineDate);
    if (existing) {
      throw new BadRequestException(
        `Ya existe una rutina para la fecha ${dto.routineDate}. Edita la existente o elige otra fecha.`,
      );
    }
    return this.routineRepo.create({
      ...dto,
      routineDate: new Date(dto.routineDate),
    });
  }

  async findAll() {
    return this.routineRepo.findAll();
  }

  async findById(id: string) {
    const routine = await this.routineRepo.findById(id);
    if (!routine)
      throw new NotFoundException(`Rutina con ID ${id} no encontrada`);
    return routine;
  }

  async update(id: string, dto: UpdateDailyRoutineDto) {
    const routine = await this.findById(id);

    if (
      dto.routineDate &&
      dto.routineDate !== routine.routineDate.toISOString().split('T')[0]
    ) {
      const conflict = await this.routineRepo.findByDate(dto.routineDate);
      if (conflict && conflict.id !== id) {
        throw new BadRequestException(
          `Ya existe una rutina para la fecha ${dto.routineDate}`,
        );
      }
    }

    const updateData: Partial<DailyRoutineOrmEntity> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.routineDate !== undefined && { routineDate: new Date(dto.routineDate) }),
      ...(dto.intensity !== undefined && { intensity: dto.intensity }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.estimatedDurationMinutes !== undefined && { estimatedDurationMinutes: dto.estimatedDurationMinutes }),
      ...(dto.estimatedCalories !== undefined && { estimatedCalories: dto.estimatedCalories }),
      ...(dto.goals !== undefined && { goals: dto.goals }),
      ...(dto.warmUpNotes !== undefined && { warmUpNotes: dto.warmUpNotes }),
      ...(dto.coolDownNotes !== undefined && { coolDownNotes: dto.coolDownNotes }),
      ...(dto.completionNotes !== undefined && { completionNotes: dto.completionNotes }),
    };

    return this.routineRepo.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.routineRepo.delete(id);
  }
}
