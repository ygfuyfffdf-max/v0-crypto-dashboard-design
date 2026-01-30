/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 CHRONOS 2026 — iOS PREMIUM CARDS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de cards ultra limpio estilo iOS 18+ / visionOS:
 * - SIN efectos 3D inmersivos con cursor (elimina tilt problemático)
 * - Glassmorphism Gen6 avanzado
 * - Micro-interacciones sutiles y elegantes
 * - Variantes específicas para KPIs, Stats, Info
 * - Optimizado para mobile y desktop
 * - Animaciones spring suaves
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  memo,
  ReactNode,
  useCallback,
  useState,
  forwardRef
} from 'react'
import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS METRIC CARD - Card para KPIs y métricas
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
  iconColor?: string
  footer?: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'featured'
  loading?: boolean
}

export const iOSMetricCard = memo(function iOSMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = '#8B5CF6',
  footer,
  onClick,
  className,
  variant = 'default',
  loading = false,
}: iOSMetricCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus
  const trendColor = trend?.direction === 'up' ? 'text-emerald-400' : trend?.direction === 'down' ? 'text-red-400' : 'text-white/40'

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'relative rounded-xl p-3 overflow-hidden',
          'bg-white/[0.05] backdrop-blur-xl',
          'border border-white/[0.08]',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        onPointerDown={() => onClick && setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        whileHover={onClick ? { backgroundColor: 'rgba(255,255,255,0.08)' } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      >
        <div className="flex items-center justify-between gap-3">
          {Icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <Icon size={16} style={{ color: iconColor }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 truncate">{title}</p>
            <p className="text-base font-semibold text-white truncate">{value}</p>
          </div>
          {trend && (
            <div className={cn('flex items-center gap-0.5 text-xs', trendColor)}>
              <TrendIcon size={12} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        className={cn(
          'relative rounded-2xl p-5 overflow-hidden',
          'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
          'backdrop-blur-2xl',
          'border border-white/[0.1]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.15)]',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.01, y: -2 } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Shine effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            {Icon && (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${iconColor}15`,
                  boxShadow: `0 4px 16px ${iconColor}20`
                }}
              >
                <Icon size={24} style={{ color: iconColor }} />
              </div>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                trend.direction === 'up' && 'bg-emerald-500/15 text-emerald-400',
                trend.direction === 'down' && 'bg-red-500/15 text-red-400',
                trend.direction === 'neutral' && 'bg-white/10 text-white/50'
              )}>
                <TrendIcon size={12} />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-sm text-white/40 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-white/60">{title}</p>

          {/* Footer */}
          {footer && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              {footer}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-4 overflow-hidden',
        'bg-white/[0.05] backdrop-blur-xl',
        'border border-white/[0.08]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.1)]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      onPointerDown={() => onClick && setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      whileHover={onClick ? { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)' } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${iconColor}15` }}
              >
                <Icon size={18} style={{ color: iconColor }} />
              </div>
            )}
            <p className="text-sm font-medium text-white/60">{title}</p>
          </div>
          {onClick && <ChevronRight size={16} className="text-white/30" />}
        </div>

        {/* Value & Trend */}
        <div className="flex items-end justify-between">
          <div>
            {loading ? (
              <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-white/40 mt-1">{subtitle}</p>
            )}
          </div>

          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trendColor
            )}>
              {trend.direction === 'up' ? <ArrowUpRight size={16} /> : trend.direction === 'down' ? <ArrowDownRight size={16} /> : null}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS INFO CARD - Card para información
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSInfoCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  action?: {
    label: string
    onClick: () => void
  }
  badge?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium'
  className?: string
  onClick?: () => void
}

export const iOSInfoCard = memo(function iOSInfoCard({
  title,
  description,
  icon: Icon,
  iconColor,
  action,
  badge,
  variant = 'default',
  className,
  onClick,
}: iOSInfoCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-white/[0.05]',
      border: 'border-white/[0.08]',
      iconBg: 'bg-white/10',
      iconColor: iconColor || '#FFFFFF',
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: iconColor || '#34D399',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20',
      iconColor: iconColor || '#FBBF24',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/20',
      iconColor: iconColor || '#F87171',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: iconColor || '#60A5FA',
    },
    premium: {
      bg: 'bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15',
      border: 'border-violet-500/30',
      iconBg: 'bg-violet-500/20',
      iconColor: iconColor || '#A78BFA',
    },
  }

  const styles = variantStyles[variant]

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-4 overflow-hidden',
        'backdrop-blur-xl',
        'border',
        styles.bg,
        styles.border,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', styles.iconBg)}
          >
            <Icon size={20} style={{ color: styles.iconColor }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{title}</p>
            {badge && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/60 shrink-0">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-white/50 line-clamp-2">{description}</p>
          )}
          {action && (
            <button
              onClick={(e) => { e.stopPropagation(); action.onClick() }}
              className="mt-2 text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              {action.label}
            </button>
          )}
        </div>
        {onClick && <ChevronRight size={18} className="text-white/30 shrink-0" />}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS ENTITY CARD - Card para entidades (clientes, bancos, etc)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSEntityCardProps {
  title: string
  subtitle?: string
  avatar?: ReactNode
  avatarUrl?: string
  avatarColor?: string
  badge?: {
    label: string
    variant?: 'default' | 'success' | 'warning' | 'error' | 'premium'
  }
  meta?: Array<{
    label: string
    value: string | number
    icon?: LucideIcon
  }>
  actions?: ReactNode
  selected?: boolean
  onClick?: () => void
  onLongPress?: () => void
  className?: string
}

export const iOSEntityCard = memo(function iOSEntityCard({
  title,
  subtitle,
  avatar,
  avatarUrl,
  avatarColor = '#8B5CF6',
  badge,
  meta,
  actions,
  selected = false,
  onClick,
  onLongPress,
  className,
}: iOSEntityCardProps) {
  const longPressRef = useState<NodeJS.Timeout | null>(null)

  const handlePointerDown = useCallback(() => {
    if (onLongPress) {
      longPressRef[1](setTimeout(() => {
        onLongPress()
      }, 500))
    }
  }, [onLongPress, longPressRef])

  const handlePointerUp = useCallback(() => {
    if (longPressRef[0]) {
      clearTimeout(longPressRef[0])
      longPressRef[1](null)
    }
  }, [longPressRef])

  const badgeVariants = {
    default: 'bg-white/10 text-white/70',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    error: 'bg-red-500/15 text-red-400',
    premium: 'bg-violet-500/15 text-violet-400',
  }

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-4 overflow-hidden',
        'bg-white/[0.05] backdrop-blur-xl',
        'border transition-colors duration-200',
        selected ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/[0.08]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      whileHover={onClick ? {
        backgroundColor: selected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.07)',
      } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Selection indicator */}
      {selected && (
        <motion.div
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <motion.path
              d="M2 6L5 9L10 3"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      )}

      <div className="relative flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            backgroundColor: avatarUrl ? 'transparent' : `${avatarColor}20`,
          }}
        >
          {avatar ? avatar : avatarUrl ? (
            <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span
              className="text-lg font-bold"
              style={{ color: avatarColor }}
            >
              {title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
            {badge && (
              <span className={cn(
                'text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0',
                badgeVariants[badge.variant || 'default']
              )}>
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-white/50 truncate">{subtitle}</p>
          )}

          {/* Meta info */}
          {meta && meta.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {meta.map((item, index) => {
                const MetaIcon = item.icon
                return (
                  <div key={index} className="flex items-center gap-1.5 text-xs text-white/40">
                    {MetaIcon && <MetaIcon size={12} />}
                    <span>{item.label}:</span>
                    <span className="text-white/60 font-medium">{item.value}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && !selected && (
          <div className="shrink-0">{actions}</div>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS ACTION CARD - Card con acciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSActionCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  primaryAction?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const iOSActionCard = memo(function iOSActionCard({
  title,
  description,
  icon: Icon,
  iconColor = '#8B5CF6',
  primaryAction,
  secondaryAction,
  className,
}: iOSActionCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-5 overflow-hidden',
        'bg-white/[0.05] backdrop-blur-xl',
        'border border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative">
        <div className="flex items-start gap-4 mb-4">
          {Icon && (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${iconColor}15`,
                boxShadow: `0 4px 12px ${iconColor}15`
              }}
            >
              <Icon size={24} style={{ color: iconColor }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-white/50">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
            {secondaryAction && (
              <motion.button
                onClick={secondaryAction.onClick}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl',
                  'bg-white/[0.08] text-white/70',
                  'text-sm font-medium',
                  'hover:bg-white/[0.12] hover:text-white transition-colors'
                )}
                whileTap={{ scale: 0.98 }}
              >
                {secondaryAction.label}
              </motion.button>
            )}
            {primaryAction && (
              <motion.button
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl',
                  'bg-violet-500 text-white',
                  'text-sm font-medium',
                  'hover:bg-violet-400 transition-colors',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  'shadow-[0_4px_12px_rgba(139,92,246,0.3)]'
                )}
                whileTap={{ scale: 0.98 }}
              >
                {primaryAction.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Cargando...
                  </span>
                ) : primaryAction.label}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  iOSMetricCardProps,
  iOSInfoCardProps,
  iOSEntityCardProps,
  iOSActionCardProps,
}
