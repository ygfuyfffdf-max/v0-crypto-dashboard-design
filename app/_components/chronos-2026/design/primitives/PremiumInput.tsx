/**
 * ✨ INPUT PREMIUM - Input con label flotante y efectos glow
 * Micro-interacciones avanzadas con validación visual
 */

'use client'

import { cn } from '@/app/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="group relative w-full">
        {/* Label flotante */}
        <label
          className={cn(
            'absolute top-1/2 left-4 -translate-y-1/2',
            'pointer-events-none text-gray-400',
            'transition-all duration-300',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base',
            'peer-focus:top-2 peer-focus:text-xs',
            'peer-focus:text-violet-400',
            error && 'peer-focus:text-rose-400',
          )}
        >
          {label}
        </label>

        {/* Input */}
        <input
          ref={ref}
          className={cn(
            'peer w-full rounded-xl px-4 pt-6 pb-2',
            'border border-white/10 bg-white/[0.03]',
            'text-white placeholder-transparent',
            'focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20',
            'focus:bg-white/[0.05]',
            'transition-all duration-300',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20',
            className,
          )}
          {...props}
        />

        {/* Línea de brillo inferior */}
        <div
          className={cn(
            'absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2',
            'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500',
            'group-focus-within:w-full',
            'transition-all duration-500',
            error && 'from-rose-500 via-rose-400 to-rose-500',
          )}
        />

        {/* Error o helper text */}
        {(error || helperText) && (
          <p className={cn('mt-2 text-sm', error ? 'text-rose-400' : 'text-gray-500')}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  },
)

PremiumInput.displayName = 'PremiumInput'
