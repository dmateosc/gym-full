import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseOrmEntity } from './infrastructure/persistence/exercise.orm-entity';
import { ExerciseTypeormRepository } from './infrastructure/persistence/exercise.typeorm-repository';
import { ExercisesController } from './infrastructure/http/exercises.controller';
import { EXERCISE_REPOSITORY } from './domain/repositories/exercise.repository.port';
import { FindAllExercisesUseCase } from './application/use-cases/find-all-exercises.use-case';
import { FindExerciseByIdUseCase } from './application/use-cases/find-exercise-by-id.use-case';
import { CreateExerciseUseCase } from './application/use-cases/create-exercise.use-case';
import { UpdateExerciseUseCase } from './application/use-cases/update-exercise.use-case';
import { DeleteExerciseUseCase } from './application/use-cases/delete-exercise.use-case';
import { GetExerciseMetadataUseCase } from './application/use-cases/get-exercise-metadata.use-case';
import { SearchExercisesUseCase } from './application/use-cases/search-exercises.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseOrmEntity])],
  controllers: [ExercisesController],
  providers: [
    { provide: EXERCISE_REPOSITORY, useClass: ExerciseTypeormRepository },
    FindAllExercisesUseCase,
    FindExerciseByIdUseCase,
    CreateExerciseUseCase,
    UpdateExerciseUseCase,
    DeleteExerciseUseCase,
    GetExerciseMetadataUseCase,
    SearchExercisesUseCase,
  ],
  exports: [{ provide: EXERCISE_REPOSITORY, useClass: ExerciseTypeormRepository }],
})
export class ExercisesModule {}
