import { Link, Navigate, useLocation } from 'react-router'

import { Confetti, Headline, Illustration } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { useKids } from '@/features/kids/useKids'
import { scanResultSchema } from '@/features/scan/events'

const EXPLAIN = {
  turquoise: 'Stell den Schuh auf Türkis, die kleinste Einstellung.',
  yellow: 'Stell den Schuh auf Gelb, die mittlere Einstellung.',
  red: 'Stell den Schuh auf Rot, die größte Einstellung.',
}

// S05 Result: the recommended size and setting, then buy or scan again. The scan page passes the
// validated widget result in the router state.
export default function ScanResultPage() {
  const { selected } = useKids()
  const parsed = scanResultSchema.safeParse(useLocation().state)
  if (!parsed.success) return <Navigate to="/scan" replace />
  const { size, setting = 'yellow' } = parsed.data

  return (
    <>
      <PageHeader title="Ergebnis" kidSwitcher />
      <main className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 p-4 text-center lg:p-8">
        <Confetti />
        <Illustration name="footprints" size={110} draw />
        <Headline as="h2" size="h2" animate className="flex flex-col items-center">
          {selected ? `Die passende Größe für ${selected.name}` : 'Die passende Größe'}
        </Headline>
        <p aria-label={`Größe EU ${size}`} className="flex items-baseline gap-2 text-ink">
          <span aria-hidden="true" className="text-h2">
            EU
          </span>
          <span aria-hidden="true" className="sz-pop text-[72px] leading-none font-semibold tabular-nums">
            {size}
          </span>
        </p>
        <div className="flex flex-col items-center gap-2">
          <SettingChip setting={setting} />
          <p className="text-body">{EXPLAIN[setting]}</p>
          <Button asChild variant="link">
            <Link to="/scan/setting">Was bedeutet die Einstellung?</Link>
          </Button>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/checkout">Größe {size} kaufen</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/scan">Noch einmal scannen</Link>
          </Button>
        </div>
      </main>
    </>
  )
}
