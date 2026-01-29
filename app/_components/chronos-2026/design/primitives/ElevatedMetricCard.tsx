'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊✨ ELEVATED METRIC CARD — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Card de métricas con animaciones premium:
 * - Contador animado con spring physics
 * - Indicador de tendencia con colores
 * - Barra de progreso animada
 * - Efectos hover cinematográficos
 * - Micro-interacciones satisfactorias
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/lib/utils'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ElevatedMetricCardProps {
  label: string
  value: number
  previousValue?: number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  format?: 'number' | 'currency' | 'percent'
  color?: 'violet' | 'cyan' | 'pink' | 'gold' | 'emerald'
  showProgress?: boolean
  progressMax?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function useAnimatedCounter(end: number, duration: number = 2000) {
  const [displayValue, setDisplayValue] = useState(0)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  })

  useEffect(() => {
    motionValue.set(end)
  }, [end, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (v) => {
      setDisplayValue(Math.round(v))
    })
    return unsubscribe
  }, [springValue])

  return displayValue
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const colorStyles = {
  violet: {
    iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
    iconColor: 'text-violet-400',
    progressGradient: 'from-violet-500 to-fuchsia-500',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    borderHover: 'hover:border-violet-500/30',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    progressGradient: 'from-cyan-500 to-blue-500',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    borderHover: 'hover:border-cyan-500/30',
  },
  pink: {
    iconBg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
    iconColor: 'text-pink-400',
    progressGradient: 'from-pink-500 to-rose-500',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    borderHover: 'hover:border-pink-500/30',
  },
  gold: {
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    iconColor: 'text-amber-400',
    progressGradient: 'from-amber-500 to-yellow-500',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    borderHover: 'hover:border-amber-500/30',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    progressGradient: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    borderHover: 'hover:border-emerald-500/30',
  },
}

const sizeClasses = {
  sm: {
    padding: 'p-4',
    iconWrapper: 'p-2',
    iconSize: 'w-4 h-4',
    valueSize: 'text-2xl',
    labelSize: 'text-xs',
  },
  md: {
    padding: 'p-5',
    iconWrapper: 'p-2.5',
    iconSize: 'w-5 h-5',
    valueSize: 'text-3xl',
    labelSize: 'text-sm',
  },
  lg: {
    padding: 'p-6',
    iconWrapper: 'p-3',
    iconSize: 'w-6 h-6',
    valueSize: 'text-4xl',
    labelSize: 'text-sm',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORMAT VALUE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function formatValue(value: number, format: 'number' | 'currency' | 'percent'): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    case 'percent':
      return `${value}%`
    default:
      return new Intl.NumberFormat('es-MX').format(value)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ElevatedMetricCard({
  label,
  value,
  previousValue,
  change,
  changeLabel,
  icon: Icon,
  format = 'number',
  color = 'violet',
  showProgress = false,
  progressMax = 100,
  size = 'md',
  className,
}: ElevatedMetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const animatedValue = useAnimatedCounter(value)

  // Mouse position for spotlight
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  const styles = colorStyles[color]
  const sizes = sizeClasses[size]

  // Calculate change if not provided
  const calculatedChange =
    change ?? (previousValue ? ((value - previousValue) / previousValue) * 100 : undefined)
  const isPositive = calculatedChange !== undefined && calculatedChange >= 0

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [mouseX, mouseY],
  )

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0.5)
        mouseY.set(0.5)
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        sizes.padding,
        'bg-gradient-to-br from-white/[0.05] to-white/[0.02]',
        'border border-white/10',
        styles.borderHover,
        'transition-all duration-500',
        'hover:shadow-lg',
        className,
      )}
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      whileHover={{
        boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 30px ${styles.glowColor}`,
      }}
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useTransform(
            [smoothX, smoothY],
            ([x, y]) =>
              `radial-gradient(400px circle at ${Number(x) * 100}% ${Number(y) * 100}%, ${styles.glowColor}, transparent 40%)`,
          ),
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header: Icon + Change */}
        <div className="mb-4 flex items-start justify-between">
          <motion.div
            className={cn(
              'rounded-xl transition-colors duration-300',
              sizes.iconWrapper,
              styles.iconBg,
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Icon className={cn(sizes.iconSize, styles.iconColor)} />
          </motion.div>

          {calculatedChange !== undefined && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium',
                isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400',
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? '+' : ''}
              {calculatedChange.toFixed(1)}%
            </motion.span>
          )}
        </div>

        {/* Value */}
        <motion.div className={cn(sizes.valueSize, 'mb-1 font-bold text-white')}>
          {formatValue(animatedValue, format)}
        </motion.div>

        {/* Label */}
        <p className={cn(sizes.labelSize, 'text-gray-400')}>{label}</p>

        {/* Change Label */}
        {changeLabel && <p className="mt-1 text-xs text-gray-500">{changeLabel}</p>}

        {/* Progress Bar */}
        {showProgress && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min((value / progressMax) * 100, 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              className={cn('h-full rounded-full bg-gradient-to-r', styles.progressGradient)}
            />
          </div>
        )}
      </div>

      {/* Bottom Glow Line */}
      <div
        className={cn(
          'absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2',
          'bg-gradient-to-r from-transparent to-transparent',
          'transition-all duration-500 group-hover:w-1/2',
          styles.progressGradient.replace('from-', 'via-').replace('to-', 'via-'),
        )}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// METRIC GRID — Grid de métricas con stagger animation
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function MetricGrid({ children, columns = 4, className }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={cn('grid gap-4', gridCols[columns], className)}
    >
      {children}
    </motion.div>
  )
}
