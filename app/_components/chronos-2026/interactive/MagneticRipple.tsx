/**
 * 🧲✨ MAGNETIC RIPPLE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Efecto magnético + ondas líquidas al hover
 * El cursor "atrae" el elemento + genera ripples oro/violeta
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useRef, useState, useCallback } from 'react'
import { motion } from 'motion/react'

interface MagneticRippleProps {
  children: React.ReactNode
  className?: string
  magnetStrength?: number // 1-20, default 15
  rippleColor?: 'violet' | 'gold' | 'rose' | 'emerald'
  glowIntensity?: 'subtle' | 'medium' | 'intense'
  disabled?: boolean
}

const RIPPLE_COLORS = {
  violet: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  gold: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  rose: {
    primary: '#EC4899',
    secondary: '#F472B6',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  emerald: {
    primary: '#10B981',
    secondary: '#34D399',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
}

const GLOW_INTENSITY = {
  subtle: { blur: '20px', opacity: 0.3 },
  medium: { blur: '40px', opacity: 0.5 },
  intense: { blur: '60px', opacity: 0.7 },
}

export function MagneticRipple({
  children,
  className = '',
  magnetStrength = 15,
  rippleColor = 'violet',
  glowIntensity = 'medium',
  disabled = false,
}: MagneticRippleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [isHovered, setIsHovered] = useState(false)

  const colors = RIPPLE_COLORS[rippleColor]
  const glow = GLOW_INTENSITY[glowIntensity]

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !ref.current) return

      const { clientX, clientY } = e
      const { left, top, width, height } = ref.current.getBoundingClientRect()

      // Magnetic attraction - element follows cursor
      const x = ((clientX - left - width / 2) / width) * magnetStrength
      const y = ((clientY - top - height / 2) / height) * magnetStrength

      setPosition({ x, y })
    },
    [disabled, magnetStrength],
  )

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovered(true)
  }, [disabled])

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
    setIsHovered(false)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !ref.current) return

      const { clientX, clientY } = e
      const { left, top } = ref.current.getBoundingClientRect()

      // Create ripple at click position
      const rippleX = clientX - left
      const rippleY = clientY - top
      const newRipple = { id: Date.now(), x: rippleX, y: rippleY }

      setRipples((prev) => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 1000)
    },
    [disabled],
  )

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={{
        x: position.x,
        y: position.y,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-colors duration-300 ${isHovered ? 'border-white/20' : ''} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className} `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Magnetic glow that follows cursor */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute rounded-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: glow.opacity,
            scale: 1,
            x: position.x * 3,
            y: position.y * 3,
          }}
          exit={{ opacity: 0 }}
          style={{
            width: '150%',
            height: '150%',
            left: '-25%',
            top: '-25%',
            background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
            filter: `blur(${glow.blur})`,
          }}
        />
      )}

      {/* Liquid ripples on click */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="pointer-events-none absolute rounded-full"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
            background: `radial-gradient(circle, ${colors.primary}40 0%, ${colors.secondary}20 50%, transparent 70%)`,
            border: `2px solid ${colors.primary}60`,
          }}
        />
      ))}

      {/* Hover border glow */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `linear-gradient(135deg, ${colors.primary}20, transparent, ${colors.secondary}20)`,
            border: `1px solid ${colors.primary}40`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

export default MagneticRipple
