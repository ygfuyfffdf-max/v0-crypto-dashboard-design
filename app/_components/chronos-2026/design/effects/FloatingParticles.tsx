'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔮 FLOATING PARTICLES SUPREME — Ultra Premium Particle System
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de partículas cinematográficas con:
 * - Física orgánica realista
 * - Efectos de luz y glow dinámicos
 * - Interactividad con mouse
 * - Múltiples capas de profundidad
 * - Optimizado para 60fps
 */

import { motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  delay: number
  blur: number
  color: string
  glow: boolean
}

interface FloatingParticlesProps {
  count?: number
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold' | 'mixed'
  intensity?: 'low' | 'medium' | 'high' | 'ultra'
  interactive?: boolean
  depth?: boolean
  glowEffect?: boolean
  className?: string
}

const PARTICLE_COLORS = {
  violet: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
  cyan: ['#06B6D4', '#22D3EE', '#67E8F9'],
  magenta: ['#EC4899', '#F472B6', '#FBCFE8'],
  emerald: ['#10B981', '#34D399', '#6EE7B7'],
  gold: ['#FBBF24', '#FCD34D', '#FDE68A'],
  mixed: ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#FBBF24'],
}

const INTENSITY_CONFIG = {
  low: { count: 15, sizeRange: [2, 4], speedRange: [15, 25] },
  medium: { count: 30, sizeRange: [2, 6], speedRange: [12, 22] },
  high: { count: 50, sizeRange: [2, 8], speedRange: [10, 20] },
  ultra: { count: 80, sizeRange: [2, 10], speedRange: [8, 18] },
}

// Memoized particle generator
const generateParticles = (
  count: number,
  colors: string[],
  sizeRange: number[],
  speedRange: number[],
  depth: boolean,
  glow: boolean,
): Particle[] => {
  // Safety checks
  const minSize = sizeRange[0] ?? 2
  const maxSize = sizeRange[1] ?? 6
  const minSpeed = speedRange[0] ?? 10
  const maxSpeed = speedRange[1] ?? 20

  return Array.from({ length: count }, (_, i) => {
    const layer = depth ? Math.random() : 0.5
    const baseSize = minSize + Math.random() * (maxSize - minSize)
    const selectedColor = colors[Math.floor(Math.random() * colors.length)] as string

    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: baseSize * (depth ? 0.5 + layer : 1),
      opacity: depth ? 0.2 + layer * 0.6 : 0.3 + Math.random() * 0.5,
      speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
      delay: Math.random() * 5,
      blur: depth ? (1 - layer) * 3 : Math.random() * 2,
      color: selectedColor,
      glow: glow && Math.random() > 0.6,
    }
  })
}

// Individual particle component for better performance
const ParticleElement = memo(function ParticleElement({
  particle,
  mouseX,
  mouseY,
  interactive,
}: {
  particle: Particle
  mouseX: number
  mouseY: number
  interactive: boolean
}) {
  const offsetX = interactive ? (mouseX - 50) * 0.02 * particle.opacity : 0
  const offsetY = interactive ? (mouseY - 50) * 0.02 * particle.opacity : 0

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: particle.size,
        height: particle.size,
        left: `${particle.x}%`,
        filter: particle.blur > 0 ? `blur(${particle.blur}px)` : undefined,
        background: particle.glow
          ? `radial-gradient(circle, ${particle.color} 0%, ${particle.color}00 70%)`
          : particle.color,
        boxShadow: particle.glow
          ? `0 0 ${particle.size * 2}px ${particle.color}80, 0 0 ${particle.size * 4}px ${particle.color}40`
          : undefined,
      }}
      initial={{
        y: `${particle.y}%`,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        y: [`${particle.y}%`, `${particle.y - 30}%`, `${particle.y}%`],
        x: [offsetX, offsetX + 10, offsetX - 10, offsetX],
        opacity: [0, particle.opacity, particle.opacity, 0],
        scale: [0.5, 1, 1.1, 0.5],
      }}
      transition={{
        duration: particle.speed,
        delay: particle.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
})

export const FloatingParticles = memo(function FloatingParticles({
  count,
  color = 'violet',
  intensity = 'medium',
  interactive = true,
  depth = true,
  glowEffect = true,
  className,
}: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const config = INTENSITY_CONFIG[intensity]
  const finalCount = count ?? config.count
  const colors = PARTICLE_COLORS[color]

  const particles = useMemo(
    () => generateParticles(
      finalCount,
      colors,
      config.sizeRange,
      config.speedRange,
      depth,
      glowEffect,
    ),
    [finalCount, colors, config, depth, glowEffect],
  )

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactive || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }, [interactive])

  useEffect(() => {
    if (!interactive) return
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [interactive, handleMouseMove])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}
    >
      {/* Ambient glow layer */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, ${colors[0]}30 0%, transparent 50%)`,
          transition: 'background 0.5s ease-out',
        }}
      />

      {/* Particles */}
      {particles.map((particle) => (
        <ParticleElement
          key={particle.id}
          particle={particle}
          mouseX={mousePosition.x}
          mouseY={mousePosition.y}
          interactive={interactive}
        />
      ))}

      {/* Connecting lines layer (subtle) */}
      <svg className="absolute inset-0 h-full w-full opacity-10">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0" />
            <stop offset="50%" stopColor={colors[0]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
})

export default FloatingParticles
