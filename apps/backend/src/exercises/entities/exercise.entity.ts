export class Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  difficulty: Difficulty;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  estimatedDuration?: number;
  calories?: number;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  ENDURANCE = 'endurance',
  BALANCE = 'balance',
  FUNCTIONAL = 'functional',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}
