/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌊 CHRONOS ORGANIC ANIMATIONS — REACT SPRING PHYSICS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Animaciones orgánicas premium usando física real de resortes
 * Complementa Motion con animaciones más naturales y fluidas
 *
 * TECNOLOGÍAS: @react-spring/web + @react-spring/three
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useSpring, useSpringValue, useTrail, animated, config } from '@react-spring/web'
import { useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESETS DE CONFIGURACIÓN FÍSICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Configuraciones de resortes personalizadas para diferentes efectos
 */
export const SPRING_CONFIGS = {
  // Ultra suave y elegante
  gentle: { tension: 120, friction: 14 },

  // Efecto de rebote natural
  wobbly: { tension: 180, friction: 12 },

  // Rápido y preciso
  snappy: { tension: 300, friction: 20 },

  // Movimiento lento y dramático
  slow: { tension: 80, friction: 20 },

  // Extremadamente elástico
  bouncy: config.wobbly,

  // Movimiento molasses (muy lento)
  molasses: config.molasses,

  // Default React Spring
  default: config.default,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOKS PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para hover con física de resorte
 */
export function useHoverSpring(initialScale = 1, hoverScale = 1.05) {
  const [isHovered, setIsHovered] = useState(false)

  const spring = useSpring({
    scale: isHovered ? hoverScale : initialScale,
    config: SPRING_CONFIGS.snappy,
  })

  const handlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }

  return { spring, handlers, isHovered }
}

/**
 * Hook para contador animado con física
 */
export function useCountUpSpring(end: number, duration: number = 2000) {
  const [value, setValue] = useState(0)

  const spring = useSpring({
    from: { number: 0 },
    to: { number: end },
    config: { duration },
  })

  return spring
}

/**
 * Hook para parallax 3D con mouse
 */
export function useParallax3DSpring(intensity: number = 10) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const spring = useSpring({
    transform: `
      perspective(1000px)
      rotateX(${mousePosition.y * intensity}deg)
      rotateY(${mousePosition.x * intensity}deg)
    `,
    config: SPRING_CONFIGS.gentle,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return spring
}

/**
 * Hook para efectos de entrada escalonada (stagger)
 */
export function useStaggeredEntranceSpring<T>(
  items: T[],
  config: typeof SPRING_CONFIGS[keyof typeof SPRING_CONFIGS] = SPRING_CONFIGS.gentle,
) {
  const trail = useTrail(items.length, {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config,
  })

  return trail
}

/**
 * Hook para efectos de carga con rebote
 */
export function useLoadingSpring(isLoading: boolean) {
  const spring = useSpring({
    scale: isLoading ? [1, 1.2, 1] : 1,
    rotate: isLoading ? 360 : 0,
    loop: isLoading,
    config: SPRING_CONFIGS.bouncy,
  })

  return spring
}

/**
 * Hook para botón magnético (atracción al cursor)
 */
export function useMagneticSpring(elementRef: React.RefObject<HTMLElement>, strength: number = 0.3) {
  const x = useSpringValue(0, { config: SPRING_CONFIGS.gentle })
  const y = useSpringValue(0, { config: SPRING_CONFIGS.gentle })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distanceX = (e.clientX - centerX) * strength
      const distanceY = (e.clientY - centerY) * strength

      x.set(distanceX)
      y.set(distanceY)
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
  }, [elementRef, x, y, strength])

  return { x, y }
}

/**
 * Hook para efecto de respiración (breathing)
 */
export function useBreathingSpring(minScale = 0.98, maxScale = 1.02, duration = 3000) {
  const spring = useSpring({
    from: { scale: minScale },
    to: { scale: maxScale },
    loop: { reverse: true },
    config: { duration },
  })

  return spring
}

/**
 * Hook para efecto de líquido (liquid morph)
 */
export function useLiquidMorphSpring() {
  const [isActive, setIsActive] = useState(false)

  const spring = useSpring({
    borderRadius: isActive ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '50%',
    transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
    config: SPRING_CONFIGS.wobbly,
  })

  const toggle = () => setIsActive(!isActive)

  return { spring, toggle, isActive }
}

/**
 * Hook para efecto de ondulación (ripple)
 */
export function useRippleSpring(triggerCount: number) {
  const springs = useSpring({
    from: { scale: 0, opacity: 1 },
    to: { scale: 2, opacity: 0 },
    reset: triggerCount > 0,
    config: SPRING_CONFIGS.gentle,
  })

  return springs
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES PREMIUM LISTOS PARA USAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrganicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

/**
 * Botón con animaciones orgánicas premium
 */
export function OrganicButton({ children, variant = 'primary', ...props }: OrganicButtonProps) {
  const { spring, handlers } = useHoverSpring(1, 1.05)

  const variantClasses = {
    primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
    secondary: 'bg-white/10 text-white border border-white/20',
    ghost: 'bg-transparent text-white hover:bg-white/10',
  }

  return (
    <animated.button
      {...props}
      {...handlers}
      style={{
        ...spring,
        transition: 'all 0.3s ease',
      }}
      className={`rounded-xl px-6 py-3 font-medium ${variantClasses[variant]}`}
    >
      {children}
    </animated.button>
  )
}

interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

/**
 * Card flotante con parallax 3D
 */
export function FloatingCard({ children, className = '', intensity = 5 }: FloatingCardProps) {
  const spring = useParallax3DSpring(intensity)

  return (
    <animated.div style={spring} className={`rounded-2xl backdrop-blur-xl ${className}`}>
      {children}
    </animated.div>
  )
}

interface PulsingOrbProps {
  size?: number
  color?: string
}

/**
 * Orbe pulsante con efecto de respiración
 */
export function PulsingOrb({ size = 100, color = '#8B5CF6' }: PulsingOrbProps) {
  const spring = useBreathingSpring()

  return (
    <animated.div
      style={{
        ...spring,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}, transparent)`,
        boxShadow: `0 0 ${size}px ${color}80`,
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { animated, useSpring, useTrail, config }
export type { OrganicButtonProps, FloatingCardProps, PulsingOrbProps }
