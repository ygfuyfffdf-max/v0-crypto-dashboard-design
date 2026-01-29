'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ✨ CHRONOS INFINITY 2030 — SMOOTH INTERACTION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════
// Sistema de interactividad suave inmersiva:
// - Cursor trail magnético violeta/oro
// - Lenis smooth scroll
// - Spring physics para todas las animaciones
// - Hover effects suaves (no exagerados tipo VR)
// - Scroll parallax sutil
// Paleta: #8B00FF / #FFD700 / #FF1493 (CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════

import { logger } from '@/app/lib/utils/logger'
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// Type declaration for optional Lenis import
// @ts-expect-error - Lenis is optional and may not be installed

declare module '@studio-freight/lenis' {
  export default class Lenis {
    constructor(options?: {
      duration?: number
      easing?: (t: number) => number
      orientation?: 'vertical' | 'horizontal'
      gestureOrientation?: 'vertical' | 'horizontal' | 'both'
      smoothWheel?: boolean
      wheelMultiplier?: number
      touchMultiplier?: number
    })
    raf(time: number): void
    destroy(): void
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CursorContextValue {
  cursorX: MotionValue<number>
  cursorY: MotionValue<number>
  isHovering: boolean
  setIsHovering: (value: boolean) => void
  hoverType: 'default' | 'pointer' | 'text' | 'action'
  setHoverType: (type: 'default' | 'pointer' | 'text' | 'action') => void
}

interface SmoothInteractionProviderProps {
  children: React.ReactNode
  enableCursor?: boolean
  enableSmoothScroll?: boolean
  cursorColor?: string
  cursorGlowColor?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════

const CursorContext = createContext<CursorContextValue | null>(null)

export function useCursor() {
  const context = useContext(CursorContext)
  if (!context) {
    throw new Error('useCursor must be used within SmoothInteractionProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAGNETIC CURSOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

function MagneticCursor({
  color = '#8B00FF',
  glowColor = '#FFD700',
}: {
  color?: string
  glowColor?: string
}) {
  const { cursorX, cursorY, isHovering, hoverType: _hoverType } = useCursor()

  // Spring configs for buttery smooth movement
  const springConfig = { stiffness: 500, damping: 28, mass: 0.5 }

  const smoothX = useSpring(cursorX, springConfig)
  const smoothY = useSpring(cursorY, springConfig)

  // Trail positions (slightly delayed)
  const trailSpringConfig = { stiffness: 200, damping: 30, mass: 1 }
  const trailX = useSpring(cursorX, trailSpringConfig)
  const trailY = useSpring(cursorY, trailSpringConfig)

  // Size based on hover state
  const size = useSpring(isHovering ? 48 : 20, { stiffness: 300, damping: 20 })
  const opacity = useSpring(isHovering ? 0.8 : 0.5, { stiffness: 300, damping: 20 })

  // Trail transforms (moved outside JSX to follow React hooks rules)
  const trailWidth = useTransform(size, (s) => s * 1.5)
  const trailHeight = useTransform(size, (s) => s * 1.5)
  const trailOpacity = useTransform(opacity, (o) => o * 0.3)

  // Don't render on touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window)
  }, [])

  if (isTouchDevice) return null

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-screen"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          style={{
            width: size,
            height: size,
            opacity,
            background: `radial-gradient(circle, ${color}80 0%, ${color}00 70%)`,
            boxShadow: `0 0 30px ${color}50`,
          }}
          className="rounded-full"
        />
      </motion.div>

      {/* Trail effect */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          style={{
            width: trailWidth,
            height: trailHeight,
            opacity: trailOpacity,
            background: `radial-gradient(circle, ${glowColor}40 0%, ${glowColor}00 70%)`,
          }}
          className="rounded-full blur-md"
        />
      </motion.div>

      {/* Center dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[10000]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width: isHovering ? 6 : 4,
            height: isHovering ? 6 : 4,
            background: glowColor,
            boxShadow: `0 0 10px ${glowColor}`,
          }}
        />
      </motion.div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════

function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      className="fixed top-0 right-0 left-0 z-50 h-0.5 origin-left"
      style={{
        scaleX: scrollProgress,
        background: 'linear-gradient(90deg, #8B00FF, #FFD700, #FF1493)',
        boxShadow: '0 0 10px rgba(139, 0, 255, 0.5)',
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════

export function SmoothInteractionProvider({
  children,
  enableCursor = true,
  enableSmoothScroll = true,
  cursorColor = '#8B00FF',
  cursorGlowColor = '#FFD700',
}: SmoothInteractionProviderProps) {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverType, setHoverType] = useState<'default' | 'pointer' | 'text' | 'action'>('default')

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [cursorX, cursorY])

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (!enableSmoothScroll) return

    let lenis: unknown = null

    const initLenis = async () => {
      try {
        // Dynamic import with type safety - Lenis is optional
        const lenisModule = await import(
          /* webpackIgnore: true */ '@studio-freight/lenis' as string
        ).catch(() => null)

        if (!lenisModule) {
          logger.info('[CHRONOS] Lenis not installed, using native scroll')
          return
        }

        const Lenis = lenisModule.default

        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        })

        function raf(_time: number) {
          ;(lenis as { raf: (time: number) => void })?.raf(_time)
          requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)
      } catch (error) {
        logger.warn('[CHRONOS] Lenis not available, using native scroll', {
          context: 'SmoothInteractionProvider',
          data: error,
        })
      }
    }

    initLenis()

    return () => {
      if (lenis) {
        ;(lenis as { destroy: () => void }).destroy()
      }
    }
  }, [enableSmoothScroll])

  // Hide default cursor when custom cursor is enabled
  useEffect(() => {
    if (enableCursor) {
      document.body.style.cursor = 'none'

      // Add hover listeners to interactive elements
      const interactiveElements = document.querySelectorAll(
        'button, a, input, textarea, select, [role="button"]',
      )

      const handleMouseEnter = () => setIsHovering(true)
      const handleMouseLeave = () => setIsHovering(false)

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
      })

      return () => {
        document.body.style.cursor = 'auto'
        interactiveElements.forEach((el) => {
          el.removeEventListener('mouseenter', handleMouseEnter)
          el.removeEventListener('mouseleave', handleMouseLeave)
        })
      }
    }
    return undefined
  }, [enableCursor])

  return (
    <CursorContext.Provider
      value={{
        cursorX,
        cursorY,
        isHovering,
        setIsHovering,
        hoverType,
        setHoverType,
      }}
    >
      {children}

      {enableCursor && <MagneticCursor color={cursorColor} glowColor={cursorGlowColor} />}

      <ScrollProgressIndicator />
    </CursorContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAGNETIC HOVER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MagneticProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      x.set(deltaX * strength)
      y.set(deltaY * strength)
    },
    [strength, x, y],
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TILT 3D CARD (suave, no exagerado)
// ═══════════════════════════════════════════════════════════════════════════════════════

interface Tilt3DProps {
  children: React.ReactNode
  maxTilt?: number // Grados máximos de tilt (default 6)
  scale?: number // Escala en hover (default 1.02)
  className?: string
  perspective?: number
}

export function Tilt3D({
  children,
  maxTilt = 6,
  scale = 1.02,
  className,
  perspective = 1000,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scaleValue = useMotionValue(1)

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })
  const springScale = useSpring(scaleValue, { stiffness: 300, damping: 30 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      // Tilt suave (máximo 6 grados por default)
      rotateX.set((y - 0.5) * maxTilt * -1)
      rotateY.set((x - 0.5) * maxTilt)
      scaleValue.set(scale)
    },
    [maxTilt, scale, rotateX, rotateY, scaleValue],
  )

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    scaleValue.set(1)
  }, [rotateX, rotateY, scaleValue])

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective,
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale: springScale,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PARALLAX SCROLL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ParallaxProps {
  children: React.ReactNode
  speed?: number // Multiplicador de velocidad (0.5 = mitad de velocidad, 2 = doble)
  className?: string
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const springY = useSpring(y, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      const elementCenter = rect.top + rect.height / 2

      // Distancia desde el centro del viewport
      const distance = elementCenter - viewportCenter

      // Aplicar parallax
      y.set(distance * (1 - speed) * -0.1)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, y])

  return (
    <motion.div ref={ref} className={className} style={{ y: springY }}>
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RIPPLE EFFECT HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

interface Ripple {
  id: number
  x: number
  y: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const createRipple = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    }

    setRipples((prev) => [...prev, newRipple])

    // Remove after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)
  }, [])

  const RippleContainer = useCallback(
    () => (
      <>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            initial={{
              scale: 0,
              opacity: 0.5,
              x: ripple.x,
              y: ripple.y,
            }}
            animate={{
              scale: 4,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              background: 'radial-gradient(circle, rgba(139, 0, 255, 0.4) 0%, transparent 70%)',
            }}
          />
        ))}
      </>
    ),
    [ripples],
  )

  return { createRipple, RippleContainer }
}

export default SmoothInteractionProvider
