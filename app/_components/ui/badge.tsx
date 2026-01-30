/**
 * 🎯 CHRONOS INFINITY 2026 — Badge Component (Shadcn-style)
 * Premium badge with variants
 */
'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        warning:
          'border-transparent bg-amber-500/20 text-amber-400 border-amber-500/30',
        error:
          'border-transparent bg-red-500/20 text-red-400 border-red-500/30',
        glass:
          'bg-white/10 backdrop-blur-sm border-white/20 text-white',
        aurora:
          'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300',
        info:
          'border-transparent bg-blue-500/20 text-blue-400 border-blue-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
}

function Badge({ className, variant, pulse, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
