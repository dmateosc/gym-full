import React, { useCallback, useEffect, useState } from 'react';
import type { DailyRoutine } from '../types/routine';
import { RoutineService } from '../services/routineService';
import RoutineView from './RoutineView';
import {
  AlertIcon,
  ClipboardIcon,
} from '../../../assets/icons/index.tsx';

const MyRoutinesView: React.FC = () => {
  const [routines, setRoutines] = useState<DailyRoutine[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setRoutines(null);
    setError(null);
    RoutineService.listMyRoutines()
      .then(setRoutines)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta rutina? No podrás recuperarla.')) return;
    setDeletingId(id);
    try {
      await RoutineService.deleteMyRoutine(id);
      setRoutines((prev) => prev?.filter((r) => r.id !== id) ?? []);
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  if (selectedId) {
    const selected = routines?.find((r) => r.id === selectedId);
    if (!selected) {
      setSelectedId(null);
      return null;
    }
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedId(null)}
          className="text-[#94a3b8] hover:text-white text-sm flex items-center gap-1.5"
        >
          ← Volver a mis rutinas
        </button>
        <RoutineView routine={selected} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-500/50 text-red-300 text-sm flex items-start gap-2">
          <span className="mt-0.5"><AlertIcon size={16} /></span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (routines === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#1e293b] rounded-xl border border-[#334155] h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#64748b] mb-4 flex justify-center">
          <ClipboardIcon size={40} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">
          Aún no tienes rutinas guardadas
        </h3>
        <p className="text-[#94a3b8] max-w-md mx-auto">
          Guarda la rutina del día desde la pestaña "Hoy" o crea una propia
          desde cero.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {routines.map((r) => (
        <div
          key={r.id}
          className="bg-[#1e293b] rounded-xl border border-[#334155] hover:border-[rgba(64,206,66,0.6)] transition-colors p-5 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
            {r.name}
          </h3>
          {r.description && (
            <p className="text-[#94a3b8] text-sm line-clamp-2 mb-3">
              {r.description}
            </p>
          )}
          <div className="text-[#cbd5e1] text-xs mb-4">
            {r.routineExercises?.length ?? 0} ejercicios
            {r.estimatedDurationMinutes
              ? ` · ${r.estimatedDurationMinutes} min`
              : ''}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedId(r.id)}
              className="text-[#6ee06f] hover:underline text-sm font-semibold"
            >
              Ver
            </button>
            <button
              onClick={() => void handleDelete(r.id)}
              disabled={deletingId === r.id}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#fca5a5] hover:bg-[rgba(220,38,38,0.15)] disabled:opacity-50"
            >
              {deletingId === r.id ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyRoutinesView;
