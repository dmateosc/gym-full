import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ExerciseOrmEntity } from '../exercises/infrastructure/persistence/exercise.orm-entity';
import { DailyRoutineOrmEntity } from '../routines/infrastructure/persistence/daily-routine.orm-entity';
import { RoutineExerciseOrmEntity } from '../routines/infrastructure/persistence/routine-exercise.orm-entity';
import { UserProfileOrmEntity } from '../users/infrastructure/persistence/user-profile.orm-entity';
import { ClassOrmEntity } from '../classes/infrastructure/persistence/class.orm-entity';
import { ClassSessionOrmEntity } from '../classes/infrastructure/persistence/class-session.orm-entity';
import { BookingOrmEntity } from '../classes/infrastructure/persistence/booking.orm-entity';
import { WorkoutSessionOrmEntity } from '../workouts/infrastructure/persistence/workout-session.orm-entity';

/**
 * DataSource for the TypeORM CLI (migration:generate / :run / :revert).
 *
 * The Nest runtime gets its own DataSource through TypeOrmModule.forRoot in
 * AppModule — this file is *only* loaded by the typeorm CLI via the npm
 * scripts. Keep the entity list and connection options in sync with
 * AppModule.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === 'false'
      ? false
      : { rejectUnauthorized: false },
  entities: [
    ExerciseOrmEntity,
    DailyRoutineOrmEntity,
    RoutineExerciseOrmEntity,
    UserProfileOrmEntity,
    ClassOrmEntity,
    ClassSessionOrmEntity,
    BookingOrmEntity,
    WorkoutSessionOrmEntity,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
});
