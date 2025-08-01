/**
 * Configuration constants for the application
 * Following DDD principles - centralized configuration
 */

function getApiBaseUrl(): string {
  // Verificar si estamos en un entorno de testing (Jest)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'http://localhost:3001/api';
  }

  // Verificar si window está disponible (entorno del navegador)
  if (typeof window !== 'undefined') {
    // En producción, usar el backend de Vercel
    if (window.location.hostname !== 'localhost') {
      return 'https://backend-48ihtvc0d-dmateoscanos-projects.vercel.app/api';
    }
  }

  // Desarrollo local por defecto
  return 'http://localhost:3001/api';
}

export const APP_CONFIG = {
  API: {
    BASE_URL: getApiBaseUrl(),
    TIMEOUT: 10000,
  },
  UI: {
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 200,
    ITEMS_PER_PAGE: 20,
  },
  ROUTES: {
    EXERCISES: 'exercises',
    ROUTINES: 'routines',
  },
  THEME: {
    GRADIENT_STYLE: 'linear-gradient(to right, #dc2626, #b91c1c, #991b1b)',
    BACKGROUND_STYLE: 'linear-gradient(to bottom right, #000000, #111827, #000000)',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
