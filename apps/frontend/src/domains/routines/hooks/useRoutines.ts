import { useState, useEffect, useCallback } from 'react';
import type { DailyRoutine } from '../types/routine';
import { RoutineService } from '../services/routineService';

/**
 * Hook personalizado para el manejo de rutinas
 * Siguiendo principios DDD - Conectado con backend
 */
export const useRoutines = () => {
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<DailyRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayRoutine = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Intentar obtener la rutina de hoy
      const todayRoutine = await RoutineService.getTodayRoutine();
      
      if (todayRoutine) {
        setCurrentRoutine(todayRoutine);
      } else {
        // Si no hay rutina para hoy, mostrar la más reciente
        const allRoutines = await RoutineService.getAllRoutines();
        setRoutines(allRoutines);
        
        if (allRoutines.length > 0) {
          // Ordenar por fecha y tomar la más reciente
          const sortedRoutines = allRoutines.sort((a, b) => 
            new Date(b.routineDate).getTime() - new Date(a.routineDate).getTime()
          );
          setCurrentRoutine(sortedRoutines[0]);
        } else {
          setCurrentRoutine(null);
        }
      }
    } catch (err) {
      setError('Error loading routines: ' + (err as Error).message);
      setCurrentRoutine(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const getRoutineStats = useCallback((routine: DailyRoutine) => {
    return RoutineService.calculateRoutineStats(routine);
  }, []);

  useEffect(() => {
    loadTodayRoutine();
  }, [loadTodayRoutine]);

  return {
    // State
    routines,
    currentRoutine,
    isLoading,
    error,
    
    // Actions
    loadRoutineById,
    loadTodayRoutine,
    getRoutineStats,
    setCurrentRoutine,
  };
};
