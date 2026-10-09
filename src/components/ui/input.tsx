import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-md border-[1.5px] border-input bg-card px-4 py-1 text-base text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-muted disabled:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

// Native dropdown in the Input look (month and year on the first-visit form).
function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return <select data-slot="select" className={cn('h-12 w-full min-w-0 rounded-md border-[1.5px] border-input bg-card px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive', className)} {...props} />
}

export { Input, Select }
