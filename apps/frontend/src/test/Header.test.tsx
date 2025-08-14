import { render, screen } from '@testing-library/react'
import Header from '../components/Header'

describe('Header Component', () => {
  it('renders Centro Wellness Sierra de Gata title', () => {
    render(<Header />)
    expect(screen.getByText('Centro Wellness Sierra de Gata')).toBeInTheDocument()
  })

  it('has Netflix-style red gradient styling', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-gradient-to-r')
  })
})
