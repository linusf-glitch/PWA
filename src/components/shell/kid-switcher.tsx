import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

import { formatAge } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'
import { cn } from '@/lib/utils'

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-label font-semibold text-accent-foreground',
        className,
      )}
    >
      {name.charAt(0)}
    </span>
  )
}

// Global kid switcher: Home header on mobile, top of the sidebar on desktop. Opens a sheet
// listing every child; the choice applies on every screen.
export function KidSwitcher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { kids, selected, select } = useKids()
  const [open, setOpen] = useState(false)
  const sheetId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label={`Kind wechseln, ${selected.name} ausgewählt`}
        onClick={() => setOpen(true)}
        className={cn(
          'flex min-h-11 min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 text-left outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Avatar name={selected.name} className={compact ? 'size-8' : undefined} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-label font-semibold">{selected.name}</span>
          {!compact && <span className="text-caption text-muted-foreground">{formatAge(selected.birthDate)}</span>}
        </span>
        <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      </button>

      {/* Portal: the sticky header's backdrop blur would otherwise trap a fixed sheet inside it. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Schließen"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-scrim"
            />
            <div
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-label="Kind auswählen"
              className="absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col gap-2 overflow-y-auto rounded-t-xl bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card lg:inset-x-auto lg:top-20 lg:bottom-auto lg:left-4 lg:w-80 lg:rounded-xl"
            >
              <h2 className="px-2 py-1 text-h3">Kind auswählen</h2>
              {kids.map((kid) => (
                <button
                  key={kid.id}
                  type="button"
                  aria-pressed={kid.id === selected.id}
                  autoFocus={kid.id === selected.id}
                  onClick={() => {
                    select(kid.id)
                    setOpen(false)
                  }}
                  className="flex min-h-14 items-center gap-3 rounded-lg p-2 text-left outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-accent"
                >
                  <Avatar name={kid.name} />
                  <span className="flex flex-1 flex-col">
                    <span className="text-label font-semibold">{kid.name}</span>
                    <span className="text-caption text-muted-foreground">{formatAge(kid.birthDate)}</span>
                  </span>
                  {kid.id === selected.id && <Check aria-hidden="true" className="size-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
