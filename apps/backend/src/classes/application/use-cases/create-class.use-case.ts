import { Inject, Injectable } from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import { ClassEntity } from '../../domain/entities/class.entity';
import { ClassCategory } from '../../domain/value-objects/class-category.vo';

export interface CreateClassCommand {
  instructorId: string;
  name: string;
  description?: string | null;
  category: ClassCategory | string;
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  capacity: number;
  location?: string | null;
}

@Injectable()
export class CreateClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly repo: ClassRepositoryPort,
  ) {}

  async execute(cmd: CreateClassCommand): Promise<ClassEntity> {
    // Domain entity validates inputs; repository persists.
    const probe = new ClassEntity({
      id: '00000000-0000-0000-0000-000000000000',
      instructorId: cmd.instructorId,
      name: cmd.name,
      description: cmd.description,
      category: cmd.category as ClassCategory,
      dayOfWeek: cmd.dayOfWeek,
      startTime: cmd.startTime,
      durationMin: cmd.durationMin,
      capacity: cmd.capacity,
      location: cmd.location,
    });
    return this.repo.create({
      instructorId: probe.instructorId,
      name: probe.name,
      description: probe.description,
      category: probe.category,
      dayOfWeek: probe.dayOfWeek,
      startTime: probe.startTime,
      durationMin: probe.durationMin,
      capacity: probe.capacity,
      location: probe.location,
    });
  }
}
