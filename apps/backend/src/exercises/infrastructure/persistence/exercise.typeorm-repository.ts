import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseRepositoryPort } from '../../domain/repositories/exercise.repository.port';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseFiltersDto } from '../../dto/exercise-filters.dto';

/**
 * Implementación TypeORM del repositorio de ejercicios.
 * Esto es infraestructura — el dominio no sabe de TypeORM.
 */
@Injectable()
export class ExerciseTypeormRepository implements ExerciseRepositoryPort {
  constructor(
    @InjectRepository(Exercise)
    private readonly repo: Repository<Exercise>,
  ) {}

  async findAll(filters?: ExerciseFiltersDto): Promise<Exercise[]> {
    const qb = this.repo.createQueryBuilder('exercise');

    if (filters?.category) {
      qb.andWhere('exercise.category = :category', { category: filters.category });
    }
    if (filters?.difficulty) {
      qb.andWhere('exercise.difficulty = :difficulty', { difficulty: filters.difficulty });
    }
    if (filters?.muscleGroup) {
      qb.andWhere(':muscleGroup = ANY(exercise.muscle_groups)', { muscleGroup: filters.muscleGroup });
    }
    if (filters?.equipment) {
      qb.andWhere(':equipment = ANY(exercise.equipment)', { equipment: filters.equipment });
    }
    if (filters?.search) {
      qb.andWhere(
        '(LOWER(exercise.name) LIKE LOWER(:search) OR LOWER(exercise.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    qb.orderBy('exercise.name', 'ASC');
    return qb.getMany();
  }

  async findById(id: string): Promise<Exercise | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(exercise: Partial<Exercise>): Promise<Exercise> {
    const entity = this.repo.create(exercise);
    return this.repo.save(entity);
  }

  async update(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    await this.repo.update({ id }, exercise);
    return this.repo.findOne({ where: { id } }) as Promise<Exercise>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async getDistinctCategories(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('exercise')
      .select('DISTINCT exercise.category', 'category')
      .orderBy('exercise.category', 'ASC')
      .getRawMany<{ category: string }>();
    return rows.map((r) => r.category);
  }

  async getDistinctMuscleGroups(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.muscle_groups)', 'mg')
      .distinct(true)
      .orderBy('mg', 'ASC')
      .getRawMany<{ mg: string }>();
    return rows.map((r) => r.mg);
  }

  async getDistinctEquipment(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.equipment)', 'eq')
      .distinct(true)
      .orderBy('eq', 'ASC')
      .getRawMany<{ eq: string }>();
    return rows.map((r) => r.eq);
  }
}
