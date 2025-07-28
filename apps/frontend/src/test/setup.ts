import '@testing-library/jest-dom';
import '../jest-dom.d.ts';

// Mock data para las pruebas
const mockExercises = [
  {
    id: 'test-exercise-1',
    name: 'Test Push-ups',
    description: 'Test exercise for unit tests',
    category: 'strength' as const,
    difficulty: 'beginner' as const,
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
    category: 'strength' as const,
    difficulty: 'intermediate' as const,
    muscleGroups: ['Piernas'],
    equipment: ['Peso corporal'],
    instructions: ['Test instruction 1', 'Test instruction 2'],
    estimatedDuration: 15,
    calories: 30,
  },
];

// Mock del servicio API
jest.mock('../services/api', () => ({
  ApiService: {
    getExercises: jest.fn().mockResolvedValue(mockExercises),
    getExercise: jest.fn().mockResolvedValue(mockExercises[0]),
    getCategories: jest.fn().mockResolvedValue(['strength', 'cardio', 'flexibility']),
    getMuscleGroups: jest.fn().mockResolvedValue(['Pecho', 'Piernas', 'Espalda', 'Brazos']),
    getEquipment: jest.fn().mockResolvedValue(['Peso corporal', 'Mancuernas', 'Barra']),
    createExercise: jest.fn().mockImplementation((exercise) => 
      Promise.resolve({ ...exercise, id: `test-${Date.now()}` })
    ),
    updateExercise: jest.fn().mockImplementation((id, updates) => 
      Promise.resolve({ ...mockExercises[0], ...updates, id })
    ),
    deleteExercise: jest.fn().mockResolvedValue(undefined),
  },
}));
