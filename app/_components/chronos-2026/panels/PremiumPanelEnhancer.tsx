/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS PREMIUM PANEL ENHANCER — 2026 SUPREME EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes premium para elevar cualquier panel con efectos 3D ultra-avanzados:
 * - Backgrounds interactivos con partículas
 * - Efectos de fluidos reactivos
 * - Glassmorphism Gen6 con shaders
 * - Micro-animaciones cinematográficas
 * - Post-processing integrado
 *
 * USO: Wrap cualquier panel existente para elevar su diseño sin romper lógica
 *
 * @version ENHANCER 2026.1
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { memo, Suspense, useCallback, useMemo, useRef, useState } from 'react'

// Premium 3D imports
import { AmbientParticles, InstancedParticles, type ParticlePreset } from '../3d/premium'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PREMIUM DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PREMIUM_THEME = {
  colors: {
    void: '#030305',
    violet: '#8B00FF',
    violetGlow: 'rgba(139, 0, 255, 0.3)',
    gold: '#FFD700',
    goldGlow: 'rgba(255, 215, 0, 0.3)',
    plasma: '#FF1493',
    plasmaGlow: 'rgba(255, 20, 147, 0.3)',
    emerald: '#00FF88',
    emeraldGlow: 'rgba(0, 255, 136, 0.3)',
  },
  glass: {
    tier1: 'rgba(255, 255, 255, 0.03)',
    tier2: 'rgba(255, 255, 255, 0.05)',
    tier3: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
  },
  blur: {
    subtle: '12px',
    medium: '24px',
    heavy: '40px',
    extreme: '60px',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 PREMIUM PANEL WRAPPER — Envuelve cualquier panel con efectos 3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumPanelWrapperProps {
  children: React.ReactNode
  className?: string
  particlePreset?: ParticlePreset
  showParticles?: boolean
  showAmbient?: boolean
  glowColor?: 'violet' | 'gold' | 'plasma' | 'emerald'
  intensity?: 'subtle' | 'medium' | 'intense'
  interactive?: boolean
}

export const PremiumPanelWrapper = memo(function PremiumPanelWrapper({
  children,
  className,
  particlePreset = 'quantum',
  showParticles = false, // DESHABILITADO - WebGL shaders tienen errores de compilación
  showAmbient = true,
  glowColor = 'violet',
  intensity = 'medium',
  interactive = true,
}: PremiumPanelWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics para movimiento suave
  const springConfig = { stiffness: 150, damping: 20 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // Transforms para efectos parallax
  const rotateX = useTransform(y, [-0.5, 0.5], [2, -2])
  const rotateY = useTransform(x, [-0.5, 0.5], [-2, 2])
  const glowX = useTransform(x, [-0.5, 0.5], ['40%', '60%'])
  const glowY = useTransform(y, [-0.5, 0.5], ['40%', '60%'])

  // Intensidad del glow
  const glowIntensity = useMemo(() => {
    switch (intensity) {
      case 'subtle':
        return 0.15
      case 'intense':
        return 0.4
      default:
        return 0.25
    }
  }, [intensity])

  // Color del glow
  const glowColorValue = useMemo(() => {
    switch (glowColor) {
      case 'gold':
        return PREMIUM_THEME.colors.goldGlow
      case 'plasma':
        return PREMIUM_THEME.colors.plasmaGlow
      case 'emerald':
        return PREMIUM_THEME.colors.emeraldGlow
      default:
        return PREMIUM_THEME.colors.violetGlow
    }
  }, [glowColor])

  // Mouse tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !interactive) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set((e.clientX - centerX) / rect.width)
      mouseY.set((e.clientY - centerY) / rect.height)
    },
    [mouseX, mouseY, interactive],
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'border border-white/[0.08] hover:border-white/[0.15]',
        'bg-white/[0.015]',
        'backdrop-blur-sm transition-colors duration-500',
        className,
      )}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, ${glowColorValue} 0%, transparent 50%)`,
          opacity: isHovered ? glowIntensity : 0,
        }}
        animate={{ opacity: isHovered ? glowIntensity : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* 3D Particles Background */}
      {showParticles && (
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 10], fov: 50 }}
            gl={{ antialias: false, alpha: true }}
          >
            <Suspense fallback={null}>
              <InstancedParticles
                preset={particlePreset}
                config={{
                  count: intensity === 'intense' ? 20000 : intensity === 'medium' ? 10000 : 5000,
                }}
                interactive={interactive}
              />
              {showAmbient && (
                <AmbientParticles
                  count={500}
                  color={PREMIUM_THEME.colors[glowColor]}
                  opacity={0.4}
                  spread={15}
                />
              )}
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Shimmer effect on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: isHovered ? ['0% 0%', '100% 100%'] : '0% 0%',
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: isHovered ? Infinity : 0,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Border glow on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              boxShadow: `inset 0 0 30px ${glowColorValue}, 0 0 60px ${glowColorValue.replace('0.3', '0.15')}`,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎴 PREMIUM KPI CARD — Cards de métricas ultra-premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumKPICardProps {
  title: string
  value: string | number
  subtitle?: string
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  color?: 'violet' | 'gold' | 'plasma' | 'emerald' | 'white'
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  onClick?: () => void
}

export const PremiumKPICard = memo(function PremiumKPICard({
  title,
  value,
  subtitle,
  delta,
  deltaLabel,
  icon,
  color = 'violet',
  trend,
  className,
  onClick,
}: PremiumKPICardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const colorClasses = useMemo(() => {
    switch (color) {
      case 'gold':
        return { text: 'text-amber-400', glow: 'shadow-amber-500/20', bg: 'from-amber-500/10' }
      case 'plasma':
        return { text: 'text-pink-400', glow: 'shadow-pink-500/20', bg: 'from-pink-500/10' }
      case 'emerald':
        return {
          text: 'text-emerald-400',
          glow: 'shadow-emerald-500/20',
          bg: 'from-emerald-500/10',
        }
      case 'white':
        return { text: 'text-white', glow: 'shadow-white/10', bg: 'from-white/5' }
      default:
        return { text: 'text-violet-400', glow: 'shadow-violet-500/20', bg: 'from-violet-500/10' }
    }
  }, [color])

  const trendIcon = useMemo(() => {
    if (!trend || trend === 'neutral') return null
    return trend === 'up' ? '↑' : '↓'
  }, [trend])

  return (
    <motion.div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl p-6',
        'border border-white/[0.06] hover:border-white/[0.12]',
        'bg-white/[0.015]',
        'backdrop-blur-sm transition-all duration-500',
        isHovered && `shadow-2xl ${colorClasses.glow}`,
        className,
      )}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          colorClasses.bg,
        )}
      />

      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'mb-4 w-fit rounded-xl p-3',
            'bg-white/[0.05] group-hover:bg-white/[0.08]',
            'transition-colors duration-300',
            colorClasses.text,
          )}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <p className="mb-1 text-sm font-medium text-white/60">{title}</p>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <motion.span
          className={cn('text-3xl font-bold', colorClasses.text)}
          initial={false}
          animate={{ scale: isHovered ? 1.05 : 1 }}
        >
          {value}
        </motion.span>

        {delta !== undefined && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-sm font-semibold',
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-400'
                : trend === 'down'
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-white/5 text-white/60',
            )}
          >
            {trendIcon} {Math.abs(delta)}%
          </span>
        )}
      </div>

      {/* Subtitle / Delta Label */}
      {(subtitle || deltaLabel) && (
        <p className="mt-2 text-xs text-white/40">{subtitle || deltaLabel}</p>
      )}

      {/* Hover shine effect */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
        }}
        animate={{
          x: isHovered ? ['0%', '100%'] : '0%',
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 PREMIUM CHART WRAPPER — Envuelve charts con efectos premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumChartWrapperProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  glowColor?: 'violet' | 'gold' | 'plasma' | 'emerald'
  loading?: boolean
}

export const PremiumChartWrapper = memo(function PremiumChartWrapper({
  children,
  title,
  subtitle,
  className,
  glowColor = 'violet',
  loading = false,
}: PremiumChartWrapperProps) {
  const glowColorValue = useMemo(() => {
    switch (glowColor) {
      case 'gold':
        return 'from-amber-500/5'
      case 'plasma':
        return 'from-pink-500/5'
      case 'emerald':
        return 'from-emerald-500/5'
      default:
        return 'from-violet-500/5'
    }
  }, [glowColor])

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'border border-white/[0.06]',
        'bg-white/[0.015]',
        'backdrop-blur-sm',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white/90">{title}</h3>}
          {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
        </div>
      )}

      {/* Content / Loading */}
      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        </div>
      ) : (
        <div className="relative">
          {children}

          {/* Bottom glow */}
          <div
            className={cn(
              'pointer-events-none absolute right-0 bottom-0 left-0 h-1/3',
              'bg-gradient-to-t to-transparent',
              glowColorValue,
            )}
          />
        </div>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 PREMIUM TABLE WRAPPER — Tables con infinite scroll y efectos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumTableWrapperProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  maxHeight?: string
  showScrollIndicator?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export const PremiumTableWrapper = memo(function PremiumTableWrapper({
  children,
  title,
  subtitle,
  className,
  maxHeight = '400px',
  showScrollIndicator = true,
  onLoadMore,
  hasMore = false,
  loading = false,
}: PremiumTableWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const progress = scrollTop / (scrollHeight - clientHeight)
    setScrollProgress(progress)

    // Load more when near bottom
    if (progress > 0.8 && hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore])

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'border border-white/[0.06]',
        'bg-white/[0.015]',
        'backdrop-blur-sm',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="border-b border-white/[0.06] p-4">
          {title && <h3 className="text-lg font-semibold text-white/90">{title}</h3>}
          {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
        </div>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="custom-scrollbar overflow-y-auto"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        {children}

        {/* Load more indicator */}
        {loading && (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          </div>
        )}
      </div>

      {/* Scroll progress indicator */}
      {showScrollIndicator && (
        <div className="absolute top-16 right-2 bottom-2 w-1 rounded-full bg-white/5">
          <motion.div
            className="w-full rounded-full bg-gradient-to-b from-violet-500 to-pink-500"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      )}

      {/* Bottom fade */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-black/20 to-transparent" />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ PREMIUM SECTION DIVIDER — Separador elegante entre secciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumSectionDividerProps {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  color?: 'violet' | 'gold' | 'plasma' | 'emerald'
  className?: string
}

export const PremiumSectionDivider = memo(function PremiumSectionDivider({
  title,
  subtitle,
  icon,
  color = 'violet',
  className,
}: PremiumSectionDividerProps) {
  const colorClasses = useMemo(() => {
    switch (color) {
      case 'gold':
        return 'from-amber-500/50 via-amber-500/20'
      case 'plasma':
        return 'from-pink-500/50 via-pink-500/20'
      case 'emerald':
        return 'from-emerald-500/50 via-emerald-500/20'
      default:
        return 'from-violet-500/50 via-violet-500/20'
    }
  }, [color])

  return (
    <div className={cn('py-6', className)}>
      <div className="flex items-center gap-4">
        {/* Left line */}
        <div className={cn('h-px flex-1 bg-gradient-to-r to-transparent', colorClasses)} />

        {/* Center content */}
        {(title || icon) && (
          <div className="flex items-center gap-2 px-4">
            {icon}
            <div>
              {title && <span className="text-sm font-medium text-white/70">{title}</span>}
              {subtitle && <span className="ml-2 text-xs text-white/40">{subtitle}</span>}
            </div>
          </div>
        )}

        {/* Right line */}
        <div className={cn('h-px flex-1 bg-gradient-to-l to-transparent', colorClasses)} />
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 PREMIUM LOADING STATE — Estado de carga cinematográfico
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumLoadingProps {
  text?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const PremiumLoading = memo(function PremiumLoading({
  text = 'Cargando...',
  className,
  size = 'md',
}: PremiumLoadingProps) {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-12 h-12'
      default:
        return 'w-8 h-8'
    }
  }, [size])

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
      {/* Orb loader */}
      <div className="relative">
        <motion.div
          className={cn('rounded-full bg-gradient-to-r from-violet-500 to-pink-500', sizeClasses)}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={cn('absolute inset-0 rounded-full border-2 border-violet-500/30', sizeClasses)}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Text */}
      <motion.p
        className="text-sm text-white/50"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default PremiumPanelWrapper
