/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS 2026 — iOS PREMIUM VISUAL EFFECTS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Efectos visuales premium optimizados sin parallax problemático:
 * - Shimmer effects
 * - Morphing gradients
 * - Glow effects controlados
 * - Particle systems ligeros
 * - Blur transitions
 * - Rainbow borders
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { ReactNode, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SHIMMER EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSShimmerProps {
  children?: ReactNode
  className?: string
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  baseColor?: string
  highlightColor?: string
  duration?: number
  enabled?: boolean
}

export const iOSShimmer = memo(function iOSShimmer({
  children,
  className,
  width = '100%',
  height = 20,
  borderRadius = 8,
  baseColor = 'rgba(255,255,255,0.05)',
  highlightColor = 'rgba(255,255,255,0.15)',
  duration = 1.5,
  enabled = true,
}: iOSShimmerProps) {
  if (!enabled) return <>{children}</>

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: baseColor,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            ${highlightColor} 50%,
            transparent 100%
          )`,
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MORPHING GRADIENT BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSMorphGradientProps {
  colors?: string[]
  speed?: number
  intensity?: number
  className?: string
  blur?: number
}

export const iOSMorphGradient = memo(function iOSMorphGradient({
  colors = ['#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'],
  speed = 8,
  intensity = 0.3,
  className,
  blur = 60,
}: iOSMorphGradientProps) {
  const [positions, setPositions] = useState(() =>
    colors.map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((pos) => ({
          x: pos.x + (Math.random() - 0.5) * 10,
          y: pos.y + (Math.random() - 0.5) * 10,
        }))
      )
    }, speed * 1000)

    return () => clearInterval(interval)
  }, [speed])

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {colors.map((color, index) => (
        <motion.div
          key={index}
          className="absolute w-[50%] h-[50%] rounded-full"
          style={{
            backgroundColor: color,
            filter: `blur(${blur}px)`,
            opacity: intensity,
          }}
          animate={{
            x: `${positions[index]?.x ?? 0}%`,
            y: `${positions[index]?.y ?? 0}%`,
          }}
          transition={{
            duration: speed,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTROLLED GLOW EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSGlowProps {
  children: ReactNode
  color?: string
  intensity?: 'subtle' | 'medium' | 'strong'
  animated?: boolean
  pulse?: boolean
  className?: string
}

export const iOSGlow = memo(function iOSGlow({
  children,
  color = '#8B5CF6',
  intensity = 'subtle',
  animated = false,
  pulse = false,
  className,
}: iOSGlowProps) {
  const intensityMap = {
    subtle: { blur: 20, opacity: 0.2, spread: 8 },
    medium: { blur: 40, opacity: 0.35, spread: 16 },
    strong: { blur: 60, opacity: 0.5, spread: 24 },
  }

  const { blur, opacity, spread } = intensityMap[intensity]

  return (
    <div className={cn('relative', className)}>
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-inherit"
        style={{
          background: color,
          filter: `blur(${blur}px)`,
          margin: -spread,
        }}
        animate={
          pulse
            ? {
                opacity: [opacity * 0.7, opacity, opacity * 0.7],
                scale: [0.95, 1, 0.95],
              }
            : animated
              ? {
                  opacity: [opacity * 0.8, opacity, opacity * 0.8],
                }
              : { opacity }
        }
        transition={
          pulse || animated
            ? {
                duration: pulse ? 2 : 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      />
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RAINBOW BORDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSRainbowBorderProps {
  children: ReactNode
  animated?: boolean
  speed?: number
  borderWidth?: number
  borderRadius?: number
  className?: string
}

export const iOSRainbowBorder = memo(function iOSRainbowBorder({
  children,
  animated = true,
  speed = 3,
  borderWidth = 2,
  borderRadius = 16,
  className,
}: iOSRainbowBorderProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Rainbow border */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          padding: borderWidth,
          borderRadius: borderRadius,
          background: animated
            ? undefined
            : 'linear-gradient(45deg, #FF0080, #FF8C00, #40E0D0, #8B5CF6, #FF0080)',
          backgroundSize: '400% 400%',
        }}
        animate={
          animated
            ? {
                background: [
                  'linear-gradient(0deg, #FF0080, #FF8C00, #40E0D0, #8B5CF6, #FF0080)',
                  'linear-gradient(90deg, #FF8C00, #40E0D0, #8B5CF6, #FF0080, #FF8C00)',
                  'linear-gradient(180deg, #40E0D0, #8B5CF6, #FF0080, #FF8C00, #40E0D0)',
                  'linear-gradient(270deg, #8B5CF6, #FF0080, #FF8C00, #40E0D0, #8B5CF6)',
                  'linear-gradient(360deg, #FF0080, #FF8C00, #40E0D0, #8B5CF6, #FF0080)',
                ],
              }
            : undefined
        }
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="absolute inset-0 bg-[#1C1C1E]"
          style={{
            margin: borderWidth,
            borderRadius: borderRadius - borderWidth,
          }}
        />
      </motion.div>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIGHT PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export interface iOSParticlesProps {
  count?: number
  color?: string
  minSize?: number
  maxSize?: number
  className?: string
  enabled?: boolean
}

export const iOSParticles = memo(function iOSParticles({
  count = 15,
  color = 'rgba(139, 92, 246, 0.6)',
  minSize = 2,
  maxSize = 6,
  className,
  enabled = true,
}: iOSParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    if (!enabled) return []

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.4,
    }))
  }, [count, minSize, maxSize, enabled])

  if (!enabled) return null

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BLUR TRANSITION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSBlurTransitionProps {
  children: ReactNode
  isVisible: boolean
  className?: string
  duration?: number
  blurAmount?: number
}

export const iOSBlurTransition = memo(function iOSBlurTransition({
  children,
  isVisible,
  className,
  duration = 0.3,
  blurAmount = 10,
}: iOSBlurTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, filter: `blur(${blurAmount}px)` }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: `blur(${blurAmount}px)` }}
          transition={{ duration }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RIPPLE EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export interface iOSRippleProps {
  children: ReactNode
  color?: string
  duration?: number
  className?: string
  disabled?: boolean
}

export const iOSRipple = memo(function iOSRipple({
  children,
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 0.6,
  className,
  disabled = false,
}: iOSRippleProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const addRipple = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      let x: number, y: number

      if ('touches' in event) {
        const touch = event.touches[0]
        if (!touch) return
        x = touch.clientX - rect.left
        y = touch.clientY - rect.top
      } else {
        x = event.clientX - rect.left
        y = event.clientY - rect.top
      }

      const size = Math.max(rect.width, rect.height) * 2

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
        size,
      }

      setRipples((prev) => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, duration * 1000)
    },
    [disabled, duration]
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseDown={addRipple}
      onTouchStart={addRipple}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 1,
            }}
            animate={{
              width: ripple.size,
              height: ripple.size,
              x: ripple.x - ripple.size / 2,
              y: ripple.y - ripple.size / 2,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            className="absolute rounded-full pointer-events-none"
            style={{ backgroundColor: color }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// REVEAL ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
  once?: boolean
}

export const iOSReveal = memo(function iOSReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className,
  once = true,
}: iOSRevealProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          setIsInView(true)
          setHasAnimated(true)
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [once])

  const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  }

  const shouldAnimate = once ? isInView || hasAnimated : isInView

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={
        shouldAnimate
          ? {
              opacity: 1,
              x: 0,
              y: 0,
            }
          : undefined
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STAGGER CHILDREN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSStaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
  initialDelay?: number
  className?: string
}

export const iOSStaggerChildren = memo(function iOSStaggerChildren({
  children,
  staggerDelay = 0.05,
  initialDelay = 0,
  className,
}: iOSStaggerChildrenProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: initialDelay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
})

export const iOSStaggerItem = memo(function iOSStaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GRADIENT TEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSGradientTextProps {
  children: ReactNode
  gradient?: string
  animated?: boolean
  className?: string
}

export const iOSGradientText = memo(function iOSGradientText({
  children,
  gradient = 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
  animated = false,
  className,
}: iOSGradientTextProps) {
  return (
    <motion.span
      className={cn('bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: gradient,
        backgroundSize: animated ? '200% 200%' : '100% 100%',
      }}
      animate={
        animated
          ? {
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }
          : undefined
      }
      transition={
        animated
          ? {
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }
          : undefined
      }
    >
      {children}
    </motion.span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NUMBER COUNTER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export const iOSCounter = memo(function iOSCounter({
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: iOSCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()
    const durationMs = duration * 1000

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / durationMs, 1)

      // Easing function (ease-out-expo)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPING EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface iOSTypingEffectProps {
  text: string
  speed?: number
  delay?: number
  cursor?: boolean
  className?: string
  onComplete?: () => void
}

export const iOSTypingEffect = memo(function iOSTypingEffect({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  className,
  onComplete,
}: iOSTypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    const timeout = setTimeout(() => {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(interval)
          setIsComplete(true)
          onComplete?.()
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, speed, delay, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-current ml-0.5"
        />
      )}
    </span>
  )
})
