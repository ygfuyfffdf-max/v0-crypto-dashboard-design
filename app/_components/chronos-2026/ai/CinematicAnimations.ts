/**
 * 🎬 CINEMATIC ANIMATIONS — Sistema de animaciones cinematográficas avanzadas
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Spring physics, easing curves, orchestration, keyframes complejos
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { Variants } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPRING PRESETS — Configuraciones de física realista
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SPRING_CONFIGS = {
  // Suave y fluido
  smooth: { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 },

  // Bouncy y divertido
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 17, mass: 0.8 },

  // Snappy y responsivo
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 },

  // Suave pero firme
  gentle: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1.2 },

  // Muy elástico
  elastic: { type: 'spring' as const, stiffness: 300, damping: 12, mass: 0.6 },

  // Wobbly divertido
  wobbly: { type: 'spring' as const, stiffness: 180, damping: 10, mass: 1 },

  // Stiff y preciso
  stiff: { type: 'spring' as const, stiffness: 700, damping: 40, mass: 0.3 },

  // Slow y dramático
  slow: { type: 'spring' as const, stiffness: 80, damping: 25, mass: 1.5 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EASING CURVES — Curvas de easing personalizadas
// ═══════════════════════════════════════════════════════════════════════════════════════

export const EASING = {
  // Expo
  expoIn: [0.95, 0.05, 0.795, 0.035],
  expoOut: [0.19, 1, 0.22, 1],
  expoInOut: [1, 0, 0, 1],

  // Circ
  circIn: [0.6, 0.04, 0.98, 0.335],
  circOut: [0.075, 0.82, 0.165, 1],
  circInOut: [0.785, 0.135, 0.15, 0.86],

  // Back (overshoot)
  backIn: [0.6, -0.28, 0.735, 0.045],
  backOut: [0.175, 0.885, 0.32, 1.275],
  backInOut: [0.68, -0.55, 0.265, 1.55],

  // Custom
  smooth: [0.4, 0, 0.2, 1],
  snappy: [0.25, 0.46, 0.45, 0.94],
  dramatic: [0.87, 0, 0.13, 1],
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS — Variantes de animación reutilizables
// ═══════════════════════════════════════════════════════════════════════════════════════

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_CONFIGS.gentle,
      duration: 0.6,
    },
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...SPRING_CONFIGS.gentle,
      duration: 0.6,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRING_CONFIGS.bouncy,
    },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      ...SPRING_CONFIGS.snappy,
    },
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      ...SPRING_CONFIGS.snappy,
    },
  },
}

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -10, scale: 0.9 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      ...SPRING_CONFIGS.elastic,
    },
  },
}

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(20px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: EASING.smooth,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ORCHESTRATION — Animaciones coordinadas en secuencia
// ═══════════════════════════════════════════════════════════════════════════════════════

export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const staggerChildrenFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPLEX ANIMATIONS — Animaciones complejas multi-step
// ═══════════════════════════════════════════════════════════════════════════════════════

export const morphIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -5,
    borderRadius: '100%',
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    borderRadius: '12px',
    transition: {
      duration: 0.8,
      ease: EASING.backOut,
    },
  },
}

export const rippleOut: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: [0, 1.2, 1],
    opacity: [0, 0.8, 0],
    transition: {
      duration: 1.5,
      ease: EASING.circOut,
      times: [0, 0.5, 1],
    },
  },
}

export const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

export const pulseGlow = {
  scale: [1, 1.05, 1],
  opacity: [0.7, 1, 0.7],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MICRO-INTERACTIONS — Interacciones sutiles para feedback
// ═══════════════════════════════════════════════════════════════════════════════════════

export const hoverLift = {
  whileHover: {
    y: -4,
    scale: 1.02,
    transition: SPRING_CONFIGS.snappy,
  },
  whileTap: {
    y: -1,
    scale: 0.98,
    transition: SPRING_CONFIGS.stiff,
  },
}

export const hoverScale = {
  whileHover: {
    scale: 1.05,
    transition: SPRING_CONFIGS.bouncy,
  },
  whileTap: {
    scale: 0.95,
    transition: SPRING_CONFIGS.stiff,
  },
}

export const hoverRotate = {
  whileHover: {
    rotate: 5,
    scale: 1.05,
    transition: SPRING_CONFIGS.elastic,
  },
  whileTap: {
    rotate: 0,
    scale: 0.95,
    transition: SPRING_CONFIGS.stiff,
  },
}

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
    transition: { duration: 0.3 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LOADING STATES — Estados de carga elegantes
// ═══════════════════════════════════════════════════════════════════════════════════════

export const shimmer = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  },
}

export const spin = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
}

export const pulse = {
  scale: [1, 1.1, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITIONS — Transiciones de página completa
// ═══════════════════════════════════════════════════════════════════════════════════════

export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: {
    duration: 0.5,
    ease: EASING.smooth,
  },
}

export const modalTransition = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: {
    ...SPRING_CONFIGS.gentle,
    duration: 0.3,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// KEYFRAMES — Animaciones keyframe complejas
// ═══════════════════════════════════════════════════════════════════════════════════════

export const waveMotion = {
  y: [0, -10, 0, 10, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
    times: [0, 0.25, 0.5, 0.75, 1],
  },
}

export const breathingScale = {
  scale: [1, 1.03, 1, 0.97, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

export const morphingBorder = {
  borderRadius: ['20% 80% 60% 40%', '40% 60% 80% 20%', '60% 40% 20% 80%', '20% 80% 60% 40%'],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

export const colorShift = (colors: string[]) => ({
  background: colors,
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear',
  },
})

// ═══════════════════════════════════════════════════════════════════════════════════════
// GESTURE RESPONSES — Respuestas a gestos
// ═══════════════════════════════════════════════════════════════════════════════════════

export const dragConstraints = {
  drag: true,
  dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  dragElastic: 0.2,
  dragTransition: { bounceStiffness: 300, bounceDamping: 20 },
}

export const swipeToDelete = {
  drag: 'x' as const,
  dragConstraints: { left: -100, right: 0 },
  onDragEnd: (event: any, info: any) => {
    if (info.offset.x < -50) {
      // Trigger delete
      console.log('Delete triggered')
    }
  },
}
