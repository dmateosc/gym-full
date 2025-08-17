// Domain: Shared - Barrel exports
export { default as Header } from './components/Header';
export { default as Navigation } from './components/Navigation';
export { default as GlobalLoading } from './components/GlobalLoading';
export * from './config/app.config';
export { AppProvider } from './context/AppContext';
export { 
  useAppContext, 
  useExercisesWithCache, 
  useRoutinesWithCache, 
  useFilterOptionsWithCache 
} from './hooks/useAppContext';
