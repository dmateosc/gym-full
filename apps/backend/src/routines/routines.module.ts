import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyRoutineOrmEntity } from './infrastructure/persistence/daily-routine.orm-entity';
import { RoutineExerciseOrmEntity } from './infrastructure/persistence/routine-exercise.orm-entity';
import { DailyRoutineTypeormRepository } from './infrastructure/persistence/daily-routine.typeorm-repository';
import { RoutineExerciseTypeormRepository } from './infrastructure/persistence/routine-exercise.typeorm-repository';
import { RoutinesController } from './infrastructure/http/routines.controller';
import { DAILY_ROUTINE_REPOSITORY } from './domain/repositories/daily-routine.repository.port';
import { ROUTINE_EXERCISE_REPOSITORY } from './domain/repositories/routine-exercise.repository.port';
import { DailyRoutineCrudUseCase } from './application/use-cases/daily-routine-crud.use-case';
import { DailyRoutineQueriesUseCase } from './application/use-cases/daily-routine-queries.use-case';
import { DailyRoutineLifecycleUseCase } from './application/use-cases/daily-routine-lifecycle.use-case';
import { RoutineExerciseManagementUseCase } from './application/use-cases/routine-exercise-management.use-case';
import { RoutineStatsUseCase } from './application/use-cases/routine-stats.use-case';
import { GenerateRoutineUseCase } from './application/use-cases/generate-routine.use-case';
import { OllamaService } from '../shared/infrastructure/ollama/ollama.service';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyRoutineOrmEntity, RoutineExerciseOrmEntity]),
    ExercisesModule,
  ],
  controllers: [RoutinesController],
  providers: [
    { provide: DAILY_ROUTINE_REPOSITORY, useClass: DailyRoutineTypeormRepository },
    { provide: ROUTINE_EXERCISE_REPOSITORY, useClass: RoutineExerciseTypeormRepository },
    DailyRoutineCrudUseCase,
    DailyRoutineQueriesUseCase,
    DailyRoutineLifecycleUseCase,
    RoutineExerciseManagementUseCase,
    RoutineStatsUseCase,
    GenerateRoutineUseCase,
    OllamaService,
  ],
})
export class RoutinesModule {}
