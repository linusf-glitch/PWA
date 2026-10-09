import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, vi } from 'vitest'

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
    expect(screen.getByText('Mittel')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Noch einmal scannen' })).toHaveAttribute('href', '/scan')
  })
})

describe('First visit (S02)', () => {
  beforeEach(() => localStorage.clear())

  it('asks who is measured and only starts the scan with a name, month and year', async () => {
    const user = userEvent.setup()
    renderAt('/scan?demo=empty')
    expect(await screen.findByRole('heading', { name: 'Wer wird gemessen?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Scan starten' }))
    expect(screen.getByText('Bitte gib einen Vornamen an.')).toBeInTheDocument()
    expect(screen.getByText(/Kinder von 2 bis 6 Jahren/)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Vorname'), 'Nele')
    await user.selectOptions(screen.getByLabelText('Geburtsmonat'), 'März')
    await user.selectOptions(screen.getByLabelText('Geburtsjahr'), String(new Date().getFullYear() - 4))
    await user.click(screen.getByRole('button', { name: 'Scan starten' }))
    expect(screen.getByRole('status')).toHaveTextContent('Wir messen')
    expect(await screen.findByRole('heading', { name: /Füße von Nele messen/ })).toBeInTheDocument()
  })

  it('skips the form for a known child', async () => {
    renderAt('/scan')
    expect(await screen.findByRole('heading', { name: /Füße von Emil messen/ })).toBeInTheDocument()
    expect(screen.queryByLabelText('Vorname')).not.toBeInTheDocument()
  })
})

describe('Return link (/return)', () => {
  const token = 'abcdefghijklmnopqrstuvwxyz012345'
  afterEach(() => vi.unstubAllGlobals())

  it('shows the confirmation for a valid token without a login', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ kid_name: 'Emil', size: 27, setting: 'yellow', model: 'Sizeless Reef' }) })
    vi.stubGlobal('fetch', fetchMock)
    renderAt(`/return?t=${token}`)
    expect(await screen.findByText('Sizeless Reef, EU 27')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Bestellung bestätigt' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(`/api/order-return?t=${token}`)
  })

  async function openReturn(fetchMock: ReturnType<typeof vi.fn>) {
    vi.stubGlobal('fetch', fetchMock)
    renderAt(`/return?t=${token}`)
    await screen.findByText('Sizeless Reef, EU 27')
  }
  const order = { ok: true, json: async () => ({ kid_name: 'Emil', size: 27, setting: 'yellow', model: 'Sizeless Reef' }) }

  it('asks for WhatsApp consent: the number field opens on the same screen and the request is sent with the token', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValueOnce(order).mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    await openReturn(fetchMock)
    expect(screen.queryByLabelText('WhatsApp-Nummer')).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: /Fit-Checks/ }))
    await user.click(screen.getByRole('button', { name: 'Per WhatsApp' }))
    const number = screen.getByLabelText('WhatsApp-Nummer')
    expect(number).toHaveValue('+49 ')
    await user.type(number, '151 1234567')
    await user.click(screen.getByRole('button', { name: 'Bestätigen' }))
    expect(await screen.findByText(/Antworte mit JA/)).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toBe('/api/consent-request')
    expect(JSON.parse(init.body)).toEqual({ token, channel: 'whatsapp', contact: '+491511234567', fit_checks: true, marketing: false, text_version: 's10-2026-10-09' })
  })

  it('opens an email field for email and rejects a bad address without calling the server', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValueOnce(order)
    await openReturn(fetchMock)
    await user.click(screen.getByRole('checkbox', { name: /Tipps und Angebote/ }))
    await user.click(screen.getByRole('button', { name: 'Per E-Mail' }))
    await user.type(screen.getByLabelText('E-Mail-Adresse'), 'kein-mail')
    await user.click(screen.getByRole('button', { name: 'Bestätigen' }))
    expect(screen.getByText('Bitte gib eine gültige E-Mail-Adresse an.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows an error and keeps the form when the server fails', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValueOnce(order).mockResolvedValueOnce({ ok: false })
    await openReturn(fetchMock)
    await user.click(screen.getByRole('checkbox', { name: /Fit-Checks/ }))
    await user.click(screen.getByRole('button', { name: 'Per E-Mail' }))
    await user.type(screen.getByLabelText('E-Mail-Adresse'), 'mama@example.com')
    await user.click(screen.getByRole('button', { name: 'Bestätigen' }))
    expect(await screen.findByText('Das hat nicht geklappt. Bitte versuch es gleich noch einmal.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bestätigen' })).toBeEnabled()
  })

  it('says the link is invalid when the server does not know the token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    renderAt(`/return?t=${token}`)
    expect(await screen.findByText(/abgelaufen oder nicht gültig/)).toBeInTheDocument()
  })

  it('does not call the server without a token', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderAt('/return')
    expect(await screen.findByText(/abgelaufen oder nicht gültig/)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
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
    expect(screen.getByText(/Die Zahlung läuft bei Shopify/)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Sprout/ }))
    await user.click(screen.getByRole('button', { name: 'Weiter zur Kasse' }))
    // Demo has no Shopify keys: straight on to what comes after payment (no separate Kasse screen).
    expect(await screen.findByRole('heading', { name: 'Danke für deine Bestellung' })).toBeInTheDocument()
  })

  it('goes through payment done to the order confirmation (demo, no back arrow)', async () => {
    const user = userEvent.setup()
    renderWithScan('/checkout')
    await user.click(await screen.findByRole('button', { name: 'Weiter zur Kasse' }))
    expect(await screen.findByRole('heading', { name: 'Danke für deine Bestellung' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Zurück zu Home' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Weiter' }))
    expect(await screen.findByText('Classic Schuh, Reef, EU 27')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jetzt anmelden' })).toHaveAttribute('href', '/sign-in')
    // Nothing is ticked by default; a request needs a box and a channel (demo: nothing is sent).
    expect(screen.getByRole('checkbox', { name: /Fit-Checks/ })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Tipps und Angebote/ })).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Bestätigen' }))
    expect(screen.getByText('Wähle mindestens eine Option.')).toBeInTheDocument()
    expect(screen.getByText('Wähle WhatsApp oder E-Mail.')).toBeInTheDocument()
  })

  it('shows the test payment button only when VITE_TEST_TOOLS is true', async () => {
    const user = userEvent.setup()
    renderWithScan('/checkout')
    await screen.findByRole('button', { name: 'Weiter zur Kasse' })
    expect(screen.queryByRole('button', { name: 'Test: Zahlung simulieren' })).not.toBeInTheDocument()
    cleanup()
    vi.stubEnv('VITE_TEST_TOOLS', 'true')
    renderWithScan('/checkout')
    await user.click(await screen.findByRole('button', { name: 'Test: Zahlung simulieren' }))
    expect(await screen.findByRole('heading', { name: 'Danke für deine Bestellung' })).toBeInTheDocument()
    vi.unstubAllEnvs()
  })

  it('sends order screens without an order back to Home', async () => {
    renderAt('/order/confirmed')
    expect(await screen.findByRole('link', { name: 'Füße von Emil neu scannen' })).toBeInTheDocument()
  })
})
