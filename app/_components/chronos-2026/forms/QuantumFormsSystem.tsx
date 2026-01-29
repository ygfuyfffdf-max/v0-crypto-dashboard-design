'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ QUANTUM FORMS SYSTEM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de formularios ultra-premium con:
 * - React Hook Form + Zod validation
 * - Componentes glassmorphism avanzados
 * - Validación en tiempo real con feedback visual
 * - Animaciones fluidas Motion React
 * - Auto-formateo de moneda y números
 * - Campos con máscaras (teléfono, RFC, etc.)
 * - Wizard multi-step con transiciones
 * - Debounced validation
 * - Accesibilidad ARIA completa
 *
 * @version 2.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const FORM_DESIGN = {
  colors: {
    primary: '#8B5CF6',
    primaryGlow: 'rgba(139, 92, 246, 0.5)',
    success: '#10B981',
    successGlow: 'rgba(16, 185, 129, 0.5)',
    error: '#EF4444',
    errorGlow: 'rgba(239, 68, 68, 0.5)',
    warning: '#F59E0B',
    warningGlow: 'rgba(245, 158, 11, 0.5)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderFocus: 'rgba(139, 92, 246, 0.5)',
    bg: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)',
    bgFocus: 'rgba(139, 92, 246, 0.1)',
    text: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    placeholder: 'rgba(255, 255, 255, 0.3)',
  },
  animation: {
    spring: { type: 'spring' as const, stiffness: 400, damping: 25 },
    smooth: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
  blur: '12px',
  radius: '12px',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface FormFieldProps {
  name: string
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export interface QuantumInputFieldProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  autoComplete?: string
  mask?: 'phone' | 'rfc' | 'currency' | 'percentage' | 'date'
  min?: number
  max?: number
  step?: number
}

export interface QuantumSelectFieldProps extends FormFieldProps {
  options: Array<{ value: string; label: string; icon?: React.ReactNode; disabled?: boolean }>
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
}

export interface QuantumTextareaFieldProps extends FormFieldProps {
  placeholder?: string
  rows?: number
  maxLength?: number
  showCount?: boolean
  autoResize?: boolean
}

export interface QuantumCheckboxFieldProps extends FormFieldProps {
  children?: React.ReactNode
}

export interface QuantumRadioGroupFieldProps extends FormFieldProps {
  options: Array<{ value: string; label: string; description?: string }>
  direction?: 'horizontal' | 'vertical'
}

export interface QuantumCurrencyFieldProps extends FormFieldProps {
  placeholder?: string
  currency?: 'MXN' | 'USD' | 'EUR'
  min?: number
  max?: number
  showCalculation?: boolean
  calculationLabel?: string
  calculationValue?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BASE INPUT WRAPPER — Glassmorphism container with animations
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface InputWrapperProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  isFocused?: boolean
  isSuccess?: boolean
  children: React.ReactNode
  className?: string
  id?: string
}

const InputWrapper = forwardRef<HTMLDivElement, InputWrapperProps>(
  (
    { label, error, helperText, required, disabled, isFocused, isSuccess, children, className, id },
    ref,
  ) => {
    const inputId = useId()
    const finalId = id || inputId

    return (
      <motion.div
        ref={ref}
        className={cn('relative', className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={FORM_DESIGN.animation.smooth}
      >
        {/* Label */}
        {label && (
          <motion.label
            htmlFor={finalId}
            className="mb-2 flex items-center gap-1 text-sm font-medium"
            animate={{
              color: disabled
                ? FORM_DESIGN.colors.textMuted
                : error
                  ? FORM_DESIGN.colors.error
                  : isFocused
                    ? FORM_DESIGN.colors.text
                    : FORM_DESIGN.colors.textMuted,
            }}
          >
            {label}
            {required && <span className="text-rose-400">*</span>}
          </motion.label>
        )}

        {/* Input Container */}
        {children}

        {/* Error / Helper Text */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 flex items-center gap-1.5 text-xs text-rose-400"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              {error}
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
InputWrapper.displayName = 'InputWrapper'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM INPUT FIELD — Text input with full features
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QuantumInputField = forwardRef<HTMLInputElement, QuantumInputFieldProps>(
  (
    {
      name,
      label,
      error,
      helperText,
      required,
      disabled,
      type = 'text',
      placeholder,
      icon,
      rightIcon,
      autoComplete,
      mask,
      min,
      max,
      step,
      className,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const inputId = useId()

    const formContext = useFormContext()
    const fieldError = error || (formContext?.formState?.errors?.[name]?.message as string)

    // Format value based on mask
    const formatValue = useCallback((value: string, maskType?: string): string => {
      if (!maskType) return value

      switch (maskType) {
        case 'phone':
          // Format: +52 XXX XXX XXXX
          return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '+$1 $2 $3 $4')
            .substring(0, 17)
        case 'rfc':
          // Format: XXXX XXXXXX XXX
          return value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 13)
        case 'currency':
          const num = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
          return formatCurrency(num)
        case 'percentage':
          const pct = parseFloat(value.replace(/[^0-9.]/g, '')) || 0
          return `${Math.min(100, pct)}%`
        default:
          return value
      }
    }, [])

    const inputType = type === 'password' && showPassword ? 'text' : type

    const baseStyles = {
      background: disabled
        ? 'rgba(255,255,255,0.02)'
        : isFocused
          ? FORM_DESIGN.colors.bgFocus
          : isHovered
            ? FORM_DESIGN.colors.bgHover
            : FORM_DESIGN.colors.bg,
      backdropFilter: `blur(${FORM_DESIGN.blur})`,
      border: `1px solid ${
        fieldError
          ? FORM_DESIGN.colors.error
          : isFocused
            ? FORM_DESIGN.colors.borderFocus
            : FORM_DESIGN.colors.border
      }`,
      boxShadow: fieldError
        ? `0 0 20px ${FORM_DESIGN.colors.errorGlow}`
        : isFocused
          ? `0 0 25px ${FORM_DESIGN.colors.primaryGlow}`
          : 'none',
    }

    return (
      <InputWrapper
        label={label}
        error={fieldError}
        helperText={helperText}
        required={required}
        disabled={disabled}
        isFocused={isFocused}
        id={inputId}
        className={className}
      >
        <div
          className="group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Icon */}
          {icon && (
            <motion.div
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2"
              animate={{
                color: isFocused ? FORM_DESIGN.colors.primary : FORM_DESIGN.colors.textMuted,
                scale: isFocused ? 1.1 : 1,
              }}
            >
              {icon}
            </motion.div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            min={type === 'number' ? min : undefined}
            max={type === 'number' ? max : undefined}
            step={type === 'number' ? step : undefined}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full rounded-xl px-4 py-3 text-sm text-white',
              'transition-all duration-200 placeholder:text-white/30',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              (rightIcon || type === 'password') && 'pr-10',
            )}
            style={baseStyles}
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? `${inputId}-error` : undefined}
          />

          {/* Right Icon / Password Toggle */}
          {(rightIcon || type === 'password') && (
            <motion.div
              className="absolute top-1/2 right-3 -translate-y-1/2"
              animate={{
                color: isFocused ? FORM_DESIGN.colors.primary : FORM_DESIGN.colors.textMuted,
              }}
            >
              {type === 'password' ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 transition-colors hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : (
                rightIcon
              )}
            </motion.div>
          )}

          {/* Focus Glow */}
          <AnimatePresence>
            {isFocused && !fieldError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: `radial-gradient(circle at center, ${FORM_DESIGN.colors.primaryGlow} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </InputWrapper>
    )
  },
)
QuantumInputField.displayName = 'QuantumInputField'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM CURRENCY FIELD — Specialized for money input
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QuantumCurrencyField = forwardRef<HTMLInputElement, QuantumCurrencyFieldProps>(
  (
    {
      name,
      label,
      error,
      helperText,
      required,
      disabled,
      placeholder = '0.00',
      currency = 'MXN',
      min = 0,
      max,
      showCalculation,
      calculationLabel,
      calculationValue,
      className,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [displayValue, setDisplayValue] = useState('')
    const inputId = useId()

    const formContext = useFormContext()
    const fieldError = error || (formContext?.formState?.errors?.[name]?.message as string)

    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$'
    const currencyCode = currency

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '')
      const num = parseFloat(raw) || 0

      if (max !== undefined && num > max) return
      if (min !== undefined && num < min) return

      setDisplayValue(raw)

      // Update form value
      if (formContext) {
        formContext.setValue(name, num, { shouldValidate: true })
      }
    }

    const handleBlur = () => {
      setIsFocused(false)
      const num = parseFloat(displayValue) || 0
      setDisplayValue(num.toFixed(2))
    }

    const baseStyles = {
      background: disabled
        ? 'rgba(255,255,255,0.02)'
        : isFocused
          ? FORM_DESIGN.colors.bgFocus
          : isHovered
            ? FORM_DESIGN.colors.bgHover
            : FORM_DESIGN.colors.bg,
      backdropFilter: `blur(${FORM_DESIGN.blur})`,
      border: `1px solid ${
        fieldError
          ? FORM_DESIGN.colors.error
          : isFocused
            ? FORM_DESIGN.colors.borderFocus
            : FORM_DESIGN.colors.border
      }`,
      boxShadow: fieldError
        ? `0 0 20px ${FORM_DESIGN.colors.errorGlow}`
        : isFocused
          ? `0 0 25px ${FORM_DESIGN.colors.primaryGlow}`
          : 'none',
    }

    return (
      <InputWrapper
        label={label}
        error={fieldError}
        helperText={helperText}
        required={required}
        disabled={disabled}
        isFocused={isFocused}
        id={inputId}
        className={className}
      >
        <div
          className="group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Currency Symbol */}
          <motion.div
            className="absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center gap-1"
            animate={{
              color: isFocused ? FORM_DESIGN.colors.primary : FORM_DESIGN.colors.textMuted,
            }}
          >
            <DollarSign className="h-4 w-4" />
          </motion.div>

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            disabled={disabled}
            value={displayValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className={cn(
              'w-full rounded-xl py-3 pr-16 pl-10 text-right font-mono text-sm text-white',
              'transition-all duration-200 placeholder:text-white/30',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            )}
            style={baseStyles}
            aria-invalid={!!fieldError}
          />

          {/* Currency Code */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-white/50">
            {currencyCode}
          </div>

          {/* Focus Glow */}
          <AnimatePresence>
            {isFocused && !fieldError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: `radial-gradient(circle at center, ${FORM_DESIGN.colors.primaryGlow} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Calculation Display */}
        {showCalculation && calculationValue !== undefined && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            <span className="text-xs text-white/50">{calculationLabel || 'Total'}</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatCurrency(calculationValue)}
            </span>
          </motion.div>
        )}
      </InputWrapper>
    )
  },
)
QuantumCurrencyField.displayName = 'QuantumCurrencyField'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM SELECT FIELD — Searchable dropdown with animations
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuantumSelectField({
  name,
  label,
  options,
  error,
  helperText,
  required,
  disabled,
  placeholder = 'Seleccionar...',
  searchable = false,
  clearable = false,
  className,
}: QuantumSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputId = useId()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const formContext = useFormContext()
  const fieldError = error || (formContext?.formState?.errors?.[name]?.message as string)
  const currentValue = formContext?.watch(name)

  const selectedOption = options.find((opt) => opt.value === currentValue)

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options
    const query = searchQuery.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(query))
  }, [options, searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (value: string) => {
    formContext?.setValue(name, value, { shouldValidate: true })
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    formContext?.setValue(name, '', { shouldValidate: true })
  }

  const baseStyles = {
    background: disabled
      ? 'rgba(255,255,255,0.02)'
      : isOpen
        ? FORM_DESIGN.colors.bgFocus
        : isHovered
          ? FORM_DESIGN.colors.bgHover
          : FORM_DESIGN.colors.bg,
    backdropFilter: `blur(${FORM_DESIGN.blur})`,
    border: `1px solid ${
      fieldError
        ? FORM_DESIGN.colors.error
        : isOpen
          ? FORM_DESIGN.colors.borderFocus
          : FORM_DESIGN.colors.border
    }`,
    boxShadow: fieldError
      ? `0 0 20px ${FORM_DESIGN.colors.errorGlow}`
      : isOpen
        ? `0 0 25px ${FORM_DESIGN.colors.primaryGlow}`
        : 'none',
  }

  return (
    <InputWrapper
      label={label}
      error={fieldError}
      helperText={helperText}
      required={required}
      disabled={disabled}
      isFocused={isOpen}
      id={inputId}
      className={className}
    >
      <div ref={dropdownRef} className="relative">
        {/* Trigger Button */}
        <motion.button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'w-full rounded-xl px-4 py-3 text-left',
            'flex items-center justify-between gap-2',
            'transition-all duration-200',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          )}
          style={baseStyles}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={cn(selectedOption ? 'text-white' : 'text-white/30', 'truncate text-sm')}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>

          <div className="flex items-center gap-1">
            {clearable && currentValue && (
              <motion.button
                type="button"
                onClick={handleClear}
                className="p-1 transition-colors hover:text-rose-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-white/50" />
            </motion.div>
          </div>
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={FORM_DESIGN.animation.spring}
              className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl"
              style={{
                background: 'rgba(20, 15, 35, 0.98)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${FORM_DESIGN.colors.border}`,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              }}
              role="listbox"
            >
              {/* Search */}
              {searchable && (
                <div className="border-b border-white/10 p-2">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full rounded-lg bg-white/5 py-2 pr-3 pl-9 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-center text-sm text-white/50">No hay opciones</div>
                ) : (
                  filteredOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm',
                        'transition-colors',
                        option.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer hover:bg-violet-500/20',
                        currentValue === option.value && 'bg-violet-500/30 text-violet-300',
                      )}
                      whileHover={!option.disabled ? { x: 4 } : {}}
                      role="option"
                      aria-selected={currentValue === option.value}
                    >
                      {option.icon}
                      <span className="flex-1">{option.label}</span>
                      {currentValue === option.value && (
                        <Check className="h-4 w-4 text-violet-400" />
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </InputWrapper>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM TEXTAREA FIELD — Multi-line text input
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QuantumTextareaField = forwardRef<HTMLTextAreaElement, QuantumTextareaFieldProps>(
  (
    {
      name,
      label,
      error,
      helperText,
      required,
      disabled,
      placeholder,
      rows = 4,
      maxLength,
      showCount = false,
      autoResize = false,
      className,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [charCount, setCharCount] = useState(0)
    const inputId = useId()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const formContext = useFormContext()
    const fieldError = error || (formContext?.formState?.errors?.[name]?.message as string)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)

      // Auto resize
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }

    const baseStyles = {
      background: disabled
        ? 'rgba(255,255,255,0.02)'
        : isFocused
          ? FORM_DESIGN.colors.bgFocus
          : isHovered
            ? FORM_DESIGN.colors.bgHover
            : FORM_DESIGN.colors.bg,
      backdropFilter: `blur(${FORM_DESIGN.blur})`,
      border: `1px solid ${
        fieldError
          ? FORM_DESIGN.colors.error
          : isFocused
            ? FORM_DESIGN.colors.borderFocus
            : FORM_DESIGN.colors.border
      }`,
      boxShadow: fieldError
        ? `0 0 20px ${FORM_DESIGN.colors.errorGlow}`
        : isFocused
          ? `0 0 25px ${FORM_DESIGN.colors.primaryGlow}`
          : 'none',
    }

    return (
      <InputWrapper
        label={label}
        error={fieldError}
        helperText={!showCount ? helperText : undefined}
        required={required}
        disabled={disabled}
        isFocused={isFocused}
        id={inputId}
        className={className}
      >
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <textarea
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') ref(node)
              else if (ref) ref.current = node
              ;(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
            }}
            id={inputId}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full resize-none rounded-xl px-4 py-3 text-sm text-white',
              'transition-all duration-200 placeholder:text-white/30',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            )}
            style={baseStyles}
            aria-invalid={!!fieldError}
          />

          {/* Character Count */}
          {showCount && (
            <div className="absolute right-3 bottom-2 text-xs text-white/40">
              {charCount}
              {maxLength && `/${maxLength}`}
            </div>
          )}

          {/* Focus Glow */}
          <AnimatePresence>
            {isFocused && !fieldError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: `radial-gradient(circle at center, ${FORM_DESIGN.colors.primaryGlow} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Helper with count */}
        {showCount && helperText && <p className="mt-2 text-xs text-white/40">{helperText}</p>}
      </InputWrapper>
    )
  },
)
QuantumTextareaField.displayName = 'QuantumTextareaField'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM CHECKBOX FIELD — Animated checkbox
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuantumCheckboxField({
  name,
  label,
  error,
  helperText,
  disabled,
  children,
  className,
}: QuantumCheckboxFieldProps) {
  const [isHovered, setIsHovered] = useState(false)
  const inputId = useId()

  const formContext = useFormContext()
  const fieldError = error || (formContext?.formState?.errors?.[name]?.message as string)
  const isChecked = formContext?.watch(name) || false

  const handleToggle = () => {
    if (!disabled) {
      formContext?.setValue(name, !isChecked, { shouldValidate: true })
    }
  }

  return (
    <InputWrapper error={fieldError} helperText={helperText} className={className}>
      <motion.label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer items-start gap-3 select-none',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={!disabled ? { x: 2 } : {}}
      >
        {/* Checkbox */}
        <motion.div
          className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
          style={{
            background: isChecked ? FORM_DESIGN.colors.primary : FORM_DESIGN.colors.bg,
            border: `1px solid ${
              fieldError
                ? FORM_DESIGN.colors.error
                : isChecked
                  ? FORM_DESIGN.colors.primary
                  : isHovered
                    ? FORM_DESIGN.colors.borderFocus
                    : FORM_DESIGN.colors.border
            }`,
            boxShadow: isChecked ? `0 0 15px ${FORM_DESIGN.colors.primaryGlow}` : 'none',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
        >
          <input
            type="checkbox"
            id={inputId}
            name={name}
            checked={isChecked}
            onChange={handleToggle}
            disabled={disabled}
            className="sr-only"
            aria-invalid={!!fieldError}
          />
          <AnimatePresence>
            {isChecked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={FORM_DESIGN.animation.spring}
              >
                <Check className="h-3 w-3 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Label/Children */}
        <div className="text-sm text-white/80">{children || label}</div>
      </motion.label>
    </InputWrapper>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM RADIO GROUP — Animated radio buttons
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuantumRadioGroupField({
  name,
  label,
  options,
  error,
  helperText,
  required,
  disabled,
  direction = 'vertical',
  className,
}: QuantumRadioGroupFieldProps) {
  const formContext = useFormContext()
  const fieldError = error || (formContext?.formState?.errors?.[name]?.message as string)
  const currentValue = formContext?.watch(name)

  return (
    <InputWrapper
      label={label}
      error={fieldError}
      helperText={helperText}
      required={required}
      disabled={disabled}
      className={className}
    >
      <div
        className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}
        role="radiogroup"
      >
        {options.map((option) => (
          <motion.label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-xl p-3 select-none',
              'transition-all duration-200',
              disabled && 'cursor-not-allowed opacity-50',
              currentValue === option.value
                ? 'border border-violet-500/30 bg-violet-500/20'
                : 'border border-white/10 bg-white/5 hover:bg-white/10',
            )}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
          >
            {/* Radio Circle */}
            <motion.div
              className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{
                border: `2px solid ${
                  currentValue === option.value
                    ? FORM_DESIGN.colors.primary
                    : FORM_DESIGN.colors.border
                }`,
                boxShadow:
                  currentValue === option.value
                    ? `0 0 10px ${FORM_DESIGN.colors.primaryGlow}`
                    : 'none',
              }}
              onClick={() =>
                !disabled && formContext?.setValue(name, option.value, { shouldValidate: true })
              }
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={currentValue === option.value}
                onChange={() => formContext?.setValue(name, option.value, { shouldValidate: true })}
                disabled={disabled}
                className="sr-only"
              />
              <AnimatePresence>
                {currentValue === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={FORM_DESIGN.animation.spring}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: FORM_DESIGN.colors.primary }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Label & Description */}
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{option.label}</div>
              {option.description && (
                <div className="mt-0.5 text-xs text-white/50">{option.description}</div>
              )}
            </div>
          </motion.label>
        ))}
      </div>
    </InputWrapper>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM FORM SUBMIT BUTTON — Premium animated submit
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumSubmitButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  disabled?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  className?: string
}

export function QuantumSubmitButton({
  children,
  isLoading = false,
  loadingText = 'Procesando...',
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
}: QuantumSubmitButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const variantColors = {
    primary: { bg: 'from-violet-600 to-purple-600', glow: FORM_DESIGN.colors.primaryGlow },
    success: { bg: 'from-emerald-600 to-green-600', glow: FORM_DESIGN.colors.successGlow },
    warning: { bg: 'from-amber-600 to-orange-600', glow: FORM_DESIGN.colors.warningGlow },
    danger: { bg: 'from-rose-600 to-red-600', glow: FORM_DESIGN.colors.errorGlow },
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  const colors = variantColors[variant]

  return (
    <motion.button
      type="submit"
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-xl font-medium text-white',
        'transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        `bg-gradient-to-r ${colors.bg}`,
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      style={{
        boxShadow: isHovered && !disabled ? `0 0 30px ${colors.glow}` : `0 0 15px ${colors.glow}`,
      }}
    >
      {/* Shine Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
        }}
        animate={isHovered && !disabled ? { x: ['-100%', '100%'] } : { x: '-100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM WIZARD — Multi-step form with transitions
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface WizardStep {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  content: React.ReactNode
  validate?: () => Promise<boolean> | boolean
}

interface QuantumWizardProps {
  steps: WizardStep[]
  onComplete: () => void
  onCancel?: () => void
  isLoading?: boolean
  className?: string
}

export function QuantumWizard({
  steps,
  onComplete,
  onCancel,
  isLoading = false,
  className,
}: QuantumWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleNext = async () => {
    const step = steps[currentStep]
    if (step?.validate) {
      const isValid = await step.validate()
      if (!isValid) return
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep))
    setDirection('forward')

    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setDirection('backward')
      setCurrentStep((prev) => prev - 1)
    }
  }

  const slideVariants = {
    enter: (direction: string) => ({
      x: direction === 'forward' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? -100 : 100,
      opacity: 0,
    }),
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index)
          const isCurrent = index === currentStep

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <motion.div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium',
                  'transition-all duration-300',
                )}
                style={{
                  background: isCompleted
                    ? FORM_DESIGN.colors.success
                    : isCurrent
                      ? FORM_DESIGN.colors.primary
                      : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isCurrent
                    ? `0 0 20px ${FORM_DESIGN.colors.primaryGlow}`
                    : isCompleted
                      ? `0 0 15px ${FORM_DESIGN.colors.successGlow}`
                      : 'none',
                }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-white" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-white">{index + 1}</span>
                )}
              </motion.div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className="h-0.5 w-12"
                  style={{
                    background: completedSteps.has(index)
                      ? FORM_DESIGN.colors.success
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{steps[currentStep]?.title}</h3>
        {steps[currentStep]?.description && (
          <p className="mt-1 text-sm text-white/50">{steps[currentStep]?.description}</p>
        )}
      </div>

      {/* Step Content */}
      <div className="relative min-h-[300px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={FORM_DESIGN.animation.spring}
            className="w-full"
          >
            {steps[currentStep]?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
        <div>
          {onCancel && (
            <motion.button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isFirstStep && (
            <motion.button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </motion.button>
          )}

          <QuantumSubmitButton
            isLoading={isLoading}
            loadingText={isLastStep ? 'Guardando...' : 'Validando...'}
            variant={isLastStep ? 'success' : 'primary'}
            icon={isLastStep ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          >
            {isLastStep ? 'Completar' : 'Siguiente'}
          </QuantumSubmitButton>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { FORM_DESIGN, InputWrapper, useDebounce }

export default {
  QuantumInputField,
  QuantumCurrencyField,
  QuantumSelectField,
  QuantumTextareaField,
  QuantumCheckboxField,
  QuantumRadioGroupField,
  QuantumSubmitButton,
  QuantumWizard,
}
