import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { APP_CONFIG } from '../../shared/config/app.config';

interface Stats {
  totalExercises: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

const BACKEND_URL = APP_CONFIG.API.BACKEND_URL;

const StatCard: React.FC<{
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}> = ({ icon, title, value, subtitle, color = '#e50914' }) => (
  <div
    className="rounded-xl p-5 flex items-center gap-4"
    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: `${color}20` }}
    >
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
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
        const res = await fetch(`${BACKEND_URL}/exercises/statistics`);
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
      {/* Hero de bienvenida */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, #e50914 0%, #8b0000 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-red-200 text-sm">{today}</p>
            <h1 className="text-2xl font-bold text-white">
              {greeting}, {displayName} 👋
            </h1>
            <p className="text-red-100 text-sm mt-1">
              {isAdmin ? '👑 Administrador' : '💪 Usuario registrado'} · {user?.email}
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
                className="rounded-xl p-5 animate-pulse h-20"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="🏋️"
              title="Ejercicios"
              value={stats.totalExercises}
              subtitle="En el catálogo"
            />
            <StatCard
              icon="💪"
              title="Fuerza"
              value={stats.byCategory?.strength ?? 0}
              subtitle="Ejercicios de fuerza"
              color="#f59e0b"
            />
            <StatCard
              icon="🏃"
              title="Cardio"
              value={stats.byCategory?.cardio ?? 0}
              subtitle="Ejercicios cardio"
              color="#10b981"
            />
            <StatCard
              icon="🧘"
              title="Flexibilidad"
              value={stats.byCategory?.flexibility ?? 0}
              subtitle="Ejercicios flex."
              color="#6366f1"
            />
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No se pudieron cargar las estadísticas</p>
        )}
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => onNavigate('exercises')}
            className="rounded-xl p-6 text-left transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-white font-semibold text-lg">Catálogo de Ejercicios</h3>
            <p className="text-gray-400 text-sm mt-1">
              Explora más de {stats?.totalExercises ?? '50'} ejercicios con filtros avanzados
            </p>
          </button>

          <button
            onClick={() => onNavigate('routines')}
            className="rounded-xl p-6 text-left transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-3xl mb-3">💪</div>
            <h3 className="text-white font-semibold text-lg">Rutinas de Entrenamiento</h3>
            <p className="text-gray-400 text-sm mt-1">
              Consulta la rutina de hoy generada con IA
            </p>
          </button>
        </div>
      </div>

      {/* Progreso de dificultad */}
      {stats && (
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">Distribución por dificultad</h2>
          <div
            className="rounded-xl p-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {[
              { key: 'beginner', label: 'Principiante', color: '#10b981', icon: '🟢' },
              { key: 'intermediate', label: 'Intermedio', color: '#f59e0b', icon: '🟡' },
              { key: 'advanced', label: 'Avanzado', color: '#e50914', icon: '🔴' },
            ].map(({ key, label, color, icon }) => {
              const count = stats.byDifficulty?.[key] ?? 0;
              const pct = stats.totalExercises > 0 ? Math.round((count / stats.totalExercises) * 100) : 0;
              return (
                <div key={key} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-gray-300 text-sm">{icon} {label}</span>
                    <span className="text-gray-400 text-sm">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
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
