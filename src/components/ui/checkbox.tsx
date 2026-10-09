import * as React from 'react'

import { cn } from '@/lib/utils'

// Tick mark (design system "Checkbox", 2026-10-09): a 22px box with a 1.5px rim and 7px corners; when on it
// fills with ink and a white tick draws itself in 180ms. Teal is not used. The whole row is the target
// (44px). The native input stays for forms and screen readers, but is hidden behind the box.
function Checkbox({ className, children, ...props }: Omit<React.ComponentProps<'input'>, 'type'>) {
  return (
    <label className={cn('group flex min-h-11 cursor-pointer items-start gap-3 py-2.5 has-disabled:cursor-not-allowed', className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="mt-px flex size-[22px] shrink-0 items-center justify-center rounded-[7px] bg-card shadow-[inset_0_0_0_1.5px_var(--input)] transition-[background-color,box-shadow] duration-150 group-hover:shadow-[inset_0_0_0_1.5px_var(--ink)] group-has-checked:bg-ink group-has-checked:shadow-[inset_0_0_0_1.5px_var(--ink)] group-has-focus-visible:ring-4 group-has-focus-visible:ring-ring/45 group-has-disabled:bg-muted group-has-disabled:shadow-[inset_0_0_0_1.5px_var(--border-strong)] group-active:scale-95 motion-reduce:transition-none"
      >
        <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-primary-foreground stroke-[3]" strokeLinecap="round" strokeLinejoin="round">
          <path
            pathLength={1}
            d="M5 12.5l4.5 4.5L19 7.5"
            className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[180ms] ease-out group-has-checked:[stroke-dashoffset:0] motion-reduce:transition-none"
          />
        </svg>
      </span>
      <span className="text-body-small">{children}</span>
    </label>
  )
}

export { Checkbox }
