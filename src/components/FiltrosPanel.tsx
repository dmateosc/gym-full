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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl p-6 sticky top-4 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        <button
          onClick={limpiarFiltros}
          className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors duration-200 hover:bg-gray-800 px-3 py-1 rounded-md"
        >
          Limpiar
        </button>
      </div>

      <div className="space-y-6">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Buscar ejercicio
          </label>
          <input
            type="text"
            placeholder="Nombre del ejercicio..."
            value={filtros.busqueda || ''}
            onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Categoría
          </label>
          <select
            value={filtros.categoria || ''}
            onChange={(e) => actualizarFiltro('categoria', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.value} value={categoria.value} className="bg-gray-800 text-white">
                {categoria.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dificultad */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dificultad
          </label>
          <select
            value={filtros.dificultad || ''}
            onChange={(e) => actualizarFiltro('dificultad', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer"
          >
            <option value="">Todas las dificultades</option>
            {dificultades.map(dificultad => (
              <option key={dificultad.value} value={dificultad.value} className="bg-gray-800 text-white">
                {dificultad.label}
              </option>
            ))}
          </select>
        </div>

        {/* Grupo Muscular */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Grupo muscular
          </label>
          <select
            value={filtros.grupoMuscular || ''}
            onChange={(e) => actualizarFiltro('grupoMuscular', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer"
          >
            <option value="">Todos los grupos</option>
            {gruposMusculares.map(grupo => (
              <option key={grupo} value={grupo} className="bg-gray-800 text-white">
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
