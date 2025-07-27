import { useState, useEffect } from 'react';
import type { Exercise, ExerciseFilters } from './types/exercise';
import { exercisesData } from './data/exercises';
import Header from './components/Header';
import FiltersPanel from './components/FiltersPanel';
import ExerciseDetail from './components/ExerciseDetail';
import ExerciseList from './components/ExerciseList';

const SIMULATED_LOADING_TIME = 500;

function App() {
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeApp = () => {
    try {
      setTimeout(() => {
        setIsLoading(false);
      }, SIMULATED_LOADING_TIME);
    } catch (err) {
      setError('Error loading application: ' + (err as Error).message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const applyFilters = (exercise: Exercise): boolean => {
    if (filters.category && exercise.category !== filters.category) return false;
    if (filters.difficulty && exercise.difficulty !== filters.difficulty) return false;
    if (filters.muscleGroup && !exercise.muscleGroups.includes(filters.muscleGroup)) return false;
    if (filters.search && !exercise.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  };

  const filteredExercises = exercisesData.filter(applyFilters);

  const returnToList = () => setSelectedExercise(null);

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto"></div>
          <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 animate-pulse"></div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">GymApp</h2>
        <p className="text-gray-300 text-lg">Cargando tu catálogo de ejercicios...</p>
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const mostrarEstadoError = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Recargar página
        </button>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (selectedExercise) {
      return (
        <ExerciseDetail 
          exercise={selectedExercise} 
          onBack={returnToList}
        />
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FiltersPanel 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        </div>
        
        <div className="lg:col-span-3">
          <ExerciseList 
            exercises={filteredExercises}
            onExerciseSelect={setSelectedExercise}
          />
        </div>
      </div>
    );
  };

  if (isLoading) return renderLoadingState();
  if (error) return mostrarEstadoError();

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black" 
      style={{
        background: 'linear-gradient(to bottom right, #000000, #111827, #000000)',
        minHeight: '100vh'
      }}
    >
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
