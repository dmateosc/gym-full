import React from 'react';
import type { DayRoutine } from '../types/routine';

interface RoutineDayProps {
  dayRoutine: DayRoutine;
}

const RoutineDay: React.FC<RoutineDayProps> = ({ dayRoutine }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm mr-3">
          {dayRoutine.day.split(' - ')[0]}
        </span>
        {dayRoutine.day.split(' - ')[1]}
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2 font-semibold">Ejercicio</th>
              <th className="text-center py-3 px-2 font-semibold w-20">Series</th>
              <th className="text-center py-3 px-2 font-semibold w-24">Reps</th>
              <th className="text-center py-3 px-2 font-semibold w-24">Descanso</th>
            </tr>
          </thead>
          <tbody>
            {dayRoutine.exercises.map((exercise, index) => (
              <tr 
                key={exercise.id}
                className={`border-b border-gray-700 ${
                  index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-800'
                } hover:bg-gray-700 transition-colors`}
              >
                <td className="py-3 px-2">
                  <span className="font-medium text-gray-100">
                    {exercise.name}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    {exercise.sets}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    {exercise.reps}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <span className="text-gray-400 text-sm">
                    {exercise.rest || '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        <span className="font-semibold">{dayRoutine.exercises.length}</span> ejercicios total
      </div>
    </div>
  );
};

export default RoutineDay;
