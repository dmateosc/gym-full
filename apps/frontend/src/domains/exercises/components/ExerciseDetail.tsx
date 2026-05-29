import { useState } from 'react';
import type { Exercise } from '../types/exercise';
import {
  ArrowIcon,
  TimeIcon,
  CaloriesIcon,
  EquipmentIcon,
  MuscleIcon,
  ToolsIcon,
  InstructionsIcon
} from '../../../assets/icons/index.tsx';
import BodyMap from './BodyMap';

const CATEGORY_LABELS: Record<string, string> = {
  strength: 'Fuerza',
  cardio: 'Cardio',
  flexibility: 'Flexibilidad',
  endurance: 'Resistencia',
  balance: 'Equilibrio',
  functional: 'Funcional',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

interface ExerciseDetailProps {
  exercise: Exercise;
  onBack: () => void;
}

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

const BackButton = ({ onBack }: { onBack: () => void }) => (
  <button
    onClick={onBack}
    className="flex items-center text-[#f87171] hover:text-[#fca5a5] mb-4 sm:mb-6 group transition-colors duration-200 text-sm sm:text-base"
  >
    <ArrowIcon />
    Volver a la lista
  </button>
);

const ExerciseHeader = ({ exercise }: { exercise: Exercise }) => (
  <div className="bg-[#e50914] text-white p-4 sm:p-6 md:p-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{exercise.name}</h1>
        <p className="text-[#fecaca] text-sm sm:text-base md:text-lg">{exercise.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/15 text-white font-semibold text-xs sm:text-sm md:text-base">
          {CATEGORY_LABELS[exercise.category] || capitalize(exercise.category)}
        </span>
        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/15 text-white font-semibold text-xs sm:text-sm md:text-base">
          {DIFFICULTY_LABELS[exercise.difficulty] || capitalize(exercise.difficulty)}
        </span>
      </div>
    </div>
  </div>
);

const QuickStat = ({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="text-center">
    <div
      className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-2"
      style={{ color, background: `${color}1f` }}
    >
      {icon}
    </div>
    <p className="text-xs sm:text-sm text-[#94a3b8]">{label}</p>
    <p className="text-sm sm:text-lg font-semibold text-white">{value}</p>
  </div>
);

const StatsPanel = ({ exercise }: { exercise: Exercise }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 bg-[#172033] border-b border-[#334155]">
    {exercise.estimatedDuration && (
      <QuickStat
        icon={<TimeIcon />}
        label="Duración"
        value={`${exercise.estimatedDuration} min`}
        color="#60a5fa"
      />
    )}

    {exercise.calories && (
      <QuickStat
        icon={<CaloriesIcon />}
        label="Calorías"
        value={`${exercise.calories} cal`}
        color="#fb923c"
      />
    )}

    <QuickStat
      icon={<EquipmentIcon />}
      label="Equipamiento"
      value={exercise.equipment[0]}
      color="#4ade80"
    />
  </div>
);

const FlatTag = ({ solid, text, children }: { solid: string; text: string; children: React.ReactNode }) => (
  <span
    className="inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
    style={{
      background: `${solid}22`,
      border: `1px solid ${solid}55`,
      color: text,
    }}
  >
    {children}
  </span>
);

const MuscleGroupsSection = ({ groups }: { groups: string[] }) => (
  <div>
    <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
      <span className="text-[#f87171]"><MuscleIcon /></span>
      Grupos musculares trabajados
    </h2>
    <div className="flex flex-wrap gap-2 mb-4">
      {groups.map((group, index) => (
        <FlatTag key={index} solid="#dc2626" text="#f87171">{group}</FlatTag>
      ))}
    </div>
    <BodyMap muscleGroups={groups} />
  </div>
);

const EquipmentSection = ({ equipment }: { equipment: string[] }) => (
  <div>
    <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
      <span className="text-[#4ade80]"><ToolsIcon /></span>
      Equipamiento necesario
    </h2>
    <div className="flex flex-wrap gap-2">
      {equipment.map((item, index) => (
        <FlatTag key={index} solid="#16a34a" text="#4ade80">{item}</FlatTag>
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
  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#172033] rounded-lg border border-[#334155]">
    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm">
      {number}
    </div>
    <p className="text-[#e5e7eb] flex-1 pt-0.5 sm:pt-1 text-sm sm:text-base">{instruction}</p>
  </div>
);

const InstructionsSection = ({ instructions }: { instructions: string[] }) => (
  <div className="mt-6 sm:mt-8">
    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
      <span className="text-[#c084fc]"><InstructionsIcon /></span>
      Instrucciones paso a paso
    </h2>
    <div className="space-y-3 sm:space-y-4">
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

const ExerciseImage = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  if (status === 'error') return null;

  return (
    <div className="relative w-full bg-[#0b1120] overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {status === 'loading' && (
        <div className="absolute inset-0 bg-[#1e293b] animate-pulse" />
      )}
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-contain transition-opacity duration-500"
        style={{ opacity: status === 'loaded' ? 1 : 0 }}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!watchMatch) return null;
  return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
};

const VideoSection = ({ videoUrl }: { videoUrl: string }) => {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const isMp4 = !embedUrl && videoUrl.includes('.mp4');

  if (!embedUrl && !isMp4) return null;

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
        <span className="text-[#f87171]">▶</span>
        Vídeo explicativo
      </h2>
      <div className="relative w-full rounded-xl overflow-hidden border border-[#334155]" style={{ paddingTop: '56.25%' }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Vídeo explicativo del ejercicio"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            controls
            loop
            muted
            playsInline
          />
        )}
      </div>
    </div>
  );
};

const ExerciseDetail = ({ exercise, onBack }: ExerciseDetailProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <BackButton onBack={onBack} />

      <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-[#334155]">
        <ExerciseHeader exercise={exercise} />
        {exercise.imageUrl && <ExerciseImage imageUrl={exercise.imageUrl} name={exercise.name} />}
        <StatsPanel exercise={exercise} />

        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <MuscleGroupsSection groups={exercise.muscleGroups} />
            <EquipmentSection equipment={exercise.equipment} />
          </div>

          <InstructionsSection instructions={exercise.instructions} />
          {exercise.videoUrl && <VideoSection videoUrl={exercise.videoUrl} />}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
