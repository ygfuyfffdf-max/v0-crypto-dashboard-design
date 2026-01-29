'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 OPTIMIZED PANEL BACKGROUND — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente de fondo optimizado para paneles que incluye:
 * - Quantum Particle Field con lazy loading
 * - Detección automática de preferencias de movimiento reducido
 * - Auto-pause cuando el panel no está visible
 * - Configuración por tipo de panel
 * - Fallback elegante para dispositivos de bajo rendimiento
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useReducedMotion } from 'motion/react'
import { Suspense, lazy, memo, useDeferredValue, useEffect, useState } from 'react'

// Lazy load del sistema de partículas para mejor performance inicial
const QuantumParticleField = lazy(() =>
  import('./QuantumParticleField').then((mod) => ({ default: mod.QuantumParticleField })),
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type PanelType =
  | 'dashboard'
  | 'ventas'
  | 'ordenes'
  | 'bancos'
  | 'clientes'
  | 'almacen'
  | 'distribuidores'
  | 'movimientos'
  | 'gastos'
  | 'ai'

interface OptimizedPanelBackgroundProps {
  /** Tipo de panel para configuración automática */
  panelType: PanelType
  /** Opacidad del efecto (0-1) */
  opacity?: number
  /** Deshabilitar partículas completamente */
  disabled?: boolean
  /** Forzar modo de bajo rendimiento */
  lowPerformanceMode?: boolean
  /** Callback cuando cambia el estado de visibilidad */
  onVisibilityChange?: (isVisible: boolean) => void
  /** Clase CSS adicional */
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN POR PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PANEL_CONFIGS: Record<
  PanelType,
  {
    variant: 'aurora' | 'cosmic' | 'neural' | 'energy' | 'quantum' | 'nebula'
    intensity: 'subtle' | 'normal' | 'intense'
    particleCount: number
    speed: number
    connectionDistance: number
  }
> = {
  dashboard: {
    variant: 'aurora',
    intensity: 'normal',
    particleCount: 100,
    speed: 0.8,
    connectionDistance: 140,
  },
  ventas: {
    variant: 'energy',
    intensity: 'normal',
    particleCount: 90,
    speed: 0.9,
    connectionDistance: 130,
  },
  ordenes: {
    variant: 'cosmic',
    intensity: 'normal',
    particleCount: 85,
    speed: 0.7,
    connectionDistance: 125,
  },
  bancos: {
    variant: 'aurora',
    intensity: 'intense',
    particleCount: 110,
    speed: 0.8,
    connectionDistance: 150,
  },
  clientes: {
    variant: 'neural',
    intensity: 'subtle',
    particleCount: 70,
    speed: 0.6,
    connectionDistance: 120,
  },
  almacen: {
    variant: 'cosmic',
    intensity: 'subtle',
    particleCount: 65,
    speed: 0.5,
    connectionDistance: 110,
  },
  distribuidores: {
    variant: 'energy',
    intensity: 'subtle',
    particleCount: 75,
    speed: 0.6,
    connectionDistance: 115,
  },
  movimientos: {
    variant: 'neural',
    intensity: 'normal',
    particleCount: 80,
    speed: 0.7,
    connectionDistance: 130,
  },
  gastos: {
    variant: 'nebula',
    intensity: 'subtle',
    particleCount: 60,
    speed: 0.5,
    connectionDistance: 100,
  },
  ai: {
    variant: 'quantum',
    intensity: 'intense',
    particleCount: 120,
    speed: 1.0,
    connectionDistance: 160,
  },
}

// Configuración reducida para dispositivos de bajo rendimiento
const LOW_PERF_CONFIG = {
  particleCount: 30,
  speed: 0.4,
  connectionDistance: 80,
  showTrails: false,
  enableGlow: false,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FALLBACK COMPONENT (CSS-only gradient animation)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const GradientFallback = memo(function GradientFallback({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className || ''}`}>
      {/* Animated gradient orbs - Pure CSS, very light */}
      <div className="absolute -top-1/4 -left-1/4 h-[60%] w-[60%] animate-pulse rounded-full bg-violet-500/10 blur-[100px]" />
      <div
        className="absolute -right-1/4 -bottom-1/4 h-[60%] w-[60%] animate-pulse rounded-full bg-fuchsia-500/10 blur-[100px]"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/3 left-1/3 h-[40%] w-[40%] animate-pulse rounded-full bg-cyan-500/10 blur-[80px]"
        style={{ animationDelay: '2s' }}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParticleLoadingSkeleton = memo(function ParticleLoadingSkeleton() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const OptimizedPanelBackground = memo(function OptimizedPanelBackground({
  panelType,
  opacity = 0.45,
  disabled = false,
  lowPerformanceMode = false,
  onVisibilityChange,
  className,
}: OptimizedPanelBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(true)
  const [isLowPerf, setIsLowPerf] = useState(lowPerformanceMode)

  // Use deferred value for opacity to avoid blocking renders
  const deferredOpacity = useDeferredValue(opacity)

  // Detect low-performance devices
  useEffect(() => {
    if (lowPerformanceMode) return

    // Check for low-end device indicators
    const checkPerformance = () => {
      // Check device memory (if available)
      const nav = navigator as Navigator & { deviceMemory?: number }
      if (nav.deviceMemory && nav.deviceMemory < 4) {
        setIsLowPerf(true)
        return
      }

      // Check hardware concurrency
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        setIsLowPerf(true)
        return
      }

      // Check for mobile device
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ) {
        setIsLowPerf(true)
        return
      }
    }

    checkPerformance()
  }, [lowPerformanceMode])

  // Visibility detection using Intersection Observer
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible'
      setIsVisible(visible)
      onVisibilityChange?.(visible)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [onVisibilityChange])

  // Don't render particles if disabled, reduced motion preferred, or not visible
  if (disabled || prefersReducedMotion || !isVisible) {
    return <GradientFallback className={className} />
  }

  const config = PANEL_CONFIGS[panelType]
  const finalConfig = isLowPerf
    ? {
        ...config,
        ...LOW_PERF_CONFIG,
        intensity: 'subtle' as const,
      }
    : config

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className || ''}`}>
      <Suspense fallback={<ParticleLoadingSkeleton />}>
        <QuantumParticleField
          variant={finalConfig.variant}
          intensity={finalConfig.intensity}
          particleCount={finalConfig.particleCount}
          speed={finalConfig.speed}
          connectionDistance={finalConfig.connectionDistance}
          interactive={!isLowPerf}
          scrollEffect={!isLowPerf}
          mouseRadius={isLowPerf ? 80 : 160}
          showTrails={isLowPerf ? false : true}
          enableGlow={isLowPerf ? false : true}
          depthRange={isLowPerf ? 80 : 120}
          className={`opacity-[${deferredOpacity}]`}
        />
      </Suspense>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const DashboardBackground = memo(
  (props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
    <OptimizedPanelBackground panelType="dashboard" {...props} />
  ),
)

export const VentasBackground = memo((props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
  <OptimizedPanelBackground panelType="ventas" {...props} />
))

export const OrdenesBackground = memo((props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
  <OptimizedPanelBackground panelType="ordenes" {...props} />
))

export const BancosBackground = memo((props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
  <OptimizedPanelBackground panelType="bancos" {...props} />
))

export const ClientesBackground = memo(
  (props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
    <OptimizedPanelBackground panelType="clientes" {...props} />
  ),
)

export const AlmacenBackground = memo((props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
  <OptimizedPanelBackground panelType="almacen" {...props} />
))

export const DistribuidoresBackground = memo(
  (props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
    <OptimizedPanelBackground panelType="distribuidores" {...props} />
  ),
)

export const MovimientosBackground = memo(
  (props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
    <OptimizedPanelBackground panelType="movimientos" {...props} />
  ),
)

export const GastosBackground = memo((props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
  <OptimizedPanelBackground panelType="gastos" {...props} />
))

export const AIBackground = memo((props: Omit<OptimizedPanelBackgroundProps, 'panelType'>) => (
  <OptimizedPanelBackground panelType="ai" {...props} />
))

export default OptimizedPanelBackground
