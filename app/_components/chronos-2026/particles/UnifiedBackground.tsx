'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 UNIFIED BACKGROUND SYSTEM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema unificado de fondos premium que combina:
 * - Aurora Background con gradientes cónicos rotando
 * - Quantum Particle Field con partículas interactivas
 * - Efectos de scroll parallax
 * - Vignette cinematográfico
 * - Noise texture orgánico
 *
 * USO:
 * <UnifiedBackground variant="aurora" /> // Default
 * <UnifiedBackground variant="cosmic" particlesOnly />
 * <UnifiedBackground variant="subtle" intensity="low" />
 *
 * @version 2.0.0 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { memo, useCallback, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  QuantumParticleField,
  AuroraQuantumField,
  CosmicQuantumField,
  NeuralNetworkField,
  EnergyFlowField,
  NebulaField,
} from './QuantumParticleField'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UnifiedBackgroundProps {
  /** Variante visual del fondo */
  variant?: 'aurora' | 'cosmic' | 'neural' | 'energy' | 'nebula' | 'minimal'
  /** Intensidad de los efectos */
  intensity?: 'low' | 'medium' | 'high' | 'extreme'
  /** Mostrar solo partículas (sin aurora gradient) */
  particlesOnly?: boolean
  /** Mostrar solo aurora (sin partículas) */
  auroraOnly?: boolean
  /** Habilitar interactividad con mouse */
  interactive?: boolean
  /** Habilitar efectos de scroll */
  scrollEffects?: boolean
  /** Cantidad de partículas (override) */
  particleCount?: number
  /** Clase CSS adicional */
  className?: string
  /** Children para renderizar encima */
  children?: React.ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const VARIANT_CONFIG = {
  aurora: {
    gradients: [
      { color: 'rgba(139, 92, 246, 0.35)', rotation: 0, speed: 22 },
      { color: 'rgba(217, 70, 239, 0.3)', rotation: 180, speed: 28 },
      { color: 'rgba(99, 102, 241, 0.25)', rotation: 90, speed: 35 },
    ],
    blur: '120px',
    particleVariant: 'aurora' as const,
  },
  cosmic: {
    gradients: [
      { color: 'rgba(99, 102, 241, 0.4)', rotation: 0, speed: 25 },
      { color: 'rgba(6, 182, 212, 0.35)', rotation: 120, speed: 30 },
      { color: 'rgba(139, 92, 246, 0.3)', rotation: 240, speed: 20 },
    ],
    blur: '100px',
    particleVariant: 'cosmic' as const,
  },
  neural: {
    gradients: [
      { color: 'rgba(6, 182, 212, 0.35)', rotation: 45, speed: 30 },
      { color: 'rgba(59, 130, 246, 0.3)', rotation: 225, speed: 25 },
    ],
    blur: '130px',
    particleVariant: 'neural' as const,
  },
  energy: {
    gradients: [
      { color: 'rgba(16, 185, 129, 0.35)', rotation: 0, speed: 20 },
      { color: 'rgba(52, 211, 153, 0.3)', rotation: 180, speed: 28 },
      { color: 'rgba(251, 191, 36, 0.2)', rotation: 90, speed: 35 },
    ],
    blur: '110px',
    particleVariant: 'energy' as const,
  },
  nebula: {
    gradients: [
      { color: 'rgba(192, 132, 252, 0.4)', rotation: 30, speed: 35 },
      { color: 'rgba(236, 72, 153, 0.35)', rotation: 150, speed: 28 },
      { color: 'rgba(251, 146, 60, 0.25)', rotation: 270, speed: 40 },
    ],
    blur: '140px',
    particleVariant: 'nebula' as const,
  },
  minimal: {
    gradients: [
      { color: 'rgba(139, 92, 246, 0.15)', rotation: 0, speed: 40 },
    ],
    blur: '180px',
    particleVariant: 'aurora' as const,
  },
}

const INTENSITY_CONFIG = {
  low: { opacity: 0.5, particleCount: 60, glowIntensity: 'subtle' as const },
  medium: { opacity: 0.7, particleCount: 100, glowIntensity: 'normal' as const },
  high: { opacity: 0.9, particleCount: 140, glowIntensity: 'intense' as const },
  extreme: { opacity: 1, particleCount: 200, glowIntensity: 'extreme' as const },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AURORA GRADIENT LAYER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AuroraGradientLayer = memo(function AuroraGradientLayer({
  variant,
  intensity,
  interactive,
}: {
  variant: keyof typeof VARIANT_CONFIG
  intensity: keyof typeof INTENSITY_CONFIG
  interactive: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  
  const springConfig = { stiffness: 30, damping: 40 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)
  
  const gradientX = useTransform(smoothX, [0, 1], [-20, 20])
  const gradientY = useTransform(smoothY, [0, 1], [-20, 20])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }, [interactive, mouseX, mouseY])
  
  const config = VARIANT_CONFIG[variant]
  const intensityConfig = INTENSITY_CONFIG[intensity]
  
  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030308] via-gray-950 to-[#030308]" />
      
      {/* Aurora gradient layers */}
      {config.gradients.map((gradient, index) => (
        <motion.div
          key={index}
          className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%]"
          style={{
            background: `conic-gradient(from ${gradient.rotation}deg at 50% 50%,
              ${gradient.color} 0deg,
              ${gradient.color.replace(/[\d.]+\)$/, `${parseFloat(gradient.color.match(/[\d.]+\)$/)?.[0] || '0.3') * 0.7})`)}) 60deg,
              ${gradient.color.replace(/[\d.]+\)$/, `${parseFloat(gradient.color.match(/[\d.]+\)$/)?.[0] || '0.3') * 0.5})`)}) 120deg,
              transparent 180deg,
              ${gradient.color.replace(/[\d.]+\)$/, `${parseFloat(gradient.color.match(/[\d.]+\)$/)?.[0] || '0.3') * 0.3})`)}) 240deg,
              ${gradient.color.replace(/[\d.]+\)$/, `${parseFloat(gradient.color.match(/[\d.]+\)$/)?.[0] || '0.3') * 0.7})`)}) 300deg,
              ${gradient.color} 360deg
            )`,
            filter: `blur(${config.blur})`,
            opacity: intensityConfig.opacity,
            x: gradientX,
            y: gradientY,
          }}
          animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
          transition={{
            duration: gradient.speed,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />
      
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE LAYER WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParticleLayer = memo(function ParticleLayer({
  variant,
  intensity,
  interactive,
  scrollEffects,
  particleCount,
}: {
  variant: keyof typeof VARIANT_CONFIG
  intensity: keyof typeof INTENSITY_CONFIG
  interactive: boolean
  scrollEffects: boolean
  particleCount?: number
}) {
  const config = VARIANT_CONFIG[variant]
  const intensityConfig = INTENSITY_CONFIG[intensity]
  const count = particleCount || intensityConfig.particleCount
  
  const particleVariant = config.particleVariant
  
  return (
    <QuantumParticleField
      variant={particleVariant}
      intensity={intensityConfig.glowIntensity}
      particleCount={count}
      interactive={interactive}
      scrollEffect={scrollEffects}
      showTrails={intensity !== 'low'}
      enableGlow={true}
      className="absolute inset-0"
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN UNIFIED BACKGROUND COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const UnifiedBackground = memo(function UnifiedBackground({
  variant = 'aurora',
  intensity = 'medium',
  particlesOnly = false,
  auroraOnly = false,
  interactive = true,
  scrollEffects = true,
  particleCount,
  className,
  children,
}: UnifiedBackgroundProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#030308] ${className || ''}`}>
      {/* Aurora gradient layer */}
      {!particlesOnly && (
        <AuroraGradientLayer
          variant={variant}
          intensity={intensity}
          interactive={interactive}
        />
      )}
      
      {/* Particle layer */}
      {!auroraOnly && (
        <ParticleLayer
          variant={variant}
          intensity={intensity}
          interactive={interactive}
          scrollEffects={scrollEffects}
          particleCount={particleCount}
        />
      )}
      
      {/* Children content */}
      {children && (
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONVENIENCE PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Aurora background con partículas violeta/fucsia - Ideal para paneles principales */
export const AuroraUnifiedBackground = memo(function AuroraUnifiedBackground(
  props: Omit<UnifiedBackgroundProps, 'variant'>,
) {
  return <UnifiedBackground variant="aurora" {...props} />
})

/** Cosmic background con partículas azul/cyan - Ideal para dashboards */
export const CosmicUnifiedBackground = memo(function CosmicUnifiedBackground(
  props: Omit<UnifiedBackgroundProps, 'variant'>,
) {
  return <UnifiedBackground variant="cosmic" {...props} />
})

/** Neural network style - Ideal para secciones de AI/datos */
export const NeuralUnifiedBackground = memo(function NeuralUnifiedBackground(
  props: Omit<UnifiedBackgroundProps, 'variant'>,
) {
  return <UnifiedBackground variant="neural" {...props} />
})

/** Energy flow - Ideal para secciones financieras/métricas */
export const EnergyUnifiedBackground = memo(function EnergyUnifiedBackground(
  props: Omit<UnifiedBackgroundProps, 'variant'>,
) {
  return <UnifiedBackground variant="energy" {...props} />
})

/** Nebula effect - Ideal para fondos dramáticos */
export const NebulaUnifiedBackground = memo(function NebulaUnifiedBackground(
  props: Omit<UnifiedBackgroundProps, 'variant'>,
) {
  return <UnifiedBackground variant="nebula" {...props} />
})

/** Minimal subtle background - Ideal para formularios y modales */
export const MinimalUnifiedBackground = memo(function MinimalUnifiedBackground(
  props: Omit<UnifiedBackgroundProps, 'variant'>,
) {
  return <UnifiedBackground variant="minimal" intensity="low" {...props} />
})

export default UnifiedBackground
