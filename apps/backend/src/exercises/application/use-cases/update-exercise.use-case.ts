import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../domain/repositories/exercise.repository.port';
import { UpdateExerciseDto } from '../../infrastructure/http/dto/update-exercise.dto';

@Injectable()
export class UpdateExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepo: ExerciseRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdateExerciseDto) {
    const existing = await this.exerciseRepo.findById(id);
    if (!existing)
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    return this.exerciseRepo.update(id, dto);
  }
}
