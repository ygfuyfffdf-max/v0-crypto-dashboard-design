/**
 * 🌌📝 PREMIUM FORMS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Formularios ultra-premium con:
 * - React Hook Form + Zod validation
 * - Glassmorphism design
 * - Animaciones fluidas
 * - Validación en tiempo real
 * - Auto-complete inteligente
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Check, ChevronDown, DollarSign, X } from 'lucide-react'
import React, { forwardRef, useState } from 'react'
import {
    Controller,
    useForm,
    type FieldValues,
    type Path,
    type UseFormReturn,
} from 'react-hook-form'
import * as z from 'zod'
import { GLASS_SPRINGS } from '../../ui/GlassneumorphismSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS INPUT — ULTRA-PREMIUM WITH 3D EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  success?: boolean
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, icon, rightIcon, helperText, success, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <motion.label
            className="mb-2 block text-sm font-medium"
            style={{
              color: isFocused ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
              textShadow: isFocused ? '0 0 20px rgba(139,0,255,0.5)' : 'none',
            }}
            animate={{
              color: isFocused ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
            }}
          >
            {label}
            {props.required && <span className="ml-1 text-rose-400">*</span>}
          </motion.label>
        )}

        <motion.div
          className="group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {icon && (
            <motion.div
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2"
              animate={{
                color: isFocused ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          <input
            ref={ref}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'w-full rounded-xl px-4 py-3 text-white placeholder:text-white/30',
              'text-sm transition-all duration-300',
              'focus:outline-none',
              icon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            style={{
              background: isFocused
                ? 'linear-gradient(145deg, rgba(139,0,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                : isHovered
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
              border: error
                ? '1px solid rgba(244,63,94,0.5)'
                : success
                  ? '1px solid rgba(16,185,129,0.5)'
                  : isFocused
                    ? '1px solid rgba(139,0,255,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
              boxShadow: error
                ? '0 0 20px rgba(244,63,94,0.2)'
                : success
                  ? '0 0 20px rgba(16,185,129,0.2)'
                  : isFocused
                    ? '0 0 30px rgba(139,0,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : isHovered
                      ? '0 0 15px rgba(139,0,255,0.15)'
                      : 'none',
              transform: isFocused ? 'scale(1.01)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          />

          {rightIcon && (
            <motion.div
              className="absolute top-1/2 right-3 -translate-y-1/2"
              animate={{
                color: isFocused ? '#A78BFA' : 'rgba(255,255,255,0.3)',
              }}
            >
              {rightIcon}
            </motion.div>
          )}

          {/* Glow effect on focus */}
          <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: `radial-gradient(circle at center, ${'rgba(139, 92, 246, 0.5)'} 0%, transparent 70%)`,
                  filter: 'blur(25px)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Shine sweep on hover */}
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
            initial={false}
          >
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
                transform: 'translateX(-100%)',
              }}
              animate={
                isHovered && !isFocused
                  ? { transform: 'translateX(100%)' }
                  : { transform: 'translateX(-100%)' }
              }
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </motion.div>

        {/* Error/Helper text */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5, x: -5 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 flex items-center gap-1.5 text-xs"
              style={{ color: '#f87171' }}
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-white/40"
            >
              {helperText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.div>
    )
  },
)
GlassInput.displayName = 'GlassInput'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS SELECT — PREMIUM GLASSMORPHISM DROPDOWN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface GlassSelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function GlassSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  disabled,
  required,
  className,
}: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <motion.label
          className="mb-2 block text-sm font-medium"
          style={{
            color: isOpen ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
            textShadow: isOpen ? '0 0 20px rgba(139,0,255,0.5)' : 'none',
          }}
        >
          {label}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </motion.label>
      )}

      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'w-full rounded-xl px-4 py-3 text-left',
          'flex items-center justify-between gap-2',
          'transition-all duration-300',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
        style={{
          background: isOpen
            ? 'linear-gradient(145deg, rgba(139,0,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'
            : isHovered && !disabled
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          border: error
            ? '1px solid rgba(244,63,94,0.5)'
            : isOpen
              ? '1px solid rgba(139,0,255,0.5)'
              : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isOpen
            ? '0 0 30px rgba(139,0,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : isHovered && !disabled
              ? '0 0 15px rgba(139,0,255,0.15)'
              : 'none',
        }}
        whileHover={!disabled ? { scale: 1.01 } : undefined}
        whileTap={!disabled ? { scale: 0.99 } : undefined}
      >
        <span
          className={cn(
            'flex items-center gap-2 text-sm',
            selectedOption ? 'text-white' : 'text-white/30',
          )}
        >
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.3 }}>
                  {selectedOption.icon}
                </motion.span>
              )}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>

        <motion.span
          animate={{
            rotate: isOpen ? 180 : 0,
            color: isOpen ? '#A78BFA' : 'rgba(255,255,255,0.4)',
          }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      {/* Dropdown with advanced glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl"
            style={{
              background:
                'linear-gradient(180deg, rgba(20,10,40,0.98) 0%, rgba(10,5,25,0.99) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(139,0,255,0.3)',
              boxShadow: `
                0 20px 60px -15px rgba(139,0,255,0.4),
                0 0 0 1px rgba(255,255,255,0.05) inset
              `,
              transformOrigin: 'top center',
              perspective: '1000px',
            }}
          >
            <div
              className="max-h-60 overflow-y-auto py-1"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(139,0,255,0.3) transparent',
              }}
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left text-sm',
                    'relative overflow-hidden transition-all duration-200',
                  )}
                  style={{
                    background:
                      option.value === value
                        ? 'linear-gradient(90deg, rgba(139,0,255,0.2), transparent)'
                        : 'transparent',
                    color:
                      option.value === value
                        ? '#A78BFA'
                        : 'rgba(255,255,255,0.8)',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  whileHover={{
                    backgroundColor: 'rgba(139,0,255,0.1)',
                    x: 4,
                  }}
                >
                  {option.icon && (
                    <motion.span
                      animate={{
                        scale: option.value === value ? 1.1 : 1,
                        color: option.value === value ? '#A78BFA' : 'inherit',
                      }}
                    >
                      {option.icon}
                    </motion.span>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <Check className="h-4 w-4 text-violet-400" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {error && (
        <motion.p
          className="mt-2 flex items-center gap-1.5 text-xs"
          style={{ color: '#f87171' }}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS TEXTAREA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="relative">
        {label && (
          <label className="mb-2 block text-sm font-medium text-white/70">
            {label}
            {props.required && <span className="ml-1 text-rose-400">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          {...props}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          className={cn(
            'w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30',
            'min-h-[100px] resize-none text-sm transition-all duration-300',
            'focus:outline-none',
            error
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-white/10 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20',
            className,
          )}
        />

        {error ? (
          <p className="mt-2 flex items-center gap-1 text-xs text-rose-400">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-2 text-xs text-white/40">{helperText}</p>
        ) : null}
      </div>
    )
  },
)
GlassTextarea.displayName = 'GlassTextarea'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS NUMBER INPUT (Money)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface GlassMoneyInputProps {
  value?: number
  onChange?: (
    value: number | undefined
  ) => void | ((e: React.ChangeEvent<HTMLInputElement>) => void)
  currency?: string
  label?: string
  error?: string
  placeholder?: string
  max?: number
  min?: number
  disabled?: boolean
  required?: boolean
  className?: string
  name?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export const GlassMoneyInput = forwardRef<HTMLInputElement, GlassMoneyInputProps>(
  (
    {
      value,
      onChange,
      currency = '$',
      label,
      error,
      placeholder,
      max,
      min,
      disabled,
      required,
      className,
      name,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState(
      value !== undefined ? formatDisplayMoney(value) : '',
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '')
      const parsed = parseFloat(raw)

      setDisplayValue(raw)
      // Support both function signatures
      if (typeof onChange === 'function') {
        const numValue = isNaN(parsed) ? undefined : parsed
        // Check if max is exceeded
        if (max !== undefined && numValue !== undefined && numValue > max) {
          onChange(max)
        } else if (min !== undefined && numValue !== undefined && numValue < min) {
          onChange(min)
        } else {
          onChange(numValue as number | undefined)
        }
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (value !== undefined) {
        setDisplayValue(formatDisplayMoney(value))
      }
      onBlur?.(e)
    }

    return (
      <GlassInput
        ref={ref}
        label={label}
        error={error}
        type="text"
        inputMode="decimal"
        name={name}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={className}
        icon={<DollarSign className="h-4 w-4" />}
        {...props}
      />
    )
  },
)
GlassMoneyInput.displayName = 'GlassMoneyInput'

function formatDisplayMoney(value: number): string {
  return value.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM MODAL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onSubmit?: () => Promise<void> | void
  submitLabel?: string
  loading?: boolean
}

export function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  onSubmit,
  submitLabel = 'Guardar',
  loading = false,
}: FormModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg', // Increased from max-w-md for better form layout
    lg: 'max-w-2xl', // Increased for complex forms
    xl: 'max-w-4xl', // Extra large for multi-column forms
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Enhanced Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(139,0,255,0.1) 0%, rgba(0,0,0,0.8) 100%)',
              backdropFilter: 'blur(12px)',
            }}
            onClick={onClose}
          />

          {/* Modal with advanced glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={GLASS_SPRINGS.smooth}
            className={cn('relative w-full overflow-hidden rounded-3xl', sizes[size])}
            style={{
              background:
                'linear-gradient(145deg, rgba(20,10,40,0.98) 0%, rgba(10,5,25,0.99) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(139,0,255,0.2)',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.05) inset,
                0 25px 80px -20px rgba(139, 0, 255, 0.4),
                0 0 100px -30px rgba(139, 0, 255, 0.3)
              `,
            }}
          >
            {/* Animated glow border */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(139,0,255,0.3) 0%, transparent 50%, rgba(255,20,147,0.2) 100%)',
                opacity: 0.5,
              }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Header with glassmorphism */}
            <div
              className="relative border-b px-6 py-5"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <motion.h2
                    className="text-xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 30px rgba(139,0,255,0.3)',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {title}
                  </motion.h2>
                  {subtitle && (
                    <motion.p
                      className="mt-1 text-sm text-white/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>
                <motion.button
                  onClick={onClose}
                  className="relative overflow-hidden rounded-xl p-2 text-white/40 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgba(255,20,147,0.2)',
                    borderColor: 'rgba(255,20,147,0.4)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Content with smooth scroll and NO scroll for small forms */}
            <motion.div
              className="relative px-6 py-6"
              style={{
                maxHeight: 'calc(85vh - 180px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(139,0,255,0.3) transparent',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Form grid for better layout - no scroll for compact forms */}
              <div className="space-y-4">{children}</div>
            </motion.div>

            {/* Footer with enhanced styling */}
            {(footer || onSubmit) && (
              <motion.div
                className="relative flex justify-end gap-3 border-t px-6 py-4"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  background: 'linear-gradient(0deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {footer || (
                  <>
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className="relative overflow-hidden rounded-xl px-5 py-2.5 text-white/60 transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      whileHover={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.9)',
                        borderColor: 'rgba(255,255,255,0.2)',
                        scale: 1.02,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={onSubmit}
                      disabled={loading}
                      className="relative overflow-hidden rounded-xl px-6 py-2.5 font-medium text-white transition-all disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #8B00FF 0%, #FF1493 100%)',
                        boxShadow:
                          '0 4px 20px rgba(139,0,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow:
                          '0 8px 30px rgba(139,0,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Shine effect */}
                      <motion.span
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                          transform: 'translateX(-100%)',
                        }}
                        animate={{
                          transform: loading
                            ? 'translateX(-100%)'
                            : ['translateX(-100%)', 'translateX(100%)'],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      />
                      <span className="relative z-10">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            Procesando...
                          </span>
                        ) : (
                          submitLabel
                        )}
                      </span>
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ZOD SCHEMAS FOR FORMS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const movimientoSchema = z.object({
  tipo: z.enum(['ingreso', 'gasto', 'transferencia_entrada', 'transferencia_salida']),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  concepto: z.string().min(1, 'El concepto es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  bancoId: z.string().min(1, 'Selecciona un banco'),
  bancoDestinoId: z.string().optional(),
  observaciones: z.string().optional(),
})

export const ventaSchema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente'),
  clienteNombre: z.string().optional(),
  productos: z
    .array(
      z.object({
        productoId: z.string(),
        cantidad: z.number().positive(),
        precioVenta: z.number().positive(),
        precioCompra: z.number().positive(),
        flete: z.number().min(0),
      }),
    )
    .min(1, 'Agrega al menos un producto'),
  estadoPago: z.enum(['completo', 'parcial', 'pendiente']),
  montoAbono: z.number().optional(),
  observaciones: z.string().optional(),
})

export const ordenCompraSchema = z.object({
  distribuidorId: z.string().min(1, 'Selecciona un distribuidor'),
  distribuidorNombre: z.string().optional(),
  productos: z
    .array(
      z.object({
        productoId: z.string(),
        cantidad: z.number().positive(),
        costoDistribuidor: z.number().positive(),
        costoTransporte: z.number().min(0),
      }),
    )
    .min(1, 'Agrega al menos un producto'),
  observaciones: z.string().optional(),
})

export type MovimientoFormData = z.infer<typeof movimientoSchema>
export type VentaFormData = z.infer<typeof ventaSchema>
export type OrdenCompraFormData = z.infer<typeof ordenCompraSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { Controller, useForm, zodResolver }
export type { FieldValues, Path, UseFormReturn }

// Aliases para compatibilidad
export const PremiumInput = GlassInput
export const PremiumSelect = GlassSelect
export const PremiumTextarea = GlassTextarea
export const PremiumMoneyInput = GlassMoneyInput
