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
        'inline-flex h-8 items-center gap-1 rounded-md bg-accent px-2.5 text-label whitespace-nowrap text-accent-foreground',
        className,
      )}
    >
      <span className="font-medium">{system}</span>{' '}
      <span className="font-semibold">{size}</span>
    </span>
  )
}
