import React from 'react';
import type { WorkoutRoutine } from '../types/routine';
import RoutineDay from './RoutineDay';

interface RoutineViewProps {
  routine: WorkoutRoutine;
}

const RoutineView: React.FC<RoutineViewProps> = ({ routine }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'principiante':
        return 'bg-green-600';
      case 'intermedio':
        return 'bg-yellow-600';
      case 'avanzado':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header de la rutina */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">{routine.name}</h1>
            <p className="text-red-100 text-lg mb-4">{routine.description}</p>
            
            <div className="flex flex-wrap gap-3">
              <span className={`${getDifficultyColor(routine.level)} px-3 py-1 rounded-full text-sm font-semibold`}>
                {routine.level.charAt(0).toUpperCase() + routine.level.slice(1)}
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                {routine.duration}
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                {routine.daysPerWeek} días/semana
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold">{routine.days.length}</div>
            <div className="text-red-100">días de entrenamiento</div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {routine.days.reduce((total, day) => total + day.exercises.length, 0)}
          </div>
          <div className="text-gray-400">Ejercicios totales</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {Math.round(routine.days.reduce((total, day) => total + day.exercises.reduce((dayTotal, ex) => dayTotal + ex.sets, 0), 0) / routine.days.length)}
          </div>
          <div className="text-gray-400">Series promedio/día</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {routine.daysPerWeek}
          </div>
          <div className="text-gray-400">Días por semana</div>
        </div>
      </div>

      {/* Lista de días de entrenamiento */}
      <div className="space-y-6">
        {routine.days.map((dayRoutine, index) => (
          <RoutineDay key={index} dayRoutine={dayRoutine} />
        ))}
      </div>

      {/* Footer con nota */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <p className="mb-2">
            <span className="text-yellow-400">⚠️</span> Recuerda realizar un calentamiento adecuado antes de comenzar
          </p>
          <p className="text-sm">
            Consulta con un profesional antes de comenzar cualquier rutina de ejercicios
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoutineView;
