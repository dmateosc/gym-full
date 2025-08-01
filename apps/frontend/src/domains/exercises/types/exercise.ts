export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: string[];
  difficulty: Difficulty;
  equipment: string[];
  instructions: string[];
  image?: string;
  estimatedDuration?: number;
  calories?: number;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export type ExerciseCategory = 
  | 'strength' 
  | 'cardio' 
  | 'flexibility' 
  | 'endurance' 
  | 'balance' 
  | 'functional';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseFilters {
  category?: ExerciseCategory;
  difficulty?: Difficulty;
  muscleGroup?: string;
  equipment?: string;
  search?: string;
}
