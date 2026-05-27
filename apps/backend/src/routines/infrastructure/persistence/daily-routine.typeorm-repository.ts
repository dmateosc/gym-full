import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyRoutineRepositoryPort } from '../../domain/repositories/daily-routine.repository.port';
import {
  DailyRoutineOrmEntity,
  RoutineStatus,
} from './daily-routine.orm-entity';

@Injectable()
export class DailyRoutineTypeormRepository
  implements DailyRoutineRepositoryPort
{
  constructor(
    @InjectRepository(DailyRoutineOrmEntity)
    private readonly repo: Repository<DailyRoutineOrmEntity>,
  ) {}

  async findAll(): Promise<DailyRoutineOrmEntity[]> {
    return this.repo.find({
      relations: ['routineExercises', 'routineExercises.exercise'],
      order: { routineDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<DailyRoutineOrmEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['routineExercises', 'routineExercises.exercise'],
    });
  }

  async findByDate(date: string): Promise<DailyRoutineOrmEntity | null> {
    return this.repo.findOne({
      where: { routineDate: new Date(date) },
      relations: ['routineExercises', 'routineExercises.exercise'],
    });
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<DailyRoutineOrmEntity[]> {
    return this.repo.find({
      where: {
        routineDate: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['routineExercises', 'routineExercises.exercise'],
      order: { routineDate: 'ASC' },
    });
  }

  async findToday(): Promise<DailyRoutineOrmEntity | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.repo.findOne({
      where: { routineDate: today },
      relations: ['routineExercises', 'routineExercises.exercise'],
    });
  }

  async findUpcoming(days = 7): Promise<DailyRoutineOrmEntity[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    return this.repo.find({
      where: {
        routineDate: Between(today, futureDate),
        status: RoutineStatus.PLANNED,
      },
      relations: ['routineExercises', 'routineExercises.exercise'],
      order: { routineDate: 'ASC' },
    });
  }

  async create(
    data: Partial<DailyRoutineOrmEntity>,
  ): Promise<DailyRoutineOrmEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<DailyRoutineOrmEntity>,
  ): Promise<DailyRoutineOrmEntity> {
    const existing = await this.repo.findOne({ where: { id } });
    Object.assign(existing!, data);
    return this.repo.save(existing!);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (entity) {
      await this.repo.remove(entity);
    }
  }
}
