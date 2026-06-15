import React, { useEffect, useMemo, useState } from 'react';
import { ApiService } from '../../exercises/services/api';
import type { Exercise } from '../../exercises/types/exercise';
import { RoutineService } from '../services/routineService';
import {
  RoutineIntensity,
  ExerciseType,
  type DailyRoutine,
} from '../types/routine';
import { AlertIcon, SearchIcon } from '../../../assets/icons/index.tsx';

interface DraftExercise {
  exerciseId: string;
  exerciseName: string;
  exerciseType: ExerciseType;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  restSeconds?: number;
  notes?: string;
}

interface RoutineEditorProps {
  initialRoutine?: DailyRoutine;
  onCancel: () => void;
  onCreated?: (routine: DailyRoutine) => void;
  onUpdated?: (routine: DailyRoutine) => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg text-white placeholder-[#64748b] outline-none transition-colors bg-[#334155] border border-[#475569] focus:border-[#1f9e3f] focus:ring-2 focus:ring-[rgba(64,206,66,0.25)] text-sm';

const RoutineEditor: React.FC<RoutineEditorProps> = ({
  initialRoutine,
  onCancel,
  onCreated,
  onUpdated,
}) => {
  const isEdit = !!initialRoutine;
  const [name, setName] = useState(initialRoutine?.name ?? '');
  const [description, setDescription] = useState(
    initialRoutine?.description ?? '',
  );
  const [intensity, setIntensity] = useState<RoutineIntensity>(
    (initialRoutine?.intensity as RoutineIntensity) ?? RoutineIntensity.MODERATE,
  );
  const [estimatedDuration, setEstimatedDuration] = useState<string>(
    initialRoutine?.estimatedDurationMinutes?.toString() ?? '',
  );
  const [visibility, setVisibility] = useState<'private' | 'public'>(
    ((initialRoutine as { visibility?: 'private' | 'public' } | undefined)
      ?.visibility ?? 'private'),
  );
  const [drafts, setDrafts] = useState<DraftExercise[]>(
    (initialRoutine?.routineExercises ?? [])
      .slice()
      .sort((a, b) => a.orderInRoutine - b.orderInRoutine)
      .map((re) => ({
        exerciseId: re.exerciseId,
        exerciseName: re.exercise?.name ?? 'Ejercicio',
        exerciseType: re.exerciseType,
        sets: re.sets,
        reps: re.reps,
        durationSeconds: re.duration,
        distanceMeters: re.distance,
        restSeconds: re.restSeconds,
        notes: re.notes,
      })),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0 && drafts.length > 0 && !saving;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const exercises = drafts.map((d, idx) => ({
        exerciseId: d.exerciseId,
        orderInRoutine: idx + 1,
        exerciseType: d.exerciseType,
        sets: d.sets,
        reps: d.reps,
        durationSeconds: d.durationSeconds,
        distanceMeters: d.distanceMeters,
        restSeconds: d.restSeconds,
        notes: d.notes?.trim() || undefined,
      }));
      if (isEdit && initialRoutine) {
        const updated = await RoutineService.updateMyRoutine(
          initialRoutine.id,
          {
            name: name.trim(),
            description: description.trim() || undefined,
            intensity,
            estimatedDurationMinutes: estimatedDuration
              ? Number(estimatedDuration)
              : undefined,
            visibility,
            exercises,
          },
        );
        onUpdated?.(updated);
      } else {
        const created = await RoutineService.createMyRoutine({
          name: name.trim(),
          description: description.trim() || undefined,
          intensity,
          estimatedDurationMinutes: estimatedDuration
            ? Number(estimatedDuration)
            : undefined,
          exercises,
        });
        onCreated?.(created);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExercise = (ex: Exercise) => {
    setDrafts((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        exerciseType: ExerciseType.SETS_REPS,
        sets: 3,
        reps: 10,
        restSeconds: 60,
      },
    ]);
    setPickerOpen(false);
  };

  const updateDraft = (idx: number, patch: Partial<DraftExercise>) =>
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );

  const removeDraft = (idx: number) =>
    setDrafts((prev) => prev.filter((_, i) => i !== idx));

  const moveDraft = (idx: number, dir: -1 | 1) =>
    setDrafts((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-[#94a3b8] hover:text-white text-sm"
        >
          ← Cancelar
        </button>
        <button
          onClick={() => void handleSave()}
          disabled={!canSave}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1f9e3f] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rutina'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-300 text-sm flex items-start gap-2">
          <span className="mt-0.5"><AlertIcon size={16} /></span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi rutina de pecho"
            className={inputClass}
            maxLength={120}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="(opcional)"
            rows={2}
            className={inputClass}
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
              Intensidad
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as RoutineIntensity)}
              className={inputClass}
            >
              <option value={RoutineIntensity.LOW}>Baja</option>
              <option value={RoutineIntensity.MODERATE}>Moderada</option>
              <option value={RoutineIntensity.HIGH}>Alta</option>
              <option value={RoutineIntensity.VERY_HIGH}>Muy alta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
              Duración estimada (min)
            </label>
            <input
              type="number"
              min={1}
              max={480}
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="60"
              className={inputClass}
            />
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-1.5">
              Visibilidad
            </label>
            <div className="flex gap-2">
              {(['private', 'public'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    visibility === v
                      ? 'bg-[#1f9e3f] text-white'
                      : 'bg-[#334155] text-[#cbd5e1] hover:bg-[#475569]'
                  }`}
                >
                  {v === 'private' ? 'Privada' : 'Pública'}
                </button>
              ))}
            </div>
            <p className="text-[#64748b] text-xs mt-1.5">
              {visibility === 'public'
                ? 'Cualquier miembro podrá ver y clonar esta rutina.'
                : 'Solo tú puedes verla.'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Ejercicios</h3>
          <button
            onClick={() => setPickerOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1f9e3f] hover:opacity-90"
          >
            + Añadir
          </button>
        </div>

        {drafts.length === 0 ? (
          <p className="text-[#94a3b8] text-sm">
            Aún no has añadido ejercicios. Pulsa "Añadir" para empezar.
          </p>
        ) : (
          <ul className="space-y-3">
            {drafts.map((d, idx) => (
              <li
                key={`${d.exerciseId}-${idx}`}
                className="bg-[#172033] border border-[#334155] rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">
                      {idx + 1}. {d.exerciseName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveDraft(idx, -1)}
                      disabled={idx === 0}
                      className="px-2 py-1 text-xs text-[#94a3b8] hover:text-white disabled:opacity-30"
                      aria-label="Subir"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDraft(idx, 1)}
                      disabled={idx === drafts.length - 1}
                      className="px-2 py-1 text-xs text-[#94a3b8] hover:text-white disabled:opacity-30"
                      aria-label="Bajar"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => removeDraft(idx)}
                      className="px-2 py-1 text-xs text-[#fca5a5] hover:bg-[rgba(220,38,38,0.15)] rounded"
                    >
                      Quitar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                      Tipo
                    </label>
                    <select
                      value={d.exerciseType}
                      onChange={(e) =>
                        updateDraft(idx, {
                          exerciseType: e.target.value as ExerciseType,
                        })
                      }
                      className={`${inputClass} py-1.5 text-xs`}
                    >
                      <option value={ExerciseType.SETS_REPS}>Series · reps</option>
                      <option value={ExerciseType.REPS_ONLY}>Solo reps</option>
                      <option value={ExerciseType.TIME_BASED}>Tiempo</option>
                      <option value={ExerciseType.DISTANCE}>Distancia</option>
                    </select>
                  </div>
                  {(d.exerciseType === ExerciseType.SETS_REPS ||
                    d.exerciseType === ExerciseType.REPS_ONLY) && (
                    <>
                      {d.exerciseType === ExerciseType.SETS_REPS && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                            Series
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={d.sets ?? ''}
                            onChange={(e) =>
                              updateDraft(idx, {
                                sets: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className={`${inputClass} py-1.5 text-xs`}
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                          Reps
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={d.reps ?? ''}
                          onChange={(e) =>
                            updateDraft(idx, {
                              reps: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          className={`${inputClass} py-1.5 text-xs`}
                        />
                      </div>
                    </>
                  )}
                  {d.exerciseType === ExerciseType.TIME_BASED && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                        Duración (s)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={d.durationSeconds ?? ''}
                        onChange={(e) =>
                          updateDraft(idx, {
                            durationSeconds: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className={`${inputClass} py-1.5 text-xs`}
                      />
                    </div>
                  )}
                  {d.exerciseType === ExerciseType.DISTANCE && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                        Distancia (m)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={d.distanceMeters ?? ''}
                        onChange={(e) =>
                          updateDraft(idx, {
                            distanceMeters: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className={`${inputClass} py-1.5 text-xs`}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#64748b] mb-1">
                      Descanso (s)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={d.restSeconds ?? ''}
                      onChange={(e) =>
                        updateDraft(idx, {
                          restSeconds: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className={`${inputClass} py-1.5 text-xs`}
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={d.notes ?? ''}
                  onChange={(e) => updateDraft(idx, { notes: e.target.value })}
                  placeholder="Notas (opcional)"
                  className={`${inputClass} py-1.5 text-xs mt-2`}
                  maxLength={300}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {pickerOpen && (
        <ExercisePickerModal
          onClose={() => setPickerOpen(false)}
          onPick={handleAddExercise}
        />
      )}
    </div>
  );
};

interface ExercisePickerModalProps {
  onClose: () => void;
  onPick: (ex: Exercise) => void;
}

const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  onClose,
  onPick,
}) => {
  const [all, setAll] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    ApiService.getExercises()
      .then(setAll)
      .catch((e: Error) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!all) return [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscleGroups.some((m) => m.toLowerCase().includes(q)),
    );
  }, [all, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] flex flex-col bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
        <div className="p-4 border-b border-[#334155] flex items-center gap-2">
          <span className="text-[#94a3b8]"><SearchIcon /></span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ejercicio…"
            className="flex-1 bg-transparent outline-none text-white placeholder-[#64748b] text-sm"
          />
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {error ? (
            <p className="text-red-300 text-sm p-4">{error}</p>
          ) : all === null ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-[#172033] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[#94a3b8] text-sm p-4 text-center">
              Sin resultados.
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => onPick(e)}
                    className="w-full text-left p-3 rounded-lg hover:bg-[#172033] transition-colors"
                  >
                    <p className="text-white text-sm font-medium">{e.name}</p>
                    <p className="text-[#94a3b8] text-xs mt-0.5 line-clamp-1">
                      {e.muscleGroups.join(', ')}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineEditor;
