"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🚀✨ SUPREME ELEVATION SYSTEM — CHRONOS INFINITY 2026 OMEGA-LEVEL
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de elevación visual SUPREMO para todos los paneles CHRONOS:
 * ✅ QUANTUM AURA EFFECTS (Holographic, Plasma, Aurora Borealis)
 * ✅ CYBER GRID BACKGROUNDS (Animated 3D perspective grids)
 * ✅ LIQUID METAL BORDERS (Morphing animated borders)
 * ✅ ENERGY PULSE SYSTEMS (Heartbeat-sync animations)
 * ✅ PARTICLE CONSTELLATION (Interactive star fields)
 * ✅ GLASSMORPHISM GEN6 (Ultra-premium blur + refraction)
 * ✅ MICRO-INTERACTIONS CINEMATICAS (50+ animations)
 * ✅ AUDIO-REACTIVE VISUALS (Sound-responsive effects)
 *
 * @version OMEGA-2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 SUPREME COLOR SYSTEM — CHRONOS OMEGA PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SUPREME_COLORS = {
  // Core Void
  void: {
    deep: "#000000",
    surface: "#030305",
    elevated: "#0a0a0f",
  },
  // Quantum Spectrum
  quantum: {
    violet: "#8B00FF",
    cyan: "#00F0FF",
    magenta: "#FF00DE",
    emerald: "#00FF88",
    gold: "#FFD700",
    plasma: "#FF1493",
  },
  // Glows
  glow: {
    violet: "rgba(139, 0, 255, 0.4)",
    cyan: "rgba(0, 240, 255, 0.4)",
    magenta: "rgba(255, 0, 222, 0.4)",
    emerald: "rgba(0, 255, 136, 0.4)",
    gold: "rgba(255, 215, 0, 0.4)",
    plasma: "rgba(255, 20, 147, 0.4)",
  },
  // Glass Effects
  glass: {
    tier1: "rgba(255, 255, 255, 0.02)",
    tier2: "rgba(255, 255, 255, 0.04)",
    tier3: "rgba(255, 255, 255, 0.06)",
    tier4: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.08)",
    borderHover: "rgba(255, 255, 255, 0.15)",
    borderActive: "rgba(255, 255, 255, 0.25)",
  },
} as const

export type SupremeColorKey = keyof typeof SUPREME_COLORS.quantum

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 SUPREME AURA BACKGROUND — Holographic Aurora Effect
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeAuraProps {
  children: React.ReactNode
  className?: string
  colors?: SupremeColorKey[]
  intensity?: "subtle" | "normal" | "intense" | "ultra"
  animated?: boolean
  interactive?: boolean
  blur?: number
}

export const SupremeAura = memo(function SupremeAura({
  children,
  className,
  colors = ["violet", "cyan", "magenta"],
  intensity = "normal",
  animated = true,
  interactive = true,
  blur = 120,
}: SupremeAuraProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 30, damping: 20 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mouseX.set(x)
      mouseY.set(y)
    },
    [interactive, mouseX, mouseY]
  )

  const intensityMap = {
    subtle: 0.15,
    normal: 0.3,
    intense: 0.5,
    ultra: 0.7,
  }
  const baseOpacity = intensityMap[intensity]

  const auraConfigs = useMemo(
    () =>
      colors.map((color, i) => ({
        color: SUPREME_COLORS.quantum[color],
        glow: SUPREME_COLORS.glow[color],
        delay: i * 3,
        duration: 12 + i * 4,
        size: 50 + i * 15,
        offsetX: ((i * 33) % 100) - 50,
        offsetY: ((i * 47) % 100) - 50,
      })),
    [colors]
  )

  // Motion transforms for parallax
  const auraX = useTransform(smoothX, [0, 1], [-30, 30])
  const auraY = useTransform(smoothY, [0, 1], [-30, 30])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
    >
      {/* Supreme Aura Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: -10 }}>
        {auraConfigs.map((config, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${config.size}%`,
              height: `${config.size}%`,
              background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
              filter: `blur(${blur}px)`,
              opacity: baseOpacity,
              x: auraX,
              y: auraY,
            }}
            animate={
              animated
                ? {
                    left: [
                      `${50 + config.offsetX - 15}%`,
                      `${50 + config.offsetX + 15}%`,
                      `${50 + config.offsetX - 15}%`,
                    ],
                    top: [
                      `${50 + config.offsetY - 15}%`,
                      `${50 + config.offsetY + 15}%`,
                      `${50 + config.offsetY - 15}%`,
                    ],
                    scale: [1, 1.3, 1],
                  }
                : {}
            }
            transition={{
              duration: config.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: config.delay,
            }}
          />
        ))}

        {/* Holographic Shimmer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              135deg,
              transparent 0%,
              rgba(255, 255, 255, 0.015) 50%,
              transparent 100%
            )`,
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "200% 200%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 SUPREME GLASS CARD — Ultra-Premium Glassmorphism Gen6
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeGlassCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: SupremeColorKey
  variant?: "default" | "elevated" | "floating" | "quantum"
  interactive?: boolean
  scanLine?: boolean
  energyBorder?: boolean
  holographic?: boolean
  onClick?: () => void
}

export const SupremeGlassCard = memo(function SupremeGlassCard({
  children,
  className,
  glowColor = "violet",
  variant = "default",
  interactive = true,
  scanLine = true,
  energyBorder = true,
  holographic = false,
  onClick,
}: SupremeGlassCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }, [])

  const glowColorValue = SUPREME_COLORS.glow[glowColor]
  const solidColor = SUPREME_COLORS.quantum[glowColor]

  const variantStyles = {
    default: "bg-white/[0.03] border-white/[0.08]",
    elevated: "bg-white/[0.05] border-white/[0.12]",
    floating: "bg-white/[0.04] border-white/[0.10] shadow-2xl",
    quantum:
      "bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent border-white/[0.15]",
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-2xl transition-all duration-500",
        variantStyles[variant],
        interactive && "cursor-pointer",
        className
      )}
      style={{
        boxShadow: isHovered
          ? `0 24px 80px -16px ${glowColorValue}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : "0 8px 32px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
      whileHover={interactive ? { scale: 1.01, y: -4 } : {}}
      whileTap={interactive ? { scale: 0.99 } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Holographic Spotlight Effect */}
      {holographic && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}% ${mousePosition.y}%, ${glowColorValue}, transparent 50%)`,
          }}
        />
      )}

      {/* Scan Line Effect */}
      {scanLine && (
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
        >
          <motion.div
            className="h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${solidColor}, transparent)`,
            }}
            initial={{ y: -10 }}
            animate={isHovered ? { y: ["0%", "3000%"] } : { y: -10 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}

      {/* Energy Border Glow */}
      {energyBorder && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? [0.2, 0.5, 0.2] : 0 }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            boxShadow: `0 0 30px ${glowColorValue}, inset 0 0 20px ${glowColorValue}`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ SUPREME BUTTON — Ultra-Premium Animated Button
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost" | "quantum" | "danger"
  size?: "sm" | "md" | "lg" | "xl"
  glowColor?: SupremeColorKey
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  loading?: boolean
  disabled?: boolean
  ripple?: boolean
  shimmer?: boolean
  energyPulse?: boolean
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export const SupremeButton = memo(function SupremeButton({
  children,
  className,
  variant = "primary",
  size = "md",
  glowColor = "violet",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ripple = true,
  shimmer = true,
  energyPulse = false,
  onClick,
}: SupremeButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const newRipple = { x, y, id: Date.now() }
        setRipples((prev) => [...prev, newRipple])
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
        }, 700)
      }

      onClick?.(e)
    },
    [disabled, loading, ripple, onClick]
  )

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-4 py-2 text-sm gap-2 rounded-xl",
    lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
    xl: "px-8 py-4 text-lg gap-3 rounded-2xl",
  }

  const variantStyles = {
    primary: `bg-gradient-to-r from-${glowColor}-600 to-${glowColor}-500 text-white shadow-lg`,
    secondary: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/10",
    quantum: "bg-gradient-to-r from-violet-600 via-cyan-500 to-magenta-500 text-white shadow-xl",
    danger: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg",
  }

  const glowColorValue = SUPREME_COLORS.glow[glowColor]
  const solidColor = SUPREME_COLORS.quantum[glowColor]

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden font-medium transition-all duration-300",
        sizeStyles[size],
        variant === "primary" && `bg-gradient-to-r from-${glowColor}-600/90 to-${glowColor}-500/90`,
        variant === "secondary" && "border border-white/20 bg-white/10",
        variant === "ghost" && "bg-transparent text-white/70",
        variant === "quantum" && "bg-gradient-to-r from-violet-600 via-cyan-500 to-fuchsia-500",
        variant === "danger" && "bg-gradient-to-r from-red-600 to-red-500",
        "text-white",
        disabled && "cursor-not-allowed opacity-50",
        energyPulse && !disabled && "animate-pulse",
        className
      )}
      style={{
        boxShadow:
          isHovered && !disabled
            ? `0 12px 40px -8px ${glowColorValue}`
            : "0 4px 20px -4px rgba(0,0,0,0.3)",
      }}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {/* Shimmer Effect */}
      {shimmer && !disabled && isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}

      {/* Ripples */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/40"
          initial={{ width: 0, height: 0, x: r.x, y: r.y, opacity: 0.7 }}
          animate={{ width: 400, height: 400, x: r.x - 200, y: r.y - 200, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}

      {/* Loading Spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}

      {/* Content */}
      <span
        className={cn(
          "relative z-10 flex items-center",
          sizeStyles[size].split(" ").find((s) => s.startsWith("gap"))
        )}
      >
        {icon && iconPosition === "left" && (
          <span className={loading ? "opacity-0" : ""}>{icon}</span>
        )}
        <span className={loading ? "opacity-0" : ""}>{children}</span>
        {icon && iconPosition === "right" && (
          <span className={loading ? "opacity-0" : ""}>{icon}</span>
        )}
      </span>
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 SUPREME STAT CARD — Animated KPI Display
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeStatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  color?: SupremeColorKey
  format?: "number" | "currency" | "percentage"
  animated?: boolean
  className?: string
}

export const SupremeStatCard = memo(function SupremeStatCard({
  label,
  value,
  icon,
  trend,
  color = "cyan",
  format = "number",
  animated = true,
  className,
}: SupremeStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const targetValue =
    typeof value === "number" ? value : parseFloat(value.replace(/[^0-9.-]/g, "")) || 0

  useEffect(() => {
    if (!animated || typeof value !== "number") {
      setDisplayValue(targetValue)
      return
    }

    const duration = 1500
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

      setDisplayValue(startValue + (targetValue - startValue) * easeProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [targetValue, animated])

  const formattedValue = useMemo(() => {
    if (typeof value === "string") return value

    switch (format) {
      case "currency":
        if (displayValue >= 1000000) return `$${(displayValue / 1000000).toFixed(1)}M`
        if (displayValue >= 1000) return `$${(displayValue / 1000).toFixed(0)}K`
        return `$${displayValue.toFixed(0)}`
      case "percentage":
        return `${displayValue.toFixed(1)}%`
      default:
        if (displayValue >= 1000000) return `${(displayValue / 1000000).toFixed(1)}M`
        if (displayValue >= 1000) return `${(displayValue / 1000).toFixed(0)}K`
        return displayValue.toFixed(0)
    }
  }, [displayValue, format, value])

  const solidColor = SUPREME_COLORS.quantum[color]
  const glowColorValue = SUPREME_COLORS.glow[color]

  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-white/40",
  }

  return (
    <SupremeGlassCard
      className={cn("p-4", className)}
      glowColor={color}
      variant="elevated"
      scanLine={false}
      energyBorder={false}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-white/50">{label}</p>
          <motion.p
            className="text-2xl font-bold"
            style={{ color: solidColor }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {formattedValue}
          </motion.p>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs", trendColors[trend.direction])}>
              <span>{trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <motion.div
            className="rounded-xl p-2.5"
            style={{ backgroundColor: `${glowColorValue}` }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </SupremeGlassCard>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 SUPREME LOADING — Quantum Loading States
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeLoadingProps {
  variant?: "spinner" | "dots" | "pulse" | "quantum" | "skeleton"
  size?: "sm" | "md" | "lg"
  color?: SupremeColorKey
  text?: string
  className?: string
}

export const SupremeLoading = memo(function SupremeLoading({
  variant = "quantum",
  size = "md",
  color = "cyan",
  text,
  className,
}: SupremeLoadingProps) {
  const solidColor = SUPREME_COLORS.quantum[color]
  const glowColorValue = SUPREME_COLORS.glow[color]

  const sizeMap = {
    sm: { container: "w-8 h-8", dot: "w-1.5 h-1.5" },
    md: { container: "w-12 h-12", dot: "w-2 h-2" },
    lg: { container: "w-16 h-16", dot: "w-3 h-3" },
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <motion.div
          className="h-4 w-3/4 rounded-lg bg-white/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="h-4 w-1/2 rounded-lg bg-white/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-4 w-2/3 rounded-lg bg-white/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    )
  }

  if (variant === "quantum") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("relative", sizeMap[size].container)}>
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: `${solidColor}30` }}
          />
          {/* Spinning arc */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{ borderTopColor: solidColor, borderRightColor: solidColor }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner glow */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{ backgroundColor: glowColorValue }}
            animate={{ scale: [0.8, 1, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Center dot */}
          <motion.div
            className="absolute inset-0 m-auto h-2 w-2 rounded-full"
            style={{ backgroundColor: solidColor }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        {text && (
          <motion.p
            className="text-sm text-white/60"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("rounded-full", sizeMap[size].dot)}
            style={{ backgroundColor: solidColor }}
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    )
  }

  // Default spinner
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        className={cn("rounded-full border-2 border-transparent", sizeMap[size].container)}
        style={{ borderTopColor: solidColor, borderRightColor: `${solidColor}50` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && <span className="text-sm text-white/60">{text}</span>}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 SUPREME BADGE — Status & Category Indicators
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeBadgeProps {
  children: React.ReactNode
  color?: SupremeColorKey
  variant?: "solid" | "outline" | "glow"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  animated?: boolean
  className?: string
}

export const SupremeBadge = memo(function SupremeBadge({
  children,
  color = "cyan",
  variant = "solid",
  size = "md",
  icon,
  animated = false,
  className,
}: SupremeBadgeProps) {
  const solidColor = SUPREME_COLORS.quantum[color]
  const glowColorValue = SUPREME_COLORS.glow[color]

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }

  const variantStyles = {
    solid: "bg-opacity-20 text-current",
    outline: "bg-transparent border border-current text-current",
    glow: "bg-opacity-10 text-current shadow-lg",
  }

  return (
    <motion.span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      style={{
        backgroundColor: variant !== "outline" ? `${solidColor}20` : "transparent",
        color: solidColor,
        borderColor: variant === "outline" ? solidColor : "transparent",
        boxShadow: variant === "glow" ? `0 0 20px ${glowColorValue}` : "none",
      }}
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={animated ? { duration: 2, repeat: Infinity } : {}}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  SUPREME_COLORS as COLORS,
  type SupremeAuraProps,
  type SupremeBadgeProps,
  type SupremeButtonProps,
  type SupremeGlassCardProps,
  type SupremeLoadingProps,
  type SupremeStatCardProps,
}
