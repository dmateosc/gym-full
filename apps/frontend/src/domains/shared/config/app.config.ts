/**
 * Configuration constants for the application
 * Following DDD principles - centralized configuration
 * 🚨 CRITICAL: Uses environment variables to avoid hardcoded URLs
 */

function getApiBaseUrl(): string {
  // Verificar si estamos en un entorno de testing (Jest)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'http://localhost:3001/api';
  }

  // 🔥 PRIORITY 1: Variable de entorno explícita (VITE_API_BASE_URL)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 🔥 PRIORITY 2: Auto-detection para desarrollo vs producción
  if (typeof window !== 'undefined') {
    // Detección automática: si NO es localhost, asumir producción
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Auto-detectar backend de Vercel basado en el frontend URL
      const isVercelDomain = window.location.hostname.includes('vercel.app');
      if (isVercelDomain) {
        // Construir URL del backend dinámicamente
        return `https://centro-wellness-sierra-de-gata-back.vercel.app/api`;
      }
      // Fallback para otros dominios de producción
      return `${window.location.protocol}//${window.location.hostname}/api`;
    }
  }

  // 🔥 PRIORITY 3: Desarrollo local por defecto
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
    // Gradientes basados en los colores del logo Centro Wellness Sierra de Gata
    GRADIENT_STYLE: 'linear-gradient(135deg, #0f172a 0%, #0a1015 50%, #050a0c 100%)', // Verde mucho más oscuro
    GOLD_GRADIENT_STYLE: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', // Dorado del escudo
    BACKGROUND_STYLE: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', // Fondo oscuro elegante
    SECONDARY_GRADIENT: 'linear-gradient(135deg, #050a0c 0%, #0f172a 50%, #0a1015 100%)', // Verde secundario más oscuro
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
