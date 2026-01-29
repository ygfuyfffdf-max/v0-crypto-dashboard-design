'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 ADVANCED BACKGROUND EFFECTS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de fondos animados premium:
 * - Aurora Borealis interactiva
 * - Mesh Gradient fluido
 * - Particle Field con física
 * - Noise Texture animada
 * - Grid Pattern holográfico
 * - Nebula Effect profundo
 * - Starfield parallax
 * - Liquid Waves suaves
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 COLOR PALETTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const AURORA_PALETTES = {
  cosmic: ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'],
  sunset: ['#F59E0B', '#EC4899', '#8B5CF6', '#F43F5E'],
  ocean: ['#06B6D4', '#3B82F6', '#8B5CF6', '#10B981'],
  forest: ['#10B981', '#22C55E', '#84CC16', '#06B6D4'],
  fire: ['#F59E0B', '#EF4444', '#F43F5E', '#EC4899'],
  midnight: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1'],
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 AURORA BOREALIS — Efecto de aurora boreal interactiva
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraBorealisProps {
  className?: string
  palette?: keyof typeof AURORA_PALETTES
  intensity?: 'subtle' | 'medium' | 'vibrant'
  interactive?: boolean
  speed?: 'slow' | 'normal' | 'fast'
  blur?: number
}

export function AuroraBorealis({
  className,
  palette = 'cosmic',
  intensity = 'medium',
  interactive = true,
  speed = 'normal',
  blur = 150,
}: AuroraBorealisProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 30, damping: 20 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Pre-compute transforms at component level
  const transformX = useTransform(smoothX, [0, 1], [-50, 50])
  const transformY = useTransform(smoothY, [0, 1], [-50, 50])

  const colors = AURORA_PALETTES[palette]

  const intensityMap = {
    subtle: { opacity: 0.25, scale: 1 },
    medium: { opacity: 0.45, scale: 1.2 },
    vibrant: { opacity: 0.65, scale: 1.4 },
  }

  const speedMap = {
    slow: 25,
    normal: 15,
    fast: 8,
  }

  const config = intensityMap[intensity]
  const duration = speedMap[speed]

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [interactive, mouseX, mouseY],
  )

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden', className)}
      onMouseMove={handleMouseMove}
    >
      {/* Aurora Blobs */}
      {colors.map((color, i) => {
        const baseX = (100 / (colors.length + 1)) * (i + 1)
        const baseY = 20 + i * 15

        return (
          <motion.div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: `${30 + i * 10}%`,
              height: `${30 + i * 10}%`,
              background: `radial-gradient(circle, ${color}80 0%, ${color}40 40%, transparent 70%)`,
              filter: `blur(${blur}px)`,
              opacity: config.opacity,
              x: transformX,
              y: transformY,
            }}
            animate={{
              left: [`${baseX - 15}%`, `${baseX + 15}%`, `${baseX - 15}%`],
              top: [`${baseY - 15}%`, `${baseY + 15}%`, `${baseY - 15}%`],
              scale: [1, config.scale, 1],
            }}
            transition={{
              duration: duration + i * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2,
            }}
          />
        )
      })}

      {/* Shimmer Overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '200% 200%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 MESH GRADIENT — Gradiente de malla fluido
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MeshGradientProps {
  className?: string
  colors?: string[]
  animate?: boolean
  speed?: number
}

export function MeshGradient({
  className,
  colors = ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'],
  animate = true,
  speed: _,
}: MeshGradientProps) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    if (!animate) return

    const interval = setInterval(() => {
      setTime((t) => t + 0.01)
    }, 50)

    return () => clearInterval(interval)
  }, [animate])

  const gradientStyle = useMemo(() => {
    const positions = colors.map((_, i) => {
      const angle = (i / colors.length) * Math.PI * 2 + time
      const x = 50 + Math.sin(angle) * 30
      const y = 50 + Math.cos(angle) * 30
      return { x, y }
    })

    const gradients = colors.map((color, i) => {
      const pos = positions[i]
      return `radial-gradient(circle at ${pos?.x}% ${pos?.y}%, ${color}40, transparent 50%)`
    })

    return { background: gradients.join(', ') }
  }, [colors, time])

  return (
    <div
      className={cn('absolute inset-0 transition-all duration-1000', className)}
      style={gradientStyle}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ PARTICLE FIELD — Campo de partículas con física
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParticleFieldProps {
  className?: string
  particleCount?: number
  color?: string
  interactive?: boolean
  connectionDistance?: number
  speed?: number
}

export function ParticleField({
  className,
  particleCount = 80,
  color = '#8B5CF6',
  interactive = true,
  connectionDistance = 120,
  speed = 0.5,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }

    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2 + 1,
      })
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(3, 3, 8, 0.1)'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      particles.forEach((particle, i) => {
        // Actualizar posición
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce en bordes
        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1

        // Atracción al mouse
        if (interactive) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            particle.vx += dx * 0.0002
            particle.vy += dy * 0.0002
          }
        }

        // Dibujar partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Conexiones
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j]
          if (!other) continue
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `${color}${Math.floor((1 - dist / connectionDistance) * 50)
              .toString(16)
              .padStart(2, '0')}`
            ctx.stroke()
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [particleCount, color, interactive, connectionDistance, speed])

  return <canvas ref={canvasRef} className={cn('absolute inset-0', className)} />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📐 HOLOGRAPHIC GRID — Patrón de grid holográfico
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HolographicGridProps {
  className?: string
  color?: string
  size?: number
  opacity?: number
  perspective?: boolean
}

export function HolographicGrid({
  className,
  color = '#8B5CF6',
  size = 60,
  opacity = 0.15,
  perspective = true,
}: HolographicGridProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Grid Pattern */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${color}${Math.floor(opacity * 255)
              .toString(16)
              .padStart(2, '0')} 1px, transparent 1px),
            linear-gradient(90deg, ${color}${Math.floor(opacity * 255)
              .toString(16)
              .padStart(2, '0')} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          transform: perspective ? 'perspective(500px) rotateX(60deg)' : undefined,
          transformOrigin: 'top',
        }}
        animate={{
          backgroundPosition: ['0px 0px', `0px ${size}px`],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Glow Lines */}
      <motion.div
        className="absolute inset-x-0 top-1/3 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 20px ${color}`,
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Perspective Fade */}
      {perspective && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(3,3,8,0.9) 0%, transparent 50%)',
          }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 NEBULA EFFECT — Efecto de nebulosa profunda
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NebulaEffectProps {
  className?: string
  colors?: string[]
  density?: 'sparse' | 'medium' | 'dense'
}

export function NebulaEffect({
  className,
  colors = ['#8B5CF6', '#EC4899', '#06B6D4'],
  density = 'medium',
}: NebulaEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const densityMap = {
    sparse: { clouds: 3, particles: 100 },
    medium: { clouds: 5, particles: 200 },
    dense: { clouds: 8, particles: 350 },
  }

  const config = densityMap[density]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.scale(dpr, dpr)

    // Crear nubes de nebulosa
    interface Cloud {
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number
    }

    const clouds: Cloud[] = []
    for (let i = 0; i < config.clouds; i++) {
      clouds.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 100 + Math.random() * 200,
        color: colors[i % colors.length] ?? '#8B5CF6',
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      })
    }

    // Estrellas de fondo
    interface Star {
      x: number
      y: number
      size: number
      twinkle: number
    }

    const stars: Star[] = []
    for (let i = 0; i < config.particles; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
      })
    }

    let time = 0
    let animationId: number

    const animate = () => {
      time += 0.01

      // Fondo oscuro
      ctx.fillStyle = '#030308'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      // Dibujar nubes de nebulosa
      clouds.forEach((cloud) => {
        cloud.x += cloud.vx
        cloud.y += cloud.vy

        // Wrap around
        if (cloud.x < -cloud.radius) cloud.x = window.innerWidth + cloud.radius
        if (cloud.x > window.innerWidth + cloud.radius) cloud.x = -cloud.radius
        if (cloud.y < -cloud.radius) cloud.y = window.innerHeight + cloud.radius
        if (cloud.y > window.innerHeight + cloud.radius) cloud.y = -cloud.radius

        const gradient = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius,
        )
        gradient.addColorStop(0, `${cloud.color}30`)
        gradient.addColorStop(0.5, `${cloud.color}15`)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Dibujar estrellas
      stars.forEach((star) => {
        const twinkle = Math.sin(time * 2 + star.twinkle) * 0.4 + 0.6
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [colors, config.clouds, config.particles])

  return <canvas ref={canvasRef} className={cn('absolute inset-0', className)} />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID WAVES — Ondas líquidas suaves
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidWavesProps {
  className?: string
  color?: string
  waveCount?: number
  speed?: number
  amplitude?: number
}

export function LiquidWaves({
  className,
  color = '#8B5CF6',
  waveCount = 3,
  speed = 0.02,
  amplitude = 50,
}: LiquidWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0
    let animationId: number

    const animate = () => {
      time += speed

      ctx.fillStyle = 'rgba(3, 3, 8, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let w = 0; w < waveCount; w++) {
        const waveOffset = w * 0.5
        const waveAmplitude = amplitude * (1 - w * 0.2)
        const waveY = canvas.height * 0.6 + w * 40

        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        for (let x = 0; x <= canvas.width; x += 5) {
          const y =
            waveY +
            Math.sin(x * 0.01 + time + waveOffset) * waveAmplitude +
            Math.sin(x * 0.02 + time * 1.5 + waveOffset) * (waveAmplitude * 0.5)
          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()

        const gradient = ctx.createLinearGradient(0, waveY - amplitude, 0, canvas.height)
        gradient.addColorStop(
          0,
          `${color}${Math.floor((0.3 - w * 0.08) * 255)
            .toString(16)
            .padStart(2, '0')}`,
        )
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [color, waveCount, speed, amplitude])

  return <canvas ref={canvasRef} className={cn('absolute inset-0', className)} />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎆 VIGNETTE OVERLAY — Viñeta cinematográfica
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VignetteOverlayProps {
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
  color?: string
}

export function VignetteOverlay({
  className,
  intensity = 'medium',
  color = '#000000',
}: VignetteOverlayProps) {
  const intensityMap = {
    subtle: { inner: '30%', outer: '80%' },
    medium: { inner: '20%', outer: '90%' },
    strong: { inner: '10%', outer: '95%' },
  }

  const config = intensityMap[intensity]

  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        background: `radial-gradient(ellipse at center, transparent ${config.inner}, ${color}90 ${config.outer})`,
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default {
  AuroraBorealis,
  MeshGradient,
  ParticleField,
  HolographicGrid,
  NebulaEffect,
  LiquidWaves,
  VignetteOverlay,
  AURORA_PALETTES,
}
