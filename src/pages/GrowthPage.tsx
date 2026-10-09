import { Footprints } from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { GrowthChart, MarkerShape } from '@/components/sizeless/growth-chart'
import { dashFor, markerFor } from '@/components/sizeless/growth-marks'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'

// S15 Growth: foot length per scan and a table, one child; "Alle Kinder vergleichen" overlays all.
// Sample data until scans are read from Supabase (phase 6). No growth band yet (open question, doc Q4).
export default function GrowthPage() {
  const { selected, kids } = useKids()
  const compare = useLocation().pathname === '/growth/compare'
  const own = selected?.history ?? []
  const withHistory = kids.filter((k) => k.history?.length)

  if (compare)
    return (
      <>
        <PageHeader title="Alle Kinder" back="step" />
        <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 lg:p-8">
          <GrowthChart series={withHistory.map((k) => ({ id: k.id, name: k.name, points: k.history! }))} label="Fußlänge aller Kinder in mm" />
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-caption">
            {withHistory.map((k, i) => (
              <li key={k.id} className="flex items-center gap-2">
                <svg width={34} height={14} aria-hidden="true">
                  <line x1={0} x2={34} y1={7} y2={7} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeDasharray={dashFor(i)} />
                  <MarkerShape kind={markerFor(i)} x={17} y={7} r={4} />
                </svg>
                {k.name}
              </li>
            ))}
          </ul>
        </main>
      </>
    )

  return (
    <>
      <PageHeader title="Wachstum" kidSwitcher />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 lg:p-8">
        {own.length === 0 ? (
          <section className="flex flex-col items-start gap-3">
            <Headline as="h2" size="h2" animate>
              Noch keine Messung
            </Headline>
            <p className="text-body">{selected ? `Nach dem ersten Scan von ${selected.name}` : 'Nach dem ersten Scan'} erscheint hier die Kurve.</p>
          </section>
        ) : (
          <>
            {own.length === 1 && (
              <p className="text-body">
                Bisher eine Messung. Beim nächsten Check
                {selected?.nextFitCheck && ` (um den ${formatDate(selected.nextFitCheck)})`} kommt ein zweiter Punkt dazu.
              </p>
            )}
            <GrowthChart series={[{ id: selected!.id, name: selected!.name, points: own }]} label={`Fußlänge von ${selected!.name} in mm`} />
            <table className="w-full text-left text-body-small">
              <thead className="text-caption text-muted-foreground">
                <tr>
                  <th className="py-2 font-normal">Datum</th>
                  <th className="py-2 font-normal">Länge / Breite (mm)</th>
                  <th className="py-2 font-normal">Größe</th>
                  <th className="py-2 font-normal">Schuh</th>
                </tr>
              </thead>
              <tbody>
                {[...own].reverse().map((m) => (
                  <tr key={m.date} className="border-t border-border">
                    <td className="py-2">{formatDate(m.date)}</td>
                    <td className="py-2">
                      {m.lengthMm} / {m.widthMm}
                    </td>
                    <td className="py-2">EU {m.size}</td>
                    <td className="py-2">{m.shoe ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {withHistory.length > 1 && own.length > 0 && (
          <Button asChild variant="link" className="self-start">
            <Link to="/growth/compare">Alle Kinder vergleichen</Link>
          </Button>
        )}
        {selected && (
          <Button asChild variant="outline" className="w-full">
            <Link to={selected.shoe ? '/rescan' : '/scan'}>
              <Footprints aria-hidden="true" />
              Füße von {selected.name} neu scannen
            </Link>
          </Button>
        )}
      </main>
    </>
  )
}
