/**
 * 📊 PROGRESS BARS 2026 - BARRAS DE PROGRESO PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Inspirado en el estilo "Top Tech Stack" de Year Wrapped
 * - Barras con iconos y porcentajes
 * - Animaciones fluidas
 * - Múltiples variantes de color
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import React from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TECH STACK BAR - Barra de progreso estilo Year Wrapped
// ═══════════════════════════════════════════════════════════════════════════

export interface TechStackBarProps {
  label: string
  value: number // 0-100
  icon?: React.ReactNode
  color?: 'rose' | 'purple' | 'gold' | 'lime' | 'orange' | 'blue' | 'emerald'
  showPercentage?: boolean
  delay?: number
  className?: string
}

const barColors = {
  rose: {
    bar: 'bg-gradient-to-r from-rose-500 to-pink-400',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    icon: 'text-rose-400',
  },
  purple: {
    bar: 'bg-gradient-to-r from-purple-500 to-purple-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    icon: 'text-purple-400',
  },
  gold: {
    bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    icon: 'text-amber-400',
  },
  lime: {
    bar: 'bg-gradient-to-r from-lime-500 to-lime-400',
    glow: 'shadow-[0_0_20px_rgba(163,230,53,0.4)]',
    icon: 'text-lime-400',
  },
  orange: {
    bar: 'bg-gradient-to-r from-orange-500 to-orange-400',
    glow: 'shadow-[0_0_20px_rgba(251,146,60,0.4)]',
    icon: 'text-orange-400',
  },
  blue: {
    bar: 'bg-gradient-to-r from-blue-500 to-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    icon: 'text-blue-400',
  },
  emerald: {
    bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    icon: 'text-emerald-400',
  },
}

export function TechStackBar({
  label,
  value,
  icon,
  color = 'rose',
  showPercentage = true,
  delay = 0,
  className = '',
}: TechStackBarProps) {
  const styles = barColors[color]

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header con icon, label y porcentaje */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon && <div className={`h-5 w-5 ${styles.icon}`}>{icon}</div>}
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        {showPercentage && (
          <motion.span
            className="text-sm text-white/60 tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
          >
            {value}%
          </motion.span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className={`h-full rounded-full ${styles.bar} ${styles.glow}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{
            duration: 1,
            delay: delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TECH STACK LIST - Lista de barras estilo Year Wrapped
// ═══════════════════════════════════════════════════════════════════════════

export interface TechStackItem {
  label: string
  value: number
  icon?: React.ReactNode
  color?: 'rose' | 'purple' | 'gold' | 'lime' | 'orange' | 'blue' | 'emerald' | 'rose'
}

export interface TechStackListProps {
  items: TechStackItem[]
  title?: string
  subtitle?: string
  staggerDelay?: number
  className?: string
}

export function TechStackList({
  items,
  title,
  subtitle,
  staggerDelay = 0.1,
  className = '',
}: TechStackListProps) {
  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && (
            <span className="text-xs tracking-wider text-white/40 uppercase">{subtitle}</span>
          )}
        </div>
      )}

      {/* Lista de barras */}
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <TechStackBar key={item.label} {...item} delay={index * staggerDelay} />
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CIRCULAR PROGRESS - Progreso circular
// ═══════════════════════════════════════════════════════════════════════════

export interface CircularProgressProps {
  value: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  color?: 'rose' | 'purple' | 'gold' | 'lime' | 'orange' | 'emerald' | 'gray' | 'white'
  showValue?: boolean
  label?: string
  className?: string
}

const sizeMap = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
}

export function CircularProgress({
  value,
  size = 'md',
  strokeWidth = 4,
  color = 'purple',
  showValue = true,
  label,
  className = '',
}: CircularProgressProps) {
  const pixelSize = sizeMap[size]
  const radius = (pixelSize - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const colorMap: Record<string, string> = {
    rose: '#f43f5e',
    purple: '#a855f7',
    gold: '#fbbf24',
    lime: '#a3e635',
    orange: '#fb923c',
    emerald: '#10b981',
    gray: '#6b7280',
    white: '#ffffff',
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={pixelSize} height={pixelSize} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={pixelSize / 2}
          cy={pixelSize / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            filter: `drop-shadow(0 0 8px ${colorMap[color]}60)`,
          }}
        />
      </svg>

      {/* Center content */}
      {(showValue || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && <span className="text-lg font-bold text-white">{value}%</span>}
          {label && <span className="text-xs text-white/50">{label}</span>}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// RADIAL BAR CHART - Gráfico de barras radiales
// ═══════════════════════════════════════════════════════════════════════════

export interface RadialBarData {
  label: string
  value: number
  color: string
}

export interface RadialBarChartProps {
  data: RadialBarData[]
  size?: number
  className?: string
}

export function RadialBarChart({ data, size = 200, className = '' }: RadialBarChartProps) {
  // Validar que data sea un array
  const safeData = Array.isArray(data) ? data : []
  const center = size / 2
  const maxRadius = (size - 20) / 2
  const barWidth = Math.min(20, maxRadius / (safeData.length || 1) - 4)

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {safeData.map((item, index) => {
          const radius = maxRadius - index * (barWidth + 4)
          const circumference = radius * 2 * Math.PI
          const offset = circumference - (item.value / 100) * circumference

          return (
            <g key={item.label}>
              {/* Background */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={barWidth}
              />
              {/* Progress */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={barWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="origin-center -rotate-90 transform"
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  filter: `drop-shadow(0 0 6px ${item.color}50)`,
                }}
              />
            </g>
          )
        })}
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {safeData.length > 0
              ? (safeData.reduce((acc, item) => acc + item.value, 0) / safeData.length).toFixed(0)
              : 0}
            %
          </div>
          <div className="text-xs text-white/50">Promedio</div>
        </div>
      </div>
    </div>
  )
}
