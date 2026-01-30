/**
 * 🎯 CHRONOS INFINITY 2026 — Progress Component (Shadcn-style)
 * Premium progress bar with variants
 */
'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/app/lib/utils'

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'aurora' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'default', size = 'md', showValue, animated, ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    aurora: 'bg-gradient-to-r from-violet-500 to-purple-500',
    gradient: 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500',
  }

  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-white/10',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all duration-500 ease-out rounded-full',
            variantClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2 text-xs text-muted-foreground">
          {Math.round(value || 0)}%
        </span>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
