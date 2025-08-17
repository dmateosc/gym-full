import type { DailyRoutine, RoutineStats } from '../types/routine';
import { APP_CONFIG } from '../../shared/config/app.config';

// 🚨 CRITICAL: Use centralized configuration to avoid hardcoded URLs
const API_BASE_URL = APP_CONFIG.API.BASE_URL;

/**
 * Servicio para el manejo de rutinas - Conectado con backend NestJS
 */
export class RoutineService {
  /**
   * Obtener la rutina de hoy
   */
  static async getTodayRoutine(): Promise<DailyRoutine | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/routines/daily/today`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No hay rutina para hoy
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verificar si la respuesta tiene contenido
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || contentLength === null) {
        console.log('No hay rutina programada para hoy');
        return null;
      }
      
      const data = await response.json();
      
      // Verificar que la respuesta tiene formato válido
      if (!data || typeof data !== 'object') {
        console.warn('Respuesta inesperada del servidor para rutina de hoy:', data);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching today routine:', error);
      
      // Si es un error de red, no lanzar error sino retornar null
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Error de conexión, no hay rutina de hoy disponible');
        return null;
      }
      
      // Si es un error de parsing JSON (respuesta vacía), retornar null
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.log('Respuesta vacía del servidor, no hay rutina para hoy');
        return null;
      }
      
      throw new Error('Error al obtener la rutina de hoy');
    }
  }

  /**
   * Obtener rutina por fecha específica
   */
  static async getRoutineByDate(date: string): Promise<DailyRoutine | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/routines/daily/by-date/${date}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verificar si la respuesta tiene contenido
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || contentLength === null) {
        console.log(`No hay rutina programada para ${date}`);
        return null;
      }
      
      const data = await response.json();
      
      // Verificar que la respuesta tiene formato válido
      if (!data || typeof data !== 'object') {
        console.warn('Respuesta inesperada del servidor para rutina por fecha:', data);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching routine by date:', error);
      
      // Si es un error de red, no lanzar error sino retornar null
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn(`Error de conexión, no hay rutina disponible para ${date}`);
        return null;
      }
      
      // Si es un error de parsing JSON (respuesta vacía), retornar null
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.log(`Respuesta vacía del servidor, no hay rutina para ${date}`);
        return null;
      }
      
      throw new Error(`Error al obtener la rutina para ${date}`);
    }
  }

  /**
   * Obtener todas las rutinas
   */
  static async getAllRoutines(): Promise<DailyRoutine[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/routines/daily`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return []; // Retorna array vacío si no hay rutinas
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verificar que data es un array, si no, retornar array vacío
      if (!Array.isArray(data)) {
        console.warn('Respuesta inesperada del servidor:', data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching all routines:', error);
      
      // Si es un error de red o de respuesta, retornar array vacío en lugar de lanzar error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Error de conexión, retornando array vacío');
        return [];
      }
      
      throw new Error('Error al obtener las rutinas');
    }
  }

  /**
   * Obtener rutina por ID
   */
  static async getRoutineById(id: string): Promise<DailyRoutine | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/routines/daily/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching routine by ID:', error);
      throw new Error(`Error al obtener la rutina ${id}`);
    }
  }

  /**
   * Calcular estadísticas de una rutina
   */
  static calculateRoutineStats(routine: DailyRoutine): RoutineStats {
    const exercises = routine.routineExercises || [];
    
    // Extraer grupos musculares únicos
    const muscleGroups = new Set<string>();
    exercises.forEach(exercise => {
      // Usar muscleGroups que es la estructura real del backend
      if (exercise.exercise.muscleGroups && Array.isArray(exercise.exercise.muscleGroups)) {
        exercise.exercise.muscleGroups.forEach((group: string) => muscleGroups.add(group));
      }
    });

    return {
      totalExercises: exercises.length,
      estimatedDuration: routine.estimatedDurationMinutes || 60,
      estimatedCalories: routine.estimatedCalories || 300,
      muscleGroups: Array.from(muscleGroups),
    };
  }

  /**
   * Formatear duración en minutos a texto legible
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }

  /**
   * Obtener el nombre del día en español
   */
  static getDayName(date: Date): string {
    const days = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 
      'Jueves', 'Viernes', 'Sábado'
    ];
    return days[date.getDay()];
  }

  /**
   * Formatear fecha para mostrar
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Comparar solo las fechas (sin hora)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoy';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Mañana';
    } else {
      // Usar barras en lugar de puntos para las fechas
      return `${this.getDayName(date)} ${date.getDate()}/${date.getMonth() + 1}`;
    }
  }

  /**
   * Obtener el color de intensidad
   */
  static getIntensityColor(intensity: string): string {
    switch (intensity) {
      case 'low': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'very_high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  /**
   * Obtener el color de estado
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case 'planned': return 'text-blue-400';
      case 'in_progress': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'skipped': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  }

  /**
   * Traducir textos de intensidad
   */
  static translateIntensity(intensity: string): string {
    switch (intensity) {
      case 'low': return 'Baja';
      case 'moderate': return 'Moderada';
      case 'high': return 'Alta';
      case 'very_high': return 'Muy Alta';
      default: return intensity;
    }
  }

  /**
   * Traducir textos de estado
   */
  static translateStatus(status: string): string {
    switch (status) {
      case 'planned': return 'Planificada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'skipped': return 'Omitida';
      default: return status;
    }
  }
}
