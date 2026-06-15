import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { APP_CONFIG } from '../../shared/config/app.config';
import { AuthService } from '../../auth/services/authService';
import {
  DumbbellIcon,
  ClipboardIcon,
  CrownIcon,
  AccountIcon,
  FlameIcon,
  PulseIcon,
} from '../../../assets/icons/index.tsx';

interface Stats {
  totalExercises: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

const BACKEND_URL = APP_CONFIG.API.BACKEND_URL;

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
    <div>
      <p className="text-[#94a3b8] text-sm">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-[#64748b] text-xs mt-0.5">{subtitle}</p>}
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero de bienvenida — rojo plano */}
      <div className="rounded-2xl p-6 sm:p-8 bg-[#1f9e3f]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 bg-white/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[#fecaca] text-sm capitalize">{today}</p>
            <h1 className="text-2xl font-bold text-white">
              {greeting}, {displayName}
            </h1>
            <p className="text-[#fecaca] text-sm mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1">
                {isAdmin ? <CrownIcon size={14} /> : <AccountIcon size={14} />}
                {isAdmin ? 'Administrador' : 'Usuario registrado'}
              </span>
              <span>·</span>
              <span>{user?.email}</span>
            </p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => onNavigate('exercises')}
            className="rounded-xl p-6 text-left transition-[border-color,transform] duration-200 bg-[#1e293b] border border-[#334155] hover:border-[rgba(64,206,66,0.6)] hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-[#6ee06f]" style={{ background: '#1f9e3f22' }}>
              <ClipboardIcon size={22} />
            </div>
            <h3 className="text-white font-semibold text-lg">Catálogo de Ejercicios</h3>
            <p className="text-[#94a3b8] text-sm mt-1">
              Explora más de {stats?.totalExercises ?? '50'} ejercicios con filtros avanzados
            </p>
          </button>

          <button
            onClick={() => onNavigate('routines')}
            className="rounded-xl p-6 text-left transition-[border-color,transform] duration-200 bg-[#1e293b] border border-[#334155] hover:border-[rgba(64,206,66,0.6)] hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-[#fbbf24]" style={{ background: '#f59e0b22' }}>
              <DumbbellIcon size={22} />
            </div>
            <h3 className="text-white font-semibold text-lg">Rutinas de Entrenamiento</h3>
            <p className="text-[#94a3b8] text-sm mt-1">
              Consulta la rutina de hoy generada con IA
            </p>
          </button>
        </div>
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
