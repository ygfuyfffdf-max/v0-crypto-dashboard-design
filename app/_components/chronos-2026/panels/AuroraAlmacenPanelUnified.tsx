'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏭✨ AURORA ALMACEN PANEL UNIFIED — CHRONOS INFINITY 2026 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Almacén/Inventario ultra premium con TODOS los sistemas supremos:
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL Accelerated)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados
 * ✅ PARALLAX EFFECTS en cards
 * - Glassmorphism con efectos aurora boreal
 * - Grid de productos con timeline de movimientos
 * - Filtros avanzados por categoría/stock
 * - Visualización de inventario animada con Canvas 60fps
 * - Quick stats animados
 * - KPIs con tendencias y alertas de stock
 *
 * @version 3.0.0 - SUPREME ELEVATION APPLIED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useOrdenes } from '@/app/_hooks/useOrdenes'
import { cn } from '@/app/_lib/utils'
import { useAlmacenData } from '@/app/hooks/useDataHooks'
import { useSoundManager } from '@/app/lib/audio/sound-system'
import { AnimatePresence, motion } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownLeft,
  ArrowUp,
  ArrowUpRight,
  CheckCircle,
  ClipboardCheck,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  History,
  Package,
  PackageMinus,
  PackagePlus,
  Plus,
  RefreshCw,
  Scissors,
  Trash2,
  TrendingDown,
  TrendingUp,
  Warehouse,
  X,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 PREMIUM SYSTEMS INTEGRATION (QUANTUM OPTIMIZED)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import '@/app/_components/chronos-2026/animations/CinematicAnimations'
import { AlmacenBackground } from '@/app/_components/chronos-2026/particles/ParticleSystems'
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

// Aurora Charts - Lazy Loaded for performance
const AuroraAreaChart = dynamic(
  () => import('../../charts/AuroraPremiumCharts').then((mod) => mod.AuroraAreaChart),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  },
)
const AuroraBarChart = dynamic(
  () => import('../../charts/AuroraPremiumCharts').then((mod) => mod.AuroraBarChart),
  {
    loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  },
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ProductoAlmacen {
  id: string
  nombre: string
  sku: string
  categoria: string
  stockActual: number
  stockMinimo: number
  stockMaximo: number
  precioUnitario: number
  valorInventario: number
  ultimoMovimiento: string
  ubicacion: string
  estado: 'normal' | 'bajo' | 'critico' | 'exceso'
}

interface MovimientoAlmacen {
  id: string
  fecha: string
  hora: string
  tipo: 'entrada' | 'salida' | 'ajuste'
  producto: string
  productoId: string
  cantidad: number
  motivo: string
  usuario: string
}

interface EntradaAlmacen {
  id: string
  fecha: string
  hora: string
  productoId: string
  productoNombre: string
  cantidad: number
  ordenCompraId?: string
  proveedor?: string
  precioUnitario: number
  lote?: string
  fechaCaducidad?: string
  usuario: string
  notas?: string
}

interface SalidaAlmacen {
  id: string
  fecha: string
  hora: string
  productoId: string
  productoNombre: string
  cantidad: number
  ventaId?: string
  clienteNombre?: string
  motivo: 'venta' | 'devolucion' | 'merma' | 'traslado' | 'otro'
  usuario: string
  notas?: string
}

interface CorteInventario {
  id: string
  fecha: string
  hora: string
  productoId: string
  productoNombre: string
  stockSistema: number
  stockFisico: number
  diferencia: number
  estado: 'correcto' | 'faltante' | 'sobrante'
  ajusteRealizado: boolean
  usuario: string
  notas?: string
}

interface FiltrosState {
  estado: string
  busqueda: string
  categoria: string
  tipoMovimiento: string
  fechaInicio: string
  fechaFin: string
  deudaFilter: 'todos' | 'faltante' | 'sobrante' | 'correcto'
}

interface AuroraAlmacenPanelUnifiedProps {
  productos?: ProductoAlmacen[]
  movimientos?: MovimientoAlmacen[]
  entradas?: EntradaAlmacen[]
  salidas?: SalidaAlmacen[]
  cortes?: CorteInventario[]
  onNuevoProducto?: () => void
  onNuevoMovimiento?: () => void
  onNuevaEntrada?: () => void
  onNuevaSalida?: () => void
  onNuevoCorte?: () => void
  onVerProducto?: (_producto: ProductoAlmacen) => void
  onEditarProducto?: (_producto: ProductoAlmacen) => void
  onEliminarProducto?: (_producto: ProductoAlmacen) => void
  onVerEntrada?: (_entrada: EntradaAlmacen) => void
  onEditarEntrada?: (_entrada: EntradaAlmacen) => void
  onEliminarEntrada?: (_entrada: EntradaAlmacen) => void
  onVerSalida?: (_salida: SalidaAlmacen) => void
  onEditarSalida?: (_salida: SalidaAlmacen) => void
  onEliminarSalida?: (_salida: SalidaAlmacen) => void
  onVerCorte?: (_corte: CorteInventario) => void
  onEditarCorte?: (_corte: CorteInventario) => void
  onEliminarCorte?: (_corte: CorteInventario) => void
  onAjustarInventario?: (_corte: CorteInventario) => void
  onVerHistorial?: (_productoId: string) => void
  onExportar?: (_formato: 'csv' | 'excel' | 'pdf', _tipo: string) => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧹 SISTEMA LIMPIO - Sin datos mock (Conectado a Turso)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const _defaultProductos: ProductoAlmacen[] = []

const defaultMovimientos: MovimientoAlmacen[] = []

const defaultEntradas: EntradaAlmacen[] = []

const defaultSalidas: SalidaAlmacen[] = []

const defaultCortes: CorteInventario[] = []

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 INVENTORY VISUALIZATION — Animated warehouse view
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function InventoryVisualization({
  normal,
  bajo,
  critico,
  exceso,
}: {
  normal: number
  bajo: number
  critico: number
  exceso: number
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
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Boxes representing inventory items
    const boxes: Array<{
      x: number
      y: number
      size: number
      color: string
      phase: number
      row: number
      col: number
    }> = []

    const total = normal + bajo + critico + exceso
    const cols = 6
    const rows = Math.ceil(total / cols)
    const boxSize = 18
    const spacing = 24
    const startX = centerX - (cols * spacing) / 2
    const startY = centerY - (rows * spacing) / 2

    let index = 0
    const addBoxes = (count: number, color: string) => {
      for (let i = 0; i < count && index < total; i++) {
        const col = index % cols
        const row = Math.floor(index / cols)
        boxes.push({
          x: startX + col * spacing,
          y: startY + row * spacing,
          size: boxSize,
          color,
          phase: Math.random() * Math.PI * 2,
          row,
          col,
        })
        index++
      }
    }

    addBoxes(normal, '#10B981')
    addBoxes(bajo, '#FBBF24')
    addBoxes(critico, '#EF4444')
    addBoxes(exceso, '#8B5CF6')

    const animate = () => {
      timeRef.current += 0.016

      // Clear
      ctx.fillStyle = 'rgba(3, 3, 8, 0.1)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Central warehouse icon glow
      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80)
      glow.addColorStop(0, 'rgba(245, 158, 11, 0.2)')
      glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)')
      glow.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(centerX, centerY, 70 + Math.sin(timeRef.current) * 5, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Draw boxes
      boxes.forEach((box, _i) => {
        const pulse = Math.sin(timeRef.current * 2 + box.phase) * 0.15 + 1
        const hoverEffect = Math.sin(timeRef.current + box.row * 0.3 + box.col * 0.2) * 2

        // Box shadow/glow
        ctx.shadowColor = box.color
        ctx.shadowBlur = 8

        // Box
        ctx.fillStyle = box.color
        ctx.fillRect(
          box.x - (box.size * pulse) / 2 + hoverEffect,
          box.y - (box.size * pulse) / 2,
          box.size * pulse,
          box.size * pulse,
        )

        ctx.shadowBlur = 0

        // Box outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(
          box.x - (box.size * pulse) / 2 + hoverEffect,
          box.y - (box.size * pulse) / 2,
          box.size * pulse,
          box.size * pulse,
        )
      })

      // Legend
      const legendY = rect.height - 20
      const colors = [
        { color: '#10B981', label: `Normal (${normal})`, x: rect.width * 0.1 },
        { color: '#FBBF24', label: `Bajo (${bajo})`, x: rect.width * 0.35 },
        { color: '#EF4444', label: `Crítico (${critico})`, x: rect.width * 0.6 },
        { color: '#8B5CF6', label: `Exceso (${exceso})`, x: rect.width * 0.85 },
      ]

      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      colors.forEach(({ color, label, x }) => {
        ctx.fillStyle = color
        ctx.fillRect(x - 25, legendY - 8, 8, 8)
        ctx.fillStyle = '#ffffff80'
        ctx.fillText(label, x + 10, legendY)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [normal, bajo, critico, exceso])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ background: 'transparent' }}
      role="img"
      aria-label={`Estado del inventario: ${normal} productos normales, ${bajo} con stock bajo, ${critico} críticos, ${exceso} con exceso`}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 PRODUCTO CARD — Individual product card with full actions
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ProductoCardProps {
  producto: ProductoAlmacen
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
  onVerHistorial?: () => void
}

function ProductoCard({
  producto,
  onVerDetalle,
  onEditar,
  onEliminar,
  onVerHistorial,
}: ProductoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const estadoConfig = {
    normal: {
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: <Package size={16} />,
      label: 'Stock Normal',
    },
    bajo: {
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      icon: <PackageMinus size={16} />,
      label: 'Stock Bajo',
    },
    critico: {
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: <AlertTriangle size={16} />,
      label: 'Stock Crítico',
    },
    exceso: {
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      icon: <PackagePlus size={16} />,
      label: 'Stock Exceso',
    },
  }

  const config = estadoConfig[producto.estado as keyof typeof estadoConfig] ?? estadoConfig.normal
  const stockPercentage = (producto.stockActual / producto.stockMaximo) * 100

  const handleEliminar = () => {
    setShowDeleteConfirm(false)
    onEliminar?.()
  }

  return (
    <motion.div
      className={cn(
        'group relative cursor-pointer rounded-2xl p-5 transition-all duration-500',
        'border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent',
        'backdrop-blur-xl',
        'hover:border-white/15',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        boxShadow: isHovered
          ? `0 20px 50px ${config.color}30, 0 0 80px ${config.color}20`
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Shimmer sweep effect */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {/* Background glow */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: config.bgColor,
          opacity: isHovered ? 0.15 : 0,
        }}
      />
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-gray-900/95 p-4 backdrop-blur-sm"
          >
            <AlertTriangle className="mb-2 text-red-400" size={32} />
            <p className="mb-1 text-center text-sm font-medium text-white">¿Eliminar Producto?</p>
            <p className="mb-4 text-center text-xs text-white/50">{producto.nombre}</p>
            <div className="flex gap-2">
              <AuroraButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </AuroraButton>
              <AuroraButton variant="glow" color="magenta" size="sm" onClick={handleEliminar}>
                Eliminar
              </AuroraButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: config.bgColor,
              border: `2px solid ${config.color}50`,
            }}
            animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
          >
            <span style={{ color: config.color }}>{config.icon}</span>
          </motion.div>
          <div>
            <p className="text-sm font-medium text-white">{producto.nombre}</p>
            <p className="text-xs text-white/40">{producto.sku}</p>
          </div>
        </div>
        <AuroraBadge
          color={
            producto.estado === 'normal'
              ? 'emerald'
              : producto.estado === 'bajo'
                ? 'gold'
                : producto.estado === 'critico'
                  ? 'magenta'
                  : 'violet'
          }
          variant="outline"
          className="text-xs"
        >
          {config.label}
        </AuroraBadge>
      </div>

      {/* Stock bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-white/40">Stock</span>
          <span className="text-white">
            {producto.stockActual} / {producto.stockMaximo}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
              width: `${Math.min(stockPercentage, 100)}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stockPercentage, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-white/30">
          <span>Mín: {producto.stockMinimo}</span>
          <span>Máx: {producto.stockMaximo}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mb-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Valor Inventario</span>
          <span className="font-medium text-amber-400">
            ${producto.valorInventario.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Ubicación</span>
          <span className="text-xs text-white/60">{producto.ubicacion}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Último Mov.</span>
          <span className="text-xs text-white/60">{producto.ultimoMovimiento}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 gap-2">
        <AuroraButton
          variant="secondary"
          size="sm"
          icon={<Eye size={14} />}
          onClick={() => {
            play('click')
            onVerDetalle?.()
          }}
          className="flex-1"
        >
          {''}
        </AuroraButton>
        <AuroraButton
          variant="secondary"
          size="sm"
          icon={<History size={14} />}
          onClick={() => {
            play('click')
            onVerHistorial?.()
          }}
          className="flex-1"
        >
          {''}
        </AuroraButton>
        <AuroraButton
          variant="secondary"
          size="sm"
          icon={<Edit3 size={14} />}
          onClick={() => {
            play('click')
            onEditar?.()
          }}
          className="flex-1"
        >
          {''}
        </AuroraButton>
        <AuroraButton
          variant="secondary"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={() => {
            play('error')
            setShowDeleteConfirm(true)
          }}
          className="flex-1 hover:border-red-500/50 hover:bg-red-500/20"
        >
          {''}
        </AuroraButton>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📥 ENTRADA ITEM — Entry card with full traceability
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EntradaItemProps {
  entrada: EntradaAlmacen
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
}

function EntradaItem({ entrada, onVerDetalle, onEditar, onEliminar }: EntradaItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEliminar = () => {
    setShowDeleteConfirm(false)
    onEliminar?.()
  }

  return (
    <motion.div
      className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:border-emerald-500/30"
      whileHover={{ y: -2 }}
    >
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-gray-900/95 p-4 backdrop-blur-sm"
          >
            <AlertTriangle className="mb-2 text-red-400" size={24} />
            <p className="mb-3 text-sm text-white">¿Eliminar entrada?</p>
            <div className="flex gap-2">
              <AuroraButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </AuroraButton>
              <AuroraButton variant="glow" color="magenta" size="sm" onClick={handleEliminar}>
                Eliminar
              </AuroraButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15">
            <ArrowDownLeft className="text-emerald-400" size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{entrada.productoNombre}</p>
            <p className="text-xs text-white/40">
              {entrada.fecha} - {entrada.hora}
            </p>
          </div>
        </div>
        <AuroraBadge color="emerald" variant="outline" className="text-xs">
          +{entrada.cantidad}
        </AuroraBadge>
      </div>

      {/* Trazabilidad */}
      <div className="mb-3 space-y-1 text-xs">
        {entrada.ordenCompraId && (
          <div className="flex justify-between">
            <span className="text-white/40">Orden Compra:</span>
            <span className="text-cyan-400">{entrada.ordenCompraId}</span>
          </div>
        )}
        {entrada.proveedor && (
          <div className="flex justify-between">
            <span className="text-white/40">Proveedor:</span>
            <span className="text-white/70">{entrada.proveedor}</span>
          </div>
        )}
        {entrada.lote && (
          <div className="flex justify-between">
            <span className="text-white/40">Lote:</span>
            <span className="text-violet-400">{entrada.lote}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-white/40">Precio Unit.:</span>
          <span className="text-amber-400">${entrada.precioUnitario.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Total:</span>
          <span className="font-medium text-emerald-400">
            ${(entrada.cantidad * entrada.precioUnitario).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Usuario:</span>
          <span className="text-white/60">{entrada.usuario}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <AuroraButton variant="secondary" size="sm" icon={<Eye size={12} />} onClick={onVerDetalle}>
          {''}
        </AuroraButton>
        <AuroraButton variant="secondary" size="sm" icon={<Edit3 size={12} />} onClick={onEditar}>
          {''}
        </AuroraButton>
        <AuroraButton
          variant="secondary"
          size="sm"
          icon={<Trash2 size={12} />}
          onClick={() => setShowDeleteConfirm(true)}
          className="hover:bg-red-500/20"
        >
          {''}
        </AuroraButton>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 SALIDA ITEM — Exit card with full traceability
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SalidaItemProps {
  salida: SalidaAlmacen
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
}

function SalidaItem({ salida, onVerDetalle, onEditar, onEliminar }: SalidaItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const motivoConfig = {
    venta: { color: '#10B981', label: 'Venta' },
    devolucion: { color: '#FBBF24', label: 'Devolución' },
    merma: { color: '#EF4444', label: 'Merma' },
    traslado: { color: '#8B5CF6', label: 'Traslado' },
    otro: { color: '#6B7280', label: 'Otro' },
  } as const

  const defaultConfig = { color: '#6B7280', label: 'Otro' }
  const config = motivoConfig[salida.motivo as keyof typeof motivoConfig] ?? defaultConfig

  const handleEliminar = () => {
    setShowDeleteConfirm(false)
    onEliminar?.()
  }

  return (
    <motion.div
      className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:border-red-500/30"
      whileHover={{ y: -2 }}
    >
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-gray-900/95 p-4 backdrop-blur-sm"
          >
            <AlertTriangle className="mb-2 text-red-400" size={24} />
            <p className="mb-3 text-sm text-white">¿Eliminar salida?</p>
            <div className="flex gap-2">
              <AuroraButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </AuroraButton>
              <AuroraButton variant="glow" color="magenta" size="sm" onClick={handleEliminar}>
                Eliminar
              </AuroraButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/15">
            <ArrowUpRight className="text-red-400" size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{salida.productoNombre}</p>
            <p className="text-xs text-white/40">
              {salida.fecha} - {salida.hora}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <AuroraBadge color="magenta" variant="outline" className="text-xs">
            -{salida.cantidad}
          </AuroraBadge>
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{ background: `${config.color}20`, color: config.color }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Trazabilidad */}
      <div className="mb-3 space-y-1 text-xs">
        {salida.ventaId && (
          <div className="flex justify-between">
            <span className="text-white/40">Venta:</span>
            <span className="text-cyan-400">{salida.ventaId}</span>
          </div>
        )}
        {salida.clienteNombre && (
          <div className="flex justify-between">
            <span className="text-white/40">Cliente:</span>
            <span className="text-white/70">{salida.clienteNombre}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-white/40">Usuario:</span>
          <span className="text-white/60">{salida.usuario}</span>
        </div>
        {salida.notas && (
          <div className="mt-2 rounded-lg bg-white/5 p-2">
            <span className="text-white/40">Notas: </span>
            <span className="text-white/60">{salida.notas}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <AuroraButton variant="secondary" size="sm" icon={<Eye size={12} />} onClick={onVerDetalle}>
          {''}
        </AuroraButton>
        <AuroraButton variant="secondary" size="sm" icon={<Edit3 size={12} />} onClick={onEditar}>
          {''}
        </AuroraButton>
        <AuroraButton
          variant="secondary"
          size="sm"
          icon={<Trash2 size={12} />}
          onClick={() => setShowDeleteConfirm(true)}
          className="hover:bg-red-500/20"
        >
          {''}
        </AuroraButton>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 CORTE ITEM — Inventory cut card with full traceability
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CorteItemProps {
  corte: CorteInventario
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
  onAjustar?: () => void
}

function CorteItem({ corte, onVerDetalle, onEditar, onEliminar, onAjustar }: CorteItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const estadoConfig = {
    correcto: { color: '#10B981', icon: <CheckCircle size={16} />, label: 'Correcto' },
    faltante: { color: '#EF4444', icon: <TrendingDown size={16} />, label: 'Faltante' },
    sobrante: { color: '#8B5CF6', icon: <TrendingUp size={16} />, label: 'Sobrante' },
  } as const

  const defaultEstadoConfig = {
    color: '#10B981',
    icon: <CheckCircle size={16} />,
    label: 'Correcto',
  }
  const config = estadoConfig[corte.estado as keyof typeof estadoConfig] ?? defaultEstadoConfig

  const handleEliminar = () => {
    setShowDeleteConfirm(false)
    onEliminar?.()
  }

  return (
    <motion.div
      className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all hover:border-violet-500/30"
      whileHover={{ y: -2 }}
    >
      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-gray-900/95 p-4 backdrop-blur-sm"
          >
            <AlertTriangle className="mb-2 text-red-400" size={24} />
            <p className="mb-3 text-sm text-white">¿Eliminar corte?</p>
            <div className="flex gap-2">
              <AuroraButton
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </AuroraButton>
              <AuroraButton variant="glow" color="magenta" size="sm" onClick={handleEliminar}>
                Eliminar
              </AuroraButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}
          >
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{corte.productoNombre}</p>
            <p className="text-xs text-white/40">
              {corte.fecha} - {corte.hora}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <AuroraBadge
            color={
              corte.estado === 'correcto'
                ? 'emerald'
                : corte.estado === 'faltante'
                  ? 'magenta'
                  : 'violet'
            }
            variant="outline"
            className="text-xs"
          >
            {config.label}
          </AuroraBadge>
          {corte.ajusteRealizado && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <ClipboardCheck size={12} /> Ajustado
            </span>
          )}
        </div>
      </div>

      {/* Comparación */}
      <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-white/5 p-3">
        <div className="text-center">
          <p className="mb-1 text-xs text-white/40">Sistema</p>
          <p className="text-lg font-bold text-white">{corte.stockSistema}</p>
        </div>
        <div className="text-center">
          <p className="mb-1 text-xs text-white/40">Físico</p>
          <p className="text-lg font-bold text-cyan-400">{corte.stockFisico}</p>
        </div>
        <div className="text-center">
          <p className="mb-1 text-xs text-white/40">Diferencia</p>
          <p className="text-lg font-bold" style={{ color: config.color }}>
            {corte.diferencia > 0 ? '+' : ''}
            {corte.diferencia}
          </p>
        </div>
      </div>

      {/* Trazabilidad */}
      <div className="mb-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-white/40">Usuario:</span>
          <span className="text-white/60">{corte.usuario}</span>
        </div>
        {corte.notas && (
          <div className="mt-2 rounded-lg bg-white/5 p-2">
            <span className="text-white/40">Notas: </span>
            <span className="text-white/60">{corte.notas}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 gap-2">
        <AuroraButton variant="secondary" size="sm" icon={<Eye size={12} />} onClick={onVerDetalle}>
          {''}
        </AuroraButton>
        <AuroraButton variant="secondary" size="sm" icon={<Edit3 size={12} />} onClick={onEditar}>
          {''}
        </AuroraButton>
        {!corte.ajusteRealizado && corte.diferencia !== 0 && (
          <AuroraButton
            variant="glow"
            color="violet"
            size="sm"
            icon={<Scissors size={12} />}
            onClick={onAjustar}
          >
            {''}
          </AuroraButton>
        )}
        <AuroraButton
          variant="secondary"
          size="sm"
          icon={<Trash2 size={12} />}
          onClick={() => setShowDeleteConfirm(true)}
          className="hover:bg-red-500/20"
        >
          {''}
        </AuroraButton>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 MOVIMIENTO ITEM — Movement timeline item
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function MovimientoItem({
  movimiento,
  isFirst,
  isLast,
}: {
  movimiento: MovimientoAlmacen
  isFirst?: boolean
  isLast?: boolean
}) {
  const tipoConfig = {
    entrada: {
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: <ArrowDown size={14} />,
      label: 'Entrada',
    },
    salida: {
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: <ArrowUp size={14} />,
      label: 'Salida',
    },
    ajuste: {
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      icon: <Edit3 size={14} />,
      label: 'Ajuste',
    },
  }

  const config = tipoConfig[movimiento.tipo] ?? tipoConfig.entrada

  return (
    <div className="relative flex gap-3">
      {/* Timeline */}
      <div className="relative flex flex-col items-center">
        {!isFirst && (
          <div className="absolute -top-2 h-2 w-0.5" style={{ background: `${config.color}30` }} />
        )}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: config.bgColor, border: `1px solid ${config.color}40` }}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </div>
        {!isLast && (
          <div className="min-h-[20px] w-0.5 flex-1" style={{ background: `${config.color}20` }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white">{movimiento.producto}</p>
            <p className="text-xs text-white/40">{movimiento.motivo}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold" style={{ color: config.color }}>
              {movimiento.tipo === 'salida' ? '-' : '+'}
              {movimiento.cantidad}
            </span>
            <p className="text-xs text-white/30">{movimiento.hora}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Almacen Panel Unified with 4 Views
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraAlmacenPanelUnified({
  productos: productosProp,
  movimientos = defaultMovimientos,
  entradas = defaultEntradas,
  salidas = defaultSalidas,
  cortes = defaultCortes,
  onNuevoProducto,
  onNuevoMovimiento: _onNuevoMovimiento,
  onNuevaEntrada,
  onNuevaSalida,
  onNuevoCorte,
  onVerProducto,
  onEditarProducto,
  onEliminarProducto,
  onVerEntrada,
  onEditarEntrada,
  onEliminarEntrada,
  onVerSalida,
  onEditarSalida,
  onEliminarSalida,
  onVerCorte,
  onEditarCorte,
  onEliminarCorte,
  onAjustarInventario,
  onVerHistorial,
  onExportar,
  onRefresh,
  loading: loadingProp = false,
  className,
}: AuroraAlmacenPanelUnifiedProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CARGAR DATOS REALES DE LA API SI NO SE PASAN PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: almacenAPI, loading: loadingAPI, refetch: refetchAPI } = useAlmacenData()
  const { ordenes: ordenesAPI } = useOrdenes()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌟 SUPREME SYSTEMS INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  useSmoothScroll() // Activar smooth scroll 120fps en todo el panel

  // 🔊 SOUND SYSTEM
  const { play } = useSoundManager()

  // Calcular valor de inventario desde órdenes de compra (stock real)
  const inventarioFromOrdenes = useMemo(() => {
    if (!ordenesAPI || ordenesAPI.length === 0) return { piezas: 0, valor: 0 }

    let totalPiezas = 0
    let totalValor = 0

    ordenesAPI.forEach((oc) => {
      // Usar stockActual si existe, sino usar cantidad inicial
      const piezas = (oc.stockActual ?? 0) > 0 ? oc.stockActual! : (oc.cantidad ?? 0)
      const precioUnitario = oc.costoUnitarioTotal || oc.precioUnitario || 0

      totalPiezas += piezas
      totalValor += piezas * precioUnitario
    })

    return { piezas: totalPiezas, valor: totalValor }
  }, [ordenesAPI])

  // Transformar datos de API al formato del componente
  const transformedProductos = useMemo((): ProductoAlmacen[] => {
    if (!almacenAPI?.productos || almacenAPI.productos.length === 0) return []

    return almacenAPI.productos.map(
      (p: {
        id: string
        nombre: string
        sku?: string
        stock?: number
        cantidad?: number
        stockActual?: number
        stockMinimo?: number
        minimo?: number
        precioCompra?: number
        precioVenta?: number
        categoria?: string
        estado?: string
      }): ProductoAlmacen => {
        // Priorizar: stockActual > cantidad > stock > 0
        const stockActualValue = p.stockActual ?? p.cantidad ?? p.stock ?? 0
        const stockMinimo = p.stockMinimo ?? p.minimo ?? 10

        // Calcular estado basado en stock
        let estado: ProductoAlmacen['estado'] = 'normal'
        if (stockActualValue === 0) {
          estado = 'critico'
        } else if (stockActualValue < stockMinimo) {
          estado = 'bajo'
        } else if (stockActualValue > stockMinimo * 3) {
          estado = 'exceso'
        }

        return {
          id: p.id,
          nombre: p.nombre,
          sku: p.sku || `SKU-${p.id.slice(0, 8)}`,
          categoria: p.categoria || 'general',
          stockActual: stockActualValue,
          stockMinimo,
          stockMaximo: stockMinimo * 10,
          precioUnitario: p.precioVenta || p.precioCompra || 0,
          valorInventario: stockActualValue * (p.precioCompra || p.precioVenta || 0),
          ultimoMovimiento: new Date().toISOString(),
          ubicacion: 'Almacén Principal',
          estado,
        }
      },
    )
  }, [almacenAPI])

  // Transformar entradas de API
  const transformedEntradas = useMemo((): EntradaAlmacen[] => {
    if (!almacenAPI?.entradas || almacenAPI.entradas.length === 0) return []

    return almacenAPI.entradas.map(
      (e: {
        id: string
        fecha?: string
        hora?: string
        productoId?: string
        productoNombre?: string
        cantidad: number
        ordenCompraId?: string
        proveedor?: string
        precioUnitario?: number
        lote?: string
        fechaCaducidad?: string
        usuario?: string
        notas?: string
      }): EntradaAlmacen => ({
        id: e.id,
        fecha: e.fecha || new Date().toISOString().split('T')[0] || '',
        hora: e.hora || new Date().toTimeString().substring(0, 5),
        productoId: e.productoId || '',
        productoNombre: e.productoNombre || 'Producto',
        cantidad: e.cantidad,
        ordenCompraId: e.ordenCompraId,
        proveedor: e.proveedor,
        precioUnitario: e.precioUnitario || 0,
        lote: e.lote,
        fechaCaducidad: e.fechaCaducidad,
        usuario: e.usuario || 'Sistema',
        notas: e.notas,
      }),
    )
  }, [almacenAPI])

  // Transformar salidas de API
  const transformedSalidas = useMemo((): SalidaAlmacen[] => {
    if (!almacenAPI?.salidas || almacenAPI.salidas.length === 0) return []

    return almacenAPI.salidas.map(
      (s: {
        id: string
        fecha?: string
        hora?: string
        productoId?: string
        productoNombre?: string
        cantidad: number
        ventaId?: string
        clienteNombre?: string
        motivo?: string
        usuario?: string
        notas?: string
      }): SalidaAlmacen => ({
        id: s.id,
        fecha: s.fecha || new Date().toISOString().split('T')[0] || '',
        hora: s.hora || new Date().toTimeString().substring(0, 5),
        productoId: s.productoId || '',
        productoNombre: s.productoNombre || 'Producto',
        cantidad: s.cantidad,
        ventaId: s.ventaId,
        clienteNombre: s.clienteNombre,
        motivo: (s.motivo as SalidaAlmacen['motivo']) || 'otro',
        usuario: s.usuario || 'Sistema',
        notas: s.notas,
      }),
    )
  }, [almacenAPI])

  // Transformar órdenes de compra a productos del almacén
  const productosFromOrdenes = useMemo((): ProductoAlmacen[] => {
    if (!ordenesAPI || ordenesAPI.length === 0) return []

    return ordenesAPI.map((oc) => {
      // Usar stockActual si > 0, sino usar cantidad inicial
      const stockActualValue = (oc.stockActual ?? 0) > 0 ? oc.stockActual! : (oc.cantidad ?? 0)
      const stockMinimo = 10
      const precioUnitario = oc.costoUnitarioTotal || oc.precioUnitario || 0

      // Calcular estado basado en stock
      let estado: ProductoAlmacen['estado'] = 'normal'
      if (stockActualValue === 0) {
        estado = 'critico'
      } else if (stockActualValue < stockMinimo) {
        estado = 'bajo'
      } else if (stockActualValue > stockMinimo * 3) {
        estado = 'exceso'
      }

      return {
        id: oc.id,
        nombre: oc.producto || `Producto ${oc.numeroOrden}`,
        sku: oc.numeroOrden || `SKU-${oc.id.slice(0, 8)}`,
        categoria: 'general',
        stockActual: stockActualValue,
        stockMinimo,
        stockMaximo: stockMinimo * 10,
        precioUnitario,
        valorInventario: stockActualValue * precioUnitario,
        ultimoMovimiento: oc.updatedAt
          ? new Date(oc.updatedAt).toISOString()
          : new Date().toISOString(),
        ubicacion: 'Almacén Principal',
        estado,
      }
    })
  }, [ordenesAPI])

  // Usar datos de props si se pasan, sino usar datos de OCs (prioridad) o almacén
  const productos = useMemo(() => {
    if (productosProp && Array.isArray(productosProp) && productosProp.length > 0) {
      return productosProp
    }
    // Priorizar productos de OCs si existen
    const safeProductosFromOrdenes = Array.isArray(productosFromOrdenes) ? productosFromOrdenes : []
    if (safeProductosFromOrdenes.length > 0) {
      return safeProductosFromOrdenes
    }
    return Array.isArray(transformedProductos) ? transformedProductos : []
  }, [productosProp, productosFromOrdenes, transformedProductos])

  // Usar entradas de API - SIEMPRE priorizar datos transformados de API
  const entradasFinales = useMemo(() => {
    // Priorizar datos de API transformados
    if (transformedEntradas && transformedEntradas.length > 0) {
      return transformedEntradas
    }
    // Fallback a props si existen
    if (entradas && entradas.length > 0) return entradas
    return []
  }, [entradas, transformedEntradas])

  // Usar salidas de API - SIEMPRE priorizar datos transformados de API
  const salidasFinales = useMemo(() => {
    // Priorizar datos de API transformados
    if (transformedSalidas && transformedSalidas.length > 0) {
      return transformedSalidas
    }
    // Fallback a props si existen
    if (salidas && salidas.length > 0) return salidas
    return []
  }, [salidas, transformedSalidas])

  const loading = loadingProp || loadingAPI

  const [activeMainTab, setActiveMainTab] = useState('stock')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosState>({
    estado: 'todos',
    busqueda: '',
    categoria: 'todas',
    tipoMovimiento: 'todos',
    fechaInicio: '',
    fechaFin: '',
    deudaFilter: 'todos',
  })

  // Stats
  const stats = useMemo(() => {
    const total = productos.length
    const normal = productos.filter((p) => p.estado === 'normal').length
    const bajo = productos.filter((p) => p.estado === 'bajo').length
    const critico = productos.filter((p) => p.estado === 'critico').length
    const exceso = productos.filter((p) => p.estado === 'exceso').length

    const valorTotal = productos.reduce((sum, p) => sum + p.valorInventario, 0)
    const stockTotal = productos.reduce((sum, p) => sum + p.stockActual, 0)

    const alertas = bajo + critico

    const totalEntradas = entradasFinales.reduce((sum, e) => sum + e.cantidad, 0)
    const totalSalidas = salidasFinales.reduce((sum, s) => sum + s.cantidad, 0)
    const cortesConDiferencia = cortes.filter((c) => c.diferencia !== 0).length

    return {
      total,
      normal,
      bajo,
      critico,
      exceso,
      valorTotal,
      stockTotal,
      alertas,
      totalEntradas,
      totalSalidas,
      cortesConDiferencia,
    }
  }, [productos, entradasFinales, salidasFinales, cortes])

  // Filtered productos
  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const matchEstado = filtros.estado === 'todos' || p.estado === filtros.estado
      const matchBusqueda =
        !filtros.busqueda ||
        p.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(filtros.busqueda.toLowerCase())
      const matchCategoria = filtros.categoria === 'todas' || p.categoria === filtros.categoria
      return matchEstado && matchBusqueda && matchCategoria
    })
  }, [productos, filtros])

  // Filtered entradas
  const filteredEntradas = useMemo(() => {
    return entradasFinales.filter((e) => {
      const matchBusqueda =
        !filtros.busqueda || e.productoNombre.toLowerCase().includes(filtros.busqueda.toLowerCase())
      const matchFecha =
        (!filtros.fechaInicio || e.fecha >= filtros.fechaInicio) &&
        (!filtros.fechaFin || e.fecha <= filtros.fechaFin)
      return matchBusqueda && matchFecha
    })
  }, [entradasFinales, filtros])

  // Filtered salidas
  const filteredSalidas = useMemo(() => {
    return salidasFinales.filter((s) => {
      const matchBusqueda =
        !filtros.busqueda || s.productoNombre.toLowerCase().includes(filtros.busqueda.toLowerCase())
      const matchTipo = filtros.tipoMovimiento === 'todos' || s.motivo === filtros.tipoMovimiento
      const matchFecha =
        (!filtros.fechaInicio || s.fecha >= filtros.fechaInicio) &&
        (!filtros.fechaFin || s.fecha <= filtros.fechaFin)
      return matchBusqueda && matchTipo && matchFecha
    })
  }, [salidasFinales, filtros])

  // Filtered cortes
  const filteredCortes = useMemo(() => {
    return cortes.filter((c) => {
      const matchBusqueda =
        !filtros.busqueda || c.productoNombre.toLowerCase().includes(filtros.busqueda.toLowerCase())
      const matchEstado = filtros.deudaFilter === 'todos' || c.estado === filtros.deudaFilter
      const matchFecha =
        (!filtros.fechaInicio || c.fecha >= filtros.fechaInicio) &&
        (!filtros.fechaFin || c.fecha <= filtros.fechaFin)
      return matchBusqueda && matchEstado && matchFecha
    })
  }, [cortes, filtros])

  // Categories
  const categorias = useMemo(() => {
    return ['todas', ...new Set(productos.map((p) => p.categoria))]
  }, [productos])

  // Chart data
  const chartData = useMemo(() => {
    return productos.slice(0, 6).map((p) => ({
      name: p.nombre.split(' ')[0] ?? '',
      value: p.stockActual,
      max: p.stockMaximo,
    }))
  }, [productos])

  // Movement trend data
  const movementTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    return last7Days.map((fecha) => {
      const entradasDia = entradasFinales
        .filter((e) => e.fecha === fecha)
        .reduce((sum, e) => sum + e.cantidad, 0)
      const salidasDia = salidasFinales
        .filter((s) => s.fecha === fecha)
        .reduce((sum, s) => sum + s.cantidad, 0)
      return {
        name: fecha?.split('-')[2] ?? '',
        value: entradasDia - salidasDia, // Net movement
        entradas: entradasDia,
        salidas: salidasDia,
      }
    })
  }, [entradasFinales, salidasFinales])

  // Tabs para las 4 vistas principales
  const mainTabs = [
    { id: 'stock', label: 'Stock Actual' },
    { id: 'entradas', label: 'Entradas' },
    { id: 'salidas', label: 'Salidas' },
    { id: 'corte', label: 'Corte de Inventario' },
  ]

  // Sub-tabs para filtrar por estado de stock
  const stockFilterTabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'normal', label: 'Normal' },
    { id: 'bajo', label: 'Stock Bajo' },
    { id: 'critico', label: 'Crítico' },
    { id: 'exceso', label: 'Exceso' },
  ]

  // Export handlers
  const handleExportar = useCallback(
    (formato: 'csv' | 'excel' | 'pdf') => {
      setShowExportMenu(false)

      if (onExportar) {
        onExportar(formato, activeMainTab)
        return
      }

      // Default CSV export
      if (formato === 'csv') {
        let csvContent = ''
        let filename = ''

        if (activeMainTab === 'stock') {
          const headers = [
            'ID',
            'Nombre',
            'SKU',
            'Categoría',
            'Stock Actual',
            'Stock Mínimo',
            'Stock Máximo',
            'Precio Unit.',
            'Valor Inventario',
            'Estado',
            'Ubicación',
          ]
          csvContent = headers.join(',') + '\n'
          filteredProductos.forEach((p) => {
            csvContent += `${p.id},"${p.nombre}",${p.sku},"${p.categoria}",${p.stockActual},${p.stockMinimo},${p.stockMaximo},${p.precioUnitario},${p.valorInventario},${p.estado},"${p.ubicacion}"\n`
          })
          filename = 'almacen_stock.csv'
        } else if (activeMainTab === 'entradas') {
          const headers = [
            'ID',
            'Fecha',
            'Hora',
            'Producto',
            'Cantidad',
            'Orden Compra',
            'Proveedor',
            'Precio Unit.',
            'Total',
            'Lote',
            'Usuario',
          ]
          csvContent = headers.join(',') + '\n'
          filteredEntradas.forEach((e) => {
            csvContent += `${e.id},${e.fecha},${e.hora},"${e.productoNombre}",${e.cantidad},${e.ordenCompraId ?? ''},${e.proveedor ?? ''},${e.precioUnitario},${e.cantidad * e.precioUnitario},${e.lote ?? ''},${e.usuario}\n`
          })
          filename = 'almacen_entradas.csv'
        } else if (activeMainTab === 'salidas') {
          const headers = [
            'ID',
            'Fecha',
            'Hora',
            'Producto',
            'Cantidad',
            'Venta',
            'Cliente',
            'Motivo',
            'Usuario',
            'Notas',
          ]
          csvContent = headers.join(',') + '\n'
          filteredSalidas.forEach((s) => {
            csvContent += `${s.id},${s.fecha},${s.hora},"${s.productoNombre}",${s.cantidad},${s.ventaId ?? ''},"${s.clienteNombre ?? ''}",${s.motivo},${s.usuario},"${s.notas ?? ''}"\n`
          })
          filename = 'almacen_salidas.csv'
        } else {
          const headers = [
            'ID',
            'Fecha',
            'Hora',
            'Producto',
            'Stock Sistema',
            'Stock Físico',
            'Diferencia',
            'Estado',
            'Ajustado',
            'Usuario',
            'Notas',
          ]
          csvContent = headers.join(',') + '\n'
          filteredCortes.forEach((c) => {
            csvContent += `${c.id},${c.fecha},${c.hora},"${c.productoNombre}",${c.stockSistema},${c.stockFisico},${c.diferencia},${c.estado},${c.ajusteRealizado ? 'Sí' : 'No'},${c.usuario},"${c.notas ?? ''}"\n`
          })
          filename = 'almacen_cortes.csv'
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
      }
    },
    [
      activeMainTab,
      filteredProductos,
      filteredEntradas,
      filteredSalidas,
      filteredCortes,
      onExportar,
    ],
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltros({
      estado: 'todos',
      busqueda: '',
      categoria: 'todas',
      tipoMovimiento: 'todos',
      fechaInicio: '',
      fechaFin: '',
      deudaFilter: 'todos',
    })
  }, [])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filtros.estado !== 'todos') count++
    if (filtros.categoria !== 'todas') count++
    if (filtros.tipoMovimiento !== 'todos') count++
    if (filtros.fechaInicio) count++
    if (filtros.fechaFin) count++
    if (filtros.deudaFilter !== 'todos') count++
    return count
  }, [filtros])

  // Dynamic action button based on active tab
  const getActionButton = () => {
    switch (activeMainTab) {
      case 'stock':
        return (
          <AuroraButton
            variant="glow"
            color="gold"
            icon={<Plus size={18} />}
            onClick={() => {
              play('success')
              onNuevoProducto?.()
            }}
          >
            Nuevo Producto
          </AuroraButton>
        )
      case 'entradas':
        return (
          <AuroraButton
            variant="glow"
            color="emerald"
            icon={<ArrowDownLeft size={18} />}
            onClick={() => {
              play('success')
              onNuevaEntrada?.()
            }}
          >
            Nueva Entrada
          </AuroraButton>
        )
      case 'salidas':
        return (
          <AuroraButton
            variant="glow"
            color="magenta"
            icon={<ArrowUpRight size={18} />}
            onClick={() => {
              play('success')
              onNuevaSalida?.()
            }}
          >
            Nueva Salida
          </AuroraButton>
        )
      case 'corte':
        return (
          <AuroraButton
            variant="glow"
            color="violet"
            icon={<ClipboardCheck size={18} />}
            onClick={() => {
              play('success')
              onNuevoCorte?.()
            }}
          >
            Nuevo Corte
          </AuroraButton>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* 🌌 QUANTUM PARTICLE FIELD — ALMACÉN */}
      <AlmacenBackground opacity={0.42} />

      <AuroraBackground
        intensity="medium"
        colors={['gold', 'emerald', 'violet']}
        interactive
        className={cn('min-h-screen', className)}
      >
        <main className="p-6" aria-label="Panel de almacén e inventario CHRONOS">
          {/* Header - ELEVATED PREMIUM */}
          <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="relative">
              {/* Decorative glow orb */}
              <div className="absolute -top-4 -left-4 h-20 w-32 rounded-full bg-amber-500/20 blur-3xl" />
              <motion.h1
                className="relative flex items-center gap-4 text-3xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Warehouse className="h-6 w-6 text-amber-400" aria-hidden="true" />
                </motion.div>
                <span className="bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
                  Almacén
                </span>
              </motion.h1>
              <p className="relative mt-2 text-white/50">Control de inventario y productos</p>
              <motion.div
                className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Dynamic Action Button */}
              {getActionButton()}

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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-xl backdrop-blur-xl"
                    >
                      <button
                        onClick={() => {
                          play('success')
                          handleExportar('csv')
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-white/10"
                      >
                        <FileText size={16} className="text-emerald-400" />
                        Exportar CSV
                      </button>
                      <button
                        onClick={() => {
                          play('success')
                          handleExportar('excel')
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-white/10"
                      >
                        <FileText size={16} className="text-green-400" />
                        Exportar Excel
                      </button>
                      <button
                        onClick={() => {
                          play('success')
                          handleExportar('pdf')
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-white/10"
                      >
                        <FileText size={16} className="text-red-400" />
                        Exportar PDF
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filters Toggle */}
              <AuroraButton
                variant={showFiltersPanel ? 'glow' : 'secondary'}
                color={showFiltersPanel ? 'violet' : undefined}
                icon={<Filter size={18} />}
                onClick={() => {
                  play('tab-switch')
                  setShowFiltersPanel(!showFiltersPanel)
                }}
                className="relative"
              >
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </AuroraButton>

              {/* Refresh */}
              <motion.button
                onClick={() => {
                  play('whoosh')
                  refetchAPI()
                  onRefresh?.()
                }}
                aria-label={loading ? 'Actualizando datos...' : 'Actualizar inventario'}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            </div>
          </header>

          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AuroraStatWidget
              label="Valor Inventario"
              value={
                inventarioFromOrdenes.valor >= 1000000
                  ? `$${(inventarioFromOrdenes.valor / 1000000).toFixed(1)}M`
                  : inventarioFromOrdenes.valor >= 1000
                    ? `$${(inventarioFromOrdenes.valor / 1000).toFixed(0)}K`
                    : `$${inventarioFromOrdenes.valor.toLocaleString()}`
              }
              suffix={` (${inventarioFromOrdenes.piezas.toLocaleString()} pzs)`}
              icon={<Warehouse size={20} />}
              color="gold"
              change={8.5}
              trend="up"
              className="transition-spring hover-elevate"
            />
            <AuroraStatWidget
              label="Entradas (Mes)"
              value={stats.totalEntradas.toLocaleString()}
              icon={<ArrowDownLeft size={20} />}
              color="emerald"
              change={12.3}
              trend="up"
              className="transition-spring hover-elevate"
            />
            <AuroraStatWidget
              label="Salidas (Mes)"
              value={stats.totalSalidas.toLocaleString()}
              icon={<ArrowUpRight size={20} />}
              color="cyan"
              className="transition-spring hover-elevate"
            />
            <AuroraStatWidget
              label="Alertas Stock"
              value={stats.alertas.toString()}
              icon={<AlertTriangle size={20} />}
              color="magenta"
              change={stats.alertas > 0 ? -15 : 0}
              trend={stats.alertas > 0 ? 'down' : 'neutral'}
            />
          </div>

          {/* Main Tabs */}
          <AuroraGlassCard className="mb-6 p-4">
            <AuroraTabs
              tabs={mainTabs}
              activeTab={activeMainTab}
              onTabChange={setActiveMainTab}
              color="gold"
            />
          </AuroraGlassCard>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <AuroraGlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                      <Filter size={16} className="text-violet-400" />
                      Filtros Avanzados
                    </h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
                      >
                        <X size={14} /> Limpiar filtros
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Búsqueda</label>
                      <AuroraSearch
                        value={filtros.busqueda}
                        onChange={(v) => setFiltros((prev) => ({ ...prev, busqueda: v }))}
                        placeholder="Buscar..."
                        color="gold"
                        className="w-full"
                      />
                    </div>

                    {/* Category (for stock tab) */}
                    {activeMainTab === 'stock' && (
                      <div>
                        <label className="mb-1 block text-xs text-white/50">Categoría</label>
                        <select
                          value={filtros.categoria}
                          onChange={(e) =>
                            setFiltros((prev) => ({ ...prev, categoria: e.target.value }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                        >
                          {categorias.map((cat) => (
                            <option key={cat} value={cat} className="bg-gray-900">
                              {cat === 'todas' ? 'Todas las categorías' : cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Movement Type (for salidas tab) */}
                    {activeMainTab === 'salidas' && (
                      <div>
                        <label className="mb-1 block text-xs text-white/50">Tipo de Salida</label>
                        <select
                          value={filtros.tipoMovimiento}
                          onChange={(e) =>
                            setFiltros((prev) => ({ ...prev, tipoMovimiento: e.target.value }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                        >
                          <option value="todos" className="bg-gray-900">
                            Todos
                          </option>
                          <option value="venta" className="bg-gray-900">
                            Venta
                          </option>
                          <option value="devolucion" className="bg-gray-900">
                            Devolución
                          </option>
                          <option value="merma" className="bg-gray-900">
                            Merma
                          </option>
                          <option value="traslado" className="bg-gray-900">
                            Traslado
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Corte Estado (for corte tab) */}
                    {activeMainTab === 'corte' && (
                      <div>
                        <label className="mb-1 block text-xs text-white/50">Estado del Corte</label>
                        <select
                          value={filtros.deudaFilter}
                          onChange={(e) =>
                            setFiltros((prev) => ({
                              ...prev,
                              deudaFilter: e.target.value as FiltrosState['deudaFilter'],
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                        >
                          <option value="todos" className="bg-gray-900">
                            Todos
                          </option>
                          <option value="correcto" className="bg-gray-900">
                            Correcto
                          </option>
                          <option value="faltante" className="bg-gray-900">
                            Faltante
                          </option>
                          <option value="sobrante" className="bg-gray-900">
                            Sobrante
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Date Range */}
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Desde</label>
                      <input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) =>
                          setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-white/50">Hasta</label>
                      <input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) =>
                          setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Stock Filter Tabs (only for stock tab) */}
                  {activeMainTab === 'stock' && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <label className="mb-2 block text-xs text-white/50">Estado del Stock</label>
                      <AuroraTabs
                        tabs={stockFilterTabs}
                        activeTab={filtros.estado}
                        onTabChange={(v) => setFiltros((prev) => ({ ...prev, estado: v }))}
                        color="gold"
                      />
                    </div>
                  )}
                </AuroraGlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Main Content */}
            <div className="col-span-12 space-y-6 lg:col-span-8">
              {/* STOCK TAB */}
              {activeMainTab === 'stock' && (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
                      <p className="text-xs text-white/50">Normal</p>
                      <p className="text-xl font-bold text-emerald-400">{stats.normal}</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
                      <p className="text-xs text-white/50">Bajo</p>
                      <p className="text-xl font-bold text-amber-400">{stats.bajo}</p>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
                      <p className="text-xs text-white/50">Crítico</p>
                      <p className="text-xl font-bold text-red-400">{stats.critico}</p>
                    </div>
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-3 text-center">
                      <p className="text-xs text-white/50">Exceso</p>
                      <p className="text-xl font-bold text-violet-400">{stats.exceso}</p>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredProductos.map((producto) => (
                      <ProductoCard
                        key={producto.id}
                        producto={producto}
                        onVerDetalle={() => onVerProducto?.(producto)}
                        onEditar={() => onEditarProducto?.(producto)}
                        onEliminar={() => onEliminarProducto?.(producto)}
                        onVerHistorial={() => onVerHistorial?.(producto.id)}
                      />
                    ))}

                    {filteredProductos.length === 0 && (
                      <div className="col-span-2 py-12 text-center text-white/40">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No se encontraron productos</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ENTRADAS TAB */}
              {activeMainTab === 'entradas' && (
                <>
                  {/* Quick Info */}
                  <AuroraGlassCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15">
                          <ArrowDownLeft className="text-emerald-400" size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">
                            {filteredEntradas.length} Entradas
                          </p>
                          <p className="text-sm text-white/50">
                            {stats.totalEntradas} unidades totales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/50">Valor Total</p>
                        <p className="text-xl font-bold text-emerald-400">
                          $
                          {filteredEntradas
                            .reduce((sum, e) => sum + e.cantidad * e.precioUnitario, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </AuroraGlassCard>

                  {/* Entradas Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredEntradas.map((entrada) => (
                      <EntradaItem
                        key={entrada.id}
                        entrada={entrada}
                        onVerDetalle={() => onVerEntrada?.(entrada)}
                        onEditar={() => onEditarEntrada?.(entrada)}
                        onEliminar={() => onEliminarEntrada?.(entrada)}
                      />
                    ))}

                    {filteredEntradas.length === 0 && (
                      <div className="col-span-2 py-12 text-center text-white/40">
                        <ArrowDownLeft size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No se encontraron entradas</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* SALIDAS TAB */}
              {activeMainTab === 'salidas' && (
                <>
                  {/* Quick Info */}
                  <AuroraGlassCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/15">
                          <ArrowUpRight className="text-red-400" size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">
                            {filteredSalidas.length} Salidas
                          </p>
                          <p className="text-sm text-white/50">
                            {stats.totalSalidas} unidades totales
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-xs text-white/40">Ventas</p>
                          <p className="text-sm font-bold text-emerald-400">
                            {salidas.filter((s) => s.motivo === 'venta').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Mermas</p>
                          <p className="text-sm font-bold text-red-400">
                            {salidas.filter((s) => s.motivo === 'merma').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Otros</p>
                          <p className="text-sm font-bold text-white/60">
                            {salidas.filter((s) => !['venta', 'merma'].includes(s.motivo)).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AuroraGlassCard>

                  {/* Salidas Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredSalidas.map((salida) => (
                      <SalidaItem
                        key={salida.id}
                        salida={salida}
                        onVerDetalle={() => onVerSalida?.(salida)}
                        onEditar={() => onEditarSalida?.(salida)}
                        onEliminar={() => onEliminarSalida?.(salida)}
                      />
                    ))}

                    {filteredSalidas.length === 0 && (
                      <div className="col-span-2 py-12 text-center text-white/40">
                        <ArrowUpRight size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No se encontraron salidas</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* CORTE TAB */}
              {activeMainTab === 'corte' && (
                <>
                  {/* Quick Info */}
                  <AuroraGlassCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15">
                          <ClipboardCheck className="text-violet-400" size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">
                            {filteredCortes.length} Cortes
                          </p>
                          <p className="text-sm text-white/50">Últimos registros de inventario</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-xs text-white/40">Correctos</p>
                          <p className="text-sm font-bold text-emerald-400">
                            {cortes.filter((c) => c.estado === 'correcto').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Faltantes</p>
                          <p className="text-sm font-bold text-red-400">
                            {cortes.filter((c) => c.estado === 'faltante').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Sobrantes</p>
                          <p className="text-sm font-bold text-violet-400">
                            {cortes.filter((c) => c.estado === 'sobrante').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AuroraGlassCard>

                  {/* Cortes Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredCortes.map((corte) => (
                      <CorteItem
                        key={corte.id}
                        corte={corte}
                        onVerDetalle={() => onVerCorte?.(corte)}
                        onEditar={() => onEditarCorte?.(corte)}
                        onEliminar={() => onEliminarCorte?.(corte)}
                        onAjustar={() => onAjustarInventario?.(corte)}
                      />
                    ))}

                    {filteredCortes.length === 0 && (
                      <div className="col-span-2 py-12 text-center text-white/40">
                        <ClipboardCheck size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No se encontraron cortes de inventario</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right: Visualization & Timeline */}
            <div className="col-span-12 space-y-6 lg:col-span-4">
              {/* Inventory Visualization */}
              <AuroraGlassCard glowColor="gold" className="p-4">
                <h3 className="mb-3 text-center text-sm font-medium text-white/70">
                  Estado del Inventario
                </h3>
                <div className="h-48">
                  <InventoryVisualization
                    normal={stats.normal}
                    bajo={stats.bajo}
                    critico={stats.critico}
                    exceso={stats.exceso}
                  />
                </div>
              </AuroraGlassCard>

              {/* Movement Trend Chart */}
              <AuroraAreaChart
                data={movementTrendData}
                height={200}
                color="cyan"
                showTooltip
                title="Tendencia de Movimientos"
              />

              {/* Stock Chart */}
              <AuroraBarChart
                data={chartData}
                height={200}
                color="gold"
                showTooltip
                title="Stock por Producto"
              />

              {/* Recent Movements */}
              <AuroraGlassCard glowColor="cyan" className="p-5">
                <h3 className="mb-4 text-sm font-medium text-white/70">Últimos Movimientos</h3>
                <div className="space-y-1">
                  {movimientos.slice(0, 5).map((mov, i) => (
                    <MovimientoItem
                      key={mov.id}
                      movimiento={mov}
                      isFirst={i === 0}
                      isLast={i === Math.min(4, movimientos.length - 1)}
                    />
                  ))}
                </div>
              </AuroraGlassCard>

              {/* Stock Alerts */}
              {stats.alertas > 0 && (
                <AuroraGlassCard glowColor="magenta" className="p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70">
                    <AlertTriangle size={16} className="text-red-400" />
                    Alertas de Stock ({stats.alertas})
                  </h3>
                  <div className="space-y-2">
                    {productos
                      .filter((p) => p.estado === 'critico' || p.estado === 'bajo')
                      .slice(0, 4)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/5"
                          style={{
                            background:
                              p.estado === 'critico'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(251, 191, 36, 0.1)',
                          }}
                          onClick={() => onVerProducto?.(p)}
                        >
                          <span className="text-sm text-white/70">{p.nombre}</span>
                          <span
                            className="text-sm font-bold"
                            style={{ color: p.estado === 'critico' ? '#EF4444' : '#FBBF24' }}
                          >
                            {p.stockActual} unid.
                          </span>
                        </div>
                      ))}
                  </div>
                </AuroraGlassCard>
              )}

              {/* Pending Adjustments */}
              {cortes.filter((c) => !c.ajusteRealizado && c.diferencia !== 0).length > 0 && (
                <AuroraGlassCard glowColor="violet" className="p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white/70">
                    <Scissors size={16} className="text-violet-400" />
                    Ajustes Pendientes
                  </h3>
                  <div className="space-y-2">
                    {cortes
                      .filter((c) => !c.ajusteRealizado && c.diferencia !== 0)
                      .slice(0, 3)
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg bg-violet-500/10 p-2 transition-colors hover:bg-violet-500/20"
                          onClick={() => onAjustarInventario?.(c)}
                        >
                          <span className="text-sm text-white/70">{c.productoNombre}</span>
                          <span
                            className={cn(
                              'text-sm font-bold',
                              c.diferencia < 0 ? 'text-red-400' : 'text-violet-400',
                            )}
                          >
                            {c.diferencia > 0 ? '+' : ''}
                            {c.diferencia}
                          </span>
                        </div>
                      ))}
                  </div>
                </AuroraGlassCard>
              )}
            </div>
          </div>
        </main>
      </AuroraBackground>
    </>
  )
}

export default AuroraAlmacenPanelUnified
