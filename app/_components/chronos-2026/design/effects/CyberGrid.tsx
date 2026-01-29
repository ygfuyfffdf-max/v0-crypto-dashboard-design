'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🕸️ CYBER GRID SUPREME — Ultra Premium Animated Grid System
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Grid cyberpunk cinematográfico con:
 * - Animaciones de pulso y brillo
 * - Efecto de profundidad 3D
 * - Interactividad con mouse
 * - Múltiples variantes visuales
 */

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { memo, useCallback, useRef } from 'react'

interface CyberGridProps {
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  variant?: 'default' | 'perspective' | 'pulse' | 'wave'
  intensity?: 'low' | 'medium' | 'high'
  animated?: boolean
  interactive?: boolean
  className?: string
}

const COLOR_MAP = {
  violet: { rgb: '139,92,246', hex: '#8B5CF6' },
  cyan: { rgb: '6,182,212', hex: '#06B6D4' },
  magenta: { rgb: '236,72,153', hex: '#EC4899' },
  emerald: { rgb: '16,185,129', hex: '#10B981' },
  gold: { rgb: '251,191,36', hex: '#FBBF24' },
}

const INTENSITY_MAP = {
  low: { opacity: 0.02, size: 80 },
  medium: { opacity: 0.04, size: 60 },
  high: { opacity: 0.06, size: 40 },
}

export const CyberGrid = memo(function CyberGrid({
  color = 'violet',
  variant = 'default',
  intensity = 'medium',
  animated = true,
  interactive = true,
  className,
}: CyberGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 50, damping: 30 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const perspectiveX = useTransform(smoothX, [0, 1], [-10, 10])
  const perspectiveY = useTransform(smoothY, [0, 1], [10, -10])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }, [interactive, mouseX, mouseY])

  const { rgb, hex } = COLOR_MAP[color]
  const { opacity, size } = INTENSITY_MAP[intensity]

  const gridStyle = {
    backgroundImage: `
      linear-gradient(rgba(${rgb},${opacity}) 1px, transparent 1px),
      linear-gradient(90deg, rgba(${rgb},${opacity}) 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
  }

  const renderVariant = () => {
    switch (variant) {
      case 'perspective':
        return (
          <motion.div
            ref={containerRef}
            className={`pointer-events-none absolute inset-0 ${className || ''}`}
            style={{
              ...gridStyle,
              perspective: 1000,
              rotateX: perspectiveY,
              rotateY: perspectiveX,
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            }}
            onMouseMove={handleMouseMove}
          />
        )

      case 'pulse':
        return (
          <div className={`pointer-events-none absolute inset-0 ${className || ''}`}>
            <div
              style={{
                ...gridStyle,
                position: 'absolute',
                inset: 0,
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
              }}
            />
            {animated && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at center, ${hex}10 0%, transparent 50%)`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>
        )

      case 'wave':
        return (
          <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}>
            <motion.div
              style={{
                ...gridStyle,
                position: 'absolute',
                inset: '-50%',
                width: '200%',
                height: '200%',
              }}
              animate={animated ? {
                backgroundPosition: ['0px 0px', `${size}px ${size}px`],
              } : undefined}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
              }}
            />
          </div>
        )

      default:
        return (
          <div
            ref={containerRef}
            className={`pointer-events-none absolute inset-0 ${className || ''}`}
            style={{
              ...gridStyle,
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Animated highlight line */}
            {animated && (
              <motion.div
                className="absolute h-px w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${hex}40, transparent)`,
                  top: '50%',
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scaleX: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>
        )
    }
  }

  return renderVariant()
})

export default CyberGrid
