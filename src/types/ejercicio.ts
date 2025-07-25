export interface Ejercicio {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaEjercicio;
  gruposMusculares: string[];
  dificultad: Dificultad;
  equipamiento: string[];
  instrucciones: string[];
  imagen?: string;
  duracionEstimada?: number; // en minutos
  calorias?: number; // calorías estimadas quemadas
}

export type CategoriaEjercicio = 
  | 'fuerza' 
  | 'cardio' 
  | 'flexibilidad' 
  | 'resistencia' 
  | 'equilibrio' 
  | 'funcional';

export type Dificultad = 'principiante' | 'intermedio' | 'avanzado';

export interface FiltrosEjercicio {
  categoria?: CategoriaEjercicio;
  dificultad?: Dificultad;
  grupoMuscular?: string;
  busqueda?: string;
}
