/**
 * 📊 METRIC CARD - Card de métrica con contador animado
 * Visualización premium de estadísticas con barra de progreso
 */

'use client'

import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface MetricCardProps {
  label: string
  value: number | string
  change?: number
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  progress?: number
  className?: string
}

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  progress = 75,
  className,
}: MetricCardProps) {
  const trendColors = {
    up: 'text-emerald-400 bg-emerald-500/10',
    down: 'text-rose-400 bg-rose-500/10',
    neutral: 'text-gray-400 bg-gray-500/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br from-white/[0.05] to-white/[0.02]',
        'border border-white/10',
        'group hover:border-violet-500/30',
        'transition-all duration-500',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-400 transition-colors duration-300 group-hover:bg-violet-500/20">
          <Icon className="h-5 w-5" />
        </div>

        {change !== undefined && (
          <span className={cn('rounded-lg px-2 py-1 text-sm font-medium', trendColors[trend])}>
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>

      {/* Valor */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-1 text-3xl font-bold text-white"
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </motion.div>

      {/* Label */}
      <p className="text-sm text-gray-400">{label}</p>

      {/* Barra de progreso */}
      {progress !== undefined && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
        </div>
      )}
    </motion.div>
  )
}
