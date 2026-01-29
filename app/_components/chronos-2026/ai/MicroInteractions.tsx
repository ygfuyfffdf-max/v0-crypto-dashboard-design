/**
 * 💫 MICRO-INTERACTIONS — Sistema de micro-interacciones premium
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Feedback visual instantáneo, estados hover, loading states
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import React, { ReactNode } from 'react'
import { GLOW_EFFECTS, hexToRgba } from './AdvancedColorSystem'
import { hoverLift, SPRING_CONFIGS } from './CinematicAnimations'

// ═══════════════════════════════════════════════════════════════════════════════════════
// BUTTON VARIANTS — Botones con micro-interacciones
// ═══════════════════════════════════════════════════════════════════════════════════════

interface PremiumButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  color?: string
  disabled?: boolean
  className?: string
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  color = '#8b5cf6',
  disabled = false,
  className = '',
}) => {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      boxShadow: GLOW_EFFECTS.violet(1),
    },
    secondary: {
      background: hexToRgba(color, 0.1),
      border: `1px solid ${color}40`,
    },
    ghost: {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all ${className}`}
      style={variants[variant]}
      {...hoverLift}
      whileHover={{
        ...hoverLift.whileHover,
        boxShadow: GLOW_EFFECTS.violet(1.5),
      }}
    >
      {/* Shimmer effect en hover */}
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

      {/* Contenido */}
      <span className="relative z-10">{children}</span>

      {/* Ripple effect en click */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{
          scale: 2,
          opacity: 0,
          transition: { duration: 0.5 },
        }}
        style={{ background: hexToRgba(color, 0.3) }}
      />
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CARD WITH HOVER EFFECTS — Tarjetas con efectos premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface PremiumCardProps {
  children: ReactNode
  color?: string
  className?: string
  onClick?: () => void
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  color = '#8b5cf6',
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl backdrop-blur-xl ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}20`,
      }}
      {...hoverLift}
      whileHover={{
        ...hoverLift.whileHover,
        border: `1px solid ${color}60`,
      }}
    >
      {/* Gradient overlay en hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${hexToRgba(color, 0.15)} 0%, transparent 70%)`,
        }}
      />

      {/* Border glow en hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 20px ${hexToRgba(color, 0.3)}`,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LOADING SPINNER — Spinner premium
// ═══════════════════════════════════════════════════════════════════════════════════════

export const PremiumSpinner: React.FC<{ color?: string; size?: number }> = ({
  color = '#8b5cf6',
  size = 40,
}) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Anillo externo */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent"
        style={{
          borderTopColor: color,
          borderRightColor: hexToRgba(color, 0.5),
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />

      {/* Anillo interno */}
      <motion.div
        className="absolute inset-2 rounded-full border-4 border-transparent"
        style={{
          borderBottomColor: color,
          borderLeftColor: hexToRgba(color, 0.5),
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Centro pulsante */}
      <motion.div
        className="absolute inset-4 rounded-full"
        style={{ background: hexToRgba(color, 0.3) }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TOGGLE SWITCH — Switch animado premium
// ═══════════════════════════════════════════════════════════════════════════════════════

export const PremiumToggle: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
  color?: string
}> = ({ checked, onChange, color = '#8b5cf6' }) => {
  return (
    <motion.button
      className="relative h-8 w-14 rounded-full"
      style={{
        background: checked ? color : 'rgba(255,255,255,0.1)',
      }}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow en checked */}
      {checked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ boxShadow: `0 0 20px ${hexToRgba(color, 0.6)}` }}
        />
      )}

      {/* Knob */}
      <motion.div
        className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg"
        animate={{
          x: checked ? 24 : 4,
        }}
        transition={SPRING_CONFIGS.bouncy}
      >
        {/* Icono check en knob */}
        {checked && (
          <motion.svg
            className="absolute inset-0 m-auto h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="3"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={SPRING_CONFIGS.bouncy}
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        )}
      </motion.div>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR — Barra de progreso premium
// ═══════════════════════════════════════════════════════════════════════════════════════

export const PremiumProgress: React.FC<{
  value: number
  max?: number
  color?: string
  showLabel?: boolean
}> = ({ value, max = 100, color = '#8b5cf6', showLabel = true }) => {
  const percentage = (value / max) * 100

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-white/70">Progreso</span>
          <span className="font-semibold text-white">{Math.round(percentage)}%</span>
        </div>
      )}

      <div
        className="relative h-2 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        {/* Barra de progreso */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${hexToRgba(color, 0.7)})`,
            boxShadow: `0 0 10px ${hexToRgba(color, 0.5)}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={SPRING_CONFIGS.smooth}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-y-0 left-0 w-32"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          }}
          animate={{
            x: ['-100%', `${percentage + 100}%`],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TOOLTIP — Tooltip premium
// ═══════════════════════════════════════════════════════════════════════════════════════

export const PremiumTooltip: React.FC<{
  children: ReactNode
  content: string
  color?: string
}> = ({ children, content, color = '#8b5cf6' }) => {
  return (
    <div className="group relative inline-block">
      {children}

      <motion.div
        className="pointer-events-none absolute -top-12 left-1/2 z-50 -translate-x-1/2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 backdrop-blur-xl group-hover:opacity-100"
        style={{
          background: hexToRgba(color, 0.9),
          boxShadow: GLOW_EFFECTS.violet(0.8),
        }}
        initial={{ y: 10, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
        transition={SPRING_CONFIGS.snappy}
      >
        {content}

        {/* Arrow */}
        <div
          className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
          style={{ background: hexToRgba(color, 0.9) }}
        />
      </motion.div>
    </div>
  )
}
