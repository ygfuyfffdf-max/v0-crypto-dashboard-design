'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔮✨ QUANTUM EFFECTS — CHRONOS INFINITY 2026 ADVANCED EFFECTS LIBRARY
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Biblioteca de efectos visuales avanzados reutilizables:
 * - QuantumGlowOrb: Orbe de luz animado con blur
 * - HolographicShimmer: Efecto shimmer holográfico
 * - EnergyBorder: Borde con pulso de energía
 * - AuroraWaves: Ondas de aurora decorativas
 * - CyberScanLine: Línea de escaneo CRT
 * - ParticleField: Campo de partículas flotantes
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/lib/utils'
import { motion } from 'motion/react'
import { useMemo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM GLOW ORB — Orbe de luz flotante animado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumGlowOrbProps {
  color?: 'violet' | 'cyan' | 'pink' | 'gold' | 'emerald'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  intensity?: 'low' | 'medium' | 'high'
  animated?: boolean
  className?: string
}

const orbColors = {
  violet: 'from-violet-500/30 via-fuchsia-500/20 to-violet-500/10',
  cyan: 'from-cyan-500/30 via-blue-500/20 to-cyan-500/10',
  pink: 'from-pink-500/30 via-rose-500/20 to-pink-500/10',
  gold: 'from-amber-500/30 via-yellow-500/20 to-amber-500/10',
  emerald: 'from-emerald-500/30 via-teal-500/20 to-emerald-500/10',
}

const orbSizes = {
  sm: 'w-24 h-24',
  md: 'w-40 h-40',
  lg: 'w-60 h-60',
  xl: 'w-80 h-80',
}

const orbPositions = {
  'top-right': '-top-10 -right-10',
  'top-left': '-top-10 -left-10',
  'bottom-right': '-bottom-10 -right-10',
  'bottom-left': '-bottom-10 -left-10',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
}

const intensityOpacity = {
  low: 'opacity-30',
  medium: 'opacity-50',
  high: 'opacity-70',
}

export function QuantumGlowOrb({
  color = 'violet',
  size = 'lg',
  position = 'top-right',
  intensity = 'medium',
  animated = true,
  className,
}: QuantumGlowOrbProps) {
  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl',
        'bg-gradient-radial',
        orbColors[color],
        orbSizes[size],
        orbPositions[position],
        intensityOpacity[intensity],
        animated && 'animate-float',
        className,
      )}
      initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
      animate={
        animated
          ? { scale: 1, opacity: intensity === 'low' ? 0.3 : intensity === 'high' ? 0.7 : 0.5 }
          : undefined
      }
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC SHIMMER — Efecto shimmer con arcoíris
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HolographicShimmerProps {
  direction?: 'horizontal' | 'vertical' | 'diagonal'
  speed?: 'slow' | 'medium' | 'fast'
  intensity?: 'subtle' | 'medium' | 'intense'
  className?: string
}

export function HolographicShimmer({
  direction = 'horizontal',
  speed = 'medium',
  intensity = 'medium',
  className,
}: HolographicShimmerProps) {
  const directionClasses = {
    horizontal: 'bg-gradient-to-r',
    vertical: 'bg-gradient-to-b',
    diagonal: 'bg-gradient-to-br',
  }

  const speedDurations = {
    slow: 4,
    medium: 2.5,
    fast: 1.5,
  }

  const intensityOpacities = {
    subtle: 0.05,
    medium: 0.1,
    intense: 0.15,
  }

  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute inset-0',
        directionClasses[direction],
        'from-transparent via-white to-transparent',
        className,
      )}
      initial={{ x: '-100%', opacity: 0 }}
      animate={{
        x: ['100%', '-100%'],
        opacity: [0, intensityOpacities[intensity], 0],
      }}
      transition={{
        duration: speedDurations[speed],
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: 1,
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ENERGY BORDER — Borde con pulso de energía rotante
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EnergyBorderProps {
  color?: 'violet' | 'cyan' | 'pink' | 'gold' | 'aurora'
  speed?: 'slow' | 'medium' | 'fast'
  thickness?: 'thin' | 'medium' | 'thick'
  visible?: boolean
  className?: string
}

const borderGradients = {
  violet: 'from-violet-500 via-fuchsia-500 to-violet-500',
  cyan: 'from-cyan-500 via-blue-500 to-cyan-500',
  pink: 'from-pink-500 via-rose-500 to-pink-500',
  gold: 'from-amber-500 via-yellow-500 to-amber-500',
  aurora: 'from-violet-500 via-fuchsia-500 via-cyan-500 to-emerald-500',
}

export function EnergyBorder({
  color = 'violet',
  speed = 'medium',
  thickness = 'thin',
  visible = true,
  className,
}: EnergyBorderProps) {
  const speedDurations = { slow: 6, medium: 4, fast: 2 }
  const thicknessValues = { thin: 1, medium: 2, thick: 3 }

  if (!visible) return null

  return (
    <div
      className={cn(
        'rounded-inherit pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <motion.div
        className={cn(
          'rounded-inherit absolute inset-[-2px]',
          'bg-gradient-conic',
          borderGradients[color],
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: speedDurations[speed],
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ opacity: 0.6 }}
      />
      {/* Inner mask */}
      <div
        className="rounded-inherit bg-c-void absolute"
        style={{
          inset: thicknessValues[thickness],
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AURORA WAVES — Ondas de aurora de fondo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraWavesProps {
  colors?: string[]
  className?: string
}

export function AuroraWaves({
  colors = ['violet-500/20', 'fuchsia-500/15', 'cyan-500/10'],
  className,
}: AuroraWavesProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className={cn('absolute h-[200%] w-[200%]', 'rounded-full blur-3xl', `bg-${color}`)}
          style={{
            left: `${-50 + i * 30}%`,
            top: `${-50 + i * 20}%`,
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CYBER SCAN LINE — Línea de escaneo CRT animada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CyberScanLineProps {
  color?: 'violet' | 'cyan' | 'white' | 'green'
  speed?: 'slow' | 'medium' | 'fast'
  className?: string
}

export function CyberScanLine({
  color = 'violet',
  speed = 'medium',
  className,
}: CyberScanLineProps) {
  const colorClasses = {
    violet: 'bg-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.5)]',
    cyan: 'bg-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.5)]',
    white: 'bg-white/30 shadow-[0_0_20px_rgba(255,255,255,0.5)]',
    green: 'bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
  }

  const speedDurations = { slow: 6, medium: 4, fast: 2 }

  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute right-0 left-0 h-px',
        colorClasses[color],
        className,
      )}
      initial={{ top: '-5%' }}
      animate={{ top: '105%' }}
      transition={{
        duration: speedDurations[speed],
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE FIELD — Campo de partículas flotantes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParticleFieldProps {
  count?: number
  color?: 'violet' | 'cyan' | 'pink' | 'gold' | 'mixed'
  size?: 'sm' | 'md' | 'lg'
  speed?: 'slow' | 'medium' | 'fast'
  className?: string
}

const particleColors = {
  violet: ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0.6)'],
  cyan: ['rgba(34, 211, 238, 0.4)', 'rgba(34, 211, 238, 0.6)'],
  pink: ['rgba(236, 72, 153, 0.4)', 'rgba(236, 72, 153, 0.6)'],
  gold: ['rgba(251, 191, 36, 0.4)', 'rgba(251, 191, 36, 0.6)'],
  mixed: [
    'rgba(139, 92, 246, 0.5)',
    'rgba(34, 211, 238, 0.5)',
    'rgba(236, 72, 153, 0.5)',
    'rgba(251, 191, 36, 0.5)',
  ],
}

export function ParticleField({
  count = 12,
  color = 'violet',
  size = 'md',
  speed = 'medium',
  className,
}: ParticleFieldProps) {
  const particles = useMemo(() => {
    const colors = particleColors[color]
    return [...Array(count)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
      duration: (speed === 'slow' ? 8 : speed === 'fast' ? 3 : 5) + Math.random() * 3,
    }))
  }, [count, color, speed])

  const sizeClasses = { sm: 'w-0.5 h-0.5', md: 'w-1 h-1', lg: 'w-1.5 h-1.5' }

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={cn('absolute rounded-full', sizeClasses[size])}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREMIUM SEPARATOR — Línea separadora con gradiente
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumSeparatorProps {
  variant?: 'fade' | 'glow' | 'pulse'
  color?: 'violet' | 'white' | 'aurora'
  className?: string
}

export function PremiumSeparator({
  variant = 'fade',
  color = 'violet',
  className,
}: PremiumSeparatorProps) {
  const colorClasses = {
    violet: 'from-transparent via-violet-500/30 to-transparent',
    white: 'from-transparent via-white/20 to-transparent',
    aurora: 'from-transparent via-violet-500/20 via-fuchsia-500/30 via-cyan-500/20 to-transparent',
  }

  return (
    <div
      className={cn(
        'h-px w-full bg-gradient-to-r',
        colorClasses[color],
        variant === 'pulse' && 'animate-pulse-glow',
        variant === 'glow' && 'shadow-[0_0_10px_rgba(139,92,246,0.3)]',
        className,
      )}
    />
  )
}
