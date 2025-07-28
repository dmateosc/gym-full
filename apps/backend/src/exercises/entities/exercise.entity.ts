import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  ENDURANCE = 'endurance',
  BALANCE = 'balance',
  FUNCTIONAL = 'functional',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ExerciseCategory,
  })
  category: ExerciseCategory;

  @Column({
    type: 'enum',
    enum: Difficulty,
  })
  difficulty: Difficulty;

  @Column({
    type: 'text',
    array: true,
    name: 'muscle_groups',
  })
  muscleGroups: string[];

  @Column({
    type: 'text',
    array: true,
  })
  equipment: string[];

  @Column({
    type: 'text',
    array: true,
  })
  instructions: string[];

  @Column({
    type: 'integer',
    nullable: true,
    name: 'estimated_duration',
  })
  estimatedDuration?: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  calories?: number;

  @Column({
    type: 'text',
    nullable: true,
    name: 'image_url',
  })
  imageUrl?: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'video_url',
  })
  videoUrl?: string;

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
