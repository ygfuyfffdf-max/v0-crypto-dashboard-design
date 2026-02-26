/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS INFINITY 2030 — SISTEMA DE ANIMACIONES ULTRA-FLUIDAS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de animaciones optimizadas con:
 * - Presets de spring animations para diferentes casos de uso
 * - Transiciones GPU-aceleradas
 * - Respeto automático de prefers-reduced-motion
 * - Orchestración de animaciones complejas
 * - Hooks optimizados para React
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { MotionProps, Transition, Variants, useReducedMotion } from 'motion/react'
import { useCallback, useMemo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

type SpringConfig = {
  type: 'spring'
  stiffness: number
  damping: number
  mass?: number
  velocity?: number
}

type TweenConfig = {
  type: 'tween'
  duration: number
  ease: string | number[]
}

export type AnimationConfig = SpringConfig | TweenConfig

export type AnimationPreset =
  | 'snappy'      // Respuesta rápida y precisa
  | 'smooth'      // Transición suave y elegante
  | 'bouncy'      // Efecto rebote
  | 'gentle'      // Muy suave, premium
  | 'instant'     // Casi instantáneo
  | 'slow'        // Animación lenta y dramática
  | 'elastic'     // Efecto elástico
  | 'stiff'       // Rígido, para UI precisa

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRESETS DE SPRING OPTIMIZADOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const springPresets: Record<AnimationPreset, SpringConfig> = {
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  smooth: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 1,
  },
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 15,
    mass: 1,
  },
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 20,
    mass: 1,
  },
  instant: {
    type: 'spring',
    stiffness: 700,
    damping: 40,
    mass: 0.5,
  },
  slow: {
    type: 'spring',
    stiffness: 80,
    damping: 15,
    mass: 1.5,
  },
  elastic: {
    type: 'spring',
    stiffness: 250,
    damping: 10,
    mass: 0.8,
  },
  stiff: {
    type: 'spring',
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRESETS DE TWEEN (EASING)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const easingPresets = {
  // Standard easings
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],

  // Premium Apple-style easings
  appleDefault: [0.25, 0.1, 0.25, 1],
  appleAccelerate: [0.4, 0, 1, 1],
  appleDecelerate: [0, 0, 0.2, 1],

  // Dramatic easings
  dramatic: [0.6, 0.01, 0.05, 0.95],
  snappy: [0.16, 1, 0.3, 1],

  // Bounce approximations
  bounceOut: [0.34, 1.56, 0.64, 1],

  // Linear
  linear: [0, 0, 1, 1],
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTS PRE-CONFIGURADOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
}

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
}

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springPresets.bouncy,
  },
  exit: { opacity: 0, scale: 0.9 },
}

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springPresets.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 5,
    transition: { duration: 0.15 },
  },
}

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
}

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPresets.smooth,
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: springPresets.snappy,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTS PARA STAGGER (LISTAS)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const containerVariants = (staggerChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: staggerChildren / 2,
      staggerDirection: -1,
    },
  },
})

export const gridContainerVariants = (columns = 3): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
})

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES DE TRANSICIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea una transición con delay
 */
export function withDelay(transition: Transition, delay: number): Transition {
  return {
    ...transition,
    delay,
  }
}

/**
 * Crea una transición para propiedades específicas
 */
export function forProperties(
  properties: string[],
  transition: Transition
): Transition {
  const result: Record<string, Transition> = {}
  properties.forEach(prop => {
    result[prop] = transition
  })
  return result
}

/**
 * Combina múltiples transiciones
 */
export function combineTransitions(
  ...transitions: Transition[]
): Transition {
  return transitions.reduce((acc, t) => ({ ...acc, ...t }), {})
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOKS DE ANIMACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook que devuelve animaciones adaptadas según preferencias del usuario
 */
export function useAccessibleAnimation(
  preset: AnimationPreset = 'smooth'
): AnimationConfig | { duration: number } {
  const prefersReducedMotion = useReducedMotion()

  return useMemo(() => {
    if (prefersReducedMotion) {
      return { duration: 0.01 } // Casi instantáneo
    }
    return springPresets[preset]
  }, [prefersReducedMotion, preset])
}

/**
 * Hook para obtener variants con respeto a motion preferences
 */
export function useAccessibleVariants<T extends Variants>(
  variants: T,
  reducedVariants?: T
): T {
  const prefersReducedMotion = useReducedMotion()

  return useMemo(() => {
    if (prefersReducedMotion) {
      // Retornar variants simplificados si se proporcionan
      if (reducedVariants) return reducedVariants

      // O simplificar automáticamente
      const simplified: Variants = {}
      for (const key in variants) {
        const variant = variants[key]
        if (typeof variant === 'object' && variant !== null) {
          simplified[key] = {
            ...variant,
            transition: { duration: 0.01 },
          }
        } else if (variant !== undefined) {
          simplified[key] = variant
        }
      }
      return simplified as T
    }
    return variants
  }, [prefersReducedMotion, variants, reducedVariants])
}

/**
 * Hook para crear animaciones de hover con feedback táctil
 */
export function useHoverAnimation(
  scale = 1.02,
  y = -4,
  preset: AnimationPreset = 'snappy'
) {
  const prefersReducedMotion = useReducedMotion()

  const hoverProps = useMemo((): Partial<MotionProps> => {
    if (prefersReducedMotion) {
      return {
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 },
        transition: { duration: 0.1 },
      }
    }

    return {
      whileHover: {
        scale,
        y,
        transition: springPresets[preset],
      },
      whileTap: {
        scale: 0.98,
        transition: { duration: 0.1 },
      },
    }
  }, [prefersReducedMotion, scale, y, preset])

  return hoverProps
}

/**
 * Hook para animaciones de entrada escalonada
 */
export function useStaggerAnimation(
  itemCount: number,
  staggerDelay = 0.05,
  preset: AnimationPreset = 'smooth'
) {
  const prefersReducedMotion = useReducedMotion()

  const getItemProps = useCallback((index: number): Partial<MotionProps> => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.1 },
      }
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          ...springPresets[preset],
          delay: index * staggerDelay,
        },
      },
    }
  }, [prefersReducedMotion, staggerDelay, preset])

  return { getItemProps, totalDuration: itemCount * staggerDelay }
}

/**
 * Hook para animaciones de página/panel
 */
export function usePageTransition(direction: 'left' | 'right' | 'up' | 'down' = 'up') {
  const prefersReducedMotion = useReducedMotion()

  const variants = useMemo((): Variants => {
    if (prefersReducedMotion) {
      return fadeVariants
    }

    const offset = 30
    const directions = {
      left: { x: offset },
      right: { x: -offset },
      up: { y: offset },
      down: { y: -offset },
    }

    return {
      hidden: {
        opacity: 0,
        ...directions[direction],
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: springPresets.smooth,
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.15 },
      },
    }
  }, [prefersReducedMotion, direction])

  return variants
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES DE UTILIDAD
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Configuración predeterminada para LayoutGroup
 */
export const defaultLayoutConfig = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 30,
}

/**
 * Props predeterminados para AnimatePresence
 */
export const defaultPresenceProps = {
  mode: 'wait' as const,
  initial: false,
}

/**
 * Genera props de motion para un elemento interactivo
 */
export function getInteractiveMotionProps(
  preset: AnimationPreset = 'snappy'
): Partial<MotionProps> {
  return {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.98 },
    transition: springPresets[preset],
  }
}

/**
 * Genera props para animación de entrada
 */
export function getEntranceProps(
  variant: 'fade' | 'slideUp' | 'scale' | 'pop' = 'slideUp',
  delay = 0
): Partial<MotionProps> {
  const variants = {
    fade: fadeVariants,
    slideUp: slideUpVariants,
    scale: scaleVariants,
    pop: popVariants,
  }

  return {
    variants: variants[variant],
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    transition: delay > 0 ? withDelay(springPresets.smooth, delay) : springPresets.smooth,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const animations = {
  presets: springPresets,
  easings: easingPresets,
  variants: {
    fade: fadeVariants,
    slideUp: slideUpVariants,
    slideDown: slideDownVariants,
    slideLeft: slideLeftVariants,
    slideRight: slideRightVariants,
    scale: scaleVariants,
    pop: popVariants,
    modal: modalVariants,
    listItem: listItemVariants,
    card: cardVariants,
    container: containerVariants,
  },
  utils: {
    withDelay,
    forProperties,
    combineTransitions,
    getInteractiveMotionProps,
    getEntranceProps,
  },
}

export default animations
