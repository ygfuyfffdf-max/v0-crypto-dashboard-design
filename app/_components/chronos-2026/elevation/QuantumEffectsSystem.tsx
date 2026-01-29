"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 QUANTUM EFFECTS SYSTEM — CHRONOS INFINITY 2026 VISUAL FX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de efectos visuales cuánticos ultra-premium:
 * - Backgrounds animados con partículas
 * - Ripple effects interactivos
 * - Glow dinámico adaptativo
 * - Aurora boreal generativa
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { motion } from "motion/react"
import React, { memo, useCallback, useEffect, useRef, useState } from "react"
import { SUPREME_COLORS, type SupremeColorKey } from "./SupremeElevationSystem"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 QUANTUM BACKGROUND — Animated Particle Field Background
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface QuantumBackgroundProps {
  children: React.ReactNode
  className?: string
  variant?: "particles" | "aurora" | "grid" | "nebula" | "matrix"
  colors?: SupremeColorKey[]
  intensity?: number
  interactive?: boolean
  blur?: number
}

export const QuantumBackground = memo(function QuantumBackground({
  children,
  className,
  variant = "particles",
  colors = ["violet", "cyan"],
  intensity = 0.5,
  interactive = true,
  blur = 80,
}: QuantumBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
    },
    [interactive]
  )

  useEffect(() => {
    if (variant !== "particles" && variant !== "matrix") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    const width = canvas.getBoundingClientRect().width
    const height = canvas.getBoundingClientRect().height

    // Particles
    const particleCount = Math.floor(50 * intensity)
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.6,
      colorIndex: Math.floor(Math.random() * colors.length),
    }))

    let time = 0

    const animate = () => {
      time += 0.016
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, width, height)

      particles.forEach((p) => {
        // Update position
        p.x += p.vx
        p.y += p.vy

        // Mouse influence
        if (interactive) {
          const dx = mouseRef.current.x * width - p.x
          const dy = mouseRef.current.y * height - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const force = ((150 - dist) / 150) * 0.02
            p.vx += dx * force * 0.1
            p.vy += dy * force * 0.1
          }
        }

        // Boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99

        // Draw
        const colorKey = colors[p.colorIndex % colors.length] ?? "violet"
        const color = SUPREME_COLORS.quantum[colorKey]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle =
          color +
          Math.floor(p.alpha * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.fill()

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        gradient.addColorStop(0, color + "40")
        gradient.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Draw connections
      const primaryColorKey = colors[0] ?? "violet"
      ctx.strokeStyle = `${SUPREME_COLORS.quantum[primaryColorKey]}15`
      ctx.lineWidth = 0.5
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.globalAlpha = 1 - dist / 100
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [variant, colors, intensity, interactive])

  const colorConfigs = colors.map((color, i) => ({
    color: SUPREME_COLORS.quantum[color],
    glow: SUPREME_COLORS.glow[color],
  }))

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
    >
      {/* Canvas Background */}
      {(variant === "particles" || variant === "matrix") && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: -10 }}
        />
      )}

      {/* Aurora Background */}
      {variant === "aurora" && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: -10 }}>
          {colorConfigs.map((config, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: "60%",
                height: "60%",
                left: `${20 + i * 20}%`,
                top: `${20 + i * 15}%`,
                background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
                filter: `blur(${blur}px)`,
                opacity: intensity * 0.6,
              }}
              animate={{
                x: [0, 50, 0, -50, 0],
                y: [0, -30, 0, 30, 0],
                scale: [1, 1.2, 1, 0.9, 1],
              }}
              transition={{
                duration: 15 + i * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Grid Background */}
      {variant === "grid" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: -10,
            backgroundImage: `
              linear-gradient(${colorConfigs[0]?.color || "#8B00FF"}15 1px, transparent 1px),
              linear-gradient(90deg, ${colorConfigs[0]?.color || "#8B00FF"}15 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            perspective: "500px",
            transform: "rotateX(60deg)",
            transformOrigin: "center bottom",
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent, ${colorConfigs[0]?.glow || "rgba(139, 0, 255, 0.3)"})`,
            }}
            animate={{ y: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Nebula Background */}
      {variant === "nebula" && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ zIndex: -10 }}
        >
          <svg className="absolute inset-0 h-full w-full opacity-30">
            <filter id="nebulaFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="4"
                result="noise"
              />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" />
            </filter>
            {colorConfigs.map((config, i) => (
              <motion.circle
                key={i}
                cx={`${30 + i * 25}%`}
                cy={`${40 + i * 10}%`}
                r="30%"
                fill={config.glow}
                filter="url(#nebulaFilter)"
                animate={{
                  cx: [`${30 + i * 25}%`, `${35 + i * 25}%`, `${30 + i * 25}%`],
                  cy: [`${40 + i * 10}%`, `${45 + i * 10}%`, `${40 + i * 10}%`],
                  r: ["30%", "35%", "30%"],
                }}
                transition={{
                  duration: 10 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 QUANTUM PARTICLE FIELD — Standalone Particle Effect
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumParticleFieldProps {
  className?: string
  colors?: SupremeColorKey[]
  particleCount?: number
  interactive?: boolean
  connectionDistance?: number
}

export const QuantumParticleField = memo(function QuantumParticleField({
  className,
  colors = ["violet", "cyan", "magenta"],
  particleCount = 60,
  interactive = true,
  connectionDistance = 120,
}: QuantumParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    const width = canvas.getBoundingClientRect().width
    const height = canvas.getBoundingClientRect().height

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: 1.5 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)] ?? ("violet" as SupremeColorKey),
      alpha: 0.3 + Math.random() * 0.7,
      pulsePhase: Math.random() * Math.PI * 2,
    }))

    let time = 0

    const animate = () => {
      time += 0.016
      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      particles.forEach((p, i) => {
        // Pulse size
        const pulseSize = p.size + Math.sin(time * 2 + p.pulsePhase) * 0.5

        // Mouse attraction
        if (interactive && mouseRef.current.active) {
          const dx = mouseRef.current.x * width - p.x
          const dy = mouseRef.current.y * height - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            const force = ((200 - dist) / 200) * 0.03
            p.vx += dx * force
            p.vy += dy * force
          }
        }

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Boundaries with wrap
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99

        // Draw particle
        const color = SUPREME_COLORS.quantum[p.color]

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 6)
        gradient.addColorStop(0, color + "60")
        gradient.addColorStop(0.5, color + "20")
        gradient.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(p.x, p.y, pulseSize * 6, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `${SUPREME_COLORS.quantum[p1.color]}${Math.floor(
              (1 - dist / connectionDistance) * 30
            )
              .toString(16)
              .padStart(2, "0")}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseleave", handleMouseLeave)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [colors, particleCount, interactive, connectionDistance])

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full", className)}
      style={{ background: "transparent" }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 QUANTUM RIPPLE — Click Ripple Effect
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumRippleProps {
  children: React.ReactNode
  className?: string
  color?: SupremeColorKey
  disabled?: boolean
}

export const QuantumRipple = memo(function QuantumRipple({
  children,
  className,
  color = "violet",
  disabled = false,
}: QuantumRippleProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newRipple = { x, y, id: Date.now() }
      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 800)
    },
    [disabled]
  )

  const rippleColor = SUPREME_COLORS.quantum[color]

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            backgroundColor: `${rippleColor}40`,
            boxShadow: `0 0 30px ${rippleColor}60`,
          }}
          initial={{
            width: 0,
            height: 0,
            x: ripple.x,
            y: ripple.y,
            opacity: 0.8,
          }}
          animate={{
            width: 500,
            height: 500,
            x: ripple.x - 250,
            y: ripple.y - 250,
            opacity: 0,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ QUANTUM GLOW — Hover Glow Effect
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumGlowProps {
  children: React.ReactNode
  className?: string
  color?: SupremeColorKey
  intensity?: "subtle" | "normal" | "intense"
  followMouse?: boolean
}

export const QuantumGlow = memo(function QuantumGlow({
  children,
  className,
  color = "violet",
  intensity = "normal",
  followMouse = true,
}: QuantumGlowProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!followMouse || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    },
    [followMouse]
  )

  const glowColor = SUPREME_COLORS.glow[color]
  const intensityMap = {
    subtle: 0.2,
    normal: 0.4,
    intense: 0.7,
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Glow Effect */}
      <motion.div
        className="rounded-inherit pointer-events-none absolute inset-0"
        style={{
          background: followMouse
            ? `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, ${glowColor}, transparent 50%)`
            : `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          opacity: isHovered ? intensityMap[intensity] : 0,
        }}
        animate={{ opacity: isHovered ? intensityMap[intensity] : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
})
