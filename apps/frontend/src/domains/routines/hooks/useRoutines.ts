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
        setRoutines([todayRoutine]); // Guardar también en la lista
      } else {
        // Si no hay rutina para hoy, mostrar la más reciente
        const allRoutines = await RoutineService.getAllRoutines();
        
        // Verificar que sea un array válido
        if (!Array.isArray(allRoutines)) {
          console.error('getAllRoutines no retornó un array:', allRoutines);
          setRoutines([]);
          setCurrentRoutine(null);
          return;
        }
        
        setRoutines(allRoutines);
        
        if (allRoutines.length > 0) {
          // Ordenar por fecha y tomar la más reciente
          const sortedRoutines = allRoutines.sort((a, b) => {
            const dateA = new Date(a.routineDate);
            const dateB = new Date(b.routineDate);
            return dateB.getTime() - dateA.getTime();
          });
          setCurrentRoutine(sortedRoutines[0]);
        } else {
          setCurrentRoutine(null);
        }
      }
    } catch (err) {
      console.error('Error en loadTodayRoutine:', err);
      
      // En lugar de mostrar error técnico, manejar diferentes casos
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('fetch')) {
          setError('No se puede conectar al servidor. Verifica tu conexión a internet.');
        } else {
          setError('No se pudieron cargar las rutinas en este momento.');
        }
      } else {
        setError('Ocurrió un error inesperado al cargar las rutinas.');
      }
      
      setCurrentRoutine(null);
      setRoutines([]);
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
        setError(`No se encontró la rutina con ID ${id}`);
        setCurrentRoutine(null);
      }
    } catch (err) {
      console.error('Error en loadRoutineById:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('fetch')) {
          setError('No se puede conectar al servidor. Verifica tu conexión a internet.');
        } else {
          setError('No se pudo cargar la rutina solicitada.');
        }
      } else {
        setError('Ocurrió un error inesperado al cargar la rutina.');
      }
      
      setCurrentRoutine(null);
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
