import React, { useState } from 'react';
import type { Exercise } from '../types/exercise';
import { useExercises } from '../hooks/useExercises';
import FiltersPanel from './FiltersPanel';
import ExerciseList from './ExerciseList';
import ExerciseDetail from './ExerciseDetail';

/**
 * Container Component para el dominio de Exercises
 * Maneja la lógica de estado y coordina los componentes de presentación
 */
const ExercisesContainer: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { exercises, isLoading, error, filters, updateFilters } = useExercises();

  const handleBack = () => setSelectedExercise(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando ejercicios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Error al cargar ejercicios</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (selectedExercise) {
    return (
      <ExerciseDetail 
        exercise={selectedExercise} 
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <FiltersPanel 
          filters={filters} 
          onFiltersChange={updateFilters}
        />
      </div>
      
      <div className="lg:col-span-3">
        <ExerciseList 
          exercises={exercises}
          onExerciseSelect={setSelectedExercise}
        />
      </div>
    </div>
  );
};

export default ExercisesContainer;
