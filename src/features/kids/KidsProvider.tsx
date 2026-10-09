import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import { DEMO_STATES, mockKids, type DemoState, type Kid } from './kids'
import { KidsContext } from './useKids'

const GUEST_KEY = 'sizeless-guest-kids'

// ponytail: until real sign-in reads children from Supabase, a first-time visitor's child lives in
// this browser only. Upgrade: read children from the account once sign-in is live.
function loadGuestKids(): Kid[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k?.id === 'string' && typeof k?.name === 'string' && typeof k?.birthDate === 'string') : []
  } catch {
    return []
  }
}

const asDemo = (value: string | null) => (DEMO_STATES as readonly string[]).includes(value ?? '') ? (value as DemoState) : null

// The one global kid selection. Growth, Shoes and Scan all read it. A link with ?kid=<id>
// (WhatsApp, email) selects that child; unknown ids are ignored. ?demo=<state> swaps the
// sample data so Home's states can be reviewed; it sticks until another demo link.
export function KidsProvider({ kids: kidsProp, children }: { kids?: Kid[]; children: ReactNode }) {
  const [params] = useSearchParams()
  const linkedId = params.get('kid')
  const linkedDemo = asDemo(params.get('demo'))
  const [demo, setDemo] = useState(linkedDemo)
  const [guestKids, setGuestKids] = useState(loadGuestKids)
  const kids = kidsProp ?? [...mockKids(demo), ...guestKids]
  const [selectedId, setSelectedId] = useState(() => kids.find((k) => k.id === linkedId)?.id ?? kids[0]?.id)
  const [seen, setSeen] = useState({ linkedId, linkedDemo })

  // A new link while the app is open (React's "adjust state when a prop changes" pattern).
  if (linkedId !== seen.linkedId || linkedDemo !== seen.linkedDemo) {
    setSeen({ linkedId, linkedDemo })
    if (linkedDemo) setDemo(linkedDemo)
    if (kids.some((k) => k.id === linkedId)) setSelectedId(linkedId!)
  }

  const selected = kids.find((k) => k.id === selectedId) ?? kids[0] ?? null
  const addKid = (details: { name: string; birthDate: string }) => {
    const kid: Kid = { id: crypto.randomUUID(), name: details.name.trim(), birthDate: details.birthDate, measurements: 0 }
    const next = [...guestKids, kid]
    setGuestKids(next)
    setSelectedId(kid.id)
    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(next))
    } catch {
      // Storage blocked: the child stays for this visit only.
    }
  }
  return <KidsContext value={{ kids, selected, select: setSelectedId, addKid }}>{children}</KidsContext>
}
