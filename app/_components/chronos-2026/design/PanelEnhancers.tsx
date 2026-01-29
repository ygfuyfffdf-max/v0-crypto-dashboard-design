'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🚀✨ PANEL ENHANCERS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrappers y HOCs para elevar paneles existentes sin modificar su código interno.
 * Uso seguro que preserva funcionalidad mientras añade efectos premium.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/lib/utils'
import { motion, type Variants } from 'motion/react'
import { ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PanelEnhancerProps {
  children: ReactNode
  variant?: 'default' | 'premium' | 'ultra'
  withAuroraBackground?: boolean
  withFloatingOrbs?: boolean
  withCyberGrid?: boolean
  withGlowBorder?: boolean
  glowColor?: 'violet' | 'cyan' | 'pink' | 'gold' | 'emerald'
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const glowColors = {
  violet: {
    orb1: 'bg-violet-500/20',
    orb2: 'bg-fuchsia-500/15',
    border: 'from-violet-500/30 via-fuchsia-500/30 to-violet-500/30',
  },
  cyan: {
    orb1: 'bg-cyan-500/20',
    orb2: 'bg-blue-500/15',
    border: 'from-cyan-500/30 via-blue-500/30 to-cyan-500/30',
  },
  pink: {
    orb1: 'bg-pink-500/20',
    orb2: 'bg-rose-500/15',
    border: 'from-pink-500/30 via-rose-500/30 to-pink-500/30',
  },
  gold: {
    orb1: 'bg-amber-500/20',
    orb2: 'bg-yellow-500/15',
    border: 'from-amber-500/30 via-yellow-500/30 to-amber-500/30',
  },
  emerald: {
    orb1: 'bg-emerald-500/20',
    orb2: 'bg-teal-500/15',
    border: 'from-emerald-500/30 via-teal-500/30 to-emerald-500/30',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function FloatingOrbs({ color }: { color: keyof typeof glowColors }) {
  const colors = glowColors[color]

  return (
    <>
      {/* Top-right floating orb */}
      <motion.div
        className={cn(
          'pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl',
          colors.orb1,
        )}
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Bottom-left floating orb */}
      <motion.div
        className={cn(
          'pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl',
          colors.orb2,
        )}
        animate={{
          y: [0, -25, 0],
          x: [0, 25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </>
  )
}

function CyberGridOverlay() {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0',
        'bg-[linear-gradient(rgba(139,92,246,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.015)_1px,transparent_1px)]',
        'bg-[size:40px_40px]',
        '[mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]',
      )}
    />
  )
}

function GlowBorder({ color }: { color: keyof typeof glowColors }) {
  const colors = glowColors[color]

  return (
    <>
      {/* Top accent line */}
      <div
        className={cn('absolute top-0 right-0 left-0 h-px', 'bg-gradient-to-r', colors.border)}
      />

      {/* Animated corner glow - top left */}
      <motion.div
        className="pointer-events-none absolute top-0 left-0 h-24 w-24"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(139, 92, 246, 0.15), transparent 70%)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Animated corner glow - bottom right */}
      <motion.div
        className="pointer-events-none absolute right-0 bottom-0 h-24 w-24"
        style={{
          background:
            'radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.15), transparent 70%)',
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function PanelEnhancer({
  children,
  variant = 'default',
  withAuroraBackground = false,
  withFloatingOrbs = true,
  withCyberGrid = true,
  withGlowBorder = true,
  glowColor = 'violet',
  className,
}: PanelEnhancerProps) {
  const isPremium = variant === 'premium' || variant === 'ultra'
  const isUltra = variant === 'ultra'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('relative overflow-hidden', className)}
    >
      {/* ═══════════ DECORATIVE LAYERS ═══════════ */}

      {/* Floating orbs (behind content) */}
      {withFloatingOrbs && isPremium && <FloatingOrbs color={glowColor} />}

      {/* Cyber grid overlay */}
      {withCyberGrid && isUltra && <CyberGridOverlay />}

      {/* Glow border effects */}
      {withGlowBorder && isPremium && <GlowBorder color={glowColor} />}

      {/* Aurora animated background for ultra */}
      {withAuroraBackground && isUltra && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="bg-gradient-conic absolute -top-1/2 -left-1/2 h-full w-full from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 blur-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ENHANCED PAGE WRAPPER — Para páginas completas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EnhancedPageProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function EnhancedPage({ children, className }: EnhancedPageProps) {
  return (
    <PanelEnhancer
      variant="ultra"
      withFloatingOrbs
      withCyberGrid
      withGlowBorder
      withAuroraBackground
      className={cn('min-h-screen', className)}
    >
      {children}
    </PanelEnhancer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ENHANCED SECTION WRAPPER — Para secciones dentro de páginas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EnhancedSectionProps {
  children: ReactNode
  glowColor?: keyof typeof glowColors
  className?: string
}

export function EnhancedSection({
  children,
  glowColor = 'violet',
  className,
}: EnhancedSectionProps) {
  return (
    <PanelEnhancer
      variant="premium"
      withFloatingOrbs={false}
      withCyberGrid={false}
      withGlowBorder
      glowColor={glowColor}
      className={className}
    >
      {children}
    </PanelEnhancer>
  )
}
