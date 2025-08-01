import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { DailyRoutine } from './entities/daily-routine.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyRoutine, RoutineExercise, Exercise]),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
