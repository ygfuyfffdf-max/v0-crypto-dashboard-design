/**
 * 🎨 CHRONOS DESIGN SYSTEM 2026 — Sistema de Diseño Supremo
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Sistema completo de componentes UI premium reutilizables
 * Base para todos los componentes del proyecto
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { motion } from 'motion/react'
import React, { ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — Tokens de diseño globales
// ═══════════════════════════════════════════════════════════════════════════════════════

export const CHRONOS_TOKENS = {
  // Spacing (8pt grid system)
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    full: '9999px',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
  },

  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'spring(1, 100, 10, 0)',
  },

  // Z-Index
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLASS CARD — Tarjeta con glassmorphism GEN6
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'strong' | 'ultra'
  glow?: boolean
  glowColor?: string
  hover?: boolean
  onClick?: () => void
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  glow = false,
  glowColor = '#8b5cf6',
  hover = true,
  onClick,
}) => {
  const variants: Record<string, React.CSSProperties> = {
    default: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    strong: {
      background: 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(40px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    ultra: {
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(80px) saturate(200%) brightness(120%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
  }

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-300',
        hover && 'cursor-pointer',
        className,
      )}
      style={variants[variant]}
      onClick={onClick}
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
              boxShadow: glow
                ? `0 20px 60px -15px ${glowColor}40, 0 0 0 1px ${glowColor}30`
                : '0 20px 60px -15px rgba(0,0,0,0.3)',
            }
          : {}
      }
      whileTap={hover ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Gradient overlay en hover */}
      {hover && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${glowColor}15 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Border glow en hover */}
      {glow && hover && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 20px ${glowColor}20`,
          }}
        />
      )}

      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// METRIC CARD — Tarjeta de métrica premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = '#8b5cf6',
  className = '',
}) => {
  const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    neutral: '#6b7280',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <GlassCard glow glowColor={color} className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Título */}
          <p className="text-sm font-medium text-white/60">{title}</p>

          {/* Valor principal */}
          <motion.h3
            className="mt-2 text-3xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.h3>

          {/* Subtitle o trend */}
          {(subtitle || trend) && (
            <div className="mt-2 flex items-center gap-2">
              {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
              {trend && trendValue && (
                <motion.span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    background: `${trendColors[trend]}20`,
                    color: trendColors[trend],
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  {trendIcons[trend]} {trendValue}
                </motion.span>
              )}
            </div>
          )}
        </div>

        {/* Icono */}
        {icon && (
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}20)`,
              boxShadow: `0 0 20px ${color}30`,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </GlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PREMIUM BUTTON — Botón ultra-premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface PremiumButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}) => {
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      boxShadow: '0 8px 32px -8px rgba(139, 92, 246, 0.4)',
      color: '#ffffff',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
    },
    ghost: {
      background: 'transparent',
      color: '#ffffff',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      boxShadow: '0 8px 32px -8px rgba(239, 68, 68, 0.4)',
      color: '#ffffff',
    },
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative overflow-hidden rounded-xl font-semibold backdrop-blur-xl transition-all disabled:cursor-not-allowed disabled:opacity-50',
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      style={variantStyles[variant]}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Shimmer effect */}
      {!disabled && !loading && variant !== 'ghost' && (
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
          whileHover={{
            opacity: [0, 1, 0],
            x: ['-100%', '100%'],
            transition: { duration: 0.6 },
          }}
        />
      )}

      {/* Contenido */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PREMIUM INPUT — Input premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface PremiumInputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  icon?: React.ReactNode
  error?: string
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-xl transition-all placeholder:text-white/40 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-12',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className,
          )}
        />
      </div>

      {error && (
        <motion.p
          className="mt-1 text-xs text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BADGE — Badge premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  glow = false,
  className = '',
}) => {
  const variantColors = {
    default: { bg: '#8b5cf6', text: '#ffffff' },
    success: { bg: '#10b981', text: '#ffffff' },
    warning: { bg: '#f59e0b', text: '#ffffff' },
    danger: { bg: '#ef4444', text: '#ffffff' },
    info: { bg: '#06b6d4', text: '#ffffff' },
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const colors = variantColors[variant]

  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        sizeStyles[size],
        className,
      )}
      style={{
        background: `${colors.bg}30`,
        color: colors.text,
        border: `1px solid ${colors.bg}50`,
        boxShadow: glow ? `0 0 20px ${colors.bg}40` : 'none',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {children}
    </motion.span>
  )
}

