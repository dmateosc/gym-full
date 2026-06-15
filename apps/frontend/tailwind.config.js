/** @type {import('tailwindcss').Config} */
/**
 * Centro Wellness Sierra de Gata — design tokens (premium refresh).
 * Source of truth: Centro Wellness Design System / colors_and_type.css
 *
 * Direction: flat surfaces with ELEVATION (soft shadow + lifted card) instead
 * of tonal borders; deep-emerald brand green leads primary actions, gold is the
 * secondary accent, red is semantic-only (alerts / strength / advanced).
 * Logo brand green (emblem tint) = #40ce42.
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
          // PRIMARY — brand green. Deep-emerald FILLS, bright TEXT on dark.
          green: {
            300: '#86efac',
            400: '#4ade80', // accent text / icons / links on dark (legible)
            500: '#22c55e', // small accents, dots, focus ring
            600: '#15803d', // PRIMARY — buttons / active tab / hero (white text)
            700: '#14532d', // pressed / deepest
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
          // Surfaces — flat solids; separation via lift + shadow, not borders
          surface: {
            app: '#0b1220',      // deep page ground
            header: '#0a0f1a',   // sticky header chrome
            tabbar: '#0c121e',   // sticky tab bar
            card: '#1a2336',     // primary card (lifted)
            inset: '#131c2e',    // nested / inset
            input: '#26314a',    // inputs, neutral chips
          },
          // Borders — near-invisible hairlines (NOT contrasting tonal strokes)
          border: {
            card: 'rgba(255,255,255,0.07)',
            strong: 'rgba(255,255,255,0.14)',
            glass: 'rgba(255,255,255,0.08)',
            hover: 'rgba(34,197,94,0.55)',
          },
          fg: {
            DEFAULT: '#ffffff',
            muted: '#aab6c8',   // secondary — raised for legibility
            subtle: '#8794a8',  // tertiary / captions
          },
          // Category coding (flat tinted tags: bg {c}22 · border {c}55 · text light)
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
        // Elevation is the primary separator between surfaces
        'wellness-card': '0 1px 2px rgba(0,0,0,.45), 0 6px 16px -6px rgba(0,0,0,.45)',
        'wellness-card-hi': '0 2px 4px rgba(0,0,0,.5), 0 16px 30px -10px rgba(0,0,0,.55)',
        // Heavier overlays (dropdowns / modals)
        'wellness-xl': '0 20px 25px -5px rgba(0,0,0,.4), 0 8px 10px -6px rgba(0,0,0,.4)',
        'wellness-2xl': '0 25px 50px -12px rgba(0,0,0,.6)',
      },
    },
  },
  plugins: [],
}
