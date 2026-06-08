import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BookingStatus } from '../../domain/value-objects/booking-status.vo';

@Entity('bookings')
@Index(['sessionId', 'status'])
@Index(['userId', 'status'])
export class BookingOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  status: BookingStatus;

  /** Solo poblado mientras status='waitlist'; 1 = primer candidato a promoción. */
  @Column({ type: 'smallint', nullable: true })
  position: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
