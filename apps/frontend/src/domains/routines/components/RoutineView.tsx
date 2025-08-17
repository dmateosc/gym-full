import React, { useState } from 'react';
import type { DailyRoutine } from '../types/routine';
import type { Exercise } from '../../exercises/types/exercise';
import { RoutineService } from '../services/routineService';
import { useAppContext } from '../../shared';
import Modal from '../../shared/components/Modal';
import ExerciseModalContent from './ExerciseModalContent';

interface RoutineViewProps {
  routine: DailyRoutine;
}

const RoutineView: React.FC<RoutineViewProps> = ({ routine }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingExercise, setIsLoadingExercise] = useState(false);
  
  // Usar el contexto para obtener ejercicios del cache
  const { getExerciseFromCache } = useAppContext();
  
  const stats = RoutineService.calculateRoutineStats(routine);
  const formattedDate = RoutineService.formatDate(routine.routineDate);

  const handleExerciseClick = async (exerciseId: string) => {
    setIsLoadingExercise(true);
    try {
      // Usar el cache del contexto global
      const exercise = await getExerciseFromCache(exerciseId);
      setSelectedExercise(exercise);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading exercise details:', error);
      // Aquí podrías mostrar una notificación de error
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
      {/* Header de la rutina */}
      <div className="bg-wellness-gradient rounded-lg p-3 sm:p-4 lg:p-5 mb-4 sm:mb-5 text-white shadow-xl border border-wellness-green-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-3 md:mb-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">{routine.name}</h1>
              <span className="text-wellness-green-200 text-sm sm:text-sm lg:text-base">• {formattedDate}</span>
            </div>
            
            {routine.description && (
              <p className="text-wellness-green-100 text-sm sm:text-sm lg:text-base mb-2 sm:mb-3">{routine.description}</p>
            )}
            
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <span className={`${RoutineService.getIntensityColor(routine.intensity)} bg-wellness-gold-500 bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold border border-wellness-gold-400`}>
                Intensidad: {RoutineService.translateIntensity(routine.intensity)}
              </span>
              
              <span className={`${RoutineService.getStatusColor(routine.status)} bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold border border-white`}>
                {RoutineService.translateStatus(routine.status)}
              </span>
              
              {routine.estimatedDurationMinutes && (
                <span className="bg-wellness-green-500 bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold border border-wellness-green-400">
                  {RoutineService.formatDuration(routine.estimatedDurationMinutes)}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-center sm:text-right mt-3 md:mt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalExercises}</div>
            <div className="text-red-100 text-xs sm:text-sm">ejercicios</div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5">
        <div className="bg-wellness-dark-800 rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-wellness-green-500">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-wellness-green-400 mb-1">
            {stats.totalExercises}
          </div>
          <div className="text-wellness-dark-400 text-xs">Ejercicios</div>
        </div>
        
        <div className="bg-wellness-dark-800 rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-wellness-gold-500">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-wellness-gold-400 mb-1">
            {stats.estimatedDuration}
          </div>
          <div className="text-wellness-dark-400 text-xs">Minutos</div>
        </div>
        
        <div className="bg-wellness-dark-800 rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-wellness-green-400">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-wellness-green-500 mb-1">
            {stats.estimatedCalories}
          </div>
          <div className="text-wellness-dark-400 text-xs">Calorías</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
          <div className="text-base sm:text-lg lg:text-xl font-bold text-yellow-400 mb-1">
            {stats.muscleGroups.length}
          </div>
          <div className="text-gray-400 text-xs">Grupos musculares</div>
        </div>
      </div>

      {/* Grupos musculares trabajados */}
      {stats.muscleGroups.length > 0 && (
        <div className="bg-wellness-dark-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 border border-wellness-green-600">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Grupos musculares trabajados</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {stats.muscleGroups.map((muscle, index) => (
              <span 
                key={index}
                className="bg-wellness-green-gradient text-white px-2 py-1 rounded-full text-xs font-medium border border-wellness-green-400 shadow-sm"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista de ejercicios */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Ejercicios de la rutina</h3>
        
        {routine.routineExercises && routine.routineExercises.length > 0 ? (
          <div className="space-y-3">
            {routine.routineExercises
              .sort((a, b) => a.orderInRoutine - b.orderInRoutine)
              .map((routineExercise) => (
                <div key={routineExercise.id} className="bg-wellness-dark-700 rounded-lg p-2 sm:p-3 border border-wellness-green-600 hover:border-wellness-gold-500 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-wellness-gold-gradient text-white text-xs font-bold px-2 py-1 rounded border border-wellness-gold-400">
                          {routineExercise.orderInRoutine}
                        </span>
                        <button
                          onClick={() => handleExerciseClick(routineExercise.exercise.id)}
                          disabled={isLoadingExercise}
                          className="text-left flex-1 group"
                        >
                          <h4 className="text-sm sm:text-base font-semibold text-white line-clamp-2 group-hover:text-wellness-green-400 transition-colors duration-200 cursor-pointer">
                            {routineExercise.exercise.name}
                            {isLoadingExercise ? (
                              <span className="ml-2 text-xs text-wellness-dark-400">Cargando...</span>
                            ) : (
                              <span className="ml-2 text-xs text-gray-400 group-hover:text-red-300">👁️ Ver detalles</span>
                            )}
                          </h4>
                        </button>
                      </div>
                      
                      {routineExercise.exercise.description && (
                        <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                          {routineExercise.exercise.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="bg-wellness-green-600 text-white px-2 py-1 rounded text-xs border border-wellness-green-500">
                          {routineExercise.exercise.category}
                        </span>
                        <span className="bg-wellness-gold-600 text-white px-2 py-1 rounded text-xs border border-wellness-gold-500">
                          {routineExercise.exercise.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalles del ejercicio en la rutina */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 bg-gray-600 rounded p-2">
                    {routineExercise.sets && (
                      <div className="text-center">
                        <div className="text-sm sm:text-base font-bold text-green-400">{routineExercise.sets}</div>
                        <div className="text-xs text-gray-300">Series</div>
                      </div>
                    )}
                    
                    {routineExercise.reps && (
                      <div className="text-center">
                        <div className="text-sm sm:text-base font-bold text-blue-400">{routineExercise.reps}</div>
                        <div className="text-xs text-gray-300">Repeticiones</div>
                      </div>
                    )}
                    
                    {routineExercise.restSeconds && (
                      <div className="text-center">
                        <div className="text-sm sm:text-base font-bold text-purple-400">{routineExercise.restSeconds}s</div>
                        <div className="text-xs text-gray-300">Descanso</div>
                      </div>
                    )}
                    
                    {routineExercise.duration && (
                      <div className="text-center">
                        <div className="text-sm sm:text-base font-bold text-orange-400">{routineExercise.duration}s</div>
                        <div className="text-xs text-gray-300">Duración</div>
                      </div>
                    )}
                  </div>
                  
                  {routineExercise.notes && (
                    <div className="mt-2 p-2 bg-yellow-900 bg-opacity-30 border-l-4 border-yellow-400">
                      <p className="text-yellow-100 text-xs">
                        <span className="font-semibold">Nota:</span> {routineExercise.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-4 sm:py-6">
            No hay ejercicios asignados a esta rutina
          </div>
        )}
      </div>

      {/* Notas de calentamiento y enfriamiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
        {routine.warmupNotes && (
          <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm sm:text-base font-semibold text-green-400 mb-2 flex items-center gap-2">
              🔥 Calentamiento
            </h4>
            <p className="text-green-100 text-xs sm:text-sm">{routine.warmupNotes}</p>
          </div>
        )}
        
        {routine.cooldownNotes && (
          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm sm:text-base font-semibold text-blue-400 mb-2 flex items-center gap-2">
              ❄️ Enfriamiento
            </h4>
            <p className="text-blue-100 text-xs sm:text-sm">{routine.cooldownNotes}</p>
          </div>
        )}
      </div>

      {/* Footer con nota */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
        <div className="text-center text-gray-400">
          <p className="mb-2 text-sm">
            <span className="text-yellow-400">⚠️</span> Recuerda realizar un calentamiento adecuado antes de comenzar
          </p>
          <p className="text-xs mb-2">
            Consulta con un profesional antes de comenzar cualquier rutina de ejercicios
          </p>
          {routine.createdAt && (
            <p className="text-xs text-gray-500 mt-2">
              Rutina generada el {(() => {
                const date = new Date(routine.createdAt);
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              })()}
            </p>
          )}
        </div>
      </div>

      {/* Modal para mostrar detalles del ejercicio */}
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
