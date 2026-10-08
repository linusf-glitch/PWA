export type Kid = {
  id: string
  name: string
  /** ISO date, YYYY-MM-DD. */
  birthDate: string
}

// ponytail: sample children until the app reads them from Supabase (child_guardians).
export const MOCK_KIDS: Kid[] = [
  { id: 'emil', name: 'Emil', birthDate: '2022-03-02' },
  { id: 'lotta', name: 'Lotta', birthDate: '2024-06-10' },
]

/** Short age for the kid switcher, e.g. "4 J. 7 M.". */
export function formatAge(birthDate: string, today = new Date()): string {
  const [y, m, d] = birthDate.split('-').map(Number)
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m)
  if (today.getDate() < d) months -= 1
  months = Math.max(0, months)
  const years = Math.floor(months / 12)
  return years > 0 ? `${years} J. ${months % 12} M.` : `${months} M.`
}
