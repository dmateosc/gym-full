import { Injectable, Inject } from '@nestjs/common';
import {
  EXERCISE_REPOSITORY,
  ExerciseRepositoryPort,
} from '../../domain/repositories/exercise.repository.port';
import { CreateExerciseDto } from '../../infrastructure/http/dto/create-exercise.dto';

@Injectable()
export class CreateExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepo: ExerciseRepositoryPort,
  ) {}

  async execute(dto: CreateExerciseDto) {
    return this.exerciseRepo.create(dto);
  }
}
