import { UserRound } from 'lucide-react'
import { Link } from 'react-router'

import { KidSwitcher } from '@/components/shell/kid-switcher'
import { NAV } from '@/components/shell/nav'
import { NavCard } from '@/components/sizeless/nav-card'
import { Button } from '@/components/ui/button'
import { useKids } from '@/features/kids/useKids'

// Home is the hub. Its state machine (rescan, fit check, season nudge...) arrives in the next PR.
export default function HomePage() {
  const { selected } = useKids()
  return (
    <>
      <header className="sticky top-0 z-10 flex min-h-14 items-center gap-2 border-b bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <h1 className="text-h3 tracking-wide text-primary">
          <span aria-hidden="true">SIZELESS</span>
          <span className="sr-only">Sizeless</span>
        </h1>
        <KidSwitcher className="ml-auto" />
        <Link
          to="/account"
          className="flex min-h-11 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-label outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-muted">
            <UserRound aria-hidden="true" className="size-5" />
          </span>
          Konto
        </Link>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 lg:p-8">
        <p className="text-caption text-muted-foreground">Nächster Schritt für {selected.name}</p>
        <Button asChild size="lg" className="w-full">
          <Link to="/scan">Füße von {selected.name} scannen</Link>
        </Button>
        {NAV.filter((n) => n.to === '/shoes' || n.to === '/growth').map(({ to, label, icon: Icon }) => (
          <NavCard key={to} href={to} title={label} media={<Icon aria-hidden="true" className="size-6 text-primary" />} />
        ))}
      </main>
    </>
  )
}
