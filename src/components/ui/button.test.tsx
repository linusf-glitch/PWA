import { render, screen } from '@testing-library/react'

import { Button } from './button'

describe('Button', () => {
  it('is the teal primary button by default, in sentence case', () => {
    render(<Button>Code senden</Button>)
    const button = screen.getByRole('button', { name: 'Code senden' })
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'normal-case')
    expect(button).not.toHaveClass('uppercase')
  })

  it('has the large 56px size for the one dominant action', () => {
    render(<Button size="lg">Füße von Mia neu scannen</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-14')
  })

  it('keeps every size at least 44px tall', () => {
    render(
      <>
        <Button size="sm">A</Button>
        <Button>B</Button>
      </>,
    )
    for (const button of screen.getAllByRole('button')) expect(button).toHaveClass('min-h-11')
  })

  it('keeps a narrow padding for links', () => {
    render(<Button variant="link">Wie es funktioniert</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-2')
    expect(button).not.toHaveClass('px-6')
  })
})
