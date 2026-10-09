import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'

import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { daysUntil } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'

// S08 "Nächste Größe": buy without scanning. The parent picks a size next to the current one
// (next size suggested); no scan means no new setting, so the last one travels with the order.
// The colour is chosen on the next screen, and the order carries no measurement ("nur Größe").
export default function NextSizePage() {
  const navigate = useNavigate()
  const { selected } = useKids()
  const last = selected?.shoe?.size
  const [size, setSize] = useState(last === undefined ? 0 : last + 1)
  if (!selected?.shoe || last === undefined) return <Navigate to="/scan" replace />

  const lastScan = selected.history?.at(-1)?.date
  const weeks = lastScan ? Math.max(0, Math.round(-daysUntil(lastScan) / 7)) : null

  return (
    <>
      <PageHeader title="Nächste Größe" kidSwitcher back="step" />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <section className="flex flex-col gap-1">
          <h2 className="text-h2">Nächste Größe für {selected.name} wählen</h2>
          <p className="text-body-small text-muted-foreground">
            Letzte Größe: EU {last}
            {weeks !== null && ` · gescannt vor ${weeks === 1 ? '1 Woche' : `${weeks} Wochen`}`}
          </p>
        </section>
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Größe</legend>
          <div className="grid grid-cols-3 gap-3">
            {[last, last + 1, last + 2].map((s) => (
              <label
                key={s}
                className="flex min-h-13 flex-col items-center justify-center rounded-xl border-2 bg-card p-2 text-center text-label has-checked:border-ink has-focus-visible:ring-2 has-focus-visible:ring-ring"
              >
                <input type="radio" name="size" className="sr-only" checked={size === s} onChange={() => setSize(s)} />
                EU {s}
                {s === last + 1 && <span className="text-caption text-muted-foreground">empfohlen</span>}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-2 rounded-xl bg-card p-4">
          <p className="flex items-center gap-2 text-body-small">
            Letzte Einstellung: <SettingChip setting={selected.shoe.setting} size="sm" />
          </p>
          <p className="text-body-small text-muted-foreground">Eine neue Einstellung können wir ohne Scan nicht bestätigen. Die Farbe wählst du im nächsten Schritt.</p>
        </div>
        <Button size="lg" className="w-full" onClick={() => navigate('/checkout', { state: { size, setting: selected.shoe!.setting } })}>
          EU {size} kaufen
        </Button>
        <Button asChild variant="link" className="self-center">
          <Link to="/rescan">Nicht sicher? Lieber neu scannen</Link>
        </Button>
      </main>
    </>
  )
}
