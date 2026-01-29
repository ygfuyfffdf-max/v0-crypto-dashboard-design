"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎉✨ PREMIUM CELEBRATION EFFECTS — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de efectos de celebración ultra premium para momentos de éxtasis financiero.
 *
 * Características:
 * - Particles lluvia de oro
 * - Confetti explosivo
 * - Fireworks sparkles
 * - Success pulse waves
 * - Haptic feedback patterns
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { memo, useCallback, useEffect, useMemo, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
  rotation: number
  shape: "circle" | "square" | "star"
}

interface CelebrationProps {
  isActive: boolean
  duration?: number
  particleCount?: number
  colors?: string[]
  onComplete?: () => void
}

interface SuccessPulseProps {
  isActive: boolean
  color?: string
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_COLORS = [
  "#FFD700", // Gold
  "#FFA500", // Orange
  "#FF6B6B", // Coral
  "#A855F7", // Purple
  "#06B6D4", // Cyan
  "#10B981", // Emerald
]

const HAPTIC_PATTERNS = {
  success: [50, 30, 100],
  celebration: [100, 50, 100, 50, 200],
  error: [200, 100, 200],
  tap: [10],
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function triggerHaptic(pattern: number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern)
  }
}

function generateParticles(count: number, colors: string[]): Particle[] {
  const shapes: Particle["shape"][] = ["circle", "square", "star"]
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 12 + 4,
    color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? "#FFD700",
    delay: Math.random() * 0.5,
    duration: Math.random() * 2 + 1.5,
    rotation: Math.random() * 360,
    shape: shapes[Math.floor(Math.random() * 3)] ?? "circle",
  }))
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ParticleShape - Forma del partícula
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParticleShape = memo(function ParticleShape({
  shape,
  size,
  color,
}: {
  shape: Particle["shape"]
  size: number
  color: string
}) {
  switch (shape) {
    case "circle":
      return (
        <div
          className="rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
        />
      )
    case "square":
      return (
        <div className="rotate-45" style={{ width: size, height: size, backgroundColor: color }} />
      )
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    default:
      return null
  }
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: GoldRain - Lluvia de oro
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GoldRain = memo(function GoldRain({
  isActive,
  duration = 3000,
  particleCount = 50,
  colors = ["#FFD700", "#FFA500", "#FFE066"],
  onComplete,
}: CelebrationProps) {
  const particles = useMemo(() => generateParticles(particleCount, colors), [particleCount, colors])

  useEffect(() => {
    if (isActive) {
      triggerHaptic(HAPTIC_PATTERNS.celebration)
      const timer = setTimeout(() => onComplete?.(), duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isActive, duration, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{ left: `${particle.x}%` }}
              initial={{ y: -50, opacity: 1, rotate: 0 }}
              animate={{
                y: "100vh",
                opacity: [1, 1, 0],
                rotate: particle.rotation,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeIn",
              }}
            >
              <ParticleShape shape={particle.shape} size={particle.size} color={particle.color} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ConfettiExplosion - Explosión de confetti
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ConfettiExplosion = memo(function ConfettiExplosion({
  isActive,
  duration = 2500,
  particleCount = 100,
  colors = DEFAULT_COLORS,
  onComplete,
}: CelebrationProps) {
  const particles = useMemo(() => generateParticles(particleCount, colors), [particleCount, colors])

  useEffect(() => {
    if (isActive) {
      triggerHaptic(HAPTIC_PATTERNS.celebration)
      const timer = setTimeout(() => onComplete?.(), duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isActive, duration, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((particle) => {
            const angle = Math.random() * Math.PI * 2
            const distance = Math.random() * 400 + 100
            const targetX = Math.cos(angle) * distance
            const targetY = Math.sin(angle) * distance - 200

            return (
              <motion.div
                key={particle.id}
                className="absolute top-1/2 left-1/2"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: targetX,
                  y: targetY + 400, // Gravity effect
                  opacity: [1, 1, 0],
                  scale: [1, 1, 0.5],
                  rotate: particle.rotation * 3,
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay * 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <ParticleShape shape={particle.shape} size={particle.size} color={particle.color} />
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Fireworks - Fuegos artificiales
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FireworkBurst {
  id: number
  x: number
  y: number
  color: string
  delay: number
}

export const Fireworks = memo(function Fireworks({
  isActive,
  duration = 4000,
  colors = DEFAULT_COLORS,
  onComplete,
}: Omit<CelebrationProps, "particleCount">) {
  const bursts = useMemo<FireworkBurst[]>(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
        color: colors[i % colors.length] ?? "#FFD700",
        delay: i * 0.5,
      })),
    [colors]
  )

  useEffect(() => {
    if (isActive) {
      triggerHaptic(HAPTIC_PATTERNS.celebration)
      const timer = setTimeout(() => onComplete?.(), duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isActive, duration, onComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {bursts.map((burst) => (
            <motion.div
              key={burst.id}
              className="absolute"
              style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                delay: burst.delay,
                ease: "easeOut",
              }}
            >
              {/* Sparkle rays */}
              {Array.from({ length: 12 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-16 origin-left"
                  style={{
                    backgroundColor: burst.color,
                    transform: `rotate(${i * 30}deg)`,
                    boxShadow: `0 0 10px ${burst.color}, 0 0 20px ${burst.color}`,
                  }}
                  initial={{ scaleX: 0, opacity: 1 }}
                  animate={{ scaleX: [0, 1, 0], opacity: [1, 1, 0] }}
                  transition={{
                    duration: 0.8,
                    delay: burst.delay + 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SuccessPulse - Onda de éxito
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SuccessPulse = memo(function SuccessPulse({
  isActive,
  color = "#10B981",
  className,
}: SuccessPulseProps) {
  useEffect(() => {
    if (isActive) {
      triggerHaptic(HAPTIC_PATTERNS.success)
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={cn("pointer-events-none absolute inset-0 z-40", className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                border: `2px solid ${color}`,
                boxShadow: `0 0 20px ${color}`,
              }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 500, height: 500, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EcstasyFinancialCelebration - Celebración de éxtasis financiero completa
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EcstasyFinancialCelebrationProps {
  isActive: boolean
  title?: string
  subtitle?: string
  amount?: number
  currency?: string
  onComplete?: () => void
}

export const EcstasyFinancialCelebration = memo(function EcstasyFinancialCelebration({
  isActive,
  title = "¡Éxtasis Financiero!",
  subtitle = "Nueva meta alcanzada",
  amount,
  currency = "$",
  onComplete,
}: EcstasyFinancialCelebrationProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowContent(true), 500)
      return () => clearTimeout(timer)
    }
    setShowContent(false)
    return undefined
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Gold rain */}
          <GoldRain isActive={isActive} duration={5000} particleCount={80} />

          {/* Confetti */}
          <ConfettiExplosion isActive={isActive} duration={3000} particleCount={60} />

          {/* Success pulse */}
          <SuccessPulse isActive={isActive} color="#FFD700" />

          {/* Content */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                className="relative z-10 text-center"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Title */}
                <motion.h1
                  className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl"
                  style={{ textShadow: "0 0 40px rgba(255, 215, 0, 0.8)" }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  {title}
                </motion.h1>

                {/* Amount */}
                {amount !== undefined && (
                  <motion.p
                    className="mb-2 text-5xl font-bold text-amber-400 sm:text-6xl md:text-7xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currency}
                    {amount.toLocaleString()}
                  </motion.p>
                )}

                {/* Subtitle */}
                <motion.p
                  className="text-xl text-white/80"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {subtitle}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useCelebration
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useCelebration() {
  const [isActive, setIsActive] = useState(false)

  const trigger = useCallback((durationMs: number = 3000) => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), durationMs)
  }, [])

  const triggerWithHaptic = useCallback(
    (pattern: keyof typeof HAPTIC_PATTERNS = "celebration", durationMs: number = 3000) => {
      triggerHaptic(HAPTIC_PATTERNS[pattern])
      trigger(durationMs)
    },
    [trigger]
  )

  return { isActive, trigger, triggerWithHaptic, setIsActive }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { HAPTIC_PATTERNS, triggerHaptic }

export default {
  GoldRain,
  ConfettiExplosion,
  Fireworks,
  SuccessPulse,
  EcstasyFinancialCelebration,
  useCelebration,
}
