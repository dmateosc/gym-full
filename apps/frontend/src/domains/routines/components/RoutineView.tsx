import React, { useState } from 'react';
import type { DailyRoutine } from '../types/routine';
import type { Exercise } from '../../exercises/types/exercise';
import { RoutineService } from '../services/routineService';
import { useAppContext } from '../../shared';
import Modal from '../../shared/components/Modal';
import ExerciseModalContent from './ExerciseModalContent';
import { FlameIcon, SnowflakeIcon, AlertIcon } from '../../../assets/icons/index.tsx';

interface RoutineViewProps {
  routine: DailyRoutine;
}

const CATEGORY_TINTS: Record<string, { solid: string; text: string }> = {
  strength:    { solid: '#dc2626', text: '#f87171' },
  cardio:      { solid: '#ea580c', text: '#fb923c' },
  flexibility: { solid: '#16a34a', text: '#4ade80' },
  endurance:   { solid: '#2563eb', text: '#60a5fa' },
  balance:     { solid: '#9333ea', text: '#c084fc' },
  functional:  { solid: '#ca8a04', text: '#facc15' },
};

const DIFFICULTY_TINTS: Record<string, { solid: string; text: string }> = {
  beginner:     { solid: '#22c55e', text: '#4ade80' },
  intermediate: { solid: '#eab308', text: '#facc15' },
  advanced:     { solid: '#ef4444', text: '#fca5a5' },
};

const DEFAULT_TINT = { solid: '#64748b', text: '#cbd5e1' };

const FlatTag = ({ tint, children }: { tint: { solid: string; text: string }; children: React.ReactNode }) => (
  <span
    className="px-2 py-1 rounded-full text-xs font-semibold"
    style={{ background: `${tint.solid}22`, border: `1px solid ${tint.solid}55`, color: tint.text }}
  >
    {children}
  </span>
);

const RoutineView: React.FC<RoutineViewProps> = ({ routine }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingExercise, setIsLoadingExercise] = useState(false);

  const { getExerciseFromCache } = useAppContext();

  const stats = RoutineService.calculateRoutineStats(routine);
  const formattedDate = RoutineService.formatDate(routine.routineDate);

  const handleExerciseClick = async (exerciseId: string) => {
    setIsLoadingExercise(true);
    try {
      const exercise = await getExerciseFromCache(exerciseId);
      setSelectedExercise(exercise);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading exercise details:', error);
    } finally {
      setIsLoadingExercise(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-3 lg:p-4">
      {/* Header de la rutina — bloque rojo plano */}
      <div className="bg-[#e50914] rounded-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">{routine.name}</h1>
              <span className="text-[#fecaca] text-sm lg:text-base">• {formattedDate}</span>
            </div>

            {routine.description && (
              <p className="text-[#fecaca] text-sm lg:text-base mb-3">{routine.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Intensidad: {RoutineService.translateIntensity(routine.intensity)}
              </span>

              <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {RoutineService.translateStatus(routine.status)}
              </span>

              {routine.estimatedDurationMinutes && (
                <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {RoutineService.formatDuration(routine.estimatedDurationMinutes)}
                </span>
              )}
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.totalExercises}</div>
            <div className="text-[#fecaca] text-xs sm:text-sm">ejercicios</div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5">
        {[
          { value: stats.totalExercises, label: 'Ejercicios', color: '#4ade80' },
          { value: stats.estimatedDuration, label: 'Minutos', color: '#60a5fa' },
          { value: stats.estimatedCalories, label: 'Calorías', color: '#fb923c' },
          { value: stats.muscleGroups.length, label: 'Grupos musculares', color: '#facc15' },
        ].map(({ value, label, color }) => (
          <div key={label} className="bg-[#1e293b] rounded-xl p-3 lg:p-4 text-center border border-[#334155]">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1" style={{ color }}>
              {value}
            </div>
            <div className="text-[#94a3b8] text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Grupos musculares trabajados */}
      {stats.muscleGroups.length > 0 && (
        <div className="bg-[#1e293b] rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border border-[#334155]">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Grupos musculares trabajados</h3>
          <div className="flex flex-wrap gap-2">
            {stats.muscleGroups.map((muscle, index) => (
              <FlatTag key={index} tint={{ solid: '#dc2626', text: '#f87171' }}>{muscle}</FlatTag>
            ))}
          </div>
        </div>
      )}

      {/* Lista de ejercicios */}
      <div className="bg-[#1e293b] rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border border-[#334155]">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Ejercicios de la rutina</h3>

        {routine.routineExercises && routine.routineExercises.length > 0 ? (
          <div className="space-y-3">
            {routine.routineExercises
              .sort((a, b) => a.orderInRoutine - b.orderInRoutine)
              .map((routineExercise) => {
                const cat = CATEGORY_TINTS[routineExercise.exercise.category] || DEFAULT_TINT;
                const diff = DIFFICULTY_TINTS[routineExercise.exercise.difficulty] || DEFAULT_TINT;
                return (
                  <div
                    key={routineExercise.id}
                    className="bg-[#172033] rounded-lg p-3 border border-[#334155] hover:border-[rgba(229,9,20,0.6)] transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#f59e0b] text-[#0f172a] text-xs font-bold px-2 py-1 rounded">
                            {routineExercise.orderInRoutine}
                          </span>
                          <button
                            onClick={() => handleExerciseClick(routineExercise.exercise.id)}
                            disabled={isLoadingExercise}
                            className="text-left flex-1 group"
                          >
                            <h4 className="text-sm sm:text-base font-semibold text-white line-clamp-2 group-hover:text-[#fca5a5] transition-colors duration-200 cursor-pointer">
                              {routineExercise.exercise.name}
                              {isLoadingExercise ? (
                                <span className="ml-2 text-xs text-[#94a3b8]">Cargando...</span>
                              ) : (
                                <span className="ml-2 text-xs text-[#94a3b8] group-hover:text-[#fca5a5]">Ver detalles</span>
                              )}
                            </h4>
                          </button>
                        </div>

                        {routineExercise.exercise.description && (
                          <p className="text-[#cbd5e1] text-xs mb-2 line-clamp-2">
                            {routineExercise.exercise.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-2">
                          <FlatTag tint={cat}>{routineExercise.exercise.category}</FlatTag>
                          <FlatTag tint={diff}>{routineExercise.exercise.difficulty}</FlatTag>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 bg-[#0f172a] rounded-lg p-2 border border-[#334155]">
                      {routineExercise.sets && (
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-[#4ade80]">{routineExercise.sets}</div>
                          <div className="text-xs text-[#94a3b8]">Series</div>
                        </div>
                      )}

                      {routineExercise.reps && (
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-[#60a5fa]">{routineExercise.reps}</div>
                          <div className="text-xs text-[#94a3b8]">Repeticiones</div>
                        </div>
                      )}

                      {routineExercise.restSeconds && (
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-[#c084fc]">{routineExercise.restSeconds}s</div>
                          <div className="text-xs text-[#94a3b8]">Descanso</div>
                        </div>
                      )}

                      {routineExercise.duration && (
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-[#fb923c]">{routineExercise.duration}s</div>
                          <div className="text-xs text-[#94a3b8]">Duración</div>
                        </div>
                      )}
                    </div>

                    {routineExercise.notes && (
                      <div className="mt-2 p-2 rounded border-l-2 border-[#eab308]" style={{ background: '#eab30815' }}>
                        <p className="text-[#facc15] text-xs">
                          <span className="font-semibold">Nota:</span> {routineExercise.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-[#94a3b8] text-center py-6">
            No hay ejercicios asignados a esta rutina
          </div>
        )}
      </div>

      {/* Notas de calentamiento y enfriamiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
        {routine.warmupNotes && (
          <div className="rounded-xl p-4 border" style={{ background: '#16a34a15', borderColor: '#16a34a55' }}>
            <h4 className="text-sm sm:text-base font-semibold text-[#4ade80] mb-2 flex items-center gap-2">
              <FlameIcon size={18} /> Calentamiento
            </h4>
            <p className="text-[#cbd5e1] text-xs sm:text-sm">{routine.warmupNotes}</p>
          </div>
        )}

        {routine.cooldownNotes && (
          <div className="rounded-xl p-4 border" style={{ background: '#2563eb15', borderColor: '#2563eb55' }}>
            <h4 className="text-sm sm:text-base font-semibold text-[#60a5fa] mb-2 flex items-center gap-2">
              <SnowflakeIcon size={18} /> Enfriamiento
            </h4>
            <p className="text-[#cbd5e1] text-xs sm:text-sm">{routine.cooldownNotes}</p>
          </div>
        )}
      </div>

      {/* Footer con nota */}
      <div className="bg-[#1e293b] rounded-xl p-4 border border-[#334155]">
        <div className="text-center text-[#94a3b8]">
          <p className="mb-2 text-sm flex items-center justify-center gap-2">
            <span className="text-[#eab308]"><AlertIcon size={16} /></span>
            Recuerda realizar un calentamiento adecuado antes de comenzar
          </p>
          <p className="text-xs mb-2">
            Consulta con un profesional antes de comenzar cualquier rutina de ejercicios
          </p>
          {routine.createdAt && (
            <p className="text-xs text-[#64748b] mt-2">
              Rutina generada el {(() => {
                const date = new Date(routine.createdAt);
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              })()}
            </p>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedExercise && (
          <ExerciseModalContent
            exercise={selectedExercise}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default RoutineView;
