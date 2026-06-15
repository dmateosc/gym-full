import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { RoutineExerciseOrmEntity } from './routine-exercise.orm-entity';

export enum RoutineIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum RoutineStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum RoutineVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

@Entity('daily_routines')
export class DailyRoutineOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'date',
    name: 'routine_date',
    nullable: true,
    comment:
      'Fecha programada (solo para rutinas del sistema). NULL en templates de usuario.',
  })
  routineDate: Date | null;

  @Column({
    type: 'uuid',
    name: 'owner_user_id',
    nullable: true,
    comment: 'Dueño de la rutina. NULL = rutina del sistema (IA diaria).',
  })
  ownerUserId: string | null;

  @Column({
    type: 'boolean',
    name: 'is_template',
    default: false,
    comment:
      'true cuando la rutina es reutilizable y no está atada a una fecha.',
  })
  isTemplate: boolean;

  @Column({
    type: 'uuid',
    name: 'cloned_from_id',
    nullable: true,
    comment: 'Rutina origen si esta nació clonando otra (snapshot).',
  })
  clonedFromId: string | null;

  @Column({
    type: 'varchar',
    length: 16,
    default: RoutineVisibility.PRIVATE,
    comment: "Visibilidad: 'private' (solo el dueño) | 'public' (compartida).",
  })
  visibility: RoutineVisibility;

  @Column({
    type: 'enum',
    enum: RoutineIntensity,
    default: RoutineIntensity.MODERATE,
  })
  intensity: RoutineIntensity;

  @Column({
    type: 'enum',
    enum: RoutineStatus,
    default: RoutineStatus.PLANNED,
  })
  status: RoutineStatus;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'estimated_duration_minutes',
    comment: 'Duración estimada total de la rutina en minutos',
  })
  estimatedDurationMinutes?: number;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'estimated_calories',
    comment: 'Calorías estimadas a quemar en toda la rutina',
  })
  estimatedCalories?: number;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
    comment: 'Objetivos de la rutina: strength, cardio, flexibility, etc.',
  })
  goals?: string[];

  @Column({
    type: 'text',
    nullable: true,
    name: 'warm_up_notes',
    comment: 'Notas sobre calentamiento',
  })
  warmUpNotes?: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'cool_down_notes',
    comment: 'Notas sobre enfriamiento',
  })
  coolDownNotes?: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'started_at',
    comment: 'Momento en que se inició la rutina',
  })
  startedAt?: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'completed_at',
    comment: 'Momento en que se completó la rutina',
  })
  completedAt?: Date;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'actual_duration_minutes',
    comment: 'Duración real que tomó completar la rutina',
  })
  actualDurationMinutes?: number;

  @Column({
    type: 'text',
    nullable: true,
    name: 'completion_notes',
    comment: 'Notas sobre la ejecución de la rutina',
  })
  completionNotes?: string;

  @OneToMany('RoutineExerciseOrmEntity', 'dailyRoutine', {
    cascade: true,
    eager: true,
  })
  routineExercises: RoutineExerciseOrmEntity[];

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
