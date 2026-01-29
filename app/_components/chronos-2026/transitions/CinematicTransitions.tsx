'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬 CINEMATIC TRANSITIONS — Ultra Premium Page & Panel Transitions
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de transiciones cinematográficas nivel producción:
 * - Fade con blur
 * - Slide con perspective
 * - Scale con rotation
 * - Morphing fluid
 * - Particle dissolution
 */

import { AnimatePresence, motion, Variants } from 'motion/react'
import { memo, ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSITION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const fadeBlur: Variants = {
  initial: { opacity: 0, filter: 'blur(20px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(10px)' },
}

export const slideUp3D: Variants = {
  initial: {
    opacity: 0,
    y: 100,
    rotateX: -15,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -50,
    rotateX: 10,
    scale: 0.95,
  },
}

export const slideRight3D: Variants = {
  initial: {
    opacity: 0,
    x: -100,
    rotateY: 15,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: 100,
    rotateY: -10,
    scale: 0.95,
  },
}

export const scaleRotate: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotate: -5,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    rotate: 3,
    filter: 'blur(5px)',
  },
}

export const morphFluid: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    borderRadius: '50%',
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    borderRadius: '16px',
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    borderRadius: '30%',
    filter: 'blur(10px)',
  },
}

export const expandFromCenter: Variants = {
  initial: {
    opacity: 0,
    scale: 0,
    clipPath: 'circle(0% at 50% 50%)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    clipPath: 'circle(100% at 50% 50%)',
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    clipPath: 'circle(0% at 50% 50%)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SPRING CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const CINEMATIC_SPRINGS = {
  smooth: { type: 'spring' as const, stiffness: 100, damping: 20 },
  bouncy: { type: 'spring' as const, stiffness: 200, damping: 15 },
  snappy: { type: 'spring' as const, stiffness: 400, damping: 25 },
  gentle: { type: 'spring' as const, stiffness: 50, damping: 15 },
  cinematic: { type: 'spring' as const, stiffness: 80, damping: 18 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PageTransitionProps {
  children: ReactNode
  variant?: 'fade' | 'slide' | 'scale' | 'morph' | 'expand'
  className?: string
  delay?: number
}

export const PageTransition = memo(function PageTransition({
  children,
  variant = 'fade',
  className,
  delay = 0,
}: PageTransitionProps) {
  const variants: Record<string, Variants> = {
    fade: fadeBlur,
    slide: slideUp3D,
    scale: scaleRotate,
    morph: morphFluid,
    expand: expandFromCenter,
  }

  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        delay,
      }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PANEL TRANSITION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PanelTransitionProps {
  children: ReactNode
  isVisible: boolean
  variant?: 'fade' | 'slide' | 'scale' | 'morph' | 'expand'
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export const PanelTransition = memo(function PanelTransition({
  children,
  isVisible,
  variant = 'slide',
  direction = 'up',
  className,
}: PanelTransitionProps) {
  const directionVariants: Record<string, Variants> = {
    up: slideUp3D,
    down: {
      initial: { opacity: 0, y: -100, rotateX: 15 },
      animate: { opacity: 1, y: 0, rotateX: 0 },
      exit: { opacity: 0, y: 50, rotateX: -10 },
    },
    left: slideRight3D,
    right: {
      initial: { opacity: 0, x: 100, rotateY: -15 },
      animate: { opacity: 1, x: 0, rotateY: 0 },
      exit: { opacity: 0, x: -100, rotateY: 10 },
    },
  }

  const variants = variant === 'slide' ? directionVariants[direction] :
    variant === 'fade' ? fadeBlur :
    variant === 'scale' ? scaleRotate :
    variant === 'morph' ? morphFluid :
    expandFromCenter

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: 'spring' as const,
            stiffness: 100,
            damping: 20,
          }}
          style={{ perspective: 1000 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STAGGER CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

export const StaggerContainer = memo(function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
        exit: {
          transition: {
            staggerChildren: staggerDelay / 2,
            staggerDirection: -1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STAGGER ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export const StaggerItem = memo(function StaggerItem({
  children,
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        initial: {
          opacity: 0,
          y: 20,
          filter: 'blur(10px)',
        },
        animate: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: CINEMATIC_SPRINGS.smooth,
        },
        exit: {
          opacity: 0,
          y: -10,
          filter: 'blur(5px)',
        },
      }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON WITH SHIMMER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LoadingSkeletonProps {
  className?: string
  variant?: 'card' | 'text' | 'avatar' | 'chart'
}

export const LoadingSkeleton = memo(function LoadingSkeleton({
  className,
  variant = 'card',
}: LoadingSkeletonProps) {
  const variantClasses = {
    card: 'h-32 rounded-2xl',
    text: 'h-4 rounded-lg',
    avatar: 'h-12 w-12 rounded-full',
    chart: 'h-64 rounded-2xl',
  }

  return (
    <div className={`relative overflow-hidden bg-white/5 ${variantClasses[variant]} ${className || ''}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
})

export default {
  PageTransition,
  PanelTransition,
  StaggerContainer,
  StaggerItem,
  LoadingSkeleton,
  fadeBlur,
  slideUp3D,
  slideRight3D,
  scaleRotate,
  morphFluid,
  expandFromCenter,
  CINEMATIC_SPRINGS,
}
