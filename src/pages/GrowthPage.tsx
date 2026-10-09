import { Footprints } from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { Headline } from '@/components/illustration/illustration'
import { PageHeader } from '@/components/shell/page-header'
import { Button } from '@/components/ui/button'
import { formatDate, type Kid, type Measurement } from '@/features/kids/kids'
import { useKids } from '@/features/kids/useKids'

const W = 320
const H = 160
const PAD = { l: 34, r: 12, t: 12, b: 22 }
// Kids differ by line style and marker shape, never by colour (wireframe S15 all kids).
const STYLES = [
  { dash: undefined, marker: 'circle' },
  { dash: '6 4', marker: 'square' },
  { dash: '2 4', marker: 'triangle' },
  { dash: '10 4 2 4', marker: 'diamond' },
] as const

function Marker({ kind, x, y }: { kind: (typeof STYLES)[number]['marker']; x: number; y: number }) {
  const common = { fill: 'var(--ink, currentColor)' }
  if (kind === 'circle') return <circle cx={x} cy={y} r={4} {...common} />
  if (kind === 'square') return <rect x={x - 4} y={y - 4} width={8} height={8} {...common} />
  if (kind === 'triangle') return <polygon points={`${x},${y - 5} ${x + 5},${y + 4} ${x - 5},${y + 4}`} {...common} />
  return <polygon points={`${x},${y - 5} ${x + 5},${y} ${x},${y + 5} ${x - 5},${y}`} {...common} />
}

// Foot length over time. Several kids share one chart: x is the date, y the length in mm.
function Chart({ series, label }: { series: { kid: Kid; points: Measurement[] }[]; label: string }) {
  const all = series.flatMap((s) => s.points)
  const t = (d: string) => Date.parse(d)
  const t0 = Math.min(...all.map((m) => t(m.date)))
  const t1 = Math.max(...all.map((m) => t(m.date)))
  const lo = Math.floor((Math.min(...all.map((m) => m.lengthMm)) - 5) / 10) * 10
  const hi = Math.ceil((Math.max(...all.map((m) => m.lengthMm)) + 5) / 10) * 10
  const x = (d: string) => PAD.l + (t1 === t0 ? (W - PAD.l - PAD.r) / 2 : ((t(d) - t0) / (t1 - t0)) * (W - PAD.l - PAD.r))
  const y = (mm: number) => PAD.t + (1 - (mm - lo) / (hi - lo)) * (H - PAD.t - PAD.b)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="w-full text-ink">
      {[lo, (lo + hi) / 2, hi].map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.12} />
          <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.6}>
            {v}
          </text>
        </g>
      ))}
      {series.map(({ kid, points }, i) => {
        const st = STYLES[i % STYLES.length]
        return (
          <g key={kid.id} color="inherit">
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray={st.dash}
                points={points.map((m) => `${x(m.date)},${y(m.lengthMm)}`).join(' ')}
              />
            )}
            {points.map((m) => (
              <Marker key={m.date} kind={st.marker} x={x(m.date)} y={y(m.lengthMm)} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

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
          <Chart series={withHistory.map((kid) => ({ kid, points: kid.history! }))} label="Fußlänge aller Kinder in mm" />
          <ul className="flex flex-wrap gap-4 text-caption">
            {withHistory.map((k, i) => (
              <li key={k.id} className="flex items-center gap-2">
                <svg width={28} height={12} aria-hidden="true" className="text-ink">
                  <line x1={0} x2={28} y1={6} y2={6} stroke="currentColor" strokeWidth={2} strokeDasharray={STYLES[i % STYLES.length].dash} />
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
            <Chart series={[{ kid: selected!, points: own }]} label={`Fußlänge von ${selected!.name} in mm`} />
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
