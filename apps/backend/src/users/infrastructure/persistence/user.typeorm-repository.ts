import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileOrmEntity } from './user-profile.orm-entity';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/value-objects/user-role.vo';

/**
 * Implementación TypeORM del repositorio de usuarios.
 * Transforma entre ORM entities y domain entities.
 */
@Injectable()
export class UserTypeormRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserProfileOrmEntity)
    private readonly repo: Repository<UserProfileOrmEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    const ormEntities = await this.repo.find({
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomain);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const ormEntity = await this.repo.findOne({ where: { id } });
    return ormEntity ? this.toDomain(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const ormEntity = await this.repo.findOne({ where: { email } });
    return ormEntity ? this.toDomain(ormEntity) : null;
  }

  async upsert(data: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<UserEntity> {
    let ormEntity = await this.repo.findOne({ where: { email: data.email } });

    if (ormEntity) {
      if (data.fullName !== undefined) ormEntity.fullName = data.fullName;
      if (data.avatarUrl !== undefined) ormEntity.avatarUrl = data.avatarUrl;
    } else {
      ormEntity = this.repo.create({
        email: data.email,
        fullName: data.fullName ?? null,
        avatarUrl: data.avatarUrl ?? null,
        role: UserRole.USER,
      });
    }

    const saved = await this.repo.save(ormEntity);
    return this.toDomain(saved);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName?: string;
  }): Promise<UserEntity> {
    const ormEntity = this.repo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName ?? null,
      avatarUrl: null,
      role: UserRole.USER,
    });
    const saved = await this.repo.save(ormEntity);
    return this.toDomain(saved);
  }

  async updateRole(id: string, role: UserRole): Promise<UserEntity> {
    await this.repo.update({ id }, { role });
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new Error(`Usuario ${id} no encontrado tras actualizar`);
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(orm: UserProfileOrmEntity): UserEntity {
    return new UserEntity({
      id: orm.id,
      email: orm.email,
      fullName: orm.fullName,
      avatarUrl: orm.avatarUrl,
      passwordHash: orm.passwordHash,
      role: orm.role,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }
}
