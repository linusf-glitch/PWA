import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

// Small decoration only (design system 2.2 has no hand-drawn illustrations): the squiggle under a
// headline and the confetti burst. The shoe itself is ShoeSticker (./shoe-sticker.tsx).

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const star = (x: number, y: number, r: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = (i % 2 ? r * 0.48 : r) * (1 + (((i * 37) % 7) - 3) * 0.012)
    return `${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`
  })
  return `M${pts.join(' L')} Z`
}

type Accent = 'apricot' | 'lilac' | 'sage' | 'ink'
type DoodleName = 'star' | 'squiggle' | 'dots' | 'spark'

export function Doodle({ name = 'star', color = 'apricot', size = 28, className, style }: { name?: DoodleName; color?: Accent; size?: number; className?: string; style?: CSSProperties }) {
  const squiggle = name === 'squiggle'
  return (
    <svg className={cn('sz-doodle', className)} width={squiggle ? size * 2 : size} height={size} viewBox={squiggle ? '0 0 48 16' : '0 0 24 24'} aria-hidden="true" focusable="false" style={style}>
      {squiggle && <path className={`sz-ln-${color}`} d="M3 9 C8 2 12 15 18 8 S28 2 33 9 S42 14 45 7" />}
      {name === 'dots' && (
        <>
          <circle className={`sz-dot-${color}`} cx={5} cy={14} r={2.6} />
          <circle className={`sz-dot-${color}`} cx={12} cy={8} r={2.2} />
          <circle className={`sz-dot-${color}`} cx={19} cy={15} r={3} />
        </>
      )}
      {name === 'spark' && <path className={`sz-ln-${color}`} d="M12 3 C12.4 8 11.6 15 12 21 M3 12.2 C8 11.6 16 12.4 21 12" />}
      {name === 'star' && <path className={`sz-fl-${color}`} d={star(12, 12.5, 10)} stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />}
    </svg>
  )
}

/** Headline with a hand-drawn squiggle underneath. `animate` draws it once. */
export function Headline({ children, as: Tag = 'h1', size = 'display', animate, className }: { children: React.ReactNode; as?: 'h1' | 'h2'; size?: 'display' | 'h2'; animate?: boolean; className?: string }) {
  return (
    <Tag className={`${size === 'h2' ? 'text-h2' : 'text-display'} text-ink ${className ?? ''}`}>
      {children}
      <svg className={cn('sz-squig', animate && 'sz-squig-draw')} viewBox="0 0 112 12" width={112} height={12} aria-hidden="true" focusable="false">
        <path d="M3 7C12 2 17 11 27 6S44 2 55 7 72 11 83 6 100 3 109 7" pathLength={1} />
      </svg>
    </Tag>
  )
}

const CONFETTI = (() => {
  const colours: Accent[] = ['apricot', 'lilac', 'sage', 'ink']
  const shapes: DoodleName[] = ['squiggle', 'dots', 'star', 'spark']
  return Array.from({ length: 16 }, (_, i) => {
    const a = ((i * 360) / 16 + (i % 2 ? 9 : -6)) * (Math.PI / 180)
    const d = 78 + ((i * 29) % 44)
    return { dx: Math.round(Math.cos(a) * d), dy: Math.round(Math.sin(a) * d * 0.8 - 14), r: ((i * 47) % 120) - 60, c: colours[i % 4], s: shapes[(i * 3 + 1) % 4] }
  })
})()

/** One scribble burst (after a finished scan or a purchase). Change `play` to fire it again. Nothing under reduced motion. */
export function Confetti({ play = 0 }: { play?: number }) {
  if (reduced()) return null
  return (
    <div className="sz-confetti" key={play} aria-hidden="true">
      {CONFETTI.map((p, i) => (
        <span key={i} className="sz-confetti-piece" style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--r': `${p.r}deg`, animationDelay: `${(i % 4) * 30}ms` } as CSSProperties}>
          <Doodle name={p.s} color={p.c} size={16} />
        </span>
      ))}
    </div>
  )
}
