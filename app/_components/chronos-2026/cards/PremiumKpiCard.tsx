"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊✨ PREMIUM KPI CARD — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Card KPI ultra premium con:
 * - Tilt 3D siguiendo el mouse (parallax volumétrico)
 * - Glow volumétrico animado
 * - Count-up animado con spring physics
 * - Glassmorphism GEN5
 * - Micro-interacciones premium
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from "lucide-react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { memo, useCallback, useEffect, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumKpiCardProps {
  title: string
  value: number
  previousValue?: number
  delta?: number
  suffix?: string
  prefix?: string
  icon?: React.ReactNode
  color?: "violet" | "gold" | "emerald" | "rose" | "cyan" | "orange"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  animateValue?: boolean
  showTrend?: boolean
  formatOptions?: Intl.NumberFormatOptions
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const COLOR_SCHEMES = {
  violet: {
    gradient: "from-violet-500/20 via-violet-500/10 to-transparent",
    glow: "rgba(139, 92, 246, 0.4)",
    accent: "text-violet-400",
    border: "border-violet-500/20",
    ring: "ring-violet-500/30",
  },
  gold: {
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    glow: "rgba(255, 215, 0, 0.4)",
    accent: "text-amber-400",
    border: "border-amber-500/20",
    ring: "ring-amber-500/30",
  },
  emerald: {
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    glow: "rgba(16, 185, 129, 0.4)",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
    ring: "ring-emerald-500/30",
  },
  rose: {
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    glow: "rgba(244, 63, 94, 0.4)",
    accent: "text-rose-400",
    border: "border-rose-500/20",
    ring: "ring-rose-500/30",
  },
  cyan: {
    gradient: "from-cyan-500/20 via-cyan-500/10 to-transparent",
    glow: "rgba(6, 182, 212, 0.4)",
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
    ring: "ring-cyan-500/30",
  },
  orange: {
    gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
    glow: "rgba(249, 115, 22, 0.4)",
    accent: "text-orange-400",
    border: "border-orange-500/20",
    ring: "ring-orange-500/30",
  },
}

const SIZE_CLASSES = {
  sm: {
    container: "p-4 gap-2",
    title: "text-xs",
    value: "text-2xl",
    delta: "text-xs",
  },
  md: {
    container: "p-6 gap-3",
    title: "text-sm",
    value: "text-3xl",
    delta: "text-sm",
  },
  lg: {
    container: "p-8 gap-4",
    title: "text-base",
    value: "text-4xl",
    delta: "text-base",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useAnimatedCounter - Contador animado con spring
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function useAnimatedCounter(targetValue: number, shouldAnimate: boolean = true) {
  const [displayValue, setDisplayValue] = useState(0)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.01,
  })

  useEffect(() => {
    if (shouldAnimate) {
      motionValue.set(targetValue)
    } else {
      setDisplayValue(targetValue)
    }
  }, [targetValue, motionValue, shouldAnimate])

  useEffect(() => {
    if (shouldAnimate) {
      const unsubscribe = springValue.on("change", (v) => {
        setDisplayValue(Math.round(v * 100) / 100)
      })
      return unsubscribe
    }
    return undefined
  }, [springValue, shouldAnimate])

  return displayValue
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TrendIndicator - Indicador de tendencia
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const TrendIndicator = memo(function TrendIndicator({
  delta,
  size,
}: {
  delta: number
  size: "sm" | "md" | "lg"
}) {
  const isPositive = delta > 0
  const isNeutral = delta === 0

  const IconComponent = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
  const ArrowIcon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown

  return (
    <motion.div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1",
        isPositive && "bg-emerald-500/20 text-emerald-400",
        !isPositive && !isNeutral && "bg-rose-500/20 text-rose-400",
        isNeutral && "bg-gray-500/20 text-gray-400",
        SIZE_CLASSES[size].delta
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.3 }}
    >
      <motion.span
        animate={isPositive ? { y: [0, -2, 0] } : !isNeutral ? { y: [0, 2, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowIcon className="h-3 w-3" />
      </motion.span>
      <span className="font-semibold tabular-nums">
        {isPositive ? "+" : ""}
        {delta.toFixed(1)}%
      </span>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: PremiumKpiCard
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PremiumKpiCard = memo(function PremiumKpiCard({
  title,
  value,
  previousValue,
  delta,
  suffix = "",
  prefix = "",
  icon,
  color = "violet",
  size = "md",
  onClick,
  className,
  animateValue = true,
  showTrend = true,
  formatOptions = { maximumFractionDigits: 2 },
}: PremiumKpiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics for smooth tilt
  const rotateX = useSpring(useTransform(mouseY, [0, 0], [0, 0]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [0, 0], [0, 0]), {
    stiffness: 300,
    damping: 30,
  })

  // Glow position
  const glowX = useTransform(mouseX, [-150, 150], [0, 100])
  const glowY = useTransform(mouseY, [-150, 150], [0, 100])

  // Calculated delta
  const calculatedDelta =
    delta ?? (previousValue ? ((value - previousValue) / previousValue) * 100 : 0)

  // Animated value
  const displayValue = useAnimatedCounter(value, animateValue)

  // Format value
  const formattedValue = new Intl.NumberFormat("es-MX", formatOptions).format(displayValue)

  // Color scheme
  const scheme = COLOR_SCHEMES[color]
  const sizeClasses = SIZE_CLASSES[size]

  // Mouse handlers for 3D tilt
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={cardRef}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/5 backdrop-blur-xl",
        "transition-colors duration-300",
        onClick && "cursor-pointer",
        "focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none",
        scheme.ring,
        sizeClasses.container,
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        rotateX,
        rotateY,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {/* Volumetric glow following mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${glowX}% ${glowY}%, ${scheme.glow}, transparent 40%)`,
        }}
      />

      {/* Gradient overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          scheme.gradient
        )}
      />

      {/* Shimmer effect on hover */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            transform: "skewX(-20deg)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-1" style={{ transform: "translateZ(20px)" }}>
        {/* Header: Title + Icon */}
        <div className="flex items-center justify-between">
          <span className={cn("font-medium text-white/70", sizeClasses.title)}>{title}</span>
          {icon && (
            <motion.div
              className={cn("rounded-lg bg-white/5 p-2", scheme.accent)}
              animate={isHovered ? { rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.div
          className={cn(
            "font-bold text-white tabular-nums",
            sizeClasses.value,
            "flex items-baseline gap-1"
          )}
          style={{ transform: "translateZ(30px)" }}
        >
          {prefix && <span className="text-white/50">{prefix}</span>}
          <span>{formattedValue}</span>
          {suffix && <span className="text-lg text-white/50">{suffix}</span>}
        </motion.div>

        {/* Trend */}
        {showTrend && calculatedDelta !== 0 && (
          <div className="mt-1 flex items-center gap-2" style={{ transform: "translateZ(15px)" }}>
            <TrendIndicator delta={calculatedDelta} size={size} />
            {previousValue !== undefined && (
              <span className={cn("text-white/40", SIZE_CLASSES[size].delta)}>
                vs {new Intl.NumberFormat("es-MX", formatOptions).format(previousValue)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Border glow on hover */}
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl border-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          scheme.border
        )}
        style={{
          boxShadow: `0 0 20px ${scheme.glow}, inset 0 0 20px ${scheme.glow}`,
        }}
      />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTE: PremiumKpiCardGrid - Grid de KPIs
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KpiData {
  id: string
  title: string
  value: number
  delta?: number
  color?: PremiumKpiCardProps["color"]
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
}

interface PremiumKpiCardGridProps {
  kpis: KpiData[]
  columns?: 2 | 3 | 4
  className?: string
}

export const PremiumKpiCardGrid = memo(function PremiumKpiCardGrid({
  kpis,
  columns = 4,
  className,
}: PremiumKpiCardGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <motion.div
      className={cn("grid gap-4", gridCols[columns], className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.id}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
          <PremiumKpiCard
            title={kpi.title}
            value={kpi.value}
            delta={kpi.delta}
            color={kpi.color}
            prefix={kpi.prefix}
            suffix={kpi.suffix}
            icon={kpi.icon}
          />
        </motion.div>
      ))}
    </motion.div>
  )
})

export default PremiumKpiCard

