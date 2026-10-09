import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import App from '@/App'
import { AuthProvider } from '@/features/auth/AuthProvider'

// No Supabase client = demo mode with the sample children (Emil has one pair in use and one outgrown).
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider client={null}>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Shoes (S16)', () => {
  it('lists the pair in use and the outgrown ones', async () => {
    renderAt('/shoes')
    expect(await screen.findByRole('heading', { name: 'Im Einsatz' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Zu klein geworden' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Größe 26/ })).toHaveAttribute('href', '/shoes/in-use')
    expect(screen.getByRole('link', { name: /Größe 25/ })).toHaveAttribute('href', '/shoes/outgrown-0')
    expect(screen.getByRole('link', { name: 'Füße von Emil neu scannen' })).toHaveAttribute('href', '/scan')
  })

  it('says so when the child has no shoes yet', async () => {
    renderAt('/shoes?kid=lotta')
    expect(await screen.findByRole('heading', { name: 'Noch keine Schuhe' })).toBeInTheDocument()
    expect(screen.getByText(/Lotta hat noch keine Sizeless-Schuhe/)).toBeInTheDocument()
  })

  it('opens the detail of the pair in use, still with its size', async () => {
    const user = userEvent.setup()
    renderAt('/shoes')
    await user.click(await screen.findByRole('link', { name: /Größe 26/ }))
    expect(await screen.findByText('Größe 26 ist weiterhin die Größe von Emil.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Füße von Emil neu scannen' })).toBeInTheDocument()
  })

  it('shows an outgrown pair with its dates and asks to rescan first, no "buy again"', async () => {
    const user = userEvent.setup()
    renderAt('/shoes')
    await user.click(await screen.findByRole('link', { name: /Größe 25/ }))
    expect(await screen.findByText(/Emil ist aus Größe 25 herausgewachsen/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Erst neu scannen' })).toHaveAttribute('href', '/scan')
    expect(screen.queryByText(/noch einmal kaufen/i)).not.toBeInTheDocument()
  })

  it('sends an unknown pair back to the list', async () => {
    renderAt('/shoes/nope')
    expect(await screen.findByRole('heading', { name: 'Im Einsatz' })).toBeInTheDocument()
  })
})
