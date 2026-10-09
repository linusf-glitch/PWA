import { render, screen } from '@testing-library/react'

import { SettingChip, type ShoeSetting } from './setting-chip'

const cases: Array<[ShoeSetting, string, number]> = [
  ['turquoise', 'Klein', 1],
  ['yellow', 'Mittel', 2],
  ['red', 'Groß', 3],
]

describe('SettingChip', () => {
  it.each(cases)('shows the %s setting as a word and the tall step, not colour alone', (setting, word, n) => {
    const { container } = render(<SettingChip setting={setting} />)
    const chip = container.querySelector('[data-slot="setting-chip"]')!
    expect(chip).toHaveTextContent(`Einstellung ${word}, Stufe ${n} von 3`)
    const steps = chip.querySelectorAll('[data-step]')
    expect(steps).toHaveLength(3)
    expect(chip.querySelectorAll('[data-on]')).toHaveLength(1)
    expect(steps[n - 1]).toHaveAttribute('data-on')
    expect(steps[n - 1]).toHaveClass(`bg-setting-${setting}`)
  })

  it('takes a prefix and grows the active step once when animated', () => {
    const { container } = render(<SettingChip setting="yellow" prefix="Einstellung" size="lg" animate />)
    expect(screen.getByText('Einstellung Mittel')).toBeInTheDocument()
    expect(container.querySelector('[data-on]')).toHaveClass('sz-rise')
  })
})
