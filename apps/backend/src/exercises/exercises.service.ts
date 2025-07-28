import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFiltersDto } from './dto/exercise-filters.dto';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exercisesRepository: Repository<Exercise>,
  ) {}

  async findAll(filters?: ExerciseFiltersDto): Promise<Exercise[]> {
    const queryBuilder = this.exercisesRepository.createQueryBuilder('exercise');

    if (filters?.category) {
      queryBuilder.andWhere('exercise.category = :category', { category: filters.category });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('exercise.difficulty = :difficulty', { difficulty: filters.difficulty });
    }

    if (filters?.muscleGroup) {
      queryBuilder.andWhere(':muscleGroup = ANY(exercise.muscle_groups)', { 
        muscleGroup: filters.muscleGroup 
      });
    }

    if (filters?.equipment) {
      queryBuilder.andWhere(':equipment = ANY(exercise.equipment)', { 
        equipment: filters.equipment 
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(LOWER(exercise.name) LIKE LOWER(:search) OR LOWER(exercise.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Exercise> {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercise;
  }

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.exercisesRepository.create(createExerciseDto);
    return this.exercisesRepository.save(exercise);
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
    await this.exercisesRepository.update(id, updateExerciseDto);
    const exercise = await this.findOne(id);
    return exercise;
  }

  async remove(id: string): Promise<void> {
    const result = await this.exercisesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
  }

  // Métodos específicos para obtener metadatos
  async getCategories(): Promise<string[]> {
    const result = await this.exercisesRepository
      .createQueryBuilder('exercise')
      .select('DISTINCT exercise.category', 'category')
      .getRawMany();
    
    return result.map(item => item.category);
  }

  async getMuscleGroups(): Promise<string[]> {
    const result = await this.exercisesRepository
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.muscle_groups)', 'muscleGroup')
      .distinct(true)
      .getRawMany();
    
    return result.map(item => item.muscleGroup);
  }

  async getEquipment(): Promise<string[]> {
    const result = await this.exercisesRepository
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.equipment)', 'equipment')
      .distinct(true)
      .getRawMany();
    
    return result.map(item => item.equipment);
  }
}
