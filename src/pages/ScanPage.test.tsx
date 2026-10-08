import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, vi } from 'vitest'

import App from '@/App'
import { AuthProvider } from '@/features/auth/AuthProvider'

// No Supabase client = demo mode with the sample children.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider client={null}>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Scan intro', () => {
  it('names the child, lists what you need and has one start button', async () => {
    renderAt('/scan')
    expect(await screen.findByRole('heading', { name: /Füße von Emil messen/ })).toBeInTheDocument()
    expect(screen.getByText('Das brauchst du')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scan starten' })).toBeInTheDocument()
  })

  it('goes back to the intro when the scan is cancelled', async () => {
    const user = userEvent.setup()
    renderAt('/scan')
    await user.click(await screen.findByRole('button', { name: 'Scan starten' }))
    expect(screen.getByRole('status')).toHaveTextContent('Wir messen')
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(screen.getByRole('button', { name: 'Scan starten' })).toBeInTheDocument()
  })

  it('opens the result for the next size up when the stand-in scan finishes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/scan')
    await user.click(await screen.findByRole('button', { name: 'Scan starten' }))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(await screen.findByRole('link', { name: 'Größe 27 kaufen' })).toHaveAttribute('href', '/checkout')
    expect(screen.getByText('Gelb')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Noch einmal scannen' })).toHaveAttribute('href', '/scan')
  })
})

describe('Result and setting screens', () => {
  it('sends a visit without a scan result back to the scan intro', async () => {
    renderAt('/scan/result')
    expect(await screen.findByRole('button', { name: 'Scan starten' })).toBeInTheDocument()
  })

  it('explains the three settings', async () => {
    renderAt('/scan/setting')
    expect(await screen.findByText('Die kleinste Einstellung.')).toBeInTheDocument()
    expect(screen.getByText('Die größte Einstellung.')).toBeInTheDocument()
  })

  it('opens a placeholder for the checkout', async () => {
    renderAt('/checkout')
    expect(await screen.findByRole('heading', { name: 'Kasse' })).toBeInTheDocument()
  })
})
