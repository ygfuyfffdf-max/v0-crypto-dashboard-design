'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📺 SCAN LINE EFFECT SUPREME — Premium CRT/Retro Visual Effect
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Efecto CRT cinematográfico con:
 * - Líneas de escaneo animadas
 * - Efecto de phosphor glow
 * - Distorsión sutil
 * - Múltiples variantes (CRT, VHS, Digital)
 */

import { motion } from 'motion/react'
import { memo } from 'react'

interface ScanLineEffectProps {
  variant?: 'crt' | 'vhs' | 'digital' | 'hologram'
  intensity?: 'low' | 'medium' | 'high'
  color?: 'neutral' | 'green' | 'amber' | 'cyan'
  animated?: boolean
  className?: string
}

const COLOR_MAP = {
  neutral: { line: 'rgba(255,255,255,0.03)', glow: 'rgba(255,255,255,0.02)' },
  green: { line: 'rgba(0,255,100,0.05)', glow: 'rgba(0,255,100,0.03)' },
  amber: { line: 'rgba(255,191,36,0.05)', glow: 'rgba(255,191,36,0.03)' },
  cyan: { line: 'rgba(6,182,212,0.05)', glow: 'rgba(6,182,212,0.03)' },
}

const INTENSITY_MAP = {
  low: { lineHeight: 2, opacity: 0.3 },
  medium: { lineHeight: 3, opacity: 0.5 },
  high: { lineHeight: 4, opacity: 0.7 },
}

export const ScanLineEffect = memo(function ScanLineEffect({
  variant = 'crt',
  intensity = 'low',
  color = 'neutral',
  animated = true,
  className,
}: ScanLineEffectProps) {
  const colors = COLOR_MAP[color]
  const config = INTENSITY_MAP[intensity]

  const renderVariant = () => {
    switch (variant) {
      case 'vhs':
        return (
          <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}>
            {/* VHS tracking lines */}
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent ${config.lineHeight}px,
                  ${colors.line} ${config.lineHeight}px,
                  ${colors.line} ${config.lineHeight * 2}px
                )`,
                opacity: config.opacity,
              }}
            />
            {/* VHS noise band */}
            {animated && (
              <motion.div
                className="absolute left-0 h-8 w-full"
                style={{
                  background: `linear-gradient(180deg, transparent, ${colors.glow}, transparent)`,
                  opacity: 0.5,
                }}
                animate={{
                  top: ['-10%', '110%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </div>
        )

      case 'digital':
        return (
          <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}>
            {/* Digital scan effect */}
            {animated && (
              <motion.div
                className="absolute left-0 h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${colors.glow} 50%, transparent 100%)`,
                  boxShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
                }}
                animate={{
                  top: ['0%', '100%'],
                  opacity: [0.8, 0.4, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            {/* Subtle grid overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(${colors.line} 1px, transparent 1px),
                  linear-gradient(90deg, ${colors.line} 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
          </div>
        )

      case 'hologram':
        return (
          <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}>
            {/* Holographic lines */}
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 2px,
                  rgba(6,182,212,0.02) 2px,
                  rgba(6,182,212,0.02) 4px
                )`,
              }}
            />
            {/* Holographic shimmer */}
            {animated && (
              <>
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, transparent 40%, rgba(6,182,212,0.05) 50%, transparent 60%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(225deg, transparent 40%, rgba(139,92,246,0.05) 50%, transparent 60%)',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 200%', '0% 0%'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </>
            )}
          </div>
        )

      default: // CRT
        return (
          <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ''}`}>
            {/* CRT scan lines */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  transparent 50%,
                  rgba(0,0,0,0.03) 50%
                )`,
                backgroundSize: `100% ${config.lineHeight * 2}px`,
                opacity: config.opacity,
              }}
            />
            {/* Phosphor glow scan */}
            {animated && (
              <motion.div
                className="absolute left-0 h-[2px] w-full"
                style={{
                  background: colors.glow,
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
                animate={{
                  top: ['0%', '100%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
            {/* Corner vignette */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          </div>
        )
    }
  }

  return renderVariant()
})

export default ScanLineEffect
