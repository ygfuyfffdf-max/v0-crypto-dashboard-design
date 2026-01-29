'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 USE PREMIUM INTERACTIONS — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hooks avanzados para interacciones premium:
 * - Mouse tracking con springs suaves
 * - Scroll parallax effects
 * - Hover 3D tilt effects
 * - Magnetic button effects
 * - Reveal on scroll animations
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { MotionValue, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MousePosition {
  x: number
  y: number
  normalizedX: number // -1 to 1
  normalizedY: number // -1 to 1
}

interface ScrollPosition {
  progress: number // 0 to 1
  direction: 'up' | 'down' | 'none'
  velocity: number
}

interface TiltValues {
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
  scale: MotionValue<number>
}

interface MagneticValues {
  x: MotionValue<number>
  y: MotionValue<number>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE SMOOTH MOUSE POSITION
// Tracking del mouse con springs suaves para movimientos fluidos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSmoothMouse(options?: { stiffness?: number; damping?: number }) {
  const { stiffness = 100, damping = 30 } = options || {}

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const normalizedX = useMotionValue(0)
  const normalizedY = useMotionValue(0)

  const springConfig = { stiffness, damping }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)
  const smoothNormalizedX = useSpring(normalizedX, springConfig)
  const smoothNormalizedY = useSpring(normalizedY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      normalizedX.set((e.clientX / window.innerWidth) * 2 - 1)
      normalizedY.set((e.clientY / window.innerHeight) * 2 - 1)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY, normalizedX, normalizedY])

  return {
    x: smoothX,
    y: smoothY,
    normalizedX: smoothNormalizedX,
    normalizedY: smoothNormalizedY,
    rawX: mouseX,
    rawY: mouseY,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE ELEMENT MOUSE POSITION
// Tracking del mouse relativo a un elemento específico
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useElementMouse<T extends HTMLElement>(options?: {
  stiffness?: number
  damping?: number
}) {
  const { stiffness = 150, damping = 20 } = options || {}

  const ref = useRef<T>(null)
  const [isHovering, setIsHovering] = useState(false)

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springConfig = { stiffness, damping }
  const smoothX = useSpring(x, springConfig)
  const smoothY = useSpring(y, springConfig)

  // Transform to centered coordinates (-1 to 1)
  const centeredX = useTransform(smoothX, [0, 1], [-1, 1])
  const centeredY = useTransform(smoothY, [0, 1], [-1, 1])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const relativeX = (e.clientX - rect.left) / rect.width
      const relativeY = (e.clientY - rect.top) / rect.height

      x.set(relativeX)
      y.set(relativeY)
    },
    [x, y],
  )

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    x.set(0.5)
    y.set(0.5)
  }, [x, y])

  return {
    ref,
    isHovering,
    x: smoothX,
    y: smoothY,
    centeredX,
    centeredY,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE 3D TILT EFFECT
// Efecto de inclinación 3D en hover
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function use3DTilt<T extends HTMLElement>(options?: {
  maxTilt?: number
  scale?: number
  perspective?: number
  speed?: number
}) {
  const { maxTilt = 15, scale = 1.05, perspective = 1000, speed = 400 } = options || {}

  const { ref, isHovering, centeredX, centeredY, handlers } = useElementMouse<T>({
    stiffness: 300,
    damping: 20,
  })

  const rotateX = useTransform(centeredY, [-1, 1], [maxTilt, -maxTilt])
  const rotateY = useTransform(centeredX, [-1, 1], [-maxTilt, maxTilt])
  const scaleValue = useSpring(isHovering ? scale : 1, { stiffness: 300, damping: 20 })

  const style = {
    perspective,
    transformStyle: 'preserve-3d' as const,
  }

  const innerStyle = {
    rotateX,
    rotateY,
    scale: scaleValue,
    transition: `transform ${speed}ms ease-out`,
  }

  return {
    ref,
    isHovering,
    style,
    innerStyle,
    handlers,
    values: {
      rotateX,
      rotateY,
      scale: scaleValue,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE MAGNETIC EFFECT
// Efecto magnético para botones y elementos interactivos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMagnetic<T extends HTMLElement>(options?: {
  strength?: number
  radius?: number
}) {
  const { strength = 0.3, radius = 100 } = options || {}

  const ref = useRef<T>(null)
  const [isActive, setIsActive] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15 }
  const smoothX = useSpring(x, springConfig)
  const smoothY = useSpring(y, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX * distX + distY * distY)

      if (distance < radius) {
        const force = (1 - distance / radius) * strength
        x.set(distX * force)
        y.set(distY * force)
        setIsActive(true)
      } else {
        x.set(0)
        y.set(0)
        setIsActive(false)
      }
    },
    [radius, strength, x, y],
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    setIsActive(false)
  }, [x, y])

  return {
    ref,
    isActive,
    x: smoothX,
    y: smoothY,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    style: {
      x: smoothX,
      y: smoothY,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE SCROLL REVEAL
// Animación de revelado al hacer scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useScrollReveal<T extends HTMLElement>(options?: {
  threshold?: number
  once?: boolean
  delay?: number
}) {
  const { threshold = 0.1, once = true, delay = 0 } = options || {}

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (once && hasAnimated) return

          setTimeout(() => {
            setIsVisible(true)
            setHasAnimated(true)
          }, delay)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, once, delay, hasAnimated])

  return {
    ref,
    isVisible,
    variants: {
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE PARALLAX
// Efecto parallax basado en scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useParallax<T extends HTMLElement>(options?: {
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const { speed = 0.5, direction = 'up' } = options || {}

  const ref = useRef<T>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const range = speed * 100

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' ? [range, -range] : direction === 'down' ? [-range, range] : [0, 0],
  )

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'left' ? [range, -range] : direction === 'right' ? [-range, range] : [0, 0],
  )

  return {
    ref,
    progress: scrollYProgress,
    x,
    y,
    style: { x, y },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE SCROLL VELOCITY
// Tracking de velocidad de scroll para efectos dinámicos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useScrollVelocity() {
  const { scrollY } = useScroll()
  const [velocity, setVelocity] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none')
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      const now = Date.now()
      const deltaTime = now - lastTime.current
      const deltaScroll = latest - lastScrollY.current

      if (deltaTime > 0) {
        const newVelocity = Math.abs(deltaScroll / deltaTime) * 1000
        setVelocity(newVelocity)
        setDirection(deltaScroll > 0 ? 'down' : deltaScroll < 0 ? 'up' : 'none')
      }

      lastScrollY.current = latest
      lastTime.current = now
    })

    return () => unsubscribe()
  }, [scrollY])

  return {
    velocity,
    direction,
    scrollY,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USE GLOW EFFECT
// Efecto de glow que sigue el mouse
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useGlowEffect<T extends HTMLElement>(options?: {
  color?: string
  size?: number
  intensity?: number
}) {
  const { color = 'rgba(139, 92, 246, 0.5)', size = 300, intensity = 0.6 } = options || {}

  const { ref, isHovering, x, y, handlers } = useElementMouse<T>()

  // Transform normalized position to actual glow position
  const glowX = useTransform(x, [0, 1], [0, 100])
  const glowY = useTransform(y, [0, 1], [0, 100])

  const glowStyle = {
    background: isHovering
      ? `radial-gradient(${size}px circle at ${glowX.get()}% ${glowY.get()}%, ${color}, transparent ${intensity * 100}%)`
      : 'none',
    opacity: isHovering ? 1 : 0,
    transition: 'opacity 0.3s ease',
  }

  return {
    ref,
    isHovering,
    handlers,
    glowStyle,
    glowPosition: { x: glowX, y: glowY },
  }
}

export default {
  useSmoothMouse,
  useElementMouse,
  use3DTilt,
  useMagnetic,
  useScrollReveal,
  useParallax,
  useScrollVelocity,
  useGlowEffect,
}
