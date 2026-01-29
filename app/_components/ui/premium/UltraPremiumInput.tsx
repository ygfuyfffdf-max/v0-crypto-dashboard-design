'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ✨ ULTRA PREMIUM INPUT - CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════
// Input con efectos premium avanzados:
// - Float label animado
// - Energy line en focus
// - Glow effect pulsante
// - Focus state con blur halo
// - Validación visual integrada
// ═══════════════════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface UltraPremiumInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  energyLine?: boolean
  glowEffect?: boolean
  variant?: 'default' | 'glass' | 'neon'
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STYLE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

const variantStyles: Record<string, string> = {
  default: 'bg-white/5 border-white/10 focus:border-violet-500',
  glass: 'bg-white/5 backdrop-blur-xl border-white/10 focus:border-violet-500',
  neon: 'bg-black/20 border-violet-500/30 focus:border-violet-500 focus:shadow-neon',
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export const UltraPremiumInput = React.forwardRef<HTMLInputElement, UltraPremiumInputProps>(
  (
    {
      label,
      error,
      success,
      icon: Icon,
      iconPosition = 'left',
      energyLine = true,
      glowEffect = true,
      variant = 'glass',
      className,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChange,
      type = 'text',
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!value || !!defaultValue)
    const inputRef = useRef<HTMLInputElement>(null)

    // ═══════════════════ HANDLERS ═══════════════════
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      onChange?.(e)
    }

    // ═══════════════════ COMPUTED CLASSES ═══════════════════
    const labelActive = isFocused || hasValue || !!value

    return (
      <div className="group relative w-full">
        {/* ═══════════════════ INPUT CONTAINER ═══════════════════ */}
        <div className="relative">
          {/* Icon Left */}
          {Icon && iconPosition === 'left' && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-violet-400">
              <Icon size={18} />
            </div>
          )}

          {/* Input Element */}
          <input
            ref={ref || inputRef}
            type={type}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              // Base styles
              'peer w-full rounded-xl border px-4 py-3',
              'text-white transition-all duration-300',
              'placeholder:text-transparent',
              'focus:bg-white/10 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',

              // Variant styles
              variantStyles[variant],

              // Icon padding
              Icon && iconPosition === 'left' && 'pl-12',
              Icon && iconPosition === 'right' && 'pr-12',

              // Error state
              error && 'border-red-500/50 focus:border-red-500',

              // Success state
              success && 'border-green-500/50 focus:border-green-500',

              // Glow effect
              glowEffect && isFocused && 'shadow-glow',

              className,
            )}
            {...props}
          />

          {/* Icon Right */}
          {Icon && iconPosition === 'right' && (
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-violet-400">
              <Icon size={18} />
            </div>
          )}

          {/* ═══════════════════ FLOAT LABEL ═══════════════════ */}
          {label && (
            <motion.label
              initial={false}
              animate={{
                top: labelActive ? '-8px' : '50%',
                left: labelActive ? '12px' : Icon && iconPosition === 'left' ? '48px' : '16px',
                fontSize: labelActive ? '0.75rem' : '0.875rem',
                y: labelActive ? 0 : '-50%',
              }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'pointer-events-none absolute origin-left',
                'rounded px-2 py-0.5',
                'transition-colors duration-300',
                'bg-gray-900',
                labelActive
                  ? error
                    ? 'text-red-400'
                    : success
                      ? 'text-green-400'
                      : 'text-violet-400'
                  : 'text-gray-400',
                disabled && 'opacity-50',
              )}
            >
              {label}
            </motion.label>
          )}

          {/* ═══════════════════ ENERGY LINE ═══════════════════ */}
          {energyLine && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isFocused ? '100%' : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'absolute bottom-0 left-0 h-[2px]',
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500',
                error && 'from-red-500 via-pink-500 to-red-600',
                success && 'from-green-500 via-emerald-500 to-green-600',
              )}
            />
          )}
        </div>

        {/* ═══════════════════ GLOW HALO ═══════════════════ */}
        {glowEffect && isFocused && !disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'pointer-events-none absolute inset-0 -z-10 rounded-xl blur-xl',
              error
                ? 'bg-red-500/20'
                : success
                  ? 'bg-green-500/20'
                  : 'bg-violet-500/20 animate-energy-pulse',
            )}
          />
        )}

        {/* ═══════════════════ ERROR MESSAGE ═══════════════════ */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* ═══════════════════ SUCCESS MESSAGE ═══════════════════ */}
        {success && !error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-green-400"
          >
            ✓ Campo válido
          </motion.p>
        )}
      </div>
    )
  },
)

UltraPremiumInput.displayName = 'UltraPremiumInput'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TEXTAREA VARIANT
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface UltraPremiumTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: string
  success?: boolean
  energyLine?: boolean
  glowEffect?: boolean
  variant?: 'default' | 'glass' | 'neon'
}

export const UltraPremiumTextarea = React.forwardRef<
  HTMLTextAreaElement,
  UltraPremiumTextareaProps
>(
  (
    {
      label,
      error,
      success,
      energyLine = true,
      glowEffect = true,
      variant = 'glass',
      className,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChange,
      disabled,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!value || !!defaultValue)

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(!!e.target.value)
      onChange?.(e)
    }

    const labelActive = isFocused || hasValue || !!value

    return (
      <div className="group relative w-full">
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            rows={rows}
            className={cn(
              'peer w-full rounded-xl border px-4 py-3',
              'text-white transition-all duration-300',
              'placeholder:text-transparent',
              'focus:bg-white/10 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'resize-none',
              variantStyles[variant],
              error && 'border-red-500/50 focus:border-red-500',
              success && 'border-green-500/50 focus:border-green-500',
              glowEffect && isFocused && 'shadow-glow',
              className,
            )}
            {...props}
          />

          {label && (
            <motion.label
              initial={false}
              animate={{
                top: labelActive ? '-8px' : '16px',
                left: '12px',
                fontSize: labelActive ? '0.75rem' : '0.875rem',
              }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'pointer-events-none absolute origin-left',
                'rounded bg-gray-900 px-2 py-0.5',
                'transition-colors duration-300',
                labelActive
                  ? error
                    ? 'text-red-400'
                    : success
                      ? 'text-green-400'
                      : 'text-violet-400'
                  : 'text-gray-400',
                disabled && 'opacity-50',
              )}
            >
              {label}
            </motion.label>
          )}

          {energyLine && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isFocused ? '100%' : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'absolute bottom-0 left-0 h-[2px]',
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500',
                error && 'from-red-500 via-pink-500 to-red-600',
                success && 'from-green-500 via-emerald-500 to-green-600',
              )}
            />
          )}
        </div>

        {glowEffect && isFocused && !disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'pointer-events-none absolute inset-0 -z-10 rounded-xl blur-xl',
              error
                ? 'bg-red-500/20'
                : success
                  ? 'bg-green-500/20'
                  : 'bg-violet-500/20 animate-energy-pulse',
            )}
          />
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {success && !error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-green-400"
          >
            ✓ Campo válido
          </motion.p>
        )}
      </div>
    )
  },
)

UltraPremiumTextarea.displayName = 'UltraPremiumTextarea'
