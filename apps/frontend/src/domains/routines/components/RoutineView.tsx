import React from 'react';
import type { DailyRoutine } from '../types/routine';
import { RoutineService } from '../services/routineService';

interface RoutineViewProps {
  routine: DailyRoutine;
}

const RoutineView: React.FC<RoutineViewProps> = ({ routine }) => {
  const stats = RoutineService.calculateRoutineStats(routine);
  const formattedDate = RoutineService.formatDate(routine.routineDate);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header de la rutina */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{routine.name}</h1>
              <span className="text-red-200 text-lg">• {formattedDate}</span>
            </div>
            
            {routine.description && (
              <p className="text-red-100 text-lg mb-4">{routine.description}</p>
            )}
            
            <div className="flex flex-wrap gap-3">
              <span className={`${RoutineService.getIntensityColor(routine.intensity)} bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold`}>
                Intensidad: {RoutineService.translateIntensity(routine.intensity)}
              </span>
              
              <span className={`${RoutineService.getStatusColor(routine.status)} bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold`}>
                {RoutineService.translateStatus(routine.status)}
              </span>
              
              {routine.estimatedDurationMinutes && (
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                  {RoutineService.formatDuration(routine.estimatedDurationMinutes)}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold">{stats.totalExercises}</div>
            <div className="text-red-100">ejercicios</div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {stats.totalExercises}
          </div>
          <div className="text-gray-400">Ejercicios</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {stats.estimatedDuration}
          </div>
          <div className="text-gray-400">Minutos</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {stats.estimatedCalories}
          </div>
          <div className="text-gray-400">Calorías</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-2">
            {stats.muscleGroups.length}
          </div>
          <div className="text-gray-400">Grupos musculares</div>
        </div>
      </div>

      {/* Grupos musculares trabajados */}
      {stats.muscleGroups.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Grupos musculares trabajados</h3>
          <div className="flex flex-wrap gap-2">
            {stats.muscleGroups.map((muscle, index) => (
              <span 
                key={index}
                className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista de ejercicios */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6">Ejercicios de la rutina</h3>
        
        {routine.routineExercises && routine.routineExercises.length > 0 ? (
          <div className="space-y-4">
            {routine.routineExercises
              .sort((a, b) => a.orderInRoutine - b.orderInRoutine)
              .map((routineExercise) => (
                <div key={routineExercise.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
                          {routineExercise.orderInRoutine}
                        </span>
                        <h4 className="text-lg font-semibold text-white">
                          {routineExercise.exercise.name}
                        </h4>
                      </div>
                      
                      {routineExercise.exercise.description && (
                        <p className="text-gray-300 text-sm mb-2">
                          {routineExercise.exercise.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          {routineExercise.exercise.category}
                        </span>
                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                          {routineExercise.exercise.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalles del ejercicio en la rutina */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-600 rounded p-3">
                    {routineExercise.sets && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{routineExercise.sets}</div>
                        <div className="text-xs text-gray-300">Series</div>
                      </div>
                    )}
                    
                    {routineExercise.reps && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{routineExercise.reps}</div>
                        <div className="text-xs text-gray-300">Repeticiones</div>
                      </div>
                    )}
                    
                    {routineExercise.weight && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{routineExercise.weight}kg</div>
                        <div className="text-xs text-gray-300">Peso</div>
                      </div>
                    )}
                    
                    {routineExercise.restSeconds && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{routineExercise.restSeconds}s</div>
                        <div className="text-xs text-gray-300">Descanso</div>
                      </div>
                    )}
                    
                    {routineExercise.duration && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">{routineExercise.duration}s</div>
                        <div className="text-xs text-gray-300">Duración</div>
                      </div>
                    )}
                  </div>
                  
                  {routineExercise.notes && (
                    <div className="mt-3 p-3 bg-yellow-900 bg-opacity-30 border-l-4 border-yellow-400">
                      <p className="text-yellow-100 text-sm">
                        <span className="font-semibold">Nota:</span> {routineExercise.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            No hay ejercicios asignados a esta rutina
          </div>
        )}
      </div>

      {/* Notas de calentamiento y enfriamiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {routine.warmupNotes && (
          <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
              🔥 Calentamiento
            </h4>
            <p className="text-green-100">{routine.warmupNotes}</p>
          </div>
        )}
        
        {routine.cooldownNotes && (
          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
              ❄️ Enfriamiento
            </h4>
            <p className="text-blue-100">{routine.cooldownNotes}</p>
          </div>
        )}
      </div>

      {/* Footer con nota */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <p className="mb-2">
            <span className="text-yellow-400">⚠️</span> Recuerda realizar un calentamiento adecuado antes de comenzar
          </p>
          <p className="text-sm mb-2">
            Consulta con un profesional antes de comenzar cualquier rutina de ejercicios
          </p>
          {routine.createdAt && (
            <p className="text-xs text-gray-500 mt-3">
              Rutina generada el {new Date(routine.createdAt).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineView;
