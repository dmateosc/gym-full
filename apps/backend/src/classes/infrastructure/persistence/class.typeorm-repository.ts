import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassOrmEntity } from './class.orm-entity';
import { ClassEntity } from '../../domain/entities/class.entity';
import {
  ClassRepositoryPort,
  CreateClassData,
} from '../../domain/repositories/class.repository.port';

@Injectable()
export class ClassTypeormRepository implements ClassRepositoryPort {
  constructor(
    @InjectRepository(ClassOrmEntity)
    private readonly repo: Repository<ClassOrmEntity>,
  ) {}

  async findById(id: string): Promise<ClassEntity | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(opts?: { activeOnly?: boolean }): Promise<ClassEntity[]> {
    const rows = await this.repo.find({
      where: opts?.activeOnly ? { active: true } : {},
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByInstructor(instructorId: string): Promise<ClassEntity[]> {
    const rows = await this.repo.find({
      where: { instructorId },
      order: { active: 'DESC', dayOfWeek: 'ASC', startTime: 'ASC' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findActiveByDayOfWeek(dayOfWeek: number): Promise<ClassEntity[]> {
    const rows = await this.repo.find({
      where: { active: true, dayOfWeek },
      order: { startTime: 'ASC' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async create(data: CreateClassData): Promise<ClassEntity> {
    const row = this.repo.create({
      instructorId: data.instructorId,
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      dayOfWeek: data.dayOfWeek,
      startTime:
        data.startTime.length === 5 ? `${data.startTime}:00` : data.startTime,
      durationMin: data.durationMin,
      capacity: data.capacity,
      location: data.location ?? null,
      active: true,
    });
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async save(entity: ClassEntity): Promise<ClassEntity> {
    const p = entity.toPlainObject();
    await this.repo.update(
      { id: entity.id },
      {
        // instructorId is mutable via reassignInstructor — keep it in sync.
        instructorId: p.instructorId,
        name: p.name,
        description: p.description,
        category: p.category,
        dayOfWeek: p.dayOfWeek,
        startTime: p.startTime.length === 5 ? `${p.startTime}:00` : p.startTime,
        durationMin: p.durationMin,
        capacity: p.capacity,
        location: p.location,
        active: p.active,
      },
    );
    const row = await this.repo.findOne({ where: { id: entity.id } });
    if (!row) throw new Error(`Clase ${entity.id} no encontrada tras guardar`);
    return this.toDomain(row);
  }

  private toDomain(row: ClassOrmEntity): ClassEntity {
    // Postgres TIME viene como 'HH:MM:SS'; normalizamos a 'HH:MM' para la capa de dominio.
    const startTime =
      row.startTime.length >= 5 ? row.startTime.slice(0, 5) : row.startTime;
    return new ClassEntity({
      id: row.id,
      instructorId: row.instructorId,
      name: row.name,
      description: row.description,
      category: row.category,
      dayOfWeek: row.dayOfWeek,
      startTime,
      durationMin: row.durationMin,
      capacity: row.capacity,
      location: row.location,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
