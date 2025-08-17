import type { ExerciseFilters } from '../types/exercise';
import { useFilterOptionsWithCache } from '../../shared';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

interface FiltersPanelProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
}

export default function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  const { categories, muscleGroups, equipment, isLoaded } = useFilterOptionsWithCache();

  const handleFilterChange = (key: keyof ExerciseFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getDifficultyLabel = (value: string) => {
    const labels: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    };
    return labels[value] || value;
  };

  const getCategoryLabel = (value: string) => {
    const labels: Record<string, string> = {
      strength: 'Fuerza',
      cardio: 'Cardio',
      flexibility: 'Flexibilidad',
      endurance: 'Resistencia',
      balance: 'Equilibrio',
      functional: 'Funcional'
    };
    return labels[value] || value;
  };

  if (!isLoaded) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-md hover:bg-gray-700"
        >
          Limpiar
        </button>
      </div>

      {/* Search Field */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
          Buscar ejercicio
        </label>
        <input
          type="text"
          placeholder="Nombre del ejercicio..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
        />
      </div>

      {/* Category Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
          Categoría
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer text-sm"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category} className="bg-gray-700 text-white">
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
          Dificultad
        </label>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer text-sm"
        >
          <option value="">Todas las dificultades</option>
          {DIFFICULTIES.map(difficulty => (
            <option key={difficulty} value={difficulty} className="bg-gray-700 text-white">
              {getDifficultyLabel(difficulty)}
            </option>
          ))}
        </select>
      </div>

      {/* Muscle Group Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
          Grupo muscular
        </label>
        <select
          value={filters.muscleGroup || ''}
          onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer text-sm"
        >
          <option value="">Todos los grupos</option>
          {muscleGroups.map(group => (
            <option key={group} value={group} className="bg-gray-700 text-white">
              {group}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
          Equipamiento
        </label>
        <select
          value={filters.equipment || ''}
          onChange={(e) => handleFilterChange('equipment', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer text-sm"
        >
          <option value="">Todo el equipamiento</option>
          {equipment.map(eq => (
            <option key={eq} value={eq} className="bg-gray-700 text-white">
              {eq}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
