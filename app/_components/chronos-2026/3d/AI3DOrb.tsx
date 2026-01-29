/**
 * 🔮 AI3D ORB - ORBE IA 3D PREMIUM ULTRA INMERSIVO
 * ═══════════════════════════════════════════════════════════════════════════
 * Orbe 3D reactivo con Canvas API para representación visual de IA
 * Animaciones premium sin dependencias 3D pesadas (Three.js/R3F)
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export type AIState = 'idle' | 'listening' | 'thinking' | 'responding' | 'success' | 'error'

export interface AI3DOrbProps {
  state?: AIState
  audioLevel?: number
  size?: number
  className?: string
  onClick?: () => void
  pulseOnHover?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// COLORES POR ESTADO
// ═══════════════════════════════════════════════════════════════════════════

const STATE_COLORS: Record<AIState, { primary: string; secondary: string; glow: string }> = {
  idle: { primary: '#8B5CF6', secondary: '#C4B5FD', glow: 'rgba(139, 92, 246, 0.5)' },
  listening: { primary: '#FFD700', secondary: '#FEF08A', glow: 'rgba(255, 215, 0, 0.5)' },
  thinking: { primary: '#F472B6', secondary: '#FBCFE8', glow: 'rgba(244, 114, 182, 0.5)' },
  responding: { primary: '#10B981', secondary: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.5)' },
  success: { primary: '#10B981', secondary: '#6EE7B7', glow: 'rgba(16, 185, 129, 0.6)' },
  error: { primary: '#EF4444', secondary: '#FCA5A5', glow: 'rgba(239, 68, 68, 0.5)' },
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  angle: number
  speed: number
  orbitRadius: number
  alpha: number
}

function createParticles(count: number, centerX: number, centerY: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    radius: Math.random() * 2 + 1,
    angle: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.01,
    orbitRadius: Math.random() * 30 + 40,
    alpha: Math.random() * 0.5 + 0.5,
  }))
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function AI3DOrb({
  state = 'idle',
  audioLevel = 0,
  size = 150,
  className = '',
  onClick,
  pulseOnHover = true,
}: AI3DOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)

  // Motion values para interactividad
  const scale = useMotionValue(1)
  const springScale = useSpring(scale, { stiffness: 400, damping: 25 })
  const glowOpacity = useTransform(springScale, [1, 1.1], [0.4, 0.8])

  const colors = useMemo(() => STATE_COLORS[state], [state])

  // Inicializar partículas
  useEffect(() => {
    const centerX = size / 2
    const centerY = size / 2
    particlesRef.current = createParticles(20, centerX, centerY)
  }, [size])

  // Función principal de animación
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const baseRadius = size * 0.25

    timeRef.current += 0.016
    const time = timeRef.current

    // Clear
    ctx.clearRect(0, 0, size, size)

    // ═════════════════════════════════════════════════════════════════════
    // OUTER GLOW LAYERS
    // ═════════════════════════════════════════════════════════════════════

    const glowLayers = [
      { radius: baseRadius * 2.5, alpha: 0.03 },
      { radius: baseRadius * 2.0, alpha: 0.05 },
      { radius: baseRadius * 1.6, alpha: 0.08 },
      { radius: baseRadius * 1.3, alpha: 0.12 },
    ]

    glowLayers.forEach((layer) => {
      const pulseOffset = Math.sin(time * 2) * 5 * (audioLevel + 0.3)
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        layer.radius + pulseOffset,
      )
      gradient.addColorStop(0, colors.glow)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.globalAlpha = layer.alpha
      ctx.beginPath()
      ctx.arc(centerX, centerY, layer.radius + pulseOffset, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.globalAlpha = 1

    // ═════════════════════════════════════════════════════════════════════
    // ORBITING PARTICLES
    // ═════════════════════════════════════════════════════════════════════

    particlesRef.current.forEach((particle) => {
      // Update position
      particle.angle += particle.speed * (1 + audioLevel * 2)

      const wobble = Math.sin(time * 3 + particle.angle) * 3
      const currentRadius = particle.orbitRadius + wobble + audioLevel * 10

      particle.x = centerX + Math.cos(particle.angle) * currentRadius
      particle.y = centerY + Math.sin(particle.angle) * currentRadius

      // Draw particle with trail effect
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius * 2,
      )
      gradient.addColorStop(0, colors.secondary)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.globalAlpha = particle.alpha * (0.5 + audioLevel * 0.5)
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius * (1 + audioLevel), 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.globalAlpha = 1

    // ═════════════════════════════════════════════════════════════════════
    // MAIN ORB - LIQUID DISTORTION
    // ═════════════════════════════════════════════════════════════════════

    // Estado específico modifica la forma
    const distortionFactor =
      state === 'thinking'
        ? 0.15
        : state === 'listening'
          ? 0.08 + audioLevel * 0.2
          : state === 'responding'
            ? 0.1
            : 0.05

    const waveFrequency = state === 'thinking' ? 8 : 6
    const waveSpeed = state === 'thinking' ? 4 : state === 'listening' ? 3 : 2

    // Crear path orgánico
    ctx.beginPath()

    for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
      const noise = Math.sin(angle * waveFrequency + time * waveSpeed) * distortionFactor
      const audioDistort = audioLevel * Math.sin(angle * 12 + time * 6) * 0.1
      const radius = baseRadius * (1 + noise + audioDistort)

      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      if (angle === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.closePath()

    // Gradient fill
    const orbGradient = ctx.createRadialGradient(
      centerX - baseRadius * 0.3,
      centerY - baseRadius * 0.3,
      0,
      centerX,
      centerY,
      baseRadius * 1.2,
    )
    orbGradient.addColorStop(0, colors.secondary)
    orbGradient.addColorStop(0.4, colors.primary)
    orbGradient.addColorStop(1, 'rgba(0,0,0,0.8)')

    ctx.fillStyle = orbGradient
    ctx.fill()

    // Inner glow
    const innerGlow = ctx.createRadialGradient(
      centerX - baseRadius * 0.2,
      centerY - baseRadius * 0.2,
      0,
      centerX,
      centerY,
      baseRadius * 0.8,
    )
    innerGlow.addColorStop(0, 'rgba(255,255,255,0.4)')
    innerGlow.addColorStop(0.5, 'rgba(255,255,255,0.1)')
    innerGlow.addColorStop(1, 'transparent')

    ctx.fillStyle = innerGlow
    ctx.fill()

    // ═════════════════════════════════════════════════════════════════════
    // CENTER CORE
    // ═════════════════════════════════════════════════════════════════════

    const coreRadius = baseRadius * 0.25 * (1 + audioLevel * 0.5)
    const corePulse = 1 + Math.sin(time * 4) * 0.1

    const coreGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      coreRadius * corePulse,
    )
    coreGradient.addColorStop(0, '#FFFFFF')
    coreGradient.addColorStop(0.3, colors.secondary)
    coreGradient.addColorStop(1, colors.primary)

    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, coreRadius * corePulse, 0, Math.PI * 2)
    ctx.fill()

    // ═════════════════════════════════════════════════════════════════════
    // ENERGY RINGS (when active states)
    // ═════════════════════════════════════════════════════════════════════

    if (state === 'listening' || state === 'thinking' || state === 'responding') {
      const ringCount = 3
      for (let i = 0; i < ringCount; i++) {
        const ringRadius = baseRadius * (1.3 + i * 0.15)
        const ringAlpha = 0.3 - i * 0.1
        const ringPhase = time * (2 - i * 0.3) + (i * Math.PI) / 3

        ctx.strokeStyle = colors.primary
        ctx.globalAlpha = ringAlpha * (0.5 + Math.sin(ringPhase) * 0.5)
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    ctx.globalAlpha = 1

    // Continue animation
    animationRef.current = requestAnimationFrame(animate)
  }, [size, colors, state, audioLevel])

  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  // Mouse interactions
  const handleMouseEnter = () => {
    if (pulseOnHover) {
      scale.set(1.08)
    }
  }

  const handleMouseLeave = () => {
    scale.set(1)
  }

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{
        width: size,
        height: size,
        scale: springScale,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow container */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          opacity: glowOpacity,
          filter: 'blur(20px)',
        }}
      />

      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="relative z-10"
        style={{
          filter: `drop-shadow(0 0 ${10 + audioLevel * 20}px ${colors.primary})`,
        }}
      />

      {/* State indicator */}
      <motion.div
        initial={false}
        animate={{
          scale: state === 'listening' || state === 'responding' ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: state === 'listening' || state === 'responding' ? Infinity : 0,
        }}
        className="absolute right-1 bottom-1 z-20"
      >
        <div
          className="h-3 w-3 rounded-full border-2 border-black/50"
          style={{ backgroundColor: colors.primary }}
        />
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI ORB (Para uso en headers/badges)
// ═══════════════════════════════════════════════════════════════════════════

export function AI3DOrbMini({
  state = 'idle',
  size = 40,
  className = '',
}: Omit<AI3DOrbProps, 'audioLevel' | 'onClick' | 'pulseOnHover'>) {
  const colors = STATE_COLORS[state]

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{
        scale: state !== 'idle' ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ width: size, height: size }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Orb */}
      <div
        className="absolute inset-1 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.primary})`,
          boxShadow: `0 0 15px ${colors.glow}`,
        }}
      />

      {/* Core */}
      <div
        className="absolute inset-[35%] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
        }}
      />
    </motion.div>
  )
}

export default AI3DOrb
