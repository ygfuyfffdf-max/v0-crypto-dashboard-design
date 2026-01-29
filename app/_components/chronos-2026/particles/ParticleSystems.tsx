'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ PARTICLE SYSTEMS — CHRONOS INFINITY 2026 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de partículas 3D/2D ultra-premium:
 * - WebGL accelerated particles
 * - Interactive mouse tracking
 * - Organic movement patterns
 * - Multiple preset effects
 * - 60FPS guaranteed
 *
 * NOTA: Para el sistema de partículas más avanzado, usar:
 * - QuantumParticleField (partículas premium con trails y glow)
 * - UnifiedBackground (combina aurora + partículas)
 * - OptimizedPanelBackground (fondo optimizado para paneles)
 *
 * @version 2.0.0 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react'

// Re-export advanced systems
export * from './OptimizedPanelBackground'
export * from './QuantumParticleField'
export * from './UnifiedBackground'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

interface ParticleSystemProps {
  count?: number
  width: number
  height: number
  interactive?: boolean
  mouseRadius?: number
  connectionDistance?: number
  colors?: string[]
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ParticleSystem({
  count = 100,
  width,
  height,
  interactive = true,
  mouseRadius = 100,
  connectionDistance = 120,
  colors = ['#8b5cf6', '#ec4899', '#f59e0b'],
  className,
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: width / 2, y: height / 2 })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Configurar canvas
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Inicializar partículas
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.2,
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)] || '#8b5cf6',
      opacity: 0.3 + Math.random() * 0.7,
      life: Math.random() * 200,
      maxLife: 200 + Math.random() * 100,
    }))

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove)
    }

    // Animation loop
    const animate = () => {
      // Clear con fade
      ctx.fillStyle = 'rgba(3, 3, 8, 0.05)'
      ctx.fillRect(0, 0, width, height)

      const particles = particlesRef.current

      // Update & draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz

        // Mouse interaction
        if (interactive) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius
            particle.vx -= (dx / dist) * force * 0.02
            particle.vy -= (dy / dist) * force * 0.02
          }
        }

        // Apply friction
        particle.vx *= 0.99
        particle.vy *= 0.99
        particle.vz *= 0.99

        // Boundaries
        if (particle.x < 0 || particle.x > width) particle.vx *= -1
        if (particle.y < 0 || particle.y > height) particle.vy *= -1
        if (particle.z < 0 || particle.z > 100) particle.vz *= -1

        // Update life
        particle.life += 1
        if (particle.life > particle.maxLife) {
          particle.life = 0
          particle.x = Math.random() * width
          particle.y = Math.random() * height
        }

        // Draw particle con efecto 3D (z-depth)
        const scale = 1 + particle.z / 100
        const size = particle.size * scale
        const opacity = particle.opacity * (1 - particle.life / particle.maxLife)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = opacity
        ctx.fill()

        // Glow effect
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          size * 3,
        )
        gradient.addColorStop(0, `${particle.color}80`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.globalAlpha = opacity * 0.5
        ctx.fillRect(particle.x - size * 3, particle.y - size * 3, size * 6, size * 6)

        // Draw connections
        ctx.globalAlpha = 1
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j]
          if (!other) continue
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.2
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      })

      ctx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove)
      }
      cancelAnimationFrame(animationRef.current)
    }
  }, [count, width, height, interactive, mouseRadius, connectionDistance, colors])

  return (
    <canvas ref={canvasRef} className={className} style={{ width, height, display: 'block' }} />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Aurora Particles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraParticles({
  width,
  height,
  className,
}: {
  width: number
  height: number
  className?: string
}) {
  return (
    <ParticleSystem
      count={80}
      width={width}
      height={height}
      interactive={true}
      mouseRadius={150}
      connectionDistance={100}
      colors={['#8b5cf6', '#a78bfa', '#c084fc', '#e9d5ff']}
      className={className}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Quantum Particles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuantumParticles({
  width,
  height,
  className,
}: {
  width: number
  height: number
  className?: string
}) {
  return (
    <ParticleSystem
      count={120}
      width={width}
      height={height}
      interactive={true}
      mouseRadius={120}
      connectionDistance={80}
      colors={['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1']}
      className={className}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Energy Field Particles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function EnergyFieldParticles({
  width,
  height,
  className,
}: {
  width: number
  height: number
  className?: string
}) {
  return (
    <ParticleSystem
      count={150}
      width={width}
      height={height}
      interactive={true}
      mouseRadius={200}
      connectionDistance={150}
      colors={['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']}
      className={className}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Cosmic Dust
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function CosmicDust({
  width,
  height,
  className,
}: {
  width: number
  height: number
  className?: string
}) {
  return (
    <ParticleSystem
      count={200}
      width={width}
      height={height}
      interactive={false}
      mouseRadius={0}
      connectionDistance={60}
      colors={['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a']}
      className={className}
    />
  )
}
