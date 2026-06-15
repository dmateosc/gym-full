import React, { useCallback, useEffect, useState } from 'react';
import type { DailyRoutine } from '../types/routine';
import { RoutineService } from '../services/routineService';
import RoutineView from './RoutineView';
import {
  AlertIcon,
  ClipboardIcon,
} from '../../../assets/icons/index.tsx';

interface PublicRoutinesViewProps {
  onCloned?: () => void;
}

const PublicRoutinesView: React.FC<PublicRoutinesViewProps> = ({ onCloned }) => {
  const [routines, setRoutines] = useState<DailyRoutine[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(() => {
    setRoutines(null);
    setError(null);
    RoutineService.listPublicRoutines()
      .then(setRoutines)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const handleClone = async (id: string) => {
    setCloningId(id);
    setFeedback(null);
    try {
      await RoutineService.cloneRoutineToMine(id);
      setFeedback('Guardada en tus rutinas.');
      onCloned?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCloningId(null);
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
          ← Volver a rutinas públicas
        </button>
        <RoutineView
          routine={selected}
          onSaveAsMine={(r) => handleClone(r.id)}
          savingAsMine={cloningId === selectedId}
        />
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
          Aún no hay rutinas públicas
        </h3>
        <p className="text-[#94a3b8] max-w-md mx-auto">
          Cuando alguien comparta su rutina, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 rounded-lg text-sm bg-[#1f9e3f22] border border-[#1f9e3f55] text-[#6ee06f]">
          {feedback}
        </div>
      )}

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
                onClick={() => void handleClone(r.id)}
                disabled={cloningId === r.id}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1f9e3f] hover:opacity-90 disabled:opacity-60"
              >
                {cloningId === r.id ? 'Guardando…' : 'Guardar copia'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicRoutinesView;
