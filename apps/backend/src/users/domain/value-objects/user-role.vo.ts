/**
 * Value Object: UserRole
 * Representa los roles posibles de un usuario en el sistema.
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class UserRoleVO {
  private readonly _value: UserRole;

  constructor(value: UserRole | string) {
    if (!Object.values(UserRole).includes(value as UserRole)) {
      throw new Error(`Rol inválido: ${value}. Roles válidos: ${Object.values(UserRole).join(', ')}`);
    }
    this._value = value as UserRole;
  }

  get value(): UserRole {
    return this._value;
  }

  isAdmin(): boolean {
    return this._value === UserRole.ADMIN;
  }

  isUser(): boolean {
    return this._value === UserRole.USER;
  }

  toString(): string {
    return this._value;
  }

  equals(other: UserRoleVO): boolean {
    return this._value === other._value;
  }

  static create(value: string): UserRoleVO {
    return new UserRoleVO(value);
  }

  static admin(): UserRoleVO {
    return new UserRoleVO(UserRole.ADMIN);
  }

  static user(): UserRoleVO {
    return new UserRoleVO(UserRole.USER);
  }
}
