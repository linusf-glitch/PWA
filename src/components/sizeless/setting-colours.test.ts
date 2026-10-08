// The turquoise/yellow/red setting colours mean the shoe's adjustment setting and nothing else.
// Only SettingChip (and the token definitions in index.css) may use them.
const ALLOWED = new Set(['/src/components/sizeless/setting-chip.tsx'])

const sources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('setting colours', () => {
  it('finds the source files to check', () => {
    expect(Object.keys(sources)).toContain('/src/components/sizeless/setting-chip.tsx')
  })

  it('are used only by SettingChip', () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => !ALLOWED.has(path))
      .filter(([, code]) => /setting-(turquoise|green|yellow|red)/.test(code))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })
})
