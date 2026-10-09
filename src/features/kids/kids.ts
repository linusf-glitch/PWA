import type { ShoeSetting } from '@/components/sizeless/setting-chip'

export type OutgrownShoe = { size: number; settings: ShoeSetting[]; colourway: string; since: string; until: string; fromScan: boolean }

/** One foot scan. Length and width in mm. */
export type Measurement = { date: string; lengthMm: number; widthMm: number; size: number; shoe?: string }

export type Kid = {
  id: string
  name: string
  /** ISO date, YYYY-MM-DD. */
  birthDate: string
  /** Shoe in use, if the child has one. */
  shoe?: { model: string; size: number; setting: ShoeSetting; colourway?: string; since?: string; fromScan?: boolean }
  /** Earlier pairs that no longer fit, newest first. */
  outgrown?: OutgrownShoe[]
  measurements: number
  /** Scans, oldest first (growth chart). Sample data until read from Supabase. */
  history?: Measurement[]
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
    shoe: { model: 'Classic', size: 26, setting: 'turquoise', colourway: 'Reef', since: '2026-06-12', fromScan: true },
    outgrown: [{ size: 25, settings: ['turquoise', 'yellow'], colourway: 'Sprout', since: '2026-01-10', until: '2026-06-12', fromScan: true }],
    measurements: 3,
    history: [
      { date: '2025-11-04', lengthMm: 152, widthMm: 61, size: 24 },
      { date: '2026-01-10', lengthMm: 158, widthMm: 63, size: 25, shoe: 'Classic' },
      { date: '2026-06-12', lengthMm: 163, widthMm: 65, size: 26, shoe: 'Classic' },
    ],
    nextFitCheck: '2027-01-23',
  },
  {
    id: 'lotta',
    name: 'Lotta',
    birthDate: '2024-06-10',
    measurements: 2,
    history: [
      { date: '2026-03-14', lengthMm: 121, widthMm: 50, size: 20 },
      { date: '2026-09-20', lengthMm: 128, widthMm: 52, size: 21 },
    ],
  },
]

export const DEMO_STATES = ['fitcheck', 'season', 'rescan', 'onekid', 'empty', 'family'] as const
export type DemoState = (typeof DEMO_STATES)[number]

/** Sample children for a demo state (`?demo=fitcheck`). Changes the first child only. */
export function mockKids(demo: DemoState | null, today = new Date()): Kid[] {
  if (demo === 'empty') return []
  if (demo === 'onekid') return MOCK_KIDS.slice(0, 1)
  const soon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12)
  // A bigger family to play with: one child in each Home state, ages 2 to 6.
  if (demo === 'family')
    return [
      { ...MOCK_KIDS[0], fitCheckTight: true },
      MOCK_KIDS[1],
      {
        id: 'mia',
        name: 'Mia',
        birthDate: '2021-11-15',
        shoe: { model: 'Classic', size: 29, setting: 'red' },
        measurements: 4,
        history: [
          { date: '2025-06-02', lengthMm: 160, widthMm: 64, size: 25 },
          { date: '2025-11-20', lengthMm: 168, widthMm: 66, size: 27 },
          { date: '2026-04-15', lengthMm: 176, widthMm: 68, size: 28 },
          { date: '2026-09-30', lengthMm: 181, widthMm: 70, size: 29, shoe: 'Classic' },
        ],
        nextFitCheck: toIsoDate(soon),
      },
      {
        id: 'paul',
        name: 'Paul',
        birthDate: '2020-12-04',
        shoe: { model: 'Classic', size: 31, setting: 'yellow' },
        measurements: 6,
        history: [
          { date: '2024-10-08', lengthMm: 166, widthMm: 65, size: 26 },
          { date: '2025-01-21', lengthMm: 171, widthMm: 67, size: 27 },
          { date: '2025-04-30', lengthMm: 177, widthMm: 69, size: 28 },
          { date: '2025-08-19', lengthMm: 183, widthMm: 71, size: 29 },
          { date: '2026-01-13', lengthMm: 189, widthMm: 73, size: 30 },
          { date: '2026-08-25', lengthMm: 195, widthMm: 75, size: 31, shoe: 'Classic' },
        ],
        nextFitCheck: '2027-02-12',
        season: 'winter',
      },
      {
        id: 'ida',
        name: 'Ida',
        birthDate: '2023-04-21',
        shoe: { model: 'Classic', size: 24, setting: 'turquoise' },
        measurements: 1,
        history: [{ date: '2026-08-03', lengthMm: 150, widthMm: 60, size: 24, shoe: 'Classic' }],
        nextFitCheck: '2027-03-05',
      },
    ]
  const [first, ...rest] = MOCK_KIDS
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

/** Short German month with a two-digit year, e.g. "Nov. 25". */
export function formatMonth(isoDate: string): string {
  const [y, m] = isoDate.split('-').map(Number)
  return `${new Date(y, m - 1, 1).toLocaleDateString('de-DE', { month: 'short' }).replace('.', '')} ${String(y).slice(2)}`
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

/** Birth years the first-visit form offers: Sizeless fits ages 2 to 6. */
export function birthYears(today = new Date()): number[] {
  return Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 - i)
}

/** The first of the month: we only keep birth month and year. */
export function birthDateFor(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

export type KidDetailErrors = { name?: string; birth?: string }

/** Checks the first-visit form (S02). Errors are the wireframe's German texts. */
export function checkKidDetails(name: string, month: number, year: number, today = new Date()): KidDetailErrors {
  const errors: KidDetailErrors = {}
  if (!name.trim()) errors.name = 'Bitte gib einen Vornamen an.'
  if (!birthYears(today).includes(year) || month < 1 || month > 12)
    errors.birth = 'Wähle Geburtsmonat und -jahr. Sizeless passt für Kinder von 2 bis 6 Jahren.'
  return errors
}

export type ShoeEntry = {
  id: string
  status: 'inUse' | 'outgrown'
  size: number
  /** Settings the pair went through, smallest first. The last one is the current one. */
  settings: ShoeSetting[]
  colourway: string
  since: string
  until?: string
  fromScan: boolean
}

/** All pairs of a child for the Shoes screen: the one in use, then the outgrown ones. Ids are stable per list position. */
export function shoesOf(kid: Kid): ShoeEntry[] {
  const current: ShoeEntry[] = kid.shoe
    ? [{ id: 'in-use', status: 'inUse', size: kid.shoe.size, settings: [kid.shoe.setting], colourway: kid.shoe.colourway ?? 'Reef', since: kid.shoe.since ?? '2026-01-01', fromScan: kid.shoe.fromScan ?? true }]
    : []
  const old: ShoeEntry[] = (kid.outgrown ?? []).map((o, i) => ({ id: `outgrown-${i}`, status: 'outgrown', ...o }))
  return [...current, ...old]
}
