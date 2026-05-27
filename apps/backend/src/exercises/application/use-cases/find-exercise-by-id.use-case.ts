import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../domain/repositories/exercise.repository.port';

@Injectable()
export class FindExerciseByIdUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepo: ExerciseRepositoryPort,
  ) {}

  async execute(id: string) {
    const exercise = await this.exerciseRepo.findById(id);
    if (!exercise)
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    return exercise;
  }
}
