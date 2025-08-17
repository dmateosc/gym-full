import React, { useState } from 'react';
import type { Exercise } from '../types/exercise';
import { useExercisesWithCache } from '../../shared';
import FiltersPanel from './FiltersPanel';
import ExerciseList from './ExerciseList';
import ExerciseDetail from './ExerciseDetail';

/**
 * Container Component para el dominio de Exercises
 * Maneja la lógica de estado y coordina los componentes de presentación
 * Ahora usa el contexto global para cachear datos y evitar peticiones innecesarias
 */
const ExercisesContainer: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { exercises, isLoading, error, filters, updateFilters } = useExercisesWithCache();

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
    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-1 xl:grid-cols-4 md:gap-4 lg:gap-6 xl:gap-8">
      {/* Panel de filtros - En mobile aparece arriba */}
      <div className="xl:col-span-1 order-1 md:order-1">
        <div className="md:sticky md:top-4">
          <FiltersPanel 
            filters={filters} 
            onFiltersChange={updateFilters}
          />
        </div>
      </div>
      
      {/* Lista de ejercicios - En mobile aparece debajo de los filtros */}
      <div className="xl:col-span-3 order-2 md:order-2">
        <ExerciseList 
          exercises={exercises}
          onExerciseSelect={setSelectedExercise}
        />
      </div>
    </div>
  );
};

export default ExercisesContainer;
