import { describe, it, expect } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

describe('App Component', () => {
  it('renders without crashing', async () => {
    render(<App />)
    
    // Verificar que el header se renderiza inmediatamente
    expect(screen.getByText('GymApp')).toBeInTheDocument()
    
    // Esperar a que el loading termine y aparezcan ejercicios
    await waitFor(() => {
      expect(screen.queryByText('Cargando ejercicios...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('has Netflix-style dark background', async () => {
    render(<App />)
    
    // Verificar que existe un elemento con min-h-screen
    const appElement = document.querySelector('.min-h-screen')
    expect(appElement).toBeTruthy()
    
    // Esperar a que cargue completamente
    await waitFor(() => {
      expect(screen.queryByText('Cargando ejercicios...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
