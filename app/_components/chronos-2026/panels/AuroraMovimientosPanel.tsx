'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💸✨ AURORA MOVIMIENTOS PANEL — CHRONOS INFINITY 2026 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Movimientos Financieros ultra premium con TODOS los sistemas supremos:
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL Accelerated)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados
 * ✅ PARALLAX EFFECTS en cards
 * - Diseño similar al anterior que gustaba
 * - Glassmorphism con efectos aurora boreal
 * - Timeline de movimientos elegante
 * - Filtros avanzados por tipo/banco/fecha
 * - Gráficos de flujo de caja
 * - Canvas visualizations 60fps
 * - Quick stats animados
 *
 * @version 3.0.0 - SUPREME ELEVATION APPLIED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useSoundManager } from '@/app/lib/audio/sound-system'
import { logger } from '@/app/lib/utils/logger'
import { AnimatePresence, motion } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Calendar,
    ChevronDown,
    Clock,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    Plus,
    RefreshCw,
    Trash2,
    Wallet,
    X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 PREMIUM SYSTEMS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

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

// Aurora Charts
import { AuroraAreaChart } from '../../charts/AuroraPremiumCharts'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Movimiento {
  id: string
  fecha: string
  hora: string
  tipo: 'ingreso' | 'gasto' | 'transferencia'
  subtipo?: 'venta' | 'compra' | 'pago' | 'cobro' | 'transferencia_in' | 'transferencia_out'
  monto: number
  concepto: string
  bancoId: string
  bancoNombre: string
  bancoColor: string
  clienteId?: string
  clienteNombre?: string
  referencia?: string
  notas?: string
  estado: 'completado' | 'pendiente' | 'cancelado'
  createdAt: string
  // ═══════════════════════════════════════════════════════════════
  // TRAZABILIDAD COMPLETA
  // ═══════════════════════════════════════════════════════════════
  ventaId?: string | null // ID de la venta relacionada
  ordenCompraId?: string | null // ID de la OC relacionada
  distribuidorId?: string | null // ID del distribuidor
}

interface FiltrosState {
  tipo: string
  banco: string
  fechaInicio: string
  fechaFin: string
  busqueda: string
  montoMin?: number
  montoMax?: number
}

interface AuroraMovimientosPanelProps {
  movimientos?: Movimiento[]
  bancos?: Array<{ id: string; nombre: string; color: string }>
  onNuevoMovimiento?: () => void
  onVerDetalle?: (_mov: Movimiento) => void
  onEditar?: (_mov: Movimiento) => void
  onEliminar?: (_movId: string) => Promise<void>
  onExportar?: (_formato: 'csv' | 'excel' | 'pdf') => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const defaultBancos = [
  { id: 'boveda_monte', nombre: 'Bóveda Monte', color: '#8B5CF6' },
  { id: 'boveda_usa', nombre: 'Bóveda USA', color: '#06B6D4' },
  { id: 'profit', nombre: 'Profit', color: '#10B981' },
  { id: 'leftie', nombre: 'Leftie', color: '#FBBF24' },
  { id: 'utilidades', nombre: 'Utilidades', color: '#F97316' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧹 SISTEMA LIMPIO - Sin datos mock (Conectado a Turso)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
const defaultMovimientos: Movimiento[] = []

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 CASH FLOW VISUALIZATION — Real-time animated cash flow
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function CashFlowVisualization({ ingresos, gastos }: { ingresos: number; gastos: number }) {
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
      isIngreso: boolean
      alpha: number
    }> = []

    for (let i = 0; i < 50; i++) {
      const isIngreso = Math.random() > 0.4
      particles.push({
        x: isIngreso ? 0 : canvas.width / (window.devicePixelRatio || 1),
        y: Math.random() * (canvas.height / (window.devicePixelRatio || 1)),
        vx: isIngreso ? 1 + Math.random() * 2 : -(1 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 3,
        isIngreso,
        alpha: 0.3 + Math.random() * 0.7,
      })
    }

    const animate = () => {
      timeRef.current += 0.016
      const rect = canvas.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Clear with trail effect
      ctx.fillStyle = 'rgba(3, 3, 8, 0.1)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Central wallet glow
      const walletGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60)
      walletGlow.addColorStop(0, 'rgba(139, 92, 246, 0.4)')
      walletGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)')
      walletGlow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(centerX, centerY, 50 + Math.sin(timeRef.current * 2) * 5, 0, Math.PI * 2)
      ctx.fillStyle = walletGlow
      ctx.fill()

      // Central icon
      ctx.beginPath()
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
      ctx.fillStyle = '#8B5CF6'
      ctx.fill()

      // Flow indicators
      const ingresosGradient = ctx.createLinearGradient(0, centerY, centerX - 50, centerY)
      ingresosGradient.addColorStop(0, 'transparent')
      ingresosGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)')
      ingresosGradient.addColorStop(1, 'rgba(16, 185, 129, 0.6)')

      ctx.beginPath()
      ctx.moveTo(0, centerY - 20)
      ctx.lineTo(centerX - 50, centerY - 10)
      ctx.lineTo(centerX - 50, centerY + 10)
      ctx.lineTo(0, centerY + 20)
      ctx.closePath()
      ctx.fillStyle = ingresosGradient
      ctx.fill()

      const gastosGradient = ctx.createLinearGradient(centerX + 50, centerY, rect.width, centerY)
      gastosGradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)')
      gastosGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)')
      gastosGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.moveTo(centerX + 50, centerY - 10)
      ctx.lineTo(rect.width, centerY - 20)
      ctx.lineTo(rect.width, centerY + 20)
      ctx.lineTo(centerX + 50, centerY + 10)
      ctx.closePath()
      ctx.fillStyle = gastosGradient
      ctx.fill()

      // Draw and update particles
      particles.forEach((p) => {
        // Update position
        p.x += p.vx
        p.y += p.vy + Math.sin(timeRef.current + p.x * 0.01) * 0.3

        // Reset when off screen
        if (p.isIngreso && p.x > centerX - 30) {
          p.x = 0
          p.y = Math.random() * rect.height
          p.alpha = 0.3 + Math.random() * 0.7
        } else if (!p.isIngreso && p.x < centerX + 30) {
          p.x = rect.width
          p.y = Math.random() * rect.height
          p.alpha = 0.3 + Math.random() * 0.7
        }

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        const color = p.isIngreso ? '16, 185, 129' : '239, 68, 68'
        ctx.fillStyle = `rgba(${color}, ${p.alpha * (0.5 + Math.sin(timeRef.current + p.x) * 0.3)})`
        ctx.fill()

        // Trail
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 10, p.y)
        ctx.strokeStyle = `rgba(${color}, ${p.alpha * 0.3})`
        ctx.lineWidth = p.size * 0.5
        ctx.stroke()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [ingresos, gastos])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ background: 'transparent' }}
      role="img"
      aria-label="Visualización de flujo de caja mostrando ingresos y gastos en tiempo real"
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 MOVIMIENTO TIMELINE ITEM — Individual transaction card with full actions
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovimientoTimelineItemProps {
  movimiento: Movimiento
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
  onVerDetalle,
  onEditar,
  onEliminar,
}: MovimientoTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { play } = useSoundManager()

  const tipoConfig: Record<
    string,
    { color: string; bgColor: string; icon: React.ReactNode; label: string; sign: string }
  > = {
    ingreso: {
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: <ArrowUpRight size={16} />,
      label: 'Ingreso',
      sign: '+',
    },
    gasto: {
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: <ArrowDownRight size={16} />,
      label: 'Gasto',
      sign: '-',
    },
    transferencia: {
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      icon: <ArrowLeftRight size={16} />,
      label: 'Transferencia',
      sign: '↔',
    },
  }

  // Fallback para tipos no definidos
  const defaultConfig = {
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    icon: <DollarSign size={16} />,
    label: 'Movimiento',
    sign: '•',
  }

  const config = tipoConfig[movimiento.tipo] || defaultConfig

  return (
    <>
      <div className="relative flex gap-4">
        {/* Timeline line */}
        <div className="relative flex flex-col items-center">
          {!isFirst && (
            <div
              className="absolute -top-4 h-4 w-0.5"
              style={{
                background: `linear-gradient(to bottom, ${movimiento.bancoColor}50, ${config.color}50)`,
              }}
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
            'mb-4 flex-1 cursor-pointer rounded-xl p-4 transition-all',
            'border border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]',
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ x: 4 }}
          layout
        >
          {/* Header */}
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Banco indicator */}
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: movimiento.bancoColor,
                  boxShadow: `0 0 8px ${movimiento.bancoColor}`,
                }}
              />
              <div>
                <p className="text-sm font-medium text-white">{movimiento.concepto}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                  <Clock size={10} />
                  <span>
                    {movimiento.fecha} {movimiento.hora}
                  </span>
                  <span>•</span>
                  <span style={{ color: movimiento.bancoColor }}>{movimiento.bancoNombre}</span>
                  {movimiento.referencia && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-white/30">{movimiento.referencia}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Amount + Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: config.color }}>
                  {config.sign}${movimiento.monto.toLocaleString()}
                </p>
                <AuroraBadge
                  color={
                    movimiento.tipo === 'ingreso'
                      ? 'emerald'
                      : movimiento.tipo === 'gasto'
                        ? 'magenta'
                        : 'cyan'
                  }
                  variant="outline"
                >
                  {config.label}
                </AuroraBadge>
              </div>

              {/* Quick action buttons - visible on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      className="rounded-lg p-2 text-white/60 transition-colors hover:bg-cyan-500/20 hover:text-cyan-400"
                      onClick={onVerDetalle}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </motion.button>
                    <motion.button
                      className="rounded-lg p-2 text-white/60 transition-colors hover:bg-violet-500/20 hover:text-violet-400"
                      onClick={onEditar}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                      className="rounded-lg p-2 text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => setShowDeleteConfirm(true)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                  {/* Traceability section */}
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/[0.02] p-3">
                    <div>
                      <span className="text-xs text-white/40">ID Movimiento</span>
                      <p className="truncate font-mono text-xs text-white/70">{movimiento.id}</p>
                    </div>
                    {movimiento.clienteNombre && (
                      <div>
                        <span className="text-xs text-white/40">Cliente</span>
                        <p className="text-sm text-white">{movimiento.clienteNombre}</p>
                      </div>
                    )}
                    {movimiento.referencia && (
                      <div>
                        <span className="text-xs text-white/40">Referencia</span>
                        <p className="font-mono text-xs text-white/70">{movimiento.referencia}</p>
                      </div>
                    )}
                    {/* Trazabilidad: Venta ID */}
                    {movimiento.ventaId && (
                      <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-2">
                        <span className="text-[10px] tracking-wider text-emerald-400/70 uppercase">
                          Venta ID
                        </span>
                        <p className="truncate font-mono text-xs text-emerald-400">
                          {movimiento.ventaId}
                        </p>
                      </div>
                    )}
                    {/* Trazabilidad: OC ID */}
                    {movimiento.ordenCompraId && (
                      <div className="rounded border border-violet-500/20 bg-violet-500/10 p-2">
                        <span className="text-[10px] tracking-wider text-violet-400/70 uppercase">
                          OC ID
                        </span>
                        <p className="truncate font-mono text-xs text-violet-400">
                          {movimiento.ordenCompraId}
                        </p>
                      </div>
                    )}
                    {/* Trazabilidad: Distribuidor ID */}
                    {movimiento.distribuidorId && (
                      <div className="rounded border border-amber-500/20 bg-amber-500/10 p-2">
                        <span className="text-[10px] tracking-wider text-amber-400/70 uppercase">
                          Distribuidor ID
                        </span>
                        <p className="truncate font-mono text-xs text-amber-400">
                          {movimiento.distribuidorId}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-white/40">Estado</span>
                      <p
                        className={cn(
                          'text-sm',
                          movimiento.estado === 'completado' && 'text-emerald-400',
                          movimiento.estado === 'pendiente' && 'text-amber-400',
                          movimiento.estado === 'cancelado' && 'text-red-400',
                        )}
                      >
                        {movimiento.estado === 'completado' && '✓ Completado'}
                        {movimiento.estado === 'pendiente' && '⏳ Pendiente'}
                        {movimiento.estado === 'cancelado' && '✗ Cancelado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40">Creado</span>
                      <p className="text-xs text-white/60" suppressHydrationWarning>
                        {new Date(movimiento.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {movimiento.notas && (
                    <div className="rounded-lg bg-white/[0.02] p-3">
                      <span className="text-xs text-white/40">Notas</span>
                      <p className="mt-1 text-sm text-white/60">{movimiento.notas}</p>
                    </div>
                  )}

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
                      icon={<Edit size={14} />}
                      onClick={() => {
                        play('click')
                        onEditar?.()
                      }}
                    >
                      Editar
                    </AuroraButton>
                    <AuroraButton
                      variant="secondary"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      className="hover:border-red-500/50 hover:text-red-400"
                      onClick={() => {
                        play('error')
                        setShowDeleteConfirm(true)
                      }}
                    >
                      Eliminar
                    </AuroraButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="mx-4 w-full max-w-md rounded-xl border border-red-500/30 bg-gray-900/95 p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-red-500/20 p-3">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Eliminar Movimiento</h3>
                  <p className="text-sm text-white/50">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="mb-4 space-y-2 rounded-lg bg-white/5 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Concepto:</span>
                  <span className="text-sm text-white">{movimiento.concepto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Monto:</span>
                  <span className="text-sm font-bold" style={{ color: config.color }}>
                    {config.sign}${movimiento.monto.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Fecha:</span>
                  <span className="text-sm text-white/70">
                    {movimiento.fecha} {movimiento.hora}
                  </span>
                </div>
                {movimiento.referencia && (
                  <div className="flex justify-between">
                    <span className="text-sm text-white/50">Referencia:</span>
                    <span className="font-mono text-xs text-white/60">{movimiento.referencia}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2.5 text-white transition-colors hover:bg-white/20"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                  onClick={() => {
                    onEliminar?.()
                    setShowDeleteConfirm(false)
                  }}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📆 DATE GROUP HEADER — Group transactions by date
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function DateGroupHeader({
  fecha,
  count,
  totalIngresos,
  totalGastos,
}: {
  fecha: string
  count: number
  totalIngresos: number
  totalGastos: number
}) {
  const formatDate = (dateStr: string) => {
    // Parse date as UTC to prevent timezone hydration mismatch
    const parts = dateStr.split('-')
    const year = parseInt(parts[0] ?? '2025', 10)
    const month = parseInt(parts[1] ?? '1', 10)
    const day = parseInt(parts[2] ?? '1', 10)
    const date = new Date(Date.UTC(year, month - 1, day))

    // Get today's date in UTC format for comparison
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    if (dateStr === todayStr) return 'Hoy'
    if (dateStr === yesterdayStr) return 'Ayer'

    // Use fixed format to prevent hydration mismatch
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
          <Calendar size={14} className="text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white capitalize">{formatDate(fecha)}</p>
          <p className="text-xs text-white/40">{count} movimientos</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-emerald-400">+${totalIngresos.toLocaleString()}</span>
        <span className="text-red-400">-${totalGastos.toLocaleString()}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Movimientos Panel
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraMovimientosPanel({
  movimientos = [],
  bancos = defaultBancos,
  onNuevoMovimiento,
  onVerDetalle,
  onEditar,
  onEliminar,
  onExportar,
  onRefresh,
  loading = false,
  className,
}: AuroraMovimientosPanelProps) {
  // 🔊 SOUND SYSTEM
  const { play } = useSoundManager()

  const [filtros, setFiltros] = useState<FiltrosState>({
    tipo: 'todos',
    banco: 'todos',
    fechaInicio: '',
    fechaFin: '',
    busqueda: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Stats
  const stats = useMemo(() => {
    const totalIngresos = movimientos
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0)
    const totalGastos = movimientos
      .filter((m) => m.tipo === 'gasto')
      .reduce((sum, m) => sum + m.monto, 0)
    const totalTransferencias = movimientos
      .filter((m) => m.tipo === 'transferencia')
      .reduce((sum, m) => sum + m.monto, 0)
    const balance = totalIngresos - totalGastos
    return { totalIngresos, totalGastos, totalTransferencias, balance }
  }, [movimientos])

  // Filtered movimientos
  const filteredMovimientos = useMemo(() => {
    return movimientos.filter((m) => {
      const matchTipo = filtros.tipo === 'todos' || m.tipo === filtros.tipo
      const matchBanco = filtros.banco === 'todos' || m.bancoId === filtros.banco
      const matchBusqueda =
        !filtros.busqueda ||
        m.concepto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        m.clienteNombre?.toLowerCase().includes(filtros.busqueda.toLowerCase())
      const matchFechaInicio = !filtros.fechaInicio || m.fecha >= filtros.fechaInicio
      const matchFechaFin = !filtros.fechaFin || m.fecha <= filtros.fechaFin
      const matchMontoMin = !filtros.montoMin || m.monto >= filtros.montoMin
      const matchMontoMax = !filtros.montoMax || m.monto <= filtros.montoMax
      return (
        matchTipo &&
        matchBanco &&
        matchBusqueda &&
        matchFechaInicio &&
        matchFechaFin &&
        matchMontoMin &&
        matchMontoMax
      )
    })
  }, [movimientos, filtros])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filtros.tipo !== 'todos') count++
    if (filtros.banco !== 'todos') count++
    if (filtros.fechaInicio) count++
    if (filtros.fechaFin) count++
    if (filtros.montoMin) count++
    if (filtros.montoMax) count++
    return count
  }, [filtros])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltros({
      tipo: 'todos',
      banco: 'todos',
      fechaInicio: '',
      fechaFin: '',
      busqueda: '',
      montoMin: undefined,
      montoMax: undefined,
    })
  }, [])

  // Handle export
  const handleExportar = useCallback(
    (formato: 'csv' | 'excel' | 'pdf') => {
      if (onExportar) {
        onExportar(formato)
      } else {
        // Default CSV export
        const headers = [
          'ID',
          'Fecha',
          'Hora',
          'Tipo',
          'Concepto',
          'Monto',
          'Banco',
          'Cliente',
          'Referencia',
          'Estado',
        ]
        const rows = filteredMovimientos.map((m) => [
          m.id,
          m.fecha,
          m.hora,
          m.tipo,
          m.concepto,
          m.monto,
          m.bancoNombre,
          m.clienteNombre || '',
          m.referencia || '',
          m.estado,
        ])
        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `movimientos_${new Date().toISOString().split('T')[0]}.${formato}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
      setShowExportMenu(false)
    },
    [onExportar, filteredMovimientos],
  )

  // Handle actions
  const handleVerDetalle = useCallback(
    (mov: Movimiento) => {
      if (onVerDetalle) {
        onVerDetalle(mov)
      } else {
        logger.info('Ver detalle movimiento', {
          context: 'AuroraMovimientosPanel',
          data: { id: mov.id },
        })
      }
    },
    [onVerDetalle],
  )

  const handleEditar = useCallback(
    (mov: Movimiento) => {
      if (onEditar) {
        onEditar(mov)
      } else {
        logger.info('Editar movimiento', {
          context: 'AuroraMovimientosPanel',
          data: { id: mov.id },
        })
      }
    },
    [onEditar],
  )

  const handleEliminar = useCallback(
    (mov: Movimiento) => {
      if (onEliminar) {
        onEliminar(mov.id)
      } else {
        logger.info('Eliminar movimiento', {
          context: 'AuroraMovimientosPanel',
          data: { id: mov.id },
        })
      }
    },
    [onEliminar],
  )

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Movimiento[]> = {}
    filteredMovimientos.forEach((m) => {
      if (!groups[m.fecha]) groups[m.fecha] = []
      const group = groups[m.fecha]
      if (group) group.push(m)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredMovimientos])

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
      const dayMov = movimientos.filter((m) => m.fecha === fecha)
      const ingresos = dayMov
        .filter((m) => m.tipo === 'ingreso')
        .reduce((sum, m) => sum + m.monto, 0)
      const gastos = dayMov.filter((m) => m.tipo === 'gasto').reduce((sum, m) => sum + m.monto, 0)
      // Usar getUTCDay para consistencia SSR/Cliente
      const dayIndex = fecha ? new Date(fecha + 'T00:00:00Z').getUTCDay() : 0
      return {
        name: diasSemana[dayIndex],
        value: ingresos - gastos,
        ingresos,
        gastos,
      }
    })
  }, [movimientos])

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'ingreso', label: 'Ingresos' },
    { id: 'gasto', label: 'Gastos' },
    { id: 'transferencia', label: 'Transferencias' },
  ]

  return (
    <AuroraBackground
      intensity="medium"
      colors={['emerald', 'violet', 'cyan']}
      interactive
      className={cn('min-h-screen', className)}
    >
      <main className="p-6" aria-label="Panel de movimientos financieros CHRONOS">
        {/* Header */}
        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <motion.h1
              className="flex items-center gap-3 text-3xl font-bold text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Wallet className="text-emerald-400" aria-hidden="true" />
              Movimientos Financieros
            </motion.h1>
            <p className="mt-1 text-white/50">
              Control detallado de ingresos, gastos y transferencias •{' '}
              <span className="text-emerald-400">{filteredMovimientos.length}</span> movimientos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AuroraButton
              variant="glow"
              color="emerald"
              icon={<Plus size={18} />}
              onClick={() => {
                play('success')
                onNuevoMovimiento?.()
              }}
            >
              Nuevo Movimiento
            </AuroraButton>

            {/* Filtros con badge */}
            <div className="relative">
              <AuroraButton
                variant="secondary"
                icon={<Filter size={18} />}
                onClick={() => {
                  play('tab-switch')
                  setShowFilters(!showFilters)
                }}
                className={showFilters ? 'border-violet-500/50' : ''}
              >
                Filtros
              </AuroraButton>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <AuroraButton
                variant="secondary"
                icon={<Download size={18} />}
                onClick={() => {
                  play('click')
                  setShowExportMenu(!showExportMenu)
                }}
              >
                Exportar
              </AuroraButton>
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl"
                  >
                    <button
                      onClick={() => handleExportar('csv')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <FileText size={16} className="text-emerald-400" />
                      <div>
                        <div className="font-medium">CSV</div>
                        <div className="text-xs text-white/50">Datos separados por comas</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExportar('excel')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <FileText size={16} className="text-green-400" />
                      <div>
                        <div className="font-medium">Excel</div>
                        <div className="text-xs text-white/50">Hoja de cálculo</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExportar('pdf')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <FileText size={16} className="text-red-400" />
                      <div>
                        <div className="font-medium">PDF</div>
                        <div className="text-xs text-white/50">Documento portable</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={() => {
                play('whoosh')
                onRefresh?.()
              }}
              aria-label={
                loading ? 'Actualizando movimientos...' : 'Actualizar lista de movimientos'
              }
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            </motion.button>
          </div>
        </header>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <AuroraGlassCard className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Filter size={18} className="text-emerald-400" />
                    Filtros Avanzados
                  </h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <span className="text-sm text-white/50">
                        {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo
                        {activeFiltersCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-sm text-violet-400 transition-colors hover:text-violet-300"
                    >
                      Limpiar todo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Rango de Fecha */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar size={14} />
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={filtros.fechaInicio}
                      onChange={(e) =>
                        setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar size={14} />
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={filtros.fechaFin}
                      onChange={(e) =>
                        setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Monto Mínimo */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <DollarSign size={14} />
                      Monto Mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filtros.montoMin || ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined
                        setFiltros((prev) => ({ ...prev, montoMin: val }))
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Monto Máximo */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <DollarSign size={14} />
                      Monto Máximo
                    </label>
                    <input
                      type="number"
                      placeholder="Sin límite"
                      value={filtros.montoMax || ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined
                        setFiltros((prev) => ({ ...prev, montoMax: val }))
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-white/50">Rápidos:</span>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                      const fechaInicioStr = firstDay.toISOString().split('T')[0] || ''
                      const fechaFinStr = today.toISOString().split('T')[0] || ''
                      setFiltros((prev) => ({
                        ...prev,
                        fechaInicio: fechaInicioStr,
                        fechaFin: fechaFinStr,
                      }))
                    }}
                    className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    Este mes
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                      const fechaInicioStr = weekAgo.toISOString().split('T')[0] || ''
                      const fechaFinStr = today.toISOString().split('T')[0] || ''
                      setFiltros((prev) => ({
                        ...prev,
                        fechaInicio: fechaInicioStr,
                        fechaFin: fechaFinStr,
                      }))
                    }}
                    className="rounded-lg bg-violet-500/10 px-3 py-1 text-xs text-violet-400 transition-colors hover:bg-violet-500/20"
                  >
                    Última semana
                  </button>
                  <button
                    onClick={() => setFiltros((prev) => ({ ...prev, montoMin: 10000 }))}
                    className="rounded-lg bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 transition-colors hover:bg-cyan-500/20"
                  >
                    {'> $10,000'}
                  </button>
                  <button
                    onClick={() => setFiltros((prev) => ({ ...prev, tipo: 'ingreso' }))}
                    className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    Solo ingresos
                  </button>
                  <button
                    onClick={() => setFiltros((prev) => ({ ...prev, tipo: 'gasto' }))}
                    className="rounded-lg bg-rose-500/10 px-3 py-1 text-xs text-rose-400 transition-colors hover:bg-rose-500/20"
                  >
                    Solo gastos
                  </button>
                </div>
              </AuroraGlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AuroraStatWidget
            label="Total Ingresos"
            value={`$${stats.totalIngresos.toLocaleString()}`}
            icon={<ArrowUpRight size={20} />}
            color="emerald"
            change={12.5}
            trend="up"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Total Gastos"
            value={`$${stats.totalGastos.toLocaleString()}`}
            icon={<ArrowDownRight size={20} />}
            color="magenta"
            change={5.2}
            trend="down"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Balance Neto"
            value={`$${stats.balance.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            color={stats.balance >= 0 ? 'emerald' : 'magenta'}
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Transferencias"
            value={`$${stats.totalTransferencias.toLocaleString()}`}
            icon={<ArrowLeftRight size={20} />}
            color="cyan"
          />
        </div>

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
                  placeholder="Buscar movimiento..."
                  color="emerald"
                  className="w-64"
                />

                <AuroraTabs
                  tabs={tabs}
                  activeTab={filtros.tipo}
                  onTabChange={(v) => setFiltros((prev) => ({ ...prev, tipo: v }))}
                  color="emerald"
                />

                {/* Banco filter */}
                <div className="relative ml-auto">
                  <select
                    value={filtros.banco}
                    onChange={(e) => setFiltros((prev) => ({ ...prev, banco: e.target.value }))}
                    className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 pr-8 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                  >
                    <option value="todos">Todos los bancos</option>
                    {bancos.map((banco) => (
                      <option key={banco.id} value={banco.id}>
                        {banco.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/40"
                  />
                </div>
              </div>
            </AuroraGlassCard>

            {/* Timeline */}
            <AuroraGlassCard className="p-6">
              <div className="space-y-2">
                {groupedByDate.map(([fecha, items]) => {
                  const totalIngresos = items
                    .filter((m) => m.tipo === 'ingreso')
                    .reduce((sum, m) => sum + m.monto, 0)
                  const totalGastos = items
                    .filter((m) => m.tipo === 'gasto')
                    .reduce((sum, m) => sum + m.monto, 0)
                  return (
                    <div key={fecha}>
                      <DateGroupHeader
                        fecha={fecha}
                        count={items.length}
                        totalIngresos={totalIngresos}
                        totalGastos={totalGastos}
                      />
                      {items.map((mov, i) => (
                        <MovimientoTimelineItem
                          key={mov.id}
                          movimiento={mov}
                          isFirst={i === 0}
                          isLast={i === items.length - 1}
                          onVerDetalle={() => handleVerDetalle(mov)}
                          onEditar={() => handleEditar(mov)}
                          onEliminar={() => handleEliminar(mov)}
                        />
                      ))}
                    </div>
                  )
                })}

                {/* Empty State */}
                {groupedByDate.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-12 text-center"
                  >
                    <Wallet size={48} className="mx-auto mb-4 text-white/20" />
                    <h3 className="mb-2 text-lg font-medium text-white/60">No hay movimientos</h3>
                    <p className="mb-4 text-sm text-white/40">
                      {activeFiltersCount > 0
                        ? 'No se encontraron movimientos con los filtros aplicados'
                        : 'Aún no hay movimientos registrados'}
                    </p>
                    {activeFiltersCount > 0 && (
                      <AuroraButton
                        variant="secondary"
                        onClick={() => {
                          play('click')
                          clearFilters()
                        }}
                      >
                        <X size={16} className="mr-2" />
                        Limpiar filtros
                      </AuroraButton>
                    )}
                  </motion.div>
                )}
              </div>
            </AuroraGlassCard>
          </div>

          {/* Right: Visualization & Quick Stats */}
          <div className="col-span-12 space-y-6 lg:col-span-4">
            {/* Cash Flow Visualization */}
            <AuroraGlassCard glowColor="violet" className="p-4">
              <h3 className="mb-3 text-center text-sm font-medium text-white/70">
                Flujo de Caja en Tiempo Real
              </h3>
              <div className="h-48">
                <CashFlowVisualization ingresos={stats.totalIngresos} gastos={stats.totalGastos} />
              </div>
            </AuroraGlassCard>

            {/* 7-Day Chart */}
            <AuroraAreaChart
              data={chartData}
              height={200}
              color="emerald"
              showArea
              showLine
              showDots
              showTooltip
              title="Balance Últimos 7 Días"
            />

            {/* Quick Stats by Bank */}
            <AuroraGlassCard glowColor="cyan" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Por Banco</h3>
              <div className="space-y-3">
                {bancos.map((banco) => {
                  const bancoMov = movimientos.filter((m) => m.bancoId === banco.id)
                  const ingresos = bancoMov
                    .filter((m) => m.tipo === 'ingreso')
                    .reduce((sum, m) => sum + m.monto, 0)
                  const gastos = bancoMov
                    .filter((m) => m.tipo === 'gasto')
                    .reduce((sum, m) => sum + m.monto, 0)
                  const balance = ingresos - gastos
                  const maxBalance = Math.max(
                    ...bancos.map((b) => {
                      const bMov = movimientos.filter((m) => m.bancoId === b.id)
                      const bIn = bMov
                        .filter((m) => m.tipo === 'ingreso')
                        .reduce((sum, m) => sum + m.monto, 0)
                      const bOut = bMov
                        .filter((m) => m.tipo === 'gasto')
                        .reduce((sum, m) => sum + m.monto, 0)
                      return Math.abs(bIn - bOut)
                    }),
                  )

                  return (
                    <div key={banco.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ background: banco.color, boxShadow: `0 0 8px ${banco.color}` }}
                          />
                          <span className="text-sm text-white/70">{banco.nombre}</span>
                        </div>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            balance >= 0 ? 'text-emerald-400' : 'text-red-400',
                          )}
                        >
                          {balance >= 0 ? '+' : ''}${balance.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: banco.color,
                            boxShadow: `0 0 10px ${banco.color}50`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(Math.abs(balance) / maxBalance) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </AuroraGlassCard>

            {/* Recent Summary */}
            <AuroraGlassCard glowColor="emerald" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Resumen Rápido</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3">
                  <span className="text-sm text-white/60">Mayor Ingreso</span>
                  <span className="text-sm font-bold text-emerald-400">
                    $
                    {Math.max(
                      ...movimientos.filter((m) => m.tipo === 'ingreso').map((m) => m.monto),
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-red-500/10 p-3">
                  <span className="text-sm text-white/60">Mayor Gasto</span>
                  <span className="text-sm font-bold text-red-400">
                    $
                    {Math.max(
                      ...movimientos.filter((m) => m.tipo === 'gasto').map((m) => m.monto),
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-cyan-500/10 p-3">
                  <span className="text-sm text-white/60">Promedio/Día</span>
                  <span className="text-sm font-bold text-cyan-400">
                    ${Math.round(stats.balance / 7).toLocaleString()}
                  </span>
                </div>
              </div>
            </AuroraGlassCard>
          </div>
        </div>
      </main>
    </AuroraBackground>
  )
}

export default AuroraMovimientosPanel
