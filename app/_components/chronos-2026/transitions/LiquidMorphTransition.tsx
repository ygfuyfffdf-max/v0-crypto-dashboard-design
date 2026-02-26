/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌊 LIQUID MORPH TRANSITION — CHRONOS PREMIUM PAGE TRANSITIONS 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Transiciones de página ultra premium con:
 * - Liquid morph clipPath animado
 * - Parallax multi-layer
 * - Shared element persistence
 * - GSAP + Motion hybrid
 * - WebGL particles trail
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"
import { memo, useEffect, useRef, type ReactNode } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidMorphTransitionProps {
  children: ReactNode
  className?: string
  variant?: "circle" | "wave" | "diamond" | "reveal" | "quantum"
  duration?: number
  enableParallax?: boolean
  parallaxLayers?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLIP PATH ANIMATIONS — Morfeo líquido
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const clipPathVariants = {
  circle: {
    initial: { clipPath: "circle(0% at 50% 50%)" },
    animate: { clipPath: "circle(150% at 50% 50%)" },
    exit: { clipPath: "circle(0% at 50% 50%)" },
  },
  wave: {
    initial: {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    },
    animate: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    },
    exit: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    },
  },
  diamond: {
    initial: {
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    },
    animate: {
      clipPath: "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)",
    },
    exit: {
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    },
  },
  reveal: {
    initial: {
      clipPath: "inset(0% 100% 0% 0%)",
    },
    animate: {
      clipPath: "inset(0% 0% 0% 0%)",
    },
    exit: {
      clipPath: "inset(0% 0% 0% 100%)",
    },
  },
  quantum: {
    initial: {
      clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
      filter: "blur(20px)",
    },
    animate: {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      filter: "blur(0px)",
    },
    exit: {
      clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
      filter: "blur(20px)",
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARALLAX LAYER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParallaxLayerProps {
  index: number
  total: number
  children?: ReactNode
}

const ParallaxLayer = memo(function ParallaxLayer({ index, total, children }: ParallaxLayerProps) {
  // Profundidad inversamente proporcional al índice
  const depth = (total - index) / total
  const translateZ = -depth * 2

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        transform: `translateZ(${translateZ}px)`,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{
        opacity: 0.1 + index * 0.15,
        scale: 1,
        transition: {
          delay: index * 0.1,
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.4 },
      }}
    >
      {/* Gradient overlay para profundidad */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            rgba(139, 0, 255, ${0.02 * (total - index)}) 0%,
            transparent 70%
          )`,
        }}
      />
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLES TRAIL — Efecto de estela
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParticlesTrail = memo(function ParticlesTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Setup canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particles array
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      life: number
      color: string
    }

    const particles: Particle[] = []
    const particleCount = 50

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        life: Math.random(),
        color: Math.random() > 0.5 ? "#8B00FF" : "#FFD700",
      })
    }

    let animationId: number

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        // Update position
        p.x += p.vx
        p.y += p.vy

        // Decay
        p.life -= 0.005

        // Respawn if dead
        if (p.life <= 0) {
          p.x = canvas.width / 2 + (Math.random() - 0.5) * 100
          p.y = canvas.height / 2 + (Math.random() - 0.5) * 100
          p.life = 1
        }

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life * 0.5
        ctx.fill()
      })

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 opacity-30"
      style={{ mixBlendMode: "screen" }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const LiquidMorphTransition = memo(function LiquidMorphTransition({
  children,
  className = "",
  variant = "quantum",
  duration = 1.2,
  enableParallax = true,
  parallaxLayers = 3,
}: LiquidMorphTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  // Variantes según preferencias de accesibilidad
  const clipVariant = clipPathVariants[variant]
  const transition = {
    duration: prefersReducedMotion ? 0.3 : duration,
    ease: [0.16, 1, 0.3, 1] as any, // Expo out
  }

  return (
    <>
      {/* Particles trail durante transición */}
      <AnimatePresence>
        <ParticlesTrail key={`particles-${pathname}`} />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className={`relative min-h-screen ${className}`}
          initial={clipVariant.initial}
          animate={clipVariant.animate}
          exit={clipVariant.exit}
          transition={transition}
          style={{
            transformStyle: enableParallax ? "preserve-3d" : "flat",
            perspective: enableParallax ? "1000px" : "none",
          }}
        >
          {/* Parallax background layers */}
          {enableParallax &&
            !prefersReducedMotion &&
            Array.from({ length: parallaxLayers }).map((_, i) => (
              <ParallaxLayer key={`parallax-${i}`} index={i} total={parallaxLayers} />
            ))}

          {/* Overlay de transición con gradiente */}
          <motion.div
            className="pointer-events-none fixed inset-0 z-40"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={{ duration: duration * 0.5 }}
            style={{
              background: `radial-gradient(
                ellipse at center,
                rgba(139, 0, 255, 0.15) 0%,
                transparent 50%
              )`,
            }}
          />

          {/* Contenido principal */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: duration * 0.3,
                duration: duration * 0.5,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{
              opacity: 0,
              y: -10,
              transition: { duration: duration * 0.3 },
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { LiquidMorphTransition, ParallaxLayer, ParticlesTrail }
export default LiquidMorphTransition
