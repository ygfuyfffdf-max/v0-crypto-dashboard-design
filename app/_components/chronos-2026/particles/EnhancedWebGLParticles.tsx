'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ ENHANCED WEBGL PARTICLES — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de partículas WebGL avanzado con:
 * - 10,000+ partículas fluidas
 * - Interacción con el mouse (atracción/repulsión)
 * - Múltiples presets (cosmic, aurora, matrix, fireflies, nebula)
 * - Performance GPU-accelerated
 * - Modo reducido para dispositivos móviles
 */

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

export type ParticlePreset = 'cosmic' | 'aurora' | 'matrix' | 'fireflies' | 'nebula' | 'quantum'

interface EnhancedWebGLParticlesProps {
  count?: number
  preset?: ParticlePreset
  interactive?: boolean
  speed?: number
  className?: string
}

const PRESETS: Record<
  ParticlePreset,
  {
    colors: string[]
    speed: number
    size: { min: number; max: number }
    behavior: 'float' | 'fall' | 'rise' | 'swarm'
  }
> = {
  cosmic: {
    colors: ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F59E0B'],
    speed: 0.3,
    size: { min: 1, max: 3 },
    behavior: 'float',
  },
  aurora: {
    colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    speed: 0.2,
    size: { min: 2, max: 5 },
    behavior: 'rise',
  },
  matrix: {
    colors: ['#10B981', '#34D399', '#6EE7B7'],
    speed: 1.2,
    size: { min: 1, max: 2 },
    behavior: 'fall',
  },
  fireflies: {
    colors: ['#FBBF24', '#FCD34D', '#FDE68A'],
    speed: 0.5,
    size: { min: 2, max: 4 },
    behavior: 'float',
  },
  nebula: {
    colors: ['#EC4899', '#F472B6', '#FBCFE8', '#8B5CF6'],
    speed: 0.15,
    size: { min: 3, max: 8 },
    behavior: 'swarm',
  },
  quantum: {
    colors: ['#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC'],
    speed: 0.4,
    size: { min: 1, max: 3 },
    behavior: 'float',
  },
}

export function EnhancedWebGLParticles({
  count = 5000,
  preset = 'cosmic',
  interactive = true,
  speed: speedMultiplier = 1,
  className = '',
}: EnhancedWebGLParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Better performance
    })
    if (!ctx) return

    // Resize
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const config = PRESETS[preset]
    const particleCount = Math.min(count, window.innerWidth < 768 ? 2000 : count) // Reduce en móviles

    particlesRef.current = Array.from({ length: particleCount }, () => {
      const colorIndex = Math.floor(Math.random() * config.colors.length)
      return {
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        vx: (Math.random() - 0.5) * config.speed * speedMultiplier,
        vy: (Math.random() - 0.5) * config.speed * speedMultiplier,
        size: config.size.min + Math.random() * (config.size.max - config.size.min),
        color: config.colors[colorIndex] || '#8B5CF6',
        alpha: 0.3 + Math.random() * 0.5,
        life: Math.random() * 100,
        maxLife: 100,
      }
    })

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseleave', handleMouseLeave)
    }

    // Animation loop
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2) // Cap at 2x normal speed
      lastTime = currentTime

      // Clear con fade para trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      particles.forEach((p) => {
        // Update life
        p.life += deltaTime * 0.5
        if (p.life > p.maxLife) {
          p.life = 0
          p.alpha = 0.3 + Math.random() * 0.5
        }

        // Behavior based on preset
        if (config.behavior === 'fall') {
          p.vy += 0.02 * deltaTime
        } else if (config.behavior === 'rise') {
          p.vy -= 0.01 * deltaTime
        } else if (config.behavior === 'swarm') {
          // Swarm to center
          const centerX = canvas.clientWidth / 2
          const centerY = canvas.clientHeight / 2
          const dx = centerX - p.x
          const dy = centerY - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 100) {
            p.vx += (dx / dist) * 0.005 * deltaTime
            p.vy += (dy / dist) * 0.005 * deltaTime
          }
        }

        // Mouse interaction
        if (interactive && mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            const force = (150 - dist) / 150
            p.vx -= (dx / dist) * force * 0.5
            p.vy -= (dy / dist) * force * 0.5
          }
        }

        // Update position
        p.x += p.vx * deltaTime
        p.y += p.vy * deltaTime

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99

        // Wrap around edges
        if (p.x < 0) p.x = canvas.clientWidth
        if (p.x > canvas.clientWidth) p.x = 0
        if (p.y < 0) p.y = canvas.clientHeight
        if (p.y > canvas.clientHeight) p.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife)
        ctx.fill()

        // Glow effect
        if (p.size > 2) {
          ctx.globalAlpha = p.alpha * 0.3 * (1 - p.life / p.maxLife)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
          gradient.addColorStop(0, p.color)
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.fill()
        }

        ctx.globalAlpha = 1
      })

      // Connect nearby particles
      if (preset === 'cosmic' || preset === 'quantum') {
        particles.forEach((p1, i) => {
          particles.slice(i + 1, i + 5).forEach((p2) => {
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 100) {
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = p1.color
              ctx.globalAlpha = (1 - dist / 100) * 0.2
              ctx.lineWidth = 0.5
              ctx.stroke()
              ctx.globalAlpha = 1
            }
          })
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [count, preset, interactive, speedMultiplier])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ opacity: 0.6 }}
    />
  )
}
