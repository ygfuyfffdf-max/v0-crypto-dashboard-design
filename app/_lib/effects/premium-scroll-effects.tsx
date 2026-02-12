/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌟 CHRONOS PREMIUM SCROLL EFFECTS — 3D PARALLAX + MOTION SCROLL
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Efectos de scroll premium con Motion + parallax 3D + scroll-triggered animations
 * Transformaciones cinematográficas durante el scroll
 *
 * TECNOLOGÍA: motion/react (useScroll, useTransform, useMotionValue)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOKS DE SCROLL PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para parallax smooth con scroll
 */
export function useParallaxScroll(speed: number = 0.5) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return { ref, y: smoothY, scrollYProgress }
}

/**
 * Hook para fade-in durante scroll
 */
export function useFadeInScroll() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])

  return { ref, opacity, scale }
}

/**
 * Hook para rotación 3D durante scroll (intensidad reducida para mejor UX)
 */
export function useRotate3DScroll() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Intensidad reducida de 15 a 5 grados para efecto más sutil
  const rotateX = useTransform(scrollYProgress, [0, 1], [5, -5])
  const rotateY = useTransform(scrollYProgress, [0, 1], [-5, 5])

  return { ref, rotateX, rotateY }
}

/**
 * Hook para efecto de sticky con scale
 */
export function useStickyScale() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return { ref, scale, opacity }
}

/**
 * Hook para efecto de zoom-in mientras scrolleas (intensidad reducida)
 */
export function useZoomInScroll() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })

  // Escala inicial más alta (0.85 vs 0.5) para efecto más sutil
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1])
  const blur = useTransform(scrollYProgress, [0, 1], [3, 0])

  return { ref, scale, blur }
}

/**
 * Hook para progress bar global de scroll
 */
export function useScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return { scrollYProgress, scaleX }
}

/**
 * Hook para reveal sections con threshold
 */
export function useRevealScroll(threshold: number = 0.5) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, threshold, 1], [0, 1, 1])
  const y = useTransform(scrollYProgress, [0, threshold, 1], [100, 0, 0])

  return { ref, opacity, y }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES PREMIUM LISTOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParallaxSectionProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

/**
 * Sección con efecto parallax automático
 */
export function ParallaxSection({ children, speed = 0.5, className = '' }: ParallaxSectionProps) {
  const { ref, y } = useParallaxScroll(speed)

  return (
    <motion.section ref={ref as any} style={{ y }} className={className}>
      {children}
    </motion.section>
  )
}

interface FadeInSectionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Sección que aparece con fade-in al scrollear
 */
export function FadeInSection({ children, className = '' }: FadeInSectionProps) {
  const { ref, opacity, scale } = useFadeInScroll()

  return (
    <motion.section ref={ref as any} style={{ opacity, scale }} className={className}>
      {children}
    </motion.section>
  )
}

interface Rotate3DSectionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Sección con rotación 3D durante scroll
 */
export function Rotate3DSection({ children, className = '' }: Rotate3DSectionProps) {
  const { ref, rotateX, rotateY } = useRotate3DScroll()

  return (
    <motion.section
      ref={ref as any}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/**
 * Progress bar global de scroll
 */
export function ScrollProgressBar() {
  const { scaleX } = useScrollProgress()

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
    />
  )
}

interface ZoomInCardProps {
  children: React.ReactNode
  className?: string
}

/**
 * Card que hace zoom-in al scrollear
 */
export function ZoomInCard({ children, className = '' }: ZoomInCardProps) {
  const { ref, scale, blur } = useZoomInScroll()

  return (
    <motion.div
      ref={ref as any}
      style={{
        scale,
        filter: `blur(${blur}px)`,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface RevealSectionProps {
  children: React.ReactNode
  threshold?: number
  className?: string
}

/**
 * Sección que se revela al alcanzar threshold
 */
export function RevealSection({
  children,
  threshold = 0.5,
  className = '',
}: RevealSectionProps) {
  const { ref, opacity, y } = useRevealScroll(threshold)

  return (
    <motion.section ref={ref as any} style={{ opacity, y }} className={className}>
      {children}
    </motion.section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EFECTOS AVANZADOS CON MOUSE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para parallax 3D con movimiento del mouse
 * @param intensity - Intensidad del efecto (default: 5 - reducido)
 * @param enabled - Habilitado o no (default: false - DESHABILITADO para mejor UX)
 * NOTA: Deshabilitado por defecto para evitar tracking tedioso con cursor
 */
export function useMouseParallax3D(intensity: number = 5, enabled: boolean = false) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-0.5, 0.5], enabled ? [intensity, -intensity] : [0, 0])
  const rotateY = useTransform(x, [-0.5, 0.5], enabled ? [-intensity, intensity] : [0, 0])

  useEffect(() => {
    if (!enabled) return // No activar tracking si está deshabilitado
    
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { innerWidth, innerHeight } = window

      x.set((clientX / innerWidth - 0.5) * 2)
      y.set((clientY / innerHeight - 0.5) * 2)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y, enabled])

  return { rotateX, rotateY }
}

interface MouseParallax3DCardProps {
  children: React.ReactNode
  intensity?: number
  enabled?: boolean
  className?: string
}

/**
 * Card con parallax 3D controlado por mouse
 * @param enabled - Deshabilitado por defecto para evitar tracking tedioso
 */
export function MouseParallax3DCard({
  children,
  intensity = 5,
  enabled = false,
  className = '',
}: MouseParallax3DCardProps) {
  const { rotateX, rotateY } = useMouseParallax3D(intensity, enabled)

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type MotionValue,
}
