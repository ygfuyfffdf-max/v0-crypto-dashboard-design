/**
 * 🎴 GLASS CARD 2026 - TARJETA GLASSMORPHISM PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Componente base de tarjeta con:
 * - Glassmorphism de última generación
 * - Efecto tilt 3D suave en hover
 * - Glow dinámico basado en variante
 * - Bordes con gradiente sutil
 * - Animaciones cinematográficas
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { animations } from '../styles/design-tokens'

// Sistemas avanzados integrados
const SPRING_CONFIGS = {
  gentle: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1.2 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 17, mass: 0.8 },
  smooth: { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 },
}

const GLOW_EFFECTS = {
  violet: (intensity: number) =>
    `0 0 ${20 * intensity}px rgba(139, 92, 246, 0.3), 0 0 ${40 * intensity}px rgba(139, 92, 246, 0.2)`,
  purple: (intensity: number) =>
    `0 0 ${20 * intensity}px rgba(168, 85, 247, 0.3), 0 0 ${40 * intensity}px rgba(168, 85, 247, 0.2)`,
  rose: (intensity: number) =>
    `0 0 ${20 * intensity}px rgba(244, 63, 94, 0.3), 0 0 ${40 * intensity}px rgba(244, 63, 94, 0.2)`,
  gold: (intensity: number) =>
    `0 0 ${20 * intensity}px rgba(251, 191, 36, 0.3), 0 0 ${40 * intensity}px rgba(251, 191, 36, 0.2)`,
}

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export type CardVariant =
  | 'default'
  | 'purple'
  | 'violet'
  | 'rose'
  | 'gold'
  | 'orange'
  | 'lime'
  | 'glass'
  | 'gradient-purple'
  | 'gradient-orange'
  | 'gradient-violet'
  | 'gradient-rose'
  | 'gradient-gold'

export type CardSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero'

export interface GlassCardProps {
  children: React.ReactNode
  variant?: CardVariant
  size?: CardSize
  span?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2 | 3
  className?: string
  tiltEnabled?: boolean
  tiltIntensity?: number
  glowEnabled?: boolean
  glowIntensity?: number
  onClick?: () => void
  hoverScale?: number
  delay?: number
  badge?: {
    text: string
    variant?: 'default' | 'accent' | 'success' | 'warning'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE VARIANTES
// ═══════════════════════════════════════════════════════════════════════════

const variantStyles: Record<
  CardVariant,
  {
    background: string
    border: string
    glow: string
    textGradient?: string
  }
> = {
  default: {
    background: 'bg-white/[0.03]',
    border: 'border-white/[0.08]',
    glow: 'rgba(255, 255, 255, 0.05)',
  },
  purple: {
    background: 'bg-purple-500/[0.08]',
    border: 'border-purple-500/20',
    glow: 'rgba(168, 85, 247, 0.25)',
  },
  violet: {
    background: 'bg-violet-500/[0.08]',
    border: 'border-violet-500/20',
    glow: 'rgba(34, 211, 238, 0.25)',
  },
  rose: {
    background: 'bg-rose-500/[0.08]',
    border: 'border-rose-500/20',
    glow: 'rgba(244, 63, 94, 0.25)',
  },
  glass: {
    background: 'bg-white/[0.02] backdrop-blur-[80px] saturate-[200%]',
    border: 'border-white/[0.12]',
    glow: 'rgba(255, 255, 255, 0.06)',
  },
  gold: {
    background: 'bg-amber-500/[0.08]',
    border: 'border-amber-500/20',
    glow: 'rgba(251, 191, 36, 0.25)',
  },
  orange: {
    background: 'bg-orange-500/[0.08]',
    border: 'border-orange-500/20',
    glow: 'rgba(251, 146, 60, 0.25)',
  },
  lime: {
    background: 'bg-lime-500/[0.08]',
    border: 'border-lime-500/20',
    glow: 'rgba(163, 230, 53, 0.25)',
  },
  'gradient-purple': {
    background:
      'bg-gradient-to-br from-purple-900/80 via-violet-800/60 to-fuchsia-900/40 backdrop-blur-[60px]',
    border: 'border-purple-500/40',
    glow: 'rgba(168, 85, 247, 0.5)',
    textGradient: 'from-purple-200 via-fuchsia-200 to-pink-200',
  },
  'gradient-orange': {
    background: 'bg-gradient-to-br from-orange-600/90 via-amber-500/80 to-yellow-500/70',
    border: 'border-orange-400/40',
    glow: 'rgba(251, 146, 60, 0.4)',
  },
  'gradient-violet': {
    background: 'bg-gradient-to-br from-violet-900/80 via-purple-800/60 to-pink-900/40',
    border: 'border-violet-500/30',
    glow: 'rgba(34, 211, 238, 0.4)',
  },
  'gradient-rose': {
    background: 'bg-gradient-to-br from-rose-900/80 via-pink-800/60 to-fuchsia-900/40',
    border: 'border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.4)',
  },
  'gradient-gold': {
    background: 'bg-gradient-to-br from-amber-900/80 via-yellow-800/60 to-orange-900/40',
    border: 'border-amber-500/30',
    glow: 'rgba(251, 191, 36, 0.4)',
  },
}

const sizeStyles: Record<CardSize, string> = {
  sm: 'p-4 rounded-2xl',
  md: 'p-5 rounded-2xl',
  lg: 'p-6 rounded-3xl',
  xl: 'p-8 rounded-3xl',
  hero: 'p-10 rounded-[2rem]',
}

const badgeVariants = {
  default: 'bg-white/10 text-white border-white/20',
  accent: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function GlassCard({
  children,
  variant = 'default',
  size = 'md',
  span = 1,
  rowSpan = 1,
  className = '',
  tiltEnabled = true,
  tiltIntensity = 8,
  glowEnabled = true,
  glowIntensity = 1,
  onClick,
  hoverScale = 1.01,
  delay = 0,
  badge,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const styles = variantStyles[variant]

  // Motion values para tilt
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  // Spring configs
  const springConfig = animations.springs.gentle

  // Transforms para tilt 3D
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [tiltIntensity, -tiltIntensity]),
    springConfig,
  )
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-tiltIntensity, tiltIntensity]),
    springConfig,
  )

  // Glare effect position
  const glareX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig)
  const glareY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig)

  // Handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || !tiltEnabled) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY, tiltEnabled],
  )

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  // Grid span classes
  const spanClasses = useMemo(() => {
    const colSpan = {
      1: 'col-span-1',
      2: 'col-span-1 md:col-span-2',
      3: 'col-span-1 md:col-span-2 lg:col-span-3',
      4: 'col-span-1 md:col-span-2 lg:col-span-4',
    }
    const rowSpanClass = {
      1: 'row-span-1',
      2: 'row-span-1 md:row-span-2',
      3: 'row-span-1 md:row-span-3',
    }
    return `${colSpan[span]} ${rowSpanClass[rowSpan]}`
  }, [span, rowSpan])

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${spanClasses} ${styles.background} ${sizeStyles[size]} border ${styles.border} backdrop-blur-2xl ${onClick ? 'cursor-pointer' : ''} ${className} `}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: delay * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        rotateX: tiltEnabled ? rotateX : 0,
        rotateY: tiltEnabled ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      whileHover={{ scale: hoverScale }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow effect */}
      {glowEnabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${styles.glow}, transparent 60%)`,
            opacity: isHovered ? glowIntensity * 0.5 : 0,
          }}
        />
      )}

      {/* Glare/Shine effect */}
      {tiltEnabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
          style={{
            background: `
              radial-gradient(
                circle at ${glareX}% ${glareY}%,
                rgba(255, 255, 255, 0.15) 0%,
                transparent 50%
              )
            `,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}

      {/* Top shine line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Badge */}
      {badge && (
        <div
          className={`absolute top-4 right-4 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${badgeVariants[badge.variant || 'default']} `}
        >
          {badge.text}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>

      {/* Border gradient overlay */}
      <div
        className="rounded-inherit pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          padding: '1px',
          borderRadius: 'inherit',
        }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTES
// ═══════════════════════════════════════════════════════════════════════════

export function GlassCardTitle({
  children,
  className = '',
  gradient = false,
}: {
  children: React.ReactNode
  className?: string
  gradient?: boolean
}) {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight ${
        gradient
          ? 'bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent'
          : 'text-white'
      } ${className} `}
    >
      {children}
    </h3>
  )
}

export function GlassCardSubtitle({
  children,
  className = '',
  color = 'muted',
}: {
  children: React.ReactNode
  className?: string
  color?: 'muted' | 'accent' | 'rose' | 'gold' | 'lime' | 'orange'
}) {
  const colorClasses = {
    muted: 'text-white/60',
    accent: 'text-purple-400',
    rose: 'text-rose-400',
    gold: 'text-amber-400',
    lime: 'text-lime-400',
    orange: 'text-orange-400',
  }

  return <p className={`text-sm ${colorClasses[color]} ${className}`}>{children}</p>
}

export function GlassCardValue({
  value,
  suffix,
  prefix,
  size = 'lg',
  gradient = false,
  className = '',
}: {
  value: string | number
  suffix?: string
  prefix?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  gradient?: boolean
  className?: string
}) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
    hero: 'text-6xl md:text-8xl lg:text-[10rem]',
  }

  return (
    <div
      className={` ${sizeClasses[size]} font-bold tracking-tighter ${
        gradient
          ? 'bg-gradient-to-r from-white via-purple-200 to-fuchsia-300 bg-clip-text text-transparent'
          : 'text-white'
      } ${className} `}
    >
      {prefix && <span className="text-white/60">{prefix}</span>}
      {value}
      {suffix && <span className="ml-1 text-[0.5em] text-white/50">{suffix}</span>}
    </div>
  )
}

export function GlassCardIcon({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'purple' | 'rose' | 'gold' | 'lime' | 'orange'
}) {
  const variantClasses = {
    default: 'bg-white/10 text-white',
    purple: 'bg-purple-500/20 text-purple-400',
    rose: 'bg-rose-500/20 text-rose-400',
    gold: 'bg-amber-500/20 text-amber-400',
    lime: 'bg-lime-500/20 text-lime-400',
    orange: 'bg-orange-500/20 text-orange-400',
  }

  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${variantClasses[variant]} ${className} `}
    >
      {children}
    </div>
  )
}

export function GlassCardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={`text-sm leading-relaxed text-white/50 ${className}`}>{children}</p>
}
