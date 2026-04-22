import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos de dominio
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/infrastructure/users.module';

// Entidades ORM
import { Exercise } from './exercises/entities/exercise.entity';
import { DailyRoutine } from './routines/entities/daily-routine.entity';
import { RoutineExercise } from './routines/entities/routine-exercise.entity';
import { UserProfileOrmEntity } from './users/infrastructure/persistence/user-profile.orm-entity';
import { DatabaseLogger } from './database/database.logger';

// Guards globales
import { JwtAuthGuard } from './auth/application/guards/jwt-auth.guard';
import { RolesGuard } from './auth/application/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        Exercise,
        DailyRoutine,
        RoutineExercise,
        UserProfileOrmEntity,
      ],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false, // Para Supabase
      },
      logging: ['error', 'warn'],
      logger: new DatabaseLogger(),
      maxQueryExecutionTime: 1000,
    }),
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    ExercisesModule,
    RoutinesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global de autenticación — se aplica a todos los endpoints por defecto
    // Los endpoints pueden marcarse como @Public() para omitirlo
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
