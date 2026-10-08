import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Sizeless buttons (design system "Button"): sentence case, 44px minimum touch target,
// disabled shows muted grey instead of fading. Primary on mobile: size="lg" + className="w-full".
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border-[1.5px] border-transparent text-button normal-case transition-[background-color,color,transform] duration-100 active:scale-[0.98] disabled:pointer-events-none disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground active:bg-primary-pressed',
        destructive: 'bg-destructive text-destructive-foreground',
        outline:
          'border-primary bg-card text-primary active:border-primary-pressed active:bg-accent active:text-primary-pressed',
        secondary: 'bg-secondary text-secondary-foreground active:bg-accent',
        ghost: 'text-foreground active:bg-muted',
        link: 'text-primary underline decoration-[1.5px] underline-offset-[3px] active:scale-100 active:text-primary-pressed disabled:bg-transparent',
      },
      size: {
        default: 'min-h-11 px-6',
        sm: 'min-h-11 px-4',
        lg: 'min-h-14 px-6',
        icon: 'size-11 rounded-full',
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
