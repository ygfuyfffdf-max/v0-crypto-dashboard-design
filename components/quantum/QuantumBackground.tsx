"use client"

import { useEffect, useRef, useCallback, memo } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

interface QuantumBackgroundProps {
  particleCount?: number
  mood?: "calm" | "flow" | "euphoric"
  showOrbs?: boolean
  interactive?: boolean
}

const CHRONOS_COLORS = {
  violet: "#8B00FF",
  gold: "#FFD700",
  plasma: "#FF1493",
  white: "#FFFFFF",
}

const QuantumBackground = memo(function QuantumBackground({
  particleCount = 150,
  mood = "flow",
  showOrbs = true,
  interactive = true,
}: QuantumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })

  // Parallax transforms
  const orb1Y = useTransform(smoothProgress, [0, 1], ["0%", "30%"])
  const orb2Y = useTransform(smoothProgress, [0, 1], ["0%", "-20%"])
  const orb3Y = useTransform(smoothProgress, [0, 1], ["0%", "50%"])

  // Mood-based configurations
  const moodConfig = {
    calm: {
      speed: 0.3,
      turbulence: 0.1,
      glowIntensity: 0.4,
      colorBias: "violet",
    },
    flow: {
      speed: 0.6,
      turbulence: 0.3,
      glowIntensity: 0.6,
      colorBias: "mixed",
    },
    euphoric: {
      speed: 1.2,
      turbulence: 0.6,
      glowIntensity: 1,
      colorBias: "gold",
    },
  }

  const config = moodConfig[mood]

  const createParticle = useCallback(
    (canvas: HTMLCanvasElement): Particle => {
      const colors = [
        CHRONOS_COLORS.violet,
        CHRONOS_COLORS.gold,
        CHRONOS_COLORS.plasma,
      ]

      let colorIndex = Math.floor(Math.random() * colors.length)
      if (config.colorBias === "violet") colorIndex = 0
      if (config.colorBias === "gold") colorIndex = 1

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        size: Math.random() * 3 + 1,
        color: colors[colorIndex],
        opacity: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      }
    },
    [config]
  )

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas)
    )
  }, [particleCount, createParticle])

  const drawParticle = useCallback(
    (ctx: CanvasRenderingContext2D, particle: Particle) => {
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 3
      )

      gradient.addColorStop(0, particle.color)
      gradient.addColorStop(0.4, `${particle.color}80`)
      gradient.addColorStop(1, "transparent")

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.globalAlpha = particle.opacity * config.glowIntensity
      ctx.fill()

      // Core particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.opacity
      ctx.fill()

      ctx.globalAlpha = 1
    },
    [config.glowIntensity]
  )

  const updateParticle = useCallback(
    (particle: Particle, canvas: HTMLCanvasElement) => {
      // Mouse interaction
      if (interactive) {
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 150) {
          const force = (150 - dist) / 150
          particle.vx -= (dx / dist) * force * 0.05 * config.turbulence
          particle.vy -= (dy / dist) * force * 0.05 * config.turbulence
        }
      }

      // Turbulence
      particle.vx += (Math.random() - 0.5) * config.turbulence * 0.1
      particle.vy += (Math.random() - 0.5) * config.turbulence * 0.1

      // Velocity dampening
      particle.vx *= 0.99
      particle.vy *= 0.99

      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Life cycle
      particle.life++
      if (particle.life > particle.maxLife * 0.8) {
        particle.opacity *= 0.98
      }

      // Boundary wrapping
      if (particle.x < 0) particle.x = canvas.width
      if (particle.x > canvas.width) particle.x = 0
      if (particle.y < 0) particle.y = canvas.height
      if (particle.y > canvas.height) particle.y = 0

      // Respawn dead particles
      if (particle.life > particle.maxLife || particle.opacity < 0.01) {
        Object.assign(particle, createParticle(canvas))
      }
    },
    [interactive, config.turbulence, createParticle]
  )

  const drawConnections = useCallback(
    (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)

            const gradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y
            )
            gradient.addColorStop(0, `${particles[i].color}40`)
            gradient.addColorStop(1, `${particles[j].color}40`)

            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.5
            ctx.globalAlpha = (1 - dist / 120) * 0.3 * config.glowIntensity
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }
    },
    [config.glowIntensity]
  )

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Clear with fade effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw connections first
    drawConnections(ctx, particlesRef.current)

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      updateParticle(particle, canvas)
      drawParticle(ctx, particle)
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [drawConnections, updateParticle, drawParticle])

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [initParticles])

  // Handle mouse move
  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [interactive])

  // Start animation
  useEffect(() => {
    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />

      {/* Volumetric Fog Layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(139, 0, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 20, 147, 0.03) 0%, transparent 60%)
          `,
        }}
      />

      {/* Parallax Ambient Orbs */}
      {showOrbs && (
        <>
          <motion.div
            style={{ y: orb1Y }}
            className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full will-change-transform"
          >
            <div
              className="w-full h-full rounded-full animate-pulse-violet"
              style={{
                background: `radial-gradient(circle, rgba(139, 0, 255, 0.15) 0%, transparent 70%)`,
                filter: "blur(80px)",
              }}
            />
          </motion.div>

          <motion.div
            style={{ y: orb2Y }}
            className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full will-change-transform"
          >
            <div
              className="w-full h-full rounded-full animate-pulse-gold"
              style={{
                background: `radial-gradient(circle, rgba(255, 215, 0, 0.12) 0%, transparent 70%)`,
                filter: "blur(80px)",
                animationDelay: "1s",
              }}
            />
          </motion.div>

          <motion.div
            style={{ y: orb3Y }}
            className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full will-change-transform"
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(255, 20, 147, 0.08) 0%, transparent 70%)`,
                filter: "blur(60px)",
                animation: "breathe 4s ease-in-out infinite",
                animationDelay: "2s",
              }}
            />
          </motion.div>
        </>
      )}

      {/* Gradient Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)
          `,
        }}
      />

      {/* Scanline Effect (subtle) */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 0, 255, 0.5) 2px,
            rgba(139, 0, 255, 0.5) 4px
          )`,
        }}
      />
    </div>
  )
})

export default QuantumBackground
