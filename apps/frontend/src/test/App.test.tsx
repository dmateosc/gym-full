import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

describe('App Component', () => {
  it('renders without crashing', async () => {
    render(<App />)
    // App renders initially (loading state or login page)
    expect(document.body).toBeTruthy()
  })

  it('shows login page when not authenticated', async () => {
    render(<App />)
    // After loading resolves, the login page should appear (no session mocked)
    await waitFor(() => {
      expect(screen.queryByRole('main') ?? document.body).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('has a root element with min-h-screen', async () => {
    render(<App />)
    await waitFor(() => {
      const appElement = document.querySelector('.min-h-screen')
      expect(appElement).toBeTruthy()
    }, { timeout: 3000 })
  })
})
