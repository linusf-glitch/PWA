import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import { DEMO_STATES, mockKids, type DemoState, type Kid } from './kids'
import { KidsContext } from './useKids'

const asDemo = (value: string | null) => (DEMO_STATES as readonly string[]).includes(value ?? '') ? (value as DemoState) : null

// The one global kid selection. Growth, Shoes and Scan all read it. A link with ?kid=<id>
// (WhatsApp, email) selects that child; unknown ids are ignored. ?demo=<state> swaps the
// sample data so Home's states can be reviewed; it sticks until another demo link.
export function KidsProvider({ kids: kidsProp, children }: { kids?: Kid[]; children: ReactNode }) {
  const [params] = useSearchParams()
  const linkedId = params.get('kid')
  const linkedDemo = asDemo(params.get('demo'))
  const [demo, setDemo] = useState(linkedDemo)
  const kids = kidsProp ?? mockKids(demo)
  const [selectedId, setSelectedId] = useState(() => kids.find((k) => k.id === linkedId)?.id ?? kids[0]?.id)
  const [seen, setSeen] = useState({ linkedId, linkedDemo })

  // A new link while the app is open (React's "adjust state when a prop changes" pattern).
  if (linkedId !== seen.linkedId || linkedDemo !== seen.linkedDemo) {
    setSeen({ linkedId, linkedDemo })
    if (linkedDemo) setDemo(linkedDemo)
    if (kids.some((k) => k.id === linkedId)) setSelectedId(linkedId!)
  }

  const selected = kids.find((k) => k.id === selectedId) ?? kids[0] ?? null
  return <KidsContext value={{ kids, selected, select: setSelectedId }}>{children}</KidsContext>
}
