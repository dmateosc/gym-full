import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFiltersDto } from './dto/exercise-filters.dto';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  constructor(
    @InjectRepository(Exercise)
    private exercisesRepository: Repository<Exercise>,
  ) {}

  async findAll(filters?: ExerciseFiltersDto): Promise<Exercise[]> {
    const startTime = Date.now();
    this.logger.log(
      `🔍 Finding exercises with filters: ${JSON.stringify(filters || {})}`,
    );

    const queryBuilder = this.exercisesRepository.createQueryBuilder('exercise');

    if (filters?.category) {
      queryBuilder.andWhere('exercise.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('exercise.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.muscleGroup) {
      queryBuilder.andWhere(':muscleGroup = ANY(exercise.muscle_groups)', {
        muscleGroup: filters.muscleGroup,
      });
    }

    if (filters?.equipment) {
      queryBuilder.andWhere(':equipment = ANY(exercise.equipment)', {
        equipment: filters.equipment,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(LOWER(exercise.name) LIKE LOWER(:search) OR LOWER(exercise.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    const exercises = await queryBuilder.getMany();
    const endTime = Date.now();
    const duration = endTime - startTime;

    this.logger.log(`✅ Found ${exercises.length} exercises in ${duration}ms`);

    return exercises;
  }

  async findOne(id: string): Promise<Exercise> {
    const startTime = Date.now();
    this.logger.log(`🔍 Finding exercise with ID: ${id}`);

    const exercise = await this.exercisesRepository.findOne({ where: { id } });
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!exercise) {
      this.logger.warn(`❌ Exercise with ID ${id} not found (${duration}ms)`);
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    this.logger.log(`✅ Found exercise "${exercise.name}" in ${duration}ms`);
    return exercise;
  }

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const startTime = Date.now();
    this.logger.log(
      `🆕 Creating new exercise: ${createExerciseDto.name}`,
    );

    const exercise = this.exercisesRepository.create(createExerciseDto);
    const savedExercise = await this.exercisesRepository.save(exercise);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.logger.log(
      `✅ Created exercise "${savedExercise.name}" with ID ${savedExercise.id} in ${duration}ms`,
    );

    return savedExercise;
  }

  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    const startTime = Date.now();
    this.logger.log(`🔄 Updating exercise with ID: ${id}`);

    await this.exercisesRepository.update(id, updateExerciseDto);
    const exercise = await this.findOne(id);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.logger.log(
      `✅ Updated exercise "${exercise.name}" in ${duration}ms`,
    );

    return exercise;
  }

  async remove(id: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`🗑️ Removing exercise with ID: ${id}`);

    const result = await this.exercisesRepository.delete(id);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (result.affected === 0) {
      this.logger.warn(`❌ Exercise with ID ${id} not found for deletion (${duration}ms)`);
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    this.logger.log(`✅ Removed exercise with ID ${id} in ${duration}ms`);
  }

  // Métodos específicos para obtener metadatos
  async getCategories(): Promise<string[]> {
    const startTime = Date.now();
    this.logger.log('🏷️ Getting exercise categories');

    const result = await this.exercisesRepository
      .createQueryBuilder('exercise')
      .select('DISTINCT exercise.category', 'category')
      .getRawMany<{ category: string }>();

    const categories = result.map((item) => item.category);
    const endTime = Date.now();
    const duration = endTime - startTime;

    this.logger.log(`✅ Found ${categories.length} categories in ${duration}ms: ${categories.join(', ')}`);

    return categories;
  }

  async getMuscleGroups(): Promise<string[]> {
    const startTime = Date.now();
    this.logger.log('💪 Getting muscle groups');

    const result = await this.exercisesRepository
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.muscle_groups)', 'muscleGroup')
      .distinct(true)
      .getRawMany<{ muscleGroup: string }>();

    const muscleGroups = result.map((item) => item.muscleGroup);
    const endTime = Date.now();
    const duration = endTime - startTime;

    this.logger.log(`✅ Found ${muscleGroups.length} muscle groups in ${duration}ms`);

    return muscleGroups;
  }

  async getEquipment(): Promise<string[]> {
    const startTime = Date.now();
    this.logger.log('🏋️ Getting equipment types');

    const result = await this.exercisesRepository
      .createQueryBuilder('exercise')
      .select('UNNEST(exercise.equipment)', 'equipment')
      .distinct(true)
      .getRawMany<{ equipment: string }>();

    const equipment = result.map((item) => item.equipment);
    const endTime = Date.now();
    const duration = endTime - startTime;

    this.logger.log(`✅ Found ${equipment.length} equipment types in ${duration}ms`);

    return equipment;
  }
}
