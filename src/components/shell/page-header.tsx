import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { KidSwitcher } from './kid-switcher'

// Top bar of every non-Home screen: back arrow to Home (iOS standalone has no browser back),
// title, and the kid switcher on child-specific screens (the sidebar has it on desktop).
// Inside the order flow `back="step"` goes to the previous step instead of Home; `back="none"`
// hides the arrow (going back from the order screen would reopen checkout).
export function PageHeader({ title, kidSwitcher = false, back = 'home' }: { title: string; kidSwitcher?: boolean; back?: 'home' | 'step' | 'none' }) {
  const navigate = useNavigate()
  const arrow = 'sz-glass flex size-11 shrink-0 items-center justify-center rounded-full outline-none active:scale-95 focus-visible:ring-4 focus-visible:ring-ring/45'
  return (
    <header className="sz-glass-bar sticky top-0 z-10 flex min-h-14 items-center gap-2 px-2 pt-[env(safe-area-inset-top)]">
      {back === 'home' && (
        <Link to="/" aria-label="Zurück zu Home" className={arrow}>
          <ArrowLeft aria-hidden="true" className="size-6" />
        </Link>
      )}
      {back === 'step' && (
        <button type="button" onClick={() => navigate(-1)} aria-label="Zurück" className={arrow}>
          <ArrowLeft aria-hidden="true" className="size-6" />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate text-h3">{title}</h1>
      {kidSwitcher && <KidSwitcher compact className="lg:hidden" />}
    </header>
  )
}
