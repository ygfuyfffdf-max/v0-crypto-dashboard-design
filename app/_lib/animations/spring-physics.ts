// ═══════════════════════════════════════════════════════════════════════════════════════
// 🌸 CHRONOS INFINITY 2030 — SPRING PHYSICS ANIMATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════
// Sistema avanzado de animaciones con física de resorte para:
// - Transiciones ultra-suaves entre estados
// - Interacciones naturales (hover, click, drag)
// - Configuraciones predefinidas optimizadas
// - Performance-aware (60-120 FPS target)
// - Gestural animations con velocity tracking
// Basado en Framer Motion spring physics
// Paleta: #8B00FF / #FFD700 / #FF1493 (CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════

import { type Transition, type TargetAndTransition } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPRING PRESETS (Configuraciones optimizadas)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SPRING_PRESETS = {
  // Ultra-smooth: Para transiciones grandes y dramáticas (modales, panels)
  ultraSmooth: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 20,
    mass: 1.2,
    velocity: 0,
  },

  // Bouncy: Para elementos interactivos con rebote (buttons, cards)
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 0.8,
    velocity: 2,
  },

  // Snappy: Para cambios rápidos y precisos (tabs, toggles)
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 0.5,
    velocity: 0,
  },

  // Gentle: Para elementos sutiles (hover effects, tooltips)
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
    velocity: 0,
  },

  // Elastic: Para elementos que necesitan énfasis (notifications, alerts)
  elastic: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 10,
    mass: 1.5,
    velocity: 3,
  },

  // Fluid: Para drag & drop y gestures
  fluid: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    mass: 1,
    velocity: 0,
  },

  // Instant: Para cambios inmediatos pero suavizados
  instant: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
    mass: 0.3,
    velocity: 0,
  },

  // Cinematic: Para transiciones de página/vista
  cinematic: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 18,
    mass: 1.8,
    velocity: 0,
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS (Colecciones de transiciones comunes)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const FADE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const FADE_UP_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const FADE_DOWN_VARIANTS = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const FADE_LEFT_VARIANTS = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const FADE_RIGHT_VARIANTS = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const SCALE_VARIANTS = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
}

export const SCALE_BOUNCE_VARIANTS = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
}

export const ROTATE_SCALE_VARIANTS = {
  initial: { opacity: 0, scale: 0, rotate: -180 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0, rotate: 180 },
}

export const SLIDE_UP_VARIANTS = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

export const SLIDE_DOWN_VARIANTS = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
}

export const STAGGER_CONTAINER_VARIANTS = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOVER ANIMATIONS (Estados interactivos)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const HOVER_LIFT = {
  whileHover: {
    scale: 1.05,
    y: -5,
    transition: SPRING_PRESETS.bouncy,
  },
  whileTap: {
    scale: 0.95,
    transition: SPRING_PRESETS.snappy,
  },
}

export const HOVER_SCALE = {
  whileHover: {
    scale: 1.1,
    transition: SPRING_PRESETS.bouncy,
  },
  whileTap: {
    scale: 0.9,
    transition: SPRING_PRESETS.snappy,
  },
}

export const HOVER_GLOW = {
  whileHover: {
    scale: 1.02,
    boxShadow: '0 20px 60px rgba(139, 0, 255, 0.4)',
    transition: SPRING_PRESETS.gentle,
  },
}

export const HOVER_SHINE = {
  whileHover: {
    scale: 1.03,
    filter: 'brightness(1.2)',
    transition: SPRING_PRESETS.gentle,
  },
}

export const HOVER_ROTATE = {
  whileHover: {
    rotate: 5,
    scale: 1.05,
    transition: SPRING_PRESETS.elastic,
  },
  whileTap: {
    rotate: -5,
    scale: 0.95,
    transition: SPRING_PRESETS.snappy,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ADVANCED ANIMATION BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea una transición con delay personalizado
 */
export function withDelay(preset: keyof typeof SPRING_PRESETS, delay: number): Transition {
  return {
    ...SPRING_PRESETS[preset],
    delay,
  }
}

/**
 * Crea una animación stagger para children
 */
export function createStagger(staggerDelay: number = 0.05, childDelay: number = 0) {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  }
}

/**
 * Crea una animación de entrada con spring personalizado
 */
export function createEntranceAnimation(
  preset: keyof typeof SPRING_PRESETS = 'ultraSmooth',
  direction: 'up' | 'down' | 'left' | 'right' | 'scale' = 'up',
): TargetAndTransition {
  const baseVariants = {
    up: FADE_UP_VARIANTS,
    down: FADE_DOWN_VARIANTS,
    left: FADE_LEFT_VARIANTS,
    right: FADE_RIGHT_VARIANTS,
    scale: SCALE_VARIANTS,
  }

  return {
    ...baseVariants[direction].animate,
    transition: SPRING_PRESETS[preset],
  }
}

/**
 * Crea hover/tap states con spring personalizado
 */
export function createInteractive(
  preset: keyof typeof SPRING_PRESETS = 'bouncy',
  hoverScale: number = 1.05,
  tapScale: number = 0.95,
) {
  return {
    whileHover: {
      scale: hoverScale,
      transition: SPRING_PRESETS[preset],
    },
    whileTap: {
      scale: tapScale,
      transition: SPRING_PRESETS.snappy,
    },
  }
}

/**
 * Crea animación de pulsación (breathing effect)
 */
export function createPulse(scaleRange: [number, number] = [1, 1.05], duration: number = 2) {
  return {
    animate: {
      scale: scaleRange,
      transition: {
        duration,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
      },
    },
  }
}

/**
 * Crea animación de rotación continua
 */
export function createSpin(
  duration: number = 20,
  direction: 'clockwise' | 'counterclockwise' = 'clockwise',
) {
  return {
    animate: {
      rotate: direction === 'clockwise' ? 360 : -360,
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  }
}

/**
 * Crea animación de float (levitación)
 */
export function createFloat(yRange: [number, number] = [0, -10], duration: number = 3) {
  return {
    animate: {
      y: yRange,
      transition: {
        duration,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
      },
    },
  }
}

/**
 * Crea animación de shimmer (destello)
 */
export function createShimmer(duration: number = 2) {
  return {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE ANIMATIONS (Drag, Swipe)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const DRAGGABLE_CONFIG = {
  drag: true as const,
  dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  dragElastic: 0.2,
  dragTransition: SPRING_PRESETS.fluid,
}

export const SWIPEABLE_CONFIG = {
  drag: 'x' as const,
  dragConstraints: { left: 0, right: 0 },
  dragElastic: 0.1,
  dragTransition: SPRING_PRESETS.fluid,
}

/**
 * Crea configuración para drag con límites personalizados
 */
export function createDraggable(
  constraints: { left?: number; right?: number; top?: number; bottom?: number } = {},
  elastic: number = 0.2,
) {
  return {
    drag: true,
    dragConstraints: constraints,
    dragElastic: elastic,
    dragTransition: SPRING_PRESETS.fluid,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITIONS (Para AnimatePresence)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const PAGE_TRANSITIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: SPRING_PRESETS.ultraSmooth },
    exit: { opacity: 0, transition: SPRING_PRESETS.snappy },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: SPRING_PRESETS.cinematic },
    exit: { opacity: 0, y: -20, transition: SPRING_PRESETS.snappy },
  },

  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0, transition: SPRING_PRESETS.cinematic },
    exit: { opacity: 0, x: 100, transition: SPRING_PRESETS.snappy },
  },

  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: SPRING_PRESETS.ultraSmooth },
    exit: { opacity: 0, scale: 0.95, transition: SPRING_PRESETS.snappy },
  },

  scaleRotate: {
    initial: { opacity: 0, scale: 0.8, rotate: -10 },
    animate: { opacity: 1, scale: 1, rotate: 0, transition: SPRING_PRESETS.elastic },
    exit: { opacity: 0, scale: 0.8, rotate: 10, transition: SPRING_PRESETS.snappy },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Reduce motion para usuarios con preferencias de accesibilidad
 */
export function getReducedMotionTransition(normalTransition: Transition): Transition {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return {
      type: 'tween',
      duration: 0.01,
    }
  }
  return normalTransition
}

/**
 * Layout shift optimization
 */
export const LAYOUT_TRANSITION = {
  layout: true,
  layoutId: undefined, // Set per component
  transition: SPRING_PRESETS.ultraSmooth,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export default {
  presets: SPRING_PRESETS,
  variants: {
    fade: FADE_VARIANTS,
    fadeUp: FADE_UP_VARIANTS,
    fadeDown: FADE_DOWN_VARIANTS,
    fadeLeft: FADE_LEFT_VARIANTS,
    fadeRight: FADE_RIGHT_VARIANTS,
    scale: SCALE_VARIANTS,
    scaleBounce: SCALE_BOUNCE_VARIANTS,
    rotateScale: ROTATE_SCALE_VARIANTS,
    slideUp: SLIDE_UP_VARIANTS,
    slideDown: SLIDE_DOWN_VARIANTS,
    staggerContainer: STAGGER_CONTAINER_VARIANTS,
  },
  hover: {
    lift: HOVER_LIFT,
    scale: HOVER_SCALE,
    glow: HOVER_GLOW,
    shine: HOVER_SHINE,
    rotate: HOVER_ROTATE,
  },
  builders: {
    withDelay,
    createStagger,
    createEntranceAnimation,
    createInteractive,
    createPulse,
    createSpin,
    createFloat,
    createShimmer,
    createDraggable,
  },
  page: PAGE_TRANSITIONS,
  utils: {
    getReducedMotionTransition,
    LAYOUT_TRANSITION,
  },
}
