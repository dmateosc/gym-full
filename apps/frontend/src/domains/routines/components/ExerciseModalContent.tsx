import React from 'react';
import type { Exercise } from '../../exercises/types/exercise';
import { 
  TimeIcon, 
  CaloriesIcon, 
  EquipmentIcon, 
  MuscleIcon, 
  ToolsIcon, 
  InstructionsIcon 
} from '../../../assets/icons/index.tsx';

const CATEGORY_COLORS = {
  strength: 'bg-wellness-green-gradient text-white border-wellness-green-500',
  cardio: 'bg-wellness-gold-gradient text-white border-wellness-gold-500',
  flexibility: 'bg-gradient-to-r from-wellness-green-600 to-wellness-green-800 text-white border-wellness-green-500',
  endurance: 'bg-gradient-to-r from-wellness-gold-600 to-wellness-gold-800 text-white border-wellness-gold-500',
  balance: 'bg-gradient-to-r from-wellness-green-500 to-wellness-gold-500 text-white border-wellness-green-500',
  functional: 'bg-gradient-to-r from-wellness-gold-600 to-wellness-green-600 text-white border-wellness-gold-500'
};

const DIFFICULTY_CONFIGURATIONS = {
  beginner: { 
    bg: 'bg-wellness-green-gradient', 
    text: 'text-white', 
    border: 'border-wellness-green-500' 
  },
  intermediate: { 
    bg: 'bg-wellness-gold-gradient', 
    text: 'text-white', 
    border: 'border-wellness-gold-500' 
  },
  advanced: { 
    bg: 'bg-gradient-to-r from-wellness-gold-600 to-wellness-green-600', 
    text: 'text-white', 
    border: 'border-wellness-gold-500' 
  }
};

const DEFAULT_CATEGORY_COLOR = 'bg-wellness-dark-gradient text-white border-wellness-dark-500';

interface ExerciseModalContentProps {
  exercise: Exercise;
  onClose: () => void;
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

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={onClose}
    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-white hover:text-wellness-gold-300 transition-colors duration-200 p-2"
    aria-label="Cerrar modal"
  >
    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

const ExerciseHeader = ({ exercise }: { exercise: Exercise }) => {
  const difficultyConfig = getDifficultyConfiguration(exercise.difficulty);
  
  return (
    <div className="bg-wellness-gradient text-white p-4 sm:p-6 border-b border-wellness-gold-400">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0 pr-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{exercise.name}</h2>
          <p className="text-wellness-green-100 text-sm sm:text-base">{exercise.description}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <span className={`px-3 py-1 rounded-full border font-medium text-xs sm:text-sm ${getCategoryColor(exercise.category)}`}>
            {capitalize(exercise.category)}
          </span>
          <span className={`px-3 py-1 rounded-full border font-medium text-xs sm:text-sm ${difficultyConfig.bg} ${difficultyConfig.text} ${difficultyConfig.border}`}>
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
    <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 ${backgroundColor} text-white rounded-full mb-2`}>
      {icon}
    </div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm sm:text-base font-semibold text-white">{value}</p>
  </div>
);

const StatsPanel = ({ exercise }: { exercise: Exercise }) => (
  <div className="grid grid-cols-3 gap-4 p-4 sm:p-6 bg-wellness-dark-gradient border-b border-wellness-green-700">
    {exercise.estimatedDuration && (
      <QuickStat
        icon={<TimeIcon />}
        label="Duración"
        value={`${exercise.estimatedDuration} min`}
        backgroundColor="bg-wellness-green-gradient"
      />
    )}
    
    {exercise.calories && (
      <QuickStat
        icon={<CaloriesIcon />}
        label="Calorías"
        value={`${exercise.calories} cal`}
        backgroundColor="bg-wellness-gold-gradient"
      />
    )}
    
    <QuickStat
      icon={<EquipmentIcon />}
      label="Equipamiento"
      value={exercise.equipment[0] || 'N/A'}
      backgroundColor="bg-gradient-to-br from-wellness-green-600 to-wellness-gold-600"
    />
  </div>
);

const MuscleGroupsSection = ({ groups }: { groups: string[] }) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
      <MuscleIcon />
      Grupos musculares
    </h3>
    <div className="flex flex-wrap gap-2">
      {groups.map((group, index) => (
        <span
          key={index}
          className="inline-block bg-gradient-to-r from-red-600 to-red-800 text-white px-2 py-1 rounded-full text-xs font-medium border border-red-500"
        >
          {group}
        </span>
      ))}
    </div>
  </div>
);

const EquipmentSection = ({ equipment }: { equipment: string[] }) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
      <ToolsIcon />
      Equipamiento
    </h3>
    <div className="flex flex-wrap gap-2">
      {equipment.map((item, index) => (
        <span
          key={index}
          className="inline-block bg-gradient-to-r from-green-600 to-green-800 text-white px-2 py-1 rounded-full text-xs font-medium border border-green-500"
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
  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full flex items-center justify-center font-semibold text-xs">
      {number}
    </div>
    <p className="text-gray-200 flex-1 pt-0.5 text-sm">{instruction}</p>
  </div>
);

const InstructionsSection = ({ instructions }: { instructions: string[] }) => (
  <div className="mt-6">
    <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <InstructionsIcon />
      Instrucciones
    </h3>
    <div className="space-y-3">
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

const ExerciseModalContent: React.FC<ExerciseModalContentProps> = ({ exercise, onClose }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg shadow-2xl overflow-hidden border border-gray-700 relative">
      <CloseButton onClose={onClose} />
      <ExerciseHeader exercise={exercise} />
      <StatsPanel exercise={exercise} />

      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MuscleGroupsSection groups={exercise.muscleGroups} />
          <EquipmentSection equipment={exercise.equipment} />
        </div>
        
        {exercise.instructions && exercise.instructions.length > 0 && (
          <InstructionsSection instructions={exercise.instructions} />
        )}
      </div>
    </div>
  );
};

export default ExerciseModalContent;
