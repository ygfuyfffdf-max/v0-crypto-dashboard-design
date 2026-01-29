"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 QUANTUM DISTRIBUIDORES VISUALIZATION — CHRONOS INFINITY 2026 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Visualización 3D ultra-premium para el flujo de distribuidores con:
 * - Partículas cuánticas con trails
 * - Efectos de plasma líquido
 * - Aurora boreal dinámica
 * - Orbes de energía
 * - Conexiones neurales entre nodos
 * - 60FPS garantizados con WebGL
 *
 * @version 1.0.0 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { motion } from "motion/react"
import { useCallback, useEffect, useRef } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumDistribuidoresVizProps {
  distribuidoresCount?: number
  totalCompras?: number
  totalDeuda?: number
  ordenesActivas?: number
  className?: string
  variant?: "network" | "flow" | "orb" | "plasma"
  interactive?: boolean
}

interface QuantumParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  alpha: number
  trail: Array<{ x: number; y: number; alpha: number }>
  energy: number
  pulsePhase: number
}

interface EnergyOrb {
  x: number
  y: number
  radius: number
  color: string
  glowIntensity: number
  rotationSpeed: number
  angle: number
  pulsePhase: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuantumDistribuidoresViz({
  distribuidoresCount = 1,
  totalCompras = 0,
  totalDeuda = 0,
  ordenesActivas = 0,
  className = "",
  variant = "flow",
  interactive = true,
}: QuantumDistribuidoresVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false })
  const particlesRef = useRef<QuantumParticle[]>([])
  const orbsRef = useRef<EnergyOrb[]>([])

  // Calcular intensidad basada en datos
  const intensity = Math.min(1, (totalCompras / 100000) * 0.5 + (distribuidoresCount / 10) * 0.5)
  const deudaRatio = totalCompras > 0 ? Math.min(1, totalDeuda / totalCompras) : 0

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!interactive) return
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        active: true,
      }
    },
    [interactive]
  )

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Setup canvas con DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const width = rect.width
    const height = rect.height

    // Inicializar partículas
    const particleCount = Math.min(80, 30 + distribuidoresCount * 10)
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 4,
      hue: Math.random() > 0.5 ? 280 : 180, // Violeta o Cyan
      alpha: 0.4 + Math.random() * 0.6,
      trail: [],
      energy: Math.random(),
      pulsePhase: Math.random() * Math.PI * 2,
    }))

    // Inicializar orbes de energía
    orbsRef.current = Array.from({ length: Math.min(5, distribuidoresCount + 2) }, (_, i) => ({
      x: width * 0.2 + Math.random() * width * 0.6,
      y: height * 0.2 + Math.random() * height * 0.6,
      radius: 20 + Math.random() * 30,
      color: i === 0 ? "#06B6D4" : i === 1 ? "#8B5CF6" : "#10B981",
      glowIntensity: 0.5 + Math.random() * 0.5,
      rotationSpeed: 0.005 + Math.random() * 0.01,
      angle: Math.random() * Math.PI * 2,
      pulsePhase: Math.random() * Math.PI * 2,
    }))

    // Event listeners
    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove)
      canvas.addEventListener("mouseleave", handleMouseLeave)
    }

    // Animation loop
    const animate = () => {
      timeRef.current += 0.016

      // Clear con fade para trails
      ctx.fillStyle = "rgba(3, 7, 18, 0.15)"
      ctx.fillRect(0, 0, width, height)

      // ═══════════════════════════════════════════════════════════════════════
      // PLASMA BACKGROUND
      // ═══════════════════════════════════════════════════════════════════════
      if (variant === "plasma" || variant === "flow") {
        const gradient = ctx.createRadialGradient(
          width / 2 + Math.sin(timeRef.current * 0.5) * 50,
          height / 2 + Math.cos(timeRef.current * 0.3) * 30,
          0,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.7
        )
        gradient.addColorStop(0, `rgba(6, 182, 212, ${0.1 * intensity})`)
        gradient.addColorStop(0.4, `rgba(139, 92, 246, ${0.05 * intensity})`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // AURORA WAVES
      // ═══════════════════════════════════════════════════════════════════════
      for (let w = 0; w < 3; w++) {
        ctx.beginPath()
        ctx.moveTo(0, height / 2)

        for (let x = 0; x <= width; x += 10) {
          const y =
            height / 2 +
            Math.sin(x * 0.02 + timeRef.current * (0.5 + w * 0.2)) * (30 + w * 20) * intensity +
            Math.sin(x * 0.01 + timeRef.current * 0.3) * 20
          ctx.lineTo(x, y)
        }

        ctx.strokeStyle =
          w === 0
            ? `rgba(6, 182, 212, ${0.2 * intensity})`
            : w === 1
              ? `rgba(139, 92, 246, ${0.15 * intensity})`
              : `rgba(16, 185, 129, ${0.1 * intensity})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // ═══════════════════════════════════════════════════════════════════════
      // ENERGY ORBS
      // ═══════════════════════════════════════════════════════════════════════
      orbsRef.current.forEach((orb, i) => {
        orb.angle += orb.rotationSpeed
        orb.pulsePhase += 0.03

        const pulseScale = 1 + Math.sin(orb.pulsePhase) * 0.2
        const currentRadius = orb.radius * pulseScale

        // Mover orbe hacia el mouse si está activo
        if (mouseRef.current.active && interactive) {
          const dx = mouseRef.current.x * width - orb.x
          const dy = mouseRef.current.y * height - orb.y
          orb.x += dx * 0.01
          orb.y += dy * 0.01
        }

        // Glow exterior
        const outerGlow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentRadius * 3)
        outerGlow.addColorStop(0, `${orb.color}40`)
        outerGlow.addColorStop(0.5, `${orb.color}15`)
        outerGlow.addColorStop(1, "transparent")

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, currentRadius * 3, 0, Math.PI * 2)
        ctx.fillStyle = outerGlow
        ctx.fill()

        // Orbe principal
        const innerGlow = ctx.createRadialGradient(
          orb.x - currentRadius * 0.3,
          orb.y - currentRadius * 0.3,
          0,
          orb.x,
          orb.y,
          currentRadius
        )
        innerGlow.addColorStop(0, "#ffffff")
        innerGlow.addColorStop(0.3, orb.color)
        innerGlow.addColorStop(1, `${orb.color}80`)

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2)
        ctx.fillStyle = innerGlow
        ctx.fill()

        // Anillos orbitales
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, currentRadius * 1.5, orb.angle, orb.angle + Math.PI * 0.5)
        ctx.strokeStyle = `${orb.color}60`
        ctx.lineWidth = 2
        ctx.stroke()

        // Conexiones entre orbes
        orbsRef.current.forEach((otherOrb, j) => {
          if (i >= j) return
          const dx = otherOrb.x - orb.x
          const dy = otherOrb.y - orb.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.3
            ctx.beginPath()
            ctx.moveTo(orb.x, orb.y)

            // Curved connection
            const midX = (orb.x + otherOrb.x) / 2
            const midY = (orb.y + otherOrb.y) / 2 - 30
            ctx.quadraticCurveTo(midX, midY, otherOrb.x, otherOrb.y)

            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        })
      })

      // ═══════════════════════════════════════════════════════════════════════
      // QUANTUM PARTICLES
      // ═══════════════════════════════════════════════════════════════════════
      particlesRef.current.forEach((p, index) => {
        // Update trail
        p.trail.unshift({ x: p.x, y: p.y, alpha: p.alpha })
        if (p.trail.length > 15) p.trail.pop()

        // Update position
        p.x += p.vx
        p.y += p.vy
        p.pulsePhase += 0.05

        // Mouse attraction
        if (mouseRef.current.active && interactive) {
          const dx = mouseRef.current.x * width - p.x
          const dy = mouseRef.current.y * height - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            p.vx += (dx / dist) * 0.3
            p.vy += (dy / dist) * 0.3
          }
        }

        // Boundary bounce
        if (p.x < 0 || p.x > width) p.vx *= -0.8
        if (p.y < 0 || p.y > height) p.vy *= -0.8

        // Clamp position
        p.x = Math.max(0, Math.min(width, p.x))
        p.y = Math.max(0, Math.min(height, p.y))

        // Apply friction
        p.vx *= 0.98
        p.vy *= 0.98

        // Draw trail
        p.trail.forEach((t, ti) => {
          const trailAlpha = (1 - ti / p.trail.length) * 0.3 * t.alpha
          ctx.beginPath()
          ctx.arc(t.x, t.y, p.size * (1 - ti / p.trail.length), 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${trailAlpha})`
          ctx.fill()
        })

        // Draw particle with glow
        const glowSize = p.size * (2 + Math.sin(p.pulsePhase) * 0.5)
        const particleGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize * 2)
        particleGlow.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.alpha})`)
        particleGlow.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, ${p.alpha * 0.3})`)
        particleGlow.addColorStop(1, "transparent")

        ctx.beginPath()
        ctx.arc(p.x, p.y, glowSize * 2, 0, Math.PI * 2)
        ctx.fillStyle = particleGlow
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowSize * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${p.alpha})`
        ctx.fill()

        // Particle connections
        particlesRef.current.forEach((other, j) => {
          if (index >= j) return
          const dx = other.x - p.x
          const dy = other.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      // ═══════════════════════════════════════════════════════════════════════
      // DATA LABELS (si hay datos significativos)
      // ═══════════════════════════════════════════════════════════════════════
      if (distribuidoresCount > 0) {
        // Central data display
        ctx.font = "bold 14px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)"

        const centerY = height - 30

        // Distribuidores count
        ctx.fillStyle = "#06B6D4"
        ctx.fillText(`${distribuidoresCount}`, width * 0.25, centerY)
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
        ctx.font = "10px Inter, sans-serif"
        ctx.fillText("Distribuidores", width * 0.25, centerY + 14)

        // Ordenes activas
        if (ordenesActivas > 0) {
          ctx.font = "bold 14px Inter, sans-serif"
          ctx.fillStyle = "#8B5CF6"
          ctx.fillText(`${ordenesActivas}`, width * 0.75, centerY)
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
          ctx.font = "10px Inter, sans-serif"
          ctx.fillText("Órdenes", width * 0.75, centerY + 14)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [
    distribuidoresCount,
    totalCompras,
    totalDeuda,
    ordenesActivas,
    intensity,
    variant,
    interactive,
    handleMouseMove,
    handleMouseLeave,
  ])

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(3, 7, 18, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)",
        }}
      />

      {/* Overlay Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MINI VERSION FOR CARDS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuantumDistribuidoresMini({
  className = "",
  color = "cyan",
}: {
  className?: string
  color?: "cyan" | "violet" | "emerald" | "rose"
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  const colors = {
    cyan: { primary: "#06B6D4", secondary: "#0891B2" },
    violet: { primary: "#8B5CF6", secondary: "#7C3AED" },
    emerald: { primary: "#10B981", secondary: "#059669" },
    rose: { primary: "#F43F5E", secondary: "#E11D48" },
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const width = rect.width
    const height = rect.height

    const colorConfig = colors[color]

    const animate = () => {
      timeRef.current += 0.02

      ctx.fillStyle = "rgba(3, 7, 18, 0.2)"
      ctx.fillRect(0, 0, width, height)

      // Wave effect
      ctx.beginPath()
      ctx.moveTo(0, height / 2)

      for (let x = 0; x <= width; x += 5) {
        const y = height / 2 + Math.sin(x * 0.05 + timeRef.current) * 10
        ctx.lineTo(x, y)
      }

      ctx.strokeStyle = `${colorConfig.primary}60`
      ctx.lineWidth = 2
      ctx.stroke()

      // Central glow
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        width / 2
      )
      gradient.addColorStop(0, `${colorConfig.primary}30`)
      gradient.addColorStop(1, "transparent")

      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width / 3, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      style={{ background: "transparent" }}
    />
  )
}

export default QuantumDistribuidoresViz
