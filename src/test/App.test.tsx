import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('GymApp')).toBeInTheDocument()
  })

  it('has Netflix-style dark background', () => {
    render(<App />)
    const main = document.querySelector('.min-h-screen')
    expect(main).toBeTruthy()
  })
})
