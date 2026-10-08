import type { ShoeSetting } from '@/components/sizeless/setting-chip'

export type Kid = {
  id: string
  name: string
  /** ISO date, YYYY-MM-DD. */
  birthDate: string
  /** Shoe in use, if the child has one. */
  shoe?: { model: string; size: number; setting: ShoeSetting }
  measurements: number
  /** ISO date of the next WhatsApp fit check. */
  nextFitCheck?: string
  /** Parent answered "feels tight" on the last fit check (signed WhatsApp link). */
  fitCheckTight?: boolean
  /** Seasonal nudge running for this child, e.g. winter boots. */
  season?: 'winter'
}

// ponytail: sample children until the app reads them from Supabase (child_guardians, shoes,
// measurements). The demo states below exist only to review Home on preview links.
export const MOCK_KIDS: Kid[] = [
  {
    id: 'emil',
    name: 'Emil',
    birthDate: '2022-03-02',
    shoe: { model: 'Classic', size: 26, setting: 'turquoise' },
    measurements: 3,
    nextFitCheck: '2027-01-23',
  },
  { id: 'lotta', name: 'Lotta', birthDate: '2024-06-10', measurements: 1 },
]

export const DEMO_STATES = ['fitcheck', 'season', 'rescan', 'onekid', 'empty'] as const
export type DemoState = (typeof DEMO_STATES)[number]

/** Sample children for a demo state (`?demo=fitcheck`). Changes the first child only. */
export function mockKids(demo: DemoState | null, today = new Date()): Kid[] {
  if (demo === 'empty') return []
  if (demo === 'onekid') return MOCK_KIDS.slice(0, 1)
  const [first, ...rest] = MOCK_KIDS
  const soon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12)
  const patch: Partial<Kid> =
    demo === 'fitcheck'
      ? { fitCheckTight: true }
      : demo === 'season'
        ? { season: 'winter' }
        : demo === 'rescan'
          ? { nextFitCheck: toIsoDate(soon) }
          : {}
  return [{ ...first, ...patch }, ...rest]
}

export type HomeState = 'noShoes' | 'fitCheck' | 'rescanDue' | 'season' | 'normal'

const RESCAN_DUE_DAYS = 14

// Home's one dominant action per child. Order matters: an answered fit check beats a due
// rescan, which beats a seasonal nudge (marketing comes last).
export function homeState(kid: Kid, today = new Date()): HomeState {
  if (!kid.shoe) return 'noShoes'
  if (kid.fitCheckTight) return 'fitCheck'
  if (kid.nextFitCheck && daysUntil(kid.nextFitCheck, today) <= RESCAN_DUE_DAYS) return 'rescanDue'
  if (kid.season) return 'season'
  return 'normal'
}

export function daysUntil(isoDate: string, today = new Date()): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((Date.UTC(y, m - 1, d) - start) / 86_400_000)
}

/** German date, e.g. "23. Jan. 2027". */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Short age for the kid switcher, e.g. "4 J. 7 M.". */
export function formatAge(birthDate: string, today = new Date()): string {
  const [y, m, d] = birthDate.split('-').map(Number)
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m)
  if (today.getDate() < d) months -= 1
  months = Math.max(0, months)
  const years = Math.floor(months / 12)
  return years > 0 ? `${years} J. ${months % 12} M.` : `${months} M.`
}
