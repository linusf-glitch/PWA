import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

// One cell of a bento grid (design system 2.2, BentoTile). Put tiles in `grid grid-cols-2 gap-3
// grid-flow-dense`. One idea per tile; tone has a job: apricot = shoe, sage = growth, lilac = calendar.
type BentoTileProps = {
  /** wide: 2 columns. */
  span?: 'wide'
  tone?: 'apricot' | 'lilac' | 'sage'
  /** Small icon badge top left (a lucide icon). */
  icon?: ReactNode
  eyebrow?: string
  title?: ReactNode
  /** Big number, e.g. "+4 mm". */
  value?: ReactNode
  children?: ReactNode
  /** Usually a ShoeSticker, bottom right. */
  art?: ReactNode
  /** In-app link: the whole tile is the tap target and lifts on hover. */
  href?: string
  className?: string
}

const TONE = { apricot: 'bg-accent-apricot-soft', lilac: 'bg-accent-lilac-soft', sage: 'bg-accent-sage-soft' }

export function BentoTile({ span, tone, icon, eyebrow, title, value, children, art, href, className }: BentoTileProps) {
  const classes = cn(
    'relative flex min-h-35 flex-col gap-1 overflow-hidden rounded-lg p-4 text-left text-card-foreground shadow-card outline-none',
    tone ? cn(TONE[tone], 'border-transparent') : 'border-[1.5px] border-border bg-card',
    span === 'wide' && 'col-span-2',
    href &&
      'transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-soft)] hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99] active:shadow-card focus-visible:ring-4 focus-visible:ring-ring/45 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100',
    className,
  )
  const content = (
    <>
      {icon && (
        <span aria-hidden="true" className={cn('mb-2 flex size-10 items-center justify-center rounded-[14px] text-ink [&_svg]:size-[22px]', tone ? 'bg-card' : 'bg-muted')}>
          {icon}
        </span>
      )}
      {eyebrow && <span className="text-caption text-muted-foreground">{eyebrow}</span>}
      {title && <span className="text-h3">{title}</span>}
      {value != null && <span className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] tabular-nums">{value}</span>}
      {children}
      {art && (
        <span aria-hidden="true" className="pointer-events-none absolute right-[-6px] bottom-1.5">
          {art}
        </span>
      )}
    </>
  )
  return href ? (
    <Link data-slot="bento-tile" to={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div data-slot="bento-tile" className={classes}>
      {content}
    </div>
  )
}
