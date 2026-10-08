import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { Headline, Illustration } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { SizeBadge } from '@/components/sizeless/size-badge'
import { Button } from '@/components/ui/button'
import { formatAge } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'
import { FPT_EVENTS, parseScanResult, type ScanResult } from '@/features/scan/events'
import { ScanWidget } from '@/features/scan/scan-widget'

const NEEDS = ['Ein Handy mit Kamera', 'Einen glatten, hellen Boden', 'Etwa 2 Minuten Zeit']

// Scan intro: who is measured, what you need, one big button (the Footprint widget). The result
// screen with setting and purchase comes in the next step; for now the size is shown plainly.
export default function ScanPage() {
  const { selected } = useKids()
  const [result, setResult] = useState<ScanResult | null>(null)

  useEffect(() => {
    const onResult = (event: Event) => {
      const parsed = parseScanResult(event)
      if (parsed) setResult(parsed)
    }
    window.addEventListener(FPT_EVENTS.addToCart, onResult)
    return () => window.removeEventListener(FPT_EVENTS.addToCart, onResult)
  }, [])

  return (
    <>
      <PageHeader title="Scan" kidSwitcher />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        {result ? (
          <section className="flex flex-col items-start gap-4 rounded-xl bg-accent p-5">
            <Illustration name="footprints" size={96} draw />
            <Headline as="h2" size="h2" animate>
              {selected ? `Die Größe für ${selected.name}` : 'Die Größe'}
            </Headline>
            <SizeBadge size={result.size} />
            <p className="text-body">Die Seite mit Einstellung und Kauf kommt im nächsten Schritt.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Zurück zu Home</Link>
            </Button>
          </section>
        ) : (
          <>
            <section className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Headline as="h2" size="h2" animate>
                  {selected ? `Füße von ${selected.name} messen` : 'Füße deines Kindes messen'}
                </Headline>
                {selected && <p className="text-body-small text-muted-foreground">{formatAge(selected.birthDate)}</p>}
              </div>
              <Illustration name="measure" size={96} draw className="shrink-0" />
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
            <ScanWidget />
          </>
        )}
      </main>
    </>
  )
}
