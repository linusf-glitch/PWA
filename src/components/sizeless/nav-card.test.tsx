import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { NavCard } from './nav-card'

describe('NavCard', () => {
  it('is one button with its title, extra line and a click handler', () => {
    const onClick = vi.fn()
    render(
      <NavCard eyebrow="Aktueller Schuh" title="Sizeless Sneaker" onClick={onClick}>
        EU 27
      </NavCard>,
    )
    const card = screen.getByRole('button', { name: /Sizeless Sneaker/ })
    expect(card).toHaveTextContent('Aktueller Schuh')
    expect(card).toHaveTextContent('EU 27')
    fireEvent.click(card)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders a link when given href', () => {
    render(
      <MemoryRouter>
        <NavCard title="Wachstum von Mia" href="/growth" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Wachstum von Mia/ })).toHaveAttribute('href', '/growth')
  })
})
