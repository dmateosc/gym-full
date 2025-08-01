import { useState, useEffect, useCallback } from 'react';
import type { Exercise, ExerciseFilters } from '../types/exercise';
import { ApiService } from '../services/api';

/**
 * Hook personalizado para el manejo de exercises
 * Siguiendo principios DDD
 */
export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseFilters>({});

  const loadExercises = useCallback(async (newFilters?: ExerciseFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const filtersToUse = newFilters || filters;
      const data = await ApiService.getExercises(filtersToUse);
      setExercises(data);
    } catch (err) {
      setError('Error loading exercises: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: ExerciseFilters) => {
    setFilters(newFilters);
    loadExercises(newFilters);
  }, [loadExercises]);

  const refreshExercises = useCallback(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  return {
    // State
    exercises,
    isLoading,
    error,
    filters,
    
    // Actions
    updateFilters,
    refreshExercises,
  };
};
