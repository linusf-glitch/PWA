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
    renderAt('/growth?demo=family&kid=ida')
    expect(await screen.findByText(/Bisher eine Messung/)).toBeInTheDocument()
    expect(screen.getByText('150 mm')).toBeInTheDocument()
  })

  it('compares all kids with a legend', async () => {
    const user = userEvent.setup()
    renderAt('/growth')
    await user.click(await screen.findByRole('link', { name: 'Alle Kinder vergleichen' }))
    expect(await screen.findByRole('img', { name: 'Fußlänge aller Kinder in mm' })).toBeInTheDocument()
    const legend = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(legend).toEqual(expect.arrayContaining(['Emil', 'Lotta']))
  })

  it('offers the comparison only with more than one child', async () => {
    renderAt('/growth?demo=onekid')
    expect(await screen.findByRole('img', { name: 'Fußlänge von Emil in mm' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Alle Kinder vergleichen' })).not.toBeInTheDocument()
  })

  it('draws one marker shape per child in the chart and the legend', async () => {
    const user = userEvent.setup()
    renderAt('/growth')
    await user.click(await screen.findByRole('link', { name: 'Alle Kinder vergleichen' }))
    const chart = await screen.findByRole('img', { name: 'Fußlänge aller Kinder in mm' })
    expect(chart.querySelectorAll('circle')).toHaveLength(3) // Emil
    expect(chart.querySelectorAll('rect')).toHaveLength(2) // Lotta
    const legend = screen.getAllByRole('listitem')
    expect(legend[0].querySelector('circle')).not.toBeNull()
    expect(legend[1].querySelector('rect')).not.toBeNull()
  })
})
