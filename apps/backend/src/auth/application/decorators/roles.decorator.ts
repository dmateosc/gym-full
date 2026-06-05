import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../users/domain/value-objects/user-role.vo';

export { UserRole };

export const ROLES_KEY = 'roles';

/**
 * Decorador para proteger endpoints por rol.
 * Uso: @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
