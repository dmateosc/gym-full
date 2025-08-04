import React, { useState } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import RoutineView from './RoutineView';
import EmptyRoutineState from './EmptyRoutineState';
import RoutineDateSelector from './RoutineDateSelector';

/**
 * Container Component para el dominio de Routines
 * Maneja la lógica de estado y coordina los componentes de presentación
 */
const RoutinesContainer: React.FC = () => {
  const { currentRoutine, isLoading, error } = useRoutines();
  const [overrideRoutine, setOverrideRoutine] = useState<typeof currentRoutine>(null);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Usar la rutina override si existe, sino la del hook
  const displayRoutine = overrideRoutine || currentRoutine;
  const displayLoading = overrideLoading || isLoading;
  const displayError = overrideError || error;

  if (displayLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando rutina...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Selector de fecha - siempre visible */}
      <RoutineDateSelector
        currentRoutine={displayRoutine}
        onRoutineChange={setOverrideRoutine}
        onLoadingChange={setOverrideLoading}
        onErrorChange={setOverrideError}
      />

      {displayError ? (
        <div className="text-center p-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Error al cargar rutina</h3>
          <p className="text-gray-400">{displayError}</p>
          
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border-l-4 border-red-500">
            <div className="flex items-start">
              <div className="text-red-400 text-xl mr-3">🔧</div>
              <div>
                <h4 className="text-red-400 font-semibold mb-1">Posibles soluciones</h4>
                <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
                  <li>Verifica tu conexión a internet</li>
                  <li>Asegúrate de que el backend esté ejecutándose</li>
                  <li>Revisa la configuración de la variable VITE_API_BASE_URL</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : displayRoutine ? (
        <RoutineView routine={displayRoutine} />
      ) : (
        <EmptyRoutineState />
      )}
    </div>
  );
};

export default RoutinesContainer;
