import { Footprints } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { SettingChip, type ShoeSetting } from '@/components/sizeless/setting-chip'
import { Button } from '@/components/ui/button'
import { formatAge, formatDate } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'
import { FPT_EVENTS, parseScanError, parseScanResult } from '@/features/scan/events'
import { ScanWidget, type ScanSample } from '@/features/scan/scan-widget'

const NEEDS = ['Ein Handy mit Kamera', 'Einen glatten, hellen Boden', 'Etwa 2 Minuten Zeit']
const ORDER: ShoeSetting[] = ['turquoise', 'yellow', 'red']

// S14 Rescan intro: the same scan as the first one for a child who already has shoes. The outcome
// screen (/rescan/result) says if the setting moves or the next size is needed.
export default function RescanPage() {
  const { selected } = useKids()
  const navigate = useNavigate()
  const shoe = selected?.shoe
  const [sample, setSample] = useState<ScanSample | null>(null)
  // Stand-in result until Footprint answers: the next setting up, or the next size when already on the largest.
  const defaultSample = useMemo<ScanSample | null>(() => {
    if (!shoe) return null
    const next = ORDER[ORDER.indexOf(shoe.setting) + 1]
    return next ? { size: shoe.size, setting: next } : { size: shoe.size + 1, setting: 'turquoise' }
  }, [shoe])

  useEffect(() => {
    const onResult = (event: Event) => {
      if (parseScanError(event)) return navigate('/rescan/result', { state: { error: true } })
      const parsed = parseScanResult(event)
      if (parsed) navigate('/rescan/result', { state: parsed })
    }
    window.addEventListener(FPT_EVENTS.addToCart, onResult)
    return () => window.removeEventListener(FPT_EVENTS.addToCart, onResult)
  }, [navigate])

  if (!selected || !shoe) return <Navigate to="/scan" replace />
  const last = selected.history?.at(-1)
  const test = shoe && import.meta.env.VITE_TEST_TOOLS === 'true'
  const choices: [string, ScanSample][] = [
    ['gleiche Größe', { size: shoe.size, setting: ORDER[Math.min(ORDER.indexOf(shoe.setting) + 1, 2)] }],
    ['nächste Größe', { size: shoe.size + 1, setting: 'turquoise' }],
    ['Fehler', { error: true }],
  ]

  return (
    <>
      <PageHeader title="Neu scannen" kidSwitcher />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        <section className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Headline as="h2" size="h2" animate>
              Wir messen {selected.name} noch einmal
            </Headline>
            <p className="text-body-small text-muted-foreground">
              {formatAge(selected.birthDate)}
              {last && ` · letzter Scan ${formatDate(last.date)}`}
            </p>
          </div>
          <span aria-hidden="true" className="flex size-15 shrink-0 items-center justify-center rounded-[20px] bg-accent-apricot-soft">
            <Footprints className="size-7" />
          </span>
        </section>
        <div className="flex items-center gap-3 rounded-xl bg-card p-4">
          <span className="text-label">Aktuell: Größe {shoe.size}</span>
          <SettingChip setting={shoe.setting} size="sm" />
        </div>
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
        <ScanWidget sample={sample ?? defaultSample!} />
        {test && (
          <div className="flex flex-col gap-2 rounded-xl border-[1.5px] border-dashed border-border-strong p-3">
            <p className="text-caption text-muted-foreground">Test: was soll der Scan ergeben?</p>
            <div className="flex flex-wrap gap-2">
              {choices.map(([label, s]) => (
                <Button key={label} size="sm" variant="outline" aria-pressed={sample === s} onClick={() => setSample(s)}>
                  Test: {label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
