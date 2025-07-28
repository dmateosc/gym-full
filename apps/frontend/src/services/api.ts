import type { Exercise, ExerciseFilters } from '../types/exercise';

const API_BASE_URL = '/api';

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  static async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters?.muscleGroup) queryParams.append('muscleGroup', filters.muscleGroup);
    if (filters?.equipment) queryParams.append('equipment', filters.equipment);
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/exercises?${queryString}` : '/exercises';

    return this.request<Exercise[]>(endpoint);
  }

  static async getExercise(id: string): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}`);
  }

  static async createExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
    return this.request<Exercise>('/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
  }

  static async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteExercise(id: string): Promise<void> {
    await this.request(`/exercises/${id}`, {
      method: 'DELETE',
    });
  }

  static async getCategories(): Promise<string[]> {
    return this.request<string[]>('/exercises/categories');
  }

  static async getMuscleGroups(): Promise<string[]> {
    return this.request<string[]>('/exercises/muscle-groups');
  }

  static async getEquipment(): Promise<string[]> {
    return this.request<string[]>('/exercises/equipment');
  }
}
