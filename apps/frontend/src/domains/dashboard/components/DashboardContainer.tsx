import React, { useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  DumbbellIcon,
  ClipboardIcon,
  CrownIcon,
  PulseIcon,
  RepeatIcon,
} from '../../../assets/icons/index.tsx';

const QuickAccessCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-xl p-5 text-left transition-[border-color,transform] duration-200 bg-[#1e293b] border border-[#334155] hover:border-[rgba(64,206,66,0.6)] hover:-translate-y-0.5"
  >
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 flex-shrink-0 text-[#6ee06f]"
      style={{ background: '#1f9e3f22' }}
    >
      {icon}
    </div>
    <h3 className="text-white font-semibold text-base">{title}</h3>
    <p className="text-[#94a3b8] text-sm mt-1 line-clamp-2">{subtitle}</p>
  </button>
);

const DashboardContainer: React.FC<{
  onNavigate: (page: 'exercises' | 'routines' | 'classes') => void;
}> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();

  const displayName = user?.profile?.fullName ?? user?.email?.split('@')[0] ?? 'Usuario';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  }, []);

  const today = useMemo(
    () => new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    [],
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Hero de bienvenida — bloque verde plano */}
      <div className="rounded-2xl p-4 sm:p-6 lg:p-8 bg-[#1f9e3f]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-3xl font-bold text-white flex-shrink-0 bg-white/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[#dcfce7] text-xs sm:text-sm capitalize truncate">
              {today}
            </p>
            <h1 className="text-lg sm:text-2xl font-bold text-white break-words">
              {greeting}, {displayName}
            </h1>
            {isAdmin && (
              <p className="text-[#dcfce7] text-xs sm:text-sm mt-1 inline-flex items-center gap-1">
                <CrownIcon size={14} />
                Administrador
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAccessCard
            icon={<DumbbellIcon size={22} />}
            title="Rutina de hoy"
            subtitle="Tu entrenamiento generado para hoy"
            onClick={() => {
              sessionStorage.setItem('routines.initialTab', 'today');
              onNavigate('routines');
            }}
          />

          <QuickAccessCard
            icon={<ClipboardIcon size={22} />}
            title="Mis rutinas"
            subtitle="Tus rutinas guardadas y editables"
            onClick={() => {
              sessionStorage.setItem('routines.initialTab', 'mine');
              onNavigate('routines');
            }}
          />

          <QuickAccessCard
            icon={<RepeatIcon size={22} />}
            title="Clases de hoy"
            subtitle="Consulta horarios y reserva plaza"
            onClick={() => onNavigate('classes')}
          />
        </div>

        <button
          onClick={() => onNavigate('exercises')}
          className="mt-4 w-full text-left flex items-center gap-3 rounded-xl p-3 sm:p-4 bg-[#172033] border border-[#334155] hover:border-[rgba(64,206,66,0.4)] transition-colors"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#6ee06f] flex-shrink-0"
            style={{ background: '#1f9e3f22' }}
          >
            <PulseIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold">
              Explorar catálogo de ejercicios
            </p>
            <p className="text-[#94a3b8] text-xs truncate">
              Filtros, grupos musculares y vídeos
            </p>
          </div>
          <span className="text-[#64748b] text-lg" aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardContainer;
