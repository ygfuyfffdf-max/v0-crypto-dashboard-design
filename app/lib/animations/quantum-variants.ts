/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — FRAMER MOTION HYPER-VARIANTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Variantes de animación Framer Motion de nivel supremo con física real:
 * - Springs con amortiguamiento crítico
 * - Animaciones stagger escalonadas
 * - Efectos hover ultra-responsivos
 * - Transiciones de entrada épicas
 *
 * @version HYPER-INFINITY 2026.1
 */

import type { Variants, Transition, TargetAndTransition } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 SPRING PRESETS — FÍSICA REAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SPRING_PRESETS = {
  // Ultra-rápido para micro-interacciones
  instant: { type: 'spring', stiffness: 1200, damping: 40, mass: 0.1 } as const,

  // Veloz pero suave
  snappy: { type: 'spring', stiffness: 800, damping: 35, mass: 0.2 } as const,

  // Balance perfecto
  smooth: { type: 'spring', stiffness: 400, damping: 28, mass: 0.5 } as const,

  // Elegante con rebote sutil
  elegant: { type: 'spring', stiffness: 300, damping: 22, mass: 0.8 } as const,

  // Flotante etéreo
  floating: { type: 'spring', stiffness: 200, damping: 18, mass: 1.2 } as const,

  // Elástico dramático
  elastic: { type: 'spring', stiffness: 600, damping: 15, mass: 0.3 } as const,

  // Rebote exagerado
  bouncy: { type: 'spring', stiffness: 500, damping: 12, mass: 0.4 } as const,

  // Lento y majestuoso
  majestic: { type: 'spring', stiffness: 150, damping: 20, mass: 1.5 } as const,

  // Crítico (sin rebote)
  critical: { type: 'spring', stiffness: 350, damping: 26, mass: 1 } as const,

  // Quantum - ultra-preciso
  quantum: { type: 'spring', stiffness: 900, damping: 30, mass: 0.15 } as const,

  // Plasma - energético
  plasma: { type: 'spring', stiffness: 700, damping: 20, mass: 0.25 } as const,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 CONTAINER VARIANTS — ENTRADA ÉPICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
      when: 'beforeChildren',
    },
  },
}

export const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 ITEM VARIANTS — ELEMENTOS HIJOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...SPRING_PRESETS.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
}

export const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.92,
    rotateX: -8,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      ...SPRING_PRESETS.elegant,
    },
  },
}

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -32,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      ...SPRING_PRESETS.snappy,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎴 PANEL/CARD VARIANTS — TARJETAS GLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 20,
    filter: 'blur(12px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      ...SPRING_PRESETS.majestic,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(8px)',
    transition: {
      duration: 0.25,
    },
  },
}

export const glassCardVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(20px)',
    scale: 1,
    transition: {
      ...SPRING_PRESETS.elegant,
      backdropFilter: { duration: 0.4 },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🖱️ HOVER VARIANTS — EFECTOS INTERACTIVOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const hoverLiftVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: '0 4px 24px rgba(139, 0, 255, 0.1)',
  },
  hover: {
    y: -6,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(139, 0, 255, 0.25)',
    transition: {
      ...SPRING_PRESETS.snappy,
    },
  },
  tap: {
    y: -2,
    scale: 0.98,
  },
}

export const hoverGlowVariants: Variants = {
  rest: {
    boxShadow: '0 0 0 rgba(139, 0, 255, 0)',
  },
  hover: {
    boxShadow: [
      '0 0 20px rgba(139, 0, 255, 0.3)',
      '0 0 40px rgba(139, 0, 255, 0.2)',
      '0 0 20px rgba(139, 0, 255, 0.3)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
}

export const magneticHoverVariants: Variants = {
  rest: {
    x: 0,
    y: 0,
  },
  hover: {
    // Se controla dinámicamente con onMouseMove
    transition: {
      ...SPRING_PRESETS.instant,
    },
  },
}

export const buttonHoverVariants: Variants = {
  rest: {
    scale: 1,
    background: 'rgba(139, 0, 255, 0.1)',
  },
  hover: {
    scale: 1.05,
    background: 'rgba(139, 0, 255, 0.2)',
    transition: {
      ...SPRING_PRESETS.quantum,
    },
  },
  tap: {
    scale: 0.95,
    background: 'rgba(139, 0, 255, 0.3)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 SCROLL VARIANTS — ANIMACIONES DE SCROLL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const scrollFadeInVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 50,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_PRESETS.smooth,
      delay: 0.1,
    },
  },
}

export const scrollZoomVariants: Variants = {
  offscreen: {
    opacity: 0,
    scale: 0.8,
    filter: 'blur(10px)',
  },
  onscreen: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...SPRING_PRESETS.elegant,
    },
  },
}

export const scrollSlideVariants = {
  left: {
    offscreen: { opacity: 0, x: -100 },
    onscreen: { opacity: 1, x: 0, transition: SPRING_PRESETS.smooth },
  },
  right: {
    offscreen: { opacity: 0, x: 100 },
    onscreen: { opacity: 1, x: 0, transition: SPRING_PRESETS.smooth },
  },
  up: {
    offscreen: { opacity: 0, y: 100 },
    onscreen: { opacity: 1, y: 0, transition: SPRING_PRESETS.smooth },
  },
  down: {
    offscreen: { opacity: 0, y: -100 },
    onscreen: { opacity: 1, y: 0, transition: SPRING_PRESETS.smooth },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚪 MODAL VARIANTS — DIÁLOGOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const modalOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(16px)',
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.2,
    },
  },
}

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 40,
    rotateX: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      ...SPRING_PRESETS.elastic,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
}

export const drawerVariants = {
  left: {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: SPRING_PRESETS.smooth },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.2 } },
  },
  right: {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: SPRING_PRESETS.smooth },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
  },
  top: {
    hidden: { y: '-100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: SPRING_PRESETS.smooth },
    exit: { y: '-100%', opacity: 0, transition: { duration: 0.2 } },
  },
  bottom: {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: SPRING_PRESETS.smooth },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔔 TOAST/NOTIFICATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    x: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    x: 0,
    transition: {
      ...SPRING_PRESETS.bouncy,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
}

export const notificationBadgeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      ...SPRING_PRESETS.elastic,
    },
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ MICRO-INTERACTION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
}

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 TEXT VARIANTS — TIPOGRAFÍA ANIMADA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const textRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)',
  },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.05,
      ...SPRING_PRESETS.smooth,
    },
  }),
}

export const characterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_PRESETS.snappy,
    },
  },
}

export const wordVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 GRADIENT/COLOR VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const gradientShiftVariants: Variants = {
  animate: {
    background: [
      'linear-gradient(135deg, #8B00FF 0%, #FFD700 100%)',
      'linear-gradient(135deg, #FFD700 0%, #FF1493 100%)',
      'linear-gradient(135deg, #FF1493 0%, #8B00FF 100%)',
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const colorPulseVariants = (color: string): Variants => ({
  animate: {
    color: [color, '#FFD700', color],
    textShadow: [`0 0 0 ${color}`, '0 0 20px #FFD700', `0 0 0 ${color}`],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏦 BANK-SPECIFIC VARIANTS — COLORES DE BANCOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const bankGlowVariants = (bankColor: string): Variants => ({
  rest: {
    boxShadow: `0 0 0 ${bankColor}00`,
  },
  hover: {
    boxShadow: [`0 0 20px ${bankColor}40`, `0 0 40px ${bankColor}30`, `0 0 20px ${bankColor}40`],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 CHART/DATA VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const barChartVariants: Variants = {
  hidden: { scaleY: 0, originY: 1 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: {
      delay: i * 0.05,
      ...SPRING_PRESETS.elastic,
    },
  }),
}

export const lineChartVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
}

export const pieChartVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      ...SPRING_PRESETS.elastic,
      duration: 0.8,
    },
  },
}

export const numberCounterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRING_PRESETS.bouncy,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 PRESENCE VARIANTS — AnimatePresence
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const presenceFadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const presenceSlideVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const presenceScaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QuantumVariants = {
  springs: SPRING_PRESETS,
  containers: {
    default: containerVariants,
    stagger: staggerContainerVariants,
    grid: gridContainerVariants,
  },
  items: {
    default: itemVariants,
    card: cardItemVariants,
    list: listItemVariants,
  },
  panels: {
    default: panelVariants,
    glass: glassCardVariants,
  },
  hover: {
    lift: hoverLiftVariants,
    glow: hoverGlowVariants,
    magnetic: magneticHoverVariants,
    button: buttonHoverVariants,
  },
  scroll: {
    fadeIn: scrollFadeInVariants,
    zoom: scrollZoomVariants,
    slide: scrollSlideVariants,
  },
  modal: {
    overlay: modalOverlayVariants,
    content: modalContentVariants,
    drawer: drawerVariants,
  },
  toast: {
    default: toastVariants,
    badge: notificationBadgeVariants,
  },
  micro: {
    checkmark: checkmarkVariants,
    spinner: spinnerVariants,
    pulse: pulseVariants,
    shimmer: shimmerVariants,
  },
  text: {
    reveal: textRevealVariants,
    character: characterVariants,
    word: wordVariants,
  },
  gradient: {
    shift: gradientShiftVariants,
    pulse: colorPulseVariants,
  },
  chart: {
    bar: barChartVariants,
    line: lineChartVariants,
    pie: pieChartVariants,
    counter: numberCounterVariants,
  },
  presence: {
    fade: presenceFadeVariants,
    slide: presenceSlideVariants,
    scale: presenceScaleVariants,
  },
}

export default QuantumVariants
