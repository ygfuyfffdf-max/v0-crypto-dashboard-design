'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎬 CHRONOS INFINITY 2030 — CINEMATIC TRANSITIONS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════
// Sistema de transiciones cinematográficas ultra-premium:
// - Page transitions con efectos de portal
// - Component mount/unmount con spring physics
// - Scroll-triggered animations
// - Stagger animations para listas
// - Micro-interacciones premium
// Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useMemo, ReactNode } from 'react'
import { motion, AnimatePresence, Variants, Transition, MotionProps } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPRING PHYSICS PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SPRING_PRESETS = {
  // Ultra suave - para fondos y elementos grandes
  soft: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  // Normal - para la mayoría de interacciones
  normal: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 1,
  },
  // Snappy - para botones y elementos pequeños
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.8,
  },
  // Bouncy - para elementos que necesitan atención
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
    mass: 0.8,
  },
  // Premium - para transiciones de página
  premium: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 30,
    mass: 1.2,
  },
  // Cinematic - para transiciones dramáticas
  cinematic: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 20,
    mass: 1.5,
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const PAGE_TRANSITIONS = {
  // Fade simple
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  // Slide desde la derecha
  slideRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: SPRING_PRESETS.premium,
  },

  // Slide desde abajo
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: SPRING_PRESETS.premium,
  },

  // Escala con fade
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: SPRING_PRESETS.normal,
  },

  // Portal - efecto de entrada dimensional
  portal: {
    initial: { opacity: 0, scale: 0.8, rotateY: -15, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, rotateY: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.8, rotateY: 15, filter: 'blur(10px)' },
    transition: SPRING_PRESETS.cinematic,
  },

  // Morph - transformación fluida
  morph: {
    initial: { opacity: 0, scale: 0.95, y: 20, filter: 'blur(5px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.02, y: -20, filter: 'blur(5px)' },
    transition: SPRING_PRESETS.premium,
  },

  // Quantum - efecto cuántico
  quantum: {
    initial: {
      opacity: 0,
      scale: 0.7,
      rotateX: -30,
      transformPerspective: 1200,
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transformPerspective: 1200,
    },
    exit: {
      opacity: 0,
      scale: 1.3,
      rotateX: 30,
      transformPerspective: 1200,
    },
    transition: SPRING_PRESETS.cinematic,
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENT ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const COMPONENT_VARIANTS = {
  // Card hover effect
  cardHover: {
    rest: { scale: 1, y: 0, boxShadow: '0 4px 20px rgba(139, 0, 255, 0.1)' },
    hover: {
      scale: 1.02,
      y: -5,
      boxShadow: '0 20px 40px rgba(139, 0, 255, 0.3)',
      transition: SPRING_PRESETS.snappy,
    },
    tap: { scale: 0.98 },
  },

  // Button effects
  buttonGlow: {
    rest: {
      scale: 1,
      boxShadow: '0 0 0 rgba(139, 0, 255, 0)',
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 0 30px rgba(139, 0, 255, 0.5)',
      transition: SPRING_PRESETS.bouncy,
    },
    tap: { scale: 0.95 },
  },

  // Magnetic button
  magnetic: {
    rest: { x: 0, y: 0 },
    hover: {
      transition: SPRING_PRESETS.snappy,
    },
  },

  // List item
  listItem: {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        ...SPRING_PRESETS.normal,
      },
    }),
    exit: { opacity: 0, x: 20 },
  },

  // Orb pulse
  orbPulse: {
    rest: { scale: 1, opacity: 0.8 },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Float animation
  float: {
    rest: { y: 0, rotate: 0 },
    float: {
      y: [-5, 5, -5],
      rotate: [-1, 1, -1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Glow pulse
  glowPulse: {
    rest: { filter: 'drop-shadow(0 0 0 rgba(139, 0, 255, 0))' },
    glow: {
      filter: [
        'drop-shadow(0 0 10px rgba(139, 0, 255, 0.3))',
        'drop-shadow(0 0 30px rgba(139, 0, 255, 0.6))',
        'drop-shadow(0 0 10px rgba(139, 0, 255, 0.3))',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// SCROLL ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SCROLL_VARIANTS = {
  // Fade in on scroll
  fadeIn: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING_PRESETS.premium,
    },
  },

  // Scale in
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: SPRING_PRESETS.normal,
    },
  },

  // Slide from left
  slideFromLeft: {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: SPRING_PRESETS.premium,
    },
  },

  // Slide from right
  slideFromRight: {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: SPRING_PRESETS.premium,
    },
  },

  // Rotate in
  rotateIn: {
    hidden: { opacity: 0, rotateY: -90, transformPerspective: 1200 },
    visible: {
      opacity: 1,
      rotateY: 0,
      transition: SPRING_PRESETS.cinematic,
    },
  },

  // Stagger children
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING_PRESETS.normal,
    },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// MICRO-INTERACTION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const HOVER_LIFT: MotionProps = {
  whileHover: { y: -2, transition: SPRING_PRESETS.snappy },
  whileTap: { y: 0, scale: 0.98 },
}

export const HOVER_GLOW: MotionProps = {
  whileHover: {
    boxShadow: '0 0 30px rgba(139, 0, 255, 0.5)',
    transition: SPRING_PRESETS.snappy,
  },
}

export const HOVER_SCALE: MotionProps = {
  whileHover: { scale: 1.01, transition: SPRING_PRESETS.snappy },
  whileTap: { scale: 0.98 },
}

export const PRESS_SCALE: MotionProps = {
  whileTap: { scale: 0.95 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TRANSITION WRAPPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface PageTransitionProps {
  children: ReactNode
  variant?: keyof typeof PAGE_TRANSITIONS
  className?: string
}

export function PageTransition({
  children,
  variant = 'portal',
  className = '',
}: PageTransitionProps) {
  const transition = PAGE_TRANSITIONS[variant]

  return (
    <motion.div
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
}

export function StaggerContainer({
  children,
  delay = 0.2,
  staggerDelay = 0.1,
  className = '',
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div variants={SCROLL_VARIANTS.staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

interface ScrollRevealProps {
  children: ReactNode
  variant?: keyof typeof SCROLL_VARIANTS
  threshold?: number
  className?: string
}

export function ScrollReveal({
  children,
  variant = 'fadeIn',
  threshold = 0.1,
  className = '',
}: ScrollRevealProps) {
  const variants = SCROLL_VARIANTS[variant] as Variants

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATED CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  glowColor?: string
}

export function AnimatedCard({
  children,
  className = '',
  onClick,
  glowColor = 'rgba(139, 0, 255, 0.3)',
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: {
          scale: 1,
          y: 0,
          boxShadow: `0 4px 20px ${glowColor.replace('0.3', '0.1')}`,
        },
        hover: {
          scale: 1.02,
          y: -5,
          boxShadow: `0 20px 40px ${glowColor}`,
          transition: SPRING_PRESETS.snappy,
        },
        tap: { scale: 0.98 },
      }}
      onClick={onClick}
    >
      {children}

      {/* Shimmer effect on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 0.1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(90deg, transparent, white, transparent)',
        }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MagneticWrapperProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function MagneticWrapper({
  children,
  strength = 0.3,
  className = '',
}: MagneticWrapperProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const ref = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength

      setPosition({ x: deltaX, y: deltaY })
    },
    [strength],
  )

  const handleMouseLeave = React.useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={position}
      transition={SPRING_PRESETS.snappy}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLOATING ELEMENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FloatingElementProps {
  children: ReactNode
  amplitude?: number
  duration?: number
  className?: string
}

export function FloatingElement({
  children,
  amplitude = 10,
  duration = 4,
  className = '',
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude / 2, amplitude / 2, -amplitude / 2],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GLOW ORB ANIMATED
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlowOrbProps {
  size?: number
  color?: string
  pulseSpeed?: number
  className?: string
}

export function GlowOrb({
  size = 100,
  color = '#8B00FF',
  pulseSpeed = 2,
  className = '',
}: GlowOrbProps) {
  return (
    <motion.div
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: pulseSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export default {
  SPRING_PRESETS,
  PAGE_TRANSITIONS,
  COMPONENT_VARIANTS,
  SCROLL_VARIANTS,
  HOVER_LIFT,
  HOVER_GLOW,
  HOVER_SCALE,
  PRESS_SCALE,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  AnimatedCard,
  MagneticWrapper,
  FloatingElement,
  GlowOrb,
}

