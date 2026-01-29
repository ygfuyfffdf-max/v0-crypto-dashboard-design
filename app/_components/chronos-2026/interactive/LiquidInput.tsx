/**
 * 💧✨ LIQUID INPUT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Campos que "respiran" al focus con border líquida + spring al escribir
 * Efecto: Campo respira + border oro/violeta líquido animado
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'

interface LiquidInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  type?: 'text' | 'number' | 'email' | 'password' | 'search'
  icon?: LucideIcon
  label?: string
  error?: string
  success?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'floating' | 'minimal'
  colorScheme?: 'violet' | 'gold' | 'emerald' | 'rose'
  className?: string
}

const COLOR_SCHEMES = {
  violet: {
    focus: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.3)',
    gradient: 'from-violet-500 to-purple-600',
  },
  gold: {
    focus: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.3)',
    gradient: 'from-amber-400 to-orange-500',
  },
  emerald: {
    focus: '#10B981',
    glow: 'rgba(16, 185, 129, 0.3)',
    gradient: 'from-emerald-400 to-teal-500',
  },
  rose: {
    focus: '#EC4899',
    glow: 'rgba(236, 72, 153, 0.3)',
    gradient: 'from-rose-400 to-pink-500',
  },
}

const SIZES = {
  sm: {
    input: 'px-4 py-3 text-sm',
    icon: 'w-4 h-4',
    label: 'text-xs',
  },
  md: {
    input: 'px-6 py-4 text-base',
    icon: 'w-5 h-5',
    label: 'text-sm',
  },
  lg: {
    input: 'px-8 py-6 text-xl',
    icon: 'w-6 h-6',
    label: 'text-base',
  },
}

export function LiquidInput({
  placeholder = 'Escribe aquí...',
  value: controlledValue,
  onChange,
  onSubmit,
  type = 'text',
  icon: Icon,
  label,
  error,
  success,
  disabled = false,
  size = 'md',
  variant = 'default',
  colorScheme = 'violet',
  className = '',
}: LiquidInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const value = controlledValue ?? internalValue
  const colors = COLOR_SCHEMES[colorScheme]
  const sizeStyles = SIZES[size]

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)

      // Typing animation trigger
      setIsTyping(true)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 150)
    },
    [controlledValue, onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit) {
        onSubmit(value)
      }
    },
    [onSubmit, value],
  )

  const hasValue = value.length > 0
  const showFloatingLabel = variant === 'floating' && (isFocused || hasValue)

  return (
    <div className={`relative ${className}`}>
      {/* Label (non-floating) */}
      {label && variant !== 'floating' && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-2 block ${sizeStyles.label} font-medium text-white/70`}
        >
          {label}
        </motion.label>
      )}

      <motion.div
        className="relative"
        animate={{
          scale: isTyping ? 1.01 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Glow background when focused */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-none absolute -inset-1 rounded-3xl"
              style={{
                background: colors.glow,
                filter: 'blur(20px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Liquid border animation */}
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          initial={false}
          animate={{
            opacity: isFocused ? 1 : 0,
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              background: isFocused
                ? [
                    `linear-gradient(0deg, ${colors.focus}60, transparent)`,
                    `linear-gradient(90deg, ${colors.focus}60, transparent)`,
                    `linear-gradient(180deg, ${colors.focus}60, transparent)`,
                    `linear-gradient(270deg, ${colors.focus}60, transparent)`,
                    `linear-gradient(360deg, ${colors.focus}60, transparent)`,
                  ]
                : 'linear-gradient(0deg, transparent, transparent)',
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Input container */}
        <div
          className={`relative flex items-center gap-3 rounded-2xl border bg-white/5 backdrop-blur-2xl transition-all duration-300 ${
            isFocused
              ? `border-[${colors.focus}] shadow-lg`
              : 'border-white/10 hover:border-white/20'
          } ${error ? 'border-red-500/50' : ''} ${success ? 'border-emerald-500/50' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
          style={{
            boxShadow: isFocused
              ? `0 0 30px ${colors.glow}, inset 0 0 20px ${colors.glow}`
              : undefined,
          }}
        >
          {/* Icon */}
          {Icon && (
            <motion.div
              className={`absolute left-4 ${sizeStyles.icon}`}
              animate={{
                color: isFocused ? colors.focus : 'rgba(255,255,255,0.4)',
                scale: isFocused ? 1.1 : 1,
              }}
            >
              <Icon className="h-full w-full" />
            </motion.div>
          )}

          {/* Floating label */}
          {variant === 'floating' && label && (
            <motion.label
              initial={false}
              animate={{
                y: showFloatingLabel ? -28 : 0,
                x: showFloatingLabel ? -8 : 0,
                scale: showFloatingLabel ? 0.85 : 1,
                color: isFocused ? colors.focus : 'rgba(255,255,255,0.5)',
              }}
              className={`absolute left-6 ${sizeStyles.label} pointer-events-none origin-left transition-colors`}
            >
              {label}
            </motion.label>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={variant === 'floating' && label ? '' : placeholder}
            className={`w-full bg-transparent ${sizeStyles.input} ${Icon ? 'pl-12' : ''} text-white placeholder-white/40 focus:outline-none disabled:cursor-not-allowed`}
          />

          {/* Success/Error indicator */}
          <AnimatePresence>
            {(success || error) && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className={`absolute right-4 flex h-6 w-6 items-center justify-center rounded-full ${success ? 'bg-emerald-500' : 'bg-red-500'} `}
              >
                {success ? '✓' : '!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// Specialized search input variant
export function LiquidSearchInput({
  onSearch,
  placeholder = 'Buscar...',
  ...props
}: Omit<LiquidInputProps, 'onSubmit'> & { onSearch?: (query: string) => void }) {
  return (
    <LiquidInput
      type="search"
      placeholder={placeholder}
      onSubmit={onSearch}
      colorScheme="violet"
      {...props}
    />
  )
}

export default LiquidInput
