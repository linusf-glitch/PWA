import { LineChart } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router'

import { Confetti, Headline } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip, type ShoeSetting } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { useKids } from '@/features/kids/useKids'
import { scanResultSchema } from '@/features/scan/events'

const WORD: Record<ShoeSetting, string> = { turquoise: 'Klein', yellow: 'Mittel', red: 'Groß' }

// S14 outcomes. A: same size, maybe a new setting. B: the next size. C: the scan failed, nothing changes.
// Nothing is saved yet (sample data); real saving comes with sign-in (phase 6).
export default function RescanResultPage() {
  const { selected } = useKids()
  const state = useLocation().state as { error?: boolean } | null
  const parsed = scanResultSchema.safeParse(state)
  const shoe = selected?.shoe
  if (!selected || !shoe || (!state?.error && !parsed.success)) return <Navigate to="/rescan" replace />
  const name = selected.name

  if (state?.error || !parsed.success)
    return (
      <>
        <PageHeader title="Neu scannen" kidSwitcher />
        <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
          <Headline as="h2" size="h2" animate>
            Der Scan hat diesmal nicht geklappt
          </Headline>
          <p className="text-body">
            Die gespeicherte Größe von {name} (Größe {shoe.size}, {WORD[shoe.setting]}) bleibt unverändert.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link to="/rescan">Nochmal versuchen</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Später</Link>
            </Button>
          </div>
        </main>
      </>
    )

  const { size, setting = shoe.setting } = parsed.data
  const nextSize = size > shoe.size
  return (
    <>
      <PageHeader title="Neu scannen" kidSwitcher />
      <main className="relative mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <Confetti />
        <Headline as="h2" size="h2" animate>
          {nextSize ? `Die nächste Größe für ${name}` : `Die neue Einstellung für ${name}`}
        </Headline>
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
          <p className="text-h3">
            Größe {size}
            {nextSize ? ` (vorher ${shoe.size})` : ' passt noch'}
          </p>
          <SettingChip setting={setting} size="lg" animate />
          {!nextSize && setting !== shoe.setting && (
            <p className="text-body">
              Stell den Schuh von {WORD[shoe.setting]} auf {WORD[setting]}.
            </p>
          )}
          {!nextSize && setting === shoe.setting && <p className="text-body">Die Einstellung bleibt wie sie ist.</p>}
        </div>
        <Link to="/growth" className="flex min-h-11 items-center gap-3 rounded-xl bg-accent-sage-soft p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <LineChart aria-hidden="true" className="size-5" />
          <span className="text-label">Wachstumskurve aktualisiert</span>
          <span className="ml-auto text-body-small underline">Kurve ansehen</span>
        </Link>
        <div className="flex flex-col gap-3">
          {nextSize && (
            <Button asChild size="lg" className="w-full">
              <Link to="/checkout" state={parsed.data}>
                Größe {size} kaufen
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant={nextSize ? 'outline' : 'default'} className="w-full">
            <Link to="/">Zurück zu Home</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
