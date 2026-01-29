'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS ANIMATION SYSTEM — Micro-Interacciones Premium
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de animaciones y transiciones ultra-premium para todo el ecosistema CHRONOS.
 *
 * CARACTERÍSTICAS:
 * - Spring physics personalizados (butter, silk, liquid, feather)
 * - Variantes de animación reutilizables
 * - Efectos de hover magnéticos
 * - Transiciones de página cinematográficas
 * - Micro-interacciones en cada componente
 * - Performance optimizada (GPU accelerated)
 *
 * PALETA: Violeta #8B00FF | Oro #FFD700 | Rosa #FF1493
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { Variants, Transition, TargetAndTransition, VariantLabels } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPRING PRESETS — Física de resorte personalizada
// ═══════════════════════════════════════════════════════════════════════════════════════

export const springPresets = {
  /** Suave como mantequilla - para UI general */
  butter: { type: 'spring' as const, stiffness: 260, damping: 25, mass: 1 },

  /** Seda - para modales y paneles */
  silk: { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.8 },

  /** Líquido - para elementos fluidos */
  liquid: { type: 'spring' as const, stiffness: 150, damping: 20, mass: 1.2 },

  /** Pluma - para elementos sutiles */
  feather: { type: 'spring' as const, stiffness: 400, damping: 35, mass: 0.5 },

  /** Elástico - para botones y CTAs */
  elastic: { type: 'spring' as const, stiffness: 500, damping: 15, mass: 0.8 },

  /** Rebote - para notificaciones */
  bounce: { type: 'spring' as const, stiffness: 600, damping: 12, mass: 1 },

  /** Respiración - para elementos vivos */
  breathe: { type: 'spring' as const, stiffness: 100, damping: 10, mass: 2 },

  /** Instantáneo - para cambios rápidos */
  instant: { type: 'spring' as const, stiffness: 1000, damping: 50, mass: 0.5 },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// EASING PRESETS — Curvas de animación
// ═══════════════════════════════════════════════════════════════════════════════════════

export const easingPresets = {
  /** Suave entrada y salida */
  smooth: [0.4, 0, 0.2, 1],

  /** Entrada elegante */
  elegantIn: [0.6, 0, 0.4, 1],

  /** Salida elegante */
  elegantOut: [0, 0, 0.2, 1],

  /** Anticipación (pequeño retroceso) */
  anticipate: [0.68, -0.55, 0.265, 1.55],

  /** Back in out */
  backInOut: [0.68, -0.6, 0.32, 1.6],

  /** Expo out */
  expoOut: [0.16, 1, 0.3, 1],

  /** Circ out */
  circOut: [0, 0.55, 0.45, 1],
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES DE FADE
// ═══════════════════════════════════════════════════════════════════════════════════════

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const fadeDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export const fadeScaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES DE SLIDE
// ═══════════════════════════════════════════════════════════════════════════════════════

export const slideRightVariants: Variants = {
  initial: { x: -30, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 30, opacity: 0 },
}

export const slideLeftVariants: Variants = {
  initial: { x: 30, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -30, opacity: 0 },
}

export const slideUpVariants: Variants = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -30, opacity: 0 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES DE ESCALA
// ═══════════════════════════════════════════════════════════════════════════════════════

export const scaleVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}

export const popVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: springPresets.elastic,
  },
  exit: { scale: 0.8, opacity: 0 },
}

export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA CARDS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPresets.butter,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
    transition: springPresets.feather,
  },
  tap: {
    scale: 0.98,
    transition: springPresets.instant,
  },
}

export const glassCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    rotateX: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: springPresets.silk,
  },
  hover: {
    y: -6,
    rotateX: -2,
    boxShadow: '0 25px 50px -20px rgba(139, 0, 255, 0.25)',
    transition: springPresets.butter,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA BOTONES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: springPresets.feather,
  },
  tap: {
    scale: 0.95,
    transition: springPresets.instant,
  },
  disabled: {
    opacity: 0.5,
    scale: 1,
  },
}

export const magneticButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.08,
    boxShadow: '0 10px 30px -10px rgba(139, 0, 255, 0.4)',
    transition: springPresets.elastic,
  },
  tap: {
    scale: 0.92,
    transition: springPresets.instant,
  },
}

export const primaryButtonVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 15px -5px rgba(139, 0, 255, 0.3)',
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 8px 25px -5px rgba(139, 0, 255, 0.5)',
    transition: springPresets.butter,
  },
  tap: {
    scale: 0.97,
    boxShadow: '0 2px 10px -5px rgba(139, 0, 255, 0.3)',
    transition: springPresets.instant,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA MODALES Y PANELES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springPresets.silk,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
}

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const panelSlideVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: springPresets.silk,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA LISTAS (Stagger)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const staggerContainerVariants: Variants = {
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

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: springPresets.butter,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
}

export const staggerFadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA NAVEGACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════

export const navItemVariants: Variants = {
  initial: { opacity: 0.6 },
  active: {
    opacity: 1,
    scale: 1.02,
    transition: springPresets.feather,
  },
  hover: {
    opacity: 1,
    x: 4,
    transition: springPresets.butter,
  },
}

export const menuItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: springPresets.butter,
  },
  hover: {
    x: 8,
    backgroundColor: 'rgba(139, 0, 255, 0.1)',
    transition: springPresets.feather,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA NOTIFICACIONES Y TOASTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.9,
    x: 50,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    x: 0,
    transition: springPresets.bounce,
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.9,
    x: 50,
    transition: { duration: 0.2 },
  },
}

export const notificationBadgeVariants: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: springPresets.elastic,
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA ORBES Y ELEMENTOS 3D
// ═══════════════════════════════════════════════════════════════════════════════════════

export const orbVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      ...springPresets.liquid,
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.15,
    transition: springPresets.butter,
  },
  selected: {
    scale: 1.2,
    boxShadow: '0 0 40px rgba(139, 0, 255, 0.5)',
    transition: springPresets.silk,
  },
}

export const floatingVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const rotateVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA KPIs Y STATS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const kpiVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPresets.butter,
  },
  hover: {
    y: -5,
    boxShadow: '0 15px 30px -10px rgba(0,0,0,0.2)',
    transition: springPresets.feather,
  },
}

export const counterVariants: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springPresets.elastic,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA PÁGINAS (Transiciones de ruta)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easingPresets.smooth,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
}

export const pageSlideVariants: Variants = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: easingPresets.expoOut,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.3,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANTES PARA SKELETON LOADING
// ═══════════════════════════════════════════════════════════════════════════════════════

export const skeletonVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const shimmerVariants: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HELPERS Y FUNCIONES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Genera una transición con delay para stagger manual
 */
export function staggeredTransition(index: number, baseDelay = 0.05): Transition {
  return {
    ...springPresets.butter,
    delay: index * baseDelay,
  }
}

/**
 * Crea hover state con glow de color específico
 */
export function createGlowHover(color: string, intensity = 0.3): TargetAndTransition {
  return {
    boxShadow: `0 0 30px rgba(${hexToRgb(color)}, ${intensity})`,
    transition: springPresets.feather,
  }
}

/**
 * Convierte hex a RGB string
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result || !result[1] || !result[2] || !result[3]) return '139, 0, 255'
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}

/**
 * Genera variantes para hover con color personalizado
 */
export function createHoverVariants(hoverColor: string): Variants {
  return {
    initial: {
      scale: 1,
      backgroundColor: 'transparent',
    },
    hover: {
      scale: 1.02,
      backgroundColor: `${hoverColor}10`,
      transition: springPresets.feather,
    },
    tap: {
      scale: 0.98,
      transition: springPresets.instant,
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════════════

const ChronosAnimations = {
  springs: springPresets,
  easings: easingPresets,
  fade: fadeVariants,
  fadeUp: fadeUpVariants,
  fadeDown: fadeDownVariants,
  fadeScale: fadeScaleVariants,
  slideRight: slideRightVariants,
  slideLeft: slideLeftVariants,
  slideUp: slideUpVariants,
  scale: scaleVariants,
  pop: popVariants,
  pulse: pulseVariants,
  card: cardVariants,
  glassCard: glassCardVariants,
  button: buttonVariants,
  magneticButton: magneticButtonVariants,
  primaryButton: primaryButtonVariants,
  modal: modalVariants,
  overlay: overlayVariants,
  panelSlide: panelSlideVariants,
  staggerContainer: staggerContainerVariants,
  staggerItem: staggerItemVariants,
  navItem: navItemVariants,
  menuItem: menuItemVariants,
  toast: toastVariants,
  notificationBadge: notificationBadgeVariants,
  orb: orbVariants,
  floating: floatingVariants,
  rotate: rotateVariants,
  kpi: kpiVariants,
  counter: counterVariants,
  page: pageVariants,
  pageSlide: pageSlideVariants,
  skeleton: skeletonVariants,
  shimmer: shimmerVariants,
}

export default ChronosAnimations
