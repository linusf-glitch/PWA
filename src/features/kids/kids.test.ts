import { formatAge, homeState, mockKids, type Kid } from './kids'

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

describe('homeState', () => {
  const today = new Date(2026, 9, 8)
  const base: Kid = {
    id: 'k',
    name: 'K',
    birthDate: '2022-01-01',
    measurements: 1,
    shoe: { model: 'Classic', size: 26, setting: 'turquoise' },
    nextFitCheck: '2027-01-23',
  }

  it('asks for a first scan when the child has no shoes', () => {
    expect(homeState({ ...base, shoe: undefined, fitCheckTight: true }, today)).toBe('noShoes')
  })

  it('puts a "feels tight" fit check answer first', () => {
    expect(homeState({ ...base, fitCheckTight: true, season: 'winter', nextFitCheck: '2026-10-10' }, today)).toBe(
      'fitCheck',
    )
  })

  it('shows rescan due from 14 days before the fit check, before a season nudge', () => {
    expect(homeState({ ...base, nextFitCheck: '2026-10-22', season: 'winter' }, today)).toBe('rescanDue')
    expect(homeState({ ...base, nextFitCheck: '2026-10-23' }, today)).toBe('normal')
  })

  it('shows the season nudge when nothing else is due', () => {
    expect(homeState({ ...base, season: 'winter' }, today)).toBe('season')
  })

  it('demo data produces each state', () => {
    expect(homeState(mockKids('fitcheck', today)[0], today)).toBe('fitCheck')
    expect(homeState(mockKids('season', today)[0], today)).toBe('season')
    expect(homeState(mockKids('rescan', today)[0], today)).toBe('rescanDue')
    expect(homeState(mockKids(null, today)[1], today)).toBe('noShoes')
    expect(mockKids('empty', today)).toEqual([])
    expect(mockKids('onekid', today)).toHaveLength(1)
  })
})
