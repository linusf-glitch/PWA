import { CircleAlert } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Sizeless text field: card background, 44px+ tall, teal focus ring with a gap, red border when invalid.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-md border-[1.5px] border-input bg-card px-4 text-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

// Error under a field: soft red box with an icon, text stays dark (design system "Alert" rule).
function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="flex gap-2 rounded-md bg-destructive-soft p-3 text-body-small text-foreground">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
      {children}
    </p>
  )
}

export { FieldError, Input }
