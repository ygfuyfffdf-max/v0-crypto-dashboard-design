"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 SUPREME PANEL BACKGROUNDS — CHRONOS ELITE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes wrapper premium que integran el sistema de shaders SUPREME
 * con fondos específicos para cada tipo de panel.
 *
 * USO:
 * <SupremeDashboardBackground>
 *   <AuroraDashboardUnified />
 * </SupremeDashboardBackground>
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { motion } from "motion/react"
import dynamic from "next/dynamic"
import { memo, type ReactNode } from "react"
import type { PanelShaderPreset, ShaderConfig } from "../shaders"

// Lazy load shader canvas for performance
const SupremeShaderCanvas = dynamic(
  () => import("../shaders/SupremeShaderCanvas").then((mod) => mod.SupremeShaderCanvas),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremePanelBackgroundProps {
  children: ReactNode
  preset: PanelShaderPreset
  config?: ShaderConfig
  className?: string
  /** Intensidad del shader (0-1) */
  intensity?: number
  /** Mostrar partículas */
  showParticles?: boolean
  /** Mostrar gradiente CSS de respaldo */
  showGradient?: boolean
  /** Mostrar vignette */
  showVignette?: boolean
  /** Mostrar grid */
  showGrid?: boolean
  /** Prioridad de renderizado */
  priority?: "low" | "normal" | "high"
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 BASE SUPREME BACKGROUND COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SupremePanelBackground = memo(function SupremePanelBackground({
  children,
  preset,
  config,
  className,
  intensity = 0.7,
  showParticles = false, // DESHABILITADO por defecto - el LAYOUT ya tiene el shader global
  showGradient = true,
  showVignette = true,
  showGrid = true,
  priority = "normal",
}: SupremePanelBackgroundProps) {
  // Gradient configs per preset
  const gradientConfig = getGradientConfig(preset)

  return (
    <div
      className={cn(
        "relative min-h-full w-full overflow-hidden",
        "rounded-2xl border border-white/[0.06] shadow-[0_0_60px_-12px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.03)]",
        className
      )}
    >
      {/* WebGL Shader Background */}
      {showParticles && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: -20 }}>
          <SupremeShaderCanvas
            panelPreset={preset}
            config={config}
            interactive
            scrollEffect
            intensity={intensity}
            priority={priority}
            lazyRender
            opacity={0.8}
          />
        </div>
      )}

      {/* CSS Gradient Overlay */}
      {showGradient && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: -15 }}>
          {/* Main gradient orbs */}
          <div
            className="animate-premium-float absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full opacity-60"
            style={{
              background: `radial-gradient(circle, ${gradientConfig.primary} 0%, transparent 70%)`,
              filter: "blur(80px)",
            }}
          />
          <div
            className="animate-premium-float absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full opacity-50"
            style={{
              background: `radial-gradient(circle, ${gradientConfig.secondary} 0%, transparent 70%)`,
              filter: "blur(80px)",
              animationDelay: "-3s",
            }}
          />
          <div
            className="animate-premium-float absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
            style={{
              background: `radial-gradient(circle, ${gradientConfig.accent} 0%, transparent 70%)`,
              filter: "blur(60px)",
              animationDelay: "-6s",
            }}
          />
        </div>
      )}

      {/* Grid Pattern */}
      {showGrid && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            zIndex: -10,
            backgroundImage: `
              linear-gradient(${gradientConfig.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${gradientConfig.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Vignette */}
      {showVignette && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: -5,
            background:
              "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      )}

      {/* Top Gradient Fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 to-transparent"
        style={{ zIndex: -5 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 GRADIENT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GradientConfig {
  primary: string
  secondary: string
  accent: string
  gridColor: string
}

function getGradientConfig(preset: PanelShaderPreset): GradientConfig {
  const configs: Record<PanelShaderPreset, GradientConfig> = {
    dashboard: {
      primary: "rgba(139, 0, 255, 0.6)",
      secondary: "rgba(255, 215, 0, 0.5)",
      accent: "rgba(255, 20, 147, 0.4)",
      gridColor: "rgba(139, 0, 255, 0.3)",
    },
    ventas: {
      primary: "rgba(16, 185, 129, 0.6)",
      secondary: "rgba(52, 211, 153, 0.5)",
      accent: "rgba(255, 215, 0, 0.4)",
      gridColor: "rgba(16, 185, 129, 0.3)",
    },
    bancos: {
      primary: "rgba(139, 0, 255, 0.65)",
      secondary: "rgba(192, 132, 252, 0.55)",
      accent: "rgba(255, 215, 0, 0.45)",
      gridColor: "rgba(139, 0, 255, 0.35)",
    },
    clientes: {
      primary: "rgba(99, 102, 241, 0.6)",
      secondary: "rgba(139, 0, 255, 0.5)",
      accent: "rgba(192, 132, 252, 0.4)",
      gridColor: "rgba(99, 102, 241, 0.3)",
    },
    almacen: {
      primary: "rgba(59, 130, 246, 0.55)",
      secondary: "rgba(99, 102, 241, 0.45)",
      accent: "rgba(139, 0, 255, 0.35)",
      gridColor: "rgba(59, 130, 246, 0.25)",
    },
    distribuidores: {
      primary: "rgba(251, 146, 60, 0.6)",
      secondary: "rgba(255, 215, 0, 0.55)",
      accent: "rgba(255, 20, 147, 0.4)",
      gridColor: "rgba(251, 146, 60, 0.3)",
    },
    compras: {
      primary: "rgba(59, 130, 246, 0.6)",
      secondary: "rgba(99, 102, 241, 0.5)",
      accent: "rgba(139, 0, 255, 0.4)",
      gridColor: "rgba(59, 130, 246, 0.3)",
    },
    gastos: {
      primary: "rgba(239, 68, 68, 0.55)",
      secondary: "rgba(255, 20, 147, 0.5)",
      accent: "rgba(139, 0, 255, 0.35)",
      gridColor: "rgba(239, 68, 68, 0.25)",
    },
    movimientos: {
      primary: "rgba(139, 0, 255, 0.6)",
      secondary: "rgba(6, 182, 212, 0.5)",
      accent: "rgba(255, 215, 0, 0.4)",
      gridColor: "rgba(139, 0, 255, 0.3)",
    },
    ai: {
      primary: "rgba(139, 0, 255, 0.7)",
      secondary: "rgba(0, 255, 200, 0.6)",
      accent: "rgba(255, 20, 147, 0.5)",
      gridColor: "rgba(139, 0, 255, 0.4)",
    },
  }

  return configs[preset] || configs.dashboard
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 SPECIALIZED PANEL BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SupremeDashboardBackground = memo(function SupremeDashboardBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="dashboard" {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeVentasBackground = memo(function SupremeVentasBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="ventas" intensity={0.75} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeBancosBackground = memo(function SupremeBancosBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="bancos" intensity={0.8} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeClientesBackground = memo(function SupremeClientesBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="clientes" intensity={0.7} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeAlmacenBackground = memo(function SupremeAlmacenBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="almacen" intensity={0.65} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeDistribuidoresBackground = memo(function SupremeDistribuidoresBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="distribuidores" intensity={0.75} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeComprasBackground = memo(function SupremeComprasBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="compras" intensity={0.7} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeGastosBackground = memo(function SupremeGastosBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="gastos" intensity={0.65} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeMovimientosBackground = memo(function SupremeMovimientosBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="movimientos" intensity={0.75} {...props}>
      {children}
    </SupremePanelBackground>
  )
})

export const SupremeAIBackground = memo(function SupremeAIBackground({
  children,
  ...props
}: Omit<SupremePanelBackgroundProps, "preset">) {
  return (
    <SupremePanelBackground preset="ai" intensity={0.85} priority="high" {...props}>
      {children}
    </SupremePanelBackground>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎴 SUPREME CARD COMPONENT — Card premium con shader integrado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeCardProps {
  children: ReactNode
  className?: string
  preset?: PanelShaderPreset
  variant?: "glass" | "solid" | "gradient"
  glow?: boolean
  hover?: boolean
}

export const SupremeCard = memo(function SupremeCard({
  children,
  className,
  preset = "dashboard",
  variant = "glass",
  glow = true,
  hover = true,
}: SupremeCardProps) {
  const gradientConfig = getGradientConfig(preset)

  const variantClasses = {
    glass: "bg-white/[0.03] backdrop-blur-xl",
    solid: "bg-gray-900/90",
    gradient: "bg-gradient-to-br from-white/[0.05] to-transparent",
  }

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border border-white/[0.08]",
        variantClasses[variant],
        "transition-all duration-500",
        hover && "hover:border-white/[0.15] hover:shadow-xl",
        glow && "hover:shadow-violet-500/10",
        className
      )}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ duration: 0.3 }}
    >
      {/* Subtle inner glow */}
      {glow && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${gradientConfig.primary.replace("0.4", "0.1")} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Border glow effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 20px ${gradientConfig.primary.replace("0.4", "0.1")}`,
        }}
      />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { SupremePanelBackground, type GradientConfig, type SupremePanelBackgroundProps }

export default SupremePanelBackground
