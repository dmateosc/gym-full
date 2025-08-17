import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// 🎣 Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// 💡 Hook personalizado para ejercicios con cache
export const useExercisesWithCache = () => {
  const {
    exercises,
    exercisesLoaded,
    exerciseFilters,
    isLoadingExercises,
    exercisesError,
    loadExercises,
    updateExerciseFilters,
    getExerciseFromCache,
  } = useAppContext();

  return {
    exercises,
    isLoaded: exercisesLoaded,
    filters: exerciseFilters,
    isLoading: isLoadingExercises,
    error: exercisesError,
    loadExercises,
    updateFilters: updateExerciseFilters,
    getExercise: getExerciseFromCache,
    refreshExercises: () => loadExercises(exerciseFilters, true),
  };
};

// 💪 Hook personalizado para rutinas con cache
export const useRoutinesWithCache = () => {
  const {
    currentRoutine,
    routinesLoaded,
    isLoadingRoutines,
    routinesError,
    loadTodayRoutine,
    loadRoutineById,
    loadRoutineByDate,
    getRoutineFromCache,
  } = useAppContext();

  return {
    currentRoutine,
    isLoaded: routinesLoaded,
    isLoading: isLoadingRoutines,
    error: routinesError,
    loadTodayRoutine,
    loadRoutineById,
    loadRoutineByDate,
    getRoutineFromCache,
    refreshTodayRoutine: () => loadTodayRoutine(true),
  };
};

// 🏷️ Hook personalizado para opciones de filtros con cache
export const useFilterOptionsWithCache = () => {
  const {
    categories,
    muscleGroups,
    equipment,
    filterOptionsLoaded,
    loadFilterOptions,
  } = useAppContext();

  return {
    categories,
    muscleGroups,
    equipment,
    isLoaded: filterOptionsLoaded,
    loadFilterOptions,
    refreshFilterOptions: () => loadFilterOptions(true),
  };
};
