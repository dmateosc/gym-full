import type { ExerciseFilters } from '../types/exercise';

// Define missing constants for categories, difficulties and muscle groups
const categories = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'balance', label: 'Equilibrio' },
  { value: 'functional', label: 'Funcional' }
];

const difficulties = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' }
];

const MUSCLE_GROUPS = [
  'Pectorales', 'Tríceps', 'Deltoides', 'Cuádriceps', 'Glúteos', 'Isquiotibiales',
  'Abdominales', 'Core', 'Hombros', 'Espalda', 'Bíceps', 'Pantorrillas',
  'Antebrazos', 'Trapecio', 'Dorsales', 'Cuerpo completo'
];

interface FiltersPanelProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
}

const SelectOption = ({ value, label }: { value: string; label: string }) => (
  <option key={value} value={value} className="bg-gray-800 text-white">
    {label}
  </option>
);

const SearchField = ({ 
  searchValue, 
  onSearchChange 
}: { 
  searchValue: string; 
  onSearchChange: (value: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Buscar ejercicio
    </label>
    <input
      type="text"
      placeholder="Nombre del ejercicio..."
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
    />
  </div>
);

const CategorySelector = ({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: string; 
  onCategoryChange: (category: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Categoría
    </label>
    <select
      value={selectedCategory}
      onChange={(e) => onCategoryChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer"
    >
      <option value="">Todas las categorías</option>
      {categories.map(category => (
        <SelectOption key={category.value} value={category.value} label={category.label} />
      ))}
    </select>
  </div>
);

const DifficultySelector = ({ 
  selectedDifficulty, 
  onDifficultyChange 
}: { 
  selectedDifficulty: string; 
  onDifficultyChange: (difficulty: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Dificultad
    </label>
    <select
      value={selectedDifficulty}
      onChange={(e) => onDifficultyChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer"
    >
      <option value="">Todas las dificultades</option>
      {difficulties.map(difficulty => (
        <SelectOption key={difficulty.value} value={difficulty.value} label={difficulty.label} />
      ))}
    </select>
  </div>
);

const MuscleGroupSelector = ({ 
  selectedGroup, 
  onGroupChange 
}: { 
  selectedGroup: string; 
  onGroupChange: (group: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Grupo muscular
    </label>
    <select
      value={selectedGroup}
      onChange={(e) => onGroupChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 cursor-pointer"
    >
      <option value="">Todos los grupos</option>
      {MUSCLE_GROUPS.map(group => (
        <SelectOption key={group} value={group} label={group} />
      ))}
    </select>
  </div>
);

const FiltersPanel = ({ filters, onFiltersChange }: FiltersPanelProps) => {
  const updateFilter = (field: keyof ExerciseFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value === '' ? undefined : value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const handleSearchChange = (value: string) => updateFilter('search', value);
  const handleCategoryChange = (category: string) => updateFilter('category', category);
  const handleDifficultyChange = (difficulty: string) => updateFilter('difficulty', difficulty);
  const handleGroupChange = (group: string) => updateFilter('muscleGroup', group);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl p-6 sticky top-4 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors duration-200 hover:bg-gray-800 px-3 py-1 rounded-md"
        >
          Limpiar
        </button>
      </div>

      <div className="space-y-6">
        <SearchField 
          searchValue={filters.search || ''} 
          onSearchChange={handleSearchChange}
        />
        
        <CategorySelector 
          selectedCategory={filters.category || ''} 
          onCategoryChange={handleCategoryChange}
        />
        
        <DifficultySelector 
          selectedDifficulty={filters.difficulty || ''} 
          onDifficultyChange={handleDifficultyChange}
        />
        
        <MuscleGroupSelector 
          selectedGroup={filters.muscleGroup || ''} 
          onGroupChange={handleGroupChange}
        />
      </div>
    </div>
  );
};

export default FiltersPanel;
