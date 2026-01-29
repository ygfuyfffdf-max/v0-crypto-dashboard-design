'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS MICRO-ANIMATIONS & TRANSITIONS — ULTRA PREMIUM 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de micro-interacciones, transiciones fluidas y animaciones
 * para crear experiencias visuales satisfactorias y premium.
 *
 * Inspirado en: Linear, Raycast, Apple Vision Pro, Reflect.app
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from 'motion/react'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { GLASS_PALETTE, GLASS_SPRINGS } from '../ui/GlassneumorphismSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const scaleRotateIn: Variants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
  visible: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.8, rotate: 5 },
}

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
}

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(5px)' },
}

// Stagger children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: GLASS_SPRINGS.smooth,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID MORPH TEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidTextProps {
  children: string
  className?: string
  delay?: number
}

export function LiquidText({ children, className, delay = 0 }: LiquidTextProps) {
  const letters = children.split('')

  return (
    <span className={className}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 30, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            ...GLASS_SPRINGS.smooth,
            delay: delay + i * 0.03,
          }}
          style={{ transformOrigin: 'center bottom' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔢 ANIMATED COUNTER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValueRef.current + (value - startValueRef.current) * easeOut

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  const formattedValue = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayValue)

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={GLASS_SPRINGS.bouncy}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ SHIMMER EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShimmerProps {
  children: ReactNode
  className?: string
}

export function Shimmer({ children, className }: ShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 1,
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 PULSE GLOW
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PulseGlowProps {
  children: ReactNode
  color?: string
  intensity?: number
  /** @deprecated Use intensity instead */
  size?: number
  className?: string
}

export function PulseGlow({
  children,
  color = GLASS_PALETTE.violet,
  intensity = 1,
  size,
  className,
}: PulseGlowProps) {
  // Use size as fallback for intensity (backwards compatibility)
  const effectiveIntensity = size ?? intensity
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        animate={{
          boxShadow: [
            `0 0 ${20 * effectiveIntensity}px ${color}`,
            `0 0 ${40 * effectiveIntensity}px ${color}`,
            `0 0 ${20 * effectiveIntensity}px ${color}`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAGNETIC HOVER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, GLASS_SPRINGS.smooth)
  const springY = useSpring(y, GLASS_SPRINGS.smooth)

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
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 REVEAL ON SCROLL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RevealOnScrollProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
}

export function RevealOnScroll({
  children,
  direction = 'up',
  delay = 0,
  className,
}: RevealOnScrollProps) {
  const variants = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight,
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants[direction]}
      transition={{ ...GLASS_SPRINGS.smooth, delay }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎪 PARALLAX LAYER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParallaxLayerProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxLayer({ children, speed = 0.5, className }: ParallaxLayerProps) {
  const y = useMotionValue(0)

  useEffect(() => {
    const handleScroll = () => {
      y.set(window.scrollY * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, y])

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌀 MORPHING BLOB
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MorphingBlobProps {
  size?: number
  color?: string
  className?: string
}

export function MorphingBlob({
  size = 200,
  color = GLASS_PALETTE.violet,
  className,
}: MorphingBlobProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
      }}
      animate={{
        scale: [1, 1.2, 0.9, 1.1, 1],
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
        borderRadius: [
          '60% 40% 30% 70%/60% 30% 70% 40%',
          '30% 60% 70% 40%/50% 60% 30% 60%',
          '60% 40% 30% 70%/60% 30% 70% 40%',
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎆 PARTICLE BURST
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParticleBurstProps {
  trigger?: boolean
  color?: string
  particleCount?: number
  className?: string
}

export function ParticleBurst({
  trigger = false,
  color = '#FBBF24',
  particleCount = 12,
  className,
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (trigger) {
      setParticles(Array.from({ length: particleCount }, (_, i) => i))
      const timeout = setTimeout(() => setParticles([]), 1000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [trigger, particleCount])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {particles.map((i) => {
          const angle = (i / particleCount) * Math.PI * 2
          const distance = 50 + Math.random() * 50

          return (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full"
              style={{ background: color }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                scale: 0,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 ORBIT LOADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrbitLoaderProps {
  size?: number
  color?: string
  className?: string
}

export function OrbitLoader({
  size = 40,
  color = GLASS_PALETTE.violet,
  className,
}: OrbitLoaderProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: color,
            opacity: 1 - i * 0.25,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1 + i * 0.3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      <motion.div
        className="absolute inset-[30%] rounded-full"
        style={{ background: color }}
        animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔲 SKELETON LOADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export function Skeleton({
  width = '100%',
  height = 20,
  rounded = 'md',
  className,
}: SkeletonProps) {
  const radiusMap = {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  }

  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        borderRadius: radiusMap[rounded],
        background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 SPOTLIGHT EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SpotlightProps {
  children: ReactNode
  className?: string
}

export function Spotlight({ children, className }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Pre-compute spotlight gradient to avoid hooks inside JSX
  const spotlightGradient = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x}px ${y}px, ${GLASS_PALETTE.violet}, transparent 40%)`,
  )

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: spotlightGradient,
        }}
      />
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 WAVE ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface WaveProps {
  color?: string
  height?: number
  className?: string
}

export function Wave({ color = GLASS_PALETTE.violet, height = 100, className }: WaveProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <svg
        className="absolute bottom-0 w-[200%]"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        style={{ height }}
      >
        <motion.path
          fill={color}
          d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,25 1440,50 L1440,100 L0,100 Z"
          animate={{
            d: [
              'M0,50 C360,100 720,0 1080,50 C1260,75 1380,25 1440,50 L1440,100 L0,100 Z',
              'M0,60 C360,20 720,80 1080,40 C1260,60 1380,30 1440,60 L1440,100 L0,100 Z',
              'M0,50 C360,100 720,0 1080,50 C1260,75 1380,25 1440,50 L1440,100 L0,100 Z',
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
      <motion.svg
        className="absolute bottom-0 w-[200%]"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        style={{ height: height * 0.6 }}
        animate={{ x: [0, -720] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <path
          fill={color}
          opacity={0.5}
          d="M0,30 C360,60 720,10 1080,40 C1260,55 1380,25 1440,30 L1440,100 L0,100 Z"
        />
      </motion.svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 FLIP CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  className?: string
}

export function FlipCard({ front, back, className }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ perspective: 1000 }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={GLASS_SPRINGS.smooth}
      >
        {/* Front */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎪 TYPEWRITER EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className,
  onComplete,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    let index = 0

    const startTyping = () => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
        timeout = setTimeout(startTyping, speed)
      } else {
        setShowCursor(false)
        onComplete?.()
      }
    }

    timeout = setTimeout(startTyping, delay)

    return () => clearTimeout(timeout)
  }, [text, speed, delay, onComplete])

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  )
}

// Variants ya están exportados inline arriba
