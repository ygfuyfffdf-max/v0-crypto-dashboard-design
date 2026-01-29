/**
 * 💎🌀 TILT GLOW CARD — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Card KPI con tilt 3D real + glow volumétrico que crece con el valor
 * Efecto: Card tilta físicamente + glow oro intenso si valor alto
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'

interface TiltGlowCardProps {
  value: number
  title: string
  subtitle?: string
  icon?: LucideIcon
  prefix?: string
  suffix?: string
  maxValue?: number // For glow intensity calculation
  colorScheme?: 'violet-gold' | 'emerald-cyan' | 'rose-pink' | 'amber-orange'
  size?: 'sm' | 'md' | 'lg'
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

const COLOR_SCHEMES = {
  'violet-gold': {
    gradient: 'from-violet-500 to-amber-500',
    glow: '#FFD700',
    accent: '#8B5CF6',
    bg: 'from-violet-500/10 to-amber-500/10',
  },
  'emerald-cyan': {
    gradient: 'from-emerald-400 to-cyan-400',
    glow: '#10B981',
    accent: '#06B6D4',
    bg: 'from-emerald-500/10 to-cyan-500/10',
  },
  'rose-pink': {
    gradient: 'from-rose-500 to-pink-500',
    glow: '#EC4899',
    accent: '#F472B6',
    bg: 'from-rose-500/10 to-pink-500/10',
  },
  'amber-orange': {
    gradient: 'from-amber-400 to-orange-500',
    glow: '#F59E0B',
    accent: '#F97316',
    bg: 'from-amber-500/10 to-orange-500/10',
  },
}

const SIZES = {
  sm: {
    padding: 'p-4',
    title: 'text-sm',
    value: 'text-2xl',
    icon: 'w-8 h-8',
  },
  md: {
    padding: 'p-6',
    title: 'text-base',
    value: 'text-4xl',
    icon: 'w-10 h-10',
  },
  lg: {
    padding: 'p-8',
    title: 'text-lg',
    value: 'text-6xl',
    icon: 'w-12 h-12',
  },
}

export function TiltGlowCard({
  value,
  title,
  subtitle,
  icon: Icon,
  prefix = '$',
  suffix = '',
  maxValue = 1000000,
  colorScheme = 'violet-gold',
  size = 'md',
  trend,
  onClick,
}: TiltGlowCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const colors = COLOR_SCHEMES[colorScheme]
  const sizeStyles = SIZES[size]

  // Glow intensity based on value (0-100%)
  const glowIntensity = Math.min((value / maxValue) * 100, 100)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const { clientX, clientY } = e
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()

    // Calculate rotation based on cursor position
    const centerX = left + width / 2
    const centerY = top + height / 2

    const rotateYValue = ((clientX - centerX) / (width / 2)) * 15 // Max 15 degrees
    const rotateXValue = -((clientY - centerY) / (height / 2)) * 15

    setRotateY(rotateYValue)
    setRotateX(rotateXValue)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }, [])

  const formatValue = (val: number): string => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
    return val.toLocaleString()
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl ${sizeStyles.padding} group cursor-pointer`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* Volumetric glow based on value */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHovered ? 0.8 : 0.5,
        }}
        style={{
          background: `radial-gradient(circle at center, ${colors.glow}${Math.round(glowIntensity * 0.6)}%, transparent 70%)`,
          filter: `blur(${40 + glowIntensity * 0.3}px)`,
        }}
      />

      {/* Gradient background overlay */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.bg} opacity-50`} />

      {/* Shine effect on hover */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '200%', opacity: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(90deg, transparent, white, transparent)',
            width: '50%',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={`${sizeStyles.icon} flex items-center justify-center rounded-xl bg-white/10`}
                style={{ boxShadow: `0 0 20px ${colors.accent}40` }}
              >
                <Icon className="h-1/2 w-1/2 text-white" />
              </div>
            )}
            <div>
              <h3 className={`${sizeStyles.title} font-semibold text-white/80`}>{title}</h3>
              {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
            </div>
          </div>

          {/* Trend indicator */}
          {trend && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`rounded-lg px-2 py-1 text-xs font-bold ${
                trend.isPositive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              } `}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.p
          className={`${sizeStyles.value} font-black`}
          style={{ transform: 'translateZ(50px)' }}
        >
          <span
            className="bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${colors.accent}, ${colors.glow})`,
            }}
          >
            {prefix}
            {formatValue(value)}
            {suffix}
          </span>
        </motion.p>

        {/* Glow intensity bar */}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${glowIntensity}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              background: `linear-gradient(to right, ${colors.accent}, ${colors.glow})`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          />
        </div>
      </div>

      {/* Border glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          border: `1px solid ${colors.accent}60`,
          boxShadow: `inset 0 0 30px ${colors.glow}20`,
        }}
      />
    </motion.div>
  )
}

export default TiltGlowCard
