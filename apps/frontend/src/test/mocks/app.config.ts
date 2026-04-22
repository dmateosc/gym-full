export const APP_CONFIG = {
  API: {
    BASE_URL: 'http://localhost:3001/api',
    BACKEND_URL: 'http://localhost:3001/api',
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
    GRADIENT_STYLE: 'linear-gradient(135deg, #0f172a 0%, #0a1015 50%, #050a0c 100%)',
    GOLD_GRADIENT_STYLE: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    BACKGROUND_STYLE: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
    SECONDARY_GRADIENT: 'linear-gradient(135deg, #050a0c 0%, #0f172a 50%, #0a1015 100%)',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
