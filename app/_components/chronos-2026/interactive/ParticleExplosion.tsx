/**
 * 🎆💥 PARTICLE EXPLOSION — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Explosión de partículas oro/violeta al completar operación exitosa
 * Efecto: Venta creada → lluvia oro explosiva + haptic visual
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
  shape: 'circle' | 'star' | 'diamond' | 'spark'
}

interface ParticleExplosionProps {
  trigger: boolean
  onComplete?: () => void
  origin?: { x: number; y: number } // Explosion origin point (default: center)
  particleCount?: number
  colors?: string[]
  intensity?: 'subtle' | 'medium' | 'intense' | 'epic'
  type?: 'burst' | 'rain' | 'firework' | 'confetti'
}

const INTENSITY_CONFIG = {
  subtle: { count: 30, speed: 3, duration: 1500 },
  medium: { count: 80, speed: 5, duration: 2000 },
  intense: { count: 150, speed: 8, duration: 2500 },
  epic: { count: 300, speed: 12, duration: 3500 },
}

const DEFAULT_COLORS = [
  '#FFD700', // Gold
  '#FFC107', // Amber
  '#FBBF24', // Yellow
  '#8B5CF6', // Violet
  '#A78BFA', // Purple
  '#F59E0B', // Orange
  '#FFFFFF', // White sparkle
]

export function ParticleExplosion({
  trigger,
  onComplete,
  origin,
  particleCount,
  colors = DEFAULT_COLORS,
  intensity = 'intense',
  type = 'burst',
}: ParticleExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)

  const config = INTENSITY_CONFIG[intensity]
  const count = particleCount || config.count

  const createParticle = useCallback(
    (centerX: number, centerY: number, index: number): Particle => {
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.5
      const speed = config.speed * (0.5 + Math.random())
      const shapes: Particle['shape'][] = ['circle', 'star', 'diamond', 'spark']

      let vx = 0,
        vy = 0

      switch (type) {
        case 'burst':
          vx = Math.cos(angle) * speed * (1 + Math.random())
          vy = Math.sin(angle) * speed * (1 + Math.random())
          break
        case 'rain':
          vx = (Math.random() - 0.5) * 2
          vy = speed * (0.5 + Math.random() * 0.5)
          break
        case 'firework':
          vx = Math.cos(angle) * speed * 2
          vy = Math.sin(angle) * speed * 2 - 3 // Initial upward
          break
        case 'confetti':
          vx = (Math.random() - 0.5) * speed
          vy = -speed * (0.5 + Math.random())
          break
      }

      const colorIndex = Math.floor(Math.random() * colors.length)
      const shapeIndex = Math.floor(Math.random() * shapes.length)
      const maybeColor = colors.at(colorIndex)
      const maybeShape = shapes.at(shapeIndex)
      const safeColor: string = maybeColor ?? '#FFD700'
      const safeShape: 'circle' | 'star' | 'diamond' | 'spark' = maybeShape ?? 'circle'

      return {
        id: `particle-${String(index)}`,
        x: centerX,
        y: centerY,
        vx: vx,
        vy: vy,
        size: 3 + Math.random() * 6,
        color: safeColor,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: config.duration * (0.5 + Math.random() * 0.5),
        shape: safeShape,
      }
    },
    [count, config.speed, config.duration, type, colors],
  )

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save()
    ctx.translate(particle.x, particle.y)
    ctx.rotate((particle.rotation * Math.PI) / 180)
    ctx.globalAlpha = particle.opacity

    ctx.shadowColor = particle.color
    ctx.shadowBlur = 10
    ctx.fillStyle = particle.color

    const size = particle.size * (1 - (particle.life / particle.maxLife) * 0.5)

    switch (particle.shape) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(0, 0, size, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'star':
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
          const outerX = Math.cos(angle) * size
          const outerY = Math.sin(angle) * size
          const innerAngle = angle + Math.PI / 5
          const innerX = Math.cos(innerAngle) * (size / 2)
          const innerY = Math.sin(innerAngle) * (size / 2)

          if (i === 0) ctx.moveTo(outerX, outerY)
          else ctx.lineTo(outerX, outerY)
          ctx.lineTo(innerX, innerY)
        }
        ctx.closePath()
        ctx.fill()
        break

      case 'diamond':
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(size * 0.6, 0)
        ctx.lineTo(0, size)
        ctx.lineTo(-size * 0.6, 0)
        ctx.closePath()
        ctx.fill()
        break

      case 'spark':
        ctx.beginPath()
        ctx.moveTo(-size, 0)
        ctx.lineTo(size, 0)
        ctx.moveTo(0, -size)
        ctx.lineTo(0, size)
        ctx.strokeStyle = particle.color
        ctx.lineWidth = 2
        ctx.stroke()
        break
    }

    ctx.restore()
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let activeParticles = 0

    particlesRef.current.forEach((particle) => {
      if (particle.life >= particle.maxLife) return

      activeParticles++

      // Update physics
      particle.x += particle.vx
      particle.y += particle.vy

      // Gravity and friction
      if (type === 'firework') {
        particle.vy += 0.15 // Gravity
      } else if (type === 'confetti') {
        particle.vy += 0.08
        particle.vx *= 0.99
      } else {
        particle.vy += 0.05
      }

      particle.vx *= 0.98
      particle.rotation += particle.rotationSpeed
      particle.life += 16.67 // ~60fps

      // Fade out
      const lifeRatio = particle.life / particle.maxLife
      particle.opacity = 1 - Math.pow(lifeRatio, 2)

      drawParticle(ctx, particle)
    })

    if (activeParticles > 0) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setIsActive(false)
      onComplete?.()
    }
  }, [type, drawParticle, onComplete])

  useEffect(() => {
    if (!trigger || isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Calculate origin
    const centerX = origin?.x ?? canvas.width / 2
    const centerY = origin?.y ?? canvas.height / 2

    // Create particles
    particlesRef.current = Array.from({ length: count }, (_, i) =>
      createParticle(centerX, centerY, i),
    )

    setIsActive(true)
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [trigger, origin, count, createParticle, animate, isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[9999]"
          style={{
            mixBlendMode: 'screen',
          }}
        />
      )}
    </AnimatePresence>
  )
}

// Convenience wrapper for success celebrations
export function SuccessCelebration({
  trigger,
  onComplete,
}: {
  trigger: boolean
  onComplete?: () => void
}) {
  return (
    <ParticleExplosion
      trigger={trigger}
      onComplete={onComplete}
      intensity="epic"
      type="confetti"
      colors={[
        '#FFD700',
        '#FFC107',
        '#FBBF24',
        '#F59E0B',
        '#8B5CF6',
        '#A78BFA',
        '#10B981',
        '#FFFFFF',
      ]}
    />
  )
}

export default ParticleExplosion
