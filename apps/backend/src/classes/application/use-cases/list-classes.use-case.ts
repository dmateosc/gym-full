import { Inject, Injectable } from '@nestjs/common';
import {
  CLASS_REPOSITORY,
  ClassRepositoryPort,
} from '../../domain/repositories/class.repository.port';
import { ClassEntity } from '../../domain/entities/class.entity';

@Injectable()
export class ListMyClassesUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly repo: ClassRepositoryPort,
  ) {}

  execute(instructorId: string): Promise<ClassEntity[]> {
    return this.repo.findByInstructor(instructorId);
  }
}

@Injectable()
export class ListAllClassesUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly repo: ClassRepositoryPort,
  ) {}

  execute(opts?: { activeOnly?: boolean }): Promise<ClassEntity[]> {
    return this.repo.findAll(opts);
  }
}
