import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

import { KidSwitcher } from './kid-switcher'

// Top bar of every non-Home screen: back arrow to Home (iOS standalone has no browser back),
// title, and the kid switcher on child-specific screens (the sidebar has it on desktop).
export function PageHeader({ title, kidSwitcher = false }: { title: string; kidSwitcher?: boolean }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-14 items-center gap-2 border-b bg-background/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur">
      <Link
        to="/"
        aria-label="Zurück zu Home"
        className="flex size-11 shrink-0 items-center justify-center rounded-full outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-6" />
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-h3">{title}</h1>
      {kidSwitcher && <KidSwitcher compact className="lg:hidden" />}
    </header>
  )
}
