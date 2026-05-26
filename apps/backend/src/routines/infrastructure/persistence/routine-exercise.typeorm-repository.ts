import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineExerciseRepositoryPort } from '../../domain/repositories/routine-exercise.repository.port';
import { RoutineExerciseOrmEntity } from './routine-exercise.orm-entity';

@Injectable()
export class RoutineExerciseTypeormRepository
  implements RoutineExerciseRepositoryPort
{
  constructor(
    @InjectRepository(RoutineExerciseOrmEntity)
    private readonly repo: Repository<RoutineExerciseOrmEntity>,
  ) {}

  async create(
    data: Partial<RoutineExerciseOrmEntity>,
  ): Promise<RoutineExerciseOrmEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<RoutineExerciseOrmEntity>,
  ): Promise<RoutineExerciseOrmEntity> {
    const existing = await this.repo.findOne({
      where: { id },
      relations: ['exercise', 'dailyRoutine'],
    });
    Object.assign(existing!, data);
    return this.repo.save(existing!);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (entity) {
      await this.repo.remove(entity);
    }
  }

  async findById(id: string): Promise<RoutineExerciseOrmEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['exercise', 'dailyRoutine'],
    });
  }

  async findByRoutineAndOrder(
    routineId: string,
    order: number,
  ): Promise<RoutineExerciseOrmEntity | null> {
    return this.repo.findOne({
      where: { dailyRoutineId: routineId, orderInRoutine: order },
    });
  }

  async findByRoutineId(
    routineId: string,
  ): Promise<RoutineExerciseOrmEntity[]> {
    return this.repo.find({
      where: { dailyRoutineId: routineId },
      relations: ['exercise'],
      order: { orderInRoutine: 'ASC' },
    });
  }
}
