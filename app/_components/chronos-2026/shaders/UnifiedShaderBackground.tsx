'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 UNIFIED SHADER BACKGROUND — CHRONOS ELITE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente wrapper que proporciona un fondo con shaders consistente para todos los paneles.
 * Combina partículas WebGL con gradientes CSS para un efecto visual impactante.
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useMemo, useState } from 'react'
import { ShaderControlPanel, ShaderControlTrigger } from './ShaderControlPanel'
import { ShaderCustomizationProvider, useShaderCustomization } from './ShaderCustomizationContext'
import {
  SupremeShaderCanvas,
  type PanelShaderPreset,
  type ShaderConfig,
} from './SupremeShaderCanvas'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UnifiedShaderBackgroundProps {
  /** Panel preset (dashboard, ventas, bancos, etc.) */
  preset?: PanelShaderPreset
  /** Configuración personalizada (override preset) */
  config?: ShaderConfig
  /** Mostrar gradiente de fondo además de partículas */
  showGradient?: boolean
  /** Mostrar vignette */
  showVignette?: boolean
  /** Mostrar ruido de textura */
  showNoise?: boolean
  /** Mostrar control de personalización */
  showControls?: boolean
  /** Intensidad global (0-1) */
  intensity?: number
  /** Opacidad del fondo */
  opacity?: number
  /** Efecto de blur */
  blur?: number
  /** Prioridad de renderizado */
  priority?: 'low' | 'normal' | 'high'
  /** Lazy render (solo visible) */
  lazyRender?: boolean
  /** Clase CSS adicional */
  className?: string
  /** Children para renderizar encima */
  children?: React.ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GRADIENT BACKGROUND LAYER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const GradientLayer = memo(function GradientLayer({
  preset,
  intensity = 1,
}: {
  preset?: PanelShaderPreset
  intensity?: number
}) {
  const gradientConfig = useMemo(() => {
    const presets: Record<string, { colors: string[]; angle: number; animation: string }> = {
      dashboard: {
        colors: ['rgba(139, 0, 255, 0.15)', 'rgba(255, 215, 0, 0.1)', 'rgba(255, 20, 147, 0.08)'],
        angle: 135,
        animation: 'bg-aurora',
      },
      ventas: {
        colors: ['rgba(16, 185, 129, 0.15)', 'rgba(52, 211, 153, 0.1)', 'rgba(255, 215, 0, 0.08)'],
        angle: 45,
        animation: 'bg-aurora',
      },
      bancos: {
        colors: ['rgba(139, 0, 255, 0.2)', 'rgba(192, 132, 252, 0.15)', 'rgba(255, 215, 0, 0.1)'],
        angle: 180,
        animation: 'bg-pulse',
      },
      clientes: {
        colors: ['rgba(153, 51, 229, 0.15)', 'rgba(139, 0, 255, 0.1)', 'rgba(192, 132, 252, 0.08)'],
        angle: 90,
        animation: 'bg-aurora',
      },
      almacen: {
        colors: ['rgba(99, 102, 241, 0.12)', 'rgba(139, 0, 255, 0.08)', 'rgba(59, 130, 246, 0.06)'],
        angle: 225,
        animation: 'bg-wave',
      },
      distribuidores: {
        colors: ['rgba(251, 146, 60, 0.15)', 'rgba(255, 215, 0, 0.12)', 'rgba(255, 20, 147, 0.08)'],
        angle: 315,
        animation: 'bg-aurora',
      },
      compras: {
        colors: ['rgba(59, 130, 246, 0.15)', 'rgba(99, 102, 241, 0.1)', 'rgba(139, 0, 255, 0.08)'],
        angle: 60,
        animation: 'bg-aurora',
      },
      gastos: {
        colors: ['rgba(239, 68, 68, 0.12)', 'rgba(255, 20, 147, 0.1)', 'rgba(139, 0, 255, 0.08)'],
        angle: 150,
        animation: 'bg-pulse',
      },
      movimientos: {
        colors: ['rgba(139, 0, 255, 0.15)', 'rgba(6, 182, 212, 0.1)', 'rgba(255, 215, 0, 0.08)'],
        angle: 200,
        animation: 'bg-flow',
      },
      ai: {
        colors: ['rgba(139, 0, 255, 0.2)', 'rgba(0, 255, 200, 0.15)', 'rgba(255, 20, 147, 0.1)'],
        angle: 120,
        animation: 'bg-quantum',
      },
    }

    const defaultPreset = {
      colors: ['rgba(139, 0, 255, 0.15)', 'rgba(255, 215, 0, 0.1)', 'rgba(255, 20, 147, 0.08)'],
      angle: 135,
      animation: 'bg-aurora',
    }

    return presets[preset || 'dashboard'] ?? defaultPreset
  }, [preset])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main gradient */}
      <div
        className="animate-gradient-slow absolute inset-0"
        style={{
          background: `linear-gradient(${gradientConfig.angle}deg, ${gradientConfig.colors.join(', ')})`,
          opacity: intensity,
        }}
      />

      {/* Animated orbs */}
      <div
        className="animate-blob absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${gradientConfig.colors[0]} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <div
        className="animation-delay-2000 animate-blob absolute -right-1/4 -bottom-1/4 h-1/2 w-1/2 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${gradientConfig.colors[1]} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <div
        className="animation-delay-4000 animate-blob absolute top-1/3 left-1/3 h-1/3 w-1/3 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${gradientConfig.colors[2]} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VIGNETTE LAYER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const VignetteLayer = memo(function VignetteLayer({ intensity = 0.4 }: { intensity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,${intensity}) 100%)`,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NOISE TEXTURE LAYER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const NoiseLayer = memo(function NoiseLayer({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        opacity,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GRID PATTERN LAYER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const GridLayer = memo(function GridLayer({ opacity = 0.02 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 0, 255, ${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 0, 255, ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT (INNER)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function UnifiedShaderBackgroundInner({
  preset = 'dashboard',
  config,
  showGradient = true,
  showVignette = true,
  showNoise = true,
  showControls = false,
  intensity = 1,
  opacity = 1,
  blur = 0,
  priority = 'normal',
  lazyRender = true,
  className,
  children,
}: UnifiedShaderBackgroundProps) {
  const { config: globalConfig, enabled, getUniformValues } = useShaderCustomization()
  const [controlsOpen, setControlsOpen] = useState(false)

  // Merge configs
  const mergedConfig = useMemo(() => {
    const uniformValues = getUniformValues()
    return {
      ...uniformValues,
      ...config,
    } as ShaderConfig
  }, [getUniformValues, config])

  const effectiveIntensity = intensity * globalConfig.intensity
  const effectiveOpacity = enabled ? opacity : 0

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {/* Background layers */}
      <div
        className="absolute inset-0 bg-gray-950 transition-opacity duration-500"
        style={{ opacity: effectiveOpacity }}
      >
        {/* Gradient layer */}
        {showGradient && enabled && (
          <GradientLayer preset={preset} intensity={effectiveIntensity * 0.8} />
        )}

        {/* WebGL Shader Canvas */}
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
              style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
            >
              <SupremeShaderCanvas
                panelPreset={preset}
                config={mergedConfig}
                particleCount={globalConfig.particleCount}
                interactive={globalConfig.mouseAttraction > 0}
                scrollEffect={globalConfig.scrollParallax}
                intensity={effectiveIntensity}
                lazyRender={lazyRender}
                priority={priority}
                opacity={effectiveOpacity}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid pattern */}
        <GridLayer opacity={0.015} />

        {/* Noise texture */}
        {showNoise && <NoiseLayer opacity={0.025} />}

        {/* Vignette */}
        {showVignette && <VignetteLayer intensity={0.35} />}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full w-full">{children}</div>

      {/* Controls */}
      {showControls && (
        <>
          <ShaderControlTrigger onClick={() => setControlsOpen(true)} />
          <ShaderControlPanel isOpen={controlsOpen} onClose={() => setControlsOpen(false)} />
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT (WITH PROVIDER)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function UnifiedShaderBackground(props: UnifiedShaderBackgroundProps) {
  return (
    <ShaderCustomizationProvider>
      <UnifiedShaderBackgroundInner {...props} />
    </ShaderCustomizationProvider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONVENIENCE WRAPPER FOR PANELS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface PanelWithShaderBackgroundProps {
  preset: PanelShaderPreset
  children: React.ReactNode
  className?: string
  showControls?: boolean
}

export function PanelWithShaderBackground({
  preset,
  children,
  className,
  showControls = false,
}: PanelWithShaderBackgroundProps) {
  return (
    <UnifiedShaderBackground
      preset={preset}
      showGradient={true}
      showVignette={true}
      showNoise={true}
      showControls={showControls}
      priority="normal"
      lazyRender={true}
      className={className}
    >
      {children}
    </UnifiedShaderBackground>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SPECIALIZED PANEL WRAPPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function DashboardBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="dashboard" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function VentasBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="ventas" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function BancosBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="bancos" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function ClientesBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="clientes" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function AlmacenBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="almacen" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function DistribuidoresBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="distribuidores" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function ComprasBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="compras" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function GastosBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="gastos" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function MovimientosBackground({
  children,
  ...props
}: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="movimientos" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export function AIBackground({ children, ...props }: Omit<UnifiedShaderBackgroundProps, 'preset'>) {
  return (
    <UnifiedShaderBackground preset="ai" {...props}>
      {children}
    </UnifiedShaderBackground>
  )
}

export default UnifiedShaderBackground
