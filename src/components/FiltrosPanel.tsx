import type { FiltrosEjercicio } from '../types/ejercicio';
import { categorias, dificultades } from '../data/ejercicios';

interface FiltrosPanelProps {
  filtros: FiltrosEjercicio;
  onFiltrosChange: (filtros: FiltrosEjercicio) => void;
}

const FiltrosPanel = ({ filtros, onFiltrosChange }: FiltrosPanelProps) => {
  const gruposMusculares = [
    'Pectorales', 'Tríceps', 'Deltoides', 'Cuádriceps', 'Glúteos', 
    'Isquiotibiales', 'Abdominales', 'Core', 'Hombros', 'Espalda baja', 
    'Trapecio', 'Cuerpo completo'
  ];

  const actualizarFiltro = (campo: keyof FiltrosEjercicio, valor: string) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor === '' ? undefined : valor
    });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
        <button
          onClick={limpiarFiltros}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Limpiar
        </button>
      </div>

      <div className="space-y-6">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar ejercicio
          </label>
          <input
            type="text"
            placeholder="Nombre del ejercicio..."
            value={filtros.busqueda || ''}
            onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={filtros.categoria || ''}
            onChange={(e) => actualizarFiltro('categoria', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.value} value={categoria.value}>
                {categoria.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dificultad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificultad
          </label>
          <select
            value={filtros.dificultad || ''}
            onChange={(e) => actualizarFiltro('dificultad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las dificultades</option>
            {dificultades.map(dificultad => (
              <option key={dificultad.value} value={dificultad.value}>
                {dificultad.label}
              </option>
            ))}
          </select>
        </div>

        {/* Grupo Muscular */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grupo muscular
          </label>
          <select
            value={filtros.grupoMuscular || ''}
            onChange={(e) => actualizarFiltro('grupoMuscular', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los grupos</option>
            {gruposMusculares.map(grupo => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltrosPanel;
