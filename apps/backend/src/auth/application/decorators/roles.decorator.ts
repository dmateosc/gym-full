import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export const ROLES_KEY = 'roles';

/**
 * Decorador para proteger endpoints por rol.
 * Uso: @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
