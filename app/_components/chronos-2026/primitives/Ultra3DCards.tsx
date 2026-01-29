/**
 * 🎆 ULTRA 3D CARDS - COMPONENTES 2D CON APARIENCIA 3D
 * ═══════════════════════════════════════════════════════════════════════════
 * Tarjetas con perspectiva 3D, iluminación dinámica y efectos holográficos
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Truck,
  BarChart3,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface HolographicCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon?: React.ReactNode
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'rose'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  onClick?: () => void
  className?: string
}

export interface GlassMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon?: React.ReactNode
  sparklineData?: number[]
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'rose'
  className?: string
}

export interface FloatingStatProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  color?: string
  delay?: number
}

// ═══════════════════════════════════════════════════════════════════════════
// COLORES
// ═══════════════════════════════════════════════════════════════════════════

const colorMap = {
  purple: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    bg: 'rgba(139, 92, 246, 0.1)',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    bg: 'rgba(59, 130, 246, 0.1)',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  green: {
    primary: '#10B981',
    secondary: '#34D399',
    bg: 'rgba(16, 185, 129, 0.1)',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  orange: {
    primary: '#F97316',
    secondary: '#FB923C',
    bg: 'rgba(249, 115, 22, 0.1)',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  pink: {
    primary: '#EC4899',
    secondary: '#F472B6',
    bg: 'rgba(236, 72, 153, 0.1)',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  rose: {
    primary: '#E11D48',
    secondary: '#FB7185',
    bg: 'rgba(225, 29, 72, 0.1)',
    glow: 'rgba(225, 29, 72, 0.4)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC CARD - Tarjeta con efecto holográfico 3D
// ═══════════════════════════════════════════════════════════════════════════

export function HolographicCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'purple',
  size = 'md',
  animated = true,
  onClick,
  className = '',
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values para efecto 3D
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Springs suavizados
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  })
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), {
    stiffness: 300,
    damping: 30,
  })
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), {
    stiffness: 300,
    damping: 30,
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current || !animated) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY, animated],
  )

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  const colors = colorMap[color]
  const sizeClasses = {
    sm: 'p-4 min-h-[100px]',
    md: 'p-5 min-h-[140px]',
    lg: 'p-6 min-h-[180px]',
  }

  const valueSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative cursor-pointer ${sizeClasses[size]} ${className}`}
      style={{
        perspective: '1000px',
        rotateX: animated ? rotateX : 0,
        rotateY: animated ? rotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Capa base con gradiente */}
      <div
        className="absolute inset-0 overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(0,0,0,0.4) 100%)`,
          border: `1px solid ${isHovered ? colors.primary : 'rgba(255,255,255,0.1)'}`,
          boxShadow: isHovered
            ? `0 20px 40px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
            : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Efecto holográfico de brillo */}
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${colors.glow} 0%, transparent 50%)`,
          opacity: isHovered ? 0.6 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Líneas holográficas */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          )`,
        }}
      />

      {/* Borde luminoso superior */}
      <div
        className="absolute top-0 right-4 left-4 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          opacity: isHovered ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium tracking-wide text-white/50">{title}</span>
          {icon && (
            <motion.div
              className="rounded-xl p-2"
              style={{
                background: colors.bg,
                color: colors.primary,
              }}
              animate={{
                boxShadow: isHovered ? `0 0 20px ${colors.glow}` : 'none',
              }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* Valor principal */}
        <div className="flex flex-1 items-center">
          <motion.span
            className={`font-bold text-white ${valueSize[size]} tracking-tight`}
            style={{ textShadow: isHovered ? `0 0 20px ${colors.glow}` : 'none' }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.span>
        </div>

        {/* Footer con trend */}
        <div className="flex items-center justify-between">
          {subtitle && <span className="text-xs text-white/40">{subtitle}</span>}
          {trend !== undefined && (
            <motion.div
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: trend >= 0 ? '#10B981' : '#EF4444' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(trend)}%</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Efecto de partículas flotantes */}
      <AnimatePresence>
        {isHovered && animated && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute h-1 w-1 rounded-full"
                style={{ background: colors.primary }}
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: `${30 + Math.random() * 40}%`,
                  y: `${20 + Math.random() * 60}%`,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// GLASS METRIC CARD - Tarjeta glassmorphism con sparkline
// ═══════════════════════════════════════════════════════════════════════════

export function GlassMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  sparklineData = [],
  color = 'purple',
  className = '',
}: GlassMetricCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = colorMap[color]

  // Dibujar sparkline
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || sparklineData.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 4

    const min = Math.min(...sparklineData)
    const max = Math.max(...sparklineData)
    const range = max - min || 1

    const points = sparklineData.map((val, i) => ({
      x: padding + (i / (sparklineData.length - 1)) * (width - padding * 2),
      y: height - padding - ((val - min) / range) * (height - padding * 2),
    }))

    // Gradiente de área
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${colors.primary}40`)
    gradient.addColorStop(1, 'transparent')

    // Dibujar área
    if (points.length === 0) return
    const firstPoint = points[0]
    const lastPointForArea = points[points.length - 1]
    if (!firstPoint || !lastPointForArea) return

    ctx.beginPath()
    ctx.moveTo(firstPoint.x, height)
    points.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.lineTo(lastPointForArea.x, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Dibujar línea
    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    points.forEach((p, i) => {
      if (i === 0) return
      const prev = points[i - 1]
      if (!prev) return
      const cpX = (prev.x + p.x) / 2
      ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y)
    })
    ctx.strokeStyle = colors.primary
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()

    // Punto final brillante
    const lastPoint = points[points.length - 1]
    if (lastPoint) {
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = colors.primary
      ctx.fill()
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = `${colors.primary}30`
      ctx.fill()
    }
  }, [sparklineData, colors])

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl p-5 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 40px ${colors.glow}`,
      }}
    >
      {/* Reflejo de cristal */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white/50">{title}</span>
          {icon && (
            <div
              className="rounded-xl p-2"
              style={{ background: colors.bg, color: colors.primary }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Valor y trend */}
        <div className="mb-3 flex items-end justify-between">
          <span
            className="text-3xl font-bold text-white"
            style={{ textShadow: `0 0 30px ${colors.glow}` }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {trend !== undefined && (
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium"
              style={{
                background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: trend >= 0 ? '#10B981' : '#EF4444',
              }}
            >
              {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="mt-2 h-12">
            <canvas
              ref={canvasRef}
              className="h-full w-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}

        {/* Subtitle */}
        {subtitle && <p className="mt-2 text-xs text-white/40">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING STAT - Estadística flotante con animación
// ═══════════════════════════════════════════════════════════════════════════

export function FloatingStat({
  value,
  label,
  icon,
  color = '#8B5CF6',
  delay = 0,
}: FloatingStatProps) {
  return (
    <motion.div
      className="relative rounded-2xl p-4"
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, rgba(0,0,0,0.3) 100%)`,
        border: `1px solid ${color}30`,
        boxShadow: `0 8px 32px ${color}20`,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      whileHover={{
        y: -8,
        boxShadow: `0 16px 48px ${color}40`,
        transition: { duration: 0.2 },
      }}
    >
      <motion.div
        className="absolute -top-3 -right-3 rounded-full p-2"
        style={{ background: color }}
        animate={{
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {icon || <Sparkles size={16} className="text-white" />}
      </motion.div>

      <div className="mb-1 text-2xl font-bold text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-white/50">{label}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRISMATIC CARD - Tarjeta con efecto prismático
// ═══════════════════════════════════════════════════════════════════════════

export interface PrismaticCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function PrismaticCard({ children, className = '', intensity = 1 }: PrismaticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Efecto prismático de arcoíris */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
              rgba(139, 92, 246, ${0.15 * intensity}) 0%, 
              rgba(59, 130, 246, ${0.1 * intensity}) 25%,
              rgba(16, 185, 129, ${0.1 * intensity}) 50%,
              rgba(249, 115, 22, ${0.1 * intensity}) 75%,
              transparent 100%
            )
          `,
          transition: 'background 0.2s ease',
        }}
      />

      {/* Línea de reflejo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(
            ${mousePosition.x * 180}deg,
            transparent 0%,
            rgba(255,255,255,${0.05 * intensity}) 50%,
            transparent 100%
          )`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPTH CARD - Tarjeta con efecto de profundidad
// ═══════════════════════════════════════════════════════════════════════════

export interface DepthCardProps {
  children: React.ReactNode
  depth?: number
  className?: string
}

export function DepthCard({ children, depth = 3, className = '' }: DepthCardProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Capas de sombra para profundidad */}
      {[...Array(depth)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-2xl"
          style={{
            transform: `translateY(${(i + 1) * 4}px) scale(${1 - (i + 1) * 0.02})`,
            background: 'rgba(0,0,0,0.2)',
            filter: `blur(${(i + 1) * 2}px)`,
            zIndex: -i - 1,
          }}
        />
      ))}

      {/* Tarjeta principal */}
      <motion.div
        className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 backdrop-blur-xl"
        whileHover={{
          y: -depth * 2,
          transition: { duration: 0.2 },
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default HolographicCard
