/**
 * 🎯 CHRONOS INFINITY 2026 — Input Component (Shadcn-style)
 * Premium input with variants
 */
'use client'

import * as React from 'react'
import { cn } from '@/app/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'glass' | 'aurora'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', icon, iconPosition = 'left', error, ...props }, ref) => {
    const variants = {
      default: 'border-input bg-transparent',
      glass: 'bg-white/5 backdrop-blur-xl border-white/10 focus:border-white/20 focus:bg-white/8',
      aurora: 'bg-violet-500/5 border-violet-500/20 focus:border-violet-500/40 focus:ring-violet-500/20',
    }

    const inputElement = (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          variants[variant],
          error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
          icon && iconPosition === 'left' && 'pl-10',
          icon && iconPosition === 'right' && 'pr-10',
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (icon) {
      return (
        <div className="relative">
          {iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          {inputElement}
          {iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = 'Input'

export { Input }
