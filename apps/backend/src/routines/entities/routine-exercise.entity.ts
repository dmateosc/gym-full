import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exercise } from '../../exercises/entities/exercise.entity';

export enum ExerciseType {
  SETS_REPS = 'sets_reps', // Ej: 3 series de 12 repeticiones
  TIME_BASED = 'time_based', // Ej: 30 segundos de plancha
  DISTANCE = 'distance', // Ej: 5km corriendo
  REPS_ONLY = 'reps_only', // Ej: 50 flexiones
}

@Entity('routine_exercises')
export class RoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con la rutina diaria
  @ManyToOne('DailyRoutine', 'routineExercises', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_routine_id' })
  dailyRoutine: any;

  @Column({ name: 'daily_routine_id' })
  dailyRoutineId: string;

  // Relación con el ejercicio
  @ManyToOne(() => Exercise, { eager: true })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  // Orden del ejercicio en la rutina
  @Column({
    type: 'integer',
    name: 'order_in_routine',
    comment: 'Orden del ejercicio en la rutina (1, 2, 3...)',
  })
  orderInRoutine: number;

  // Tipo de ejercicio
  @Column({
    type: 'enum',
    enum: ExerciseType,
    name: 'exercise_type',
    default: ExerciseType.SETS_REPS,
  })
  exerciseType: ExerciseType;

  // Configuración para ejercicios de series y repeticiones
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

  // Configuración para ejercicios basados en tiempo
  @Column({
    type: 'integer',
    nullable: true,
    name: 'duration_seconds',
    comment: 'Duración en segundos (para time_based)',
  })
  durationSeconds?: number;

  // Configuración para ejercicios de distancia
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    name: 'distance_meters',
    comment: 'Distancia en metros (para distance)',
  })
  distanceMeters?: number;

  // Tiempo de descanso después del ejercicio
  @Column({
    type: 'integer',
    nullable: true,
    name: 'rest_seconds',
    default: 60,
    comment: 'Tiempo de descanso en segundos después del ejercicio',
  })
  restSeconds?: number;

  // Notas específicas para este ejercicio en la rutina
  @Column({
    type: 'text',
    nullable: true,
    comment:
      'Notas específicas para este ejercicio (técnica, modificaciones, etc.)',
  })
  notes?: string;

  // Intensidad específica para este ejercicio
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
