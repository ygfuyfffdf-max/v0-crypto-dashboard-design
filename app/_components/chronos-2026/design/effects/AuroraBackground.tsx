'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 AURORA BACKGROUND SUPREME — Ultra Premium Cinematographic Aurora Effect
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Efecto de fondo aurora boreal cinematográfico con:
 * - Gradientes cónicos rotando con blur extremo
 * - Múltiples capas de profundidad
 * - Efectos de onda y pulso
 * - Interactividad con mouse
 * - Optimizado para 60fps
 */

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { memo, useCallback, useRef } from 'react'

interface AuroraBackgroundProps {
  variant?: 'default' | 'intense' | 'subtle' | 'cosmic'
  interactive?: boolean
  className?: string
}

export const AuroraBackground = memo(function AuroraBackground({
  variant = 'default',
  interactive = true,
  className,
}: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 30, damping: 40 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Transform mouse position to gradient positions
  const gradientX = useTransform(smoothX, [0, 1], [-20, 20])
  const gradientY = useTransform(smoothY, [0, 1], [-20, 20])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mouseX.set(x)
      mouseY.set(y)
    },
    [interactive, mouseX, mouseY],
  )

  const variantConfig = {
    default: { opacity: 0.35, blur: '120px', speed: [20, 25, 30] },
    intense: { opacity: 0.5, blur: '100px', speed: [15, 18, 22] },
    subtle: { opacity: 0.2, blur: '150px', speed: [25, 30, 35] },
    cosmic: { opacity: 0.45, blur: '80px', speed: [12, 15, 18] },
  }

  const config = variantConfig[variant]

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Base - TRANSPARENTE para ver fondo del layout */}

      {/* Primary Aurora Layer - Violet/Fuchsia */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[150%] w-[150%]"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%,
            rgba(139, 92, 246, ${config.opacity}) 0deg,
            rgba(217, 70, 239, ${config.opacity * 0.8}) 60deg,
            rgba(139, 92, 246, ${config.opacity * 0.6}) 120deg,
            transparent 180deg,
            rgba(139, 92, 246, ${config.opacity * 0.4}) 240deg,
            rgba(192, 132, 252, ${config.opacity * 0.8}) 300deg,
            rgba(139, 92, 246, ${config.opacity}) 360deg
          )`,
          filter: `blur(${config.blur})`,
          x: gradientX,
          y: gradientY,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: config.speed[0],
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Secondary Aurora Layer - Cyan/Indigo */}
      <motion.div
        className="absolute -right-1/4 -bottom-1/4 h-[150%] w-[150%]"
        style={{
          background: `conic-gradient(from 180deg at 50% 50%,
            rgba(99, 102, 241, ${config.opacity}) 0deg,
            rgba(6, 182, 212, ${config.opacity * 0.8}) 60deg,
            rgba(99, 102, 241, ${config.opacity * 0.6}) 120deg,
            transparent 180deg,
            rgba(99, 102, 241, ${config.opacity * 0.4}) 240deg,
            rgba(129, 140, 248, ${config.opacity * 0.8}) 300deg,
            rgba(99, 102, 241, ${config.opacity}) 360deg
          )`,
          filter: `blur(${config.blur})`,
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: config.speed[1],
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Tertiary Aurora Layer - Emerald/Gold accent */}
      <motion.div
        className="absolute top-1/4 left-1/4 h-[100%] w-[100%]"
        style={{
          background: `radial-gradient(ellipse at center,
            rgba(16, 185, 129, ${config.opacity * 0.4}) 0%,
            rgba(251, 191, 36, ${config.opacity * 0.2}) 30%,
            transparent 70%
          )`,
          filter: `blur(${config.blur})`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: config.speed[2],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Noise texture overlay for organic feel */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Animated scan line (very subtle) */}
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          backgroundSize: '100% 8px',
        }}
        animate={{ backgroundPosition: ['0% 0%', '0% 100%'] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
})

export default AuroraBackground
