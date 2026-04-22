import { render, screen } from '@testing-library/react'
import Header from '../components/Header'

describe('Header Component', () => {
  it('renders Centro Wellness Sierra de Gata title', () => {
    render(<Header />)
    expect(screen.getByText('Centro Wellness Sierra de Gata')).toBeInTheDocument()
  })

  it('renders with header element', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toBeTruthy()
  })
})
