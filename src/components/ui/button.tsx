import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Sizeless buttons (design system "Button", version 2.2): round gel pills, sentence case, 44px minimum
// touch target. The default is the one teal primary per screen (size="lg" className="w-full" on Home);
// teal fills nothing else. `outline` is the white gel secondary. Pressed sinks in and shrinks to 98%.
// Focus is a soft teal halo (keyboard only). Disabled turns flat muted grey instead of fading.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-button normal-case transition-[background-color,color,transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-spring)] active:scale-[0.98] disabled:pointer-events-none disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-ring/45 aria-invalid:border-destructive motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default:
          'sz-gel-primary bg-primary text-primary-foreground shadow-button active:shadow-button-pressed',
        destructive: 'bg-destructive text-destructive-foreground',
        outline:
          'sz-gel-secondary bg-card text-ink shadow-button-secondary active:shadow-button-secondary-pressed',
        secondary: 'bg-secondary text-secondary-foreground active:bg-accent',
        ghost: 'text-foreground active:bg-muted',
        link: 'rounded-md text-primary underline decoration-wavy decoration-2 underline-offset-4 active:scale-100 active:text-primary-pressed disabled:bg-transparent',
      },
      size: {
        default: 'min-h-11 px-6',
        sm: 'min-h-11 px-4',
        lg: 'min-h-15 px-8',
        icon: 'size-11',
      },
    },
    // Links sit inline with text, so they keep a narrow padding whatever the size.
    compoundVariants: [{ variant: 'link', className: 'px-2' }],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// oxlint-disable-next-line react/only-export-components -- shadcn exports the variants helper too
export { Button, buttonVariants }
