'use client'

import { motion } from 'motion/react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: number // Percentage change
  trendLabel?: string
  color?: 'violet' | 'gold' | 'emerald' | 'rose'
}

export function MetricCard({ label, value, trend, trendLabel, color = 'violet' }: MetricCardProps) {
  const colorStyles = {
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-100',
    gold: 'bg-amber-500/10 border-amber-500/20 text-amber-100',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-100',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col p-3 rounded-xl border backdrop-blur-md',
        colorStyles[color]
      )}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-60">{label}</span>
      <div className="flex items-end justify-between mt-1">
        <span className="text-lg font-bold font-mono">{value}</span>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full',
            trend > 0 ? 'bg-emerald-500/20 text-emerald-300' : trend < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-white/50'
          )}>
            {trend > 0 ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : trend < 0 ? <ArrowDown className="w-2.5 h-2.5 mr-0.5" /> : <Minus className="w-2.5 h-2.5 mr-0.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {trendLabel && <span className="text-[9px] opacity-40 mt-1">{trendLabel}</span>}
    </motion.div>
  )
}
