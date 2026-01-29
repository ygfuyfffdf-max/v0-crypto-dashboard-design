'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📜✨ ACTIVITY FEED VIRTUAL — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Feed de actividad virtualizado con IntersectionObserver para renderizado eficiente.
 * - Virtualización nativa sin dependencias externas
 * - Soporte para 1000+ items sin degradación de rendimiento
 * - Animaciones suaves con Framer Motion
 * - Accesibilidad completa (ARIA)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  DollarSign,
  RefreshCw,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ActivityItem {
  id: string
  tipo:
    | 'venta'
    | 'compra'
    | 'movimiento'
    | 'cliente'
    | 'alerta'
    | 'abono'
    | 'gasto'
    | 'transferencia'
  titulo: string
  descripcion: string
  timestamp: string
  monto?: number
  estado?: 'success' | 'warning' | 'error' | 'info'
  // Campos adicionales para contexto
  bancoId?: string
  clienteId?: string
  ventaId?: string
}

interface ActivityFeedVirtualProps {
  activities: ActivityItem[]
  maxHeight?: number
  onItemClick?: (item: ActivityItem) => void
  emptyMessage?: string
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const tipoConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  venta: { icon: <ShoppingCart size={14} />, color: '#10B981', label: 'Venta' },
  compra: { icon: <Truck size={14} />, color: '#06B6D4', label: 'Compra' },
  movimiento: { icon: <Activity size={14} />, color: '#8B5CF6', label: 'Movimiento' },
  cliente: { icon: <Users size={14} />, color: '#F59E0B', label: 'Cliente' },
  alerta: { icon: <AlertTriangle size={14} />, color: '#EF4444', label: 'Alerta' },
  abono: { icon: <DollarSign size={14} />, color: '#22C55E', label: 'Abono' },
  gasto: { icon: <ArrowDownRight size={14} />, color: '#F43F5E', label: 'Gasto' },
  transferencia: { icon: <RefreshCw size={14} />, color: '#A855F7', label: 'Transferencia' },
}

const defaultConfig = { icon: <AlertTriangle size={14} />, color: '#9CA3AF', label: 'Otro' }

const estadoConfig: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ACTIVITY ROW COMPONENT (Memoizado)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ActivityRow = memo(function ActivityRow({
  activity,
  index,
  onClick,
}: {
  activity: ActivityItem
  index: number
  onClick?: () => void
}) {
  const config = tipoConfig[activity.tipo] || defaultConfig
  const [isVisible, setIsVisible] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver para lazy rendering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' },
    )

    if (rowRef.current) {
      observer.observe(rowRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Formatear monto
  const formattedMonto = useMemo(() => {
    if (!activity.monto) return null
    const isNegative = activity.tipo === 'gasto'
    const prefix = isNegative ? '-' : '+'
    return `${prefix}$${Math.abs(activity.monto).toLocaleString()}`
  }, [activity.monto, activity.tipo])

  // Color del monto basado en tipo
  const montoColor = useMemo(() => {
    if (activity.tipo === 'gasto') return '#F43F5E'
    if (activity.tipo === 'venta' || activity.tipo === 'abono') return '#10B981'
    return '#06B6D4'
  }, [activity.tipo])

  return (
    <div ref={rowRef} className="min-h-[72px] px-1">
      {isVisible ? (
        <motion.article
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.3 }}
          className={cn(
            'mb-1 flex items-start gap-3 rounded-lg p-3 transition-all duration-200',
            'group cursor-pointer hover:bg-white/[0.04]',
            'focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:outline-none',
          )}
          onClick={onClick}
          role="article"
          aria-label={`${config.label}: ${activity.titulo}`}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        >
          {/* Icono con efecto */}
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
              'transition-transform duration-200 group-hover:scale-110',
            )}
            style={{ background: `${config.color}20` }}
            aria-hidden="true"
          >
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>

          {/* Contenido */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-sm font-medium text-white group-hover:text-white/90">
                {activity.titulo}
              </h4>
              {formattedMonto && (
                <span
                  className="shrink-0 text-sm font-bold tabular-nums"
                  style={{ color: montoColor }}
                >
                  {formattedMonto}
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-xs text-white/40 group-hover:text-white/50">
              {activity.descripcion}
            </p>

            <div className="mt-1.5 flex items-center gap-2">
              <time className="text-xs text-white/30" dateTime={activity.timestamp}>
                {activity.timestamp}
              </time>
              {activity.estado && (
                <span
                  className={cn(
                    'rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                    estadoConfig[activity.estado],
                  )}
                >
                  {activity.estado}
                </span>
              )}
            </div>
          </div>
        </motion.article>
      ) : (
        // Placeholder mientras carga
        <div className="mb-1 flex items-start gap-3 rounded-lg p-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg p-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-white/5 p-4">
        <Activity size={32} className="text-white/20" />
      </div>
      <p className="text-sm text-white/40">{message}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ActivityFeedVirtual({
  activities,
  maxHeight = 350,
  onItemClick,
  emptyMessage = 'No hay actividad reciente',
  loading = false,
  className,
}: ActivityFeedVirtualProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Manejar scroll para indicador de progreso
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const progress = scrollTop / (scrollHeight - clientHeight)
    setScrollProgress(Math.min(progress, 1))
  }, [])

  // Suscribirse al scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (activities.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className={cn('relative', className)}>
      {/* Scroll progress indicator */}
      <div
        className="absolute top-0 right-0 z-10 h-full w-1 overflow-hidden rounded-full bg-white/5"
        aria-hidden="true"
      >
        <motion.div
          className="w-full rounded-full bg-gradient-to-b from-violet-500 to-cyan-500"
          style={{ height: `${scrollProgress * 100}%` }}
          initial={{ height: 0 }}
          animate={{ height: `${scrollProgress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Activity list */}
      <div
        ref={containerRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 overflow-x-hidden overflow-y-auto pr-2"
        style={{ height: maxHeight }}
        role="feed"
        aria-label="Feed de actividad reciente"
        aria-busy={loading}
      >
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              index={index}
              onClick={onItemClick ? () => onItemClick(activity) : undefined}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Fade gradient at bottom */}
      <div
        className="pointer-events-none absolute right-2 bottom-0 left-0 h-8 bg-gradient-to-t from-black/50 to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type { ActivityFeedVirtualProps }
