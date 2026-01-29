'use client'

// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 — WIDGET DE MÉTRICAS COMPACTO
// Barra de métricas clave para mostrar en cualquier header
// Usa el hook useMetricasRapidas para datos en tiempo real
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  Activity,
  Shield,
  Zap,
  Clock,
  PieChart,
} from 'lucide-react'
import { useMetricasRapidas } from '@/app/_hooks/useMetricasRapidas'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { cn } from '@/app/_lib/utils'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface MetricItemProps {
  label: string
  value: string | number
  suffix?: string
  icon: React.ReactNode
  color: 'gold' | 'violet' | 'pink' | 'green' | 'white'
  trend?: 'up' | 'down' | 'stable'
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE MÉTRICA INDIVIDUAL
// ═══════════════════════════════════════════════════════════════

function MetricItem({ label, value, suffix, icon, color, trend }: MetricItemProps) {
  const colorClasses = {
    gold: 'text-amber-400',
    violet: 'text-violet-400',
    pink: 'text-pink-400',
    green: 'text-emerald-400',
    white: 'text-white',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <div className={cn('h-4 w-4', colorClasses[color])}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] leading-none text-white/40">{label}</span>
        <div className="flex items-center gap-1">
          <span className={cn('text-sm font-semibold', colorClasses[color])}>
            {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
          </span>
          {suffix && <span className="text-[10px] text-white/40">{suffix}</span>}
          {trend && (
            <TrendIcon
              className={cn(
                'h-3 w-3',
                trend === 'up' && 'text-emerald-400',
                trend === 'down' && 'text-red-400',
                trend === 'stable' && 'text-white/40',
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: BARRA DE MÉTRICAS
// ═══════════════════════════════════════════════════════════════

interface MetricsBarProps {
  className?: string
  variant?: 'full' | 'compact' | 'minimal'
}

export function MetricsBar({ className, variant = 'full' }: MetricsBarProps) {
  const metricas = useMetricasRapidas()

  // Determinar tendencia general
  const tendenciaIcon = useMemo(() => {
    switch (metricas.tendencia) {
      case 'creciendo':
        return 'up'
      case 'decreciendo':
        return 'down'
      default:
        return 'stable'
    }
  }, [metricas.tendencia])

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-4 px-4 py-2',
          'rounded-full border border-white/10 bg-black/40 backdrop-blur-md',
          className,
        )}
      >
        <MetricItem
          label="Capital"
          value={formatCurrency(metricas.capitalTotal)}
          icon={<Wallet className="h-full w-full" />}
          color="gold"
          trend={tendenciaIcon}
        />
        <div className="h-6 w-px bg-white/10" />
        <MetricItem
          label="Salud"
          value={metricas.saludFinanciera}
          suffix="%"
          icon={<Shield className="h-full w-full" />}
          color={
            metricas.saludFinanciera >= 80
              ? 'green'
              : metricas.saludFinanciera >= 50
                ? 'gold'
                : 'pink'
          }
        />
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-2 px-4 py-2',
          'rounded-xl border border-white/10 bg-black/40 backdrop-blur-md',
          className,
        )}
      >
        <MetricItem
          label="Capital"
          value={formatCurrency(metricas.capitalTotal)}
          icon={<Wallet className="h-full w-full" />}
          color="gold"
          trend={tendenciaIcon}
        />
        <div className="h-8 w-px bg-white/10" />
        <MetricItem
          label="ROCE"
          value={metricas.roce}
          suffix="%"
          icon={<Activity className="h-full w-full" />}
          color="violet"
        />
        <div className="h-8 w-px bg-white/10" />
        <MetricItem
          label="Liquidez"
          value={metricas.liquidezDias}
          suffix="días"
          icon={<Clock className="h-full w-full" />}
          color="green"
        />
        <div className="h-8 w-px bg-white/10" />
        <MetricItem
          label="Salud"
          value={metricas.saludFinanciera}
          suffix="%"
          icon={<Shield className="h-full w-full" />}
          color={
            metricas.saludFinanciera >= 80
              ? 'green'
              : metricas.saludFinanciera >= 50
                ? 'gold'
                : 'pink'
          }
        />
      </motion.div>
    )
  }

  // Variant: full
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center justify-between px-6 py-3',
        'bg-gradient-to-r from-black/60 via-violet-900/20 to-black/60',
        'border-b border-white/10 backdrop-blur-xl',
        className,
      )}
    >
      {/* Sección izquierda: Capital y Balance */}
      <div className="flex items-center gap-4">
        <MetricItem
          label="Capital Total"
          value={formatCurrency(metricas.capitalTotal)}
          icon={<Wallet className="h-full w-full" />}
          color="gold"
          trend={tendenciaIcon}
        />
        <MetricItem
          label="Balance Neto"
          value={formatCurrency(metricas.balanceNeto)}
          icon={<PieChart className="h-full w-full" />}
          color={metricas.balanceNeto >= 0 ? 'green' : 'pink'}
        />
      </div>

      {/* Sección central: Métricas CFO */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1">
          <MetricItem
            label="ROCE"
            value={metricas.roce}
            suffix="%"
            icon={<Activity className="h-full w-full" />}
            color="violet"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1">
          <MetricItem
            label="Margen"
            value={metricas.margenNeto}
            suffix="%"
            icon={<Zap className="h-full w-full" />}
            color="gold"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
          <MetricItem
            label="Liquidez"
            value={metricas.liquidezDias}
            suffix="días"
            icon={<Clock className="h-full w-full" />}
            color="green"
          />
        </div>
      </div>

      {/* Sección derecha: Salud y Estado */}
      <div className="flex items-center gap-4">
        <MetricItem
          label="Eficiencia GYA"
          value={metricas.eficienciaGYA}
          suffix="%"
          icon={<Activity className="h-full w-full" />}
          color="violet"
        />
        <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/20 to-pink-500/20 px-4 py-2">
          <Shield
            className={cn(
              'h-5 w-5',
              metricas.saludFinanciera >= 80
                ? 'text-emerald-400'
                : metricas.saludFinanciera >= 50
                  ? 'text-amber-400'
                  : 'text-red-400',
            )}
          />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40">Salud Financiera</span>
            <span
              className={cn(
                'text-lg font-bold',
                metricas.saludFinanciera >= 80
                  ? 'text-emerald-400'
                  : metricas.saludFinanciera >= 50
                    ? 'text-amber-400'
                    : 'text-red-400',
              )}
            >
              {metricas.saludFinanciera}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// WIDGET CIRCULAR DE SALUD
// ═══════════════════════════════════════════════════════════════

interface HealthOrbWidgetProps {
  size?: number
  className?: string
}

export function HealthOrbWidget({ size = 80, className }: HealthOrbWidgetProps) {
  const metricas = useMetricasRapidas()

  const strokeDasharray = 2 * Math.PI * 35 // Radio 35
  const strokeDashoffset = strokeDasharray * (1 - metricas.saludFinanciera / 100)

  const color =
    metricas.saludFinanciera >= 80
      ? '#10b981'
      : metricas.saludFinanciera >= 50
        ? '#fbbf24'
        : '#ef4444'

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        {/* Background circle */}
        <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        {/* Progress circle */}
        <motion.circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDashoffset: strokeDasharray }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {metricas.saludFinanciera}
        </span>
        <span className="text-[8px] text-white/40">SALUD</span>
      </div>
    </motion.div>
  )
}

export default MetricsBar
