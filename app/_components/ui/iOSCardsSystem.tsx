/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎴 CHRONOS 2026 — iOS PREMIUM CARDS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de cards premium SIN efectos 3D inmersivos problemáticos:
 * - Micro-animaciones sutiles y elegantes
 * - Glassmorphism limpio
 * - Interacciones táctiles optimizadas
 * - Estados visuales claros
 * - Sin parallax/tilt con cursor que causa mareos
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  LucideIcon,
  MoreVertical,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
} from 'lucide-react'
import { memo, ReactNode, useCallback, useState } from 'react'
import { formatCurrency } from '@/app/_lib/utils/formatters'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS METRIC CARD - Tarjeta de métrica limpia sin efectos 3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: LucideIcon
  color?: 'violet' | 'emerald' | 'rose' | 'amber' | 'blue' | 'default'
  onClick?: () => void
  loading?: boolean
  className?: string
}

const colorVariants = {
  default: {
    bg: 'bg-white/[0.06]',
    border: 'border-white/[0.1]',
    icon: 'bg-white/[0.1] text-white/70',
    accent: 'text-white',
  },
  violet: {
    bg: 'bg-violet-500/[0.08]',
    border: 'border-violet-500/20',
    icon: 'bg-violet-500/20 text-violet-400',
    accent: 'text-violet-400',
  },
  emerald: {
    bg: 'bg-emerald-500/[0.08]',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/20 text-emerald-400',
    accent: 'text-emerald-400',
  },
  rose: {
    bg: 'bg-rose-500/[0.08]',
    border: 'border-rose-500/20',
    icon: 'bg-rose-500/20 text-rose-400',
    accent: 'text-rose-400',
  },
  amber: {
    bg: 'bg-amber-500/[0.08]',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500/20 text-amber-400',
    accent: 'text-amber-400',
  },
  blue: {
    bg: 'bg-blue-500/[0.08]',
    border: 'border-blue-500/20',
    icon: 'bg-blue-500/20 text-blue-400',
    accent: 'text-blue-400',
  },
}

export const iOSMetricCard = memo(function iOSMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'default',
  onClick,
  loading = false,
  className,
}: iOSMetricCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const colors = colorVariants[color]

  const formattedValue = typeof value === 'number' ? formatCurrency(value) : value

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-2xl backdrop-blur-sm border',
        colors.bg,
        colors.border,
        onClick && 'cursor-pointer',
        isPressed && 'scale-[0.98]',
        'transition-transform duration-150',
        className
      )}
      onClick={onClick}
      onPointerDown={() => onClick && setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top row - Icon and trend */}
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={cn('p-2.5 rounded-xl', colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-medium',
              trend.direction === 'up' && 'bg-emerald-500/20 text-emerald-400',
              trend.direction === 'down' && 'bg-rose-500/20 text-rose-400',
              trend.direction === 'neutral' && 'bg-white/10 text-white/50'
            )}
          >
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
            {trend.value}%
          </div>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className={cn('text-2xl font-bold text-white mb-1', colors.accent)}>
          {formattedValue}
        </p>
      )}

      {/* Title */}
      <p className="text-[13px] text-white/50">{title}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className={cn('text-[12px] mt-1', colors.accent)}>{subtitle}</p>
      )}

      {/* Click indicator */}
      {onClick && (
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS LIST CARD - Tarjeta para listas/items
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSListCardProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  badge?: string | number
  badgeColor?: 'default' | 'success' | 'warning' | 'error'
  onClick?: () => void
  showChevron?: boolean
  destructive?: boolean
  disabled?: boolean
  highlighted?: boolean
  className?: string
}

export const iOSListCard = memo(function iOSListCard({
  title,
  subtitle,
  leading,
  trailing,
  badge,
  badgeColor = 'default',
  onClick,
  showChevron = true,
  destructive = false,
  disabled = false,
  highlighted = false,
  className,
}: iOSListCardProps) {
  const badgeColors = {
    default: 'bg-white/20 text-white/70',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-rose-500/20 text-rose-400',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-4 p-4 text-left',
        'bg-white/[0.04] rounded-xl border border-white/[0.06]',
        'transition-all duration-150',
        !disabled && 'hover:bg-white/[0.08] active:scale-[0.99]',
        highlighted && 'bg-violet-500/10 border-violet-500/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
    >
      {/* Leading */}
      {leading && (
        <div className={cn(
          'flex-shrink-0',
          destructive ? 'text-rose-400' : 'text-violet-400'
        )}>
          {leading}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-[15px] font-medium truncate',
            destructive ? 'text-rose-400' : 'text-white'
          )}>
            {title}
          </p>
          {badge !== undefined && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[11px] font-medium',
              badgeColors[badgeColor]
            )}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[13px] text-white/50 truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Trailing */}
      {trailing && (
        <div className="flex-shrink-0 text-white/50">
          {trailing}
        </div>
      )}

      {/* Chevron */}
      {showChevron && onClick && !trailing && (
        <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS EXPANDABLE CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSExpandableCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
}

export const iOSExpandableCard = memo(function iOSExpandableCard({
  title,
  subtitle,
  icon: Icon,
  children,
  defaultExpanded = false,
  className,
}: iOSExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <motion.div
      className={cn(
        'rounded-2xl border overflow-hidden',
        'bg-white/[0.04] border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.04] transition-colors"
      >
        {Icon && (
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1 text-left">
          <p className="text-[15px] font-medium text-white">{title}</p>
          {subtitle && (
            <p className="text-[13px] text-white/50">{subtitle}</p>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4 text-white/40 rotate-90" />
        </motion.div>
      </motion.button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.06]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS FEATURE CARD - Para destacar funciones/productos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSFeatureCardProps {
  title: string
  description: string
  icon?: LucideIcon
  image?: string
  ctaLabel?: string
  onCta?: () => void
  premium?: boolean
  className?: string
}

export const iOSFeatureCard = memo(function iOSFeatureCard({
  title,
  description,
  icon: Icon,
  image,
  ctaLabel,
  onCta,
  premium = false,
  className,
}: iOSFeatureCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border border-white/[0.1]',
        premium && 'border-amber-500/30',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background image */}
      {image && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Content */}
      <div className="relative p-6">
        {/* Premium badge */}
        {premium && (
          <div className="flex items-center gap-1.5 mb-4">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-[12px] font-semibold text-amber-400 uppercase tracking-wide">
              Premium
            </span>
          </div>
        )}

        {/* Icon */}
        {Icon && (
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
            premium ? 'bg-amber-500/20' : 'bg-violet-500/20'
          )}>
            <Icon className={cn('h-6 w-6', premium ? 'text-amber-400' : 'text-violet-400')} />
          </div>
        )}

        {/* Text */}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-[14px] text-white/60 leading-relaxed mb-4">
          {description}
        </p>

        {/* CTA */}
        {ctaLabel && onCta && (
          <motion.button
            onClick={onCta}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'text-[14px] font-semibold',
              premium
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-violet-500 text-white hover:bg-violet-400',
              'transition-colors duration-150'
            )}
            whileTap={{ scale: 0.97 }}
          >
            {ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS TRANSACTION CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSTransactionCardProps {
  title: string
  subtitle?: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  date?: string
  icon?: LucideIcon
  status?: 'completed' | 'pending' | 'failed'
  onClick?: () => void
  className?: string
}

export const iOSTransactionCard = memo(function iOSTransactionCard({
  title,
  subtitle,
  amount,
  type,
  date,
  icon: Icon,
  status = 'completed',
  onClick,
  className,
}: iOSTransactionCardProps) {
  const typeConfig = {
    income: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', prefix: '+' },
    expense: { color: 'text-rose-400', bg: 'bg-rose-500/20', prefix: '-' },
    transfer: { color: 'text-blue-400', bg: 'bg-blue-500/20', prefix: '' },
  }

  const statusConfig = {
    completed: { color: 'text-emerald-400', label: 'Completado' },
    pending: { color: 'text-amber-400', label: 'Pendiente' },
    failed: { color: 'text-rose-400', label: 'Fallido' },
  }

  const config = typeConfig[type]

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4',
        'bg-white/[0.03] rounded-xl border border-white/[0.05]',
        'hover:bg-white/[0.06] transition-colors duration-150',
        className
      )}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {/* Icon */}
      <div className={cn('p-2.5 rounded-xl', config.bg)}>
        {Icon ? (
          <Icon className={cn('h-5 w-5', config.color)} />
        ) : (
          type === 'income' ? <ArrowDown className={cn('h-5 w-5', config.color)} /> :
          type === 'expense' ? <ArrowUp className={cn('h-5 w-5', config.color)} /> :
          <ArrowDown className={cn('h-5 w-5', config.color)} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[15px] font-medium text-white truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {subtitle && (
            <p className="text-[13px] text-white/50 truncate">{subtitle}</p>
          )}
          {status !== 'completed' && (
            <span className={cn('text-[11px] font-medium', statusConfig[status].color)}>
              • {statusConfig[status].label}
            </span>
          )}
        </div>
      </div>

      {/* Amount & Date */}
      <div className="text-right flex-shrink-0">
        <p className={cn('text-[15px] font-semibold', config.color)}>
          {config.prefix}{formatCurrency(Math.abs(amount))}
        </p>
        {date && (
          <p className="text-[12px] text-white/40 mt-0.5">{date}</p>
        )}
      </div>
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS STATS CARD GROUP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StatItem {
  label: string
  value: string | number
  color?: string
}

interface iOSStatsCardProps {
  title?: string
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export const iOSStatsCard = memo(function iOSStatsCard({
  title,
  stats,
  columns = 3,
  className,
}: iOSStatsCardProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div
      className={cn(
        'p-4 rounded-2xl',
        'bg-white/[0.04] border border-white/[0.08]',
        className
      )}
    >
      {title && (
        <h4 className="text-[13px] font-medium text-white/50 mb-4">{title}</h4>
      )}

      <div className={cn('grid gap-4', gridCols[columns])}>
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p
              className="text-xl font-bold"
              style={{ color: stat.color || '#fff' }}
            >
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-[12px] text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  iOSMetricCardProps,
  iOSListCardProps,
  iOSExpandableCardProps,
  iOSFeatureCardProps,
  iOSTransactionCardProps,
  iOSStatsCardProps,
  StatItem,
}
