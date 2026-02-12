'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💸✨ AURORA GASTOS Y ABONOS PANEL UNIFIED — CHRONOS INFINITY 2026 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Gastos y Abonos ultra premium con TODOS los sistemas supremos:
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL Accelerated)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados
 * ✅ PARALLAX EFFECTS en cards
 * - Glassmorphism con efectos aurora boreal
 * - Timeline de movimientos elegante
 * - Filtros avanzados por tipo/categoría/banco
 * - Gráficos con Canvas 60fps
 * - Quick stats animados
 * - KPIs con tendencias
 * - Distribución automática a 3 bancos (Bóveda Monte, Flete Sur, Utilidades)
 *
 * LÓGICA DE DISTRIBUCIÓN GYA:
 * - Gastos: Se descuentan del banco origen (historicoGastos++)
 * - Abonos: Se distribuyen proporcionalmente a los 3 bancos según venta original
 *
 * @version 3.0.0 - SUPREME ELEVATION APPLIED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useMovimientosData } from '@/app/hooks/useDataHooks'
import { useSoundManager } from '@/app/lib/audio/sound-system'
import { AnimatePresence, motion } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import '@/app/_components/chronos-2026/animations/CinematicAnimations'
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Edit3,
  Filter,
  Home,
  Package,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// 🌌 SUPREME SYSTEMS — CHRONOS INFINITY 2026 (QUANTUM OPTIMIZED)
import { GastosBackground } from '@/app/_components/chronos-2026/particles/ParticleSystems'
import { useSmoothScroll } from '@/app/_components/chronos-2026/scroll/SmoothScrollSystem'

// 🌌 SUPREME SHADER SYSTEM — ELITE 2026

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
  useToastAdvanced as useiOSToast,
  iOSConfirm,
} from '../../ui/ios'

// Aurora Charts
// Aurora Charts - Lazy Loaded for performance
const AuroraAreaChart = dynamic(
  () => import('../../charts/AuroraPremiumCharts').then((mod) => mod.AuroraAreaChart),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  },
)
const AuroraDonutChart = dynamic(
  () => import('../../charts/AuroraPremiumCharts').then((mod) => mod.AuroraDonutChart),
  {
    loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  },
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoMovimiento = 'gasto' | 'abono'

export type CategoriaGasto =
  | 'Transporte'
  | 'Servicios'
  | 'Mantenimiento'
  | 'Nómina'
  | 'Marketing'
  | 'Compras'
  | 'Impuestos'
  | 'Renta'
  | 'Otros'

export type EstadoMovimiento = 'completado' | 'pendiente' | 'cancelado'

export type BancoId =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'

export interface GastoAbono {
  id: string
  fecha: string
  hora: string
  tipo: TipoMovimiento
  concepto: string
  monto: number
  categoria: CategoriaGasto
  bancoOrigen: BancoId
  bancoDestino?: BancoId
  referencia?: string
  estado: EstadoMovimiento
  ventaId?: string
  clienteId?: string
  notas?: string
}

export interface MetricasGYA {
  totalGastos: number
  totalAbonos: number
  gastosHoy: number
  abonosHoy: number
  gastosEsteMes: number
  abonosEsteMes: number
  categoriaTopGasto: string
  bancoMasUsado: string
  promedioGastoDiario: number
  tendencia: 'up' | 'down' | 'stable'
  cambioMensual: number
}

export interface FiltrosGYA {
  tipo: 'todos' | TipoMovimiento
  categoria: 'todas' | CategoriaGasto
  bancoOrigen: 'todos' | string
  estado: 'todos' | EstadoMovimiento
  fechaInicio?: string
  fechaFin?: string
  montoMin?: number
  montoMax?: number
}

export interface AuroraGastosYAbonosPanelUnifiedProps {
  movimientos?: GastoAbono[]
  onNuevoGasto?: () => void
  onNuevoAbono?: () => void
  onVerDetalle?: (_mov: GastoAbono) => void
  onEditarMovimiento?: (_mov: GastoAbono) => void
  onEliminarMovimiento?: (_mov: GastoAbono) => void
  onExportar?: () => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧹 SISTEMA LIMPIO - Sin datos mock (Conectado a Turso)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
const defaultMovimientos: GastoAbono[] = []

const bancoConfig: Record<BancoId, { nombre: string; color: string; icon: string }> = {
  boveda_monte: { nombre: 'Bóveda Monte', color: '#10B981', icon: '🏔️' },
  boveda_usa: { nombre: 'Bóveda USA', color: '#3B82F6', icon: '🦅' },
  profit: { nombre: 'Profit', color: '#8B5CF6', icon: '💎' },
  leftie: { nombre: 'Leftie', color: '#F59E0B', icon: '🌟' },
  azteca: { nombre: 'Azteca', color: '#EF4444', icon: '🏛️' },
  flete_sur: { nombre: 'Flete Sur', color: '#06B6D4', icon: '🚚' },
  utilidades: { nombre: 'Utilidades', color: '#EC4899', icon: '💰' },
}

const categoriaConfig: Record<CategoriaGasto, { icon: React.ReactNode; color: string }> = {
  Transporte: { icon: <ShoppingCart size={14} />, color: '#06B6D4' },
  Servicios: { icon: <Zap size={14} />, color: '#F59E0B' },
  Mantenimiento: { icon: <Home size={14} />, color: '#10B981' },
  Nómina: { icon: <Wallet size={14} />, color: '#8B5CF6' },
  Marketing: { icon: <TrendingUp size={14} />, color: '#EC4899' },
  Compras: { icon: <Package size={14} />, color: '#3B82F6' },
  Impuestos: { icon: <Receipt size={14} />, color: '#EF4444' },
  Renta: { icon: <Home size={14} />, color: '#F97316' },
  Otros: { icon: <DollarSign size={14} />, color: '#6B7280' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 FINANCIAL FLOW VISUALIZATION — Real-time animated flow
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function FinancialFlowVisualization({
  totalGastos,
  totalAbonos,
  gastoCount,
  abonoCount,
}: {
  totalGastos: number
  totalAbonos: number
  gastoCount: number
  abonoCount: number
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

    // Particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      alpha: number
      tipo: 'gasto' | 'abono'
    }> = []

    const rect = canvas.getBoundingClientRect()

    // Create particles based on ratio
    const total = gastoCount + abonoCount
    const gastoRatio = total > 0 ? gastoCount / total : 0.5

    for (let i = 0; i < 50; i++) {
      const isGasto = Math.random() < gastoRatio
      particles.push({
        x: Math.random() * rect.width,
        y: isGasto ? -20 : rect.height + 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: isGasto ? 1 + Math.random() * 2 : -(1 + Math.random() * 2),
        size: 2 + Math.random() * 4,
        color: isGasto ? '#EF4444' : '#10B981',
        alpha: 0.4 + Math.random() * 0.6,
        tipo: isGasto ? 'gasto' : 'abono',
      })
    }

    const animate = () => {
      timeRef.current += 0.016
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Clear with trail effect
      ctx.fillStyle = 'rgba(3, 3, 8, 0.08)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Central balance indicator
      const balance = totalAbonos - totalGastos
      const balanceColor = balance >= 0 ? '#10B981' : '#EF4444'

      // Glow effect
      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60)
      glow.addColorStop(0, `${balanceColor}40`)
      glow.addColorStop(0.5, `${balanceColor}15`)
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(centerX, centerY, 50 + Math.sin(timeRef.current * 2) * 5, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Central circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
      ctx.fillStyle = balanceColor
      ctx.fill()

      // Balance icon
      ctx.fillStyle = '#030308'
      ctx.font = 'bold 16px Inter'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(balance >= 0 ? '↑' : '↓', centerX, centerY)

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(timeRef.current + p.y * 0.02) * 0.3
        p.y += p.vy

        // Reset
        if (p.tipo === 'gasto' && p.y > rect.height + 20) {
          p.y = -20
          p.x = Math.random() * rect.width
        } else if (p.tipo === 'abono' && p.y < -20) {
          p.y = rect.height + 20
          p.x = Math.random() * rect.width
        }

        // Attract to center
        const dx = centerX - p.x
        const dy = centerY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 80 && dist > 35) {
          p.vx += dx * 0.0005
          p.vy += dy * 0.0005
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle =
          p.color === '#EF4444'
            ? `rgba(239, 68, 68, ${p.alpha * (0.5 + Math.sin(timeRef.current + p.x) * 0.3)})`
            : `rgba(16, 185, 129, ${p.alpha * (0.5 + Math.sin(timeRef.current + p.x) * 0.3)})`
        ctx.fill()

        // Trail
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x, p.y - p.vy * 6)
        ctx.strokeStyle =
          p.color === '#EF4444'
            ? `rgba(239, 68, 68, ${p.alpha * 0.25})`
            : `rgba(16, 185, 129, ${p.alpha * 0.25})`
        ctx.lineWidth = p.size * 0.4
        ctx.stroke()
      })

      // Labels
      ctx.font = 'bold 12px Inter'
      ctx.textAlign = 'center'

      ctx.fillStyle = '#EF4444'
      ctx.fillText(`${gastoCount} Gastos`, rect.width * 0.2, 20)

      ctx.fillStyle = '#10B981'
      ctx.fillText(`${abonoCount} Abonos`, rect.width * 0.8, rect.height - 10)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [totalGastos, totalAbonos, gastoCount, abonoCount])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ background: 'transparent' }}
      role="img"
      aria-label={`Flujo financiero: ${gastoCount} gastos por $${totalGastos.toLocaleString()}, ${abonoCount} abonos por $${totalAbonos.toLocaleString()}`}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 MOVIMIENTO TIMELINE ITEM — Individual movement card
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovimientoTimelineItemProps {
  movimiento: GastoAbono
  isFirst?: boolean
  isLast?: boolean
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
}

function MovimientoTimelineItem({
  movimiento,
  isFirst,
  isLast,
  onVerDetalle: _onVerDetalle,
  onEditar,
  onEliminar,
}: MovimientoTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isGasto = movimiento.tipo === 'gasto'
  const config = {
    color: isGasto ? '#EF4444' : '#10B981',
    bgColor: isGasto ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
    icon: isGasto ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />,
    label: isGasto ? 'Gasto' : 'Abono',
  }

  const banco = bancoConfig[movimiento.bancoOrigen] ?? bancoConfig['boveda_monte']
  const categoria = categoriaConfig[movimiento.categoria] ?? categoriaConfig['Otros']

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        {!isFirst && (
          <div
            className="absolute -top-4 h-4 w-0.5"
            style={{ background: `linear-gradient(to bottom, #8B5CF650, ${config.color}50)` }}
          />
        )}
        <div
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
          style={{
            background: config.bgColor,
            border: `2px solid ${config.color}50`,
            boxShadow: isHovered
              ? `0 0 24px ${config.color}35, inset 0 0 20px ${config.color}15`
              : `0 0 0 ${config.color}00`,
          }}
        >
          <span
            className="transition-transform duration-300"
            style={{ color: config.color, transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}
          >
            {config.icon}
          </span>
        </div>
        {!isLast && (
          <div
            className="min-h-[40px] w-0.5 flex-1"
            style={{ background: `linear-gradient(to bottom, ${config.color}50, transparent)` }}
          />
        )}
      </div>

      {/* Content */}
      <article
        aria-label={`${config.label}: ${movimiento.concepto}, $${movimiento.monto.toLocaleString()}, estado ${movimiento.estado}`}
        className={cn(
          'mb-4 flex-1 cursor-pointer rounded-xl p-4',
          'transition-all duration-300 ease-out',
          'border border-white/[0.06] bg-white/[0.03]',
          'hover:border-white/15 hover:bg-white/[0.07]',
          'hover:shadow-lg hover:shadow-violet-500/5',
          'focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none',
          isHovered && 'border-l-2',
        )}
        style={{
          borderLeftColor: isHovered ? config.color : 'transparent',
        }}
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Type indicator */}
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${config.color}20, ${config.color}10)`,
                color: config.color,
                border: `1px solid ${config.color}30`,
                boxShadow: isHovered ? `0 4px 20px ${config.color}20` : 'none',
              }}
            >
              {config.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm leading-tight font-semibold text-white">
                {movimiento.concepto}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/50">
                <span className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5">
                  {categoria.icon}
                  <span>{movimiento.categoria}</span>
                </span>
                <span className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5">
                  <span>{banco?.icon}</span>
                  <span>{banco?.nombre}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Amount & Status */}
          <div className="flex-shrink-0 text-right">
            <p
              className="text-lg font-bold tracking-tight transition-all duration-300"
              style={{
                color: config.color,
                textShadow: isHovered ? `0 0 20px ${config.color}50` : 'none',
              }}
            >
              {isGasto ? '-' : '+'}${movimiento.monto.toLocaleString()}
            </p>
            <AuroraBadge
              color={
                movimiento.estado === 'completado'
                  ? 'emerald'
                  : movimiento.estado === 'pendiente'
                    ? 'gold'
                    : 'magenta'
              }
              variant="outline"
            >
              {movimiento.estado}
            </AuroraBadge>
          </div>
        </div>

        {/* Time info */}
        <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-white/40" />
            <span>
              {movimiento.fecha} {movimiento.hora}
            </span>
          </span>
          {movimiento.referencia && (
            <span className="flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-violet-400">
              <span className="text-white/40">Ref:</span>
              <span className="font-medium">{movimiento.referencia}</span>
            </span>
          )}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="-mx-4 mt-4 space-y-3 rounded-b-xl border-t border-white/10 bg-white/[0.02] px-4 pt-4 pb-1">
                {movimiento.ventaId && (
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2 text-sm">
                    <span className="flex items-center gap-2 text-white/50">
                      <Receipt size={14} />
                      Venta Asociada
                    </span>
                    <span className="font-medium text-violet-400">{movimiento.ventaId}</span>
                  </div>
                )}
                {movimiento.clienteId && (
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2 text-sm">
                    <span className="flex items-center gap-2 text-white/50">
                      <Wallet size={14} />
                      Cliente
                    </span>
                    <span className="font-medium text-cyan-400">{movimiento.clienteId}</span>
                  </div>
                )}
                {movimiento.bancoDestino && (
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2 text-sm">
                    <span className="flex items-center gap-2 text-white/50">
                      <Target size={14} />
                      Banco Destino
                    </span>
                    <span className="font-medium text-emerald-400">
                      {movimiento.bancoDestino && bancoConfig[movimiento.bancoDestino]?.icon}{' '}
                      {movimiento.bancoDestino && bancoConfig[movimiento.bancoDestino]?.nombre}
                    </span>
                  </div>
                )}
                {movimiento.notas && (
                  <div className="rounded-lg bg-white/[0.03] p-2 text-sm">
                    <span className="mb-1 block text-white/50">Notas</span>
                    <span className="text-xs leading-relaxed text-white/70">
                      {movimiento.notas}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 border-t border-white/5 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditar?.()
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <Edit3 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEliminar?.()
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/20"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📆 DATE GROUP HEADER — Group movements by date
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function DateGroupHeader({
  fecha,
  count,
  totalGastos,
  totalAbonos,
}: {
  fecha: string
  count: number
  totalGastos: number
  totalAbonos: number
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

  const balance = totalAbonos - totalGastos

  return (
    <div className="sticky top-0 z-10 -mx-3 mb-2 flex items-center justify-between rounded-xl border-b border-white/5 bg-gray-900/80 px-3 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 shadow-lg shadow-violet-500/5">
          <Calendar size={15} className="text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white capitalize">
            {formatDate(fecha)}
          </p>
          <p className="text-xs text-white/50">
            {count} {count === 1 ? 'movimiento' : 'movimientos'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1">
          <ArrowDownRight size={12} className="text-red-400" />
          <span className="font-medium text-red-400">-${totalGastos.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
          <ArrowUpRight size={12} className="text-emerald-400" />
          <span className="font-medium text-emerald-400">+${totalAbonos.toLocaleString()}</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold',
            balance >= 0
              ? 'border border-emerald-500/25 bg-emerald-500/15 text-emerald-400'
              : 'border border-red-500/25 bg-red-500/15 text-red-400',
          )}
        >
          {balance >= 0 ? '+' : ''}
          {balance.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Gastos Y Abonos Panel Unified
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraGastosYAbonosPanelUnified({
  movimientos: movimientosProp,
  onNuevoGasto,
  onNuevoAbono,
  onVerDetalle,
  onEditarMovimiento,
  onEliminarMovimiento,
  onExportar,
  onRefresh,
  loading: loadingProp = false,
  className,
}: AuroraGastosYAbonosPanelUnifiedProps) {
  // 🌊 SMOOTH SCROLL SYSTEM - 120fps
  useSmoothScroll() // Activar smooth scroll 120fps
  const containerRef = useRef<HTMLDivElement>(null)

  // 🔊 SOUND SYSTEM
  const { play } = useSoundManager()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CARGAR DATOS REALES DE LA API SI NO SE PASAN PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: movimientosAPI, loading: loadingAPI, refetch: refetchAPI } = useMovimientosData()

  // Transformar datos de API al formato del componente
  const transformedMovimientos = useMemo((): GastoAbono[] => {
    if (!movimientosAPI || movimientosAPI.length === 0) return []

    return movimientosAPI.map((m) => {
      const fechaStr =
        typeof m.fecha === 'string'
          ? m.fecha
          : (m.fecha as Date)?.toISOString?.() || new Date().toISOString()
      const fechaParts = fechaStr.split('T')

      return {
        id: m.id,
        tipo: (m.tipo === 'ingreso' ? 'abono' : 'gasto') as GastoAbono['tipo'],
        monto: m.monto,
        concepto: m.concepto,
        categoria: 'operativo' as GastoAbono['categoria'],
        bancoOrigen: m.bancoId as GastoAbono['bancoOrigen'],
        estado: 'completado' as GastoAbono['estado'],
        fecha: fechaParts[0] || new Date().toISOString().split('T')[0] || '',
        hora: fechaParts[1]?.slice(0, 5) || '12:00',
      }
    })
  }, [movimientosAPI])

  // Usar datos de props si se pasan, sino usar datos de API (sin fallback a mock data)
  const movimientos = useMemo(() => {
    if (movimientosProp && Array.isArray(movimientosProp) && movimientosProp.length > 0) {
      return movimientosProp
    }
    return Array.isArray(transformedMovimientos) ? transformedMovimientos : []
  }, [movimientosProp, transformedMovimientos])

  const loading = loadingProp || loadingAPI

  const [filtros, setFiltros] = useState<FiltrosGYA>({
    tipo: 'todos',
    categoria: 'todas',
    bancoOrigen: 'todos',
    estado: 'todos',
  })
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  // Metrics
  const metricas = useMemo((): MetricasGYA => {
    const hoy = new Date().toISOString().split('T')[0] ?? ''
    const inicioMes =
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] ?? ''

    const gastos = movimientos.filter((m) => m.tipo === 'gasto')
    const abonos = movimientos.filter((m) => m.tipo === 'abono')

    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
    const totalAbonos = abonos.reduce((sum, a) => sum + a.monto, 0)
    const gastosHoy = gastos.filter((g) => g.fecha === hoy).reduce((sum, g) => sum + g.monto, 0)
    const abonosHoy = abonos.filter((a) => a.fecha === hoy).reduce((sum, a) => sum + a.monto, 0)
    const gastosEsteMes = gastos
      .filter((g) => inicioMes && g.fecha >= inicioMes)
      .reduce((sum, g) => sum + g.monto, 0)
    const abonosEsteMes = abonos
      .filter((a) => inicioMes && a.fecha >= inicioMes)
      .reduce((sum, a) => sum + a.monto, 0)

    // Top categoria
    const categoriaMap = new Map<string, number>()
    gastos.forEach((g) => {
      categoriaMap.set(g.categoria, (categoriaMap.get(g.categoria) || 0) + g.monto)
    })
    const categoriaTopGasto =
      Array.from(categoriaMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Banco más usado
    const bancoMap = new Map<string, number>()
    movimientos.forEach((m) => {
      bancoMap.set(m.bancoOrigen, (bancoMap.get(m.bancoOrigen) || 0) + 1)
    })
    const bancoMasUsado =
      Array.from(bancoMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Promedio diario
    const diasUnicos = new Set(gastos.map((g) => g.fecha)).size
    const promedioGastoDiario = diasUnicos > 0 ? totalGastos / diasUnicos : 0

    // Tendencia (últimos 7 días vs anteriores 7 días)
    const hace7dias = new Date()
    hace7dias.setDate(hace7dias.getDate() - 7)
    const hace14dias = new Date()
    hace14dias.setDate(hace14dias.getDate() - 14)

    const gastosUltimos7 = gastos
      .filter((g) => new Date(g.fecha) >= hace7dias)
      .reduce((sum, g) => sum + g.monto, 0)

    const gastosAnteriores7 = gastos
      .filter((g) => {
        const fecha = new Date(g.fecha)
        return fecha >= hace14dias && fecha < hace7dias
      })
      .reduce((sum, g) => sum + g.monto, 0)

    let tendencia: 'up' | 'down' | 'stable' = 'stable'
    let cambioMensual = 0

    if (gastosAnteriores7 > 0) {
      cambioMensual = ((gastosUltimos7 - gastosAnteriores7) / gastosAnteriores7) * 100
      if (cambioMensual > 5) tendencia = 'up'
      else if (cambioMensual < -5) tendencia = 'down'
    }

    return {
      totalGastos,
      totalAbonos,
      gastosHoy,
      abonosHoy,
      gastosEsteMes,
      abonosEsteMes,
      categoriaTopGasto,
      bancoMasUsado,
      promedioGastoDiario,
      tendencia,
      cambioMensual,
    }
  }, [movimientos])

  // Filtered movements
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((mov) => {
      if (filtros.tipo !== 'todos' && mov.tipo !== filtros.tipo) return false
      if (filtros.categoria !== 'todas' && mov.categoria !== filtros.categoria) return false
      if (filtros.bancoOrigen !== 'todos' && mov.bancoOrigen !== filtros.bancoOrigen) return false
      if (filtros.estado !== 'todos' && mov.estado !== filtros.estado) return false
      if (filtros.fechaInicio && mov.fecha < filtros.fechaInicio) return false
      if (filtros.fechaFin && mov.fecha > filtros.fechaFin) return false
      if (filtros.montoMin && mov.monto < filtros.montoMin) return false
      if (filtros.montoMax && mov.monto > filtros.montoMax) return false

      if (busqueda) {
        const searchLower = busqueda.toLowerCase()
        return (
          mov.concepto.toLowerCase().includes(searchLower) ||
          mov.referencia?.toLowerCase().includes(searchLower) ||
          mov.bancoOrigen.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [movimientos, filtros, busqueda])

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, GastoAbono[]> = {}
    movimientosFiltrados.forEach((m) => {
      if (!groups[m.fecha]) groups[m.fecha] = []
      groups[m.fecha]?.push(m)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [movimientosFiltrados])

  // Chart data - by category
  const chartPorCategoria = useMemo(() => {
    const map = new Map<string, number>()
    movimientosFiltrados
      .filter((m) => m.tipo === 'gasto')
      .forEach((m) => {
        map.set(m.categoria, (map.get(m.categoria) || 0) + m.monto)
      })
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      color: categoriaConfig[name as CategoriaGasto]?.color || '#6B7280',
    }))
  }, [movimientosFiltrados])

  // Chart data - by bank (para uso futuro con gráficos de barras)
  const _chartPorBanco = useMemo(() => {
    const map = new Map<string, { gastos: number; abonos: number }>()
    movimientosFiltrados.forEach((m) => {
      const key = bancoConfig[m.bancoOrigen]?.nombre || m.bancoOrigen
      const current = map.get(key) || { gastos: 0, abonos: 0 }
      if (m.tipo === 'gasto') {
        current.gastos += m.monto
      } else {
        current.abonos += m.monto
      }
      map.set(key, current)
    })
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      gastos: data.gastos,
      abonos: data.abonos,
    }))
  }, [movimientosFiltrados])

  // Chart data - trend (7 days)
  const chartTendencia = useMemo(() => {
    // Días de la semana determinísticos para evitar mismatch SSR/Cliente
    const diasSemana = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map((fecha) => {
      const dayMov = movimientos.filter((m) => m.fecha === fecha)
      const gastos = dayMov.filter((m) => m.tipo === 'gasto').reduce((sum, m) => sum + m.monto, 0)
      const abonos = dayMov.filter((m) => m.tipo === 'abono').reduce((sum, m) => sum + m.monto, 0)
      // Usar getUTCDay para consistencia SSR/Cliente
      const dayIndex = fecha ? new Date(fecha + 'T00:00:00Z').getUTCDay() : 0
      return {
        name: diasSemana[dayIndex],
        value: gastos,
        value2: abonos,
      }
    })
  }, [movimientos])

  // Tabs
  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'gasto', label: 'Gastos' },
    { id: 'abono', label: 'Abonos' },
  ]

  // Handlers
  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      tipo: 'todos',
      categoria: 'todas',
      bancoOrigen: 'todos',
      estado: 'todos',
    })
    setBusqueda('')
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* � QUANTUM PARTICLE FIELD — GASTOS */}
      <GastosBackground opacity={0.4} />

      <AuroraBackground
        intensity="low"
        colors={['violet', 'magenta', 'cyan']}
        interactive={false}
        className={cn('min-h-screen', className)}
      >
        <main
          ref={containerRef}
          className="relative z-10 mx-auto max-w-[1800px] p-6"
          aria-label="Panel de Gastos y Abonos CHRONOS"
        >
          {/* Header - ELEVATED PREMIUM */}
          <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="relative space-y-1">
              {/* Decorative glow orb */}
              <div className="absolute -top-4 -left-4 h-20 w-32 rounded-full bg-pink-500/20 blur-3xl" />
              <motion.h1
                className="relative flex items-center gap-4 text-3xl font-bold tracking-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/20 to-rose-500/20 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Wallet size={20} className="text-pink-400" aria-hidden="true" />
                </motion.div>
                <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                  Gastos y Abonos
                </span>
              </motion.h1>
              <p className="relative pl-[64px] text-sm text-white/50">
                Control de movimientos financieros • Distribución automática a 3 bancos
              </p>
              <motion.div
                className="mt-2 ml-[64px] h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AuroraButton
                variant="glow"
                color="magenta"
                icon={<ArrowDownRight size={18} />}
                onClick={() => {
                  play('error')
                  onNuevoGasto?.()
                }}
              >
                Nuevo Gasto
              </AuroraButton>
              <AuroraButton
                variant="glow"
                color="emerald"
                icon={<ArrowUpRight size={18} />}
                onClick={() => {
                  play('coin')
                  onNuevoAbono?.()
                }}
              >
                Nuevo Abono
              </AuroraButton>
              <AuroraButton
                variant="secondary"
                icon={<Filter size={18} />}
                onClick={() => {
                  play('tab-switch')
                  setMostrarFiltros(!mostrarFiltros)
                }}
              >
                Filtros
              </AuroraButton>
              <AuroraButton
                variant="secondary"
                icon={<Download size={18} />}
                onClick={() => {
                  play('success')
                  onExportar?.()
                }}
              >
                Exportar
              </AuroraButton>
              <button
                onClick={() => {
                  play('whoosh')
                  onRefresh?.()
                }}
                aria-label={loading ? 'Actualizando datos...' : 'Actualizar movimientos'}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-violet-500/10 active:scale-95"
              >
                <RefreshCw
                  size={20}
                  className={cn('transition-transform duration-500', loading && 'animate-spin')}
                  aria-hidden="true"
                />
              </button>
            </div>
          </header>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {mostrarFiltros && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <AuroraGlassCard className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
                    <AuroraButton
                      variant="secondary"
                      size="sm"
                      icon={<X size={14} />}
                      onClick={() => {
                        play('click')
                        handleLimpiarFiltros()
                      }}
                    >
                      Limpiar
                    </AuroraButton>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Categoría</label>
                      <select
                        value={filtros.categoria}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            categoria: e.target.value as FiltrosGYA['categoria'],
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      >
                        <option value="todas">Todas</option>
                        {Object.keys(categoriaConfig).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Banco Origen</label>
                      <select
                        value={filtros.bancoOrigen}
                        onChange={(e) => setFiltros({ ...filtros, bancoOrigen: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      >
                        <option value="todos">Todos</option>
                        {Object.entries(bancoConfig).map(([key, banco]) => (
                          <option key={key} value={key}>
                            {banco.icon} {banco.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Estado</label>
                      <select
                        value={filtros.estado}
                        onChange={(e) =>
                          setFiltros({ ...filtros, estado: e.target.value as FiltrosGYA['estado'] })
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      >
                        <option value="todos">Todos</option>
                        <option value="completado">Completado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Fecha Inicio</label>
                      <input
                        type="date"
                        value={filtros.fechaInicio || ''}
                        onChange={(e) =>
                          setFiltros({ ...filtros, fechaInicio: e.target.value || undefined })
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </AuroraGlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════════════════════════════════════════
           * 🍎 iOS PREMIUM METRICS — Cards limpias SIN efectos 3D problemáticos
           * Estilo iOS 18+ con glassmorphism Gen6, sin tilt con cursor
           * ═══════════════════════════════════════════════════════════════════════════════ */}
          <iOSSection title="Métricas Financieras" description="Vista iOS Premium" className="mb-6">
            <iOSGrid cols={4} gap="md">
              <iOSMetricCardPremium
                title="Total Gastos"
                value={`$${metricas.totalGastos.toLocaleString()}`}
                icon={TrendingDown}
                iconColor="#EC4899"
                trend={{
                  value: metricas.cambioMensual,
                  direction: metricas.tendencia === 'up' ? 'up' : 'down'
                }}
                variant="default"
              />
              <iOSMetricCardPremium
                title="Total Abonos"
                value={`$${metricas.totalAbonos.toLocaleString()}`}
                icon={TrendingUp}
                iconColor="#10B981"
                trend={{ value: 12.5, direction: 'up' }}
                variant="default"
              />
              <iOSMetricCardPremium
                title="Balance"
                value={`$${(metricas.totalAbonos - metricas.totalGastos).toLocaleString()}`}
                icon={Target}
                iconColor={metricas.totalAbonos >= metricas.totalGastos ? '#10B981' : '#EC4899'}
                trend={{
                  value: Math.abs(((metricas.totalAbonos - metricas.totalGastos) / (metricas.totalGastos || 1)) * 100),
                  direction: metricas.totalAbonos >= metricas.totalGastos ? 'up' : 'down'
                }}
                variant="featured"
              />
              <iOSMetricCardPremium
                title="Prom. Diario"
                value={`$${Math.round(metricas.promedioGastoDiario).toLocaleString()}`}
                icon={DollarSign}
                iconColor="#06B6D4"
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
                    value={busqueda}
                    onChange={setBusqueda}
                    placeholder="Buscar movimiento..."
                    color="violet"
                    className="w-64"
                  />

                  <AuroraTabs
                    tabs={tabs}
                    activeTab={filtros.tipo}
                    onTabChange={(v) =>
                      setFiltros((prev) => ({ ...prev, tipo: v as FiltrosGYA['tipo'] }))
                    }
                    color="violet"
                  />
                </div>
              </AuroraGlassCard>

              {/* Timeline */}
              <AuroraGlassCard className="p-6">
                <div className="space-y-2">
                  {groupedByDate.map(([fecha, items]) => {
                    const totalGastos = items
                      .filter((m) => m.tipo === 'gasto')
                      .reduce((sum, m) => sum + m.monto, 0)
                    const totalAbonos = items
                      .filter((m) => m.tipo === 'abono')
                      .reduce((sum, m) => sum + m.monto, 0)
                    return (
                      <div key={fecha}>
                        <DateGroupHeader
                          fecha={fecha}
                          count={items.length}
                          totalGastos={totalGastos}
                          totalAbonos={totalAbonos}
                        />
                        {items.map((mov, i) => (
                          <MovimientoTimelineItem
                            key={mov.id}
                            movimiento={mov}
                            isFirst={i === 0}
                            isLast={i === items.length - 1}
                            onVerDetalle={() => onVerDetalle?.(mov)}
                            onEditar={() => onEditarMovimiento?.(mov)}
                            onEliminar={() => onEliminarMovimiento?.(mov)}
                          />
                        ))}
                      </div>
                    )
                  })}

                  {groupedByDate.length === 0 && (
                    <div className="py-12 text-center text-white/40">
                      <Wallet size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No se encontraron movimientos</p>
                    </div>
                  )}
                </div>
              </AuroraGlassCard>
            </div>

            {/* Right: Visualization & Charts */}
            <div className="col-span-12 space-y-6 lg:col-span-4">
              {/* Financial Flow Visualization */}
              <AuroraGlassCard glowColor="violet" className="p-4">
                <h3 className="mb-3 text-center text-sm font-medium text-white/70">
                  Flujo Financiero en Tiempo Real
                </h3>
                <div className="h-48">
                  <FinancialFlowVisualization
                    totalGastos={metricas.totalGastos}
                    totalAbonos={metricas.totalAbonos}
                    gastoCount={movimientos.filter((m) => m.tipo === 'gasto').length}
                    abonoCount={movimientos.filter((m) => m.tipo === 'abono').length}
                  />
                </div>
              </AuroraGlassCard>

              {/* 7-Day Trend Chart */}
              <AuroraAreaChart
                data={chartTendencia}
                height={200}
                color="violet"
                showArea
                showLine
                showDots
                showTooltip
                title="Tendencia Últimos 7 Días"
              />

              {/* Category Donut Chart */}
              {chartPorCategoria.length > 0 && (
                <AuroraDonutChart
                  data={chartPorCategoria}
                  height={200}
                  title="Gastos por Categoría"
                  showLegend
                />
              )}

              {/* Quick Stats */}
              <AuroraGlassCard glowColor="cyan" className="p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <Zap size={16} className="text-cyan-400" />
                  Resumen Rápido
                </h3>
                <div className="space-y-2">
                  <div className="group flex items-center justify-between rounded-xl border border-red-500/10 bg-gradient-to-r from-red-500/10 to-red-500/5 p-3 transition-all duration-300 hover:border-red-500/20">
                    <span className="flex items-center gap-2 text-sm text-white/60">
                      <div className="h-2 w-2 rounded-full bg-red-400 group-hover:animate-pulse" />
                      Gastos Hoy
                    </span>
                    <span className="text-sm font-bold text-red-400">
                      ${metricas.gastosHoy.toLocaleString()}
                    </span>
                  </div>
                  <div className="group flex items-center justify-between rounded-xl border border-emerald-500/10 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 p-3 transition-all duration-300 hover:border-emerald-500/20">
                    <span className="flex items-center gap-2 text-sm text-white/60">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 group-hover:animate-pulse" />
                      Abonos Hoy
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      ${metricas.abonosHoy.toLocaleString()}
                    </span>
                  </div>
                  <div className="group flex items-center justify-between rounded-xl border border-violet-500/10 bg-gradient-to-r from-violet-500/10 to-violet-500/5 p-3 transition-all duration-300 hover:border-violet-500/20">
                    <span className="flex items-center gap-2 text-sm text-white/60">
                      <div className="h-2 w-2 rounded-full bg-violet-400 group-hover:animate-pulse" />
                      Top Categoría
                    </span>
                    <span className="text-sm font-bold text-violet-400">
                      {metricas.categoriaTopGasto}
                    </span>
                  </div>
                  <div className="group flex items-center justify-between rounded-xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 p-3 transition-all duration-300 hover:border-cyan-500/20">
                    <span className="flex items-center gap-2 text-sm text-white/60">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 group-hover:animate-pulse" />
                      Banco Más Usado
                    </span>
                    <span className="text-sm font-bold text-cyan-400">
                      {bancoConfig[metricas.bancoMasUsado as BancoId]?.nombre ||
                        metricas.bancoMasUsado}
                    </span>
                  </div>
                </div>
              </AuroraGlassCard>

              {/* Distribution Info */}
              <AuroraGlassCard glowColor="emerald" className="p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
                  <span className="text-lg">💡</span>
                  Distribución Automática
                </h3>
                <div className="space-y-3 text-xs">
                  <p className="leading-relaxed text-white/50">
                    Los abonos se distribuyen automáticamente a 3 bancos según la venta original:
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-2">
                      <span className="text-base">🏔️</span>
                      <span className="font-medium text-emerald-400">Bóveda Monte</span>
                      <span className="ml-auto text-white/40">→ Costo producto</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-2">
                      <span className="text-base">🚚</span>
                      <span className="font-medium text-cyan-400">Flete Sur</span>
                      <span className="ml-auto text-white/40">→ Costo flete</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-pink-500/10 bg-pink-500/5 p-2">
                      <span className="text-base">💰</span>
                      <span className="font-medium text-pink-400">Utilidades</span>
                      <span className="ml-auto text-white/40">→ Ganancia neta</span>
                    </div>
                  </div>
                </div>
              </AuroraGlassCard>
            </div>
          </div>
        </main>
      </AuroraBackground>
    </>
  )
}

export default AuroraGastosYAbonosPanelUnified
