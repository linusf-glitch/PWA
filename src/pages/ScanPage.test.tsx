import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import App from '@/App'
import { AuthProvider } from '@/features/auth/AuthProvider'

// No Supabase client = demo mode with the sample children.
function renderScan() {
  return render(
    <MemoryRouter initialEntries={['/scan']}>
      <AuthProvider client={null}>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Scan intro', () => {
  it('names the child, lists what you need and has one start button', async () => {
    renderScan()
    expect(await screen.findByRole('heading', { name: /Füße von Emil messen/ })).toBeInTheDocument()
    expect(screen.getByText('Das brauchst du')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scan starten' })).toBeInTheDocument()
  })

  it('shows the size when the (stand-in) widget reports a finished scan', async () => {
    const user = userEvent.setup()
    renderScan()
    await user.click(await screen.findByRole('button', { name: 'Scan starten' }))
    await user.click(screen.getByRole('button', { name: /Test-Scan abschließen/ }))
    expect(await screen.findByText('27')).toBeInTheDocument()
  })

  it('goes back to the intro when the scan is cancelled', async () => {
    const user = userEvent.setup()
    renderScan()
    await user.click(await screen.findByRole('button', { name: 'Scan starten' }))
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(screen.getByRole('button', { name: 'Scan starten' })).toBeInTheDocument()
  })
})
