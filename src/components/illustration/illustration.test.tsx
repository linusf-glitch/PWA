import { render } from '@testing-library/react'

import { Illustration } from './illustration'
import { DRAWINGS } from './drawings'

describe('Illustration', () => {
  it.each(Object.keys(DRAWINGS) as Array<keyof typeof DRAWINGS>)('%s is hidden from screen readers and draws lines', (name) => {
    const { container } = render(<Illustration name={name} draw />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveClass('sz-draw')
    expect(container.querySelectorAll('.sz-ln').length).toBeGreaterThan(0)
  })
})
