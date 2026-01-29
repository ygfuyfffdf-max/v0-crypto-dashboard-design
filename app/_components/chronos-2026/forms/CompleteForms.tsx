'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ COMPLETE FORMS SYSTEM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formularios completos, correctos y funcionales con:
 * - React Hook Form + Zod validation
 * - Componentes glassmorphism premium
 * - Cálculos automáticos en tiempo real
 * - Validación avanzada con feedback visual
 * - Integración con Drizzle ORM
 * - Accesibilidad ARIA completa
 *
 * @version 3.0.0 SUPREME COMPLETE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  Calculator,
  Check,
  ChevronDown,
  DollarSign,
  HelpCircle,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import * as z from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM TOKENS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DESIGN = {
  colors: {
    primary: '#8B5CF6',
    primaryGlow: 'rgba(139, 92, 246, 0.5)',
    success: '#10B981',
    successGlow: 'rgba(16, 185, 129, 0.5)',
    error: '#EF4444',
    errorGlow: 'rgba(239, 68, 68, 0.5)',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: 'rgba(255, 255, 255, 0.1)',
    borderFocus: 'rgba(139, 92, 246, 0.5)',
    bg: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)',
    bgFocus: 'rgba(139, 92, 246, 0.1)',
    text: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  },
  animation: {
    spring: { type: 'spring' as const, stiffness: 400, damping: 25 },
    smooth: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ZOD SCHEMAS — Validación completa
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Schema monetario base
const MontoSchema = z.number().min(0, 'El monto no puede ser negativo')
const MontoPositivoSchema = z.number().positive('El monto debe ser mayor a 0')
const CantidadSchema = z
  .number()
  .int('Debe ser un número entero')
  .positive('La cantidad debe ser mayor a 0')

// IDs de bancos válidos
export const BANCO_IDS = [
  'boveda_monte',
  'boveda_usa',
  'utilidades',
  'flete_sur',
  'azteca',
  'leftie',
  'profit',
] as const

export const BancoIdSchema = z.enum(BANCO_IDS, {
  errorMap: () => ({ message: 'Seleccione un banco válido' }),
})

// Estados de pago
export const EstadoPagoSchema = z.enum(['completo', 'parcial', 'pendiente'])

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VENTA SCHEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const VentaFormSchema = z
  .object({
    clienteId: z.string().min(1, 'Seleccione un cliente'),
    producto: z.string().min(1, 'El producto es requerido').max(100, 'Máximo 100 caracteres'),
    cantidad: CantidadSchema,
    precioVentaUnidad: MontoPositivoSchema,
    precioCompraUnidad: MontoSchema.default(0),
    precioFlete: MontoSchema.default(0),
    montoPagado: MontoSchema.default(0),
    ordenCompraId: z.string().optional(),
    observaciones: z.string().max(500, 'Máximo 500 caracteres').optional(),
  })
  .refine(
    (data) => {
      if (data.precioCompraUnidad && data.precioCompraUnidad > 0) {
        return data.precioVentaUnidad > data.precioCompraUnidad
      }
      return true
    },
    {
      message: 'El precio de venta debe ser mayor al precio de compra',
      path: ['precioVentaUnidad'],
    },
  )

export type VentaFormData = z.infer<typeof VentaFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLIENTE SCHEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ClienteFormSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  telefono: z
    .string()
    .regex(/^(\+?[\d\s\-()]{7,20})?$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  observaciones: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
})

export type ClienteFormData = z.infer<typeof ClienteFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DISTRIBUIDOR SCHEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const DistribuidorFormSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .trim(),
  empresa: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  contacto: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  telefono: z
    .string()
    .regex(/^(\+?[\d\s\-()]{7,20})?$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
})

export type DistribuidorFormData = z.infer<typeof DistribuidorFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GASTO/ABONO SCHEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GastoFormSchema = z.object({
  bancoId: BancoIdSchema,
  monto: MontoPositivoSchema,
  concepto: z.string().min(1, 'El concepto es requerido').max(200, 'Máximo 200 caracteres'),
  categoria: z.enum(['operativo', 'administrativo', 'financiero', 'otros']).optional(),
  fecha: z.string().optional(),
  observaciones: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type GastoFormData = z.infer<typeof GastoFormSchema>

export const AbonoFormSchema = z
  .object({
    clienteId: z.string().optional(),
    distribuidorId: z.string().optional(),
    monto: MontoPositivoSchema,
    bancoDestinoId: BancoIdSchema,
    concepto: z.string().max(200, 'Máximo 200 caracteres').optional(),
    fecha: z.string().optional(),
  })
  .refine((data) => data.clienteId || data.distribuidorId, {
    message: 'Seleccione un cliente o distribuidor',
    path: ['clienteId'],
  })

export type AbonoFormData = z.infer<typeof AbonoFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFERENCIA SCHEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const TransferenciaFormSchema = z
  .object({
    bancoOrigenId: BancoIdSchema,
    bancoDestinoId: BancoIdSchema,
    monto: MontoPositivoSchema,
    concepto: z.string().min(1, 'El concepto es requerido').max(200, 'Máximo 200 caracteres'),
    fecha: z.string().optional(),
  })
  .refine((data) => data.bancoOrigenId !== data.bancoDestinoId, {
    message: 'El banco de origen y destino no pueden ser el mismo',
    path: ['bancoDestinoId'],
  })

export type TransferenciaFormData = z.infer<typeof TransferenciaFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ORDEN COMPRA SCHEMA COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const OrdenCompraFormSchema = z.object({
  distribuidorId: z.string().min(1, 'Seleccione un distribuidor'),
  producto: z.string().min(1, 'El producto es requerido').max(100, 'Máximo 100 caracteres'),
  cantidad: CantidadSchema,
  precioUnitario: MontoPositivoSchema,
  precioFlete: MontoSchema.default(0),
  bancoOrigenId: BancoIdSchema,
  montoPagado: MontoSchema.default(0),
  observaciones: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type OrdenCompraFormData = z.infer<typeof OrdenCompraFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BASE INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface InputWrapperProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  isFocused?: boolean
  children: React.ReactNode
  className?: string
  tooltip?: string
}

function InputWrapper({
  label,
  error,
  helperText,
  required,
  disabled,
  isFocused,
  children,
  className,
  tooltip,
}: InputWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={DESIGN.animation.smooth}
    >
      {label && (
        <div className="mb-2 flex items-center gap-2">
          <motion.label
            className="text-sm font-medium"
            animate={{
              color: disabled
                ? DESIGN.colors.textMuted
                : error
                  ? DESIGN.colors.error
                  : isFocused
                    ? DESIGN.colors.text
                    : DESIGN.colors.textMuted,
            }}
          >
            {label}
            {required && <span className="ml-1 text-rose-400">*</span>}
          </motion.label>

          {tooltip && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <HelpCircle className="h-3.5 w-3.5 cursor-help text-white/30 hover:text-white/50" />
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-6 left-0 z-50 w-48 rounded-lg bg-gray-900 p-2 text-xs text-white/80 shadow-xl"
                  >
                    {tooltip}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {children}

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
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM INPUT — Text, Email, Tel, etc.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
  tooltip?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, icon, rightElement, tooltip, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const baseStyles = {
      background: props.disabled
        ? 'rgba(255,255,255,0.02)'
        : isFocused
          ? DESIGN.colors.bgFocus
          : isHovered
            ? DESIGN.colors.bgHover
            : DESIGN.colors.bg,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${
        error ? DESIGN.colors.error : isFocused ? DESIGN.colors.borderFocus : DESIGN.colors.border
      }`,
      boxShadow: error
        ? `0 0 20px ${DESIGN.colors.errorGlow}`
        : isFocused
          ? `0 0 25px ${DESIGN.colors.primaryGlow}`
          : 'none',
    }

    return (
      <InputWrapper
        label={label}
        error={error}
        helperText={helperText}
        required={props.required}
        disabled={props.disabled}
        isFocused={isFocused}
        tooltip={tooltip}
        className={className}
      >
        <div
          className="group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {icon && (
            <motion.div
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2"
              animate={{
                color: isFocused ? DESIGN.colors.primary : DESIGN.colors.textMuted,
                scale: isFocused ? 1.1 : 1,
              }}
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
              'w-full rounded-xl px-4 py-3 text-sm text-white',
              'transition-all duration-200 placeholder:text-white/30',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              rightElement && 'pr-16',
            )}
            style={baseStyles}
            aria-invalid={!!error}
          />

          {rightElement && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">{rightElement}</div>
          )}

          {/* Focus Glow */}
          <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: `radial-gradient(circle at center, ${DESIGN.colors.primaryGlow} 0%, transparent 70%)`,
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
FormInput.displayName = 'FormInput'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM CURRENCY INPUT — Specialized for money
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormCurrencyInputProps {
  label?: string
  error?: string
  helperText?: string
  value: number
  onChange: (value: number) => void
  currency?: 'MXN' | 'USD'
  min?: number
  max?: number
  disabled?: boolean
  required?: boolean
  className?: string
  showCalculation?: boolean
  calculationLabel?: string
  calculationValue?: number
}

export function FormCurrencyInput({
  label,
  error,
  helperText,
  value,
  onChange,
  currency = 'MXN',
  min = 0,
  max,
  disabled,
  required,
  className,
  showCalculation,
  calculationLabel,
  calculationValue,
}: FormCurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [displayValue, setDisplayValue] = useState(value.toString())

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toFixed(2))
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDisplayValue(raw)

    const num = parseFloat(raw) || 0
    if (max !== undefined && num > max) return
    if (min !== undefined && num < min) return
    onChange(num)
  }

  const handleBlur = () => {
    setIsFocused(false)
    const num = parseFloat(displayValue) || 0
    setDisplayValue(num.toFixed(2))
    onChange(num)
  }

  const baseStyles = {
    background: disabled
      ? 'rgba(255,255,255,0.02)'
      : isFocused
        ? DESIGN.colors.bgFocus
        : isHovered
          ? DESIGN.colors.bgHover
          : DESIGN.colors.bg,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${
      error ? DESIGN.colors.error : isFocused ? DESIGN.colors.borderFocus : DESIGN.colors.border
    }`,
    boxShadow: error
      ? `0 0 20px ${DESIGN.colors.errorGlow}`
      : isFocused
        ? `0 0 25px ${DESIGN.colors.primaryGlow}`
        : 'none',
  }

  return (
    <InputWrapper
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      isFocused={isFocused}
      className={className}
    >
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="absolute top-1/2 left-3 z-10 -translate-y-1/2"
          animate={{ color: isFocused ? DESIGN.colors.primary : DESIGN.colors.textMuted }}
        >
          <DollarSign className="h-4 w-4" />
        </motion.div>

        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="0.00"
          className={cn(
            'w-full rounded-xl py-3 pr-16 pl-10 text-right font-mono text-sm text-white',
            'transition-all duration-200 placeholder:text-white/30',
            'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          )}
          style={baseStyles}
          aria-invalid={!!error}
        />

        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-white/50">
          {currency}
        </div>

        {/* Focus Glow */}
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
              style={{
                background: `radial-gradient(circle at center, ${DESIGN.colors.primaryGlow} 0%, transparent 70%)`,
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
          <span className="font-mono text-sm font-bold text-emerald-400">
            {formatCurrency(calculationValue)}
          </span>
        </motion.div>
      )}
    </InputWrapper>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM SELECT — Premium dropdown
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
  disabled?: boolean
}

interface FormSelectProps {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
  icon?: React.ReactNode
}

export function FormSelect({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchable = false,
  clearable = false,
  disabled,
  required,
  className,
  icon,
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options
    const query = searchQuery.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) || opt.description?.toLowerCase().includes(query),
    )
  }, [options, searchQuery])

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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  const baseStyles = {
    background: disabled
      ? 'rgba(255,255,255,0.02)'
      : isOpen
        ? DESIGN.colors.bgFocus
        : isHovered
          ? DESIGN.colors.bgHover
          : DESIGN.colors.bg,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${
      error ? DESIGN.colors.error : isOpen ? DESIGN.colors.borderFocus : DESIGN.colors.border
    }`,
    boxShadow: error
      ? `0 0 20px ${DESIGN.colors.errorGlow}`
      : isOpen
        ? `0 0 25px ${DESIGN.colors.primaryGlow}`
        : 'none',
  }

  return (
    <InputWrapper
      label={label}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      isFocused={isOpen}
      className={className}
    >
      <div ref={dropdownRef} className="relative">
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
          <span
            className={cn('flex items-center gap-2 text-sm', !selectedOption && 'text-white/30')}
          >
            {icon || selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>

          <div className="flex items-center gap-1">
            {clearable && value && (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                }}
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
              transition={DESIGN.animation.spring}
              className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl"
              style={{
                background: 'rgba(20, 15, 35, 0.98)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${DESIGN.colors.border}`,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              }}
              role="listbox"
            >
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

              <div className="max-h-60 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-center text-sm text-white/50">No hay opciones</div>
                ) : (
                  filteredOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm',
                        'transition-colors',
                        option.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer hover:bg-violet-500/20',
                        value === option.value && 'bg-violet-500/30 text-violet-300',
                      )}
                      whileHover={!option.disabled ? { x: 4 } : {}}
                      role="option"
                      aria-selected={value === option.value}
                    >
                      {option.icon}
                      <div className="flex-1">
                        <div>{option.label}</div>
                        {option.description && (
                          <div className="mt-0.5 text-xs text-white/50">{option.description}</div>
                        )}
                      </div>
                      {value === option.value && <Check className="h-4 w-4 text-violet-400" />}
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
// FORM TEXTAREA — Multi-line input
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCount?: boolean
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, showCount, maxLength, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [charCount, setCharCount] = useState(0)

    const baseStyles = {
      background: props.disabled
        ? 'rgba(255,255,255,0.02)'
        : isFocused
          ? DESIGN.colors.bgFocus
          : isHovered
            ? DESIGN.colors.bgHover
            : DESIGN.colors.bg,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${
        error ? DESIGN.colors.error : isFocused ? DESIGN.colors.borderFocus : DESIGN.colors.border
      }`,
      boxShadow: error
        ? `0 0 20px ${DESIGN.colors.errorGlow}`
        : isFocused
          ? `0 0 25px ${DESIGN.colors.primaryGlow}`
          : 'none',
    }

    return (
      <InputWrapper
        label={label}
        error={error}
        helperText={!showCount ? helperText : undefined}
        required={props.required}
        disabled={props.disabled}
        isFocused={isFocused}
        className={className}
      >
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <textarea
            ref={ref}
            {...props}
            maxLength={maxLength}
            onChange={(e) => {
              setCharCount(e.target.value.length)
              props.onChange?.(e)
            }}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'w-full resize-none rounded-xl px-4 py-3 text-sm text-white',
              'transition-all duration-200 placeholder:text-white/30',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            )}
            style={baseStyles}
            aria-invalid={!!error}
          />

          {showCount && (
            <div className="absolute right-3 bottom-2 text-xs text-white/40">
              {charCount}
              {maxLength && `/${maxLength}`}
            </div>
          )}

          {/* Focus Glow */}
          <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                style={{
                  background: `radial-gradient(circle at center, ${DESIGN.colors.primaryGlow} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {showCount && helperText && <p className="mt-2 text-xs text-white/40">{helperText}</p>}
      </InputWrapper>
    )
  },
)
FormTextarea.displayName = 'FormTextarea'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUBMIT BUTTON — Premium animated button
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SubmitButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  disabled?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  className?: string
  type?: 'submit' | 'button'
  onClick?: () => void
}

export function SubmitButton({
  children,
  isLoading = false,
  loadingText = 'Procesando...',
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  type = 'submit',
  onClick,
}: SubmitButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const variantColors = {
    primary: { bg: 'from-violet-600 to-purple-600', glow: DESIGN.colors.primaryGlow },
    success: { bg: 'from-emerald-600 to-green-600', glow: DESIGN.colors.successGlow },
    warning: { bg: 'from-amber-600 to-orange-600', glow: 'rgba(245, 158, 11, 0.5)' },
    danger: { bg: 'from-rose-600 to-red-600', glow: DESIGN.colors.errorGlow },
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  const colors = variantColors[variant]

  return (
    <motion.button
      type={type}
      onClick={onClick}
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
// CALCULATION PANEL — Real-time calculations display
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CalculationItem {
  label: string
  value: number
  highlight?: boolean
  color?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

interface CalculationPanelProps {
  title: string
  items: CalculationItem[]
  className?: string
}

export function CalculationPanel({ title, items, className }: CalculationPanelProps) {
  const colorMap = {
    default: 'text-white',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
    info: 'text-blue-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl', className)}
    >
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center justify-between',
              item.highlight && 'border-t border-white/10 pt-2',
            )}
          >
            <span
              className={cn('text-sm', item.highlight ? 'font-medium text-white' : 'text-white/60')}
            >
              {item.label}
            </span>
            <span
              className={cn(
                'font-mono text-sm font-bold',
                colorMap[item.color || 'default'],
                item.highlight && 'text-base',
              )}
            >
              {formatCurrency(item.value)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM MODAL WRAPPER — Premium modal container
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = 'md',
  className,
}: FormModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={DESIGN.animation.spring}
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-2xl',
              sizeClasses[size],
              className,
            )}
            style={{
              background:
                'linear-gradient(145deg, rgba(30, 20, 50, 0.98) 0%, rgba(15, 10, 30, 0.98) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.15)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                    {icon}
                  </div>
                )}
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-white">
                    {title}
                  </h2>
                  {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
                </div>
              </div>

              <motion.button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM SECTION — Group related fields
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormSectionProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function FormSection({
  title,
  description,
  icon,
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border border-white/10 bg-white/5', className)}
    >
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          collapsible && 'cursor-pointer hover:bg-white/5',
          (!collapsible || isExpanded) && 'border-b border-white/10',
        )}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-violet-400">{icon}</span>}
          <div>
            <h3 className="text-sm font-medium text-white">{title}</h3>
            {description && <p className="text-xs text-white/50">{description}</p>}
          </div>
        </div>

        {collapsible && (
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-white/50" />
          </motion.div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {(!collapsible || isExpanded) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM GRID — Responsive layout
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormGridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FormGrid({ children, cols = 2, gap = 'md', className }: FormGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  const gapClass = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return <div className={cn('grid', colsClass[cols], gapClass[gap], className)}>{children}</div>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM ACTIONS — Footer with buttons
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right' | 'between'
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-t border-white/10 pt-4',
        alignClass[align],
        className,
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPLETE FORM EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  Controller,
  FormProvider,
  // React Hook Form
  useForm,
  useFormContext,
  useWatch,
  // Resolver
  zodResolver,
}

// Type exports
export type {
  CalculationItem,
  CalculationPanelProps,
  FormActionsProps,
  FormCurrencyInputProps,
  FormGridProps,
  FormInputProps,
  FormModalProps,
  FormSectionProps,
  FormSelectProps,
  FormTextareaProps,
  SelectOption,
  SubmitButtonProps,
}
