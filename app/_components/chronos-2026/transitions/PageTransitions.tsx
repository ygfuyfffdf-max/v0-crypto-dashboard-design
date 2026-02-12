/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎭✨ TRANSICIONES CINEMATOGRÁFICAS 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de transiciones ultra premium entre paneles:
 * ✅ Page transitions con morphing
 * ✅ Fade through black
 * ✅ Cross dissolve
 * ✅ Slide con parallax
 * ✅ Scale & blur
 * ✅ Particle portal
 * ✅ Wipe transitions
 * ✅ Clip path reveals
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import { usePathname } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TransitionType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'scale-fade'
  | 'blur'
  | 'blur-scale'
  | 'clip-circle'
  | 'clip-rectangle'
  | 'morph'
  | 'flip'
  | 'parallax'

export interface TransitionConfig {
  type: TransitionType
  duration?: number
  delay?: number
  ease?: string | number[]
  stagger?: number
}

const DEFAULT_DURATION = 0.4
const _DEFAULT_EASE = [0.25, 0.1, 0.25, 1]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO DE TRANSICIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TransitionContextType {
  transitionType: TransitionType
  setTransitionType: (type: TransitionType) => void
  duration: number
  setDuration: (duration: number) => void
  isTransitioning: boolean
}

const TransitionContext = createContext<TransitionContextType | null>(null)

export function usePageTransition() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error('usePageTransition debe usarse dentro de TransitionProvider')
  }
  return context
}

export function TransitionProvider({
  children,
  defaultType = 'fade',
  defaultDuration = DEFAULT_DURATION,
}: {
  children: React.ReactNode
  defaultType?: TransitionType
  defaultDuration?: number
}) {
  const [transitionType, setTransitionType] = useState<TransitionType>(defaultType)
  const [duration, setDuration] = useState(defaultDuration)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), duration * 1000)
    return () => clearTimeout(timer)
  }, [pathname, duration])

  return (
    <TransitionContext.Provider
      value={{
        transitionType,
        setTransitionType,
        duration,
        setDuration,
        isTransitioning,
      }}
    >
      {children}
    </TransitionContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTES DE ANIMACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const createTransition = (duration: number): Transition => ({
  duration,
  ease: [0.25, 0.1, 0.25, 1] as const,
})

export const transitionVariants: Record<TransitionType, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
  },
  'slide-down': {
    initial: { opacity: 0, y: -40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 40 },
  },
  'slide-left': {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 60 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
  },
  'scale-fade': {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(20px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(20px)' },
  },
  'blur-scale': {
    initial: { opacity: 0, scale: 0.9, filter: 'blur(20px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.1, filter: 'blur(20px)' },
  },
  'clip-circle': {
    initial: { clipPath: 'circle(0% at 50% 50%)' },
    animate: { clipPath: 'circle(150% at 50% 50%)' },
    exit: { clipPath: 'circle(0% at 50% 50%)' },
  },
  'clip-rectangle': {
    initial: { clipPath: 'inset(50% 50% 50% 50%)' },
    animate: { clipPath: 'inset(0% 0% 0% 0%)' },
    exit: { clipPath: 'inset(50% 50% 50% 50%)' },
  },
  morph: {
    initial: {
      opacity: 0,
      borderRadius: '50%',
      scale: 0.5,
    },
    animate: {
      opacity: 1,
      borderRadius: '0%',
      scale: 1,
    },
    exit: {
      opacity: 0,
      borderRadius: '50%',
      scale: 0.5,
    },
  },
  flip: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -90 },
  },
  parallax: {
    initial: { opacity: 0, y: 100, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -100, scale: 1.1 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface PageTransitionProps {
  children: React.ReactNode
  type?: TransitionType
  duration?: number
  delay?: number
  className?: string
}

export function PageTransition({
  children,
  type = 'fade',
  duration = DEFAULT_DURATION,
  delay = 0,
  className,
}: PageTransitionProps) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const variants = shouldReduceMotion ? transitionVariants.fade : transitionVariants[type]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={createTransition(duration)}
        style={{ transitionDelay: `${delay}s` }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FADE THROUGH BLACK — TRANSICIÓN CON FUNDIDO A NEGRO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface FadeThroughBlackProps {
  children: React.ReactNode
  duration?: number
  className?: string
}

export function FadeThroughBlack({ children, duration = 0.5, className }: FadeThroughBlackProps) {
  const pathname = usePathname()

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 2 }}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Black overlay */}
      <AnimatePresence>
        <motion.div
          key={`overlay-${pathname}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 1 }}
          transition={{ duration: duration / 2 }}
          className="pointer-events-none fixed inset-0 z-50 bg-black"
        />
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CROSS DISSOLVE — DISOLUCIÓN CRUZADA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface CrossDissolveProps {
  children: React.ReactNode
  duration?: number
  className?: string
}

export function CrossDissolve({ children, duration = 0.6, className }: CrossDissolveProps) {
  const pathname = usePathname()

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="sync">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, position: 'absolute', inset: 0 }}
          animate={{ opacity: 1, position: 'relative' }}
          exit={{ opacity: 0, position: 'absolute', inset: 0 }}
          transition={{ duration }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// WIPE TRANSITION — TRANSICIÓN CON BARRIDO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type WipeDirection = 'left' | 'right' | 'up' | 'down'

export interface WipeTransitionProps {
  children: React.ReactNode
  direction?: WipeDirection
  duration?: number
  color?: string
  className?: string
}

export function WipeTransition({
  children,
  direction = 'right',
  duration = 0.6,
  color = '#8B5CF6',
  className,
}: WipeTransitionProps) {
  const pathname = usePathname()

  const wipeVariants: Record<WipeDirection, Variants> = {
    left: {
      initial: { x: '100%' },
      animate: { x: [null, '0%', '-100%'] },
      exit: { x: '100%' },
    },
    right: {
      initial: { x: '-100%' },
      animate: { x: [null, '0%', '100%'] },
      exit: { x: '-100%' },
    },
    up: {
      initial: { y: '100%' },
      animate: { y: [null, '0%', '-100%'] },
      exit: { y: '100%' },
    },
    down: {
      initial: { y: '-100%' },
      animate: { y: [null, '0%', '100%'] },
      exit: { y: '-100%' },
    },
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 4 }}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Wipe overlay */}
      <motion.div
        key={`wipe-${pathname}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={wipeVariants[direction]}
        transition={{
          duration,
          times: [0, 0.5, 1],
          ease: [0.4, 0, 0.2, 1],
        }}
        className="pointer-events-none fixed inset-0 z-50"
        style={{ backgroundColor: color }}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE PORTAL — TRANSICIÓN CON PARTÍCULAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ParticlePortalProps {
  children: React.ReactNode
  particleCount?: number
  duration?: number
  color?: string
  className?: string
}

export function ParticlePortal({
  children,
  particleCount = 50,
  duration = 0.8,
  color = '#8B5CF6',
  className,
}: ParticlePortalProps) {
  const pathname = usePathname()
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    setShowParticles(true)
    const timer = setTimeout(() => setShowParticles(false), duration * 1000)
    return () => clearTimeout(timer)
  }, [pathname, duration])

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 0.3,
  }))

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: duration * 0.6 }}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Particles overlay */}
      <AnimatePresence>
        {showParticles && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: color,
                  boxShadow: `0 0 ${particle.size * 2}px ${color}`,
                }}
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: duration * 0.8,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM BLUR — TRANSICIÓN CON BLUR CUÁNTICO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface QuantumBlurProps {
  children: React.ReactNode
  duration?: number
  maxBlur?: number
  className?: string
}

export function QuantumBlur({
  children,
  duration = 0.5,
  maxBlur = 30,
  className,
}: QuantumBlurProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          filter: `blur(${maxBlur}px) brightness(1.5)`,
          scale: 1.02,
        }}
        animate={{
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          scale: 1,
        }}
        exit={{
          opacity: 0,
          filter: `blur(${maxBlur}px) brightness(0.5)`,
          scale: 0.95,
        }}
        transition={{ duration }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AURORA REVEAL — REVEAL CON EFECTO AURORA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface AuroraRevealProps {
  children: React.ReactNode
  duration?: number
  colors?: string[]
  className?: string
}

export function AuroraReveal({
  children,
  duration = 0.8,
  colors = ['#8B5CF6', '#06B6D4', '#EC4899'],
  className,
}: AuroraRevealProps) {
  const pathname = usePathname()
  const [isRevealing, setIsRevealing] = useState(false)

  useEffect(() => {
    setIsRevealing(true)
    const timer = setTimeout(() => setIsRevealing(false), duration * 1000)
    return () => clearTimeout(timer)
  }, [pathname, duration])

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration * 0.7, delay: duration * 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Aurora overlay */}
      <AnimatePresence>
        {isRevealing && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {colors.map((color, i) => (
                    <stop
                      key={i}
                      offset={`${(i / (colors.length - 1)) * 100}%`}
                      stopColor={color}
                    />
                  ))}
                </linearGradient>
                <filter id="aurora-blur">
                  <feGaussianBlur stdDeviation="60" />
                </filter>
              </defs>
              <motion.rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#aurora-gradient)"
                filter="url(#aurora-blur)"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PANEL MORPH — TRANSICIÓN MORFING ENTRE PANELES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface PanelMorphProps {
  children: React.ReactNode
  duration?: number
  className?: string
}

export function PanelMorph({ children, duration = 0.6, className }: PanelMorphProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          scale: 1,
        }}
        exit={{
          opacity: 0,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          scale: 0.8,
        }}
        transition={{
          duration,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STAGGERED CHILDREN — ANIMACIÓN ESCALONADA DE HIJOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface StaggeredChildrenProps {
  children: React.ReactNode
  stagger?: number
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function StaggeredChildren({
  children,
  stagger = 0.05,
  delay = 0,
  direction = 'up',
  className,
}: StaggeredChildrenProps) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: stagger,
      },
    },
  }

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      ...directionOffset[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// REVEAL ON SCROLL — REVELAR AL HACER SCROLL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface RevealOnScrollProps {
  children: React.ReactNode
  type?: 'fade' | 'slide-up' | 'slide-left' | 'scale'
  threshold?: number
  delay?: number
  duration?: number
  once?: boolean
  className?: string
}

export function RevealOnScroll({
  children,
  type = 'fade',
  threshold = 0.1,
  delay = 0,
  duration = 0.5,
  once = true,
  className,
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, once])

  const variants: Record<string, Variants> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    'slide-up': {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
    'slide-left': {
      hidden: { opacity: 0, x: 40 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants[type]}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

