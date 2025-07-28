import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseFiltersDto } from './dto/exercise-filters.dto';
import { Exercise } from './entities/exercise.entity';
import { exercisesData } from './data/exercises.data';
import { randomUUID } from 'crypto';

@Injectable()
export class ExercisesService {
  private exercises: Exercise[] = [...exercisesData];

  findAll(filters?: ExerciseFiltersDto): Exercise[] {
    let filteredExercises = this.exercises;

    if (filters) {
      if (filters.category) {
        filteredExercises = filteredExercises.filter(
          (exercise) => exercise.category === filters.category,
        );
      }

      if (filters.difficulty) {
        filteredExercises = filteredExercises.filter(
          (exercise) => exercise.difficulty === filters.difficulty,
        );
      }

      if (filters.muscleGroup) {
        filteredExercises = filteredExercises.filter((exercise) =>
          exercise.muscleGroups.some((group) =>
            group.toLowerCase().includes(filters.muscleGroup!.toLowerCase()),
          ),
        );
      }

      if (filters.equipment) {
        filteredExercises = filteredExercises.filter((exercise) =>
          exercise.equipment.some((eq) =>
            eq.toLowerCase().includes(filters.equipment!.toLowerCase()),
          ),
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredExercises = filteredExercises.filter(
          (exercise) =>
            exercise.name.toLowerCase().includes(searchTerm) ||
            exercise.description.toLowerCase().includes(searchTerm) ||
            exercise.muscleGroups.some((group) =>
              group.toLowerCase().includes(searchTerm),
            ),
        );
      }
    }

    return filteredExercises;
  }

  findOne(id: string): Exercise {
    const exercise = this.exercises.find((exercise) => exercise.id === id);
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercise;
  }

  create(createExerciseDto: CreateExerciseDto): Exercise {
    const newExercise: Exercise = {
      id: randomUUID(),
      ...createExerciseDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.exercises.push(newExercise);
    return newExercise;
  }

  update(id: string, updateExerciseDto: UpdateExerciseDto): Exercise {
    const exerciseIndex = this.exercises.findIndex(
      (exercise) => exercise.id === id,
    );

    if (exerciseIndex === -1) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    const updatedExercise: Exercise = {
      ...this.exercises[exerciseIndex],
      ...updateExerciseDto,
      updatedAt: new Date(),
    };

    this.exercises[exerciseIndex] = updatedExercise;
    return updatedExercise;
  }

  remove(id: string): void {
    const exerciseIndex = this.exercises.findIndex(
      (exercise) => exercise.id === id,
    );

    if (exerciseIndex === -1) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    this.exercises.splice(exerciseIndex, 1);
  }

  // Métodos específicos para obtener metadatos
  getCategories(): string[] {
    return [...new Set(this.exercises.map((exercise) => exercise.category))];
  }

  getMuscleGroups(): string[] {
    const allMuscleGroups = this.exercises.flatMap(
      (exercise) => exercise.muscleGroups,
    );
    return [...new Set(allMuscleGroups)];
  }

  getEquipment(): string[] {
    const allEquipment = this.exercises.flatMap(
      (exercise) => exercise.equipment,
    );
    return [...new Set(allEquipment)];
  }
}
