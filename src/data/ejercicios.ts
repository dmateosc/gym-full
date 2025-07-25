import type { Ejercicio } from '../types/ejercicio';

export const ejerciciosData: Ejercicio[] = [
  {
    id: '1',
    nombre: 'Flexiones de Pecho',
    descripcion: 'Ejercicio básico de peso corporal para fortalecer pecho, hombros y tríceps',
    categoria: 'fuerza',
    gruposMusculares: ['Pectorales', 'Tríceps', 'Deltoides'],
    dificultad: 'principiante',
    equipamiento: ['Ninguno'],
    instrucciones: [
      'Colócate en posición de plancha con las manos separadas al ancho de los hombros',
      'Mantén el cuerpo recto desde la cabeza hasta los talones',
      'Baja el pecho hacia el suelo doblando los codos',
      'Empuja hacia arriba hasta la posición inicial',
      'Repite el movimiento manteniendo la forma correcta'
    ],
    duracionEstimada: 10,
    calorias: 50
  },
  {
    id: '2',
    nombre: 'Sentadillas',
    descripcion: 'Ejercicio fundamental para fortalecer piernas y glúteos',
    categoria: 'fuerza',
    gruposMusculares: ['Cuádriceps', 'Glúteos', 'Isquiotibiales'],
    dificultad: 'principiante',
    equipamiento: ['Ninguno'],
    instrucciones: [
      'Párate con los pies separados al ancho de los hombros',
      'Baja como si te fueras a sentar en una silla',
      'Mantén el peso en los talones y el pecho erguido',
      'Baja hasta que los muslos estén paralelos al suelo',
      'Empuja con los talones para volver a la posición inicial'
    ],
    duracionEstimada: 8,
    calorias: 40
  },
  {
    id: '3',
    nombre: 'Plancha',
    descripcion: 'Ejercicio isométrico para fortalecer el core',
    categoria: 'fuerza',
    gruposMusculares: ['Abdominales', 'Core', 'Hombros'],
    dificultad: 'principiante',
    equipamiento: ['Ninguno'],
    instrucciones: [
      'Colócate boca abajo apoyando antebrazos y pies',
      'Mantén el cuerpo recto como una tabla',
      'Contrae los abdominales y glúteos',
      'Mantén la posición sin dejar caer las caderas',
      'Respira normalmente durante el ejercicio'
    ],
    duracionEstimada: 5,
    calorias: 25
  },
  {
    id: '4',
    nombre: 'Burpees',
    descripcion: 'Ejercicio de cuerpo completo que combina fuerza y cardio',
    categoria: 'cardio',
    gruposMusculares: ['Cuerpo completo'],
    dificultad: 'intermedio',
    equipamiento: ['Ninguno'],
    instrucciones: [
      'Comienza de pie con los pies separados al ancho de los hombros',
      'Baja a posición de cuclillas y coloca las manos en el suelo',
      'Salta los pies hacia atrás para quedar en posición de plancha',
      'Haz una flexión (opcional)',
      'Salta los pies hacia adelante y salta hacia arriba con los brazos extendidos'
    ],
    duracionEstimada: 15,
    calorias: 100
  },
  {
    id: '5',
    nombre: 'Estiramientos de Yoga',
    descripcion: 'Secuencia de estiramientos para mejorar flexibilidad',
    categoria: 'flexibilidad',
    gruposMusculares: ['Cuerpo completo'],
    dificultad: 'principiante',
    equipamiento: ['Esterilla'],
    instrucciones: [
      'Comienza en posición de montaña (de pie, brazos a los lados)',
      'Inhala y eleva los brazos por encima de la cabeza',
      'Exhala e inclínate hacia adelante desde las caderas',
      'Mantén cada posición durante 30 segundos',
      'Respira profundamente durante cada estiramiento'
    ],
    duracionEstimada: 20,
    calorias: 60
  },
  {
    id: '6',
    nombre: 'Jumping Jacks',
    descripcion: 'Ejercicio cardiovascular clásico de calentamiento',
    categoria: 'cardio',
    gruposMusculares: ['Cuerpo completo'],
    dificultad: 'principiante',
    equipamiento: ['Ninguno'],
    instrucciones: [
      'Comienza de pie con los pies juntos y brazos a los lados',
      'Salta separando los pies mientras elevas los brazos por encima de la cabeza',
      'Salta de nuevo para volver a la posición inicial',
      'Mantén un ritmo constante y controlado',
      'Continúa el movimiento de forma fluida'
    ],
    duracionEstimada: 10,
    calorias: 70
  },
  {
    id: '7',
    nombre: 'Press de Banca',
    descripcion: 'Ejercicio con pesas para desarrollar fuerza en el pecho',
    categoria: 'fuerza',
    gruposMusculares: ['Pectorales', 'Tríceps', 'Deltoides anteriores'],
    dificultad: 'intermedio',
    equipamiento: ['Barra', 'Discos', 'Banco'],
    instrucciones: [
      'Acuéstate en el banco con los pies firmes en el suelo',
      'Agarra la barra con las manos separadas más que el ancho de los hombros',
      'Baja la barra controladamente hasta tocar el pecho',
      'Empuja la barra hacia arriba hasta extender completamente los brazos',
      'Mantén los hombros retraídos durante todo el movimiento'
    ],
    duracionEstimada: 20,
    calorias: 80
  },
  {
    id: '8',
    nombre: 'Peso Muerto',
    descripcion: 'Ejercicio compuesto para toda la cadena posterior',
    categoria: 'fuerza',
    gruposMusculares: ['Isquiotibiales', 'Glúteos', 'Espalda baja', 'Trapecio'],
    dificultad: 'avanzado',
    equipamiento: ['Barra', 'Discos'],
    instrucciones: [
      'Colócate frente a la barra con los pies separados al ancho de las caderas',
      'Agarra la barra con las manos fuera de las piernas',
      'Mantén la espalda recta y el pecho hacia arriba',
      'Levanta la barra extendiendo las caderas y rodillas simultáneamente',
      'Baja la barra controladamente siguiendo el mismo patrón'
    ],
    duracionEstimada: 25,
    calorias: 120
  }
];

export const categorias = [
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
  { value: 'resistencia', label: 'Resistencia' },
  { value: 'equilibrio', label: 'Equilibrio' },
  { value: 'funcional', label: 'Funcional' }
] as const;

export const dificultades = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
] as const;
