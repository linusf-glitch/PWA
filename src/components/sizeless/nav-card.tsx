import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

type NavCardBaseProps = {
  title: string
  eyebrow?: string
  /** Extra line under the title: chips, a size badge, a sparkline, a date. */
  children?: ReactNode
  /** Optional visual on the left (icon or picture), shown on a round tile. */
  media?: ReactNode
  /** Soft tint, one job each: apricot = shoe, sage = growth, lilac = calendar. At most three tints per screen. */
  tone?: 'apricot' | 'lilac' | 'sage'
  className?: string
}

type NavCardProps = NavCardBaseProps &
  ({ href: string; onClick?: never; disabled?: never } | { href?: never; onClick?: () => void; disabled?: boolean })

const cardClasses =
  'flex w-full items-center gap-4 rounded-lg border-[1.5px] border-border bg-card p-4 text-left text-card-foreground shadow-card outline-none transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-soft)] hover:-translate-y-0.5 hover:shadow-lift active:translate-y-px active:scale-[0.99] active:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted disabled:shadow-none disabled:hover:translate-y-0 disabled:[&_[data-slot=nav-card-title]]:text-muted-foreground motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100'

const toneClasses = {
  apricot: 'border-transparent bg-accent-apricot-soft',
  lilac: 'border-transparent bg-accent-lilac-soft',
  sage: 'border-transparent bg-accent-sage-soft',
}

// Tappable card with a chevron (Home: current shoe, growth, next fit check). Renders an in-app link when
// given href, otherwise a button. The whole card is the tap target.
export function NavCard({ title, eyebrow, children, media, tone, className, ...rest }: NavCardProps) {
  const classes = cn(cardClasses, tone && toneClasses[tone], className)
  const content = (
    <>
      {media && (
        <span className={cn('flex size-15 shrink-0 items-center justify-center rounded-2xl', tone ? 'bg-card' : 'bg-muted')}>
          {media}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {eyebrow && <span className="text-caption text-muted-foreground">{eyebrow}</span>}
        <span data-slot="nav-card-title" className="text-h3">
          {title}
        </span>
        {children && (
          <span className="mt-1 flex flex-wrap items-center gap-2 text-body-small text-muted-foreground">
            {children}
          </span>
        )}
      </span>
      <ChevronRight aria-hidden="true" className="size-6 shrink-0 text-ink" />
    </>
  )

  if (rest.href !== undefined) {
    return (
      <Link data-slot="nav-card" to={rest.href} className={classes}>
        {content}
      </Link>
    )
  }
  return (
    <button
      type="button"
      data-slot="nav-card"
      onClick={rest.onClick}
      disabled={rest.disabled}
      className={classes}
    >
      {content}
    </button>
  )
}
