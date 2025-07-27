import type { Exercise } from '../types/exercise';
import { NoResultsIcon, TimeIconSmall, CaloriesIconSmall } from '../assets/icons/index.tsx';

const CATEGORY_COLORS = {
  strength: 'bg-gradient-to-r from-red-600 to-red-800 text-white',
  cardio: 'bg-gradient-to-r from-orange-600 to-orange-800 text-white',
  flexibility: 'bg-gradient-to-r from-green-600 to-green-800 text-white',
  endurance: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white',
  balance: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white',
  functional: 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white'
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-500 shadow-green-500/50',
  intermediate: 'bg-yellow-500 shadow-yellow-500/50',
  advanced: 'bg-red-500 shadow-red-500/50'
};

const DEFAULT_CATEGORY_COLOR = 'bg-gradient-to-r from-gray-600 to-gray-800 text-white';
const DEFAULT_DIFFICULTY_COLOR = 'bg-gray-500 shadow-gray-500/50';
const MAX_VISIBLE_GROUPS = 3;

interface ExerciseListProps {
  exercises: Exercise[];
  onExerciseSelect: (exercise: Exercise) => void;
}

const NoResultsState = () => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <NoResultsIcon />
    </div>
    <h3 className="text-xl font-medium text-white mb-2">
      No se encontraron ejercicios
    </h3>
    <p className="text-gray-400">
      Intenta ajustar los filtros para ver más resultados
    </p>
  </div>
);

const ListHeader = ({ exerciseCount }: { exerciseCount: number }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-white">
      Ejercicios Disponibles
    </h2>
    <span className="text-sm text-gray-300 bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 rounded-full border border-gray-600">
      {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
    </span>
  </div>
);

const DifficultyIndicator = ({ difficulty }: { difficulty: string }) => {
  const difficultyColor = DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || DEFAULT_DIFFICULTY_COLOR;
  
  return (
    <div 
      className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 shadow-lg ${difficultyColor}`}
      title={`Dificultad: ${difficulty}`}
    />
  );
};

const CategoryTag = ({ category }: { category: string }) => {
  const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || DEFAULT_CATEGORY_COLOR;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${categoryColor}`}>
      {capitalizedCategory}
    </span>
  );
};

const DurationInfo = ({ duration }: { duration?: number }) => {
  if (!duration) return null;
  
  return (
    <div className="flex items-center text-gray-400 text-sm">
      <TimeIconSmall />
      {duration} min
    </div>
  );
};

const CaloriesInfo = ({ calories }: { calories?: number }) => {
  if (!calories) return null;
  
  return (
    <div className="flex items-center text-red-400">
      <CaloriesIconSmall />
      {calories} cal
    </div>
  );
};

const MuscleGroupTags = ({ groups }: { groups: string[] }) => (
  <div className="flex flex-wrap gap-1 mb-4">
    {groups.slice(0, MAX_VISIBLE_GROUPS).map((group, index) => (
      <span
        key={index}
        className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
      >
        {group}
      </span>
    ))}
    {groups.length > MAX_VISIBLE_GROUPS && (
      <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600">
        +{groups.length - MAX_VISIBLE_GROUPS} más
      </span>
    )}
  </div>
);

const ExerciseCard = ({ 
  exercise, 
  onSelect 
}: { 
  exercise: Exercise; 
  onSelect: (exercise: Exercise) => void;
}) => (
  <div
    onClick={() => onSelect(exercise)}
    className="group bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl hover:shadow-red-500/10 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-red-500/50 hover:scale-105 overflow-hidden"
  >
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-red-300 transition-colors duration-200">
          {exercise.name}
        </h3>
        <DifficultyIndicator difficulty={exercise.difficulty} />
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {exercise.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <CategoryTag category={exercise.category} />
        <DurationInfo duration={exercise.estimatedDuration} />
      </div>

      <MuscleGroupTags groups={exercise.muscleGroups} />

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {exercise.equipment[0]}
        </span>
        <CaloriesInfo calories={exercise.calories} />
      </div>
    </div>
  </div>
);

const ExerciseList = ({ exercises, onExerciseSelect }: ExerciseListProps) => {
  if (exercises.length === 0) {
    return <NoResultsState />;
  }

  return (
    <div>
      <ListHeader exerciseCount={exercises.length} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onSelect={onExerciseSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
