// Tipos para rutinas de ejercicios - Alineados con el backend

// Enums del backend
export enum RoutineIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum RoutineStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum ExerciseType {
  SETS_REPS = 'sets_reps',
  TIME_BASED = 'time_based',
  DISTANCE = 'distance',
  REPS_ONLY = 'reps_only',
}

// Tipos de ejercicio según el backend
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  primaryMuscleGroups: string[];
  secondaryMuscleGroups?: string[];
  equipment?: string[];
  instructions?: string[];
  difficulty: string;
  imageUrl?: string;
}

export interface RoutineExercise {
  id: string;
  dailyRoutineId: string;
  exercise: Exercise;
  exerciseId: string;
  orderInRoutine: number;
  exerciseType: ExerciseType;
  sets?: number;
  reps?: number;
  weight?: string; // Decimal como string
  duration?: number; // En segundos
  distance?: number; // En metros
  restSeconds?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyRoutine {
  id: string;
  name: string;
  description?: string;
  routineDate: string; // Fecha en formato ISO
  intensity: RoutineIntensity;
  status: RoutineStatus;
  estimatedDurationMinutes?: number;
  estimatedCalories?: number;
  warmupNotes?: string;
  cooldownNotes?: string;
  routineExercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

// Tipos adicionales para la UI
export interface RoutineStats {
  totalExercises: number;
  estimatedDuration: number;
  estimatedCalories: number;
  muscleGroups: string[];
}

// Mantener compatibilidad con el código existente
export type WorkoutRoutine = DailyRoutine;
