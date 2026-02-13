"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ KOCMOC LOGO OPENING ENHANCED — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * 5-Stage Space Logo Animation (inspired by "Space Logo Animation by Akash Goel")
 *
 * STAGE 1 (0-2s): Deep space void with drifting star particles and nebula color wash
 * STAGE 2 (2-4s): Orbital rings form from particle streams converging into logo
 * STAGE 3 (4-5.5s): Central orb ignites with radial burst and bloom glow
 * STAGE 4 (5.5-6.5s): "КОСМОС" text materializes letter-by-letter with chromatic aberration
 * STAGE 5 (6.5-7s): Quick fade-to-white flash then redirect
 *
 * Tech: Pure CSS keyframes + Framer Motion timeline + Canvas 2D star field
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AnimatePresence, motion } from "motion/react"
import { memo, useCallback, useEffect, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KocmocLogoOpeningEnhancedProps {
  onComplete?: () => void
  duration?: number
  skipEnabled?: boolean
  showText?: boolean
  textContent?: string
}

type Stage = "void" | "rings" | "ignition" | "text" | "flash" | "complete"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const STAGE_TIMING = {
  void: 0,
  rings: 2000,
  ignition: 4000,
  text: 5500,
  flash: 6500,
  complete: 7000,
}

const ORBIT_CONFIGS = [
  { radius: 50, strokeWidth: 1.5, delay: 0 },
  { radius: 80, strokeWidth: 1.2, delay: 0.15 },
  { radius: 120, strokeWidth: 1, delay: 0.3 },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: StarField - Canvas 2D star particles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const StarField = memo(function StarField({ stage }: { stage: Stage }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Generate stars
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.8 + 0.2,
    }))

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        // Drift stars slowly
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Add subtle twinkle
        star.opacity += (Math.random() - 0.5) * 0.02
        star.opacity = Math.max(0.2, Math.min(0.8, star.opacity))
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: stage === "void" || stage === "rings" ? 1 : 0.3,
        transition: "opacity 1s ease",
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: NebulaBackground - Animated color wash
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const NebulaBackground = memo(function NebulaBackground({ stage }: { stage: Stage }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{
        opacity: stage === "void" || stage === "rings" ? 0.4 : 0.2,
      }}
      transition={{ duration: 2 }}
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 70% 80%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse 40% 60% at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
        `,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: OrbitalRings - SVG orbital rings with particle stream formation
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const OrbitalRings = memo(function OrbitalRings({ stage }: { stage: Stage }) {
  const center = 150

  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      {ORBIT_CONFIGS.map((config, i) => (
        <motion.circle
          key={i}
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          stroke="rgba(139, 92, 246, 0.6)"
          strokeWidth={config.strokeWidth}
          strokeDasharray="4 8"
          initial={{ pathLength: 0, opacity: 0, rotate: 0 }}
          animate={
            stage === "rings" || stage === "ignition" || stage === "text"
              ? {
                  pathLength: 1,
                  opacity: [0, 1, 1],
                  rotate: 360,
                }
              : { pathLength: 0, opacity: 0 }
          }
          transition={{
            pathLength: { duration: 1.5, delay: config.delay, ease: "easeOut" },
            opacity: { duration: 0.5, delay: config.delay },
            rotate: {
              duration: 20 + i * 10,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          style={{ originX: "50%", originY: "50%" }}
        />
      ))}
    </svg>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: CentralOrb - Pulsing central sphere with ignition burst
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CentralOrb = memo(function CentralOrb({ stage }: { stage: Stage }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* Radial burst effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={
          stage === "ignition" || stage === "text"
            ? { scale: [0, 3, 4], opacity: [0, 0.8, 0] }
            : { scale: 0, opacity: 0 }
        }
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          width: "80px",
          height: "80px",
          marginLeft: "-40px",
          marginTop: "-40px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Main orb */}
      <motion.div
        className="relative rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={
          stage === "rings" || stage === "ignition" || stage === "text"
            ? { scale: 1, opacity: 1 }
            : { scale: 0, opacity: 0 }
        }
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          width: "32px",
          height: "32px",
          background: "radial-gradient(circle, #A78BFA 0%, #8B5CF6 50%, #6D28D9 100%)",
          boxShadow: "0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.4)",
        }}
      >
        {/* Bloom glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={
            stage === "ignition" || stage === "text"
              ? { scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(circle, rgba(167, 139, 250, 0.6) 0%, transparent 70%)",
            filter: "blur(15px)",
          }}
        />
      </motion.div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT: KosmosText - Letter-by-letter text reveal with chromatic aberration
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const KosmosText = memo(function KosmosText({
  stage,
  textContent,
}: {
  stage: Stage
  textContent: string
}) {
  const letters = textContent.split("")

  return (
    <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 translate-y-32 gap-1">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="text-6xl font-bold text-white"
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={
            stage === "text" || stage === "flash"
              ? {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }
              : { opacity: 0 }
          }
          transition={{
            duration: 0.3,
            delay: i * 0.1,
            ease: "easeOut",
          }}
          style={{
            textShadow: `
              2px 0 0 rgba(6, 182, 212, 0.5),
              -2px 0 0 rgba(236, 72, 153, 0.5),
              0 0 40px rgba(139, 92, 246, 0.8)
            `,
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const KocmocLogoOpeningEnhanced = memo(function KocmocLogoOpeningEnhanced({
  onComplete,
  duration = 7000,
  skipEnabled = true,
  showText = true,
  textContent = "КОСМОС",
}: KocmocLogoOpeningEnhancedProps) {
  const [stage, setStage] = useState<Stage>("void")
  const [canSkip, setCanSkip] = useState(false)

  // Stage progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setStage("rings"), STAGE_TIMING.rings))
    timers.push(setTimeout(() => setStage("ignition"), STAGE_TIMING.ignition))
    timers.push(setTimeout(() => setStage("text"), STAGE_TIMING.text))
    timers.push(setTimeout(() => setStage("flash"), STAGE_TIMING.flash))
    timers.push(
      setTimeout(() => {
        setStage("complete")
        onComplete?.()
      }, STAGE_TIMING.complete)
    )

    // Enable skip after 1 second
    if (skipEnabled) {
      timers.push(setTimeout(() => setCanSkip(true), 1000))
    }

    return () => timers.forEach(clearTimeout)
  }, [onComplete, skipEnabled])

  const handleSkip = useCallback(() => {
    if (canSkip) {
      setStage("complete")
      onComplete?.()
    }
  }, [canSkip, onComplete])

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black">
      {/* Star field */}
      <StarField stage={stage} />

      {/* Nebula background */}
      <NebulaBackground stage={stage} />

      {/* Orbital rings */}
      <OrbitalRings stage={stage} />

      {/* Central orb */}
      <CentralOrb stage={stage} />

      {/* Text */}
      {showText && <KosmosText stage={stage} textContent={textContent} />}

      {/* Flash overlay */}
      <AnimatePresence>
        {stage === "flash" && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Skip button */}
      {skipEnabled && canSkip && stage !== "complete" && (
        <motion.button
          onClick={handleSkip}
          className="absolute right-8 bottom-8 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Skip
        </motion.button>
      )}
    </div>
  )
})
