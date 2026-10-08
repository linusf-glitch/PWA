import { cn } from '@/lib/utils'

type SizeBadgeProps = {
  size: number | string
  system?: string
  className?: string
}

// Shoe size, for example "EU 27".
export function SizeBadge({ size, system = 'EU', className }: SizeBadgeProps) {
  return (
    <span
      data-slot="size-badge"
      className={cn(
        'inline-flex h-8 -rotate-[1.5deg] items-center gap-1 rounded-xl border-[1.5px] border-ink bg-accent-apricot-soft px-3 text-label whitespace-nowrap text-ink',
        className,
      )}
    >
      <span className="font-medium">{system}</span>{' '}
      <span className="font-semibold tabular-nums">{size}</span>
    </span>
  )
}
