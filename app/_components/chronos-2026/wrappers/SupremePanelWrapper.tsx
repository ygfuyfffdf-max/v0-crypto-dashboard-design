'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌟 SUPREME PANEL WRAPPER — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper universal que aplica TODOS los sistemas premium a cualquier panel:
 * - Smooth Scroll 120fps
 * - Quantum Particles 3D interactivas
 * - Animaciones cinematográficas
 * - Parallax effects
 * - Micro-interacciones
 *
 * USO:
 * ```tsx
 * export function TuPanel() {
 *   return (
 *     <SupremePanelWrapper variant="dashboard">
 *       {/* Tu contenido aquí *\/}
 *     </SupremePanelWrapper>
 *   )
 * }
 * ```
 *
 * @version 2.0.0 QUANTUM ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { PANEL_PRESETS } from '../index'
import {
  AuroraParticles,
  EnergyFieldParticles,
  QuantumParticleField,
  QuantumParticles,
} from '../particles/ParticleSystems'
import { useSmoothScroll } from '../scroll/SmoothScrollSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremePanelWrapperProps {
  children: React.ReactNode
  variant?:
    | 'dashboard'
    | 'data'
    | 'interactive'
    | 'ventas'
    | 'ordenes'
    | 'bancos'
    | 'clientes'
    | 'almacen'
    | 'ai'
  className?: string
  enableParticles?: boolean
  enableSmoothScroll?: boolean
  particleOpacity?: number
  /** Usar sistema quantum avanzado (recomendado) */
  useQuantumSystem?: boolean
}

// Configuración de variantes para el sistema quantum
const QUANTUM_VARIANTS = {
  dashboard: { variant: 'aurora' as const, intensity: 'normal' as const, particleCount: 100 },
  data: { variant: 'neural' as const, intensity: 'normal' as const, particleCount: 80 },
  interactive: { variant: 'energy' as const, intensity: 'intense' as const, particleCount: 120 },
  ventas: { variant: 'energy' as const, intensity: 'normal' as const, particleCount: 100 },
  ordenes: { variant: 'cosmic' as const, intensity: 'normal' as const, particleCount: 90 },
  bancos: { variant: 'aurora' as const, intensity: 'intense' as const, particleCount: 120 },
  clientes: { variant: 'neural' as const, intensity: 'subtle' as const, particleCount: 80 },
  almacen: { variant: 'cosmic' as const, intensity: 'subtle' as const, particleCount: 70 },
  ai: { variant: 'quantum' as const, intensity: 'intense' as const, particleCount: 150 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function SupremePanelWrapper({
  children,
  variant = 'dashboard',
  className,
  enableParticles = true,
  enableSmoothScroll = true,
  particleOpacity = 0.5,
  useQuantumSystem = true,
}: SupremePanelWrapperProps) {
  // Activar smooth scroll si está habilitado
  if (enableSmoothScroll) {
    const preset = PANEL_PRESETS[variant] || PANEL_PRESETS['dashboard']
    useSmoothScroll(preset.scroll)
  }

  // Obtener configuración quantum
  const quantumConfig = QUANTUM_VARIANTS[variant] || QUANTUM_VARIANTS['dashboard']
  const preset = PANEL_PRESETS[variant] || PANEL_PRESETS['dashboard']

  // Legacy particle component selection (fallback)
  const ParticleComponent =
    variant === 'dashboard' || variant === 'bancos'
      ? AuroraParticles
      : variant === 'data' || variant === 'ai'
        ? QuantumParticles
        : EnergyFieldParticles

  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Quantum Particles 3D Background */}
      {enableParticles && useQuantumSystem && (
        <div className="fixed inset-0 z-0 overflow-hidden">
          <QuantumParticleField
            variant={quantumConfig.variant}
            intensity={quantumConfig.intensity}
            particleCount={quantumConfig.particleCount}
            interactive={true}
            scrollEffect={true}
            mouseRadius={160}
            connectionDistance={130}
            showTrails={true}
            enableGlow={true}
            speed={0.8}
            className={`opacity-[${particleOpacity}]`}
          />
        </div>
      )}

      {/* Legacy Particles (fallback) */}
      {enableParticles && !useQuantumSystem && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <ParticleComponent
            width={1920}
            height={1080}
            className={`opacity-[${particleOpacity}]`}
          />
        </div>
      )}

      {/* Contenido con z-index elevado */}
      <div className={cn('relative z-10', preset.animation)}>{children}</div>

      {/* Animated glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-3xl" />
        <div
          className="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-fuchsia-500/10 blur-3xl"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/3 h-64 w-64 animate-pulse rounded-full bg-cyan-500/8 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default SupremePanelWrapper
