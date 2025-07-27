import type { Exercise } from '../types/exercise';

export const exercisesData: Exercise[] = [
  {
    id: '1',
    name: 'Flexiones de Pecho',
    description: 'Ejercicio básico de peso corporal para fortalecer pecho, hombros y tríceps',
    category: 'strength',
    muscleGroups: ['Pectorales', 'Tríceps', 'Deltoides'],
    difficulty: 'beginner',
    equipment: ['Ninguno'],
    instructions: [
      'Colócate en posición de plancha con las manos separadas al ancho de los hombros',
      'Mantén el cuerpo recto desde la cabeza hasta los talones',
      'Baja el pecho hacia el suelo doblando los codos',
      'Empuja hacia arriba hasta la posición inicial',
      'Repite el movimiento manteniendo la forma correcta'
    ],
    estimatedDuration: 10,
    calories: 50
  },
  {
    id: '2',
    name: 'Sentadillas',
    description: 'Ejercicio fundamental para fortalecer piernas y glúteos',
    category: 'strength',
    muscleGroups: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'],
    difficulty: 'beginner',
    equipment: ['Ninguno'],
    instructions: [
      'Párate con los pies separados al ancho de los hombros',
      'Baja como si te fueras a sentar en una silla',
      'Mantén el peso en los talones y el pecho erguido',
      'Baja hasta que los muslos estén paralelos al suelo',
      'Empuja con los talones para volver a la posición inicial'
    ],
    estimatedDuration: 8,
    calories: 40
  },
  {
    id: '3',
    name: 'Plancha',
    description: 'Ejercicio isométrico para fortalecer el core',
    category: 'strength',
    muscleGroups: ['Abdominales', 'Core', 'Hombros'],
    difficulty: 'beginner',
    equipment: ['Ninguno'],
    instructions: [
      'Colócate boca abajo apoyando antebrazos y pies',
      'Mantén el cuerpo recto como una tabla',
      'Contrae los abdominales y glúteos',
      'Mantén la posición sin dejar caer las caderas',
      'Respira normalmente durante el ejercicio'
    ],
    estimatedDuration: 5,
    calories: 25
  },
  {
    id: '4',
    name: 'Burpees',
    description: 'Ejercicio de cuerpo completo que combina fuerza y cardio',
    category: 'cardio',
    muscleGroups: ['Cuerpo completo'],
    difficulty: 'intermediate',
    equipment: ['Ninguno'],
    instructions: [
      'Comienza de pie con los pies separados al ancho de los hombros',
      'Baja a posición de cuclillas y coloca las manos en el suelo',
      'Salta los pies hacia atrás para quedar en posición de plancha',
      'Haz una flexión (opcional)',
      'Salta los pies hacia adelante y salta hacia arriba con los brazos extendidos'
    ],
    estimatedDuration: 15,
    calories: 100
  },
  {
    id: '5',
    name: 'Estiramientos de Yoga',
    description: 'Secuencia de estiramientos para mejorar flexibilidad',
    category: 'flexibility',
    muscleGroups: ['Cuerpo completo'],
    difficulty: 'beginner',
    equipment: ['Esterilla'],
    instructions: [
      'Comienza en posición de montaña (de pie, brazos a los lados)',
      'Inhala y eleva los brazos por encima de la cabeza',
      'Exhala e inclínate hacia adelante desde las caderas',
      'Mantén cada posición durante 30 segundos',
      'Respira profundamente durante cada estiramiento'
    ],
    estimatedDuration: 20,
    calories: 60
  },
  {
    id: '6',
    name: 'Jumping Jacks',
    description: 'Ejercicio cardiovascular clásico de calentamiento',
    category: 'cardio',
    muscleGroups: ['Cuerpo completo'],
    difficulty: 'beginner',
    equipment: ['Ninguno'],
    instructions: [
      'Comienza de pie con los pies juntos y brazos a los lados',
      'Salta separando los pies mientras elevas los brazos por encima de la cabeza',
      'Salta de nuevo para volver a la posición inicial',
      'Mantén un ritmo constante y controlado',
      'Continúa el movimiento de forma fluida'
    ],
    estimatedDuration: 10,
    calories: 70
  },
  {
    id: '7',
    name: 'Press de Banca',
    description: 'Ejercicio con pesas para desarrollar fuerza en el pecho',
    category: 'strength',
    muscleGroups: ['Pectorales', 'Tríceps', 'Deltoides anteriores'],
    difficulty: 'intermediate',
    equipment: ['Barra', 'Discos', 'Banco'],
    instructions: [
      'Acuéstate en el banco con los pies firmes en el suelo',
      'Agarra la barra con las manos separadas más que el ancho de los hombros',
      'Baja la barra controladamente hasta tocar el pecho',
      'Empuja la barra hacia arriba hasta extender completamente los brazos',
      'Mantén los hombros retraídos durante todo el movimiento'
    ],
    estimatedDuration: 20,
    calories: 80
  },
  {
    id: '8',
    name: 'Peso Muerto',
    description: 'Ejercicio compuesto para toda la cadena posterior',
    category: 'strength',
    muscleGroups: ['Isquiotibiales', 'Glúteos', 'Espalda baja', 'Trapecio'],
    difficulty: 'advanced',
    equipment: ['Barra', 'Discos'],
    instructions: [
      'Colócate frente a la barra con los pies separados al ancho de las caderas',
      'Agarra la barra con las manos fuera de las piernas',
      'Mantén la espalda recta y el pecho hacia arriba',
      'Levanta la barra extendiendo las caderas y rodillas simultáneamente',
      'Baja la barra controladamente siguiendo el mismo patrón'
    ],
    estimatedDuration: 25,
    calories: 120
  }
];

export const categories = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'balance', label: 'Equilibrio' },
  { value: 'functional', label: 'Funcional' }
] as const;

export const difficulties = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' }
] as const;
