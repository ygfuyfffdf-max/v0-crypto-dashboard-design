'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — QUANTUM SHADER BACKGROUNDS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Shaders cinematográficos para fondos de cada panel:
 * - Liquid Distortion Violeta/Oro
 * - Volumetric Fog
 * - Particles 1M+ reactivas
 * - Parallax Layers
 *
 * Implementación Canvas 2D optimizada para 60fps
 * (WebGPU disponible en quantum-webgpu-shaders.ts)
 */

import { useRef, useEffect, useMemo, useCallback } from 'react'
import { QUANTUM_PALETTE, type QuantumMood } from '@/app/lib/design-system/quantum-infinity-2026'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID DISTORTION SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidDistortionProps {
  mood?: QuantumMood
  intensity?: number
  className?: string
}

export const LiquidDistortionBackground = ({
  mood = 'flow',
  intensity = 1,
  className = '',
}: LiquidDistortionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const moodConfig = useMemo(
    () => ({
      calm: { speed: 0.3, waveAmplitude: 20, colorMix: 0.3 },
      flow: { speed: 0.5, waveAmplitude: 35, colorMix: 0.5 },
      stress: { speed: 0.8, waveAmplitude: 25, colorMix: 0.4 },
      euphoric: { speed: 1.0, waveAmplitude: 50, colorMix: 0.7 },
      neutral: { speed: 0.4, waveAmplitude: 30, colorMix: 0.4 },
      focus: { speed: 0.6, waveAmplitude: 30, colorMix: 0.5 },
      night: { speed: 0.2, waveAmplitude: 15, colorMix: 0.2 },
    }),
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const config = moodConfig[mood]
    let time = 0

    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      time += config.speed * 0.01

      // Clear
      ctx.fillStyle = QUANTUM_PALETTE.void.pure
      ctx.fillRect(0, 0, width, height)

      // Liquid waves
      const waveCount = 5
      for (let w = 0; w < waveCount; w++) {
        const waveOffset = w * 0.5
        const alpha = (0.05 + w * 0.02) * intensity

        ctx.beginPath()
        ctx.moveTo(0, height)

        for (let x = 0; x <= width; x += 10) {
          const distFromMouse = Math.sqrt(
            Math.pow(x / width - mouseRef.current.x, 2) + Math.pow(0.5 - mouseRef.current.y, 2),
          )
          const mouseInfluence = Math.max(0, 1 - distFromMouse * 2)

          const y =
            height * (0.3 + w * 0.15) +
            Math.sin(x * 0.01 + time + waveOffset) * config.waveAmplitude * intensity +
            Math.sin(x * 0.02 + time * 1.5 + waveOffset) * config.waveAmplitude * 0.5 * intensity +
            mouseInfluence * 50

          ctx.lineTo(x, y)
        }

        ctx.lineTo(width, height)
        ctx.closePath()

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        const violetAlpha = Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, '0')
        const goldAlpha = Math.floor(alpha * 0.7 * 255)
          .toString(16)
          .padStart(2, '0')

        gradient.addColorStop(0, `${QUANTUM_PALETTE.violet.pure}${violetAlpha}`)
        gradient.addColorStop(
          0.5 + Math.sin(time) * 0.2,
          `${QUANTUM_PALETTE.gold.pure}${goldAlpha}`,
        )
        gradient.addColorStop(1, `${QUANTUM_PALETTE.violet.soft}${violetAlpha}`)

        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Volumetric fog overlay
      const fogGradient = ctx.createRadialGradient(
        width * mouseRef.current.x,
        height * mouseRef.current.y,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8,
      )
      fogGradient.addColorStop(0, `${QUANTUM_PALETTE.violet.pure}15`)
      fogGradient.addColorStop(0.5, `${QUANTUM_PALETTE.gold.pure}08`)
      fogGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = fogGradient
      ctx.fillRect(0, 0, width, height)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mood, intensity, moodConfig])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 h-full w-full ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ PARTICLE FIELD SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParticleFieldProps {
  mood?: QuantumMood
  particleCount?: number
  className?: string
}

export const ParticleFieldBackground = ({
  mood = 'flow',
  particleCount = 1000,
  className = '',
}: ParticleFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const moodConfig = useMemo(
    () => ({
      calm: { speed: 0.2, turbulence: 0.1, attractStrength: 0.001 },
      flow: { speed: 0.4, turbulence: 0.2, attractStrength: 0.002 },
      stress: { speed: 0.6, turbulence: 0.4, attractStrength: 0.001 },
      euphoric: { speed: 0.8, turbulence: 0.3, attractStrength: 0.003 },
      neutral: { speed: 0.3, turbulence: 0.15, attractStrength: 0.0015 },
      focus: { speed: 0.5, turbulence: 0.25, attractStrength: 0.002 },
      night: { speed: 0.15, turbulence: 0.08, attractStrength: 0.0008 },
    }),
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const config = moodConfig[mood]
    const colors = [
      QUANTUM_PALETTE.violet.pure,
      QUANTUM_PALETTE.gold.pure,
      QUANTUM_PALETTE.violet.neon,
      QUANTUM_PALETTE.gold.soft,
      QUANTUM_PALETTE.plasma.pure,
    ]

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

    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)] as string,
        alpha: Math.random() * 0.6 + 0.2,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
      })
    }

    let time = 0
    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      time += 0.016

      // Fade trail
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + config.turbulence * 0.1})`
      ctx.fillRect(0, 0, width, height)

      const mouseX = mouseRef.current.x * width
      const mouseY = mouseRef.current.y * height

      particles.forEach((p) => {
        // Attract to mouse
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 300) {
          p.vx += (dx / dist) * config.attractStrength * (300 - dist)
          p.vy += (dy / dist) * config.attractStrength * (300 - dist)
        }

        // Turbulence
        p.vx += (Math.random() - 0.5) * config.turbulence
        p.vy += (Math.random() - 0.5) * config.turbulence

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99

        // Update position
        p.x += p.vx * config.speed
        p.y += p.vy * config.speed

        // Wrap
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Life cycle
        p.life += 0.5
        if (p.life > p.maxLife) {
          p.life = 0
          p.x = Math.random() * width
          p.y = Math.random() * height
        }

        const lifeRatio = p.life / p.maxLife
        const fadeAlpha =
          lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : 1

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * fadeAlpha
        ctx.fill()

        // Glow
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mood, particleCount, moodConfig])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 h-full w-full ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎆 CELEBRATION PARTICLES (Explosivas on-money)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CelebrationParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  gravity: number
}

export const useCelebrationParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<CelebrationParticle[]>([])
  const animationRef = useRef<number>(0)

  const init = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas

    const animate = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter((p) => {
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02
        p.alpha = p.life

        if (p.life <= 0) return false

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.shadowColor = p.color
        ctx.shadowBlur = 15
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1

        return true
      })

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()
  }, [])

  const explode = useCallback(
    (x: number, y: number, count: number = 50, type: 'gold' | 'violet' = 'gold') => {
      if (!canvasRef.current) return

      const colors =
        type === 'gold'
          ? [QUANTUM_PALETTE.gold.pure, QUANTUM_PALETTE.gold.soft, QUANTUM_PALETTE.gold.deep]
          : [QUANTUM_PALETTE.violet.pure, QUANTUM_PALETTE.violet.neon, QUANTUM_PALETTE.violet.soft]

      for (let i = 0; i < count; i++) {
        const angle = ((Math.PI * 2) / count) * i + Math.random() * 0.5
        const speed = 3 + Math.random() * 8

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)] as string,
          alpha: 1,
          life: 1,
          gravity: 0.15,
        })
      }

      cancelAnimationFrame(animationRef.current)
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        const animate = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

          particlesRef.current = particlesRef.current.filter((p) => {
            p.vy += p.gravity
            p.x += p.vx
            p.y += p.vy
            p.life -= 0.015
            p.alpha = p.life

            if (p.life <= 0) return false

            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
            ctx.fillStyle = p.color
            ctx.globalAlpha = p.alpha
            ctx.shadowColor = p.color
            ctx.shadowBlur = 15
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.globalAlpha = 1

            return true
          })

          if (particlesRef.current.length > 0) {
            animationRef.current = requestAnimationFrame(animate)
          }
        }
        animate()
      }
    },
    [],
  )

  return { init, explode }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 COMBINED SHADER BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumBackgroundProps {
  mood?: QuantumMood
  variant?: 'liquid' | 'particles' | 'combined'
  intensity?: number
  className?: string
}

export const QuantumBackground = ({
  mood = 'flow',
  variant = 'combined',
  intensity = 1,
  className = '',
}: QuantumBackgroundProps) => {
  if (variant === 'liquid') {
    return <LiquidDistortionBackground mood={mood} intensity={intensity} className={className} />
  }

  if (variant === 'particles') {
    return <ParticleFieldBackground mood={mood} className={className} />
  }

  // Combined - both layers
  return (
    <>
      <LiquidDistortionBackground mood={mood} intensity={intensity * 0.7} className={className} />
      <ParticleFieldBackground mood={mood} particleCount={500} className={className} />
    </>
  )
}

export default QuantumBackground
