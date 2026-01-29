/**
 * 🏦 BANCO VISUALIZATION COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════
 * Componentes de visualización premium para bóvedas: Orbs 3D y gráficos
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BancoOrbProps {
  id: string
  nombre: string
  capital: number
  color: string
  icon?: string
  size?: number
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export interface BancoOrbsGridProps {
  bancos: Array<{
    id: string
    nombre: string
    capital: number
    color: string
    icon?: string
  }>
  selectedId?: string | null
  onSelect?: (id: string) => void
  className?: string
}

export interface RadialBankChartProps {
  data: Array<{
    id: string
    nombre: string
    value: number
    color: string
  }>
  size?: number
  showLegend?: boolean
  showTotal?: boolean
  totalLabel?: string
  animated?: boolean
  onSectorClick?: (id: string) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// BANCO ORB - 3D Animated Sphere
// ═══════════════════════════════════════════════════════════════════════════

export const BancoOrb: React.FC<BancoOrbProps> = ({
  id,
  nombre,
  capital,
  color,
  icon = '🏦',
  size = 120,
  isSelected = false,
  onClick,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size * 0.35

    const animate = () => {
      timeRef.current += 0.02
      const t = timeRef.current

      ctx.clearRect(0, 0, size, size)

      // Outer glow
      const glowRadius = radius * (1.4 + Math.sin(t) * 0.1)
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.5,
        centerX,
        centerY,
        glowRadius,
      )
      gradient.addColorStop(0, color + '40')
      gradient.addColorStop(0.5, color + '20')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
      ctx.fill()

      // Main orb
      const orbGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius,
      )
      orbGradient.addColorStop(0, color)
      orbGradient.addColorStop(0.5, color + 'dd')
      orbGradient.addColorStop(1, color + '88')
      ctx.fillStyle = orbGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Inner highlight
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius * 0.25,
        centerY - radius * 0.25,
        0,
        centerX - radius * 0.25,
        centerY - radius * 0.25,
        radius * 0.5,
      )
      highlightGradient.addColorStop(0, 'rgba(255,255,255,0.4)')
      highlightGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = highlightGradient
      ctx.beginPath()
      ctx.arc(centerX - radius * 0.25, centerY - radius * 0.25, radius * 0.5, 0, Math.PI * 2)
      ctx.fill()

      // Floating particles
      for (let i = 0; i < 5; i++) {
        const angle = ((Math.PI * 2) / 5) * i + t * 0.5
        const dist = radius * (1.1 + Math.sin(t + i) * 0.1)
        const px = centerX + Math.cos(angle) * dist
        const py = centerY + Math.sin(angle) * dist
        const particleSize = 2 + Math.sin(t * 2 + i) * 1

        ctx.fillStyle = color + '80'
        ctx.beginPath()
        ctx.arc(px, py, particleSize, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [size, color])

  const formattedCapital = useMemo(() => {
    if (capital >= 1000000) return `$${(capital / 1000000).toFixed(1)}M`
    if (capital >= 1000) return `$${(capital / 1000).toFixed(0)}K`
    return `$${capital.toFixed(0)}`
  }, [capital])

  return (
    <motion.div
      className={cn('relative flex cursor-pointer flex-col items-center', className)}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="relative"
        animate={{
          y: [0, -8, 0],
          scale: isSelected ? 1.15 : 1,
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 0.3 },
        }}
      >
        <canvas ref={canvasRef} style={{ width: size, height: size }} className="relative z-10" />

        {/* Icon overlay */}
        <div
          className="absolute inset-0 z-20 flex items-center justify-center text-2xl"
          style={{ fontSize: size * 0.25 }}
        >
          {icon}
        </div>

        {/* Selection ring */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 z-0 rounded-full border-2"
            style={{ borderColor: color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.3, opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Label */}
      <motion.div className="mt-3 text-center" animate={{ opacity: isSelected ? 1 : 0.8 }}>
        <p className="text-sm font-semibold text-white">{nombre}</p>
        <p className="text-lg font-bold" style={{ color }}>
          {formattedCapital}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BANCO ORBS GRID
// ═══════════════════════════════════════════════════════════════════════════

export const BancoOrbsGrid: React.FC<BancoOrbsGridProps> = ({
  bancos,
  selectedId,
  onSelect,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 justify-items-center gap-8 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {bancos.map((banco) => (
        <BancoOrb
          key={banco.id}
          {...banco}
          isSelected={selectedId === banco.id}
          onClick={() => onSelect?.(banco.id)}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RADIAL BANK CHART - Donut Chart with Canvas
// ═══════════════════════════════════════════════════════════════════════════

export const RadialBankChart: React.FC<RadialBankChartProps> = ({
  data,
  size = 300,
  showLegend = true,
  showTotal = true,
  totalLabel = 'Total',
  animated = true,
  onSectorClick,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(animated ? 0 : 1)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Validar que data sea un array
  const safeData = Array.isArray(data) ? data : []
  const total = useMemo(() => safeData.reduce((sum, d) => sum + d.value, 0), [safeData])

  useEffect(() => {
    if (!animated) return

    let start: number | null = null
    const duration = 1000

    const animateIn = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimationProgress(eased)

      if (progress < 1) {
        requestAnimationFrame(animateIn)
      }
    }

    requestAnimationFrame(animateIn)
  }, [animated, safeData])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const outerRadius = size * 0.4
    const innerRadius = size * 0.25

    ctx.clearRect(0, 0, size, size)

    // Draw segments
    let currentAngle = -Math.PI / 2 // Start from top

    safeData.forEach((item) => {
      const sliceAngle = (item.value / total) * Math.PI * 2 * animationProgress
      const isHovered = hoveredId === item.id
      const radius = isHovered ? outerRadius * 1.05 : outerRadius

      // Draw arc
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
      ctx.closePath()

      // Gradient fill
      const midAngle = currentAngle + sliceAngle / 2
      const gradientStart = {
        x: centerX + Math.cos(midAngle) * innerRadius,
        y: centerY + Math.sin(midAngle) * innerRadius,
      }
      const gradientEnd = {
        x: centerX + Math.cos(midAngle) * radius,
        y: centerY + Math.sin(midAngle) * radius,
      }

      const gradient = ctx.createLinearGradient(
        gradientStart.x,
        gradientStart.y,
        gradientEnd.x,
        gradientEnd.y,
      )
      gradient.addColorStop(0, item.color + 'cc')
      gradient.addColorStop(1, item.color)
      ctx.fillStyle = gradient
      ctx.fill()

      // Border
      ctx.strokeStyle = isHovered ? '#fff' : 'rgba(0,0,0,0.2)'
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.stroke()

      currentAngle += sliceAngle
    })
  }, [safeData, size, total, animationProgress, hoveredId])

  const formattedTotal = useMemo(() => {
    if (total >= 1000000) return `$${(total / 1000000).toFixed(1)}M`
    if (total >= 1000) return `$${(total / 1000).toFixed(0)}K`
    return `$${total.toFixed(0)}`
  }, [total])

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} style={{ width: size, height: size }} className="cursor-pointer" />

        {/* Center content */}
        {showTotal && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-white/50">{totalLabel}</span>
            <span className="text-2xl font-bold text-white">{formattedTotal}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4">
          {safeData.map((item) => (
            <motion.button
              key={item.id}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSectorClick?.(item.id)}
              whileHover={{ scale: 1.05 }}
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-white">{item.nombre}</span>
              <span className="text-xs text-white/50">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

export default { BancoOrb, BancoOrbsGrid, RadialBankChart }
