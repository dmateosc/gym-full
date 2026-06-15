import React from 'react';
import { ClipboardIcon, AlertIcon } from '../../../assets/icons/index.tsx';

interface EmptyRoutineStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

const EmptyRoutineState: React.FC<EmptyRoutineStateProps> = ({
  title = 'No hay rutinas disponibles',
  message = 'No se encontraron rutinas para mostrar. Puede que necesites generar una nueva rutina o verificar tu conexión.',
  icon = <ClipboardIcon size={48} />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 p-4 sm:p-6 lg:p-8">
      <div className="mb-3 sm:mb-4 opacity-50 text-white">{icon}</div>
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-4 text-center px-2">
        {title}
      </h3>
      <p className="text-gray-400 text-center max-w-md leading-relaxed text-sm sm:text-base px-2">
        {message}
      </p>

      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500 max-w-lg mx-auto">
        <div className="flex items-start">
          <div className="text-blue-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
            <AlertIcon size={18} />
          </div>
          <div>
            <h4 className="text-blue-400 font-semibold mb-1 text-sm sm:text-base">
              Sugerencia
            </h4>
            <p className="text-gray-300 text-xs sm:text-sm">
              Las rutinas se generan automáticamente cada día a las 6:00 UTC.
              Si no ves ninguna rutina, es posible que el sistema aún no haya
              generado una para hoy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyRoutineState;
