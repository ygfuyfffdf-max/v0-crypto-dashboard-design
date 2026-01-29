"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎭✨ PREMIUM MOTION COMPONENTS — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes Motion avanzados con stagger, gesture velocity, parallax 3D y shared layout.
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react"
import { memo, useCallback, useRef, useState, type ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggerEntranceProps {
  children: ReactNode[]
  stagger?: number
  delay?: number
  className?: string
  direction?: "up" | "down" | "left" | "right" | "scale"
}

interface GestureParallaxProps {
  children: ReactNode
  className?: string
  intensity?: number
  perspective?: number
}

interface ParallaxLayer3DProps {
  children: ReactNode
  speed: number
  className?: string
}

interface SharedLayoutMorphProps {
  id: string
  children: ReactNode
  isExpanded?: boolean
  className?: string
  expandedClassName?: string
}

interface GestureVelocityCardProps {
  children: ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const directionVariants: Record<string, Variants> = {
  up: {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  },
  down: {
    hidden: { y: -50, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  },
  left: {
    hidden: { x: 50, opacity: 0, scale: 0.95 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  },
  right: {
    hidden: { x: -50, opacity: 0, scale: 0.95 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  },
  scale: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 25 },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: PremiumStaggerEntrance - Stagger children con shared layout
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PremiumStaggerEntrance = memo(function PremiumStaggerEntrance({
  children,
  stagger = 0.1,
  delay = 0.3,
  className,
  direction = "up",
}: StaggerEntranceProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={directionVariants[direction]} layoutId={`stagger-child-${i}`}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: PremiumGestureParallax - Parallax 3D con gesture drag
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PremiumGestureParallax = memo(function PremiumGestureParallax({
  children,
  className,
  intensity = 30,
  perspective = 1000,
}: GestureParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-300, 300], [intensity, -intensity])
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })

  return (
    <motion.div
      ref={ref}
      drag="y"
      dragElastic={0.2}
      dragConstraints={{ top: -300, bottom: 300 }}
      onDragEnd={() => y.set(0)}
      className={cn("cursor-grab active:cursor-grabbing", className)}
      style={{
        y,
        rotateX: springRotateX,
        perspective,
        transformStyle: "preserve-3d",
      }}
      whileDrag={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ParallaxLayer3D - Layer individual con velocidad parallax
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ParallaxLayer3D = memo(function ParallaxLayer3D({
  children,
  speed,
  className,
}: ParallaxLayer3DProps) {
  const [scrollY, setScrollY] = useState(0)

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY)
  }, [])

  // Effect para escuchar scroll
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll, { passive: true })
  }

  const y = scrollY * speed

  return (
    <motion.div className={cn("will-change-transform", className)} style={{ y }}>
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SharedLayoutMorph - Card expandible con morph
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SharedLayoutMorph = memo(function SharedLayoutMorph({
  id,
  children,
  isExpanded = false,
  className,
  expandedClassName,
}: SharedLayoutMorphProps) {
  return (
    <motion.div
      layoutId={id}
      className={cn("overflow-hidden", isExpanded ? expandedClassName : className)}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isExpanded ? "expanded" : "collapsed"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: GestureVelocityCard - Card con swipe velocity
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GestureVelocityCard = memo(function GestureVelocityCard({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
}: GestureVelocityCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  const handleDragEnd = useCallback(
    (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
      const threshold = 100
      const velocityThreshold = 500

      if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
        onSwipeRight?.()
      } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
        onSwipeLeft?.()
      }
    },
    [onSwipeLeft, onSwipeRight]
  )

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      className={cn("cursor-grab active:cursor-grabbing", className)}
      style={{ x, rotate, opacity }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: OrchestrateCelebration - Orchestrate múltiples animaciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrchestrateCelebrationProps {
  isActive: boolean
  children: ReactNode
  title?: string
  className?: string
}

export const OrchestrateCelebration = memo(function OrchestrateCelebration({
  isActive,
  children,
  title = "¡Celebración!",
  className,
}: OrchestrateCelebrationProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={cn("relative", className)}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1, times: [0, 0.5, 1] }}
        >
          {/* Título bounce */}
          <motion.h1
            className="mb-4 text-center text-4xl font-bold text-white"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            {title}
          </motion.h1>

          {/* Children con stagger */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FollowCursor3D - Elemento que sigue el cursor con tilt 3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FollowCursor3DProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export const FollowCursor3D = memo(function FollowCursor3D({
  children,
  className,
  intensity = 20,
}: FollowCursor3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 300,
    damping: 30,
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const xPos = (e.clientX - rect.left) / rect.width - 0.5
      const yPos = (e.clientY - rect.top) / rect.height - 0.5
      x.set(xPos)
      y.set(yPos)
    },
    [x, y]
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SplitTextReveal - Reveal texto letra por letra
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SplitTextRevealProps {
  text: string
  className?: string
  stagger?: number
  delay?: number
}

export const SplitTextReveal = memo(function SplitTextReveal({
  text,
  className,
  stagger = 0.03,
  delay = 0,
}: SplitTextRevealProps) {
  const letters = text.split("")

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { y: 20, opacity: 0, rotateX: -90 },
            visible: {
              y: 0,
              opacity: 1,
              rotateX: 0,
              transition: { type: "spring", stiffness: 400, damping: 25 },
            },
          }}
          style={{ transformStyle: "preserve-3d", perspective: 500 }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default {
  PremiumStaggerEntrance,
  PremiumGestureParallax,
  ParallaxLayer3D,
  SharedLayoutMorph,
  GestureVelocityCard,
  OrchestrateCelebration,
  FollowCursor3D,
  SplitTextReveal,
}
