import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import App from '@/App'
import { AuthProvider } from '@/features/auth/AuthProvider'

// Demo mode: Emil wears size 26 on Klein (turquoise).
function open(path = '/next-size') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider client={null}>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Nächste Größe (buy without scanning)', () => {
  it('suggests the next size and takes it to the colour step', async () => {
    const user = userEvent.setup()
    open()
    expect(await screen.findByText(/Letzte Größe: EU 26/)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /EU 27/ })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: /EU 28/ }))
    await user.click(screen.getByRole('button', { name: 'EU 28 kaufen' }))
    expect(await screen.findByText('Classic Schuh, EU 28')).toBeInTheDocument()
  })

  it('offers a rescan instead', async () => {
    open()
    expect(await screen.findByRole('link', { name: /Lieber neu scannen/ })).toHaveAttribute('href', '/rescan')
  })

  it('is reachable from Home', async () => {
    open('/')
    expect(await screen.findByRole('link', { name: 'Ohne Scan kaufen' })).toHaveAttribute('href', '/next-size')
  })
})
