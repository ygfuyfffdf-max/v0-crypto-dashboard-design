'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 AURORA INTEGRATION — COMPONENTES PREMIUM INTEGRADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Integración perfecta de todos los componentes premium:
 * - AuroraGlassSystem base mejorado
 * - MicroInteractions avanzadas
 * - CinematicTransitions fluidas
 * - AdvancedBackgrounds inmersivos
 *
 * EXPORTS:
 * - AuroraPremiumCard: Card con efectos magnéticos + holográficos
 * - AuroraPremiumButton: Botón con efectos líquidos + magnéticos
 * - AuroraPremiumPanel: Panel con transiciones cinematográficas
 * - AuroraPremiumBackground: Fondo con aurora + nebulas + partículas
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { forwardRef, ReactNode, useCallback, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PALETA PREMIUM COMPLETA (independiente para evitar problemas de tipos)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Tipo base para colores
interface ColorConfig {
  primary: string
  light: string
  dark: string
  glow: string
  aurora: string
}

const PREMIUM_PALETTE: Record<string, ColorConfig> = {
  violet: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    dark: '#6D28D9',
    glow: 'rgba(139, 92, 246, 0.5)',
    aurora: 'rgba(139, 92, 246, 0.25)',
  },
  cyan: {
    primary: '#06B6D4',
    light: '#22D3EE',
    dark: '#0891B2',
    glow: 'rgba(6, 182, 212, 0.5)',
    aurora: 'rgba(6, 182, 212, 0.25)',
  },
  magenta: {
    primary: '#EC4899',
    light: '#F472B6',
    dark: '#DB2777',
    glow: 'rgba(236, 72, 153, 0.5)',
    aurora: 'rgba(236, 72, 153, 0.25)',
  },
  emerald: {
    primary: '#10B981',
    light: '#34D399',
    dark: '#059669',
    glow: 'rgba(16, 185, 129, 0.5)',
    aurora: 'rgba(16, 185, 129, 0.25)',
  },
  gold: {
    primary: '#FBBF24',
    light: '#FCD34D',
    dark: '#F59E0B',
    glow: 'rgba(251, 191, 36, 0.5)',
    aurora: 'rgba(251, 191, 36, 0.25)',
  },
  quantum: {
    primary: '#9333EA',
    light: '#A855F7',
    dark: '#7E22CE',
    glow: 'rgba(147, 51, 234, 0.5)',
    aurora: 'rgba(147, 51, 234, 0.25)',
  },
  plasma: {
    primary: '#F43F5E',
    light: '#FB7185',
    dark: '#E11D48',
    glow: 'rgba(244, 63, 94, 0.5)',
    aurora: 'rgba(244, 63, 94, 0.25)',
  },
  cosmic: {
    primary: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    glow: 'rgba(59, 130, 246, 0.5)',
    aurora: 'rgba(59, 130, 246, 0.25)',
  },
}

// Helper para obtener color con fallback
const DEFAULT_COLOR: ColorConfig = {
  primary: '#8B5CF6',
  light: '#A78BFA',
  dark: '#6D28D9',
  glow: 'rgba(139, 92, 246, 0.5)',
  aurora: 'rgba(139, 92, 246, 0.25)',
}

function getColor(key: string): ColorConfig {
  return PREMIUM_PALETTE[key] ?? DEFAULT_COLOR
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💎 AURORA PREMIUM CARD — Card Ultra-Premium con todos los efectos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type PremiumColorKey = keyof typeof PREMIUM_PALETTE

interface AuroraPremiumCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  variant?: 'glass' | 'holographic' | 'neon' | 'minimal'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  enableMagnetic?: boolean
  enableTilt?: boolean
  enableHolographic?: boolean
  enableParticles?: boolean
  enableGlowPulse?: boolean
  onClick?: () => void
}

export const AuroraPremiumCard = forwardRef<HTMLDivElement, AuroraPremiumCardProps>(
  (
    {
      children,
      className,
      glowColor = 'violet',
      variant = 'glass',
      size = 'md',
      enableMagnetic = true,
      enableTilt = true,
      enableHolographic = false,
      enableParticles = false,
      enableGlowPulse = true,
      onClick,
    },
    _ref,
  ) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

    // Motion values para tilt
    const rotateX = useMotionValue(0)
    const rotateY = useMotionValue(0)
    const springConfig = { stiffness: 400, damping: 25 }
    const smoothRotateX = useSpring(rotateX, springConfig)
    const smoothRotateY = useSpring(rotateY, springConfig)

    // Motion values para efecto magnético
    const magneticX = useMotionValue(0)
    const magneticY = useMotionValue(0)
    const smoothMagneticX = useSpring(magneticX, { stiffness: 150, damping: 20 })
    const smoothMagneticY = useSpring(magneticY, { stiffness: 150, damping: 20 })

    // Shine effect
    const shineX = useMotionValue(50)
    const shineY = useMotionValue(50)

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        setMousePosition({ x, y })

        // Tilt effect
        if (enableTilt) {
          rotateX.set((y - 0.5) * 15)
          rotateY.set(-(x - 0.5) * 15)
        }

        // Magnetic effect
        if (enableMagnetic) {
          magneticX.set((x - 0.5) * 20)
          magneticY.set((y - 0.5) * 20)
        }

        // Shine position
        shineX.set(x * 100)
        shineY.set(y * 100)
      },
      [enableTilt, enableMagnetic, rotateX, rotateY, magneticX, magneticY, shineX, shineY],
    )

    const handleMouseLeave = useCallback(() => {
      rotateX.set(0)
      rotateY.set(0)
      magneticX.set(0)
      magneticY.set(0)
      setIsHovered(false)
    }, [rotateX, rotateY, magneticX, magneticY])

    const color = getColor(glowColor)

    // Variant styles
    const variantStyles = {
      glass: 'bg-white/[0.03] backdrop-blur-xl border-white/[0.08]',
      holographic:
        'bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-white/[0.06] backdrop-blur-xl border-white/[0.12]',
      neon: 'bg-black/40 backdrop-blur-lg border-2',
      minimal: 'bg-white/[0.02] backdrop-blur-sm border-white/[0.05]',
    }

    // Size styles
    const sizeStyles = {
      sm: 'rounded-xl p-3',
      md: 'rounded-2xl p-4',
      lg: 'rounded-2xl p-6',
      xl: 'rounded-3xl p-8',
    }

    return (
      <motion.div
        ref={cardRef}
        className={cn(
          'relative overflow-hidden border transition-colors duration-300',
          variantStyles[variant],
          sizeStyles[size],
          onClick && 'cursor-pointer',
          className,
        )}
        style={{
          rotateX: enableTilt ? smoothRotateX : 0,
          rotateY: enableTilt ? smoothRotateY : 0,
          x: enableMagnetic ? smoothMagneticX : 0,
          y: enableMagnetic ? smoothMagneticY : 0,
          transformPerspective: 1200,
          transformStyle: 'preserve-3d',
          borderColor: variant === 'neon' ? color.primary : undefined,
          boxShadow:
            variant === 'neon' && isHovered
              ? `0 0 30px ${color.glow}, 0 0 60px ${color.aurora}, inset 0 0 20px ${color.aurora}`
              : undefined,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      >
        {/* Holographic shimmer */}
        {enableHolographic && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background: `
                linear-gradient(
                  ${mousePosition.x * 360}deg,
                  transparent 0%,
                  rgba(139, 92, 246, 0.1) 25%,
                  rgba(6, 182, 212, 0.1) 50%,
                  rgba(236, 72, 153, 0.1) 75%,
                  transparent 100%
                )
              `,
            }}
            animate={{ opacity: isHovered ? 0.8 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Glow pulse effect */}
        {enableGlowPulse && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${color.glow} 0%, transparent 70%)`,
            }}
            animate={{
              opacity: isHovered ? [0.3, 0.5, 0.3] : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Shine reflection */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: useTransform(
              [shineX, shineY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)`,
            ),
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Border glow on hover */}
        <motion.div
          className="rounded-inherit pointer-events-none absolute inset-0"
          style={{
            boxShadow: `inset 0 0 40px ${color.aurora}`,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Mini particles on hover */}
        {enableParticles && isHovered && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full"
                style={{
                  backgroundColor: color.light,
                  left: `${mousePosition.x * 100}%`,
                  top: `${mousePosition.y * 100}%`,
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                  opacity: [1, 0],
                  scale: [0, 1.5],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>
      </motion.div>
    )
  },
)

AuroraPremiumCard.displayName = 'AuroraPremiumCard'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ AURORA PREMIUM BUTTON — Botón con efectos líquidos y magnéticos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraPremiumButtonProps {
  children: ReactNode
  className?: string
  variant?: 'solid' | 'outline' | 'ghost' | 'liquid'
  color?: string
  size?: 'sm' | 'md' | 'lg'
  enableMagnetic?: boolean
  enableRipple?: boolean
  enableGlow?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export const AuroraPremiumButton = forwardRef<HTMLButtonElement, AuroraPremiumButtonProps>(
  (
    {
      children,
      className,
      variant = 'solid',
      color = 'violet',
      size = 'md',
      enableMagnetic = true,
      enableRipple = true,
      enableGlow = true,
      disabled = false,
      loading = false,
      onClick,
      type = 'button',
    },
    _ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

    // Magnetic effect
    const magneticX = useMotionValue(0)
    const magneticY = useMotionValue(0)
    const smoothX = useSpring(magneticX, { stiffness: 200, damping: 20 })
    const smoothY = useSpring(magneticY, { stiffness: 200, damping: 20 })

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!enableMagnetic || !buttonRef.current || disabled) return
        const rect = buttonRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        magneticX.set(x * 0.3)
        magneticY.set(y * 0.3)
      },
      [enableMagnetic, disabled, magneticX, magneticY],
    )

    const handleMouseLeave = useCallback(() => {
      magneticX.set(0)
      magneticY.set(0)
      setIsHovered(false)
    }, [magneticX, magneticY])

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return

        // Ripple effect
        if (enableRipple && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          const id = Date.now()
          setRipples((prev) => [...prev, { x, y, id }])
          setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id))
          }, 600)
        }

        onClick?.()
      },
      [disabled, loading, enableRipple, onClick],
    )

    const colorConfig = getColor(color)

    // Size styles
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
    }

    return (
      <motion.button
        ref={buttonRef}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden font-medium transition-all duration-300',
          'focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none',
          disabled && 'cursor-not-allowed opacity-50',
          sizeStyles[size],
          className,
        )}
        style={{
          x: smoothX,
          y: smoothY,
          background:
            variant === 'solid' || variant === 'liquid'
              ? `linear-gradient(135deg, ${colorConfig.dark} 0%, ${colorConfig.primary} 50%, ${colorConfig.light} 100%)`
              : variant === 'outline'
                ? 'transparent'
                : 'rgba(255, 255, 255, 0.05)',
          borderColor: variant === 'outline' ? colorConfig.primary : 'transparent',
          borderWidth: variant === 'outline' ? 2 : 0,
          color: variant === 'outline' || variant === 'ghost' ? colorConfig.light : 'white',
          boxShadow: enableGlow && isHovered ? `0 0 30px ${colorConfig.glow}` : 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        {/* Liquid blob effect */}
        {variant === 'liquid' && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${isHovered ? '100%' : '0%'} 50%, ${colorConfig.light} 0%, transparent 60%)`,
            }}
            animate={{ x: isHovered ? '0%' : '-100%' }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Glow layer */}
        {enableGlow && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${colorConfig.glow} 0%, transparent 100%)`,
            }}
            animate={{ opacity: isHovered ? 0.3 : 0 }}
          />
        )}

        {/* Ripples */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 10,
              height: 10,
              marginLeft: -5,
              marginTop: -5,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 20, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.span>
        )}

        {/* Content */}
        <span className={cn('relative z-10', loading && 'opacity-0')}>{children}</span>
      </motion.button>
    )
  },
)

AuroraPremiumButton.displayName = 'AuroraPremiumButton'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 AURORA PREMIUM BACKGROUND — Fondo inmersivo completo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraPremiumBackgroundProps {
  children?: ReactNode
  className?: string
  variant?: 'cosmic' | 'nebula' | 'aurora' | 'minimal'
  enableParticles?: boolean
  enableGradientAnimation?: boolean
  enableMouseInteraction?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

export function AuroraPremiumBackground({
  children,
  className,
  variant = 'cosmic',
  enableParticles = true,
  enableGradientAnimation = true,
  enableMouseInteraction = true,
  intensity = 'medium',
}: AuroraPremiumBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 30, damping: 15 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Pre-compute transforms at component level
  const transformX = useTransform(smoothX, [0, 1], [-30, 30])
  const transformY = useTransform(smoothY, [0, 1], [-30, 30])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enableMouseInteraction || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [enableMouseInteraction, mouseX, mouseY],
  )

  const opacityMap = { low: 0.3, medium: 0.5, high: 0.7 }
  const baseOpacity = opacityMap[intensity]

  // Variant configurations
  const variantConfig = {
    cosmic: {
      colors: ['violet', 'cyan', 'magenta'] as const,
      blur: 150,
    },
    nebula: {
      colors: ['quantum', 'plasma', 'cosmic'] as const,
      blur: 200,
    },
    aurora: {
      colors: ['emerald', 'cyan', 'violet'] as const,
      blur: 180,
    },
    minimal: {
      colors: ['violet'] as const,
      blur: 250,
    },
  }

  const config = variantConfig[variant]

  // Memoize blob configs
  const blobConfigs = useMemo(
    () =>
      config.colors.map((colorKey: string, i: number) => ({
        colorKey,
        color: getColor(colorKey),
        index: i,
      })),
    [config.colors],
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-[#030308]', className)}
      onMouseMove={handleMouseMove}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#030308] to-gray-900" />

      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {blobConfigs.map((item: { colorKey: string; color: ColorConfig; index: number }) => (
          <motion.div
            key={item.colorKey}
            className="absolute rounded-full"
            style={{
              width: '50%',
              height: '50%',
              background: `radial-gradient(circle, ${item.color.glow} 0%, transparent 70%)`,
              filter: `blur(${config.blur}px)`,
              opacity: baseOpacity,
              x: transformX,
              y: transformY,
            }}
            animate={
              enableGradientAnimation
                ? {
                    left: [
                      `${20 + item.index * 20}%`,
                      `${30 + item.index * 20}%`,
                      `${20 + item.index * 20}%`,
                    ],
                    top: [
                      `${20 + item.index * 15}%`,
                      `${30 + item.index * 15}%`,
                      `${20 + item.index * 15}%`,
                    ],
                    scale: [1, 1.2, 1],
                  }
                : undefined
            }
            transition={{
              duration: 10 + item.index * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.index * 2,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      {enableParticles && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}

      {/* Mesh gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(at 40% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            radial-gradient(at 0% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(at 80% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 AURORA PANEL TRANSITION — Transiciones de panel cinematográficas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraPanelTransitionProps {
  children: ReactNode
  isVisible: boolean
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade' | 'scale' | 'blur'
  duration?: number
  delay?: number
  className?: string
}

export function AuroraPanelTransition({
  children,
  isVisible,
  direction = 'fade',
  duration = 0.5,
  delay = 0,
  className,
}: AuroraPanelTransitionProps) {
  const variants = {
    left: {
      hidden: { x: -100, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 },
    },
    right: {
      hidden: { x: 100, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 },
    },
    up: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: -50, opacity: 0 },
    },
    down: {
      hidden: { y: -50, opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: 50, opacity: 0 },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
    blur: {
      hidden: { filter: 'blur(10px)', opacity: 0 },
      visible: { filter: 'blur(0px)', opacity: 1 },
      exit: { filter: 'blur(10px)', opacity: 0 },
    },
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          variants={variants[direction]}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ AURORA GLOW TEXT — Texto con efecto glow premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraGlowTextProps {
  children: ReactNode
  className?: string
  color?: PremiumColorKey
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  enableGradient?: boolean
  enableGlow?: boolean
  enableAnimation?: boolean
}

export function AuroraGlowText({
  children,
  className,
  color = 'violet',
  as: Component = 'span',
  enableGradient = true,
  enableGlow = true,
  enableAnimation = false,
}: AuroraGlowTextProps) {
  const colorConfig = getColor(color)

  return (
    <motion.span
      className={cn('relative inline-block', className)}
      animate={
        enableAnimation
          ? {
              textShadow: [
                `0 0 10px ${colorConfig.glow}`,
                `0 0 20px ${colorConfig.glow}`,
                `0 0 10px ${colorConfig.glow}`,
              ],
            }
          : undefined
      }
      transition={enableAnimation ? { duration: 2, repeat: Infinity } : undefined}
    >
      <Component
        className={cn(
          enableGradient && 'bg-clip-text text-transparent',
          enableGradient && `bg-gradient-to-r from-${color}-300 via-white to-${color}-300`,
        )}
        style={{
          background: enableGradient
            ? `linear-gradient(90deg, ${colorConfig.light} 0%, white 50%, ${colorConfig.light} 100%)`
            : undefined,
          WebkitBackgroundClip: enableGradient ? 'text' : undefined,
          WebkitTextFillColor: enableGradient ? 'transparent' : undefined,
          textShadow: enableGlow ? `0 0 30px ${colorConfig.glow}` : undefined,
        }}
      >
        {children}
      </Component>
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { PREMIUM_PALETTE }
