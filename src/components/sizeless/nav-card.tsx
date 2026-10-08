import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

type NavCardBaseProps = {
  title: string
  eyebrow?: string
  /** Extra line under the title: chips, a size badge, a sparkline, a date. */
  children?: ReactNode
  /** Optional visual on the left (icon or picture). */
  media?: ReactNode
  className?: string
}

type NavCardProps = NavCardBaseProps &
  ({ href: string; onClick?: never; disabled?: never } | { href?: never; onClick?: () => void; disabled?: boolean })

const cardClasses =
  'flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left text-card-foreground shadow-card outline-none active:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:shadow-none disabled:[&_[data-slot=nav-card-title]]:text-muted-foreground'

// Tappable card with a chevron (Home: current shoe, growth, next fit check). Renders an in-app link when
// given href, otherwise a button. The whole card is the tap target.
export function NavCard({ title, eyebrow, children, media, className, ...rest }: NavCardProps) {
  const content = (
    <>
      {media}
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
      <ChevronRight aria-hidden="true" className="size-6 shrink-0 text-muted-foreground" />
    </>
  )

  if (rest.href !== undefined) {
    return (
      <Link data-slot="nav-card" to={rest.href} className={cn(cardClasses, className)}>
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
      className={cn(cardClasses, className)}
    >
      {content}
    </button>
  )
}
