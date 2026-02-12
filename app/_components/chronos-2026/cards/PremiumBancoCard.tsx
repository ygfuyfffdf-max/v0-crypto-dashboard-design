'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦✨ PREMIUM BANCO CARD — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Card ultra premium para mostrar información de un banco con efectos 3D y glassmorphism GEN5
 */

import { cn } from '@/app/_lib/utils'
import { ArrowDownLeft, ArrowUpRight, Eye, TrendingDown, TrendingUp } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useState } from 'react'

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
  className?: string
}

export function PremiumBancoCard({
  nombre,
  capitalActual,
  historicoIngresos,
  historicoGastos,
  cambio,
  color,
  icono,
  onClick,
  className,
}: BancoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const cambioPositivo = cambio >= 0

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }, [])

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl p-6',
        'border border-white/10 bg-white/5 backdrop-blur-xl',
        'transition-all duration-500',
        'hover:border-white/20 hover:bg-white/10',
        'hover:shadow-2xl',
        'focus:ring-2 focus:ring-offset-2 focus:outline-none',
        className,
      )}
      style={{
        boxShadow: isHovered
          ? `0 20px 50px ${color}40, 0 0 80px ${color}20, inset 0 1px 1px rgba(255,255,255,0.1)`
          : '0 8px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
        focusRingColor: color,
      }}
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, ${color}25, transparent 60%)`,
        }}
      />

      {/* Aurora Orb */}
      <motion.div
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          scale: isHovered ? [1, 1.3, 1] : 1,
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 4,
          repeat: isHovered ? Infinity : 0,
          ease: 'linear',
        }}
      />

      {/* Shimmer Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
        animate={{
          x: isHovered ? ['0%', '200%'] : '0%',
        }}
        transition={{
          duration: 1.5,
          repeat: isHovered ? Infinity : 0,
          ease: 'linear',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
              boxShadow: `0 8px 25px ${color}40`,
            }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-lg font-bold">{icono || nombre[0]}</span>
          </motion.div>

          {/* Name */}
          <div>
            <h3 className="text-lg font-bold text-white">{nombre}</h3>
            <p className="text-xs text-white/40">Banco Operativo</p>
          </div>
        </div>

        {/* View Button */}
        <motion.button
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          <Eye size={16} />
        </motion.button>
      </div>

      {/* Capital Amount */}
      <div className="relative z-10 mb-4">
        <p className="text-xs text-white/50">Capital Actual</p>
        <div className="mt-1 flex items-end gap-3">
          <motion.p
            className="text-3xl font-bold text-white"
            animate={{
              textShadow: isHovered ? `0 0 20px ${color}60` : '0 0 0px transparent',
            }}
          >
            ${(capitalActual / 1000).toFixed(1)}K
          </motion.p>
          <div
            className={cn(
              'mb-1 flex items-center gap-1 text-xs font-medium',
              cambioPositivo ? 'text-emerald-400' : 'text-red-400',
            )}
          >
            {cambioPositivo ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(cambio).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        <motion.div
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3"
          whileHover={{ scale: 1.02, borderColor: 'rgba(16,185,129,0.4)' }}
        >
          <div className="mb-1 flex items-center gap-1 text-xs text-emerald-400/70">
            <ArrowUpRight size={12} />
            <span>Ingresos</span>
          </div>
          <p className="text-sm font-bold text-emerald-400">
            ${(historicoIngresos / 1000).toFixed(1)}K
          </p>
        </motion.div>

        <motion.div
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-3"
          whileHover={{ scale: 1.02, borderColor: 'rgba(239,68,68,0.4)' }}
        >
          <div className="mb-1 flex items-center gap-1 text-xs text-red-400/70">
            <ArrowDownLeft size={12} />
            <span>Gastos</span>
          </div>
          <p className="text-sm font-bold text-red-400">${(historicoGastos / 1000).toFixed(1)}K</p>
        </motion.div>
      </div>

      {/* Hover Indicator */}
      <motion.div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-1"
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Click Ripple Effect */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${color}20, transparent 50%)`,
          }}
        />
      )}
    </motion.div>
  )
}

