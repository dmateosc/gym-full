/**
 * Categorías de clases colectivas. Disjuntas de las categorías de
 * ejercicios — aquí hablamos de modalidades de clase grupal típicas
 * de un gimnasio.
 */
export enum ClassCategory {
  CYCLING = 'cycling',
  YOGA = 'yoga',
  PILATES = 'pilates',
  HIIT = 'hiit',
  STRENGTH = 'strength',
  DANCE = 'dance',
  FUNCTIONAL = 'functional',
  CROSSFIT = 'crossfit',
  OTHER = 'other',
}

export const CLASS_CATEGORIES = Object.values(ClassCategory);

export function isClassCategory(value: string): value is ClassCategory {
  return (CLASS_CATEGORIES as string[]).includes(value);
}
