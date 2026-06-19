import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { APP_CONFIG } from '../../shared/config/app.config';
import { AuthService } from '../../auth/services/authService';
import {
  DumbbellIcon,
  ClipboardIcon,
  CrownIcon,
  FlameIcon,
  PulseIcon,
  RepeatIcon,
} from '../../../assets/icons/index.tsx';

interface Stats {
  totalExercises: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

const BACKEND_URL = APP_CONFIG.API.BACKEND_URL;

const QuickAccessCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, iconColor, iconBg, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-xl p-5 text-left transition-[border-color,transform] duration-200 bg-[#1e293b] border border-[#334155] hover:border-[rgba(64,206,66,0.6)] hover:-translate-y-0.5"
  >
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 flex-shrink-0"
      style={{ background: iconBg, color: iconColor }}
    >
      {icon}
    </div>
    <h3 className="text-white font-semibold text-base">{title}</h3>
    <p className="text-[#94a3b8] text-sm mt-1 line-clamp-2">{subtitle}</p>
  </button>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}> = ({ icon, title, value, subtitle, color = '#1f9e3f' }) => (
  <div className="rounded-xl p-5 flex items-center gap-4 bg-[#1e293b] border border-[#334155]">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}1f`, color }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[#94a3b8] text-sm truncate">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-[#64748b] text-xs mt-0.5 truncate">{subtitle}</p>
      )}
    </div>
  </div>
);

const DashboardContainer: React.FC<{
  onNavigate: (page: 'exercises' | 'routines') => void;
}> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = AuthService.getToken();
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const res = await fetch(`${BACKEND_URL}/exercises/statistics`, { headers });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch {
        // stats no críticas
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

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

      {/* Stats */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4">Estadísticas del sistema</h2>
        {loadingStats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-5 animate-pulse h-20 bg-[#1e293b] border border-[#334155]"
              />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<DumbbellIcon size={22} />}
              title="Ejercicios"
              value={stats.totalExercises}
              subtitle="En el catálogo"
            />
            <StatCard
              icon={<FlameIcon size={22} />}
              title="Fuerza"
              value={stats.byCategory?.strength ?? 0}
              subtitle="Ejercicios de fuerza"
              color="#f59e0b"
            />
            <StatCard
              icon={<PulseIcon size={22} />}
              title="Cardio"
              value={stats.byCategory?.cardio ?? 0}
              subtitle="Ejercicios cardio"
              color="#ea580c"
            />
            <StatCard
              icon={<PulseIcon size={22} />}
              title="Flexibilidad"
              value={stats.byCategory?.flexibility ?? 0}
              subtitle="Ejercicios flex."
              color="#16a34a"
            />
          </div>
        ) : (
          <p className="text-[#94a3b8] text-sm">No se pudieron cargar las estadísticas</p>
        )}
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAccessCard
            icon={<DumbbellIcon size={22} />}
            iconColor="#6ee06f"
            iconBg="#1f9e3f22"
            title="Rutina de hoy"
            subtitle="Tu entrenamiento generado para hoy"
            onClick={() => {
              sessionStorage.setItem('routines.initialTab', 'today');
              onNavigate('routines');
            }}
          />

          <QuickAccessCard
            icon={<ClipboardIcon size={22} />}
            iconColor="#fdc400"
            iconBg="#fdc40022"
            title="Mis rutinas"
            subtitle="Tus rutinas guardadas y editables"
            onClick={() => {
              sessionStorage.setItem('routines.initialTab', 'mine');
              onNavigate('routines');
            }}
          />

          <QuickAccessCard
            icon={<RepeatIcon size={22} />}
            iconColor="#60a5fa"
            iconBg="#2563eb22"
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
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#cbd5e1] flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <PulseIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold">
              Explorar catálogo de ejercicios
            </p>
            <p className="text-[#94a3b8] text-xs truncate">
              {stats?.totalExercises ?? '+ de 50'} ejercicios con filtros y vídeos
            </p>
          </div>
          <span className="text-[#64748b] text-lg" aria-hidden>›</span>
        </button>
      </div>

      {/* Progreso de dificultad */}
      {stats && (
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">Distribución por dificultad</h2>
          <div className="rounded-xl p-6 bg-[#1e293b] border border-[#334155]">
            {[
              { key: 'beginner', label: 'Principiante', color: '#22c55e' },
              { key: 'intermediate', label: 'Intermedio', color: '#eab308' },
              { key: 'advanced', label: 'Avanzado', color: '#ef4444' },
            ].map(({ key, label, color }) => {
              const count = stats.byDifficulty?.[key] ?? 0;
              const pct = stats.totalExercises > 0 ? Math.round((count / stats.totalExercises) * 100) : 0;
              return (
                <div key={key} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[#cbd5e1] text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      {label}
                    </span>
                    <span className="text-[#94a3b8] text-sm">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#334155]">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContainer;
