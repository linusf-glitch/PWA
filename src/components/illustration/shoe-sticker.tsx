import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import type { ShoeColour } from './shoe-colour'

// The real Sizeless shoe as a flat sticker (design system 2.2, ShoeSticker): white die-cut edge,
// soft shadow, small tilt. It shows the product (colourway), never a setting.

// Product colours, not UI tokens.
const SHOES: Record<ShoeColour, { label: string; dark: string; light: string; strap: string; accent: string }> = {
  green: { label: 'Grün', dark: '#1f6a46', light: '#8ccaa6', strap: '#c4e6d6', accent: '#e35d68' },
  blue: { label: 'Blau', dark: '#2b4b7e', light: '#a6dbe2', strap: '#8fd2df', accent: '#e2742c' },
  purple: { label: 'Lila', dark: '#3e1c6e', light: '#7b45d6', strap: '#a882e3', accent: '#f27fbc' },
}

const GUM = '#c99460'
const GUM_D = '#a6733f'
const UPPER = 'M3 74C0 52 2 30 7 17C9 10 15 8 21 11C33 16 49 12 61 6C69 2 76 2 81 6C100 14 132 20 162 28C192 36 214 50 214 70L204 74C150 82 60 83 3 78Z'
const TOE = 'M114 19C140 22 166 27 186 34C206 42 214 54 214 70L204 74C180 77 152 79 130 80C124 60 118 40 112 21Z'
const COLLAR = 'M22 13C34 18 50 14 64 7C57 15 41 21 26 19Z'
const SOLE = 'M2 72C2 66 10 64 16 68L20 78C60 82 120 82 160 80C180 79 196 74 204 66C210 62 218 66 218 74C218 86 212 96 200 100C150 106 60 106 20 104C8 103 2 92 2 72Z'
const LOOPS = 'M7 22C4 10 10 1 16 3C22 5 24 11 22 16M67 9C66 0 74 -4 80 -1C86 2 88 6 86 10'
const TREAD = Array.from({ length: 18 }, (_, i) => {
  const x = 14 + i * 11
  return i % 2 ? `M${x} 92l3.5 3.5l3.5 -3.5` : `M${x} 96l3.5 -3.5l3.5 3.5`
}).join('')

type ShoeStickerProps = {
  colour?: ShoeColour
  /** Width in px. 72 in cards, 110-170 in heroes and empty states. Below 60 use an icon. */
  size?: number
  /** Degrees, -10 to +4. */
  tilt?: number
  /** Pop in once. */
  animate?: boolean
  /** true for "Sizeless-Schuh in …", or own text; otherwise hidden from screen readers. */
  label?: boolean | string
  className?: string
}

export function ShoeSticker({ colour = 'green', size = 96, tilt = -6, animate, label, className }: ShoeStickerProps) {
  const s = SHOES[colour]
  const name = label === true ? `Sizeless-Schuh in ${s.label}` : label || undefined
  return (
    <svg
      className={cn('sz-sticker', animate && 'sz-pop', className)}
      width={size}
      height={Math.round((size * 128) / 236)}
      viewBox="-9 -11 236 128"
      focusable="false"
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : 'true'}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
    >
      <g fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" strokeLinecap="round">
        <path d={UPPER} />
        <path d={SOLE} />
        <path d={LOOPS} fill="none" strokeWidth={17} />
      </g>
      <path d={LOOPS} fill="none" stroke={s.accent} strokeWidth={5} strokeLinecap="round" />
      <path d={UPPER} fill={s.dark} />
      <path d={TOE} fill={s.light} />
      <path d={COLLAR} fill="rgb(0 0 0 / 0.28)" />
      <g strokeLinecap="butt">
        <line x1={2} y1={58} x2={124} y2={68} stroke={s.strap} strokeWidth={9} />
        <line x1={40} y1={62} x2={68} y2={65} stroke={s.accent} strokeWidth={12} />
        <path d="M49 60l3 3.4l-3 3.4M55 60.5l3 3.4l-3 3.4" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
        <line x1={88} y1={59} x2={88} y2={73} stroke={s.strap} strokeWidth={5} strokeLinecap="round" />
        <circle cx={101} cy={67} r={3.2} fill="none" stroke="#9b958f" strokeWidth={1.6} />
        <line x1={107} y1={8} x2={84} y2={47} stroke={s.strap} strokeWidth={15} />
        <line x1={89.6} y1={38.5} x2={83.4} y2={49} stroke={s.accent} strokeWidth={16} />
        <line x1={137} y1={25} x2={118} y2={58} stroke={s.strap} strokeWidth={15} />
        <line x1={122.6} y1={50.5} x2={117.4} y2={59.5} stroke={s.accent} strokeWidth={16} />
      </g>
      <path d={SOLE} fill={GUM} />
      <path d={TREAD} fill="none" stroke={GUM_D} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
