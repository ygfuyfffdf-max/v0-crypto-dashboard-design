/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS 2026 — ULTRA TRANSITIONS & MICROINTERACTIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de transiciones cinematográficas y microinteracciones premium:
 * - Page transitions con efectos 3D
 * - Component animations con spring physics
 * - Hover effects avanzados
 * - Loading states premium
 * - Gesture interactions
 * - Sound feedback (opcional)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { Float, MeshDistortMaterial } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  AnimatePresence,
  motion,
  MotionProps,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export type TransitionType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'flip'
  | 'morpheus'
  | 'portal'
  | 'glitch'
  | 'quantum'
  | 'dissolve'

export interface TransitionConfig {
  type: TransitionType
  duration?: number
  delay?: number
  ease?: string | number[]
  direction?: 'left' | 'right' | 'up' | 'down'
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideVariants: Variants = {
  initial: (direction: string) => ({
    opacity: 0,
    x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  exit: (direction: string) => ({
    opacity: 0,
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
  }),
}

export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
}

export const rotateVariants: Variants = {
  initial: { opacity: 0, rotate: -10, scale: 0.9 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 10, scale: 0.9 },
}

export const flipVariants: Variants = {
  initial: { opacity: 0, rotateY: 90 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: -90 },
}

export const portalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0,
    rotate: 180,
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    scale: 0,
    rotate: -180,
    filter: 'blur(20px)',
  },
}

export const morpheusVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 1.5,
    filter: 'blur(30px) saturate(0)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px) saturate(1)',
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    filter: 'blur(30px) saturate(0)',
  },
}

export const quantumVariants: Variants = {
  initial: {
    opacity: 0,
    x: 50,
    skewX: 10,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    x: 0,
    skewX: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    x: -50,
    skewX: -10,
    filter: 'blur(10px)',
  },
}

export const glitchVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    x: [0, -5, 5, -3, 3, 0],
    filter: [
      'hue-rotate(0deg)',
      'hue-rotate(90deg)',
      'hue-rotate(180deg)',
      'hue-rotate(270deg)',
      'hue-rotate(0deg)',
    ],
  },
  exit: {
    opacity: 0,
    x: [0, 5, -5, 3, -3, 0],
  },
}

export const dissolveVariants: Variants = {
  initial: {
    opacity: 0,
    clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  },
  animate: {
    opacity: 1,
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  exit: {
    opacity: 0,
    clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
  },
}

// Stagger children
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const transitionPresets: Record<string, MotionProps['transition']> = {
  smooth: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bouncy: { type: 'spring', stiffness: 400, damping: 17 },
  slow: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  fast: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  elastic: { type: 'spring', stiffness: 200, damping: 10 },
  cinematic: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] },
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

interface PageTransitionProps {
  children: React.ReactNode
  type?: TransitionType
  className?: string
}

export function PageTransition({
  children,
  type = 'morpheus',
  className = '',
}: PageTransitionProps) {
  const variants = {
    fade: fadeVariants,
    slide: slideVariants,
    scale: scaleVariants,
    rotate: rotateVariants,
    flip: flipVariants,
    morpheus: morpheusVariants,
    portal: portalVariants,
    glitch: glitchVariants,
    quantum: quantumVariants,
    dissolve: dissolveVariants,
  }

  return (
    <motion.div
      variants={variants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitionPresets.cinematic}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL TRANSITION
// ═══════════════════════════════════════════════════════════════════════════════

interface PanelTransitionProps {
  children: React.ReactNode
  isVisible?: boolean
  direction?: 'left' | 'right' | 'up' | 'down'
  type?: 'quantum' | 'fade' | 'slide'
  className?: string
}

export function PanelTransition({
  children,
  isVisible = true,
  direction = 'right',
  type = 'quantum',
  className = '',
}: PanelTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={slideVariants}
          custom={direction}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitionPresets.spring}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAGGER LIST
// ═══════════════════════════════════════════════════════════════════════════════

interface StaggerListProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  delayStart?: number
  staggerDelay?: number
}

export function StaggerList({
  children,
  className = '',
  itemClassName = '',
  delayStart = 0.1,
  staggerDelay = 0.05,
}: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: {
          transition: {
            delayChildren: delayStart,
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={staggerItem}
          transition={transitionPresets.spring}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
  onClick?: () => void
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOVER CARD 3D
// ═══════════════════════════════════════════════════════════════════════════════

interface HoverCard3DProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  glareEnabled?: boolean
}

export function HoverCard3D({
  children,
  className = '',
  intensity = 10,
  glareEnabled = true,
}: HoverCard3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const springConfig = { damping: 30, stiffness: 200 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    rotateX.set((mouseY / rect.height) * -intensity)
    rotateY.set((mouseX / rect.width) * intensity)

    // Glare position
    const glareXPos = ((e.clientX - rect.left) / rect.width) * 100
    const glareYPos = ((e.clientY - rect.top) / rect.height) * 100
    glareX.set(glareXPos)
    glareY.set(glareYPos)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {children}

      {/* Glare effect */}
      {glareEnabled && (
        <motion.div
          className="rounded-inherit pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            ),
          }}
        />
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIPPLE EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

interface RippleEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function RippleEffect({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.3)',
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipples((prev) => [...prev, { x, y, id: Date.now() }])
  }

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
            animate={{
              width: 500,
              height: 500,
              x: -250,
              y: -250,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => removeRipple(ripple.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING ORB 3D
// ═══════════════════════════════════════════════════════════════════════════════

function LoadingOrb3D() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          distort={0.4}
          speed={3}
        />
      </mesh>
    </Float>
  )
}

interface LoadingStateProps {
  isLoading?: boolean
  text?: string
  size?: 'small' | 'medium' | 'large'
  showOrb?: boolean
  variant?: 'skeleton' | 'spinner' | 'orb'
  className?: string
}

export function LoadingState({
  isLoading = true,
  text = 'Cargando...',
  size = 'medium',
  showOrb = true,
  variant = 'orb',
  className = '',
}: LoadingStateProps) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
        >
          {showOrb ? (
            <div className={sizeClasses[size]}>
              <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <LoadingOrb3D />
              </Canvas>
            </div>
          ) : (
            <motion.div
              className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}

          <motion.p
            className="mt-4 text-sm font-medium text-white/70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADING
// ═══════════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-white/10'

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-shimmer',
    none: '',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.9,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    filter: 'blur(10px)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER COUNTER
// ═══════════════════════════════════════════════════════════════════════════════

interface NumberCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function NumberCounter({
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: NumberCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      const currentValue = startValue + (value - startValue) * easeOutQuart
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  const formattedValue = displayValue.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MORPHING TEXT
// ═══════════════════════════════════════════════════════════════════════════════

interface MorphingTextProps {
  texts: string[]
  interval?: number
  className?: string
}

export function MorphingText({ texts, interval = 3000, className = '' }: MorphingTextProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        className={className}
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
        transition={{ duration: 0.5 }}
      >
        {texts[index]}
      </motion.span>
    </AnimatePresence>
  )
}
