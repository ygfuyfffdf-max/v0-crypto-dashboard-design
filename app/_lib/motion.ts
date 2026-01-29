'use client'

/**
 * CHRONOS INFINITY 2030 - ADVANCED MOTION SYSTEM
 * Premium animations inspired by Apple, Linear, Arc Browser
 */

import type { Variants, Transition } from 'motion/react'

// Base transitions
const springSmooth: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
}

const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
}

const springGentle: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
}

const easeOut: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
}

// Reveal animations
export const chronosMotion = {
  // Basic reveal
  reveal: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: easeOut },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  } as Variants,

  // Reveal with scale
  revealScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: springSmooth },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  } as Variants,

  // Container for staggered children
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Card variants
  card: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springSmooth,
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: springBouncy,
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  } as Variants,

  // Gold card with glow
  cardGold: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: springSmooth },
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: '0 0 40px rgba(251, 191, 36, 0.3)',
      transition: springBouncy,
    },
    tap: { scale: 0.98 },
  } as Variants,

  // Violet card with glow
  cardViolet: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: springSmooth },
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
      transition: springBouncy,
    },
    tap: { scale: 0.98 },
  } as Variants,

  // Plasma card with glow
  cardPlasma: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: springSmooth },
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: '0 0 40px rgba(236, 72, 153, 0.3)',
      transition: springBouncy,
    },
    tap: { scale: 0.98 },
  } as Variants,

  // KPI card with subtle lift
  kpi: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: springSmooth },
    hover: {
      y: -2,
      scale: 1.01,
      transition: springGentle,
    },
  } as Variants,

  // Button with glow
  buttonGlow: {
    initial: { scale: 1 },
    hover: {
      scale: 1.03,
      boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)',
      transition: springBouncy,
    },
    tap: { scale: 0.97 },
  } as Variants,

  // Standard button
  button: {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: springBouncy },
    tap: { scale: 0.98 },
  } as Variants,

  // Slide in from left
  slideLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0, transition: easeOut },
    exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
  } as Variants,

  // Slide in from right
  slideRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0, transition: easeOut },
    exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
  } as Variants,

  // Fade only
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  } as Variants,

  // List item for staggered lists
  listItem: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: springSmooth },
    exit: { opacity: 0, x: 10 },
  } as Variants,

  // Modal/overlay backdrop
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  } as Variants,

  // Modal content
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: springSmooth,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  } as Variants,

  // 3D rotation effect
  rotate3D: {
    initial: { rotateY: -15, opacity: 0 },
    animate: { rotateY: 0, opacity: 1, transition: springSmooth },
    hover: { rotateY: 5, transition: springGentle },
  } as Variants,

  // Floating animation (for 3D objects)
  float: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  // Pulse glow
  pulseGlow: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(139, 92, 246, 0.2)',
        '0 0 40px rgba(139, 92, 246, 0.4)',
        '0 0 20px rgba(139, 92, 246, 0.2)',
      ],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  // Breathe scale
  breathe: {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  // Shimmer effect (for loading)
  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      },
    },
  } as Variants,
}

// Transition presets
export const transitions = {
  smooth: springSmooth,
  bouncy: springBouncy,
  gentle: springGentle,
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  normal: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
}

// Stagger configs
export const stagger = {
  fast: { staggerChildren: 0.03 },
  normal: { staggerChildren: 0.05 },
  slow: { staggerChildren: 0.1 },
}

export default chronosMotion
