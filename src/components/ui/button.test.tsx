import { render, screen } from '@testing-library/react'

import { Button } from './button'

describe('Button', () => {
  it('is the teal primary button by default, in sentence case', () => {
    render(<Button>Code senden</Button>)
    const button = screen.getByRole('button', { name: 'Code senden' })
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'normal-case')
    expect(button).not.toHaveClass('uppercase')
  })

  it('has the large 60px size for the one dominant action', () => {
    render(<Button size="lg">Füße von Mia neu scannen</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-15')
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

  it('is a round gel pill, and the secondary is a white gel', () => {
    render(
      <>
        <Button>A</Button>
        <Button variant="outline">B</Button>
      </>,
    )
    const [primary, secondary] = screen.getAllByRole('button')
    expect(primary).toHaveClass('rounded-full', 'sz-gel-primary', 'shadow-button')
    expect(secondary).toHaveClass('sz-gel-secondary', 'bg-card', 'shadow-button-secondary')
    expect(secondary).not.toHaveClass('border-ink')
  })

  it('keeps a narrow padding for links', () => {
    render(<Button variant="link">Wie es funktioniert</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-2')
    expect(button).not.toHaveClass('px-6')
  })
})
