import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutSessionRepositoryPort } from '../../domain/repositories/workout-session.repository.port';
import { WorkoutSessionOrmEntity } from './workout-session.orm-entity';

@Injectable()
export class WorkoutSessionTypeormRepository
  implements WorkoutSessionRepositoryPort
{
  constructor(
    @InjectRepository(WorkoutSessionOrmEntity)
    private readonly repo: Repository<WorkoutSessionOrmEntity>,
  ) {}

  async create(
    data: Partial<WorkoutSessionOrmEntity>,
  ): Promise<WorkoutSessionOrmEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async findById(id: string): Promise<WorkoutSessionOrmEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUser(userId: string): Promise<WorkoutSessionOrmEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });
  }

  async update(
    id: string,
    data: Partial<WorkoutSessionOrmEntity>,
  ): Promise<WorkoutSessionOrmEntity> {
    const existing = await this.repo.findOne({ where: { id } });
    Object.assign(existing!, data);
    return this.repo.save(existing!);
  }
}
