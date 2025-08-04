import React from 'react';

interface EmptyRoutineStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

const EmptyRoutineState: React.FC<EmptyRoutineStateProps> = ({ 
  title = "No hay rutinas disponibles",
  message = "No se encontraron rutinas para mostrar. Puede que necesites generar una nueva rutina o verificar tu conexión.",
  icon = "📋"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 p-8">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-2xl font-semibold text-white mb-4 text-center">{title}</h3>
      <p className="text-gray-400 text-center max-w-md leading-relaxed">{message}</p>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
        <div className="flex items-start">
          <div className="text-blue-400 text-xl mr-3">💡</div>
          <div>
            <h4 className="text-blue-400 font-semibold mb-1">Sugerencia</h4>
            <p className="text-gray-300 text-sm">
              Las rutinas se generan automáticamente cada día a las 6:00 UTC. 
              Si no ves ninguna rutina, es posible que el sistema aún no haya generado una para hoy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyRoutineState;
