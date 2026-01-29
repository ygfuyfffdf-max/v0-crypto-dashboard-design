'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 OMEGA DESIGN SYSTEM — INPUTS & TABLE COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Search, X } from 'lucide-react'
import React, { forwardRef, ReactNode, useRef, useState } from 'react'
import { OMEGA } from './OmegaDesignSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 OMEGA INPUT — FLOATING LABEL + NEUMORPHIC
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OmegaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  palette?: keyof typeof OMEGA.palettes
  variant?: 'glass' | 'neumorphic' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  enableGlow?: boolean
}

export const OmegaInput = forwardRef<HTMLInputElement, OmegaInputProps>(
  (
    {
      label,
      helperText,
      error,
      palette = 'dashboard',
      variant = 'glass',
      size = 'md',
      icon,
      iconPosition = 'left',
      enableGlow = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue)
    const colors = OMEGA.palettes[palette]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const sizeClasses = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    }

    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return {
            background: OMEGA.glass.subtle.bg,
            backdropFilter: OMEGA.glass.subtle.blur,
            WebkitBackdropFilter: OMEGA.glass.subtle.blur,
            border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : isFocused ? colors.primary + '60' : OMEGA.glass.subtle.border}`,
            boxShadow:
              isFocused && enableGlow ? `0 0 30px ${colors.glow}` : OMEGA.glass.subtle.shadow,
          }
        case 'neumorphic':
          return {
            background: 'rgba(20, 20, 30, 0.8)',
            border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.05)'}`,
            boxShadow: isFocused
              ? OMEGA.neumorphic.pressed.combined
              : OMEGA.neumorphic.raised.combined,
          }
        case 'outline':
          return {
            background: 'transparent',
            border: `2px solid ${error ? 'rgba(239, 68, 68, 0.5)' : isFocused ? colors.primary : 'rgba(255, 255, 255, 0.2)'}`,
            boxShadow: isFocused && enableGlow ? `0 0 30px ${colors.glow}` : 'none',
          }
        default:
          return {}
      }
    }

    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          {/* Icon left */}
          {icon && iconPosition === 'left' && (
            <div
              className="absolute top-1/2 left-4 -translate-y-1/2 text-white/40 transition-colors duration-300"
              style={{ color: isFocused ? colors.primary : undefined }}
            >
              {icon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            type={props.type}
            name={props.name}
            id={props.id}
            placeholder={props.placeholder}
            value={props.value}
            defaultValue={props.defaultValue}
            disabled={props.disabled}
            required={props.required}
            readOnly={props.readOnly}
            autoComplete={props.autoComplete}
            autoFocus={props.autoFocus}
            maxLength={props.maxLength}
            minLength={props.minLength}
            pattern={props.pattern}
            min={props.min}
            max={props.max}
            step={props.step}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e as React.FocusEvent<HTMLInputElement>)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e as React.FocusEvent<HTMLInputElement>)
            }}
            onChange={handleChange}
            className={cn(
              'w-full rounded-2xl px-5 text-white outline-none placeholder:text-white/30',
              'transition-all duration-300',
              icon && iconPosition === 'left' && 'pl-12',
              icon && iconPosition === 'right' && 'pr-12',
              label && 'pt-5',
              sizeClasses[size],
            )}
            style={getVariantStyles()}
          />

          {/* Floating label */}
          {label && (
            <motion.label
              className="pointer-events-none absolute left-5"
              style={{
                color: error ? '#F87171' : isFocused ? colors.primary : 'rgba(255, 255, 255, 0.4)',
              }}
              animate={{
                top: isFocused || hasValue ? 8 : '50%',
                fontSize: isFocused || hasValue ? 10 : 14,
                translateY: isFocused || hasValue ? 0 : '-50%',
              }}
              transition={OMEGA.springs.snappy}
            >
              {label}
            </motion.label>
          )}

          {/* Icon right */}
          {icon && iconPosition === 'right' && (
            <div
              className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 transition-colors duration-300"
              style={{ color: isFocused ? colors.primary : undefined }}
            >
              {icon}
            </div>
          )}

          {/* Focus glow line */}
          <motion.div
            className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
            style={{ background: colors.primary }}
            animate={{
              width: isFocused ? '90%' : '0%',
              opacity: isFocused ? 1 : 0,
            }}
            transition={OMEGA.springs.snappy}
            initial={{ translateX: '-50%' }}
          />
        </div>

        {/* Helper/Error text */}
        <AnimatePresence>
          {(helperText || error) && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn('mt-2 text-xs', error ? 'text-red-400' : 'text-white/40')}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
OmegaInput.displayName = 'OmegaInput'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔍 OMEGA SEARCH INPUT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OmegaSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  palette?: keyof typeof OMEGA.palettes
  className?: string
}

export function OmegaSearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  palette = 'dashboard',
  className,
}: OmegaSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const colors = OMEGA.palettes[palette]

  return (
    <motion.div
      className={cn('relative', className)}
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={OMEGA.springs.snappy}
    >
      <div
        className="relative flex items-center overflow-hidden rounded-2xl"
        style={{
          background: OMEGA.glass.subtle.bg,
          backdropFilter: OMEGA.glass.subtle.blur,
          border: `1px solid ${isFocused ? colors.primary + '40' : OMEGA.glass.subtle.border}`,
          boxShadow: isFocused ? `0 0 30px ${colors.glow}` : OMEGA.glass.subtle.shadow,
        }}
      >
        <Search
          className="ml-4 h-5 w-5 transition-colors duration-300"
          style={{ color: isFocused ? colors.primary : 'rgba(255, 255, 255, 0.4)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="h-12 flex-1 bg-transparent px-3 text-white outline-none placeholder:text-white/30"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => onChange('')}
              className="mr-4 rounded-full p-1 transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4 text-white/40 hover:text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 OMEGA SELECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OmegaSelectOption {
  value: string
  label: string
  icon?: ReactNode
}

interface OmegaSelectProps {
  options: OmegaSelectOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  palette?: keyof typeof OMEGA.palettes
  variant?: 'glass' | 'neumorphic' | 'outline'
  className?: string
}

export function OmegaSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Seleccionar...',
  palette = 'dashboard',
  variant = 'glass',
  className,
}: OmegaSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const colors = OMEGA.palettes[palette]

  const selectedOption = options.find((o) => o.value === value)

  const getVariantStyles = (focused: boolean) => {
    switch (variant) {
      case 'glass':
        return {
          background: OMEGA.glass.subtle.bg,
          backdropFilter: OMEGA.glass.subtle.blur,
          WebkitBackdropFilter: OMEGA.glass.subtle.blur,
          border: `1px solid ${focused ? colors.primary + '60' : OMEGA.glass.subtle.border}`,
          boxShadow: focused ? `0 0 30px ${colors.glow}` : OMEGA.glass.subtle.shadow,
        }
      case 'neumorphic':
        return {
          background: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: focused ? OMEGA.neumorphic.pressed.combined : OMEGA.neumorphic.raised.combined,
        }
      case 'outline':
        return {
          background: 'transparent',
          border: `2px solid ${focused ? colors.primary : 'rgba(255, 255, 255, 0.2)'}`,
          boxShadow: focused ? `0 0 30px ${colors.glow}` : 'none',
        }
      default:
        return {}
    }
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label className="mb-2 block text-xs tracking-wider text-white/40 uppercase">{label}</label>
      )}

      {/* Trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between rounded-2xl px-5 text-left transition-all duration-300"
        style={getVariantStyles(isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className={cn(selectedOption ? 'text-white' : 'text-white/40')}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={OMEGA.springs.snappy}>
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={OMEGA.springs.snappy}
              className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(20, 20, 30, 0.95)',
                backdropFilter: 'blur(40px)',
                border: `1px solid ${OMEGA.glass.premium.border}`,
                boxShadow: `0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 40px ${colors.glow}`,
              }}
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-5 py-3 text-left transition-all duration-200',
                    option.value === value ? 'text-white' : 'text-white/60 hover:text-white',
                  )}
                  style={{
                    background: option.value === value ? `${colors.primary}20` : 'transparent',
                  }}
                  whileHover={{
                    background: `${colors.primary}15`,
                    x: 4,
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {option.icon}
                  {option.label}
                  {option.value === value && (
                    <motion.div
                      className="ml-auto h-2 w-2 rounded-full"
                      style={{ background: colors.primary, boxShadow: `0 0 10px ${colors.glow}` }}
                      layoutId="select-indicator"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 OMEGA TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OmegaTableColumn<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (item: T, index: number) => ReactNode
}

interface OmegaTableProps<T> {
  data: T[]
  columns: OmegaTableColumn<T>[]
  palette?: keyof typeof OMEGA.palettes
  onRowClick?: (item: T, index: number) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function OmegaTable<T extends Record<string, unknown>>({
  data,
  columns,
  palette = 'dashboard',
  onRowClick,
  isLoading = false,
  emptyMessage = 'No hay datos',
  className,
}: OmegaTableProps<T>) {
  const colors = OMEGA.palettes[palette]
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  return (
    <div
      className={cn('overflow-hidden rounded-3xl', className)}
      style={{
        background: OMEGA.glass.ultraDeep.bg,
        backdropFilter: OMEGA.glass.ultraDeep.blur,
        border: `1px solid ${OMEGA.glass.ultraDeep.border}`,
        boxShadow: OMEGA.glass.ultraDeep.shadow,
      }}
    >
      {/* Header */}
      <div
        className="grid items-center border-b px-6 py-4"
        style={{
          gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
          borderColor: 'rgba(255, 255, 255, 0.05)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              'text-xs font-semibold tracking-wider text-white/40 uppercase',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
            )}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="divide-y divide-white/5">
        {isLoading ? (
          // Skeleton
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid items-center px-6 py-4"
              style={{
                gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
              }}
            >
              {columns.map((_, j) => (
                <div key={j} className="h-4 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ))
        ) : data.length === 0 ? (
          // Empty state
          <div className="px-6 py-16 text-center text-white/40">{emptyMessage}</div>
        ) : (
          // Data rows
          data.map((item, index) => (
            <motion.div
              key={index}
              className={cn(
                'grid items-center px-6 py-4 transition-all duration-300',
                onRowClick && 'cursor-pointer',
              )}
              style={{
                gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
                background: hoveredRow === index ? `${colors.primary}08` : 'transparent',
              }}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onRowClick?.(item, index)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ x: onRowClick ? 4 : 0 }}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className={cn(
                    'text-sm text-white/80',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {column.render ? column.render(item, index) : String(item[column.key] ?? '')}
                </div>
              ))}

              {/* Row hover glow */}
              {hoveredRow === index && (
                <motion.div
                  className="absolute top-0 bottom-0 left-0 w-1 rounded-r"
                  style={{ background: colors.primary, boxShadow: `0 0 20px ${colors.glow}` }}
                  layoutId="row-indicator"
                />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type { OmegaTableColumn }
