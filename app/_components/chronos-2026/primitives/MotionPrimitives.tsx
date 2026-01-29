"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡✨ MOTION PRIMITIVES — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Colección de primitivas de animación reutilizables basadas en Framer Motion.
 * Diseñadas para composición y máxima flexibilidad.
 *
 * Incluye:
 * - FadeIn / FadeInUp / FadeInDown / FadeInScale
 * - SlideIn / SlideUp / SlideDown
 * - ScaleIn / ScaleUp
 * - Stagger containers
 * - Hover effects
 * - Magnetic elements
 * - Reveal on scroll
 * - Typewriter text
 * - Counter animations
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  type Variants,
} from "motion/react"
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS BASE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BaseAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
  disabled?: boolean
}

type SpringPreset = "gentle" | "snappy" | "bouncy" | "stiff" | "molasses"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES: Springs predefinidos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SPRING_PRESETS: Record<SpringPreset, SpringOptions> = {
  gentle: { stiffness: 120, damping: 20, mass: 1 },
  snappy: { stiffness: 400, damping: 30, mass: 0.5 },
  bouncy: { stiffness: 300, damping: 15, mass: 1 },
  stiff: { stiffness: 500, damping: 40, mass: 0.8 },
  molasses: { stiffness: 80, damping: 30, mass: 1.5 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTS PREDEFINIDOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0 },
}

export const fadeScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
}

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
}

export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FadeIn - Fade simple
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const FadeIn = memo(function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3,
  disabled = false,
}: BaseAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeVariants}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FadeInUp - Fade con slide up
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const FadeInUp = memo(function FadeInUp({
  children,
  className,
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.3,
  disabled = false,
}: BaseAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUpVariants}
      transition={{ type: "spring", ...SPRING_PRESETS.gentle, delay }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FadeInDown - Fade con slide down
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const FadeInDown = memo(function FadeInDown({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  disabled = false,
}: BaseAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeDownVariants}
      transition={{ type: "spring", ...SPRING_PRESETS.gentle, delay }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FadeInScale - Fade con scale
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const FadeInScale = memo(function FadeInScale({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  disabled = false,
}: BaseAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeScaleVariants}
      transition={{ type: "spring", ...SPRING_PRESETS.snappy, delay }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: StaggerContainer - Container con stagger children
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggerContainerProps extends BaseAnimationProps {
  staggerDelay?: number
  childrenDelay?: number
}

export const StaggerContainer = memo(function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  childrenDelay = 0.1,
  once = true,
  amount = 0.2,
  disabled = false,
}: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay,
            staggerChildren: staggerDelay,
            delayChildren: childrenDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: StaggerItem - Item dentro de StaggerContainer
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StaggerItemProps {
  children: ReactNode
  className?: string
  variant?: "fadeUp" | "fadeScale" | "slideLeft" | "slideRight"
}

export const StaggerItem = memo(function StaggerItem({
  children,
  className,
  variant = "fadeUp",
}: StaggerItemProps) {
  const variants: Record<string, Variants> = {
    fadeUp: fadeUpVariants,
    fadeScale: fadeScaleVariants,
    slideLeft: slideLeftVariants,
    slideRight: slideRightVariants,
  }

  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      transition={{ type: "spring", ...SPRING_PRESETS.snappy }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: HoverScale - Scale on hover
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HoverScaleProps {
  children: ReactNode
  className?: string
  scale?: number
  spring?: SpringPreset
}

export const HoverScale = memo(function HoverScale({
  children,
  className,
  scale = 1.05,
  spring = "snappy",
}: HoverScaleProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: scale - 0.05 }}
      transition={{ type: "spring", ...SPRING_PRESETS[spring] }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: HoverTilt - Tilt 3D on hover
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HoverTiltProps {
  children: ReactNode
  className?: string
  intensity?: number
  perspective?: number
}

export const HoverTilt = memo(function HoverTilt({
  children,
  className,
  intensity = 15,
  perspective = 1000,
}: HoverTiltProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], [intensity, -intensity]),
    SPRING_PRESETS.snappy
  )
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], [-intensity, intensity]),
    SPRING_PRESETS.snappy
  )

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
      style={{ perspective, rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: MagneticElement - Elemento que sigue el cursor
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MagneticElementProps {
  children: ReactNode
  className?: string
  strength?: number
}

export const MagneticElement = memo(function MagneticElement({
  children,
  className,
  strength = 0.3,
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, SPRING_PRESETS.snappy)
  const springY = useSpring(y, SPRING_PRESETS.snappy)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      x.set((e.clientX - centerX) * strength)
      y.set((e.clientY - centerY) * strength)
    },
    [x, y, strength]
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TypewriterText - Texto con efecto typewriter
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
  delay?: number
  cursor?: boolean
}

export const TypewriterText = memo(function TypewriterText({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, speed, delay])

  useEffect(() => {
    if (!cursor) return
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [cursor])

  return (
    <span className={className}>
      {displayText}
      {cursor && (
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.1 }}
          className="ml-0.5 inline-block h-[1em] w-[2px] bg-current"
        />
      )}
    </span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: AnimatedCounter - Contador animado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
  value: number
  className?: string
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  formatOptions?: Intl.NumberFormatOptions
}

export const AnimatedCounter = memo(function AnimatedCounter({
  value,
  className,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  formatOptions,
}: AnimatedCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration,
  })
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (v) => {
      const formatted = formatOptions
        ? new Intl.NumberFormat("es-MX", formatOptions).format(v)
        : v.toFixed(decimals)
      setDisplayValue(formatted)
    })
    return unsubscribe
  }, [springValue, decimals, formatOptions])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: BlurReveal - Reveal con blur
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const BlurReveal = memo(function BlurReveal({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.3,
  disabled = false,
}: BaseAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
      animate={
        isInView
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(20px)", y: 20 }
      }
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ParallaxScroll - Parallax on scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParallaxScrollProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down"
}

export const ParallaxScroll = memo(function ParallaxScroll({
  children,
  className,
  speed = 0.5,
  direction = "up",
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [elementTop, setElementTop] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updateScrollY = () => {
      setScrollY(window.scrollY)
      setElementTop(element.getBoundingClientRect().top + window.scrollY)
    }

    updateScrollY()
    window.addEventListener("scroll", updateScrollY, { passive: true })
    window.addEventListener("resize", updateScrollY)

    return () => {
      window.removeEventListener("scroll", updateScrollY)
      window.removeEventListener("resize", updateScrollY)
    }
  }, [])

  const y = useMemo(() => {
    const offset = (scrollY - elementTop + window.innerHeight) * speed
    return direction === "up" ? -offset : offset
  }, [scrollY, elementTop, speed, direction])

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default {
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInScale,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  HoverTilt,
  MagneticElement,
  TypewriterText,
  AnimatedCounter,
  BlurReveal,
  ParallaxScroll,
}
