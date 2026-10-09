import { Footprints } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { formatAge } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'
import { FPT_EVENTS, parseScanResult } from '@/features/scan/events'
import { ScanWidget } from '@/features/scan/scan-widget'

const NEEDS = ['Ein Handy mit Kamera', 'Einen glatten, hellen Boden', 'Etwa 2 Minuten Zeit']

// Scan intro: who is measured, what you need, one big button (the Footprint widget). The result
// screen is /scan/result.
export default function ScanPage() {
  const { selected } = useKids()
  const navigate = useNavigate()
  // Stand-in result: one size above the current shoe (or 25 for a first shoe), middle setting.
  const sample = useMemo(() => ({ size: selected?.shoe ? selected.shoe.size + 1 : 25, setting: 'yellow' as const }), [selected])

  useEffect(() => {
    const onResult = (event: Event) => {
      const parsed = parseScanResult(event)
      if (parsed) navigate('/scan/result', { state: parsed })
    }
    window.addEventListener(FPT_EVENTS.addToCart, onResult)
    return () => window.removeEventListener(FPT_EVENTS.addToCart, onResult)
  }, [navigate])

  return (
    <>
      <PageHeader title="Scan" kidSwitcher />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <section className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Headline as="h2" size="h2" animate>
              {selected ? `Füße von ${selected.name} messen` : 'Füße deines Kindes messen'}
            </Headline>
            {selected && <p className="text-body-small text-muted-foreground">{formatAge(selected.birthDate)}</p>}
          </div>
          <span aria-hidden="true" className="flex size-15 shrink-0 items-center justify-center rounded-[20px] bg-accent-apricot-soft">
            <Footprints className="size-7" />
          </span>
        </section>
        <section aria-labelledby="needs" className="flex flex-col gap-2">
          <h3 id="needs" className="text-h3">
            Das brauchst du
          </h3>
          <ul className="flex flex-col gap-1 text-body">
            {NEEDS.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-accent-apricot">
                  ●
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <ScanWidget sample={sample} />
      </main>
    </>
  )
}
