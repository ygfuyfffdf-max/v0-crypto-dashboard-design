/**
 * 🌊 LIQUID MESH BACKGROUND 2026
 * ═══════════════════════════════════════════════════════════════════════════
 * Fondo animado con efectos de mesh gradient líquido
 * - WebGL shaders personalizados
 * - Animaciones fluidas
 * - Alto rendimiento
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export interface LiquidMeshBackgroundProps {
  colors?: string[]
  speed?: number
  className?: string
  opacity?: number
}

export function LiquidMeshBackground({
  colors = ['#a855f7', '#ec4899', '#e11d48', '#fbbf24'],
  speed = 0.0005,
  className = '',
  opacity = 0.4,
}: LiquidMeshBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Parse colors to RGB
    const parseColor = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return [r, g, b]
    }

    const colorRGBs = colors.map(parseColor)

    const animate = () => {
      time += speed

      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      // Clear
      ctx.clearRect(0, 0, w, h)

      // Draw gradient blobs
      colorRGBs.forEach((rgb, i) => {
        const angle = time + (i * Math.PI * 2) / colorRGBs.length
        const x = w / 2 + Math.cos(angle * 0.7) * w * 0.3 + Math.sin(angle * 1.3) * w * 0.2
        const y = h / 2 + Math.sin(angle * 0.8) * h * 0.3 + Math.cos(angle * 1.1) * h * 0.2
        const radius = Math.min(w, h) * 0.4 + Math.sin(angle * 2) * 50

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`)
        gradient.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`)

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [colors, speed, opacity])

  return (
    <motion.canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{ filter: 'blur(80px)' }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// GRID PATTERN BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

export interface GridPatternProps {
  size?: number
  className?: string
  opacity?: number
  animate?: boolean
}

export function GridPattern({
  size = 40,
  className = '',
  opacity = 0.05,
  animate = true,
}: GridPatternProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    >
      {animate && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(168,85,247,0.1) 0%, transparent 70%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// NOISE TEXTURE OVERLAY
// ═══════════════════════════════════════════════════════════════════════════

export function NoiseOverlay({
  opacity = 0.03,
  className = '',
}: {
  opacity?: number
  className?: string
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 mix-blend-overlay ${className}`}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// AURORA BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

export function AuroraBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Aurora waves */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent),
            radial-gradient(ellipse 60% 40% at 70% 50%, rgba(33, 150, 243, 0.15), transparent),
            radial-gradient(ellipse 50% 30% at 30% 70%, rgba(156, 39, 176, 0.2), transparent)
          `,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Moving light beams */}
      <motion.div
        className="absolute h-full w-full"
        style={{
          background:
            'linear-gradient(45deg, transparent 40%, rgba(168, 85, 247, 0.1) 50%, transparent 60%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE FIELD BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

export interface ParticleFieldProps {
  count?: number
  color?: string
  className?: string
}

export function ParticleField({
  count = 50,
  color = '#a855f7',
  className = '',
}: ParticleFieldProps) {
  // Usar estado para evitar hydration mismatch - generamos partículas solo en cliente
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      duration: number
      delay: number
    }>
  >([])

  // Generar partículas solo en el cliente
  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 3 + Math.random() * 5,
      delay: Math.random() * 5,
    }))
    setParticles(generated)
  }, [count])

  // No renderizar nada durante SSR para evitar hydration mismatch
  if (particles.length === 0) {
    return <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} />
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 4}px ${color}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -20, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE PREMIUM BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

export interface PremiumBackgroundProps {
  variant?: 'default' | 'aurora' | 'mesh' | 'minimal'
  className?: string
}

export function PremiumBackground({ variant = 'default', className = '' }: PremiumBackgroundProps) {
  return (
    <div className={`fixed inset-0 bg-black ${className}`}>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(120, 40, 200, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(40, 120, 200, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0) 0%, #000 100%)
          `,
        }}
      />

      {variant === 'aurora' && <AuroraBackground />}
      {variant === 'mesh' && <LiquidMeshBackground />}

      {/* Grid pattern */}
      <GridPattern opacity={0.03} animate={variant !== 'minimal'} />

      {/* Particle field */}
      {variant !== 'minimal' && <ParticleField count={30} />}

      {/* Noise texture */}
      <NoiseOverlay />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  )
}
