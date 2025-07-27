import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Utilidades de Supabase comentadas - no se usan en el frontend
// if (import.meta.env.DEV) {
//   import('./utils/seedDatabase');
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
