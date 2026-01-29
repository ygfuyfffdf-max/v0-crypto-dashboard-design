/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS MOTION DESIGN SYSTEM 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema unificado de animaciones con física realista para Framer Motion
 *
 * Filosofía:
 * - Spring physics para interacciones naturales
 * - Micro-animaciones sutiles (60fps locked)
 * - Reveal animations cinematográficas
 * - Stagger patterns para listas y grids
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import type { Variants, Transition } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 SPRING PHYSICS PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const springPresets = {
  // Suave y elegante - para cards y paneles
  gentle: { type: 'spring', stiffness: 120, damping: 20 } as const,

  // Estándar - para la mayoría de interacciones
  smooth: { type: 'spring', stiffness: 300, damping: 30 } as const,

  // Snappy - para botones y elementos pequeños
  snappy: { type: 'spring', stiffness: 500, damping: 35 } as const,

  // Bouncy - para notificaciones y badges
  bouncy: { type: 'spring', stiffness: 400, damping: 15 } as const,

  // Dramatic - para modales y overlays
  dramatic: { type: 'spring', stiffness: 200, damping: 25 } as const,

  // Ultra smooth - para transiciones de página
  silky: { type: 'spring', stiffness: 100, damping: 20 } as const,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// ⏱️ DURATION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const durationPresets = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
  slower: 0.7,
  dramatic: 1.0,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const transitionPresets = {
  // Spring transitions
  springGentle: springPresets.gentle,
  springSmooth: springPresets.smooth,
  springSnappy: springPresets.snappy,
  springBouncy: springPresets.bouncy,

  // Easing transitions
  easeOut: { duration: durationPresets.normal, ease: [0.16, 1, 0.3, 1] } as Transition,
  easeIn: { duration: durationPresets.normal, ease: [0.4, 0, 1, 1] } as Transition,
  easeInOut: { duration: durationPresets.normal, ease: [0.4, 0, 0.2, 1] } as Transition,

  // Expo easing - muy suave
  expoOut: { duration: durationPresets.slow, ease: [0.19, 1, 0.22, 1] } as Transition,

  // Back easing - con rebote
  backOut: { duration: durationPresets.normal, ease: [0.34, 1.56, 0.64, 1] } as Transition,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🃏 CARD VARIANTS — Hover, Tap, Focus
// ═══════════════════════════════════════════════════════════════════════════════════════

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    rotateX: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: springPresets.gentle,
  },
  hover: {
    y: -8,
    scale: 1.02,
    rotateX: 3,
    transition: springPresets.smooth,
  },
  tap: {
    scale: 0.98,
    transition: springPresets.snappy,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

export const cardVariantsGold: Variants = {
  ...cardVariants,
  hover: {
    ...cardVariants.hover,
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
  },
}

export const cardVariantsViolet: Variants = {
  ...cardVariants,
  hover: {
    ...cardVariants.hover,
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)',
  },
}

export const cardVariantsPlasma: Variants = {
  ...cardVariants,
  hover: {
    ...cardVariants.hover,
    boxShadow: '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(236, 72, 153, 0.3)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔘 BUTTON VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.03,
    y: -2,
    transition: springPresets.snappy,
  },
  tap: {
    scale: 0.97,
    transition: springPresets.snappy,
  },
}

export const buttonGlowVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
  },
  hover: {
    scale: 1.03,
    y: -2,
    boxShadow: '0 8px 30px rgba(255, 215, 0, 0.5), 0 0 50px rgba(255, 215, 0, 0.2)',
    transition: springPresets.smooth,
  },
  tap: {
    scale: 0.97,
    boxShadow: '0 2px 10px rgba(255, 215, 0, 0.4)',
    transition: springPresets.snappy,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📦 CONTAINER VARIANTS — Para stagger children
// ═══════════════════════════════════════════════════════════════════════════════════════

export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const containerVariantsFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

export const containerVariantsSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎬 REVEAL VARIANTS — Para elementos que entran en viewport
// ═══════════════════════════════════════════════════════════════════════════════════════

export const revealVariants: Variants = {
  initial: {
    opacity: 0,
    y: 60,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: springPresets.gentle,
  },
}

export const revealFromLeft: Variants = {
  initial: {
    opacity: 0,
    x: -80,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: springPresets.gentle,
  },
}

export const revealFromRight: Variants = {
  initial: {
    opacity: 0,
    x: 80,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: springPresets.gentle,
  },
}

export const revealScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.85,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: springPresets.smooth,
  },
}

export const revealFlip: Variants = {
  initial: {
    opacity: 0,
    rotateY: 90,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: springPresets.dramatic,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🪟 MODAL VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

export const modalContentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 50,
    rotateX: -15,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: springPresets.dramatic,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 30,
    transition: { duration: 0.2 },
  },
}

export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: '100%',
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springPresets.smooth,
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.2 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔔 NOTIFICATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const notificationVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springPresets.bouncy,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPresets.bouncy,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 LIST ITEM VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springPresets.smooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.15 },
  },
}

export const tableRowVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  hover: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: { duration: 0.2 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔄 LOADING VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const pulseVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const spinVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const dotBounceVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🌟 KPI VARIANTS — Para métricas con impacto
// ═══════════════════════════════════════════════════════════════════════════════════════

export const kpiVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 30,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springPresets.smooth,
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: springPresets.snappy,
  },
}

export const kpiValueVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.5,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...springPresets.bouncy,
      delay: 0.2,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎨 GLOW VARIANTS — Efectos de brillo
// ═══════════════════════════════════════════════════════════════════════════════════════

export const glowPulseVariants: Variants = {
  initial: {
    opacity: 0.4,
    scale: 1,
  },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const glowBreathVariants: Variants = {
  initial: {
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
  },
  animate: {
    boxShadow: [
      '0 0 20px rgba(255, 215, 0, 0.3)',
      '0 0 40px rgba(255, 215, 0, 0.6)',
      '0 0 20px rgba(255, 215, 0, 0.3)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🏦 BANK ORB VARIANTS — Para los 7 bancos 3D
// ═══════════════════════════════════════════════════════════════════════════════════════

export const orbVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springPresets.bouncy,
  },
  hover: {
    scale: 1.15,
    transition: springPresets.smooth,
  },
  selected: {
    scale: 1.2,
    transition: springPresets.smooth,
  },
}

export const orbFloatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📐 PAGE TRANSITION VARIANTS
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
      ease: [0.16, 1, 0.3, 1],
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

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔧 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea variantes personalizadas con delay
 */
export function withDelay(variants: Variants, delay: number): Variants {
  const result: Variants = {}
  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = {
        ...value,
        transition: {
          ...(value as { transition?: Transition }).transition,
          delay,
        },
      }
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Crea variantes para stagger con índice
 */
export function staggeredItem(index: number, baseDelay = 0.05): Transition {
  return {
    ...springPresets.smooth,
    delay: index * baseDelay,
  }
}

/**
 * Genera variantes de entrada para grids (ej: 4 columnas)
 */
export function gridRevealVariants(columns: number): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📦 EXPORT AGRUPADO
// ═══════════════════════════════════════════════════════════════════════════════════════

export const chronosMotion = {
  // Presets
  spring: springPresets,
  duration: durationPresets,
  transition: transitionPresets,

  // Variants
  card: cardVariants,
  cardGold: cardVariantsGold,
  cardViolet: cardVariantsViolet,
  cardPlasma: cardVariantsPlasma,
  button: buttonVariants,
  buttonGlow: buttonGlowVariants,
  container: containerVariants,
  containerFast: containerVariantsFast,
  containerSlow: containerVariantsSlow,
  reveal: revealVariants,
  revealLeft: revealFromLeft,
  revealRight: revealFromRight,
  revealScale: revealScale,
  revealFlip: revealFlip,
  modalOverlay: modalOverlayVariants,
  modalContent: modalContentVariants,
  slideUp: slideUpVariants,
  notification: notificationVariants,
  toast: toastVariants,
  listItem: listItemVariants,
  tableRow: tableRowVariants,
  pulse: pulseVariants,
  spin: spinVariants,
  dotBounce: dotBounceVariants,
  kpi: kpiVariants,
  kpiValue: kpiValueVariants,
  glowPulse: glowPulseVariants,
  glowBreath: glowBreathVariants,
  orb: orbVariants,
  orbFloat: orbFloatVariants,
  page: pageVariants,

  // Helpers
  withDelay,
  staggeredItem,
  gridRevealVariants,
}

export default chronosMotion
