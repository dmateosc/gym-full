import { Injectable, Inject } from '@nestjs/common';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../domain/repositories/exercise.repository.port';
import { ExerciseFiltersDto } from '../../infrastructure/http/dto/exercise-filters.dto';

@Injectable()
export class FindAllExercisesUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepo: ExerciseRepositoryPort,
  ) {}

  async execute(filters?: ExerciseFiltersDto) {
    return this.exerciseRepo.findAll(filters);
  }
}
