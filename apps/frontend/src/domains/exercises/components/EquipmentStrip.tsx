import React, { useRef } from 'react';
import {
  DumbbellIcon,
  MuscleIcon,
  EquipmentIcon,
  ToolsIcon,
  RepeatIcon,
  PulseIcon,
  FlameIcon,
} from '../../../assets/icons/index.tsx';

interface Props {
  equipment: string[];
  selected?: string | null;
  onSelect: (equipment: string | null) => void;
}

/**
 * Tira horizontal scrolleable para filtrar ejercicios por máquina /
 * equipamiento. Inspirada en las apps de tracking tipo Hevy / MyFitCoach:
 * el usuario reconoce la máquina visualmente y toca para filtrar.
 * Como no tenemos fotos por equipamiento, mapeamos por keyword del
 * nombre a un glifo del icon set.
 */
export default function EquipmentStrip({ equipment, selected, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const items = React.useMemo(
    () =>
      [...equipment]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })),
    [equipment],
  );

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        <Tile
          label="Todos"
          active={!selected}
          icon={<PulseIcon size={22} />}
          onClick={() => onSelect(null)}
        />
        {items.map((eq) => (
          <Tile
            key={eq}
            label={eq}
            icon={pickIcon(eq)}
            active={selected === eq}
            onClick={() => onSelect(selected === eq ? null : eq)}
          />
        ))}
      </div>
    </div>
  );
}

const Tile: React.FC<{
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${
      active
        ? 'bg-[#1f9e3f] text-white'
        : 'bg-[#1e293b] border border-[#334155] text-[#cbd5e1] hover:border-[rgba(64,206,66,0.6)]'
    }`}
    style={{ minWidth: 88 }}
    aria-pressed={active}
  >
    <div
      className={`w-11 h-11 rounded-lg flex items-center justify-center ${
        active ? 'bg-white/15' : 'bg-[#0f172a]'
      }`}
    >
      {icon}
    </div>
    <span className="text-[11px] font-medium leading-tight max-w-[88px] line-clamp-2 text-center">
      {label}
    </span>
  </button>
);

function pickIcon(equipment: string): React.ReactNode {
  const n = equipment
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  if (n.includes('mancuern') || n.includes('dumbbell')) return <DumbbellIcon size={22} />;
  if (n.includes('barra') || n.includes('barbell')) return <DumbbellIcon size={22} />;
  if (n.includes('kettle')) return <FlameIcon size={22} />;
  if (n.includes('banda') || n.includes('band')) return <RepeatIcon size={22} />;
  if (n.includes('polea') || n.includes('cable')) return <RepeatIcon size={22} />;
  if (n.includes('maquina') || n.includes('machine') || n.includes('smith')) return <EquipmentIcon />;
  if (n.includes('cuerpo') || n.includes('bodyweight') || n.includes('sin equipo'))
    return <MuscleIcon />;
  if (n.includes('banco') || n.includes('bench')) return <ToolsIcon />;
  if (n.includes('cardio') || n.includes('cinta') || n.includes('remo')) return <PulseIcon size={22} />;
  return <DumbbellIcon size={22} />;
}
