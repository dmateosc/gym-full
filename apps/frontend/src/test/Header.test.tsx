import { render, screen } from '@testing-library/react'
import Header from '../components/Header'

describe('Header Component', () => {
  it('renders gym app title', () => {
    render(<Header />)
    expect(screen.getByText('GymApp')).toBeInTheDocument()
  })

  it('has Netflix-style red gradient styling', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-gradient-to-r')
  })
})
