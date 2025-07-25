import type { Ejercicio } from '../types/ejercicio';

interface DetalleEjercicioProps {
  ejercicio: Ejercicio;
  onVolver: () => void;
}

const DetalleEjercicio = ({ ejercicio, onVolver }: DetalleEjercicioProps) => {
  const obtenerColorCategoria = (categoria: string) => {
    const colores = {
      fuerza: 'bg-red-100 text-red-800 border-red-200',
      cardio: 'bg-orange-100 text-orange-800 border-orange-200',
      flexibilidad: 'bg-green-100 text-green-800 border-green-200',
      resistencia: 'bg-blue-100 text-blue-800 border-blue-200',
      equilibrio: 'bg-purple-100 text-purple-800 border-purple-200',
      funcional: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colores[categoria as keyof typeof colores] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const obtenerColorDificultad = (dificultad: string) => {
    const configs = {
      principiante: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      intermedio: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      avanzado: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };
    return configs[dificultad as keyof typeof configs] || configs.principiante;
  };

  const dificultadConfig = obtenerColorDificultad(ejercicio.dificultad);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Botón volver */}
      <button
        onClick={onVolver}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6 group"
      >
        <svg 
          className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a la lista
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header del ejercicio */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold mb-2">{ejercicio.nombre}</h1>
              <p className="text-blue-100 text-lg">{ejercicio.descripcion}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <span className={`px-4 py-2 rounded-full border ${obtenerColorCategoria(ejercicio.categoria)} font-medium`}>
                {ejercicio.categoria.charAt(0).toUpperCase() + ejercicio.categoria.slice(1)}
              </span>
              <span className={`px-4 py-2 rounded-full border ${dificultadConfig.bg} ${dificultadConfig.text} ${dificultadConfig.border} font-medium`}>
                {ejercicio.dificultad.charAt(0).toUpperCase() + ejercicio.dificultad.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Información rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-gray-50 border-b">
          {ejercicio.duracionEstimada && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-500">Duración</p>
              <p className="text-lg font-semibold text-gray-800">{ejercicio.duracionEstimada} min</p>
            </div>
          )}
          
          {ejercicio.calorias && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5C10.58,11.86 9.69,12.95 8.1,13.34M13.41,13L20.29,19.88L18.88,21.29L12,14.41L5.12,21.29L3.71,19.88L10.59,13H5V11H14.41L16.17,9.24L15.59,8.66C15.2,8.26 15.2,7.64 15.59,7.24L18.42,4.41C18.81,4.02 19.44,4.02 19.83,4.41L19.84,4.42C20.23,4.81 20.23,5.44 19.84,5.83L17,8.66L16.41,9.24L18.17,11H23V13M12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8Z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-500">Calorías</p>
              <p className="text-lg font-semibold text-gray-800">{ejercicio.calorias} cal</p>
            </div>
          )}
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16L6.5,11.5L7.91,10.09L11,13.18L16.59,7.59L18,9L11,16Z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">Equipamiento</p>
            <p className="text-lg font-semibold text-gray-800">{ejercicio.equipamiento[0]}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Grupos musculares */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.24,3.56L14.11,5.69C14.11,5.69 16.24,3.56 16.24,3.56M7.76,3.56C7.76,3.56 9.89,5.69 9.89,5.69L7.76,3.56M12,10.96V7.41C12,6.05 13.05,5 14.41,5C15.76,5 16.81,6.05 16.81,7.41V7.96C16.81,9.32 15.76,10.37 14.41,10.37H12V10.96M12,14.59V11.04H14.41C15.76,11.04 16.81,12.09 16.81,13.45V14C16.81,15.36 15.76,16.41 14.41,16.41C13.05,16.41 12,15.36 12,14V14.59M12,18.59V15.04C12,13.68 10.95,12.63 9.59,12.63C8.24,12.63 7.19,13.68 7.19,15.04V15.59C7.19,16.95 8.24,18 9.59,18H12V18.59M12,10.96V14.41C12,15.77 10.95,16.82 9.59,16.82C8.24,16.82 7.19,15.77 7.19,14.41V13.86C7.19,12.5 8.24,11.45 9.59,11.45H12V10.96Z"/>
                </svg>
                Grupos musculares trabajados
              </h2>
              <div className="flex flex-wrap gap-2">
                {ejercicio.gruposMusculares.map((grupo, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium"
                  >
                    {grupo}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipamiento */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                </svg>
                Equipamiento necesario
              </h2>
              <div className="flex flex-wrap gap-2">
                {ejercicio.equipamiento.map((equipo, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium"
                  >
                    {equipo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19M7.5,18A1.5,1.5 0 0,1 6,16.5A1.5,1.5 0 0,1 7.5,15A1.5,1.5 0 0,1 9,16.5A1.5,1.5 0 0,1 7.5,18M7.5,12A1.5,1.5 0 0,1 6,10.5A1.5,1.5 0 0,1 7.5,9A1.5,1.5 0 0,1 9,10.5A1.5,1.5 0 0,1 7.5,12M7.5,6A1.5,1.5 0 0,1 6,4.5A1.5,1.5 0 0,1 7.5,3A1.5,1.5 0 0,1 9,4.5A1.5,1.5 0 0,1 7.5,6M18,17H11V15H18V17M18,11H11V9H18V11M18,5H11V3H18V5Z"/>
              </svg>
              Instrucciones paso a paso
            </h2>
            <div className="space-y-4">
              {ejercicio.instrucciones.map((instruccion, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 flex-1 pt-1">{instruccion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEjercicio;
