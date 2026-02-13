/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬✨ MOTION PRIMITIVES — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Biblioteca centralizada de variantes de animación Framer Motion para consistencia total.
 * Todas las animaciones del sistema importan desde aquí.
 *
 * Filosofía: "Animaciones suaves, predecibles y performantes"
 * - GPU-accelerated (transform, opacity)
 * - Spring physics para naturalidad
 * - Duraciones optimizadas (200-400ms micro, 500-800ms transiciones)
 * - Stagger delays para secuencias (50-100ms)
 */

import type { Transition, Variants } from "motion/react"

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎯 EASING CURVES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const easings = {
  spring: { type: "spring" as const, stiffness: 400, damping: 30 },
  springSmooth: { type: "spring" as const, stiffness: 300, damping: 25 },
  springBouncy: { type: "spring" as const, stiffness: 500, damping: 20 },
  easeOut: [0.4, 0, 0.2, 1] as const,
  easeInOut: [0.4, 0, 0.6, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
}

export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  smooth: 0.4,
  slow: 0.6,
  cinematic: 0.8,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 FADE ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInFast: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: durations.fast } },
  exit: { opacity: 0, transition: { duration: durations.fast } },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 FADE + SLIDE ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { ...easings.spring, duration: durations.normal } },
  exit: { opacity: 0, y: -10, transition: { duration: durations.fast } },
}

export const fadeSlideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { ...easings.spring, duration: durations.normal } },
  exit: { opacity: 0, y: 10, transition: { duration: durations.fast } },
}

export const fadeSlideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { ...easings.spring, duration: durations.normal } },
  exit: { opacity: 0, x: -10, transition: { duration: durations.fast } },
}

export const fadeSlideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { ...easings.spring, duration: durations.normal } },
  exit: { opacity: 0, x: 10, transition: { duration: durations.fast } },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 SCALE ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { ...easings.spring, duration: durations.normal } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: durations.fast } },
}

export const scaleOut: Variants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 0, scale: 0.9, transition: { duration: durations.fast } },
  exit: { opacity: 0, scale: 0.9 },
}

export const scaleInBig: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { ...easings.springBouncy, duration: durations.smooth },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: durations.normal } },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 GLASS REVEAL (Fade + Scale + Blur)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const glassReveal: Variants = {
  initial: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...easings.spring, duration: durations.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(5px)",
    transition: { duration: durations.normal },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 LIQUID MORPH (Organic scale + rotation)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const liquidMorph: Variants = {
  initial: { opacity: 0, scale: 0.8, rotate: -5 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { ...easings.springSmooth, duration: durations.cinematic },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    rotate: 3,
    transition: { duration: durations.smooth },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 PANEL ENTRANCE (For full-screen panels)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const panelEntrance: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...easings.spring, duration: durations.smooth },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: { duration: durations.normal },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 CARD ENTRANCE (For cards in grids)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const cardEntrance: Variants = {
  initial: { opacity: 0, y: 15, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...easings.spring, duration: durations.normal },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.98,
    transition: { duration: durations.fast },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 MODAL ENTRANCE (For modals/overlays)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const modalEntrance: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 30 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...easings.springBouncy, duration: durations.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: durations.normal },
  },
}

export const modalBackdrop: Variants = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: { duration: durations.normal },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: durations.fast },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 STAGGER CONTAINER & CHILD
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Container para animaciones stagger (secuenciales)
 * @param delayChildren - Delay inicial antes de animar hijos (default: 0)
 * @param staggerChildren - Delay entre cada hijo (default: 0.05 = 50ms)
 */
export const staggerContainer = (
  delayChildren: number = 0,
  staggerChildren: number = 0.05
): Variants => ({
  initial: {},
  animate: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
})

/**
 * Child para usar dentro de staggerContainer
 */
export const staggerChild: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { ...easings.spring, duration: durations.normal },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: { duration: durations.fast },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 HOVER & TAP ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const hoverScale = {
  scale: 1.02,
  transition: { duration: durations.fast },
}

export const hoverScaleBig = {
  scale: 1.05,
  transition: { duration: durations.fast },
}

export const tapScale = {
  scale: 0.98,
  transition: { duration: durations.instant },
}

export const hoverLift = {
  y: -2,
  transition: { duration: durations.fast },
}

export const hoverGlow = {
  boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
  transition: { duration: durations.normal },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 UTILITY TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
}

export const smoothTransition: Transition = {
  duration: durations.normal,
  ease: easings.easeOut,
}

export const fastTransition: Transition = {
  duration: durations.fast,
  ease: easings.easeOut,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 LAYOUT ANIMATIONS (for AnimatePresence with layoutId)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const layoutTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 PRESETS FOR COMMON USE CASES
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Preset para páginas completas (dashboard panels, etc)
 */
export const pageTransition: Variants = panelEntrance

/**
 * Preset para elementos de lista/grid
 */
export const listItemTransition: Variants = cardEntrance

/**
 * Preset para tooltips/popovers
 */
export const tooltipTransition: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 5 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: durations.fast },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 5,
    transition: { duration: durations.instant },
  },
}

/**
 * Preset para notificaciones/toasts
 */
export const toastTransition: Variants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...easings.springBouncy, duration: durations.smooth },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: { duration: durations.normal },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎭 EXPORT ALL
// ═══════════════════════════════════════════════════════════════════════════════════════

export const motionPresets = {
  fadeIn,
  fadeInFast,
  fadeSlideUp,
  fadeSlideDown,
  fadeSlideLeft,
  fadeSlideRight,
  scaleIn,
  scaleOut,
  scaleInBig,
  glassReveal,
  liquidMorph,
  panelEntrance,
  cardEntrance,
  modalEntrance,
  modalBackdrop,
  staggerChild,
  pageTransition,
  listItemTransition,
  tooltipTransition,
  toastTransition,
}

export const motionHovers = {
  hoverScale,
  hoverScaleBig,
  tapScale,
  hoverLift,
  hoverGlow,
}

export const motionTransitions = {
  spring: springTransition,
  smooth: smoothTransition,
  fast: fastTransition,
  layout: layoutTransition,
}
