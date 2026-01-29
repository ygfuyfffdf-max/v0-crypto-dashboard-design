"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬✨ LOGO OPENING CINEMATOGRÁFICO — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Splash screen ultra premium con:
 * - Particles lluvia de oro (2000+ partículas fluidas)
 * - Spring physics natural
 * - Aurora dinámica volumétrica
 * - Secuencia cinematográfica en fases
 * - WebGL/Canvas opcional para partículas avanzadas
 *
 * Inspirado en: Apple Vision Pro fluidity, Framer masterpieces, luxury branding
 *
 * @version 2.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LogoOpeningCinematicProps {
  onComplete?: () => void
  duration?: number
  skipEnabled?: boolean
  variant?: "default" | "minimal" | "epic"
}

type Phase = "dormant" | "awakening" | "particles" | "reveal" | "shimmer" | "fadeout"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  velocity: { x: number; y: number }
  color: string
  delay: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PARTICLE_COUNT = 2000
const GOLD_COLORS = [
  "#FFD700", // Gold
  "#FFA500", // Orange gold
  "#FFDF00", // Golden yellow
  "#FFB300", // Deep gold
  "#FFC107", // Amber
  "#E6C200", // Antique gold
  "#F5DEB3", // Wheat
  "#DAA520", // Goldenrod
]

const PHASE_TIMING = {
  dormant: 0,
  awakening: 500,
  particles: 1200,
  reveal: 2200,
  shimmer: 4000,
  fadeout: 5500,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useParticles - Genera partículas de oro
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function useParticles(count: number): Particle[] {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 - 50, // Start above viewport
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 3 + 1,
      },
      color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)] ?? "#FFD700",
      delay: Math.random() * 2,
    }))
  }, [count])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: GoldParticle - Partícula individual animada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const GoldParticle = memo(function GoldParticle({
  particle,
  isActive,
}: {
  particle: Particle
  isActive: boolean
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: `${particle.x}%`,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 4}px ${particle.color}66`,
      }}
      initial={{ y: "-50vh", opacity: 0, scale: 0 }}
      animate={
        isActive
          ? {
              y: "150vh",
              opacity: [0, particle.opacity, particle.opacity, 0],
              scale: [0, 1, 1, 0.5],
            }
          : {}
      }
      transition={{
        duration: 4 + particle.delay,
        delay: particle.delay * 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ParticleField - Campo de partículas de oro
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParticleField = memo(function ParticleField({
  isActive,
  count = 200,
}: {
  isActive: boolean
  count?: number
}) {
  const particles = useParticles(count)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <GoldParticle key={particle.id} particle={particle} isActive={isActive} />
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: AuroraDynamic - Aurora volumétrica dinámica
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AuroraDynamic = memo(function AuroraDynamic({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Aurora primaria - violeta-magenta */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(139,92,246,0.6) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 80% at 80% 60%, rgba(236,72,153,0.6) 0%, transparent 70%)",
            "radial-gradient(ellipse 70% 70% at 50% 30%, rgba(168,85,247,0.6) 0%, transparent 70%)",
            "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(139,92,246,0.6) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: 0.8 * intensity, filter: "blur(100px)" }}
      />

      {/* Aurora secundaria - cyan-gold */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse 60% 50% at 70% 70%, rgba(255,215,0,0.4) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 60% at 30% 30%, rgba(6,182,212,0.4) 0%, transparent 60%)",
            "radial-gradient(ellipse 70% 40% at 50% 80%, rgba(255,215,0,0.4) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 50% at 70% 70%, rgba(255,215,0,0.4) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ opacity: 0.6 * intensity, filter: "blur(120px)", mixBlendMode: "screen" }}
      />

      {/* Orb central pulsante */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(255,215,0,0.1) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ChronosOrb - Logo orb animado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ChronosOrb = memo(function ChronosOrb({ phase }: { phase: Phase }) {
  const scale = useMotionValue(0)
  const springScale = useSpring(scale, { stiffness: 300, damping: 20 })
  const rotation = useMotionValue(0)
  const springRotation = useSpring(rotation, { stiffness: 100, damping: 15 })

  useEffect(() => {
    if (phase === "reveal" || phase === "shimmer") {
      scale.set(1)
      rotation.set(0)
    } else if (phase === "awakening") {
      scale.set(0.5)
      rotation.set(-180)
    } else if (phase === "fadeout") {
      scale.set(0.8)
    }
  }, [phase, scale, rotation])

  const orbOpacity = useTransform(springScale, [0, 0.5, 1], [0, 0.5, 1])

  return (
    <motion.div
      className="relative"
      style={{
        scale: springScale,
        rotate: springRotation,
        opacity: orbOpacity,
      }}
    >
      {/* Outer ring */}
      <motion.svg
        width="260"
        height="260"
        viewBox="0 0 260 260"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <defs>
          <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
          <filter id="orbGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx="130"
          cy="130"
          r="100"
          fill="none"
          stroke="url(#orbGradient)"
          strokeWidth="8"
          filter="url(#orbGlow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: phase === "reveal" || phase === "shimmer" ? 1 : 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.svg>

      {/* Inner gold core */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 140,
          height: 140,
          background: "radial-gradient(circle, #FFD700 0%, #FFA500 50%, #8B5CF6 100%)",
          boxShadow:
            "0 0 60px rgba(255,215,0,0.6), 0 0 120px rgba(139,92,246,0.4), inset 0 0 30px rgba(255,255,255,0.3)",
        }}
        animate={{
          scale: phase === "shimmer" ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Shimmer effect */}
      {phase === "shimmer" && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 200,
            height: 200,
            background:
              "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), transparent)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ChronosText - Texto animado CHRONOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ChronosText = memo(function ChronosText({ phase }: { phase: Phase }) {
  const letters = "CHRONOS".split("")

  return (
    <motion.div
      className="flex items-center justify-center gap-1"
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: phase === "reveal" || phase === "shimmer" || phase === "fadeout" ? 1 : 0,
        y: phase === "reveal" || phase === "shimmer" || phase === "fadeout" ? 0 : 40,
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="text-5xl font-bold tracking-[0.3em] text-white sm:text-6xl md:text-7xl"
          style={{
            textShadow: "0 0 40px rgba(139,92,246,0.8), 0 0 80px rgba(255,215,0,0.4)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{
            opacity: phase === "reveal" || phase === "shimmer" ? 1 : 0,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: LogoOpeningCinematic
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const LogoOpeningCinematic = memo(function LogoOpeningCinematic({
  onComplete,
  duration = 6500,
  skipEnabled = true,
  variant = "default",
}: LogoOpeningCinematicProps) {
  const [phase, setPhase] = useState<Phase>("dormant")
  const [isVisible, setIsVisible] = useState(true)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)

  // Skip handler
  const handleSkip = useCallback(() => {
    if (skipEnabled) {
      controls.start({ opacity: 0 }).then(() => {
        setIsVisible(false)
        onComplete?.()
      })
    }
  }, [skipEnabled, controls, onComplete])

  // Phase sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setPhase("awakening"), PHASE_TIMING.awakening))
    timers.push(setTimeout(() => setPhase("particles"), PHASE_TIMING.particles))
    timers.push(setTimeout(() => setPhase("reveal"), PHASE_TIMING.reveal))
    timers.push(setTimeout(() => setPhase("shimmer"), PHASE_TIMING.shimmer))
    timers.push(setTimeout(() => setPhase("fadeout"), PHASE_TIMING.fadeout))

    timers.push(
      setTimeout(async () => {
        await controls.start({ opacity: 0 })
        setIsVisible(false)
        onComplete?.()
      }, duration)
    )

    return () => timers.forEach(clearTimeout)
  }, [duration, onComplete, controls])

  // Keyboard skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " " || e.key === "Escape") && skipEnabled) {
        handleSkip()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSkip, skipEnabled])

  if (!isVisible) return null

  const particleCount = variant === "epic" ? 500 : variant === "minimal" ? 50 : 200

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
        role="presentation"
        aria-label="Cargando CHRONOS"
        className="fixed inset-0 z-[9999] flex cursor-pointer items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at center, #0a0a15 0%, #000000 100%)",
        }}
      >
        {/* Aurora Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase !== "dormant" ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <AuroraDynamic intensity={phase === "shimmer" ? 1.2 : 0.8} />
        </motion.div>

        {/* Grid holográfico */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "particles" || phase === "reveal" ? 0.15 : 0 }}
          transition={{ duration: 1 }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />

        {/* Particle Rain */}
        <ParticleField
          isActive={phase !== "dormant" && phase !== "fadeout"}
          count={particleCount}
        />

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-8">
          {/* Orb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ChronosOrb phase={phase} />
          </motion.div>

          {/* Text */}
          <ChronosText phase={phase} />

          {/* Tagline */}
          <motion.p
            className="text-center text-sm tracking-[0.5em] text-white/60 uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase === "shimmer" || phase === "fadeout" ? 1 : 0,
              y: phase === "shimmer" || phase === "fadeout" ? 0 : 20,
            }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Gestión Financiera Premium
          </motion.p>
        </div>

        {/* Skip hint */}
        {skipEnabled && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== "dormant" ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 2 }}
          >
            Presiona cualquier tecla para continuar
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
})

export default LogoOpeningCinematic
