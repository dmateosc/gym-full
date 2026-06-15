import type { Exercise } from '../types/exercise';
import { NoResultsIcon, TimeIconSmall, CaloriesIconSmall } from '../../../assets/icons/index.tsx';

const CATEGORY_TINTS = {
  strength:    { solid: '#dc2626', text: '#f87171' },
  cardio:      { solid: '#ea580c', text: '#fb923c' },
  flexibility: { solid: '#16a34a', text: '#4ade80' },
  endurance:   { solid: '#2563eb', text: '#60a5fa' },
  balance:     { solid: '#9333ea', text: '#c084fc' },
  functional:  { solid: '#ca8a04', text: '#facc15' },
};

const DIFFICULTY_DOT = {
  beginner:     '#22c55e',
  intermediate: '#eab308',
  advanced:     '#ef4444',
};

const DEFAULT_TINT = { solid: '#64748b', text: '#cbd5e1' };
const DEFAULT_DOT = '#64748b';
const MAX_VISIBLE_GROUPS = 3;

interface ExerciseListProps {
  exercises: Exercise[];
  onExerciseSelect: (exercise: Exercise) => void;
}

const NoResultsState = () => (
  <div className="text-center py-12">
    <div className="text-[#64748b] mb-4 flex justify-center">
      <NoResultsIcon />
    </div>
    <h3 className="text-xl font-medium text-white mb-2">
      No se encontraron ejercicios
    </h3>
    <p className="text-[#94a3b8]">
      Intenta ajustar los filtros para ver más resultados
    </p>
  </div>
);

const ListHeader = ({ exerciseCount }: { exerciseCount: number }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
    <h2 className="text-xl sm:text-2xl font-bold text-white">
      Ejercicios Disponibles
    </h2>
    <span className="text-xs sm:text-sm text-[#cbd5e1] bg-[#1e293b] px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-[#475569] self-start sm:self-auto">
      {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
    </span>
  </div>
);

const DifficultyIndicator = ({ difficulty }: { difficulty: string }) => {
  const color = DIFFICULTY_DOT[difficulty as keyof typeof DIFFICULTY_DOT] || DEFAULT_DOT;
  return (
    <span
      className="w-3 h-3 rounded-full flex-shrink-0 ml-2 mt-1.5"
      style={{ background: color }}
      title={`Dificultad: ${difficulty}`}
    />
  );
};

const CategoryTag = ({ category }: { category: string }) => {
  const tint = CATEGORY_TINTS[category as keyof typeof CATEGORY_TINTS] || DEFAULT_TINT;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background: `${tint.solid}22`,
        border: `1px solid ${tint.solid}55`,
        color: tint.text,
      }}
    >
      {label}
    </span>
  );
};

const DurationInfo = ({ duration }: { duration?: number }) => {
  if (!duration) return null;
  return (
    <div className="flex items-center text-[#94a3b8] text-sm">
      <TimeIconSmall />
      {duration} min
    </div>
  );
};

const CaloriesInfo = ({ calories }: { calories?: number }) => {
  if (!calories) return null;
  return (
    <div className="flex items-center text-[#f87171]">
      <CaloriesIconSmall />
      {calories} cal
    </div>
  );
};

const MuscleGroupTags = ({ groups }: { groups: string[] }) => (
  <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
    {groups.slice(0, MAX_VISIBLE_GROUPS).map((group, index) => (
      <span
        key={index}
        className="inline-block bg-[#334155] text-[#cbd5e1] text-xs px-2 py-1 rounded border border-[#475569]"
      >
        {group}
      </span>
    ))}
    {groups.length > MAX_VISIBLE_GROUPS && (
      <span className="inline-block bg-[#334155] text-[#cbd5e1] text-xs px-2 py-1 rounded border border-[#475569]">
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
    className="group bg-[#1e293b] rounded-xl border border-[#334155] hover:border-[rgba(64,206,66,0.6)] hover:-translate-y-0.5 transition-[border-color,transform] duration-200 cursor-pointer overflow-hidden"
  >
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2 group-hover:text-[#fca5a5] transition-colors duration-200 flex-1 pr-2">
          {exercise.name}
        </h3>
        <DifficultyIndicator difficulty={exercise.difficulty} />
      </div>

      <p className="text-[#94a3b8] text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {exercise.description}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
        <CategoryTag category={exercise.category} />
        <DurationInfo duration={exercise.estimatedDuration} />
      </div>

      <MuscleGroupTags groups={exercise.muscleGroups} />

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-[#94a3b8] truncate flex-1 mr-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
