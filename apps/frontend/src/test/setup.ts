import '@testing-library/jest-dom';
import '../jest-dom.d.ts';

// Mock supabase so AuthContext doesn't fail when env vars are absent in tests
jest.mock('../domains/auth/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}));

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
jest.mock('../domains/exercises/services/api', () => ({
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
