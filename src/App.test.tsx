import { act, render, screen, waitFor, within } from '@testing-library/react'
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
  await user.type(await screen.findByLabelText('Email'), email)
  await user.click(screen.getByRole('button', { name: 'Send code' }))
  await screen.findByRole('heading', { name: 'Enter your code' })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('routing', () => {
  it('sends a signed-out visitor to Sign in', async () => {
    renderApp(makeFakeSupabase().client)
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows Home to a signed-in parent and keeps them off the sign-in screens', async () => {
    const fake = makeFakeSupabase()
    renderApp(makeFakeSupabase({ session: fake.fakeSession }).client, '/sign-in')
    expect(await screen.findByRole('heading', { name: 'Sizeless' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument()
  })

  it('signs out back to Sign in', async () => {
    const fake = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(makeFakeSupabase({ session: fake.fakeSession }).client)
    await user.click((await screen.findAllByRole('link', { name: 'Konto' }))[0])
    await user.click(await screen.findByRole('button', { name: 'Abmelden' }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
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
    await user.type(await screen.findByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('valid email')
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
    await user.type(await screen.findByLabelText('Email'), 'parent@example.com')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many tries')
  })

  it('says sign-in is not set up when Supabase is not configured', async () => {
    const user = userEvent.setup()
    renderApp(null, '/sign-in')
    await user.type(await screen.findByLabelText('Email'), 'parent@example.com')
    await user.click(screen.getByRole('button', { name: 'Send code' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('not set up')
  })
})

describe('Code entry screen', () => {
  it('goes back to Sign in if opened directly', async () => {
    renderApp(makeFakeSupabase().client, '/sign-in/code')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('has a back arrow to Sign in', async () => {
    const user = userEvent.setup()
    renderApp(makeFakeSupabase().client, '/sign-in')
    await goToCodeScreen(user)
    await user.click(screen.getByRole('link', { name: 'Back' }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('signs in and shows Home when the 6th digit is typed', async () => {
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    await user.type(screen.getByLabelText('6-digit code'), '123456')
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
    await user.type(screen.getByLabelText('6-digit code'), '000000')
    expect(await screen.findByRole('alert')).toHaveTextContent('wrong or expired')
    expect(screen.getByLabelText('6-digit code')).toHaveValue('')
    expect(screen.queryByRole('heading', { name: 'Sizeless' })).not.toBeInTheDocument()
  })

  it('ignores anything that is not a digit', async () => {
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup()
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    await user.type(screen.getByLabelText('6-digit code'), '12ab34')
    expect(screen.getByLabelText('6-digit code')).toHaveValue('1234')
    expect(auth.verifyOtp).not.toHaveBeenCalled()
  })

  it('lets the parent request a new code only after a short wait', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { client, auth } = makeFakeSupabase()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp(client, '/sign-in')
    await goToCodeScreen(user)
    const resend = screen.getByRole('button', { name: /Send a new code/ })
    expect(resend).toBeDisabled()
    act(() => {
      vi.advanceTimersByTime(61_000)
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send a new code' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: 'Send a new code' }))
    expect(await screen.findByRole('status')).toHaveTextContent('new code')
    expect(auth.signInWithOtp).toHaveBeenCalledTimes(2)
  })
})
