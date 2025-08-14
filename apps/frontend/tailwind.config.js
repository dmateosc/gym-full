/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Centro Wellness Sierra de Gata Brand Colors
        'wellness': {
          'green': {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#0f172a', // Verde mucho más oscuro como principal
            600: '#0a1015', // Todavía más oscuro
            700: '#050a0c', // Casi negro
            800: '#030609', // Muy oscuro
            900: '#020304', // Casi negro total
          },
          'gold': {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b', // Dorado del escudo
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          'dark': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a', // Negro del fondo
          }
        }
      },
      backgroundImage: {
        'wellness-gradient': 'linear-gradient(135deg, #0f172a 0%, #0a1015 50%, #050a0c 100%)',
        'wellness-gold-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        'wellness-dark-gradient': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      }
    },
  },
  plugins: [],
}
