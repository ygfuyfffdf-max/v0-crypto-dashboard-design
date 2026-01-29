'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬✨ CINEMATIC PANEL — CHRONOS INFINITY 2026 ULTRA PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel wrapper de nivel cinematográfico para secciones principales:
 * - Aurora orbs animados con gradientes cósmicos
 * - Grid cyber decorativo con fade
 * - Efectos de luz dinámica
 * - Header con gradiente animado
 * - Animaciones de entrada escalonadas
 * - Partículas de fondo opcionales
 * - Respeta prefers-reduced-motion
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/lib/utils'
import { motion, type Variants } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

// Import optimized effects
import { CyberGrid, FloatingParticles } from '../effects'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type PanelVariant = 'default' | 'gold' | 'emerald' | 'rose' | 'cyan' | 'aurora'

interface CinematicPanelProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: LucideIcon
  variant?: PanelVariant
  withAuroraOrbs?: boolean
  withCyberGrid?: boolean
  withParticles?: boolean
  withAnimatedBorder?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const variantStyles: Record<
  PanelVariant,
  {
    orbColors: string[]
    accentGradient: string
    iconBg: string
    iconColor: string
    underlineGradient: string
  }
> = {
  default: {
    orbColors: ['from-violet-500/20 to-fuchsia-500/10', 'from-indigo-500/15 to-purple-500/10'],
    accentGradient: 'from-violet-500 via-fuchsia-500 to-violet-500',
    iconBg: 'from-violet-500/20 to-indigo-500/20',
    iconColor: 'text-violet-400',
    underlineGradient: 'from-violet-500 to-fuchsia-500',
  },
  gold: {
    orbColors: ['from-amber-500/20 to-yellow-500/10', 'from-orange-500/15 to-amber-500/10'],
    accentGradient: 'from-amber-500 via-yellow-400 to-amber-500',
    iconBg: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    underlineGradient: 'from-amber-500 to-yellow-500',
  },
  emerald: {
    orbColors: ['from-emerald-500/20 to-teal-500/10', 'from-green-500/15 to-emerald-500/10'],
    accentGradient: 'from-emerald-500 via-teal-400 to-emerald-500',
    iconBg: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    underlineGradient: 'from-emerald-500 to-teal-500',
  },
  rose: {
    orbColors: ['from-rose-500/20 to-pink-500/10', 'from-red-500/15 to-rose-500/10'],
    accentGradient: 'from-rose-500 via-pink-400 to-rose-500',
    iconBg: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-400',
    underlineGradient: 'from-rose-500 to-pink-500',
  },
  cyan: {
    orbColors: ['from-cyan-500/20 to-blue-500/10', 'from-sky-500/15 to-cyan-500/10'],
    accentGradient: 'from-cyan-500 via-sky-400 to-cyan-500',
    iconBg: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
    underlineGradient: 'from-cyan-500 to-blue-500',
  },
  aurora: {
    orbColors: ['from-violet-500/15 to-fuchsia-500/10', 'from-cyan-500/15 to-emerald-500/10'],
    accentGradient: 'from-violet-500 via-fuchsia-500 via-cyan-500 to-emerald-500',
    iconBg: 'from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20',
    iconColor: 'text-fuchsia-400',
    underlineGradient: 'from-violet-500 via-fuchsia-500 to-cyan-500',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FRAMER MOTION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function AuroraOrbs({ colors }: { colors: string[] }) {
  return (
    <>
      {/* Top-right orb */}
      <div
        className={cn(
          'absolute -top-20 -right-20 h-60 w-60',
          'rounded-full blur-3xl',
          'bg-gradient-radial',
          colors[0],
          'animate-float opacity-60',
        )}
      />
      {/* Bottom-left orb */}
      <div
        className={cn(
          'absolute -bottom-20 -left-20 h-48 w-48',
          'rounded-full blur-3xl',
          'bg-gradient-radial',
          colors[1],
          'animate-float-delayed opacity-50',
        )}
      />
    </>
  )
}

function AnimatedBorder({ gradient }: { gradient: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {/* Animated rotating gradient */}
      <motion.div
        className={cn(
          'absolute -inset-1',
          'bg-gradient-to-r',
          gradient,
          'opacity-0 group-hover:opacity-30',
          'transition-opacity duration-700',
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ borderRadius: '24px' }}
      />
      {/* Inner mask to show only border */}
      <div className="bg-c-void-deep absolute inset-px rounded-3xl" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function CinematicPanel({
  children,
  title,
  subtitle,
  icon: Icon,
  variant = 'default',
  withAuroraOrbs = true,
  withCyberGrid = true,
  withParticles = false,
  withAnimatedBorder = false,
  className,
  headerClassName,
  contentClassName,
}: CinematicPanelProps) {
  const styles = variantStyles[variant]

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-white/[0.01]',
        'backdrop-blur-2xl',
        'border border-white/[0.08]',
        'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]',
        'p-6 lg:p-8',
        'transition-all duration-700',
        'hover:border-white/15',
        'hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)]',
        className,
      )}
    >
      {/* ═══════════ DECORATIVE ELEMENTS ═══════════ */}
      {withAuroraOrbs && <AuroraOrbs colors={styles.orbColors} />}
      {withCyberGrid && <CyberGrid variant="default" intensity="low" animated />}
      {withParticles && <FloatingParticles intensity="low" color="violet" depth />}
      {withAnimatedBorder && <AnimatedBorder gradient={styles.accentGradient} />}

      {/* ═══════════ TOP ACCENT LINE ═══════════ */}
      <div
        className={cn(
          'absolute top-0 right-0 left-0 h-px',
          'bg-gradient-to-r from-transparent via-white/20 to-transparent',
        )}
      />

      {/* ═══════════ HEADER ═══════════ */}
      {(title || Icon) && (
        <motion.div
          variants={itemVariants}
          className={cn('relative z-10 mb-6 flex items-center gap-4', headerClassName)}
        >
          {/* Icon Container */}
          {Icon && (
            <div
              className={cn(
                'rounded-2xl p-3',
                'bg-gradient-to-br',
                styles.iconBg,
                'border border-white/10',
                'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
                'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]',
                'transition-shadow duration-500',
              )}
            >
              <Icon className={cn('h-6 w-6', styles.iconColor)} />
            </div>
          )}

          {/* Title & Subtitle */}
          <div>
            {title && (
              <h2 className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-xl font-bold text-transparent">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
            {/* Animated Underline */}
            <div
              className={cn(
                'mt-2 h-0.5 w-12 rounded-full',
                'bg-gradient-to-r',
                styles.underlineGradient,
                'transition-all duration-500 group-hover:w-24',
              )}
            />
          </div>
        </motion.div>
      )}

      {/* ═══════════ CONTENT ═══════════ */}
      <motion.div variants={itemVariants} className={cn('relative z-10', contentClassName)}>
        {children}
      </motion.div>
    </motion.section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANT EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function CinematicPanelGold(props: Omit<CinematicPanelProps, 'variant'>) {
  return <CinematicPanel {...props} variant="gold" />
}

export function CinematicPanelEmerald(props: Omit<CinematicPanelProps, 'variant'>) {
  return <CinematicPanel {...props} variant="emerald" />
}

export function CinematicPanelAurora(props: Omit<CinematicPanelProps, 'variant'>) {
  return <CinematicPanel {...props} variant="aurora" withParticles />
}
