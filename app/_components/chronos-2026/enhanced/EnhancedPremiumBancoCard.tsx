'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦⚡ ENHANCED PREMIUM BANCO CARD — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Card mejorado con TODAS las integraciones Supreme:
 * ✅ Sound Effects (click, hover)
 * ✅ Swipe Gestures (left/right para navegar entre bancos)
 * ✅ Pinch to Zoom
 * ✅ Long Press para opciones rápidas
 * ✅ Double Tap para vista rápida
 * ✅ Haptic Feedback
 * ✅ Theme-aware animations
 */

import { cn } from '@/app/_lib/utils'
import { useSoundManager } from '@/app/lib/audio/sound-system'
import {
  useDoubleTap,
  useLongPress,
  usePinchZoom,
  useSwipe,
} from '@/app/lib/gestures/advanced-gestures'
import { ArrowDownLeft, ArrowUpRight, Eye, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

interface BancoCardProps {
  id: string
  nombre: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  cambio: number
  color: string
  icono?: string
  onClick?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function EnhancedPremiumBancoCard({
  id,
  nombre,
  capitalActual,
  historicoIngresos,
  historicoGastos,
  cambio,
  color,
  icono,
  onClick,
  onSwipeLeft,
  onSwipeRight,
  className,
}: BancoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [scale, setScale] = useState(1)
  const { play } = useSoundManager()

  const cambioPositivo = cambio >= 0

  // ═════════════════════════════════════════════════════════════════════════════════════════════════
  // GESTURES SETUP
  // ═════════════════════════════════════════════════════════════════════════════════════════════════

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      play('swoosh')
      onSwipeLeft?.()
      toast.info('👈 Banco anterior')
    },
    onSwipeRight: () => {
      play('swoosh')
      onSwipeRight?.()
      toast.info('👉 Siguiente banco')
    },
    threshold: 80,
  })

  const pinchHandlers = usePinchZoom({
    onPinch: (newScale) => {
      setScale(newScale)
      if (newScale > 1.5) {
        play('pop')
      }
    },
    minScale: 0.8,
    maxScale: 2,
  })

  const longPressHandlers = useLongPress(
    () => {
      play('success')
      toast.success('⚡ Opciones rápidas', {
        description: 'Abrir menú contextual del banco',
        action: {
          label: 'Ver opciones',
          onClick: () => console.log('Opciones del banco:', id),
        },
      })
    },
    {
      delay: 600,
      onStart: () => {
        navigator.vibrate?.(20)
        play('softPop')
      },
    },
  )

  const doubleTapHandlers = useDoubleTap(
    () => {
      play('cardFlip')
      navigator.vibrate?.([10, 50, 10])
      toast.info('👁️ Vista rápida activada')
      onClick?.()
    },
    { delay: 300 },
  )

  // ═════════════════════════════════════════════════════════════════════════════════════════════════
  // MOUSE TRACKING
  // ═════════════════════════════════════════════════════════════════════════════════════════════════

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }, [])

  const handleClick = useCallback(() => {
    play('click')
    navigator.vibrate?.(5)
    onClick?.()
  }, [play, onClick])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    play('hover')
  }, [play])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setScale(1)
  }, [])

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      {...swipeHandlers}
      {...pinchHandlers}
      {...longPressHandlers}
      {...doubleTapHandlers}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl p-6',
        'border border-white/10 bg-white/5 backdrop-blur-xl',
        'transition-all duration-500',
        'hover:border-white/20 hover:bg-white/10',
        'hover:shadow-2xl',
        'focus:ring-2 focus:ring-offset-2 focus:outline-none',
        'touch-pan-y', // Importante para gestures móviles
        className,
      )}
      style={{
        boxShadow: isHovered
          ? `0 20px 50px ${color}40, 0 0 80px ${color}20, inset 0 1px 1px rgba(255,255,255,0.1)`
          : '0 8px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
        transform: `scale(${scale})`,
      }}
      whileHover={{ scale: scale * 1.03, y: -8 }}
      whileTap={{ scale: scale * 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* ═════════════ AURORA ORB ═════════════ */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, ${color}40, transparent 40%)`,
        }}
        animate={{
          opacity: isHovered ? [0.3, 0.5, 0.3] : 0,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ═════════════ SHIMMER EFFECT ═════════════ */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        }}
      />

      {/* ═════════════ SCAN LINE ═════════════ */}
      <motion.div
        className="pointer-events-none absolute right-0 left-0 h-[2px] opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          top: `${mousePosition.y}%`,
        }}
        animate={{
          scaleX: isHovered ? [0, 1, 0] : 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* ═════════════ CONTENT ═════════════ */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{nombre}</h3>
            <p className="text-sm text-gray-400">ID: {id.substring(0, 8)}</p>
          </div>
          <motion.div
            className="rounded-xl bg-white/10 p-3 backdrop-blur-sm"
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <Eye className="h-5 w-5" style={{ color }} />
          </motion.div>
        </div>

        {/* Capital Actual */}
        <div className="mb-6">
          <p className="mb-1 text-xs text-gray-400">Capital Actual</p>
          <motion.p
            className="text-3xl font-bold text-white"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ${capitalActual.toLocaleString('es-MX')}
          </motion.p>
          <div className="mt-2 flex items-center gap-2">
            {cambioPositivo ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                cambioPositivo ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {cambioPositivo ? '+' : ''}
              {cambio.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/5 p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-gray-400">Ingresos</span>
            </div>
            <p className="text-sm font-bold text-white">
              ${historicoIngresos.toLocaleString('es-MX')}
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-red-400" />
              <span className="text-xs text-gray-400">Gastos</span>
            </div>
            <p className="text-sm font-bold text-white">
              ${historicoGastos.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Gesture Hints */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Zap className="h-3 w-3" />
          <span>Swipe · Pinch · Long press · Double tap</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
