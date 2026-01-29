'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎨 AURORA ULTRA PREMIUM WRAPPER - CHRONOS 2026
// ═══════════════════════════════════════════════════════════════════════════════════════
// Wrapper que combina AuroraGlassSystem con UltraPremium Components
// Permite usar ambos sistemas simultáneamente sin romper código existente
// ═══════════════════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import React from 'react'
import { AuroraButton, AuroraGlassCard, type AuroraButtonProps, type AuroraGlassCardProps } from './AuroraGlassSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ENHANCED AURORA GLASS CARD CON EFECTOS ULTRA-PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════

interface EnhancedAuroraCardProps extends AuroraGlassCardProps {
  enableUltraPremium?: boolean
  scanLine?: boolean
  energyBorder?: boolean
  parallax?: boolean
}

export function EnhancedAuroraCard({
  enableUltraPremium = true,
  scanLine = true,
  energyBorder = true,
  parallax = false,
  className,
  children,
  glowColor = 'violet',
  ...props
}: EnhancedAuroraCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  if (!enableUltraPremium) {
    return (
      <AuroraGlassCard className={className} glowColor={glowColor} {...props}>
        {children}
      </AuroraGlassCard>
    )
  }

  const glowColors = {
    violet: 'rgba(139, 92, 246, 0.3)',
    cyan: 'rgba(6, 182, 212, 0.3)',
    magenta: 'rgba(236, 72, 153, 0.3)',
    emerald: 'rgba(16, 185, 129, 0.3)',
    gold: 'rgba(251, 191, 36, 0.3)',
  }

  const effectiveGlow = glowColors[glowColor || 'violet']

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'border border-white/[0.08] backdrop-blur-2xl',
        'bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent',
        'transition-spring hover-elevate',
        parallax && 'animate-premium-float',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01, y: -4 }}
      style={{
        boxShadow: isHovered
          ? `0 24px 64px -16px ${effectiveGlow}, inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 8px 32px -8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* ═══════════════════ SCAN LINE EFFECT ═══════════════════ */}
      {scanLine && (
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.4 : 0 }}
        >
          <motion.div
            className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/80 to-transparent"
            initial={{ y: -10 }}
            animate={isHovered ? { y: ['0%', '2000%'] } : { y: -10 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* ═══════════════════ ENERGY BORDER ═══════════════════ */}
      {energyBorder && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? [0.3, 0.6, 0.3] : 0 }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ boxShadow: `0 0 24px ${effectiveGlow}, inset 0 0 16px ${effectiveGlow}` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ENHANCED AURORA BUTTON CON EFECTOS ULTRA-PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════

interface EnhancedAuroraButtonProps extends Omit<AuroraButtonProps, 'onClick'> {
  enableUltraPremium?: boolean
  ripple?: boolean
  shimmer?: boolean
  energyPulse?: boolean
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export function EnhancedAuroraButton({
  enableUltraPremium = true,
  ripple = true,
  shimmer = true,
  energyPulse = false,
  className,
  children,
  onClick,
  disabled,
  ...props
}: EnhancedAuroraButtonProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])
  const [isHovered, setIsHovered] = React.useState(false)
  const buttonRef = React.useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newRipple = { x, y, id: Date.now() }
      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 600)
    }

    onClick?.(e)
  }

  if (!enableUltraPremium) {
    return (
      <AuroraButton className={className} onClick={() => onClick?.()} disabled={disabled} {...props}>
        {children}
      </AuroraButton>
    )
  }

  return (
    <motion.div
      ref={buttonRef}
      className="relative inline-block"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AuroraButton
        className={cn(
          'relative overflow-hidden',
          energyPulse && !disabled && 'animate-pulse-premium',
          className,
        )}
        onClick={() => handleClick({} as React.MouseEvent<HTMLButtonElement>)}
        disabled={disabled}
        {...props}
      >
        {/* Shimmer effect */}
        {shimmer && !disabled && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        {/* Ripples */}
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="pointer-events-none absolute rounded-full bg-white/30"
            initial={{ width: 0, height: 0, x: r.x, y: r.y, opacity: 0.6 }}
            animate={{ width: 300, height: 300, x: r.x - 150, y: r.y - 150, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {children}
      </AuroraButton>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS PARA COMPATIBILIDAD
// ═══════════════════════════════════════════════════════════════════════════════════════

export { AuroraButton, AuroraGlassCard }
export type { AuroraButtonProps, AuroraGlassCardProps }
