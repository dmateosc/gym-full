import React, { useState } from 'react';
import { RoutineService } from '../services/routineService';
import type { DailyRoutine } from '../types/routine';

interface RoutineDateSelectorProps {
  currentRoutine: DailyRoutine | null;
  onRoutineChange: (routine: DailyRoutine | null) => void;
  onLoadingChange: (loading: boolean) => void;
  onErrorChange: (error: string | null) => void;
}

const RoutineDateSelector: React.FC<RoutineDateSelectorProps> = ({
  currentRoutine,
  onRoutineChange,
  onLoadingChange,
  onErrorChange
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    currentRoutine?.routineDate || new Date().toISOString().split('T')[0]
  );

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    
    try {
      onLoadingChange(true);
      onErrorChange(null);
      
      if (date === new Date().toISOString().split('T')[0]) {
        // Si es hoy, usar el endpoint específico
        const routine = await RoutineService.getTodayRoutine();
        onRoutineChange(routine);
      } else {
        // Para otras fechas, usar el endpoint por fecha
        const routine = await RoutineService.getRoutineByDate(date);
        onRoutineChange(routine);
      }
    } catch (err) {
      console.error('Error loading routine for date:', err);
      onErrorChange('Error loading routine for selected date');
      onRoutineChange(null);
    } finally {
      onLoadingChange(false);
    }
  };

  const getDateOptions = () => {
    const options = [];
    const today = new Date();
    
    // Últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const displayName = i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : RoutineService.getDayName(date);
      
      options.push({
        value: dateString,
        label: displayName,
        fullDate: `${displayName} ${date.getDate()}/${date.getMonth() + 1}`
      });
    }
    
    // Próximos 3 días
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const displayName = i === 1 ? 'Mañana' : RoutineService.getDayName(date);
      
      options.push({
        value: dateString,
        label: displayName,
        fullDate: `${displayName} ${date.getDate()}/${date.getMonth() + 1}`
      });
    }
    
    return options;
  };

  const dateOptions = getDateOptions();

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Seleccionar fecha de rutina</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Elige el día para ver la rutina correspondiente</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label htmlFor="routine-date" className="text-gray-300 text-xs sm:text-sm font-medium">
            Fecha:
          </label>
          <select
            id="routine-date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-w-0 flex-1 sm:flex-none"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.fullDate}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {currentRoutine && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
            <span className="truncate">Mostrando rutina para {RoutineService.formatDate(currentRoutine.routineDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDateSelector;
