import { UserRole, UserRoleVO } from '../value-objects/user-role.vo';

/**
 * Entidad de dominio: User
 * Representa un usuario del sistema. Es una entidad pura del dominio,
 * sin dependencias de frameworks (TypeORM, NestJS, etc.)
 */
export class UserEntity {
  private readonly _id: string;
  private readonly _supabaseId: string;
  private _email: string;
  private _fullName: string | null;
  private _avatarUrl: string | null;
  private _role: UserRoleVO;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    supabaseId: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role?: UserRole | string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._supabaseId = props.supabaseId;
    this._email = props.email;
    this._fullName = props.fullName ?? null;
    this._avatarUrl = props.avatarUrl ?? null;
    this._role = new UserRoleVO(props.role ?? UserRole.USER);
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  // Getters
  get id(): string { return this._id; }
  get supabaseId(): string { return this._supabaseId; }
  get email(): string { return this._email; }
  get fullName(): string | null { return this._fullName; }
  get avatarUrl(): string | null { return this._avatarUrl; }
  get role(): UserRoleVO { return this._role; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de dominio
  isAdmin(): boolean {
    return this._role.isAdmin();
  }

  promoteToAdmin(): void {
    this._role = UserRoleVO.admin();
    this._updatedAt = new Date();
  }

  demoteToUser(): void {
    this._role = UserRoleVO.user();
    this._updatedAt = new Date();
  }

  updateProfile(props: { fullName?: string; avatarUrl?: string }): void {
    if (props.fullName !== undefined) this._fullName = props.fullName;
    if (props.avatarUrl !== undefined) this._avatarUrl = props.avatarUrl;
    this._updatedAt = new Date();
  }

  toPlainObject() {
    return {
      id: this._id,
      supabaseId: this._supabaseId,
      email: this._email,
      fullName: this._fullName,
      avatarUrl: this._avatarUrl,
      role: this._role.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
