'use client'

import { memo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/app/_lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUPREME SPARKLINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeSparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  className?: string
  showArea?: boolean
}

export const SupremeSparkline = memo(function SupremeSparkline({
  data,
  color = '#8B5CF6',
  width = 100,
  height = 40,
  className,
  showArea = true
}: SupremeSparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 4

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 80 - 10 // Dejar margen arriba/abajo
    return `${x},${y}`
  }).join(' L ')

  const areaPath = `M 0,100 L ${points} L 100,100 Z`
  const linePath = `M ${points}`

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ width: '100%', height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {showArea && (
          <motion.path
            d={areaPath}
            fill={`url(#gradient-${color})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}

        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${color})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STATUS PILL (BADGE)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium'

interface StatusPillProps {
  label: string
  variant?: StatusVariant
  icon?: React.ComponentType<{ size?: number; className?: string }>
  className?: string
  pulsing?: boolean
}

export const StatusPill = memo(function StatusPill({
  label,
  variant = 'neutral',
  icon: Icon,
  className,
  pulsing = false
}: StatusPillProps) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
    neutral: "bg-white/5 text-white/60 border-white/10",
    premium: "bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
  }

  const pulseColor = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    error: "bg-rose-400",
    info: "bg-blue-400",
    neutral: "bg-white",
    premium: "bg-violet-400"
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all hover:scale-105",
      styles[variant],
      className
    )}>
      {pulsing && (
        <span className="relative flex h-1.5 w-1.5 mr-0.5">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseColor[variant])}></span>
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", pulseColor[variant])}></span>
        </span>
      )}
      {Icon && <Icon size={10} />}
      {label}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// USER AVATAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UserAvatarProps {
  name: string
  image?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  subtext?: string
}

export const UserAvatar = memo(function UserAvatar({
  name,
  image,
  size = 'md',
  className,
  subtext
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Generate consistent color from name
  const getColor = (str: string) => {
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F43F5E', '#F59E0B', '#EC4899']
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const color = getColor(name)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "relative rounded-full flex items-center justify-center font-bold text-white shadow-lg overflow-hidden shrink-0",
        sizeClasses[size],
        !image && "bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
      )}
      style={!image ? { borderColor: `${color}40`, color: color } : undefined}
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
        
        {/* Status dot (online simulation) */}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#121214] rounded-full" />
      </div>
      
      {(name || subtext) && (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-white truncate">{name}</span>
          {subtext && <span className="text-xs text-white/50 truncate">{subtext}</span>}
        </div>
      )}
    </div>
  )
})
