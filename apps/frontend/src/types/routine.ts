// Tipos para rutinas de ejercicios
export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // Puede ser "12", "8-10", "30 seg", etc.
  rest?: string; // Tiempo de descanso opcional
}

export interface DayRoutine {
  day: string;
  exercises: RoutineExercise[];
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  duration: string; // "4 semanas", "8 semanas", etc.
  level: 'principiante' | 'intermedio' | 'avanzado';
  daysPerWeek: number;
  days: DayRoutine[];
}
