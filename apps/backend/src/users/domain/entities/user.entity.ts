import { UserRole, UserRoleVO } from '../value-objects/user-role.vo';

export class UserEntity {
  private readonly _id: string;
  private _supabaseId: string | null;
  private _email: string;
  private _fullName: string | null;
  private _avatarUrl: string | null;
  private _passwordHash: string | null;
  private _role: UserRoleVO;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id: string;
    supabaseId?: string | null;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    passwordHash?: string | null;
    role?: UserRole | string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id;
    this._supabaseId = props.supabaseId ?? null;
    this._email = props.email;
    this._fullName = props.fullName ?? null;
    this._avatarUrl = props.avatarUrl ?? null;
    this._passwordHash = props.passwordHash ?? null;
    this._role = new UserRoleVO(props.role ?? UserRole.USER);
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string {
    return this._id;
  }
  get supabaseId(): string | null {
    return this._supabaseId;
  }
  get email(): string {
    return this._email;
  }
  get fullName(): string | null {
    return this._fullName;
  }
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  get passwordHash(): string | null {
    return this._passwordHash;
  }
  get role(): UserRoleVO {
    return this._role;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  isAdmin(): boolean {
    return this._role.isAdmin();
  }

  isInstructor(): boolean {
    return this._role.isInstructor();
  }

  promoteToAdmin(): void {
    this._role = UserRoleVO.admin();
    this._updatedAt = new Date();
  }

  promoteToInstructor(): void {
    this._role = UserRoleVO.instructor();
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
