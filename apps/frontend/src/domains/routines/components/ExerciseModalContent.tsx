import React, { useState } from 'react';
import type { Exercise } from '../../exercises/types/exercise';
import {
  TimeIcon,
  CaloriesIcon,
  EquipmentIcon,
  MuscleIcon,
  ToolsIcon,
  InstructionsIcon
} from '../../../assets/icons/index.tsx';

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

interface ExerciseModalContentProps {
  exercise: Exercise;
  onClose: () => void;
}

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

const FlatTag = ({ tint, children }: { tint: { solid: string; text: string }; children: React.ReactNode }) => (
  <span
    className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold"
    style={{ background: `${tint.solid}22`, border: `1px solid ${tint.solid}55`, color: tint.text }}
  >
    {children}
  </span>
);

const ExerciseImage = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  if (status === 'error') return null;
  return (
    <div className="relative w-full bg-[#0b1120] overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {status === 'loading' && <div className="absolute inset-0 bg-[#1e293b] animate-pulse" />}
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
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
};

const VideoSection = ({ videoUrl }: { videoUrl: string }) => {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const isMp4 = !embedUrl && videoUrl.includes('.mp4');
  if (!embedUrl && !isMp4) return null;
  return (
    <div className="mt-4">
      <div className="relative w-full rounded-xl overflow-hidden border border-[#334155]" style={{ paddingTop: '56.25%' }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Vídeo del ejercicio"
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

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={onClose}
    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 text-white/80 hover:text-white transition-colors duration-200 p-2"
    aria-label="Cerrar modal"
  >
    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

const ExerciseHeader = ({ exercise }: { exercise: Exercise }) => (
  <div className="bg-[#e50914] text-white p-4 sm:p-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="pr-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{exercise.name}</h2>
        <p className="text-[#fecaca] text-sm sm:text-base">{exercise.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <span className="px-3 py-1 rounded-full bg-white/15 text-white font-semibold text-xs sm:text-sm">
          {CATEGORY_LABELS[exercise.category] || capitalize(exercise.category)}
        </span>
        <span className="px-3 py-1 rounded-full bg-white/15 text-white font-semibold text-xs sm:text-sm">
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
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="text-center">
    <div
      className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-2"
      style={{ color, background: `${color}1f` }}
    >
      {icon}
    </div>
    <p className="text-xs text-[#94a3b8]">{label}</p>
    <p className="text-sm sm:text-base font-semibold text-white">{value}</p>
  </div>
);

const StatsPanel = ({ exercise }: { exercise: Exercise }) => (
  <div className="grid grid-cols-3 gap-4 p-4 sm:p-6 bg-[#172033] border-b border-[#334155]">
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
      value={exercise.equipment[0] || 'N/A'}
      color="#4ade80"
    />
  </div>
);

const MuscleGroupsSection = ({ groups }: { groups: string[] }) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
      <span className="text-[#f87171]"><MuscleIcon /></span>
      Grupos musculares
    </h3>
    <div className="flex flex-wrap gap-2">
      {groups.map((group, index) => (
        <FlatTag key={index} tint={{ solid: '#dc2626', text: '#f87171' }}>{group}</FlatTag>
      ))}
    </div>
  </div>
);

const EquipmentSection = ({ equipment }: { equipment: string[] }) => (
  <div>
    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
      <span className="text-[#4ade80]"><ToolsIcon /></span>
      Equipamiento
    </h3>
    <div className="flex flex-wrap gap-2">
      {equipment.map((item, index) => (
        <FlatTag key={index} tint={{ solid: '#16a34a', text: '#4ade80' }}>{item}</FlatTag>
      ))}
    </div>
  </div>
);

const InstructionStep = ({
  number,
  instruction,
}: {
  number: number;
  instruction: string;
}) => (
  <div className="flex items-start space-x-3 p-3 bg-[#172033] rounded-lg border border-[#334155]">
    <div className="flex-shrink-0 w-6 h-6 bg-[#9333ea] text-white rounded-full flex items-center justify-center font-semibold text-xs">
      {number}
    </div>
    <p className="text-[#e5e7eb] flex-1 pt-0.5 text-sm">{instruction}</p>
  </div>
);

const InstructionsSection = ({ instructions }: { instructions: string[] }) => (
  <div className="mt-6">
    <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <span className="text-[#c084fc]"><InstructionsIcon /></span>
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
    <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-[#334155] relative">
      <CloseButton onClose={onClose} />
      <ExerciseHeader exercise={exercise} />
      {exercise.imageUrl && <ExerciseImage imageUrl={exercise.imageUrl} name={exercise.name} />}
      <StatsPanel exercise={exercise} />

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MuscleGroupsSection groups={exercise.muscleGroups} />
          <EquipmentSection equipment={exercise.equipment} />
        </div>

        {exercise.instructions && exercise.instructions.length > 0 && (
          <InstructionsSection instructions={exercise.instructions} />
        )}
        {exercise.videoUrl && <VideoSection videoUrl={exercise.videoUrl} />}
      </div>
    </div>
  );
};

export default ExerciseModalContent;
