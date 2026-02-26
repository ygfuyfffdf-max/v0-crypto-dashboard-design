'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔮 AURA ORB — Orbe 3D Premium Estilo Aura AI
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Orbe holográfico ultra-premium con:
 * - Gradientes dinámicos violeta/rosa/azul
 * - Efecto de profundidad 3D con sombras
 * - Animaciones fluidas basadas en estado
 * - Reactividad al audio
 * - Efectos de partículas orbitando
 * - Glow pulsante y auras externas
 * - Reflejos especulares
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { CognitoState } from '../CognitoWidget/types'

interface AuraOrbProps {
  state: CognitoState
  size?: number
  audioLevel?: number
  isListening?: boolean
  isSpeaking?: boolean
  className?: string
  onClick?: () => void
}

// Colores por estado
const STATE_GRADIENTS: Record<CognitoState, { inner: string[]; outer: string }> = {
  idle: {
    inner: ['#8B5CF6', '#6366F1', '#EC4899'],
    outer: 'rgba(139, 92, 246, 0.3)',
  },
  listening: {
    inner: ['#22D3EE', '#3B82F6', '#8B5CF6'],
    outer: 'rgba(34, 211, 238, 0.4)',
  },
  thinking: {
    inner: ['#FBBF24', '#F59E0B', '#EC4899'],
    outer: 'rgba(251, 191, 36, 0.3)',
  },
  speaking: {
    inner: ['#22C55E', '#10B981', '#8B5CF6'],
    outer: 'rgba(34, 197, 94, 0.4)',
  },
  success: {
    inner: ['#22C55E', '#34D399', '#6366F1'],
    outer: 'rgba(34, 197, 94, 0.4)',
  },
  error: {
    inner: ['#EF4444', '#F87171', '#EC4899'],
    outer: 'rgba(239, 68, 68, 0.4)',
  },
  proactive: {
    inner: ['#F59E0B', '#FBBF24', '#EC4899'],
    outer: 'rgba(245, 158, 11, 0.4)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PARTICLE SYSTEM — Sistema de partículas orbitantes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface OrbitalParticle {
  id: number
  angle: number
  radius: number
  speed: number
  size: number
  opacity: number
  color: string
}

function ParticleRing({
  particles,
  centerX,
  centerY,
  isActive,
}: {
  particles: OrbitalParticle[]
  centerX: number
  centerY: number
  isActive: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const angleOffsetRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      if (isActive) {
        angleOffsetRef.current += 0.01
      }

      particles.forEach((particle) => {
        const currentAngle = particle.angle + angleOffsetRef.current * particle.speed
        const x = centerX + Math.cos(currentAngle) * particle.radius
        const y = centerY + Math.sin(currentAngle) * particle.radius

        ctx.beginPath()
        ctx.arc(x, y, particle.size, 0, Math.PI * 2)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2)
        gradient.addColorStop(0, particle.color)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.globalAlpha = isActive ? particle.opacity : particle.opacity * 0.3
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [particles, centerX, centerY, isActive])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 MAIN ORB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export function AuraOrb({
  state,
  size = 200,
  audioLevel = 0,
  isListening = false,
  isSpeaking = false,
  className,
  onClick,
}: AuraOrbProps) {
  const [particles] = useState<OrbitalParticle[]>(() => {
    const p: OrbitalParticle[] = []
    const colors = ['#8B5CF6', '#EC4899', '#6366F1', '#22D3EE', '#A855F7']

    for (let i = 0; i < 30; i++) {
      p.push({
        id: i,
        angle: Math.random() * Math.PI * 2,
        radius: (size / 2) * (0.8 + Math.random() * 0.5),
        speed: 0.3 + Math.random() * 0.7,
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]!,
      })
    }

    return p
  })

  const gradients = STATE_GRADIENTS[state]
  const isActive = isListening || isSpeaking
  const scaleFactor = 1 + audioLevel * 0.1

  // Orb size calculations
  const orbSize = size * 0.65
  const halfSize = size / 2

  return (
    <div
      className={cn(
        'relative flex items-center justify-center cursor-pointer',
        className,
      )}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Partículas orbitando */}
      <ParticleRing
        particles={particles}
        centerX={halfSize}
        centerY={halfSize}
        isActive={isActive}
      />

      {/* Outer glow rings */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: orbSize * 1.8,
          height: orbSize * 1.8,
          background: `radial-gradient(circle, ${gradients.outer} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isActive ? [0.5, 0.8, 0.5] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary glow ring */}
      {isActive && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: orbSize * 1.5,
            height: orbSize * 1.5,
            border: `2px solid ${gradients.inner[0]}40`,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Main orb shadow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: orbSize,
          height: orbSize,
          background: `radial-gradient(ellipse 80% 90% at 50% 110%, ${gradients.inner[2]}60 0%, transparent 60%)`,
          transform: 'translateY(10%)',
          filter: 'blur(15px)',
        }}
        animate={{ scale: scaleFactor }}
      />

      {/* Main orb */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: orbSize,
          height: orbSize,
          boxShadow: `
            inset 0 -20px 40px ${gradients.inner[2]}40,
            inset 0 20px 40px ${gradients.inner[0]}30,
            0 0 60px ${gradients.outer},
            0 0 100px ${gradients.outer.replace('0.3', '0.15')}
          `,
        }}
        animate={{
          scale: scaleFactor,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          scale: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
          },
        }}
      >
        {/* Base gradient */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(
                ellipse 120% 100% at 30% 20%,
                ${gradients.inner[0]} 0%,
                ${gradients.inner[1]} 30%,
                ${gradients.inner[2]} 70%,
                ${gradients.inner[1]}80 100%
              )
            `,
          }}
          animate={{
            rotate: isActive ? [0, 360] : 0,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner glow layer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(
                circle at 30% 30%,
                rgba(255, 255, 255, 0.4) 0%,
                transparent 50%
              )
            `,
          }}
        />

        {/* Specular highlight */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '25%',
            top: '12%',
            left: '18%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 100%)',
            filter: 'blur(8px)',
            borderRadius: '50%',
          }}
        />

        {/* Secondary specular */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '20%',
            height: '10%',
            top: '20%',
            left: '60%',
            background: 'rgba(255,255,255,0.3)',
            filter: 'blur(5px)',
            borderRadius: '50%',
          }}
        />

        {/* Audio reactive pulse */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${gradients.inner[0]}40 0%, transparent 50%)`,
            }}
            animate={{
              scale: [1, 1 + audioLevel * 0.3, 1],
              opacity: [0.3, 0.6 * audioLevel + 0.3, 0.3],
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
            }}
          />
        )}

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              conic-gradient(
                from 0deg,
                ${gradients.inner[0]}20,
                ${gradients.inner[1]}30,
                ${gradients.inner[2]}20,
                ${gradients.inner[0]}20
              )
            `,
            mixBlendMode: 'overlay',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: isActive ? 4 : 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner reflection ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
          }}
        />

        {/* Deep core */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '30%',
            height: '30%',
            top: '35%',
            left: '35%',
            background: `radial-gradient(circle, ${gradients.inner[1]}80 0%, transparent 80%)`,
            filter: 'blur(10px)',
          }}
          animate={{
            scale: isActive ? [1, 1.2, 1] : 1,
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Outer pulse rings when active */}
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full border"
            style={{
              width: orbSize,
              height: orbSize,
              borderColor: `${gradients.inner[0]}50`,
            }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute rounded-full border"
            style={{
              width: orbSize,
              height: orbSize,
              borderColor: `${gradients.inner[1]}40`,
            }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.5,
            }}
          />
        </>
      )}
    </div>
  )
}

export default AuraOrb
