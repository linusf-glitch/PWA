import { createContext, useContext } from 'react'

import type { Kid } from './kids'

/** `selected` is null only when the parent has no children yet (gift or referral recipient). */
export const KidsContext = createContext<{ kids: Kid[]; selected: Kid | null; select: (id: string) => void } | null>(
  null,
)

export function useKids() {
  const value = useContext(KidsContext)
  if (!value) throw new Error('useKids must be used inside KidsProvider')
  return value
}
