import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SupabaseClient } from '@supabase/supabase-js'
import { MemoryRouter } from 'react-router'
import { afterEach, vi } from 'vitest'

import App from './App'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { makeFakeSupabase } from '@/test/fakeSupabase'

function renderApp(client: SupabaseClient | null, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider client={client}>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function goToCodeScreen(user: ReturnType<typeof userEvent.setup>, email = 'parent@example.com') {
  await user.type(await screen.findByLabelText('E-Mail'), email)
  await user.click(screen.getByRole('button', { name: 'Code senden' }))
  await screen.findByRole('heading', { name: 'Code eingeben' })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('routing', () => {
  it('sends a signed-out visitor to Sign in', async () => {
    renderApp(makeFakeSupabase().client)
    expect(await screen.findByRole('heading', { name: 'Anmelden' })).toBeInTheDocument()
  })

  it('shows Home to a signed-in parent and keeps them off the sign-in screens', async () => {
    const fake = makeFakeSupabase()
    renderApp(makeFakeSupabase({ session: fake.fakeSession }).client, '/sign-in')
    expect(await screen.findByRole('heading', { name: 'Sizeless' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Anmelden' })).not.toBeInTheDocument()
  })

  it('opens as a demo with sample data when Supabase is not set up', async () => {
    renderApp(null)
    expect(await screen.findByRole('heading', { name: 'Sizeless' })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent('Demo')
  })

  it('signs out back to Sign in', async () => {
    const fake = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(makeFakeSupabase({ session: fake.fakeSession }).client)
    await user.click((await screen.findAllByRole('link', { name: 'Konto' }))[0])
    await user.click(await screen.findByRole('button', { name: 'Abmelden' }))
    expect(await screen.findByRole('heading', { name: 'Anmelden' })).toBeInTheDocument()
  })
})

describe('app frame', () => {
  const signedIn = () => makeFakeSupabase({ session: makeFakeSupabase().fakeSession }).client

  it('carries the chosen child from Home to other screens and back', async () => {
    const user = userEvent.setup()
    renderApp(signedIn())
    // The sidebar repeats the switcher (hidden by CSS on mobile), so take the first.
    await user.click((await screen.findAllByRole('button', { name: /Kind wechseln, Emil ausgewählt/ }))[0])
    await user.click(within(screen.getByRole('dialog', { name: 'Kind auswählen' })).getByRole('button', { name: /Lotta/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('link', { name: /Wachstum/ })[0])
    expect(await screen.findByRole('heading', { name: 'Wachstum' })).toBeInTheDocument()
    expect(screen.getByText(/für Lotta/)).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Zurück zu Home' }))
    expect(await screen.findByRole('link', { name: 'Füße von Lotta scannen' })).toBeInTheDocument()
  })

  it('selects the child named in a link', async () => {
    renderApp(signedIn(), '/shoes?kid=lotta')
    expect(await screen.findByText(/für Lotta/)).toBeInTheDocument()
  })

  it('ignores an unknown child in a link', async () => {
    renderApp(signedIn(), '/?kid=nobody')
    expect((await screen.findAllByRole('button', { name: /Emil ausgewählt/ }))[0]).toBeInTheDocument()
  })

  it('closes the kid switcher with Escape without changing the child', async () => {
    const user = userEvent.setup()
    renderApp(signedIn())
    await user.click((await screen.findAllByRole('button', { name: /Emil ausgewählt/ }))[0])
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Emil ausgewählt/ })[0]).toBeInTheDocument()
  })

  it('has a back arrow on every screen except Home', async () => {
    for (const path of ['/growth', '/shoes', '/scan', '/account']) {
      const { unmount } = renderApp(signedIn(), path)
      expect(await screen.findByRole('link', { name: 'Zurück zu Home' })).toHaveAttribute('href', '/')
      unmount()
    }
    renderApp(signedIn(), '/')
    await screen.findByRole('heading', { name: 'Sizeless' })
    expect(screen.queryByRole('link', { name: 'Zurück zu Home' })).not.toBeInTheDocument()
  })
})

describe('Sign in screen', () => {
  it('rejects an invalid email without calling Supabase', async () => {
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await user.type(await screen.findByLabelText('E-Mail'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Code senden' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('gültige E-Mail')
    expect(auth.signInWithOtp).not.toHaveBeenCalled()
  })

  it('asks for a code without creating new accounts', async () => {
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'parent@example.com',
      options: { shouldCreateUser: false },
    })
  })

  it('gives the same answer for an email with no account', async () => {
    const { client, auth } = makeFakeSupabase()
    auth.signInWithOtp.mockResolvedValueOnce({
      error: { code: 'otp_disabled', status: 422, message: 'Signups not allowed for otp' },
    })
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await goToCodeScreen(user, 'stranger@example.com')
  })

  it('tells the parent to wait when rate limited', async () => {
    const { client, auth } = makeFakeSupabase()
    auth.signInWithOtp.mockResolvedValueOnce({
      error: { code: 'over_email_send_rate_limit', status: 429, message: 'rate limit' },
    })
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await user.type(await screen.findByLabelText('E-Mail'), 'parent@example.com')
    await user.click(screen.getByRole('button', { name: 'Code senden' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Zu viele Versuche')
  })

  it('sends a sign-in link to the demo when Supabase is not configured', async () => {
    renderApp(null, '/sign-in')
    expect(await screen.findByRole('heading', { name: 'Sizeless' })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent('Demo')
  })
})

describe('Code entry screen', () => {
  it('goes back to Sign in if opened directly', async () => {
    renderApp(makeFakeSupabase().client, '/sign-in/code')
    expect(await screen.findByRole('heading', { name: 'Anmelden' })).toBeInTheDocument()
  })

  it('has a back arrow to Sign in', async () => {
    const user = userEvent.setup()
    renderApp(makeFakeSupabase().client, '/sign-in')
    await goToCodeScreen(user)
    await user.click(screen.getByRole('link', { name: 'Zurück' }))
    expect(await screen.findByRole('heading', { name: 'Anmelden' })).toBeInTheDocument()
  })

  it('signs in and shows Home when the 6th digit is typed', async () => {
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    await user.type(screen.getByLabelText('6-stelliger Code'), '123456')
    expect(await screen.findByRole('heading', { name: 'Sizeless' })).toBeInTheDocument()
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: 'parent@example.com', token: '123456', type: 'email' })
  })

  it('shows a wrong/expired message and clears the field', async () => {
    const { client, auth } = makeFakeSupabase()
    auth.verifyOtp.mockResolvedValueOnce({
      error: { code: 'otp_expired', status: 403, message: 'Token has expired or is invalid' },
    })
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    await user.type(screen.getByLabelText('6-stelliger Code'), '000000')
    expect(await screen.findByRole('alert')).toHaveTextContent('falsch oder abgelaufen')
    expect(screen.getByLabelText('6-stelliger Code')).toHaveValue('')
    expect(screen.queryByRole('heading', { name: 'Sizeless' })).not.toBeInTheDocument()
  })

  it('ignores anything that is not a digit', async () => {
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    await user.type(screen.getByLabelText('6-stelliger Code'), '12ab34')
    expect(screen.getByLabelText('6-stelliger Code')).toHaveValue('1234')
    expect(auth.verifyOtp).not.toHaveBeenCalled()
  })

  it('lets the parent request a new code only after a short wait', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    const resend = screen.getByRole('button', { name: /Neuen Code senden/ })
    expect(resend).toBeDisabled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000)
    })
    expect(screen.getByRole('button', { name: 'Neuen Code senden' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Neuen Code senden' }))
    expect(await screen.findByRole('status')).toHaveTextContent('neuer Code')
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(2)
  })
})

describe('Home states', () => {
  const signedIn = () => makeFakeSupabase({ session: makeFakeSupabase().fakeSession }).client

  it('shows the normal rescan action with the shoe, growth and fit check', async () => {
    renderApp(signedIn())
    expect(await screen.findByRole('link', { name: 'Füße von Emil neu scannen' })).toHaveAttribute('href', '/scan')
    expect(screen.getByRole('link', { name: /Aktueller Schuh/ })).toHaveTextContent(/Größe 26.*Klein/)
    expect(screen.getByRole('link', { name: /Wachstum.*3.*Messungen/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Passform-Check/ })).toBeInTheDocument()
  })

  it('offers a line for another child that needs something, which switches to that child', async () => {
    const user = userEvent.setup()
    renderApp(signedIn())
    await user.click(await screen.findByRole('button', { name: /Lotta: erster Scan fällig/ }))
    expect(screen.getByRole('link', { name: 'Füße von Lotta scannen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Noch keine Schuhe/ })).toBeInTheDocument()
    // Emil is normal, so he gets no line.
    expect(screen.queryByRole('button', { name: /Emil:/ })).not.toBeInTheDocument()
  })

  it.each([
    ['fitcheck', 'Jetzt neu scannen'],
    ['season', 'Für Winterstiefel scannen'],
    ['rescan', 'Emil neu scannen'],
  ])('shows the %s state from a demo link', async (demo, action) => {
    renderApp(signedIn(), `/?demo=${demo}`)
    expect(await screen.findByRole('link', { name: action })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /scannen|scan/i }).filter((l) => l.closest('section[data-state]'))).toHaveLength(1)
  })

  it('asks who to measure when there is no child yet', async () => {
    const user = userEvent.setup()
    renderApp(signedIn(), '/?demo=empty')
    expect(await screen.findByRole('heading', { name: 'Wen messen wir?' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Kind hinzufügen' })[0]).toBeInTheDocument()
    await user.type(screen.getByLabelText('Vorname'), 'Mia')
    expect(screen.getByRole('link', { name: 'Füße von Mia scannen' })).toBeInTheDocument()
  })
})

