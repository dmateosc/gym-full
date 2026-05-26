import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ExerciseRepositoryPort,
} from '../../domain/repositories/exercise.repository.port';
import { ExerciseOrmEntity } from './exercise.orm-entity';
import { ExerciseFiltersDto } from '../http/dto/exercise-filters.dto';

/**
 * Implementación TypeORM del repositorio de ejercicios.
 * Esto es infraestructura — el dominio no sabe de TypeORM.
 */
@Injectable()
export class ExerciseTypeormRepository implements ExerciseRepositoryPort {
  constructor(
    @InjectRepository(ExerciseOrmEntity)
    private readonly repo: Repository<ExerciseOrmEntity>,
  ) {}

  async findAll(filters?: ExerciseFiltersDto): Promise<ExerciseOrmEntity[]> {
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

  async findById(id: string): Promise<ExerciseOrmEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(exercise: Partial<ExerciseOrmEntity>): Promise<ExerciseOrmEntity> {
    const entity = this.repo.create(exercise);
    return this.repo.save(entity);
  }

  async update(id: string, exercise: Partial<ExerciseOrmEntity>): Promise<ExerciseOrmEntity> {
    await this.repo.update({ id }, exercise);
    return this.repo.findOne({ where: { id } }) as Promise<ExerciseOrmEntity>;
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

  async search(term: string, category?: string): Promise<ExerciseOrmEntity[]> {
    const qb = this.repo
      .createQueryBuilder('exercise')
      .where(
        '(LOWER(exercise.name) LIKE LOWER(:term) OR ' +
          'LOWER(exercise.description) LIKE LOWER(:term) OR ' +
          "array_to_string(exercise.instructions, ' ') ILIKE :term)",
        { term: `%${term}%` },
      );

    if (category) {
      qb.andWhere('exercise.category = :category', { category });
    }

    return qb.getMany();
  }

  async getStatistics(): Promise<{
    totalExercises: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    totalEquipment: number;
    totalMuscleGroups: number;
  }> {
    const totalExercises = await this.repo.count();

    const categoryStats = await this.repo
      .createQueryBuilder('exercise')
      .select('exercise.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('exercise.category')
      .getRawMany<{ category: string; count: string }>();

    const byCategory = categoryStats.reduce(
      (acc, item) => {
        acc[item.category] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    const difficultyStats = await this.repo
      .createQueryBuilder('exercise')
      .select('exercise.difficulty', 'difficulty')
      .addSelect('COUNT(*)', 'count')
      .groupBy('exercise.difficulty')
      .getRawMany<{ difficulty: string; count: string }>();

    const byDifficulty = difficultyStats.reduce(
      (acc, item) => {
        acc[item.difficulty] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    const equipmentResult = await this.repo
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.equipment)', 'equipment')
      .distinct(true)
      .getRawMany();

    const totalEquipment = equipmentResult.length;

    const muscleGroupsResult = await this.repo
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.muscle_groups)', 'muscleGroup')
      .distinct(true)
      .getRawMany();

    const totalMuscleGroups = muscleGroupsResult.length;

    return {
      totalExercises,
      byCategory,
      byDifficulty,
      totalEquipment,
      totalMuscleGroups,
    };
  }
}
