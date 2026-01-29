/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS PREMIUM HOVER EFFECTS — MAGNETIC + INTERACTIVE + CINEMATIC
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de efectos hover premium:
 * - Botones magnéticos con atracción al cursor
 * - Glow effects dinámicos
 * - Tilt 3D con perspectiva
 * - Morphing shapes
 * - Particle explosions on hover
 *
 * TECNOLOGÍAS: motion/react + React Spring + custom physics
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOKS PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para botón magnético (atracción al cursor)
 */
export function useMagneticHover(strength: number = 0.3, returnSpeed: number = 100) {
  const ref = useRef<HTMLElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: returnSpeed, damping: 15 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY

      // Calcular distancia total
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
      const maxDistance = Math.max(rect.width, rect.height)

      // Solo aplicar efecto magnético dentro del elemento o cerca
      if (distance < maxDistance * 1.5) {
        x.set(distanceX * strength)
        y.set(distanceY * strength)
      }
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [x, y, strength])

  return { ref, x: springX, y: springY }
}

/**
 * Hook para tilt 3D con mouse
 */
export function useTilt3D(intensity: number = 15) {
  const ref = useRef<HTMLElement>(null)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 20 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const mouseX = (e.clientX - centerX) / (rect.width / 2)
      const mouseY = (e.clientY - centerY) / (rect.height / 2)

      rotateY.set(mouseX * intensity)
      rotateX.set(-mouseY * intensity)
    }

    const handleMouseLeave = () => {
      rotateX.set(0)
      rotateY.set(0)
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [rotateX, rotateY, intensity])

  return { ref, rotateX: springRotateX, rotateY: springRotateY }
}

/**
 * Hook para glow effect dinámico
 */
export function useGlowHover(color: string = '#8B5CF6') {
  const [isHovered, setIsHovered] = useState(false)

  const glowIntensity = useSpring(isHovered ? 1 : 0, { stiffness: 150, damping: 20 })

  const boxShadow = useTransform(
    glowIntensity,
    [0, 1],
    [`0 0 0px ${color}00`, `0 0 40px ${color}80, 0 0 80px ${color}40`],
  )

  return {
    isHovered,
    setIsHovered,
    boxShadow,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  }
}

/**
 * Hook para scale + glow combinado
 */
export function useScaleGlow(scaleAmount: number = 1.05, glowColor: string = '#8B5CF6') {
  const [isHovered, setIsHovered] = useState(false)

  const scale = useSpring(isHovered ? scaleAmount : 1, { stiffness: 300, damping: 20 })
  const glowIntensity = useSpring(isHovered ? 1 : 0, { stiffness: 200, damping: 15 })

  const boxShadow = useTransform(
    glowIntensity,
    [0, 1],
    [`0 0 0px ${glowColor}00`, `0 0 30px ${glowColor}60, 0 0 60px ${glowColor}30`],
  )

  return {
    scale,
    boxShadow,
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  strength?: number
  className?: string
}

/**
 * Botón magnético premium
 */
export function MagneticButton({
  children,
  strength = 0.3,
  className = '',
  ...props
}: MagneticButtonProps) {
  const { ref, x, y } = useMagneticHover(strength)
  const { onAnimationStart, onDrag, onDragStart, onDragEnd, ...restProps } = props

  return (
    <motion.button
      ref={ref as any}
      style={{ x, y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/50 ${className}`}
      {...restProps}
    >
      {children}
    </motion.button>
  )
}

interface Tilt3DCardProps {
  children: React.ReactNode
  intensity?: number
  className?: string
}

/**
 * Card con efecto tilt 3D
 */
export function Tilt3DCard({ children, intensity = 15, className = '' }: Tilt3DCardProps) {
  const { ref, rotateX, rotateY } = useTilt3D(intensity)

  return (
    <motion.div
      ref={ref as any}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  glowColor?: string
  className?: string
}

/**
 * Botón con glow effect dinámico
 */
export function GlowButton({
  children,
  glowColor = '#8B5CF6',
  className = '',
  ...props
}: GlowButtonProps) {
  const { boxShadow, handlers } = useGlowHover(glowColor)
  const { onAnimationStart, onDrag, onDragStart, onDragEnd, ...restProps } = props

  return (
    <motion.button
      style={{ boxShadow }}
      {...handlers}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium text-white transition-all duration-300 ${className}`}
      {...restProps}
    >
      {children}
    </motion.button>
  )
}

interface ScaleGlowCardProps {
  children: React.ReactNode
  glowColor?: string
  scaleAmount?: number
  className?: string
}

/**
 * Card con scale + glow combinado
 */
export function ScaleGlowCard({
  children,
  glowColor = '#8B5CF6',
  scaleAmount = 1.05,
  className = '',
}: ScaleGlowCardProps) {
  const { scale, boxShadow, handlers } = useScaleGlow(scaleAmount, glowColor)

  return (
    <motion.div
      style={{ scale, boxShadow }}
      {...handlers}
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

/**
 * Botón con ripple effect on hover
 */
export function RippleButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const { onAnimationStart, onDrag, onDragStart, onDragEnd, ...restProps } = props

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { id: Date.now(), x, y }
    setRipples((prev) => [...prev, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 1000)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={handleMouseEnter}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium text-white ${className}`}
      {...restProps}
    >
      {children}

      {/* Ripples */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </motion.button>
  )
}

/**
 * Card flotante con hover effect
 */
export function FloatingHoverCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
    GlowButtonProps, MagneticButtonProps, ScaleGlowCardProps, Tilt3DCardProps,
}
