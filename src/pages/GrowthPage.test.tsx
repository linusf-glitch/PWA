import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import App from '@/App'
import { AuthProvider } from '@/features/auth/AuthProvider'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider client={null}>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Growth (S15)', () => {
  it('shows chart and table, newest scan first', async () => {
    renderAt('/growth')
    expect(await screen.findByRole('img', { name: 'Fußlänge von Emil in mm' })).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(rows[1]).toHaveTextContent('163 / 65')
    expect(rows[1]).toHaveTextContent('EU 26')
    expect(screen.getByRole('link', { name: 'Füße von Emil neu scannen' })).toHaveAttribute('href', '/rescan')
  })

  it('says one measurement so far', async () => {
    renderAt('/growth?kid=lotta')
    expect(await screen.findByText(/Bisher eine Messung/)).toBeInTheDocument()
  })

  it('compares all kids with a legend', async () => {
    const user = userEvent.setup()
    renderAt('/growth')
    await user.click(await screen.findByRole('link', { name: 'Alle Kinder vergleichen' }))
    expect(await screen.findByRole('img', { name: 'Fußlänge aller Kinder in mm' })).toBeInTheDocument()
    const legend = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(legend).toEqual(expect.arrayContaining(['Emil', 'Lotta']))
  })
})
