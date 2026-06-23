import React, { useState } from 'react';
import type { DailyRoutine, RoutineExercise } from '../../routines/types/routine';
import type { WorkoutSession, WorkoutSetLog } from '../types';
import { WorkoutsService } from '../workoutsService';
import { AlertIcon, CheckIcon } from '../../../assets/icons/index.tsx';

interface Props {
  routine: DailyRoutine;
  session: WorkoutSession;
  onFinish: (session: WorkoutSession) => void;
  onAbandon: () => void;
}

const inputClass =
  'w-full px-2 py-1.5 rounded-md text-white text-sm placeholder-[#64748b] outline-none bg-[#0f172a] border border-[#334155] focus:border-[#1f9e3f] focus:ring-1 focus:ring-[rgba(64,206,66,0.3)]';

/**
 * Vista de entrenamiento en vivo: muestra los ejercicios de la rutina
 * y permite registrar peso / reps por serie. Cada serie se guarda en
 * cuanto pulsas "Hecho".
 */
const WorkoutView: React.FC<Props> = ({ routine, session, onFinish, onAbandon }) => {
  const [working, setWorking] = useState<WorkoutSession>(session);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  const getSet = (
    routineExerciseId: string,
    setNumber: number,
  ): WorkoutSetLog | undefined =>
    working.logs
      .find((l) => l.routineExerciseId === routineExerciseId)
      ?.sets.find((s) => s.setNumber === setNumber);

  const handleSave = async (
    routineExerciseId: string,
    setNumber: number,
    weight: string,
    reps: string,
  ) => {
    const key = `${routineExerciseId}:${setNumber}`;
    setSavingKey(key);
    setError(null);
    try {
      const updated = await WorkoutsService.logSet(working.id, {
        routineExerciseId,
        setNumber,
        weight: weight ? Number(weight) : undefined,
        reps: reps ? Number(reps) : undefined,
      });
      setWorking(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const updated = await WorkoutsService.complete(working.id);
      onFinish(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCompleting(false);
    }
  };

  const handleAbandon = async () => {
    if (!window.confirm('¿Abandonar el entrenamiento? Los logs se conservan.'))
      return;
    try {
      await WorkoutsService.abandon(working.id);
      onAbandon();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-[#1f9e3f] rounded-xl p-4 sm:p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[#dcfce7] text-xs uppercase tracking-wider">
              Entrenando
            </p>
            <h1 className="text-lg sm:text-xl font-bold truncate">
              {routine.name}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleAbandon}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 whitespace-nowrap"
            >
              Abandonar
            </button>
            <button
              onClick={() => void handleComplete()}
              disabled={completing}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#0f172a] hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
            >
              {completing ? 'Finalizando…' : 'Finalizar'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-300 text-sm flex items-start gap-2">
          <span className="mt-0.5">
            <AlertIcon size={16} />
          </span>
          <span>{error}</span>
        </div>
      )}

      <ul className="space-y-3">
        {routine.routineExercises
          .slice()
          .sort((a, b) => a.orderInRoutine - b.orderInRoutine)
          .map((re) => (
            <ExerciseCard
              key={re.id}
              re={re}
              getSet={getSet}
              savingKey={savingKey}
              onSave={handleSave}
            />
          ))}
      </ul>
    </div>
  );
};

const ExerciseCard: React.FC<{
  re: RoutineExercise;
  getSet: (
    routineExerciseId: string,
    setNumber: number,
  ) => WorkoutSetLog | undefined;
  savingKey: string | null;
  onSave: (
    routineExerciseId: string,
    setNumber: number,
    weight: string,
    reps: string,
  ) => Promise<void>;
}> = ({ re, getSet, savingKey, onSave }) => {
  const numSets = re.sets ?? 1;
  const sets = Array.from({ length: numSets }, (_, i) => i + 1);

  return (
    <li className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="text-white font-semibold text-sm sm:text-base break-words">
          {re.orderInRoutine}. {re.exercise.name}
        </h3>
        <span className="text-[#94a3b8] text-xs shrink-0">
          {re.sets ?? '–'} × {re.reps ?? '–'}
          {re.weight ? ` · ${re.weight} kg sug.` : ''}
        </span>
      </div>

      <div className="space-y-2">
        {sets.map((setNumber) => (
          <SetRow
            key={setNumber}
            routineExerciseId={re.id}
            setNumber={setNumber}
            log={getSet(re.id, setNumber)}
            saving={savingKey === `${re.id}:${setNumber}`}
            onSave={onSave}
            defaultWeight={re.weight ? String(re.weight) : ''}
            defaultReps={re.reps ? String(re.reps) : ''}
          />
        ))}
      </div>
    </li>
  );
};

const SetRow: React.FC<{
  routineExerciseId: string;
  setNumber: number;
  log?: WorkoutSetLog;
  saving: boolean;
  onSave: (
    routineExerciseId: string,
    setNumber: number,
    weight: string,
    reps: string,
  ) => Promise<void>;
  defaultWeight: string;
  defaultReps: string;
}> = ({
  routineExerciseId,
  setNumber,
  log,
  saving,
  onSave,
  defaultWeight,
  defaultReps,
}) => {
  const [weight, setWeight] = useState(
    log?.weight != null ? String(log.weight) : defaultWeight,
  );
  const [reps, setReps] = useState(
    log?.reps != null ? String(log.reps) : defaultReps,
  );
  const done = log?.completedAt != null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[#64748b] text-xs w-12 shrink-0">
        Serie {setNumber}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="kg"
        className={inputClass}
      />
      <span className="text-[#475569] text-xs">×</span>
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        placeholder="reps"
        className={inputClass}
      />
      <button
        onClick={() => void onSave(routineExerciseId, setNumber, weight, reps)}
        disabled={saving}
        aria-label="Guardar serie"
        className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-md transition-colors disabled:opacity-60 ${
          done
            ? 'bg-[#1f9e3f] text-white'
            : 'bg-[#334155] text-[#cbd5e1] hover:bg-[#475569]'
        }`}
      >
        <CheckIcon size={18} />
      </button>
    </div>
  );
};

export default WorkoutView;
