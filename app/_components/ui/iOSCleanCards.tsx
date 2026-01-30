/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 CHRONOS 2026 — iOS CLEAN CARD SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de cards ultra limpio estilo iOS 18+:
 * - SIN efectos 3D inmersivos con cursor
 * - Glassmorphism avanzado y elegante
 * - Micro-interacciones sutiles (scale, opacity)
 * - Diseño minimalista premium
 * - Optimizado para mobile y desktop
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { forwardRef, memo, ReactNode, useState, useCallback } from 'react'
import { LucideIcon, ChevronRight, MoreHorizontal, Check, X } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLEAN GLASS CARD - Sin 3D, súper limpio
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanGlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'inset' | 'outlined' | 'solid'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  onLongPress?: () => void
  accentColor?: string
}

export const CleanGlassCard = memo(forwardRef<HTMLDivElement, CleanGlassCardProps>(
  function CleanGlassCard(
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      interactive = false,
      selected = false,
      disabled = false,
      onClick,
      onLongPress,
      accentColor,
    },
    ref
  ) {
    const [isPressed, setIsPressed] = useState(false)
    const longPressTimer = useState<NodeJS.Timeout | null>(null)

    const handlePointerDown = useCallback(() => {
      if (!interactive || disabled) return
      setIsPressed(true)

      if (onLongPress) {
        const timer = setTimeout(() => {
          onLongPress()
          setIsPressed(false)
        }, 500)
        longPressTimer[1](timer)
      }
    }, [interactive, disabled, onLongPress, longPressTimer])

    const handlePointerUp = useCallback(() => {
      setIsPressed(false)
      if (longPressTimer[0]) {
        clearTimeout(longPressTimer[0])
        longPressTimer[1](null)
      }
    }, [longPressTimer])

    const handleClick = useCallback(() => {
      if (!disabled && onClick) {
        onClick()
      }
    }, [disabled, onClick])

    const sizeClasses = {
      sm: 'p-3 rounded-xl',
      md: 'p-4 rounded-2xl',
      lg: 'p-6 rounded-3xl',
    }

    const variantClasses = {
      default: cn(
        'bg-white/[0.06] backdrop-blur-xl',
        'border border-white/[0.08]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.12)]'
      ),
      elevated: cn(
        'bg-white/[0.08] backdrop-blur-2xl',
        'border border-white/[0.1]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.2),0_2px_8px_rgba(0,0,0,0.1)]'
      ),
      inset: cn(
        'bg-black/[0.15] backdrop-blur-lg',
        'border border-white/[0.04]',
        'shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
      ),
      outlined: cn(
        'bg-transparent backdrop-blur-sm',
        'border border-white/[0.15]'
      ),
      solid: cn(
        'bg-zinc-900/90 backdrop-blur-lg',
        'border border-white/[0.06]',
        'shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
      ),
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-colors duration-200',
          sizeClasses[size],
          variantClasses[variant],
          // Interactividad SUTIL - sin 3D
          interactive && !disabled && [
            'cursor-pointer',
            'hover:bg-white/[0.08] hover:border-white/[0.12]',
            'active:bg-white/[0.04]',
          ],
          // Estado pressed
          isPressed && 'bg-white/[0.04]',
          // Seleccionado
          selected && accentColor && [
            'border-2',
            `ring-1 ring-offset-0`,
          ],
          selected && !accentColor && [
            'border-violet-500/50 ring-1 ring-violet-500/30',
          ],
          // Disabled
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        style={selected && accentColor ? {
          borderColor: `${accentColor}50`,
          boxShadow: `0 0 20px ${accentColor}20`,
        } : undefined}
        animate={{
          scale: isPressed ? 0.98 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
      >
        {/* Subtle highlight gradient on top */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 50%, transparent)',
          }}
        />

        {children}
      </motion.div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS METRIC CARD - KPIs elegantes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCleanMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  accentColor?: string
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onClick?: () => void
  className?: string
}

export const iOSCleanMetricCard = memo(function iOSCleanMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = '#8B5CF6',
  size = 'md',
  interactive = false,
  onClick,
  className,
}: iOSCleanMetricCardProps) {
  const sizeConfig = {
    sm: {
      padding: 'p-3',
      iconSize: 'w-8 h-8',
      iconInner: 16,
      titleSize: 'text-xs',
      valueSize: 'text-lg',
      subtitleSize: 'text-[10px]',
    },
    md: {
      padding: 'p-4',
      iconSize: 'w-10 h-10',
      iconInner: 20,
      titleSize: 'text-xs',
      valueSize: 'text-2xl',
      subtitleSize: 'text-xs',
    },
    lg: {
      padding: 'p-5',
      iconSize: 'w-12 h-12',
      iconInner: 24,
      titleSize: 'text-sm',
      valueSize: 'text-3xl',
      subtitleSize: 'text-sm',
    },
  }

  const config = sizeConfig[size]

  return (
    <CleanGlassCard
      variant="elevated"
      interactive={interactive}
      onClick={onClick}
      className={cn(config.padding, className)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(config.titleSize, 'font-medium text-white/60 mb-1 truncate')}>
            {title}
          </p>
          <p className={cn(config.valueSize, 'font-bold text-white tracking-tight')}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {/* Trend or subtitle */}
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  config.subtitleSize,
                  'font-medium flex items-center gap-0.5',
                  trend.direction === 'up' && 'text-emerald-400',
                  trend.direction === 'down' && 'text-red-400',
                  trend.direction === 'neutral' && 'text-white/50'
                )}
              >
                {trend.direction === 'up' && '↑'}
                {trend.direction === 'down' && '↓'}
                {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && (
              <span className={cn(config.subtitleSize, 'text-white/40 truncate')}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              config.iconSize,
              'rounded-xl flex items-center justify-center flex-shrink-0',
              'bg-gradient-to-br'
            )}
            style={{
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              boxShadow: `0 4px 12px ${accentColor}20`,
            }}
          >
            <Icon size={config.iconInner} style={{ color: accentColor }} />
          </div>
        )}
      </div>
    </CleanGlassCard>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS LIST CARD - Listas elegantes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ListItem {
  id: string
  title: string
  subtitle?: string
  value?: string | number
  icon?: LucideIcon
  iconColor?: string
  badge?: string
  badgeColor?: string
  showChevron?: boolean
  onClick?: () => void
}

interface iOSCleanListCardProps {
  title?: string
  items: ListItem[]
  showDividers?: boolean
  className?: string
}

export const iOSCleanListCard = memo(function iOSCleanListCard({
  title,
  items,
  showDividers = true,
  className,
}: iOSCleanListCardProps) {
  return (
    <CleanGlassCard variant="elevated" className={cn('p-0 overflow-hidden', className)}>
      {title && (
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
        </div>
      )}

      <div>
        {items.map((item, index) => {
          const Icon = item.icon
          const isLast = index === items.length - 1

          return (
            <motion.div
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                'transition-colors duration-150',
                item.onClick && 'cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.02]',
                showDividers && !isLast && 'border-b border-white/[0.04]'
              )}
              whileTap={item.onClick ? { scale: 0.99 } : undefined}
              onClick={item.onClick}
            >
              {/* Icon */}
              {Icon && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${item.iconColor || '#8B5CF6'}30, ${item.iconColor || '#8B5CF6'}10)`,
                  }}
                >
                  <Icon size={18} style={{ color: item.iconColor || '#8B5CF6' }} />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-white/50 truncate mt-0.5">{item.subtitle}</p>
                )}
              </div>

              {/* Value / Badge */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.badge && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      background: `${item.badgeColor || '#8B5CF6'}20`,
                      color: item.badgeColor || '#8B5CF6',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {item.value !== undefined && (
                  <span className="text-sm font-semibold text-white/80">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                )}
                {item.showChevron !== false && item.onClick && (
                  <ChevronRight className="w-4 h-4 text-white/30" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </CleanGlassCard>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS EXPANDABLE CARD - Tarjetas expandibles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCleanExpandableCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
}

export const iOSCleanExpandableCard = memo(function iOSCleanExpandableCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = '#8B5CF6',
  children,
  defaultExpanded = false,
  className,
}: iOSCleanExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <CleanGlassCard variant="elevated" className={cn('p-0 overflow-hidden', className)}>
      {/* Header */}
      <motion.div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer',
          'hover:bg-white/[0.02] transition-colors'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.99 }}
      >
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${iconColor}30, ${iconColor}10)`,
            }}
          >
            <Icon size={18} style={{ color: iconColor }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-white/50 truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronRight className="w-5 h-5 text-white/40" />
        </motion.div>
      </motion.div>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CleanGlassCard>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS ACTION CARD - Para acciones principales
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCleanActionCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  accentColor?: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

export const iOSCleanActionCard = memo(function iOSCleanActionCard({
  title,
  description,
  icon: Icon,
  accentColor,
  onClick,
  loading = false,
  disabled = false,
  variant = 'default',
  className,
}: iOSCleanActionCardProps) {
  const variantColors = {
    default: accentColor || '#8B5CF6',
    primary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  }

  const color = variantColors[variant]

  return (
    <CleanGlassCard
      variant="elevated"
      interactive={!disabled && !loading}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn('group', className)}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
              'transition-transform duration-200 group-hover:scale-105'
            )}
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}80)`,
              boxShadow: `0 8px 20px ${color}40`,
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              </motion.div>
            ) : (
              <Icon size={22} className="text-white" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{title}</h3>
          {description && (
            <p className="text-sm text-white/50 mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0 transition-transform group-hover:translate-x-1" />
      </div>
    </CleanGlassCard>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  CleanGlassCardProps,
  iOSCleanMetricCardProps,
  iOSCleanListCardProps,
  iOSCleanExpandableCardProps,
  iOSCleanActionCardProps,
  ListItem,
}
