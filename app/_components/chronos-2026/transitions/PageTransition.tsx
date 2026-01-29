/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎬 CHRONOS 2026 — PAGE TRANSITION COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Componente de transición de página cinematográfico:
 * - Fade + Scale transitions
 * - Slide transitions
 * - Blur reveal effect
 * - Loading states
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { durations, pageTransitions, springs } from '@/app/_lib/motion/motion-2026'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type TransitionType = 'fadeScale' | 'slideRight' | 'slideUp' | 'blurReveal' | 'morph'

interface PageTransitionProps {
  children: React.ReactNode
  type?: TransitionType
  className?: string
}

interface LoadingTransitionProps {
  isLoading: boolean
  children: React.ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

export function PageTransition({
  children,
  type = 'fadeScale',
  className = '',
}: PageTransitionProps) {
  const pathname = usePathname()
  const variants = pageTransitions[type]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className={className}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING TRANSITION
// ═══════════════════════════════════════════════════════════════════════════════

export function LoadingTransition({ isLoading, children }: LoadingTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: durations.normal }}
        >
          <ChronosLoadingSpinner />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={springs.gentle}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS LOADING SPINNER
// ═══════════════════════════════════════════════════════════════════════════════

export function ChronosLoadingSpinner({ size = 60 }: { size?: number }) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.bouncy}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-500/30"
        style={{ borderTopColor: 'rgb(139 92 246)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full border-2 border-violet-500/20"
        style={{
          inset: size * 0.15,
          borderRightColor: 'rgb(167 139 250)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full border-2 border-purple-400/20"
        style={{
          inset: size * 0.3,
          borderBottomColor: 'rgb(192 132 252)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />

      {/* Core */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-purple-500 to-violet-600"
        style={{ inset: size * 0.4 }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADER
// ═══════════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseStyles = 'bg-white/5 overflow-hidden'

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    >
      {animate && (
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVEAL ANIMATION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

interface RevealProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
  className?: string
  once?: boolean
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className = '',
  once = true,
}: RevealProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isInView, setIsInView] = useState(false)

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
    scale: { y: 0, x: 0, scale: 0.9 },
  }

  const shouldAnimate = once ? !hasAnimated : true

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      whileInView={
        shouldAnimate
          ? {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
            }
          : undefined
      }
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      onViewportEnter={() => setIsInView(true)}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAGGER CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════

interface StaggerContainerProps {
  children: React.ReactNode
  stagger?: number
  delay?: number
  className?: string
}

export function StaggerContainer({
  children,
  stagger = 0.05,
  delay = 0,
  className = '',
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAGNETIC HOVER EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

interface MagneticProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className = '', strength = 0.3 }: MagneticProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={springs.micro}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default PageTransition
