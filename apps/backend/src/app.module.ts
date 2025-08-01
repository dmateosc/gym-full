import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { Exercise } from './exercises/entities/exercise.entity';
import { DailyRoutine } from './routines/entities/daily-routine.entity';
import { RoutineExercise } from './routines/entities/routine-exercise.entity';
import { DatabaseLogger } from './database/database.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Exercise, DailyRoutine, RoutineExercise],
      synchronize: false, // En producción debe ser false, las migraciones ya existen
      ssl: {
        rejectUnauthorized: false, // Para Supabase
      },
      // Configuración de logging mejorada
      logging: ['query', 'error', 'schema', 'warn', 'info', 'log'],
      logger: new DatabaseLogger(),
      maxQueryExecutionTime: 1000, // Log queries que tomen más de 1 segundo
    }),
    ExercisesModule,
    RoutinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
