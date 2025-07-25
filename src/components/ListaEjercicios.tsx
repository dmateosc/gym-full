import type { Ejercicio } from '../types/ejercicio';

interface ListaEjerciciosProps {
  ejercicios: Ejercicio[];
  onEjercicioSelect: (ejercicio: Ejercicio) => void;
}

const ListaEjercicios = ({ ejercicios, onEjercicioSelect }: ListaEjerciciosProps) => {
  const obtenerColorCategoria = (categoria: string) => {
    const colores = {
      fuerza: 'bg-red-100 text-red-800',
      cardio: 'bg-orange-100 text-orange-800',
      flexibilidad: 'bg-green-100 text-green-800',
      resistencia: 'bg-blue-100 text-blue-800',
      equilibrio: 'bg-purple-100 text-purple-800',
      funcional: 'bg-yellow-100 text-yellow-800'
    };
    return colores[categoria as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  const obtenerColorDificultad = (dificultad: string) => {
    const colores = {
      principiante: 'bg-green-500',
      intermedio: 'bg-yellow-500',
      avanzado: 'bg-red-500'
    };
    return colores[dificultad as keyof typeof colores] || 'bg-gray-500';
  };

  if (ejercicios.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-600 mb-2">
          No se encontraron ejercicios
        </h3>
        <p className="text-gray-500">
          Intenta ajustar los filtros para ver más resultados
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Ejercicios Disponibles
        </h2>
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {ejercicios.length} ejercicio{ejercicios.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ejercicios.map((ejercicio) => (
          <div
            key={ejercicio.id}
            onClick={() => onEjercicioSelect(ejercicio)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {ejercicio.nombre}
                </h3>
                <div 
                  className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${obtenerColorDificultad(ejercicio.dificultad)}`}
                  title={`Dificultad: ${ejercicio.dificultad}`}
                />
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {ejercicio.descripcion}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorCategoria(ejercicio.categoria)}`}>
                  {ejercicio.categoria.charAt(0).toUpperCase() + ejercicio.categoria.slice(1)}
                </span>
                
                {ejercicio.duracionEstimada && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                    {ejercicio.duracionEstimada} min
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {ejercicio.gruposMusculares.slice(0, 3).map((grupo, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {grupo}
                  </span>
                ))}
                {ejercicio.gruposMusculares.length > 3 && (
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    +{ejercicio.gruposMusculares.length - 3} más
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {ejercicio.equipamiento[0]}
                </span>
                
                {ejercicio.calorias && (
                  <div className="flex items-center text-orange-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5C10.58,11.86 9.69,12.95 8.1,13.34M13.41,13L20.29,19.88L18.88,21.29L12,14.41L5.12,21.29L3.71,19.88L10.59,13H5V11H14.41L16.17,9.24L15.59,8.66C15.2,8.26 15.2,7.64 15.59,7.24L18.42,4.41C18.81,4.02 19.44,4.02 19.83,4.41L19.84,4.42C20.23,4.81 20.23,5.44 19.84,5.83L17,8.66L16.41,9.24L18.17,11H23V13M12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8Z"/>
                    </svg>
                    {ejercicio.calorias} cal
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaEjercicios;
