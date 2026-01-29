/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎬 CHRONOS 2026 — PREMIUM MOTION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de animaciones cinematográficas unificado:
 * - Micro-interacciones premium (Apple/Linear quality)
 * - Transiciones fluidas entre estados
 * - Page transitions cinematográficas
 * - Hover/Focus/Active states
 * - Stagger animations para listas
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { Transition, Variants } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════
// TIMING FUNCTIONS (Cubic Bezier Curves)
// ═══════════════════════════════════════════════════════════════════════════════

export const easings = {
  // Apple-style fluid easing
  apple: [0.25, 0.1, 0.25, 1] as const,

  // Linear-style smooth easing
  linear: [0.22, 1, 0.36, 1] as const,

  // Arc Browser bounce
  bounce: [0.34, 1.56, 0.64, 1] as const,

  // Quick snap
  snap: [0.16, 1, 0.3, 1] as const,

  // Smooth deceleration
  decel: [0, 0.55, 0.45, 1] as const,

  // Elastic feel
  elastic: [0.68, -0.55, 0.265, 1.55] as const,

  // Cinematic slow-mo
  cinematic: [0.4, 0, 0.2, 1] as const,
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPRING CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const springs = {
  // Micro-interaction (buttons, toggles)
  micro: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 },

  // Snappy (modals, popovers)
  snappy: { type: 'spring' as const, stiffness: 400, damping: 25, mass: 0.8 },

  // Smooth (cards, panels)
  smooth: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1 },

  // Bouncy (success states, notifications)
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 15, mass: 0.8 },

  // Gentle (page transitions)
  gentle: { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1.2 },

  // Heavy (large elements)
  heavy: { type: 'spring' as const, stiffness: 80, damping: 25, mass: 2 },
}

// ═══════════════════════════════════════════════════════════════════════════════
// DURATION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
  cinematic: 0.8,
  page: 1.2,
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const pageTransitions: Record<string, Variants> = {
  // Fade + Scale (Default)
  fadeScale: {
    initial: { opacity: 0, scale: 0.98 },
    enter: {
      opacity: 1,
      scale: 1,
      transition: { duration: durations.cinematic, ease: easings.linear },
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      transition: { duration: durations.fast, ease: easings.snap },
    },
  },

  // Slide from right
  slideRight: {
    initial: { opacity: 0, x: 100 },
    enter: {
      opacity: 1,
      x: 0,
      transition: { duration: durations.slow, ease: easings.linear },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: durations.fast },
    },
  },

  // Slide from bottom (mobile-friendly)
  slideUp: {
    initial: { opacity: 0, y: 60 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.slow, ease: easings.linear },
    },
    exit: {
      opacity: 0,
      y: -30,
      transition: { duration: durations.fast },
    },
  },

  // Reveal with blur
  blurReveal: {
    initial: { opacity: 0, filter: 'blur(20px)', scale: 0.95 },
    enter: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: { duration: durations.cinematic, ease: easings.cinematic },
    },
    exit: {
      opacity: 0,
      filter: 'blur(10px)',
      transition: { duration: durations.normal },
    },
  },

  // Morph (for shared element transitions)
  morph: {
    initial: { opacity: 0, borderRadius: '50%', scale: 0 },
    enter: {
      opacity: 1,
      borderRadius: '16px',
      scale: 1,
      transition: springs.smooth,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: durations.fast },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const componentVariants = {
  // Card with premium hover
  card: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springs.smooth,
    },
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      transition: springs.snappy,
    },
    tap: {
      scale: 0.98,
      transition: { duration: durations.instant },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: durations.fast },
    },
  } as Variants,

  // Glass card with glow
  glassCard: {
    initial: { opacity: 0, y: 30, backdropFilter: 'blur(0px)' },
    animate: {
      opacity: 1,
      y: 0,
      backdropFilter: 'blur(20px)',
      transition: { ...springs.gentle, staggerChildren: 0.05 },
    },
    hover: {
      boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      transition: springs.smooth,
    },
  } as Variants,

  // Button with micro-interaction
  button: {
    initial: { scale: 1 },
    hover: {
      scale: 1.03,
      transition: springs.micro,
    },
    tap: {
      scale: 0.97,
      transition: { duration: durations.instant },
    },
    focus: {
      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.4)',
    },
  } as Variants,

  // Primary button with glow
  buttonPrimary: {
    initial: { scale: 1, boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)' },
    hover: {
      scale: 1.03,
      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.35)',
      transition: springs.micro,
    },
    tap: {
      scale: 0.97,
      boxShadow: '0 5px 15px rgba(139, 92, 246, 0.3)',
      transition: { duration: durations.instant },
    },
  } as Variants,

  // Icon button
  iconButton: {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: springs.bouncy,
    },
    tap: {
      scale: 0.9,
      rotate: -5,
      transition: { duration: durations.instant },
    },
  } as Variants,

  // Input field
  input: {
    initial: {
      scale: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    focus: {
      scale: 1.01,
      borderColor: 'rgba(139, 92, 246, 0.5)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)',
      transition: springs.micro,
    },
    error: {
      borderColor: 'rgba(239, 68, 68, 0.5)',
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
    },
  } as Variants,

  // Modal
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: springs.snappy,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: durations.fast },
    },
  } as Variants,

  // Backdrop
  backdrop: {
    initial: { opacity: 0, backdropFilter: 'blur(0px)' },
    animate: {
      opacity: 1,
      backdropFilter: 'blur(8px)',
      transition: { duration: durations.normal },
    },
    exit: {
      opacity: 0,
      transition: { duration: durations.fast },
    },
  } as Variants,

  // Tooltip
  tooltip: {
    initial: { opacity: 0, scale: 0.9, y: 5 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { ...springs.micro, delay: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: durations.instant },
    },
  } as Variants,

  // Notification/Toast
  notification: {
    initial: { opacity: 0, y: -20, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springs.bouncy,
    },
    exit: {
      opacity: 0,
      x: 100,
      scale: 0.9,
      transition: { duration: durations.fast },
    },
  } as Variants,

  // Sidebar panel
  sidebar: {
    initial: { x: -300, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: springs.gentle,
    },
    exit: {
      x: -300,
      opacity: 0,
      transition: { duration: durations.normal },
    },
  } as Variants,

  // Dropdown menu
  dropdown: {
    initial: { opacity: 0, y: -10, scaleY: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: springs.snappy,
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: { duration: durations.fast },
    },
  } as Variants,
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIST ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const listVariants = {
  // Container for staggered children
  container: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  } as Variants,

  // Fast stagger
  containerFast: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.03, delayChildren: 0.05 },
    },
  } as Variants,

  // Slow stagger (for dramatic effect)
  containerSlow: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  } as Variants,

  // List item fade up
  itemFadeUp: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.normal, ease: easings.linear },
    },
  } as Variants,

  // List item slide in
  itemSlideIn: {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: springs.smooth,
    },
  } as Variants,

  // List item scale
  itemScale: {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
      opacity: 1,
      scale: 1,
      transition: springs.bouncy,
    },
  } as Variants,
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTINUOUS ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const loopAnimations = {
  // Breathing scale
  breathe: {
    scale: [1, 1.02, 1],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },

  // Floating
  float: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },

  // Pulse glow
  pulse: {
    boxShadow: [
      '0 0 20px rgba(139, 92, 246, 0.2)',
      '0 0 40px rgba(139, 92, 246, 0.4)',
      '0 0 20px rgba(139, 92, 246, 0.2)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },

  // Shimmer (loading)
  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },

  // Spin
  spin: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },

  // Orbit
  orbit: {
    rotate: 360,
    transition: { duration: 8, repeat: Infinity, ease: 'linear' },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create staggered animation for children
 */
export function staggerChildren(stagger: number = 0.05, delay: number = 0): Transition {
  return {
    staggerChildren: stagger,
    delayChildren: delay,
  }
}

/**
 * Create a delayed transition
 */
export function withDelay(transition: Transition, delay: number): Transition {
  return { ...transition, delay }
}

/**
 * Generate random stagger for organic feel
 */
export function randomStagger(base: number = 0.05, variance: number = 0.02): number {
  return base + (Math.random() - 0.5) * variance * 2
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const motion2026 = {
  easings,
  springs,
  durations,
  pageTransitions,
  components: componentVariants,
  lists: listVariants,
  loops: loopAnimations,
  staggerChildren,
  withDelay,
  randomStagger,
}

export default motion2026
