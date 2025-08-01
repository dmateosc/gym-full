import React from 'react';
import { useRoutines } from '../hooks/useRoutines';
import RoutineView from './RoutineView';

/**
 * Container Component para el dominio de Routines
 * Maneja la lógica de estado y coordina los componentes de presentación
 */
const RoutinesContainer: React.FC = () => {
  const { currentRoutine, isLoading, error } = useRoutines();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando rutina...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Error al cargar rutina</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!currentRoutine) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-white mb-2">No hay rutinas disponibles</h3>
        <p className="text-gray-400">Por favor, intenta de nuevo más tarde.</p>
      </div>
    );
  }

  return <RoutineView routine={currentRoutine} />;
};

export default RoutinesContainer;
