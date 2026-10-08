import { formatAge } from './kids'

describe('formatAge', () => {
  const today = new Date(2026, 9, 8) // 8 Oct 2026

  it('shows years and months', () => {
    expect(formatAge('2022-03-02', today)).toBe('4 J. 7 M.')
  })

  it('does not count a month that is not complete yet', () => {
    expect(formatAge('2022-03-09', today)).toBe('4 J. 6 M.')
  })

  it('shows only months under one year', () => {
    expect(formatAge('2026-01-08', today)).toBe('9 M.')
  })
})
