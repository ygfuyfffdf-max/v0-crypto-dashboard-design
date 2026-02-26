'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎨 CORE DESIGN SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Professional Design System implementation consolidating Glassmorphism
 * and Neumorphism styles.
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export const DESIGN_SYSTEM = {
  // Color palettes by domain
  palettes: {
    sales: {
      primary: '#8B5CF6', // Violet
      secondary: '#C084FC',
      accent: '#F472B6',
      glow: 'rgba(139, 92, 246, 0.5)',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
      aurora: ['#8B5CF6', '#C084FC', '#F472B6', '#818CF8'],
    },
    banking: {
      primary: '#10B981', // Emerald
      secondary: '#34D399',
      accent: '#6EE7B7',
      glow: 'rgba(16, 185, 129, 0.5)',
      gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
      aurora: ['#10B981', '#34D399', '#6EE7B7', '#059669'],
    },
    clients: {
      primary: '#3B82F6', // Blue
      secondary: '#60A5FA',
      accent: '#93C5FD',
      glow: 'rgba(59, 130, 246, 0.5)',
      gradient: 'linear-gradient(135deg, #0c1929 0%, #1e3a5f 50%, #1e40af 100%)',
      aurora: ['#3B82F6', '#60A5FA', '#818CF8', '#6366F1'],
    },
    orders: {
      primary: '#F59E0B', // Amber
      secondary: '#FBBF24',
      accent: '#FCD34D',
      glow: 'rgba(245, 158, 11, 0.5)',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #422006 50%, #78350f 100%)',
      aurora: ['#F59E0B', '#FBBF24', '#F97316', '#FB923C'],
    },
    expenses: {
      primary: '#EF4444', // Red
      secondary: '#F87171',
      accent: '#FCA5A5',
      glow: 'rgba(239, 68, 68, 0.5)',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #450a0a 50%, #7f1d1d 100%)',
      aurora: ['#EF4444', '#F87171', '#DC2626', '#FB7185'],
    },
    movements: {
      primary: '#06B6D4', // Cyan
      secondary: '#22D3EE',
      accent: '#67E8F9',
      glow: 'rgba(6, 182, 212, 0.5)',
      gradient: 'linear-gradient(135deg, #0c1929 0%, #083344 50%, #155e75 100%)',
      aurora: ['#06B6D4', '#22D3EE', '#0891B2', '#14B8A6'],
    },
    distributors: {
      primary: '#EC4899', // Pink
      secondary: '#F472B6',
      accent: '#F9A8D4',
      glow: 'rgba(236, 72, 153, 0.5)',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #500724 50%, #831843 100%)',
      aurora: ['#EC4899', '#F472B6', '#DB2777', '#F43F5E'],
    },
    inventory: {
      primary: '#84CC16', // Lime
      secondary: '#A3E635',
      accent: '#BEF264',
      glow: 'rgba(132, 204, 22, 0.5)',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #1a2e05 50%, #365314 100%)',
      aurora: ['#84CC16', '#A3E635', '#65A30D', '#22C55E'],
    },
    ai: {
      primary: '#A855F7', // Purple
      secondary: '#C084FC',
      accent: '#E879F9',
      glow: 'rgba(168, 85, 247, 0.5)',
      gradient: 'linear-gradient(135deg, #0f0035 0%, #1e0050 50%, #4a044e 100%)',
      aurora: ['#A855F7', '#C084FC', '#E879F9', '#F0ABFC'],
    },
    dashboard: {
      primary: '#6366F1', // Indigo
      secondary: '#818CF8',
      accent: '#A5B4FC',
      glow: 'rgba(99, 102, 241, 0.5)',
      gradient: 'linear-gradient(135deg, #0f0720 0%, #1e1b4b 50%, #312e81 100%)',
      aurora: ['#6366F1', '#818CF8', '#8B5CF6', '#A78BFA'],
    },
  },

  // Glass effects
  glass: {
    deep: {
      bg: 'rgba(0, 0, 0, 0.4)',
      blur: 'blur(64px)',
      border: 'rgba(255, 255, 255, 0.08)',
      shadow: '0 32px 64px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    },
    standard: {
      bg: 'rgba(255, 255, 255, 0.03)',
      blur: 'blur(40px)',
      border: 'rgba(255, 255, 255, 0.12)',
      shadow: '0 24px 48px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    },
    frosted: {
      bg: 'rgba(255, 255, 255, 0.08)',
      blur: 'blur(32px)',
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: '0 16px 32px -8px rgba(0, 0, 0, 0.5)',
    },
    subtle: {
      bg: 'rgba(255, 255, 255, 0.05)',
      blur: 'blur(24px)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
    },
  },

  // Neumorphic effects
  neumorphic: {
    raised: {
      light: 'inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
      dark: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5)',
      combined:
        'inset -4px -4px 8px rgba(255, 255, 255, 0.05), inset 4px 4px 8px rgba(0, 0, 0, 0.5)',
    },
    pressed: {
      light: 'inset 4px 4px 8px rgba(0, 0, 0, 0.5)',
      dark: 'inset -4px -4px 8px rgba(255, 255, 255, 0.03)',
      combined:
        'inset 4px 4px 12px rgba(0, 0, 0, 0.6), inset -2px -2px 6px rgba(255, 255, 255, 0.02)',
    },
    floating: {
      shadow: '12px 12px 24px rgba(0, 0, 0, 0.5), -12px -12px 24px rgba(255, 255, 255, 0.02)',
    },
  },

  // Animation springs
  springs: {
    ultraSmooth: { stiffness: 80, damping: 20, mass: 1.2 },
    smooth: { stiffness: 150, damping: 25, mass: 1 },
    snappy: { stiffness: 400, damping: 30, mass: 0.5 },
    bouncy: { stiffness: 500, damping: 15, mass: 0.3 },
    magnetic: { stiffness: 200, damping: 18, mass: 0.8 },
    cinematic: { stiffness: 60, damping: 15, mass: 1.5 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌊 AURORA SHADER BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

// Legacy mapping for compatibility
const PALETTE_MAP: Record<string, keyof typeof DESIGN_SYSTEM.palettes> = {
  ventas: 'sales',
  bancos: 'banking',
  clientes: 'clients',
  ordenes: 'orders',
  gastos: 'expenses',
  movimientos: 'movements',
  distribuidores: 'distributors',
  almacen: 'inventory',
  ia: 'ai',
  dashboard: 'dashboard',
}

interface AuroraBackgroundProps {
  palette: keyof typeof DESIGN_SYSTEM.palettes | string
  intensity?: 'low' | 'medium' | 'high'
  speed?: 'slow' | 'normal' | 'fast'
  className?: string
}

export function AuroraBackground({
  palette,
  intensity = 'medium',
  speed = 'normal',
  className,
}: AuroraBackgroundProps) {
  // Handle legacy palette names
  const paletteKey = (PALETTE_MAP[palette as string] || palette) as keyof typeof DESIGN_SYSTEM.palettes
  const colors = DESIGN_SYSTEM.palettes[paletteKey] || DESIGN_SYSTEM.palettes.dashboard

  const intensityValues = { low: 0.3, medium: 0.5, high: 0.7 }
  const speedValues = { slow: 20, normal: 12, fast: 6 }

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: colors.gradient }} />

      {/* Aurora blobs */}
      {colors.aurora.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${40 + i * 15}%`,
            height: `${40 + i * 15}%`,
            background: `radial-gradient(circle, ${color}${Math.round(
              intensityValues[intensity] * 255,
            )
              .toString(16)
              .padStart(2, '0')} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            left: `${10 + i * 20}%`,
            top: `${10 + i * 15}%`,
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, 45, -30, 0],
          }}
          transition={{
            duration: speedValues[speed] + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 💎 GLASS CARD
// ═══════════════════════════════════════════════════════════════════════════

interface GlassCardProps {
  children: ReactNode
  palette?: keyof typeof DESIGN_SYSTEM.palettes | string
  variant?: 'deep' | 'standard' | 'frosted' | 'subtle' | 'ultraDeep' | 'premium' // Added legacy variants
  size?: 'sm' | 'md' | 'lg' | 'xl'
  enableTilt?: boolean
  enableGlow?: boolean
  enableReflection?: boolean
  enableParticles?: boolean
  className?: string
  onClick?: () => void
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      palette = 'dashboard',
      variant = 'standard',
      size = 'md',
      enableTilt = true,
      enableGlow = true,
      enableReflection = true,
      enableParticles = false,
      className,
      onClick,
    },
    ref,
  ) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Handle legacy mappings
    const paletteKey = (PALETTE_MAP[palette as string] || palette) as keyof typeof DESIGN_SYSTEM.palettes
    const colors = DESIGN_SYSTEM.palettes[paletteKey] || DESIGN_SYSTEM.palettes.dashboard
    
    const variantMap: Record<string, keyof typeof DESIGN_SYSTEM.glass> = {
        ultraDeep: 'deep',
        premium: 'standard'
    }
    const glassKey = (variantMap[variant] || variant) as keyof typeof DESIGN_SYSTEM.glass
    const glass = DESIGN_SYSTEM.glass[glassKey] || DESIGN_SYSTEM.glass.standard

    // 3D Tilt effect
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), DESIGN_SYSTEM.springs.magnetic)
    const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), DESIGN_SYSTEM.springs.magnetic)

    // Glow position
    const glowX = useSpring(x, DESIGN_SYSTEM.springs.smooth)
    const glowY = useSpring(y, DESIGN_SYSTEM.springs.smooth)

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!enableTilt || !cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set(e.clientX - centerX)
        y.set(e.clientY - centerY)
      },
      [enableTilt, x, y],
    )

    const handleMouseLeave = useCallback(() => {
      x.set(0)
      y.set(0)
      setIsHovered(false)
    }, [x, y])

    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    return (
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX: enableTilt ? rotateX : 0,
          rotateY: enableTilt ? rotateY : 0,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-3xl',
          'transition-shadow duration-500',
          sizeClasses[size],
          onClick && 'cursor-pointer',
          className,
        )}
        whileHover={{ scale: 1.02, z: 50 }}
        transition={DESIGN_SYSTEM.springs.smooth}
      >
        {/* Glass background */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: glass.bg,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            border: `1px solid ${glass.border}`,
            boxShadow: isHovered ? `${glass.shadow}, 0 0 60px ${colors.glow}` : glass.shadow,
          }}
        />

        {/* Prismatic reflection */}
        {enableReflection && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background: `linear-gradient(
                135deg,
                transparent 0%,
                rgba(255, 255, 255, 0.03) 40%,
                rgba(255, 255, 255, 0.08) 50%,
                rgba(255, 255, 255, 0.03) 60%,
                transparent 100%
              )`,
              opacity: isHovered ? 1 : 0.5,
            }}
            animate={{
              backgroundPosition: isHovered ? ['0% 0%', '200% 200%'] : '0% 0%',
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        )}

        {/* Dynamic glow */}
        {enableGlow && isHovered && (
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              x: glowX,
              y: glowY,
              translateX: '-50%',
              translateY: '-50%',
            }}
          />
        )}

        {/* Particles */}
        {enableParticles && isHovered && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full"
                style={{
                  background: colors.primary,
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
                initial={{
                  x: Math.random() * 100 + '%',
                  y: '100%',
                  opacity: 0,
                }}
                animate={{
                  y: '-20%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
          {children}
        </div>

        {/* Bottom edge glow */}
        <div
          className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}40, transparent)`,
          }}
        />
      </motion.div>
    )
  },
)
GlassCard.displayName = 'GlassCard'

// ═══════════════════════════════════════════════════════════════════════════
// 🔘 GLASS BUTTON
// ═══════════════════════════════════════════════════════════════════════════

interface GlassButtonProps {
  children: ReactNode
  palette?: keyof typeof DESIGN_SYSTEM.palettes | string
  variant?: 'solid' | 'glass' | 'outline' | 'ghost' | 'neumorphic'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  isLoading?: boolean
  disabled?: boolean
  enableMagnetic?: boolean
  enableRipple?: boolean
  className?: string
  onClick?: () => void
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      palette = 'dashboard',
      variant = 'solid',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      disabled = false,
      enableMagnetic = true,
      enableRipple = true,
      className,
      onClick,
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
    
    // Legacy mapping
    const paletteKey = (PALETTE_MAP[palette as string] || palette) as keyof typeof DESIGN_SYSTEM.palettes
    const colors = DESIGN_SYSTEM.palettes[paletteKey] || DESIGN_SYSTEM.palettes.dashboard

    // Magnetic effect
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const magnetX = useSpring(useTransform(x, [-50, 50], [-8, 8]), DESIGN_SYSTEM.springs.magnetic)
    const magnetY = useSpring(useTransform(y, [-50, 50], [-8, 8]), DESIGN_SYSTEM.springs.magnetic)

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!enableMagnetic || !buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        x.set(e.clientX - centerX)
        y.set(e.clientY - centerY)
      },
      [enableMagnetic, x, y],
    )

    const handleMouseLeave = useCallback(() => {
      x.set(0)
      y.set(0)
    }, [x, y])

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return

        if (enableRipple) {
          const rect = e.currentTarget.getBoundingClientRect()
          const id = Date.now()
          setRipples((prev) => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }])
          setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
        }

        onClick?.()
      },
      [disabled, isLoading, enableRipple, onClick],
    )

    const sizeClasses = {
      sm: 'h-9 px-4 text-sm gap-1.5',
      md: 'h-11 px-6 text-base gap-2',
      lg: 'h-13 px-8 text-lg gap-2.5',
      xl: 'h-14 px-10 text-xl gap-3',
    }

    const getVariantStyles = () => {
      switch (variant) {
        case 'solid':
          return {
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            boxShadow: `0 8px 32px ${colors.glow}, ${DESIGN_SYSTEM.neumorphic.floating.shadow}`,
            border: 'none',
            color: '#FFFFFF',
          }
        case 'glass':
          return {
            background: DESIGN_SYSTEM.glass.frosted.bg,
            backdropFilter: DESIGN_SYSTEM.glass.frosted.blur,
            WebkitBackdropFilter: DESIGN_SYSTEM.glass.frosted.blur,
            boxShadow: DESIGN_SYSTEM.glass.frosted.shadow,
            border: `1px solid ${DESIGN_SYSTEM.glass.frosted.border}`,
            color: colors.primary,
          }
        case 'outline':
          return {
            background: 'transparent',
            boxShadow: `0 0 20px ${colors.glow}`,
            border: `2px solid ${colors.primary}`,
            color: colors.primary,
          }
        case 'ghost':
          return {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            color: colors.primary,
          }
        case 'neumorphic':
          return {
            background: 'rgba(20, 20, 30, 0.8)',
            boxShadow: DESIGN_SYSTEM.neumorphic.raised.combined,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: colors.primary,
          }
        default:
          return {}
      }
    }

    return (
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || isLoading}
        style={{
          ...getVariantStyles(),
          x: enableMagnetic ? magnetX : 0,
          y: enableMagnetic ? magnetY : 0,
        }}
        className={cn(
          'relative inline-flex items-center justify-center rounded-2xl font-semibold',
          'overflow-hidden transition-all duration-300',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          sizeClasses[size],
          className,
        )}
        whileHover={{
          scale: disabled ? 1 : 1.05,
          boxShadow: variant === 'solid' ? `0 12px 40px ${colors.glow}` : undefined,
        }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={DESIGN_SYSTEM.springs.snappy}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="pointer-events-none absolute rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                background: 'rgba(255, 255, 255, 0.3)',
              }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 400, height: 400, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Shimmer effect on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
          }}
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-current border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </span>
      </motion.button>
    )
  },
)
GlassButton.displayName = 'GlassButton'

// Export legacy name
export const OmegaButton = GlassButton;

// ═══════════════════════════════════════════════════════════════════════════
// 📊 STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subValue?: string
  trend?: { value: number; positive: boolean }
  palette?: keyof typeof DESIGN_SYSTEM.palettes | string
  sparklineData?: number[]
  delay?: number
  className?: string
}

export function StatCard({
  icon,
  label,
  value,
  subValue,
  trend,
  palette = 'dashboard',
  sparklineData,
  delay = 0,
  className,
}: StatCardProps) {
  // Legacy mapping
  const paletteKey = (PALETTE_MAP[palette as string] || palette) as keyof typeof DESIGN_SYSTEM.palettes
  const colors = DESIGN_SYSTEM.palettes[paletteKey] || DESIGN_SYSTEM.palettes.dashboard
  
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...DESIGN_SYSTEM.springs.smooth, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <GlassCard palette={palette} variant="premium" enableParticles={isHovered}>
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          {/* Icon container with glow */}
          <motion.div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}10 100%)`,
              boxShadow: isHovered ? `0 0 40px ${colors.glow}` : 'none',
            }}
            whileHover={{ scale: 1.02, rotate: 10 }}
            transition={DESIGN_SYSTEM.springs.bouncy}
          >
            {/* Inner glow */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${colors.primary}40 0%, transparent 60%)`,
              }}
            />
            <div style={{ color: colors.primary }} className="relative z-10">
              {icon}
            </div>
          </motion.div>

          {/* Trend badge */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold',
                'border backdrop-blur-xl',
              )}
              style={{
                background: trend.positive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: trend.positive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                color: trend.positive ? '#34D399' : '#F87171',
                boxShadow: `0 0 20px ${trend.positive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              <motion.span
                animate={{ y: trend.positive ? [-2, 2, -2] : [2, -2, 2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {trend.positive ? '↑' : '↓'}
              </motion.span>
              {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>

        {/* Label */}
        <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/40 uppercase">
          {label}
        </p>

        {/* Value with animated counter */}
        <motion.div
          className="mb-1 text-4xl font-bold text-white"
          style={{
            textShadow: isHovered ? `0 0 30px ${colors.glow}` : 'none',
          }}
        >
          {typeof value === 'number' ? <AnimatedValue value={value} prefix="$" /> : value}
        </motion.div>

        {subValue && <p className="text-sm text-white/30">{subValue}</p>}

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="relative mt-5 h-16">
            <SparklineChart data={sparklineData} color={colors.primary} glowColor={colors.glow} />
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

// Export legacy name
export const OmegaStatCard = StatCard;

// ═══════════════════════════════════════════════════════════════════════════
// 📈 SPARKLINE CHART
// ═══════════════════════════════════════════════════════════════════════════

interface SparklineChartProps {
  data: number[]
  color: string
  glowColor: string
}

export function SparklineChart({ data, color, glowColor }: SparklineChartProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 50 - ((v - min) / range) * 45
      return `${x},${y}`
    })
    .join(' L ')

  return (
    <svg className="h-full w-full" viewBox="0 0 100 60" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Area fill */}
      <motion.path
        d={`M 0,55 L ${points} L 100,55 Z`}
        fill={`url(#sparkGrad-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Line */}
      <motion.path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Endpoint dot */}
      <motion.circle
        cx={100}
        cy={50 - (((data[data.length - 1] ?? 0) - min) / range) * 45}
        r="4"
        fill={color}
        filter="url(#glow)"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔢 ANIMATED VALUE
// ═══════════════════════════════════════════════════════════════════════════

interface AnimatedValueProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}

export function AnimatedValue({ value, prefix = '', suffix = '', duration = 1500 }: AnimatedValueProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
      setDisplayValue(Math.floor(eased * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 🏷️ BADGE
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  enableGlow?: boolean
  enablePulse?: boolean
  className?: string
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  enableGlow = true,
  enablePulse = false,
  className,
}: BadgeProps) {
  const variants = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399', glow: 'rgba(16, 185, 129, 0.4)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', glow: 'rgba(245, 158, 11, 0.4)' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', glow: 'rgba(239, 68, 68, 0.4)' },
    info: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', glow: 'rgba(59, 130, 246, 0.4)' },
    neutral: { bg: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.2)' },
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const style = variants[variant]

  return (
    <motion.span
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold',
        'overflow-hidden border backdrop-blur-xl',
        sizeClasses[size],
        className,
      )}
      style={{
        background: style.bg,
        color: style.color,
        borderColor: style.color + '40',
        boxShadow: enableGlow ? `0 0 20px ${style.glow}` : undefined,
      }}
      whileHover={{ scale: 1.02 }}
    >
      {enablePulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: style.color }}
          animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.span>
  )
}

// Export legacy name
export const OmegaBadge = Badge;
export const OmegaGlassCard = GlassCard;

// ═══════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Export legacy OMEGA constant for compatibility
export const OMEGA = {
    ...DESIGN_SYSTEM,
    palettes: {
        ...DESIGN_SYSTEM.palettes,
        ventas: DESIGN_SYSTEM.palettes.sales,
        bancos: DESIGN_SYSTEM.palettes.banking,
        clientes: DESIGN_SYSTEM.palettes.clients,
        ordenes: DESIGN_SYSTEM.palettes.orders,
        gastos: DESIGN_SYSTEM.palettes.expenses,
        movimientos: DESIGN_SYSTEM.palettes.movements,
        distribuidores: DESIGN_SYSTEM.palettes.distributors,
        almacen: DESIGN_SYSTEM.palettes.inventory,
        ia: DESIGN_SYSTEM.palettes.ai,
        dashboard: DESIGN_SYSTEM.palettes.dashboard,
    },
    glass: {
        ...DESIGN_SYSTEM.glass,
        ultraDeep: DESIGN_SYSTEM.glass.deep,
        premium: DESIGN_SYSTEM.glass.standard,
    }
}
