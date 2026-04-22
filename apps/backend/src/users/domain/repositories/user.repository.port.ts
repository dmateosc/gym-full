import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../value-objects/user-role.vo';

/**
 * Puerto (interfaz) del repositorio de usuarios.
 * Define el contrato que deben cumplir las implementaciones de infraestructura.
 * El dominio depende de esta interfaz, no de la implementación.
 */
export abstract class UserRepositoryPort {
  abstract findAll(): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findBySupabaseId(supabaseId: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract upsert(data: {
    supabaseId: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<UserEntity>;
  abstract updateRole(id: string, role: UserRole): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
  abstract count(): Promise<number>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
