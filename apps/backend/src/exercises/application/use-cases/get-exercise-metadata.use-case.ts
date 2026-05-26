import { Injectable, Inject } from '@nestjs/common';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../domain/repositories/exercise.repository.port';

@Injectable()
export class GetExerciseMetadataUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepo: ExerciseRepositoryPort,
  ) {}

  async getCategories(): Promise<string[]> {
    return this.exerciseRepo.getDistinctCategories();
  }

  async getMuscleGroups(): Promise<string[]> {
    return this.exerciseRepo.getDistinctMuscleGroups();
  }

  async getEquipment(): Promise<string[]> {
    return this.exerciseRepo.getDistinctEquipment();
  }

  async getStatistics() {
    return this.exerciseRepo.getStatistics();
  }
}
