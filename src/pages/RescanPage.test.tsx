import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, vi } from 'vitest'

import App from '@/App'
import { AuthProvider } from '@/features/auth/AuthProvider'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

// Demo mode: Emil wears size 26 on Klein (turquoise), last scan 12 Jun 2026.
async function scan(pick?: string) {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(
    <MemoryRouter initialEntries={['/rescan']}>
      <AuthProvider client={null}>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
  if (pick) await user.click(await screen.findByRole('button', { name: pick }))
  await user.click(await screen.findByRole('button', { name: 'Scan starten' }))
  act(() => {
    vi.advanceTimersByTime(3000)
  })
}

describe('Rescan (S14)', () => {
  it('shows the intro with the child, last scan and current size', async () => {
    render(
      <MemoryRouter initialEntries={['/rescan']}>
        <AuthProvider client={null}>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: 'Wir messen Emil noch einmal' })).toBeInTheDocument()
    expect(screen.getByText(/letzter Scan 12\. Juni 2026/)).toBeInTheDocument()
    expect(screen.getByText('Aktuell: Größe 26')).toBeInTheDocument()
  })

  it('outcome A: same size, the setting moves up', async () => {
    await scan()
    expect(await screen.findByRole('heading', { name: 'Die neue Einstellung für Emil' })).toBeInTheDocument()
    expect(screen.getByText('Größe 26 passt noch')).toBeInTheDocument()
    expect(screen.getByText('Stell den Schuh von Klein auf Mittel.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Wachstumskurve aktualisiert/ })).toHaveAttribute('href', '/growth')
    expect(screen.queryByRole('link', { name: /kaufen/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Zurück zu Home' })).toHaveLength(2) // header arrow and button
  })

  it('outcome B: the next size with a buy button', async () => {
    vi.stubEnv('VITE_TEST_TOOLS', 'true')
    await scan('Test: nächste Größe')
    expect(await screen.findByRole('heading', { name: 'Die nächste Größe für Emil' })).toBeInTheDocument()
    expect(screen.getByText('Größe 27 (vorher 26)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Größe 27 kaufen' })).toHaveAttribute('href', '/checkout')
  })

  it('outcome C: a failed scan changes nothing and offers to try again', async () => {
    vi.stubEnv('VITE_TEST_TOOLS', 'true')
    await scan('Test: Fehler')
    expect(await screen.findByRole('heading', { name: 'Der Scan hat diesmal nicht geklappt' })).toBeInTheDocument()
    expect(screen.getByText(/Größe 26, Klein\) bleibt unverändert/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nochmal versuchen' })).toHaveAttribute('href', '/rescan')
    expect(screen.getByRole('link', { name: 'Später' })).toHaveAttribute('href', '/')
  })

  it('sends a child without shoes to the first scan', async () => {
    render(
      <MemoryRouter initialEntries={['/rescan?kid=lotta']}>
        <AuthProvider client={null}>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /Füße von Lotta messen/ })).toBeInTheDocument()
  })
})
