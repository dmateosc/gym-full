import type { Exercise, ExerciseFilters } from '../types/exercise';

// Mock data para tests
const mockExercises: Exercise[] = [
  {
    id: 'test-exercise-1',
    name: 'Test Push-ups',
    description: 'Test exercise for unit tests',
    category: 'strength',
    difficulty: 'beginner',
    muscleGroups: ['Pecho'],
    equipment: ['Peso corporal'],
    instructions: ['Test instruction 1', 'Test instruction 2'],
    estimatedDuration: 10,
    calories: 20,
  },
  {
    id: 'test-exercise-2',
    name: 'Test Squats',
    description: 'Test exercise for unit tests',
    category: 'strength',
    difficulty: 'intermediate',
    muscleGroups: ['Piernas'],
    equipment: ['Peso corporal'],
    instructions: ['Test instruction 1', 'Test instruction 2'],
    estimatedDuration: 15,
    calories: 30,
  },
  {
    id: 'test-exercise-3',
    name: 'Test Running',
    description: 'Test cardio exercise for unit tests',
    category: 'cardio',
    difficulty: 'beginner',
    muscleGroups: ['Piernas', 'Cardiovascular'],
    equipment: ['Peso corporal'],
    instructions: ['Run at moderate pace', 'Maintain breathing rhythm'],
    estimatedDuration: 30,
    calories: 100,
  },
];

// Mock del ApiService
export class ApiService {
  static async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let filteredExercises = [...mockExercises];
    
    if (filters?.category) {
      filteredExercises = filteredExercises.filter(ex => ex.category === filters.category);
    }
    
    if (filters?.difficulty) {
      filteredExercises = filteredExercises.filter(ex => ex.difficulty === filters.difficulty);
    }
    
    if (filters?.search) {
      filteredExercises = filteredExercises.filter(ex => 
        ex.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        ex.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    if (filters?.muscleGroup) {
      filteredExercises = filteredExercises.filter(ex => 
        ex.muscleGroups.includes(filters.muscleGroup!)
      );
    }
    
    if (filters?.equipment) {
      filteredExercises = filteredExercises.filter(ex => 
        ex.equipment.includes(filters.equipment!)
      );
    }
    
    return filteredExercises;
  }

  static async getExercise(id: string): Promise<Exercise> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const exercise = mockExercises.find(ex => ex.id === id);
    if (!exercise) {
      throw new Error(`Exercise with id ${id} not found`);
    }
    
    return exercise;
  }

  static async createExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newExercise: Exercise = {
      ...exercise,
      id: `test-exercise-${Date.now()}`,
    };
    
    mockExercises.push(newExercise);
    return newExercise;
  }

  static async updateExercise(id: string, updates: Partial<Omit<Exercise, 'id'>>): Promise<Exercise> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const exerciseIndex = mockExercises.findIndex(ex => ex.id === id);
    if (exerciseIndex === -1) {
      throw new Error(`Exercise with id ${id} not found`);
    }
    
    const updatedExercise = {
      ...mockExercises[exerciseIndex],
      ...updates,
    };
    
    mockExercises[exerciseIndex] = updatedExercise;
    return updatedExercise;
  }

  static async deleteExercise(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const exerciseIndex = mockExercises.findIndex(ex => ex.id === id);
    if (exerciseIndex === -1) {
      throw new Error(`Exercise with id ${id} not found`);
    }
    
    mockExercises.splice(exerciseIndex, 1);
  }

  static async getCategories(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return ['strength', 'cardio', 'flexibility', 'endurance', 'balance', 'functional'];
  }

  static async getMuscleGroups(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return ['Pecho', 'Piernas', 'Espalda', 'Brazos', 'Hombros', 'Core', 'Cardiovascular'];
  }

  static async getEquipment(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return ['Peso corporal', 'Mancuernas', 'Barra', 'Bandas elásticas', 'Kettlebell', 'TRX'];
  }
}
