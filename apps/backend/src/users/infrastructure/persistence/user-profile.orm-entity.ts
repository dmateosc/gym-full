import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '../../domain/value-objects/user-role.vo';

/**
 * Entidad TypeORM para la tabla user_profiles.
 * Gestiona usuarios con autenticación JWT propia.
 */
@Entity('user_profiles')
export class UserProfileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'supabase_id', type: 'uuid', nullable: true })
  supabaseId: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
