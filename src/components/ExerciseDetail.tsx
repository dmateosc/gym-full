import type { Exercise } from '../types/exercise';
import { 
  ArrowIcon, 
  TimeIcon, 
  CaloriesIcon, 
  EquipmentIcon, 
  MuscleIcon, 
  ToolsIcon, 
  InstructionsIcon 
} from '../assets/icons/index.tsx';

const CATEGORY_COLORS = {
  strength: 'bg-gradient-to-r from-red-600 to-red-800 text-white border-red-500',
  cardio: 'bg-gradient-to-r from-orange-600 to-orange-800 text-white border-orange-500',
  flexibility: 'bg-gradient-to-r from-green-600 to-green-800 text-white border-green-500',
  endurance: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white border-blue-500',
  balance: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white border-purple-500',
  functional: 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white border-yellow-500'
};

const DIFFICULTY_CONFIGURATIONS = {
  beginner: { 
    bg: 'bg-gradient-to-r from-green-600 to-green-800', 
    text: 'text-white', 
    border: 'border-green-500' 
  },
  intermediate: { 
    bg: 'bg-gradient-to-r from-yellow-600 to-yellow-800', 
    text: 'text-white', 
    border: 'border-yellow-500' 
  },
  advanced: { 
    bg: 'bg-gradient-to-r from-red-600 to-red-800', 
    text: 'text-white', 
    border: 'border-red-500' 
  }
};

const DEFAULT_CATEGORY_COLOR = 'bg-gradient-to-r from-gray-600 to-gray-800 text-white border-gray-500';

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
}

const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || DEFAULT_CATEGORY_COLOR;
};

const getDifficultyConfiguration = (difficulty: string) => {
  const configs = DIFFICULTY_CONFIGURATIONS as Record<string, typeof DIFFICULTY_CONFIGURATIONS.beginner>;
  return configs[difficulty] || DIFFICULTY_CONFIGURATIONS.beginner;
};

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const BackButton = ({ onBack }: { onBack: () => void }) => (
  <button
    onClick={onBack}
    className="flex items-center text-red-400 hover:text-red-300 mb-6 group transition-colors duration-200"
  >
    <ArrowIcon />
    Volver a la lista
  </button>
);

const ExerciseHeader = ({ exercise }: { exercise: Exercise }) => {
  const difficultyConfig = getDifficultyConfiguration(exercise.difficulty);
  
  return (
    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
          <p className="text-red-100 text-lg">{exercise.description}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <span className={`px-4 py-2 rounded-full border shadow-lg font-medium ${getCategoryColor(exercise.category)}`}>
            {capitalize(exercise.category)}
          </span>
          <span className={`px-4 py-2 rounded-full border shadow-lg font-medium ${difficultyConfig.bg} ${difficultyConfig.text} ${difficultyConfig.border}`}>
            {capitalize(exercise.difficulty)}
          </span>
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ 
  icon, 
  label, 
  value, 
  backgroundColor 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  backgroundColor: string;
}) => (
  <div className="text-center">
    <div className={`inline-flex items-center justify-center w-12 h-12 ${backgroundColor} text-white rounded-full mb-2 shadow-lg`}>
      {icon}
    </div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
  </div>
);

const StatsPanel = ({ exercise }: { exercise: Exercise }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
    {exercise.estimatedDuration && (
      <QuickStat
        icon={<TimeIcon />}
        label="Duración"
        value={`${exercise.estimatedDuration} min`}
        backgroundColor="bg-gradient-to-br from-blue-600 to-blue-800"
      />
    )}
    
    {exercise.calories && (
      <QuickStat
        icon={<CaloriesIcon />}
        label="Calorías"
        value={`${exercise.calories} cal`}
        backgroundColor="bg-gradient-to-br from-orange-600 to-orange-800"
      />
    )}
    
    <QuickStat
      icon={<EquipmentIcon />}
      label="Equipamiento"
      value={exercise.equipment[0]}
      backgroundColor="bg-gradient-to-br from-green-600 to-green-800"
    />
  </div>
);

const MuscleGroupsSection = ({ groups }: { groups: string[] }) => (
  <div>
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
      <MuscleIcon />
      Grupos musculares trabajados
    </h2>
    <div className="flex flex-wrap gap-2">
      {groups.map((group, index) => (
        <span
          key={index}
          className="inline-block bg-gradient-to-r from-red-600 to-red-800 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg border border-red-500"
        >
          {group}
        </span>
      ))}
    </div>
  </div>
);

const EquipmentSection = ({ equipment }: { equipment: string[] }) => (
  <div>
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
      <ToolsIcon />
      Equipamiento necesario
    </h2>
    <div className="flex flex-wrap gap-2">
      {equipment.map((item, index) => (
        <span
          key={index}
          className="inline-block bg-gradient-to-r from-green-600 to-green-800 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg border border-green-500"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const InstructionStep = ({ 
  number, 
  instruction 
}: { 
  number: number; 
  instruction: string;
}) => (
  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-lg">
      {number}
    </div>
    <p className="text-gray-200 flex-1 pt-1">{instruction}</p>
  </div>
);

const InstructionsSection = ({ instructions }: { instructions: string[] }) => (
  <div className="mt-8">
    <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
      <InstructionsIcon />
      Instrucciones paso a paso
    </h2>
    <div className="space-y-4">
      {instructions.map((instruction, index) => (
        <InstructionStep
          key={index}
          number={index + 1}
          instruction={instruction}
        />
      ))}
    </div>
  </div>
);

const ExerciseDetail = ({ exercise, onBack }: ExerciseDetailProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <BackButton onBack={onBack} />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <ExerciseHeader exercise={exercise} />
        <StatsPanel exercise={exercise} />

        <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MuscleGroupsSection groups={exercise.muscleGroups} />
            <EquipmentSection equipment={exercise.equipment} />
          </div>
          
          <InstructionsSection instructions={exercise.instructions} />
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
