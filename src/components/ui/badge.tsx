// components/ui/badge.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: 
          "border-transparent bg-green-500 text-white [a&]:hover:bg-green-500/90 dark:bg-green-600 dark:[a&]:hover:bg-green-600/90",
        warning: 
          "border-transparent bg-yellow-500 text-white [a&]:hover:bg-yellow-500/90 dark:bg-yellow-600 dark:[a&]:hover:bg-yellow-600/90",
        danger: 
          "border-transparent bg-red-500 text-white [a&]:hover:bg-red-500/90 dark:bg-red-600 dark:[a&]:hover:bg-red-600/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Props dari Badge component type
export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeProps) { // Gunakan type BadgeProps yang diekspor
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }