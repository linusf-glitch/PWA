import * as React from 'react'

import { cn } from '@/lib/utils'

// Toggle (design system "Checkbox, Radio, Switch": muted track, ink when on, white thumb, no teal). The label text sits
// left, the 44x26 track right; the whole row is the target (44px). A native checkbox with role="switch"
// stays behind it for forms and screen readers.
function Switch({ className, children, ...props }: Omit<React.ComponentProps<'input'>, 'type' | 'role'>) {
  return (
    <label className={cn('group flex min-h-11 cursor-pointer items-start justify-between gap-4 py-2.5 has-disabled:cursor-not-allowed', className)}>
      <span className="text-body-small">{children}</span>
      <input type="checkbox" role="switch" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="relative mt-px h-[26px] w-11 shrink-0 rounded-full bg-muted shadow-[inset_0_0_0_1.5px_var(--input)] transition-[background-color,box-shadow] duration-200 ease-out group-hover:shadow-[inset_0_0_0_1.5px_var(--ink)] group-has-checked:bg-ink group-has-checked:shadow-[inset_0_0_0_1.5px_var(--ink)] group-has-focus-visible:ring-4 group-has-focus-visible:ring-ring/45 group-has-disabled:opacity-50 motion-reduce:transition-none"
      >
        <span className="absolute top-[3px] left-[3px] size-5 rounded-full bg-card shadow-[0_0_0_1px_rgb(43_34_32/0.18),0_1px_2px_rgb(43_34_32/0.18)] transition-[translate] duration-[180ms] ease-[cubic-bezier(.34,1.3,.64,1)] group-has-checked:translate-x-[18px] motion-reduce:transition-none" />
      </span>
    </label>
  )
}

export { Switch }
