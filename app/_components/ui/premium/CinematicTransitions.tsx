'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬 CINEMATIC TRANSITIONS SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de transiciones cinematográficas ultra-premium:
 * - Page Transitions con efectos de película
 * - Panel Morphing suave entre vistas
 * - Fade Through Black elegante
 * - Cross Dissolve profesional
 * - Wipe Transitions direccionales
 * - Zoom Through con profundidad
 * - Particle Portal para navegación
 * - Quantum Blur transition
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useReducedMotion, Variants } from 'motion/react'
import { ReactNode, useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const TRANSITION_PRESETS = {
  cinematic: {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Custom bezier para movimiento cinematográfico
  },
  smooth: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  snappy: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  elastic: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
  },
  bounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 FADE THROUGH BLACK — Transición elegante a través de negro
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FadeThroughBlackProps {
  children: ReactNode
  isVisible: boolean
  duration?: number
  className?: string
}

export function FadeThroughBlack({
  children,
  isVisible,
  duration = 0.8,
  className,
}: FadeThroughBlackProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          {/* Black overlay que aparece y desaparece */}
          <motion.div
            className="pointer-events-none fixed inset-0 z-[100] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 1 }}
            transition={{
              duration: duration * 2,
              times: [0, 0.4, 0.6, 1],
              ease: 'easeInOut',
            }}
          />

          {/* Content */}
          <motion.div
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration * 0.4, delay: duration * 0.6 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 CROSS DISSOLVE — Disolución cruzada profesional
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CrossDissolveProps {
  children: ReactNode
  keyProp: string | number
  duration?: number
  className?: string
}

export function CrossDissolve({
  children,
  keyProp,
  duration = 0.6,
  className,
}: CrossDissolveProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        className={className}
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(8px)' }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 ZOOM THROUGH — Transición de zoom con profundidad
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ZoomThroughProps {
  children: ReactNode
  keyProp: string | number
  direction?: 'in' | 'out'
  duration?: number
  className?: string
}

export function ZoomThrough({
  children,
  keyProp,
  direction = 'in',
  duration = 0.7,
  className,
}: ZoomThroughProps) {
  const variants: Variants = {
    initial: {
      opacity: 0,
      scale: direction === 'in' ? 0.8 : 1.2,
      filter: 'blur(20px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0,
      scale: direction === 'in' ? 1.2 : 0.8,
      filter: 'blur(20px)',
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ↔️ WIPE TRANSITION — Barrido direccional
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface WipeTransitionProps {
  children: ReactNode
  keyProp: string | number
  direction?: 'left' | 'right' | 'up' | 'down'
  duration?: number
  className?: string
}

export function WipeTransition({
  children,
  keyProp,
  direction = 'left',
  duration = 0.6,
  className,
}: WipeTransitionProps) {
  const directionMap = {
    left: { initial: { x: '100%' }, exit: { x: '-100%' } },
    right: { initial: { x: '-100%' }, exit: { x: '100%' } },
    up: { initial: { y: '100%' }, exit: { y: '-100%' } },
    down: { initial: { y: '-100%' }, exit: { y: '100%' } },
  }

  const config = directionMap[direction]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        className={cn('relative overflow-hidden', className)}
        initial={{ ...config.initial, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ ...config.exit, opacity: 0 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌀 QUANTUM BLUR — Transición con efecto cuántico
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumBlurProps {
  children: ReactNode
  keyProp: string | number
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function QuantumBlur({
  children,
  keyProp,
  duration = 0.8,
  intensity = 'medium',
  className,
}: QuantumBlurProps) {
  const intensityMap = {
    low: { blur: 10, scale: 0.95 },
    medium: { blur: 20, scale: 0.9 },
    high: { blur: 40, scale: 0.85 },
  }

  const config = intensityMap[intensity]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        className={className}
        initial={{
          opacity: 0,
          scale: config.scale,
          filter: `blur(${config.blur}px)`,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
        }}
        exit={{
          opacity: 0,
          scale: config.scale,
          filter: `blur(${config.blur}px)`,
        }}
        transition={{
          duration,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ PARTICLE PORTAL — Portal de partículas para navegación
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParticlePortalProps {
  isOpen: boolean
  onComplete?: () => void
  color?: string
  particleCount?: number
  duration?: number
}

export function ParticlePortal({
  isOpen,
  onComplete,
  color = '#8B5CF6',
  particleCount = 50,
  duration = 1.5,
}: ParticlePortalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Particle {
      x: number
      y: number
      targetX: number
      targetY: number
      size: number
      speed: number
      alpha: number
    }

    const particles: Particle[] = []
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Crear partículas en los bordes
    for (let i = 0; i < particleCount; i++) {
      const edge = Math.floor(Math.random() * 4)
      let x: number, y: number

      switch (edge) {
        case 0:
          x = Math.random() * canvas.width
          y = 0
          break
        case 1:
          x = canvas.width
          y = Math.random() * canvas.height
          break
        case 2:
          x = Math.random() * canvas.width
          y = canvas.height
          break
        default:
          x = 0
          y = Math.random() * canvas.height
      }

      particles.push({
        x,
        y,
        targetX: centerX,
        targetY: centerY,
        size: 2 + Math.random() * 4,
        speed: 0.02 + Math.random() * 0.03,
        alpha: 0.5 + Math.random() * 0.5,
      })
    }

    let progress = 0
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      progress = (currentTime - startTime) / (duration * 1000)

      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + progress * 0.3})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Central glow
      const glowSize = 50 + progress * 200
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize)
      gradient.addColorStop(
        0,
        `${color}${Math.floor(progress * 255)
          .toString(16)
          .padStart(2, '0')}`,
      )
      gradient.addColorStop(0.5, `${color}40`)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2)
      ctx.fill()

      // Actualizar y dibujar partículas
      particles.forEach((particle) => {
        const dx = particle.targetX - particle.x
        const dy = particle.targetY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 5) {
          particle.x += dx * particle.speed
          particle.y += dy * particle.speed
        }

        // Dibujar partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * (1 - progress * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.floor(particle.alpha * 255 * (1 - progress * 0.5))
          .toString(16)
          .padStart(2, '0')}`
        ctx.fill()

        // Trail
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(particle.x - dx * 0.1, particle.y - dy * 0.1)
        ctx.strokeStyle = `${color}40`
        ctx.lineWidth = particle.size * 0.5
        ctx.stroke()
      })

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isOpen, color, particleCount, duration, onComplete])

  if (!isOpen) return null

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[200]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎪 PAGE TRANSITION WRAPPER — Wrapper para transiciones de página
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type TransitionType = 'fade' | 'slide' | 'zoom' | 'quantum' | 'wipe' | 'none'

interface PageTransitionProps {
  children: ReactNode
  type?: TransitionType
  direction?: 'left' | 'right' | 'up' | 'down'
  duration?: number
  className?: string
}

export function PageTransition({
  children,
  type = 'quantum',
  direction = 'up',
  duration = 0.6,
  className,
}: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion || type === 'none') {
    return <div className={className}>{children}</div>
  }

  const variants: Record<TransitionType, Variants> = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: {
        opacity: 0,
        x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: {
        opacity: 0,
        x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
        y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
      },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
    },
    quantum: {
      initial: {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(20px)',
        y: 20,
      },
      animate: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        y: 0,
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(20px)',
        y: -20,
      },
    },
    wipe: {
      initial: { clipPath: 'inset(0 100% 0 0)' },
      animate: { clipPath: 'inset(0 0% 0 0)' },
      exit: { clipPath: 'inset(0 0 0 100%)' },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  }

  return (
    <motion.div
      className={className}
      variants={variants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 AURORA REVEAL — Revelación con efecto aurora
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraRevealProps {
  children: ReactNode
  isVisible: boolean
  colors?: string[]
  duration?: number
  className?: string
}

export function AuroraReveal({
  children,
  isVisible,
  colors = ['#8B5CF6', '#06B6D4', '#EC4899'],
  duration = 1,
  className,
}: AuroraRevealProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn('relative', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration * 0.5 }}
        >
          {/* Aurora overlay */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-10"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration, delay: duration * 0.3 }}
          >
            {colors.map((color, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at ${50 + (i - 1) * 30}% 50%, ${color}60, transparent 60%)`,
                }}
                initial={{ scale: 2, opacity: 0.8 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{
                  duration,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, filter: 'blur(20px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 PANEL MORPH — Morphing entre paneles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PanelMorphProps {
  children: ReactNode
  panelId: string
  className?: string
}

export function PanelMorph({ children, panelId, className }: PanelMorphProps) {
  return (
    <motion.div
      key={panelId}
      layoutId={`panel-${panelId}`}
      className={className}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={TRANSITION_PRESETS.cinematic}
    >
      {children}
    </motion.div>
  )
}

export default {
  FadeThroughBlack,
  CrossDissolve,
  ZoomThrough,
  WipeTransition,
  QuantumBlur,
  ParticlePortal,
  PageTransition,
  AuroraReveal,
  PanelMorph,
  TRANSITION_PRESETS,
}
