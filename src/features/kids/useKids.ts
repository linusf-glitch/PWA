import { createContext, useContext } from 'react'

import type { Kid } from './kids'

export const KidsContext = createContext<{ kids: Kid[]; selected: Kid; select: (id: string) => void } | null>(null)

export function useKids() {
  const value = useContext(KidsContext)
  if (!value) throw new Error('useKids must be used inside KidsProvider')
  return value
}
