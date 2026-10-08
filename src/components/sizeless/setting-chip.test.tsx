import { render, screen } from '@testing-library/react'

import { SettingChip, type ShoeSetting } from './setting-chip'

const cases: Array<[ShoeSetting, string, string]> = [
  ['turquoise', 'Türkis', 'circle'],
  ['yellow', 'Gelb', 'triangle'],
  ['red', 'Rot', 'square'],
]

describe('SettingChip', () => {
  it.each(cases)('shows the %s setting with its word and shape, not colour alone', (setting, word, shape) => {
    const { container } = render(<SettingChip setting={setting} />)
    expect(screen.getByText(word)).toBeInTheDocument()
    expect(container.querySelector(`svg[data-shape="${shape}"]`)).not.toBeNull()
    expect(container.querySelector('[data-slot="setting-chip"]')).toHaveClass(`bg-setting-${setting}`)
  })

  it('reads as a setting for screen readers', () => {
    render(<SettingChip setting="yellow" />)
    expect(screen.getByText('Einstellung', { exact: false })).toHaveClass('sr-only')
  })

  it('uses the soft colours in dense lists', () => {
    const { container } = render(<SettingChip setting="red" tone="soft" />)
    const chip = container.querySelector('[data-slot="setting-chip"]')
    expect(chip).toHaveClass('bg-setting-red-soft', 'text-setting-red-text')
    expect(chip).not.toHaveClass('bg-setting-red')
  })
})
