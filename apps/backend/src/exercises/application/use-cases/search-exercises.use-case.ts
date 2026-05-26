import { Injectable, Inject } from '@nestjs/common';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../domain/repositories/exercise.repository.port';

@Injectable()
export class SearchExercisesUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepo: ExerciseRepositoryPort,
  ) {}

  async execute(term: string, category?: string) {
    return this.exerciseRepo.search(term, category);
  }
}
