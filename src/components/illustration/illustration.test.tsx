import { render } from '@testing-library/react'

import { Headline } from './illustration'
import { shoeColourFor } from './shoe-colour'
import { ShoeSticker } from './shoe-sticker'

describe('ShoeSticker', () => {
  it('is decorative by default and named when it carries meaning', () => {
    const { container, rerender, getByRole } = render(<ShoeSticker />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    rerender(<ShoeSticker colour="blue" label />)
    expect(getByRole('img', { name: 'Sizeless-Schuh in Blau' })).toBeInTheDocument()
  })

  it('maps the shop colourways to sticker colours', () => {
    expect(shoeColourFor('Galaxy')).toBe('purple')
    expect(shoeColourFor('Sizeless Reef')).toBe('blue')
    expect(shoeColourFor('Sprout')).toBe('green')
    expect(shoeColourFor('Classic')).toBe('green')
  })
})

describe('Headline', () => {
  it('keeps the squiggle hidden from screen readers', () => {
    const { container } = render(<Headline>Hallo</Headline>)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
