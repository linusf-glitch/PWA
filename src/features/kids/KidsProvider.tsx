import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import { MOCK_KIDS, type Kid } from './kids'
import { KidsContext } from './useKids'

// The one global kid selection. Growth, Shoes and Scan all read it. A link with ?kid=<id>
// (WhatsApp, email) selects that child; unknown ids are ignored.
export function KidsProvider({ kids = MOCK_KIDS, children }: { kids?: Kid[]; children: ReactNode }) {
  const [params] = useSearchParams()
  const linkedId = params.get('kid')
  const [selectedId, setSelectedId] = useState(() => kids.find((k) => k.id === linkedId)?.id ?? kids[0].id)
  const [seenLinkedId, setSeenLinkedId] = useState(linkedId)

  // A new link while the app is open (React's "adjust state when a prop changes" pattern).
  if (linkedId !== seenLinkedId) {
    setSeenLinkedId(linkedId)
    if (kids.some((k) => k.id === linkedId)) setSelectedId(linkedId!)
  }

  const selected = kids.find((k) => k.id === selectedId) ?? kids[0]
  return <KidsContext value={{ kids, selected, select: setSelectedId }}>{children}</KidsContext>
}
