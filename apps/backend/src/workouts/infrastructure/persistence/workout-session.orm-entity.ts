import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WorkoutSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export interface WorkoutSetLog {
  setNumber: number;
  weight?: number | null;
  reps?: number | null;
  completedAt?: string | null;
  notes?: string | null;
}

export interface WorkoutExerciseLog {
  routineExerciseId: string;
  sets: WorkoutSetLog[];
}

@Entity('workout_sessions')
export class WorkoutSessionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'daily_routine_id', type: 'uuid' })
  dailyRoutineId: string;

  @Column({
    name: 'started_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  startedAt: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt: Date | null;

  @Column({
    type: 'varchar',
    length: 16,
    default: WorkoutSessionStatus.IN_PROGRESS,
  })
  status: WorkoutSessionStatus;

  @Column({ type: 'jsonb', default: () => `'[]'::jsonb` })
  logs: WorkoutExerciseLog[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
