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
import { ClassesModule } from './classes/classes.module';
import { NotificationsModule } from './notifications/notifications.module';

// Entidades ORM
import { ExerciseOrmEntity } from './exercises/infrastructure/persistence/exercise.orm-entity';
import { DailyRoutineOrmEntity } from './routines/infrastructure/persistence/daily-routine.orm-entity';
import { RoutineExerciseOrmEntity } from './routines/infrastructure/persistence/routine-exercise.orm-entity';
import { UserProfileOrmEntity } from './users/infrastructure/persistence/user-profile.orm-entity';
import { ClassOrmEntity } from './classes/infrastructure/persistence/class.orm-entity';
import { ClassSessionOrmEntity } from './classes/infrastructure/persistence/class-session.orm-entity';
import { BookingOrmEntity } from './classes/infrastructure/persistence/booking.orm-entity';
import { NotificationOrmEntity } from './notifications/infrastructure/persistence/notification.orm-entity';
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
        ClassOrmEntity,
        ClassSessionOrmEntity,
        BookingOrmEntity,
        NotificationOrmEntity,
      ],
      synchronize: false,
      // Run any pending migrations at boot. The container will not
      // serve traffic until they finish, so the schema is always
      // ahead of the code that needs it.
      migrationsRun: true,
      migrations: [__dirname + '/database/migrations/*.{ts,js}'],
      migrationsTableName: 'migrations',
      ssl:
        process.env.DATABASE_SSL === 'false'
          ? false
          : { rejectUnauthorized: false },
      logging: ['error', 'warn', 'migration'],
      logger: new DatabaseLogger(),
      maxQueryExecutionTime: 1000,
      retryAttempts: 0,
      extra: {
        connectionTimeoutMillis: 5000,
      },
    }),
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    ExercisesModule,
    RoutinesModule,
    ClassesModule,
    NotificationsModule.register(),
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
