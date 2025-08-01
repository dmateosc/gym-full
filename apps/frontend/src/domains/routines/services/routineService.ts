import type { WorkoutRoutine } from '../types/routine';

// Rutina de ejemplo - más adelante esto vendrá de una API
export const sampleRoutine: WorkoutRoutine = {
  id: '1',
  name: 'Rutina Push/Pull/Legs',
  description: 'Rutina de fuerza enfocada en desarrollo muscular completo',
  duration: '8 semanas',
  level: 'intermedio',
  daysPerWeek: 6,
  days: [
    {
      day: 'Día 1 - Push (Pecho, Hombros, Tríceps)',
      exercises: [
        {
          id: '1',
          name: 'Press de banca',
          sets: 4,
          reps: '8-10',
          rest: '2-3 min'
        },
        {
          id: '2',
          name: 'Press inclinado con mancuernas',
          sets: 3,
          reps: '10-12',
          rest: '90 seg'
        },
        {
          id: '3',
          name: 'Press militar',
          sets: 4,
          reps: '8-10',
          rest: '2 min'
        },
        {
          id: '4',
          name: 'Elevaciones laterales',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        },
        {
          id: '5',
          name: 'Fondos en paralelas',
          sets: 3,
          reps: '10-12',
          rest: '90 seg'
        },
        {
          id: '6',
          name: 'Extensión de tríceps con mancuerna',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        }
      ]
    },
    {
      day: 'Día 2 - Pull (Espalda, Bíceps)',
      exercises: [
        {
          id: '7',
          name: 'Dominadas',
          sets: 4,
          reps: '6-10',
          rest: '2-3 min'
        },
        {
          id: '8',
          name: 'Remo con barra',
          sets: 4,
          reps: '8-10',
          rest: '2 min'
        },
        {
          id: '9',
          name: 'Remo con mancuerna',
          sets: 3,
          reps: '10-12',
          rest: '90 seg'
        },
        {
          id: '10',
          name: 'Jalones al pecho',
          sets: 3,
          reps: '10-12',
          rest: '90 seg'
        },
        {
          id: '11',
          name: 'Curl de bíceps con barra',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        },
        {
          id: '12',
          name: 'Curl martillo',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        }
      ]
    },
    {
      day: 'Día 3 - Legs (Piernas, Glúteos)',
      exercises: [
        {
          id: '13',
          name: 'Sentadillas',
          sets: 4,
          reps: '8-10',
          rest: '3 min'
        },
        {
          id: '14',
          name: 'Peso muerto rumano',
          sets: 4,
          reps: '8-10',
          rest: '2-3 min'
        },
        {
          id: '15',
          name: 'Prensa de piernas',
          sets: 3,
          reps: '12-15',
          rest: '2 min'
        },
        {
          id: '16',
          name: 'Zancadas con mancuernas',
          sets: 3,
          reps: '10-12 c/u',
          rest: '90 seg'
        },
        {
          id: '17',
          name: 'Curl femoral',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        },
        {
          id: '18',
          name: 'Elevación de talones',
          sets: 4,
          reps: '15-20',
          rest: '60 seg'
        }
      ]
    },
    {
      day: 'Día 4 - Push (Pecho, Hombros, Tríceps)',
      exercises: [
        {
          id: '19',
          name: 'Press inclinado con barra',
          sets: 4,
          reps: '8-10',
          rest: '2-3 min'
        },
        {
          id: '20',
          name: 'Aperturas con mancuernas',
          sets: 3,
          reps: '12-15',
          rest: '90 seg'
        },
        {
          id: '21',
          name: 'Press con mancuernas sentado',
          sets: 4,
          reps: '10-12',
          rest: '2 min'
        },
        {
          id: '22',
          name: 'Elevaciones posteriores',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        },
        {
          id: '23',
          name: 'Press francés',
          sets: 3,
          reps: '10-12',
          rest: '90 seg'
        },
        {
          id: '24',
          name: 'Patadas de tríceps',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        }
      ]
    },
    {
      day: 'Día 5 - Pull (Espalda, Bíceps)',
      exercises: [
        {
          id: '25',
          name: 'Peso muerto',
          sets: 4,
          reps: '6-8',
          rest: '3 min'
        },
        {
          id: '26',
          name: 'Remo en polea baja',
          sets: 4,
          reps: '10-12',
          rest: '2 min'
        },
        {
          id: '27',
          name: 'Pullover con mancuerna',
          sets: 3,
          reps: '12-15',
          rest: '90 seg'
        },
        {
          id: '28',
          name: 'Remo al cuello',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        },
        {
          id: '29',
          name: 'Curl con mancuernas alterno',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        },
        {
          id: '30',
          name: 'Curl en polea alta',
          sets: 3,
          reps: '12-15',
          rest: '60 seg'
        }
      ]
    },
    {
      day: 'Día 6 - Legs (Piernas, Glúteos)',
      exercises: [
        {
          id: '31',
          name: 'Sentadilla frontal',
          sets: 4,
          reps: '8-10',
          rest: '3 min'
        },
        {
          id: '32',
          name: 'Hip thrust',
          sets: 4,
          reps: '12-15',
          rest: '2 min'
        },
        {
          id: '33',
          name: 'Extensión de cuádriceps',
          sets: 3,
          reps: '12-15',
          rest: '90 seg'
        },
        {
          id: '34',
          name: 'Peso muerto sumo',
          sets: 3,
          reps: '10-12',
          rest: '2 min'
        },
        {
          id: '35',
          name: 'Abducción de cadera',
          sets: 3,
          reps: '15-20',
          rest: '60 seg'
        },
        {
          id: '36',
          name: 'Gemelos en prensa',
          sets: 4,
          reps: '20-25',
          rest: '60 seg'
        }
      ]
    }
  ]
};

/**
 * Routine Service - Domain Service para manejo de rutinas
 * Siguiendo principios DDD
 */
export class RoutineService {
  /**
   * Obtiene una rutina por ID
   * En el futuro se conectará a una API
   */
  static async getRoutineById(id: string): Promise<WorkoutRoutine | null> {
    // Por ahora retornamos la rutina de ejemplo
    if (id === '1') {
      return sampleRoutine;
    }
    return null;
  }

  /**
   * Obtiene todas las rutinas disponibles
   */
  static async getAllRoutines(): Promise<WorkoutRoutine[]> {
    // Por ahora retornamos un array con la rutina de ejemplo
    return [sampleRoutine];
  }

  /**
   * Calcula estadísticas de una rutina
   */
  static calculateRoutineStats(routine: WorkoutRoutine) {
    const totalExercises = routine.days.reduce((total, day) => total + day.exercises.length, 0);
    const averageSetsPerDay = Math.round(
      routine.days.reduce((total, day) => 
        total + day.exercises.reduce((dayTotal, ex) => dayTotal + ex.sets, 0), 0
      ) / routine.days.length
    );

    return {
      totalExercises,
      averageSetsPerDay,
      totalDays: routine.days.length,
      daysPerWeek: routine.daysPerWeek
    };
  }

  /**
   * Valida si una rutina es válida
   */
  static validateRoutine(routine: WorkoutRoutine): boolean {
    return (
      !!routine.id &&
      !!routine.name &&
      routine.days.length > 0 &&
      routine.days.every(day => day.exercises.length > 0)
    );
  }
}
