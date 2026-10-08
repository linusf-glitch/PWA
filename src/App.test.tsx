import { render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  it('shows the Sizeless placeholder home with one main action', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Sizeless' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument()
  })
})
