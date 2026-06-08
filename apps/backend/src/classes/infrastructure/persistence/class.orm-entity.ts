import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ClassCategory } from '../../domain/value-objects/class-category.vo';

@Entity('classes')
@Index(['instructorId', 'active'])
@Index(['active', 'dayOfWeek'])
export class ClassOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 30 })
  category: ClassCategory;

  // 0=Sunday … 6=Saturday (matches Postgres EXTRACT(DOW))
  @Column({ name: 'day_of_week', type: 'smallint' })
  dayOfWeek: number;

  // 'HH:MM:SS' string from Postgres TIME
  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'duration_min', type: 'smallint' })
  durationMin: number;

  @Column({ type: 'smallint' })
  capacity: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  location: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
