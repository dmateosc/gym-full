import { useEffect, useState } from 'react';
import { ClassesService } from '../services/classesService';
import type { TodaySession } from '../types/class';
import { CategoryPill } from './CategoryPill';
import { TimeIcon, EquipmentIcon, NoResultsIcon } from '../../../assets/icons/index.tsx';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });

export function TodaySessionsView() {
  const [sessions, setSessions] = useState<TodaySession[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ClassesService.today()
      .then((data) => { if (!cancelled) setSessions(data); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-[#f87171]">
        Error cargando las clases de hoy: {error}
      </div>
    );
  }

  if (sessions === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1e293b] rounded-xl border border-[#334155] h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#64748b] mb-4 flex justify-center">
          <NoResultsIcon />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No hay clases programadas hoy</h3>
        <p className="text-[#94a3b8]">Vuelve mañana o consulta el horario completo</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((s) => {
        const cancelled = s.status === 'cancelled';
        return (
          <div
            key={s.sessionId}
            className={`bg-[#1e293b] rounded-xl border p-5 transition-colors ${
              cancelled ? 'border-[#334155] opacity-60' : 'border-[#334155] hover:border-[rgba(229,9,20,0.6)]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white pr-2">{s.name}</h3>
              <CategoryPill category={s.category} />
            </div>
            {s.description && (
              <p className="text-[#94a3b8] text-sm mb-4 line-clamp-2">{s.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-[#cbd5e1]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#60a5fa]"><TimeIcon /></span>
                {formatTime(s.scheduledAt)} · {s.durationMin} min
              </span>
              {s.location && (
                <span className="flex items-center gap-1.5">
                  <span className="text-[#4ade80]"><EquipmentIcon /></span>
                  {s.location}
                </span>
              )}
              <span className="text-[#94a3b8]">Aforo: {s.capacity}</span>
            </div>
            {cancelled && (
              <p className="mt-3 text-xs font-semibold text-[#f87171] uppercase">Cancelada</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
