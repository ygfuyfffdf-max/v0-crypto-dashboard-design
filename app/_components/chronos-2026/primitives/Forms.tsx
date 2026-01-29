/**
 * 📝 FORMS 2026 - FORMULARIOS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Componentes de formulario con diseño glassmorphism
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { forwardRef, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════════════════════════════

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  (
    { label, error, hint, icon, iconPosition = 'left', className = '', onFocus, onBlur, ...props },
    ref,
  ) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-white/70">
            {label}
            {props.required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-white/40">{icon}</div>
          )}

          <input
            ref={ref}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all duration-300 placeholder:text-white/30 focus:border-purple-500/50 focus:bg-white/10 focus:outline-none ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${error ? 'border-red-500/50 bg-red-500/5' : ''} ${focused ? 'shadow-[0_0_20px_rgba(139,0,255,0.2)]' : ''} `}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40">{icon}</div>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      </div>
    )
  },
)

PremiumInput.displayName = 'PremiumInput'

// ═══════════════════════════════════════════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════

export interface PremiumButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      className = '',
      children,
      disabled,
      onClick,
      type = 'button',
    },
    ref,
  ) => {
    const variants = {
      primary:
        'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/25',
      secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
      ghost: 'bg-transparent hover:bg-white/10 text-white/70 hover:text-white',
      danger:
        'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25',
      success:
        'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className} `}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </motion.button>
    )
  },
)

PremiumButton.displayName = 'PremiumButton'

// ═══════════════════════════════════════════════════════════════════════════════════
// SELECT
// ═══════════════════════════════════════════════════════════════════════════════════

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface PremiumSelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export function PremiumSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  className = '',
}: PremiumSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all duration-300 hover:bg-white/10 ${error ? 'border-red-500/50' : ''} `}
        >
          <span className={selected ? 'text-white' : 'text-white/40'}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-gray-900/95 py-2 shadow-2xl backdrop-blur-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/10 ${value === option.value ? 'bg-purple-500/10 text-purple-400' : 'text-white/80'} `}
              >
                {option.icon}
                <span>{option.label}</span>
                {value === option.value && <Check className="ml-auto h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// TEXTAREA
// ═══════════════════════════════════════════════════════════════════════════════════

export interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      <textarea
        ref={ref}
        className={`min-h-[100px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all duration-300 placeholder:text-white/30 focus:border-purple-500/50 focus:bg-white/10 focus:outline-none ${error ? 'border-red-500/50' : ''} `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  ),
)

PremiumTextarea.displayName = 'PremiumTextarea'

// ═══════════════════════════════════════════════════════════════════════════════════
// CHECKBOX
// ═══════════════════════════════════════════════════════════════════════════════════

export interface PremiumCheckboxProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

export function PremiumCheckbox({
  label,
  checked,
  onChange,
  className = '',
}: PremiumCheckboxProps) {
  return (
    <label className={`group flex cursor-pointer items-center gap-3 ${className}`}>
      <div
        onClick={() => onChange?.(!checked)}
        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-300 ${
          checked
            ? 'border-purple-500 bg-purple-500'
            : 'border-white/30 bg-transparent group-hover:border-white/50'
        } `}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      <span className="text-sm text-white/70 transition-colors group-hover:text-white/90">
        {label}
      </span>
    </label>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════
// FORM FIELD WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════

export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, required, children, className = '' }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-white/70">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
