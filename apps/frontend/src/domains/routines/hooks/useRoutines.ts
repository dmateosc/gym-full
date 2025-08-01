import { useState, useEffect, useCallback } from 'react';
import type { WorkoutRoutine } from '../types/routine';
import { RoutineService } from '../services/routineService';

/**
 * Hook personalizado para el manejo de rutinas
 * Siguiendo principios DDD
 */
export const useRoutines = () => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<WorkoutRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoutines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await RoutineService.getAllRoutines();
      setRoutines(data);
      
      // Si no hay rutina actual, establecer la primera
      if (!currentRoutine && data.length > 0) {
        setCurrentRoutine(data[0]);
      }
    } catch (err) {
      setError('Error loading routines: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [currentRoutine]);

  const loadRoutineById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const routine = await RoutineService.getRoutineById(id);
      if (routine) {
        setCurrentRoutine(routine);
      } else {
        setError(`Routine with ID ${id} not found`);
      }
    } catch (err) {
      setError('Error loading routine: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRoutineStats = useCallback((routine: WorkoutRoutine) => {
    return RoutineService.calculateRoutineStats(routine);
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  return {
    // State
    routines,
    currentRoutine,
    isLoading,
    error,
    
    // Actions
    loadRoutineById,
    getRoutineStats,
    setCurrentRoutine,
  };
};
