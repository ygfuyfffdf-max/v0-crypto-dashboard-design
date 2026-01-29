'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✓ CHRONOS INFINITY 2030 — VERIFIED BADGE GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// Componente de badge de verificación (palomita ✓) reutilizable en todo el sistema
// Múltiples variantes: inline, badge, floating, animated
// Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import React from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Shield, Award, Sparkles, Zap } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const COLORS = {
  success: '#00FF88',
  gold: '#FFD700',
  violet: '#8B00FF',
  magenta: '#FF1493',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type VerifiedVariant = 'default' | 'minimal' | 'badge' | 'floating' | 'premium' | 'gold' | 'shield'
type VerifiedSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface VerifiedBadgeProps {
  variant?: VerifiedVariant
  size?: VerifiedSize
  score?: string
  label?: string
  animated?: boolean
  pulse?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SIZE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const sizeConfig = {
  xs: { icon: 8, text: 'text-[8px]', px: 'px-1', py: 'py-0.5', gap: 'gap-0.5' },
  sm: { icon: 10, text: 'text-[10px]', px: 'px-1.5', py: 'py-0.5', gap: 'gap-1' },
  md: { icon: 14, text: 'text-xs', px: 'px-2', py: 'py-1', gap: 'gap-1.5' },
  lg: { icon: 18, text: 'text-sm', px: 'px-3', py: 'py-1.5', gap: 'gap-2' },
  xl: { icon: 24, text: 'text-base', px: 'px-4', py: 'py-2', gap: 'gap-2.5' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: VERIFIED BADGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function VerifiedBadge({
  variant = 'default',
  size = 'sm',
  score,
  label,
  animated = true,
  pulse = false,
  className = '',
}: VerifiedBadgeProps) {
  const s = sizeConfig[size]

  // Variant styles
  const variants = {
    default: {
      bg: `linear-gradient(135deg, ${COLORS.success}20, ${COLORS.success}08)`,
      border: `${COLORS.success}40`,
      color: COLORS.success,
      shadow: `0 0 15px ${COLORS.success}15`,
      Icon: CheckCircle2,
    },
    minimal: {
      bg: 'transparent',
      border: 'transparent',
      color: COLORS.success,
      shadow: 'none',
      Icon: CheckCircle2,
    },
    badge: {
      bg: `linear-gradient(135deg, ${COLORS.success}30, ${COLORS.success}15)`,
      border: `${COLORS.success}50`,
      color: COLORS.success,
      shadow: `0 0 20px ${COLORS.success}20`,
      Icon: CheckCircle2,
    },
    floating: {
      bg: `linear-gradient(135deg, ${COLORS.success}25, ${COLORS.success}10)`,
      border: `${COLORS.success}40`,
      color: COLORS.success,
      shadow: `0 4px 20px ${COLORS.success}25`,
      Icon: CheckCircle2,
    },
    premium: {
      bg: `linear-gradient(135deg, ${COLORS.violet}30, ${COLORS.magenta}20)`,
      border: `${COLORS.violet}50`,
      color: COLORS.violet,
      shadow: `0 0 25px ${COLORS.violet}25`,
      Icon: Sparkles,
    },
    gold: {
      bg: `linear-gradient(135deg, ${COLORS.gold}25, ${COLORS.gold}10)`,
      border: `${COLORS.gold}50`,
      color: COLORS.gold,
      shadow: `0 0 20px ${COLORS.gold}20`,
      Icon: Award,
    },
    shield: {
      bg: `linear-gradient(135deg, ${COLORS.violet}25, ${COLORS.success}15)`,
      border: `${COLORS.violet}40`,
      color: COLORS.violet,
      shadow: `0 0 20px ${COLORS.violet}20`,
      Icon: Shield,
    },
  }

  const v = variants[variant]
  const Icon = v.Icon

  const displayLabel = label || (score ? `✓ ${score}` : '✓')

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center ${s.gap} ${s.px} ${s.py} cursor-default rounded-full ${className} `}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        boxShadow: v.shadow,
      }}
    >
      <motion.span
        animate={
          animated
            ? {
                rotate: pulse ? [0, 10, -10, 0] : 0,
                scale: pulse ? [1, 1.15, 1] : 1,
              }
            : {}
        }
        transition={{ duration: 2, repeat: pulse ? Infinity : 0 }}
        className="flex items-center justify-center"
      >
        <Icon size={s.icon} style={{ color: v.color }} />
      </motion.span>

      {label !== '' && variant !== 'minimal' && (
        <span className={`${s.text} font-bold`} style={{ color: v.color }}>
          {displayLabel}
        </span>
      )}
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: INLINE CHECK (Just the ✓)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface InlineCheckProps {
  size?: VerifiedSize
  animated?: boolean
  className?: string
}

export function InlineCheck({ size = 'sm', animated = true, className = '' }: InlineCheckProps) {
  const s = sizeConfig[size]

  return (
    <motion.span
      initial={animated ? { scale: 0 } : {}}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <motion.span
        animate={animated ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ color: COLORS.success }}
      >
        <CheckCircle2 size={s.icon} />
      </motion.span>
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: FLOATING VERIFIED CORNER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FloatingVerifiedProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  score?: string
  size?: VerifiedSize
  className?: string
}

export function FloatingVerified({
  position = 'top-right',
  score = '10/10',
  size = 'sm',
  className = '',
}: FloatingVerifiedProps) {
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }

  return (
    <div className={`absolute ${positionClasses[position]} z-50 ${className}`}>
      <VerifiedBadge variant="floating" size={size} score={score} animated pulse />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: VERIFIED SCORE BAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VerifiedScoreBarProps {
  items: Array<{
    label: string
    verified: boolean
    score?: string
  }>
  className?: string
}

export function VerifiedScoreBar({ items, className = '' }: VerifiedScoreBarProps) {
  const verifiedCount = items.filter((i) => i.verified).length
  const totalCount = items.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="text-xs text-white/60">{item.label}</span>
            {item.verified ? (
              <InlineCheck size="xs" />
            ) : (
              <span className="text-xs text-white/30">○</span>
            )}
          </div>
        ))}
      </div>

      <VerifiedBadge variant="badge" size="sm" score={`${verifiedCount}/${totalCount}`} />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: PREMIUM VERIFIED HEADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumVerifiedHeaderProps {
  title: string
  subtitle?: string
  score?: string
  badges?: string[]
  className?: string
}

export function PremiumVerifiedHeader({
  title,
  subtitle,
  score = '10/10',
  badges = ['3D Ready', 'Real-time', 'Premium'],
  className = '',
}: PremiumVerifiedHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between border-b border-white/5 bg-black/40 p-4 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${COLORS.violet}40, ${COLORS.magenta}40)`,
            boxShadow: `0 0 20px ${COLORS.violet}30`,
          }}
        >
          <Sparkles size={20} style={{ color: COLORS.violet }} />
        </motion.div>

        <div>
          <h2
            className="text-lg font-bold"
            style={{
              background: `linear-gradient(135deg, #FFFFFF, ${COLORS.violet})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </h2>
          {subtitle && <span className="text-xs text-white/50">{subtitle}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Feature badges */}
        <div className="hidden items-center gap-2 md:flex">
          {badges.map((badge, idx) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5"
            >
              <InlineCheck size="xs" />
              <span className="text-[10px] text-white/70">{badge}</span>
            </motion.span>
          ))}
        </div>

        {/* Main verification badge */}
        <VerifiedBadge variant="badge" size="md" score={score} pulse />
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { COLORS as VERIFIED_COLORS }
