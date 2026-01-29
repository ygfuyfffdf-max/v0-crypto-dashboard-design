/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔢 CHRONOS ANIMATED COUNTERS + LOADING STATES — CINEMATOGRAPHIC PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Contadores animados con física real + loading states cinematográficos
 * Micro-interacciones premium para feedback visual perfecto
 *
 * TECNOLOGÍAS: motion/react + React Spring + custom easing
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOKS DE CONTADOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para contador animado con easing suave
 */
export function useAnimatedCounter(
  end: number,
  duration: number = 2000,
  start: number = 0,
  decimals: number = 0,
) {
  const [count, setCount] = useState(start)
  const motionValue = useMotionValue(start)
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 30 })

  useEffect(() => {
    motionValue.set(end)

    const unsubscribe = springValue.on('change', (latest) => {
      setCount(Number(latest.toFixed(decimals)))
    })

    return unsubscribe
  }, [end, motionValue, springValue, decimals])

  return count
}

/**
 * Hook para contador con separación de miles
 */
export function useFormattedCounter(
  end: number,
  duration: number = 2000,
  locale: string = 'es-MX',
) {
  const count = useAnimatedCounter(end, duration)

  return count.toLocaleString(locale)
}

/**
 * Hook para contador de moneda
 */
export function useCurrencyCounter(
  end: number,
  duration: number = 2000,
  currency: string = 'MXN',
  locale: string = 'es-MX',
) {
  const count = useAnimatedCounter(end, duration, 0, 2)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(count)
}

/**
 * Hook para contador de porcentaje
 */
export function usePercentageCounter(end: number, duration: number = 2000) {
  const count = useAnimatedCounter(end, duration, 0, 1)

  return `${count}%`
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES DE CONTADOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Contador animado básico
 */
export function AnimatedCounter({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const count = useAnimatedCounter(value, duration, 0, decimals)

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  )
}

interface CurrencyCounterProps {
  value: number
  duration?: number
  currency?: string
  locale?: string
  className?: string
  showSign?: boolean
}

/**
 * Contador de moneda premium
 */
export function CurrencyCounter({
  value,
  duration = 2000,
  currency = 'MXN',
  locale = 'es-MX',
  className = '',
  showSign = true,
}: CurrencyCounterProps) {
  const formatted = useCurrencyCounter(value, duration, currency, locale)

  const isPositive = value >= 0
  const colorClass = showSign
    ? isPositive
      ? 'text-emerald-400'
      : 'text-rose-400'
    : ''

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`font-bold ${colorClass} ${className}`}
    >
      {showSign && value > 0 && '+'}
      {formatted}
    </motion.span>
  )
}

interface PercentageCounterProps {
  value: number
  duration?: number
  className?: string
  showSign?: boolean
}

/**
 * Contador de porcentaje con indicador visual
 */
export function PercentageCounter({
  value,
  duration = 2000,
  className = '',
  showSign = true,
}: PercentageCounterProps) {
  const formatted = usePercentageCounter(value, duration)

  const isPositive = value >= 0
  const colorClass = showSign
    ? isPositive
      ? 'text-emerald-400'
      : 'text-rose-400'
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      {showSign && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          className={colorClass}
        >
          {isPositive ? '↑' : '↓'}
        </motion.span>
      )}
      <span className={`font-semibold ${colorClass}`}>
        {showSign && value > 0 && '+'}
        {formatted}
      </span>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING STATES PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SpinnerProps {
  size?: number
  color?: string
  thickness?: number
}

/**
 * Spinner premium con gradiente
 */
export function PremiumSpinner({ size = 40, color = '#8B5CF6', thickness = 4 }: SpinnerProps) {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        border: `${thickness}px solid transparent`,
        borderTop: `${thickness}px solid ${color}`,
        borderRight: `${thickness}px solid ${color}80`,
        borderRadius: '50%',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/**
 * Pulsing dots loader
 */
export function PulsingDots({ color = '#8B5CF6', size = 8 }: { color?: string; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  height?: number
  showPercentage?: boolean
  animated?: boolean
}

/**
 * Progress bar premium con animación
 */
export function PremiumProgressBar({
  progress,
  height = 8,
  showPercentage = true,
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div className="w-full space-y-2">
      <div
        className="relative overflow-hidden rounded-full bg-white/10"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {showPercentage && (
        <div className="text-right text-sm font-medium text-white/60">
          <AnimatedCounter value={clampedProgress} decimals={0} suffix="%" />
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton loader premium
 */
export function PremiumSkeleton({
  width = '100%',
  height = 20,
  className = '',
}: {
  width?: string | number
  height?: string | number
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

/**
 * Orbital loader premium
 */
export function OrbitalLoader({ size = 60 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500"
          animate={{
            x: [0, size / 2, 0, -size / 2, 0],
            y: [0, -size / 2, 0, size / 2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  AnimatedCounterProps,
  CurrencyCounterProps,
  PercentageCounterProps,
  SpinnerProps,
  ProgressBarProps,
}
