import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import type { Exercise, ExerciseFilters } from '../../exercises/types/exercise';
import type { DailyRoutine } from '../../routines/types/routine';
import { ApiService } from '../../exercises/services/api';
import { RoutineService } from '../../routines/services/routineService';

// 🚀 Estado global de la aplicación
interface AppState {
  // Global app state
  isInitialized: boolean;
  initializationProgress: number;
  
  // Exercises data
  exercises: Exercise[];
  exercisesLoaded: boolean;
  exerciseFilters: ExerciseFilters;
  exerciseCache: Map<string, Exercise>;
  
  // Filter options data
  categories: string[];
  muscleGroups: string[];
  equipment: string[];
  filterOptionsLoaded: boolean;
  
  // Routines data
  currentRoutine: DailyRoutine | null;
  routineCache: Map<string, DailyRoutine>;
  routinesLoaded: boolean;
  
  // Loading states
  isLoadingExercises: boolean;
  isLoadingRoutines: boolean;
  
  // Error states
  exercisesError: string | null;
  routinesError: string | null;
}

type AppAction =
  // Global initialization actions
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_INITIALIZATION_PROGRESS'; payload: number }
  
  // Exercise actions
  | { type: 'SET_EXERCISES'; payload: Exercise[] }
  | { type: 'SET_EXERCISE_FILTERS'; payload: ExerciseFilters }
  | { type: 'ADD_EXERCISE_TO_CACHE'; payload: Exercise }
  | { type: 'SET_EXERCISES_LOADING'; payload: boolean }
  | { type: 'SET_EXERCISES_ERROR'; payload: string | null }
  
  // Filter options actions
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_MUSCLE_GROUPS'; payload: string[] }
  | { type: 'SET_EQUIPMENT'; payload: string[] }
  | { type: 'SET_FILTER_OPTIONS_LOADED'; payload: boolean }
  
  // Routine actions
  | { type: 'SET_CURRENT_ROUTINE'; payload: DailyRoutine | null }
  | { type: 'ADD_ROUTINE_TO_CACHE'; payload: DailyRoutine }
  | { type: 'SET_ROUTINES_LOADING'; payload: boolean }
  | { type: 'SET_ROUTINES_ERROR'; payload: string | null };

// 📦 Estado inicial
const initialState: AppState = {
  isInitialized: false,
  initializationProgress: 0,
  
  exercises: [],
  exercisesLoaded: false,
  exerciseFilters: {},
  exerciseCache: new Map(),
  
  categories: [],
  muscleGroups: [],
  equipment: [],
  filterOptionsLoaded: false,
  
  currentRoutine: null,
  routineCache: new Map(),
  routinesLoaded: false,
  
  isLoadingExercises: false,
  isLoadingRoutines: false,
  
  exercisesError: null,
  routinesError: null,
};

// 🔧 Reducer para manejar estado
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Global initialization actions
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };
    
    case 'SET_INITIALIZATION_PROGRESS':
      return {
        ...state,
        initializationProgress: action.payload,
      };

    // Exercise cases
    case 'SET_EXERCISES':
      return {
        ...state,
        exercises: action.payload,
        exercisesLoaded: true,
        exercisesError: null,
      };
    
    case 'SET_EXERCISE_FILTERS':
      return {
        ...state,
        exerciseFilters: action.payload,
      };
    
    case 'ADD_EXERCISE_TO_CACHE': {
      const newExerciseCache = new Map(state.exerciseCache);
      newExerciseCache.set(action.payload.id, action.payload);
      return {
        ...state,
        exerciseCache: newExerciseCache,
      };
    }
    
    case 'SET_EXERCISES_LOADING':
      return {
        ...state,
        isLoadingExercises: action.payload,
      };
    
    case 'SET_EXERCISES_ERROR':
      return {
        ...state,
        exercisesError: action.payload,
        isLoadingExercises: false,
      };
    
    // Filter options cases
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };
    
    case 'SET_MUSCLE_GROUPS':
      return {
        ...state,
        muscleGroups: action.payload,
      };
    
    case 'SET_EQUIPMENT':
      return {
        ...state,
        equipment: action.payload,
      };
    
    case 'SET_FILTER_OPTIONS_LOADED':
      return {
        ...state,
        filterOptionsLoaded: action.payload,
      };
    
    // Routine cases
    case 'SET_CURRENT_ROUTINE':
      return {
        ...state,
        currentRoutine: action.payload,
        routinesLoaded: true,
        routinesError: null,
      };
    
    case 'ADD_ROUTINE_TO_CACHE': {
      const newRoutineCache = new Map(state.routineCache);
      newRoutineCache.set(action.payload.id, action.payload);
      return {
        ...state,
        routineCache: newRoutineCache,
        currentRoutine: action.payload,
      };
    }
    
    case 'SET_ROUTINES_LOADING':
      return {
        ...state,
        isLoadingRoutines: action.payload,
      };
    
    case 'SET_ROUTINES_ERROR':
      return {
        ...state,
        routinesError: action.payload,
        isLoadingRoutines: false,
      };
    
    default:
      return state;
  }
}

// 🎯 Contexto principal
interface AppContextType extends AppState {
  // Exercise methods
  loadExercises: (filters?: ExerciseFilters, forceReload?: boolean) => Promise<void>;
  updateExerciseFilters: (filters: ExerciseFilters) => void;
  getExerciseFromCache: (id: string) => Promise<Exercise>;
  
  // Filter options methods
  loadFilterOptions: (forceReload?: boolean) => Promise<void>;
  
  // Routine methods
  loadTodayRoutine: (forceReload?: boolean) => Promise<void>;
  loadRoutineById: (id: string, forceReload?: boolean) => Promise<void>;
  loadRoutineByDate: (date: string, forceReload?: boolean) => Promise<void>;
  getRoutineFromCache: (id: string) => DailyRoutine | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

// 🏗️ Provider del contexto
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 📋 Métodos para ejercicios
  const loadExercises = async (filters?: ExerciseFilters, forceReload = false) => {
    const filtersToUse = filters || state.exerciseFilters;
    
    // Si ya están cargados y no forzamos recarga, no hacer nada
    if (state.exercisesLoaded && !forceReload && !filters) {
      return;
    }
    
    dispatch({ type: 'SET_EXERCISES_LOADING', payload: true });
    
    try {
      const exercises = await ApiService.getExercises(filtersToUse);
      dispatch({ type: 'SET_EXERCISES', payload: exercises });
      
      // Actualizar filtros si se proporcionaron
      if (filters) {
        dispatch({ type: 'SET_EXERCISE_FILTERS', payload: filtersToUse });
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      dispatch({ 
        type: 'SET_EXERCISES_ERROR', 
        payload: `Error al cargar ejercicios: ${(error as Error).message}` 
      });
    } finally {
      dispatch({ type: 'SET_EXERCISES_LOADING', payload: false });
    }
  };

  const updateExerciseFilters = (filters: ExerciseFilters) => {
    dispatch({ type: 'SET_EXERCISE_FILTERS', payload: filters });
    loadExercises(filters);
  };

  const getExerciseFromCache = async (id: string): Promise<Exercise> => {
    // Primero revisar el cache
    const cachedExercise = state.exerciseCache.get(id);
    if (cachedExercise) {
      return cachedExercise;
    }

    // Si no está en cache, hacer petición
    try {
      const exercise = await ApiService.getExercise(id);
      dispatch({ type: 'ADD_EXERCISE_TO_CACHE', payload: exercise });
      return exercise;
    } catch (error) {
      console.error(`Error loading exercise ${id}:`, error);
      throw error;
    }
  };

  // 🏷️ Métodos para opciones de filtros
  const loadFilterOptions = async (forceReload = false) => {
    if (state.filterOptionsLoaded && !forceReload) {
      return;
    }

    try {
      const [categories, muscleGroups, equipment] = await Promise.all([
        ApiService.getCategories(),
        ApiService.getMuscleGroups(),
        ApiService.getEquipment(),
      ]);

      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      dispatch({ type: 'SET_MUSCLE_GROUPS', payload: muscleGroups });
      dispatch({ type: 'SET_EQUIPMENT', payload: equipment });
      dispatch({ type: 'SET_FILTER_OPTIONS_LOADED', payload: true });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // 💪 Métodos para rutinas
  const loadTodayRoutine = async (forceReload = false) => {
    if (state.routinesLoaded && state.currentRoutine && !forceReload) {
      return;
    }

    dispatch({ type: 'SET_ROUTINES_LOADING', payload: true });

    try {
      const routine = await RoutineService.getTodayRoutine();
      
      if (routine) {
        dispatch({ type: 'ADD_ROUTINE_TO_CACHE', payload: routine });
      } else {
        dispatch({ type: 'SET_CURRENT_ROUTINE', payload: null });
      }
    } catch (error) {
      console.error('Error loading today routine:', error);
      dispatch({ 
        type: 'SET_ROUTINES_ERROR', 
        payload: `Error al cargar rutina: ${(error as Error).message}` 
      });
    } finally {
      dispatch({ type: 'SET_ROUTINES_LOADING', payload: false });
    }
  };

  const loadRoutineById = async (id: string, forceReload = false) => {
    // Revisar cache primero
    const cachedRoutine = state.routineCache.get(id);
    if (cachedRoutine && !forceReload) {
      dispatch({ type: 'SET_CURRENT_ROUTINE', payload: cachedRoutine });
      return;
    }

    dispatch({ type: 'SET_ROUTINES_LOADING', payload: true });

    try {
      const routine = await RoutineService.getRoutineById(id);
      if (routine) {
        dispatch({ type: 'ADD_ROUTINE_TO_CACHE', payload: routine });
      } else {
        dispatch({ type: 'SET_CURRENT_ROUTINE', payload: null });
      }
    } catch (error) {
      console.error(`Error loading routine ${id}:`, error);
      dispatch({ 
        type: 'SET_ROUTINES_ERROR', 
        payload: `Error al cargar rutina: ${(error as Error).message}` 
      });
    } finally {
      dispatch({ type: 'SET_ROUTINES_LOADING', payload: false });
    }
  };

  const getRoutineFromCache = (id: string): DailyRoutine | null => {
    return state.routineCache.get(id) || null;
  };

  // 📅 Cargar rutina por fecha específica
  const loadRoutineByDate = async (date: string, forceReload = false) => {
    // Usar la fecha como clave de cache
    const cacheKey = `date:${date}`;
    const cachedRoutine = state.routineCache.get(cacheKey);
    
    if (cachedRoutine && !forceReload) {
      dispatch({ type: 'SET_CURRENT_ROUTINE', payload: cachedRoutine });
      return;
    }

    dispatch({ type: 'SET_ROUTINES_LOADING', payload: true });
    dispatch({ type: 'SET_ROUTINES_ERROR', payload: null });

    try {
      const routine = await RoutineService.getRoutineByDate(date);
      
      if (routine) {
        // Usar fecha como clave de cache especial
        const newRoutineCache = new Map(state.routineCache);
        newRoutineCache.set(cacheKey, routine);
        newRoutineCache.set(routine.id, routine); // También por ID
        
        dispatch({ type: 'ADD_ROUTINE_TO_CACHE', payload: routine });
      } else {
        dispatch({ type: 'SET_CURRENT_ROUTINE', payload: null });
      }
    } catch (error) {
      console.error(`Error loading routine for date ${date}:`, error);
      dispatch({ 
        type: 'SET_ROUTINES_ERROR', 
        payload: `Error al cargar rutina para ${date}: ${(error as Error).message}` 
      });
    } finally {
      dispatch({ type: 'SET_ROUTINES_LOADING', payload: false });
    }
  };

  // 🚀 Carga inicial de datos esenciales
  useEffect(() => {
    const initializeApp = async () => {
      // Cargar opciones de filtros de forma prioritaria
      await loadFilterOptions();
      
      // Cargar ejercicios con filtros por defecto
      await loadExercises();
      
      // Cargar rutina del día
      await loadTodayRoutine();
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  const contextValue: AppContextType = {
    ...state,
    loadExercises,
    updateExerciseFilters,
    getExerciseFromCache,
    loadFilterOptions,
    loadTodayRoutine,
    loadRoutineById,
    loadRoutineByDate,
    getRoutineFromCache,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
