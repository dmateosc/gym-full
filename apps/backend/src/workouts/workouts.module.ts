import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSessionOrmEntity } from './infrastructure/persistence/workout-session.orm-entity';
import { WorkoutSessionTypeormRepository } from './infrastructure/persistence/workout-session.typeorm-repository';
import { WORKOUT_SESSION_REPOSITORY } from './domain/repositories/workout-session.repository.port';
import { WorkoutsUseCase } from './application/use-cases/workouts.use-case';
import { WorkoutsController } from './infrastructure/http/workouts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutSessionOrmEntity])],
  controllers: [WorkoutsController],
  providers: [
    {
      provide: WORKOUT_SESSION_REPOSITORY,
      useClass: WorkoutSessionTypeormRepository,
    },
    WorkoutsUseCase,
  ],
})
export class WorkoutsModule {}
