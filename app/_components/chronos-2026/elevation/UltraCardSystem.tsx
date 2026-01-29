"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🃏 ULTRA CARD SYSTEM — CHRONOS INFINITY 2026 PREMIUM CARDS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de tarjetas ultra-premium con:
 * - Animaciones de entrada cinematográficas
 * - Efectos de hover holográficos
 * - Glassmorphism adaptativo
 * - Stacking 3D con parallax
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import React, { memo, useCallback, useRef, useState } from "react"
import { SUPREME_COLORS, type SupremeColorKey } from "./SupremeElevationSystem"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🃏 ULTRA CARD — Premium Card with 3D Tilt Effects
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: SupremeColorKey
  variant?: "default" | "glass" | "solid" | "gradient" | "neon"
  size?: "sm" | "md" | "lg" | "xl"
  tiltEnabled?: boolean
  tiltIntensity?: number
  glowOnHover?: boolean
  floatAnimation?: boolean
  onClick?: () => void
  as?: "div" | "article" | "section"
}

export const UltraCard = memo(function UltraCard({
  children,
  className,
  glowColor = "violet",
  variant = "glass",
  size = "md",
  tiltEnabled = true,
  tiltIntensity = 10,
  glowOnHover = true,
  floatAnimation = false,
  onClick,
  as: Component = "div",
}: UltraCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15 }
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]),
    springConfig
  )
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]),
    springConfig
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!tiltEnabled || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set((e.clientX - centerX) / rect.width)
      mouseY.set((e.clientY - centerY) / rect.height)
    },
    [tiltEnabled, mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }, [mouseX, mouseY])

  const solidColor = SUPREME_COLORS.quantum[glowColor]
  const glowColorValue = SUPREME_COLORS.glow[glowColor]

  const sizeStyles = {
    sm: "p-3 rounded-xl",
    md: "p-4 rounded-2xl",
    lg: "p-6 rounded-2xl",
    xl: "p-8 rounded-3xl",
  }

  const variantStyles = {
    default: "bg-white/[0.03] border border-white/[0.08]",
    glass:
      "bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent border border-white/[0.1] backdrop-blur-2xl",
    solid: "bg-gray-900/90 border border-white/[0.08]",
    gradient: `bg-gradient-to-br from-${glowColor}-900/30 to-transparent border border-${glowColor}-500/20`,
    neon: "bg-black/80 border-2",
  }

  const MotionComponent = motion[Component as keyof typeof motion] as typeof motion.div

  return (
    <MotionComponent
      ref={cardRef}
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        sizeStyles[size],
        variantStyles[variant],
        floatAnimation && "animate-float",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        rotateX: tiltEnabled ? rotateX : 0,
        rotateY: tiltEnabled ? rotateY : 0,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        borderColor: variant === "neon" ? `${solidColor}50` : undefined,
        boxShadow:
          isHovered && glowOnHover
            ? `0 30px 100px -20px ${glowColorValue}, 0 0 60px -30px ${solidColor}`
            : "0 10px 50px -15px rgba(0,0,0,0.4)",
      }}
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Holographic Shine Effect */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(
              105deg,
              transparent 40%,
              rgba(255, 255, 255, 0.08) 45%,
              rgba(255, 255, 255, 0.12) 50%,
              rgba(255, 255, 255, 0.08) 55%,
              transparent 60%
            )`,
            backgroundSize: "200% 200%",
          }}
          initial={{ backgroundPosition: "200% 0%" }}
          animate={{ backgroundPosition: "-200% 0%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}

      {/* Neon Border Glow */}
      {variant === "neon" && isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            boxShadow: `inset 0 0 20px ${glowColorValue}, 0 0 40px ${glowColorValue}`,
          }}
        />
      )}

      {/* Content with 3D depth */}
      <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </MotionComponent>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 ULTRA CARD PARTS — Composable Card Sections
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraCardSectionProps {
  children: React.ReactNode
  className?: string
}

export const UltraCardHeader = memo(function UltraCardHeader({
  children,
  className,
}: UltraCardSectionProps) {
  return <div className={cn("mb-4 border-b border-white/[0.06] pb-4", className)}>{children}</div>
})

export const UltraCardBody = memo(function UltraCardBody({
  children,
  className,
}: UltraCardSectionProps) {
  return <div className={cn("py-2", className)}>{children}</div>
})

export const UltraCardFooter = memo(function UltraCardFooter({
  children,
  className,
}: UltraCardSectionProps) {
  return <div className={cn("mt-4 border-t border-white/[0.06] pt-4", className)}>{children}</div>
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🗂️ ULTRA CARD STACK — Stacked Card Layout with Depth
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraCardStackProps {
  children: React.ReactNode[]
  className?: string
  direction?: "vertical" | "horizontal"
  spacing?: number
  depth?: number
  interactive?: boolean
}

export const UltraCardStack = memo(function UltraCardStack({
  children,
  className,
  direction = "vertical",
  spacing = 8,
  depth = 4,
  interactive = true,
}: UltraCardStackProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className={cn(
        "relative",
        direction === "vertical" ? "flex flex-col" : "flex flex-row",
        className
      )}
      style={{
        gap: spacing,
        perspective: 1500,
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          className="relative"
          style={{
            zIndex: hoveredIndex === index ? 50 : children.length - index,
          }}
          animate={{
            y:
              hoveredIndex !== null && hoveredIndex !== index
                ? index > (hoveredIndex ?? 0)
                  ? depth * 2
                  : -depth * 2
                : 0,
            scale: hoveredIndex === index ? 1.02 : 1,
            rotateX: hoveredIndex !== null && hoveredIndex !== index ? 5 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onMouseEnter={() => interactive && setHoveredIndex(index)}
          onMouseLeave={() => interactive && setHoveredIndex(null)}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
})
