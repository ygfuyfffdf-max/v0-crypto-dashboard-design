/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡✨ MICRO INTERACTIONS PREMIUM 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de micro-interacciones ultra premium:
 * ✅ Botones magnéticos con seguimiento de cursor
 * ✅ Ripple effects personalizados
 * ✅ Hover con blur y glow
 * ✅ Click feedback con spring physics
 * ✅ Tooltips animados
 * ✅ Focus rings cinematográficos
 * ✅ Loading states elegantes
 * ✅ Success/Error animations
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, type Variants } from 'motion/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧲 MAGNETIC BUTTON — SEGUIMIENTO DE CURSOR PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface MagneticProps {
  children: React.ReactNode
  strength?: number
  radius?: number
  className?: string
  disabled?: boolean
}

export function Magnetic({
  children,
  strength = 0.35,
  radius = 200,
  className,
  disabled = false,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 200, damping: 20, mass: 0.5 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

      if (distance < radius) {
        const factor = 1 - distance / radius
        x.set(distanceX * strength * factor)
        y.set(distanceY * strength * factor)
      } else {
        x.set(0)
        y.set(0)
      }
    },
    [disabled, radius, strength, x, y],
  )

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn('relative inline-block', className)}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 RIPPLE EFFECT — MATERIAL DESIGN PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export interface RippleContainerProps {
  children: React.ReactNode
  color?: string
  duration?: number
  disabled?: boolean
  className?: string
}

export function RippleContainer({
  children,
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  disabled = false,
  className,
}: RippleContainerProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const addRipple = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
        size,
      }

      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, duration)
    },
    [disabled, duration],
  )

  return (
    <div
      ref={containerRef}
      onMouseDown={addRipple}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              backgroundColor: color,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ GLOW HOVER — EFECTO DE BRILLO EN HOVER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface GlowHoverProps {
  children: React.ReactNode
  glowColor?: string
  glowSize?: number
  glowOpacity?: number
  className?: string
}

export function GlowHover({
  children,
  glowColor = 'rgba(139, 92, 246, 0.5)',
  glowSize = 100,
  glowOpacity = 0.6,
  className,
}: GlowHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY],
  )

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('relative', className)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: glowOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: `radial-gradient(${glowSize}px circle at var(--mouse-x) var(--mouse-y), ${glowColor}, transparent 80%)`,
              // @ts-expect-error - CSS custom properties
              '--mouse-x': mouseX,
              '--mouse-y': mouseY,
            }}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 SPOTLIGHT CARD — EFECTO SPOTLIGHT INTERACTIVO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(139, 92, 246, 0.15)',
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />

      {/* Border glow effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: opacity * 0.5,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.3), transparent 40%)`,
          mask: 'linear-gradient(black, black) padding-box, linear-gradient(black, black)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />

      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💬 ANIMATED TOOLTIP — TOOLTIP CON ANIMACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface AnimatedTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
}

export function AnimatedTooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className,
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const positionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const variants: Record<TooltipPosition, Variants> = {
    top: {
      hidden: { opacity: 0, y: 5, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    bottom: {
      hidden: { opacity: 0, y: -5, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    left: {
      hidden: { opacity: 0, x: 5, scale: 0.95 },
      visible: { opacity: 1, x: 0, scale: 1 },
    },
    right: {
      hidden: { opacity: 0, x: -5, scale: 0.95 },
      visible: { opacity: 1, x: 0, scale: 1 },
    },
  }

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants[position]}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 rounded-lg px-3 py-1.5 text-sm',
              'border border-white/10 bg-gray-900/95 backdrop-blur-xl',
              'whitespace-nowrap text-white shadow-xl',
              positionClasses[position],
            )}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute h-2 w-2 rotate-45 border border-white/10 bg-gray-900/95',
                position === 'top' &&
                  'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0',
                position === 'bottom' &&
                  'top-[-5px] left-1/2 -translate-x-1/2 border-r-0 border-b-0',
                position === 'left' &&
                  'top-1/2 right-[-5px] -translate-y-1/2 border-b-0 border-l-0',
                position === 'right' && 'top-1/2 left-[-5px] -translate-y-1/2 border-t-0 border-r-0',
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 LOADING SPINNER — SPINNERS PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'ring' | 'orbit'
  color?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  color = '#8B5CF6',
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  }

  const s = sizes[size]

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            style={{
              width: s / 4,
              height: s / 4,
              backgroundColor: color,
              borderRadius: '50%',
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('relative', className)} style={{ width: s, height: s }}>
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: color,
            borderRadius: '50%',
          }}
        />
      </div>
    )
  }

  if (variant === 'orbit') {
    return (
      <div className={cn('relative', className)} style={{ width: s, height: s }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '100%', height: '100%' }}
        >
          <div
            style={{
              position: 'absolute',
              width: s / 4,
              height: s / 4,
              backgroundColor: color,
              borderRadius: '50%',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </motion.div>
        <div
          style={{
            position: 'absolute',
            inset: s / 4,
            borderRadius: '50%',
            border: `2px solid ${color}20`,
          }}
        />
      </div>
    )
  }

  if (variant === 'ring') {
    return (
      <motion.svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="12" cy="12" r="10" stroke={`${color}30`} strokeWidth="3" fill="none" />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
        />
      </motion.svg>
    )
  }

  // Default spinner
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="12" cy="12" r="10" stroke={`${color}20`} strokeWidth="3" fill="none" />
      <path
        d="M12 2C6.48 2 2 6.48 2 12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✅ SUCCESS ANIMATION — ANIMACIÓN DE ÉXITO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SuccessAnimationProps {
  size?: number
  color?: string
  strokeWidth?: number
  duration?: number
  className?: string
}

export function SuccessAnimation({
  size = 64,
  color = '#10B981',
  strokeWidth = 3,
  duration = 0.5,
  className,
}: SuccessAnimationProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      {/* Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: duration * 0.6, ease: 'easeOut' }}
      />

      {/* Checkmark */}
      <motion.path
        d="M20 32 L28 40 L44 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: duration * 0.4, delay: duration * 0.5, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ❌ ERROR ANIMATION — ANIMACIÓN DE ERROR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ErrorAnimationProps {
  size?: number
  color?: string
  strokeWidth?: number
  duration?: number
  className?: string
}

export function ErrorAnimation({
  size = 64,
  color = '#EF4444',
  strokeWidth = 3,
  duration = 0.5,
  className,
}: ErrorAnimationProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Circle */}
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: duration * 0.6, ease: 'easeOut' }}
      />

      {/* X mark */}
      <motion.path
        d="M22 22 L42 42 M42 22 L22 42"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: duration * 0.4, delay: duration * 0.5, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔢 ANIMATED COUNTER — CONTADOR ANIMADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = Date.now()
    const durationMs = duration * 1000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)

      // Easing function (ease-out-expo)
      const eased = 1 - Math.pow(2, -10 * progress)
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
      {displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      {suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📐 TILT CARD — CARD CON EFECTO TILT 3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface TiltCardProps {
  children: React.ReactNode
  maxTilt?: number
  scale?: number
  perspective?: number
  glare?: boolean
  glareMaxOpacity?: number
  className?: string
}

export function TiltCard({
  children,
  maxTilt = 15,
  scale = 1.02,
  perspective = 1000,
  glare = true,
  glareMaxOpacity = 0.2,
  className,
}: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const springConfig = { stiffness: 300, damping: 30 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const mouseX = e.clientX - centerX
      const mouseY = e.clientY - centerY

      const percentX = mouseX / (rect.width / 2)
      const percentY = mouseY / (rect.height / 2)

      rotateY.set(percentX * maxTilt)
      rotateX.set(-percentY * maxTilt)

      // Glare position
      const glareXPercent = ((e.clientX - rect.left) / rect.width) * 100
      const glareYPercent = ((e.clientY - rect.top) / rect.height) * 100
      glareX.set(glareXPercent)
      glareY.set(glareYPercent)
    },
    [maxTilt, rotateX, rotateY, glareX, glareY],
  )

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative', className)}
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: isHovered ? scale : 1,
          transformStyle: 'preserve-3d',
        }}
        transition={{ scale: { duration: 0.2 } }}
        className="relative h-full w-full"
      >
        {children}

        {/* Glare overlay */}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{
              background: `radial-gradient(
                farthest-corner circle at ${glareX}% ${glareY}%,
                rgba(255, 255, 255, ${glareMaxOpacity}),
                transparent 80%
              )`,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ opacity: { duration: 0.2 } }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 HOVER LIFT — EFECTO HOVER CON ELEVACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface HoverLiftProps {
  children: React.ReactNode
  lift?: number
  shadow?: boolean
  className?: string
}

export function HoverLift({ children, lift = 8, shadow = true, className }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{
        y: -lift,
        boxShadow: shadow
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(139, 92, 246, 0.15)'
          : undefined,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 STAGGER LIST — LISTA CON ANIMACIÓN ESCALONADA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface StaggerListProps {
  children: React.ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
}

export function StaggerList({
  children,
  delay = 0,
  staggerDelay = 0.05,
  className,
}: StaggerListProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Types
  type TooltipPosition,
}
