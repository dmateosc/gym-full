import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseOrmEntity } from '../../../exercises/infrastructure/persistence/exercise.orm-entity';
import { DailyRoutineOrmEntity } from './daily-routine.orm-entity';

export enum ExerciseType {
  SETS_REPS = 'sets_reps',
  TIME_BASED = 'time_based',
  DISTANCE = 'distance',
  REPS_ONLY = 'reps_only',
}

@Entity('routine_exercises')
export class RoutineExerciseOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DailyRoutineOrmEntity, 'routineExercises', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'daily_routine_id' })
  dailyRoutine: DailyRoutineOrmEntity;

  @Column({ name: 'daily_routine_id' })
  dailyRoutineId: string;

  @ManyToOne(() => ExerciseOrmEntity, { eager: true })
  @JoinColumn({ name: 'exercise_id' })
  exercise: ExerciseOrmEntity;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @Column({
    type: 'integer',
    name: 'order_in_routine',
    comment: 'Orden del ejercicio en la rutina (1, 2, 3...)',
  })
  orderInRoutine: number;

  @Column({
    type: 'enum',
    enum: ExerciseType,
    name: 'exercise_type',
    default: ExerciseType.SETS_REPS,
  })
  exerciseType: ExerciseType;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Número de series (para sets_reps)',
  })
  sets?: number;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Número de repeticiones por serie (para sets_reps o reps_only)',
  })
  reps?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Peso en kg (para ejercicios con peso)',
  })
  weight?: number;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'duration_seconds',
    comment: 'Duración en segundos (para time_based)',
  })
  durationSeconds?: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    name: 'distance_meters',
    comment: 'Distancia en metros (para distance)',
  })
  distanceMeters?: number;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'rest_seconds',
    default: 60,
    comment: 'Tiempo de descanso en segundos después del ejercicio',
  })
  restSeconds?: number;

  @Column({
    type: 'text',
    nullable: true,
    comment:
      'Notas específicas para este ejercicio (técnica, modificaciones, etc.)',
  })
  notes?: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Intensidad específica: light, moderate, intense',
  })
  intensity?: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt: Date;
}
