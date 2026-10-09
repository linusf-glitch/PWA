import * as React from 'react'

import { cn } from '@/lib/utils'

// Toggle (not in the design system yet, styled like `Checkbox`: ink when on, no teal). The label text sits
// left, the 48x28 track right; the whole row is the target (44px). A native checkbox with role="switch"
// stays behind it for forms and screen readers.
function Switch({ className, children, ...props }: Omit<React.ComponentProps<'input'>, 'type' | 'role'>) {
  return (
    <label className={cn('group flex min-h-11 cursor-pointer items-start justify-between gap-4 py-2.5 has-disabled:cursor-not-allowed', className)}>
      <span className="text-body-small">{children}</span>
      <input type="checkbox" role="switch" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="relative mt-px h-7 w-12 shrink-0 rounded-full bg-card shadow-[inset_0_0_0_1.5px_var(--input)] transition-[background-color,box-shadow] duration-150 group-hover:shadow-[inset_0_0_0_1.5px_var(--ink)] group-has-checked:bg-ink group-has-checked:shadow-[inset_0_0_0_1.5px_var(--ink)] group-has-focus-visible:ring-4 group-has-focus-visible:ring-ring/45 group-has-disabled:bg-muted motion-reduce:transition-none"
      >
        <span className="absolute top-1 left-1 size-5 rounded-full bg-ink transition-[transform,background-color] duration-150 group-has-checked:translate-x-5 group-has-checked:bg-primary-foreground motion-reduce:transition-none" />
      </span>
    </label>
  )
}

export { Switch }
