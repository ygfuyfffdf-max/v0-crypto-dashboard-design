/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — EFECTOS HOVER MAGNÉTICOS + SCROLL PARALLAX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hooks avanzados para efectos interactivos:
 * - useMagneticEffect: Cursor magnético con atracción
 * - useTiltEffect: Efecto 3D tilt con parallax interno
 * - useScrollParallax: Parallax basado en scroll
 * - useSpotlightEffect: Spotlight que sigue el cursor
 * - useRippleEffect: Efecto ripple en click
 *
 * @version HYPER-INFINITY 2026.1
 */

'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧲 MAGNETIC EFFECT — ATRACCIÓN MAGNÉTICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MagneticConfig {
  strength?: number
  maxDistance?: number
  springConfig?: {
    stiffness: number
    damping: number
    mass: number
  }
}

export function useMagneticEffect<T extends HTMLElement = HTMLDivElement>(
  config: MagneticConfig = {},
) {
  const {
    strength = 0.35,
    maxDistance = 150,
    springConfig = { stiffness: 800, damping: 35, mass: 0.2 },
  } = config

  const ref = useRef<T>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

      if (distance < maxDistance) {
        const factor = 1 - distance / maxDistance
        x.set(distanceX * strength * factor)
        y.set(distanceY * strength * factor)
      } else {
        x.set(0)
        y.set(0)
      }
    },
    [strength, maxDistance, x, y],
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    window.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  return {
    ref,
    style: {
      x: springX,
      y: springY,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎴 3D TILT EFFECT — PERSPECTIVA 3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TiltConfig {
  maxTilt?: number
  perspective?: number
  scale?: number
  speed?: number
  glareOpacity?: number
  springConfig?: {
    stiffness: number
    damping: number
    mass: number
  }
}

export function useTiltEffect<T extends HTMLElement = HTMLDivElement>(config: TiltConfig = {}) {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.02,
    speed = 400,
    glareOpacity = 0.15,
    springConfig = { stiffness: 400, damping: 28, mass: 0.5 },
  } = config

  const ref = useRef<T>(null)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scaleValue = useMotionValue(1)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)
  const springScale = useSpring(scaleValue, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const percentX = (mouseX - centerX) / centerX
      const percentY = (mouseY - centerY) / centerY

      rotateX.set(-percentY * maxTilt)
      rotateY.set(percentX * maxTilt)

      glareX.set((mouseX / rect.width) * 100)
      glareY.set((mouseY / rect.height) * 100)
    },
    [maxTilt, rotateX, rotateY, glareX, glareY],
  )

  const handleMouseEnter = useCallback(() => {
    scaleValue.set(scale)
  }, [scale, scaleValue])

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    scaleValue.set(1)
    glareX.set(50)
    glareY.set(50)
  }, [rotateX, rotateY, scaleValue, glareX, glareY])

  const glareGradient = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,${glareOpacity}) 0%, transparent 60%)`,
  )

  return {
    ref,
    style: {
      perspective,
      rotateX: springRotateX,
      rotateY: springRotateY,
      scale: springScale,
      transformStyle: 'preserve-3d' as const,
    },
    glareStyle: {
      background: glareGradient,
    },
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📜 SCROLL PARALLAX EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParallaxConfig {
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  easing?: [number, number, number, number]
}

export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(
  config: ParallaxConfig = {},
) {
  const { speed = 0.5, direction = 'up' } = config

  const ref = useRef<T>(null)
  const y = useMotionValue(0)
  const x = useMotionValue(0)

  const springY = useSpring(y, { stiffness: 100, damping: 30 })
  const springX = useSpring(x, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress))

      const offset = (clampedProgress - 0.5) * 200 * speed

      switch (direction) {
        case 'up':
          y.set(-offset)
          break
        case 'down':
          y.set(offset)
          break
        case 'left':
          x.set(-offset)
          break
        case 'right':
          x.set(offset)
          break
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, direction, y, x])

  return {
    ref,
    style: {
      y: direction === 'up' || direction === 'down' ? springY : 0,
      x: direction === 'left' || direction === 'right' ? springX : 0,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💡 SPOTLIGHT EFFECT — FOCO SIGUIENDO CURSOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SpotlightConfig {
  size?: number
  color?: string
  opacity?: number
  blur?: number
}

export function useSpotlightEffect<T extends HTMLElement = HTMLDivElement>(
  config: SpotlightConfig = {},
) {
  const {
    size = 400,
    color = '139, 0, 255', // Violet RGB
    opacity = 0.15,
    blur = 100,
  } = config

  const ref = useRef<T>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 200, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY],
  )

  const spotlightBackground = useTransform(
    [springX, springY],
    ([x, y]) =>
      `radial-gradient(${size}px circle at ${x}px ${y}px, rgba(${color}, ${opacity}), transparent ${blur}%)`,
  )

  return {
    ref,
    style: {
      background: spotlightBackground,
    },
    handlers: {
      onMouseMove: handleMouseMove,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 RIPPLE EFFECT — ONDA EN CLICK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

interface RippleConfig {
  color?: string
  duration?: number
  maxSize?: number
}

export function useRippleEffect(config: RippleConfig = {}) {
  const { color = 'rgba(139, 0, 255, 0.3)', duration = 600, maxSize = 200 } = config

  const [ripples, setRipples] = useState<Ripple[]>([])
  const nextId = useRef(0)

  const createRipple = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate size based on distance to furthest corner
      const maxDistX = Math.max(x, rect.width - x)
      const maxDistY = Math.max(y, rect.height - y)
      const size = Math.min(Math.sqrt(maxDistX ** 2 + maxDistY ** 2) * 2, maxSize)

      const ripple: Ripple = {
        id: nextId.current++,
        x,
        y,
        size,
      }

      setRipples((prev) => [...prev, ripple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
      }, duration)
    },
    [duration, maxSize],
  )

  const rippleElements = ripples.map((ripple) => ({
    key: ripple.id,
    style: {
      position: 'absolute' as const,
      left: ripple.x - ripple.size / 2,
      top: ripple.y - ripple.size / 2,
      width: ripple.size,
      height: ripple.size,
      borderRadius: '50%',
      background: color,
      pointerEvents: 'none' as const,
      animation: `ripple ${duration}ms ease-out forwards`,
    },
  }))

  return {
    createRipple,
    rippleElements,
    rippleKeyframes: `
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
    `,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 HOVER GLOW EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlowConfig {
  color?: string
  intensity?: number
  blur?: number
}

export function useHoverGlow<T extends HTMLElement = HTMLDivElement>(config: GlowConfig = {}) {
  const { color = '139, 0, 255', intensity = 0.5, blur = 20 } = config

  const ref = useRef<T>(null)
  const [isHovered, setIsHovered] = useState(false)
  const glowIntensity = useMotionValue(0)

  const springGlow = useSpring(glowIntensity, { stiffness: 300, damping: 30 })

  useEffect(() => {
    glowIntensity.set(isHovered ? intensity : 0)
  }, [isHovered, intensity, glowIntensity])

  const boxShadow = useTransform(
    springGlow,
    (value) =>
      `0 0 ${blur}px rgba(${color}, ${value}), 0 0 ${blur * 2}px rgba(${color}, ${value * 0.5})`,
  )

  return {
    ref,
    style: {
      boxShadow,
    },
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
    isHovered,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 INFINITE SCROLL ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface InfiniteScrollConfig {
  speed?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  pauseOnHover?: boolean
}

export function useInfiniteScroll(config: InfiniteScrollConfig = {}) {
  const {
    speed = 50, // pixels per second
    direction = 'left',
    pauseOnHover = true,
  } = config

  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const positionRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return

    const content = contentRef.current
    const contentWidth = content.scrollWidth / 2 // Assuming content is duplicated

    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      if (!isPaused) {
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime

        const movement = speed * deltaTime

        switch (direction) {
          case 'left':
            positionRef.current -= movement
            if (positionRef.current <= -contentWidth) {
              positionRef.current = 0
            }
            content.style.transform = `translateX(${positionRef.current}px)`
            break
          case 'right':
            positionRef.current += movement
            if (positionRef.current >= 0) {
              positionRef.current = -contentWidth
            }
            content.style.transform = `translateX(${positionRef.current}px)`
            break
        }
      } else {
        lastTime = currentTime
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [speed, direction, isPaused])

  return {
    containerRef,
    contentRef,
    handlers: pauseOnHover
      ? {
          onMouseEnter: () => setIsPaused(true),
          onMouseLeave: () => setIsPaused(false),
        }
      : {},
    isPaused,
    setIsPaused,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QuantumEffects = {
  useMagneticEffect,
  useTiltEffect,
  useScrollParallax,
  useSpotlightEffect,
  useRippleEffect,
  useHoverGlow,
  useInfiniteScroll,
}

export default QuantumEffects
