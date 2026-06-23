export type WorkoutStatus = 'in_progress' | 'completed' | 'abandoned';

export interface WorkoutSetLog {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completedAt: string | null;
  notes: string | null;
}

export interface WorkoutExerciseLog {
  routineExerciseId: string;
  sets: WorkoutSetLog[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  dailyRoutineId: string;
  startedAt: string;
  completedAt: string | null;
  status: WorkoutStatus;
  logs: WorkoutExerciseLog[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
