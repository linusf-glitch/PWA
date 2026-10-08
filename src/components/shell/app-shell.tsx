import { NavLink, Outlet } from 'react-router'

import { KidsProvider } from '@/features/kids/KidsProvider'
import { cn } from '@/lib/utils'

import { KidSwitcher } from './kid-switcher'
import { NAV } from './nav'

// Signed-in frame. Mobile: each page brings its own top bar, no tab bar. Desktop (lg): a left
// sidebar with the kid switcher and the same route list.
export function AppShell() {
  return (
    <KidsProvider>
      <div className="min-h-dvh lg:flex">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-4 border-r p-4 lg:flex">
          <span className="px-2 py-3 text-h3 tracking-wide text-foreground">SIZELESS</span>
          <KidSwitcher className="w-full rounded-lg border" />
          <nav aria-label="Hauptmenü" className="flex flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-md px-3 text-label outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                    isActive && 'bg-accent font-semibold text-accent-foreground',
                  )
                }
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </KidsProvider>
  )
}
