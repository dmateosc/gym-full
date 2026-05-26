import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../value-objects/user-role.vo';

export abstract class UserRepositoryPort {
  abstract findAll(): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findBySupabaseId(supabaseId: string): Promise<UserEntity | null>;
  abstract upsert(data: {
    supabaseId: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<UserEntity>;
  abstract create(data: {
    email: string;
    passwordHash: string;
    fullName?: string;
  }): Promise<UserEntity>;
  abstract updateRole(id: string, role: UserRole): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
  abstract count(): Promise<number>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
