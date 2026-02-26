"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬 CHRONOS PAGE TRANSITION WRAPPER — CINEMATOGRAPHIC NAVIGATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper universal para transiciones de página entre paneles del dashboard.
 * Implementa animaciones de entrada/salida premium inspiradas en Apple Vision Pro.
 *
 * Características:
 * - Exit current: fade + scale down + y offset
 * - Enter new: fade + scale from larger + y offset spring
 * - Shared elements persist (header)
 * - Parallax layers
 * - Particle trails on navigation
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"
import { memo, type ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PageTransitionWrapperProps {
  children: ReactNode
  variant?: "slide" | "fade" | "scale" | "morph" | "quantum"
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTS — Animaciones de transición cinematográficas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageVariants: Record<string, any> = {
  slide: {
    initial: {
      opacity: 0,
      y: 60,
      scale: 0.96,
      filter: "blur(8px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Expo out
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -40,
      scale: 0.95,
      filter: "blur(4px)",
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 1, 1], // Ease in
      },
    },
  },

  fade: {
    initial: {
      opacity: 0,
      scale: 1.02,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  scale: {
    initial: {
      opacity: 0,
      scale: 0.92,
      y: 30,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 30,
        staggerChildren: 0.04,
        delayChildren: 0.08,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      y: -20,
      transition: {
        duration: 0.35,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  morph: {
    initial: {
      opacity: 0,
      scale: 0.95,
      rotateX: -5,
      y: 80,
      transformPerspective: 1200,
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.06,
        delayChildren: 0.12,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      rotateX: 5,
      y: -60,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },

  quantum: {
    initial: {
      opacity: 0,
      scale: 0.88,
      y: 100,
      filter: "blur(20px) saturate(0)",
      rotateY: -10,
      transformPerspective: 1500,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px) saturate(1)",
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.05,
        delayChildren: 0.15,
        filter: { duration: 0.6 },
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      y: -80,
      filter: "blur(12px) saturate(0.5)",
      rotateY: 5,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  // 🌊 LIQUID MORPH — ClipPath circle expand ultra premium
  liquid: {
    initial: {
      opacity: 0,
      clipPath: "circle(0% at 50% 50%)",
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      clipPath: "circle(150% at 50% 50%)",
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        clipPath: { duration: 1.0, ease: [0.76, 0, 0.24, 1] },
        staggerChildren: 0.06,
        delayChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      clipPath: "circle(0% at 50% 50%)",
      scale: 1.02,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  // ✨ PARALLAX 3D — Multi-layer depth effect
  parallax: {
    initial: {
      opacity: 0,
      z: -200,
      scale: 0.85,
      rotateX: -15,
      transformPerspective: 2000,
      filter: "blur(15px)",
    },
    animate: {
      opacity: 1,
      z: 0,
      scale: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      z: 150,
      scale: 1.1,
      rotateX: 10,
      filter: "blur(10px)",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  // 🎭 REVEAL — Mask wipe cinematic
  reveal: {
    initial: {
      opacity: 0,
      clipPath: "inset(0 100% 0 0)",
      x: 50,
    },
    animate: {
      opacity: 1,
      clipPath: "inset(0 0% 0 0)",
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
        staggerChildren: 0.04,
        delayChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      clipPath: "inset(0 0 0 100%)",
      x: -50,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 1, 1],
      },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CHILD VARIANTS — Para stagger effects en children
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const childVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
  },
}

export const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.94,
    rotateX: -8,
    transformPerspective: 1000,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.96,
  },
}

export const statVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 25,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
}

export const tableRowVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.98,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PageTransitionWrapper = memo(function PageTransitionWrapper({
  children,
  variant = "quantum",
  className = "",
}: PageTransitionWrapperProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  // Si el usuario prefiere menos movimiento, usar variante simple
  const activeVariant = prefersReducedMotion ? "fade" : variant
  const variants = pageVariants[activeVariant]

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, filter",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STAGGER CONTAINER — Para grupos de elementos con entrada escalonada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
}

export const StaggerContainer = memo(function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.05,
  delayChildren = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayChildren,
          },
        },
        exit: {
          transition: {
            staggerChildren: 0.02,
            staggerDirection: -1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STAGGER ITEM — Item individual con animación de entrada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggerItemProps {
  children: ReactNode
  className?: string
  variant?: "default" | "card" | "stat" | "row"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const variantMap: Record<string, any> = {
  default: childVariants,
  card: cardVariants,
  stat: statVariants,
  row: tableRowVariants,
}

export const StaggerItem = memo(function StaggerItem({
  children,
  className = "",
  variant = "default",
}: StaggerItemProps) {
  const variants = variantMap[variant]

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COUNT UP NUMBER — Animación de números
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CountUpProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function CountUp({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountUpProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        {prefix}
      </motion.span>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration }}>
        {value.toLocaleString("es-MX", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: duration }}
      >
        {suffix}
      </motion.span>
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default PageTransitionWrapper

