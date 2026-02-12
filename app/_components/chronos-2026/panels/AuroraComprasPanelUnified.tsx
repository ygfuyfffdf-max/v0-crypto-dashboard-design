'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦✨ AURORA COMPRAS PANEL UNIFIED — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Compras/Órdenes ultra premium con diseño unificado basado en AuroraMovimientosPanel:
 * - Glassmorphism con efectos aurora boreal
 * - Timeline de órdenes de compra elegante
 * - Filtros avanzados por estado/distribuidor
 * - Flujo de compras animado con Canvas 60fps
 * - Quick stats animados
 * - KPIs con tendencias
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
import { cn } from '@/app/_lib/utils'
import { useOrdenesCompraData } from '@/app/hooks/useDataHooks'
import { useSoundManager } from '@/app/lib/audio/sound-system'
import { logger } from '@/app/lib/utils/logger'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Box,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Edit3,
  Eye,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Aurora Glass System
import {
  AuroraBackground,
  AuroraBadge,
  AuroraSearch,
  AuroraStatWidget,
  AuroraTabs,
} from '../../ui/AuroraGlassSystem'
import {
  EnhancedAuroraButton as AuroraButton,
  EnhancedAuroraCard as AuroraGlassCard,
} from '../../ui/EnhancedAuroraSystem'

// 🍎 iOS PREMIUM SYSTEM 2026 — Sistema de UI sin efectos 3D problemáticos
import {
  iOSScrollContainer,
  iOSSection,
  iOSGrid,
  iOSMetricCardPremium,
  iOSInfoCard,
  useToastAdvanced as useiOSToast,
  iOSConfirm,
} from '../../ui/ios'

// Aurora Charts - Lazy Loaded for performance
const AuroraAreaChart = dynamic(
  () => import('../../charts/AuroraPremiumCharts').then((mod) => mod.AuroraAreaChart),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  },
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 SUPREME SYSTEMS — CHRONOS INFINITY 2026 (QUANTUM PARTICLES)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import '@/app/_components/chronos-2026/animations/CinematicAnimations'
import { QuantumParticleField } from '@/app/_components/chronos-2026/particles/ParticleSystems'
import { useSmoothScroll } from '@/app/_components/chronos-2026/scroll/SmoothScrollSystem'

// 🌌 SUPREME SHADER SYSTEM — ELITE 2026

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrdenCompra {
  id: string
  fecha: string
  hora: string
  distribuidor: string
  distribuidorId: string
  producto: string
  cantidad: number
  precioUnitario: number
  precioTotal: number
  // Estados del flujo real (según schema DB): pendiente -> parcial -> completo
  // cancelado puede ocurrir en cualquier momento
  estado:
    | 'pendiente'
    | 'parcial'
    | 'completo'
    | 'completada' // Alias de 'completo'
    | 'cancelado'
    | 'cancelada' // Alias de 'cancelado'
  fechaEntrega?: string
  notas?: string
  createdAt: string
  // Métricas avanzadas
  stockActual?: number
  stockVendido?: number
  margenBruto?: number
  rotacionDias?: number
  gananciaRealizada?: number
}

interface FiltrosState {
  estado: string
  busqueda: string
  fechaInicio: string
  fechaFin: string
}

interface AuroraComprasPanelUnifiedProps {
  ordenes?: OrdenCompra[]
  onNuevaOrden?: () => void
  onVerDetalle?: (_orden: OrdenCompra) => void
  onEditarOrden?: (_orden: OrdenCompra) => void
  onEliminarOrden?: (_orden: OrdenCompra) => Promise<void>
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧹 SISTEMA LIMPIO - Sin datos mock (Conectado a Turso)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const _defaultOrdenes: OrdenCompra[] = []

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 PURCHASE FLOW VISUALIZATION — Animated supply chain
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function PurchaseFlowVisualization({
  pendientes,
  parciales,
  completadas,
}: {
  pendientes: number
  parciales: number
  completadas: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    const rect = canvas.getBoundingClientRect()
    const centerY = rect.height / 2

    // Supply chain stages (estados reales del DB)
    const stages = [
      { x: rect.width * 0.2, label: 'Pendientes', color: '#FBBF24', count: pendientes },
      { x: rect.width * 0.5, label: 'Parciales', color: '#F97316', count: parciales },
      { x: rect.width * 0.8, label: 'Completadas', color: '#10B981', count: completadas },
    ]

    // Moving packages
    const packages: Array<{
      x: number
      y: number
      targetStage: number
      speed: number
      size: number
      progress: number
    }> = []

    for (let i = 0; i < 8; i++) {
      packages.push({
        x: rect.width * 0.15,
        y: centerY + (Math.random() - 0.5) * 40,
        targetStage: Math.floor(Math.random() * 3),
        speed: 0.5 + Math.random() * 1,
        size: 8 + Math.random() * 6,
        progress: Math.random(),
      })
    }

    const animate = () => {
      timeRef.current += 0.016

      // Clear
      ctx.fillStyle = 'rgba(3, 3, 8, 0.1)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Draw path
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.moveTo(stages[0]?.x ?? 0, centerY)
      ctx.lineTo(stages[2]?.x ?? 0, centerY)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.setLineDash([])

      // Draw stages
      stages.forEach((stage, i) => {
        // Glow
        const glow = ctx.createRadialGradient(stage.x, centerY, 0, stage.x, centerY, 45)
        glow.addColorStop(0, stage.color + '40')
        glow.addColorStop(0.5, stage.color + '15')
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(stage.x, centerY, 40 + Math.sin(timeRef.current * 2 + i) * 5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Circle
        ctx.beginPath()
        ctx.arc(stage.x, centerY, 25, 0, Math.PI * 2)
        ctx.fillStyle = stage.color
        ctx.fill()

        // Icon
        ctx.fillStyle = '#030308'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        if (i === 0) ctx.fillText('📋', stage.x, centerY)
        else if (i === 1) ctx.fillText('🚚', stage.x, centerY)
        else ctx.fillText('📦', stage.x, centerY)

        // Label
        ctx.font = '11px Inter, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(stage.label, stage.x, centerY + 45)

        // Count
        ctx.font = 'bold 14px Inter, sans-serif'
        ctx.fillStyle = stage.color
        ctx.fillText(stage.count.toString(), stage.x, centerY - 45)
      })

      // Animate packages
      packages.forEach((pkg) => {
        pkg.progress += pkg.speed * 0.005
        if (pkg.progress > 1) {
          pkg.progress = 0
          pkg.targetStage = Math.floor(Math.random() * 3)
          pkg.y = centerY + (Math.random() - 0.5) * 40
        }

        const startX = stages[0]?.x ?? 0
        const endX = stages[pkg.targetStage]?.x ?? rect.width * 0.85
        pkg.x = startX + (endX - startX) * pkg.progress

        // Package box
        ctx.fillStyle = `rgba(6, 182, 212, ${0.3 + Math.sin(timeRef.current * 4 + pkg.progress) * 0.2})`
        ctx.fillRect(pkg.x - pkg.size / 2, pkg.y - pkg.size / 2, pkg.size, pkg.size)
        ctx.strokeStyle = '#06B6D4'
        ctx.lineWidth = 1
        ctx.strokeRect(pkg.x - pkg.size / 2, pkg.y - pkg.size / 2, pkg.size, pkg.size)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [pendientes, parciales, completadas])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ background: 'transparent' }}
      role="img"
      aria-label={`Flujo de compras: ${pendientes} pendientes, ${parciales} parciales, ${completadas} completadas`}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 ORDEN TIMELINE ITEM — Individual order card
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrdenTimelineItemProps {
  orden: OrdenCompra
  isFirst?: boolean
  isLast?: boolean
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
}

function OrdenTimelineItem({
  orden,
  isFirst,
  isLast,
  onVerDetalle,
  onEditar,
  onEliminar,
}: OrdenTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Mapeo de estados reales del schema DB: 'pendiente' | 'parcial' | 'completo' | 'cancelado'
  const estadoConfig: Record<
    string,
    { color: string; bgColor: string; icon: React.ReactNode; label: string }
  > = {
    pendiente: {
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      icon: <Clock size={16} />,
      label: 'Pendiente',
    },
    parcial: {
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      icon: <CreditCard size={16} />,
      label: 'Pago Parcial',
    },
    completo: {
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: <CheckCircle size={16} />,
      label: 'Completada',
    },
    completada: {
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: <CheckCircle size={16} />,
      label: 'Completada',
    },
    cancelado: {
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: <XCircle size={16} />,
      label: 'Cancelada',
    },
    cancelada: {
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: <XCircle size={16} />,
      label: 'Cancelada',
    },
  }

  // Config siempre existe porque tenemos un fallback a 'pendiente'
  const config = estadoConfig[orden.estado] ?? estadoConfig.pendiente
  // Safety check - siempre habrá un valor
  if (!config) {
    return null
  }

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        {!isFirst && (
          <div
            className="absolute -top-4 h-4 w-0.5"
            style={{ background: `linear-gradient(to bottom, #06B6D450, ${config.color}50)` }}
          />
        )}
        <motion.div
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: config.bgColor,
            border: `2px solid ${config.color}50`,
            boxShadow: isHovered ? `0 0 20px ${config.color}40` : undefined,
          }}
          whileHover={{ scale: 1.1 }}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </motion.div>
        {!isLast && (
          <div
            className="min-h-[40px] w-0.5 flex-1"
            style={{ background: `linear-gradient(to bottom, ${config.color}50, transparent)` }}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        className={cn(
          'group mb-4 flex-1 cursor-pointer rounded-2xl p-5 transition-all duration-500',
          'border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent',
          'backdrop-blur-xl',
          'hover:border-white/15',
          'focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none',
        )}
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        whileHover={{ x: 6, scale: 1.01 }}
        layout
        style={{
          boxShadow: isHovered
            ? `0 12px 40px ${config.color}30, 0 0 60px ${config.color}15`
            : '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Shimmer sweep effect */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Order icon */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}
            >
              <Package size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{orden.producto}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                <Truck size={10} />
                <span>{orden.distribuidor}</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className="text-lg font-bold text-cyan-400">${orden.precioTotal.toLocaleString()}</p>
            <AuroraBadge
              color={
                orden.estado === 'completada' || orden.estado === 'completo'
                  ? 'emerald'
                  : orden.estado === 'parcial'
                    ? 'gold'
                    : orden.estado === 'pendiente'
                      ? 'cyan'
                      : 'magenta'
              }
              variant="outline"
            >
              {config.label}
            </AuroraBadge>
          </div>
        </div>

        {/* Order info */}
        <div className="mb-2 flex items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>
              {orden.fecha} {orden.hora}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Box size={10} />
            <span>{orden.cantidad} unidades</span>
          </div>
          {orden.fechaEntrega && (
            <div className="flex items-center gap-1">
              <Truck size={10} />
              <span>Entrega: {orden.fechaEntrega}</span>
            </div>
          )}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Precio Unitario</span>
                  <span className="text-white">${orden.precioUnitario.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Cantidad</span>
                  <span className="text-white">{orden.cantidad} unidades</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Distribuidor</span>
                  <span className="text-cyan-400">{orden.distribuidor}</span>
                </div>
                {orden.notas && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Notas</span>
                    <span className="max-w-[60%] text-right text-white/60">{orden.notas}</span>
                  </div>
                )}

                {/* Métricas Avanzadas (Mini Dashboard) */}
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-white/5 p-3">
                  <div>
                    <p className="text-[10px] tracking-wider text-white/40 uppercase">Margen</p>
                    <p
                      className={`text-sm font-bold ${(orden.margenBruto || 0) >= 30 ? 'text-emerald-400' : 'text-white'}`}
                    >
                      {orden.margenBruto ? `${orden.margenBruto.toFixed(1)}%` : '-%'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider text-white/40 uppercase">Rotación</p>
                    <p className="text-sm font-bold text-white">
                      {orden.rotacionDias ? `${orden.rotacionDias.toFixed(0)} días` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider text-white/40 uppercase">
                      Stock Vendido
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-full max-w-[60px] rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{
                            width: `${orden.cantidad > 0 ? ((orden.stockVendido || 0) / orden.cantidad) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/60">{orden.stockVendido || 0}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider text-white/40 uppercase">Ganancia</p>
                    <p className="text-sm font-bold text-emerald-400">
                      ${(orden.gananciaRealizada || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => {
                      play('click')
                      onVerDetalle?.()
                    }}
                  >
                    Ver Detalle
                  </AuroraButton>
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Edit3 size={14} />}
                    onClick={() => {
                      play('click')
                      onEditar?.()
                    }}
                  >
                    Editar
                  </AuroraButton>
                  {/* Botón Eliminar - solo si no tiene stock vendido */}
                  {(orden.stockVendido || 0) === 0 && (
                    <AuroraButton
                      variant="secondary"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
                      icon={<XCircle size={14} />}
                      onClick={() => {
                        play('error')
                        onEliminar?.()
                      }}
                    >
                      Eliminar
                    </AuroraButton>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📆 DATE GROUP HEADER — Group orders by date
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function DateGroupHeader({
  fecha,
  count,
  total,
  completadas,
}: {
  fecha: string
  count: number
  total: number
  completadas: number
}) {
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    const year = parseInt(parts[0] ?? '2025', 10)
    const month = parseInt(parts[1] ?? '1', 10)
    const day = parseInt(parts[2] ?? '1', 10)
    const date = new Date(Date.UTC(year, month - 1, day))

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    if (dateStr === todayStr) return 'Hoy'
    if (dateStr === yesterdayStr) return 'Ayer'

    const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ]

    return `${weekdays[date.getUTCDay()]}, ${date.getUTCDate()} de ${months[date.getUTCMonth()]}`
  }

  return (
    <div className="mb-2 flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
          <Calendar size={14} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white capitalize">{formatDate(fecha)}</p>
          <p className="text-xs text-white/40">{count} órdenes</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-white">${total.toLocaleString()}</span>
        <span className="text-emerald-400">{completadas} completadas</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Compras Panel Unified
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const AuroraComprasPanelUnified = ({
  ordenes: ordenesProp,
  onNuevaOrden,
  onVerDetalle,
  onEditarOrden,
  onEliminarOrden,
  onRefresh,
  loading: loadingProp = false,
  className,
}: AuroraComprasPanelUnifiedProps) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🌊 SUPREME SYSTEMS — SMOOTH SCROLL 120fps
  // ═══════════════════════════════════════════════════════════════════════════
  useSmoothScroll()

  // 🔊 SOUND SYSTEM
  const { play } = useSoundManager()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🗑️ ESTADO PARA MODAL DE ELIMINACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  const [ordenAEliminar, setOrdenAEliminar] = useState<OrdenCompra | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CARGAR DATOS REALES DE LA API SI NO SE PASAN PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: ordenesAPI, loading: loadingAPI, refetch: refetchAPI } = useOrdenesCompraData()

  // Transformar datos de API al formato del componente
  const transformedOrdenes = useMemo((): OrdenCompra[] => {
    if (!ordenesAPI || ordenesAPI.length === 0) return []

    return ordenesAPI.map(
      (o: {
        id: string
        distribuidorId: string
        fecha: Date | string
        cantidad: number
        stockActual?: number
        total: number
        montoRestante?: number
        estado: string
        distribuidor?: { nombre?: string } | null
        producto?: string
        createdAt?: Date | string
        // Métricas
        stockVendido?: number
        margenBruto?: number
        rotacionDias?: number
        gananciaRealizada?: number
      }): OrdenCompra => {
        const fechaObj = new Date(o.fecha)
        return {
          id: o.id,
          fecha: fechaObj.toISOString().split('T')[0] ?? '',
          hora: fechaObj.toTimeString().slice(0, 5),
          distribuidor:
            (o.distribuidor as { nombre?: string } | null)?.nombre || 'Distribuidor sin nombre',
          distribuidorId: o.distribuidorId,
          producto: o.producto || 'Producto',
          cantidad: o.cantidad,
          precioUnitario: o.total / o.cantidad || 0,
          precioTotal: o.total,
          estado: o.estado as OrdenCompra['estado'],
          fechaEntrega: undefined,
          notas: undefined,
          createdAt:
            typeof o.createdAt === 'string'
              ? o.createdAt
              : o.createdAt?.toISOString() || new Date().toISOString(),
          // Mapeo de métricas avanzadas
          stockActual: o.stockActual,
          stockVendido: o.stockVendido,
          margenBruto: o.margenBruto,
          rotacionDias: o.rotacionDias,
          gananciaRealizada: o.gananciaRealizada,
        }
      },
    )
  }, [ordenesAPI])

  // Usar datos de props si se pasan, sino usar datos de API (sin fallback a mock)
  const ordenes = useMemo(() => {
    if (ordenesProp && Array.isArray(ordenesProp) && ordenesProp.length > 0) return ordenesProp
    return Array.isArray(transformedOrdenes) ? transformedOrdenes : [] // Si está vacío, mostrar vacío (sin mock data)
  }, [ordenesProp, transformedOrdenes])

  const loading = loadingProp || loadingAPI

  const [filtros, setFiltros] = useState<FiltrosState>({
    estado: 'todos',
    busqueda: '',
    fechaInicio: '',
    fechaFin: '',
  })

  // Stats - Basados en estados reales del schema DB
  const stats = useMemo(() => {
    const total = ordenes.length
    const pendientes = ordenes.filter((o) => o.estado === 'pendiente').length
    const parciales = ordenes.filter((o) => o.estado === 'parcial').length
    const completadas = ordenes.filter(
      (o) => o.estado === 'completo' || o.estado === 'completada',
    ).length
    const canceladas = ordenes.filter(
      (o) => o.estado === 'cancelado' || o.estado === 'cancelada',
    ).length

    const montoTotal = ordenes.reduce((sum, o) => sum + o.precioTotal, 0)
    const montoPendiente = ordenes
      .filter((o) => o.estado === 'pendiente')
      .reduce((sum, o) => sum + o.precioTotal, 0)
    const montoParcial = ordenes
      .filter((o) => o.estado === 'parcial')
      .reduce((sum, o) => sum + o.precioTotal, 0)
    const montoCompletado = ordenes
      .filter((o) => o.estado === 'completo' || o.estado === 'completada')
      .reduce((sum, o) => sum + o.precioTotal, 0)

    return {
      total,
      pendientes,
      parciales,
      completadas,
      canceladas,
      montoTotal,
      montoPendiente,
      montoParcial,
      montoCompletado,
    }
  }, [ordenes])

  // Filtered ordenes - con normalización para aliases
  const filteredOrdenes = useMemo(() => {
    return ordenes.filter((o) => {
      // Normalizar aliases a estados principales
      let estadoNormalizado: string = o.estado
      if (o.estado === 'completada') estadoNormalizado = 'completo'
      if (o.estado === 'cancelada') estadoNormalizado = 'cancelado'

      const matchEstado = filtros.estado === 'todos' || estadoNormalizado === filtros.estado
      const matchBusqueda =
        !filtros.busqueda ||
        o.distribuidor.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        o.producto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        o.id.toLowerCase().includes(filtros.busqueda.toLowerCase())
      return matchEstado && matchBusqueda
    })
  }, [ordenes, filtros])

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, OrdenCompra[]> = {}
    filteredOrdenes.forEach((o) => {
      if (!groups[o.fecha]) groups[o.fecha] = []
      const group = groups[o.fecha]
      if (group) group.push(o)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredOrdenes])

  // Chart data
  const chartData = useMemo(() => {
    // Días de la semana determinísticos para evitar mismatch SSR/Cliente
    const diasSemana = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map((fecha) => {
      const dayOrdenes = ordenes.filter((o) => o.fecha === fecha)
      const total = dayOrdenes.reduce((sum, o) => sum + o.precioTotal, 0)
      // Usar getUTCDay para consistencia SSR/Cliente
      const dayIndex = fecha ? new Date(fecha + 'T00:00:00Z').getUTCDay() : 0
      return {
        name: diasSemana[dayIndex],
        value: total,
        ordenes: dayOrdenes.length,
      }
    })
  }, [ordenes])

  // Tabs basados en estados reales del schema DB:
  // 'pendiente' | 'parcial' | 'completo' | 'cancelado'
  const tabs = [
    { id: 'todos', label: 'Todas' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'parcial', label: 'Parciales' },
    { id: 'completo', label: 'Completas' },
    { id: 'cancelado', label: 'Canceladas' },
  ]

  // ═══════════════════════════════════════════════════════════════════════════
  // 🗑️ FUNCIÓN ELIMINAR ORDEN
  // ═══════════════════════════════════════════════════════════════════════════
  const handleEliminarClick = useCallback((orden: OrdenCompra) => {
    setOrdenAEliminar(orden)
    setIsDeleteModalOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!ordenAEliminar) return

    try {
      // Si hay callback externo, usarlo
      if (onEliminarOrden) {
        await onEliminarOrden(ordenAEliminar)
      } else {
        // Llamar API directamente
        const response = await fetch(`/api/ordenes/${ordenAEliminar.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al eliminar')
        }
      }
      // Refrescar datos
      refetchAPI()
      onRefresh?.()
      logger.info('Orden eliminada', {
        context: 'AuroraComprasPanel',
        data: { id: ordenAEliminar.id },
      })
    } catch (error) {
      logger.error('Error eliminando orden:', error as Error, { context: 'AuroraComprasPanel' })
      throw error
    } finally {
      setOrdenAEliminar(null)
      setIsDeleteModalOpen(false)
    }
  }, [ordenAEliminar, onEliminarOrden, refetchAPI, onRefresh])

  return (
    <>
      {/* 🌌 QUANTUM PARTICLE FIELD — COMPRAS */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <QuantumParticleField
          variant="cosmic"
          intensity="normal"
          particleCount={90}
          interactive={true}
          scrollEffect={true}
          mouseRadius={160}
          connectionDistance={130}
          showTrails={true}
          enableGlow={true}
          speed={0.7}
          className="opacity-45"
        />
      </div>

      <AuroraBackground
        intensity="medium"
        colors={['cyan', 'violet', 'emerald']}
        interactive
        className={cn('min-h-screen', className)}
      >
        <main className="p-6" aria-label="Panel de órdenes de compra CHRONOS">
          {/* Header - ELEVATED PREMIUM */}
          <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="relative">
              {/* Decorative glow orb */}
              <div className="absolute -top-4 -left-4 h-20 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
              <motion.h1
                className="relative flex items-center gap-4 text-3xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <ShoppingBag className="h-6 w-6 text-cyan-400" aria-hidden="true" />
                </motion.div>
                <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                  Órdenes de Compra
                </span>
              </motion.h1>
              <p className="relative mt-2 text-white/50">Gestión de compras y proveedores</p>
              <motion.div
                className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>

            <div className="flex items-center gap-3">
              <AuroraButton
                variant="glow"
                color="cyan"
                icon={<Plus size={18} />}
                onClick={() => {
                  play('success')
                  onNuevaOrden?.()
                }}
              >
                Nueva Orden
              </AuroraButton>
              <AuroraButton
                variant="secondary"
                icon={<Download size={18} />}
                onClick={() => play('click')}
              >
                Exportar
              </AuroraButton>
              <motion.button
                onClick={() => {
                  play('whoosh')
                  refetchAPI()
                  onRefresh?.()
                }}
                aria-label={loading ? 'Actualizando datos...' : 'Actualizar órdenes de compra'}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            </div>
          </header>

          {/* ═══════════════════════════════════════════════════════════════════════════════
           * 🍎 iOS PREMIUM METRICS — Cards limpias SIN efectos 3D problemáticos
           * Estilo iOS 18+ con glassmorphism Gen6, sin tilt con cursor
           * ═══════════════════════════════════════════════════════════════════════════════ */}
          <iOSSection title="Métricas de Compras" description="Vista iOS Premium" className="mb-6">
            <iOSGrid cols={4} gap="md">
              <iOSMetricCardPremium
                title="Total Compras"
                value={`$${stats.montoTotal.toLocaleString()}`}
                icon={ShoppingBag}
                iconColor="#06B6D4"
                trend={{ value: 18.5, direction: 'up' }}
                variant="featured"
              />
              <iOSMetricCardPremium
                title="Pendientes"
                value={`$${stats.montoPendiente.toLocaleString()}`}
                icon={Clock}
                iconColor="#F59E0B"
                trend={{ value: 5.2, direction: 'down' }}
                variant="default"
              />
              <iOSMetricCardPremium
                title="Completadas"
                value={`$${stats.montoCompletado.toLocaleString()}`}
                icon={CheckCircle}
                iconColor="#10B981"
                trend={{ value: 12.8, direction: 'up' }}
                variant="default"
              />
              <iOSMetricCardPremium
                title="Parciales"
                value={stats.parciales.toString()}
                icon={CreditCard}
                iconColor="#F59E0B"
                trend={{ value: 0, direction: 'neutral' }}
                variant="default"
              />
            </iOSGrid>
          </iOSSection>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Timeline */}
            <div className="col-span-12 space-y-6 lg:col-span-8">
              {/* Filters & Search */}
              <AuroraGlassCard className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <AuroraSearch
                    value={filtros.busqueda}
                    onChange={(v) => setFiltros((prev) => ({ ...prev, busqueda: v }))}
                    placeholder="Buscar orden..."
                    color="cyan"
                    className="w-64"
                  />

                  <AuroraTabs
                    tabs={tabs}
                    activeTab={filtros.estado}
                    onTabChange={(v) => setFiltros((prev) => ({ ...prev, estado: v }))}
                    color="cyan"
                  />
                </div>
              </AuroraGlassCard>

              {/* Timeline */}
              <AuroraGlassCard className="p-6">
                <div className="space-y-2">
                  {groupedByDate.map(([fecha, items]) => {
                    const total = items.reduce((sum, o) => sum + o.precioTotal, 0)
                    const completadas = items.filter((o) => o.estado === 'completada').length
                    return (
                      <div key={fecha}>
                        <DateGroupHeader
                          fecha={fecha}
                          count={items.length}
                          total={total}
                          completadas={completadas}
                        />
                        {items.map((orden, i) => (
                          <OrdenTimelineItem
                            key={orden.id}
                            orden={orden}
                            isFirst={i === 0}
                            isLast={i === items.length - 1}
                            onVerDetalle={() => onVerDetalle?.(orden)}
                            onEditar={() => onEditarOrden?.(orden)}
                            onEliminar={() => handleEliminarClick(orden)}
                          />
                        ))}
                      </div>
                    )
                  })}

                  {groupedByDate.length === 0 && (
                    <div className="py-12 text-center text-white/40">
                      <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No se encontraron órdenes de compra</p>
                    </div>
                  )}
                </div>
              </AuroraGlassCard>
            </div>

            {/* Right: Visualization & Quick Stats */}
            <div className="col-span-12 space-y-6 lg:col-span-4">
              {/* Purchase Flow Visualization */}
              <AuroraGlassCard glowColor="cyan" className="p-4">
                <h3 className="mb-3 text-center text-sm font-medium text-white/70">
                  Flujo de Compras
                </h3>
                <div className="h-48">
                  <PurchaseFlowVisualization
                    pendientes={stats.pendientes}
                    parciales={stats.parciales}
                    completadas={stats.completadas}
                  />
                </div>
              </AuroraGlassCard>

              {/* 7-Day Chart */}
              <AuroraAreaChart
                data={chartData}
                height={200}
                color="cyan"
                showArea
                showLine
                showDots
                showTooltip
                title="Compras Últimos 7 Días"
              />

              {/* Quick Stats */}
              <AuroraGlassCard glowColor="violet" className="p-5">
                <h3 className="mb-4 text-sm font-medium text-white/70">Estado de Órdenes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-yellow-500/10 p-3">
                    <span className="text-sm text-white/60">Pendientes</span>
                    <span className="text-sm font-bold text-yellow-400">{stats.pendientes}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-orange-500/10 p-3">
                    <span className="text-sm text-white/60">Parciales</span>
                    <span className="text-sm font-bold text-orange-400">{stats.parciales}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3">
                    <span className="text-sm text-white/60">Completadas</span>
                    <span className="text-sm font-bold text-emerald-400">{stats.completadas}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-red-500/10 p-3">
                    <span className="text-sm text-white/60">Canceladas</span>
                    <span className="text-sm font-bold text-red-400">{stats.canceladas}</span>
                  </div>
                </div>
              </AuroraGlassCard>

              {/* Top Distribuidores */}
              <AuroraGlassCard glowColor="emerald" className="p-5">
                <h3 className="mb-4 text-sm font-medium text-white/70">Top Distribuidores</h3>
                <div className="space-y-3">
                  {Array.from(new Set(ordenes.map((o) => o.distribuidor)))
                    .slice(0, 5)
                    .map((dist, i) => {
                      const distOrdenes = ordenes.filter((o) => o.distribuidor === dist)
                      const total = distOrdenes.reduce((sum, o) => sum + o.precioTotal, 0)
                      return (
                        <div key={dist} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                background: `linear-gradient(135deg, hsl(${180 + i * 30}, 70%, 50%), hsl(${180 + i * 30 + 30}, 70%, 40%))`,
                              }}
                            >
                              {i + 1}
                            </div>
                            <span className="max-w-[120px] truncate text-sm text-white/70">
                              {dist}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            ${total.toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </AuroraGlassCard>
            </div>
          </div>
        </main>

        {/* Modal de confirmación de eliminación */}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setOrdenAEliminar(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Eliminar Orden de Compra"
          itemName={ordenAEliminar?.producto}
          warningMessage={
            ordenAEliminar
              ? `Esto revertirá el stock (${ordenAEliminar.cantidad} unidades), el capital pagado, y la deuda del distribuidor.`
              : undefined
          }
        />
      </AuroraBackground>
    </>
  )
}
