import { formatMonth, type Measurement } from '@/features/kids/kids'

import { dashFor, markerFor, type Marker } from './growth-marks'

// Foot length over time, drawn like the design system's GrowthChart (warm ink line with a slight hand
// wobble, apricot area, dotted gridlines, the latest value written out, the line draws in left to
// right). One child: points evenly spaced, month labels. Several children: one shared time axis, and
// each child has its own line style and marker shape (never colour); the legend repeats both.
export type GrowthSeries = { id: string; name: string; points: Measurement[] }

const W = 358
const H = 200
const PAD = { l: 34, r: 14, t: 22, b: 26 }
export function MarkerShape({ kind, x, y, r = 4.5 }: { kind: Marker; x: number; y: number; r?: number }) {
  const common = { fill: 'var(--ink)', stroke: 'var(--background)', strokeWidth: 2 }
  if (kind === 'square') return <rect x={x - r} y={y - r} width={2 * r} height={2 * r} rx={1} {...common} />
  if (kind === 'triangle') return <polygon points={`${x},${y - r - 1} ${x + r + 1},${y + r} ${x - r - 1},${y + r}`} strokeLinejoin="round" {...common} />
  if (kind === 'diamond') return <polygon points={`${x},${y - r - 1.5} ${x + r + 1.5},${y} ${x},${y + r + 1.5} ${x - r - 1.5},${y}`} strokeLinejoin="round" {...common} />
  if (kind === 'ring') return <circle cx={x} cy={y} r={r} {...common} fill="var(--background)" stroke="var(--ink)" />
  return <circle cx={x} cy={y} r={r} {...common} />
}

export function GrowthChart({ series, label, animate = true }: { series: GrowthSeries[]; label: string; animate?: boolean }) {
  const compare = series.length > 1
  const all = series.flatMap((s) => s.points)
  // Single chart: 5 mm steps like the design system. Comparison: 10 mm steps with an even number of
  // them, so the middle gridline is a round number too.
  const step = compare ? 10 : 5
  const lo = Math.floor((Math.min(...all.map((m) => m.lengthMm)) - 3) / step) * step
  let hi = Math.ceil((Math.max(...all.map((m) => m.lengthMm)) + 3) / step) * step
  if (compare && ((hi - lo) / step) % 2) hi += step
  const y = (mm: number) => PAD.t + ((hi - mm) * (H - PAD.t - PAD.b)) / (hi - lo || 1)
  const time = (d: string) => Date.parse(d)
  const t0 = Math.min(...all.map((m) => time(m.date)))
  const t1 = Math.max(...all.map((m) => time(m.date)))
  const span = W - PAD.l - PAD.r
  const x = (m: Measurement, i: number, n: number) =>
    PAD.l + (compare ? (t1 === t0 ? span / 2 : ((time(m.date) - t0) / (t1 - t0)) * span) : n < 2 ? span / 2 : (i * span) / (n - 1))
  const ticks = [lo, (lo + hi) / 2, hi].map(Math.round)
  const own = series[0].points
  const last = own[own.length - 1]
  const lastX = x(last, own.length - 1, own.length)
  const area = !compare && own.length > 1
    ? `${own.map((m, i) => `${i ? 'L' : 'M'}${x(m, i, own.length)} ${y(m.lengthMm)}`).join(' ')} L${lastX} ${H - PAD.b} L${x(own[0], 0, own.length)} ${H - PAD.b} Z`
    : null
  const labels = compare
    ? [{ key: 'a', text: formatMonth(new Date(t0).toISOString().slice(0, 10)), x: PAD.l, anchor: 'start' as const }, { key: 'b', text: formatMonth(new Date(t1).toISOString().slice(0, 10)), x: W - PAD.r, anchor: 'end' as const }]
    : own.map((m, i) => ({ key: m.date, text: formatMonth(m.date), x: x(m, i, own.length), anchor: (i === 0 ? 'start' : i === own.length - 1 ? 'end' : 'middle') as 'start' | 'middle' | 'end' }))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className={`block h-auto w-full overflow-visible ${animate ? 'sz-chart-anim' : ''}`}>
      <defs>
        <filter id="growth-wobble" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      {ticks.map((tk) => (
        <g key={tk}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(tk)} y2={y(tk)} stroke="var(--border-strong)" strokeDasharray="2 6" strokeLinecap="round" />
          <text x={PAD.l - 8} y={y(tk) + 4} textAnchor="end" fontSize={12} fontWeight={500} fill="var(--muted-foreground)">
            {tk}
          </text>
        </g>
      ))}
      {area && <path d={area} fill="var(--accent-apricot-soft)" opacity={0.85} />}
      {series.map((s, si) => (
        <g key={s.id}>
          {s.points.length > 1 && (
            <g filter="url(#growth-wobble)">
              <path
                className="sz-chart-line"
                pathLength={1}
                d={s.points.map((m, i) => `${i ? 'L' : 'M'}${x(m, i, s.points.length)} ${y(m.lengthMm)}`).join(' ')}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={compare ? 3 : 3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={compare ? dashFor(si) : undefined}
              />
            </g>
          )}
          {s.points.map((m, i) => (
            <MarkerShape key={m.date} kind={compare ? markerFor(si) : 'circle'} x={x(m, i, s.points.length)} y={y(m.lengthMm)} r={!compare && i === s.points.length - 1 ? 6.5 : 4.5} />
          ))}
        </g>
      ))}
      {!compare && <circle className="sz-chart-ring" cx={lastX} cy={y(last.lengthMm)} r={6.5} fill="none" stroke="var(--accent-apricot)" strokeWidth={2.5} />}
      {labels.map((l) => (
        <text key={l.key} x={l.x} y={H - 6} textAnchor={l.anchor} fontSize={12} fontWeight={500} fill="var(--muted-foreground)">
          {l.text}
        </text>
      ))}
      {!compare && (
        <text x={lastX} y={y(last.lengthMm) - 14} textAnchor="end" fontSize={13} fontWeight={600} fill="var(--ink)">
          {last.lengthMm} mm
        </text>
      )}
    </svg>
  )
}
