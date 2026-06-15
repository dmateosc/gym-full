/** @type {import('tailwindcss').Config} */
/**
 * Centro Wellness Sierra de Gata — design tokens.
 * Source of truth: temp/Centro Wellness Design System/colors_and_type.css
 * (not vendored; lives outside the repo).
 *
 * Direction: flat surfaces, brand green leads primary actions, gold as
 * secondary accent, red is semantic-only (alerts / strength / advanced).
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wellness: {
          // PRIMARY — brand green (buttons, active tab, focus, hero)
          green: {
            300: '#a7e9a8',
            400: '#6ee06f', // accent text / icons on dark (logo bright laurel)
            500: '#40ce42', // brand green — accents, dots, focus ring
            600: '#1f9e3f', // PRIMARY — buttons / hero (white text)
            700: '#16802f', // pressed / deep hero
          },
          // SECONDARY accent — gold
          gold: {
            400: '#fdc400', // brand shield gold
            500: '#e0a800', // pressed / border gold
          },
          // SEMANTIC red (advanced / strength / alert / sign-out)
          red: {
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
          },
          // Surfaces — flat solids
          surface: {
            app: '#0f172a',      // page ground (slate-900)
            header: '#0b1120',   // sticky header
            tabbar: '#0d1422',   // sticky tab bar
            card: '#1e293b',     // primary card
            inset: '#172033',    // nested / inset
            input: '#334155',    // inputs, neutral chips
          },
          border: {
            card: '#334155',
            strong: '#475569',
            glass: 'rgba(255,255,255,0.10)',
            hover: 'rgba(64,206,66,0.60)',
          },
          fg: {
            DEFAULT: '#ffffff',
            muted: '#9ca3af',
            subtle: '#6b7280',
          },
          // Category coding (flat tinted tags)
          cat: {
            strength: '#dc2626',
            cardio: '#ea580c',
            flexibility: '#16a34a',
            endurance: '#2563eb',
            balance: '#9333ea',
            functional: '#ca8a04',
          },
          // Difficulty coding
          diff: {
            beginner: '#22c55e',
            intermediate: '#eab308',
            advanced: '#ef4444',
          },
        },
      },
      boxShadow: {
        'wellness-xl': '0 20px 25px -5px rgba(0,0,0,.4), 0 8px 10px -6px rgba(0,0,0,.4)',
        'wellness-2xl': '0 25px 50px -12px rgba(0,0,0,.6)',
      },
    },
  },
  plugins: [],
}
