import { Footprints } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { Input, Select } from '@/components/ui/input'
import { birthDateFor, birthYears, checkKidDetails, formatAge, type KidDetailErrors } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'
import { FPT_EVENTS, parseScanResult } from '@/features/scan/events'
import { ScanWidget } from '@/features/scan/scan-widget'

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const NEEDS = ['Ein Handy mit Kamera', 'Einen glatten, hellen Boden', 'Etwa 2 Minuten Zeit']

// Scan intro: who is measured, what you need, one big button (the Footprint widget). The result
// screen is /scan/result.
export default function ScanPage() {
  const { selected, addKid } = useKids()
  const [name, setName] = useState('')
  const [month, setMonth] = useState(0)
  const [year, setYear] = useState(0)
  const [errors, setErrors] = useState<KidDetailErrors>({})
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

  // First visit (S02): no child yet, so ask who is measured before the scan starts.
  function saveKid() {
    const found = checkKidDetails(name, month, year)
    setErrors(found)
    if (found.name || found.birth) return false
    addKid({ name, birthDate: birthDateFor(month, year) })
    return true
  }

  return (
    <>
      <PageHeader title="Scan" kidSwitcher />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        {!selected && (
          <section aria-labelledby="who" className="flex flex-col gap-4">
            <Headline as="h2" size="h2" animate>
              <span id="who">Wer wird gemessen?</span>
            </Headline>
            <div className="flex flex-col gap-1">
              <label className="flex flex-col gap-1 text-label">
                Vorname
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
              </label>
              {errors.name && <span id="name-error" role="alert" className="text-body-small text-destructive">{errors.name}</span>}
            </div>
            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-label">
                Geburtsmonat
                <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-invalid={!!errors.birth}>
                  <option value={0}>Monat</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </Select>
              </label>
              <label className="flex flex-1 flex-col gap-1 text-label">
                Geburtsjahr
                <Select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-invalid={!!errors.birth}>
                  <option value={0}>Jahr</option>
                  {birthYears().map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </label>
            </div>
            {errors.birth && <p role="alert" className="text-body-small text-destructive">{errors.birth}</p>}
            <p className="text-caption text-muted-foreground">
              Die Scan-Fotos werden nur zum Messen genutzt und nie weitergegeben. Wir speichern nur den Vornamen, den Geburtsmonat und die Maße.
            </p>
          </section>
        )}
        {selected && (
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
        )}
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
        <ScanWidget sample={sample} onBeforeStart={selected ? undefined : saveKid} />
      </main>
    </>
  )
}
