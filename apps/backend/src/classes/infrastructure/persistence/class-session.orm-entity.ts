import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { ClassSessionStatus } from '../../domain/value-objects/class-session-status.vo';

@Entity('class_sessions')
@Unique(['classId', 'scheduledAt'])
@Index(['scheduledAt'])
export class ClassSessionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @Column({ name: 'scheduled_at', type: 'timestamp with time zone' })
  scheduledAt: Date;

  @Column({ name: 'capacity_override', type: 'smallint', nullable: true })
  capacityOverride: number | null;

  @Column({ type: 'varchar', length: 20, default: 'scheduled' })
  status: ClassSessionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
