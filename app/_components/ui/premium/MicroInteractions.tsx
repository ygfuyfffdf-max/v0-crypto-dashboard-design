'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ PREMIUM MICRO-INTERACTIONS SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema avanzado de micro-interacciones premium incluyendo:
 * - Magnetic Button con campo de atracción
 * - Morphing Cards con transiciones fluidas
 * - Liquid Buttons con efecto de fluido
 * - Holographic Shine con reflexiones dinámicas
 * - Particle Burst en clics
 * - Ripple Effects avanzados
 * - Elastic Bounce animations
 * - Glow Pulse sincronizado
 * - Parallax Hover 3D
 * - Text Reveal cinematográfico
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { forwardRef, ReactNode, useCallback, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PREMIUM COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PREMIUM_COLORS = {
  aurora: {
    violet: { base: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.6)', soft: 'rgba(139, 92, 246, 0.15)' },
    cyan: { base: '#06B6D4', glow: 'rgba(6, 182, 212, 0.6)', soft: 'rgba(6, 182, 212, 0.15)' },
    magenta: { base: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)', soft: 'rgba(236, 72, 153, 0.15)' },
    emerald: { base: '#10B981', glow: 'rgba(16, 185, 129, 0.6)', soft: 'rgba(16, 185, 129, 0.15)' },
    gold: { base: '#FBBF24', glow: 'rgba(251, 191, 36, 0.6)', soft: 'rgba(251, 191, 36, 0.15)' },
    rose: { base: '#F43F5E', glow: 'rgba(244, 63, 94, 0.6)', soft: 'rgba(244, 63, 94, 0.15)' },
  },
  glass: {
    surface: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    shine: 'rgba(255, 255, 255, 0.12)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧲 MAGNETIC BUTTON — Botón con campo magnético de atracción
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  radius?: number
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow'
  color?: keyof typeof PREMIUM_COLORS.aurora
  size?: 'sm' | 'md' | 'lg'
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      children,
      className,
      strength = 0.35,
      radius = 150,
      onClick,
      disabled = false,
      variant = 'primary',
      color = 'violet',
      size = 'md',
    },
    _ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
    const springX = useSpring(x, springConfig)
    const springY = useSpring(y, springConfig)

    const colorPalette = PREMIUM_COLORS.aurora[color]

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || !buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

        if (distance < radius) {
          const factor = 1 - distance / radius
          x.set(distanceX * strength * factor)
          y.set(distanceY * strength * factor)
        }
      },
      [disabled, radius, strength, x, y],
    )

    const handleMouseLeave = useCallback(() => {
      x.set(0)
      y.set(0)
      setIsHovered(false)
    }, [x, y])

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return

        // Crear explosión de partículas
        const rect = buttonRef.current?.getBoundingClientRect()
        if (rect) {
          const newParticles = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          }))
          setParticles(newParticles)
          setTimeout(() => setParticles([]), 600)
        }

        onClick?.()
      },
      [disabled, onClick],
    )

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    const variantStyles = {
      primary: {
        background: `linear-gradient(135deg, ${colorPalette.base}, ${colorPalette.glow})`,
        boxShadow: isHovered ? `0 0 40px ${colorPalette.glow}` : `0 0 20px ${colorPalette.soft}`,
      },
      secondary: {
        background: PREMIUM_COLORS.glass.surface,
        border: `1px solid ${colorPalette.soft}`,
        boxShadow: isHovered ? `0 0 30px ${colorPalette.soft}` : 'none',
      },
      ghost: {
        background: 'transparent',
        boxShadow: isHovered ? `0 0 20px ${colorPalette.soft}` : 'none',
      },
      glow: {
        background: 'transparent',
        border: `2px solid ${colorPalette.base}`,
        boxShadow: `0 0 30px ${colorPalette.glow}, inset 0 0 20px ${colorPalette.soft}`,
      },
    }

    return (
      <motion.button
        ref={buttonRef}
        className={cn(
          'relative overflow-hidden rounded-xl font-medium text-white',
          'backdrop-blur-xl transition-all duration-300',
          sizeStyles[size],
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        style={{
          x: springX,
          y: springY,
          ...variantStyles[variant],
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        disabled={disabled}
      >
        {/* Shimmer Effect */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${PREMIUM_COLORS.glass.shine}, transparent)`,
            transform: 'translateX(-100%)',
          }}
          animate={isHovered ? { transform: 'translateX(100%)' } : {}}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Particle Burst */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="pointer-events-none absolute h-2 w-2 rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                background: colorPalette.base,
                boxShadow: `0 0 10px ${colorPalette.glow}`,
              }}
              initial={{ scale: 1, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                scale: 0,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </motion.button>
    )
  },
)

MagneticButton.displayName = 'MagneticButton'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID BUTTON — Botón con efecto líquido/fluido
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  color?: keyof typeof PREMIUM_COLORS.aurora
  disabled?: boolean
}

export function LiquidButton({
  children,
  className,
  onClick,
  color = 'violet',
  disabled = false,
}: LiquidButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const colorPalette = PREMIUM_COLORS.aurora[color]

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const newRipple = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
      setRipples((prev) => [...prev, newRipple])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 1000)
    }

    onClick?.()
  }

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden rounded-2xl px-8 py-4 font-semibold text-white',
        'border border-white/10 backdrop-blur-xl',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${colorPalette.soft}, transparent)`,
      }}
      onClick={handleClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
    >
      {/* SVG Liquid Filter */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ filter: 'url(#liquid)' }}
      >
        <defs>
          <filter id="liquid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="liquid"
            />
          </filter>
        </defs>
      </svg>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              background: `radial-gradient(circle, ${colorPalette.glow} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 HOLOGRAPHIC CARD — Tarjeta con efecto holográfico premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HolographicCardProps {
  children: ReactNode
  className?: string
  intensity?: number
  enableTilt?: boolean
  onClick?: () => void
}

export function HolographicCard({
  children,
  className,
  intensity = 1,
  enableTilt = true,
  onClick,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 300, damping: 20 }
  const smoothRotateX = useSpring(rotateX, springConfig)
  const smoothRotateY = useSpring(rotateY, springConfig)

  // Transformaciones holográficas
  const holoGradient = useTransform(
    [mouseX, mouseY],
    ([x, _y]) =>
      `linear-gradient(
        ${135 + (x as number) * 0.5}deg,
        rgba(139, 92, 246, ${0.1 * intensity}) 0%,
        rgba(6, 182, 212, ${0.15 * intensity}) 25%,
        rgba(236, 72, 153, ${0.1 * intensity}) 50%,
        rgba(16, 185, 129, ${0.12 * intensity}) 75%,
        rgba(251, 191, 36, ${0.1 * intensity}) 100%
      )`,
  )

  const shineX = useTransform(mouseX, [0, 100], [0, 100])
  const shineY = useTransform(mouseY, [0, 100], [0, 100])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current || !enableTilt) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      mouseX.set(x)
      mouseY.set(y)

      const centerX = (e.clientX - rect.left) / rect.width - 0.5
      const centerY = (e.clientY - rect.top) / rect.height - 0.5

      rotateX.set(centerY * -15 * intensity)
      rotateY.set(centerX * 15 * intensity)
    },
    [enableTilt, intensity, mouseX, mouseY, rotateX, rotateY],
  )

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    setIsHovered(false)
  }, [rotateX, rotateY])

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl backdrop-blur-xl',
        'cursor-pointer border border-white/10',
        className,
      )}
      style={{
        background: PREMIUM_COLORS.glass.surface,
        rotateX: enableTilt ? smoothRotateX : 0,
        rotateY: enableTilt ? smoothRotateY : 0,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Holographic Gradient Overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: holoGradient, opacity: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine Reflection */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: useTransform(
            [shineX, shineY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`,
          ),
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Rainbow Border Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(45deg,
            rgba(139, 92, 246, 0.5),
            rgba(6, 182, 212, 0.5),
            rgba(236, 72, 153, 0.5),
            rgba(16, 185, 129, 0.5),
            rgba(139, 92, 246, 0.5)
          )`,
          backgroundSize: '400% 400%',
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ GLOW PULSE — Efecto de pulso brillante sincronizado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlowPulseProps {
  children: ReactNode
  className?: string
  color?: keyof typeof PREMIUM_COLORS.aurora
  intensity?: 'low' | 'medium' | 'high'
  speed?: 'slow' | 'normal' | 'fast'
  sync?: boolean
}

export function GlowPulse({
  children,
  className,
  color = 'violet',
  intensity = 'medium',
  speed = 'normal',
  sync = false,
}: GlowPulseProps) {
  const colorPalette = PREMIUM_COLORS.aurora[color]

  const intensityMap = {
    low: { blur: 15, spread: 10, opacity: 0.3 },
    medium: { blur: 25, spread: 20, opacity: 0.5 },
    high: { blur: 40, spread: 30, opacity: 0.7 },
  }

  const speedMap = {
    slow: 3,
    normal: 2,
    fast: 1,
  }

  const config = intensityMap[intensity]
  const duration = speedMap[speed]

  return (
    <motion.div className={cn('relative', className)}>
      {/* Glow Layer */}
      <motion.div
        className="rounded-inherit pointer-events-none absolute inset-0"
        style={{
          boxShadow: `0 0 ${config.blur}px ${config.spread}px ${colorPalette.glow}`,
        }}
        animate={
          sync
            ? { opacity: [config.opacity, config.opacity * 0.3, config.opacity] }
            : { opacity: [config.opacity * 0.5, config.opacity, config.opacity * 0.5] }
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 TEXT REVEAL — Revelación de texto cinematográfica
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  variant?: 'fade' | 'slide' | 'blur' | 'typewriter' | 'wave'
  color?: keyof typeof PREMIUM_COLORS.aurora
}

export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  variant = 'fade',
  color = 'violet',
}: TextRevealProps) {
  const words = text.split(' ')
  const colorPalette = PREMIUM_COLORS.aurora[color]

  const variantConfigs = {
    fade: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    slide: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(10px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
    },
    typewriter: {
      initial: { opacity: 0, width: 0 },
      animate: { opacity: 1, width: 'auto' },
    },
    wave: {
      initial: { opacity: 0, y: 50, rotateX: -90 },
      animate: { opacity: 1, y: 0, rotateX: 0 },
    },
  }

  const config = variantConfigs[variant]

  return (
    <motion.div
      className={cn('flex flex-wrap gap-x-2', className)}
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={config}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textShadow: variant === 'wave' ? `0 0 20px ${colorPalette.glow}` : undefined,
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 PARALLAX CONTAINER — Contenedor con efecto parallax 3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParallaxContainerProps {
  children: ReactNode
  className?: string
  depth?: number
  perspective?: number
}

export function ParallaxContainer({
  children,
  className,
  depth = 50,
  perspective = 1000,
}: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height

      setMousePosition({ x: x * depth, y: y * depth })
    },
    [depth],
  )

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 })
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ perspective }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateY: mousePosition.x * 0.5,
          rotateX: -mousePosition.y * 0.5,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 FLOATING ELEMENT — Elemento flotante con animación orgánica
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FloatingElementProps {
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
  delay?: number
}

export function FloatingElement({
  children,
  className,
  amplitude = 10,
  duration = 4,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 STAGGERED LIST — Lista con animación escalonada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggeredListProps {
  children: ReactNode[]
  className?: string
  stagger?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function StaggeredList({
  children,
  className,
  stagger = 0.1,
  direction = 'up',
}: StaggeredListProps) {
  const directionMap = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  }

  const offset = directionMap[direction]

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, ...offset },
            visible: {
              opacity: 1,
              y: 0,
              x: 0,
              transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎪 MORPHING SHAPE — Forma que se transforma orgánicamente
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MorphingShapeProps {
  className?: string
  color?: keyof typeof PREMIUM_COLORS.aurora
  size?: number
}

export function MorphingShape({ className, color = 'violet', size = 200 }: MorphingShapeProps) {
  const colorPalette = PREMIUM_COLORS.aurora[color]

  const paths = [
    'M50 0 C80 20 100 50 80 80 C60 100 20 80 10 50 C0 20 20 0 50 0',
    'M50 10 C70 0 100 30 90 60 C80 90 40 100 20 70 C0 40 30 20 50 10',
    'M40 5 C75 10 95 40 85 75 C75 95 35 90 15 65 C5 30 20 0 40 5',
    'M50 0 C80 20 100 50 80 80 C60 100 20 80 10 50 C0 20 20 0 50 0',
  ]

  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ filter: `drop-shadow(0 0 20px ${colorPalette.glow})` }}
    >
      <motion.path
        fill={colorPalette.soft}
        stroke={colorPalette.base}
        strokeWidth="0.5"
        animate={{ d: paths }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.svg>
  )
}

export default {
  MagneticButton,
  LiquidButton,
  HolographicCard,
  GlowPulse,
  TextReveal,
  ParallaxContainer,
  FloatingElement,
  StaggeredList,
  MorphingShape,
}
