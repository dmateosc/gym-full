import type { ExerciseFilters } from '../types/exercise';
import { useFilterOptionsWithCache } from '../../shared';
import BodyMap from './BodyMap';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

interface FiltersPanelProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
}

const inputClass =
  'w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#334155] border border-[#475569] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#1f9e3f] focus:ring-2 focus:ring-[rgba(64,206,66,0.25)] transition-all duration-200 text-sm';

const selectClass = `${inputClass} cursor-pointer`;
const labelClass = 'block text-xs sm:text-sm font-medium text-[#cbd5e1] mb-2';

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
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-[#334155] rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-[#334155] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-xs sm:text-sm text-[#f87171] hover:text-[#fca5a5] transition-colors px-2 py-1 rounded-md hover:bg-white/5"
        >
          Limpiar
        </button>
      </div>

      <div>
        <label className={labelClass}>Buscar ejercicio</label>
        <input
          type="text"
          placeholder="Nombre del ejercicio..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Categoría</label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category} className="bg-[#334155] text-white">
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Dificultad</label>
        <select
          value={filters.difficulty || ''}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las dificultades</option>
          {DIFFICULTIES.map(difficulty => (
            <option key={difficulty} value={difficulty} className="bg-[#334155] text-white">
              {getDifficultyLabel(difficulty)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass.replace(' mb-2', '')}>Grupo muscular</label>
          {filters.muscleGroup && (
            <button
              onClick={() => handleFilterChange('muscleGroup', '')}
              className="text-xs text-[#f87171] hover:text-[#fca5a5] transition-colors"
            >
              {filters.muscleGroup} ✕
            </button>
          )}
        </div>
        <BodyMap
          availableMuscleGroups={muscleGroups}
          selectedMuscle={filters.muscleGroup}
          onMuscleClick={(name) =>
            handleFilterChange('muscleGroup', filters.muscleGroup === name ? '' : name)
          }
        />
        <select
          value={filters.muscleGroup || ''}
          onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
          className={`${selectClass} mt-2`}
        >
          <option value="">Todos los grupos</option>
          {muscleGroups.map(group => (
            <option key={group} value={group} className="bg-[#334155] text-white">
              {group}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Equipamiento</label>
        <select
          value={filters.equipment || ''}
          onChange={(e) => handleFilterChange('equipment', e.target.value)}
          className={selectClass}
        >
          <option value="">Todo el equipamiento</option>
          {equipment.map(eq => (
            <option key={eq} value={eq} className="bg-[#334155] text-white">
              {eq}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
