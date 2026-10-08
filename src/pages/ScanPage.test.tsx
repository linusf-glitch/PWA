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

  it('sends a checkout visit without a scan result back to the scan intro', async () => {
    renderAt('/checkout')
    expect(await screen.findByRole('button', { name: 'Scan starten' })).toBeInTheDocument()
  })
})

describe('Colourway and checkout hand-off', () => {
  const state = { measurement_id: 'm1', article_number: 'SZ-CLASSIC', size: 27, setting: 'yellow' }
  const renderWithScan = (path: string, extra = {}) =>
    render(
      <MemoryRouter initialEntries={[{ pathname: path, state: { ...state, ...extra } }]}>
        <AuthProvider client={null}>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )

  it('offers the colourways and greys out the sold out one (demo sample)', async () => {
    const user = userEvent.setup()
    renderWithScan('/checkout')
    expect(await screen.findByText('Classic Schuh, EU 27')).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: /Galaxy/ })).toBeDisabled()
    expect(screen.getByRole('radio', { name: /Reef/ })).toBeChecked()
    expect(screen.getByText(/Galaxy ist in Größe 27 gerade ausverkauft/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Sprout/ }))
    await user.click(screen.getByRole('button', { name: 'Weiter zur Kasse' }))
    expect(await screen.findByText('Classic Schuh, Sprout, EU 27')).toBeInTheDocument()
  })

  it('goes through payment done to the order confirmation (demo, no back arrow)', async () => {
    const user = userEvent.setup()
    renderWithScan('/checkout/go', { variantId: 'v', colourway: 'Reef' })
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Weiter zur Kasse' }))
    expect(await screen.findByRole('heading', { name: 'Danke für deine Bestellung' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Zurück zu Home' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Weiter' }))
    expect(await screen.findByText('Classic Schuh, Reef, EU 27')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jetzt anmelden' })).toHaveAttribute('href', '/sign-in')
    await user.click(screen.getByRole('button', { name: 'Per WhatsApp erinnern' }))
    expect(screen.getByRole('status')).toHaveTextContent('späteren Schritt')
  })

  it('sends order screens without an order back to Home', async () => {
    renderAt('/order/confirmed')
    expect(await screen.findByRole('heading', { name: /Hallo|Emil/ })).toBeInTheDocument()
  })
})
