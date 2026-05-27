import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';

// Módulos de dominio
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/infrastructure/users.module';

// Entidades ORM
import { ExerciseOrmEntity } from './exercises/infrastructure/persistence/exercise.orm-entity';
import { DailyRoutineOrmEntity } from './routines/infrastructure/persistence/daily-routine.orm-entity';
import { RoutineExerciseOrmEntity } from './routines/infrastructure/persistence/routine-exercise.orm-entity';
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
        ExerciseOrmEntity,
        DailyRoutineOrmEntity,
        RoutineExerciseOrmEntity,
        UserProfileOrmEntity,
      ],
      synchronize: false,
      ssl:
        process.env.DATABASE_SSL === 'false'
          ? false
          : { rejectUnauthorized: false },
      logging: ['error', 'warn'],
      logger: new DatabaseLogger(),
      maxQueryExecutionTime: 1000,
      // Fail fast — Vercel's timeout is 10s
      retryAttempts: 0,
      // Pass connection timeout directly to the pg driver
      extra: {
        connectionTimeoutMillis: 5000,
      },
    }),
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    ExercisesModule,
    RoutinesModule,
  ],
  controllers: [AppController],
  providers: [
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
