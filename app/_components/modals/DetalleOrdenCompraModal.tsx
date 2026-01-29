'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — DETALLE ORDEN COMPRA MODAL
 * Modal para ver detalles completos de una orden de compra
 * Incluye información del distribuidor, pagos y estado
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getOrden } from '@/app/_actions/ordenes'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { logger } from '@/app/lib/utils/logger'
import { motion } from 'motion/react'
import { Building2, Calendar, CheckCircle2, Clock, DollarSign, Package, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { QuantumGlassCard } from '../ui/QuantumElevatedUI'

interface OrdenDetalle {
  id: string
  distribuidorId: string
  fecha: string
  numeroOrden?: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  iva?: number
  total: number
  montoPagado?: number
  montoRestante?: number
  estado: 'pendiente' | 'parcial' | 'completo' | 'cancelado'
  bancoOrigenId?: string
  observaciones?: string
  stockActual?: number
  stockVendido?: number
  gananciaRealizada?: number
  margenBruto?: number
  rotacionDias?: number
  totalVentasGeneradas?: number
  distribuidor?: {
    id: string
    nombre: string
    empresa?: string
    telefono?: string
    email?: string
  }
}

interface DetalleOrdenCompraModalProps {
  isOpen: boolean
  onClose: () => void
  ordenId: string
}

export function DetalleOrdenCompraModal({
  isOpen,
  onClose,
  ordenId,
}: DetalleOrdenCompraModalProps) {
  const [orden, setOrden] = useState<OrdenDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && ordenId) {
      setLoading(true)
      fetch(`/api/ordenes/${ordenId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrden(data)
          setLoading(false)
        })
        .catch((err) => {
          logger.error('Error cargando orden', err, { context: 'DetalleOrdenCompraModal' })
          setLoading(false)
        })
    }
  }, [isOpen, ordenId])

  if (!isOpen) return null

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Cargando..." size="lg">
        <div className="flex items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500" />
        </div>
      </Modal>
    )
  }

  if (!orden) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error" size="lg">
        <div className="p-6 text-center text-white/60">
          No se pudo cargar la información de la orden
        </div>
      </Modal>
    )
  }

  const statusConfig = {
    completo: { label: 'Completada', color: 'emerald', icon: CheckCircle2 },
    parcial: { label: 'Parcial', color: 'violet', icon: Clock },
    pendiente: { label: 'Pendiente', color: 'amber', icon: Clock },
    cancelado: { label: 'Cancelada', color: 'red', icon: Clock },
  }

  const status = statusConfig[orden.estado] || statusConfig.pendiente
  const StatusIcon = status.icon

  const porcentajePagado = orden.total > 0 ? ((orden.montoPagado || 0) / orden.total) * 100 : 0

  const stockActual = orden.stockActual ?? orden.cantidad
  const stockVendido = orden.stockVendido ?? 0
  const porcentajeVendido = orden.cantidad > 0 ? (stockVendido / orden.cantidad) * 100 : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de Orden de Compra" size="lg">
      <div className="space-y-6 p-6">
        {/* Header con Estado */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-1 text-2xl font-bold text-white">
              {orden.numeroOrden || `OC-${orden.id.slice(0, 8)}`}
            </h3>
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(orden.fecha).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-xl px-4 py-2 bg-${status.color}-500/10 border border-${status.color}-500/20 flex items-center gap-2`}
          >
            <StatusIcon className={`h-4 w-4 text-${status.color}-400`} />
            <span className={`text-sm font-medium text-${status.color}-300`}>{status.label}</span>
          </motion.div>
        </div>

        {/* Distribuidor */}
        <QuantumGlassCard variant="elevated">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs tracking-wider text-white/40 uppercase">Distribuidor</p>
              <p className="text-lg font-semibold text-white">
                {orden.distribuidor?.nombre || 'Sin distribuidor'}
              </p>
              {orden.distribuidor?.empresa && (
                <p className="text-sm text-white/60">{orden.distribuidor.empresa}</p>
              )}
            </div>
            {orden.distribuidor?.telefono && (
              <div className="text-right">
                <p className="text-xs text-white/40">Teléfono</p>
                <p className="text-sm text-white/80">{orden.distribuidor.telefono}</p>
              </div>
            )}
          </div>
        </QuantumGlassCard>

        {/* Detalles del Producto */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-violet-400" />
            <h4 className="text-lg font-semibold text-white">Detalles de Compra</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs text-white/40">Cantidad Comprada</p>
              <p className="text-lg font-semibold text-white">{orden.cantidad} unidades</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/40">Precio Unitario</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(orden.precioUnitario)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/40">Stock Actual</p>
              <p className="text-lg font-semibold text-emerald-400">{stockActual} unidades</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/40">Stock Vendido</p>
              <p className="text-lg font-semibold text-violet-400">{stockVendido} unidades</p>
            </div>
          </div>

          {/* Barra de progreso de stock vendido */}
          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/40">Progreso de Ventas</span>
              <span className="text-sm text-white/60">{porcentajeVendido.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${porcentajeVendido}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              />
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Total Orden</span>
              <span className="text-2xl font-bold text-white">{formatCurrency(orden.total)}</span>
            </div>
          </div>
        </QuantumGlassCard>

        {/* Rentabilidad del Lote (Advanced Metrics) */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">Rentabilidad del Lote</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ganancia Realizada */}
            <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
              <p className="mb-1 text-xs text-white/40">Ganancia Realizada</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(orden.gananciaRealizada || 0)}
              </p>
            </div>

            {/* Margen Bruto */}
            <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-3">
              <p className="mb-1 text-xs text-white/40">Margen Bruto</p>
              <div className="flex items-end gap-2">
                <p className="text-xl font-bold text-cyan-400">
                  {(orden.margenBruto || 0).toFixed(1)}%
                </p>
                <span className="mb-1 text-xs text-white/40">promedio</span>
              </div>
            </div>

            {/* Ingresos Totales */}
            <div>
              <p className="mb-1 text-xs text-white/40">Ingresos Totales (Ventas)</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(orden.totalVentasGeneradas || 0)}
              </p>
            </div>

            {/* Rotación */}
            <div>
              <p className="mb-1 text-xs text-white/40">Rotación</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-white">
                  {orden.rotacionDias ? `${orden.rotacionDias.toFixed(0)} días` : 'N/A'}
                </p>
                {orden.rotacionDias && orden.rotacionDias < 30 && (
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                    Rápida
                  </span>
                )}
              </div>
            </div>
          </div>
        </QuantumGlassCard>

        {/* Estado de Pago */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h4 className="text-lg font-semibold text-white">Estado de Pago</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs text-white/40">Pagado</p>
              <p className="text-lg font-semibold text-emerald-400">
                {formatCurrency(orden.montoPagado || 0)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/40">Pendiente</p>
              <p className="text-lg font-semibold text-amber-400">
                {formatCurrency(orden.montoRestante || 0)}
              </p>
            </div>
          </div>

          {/* Barra de progreso de pago */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/40">Progreso de Pago</span>
              <span className="text-sm text-white/60">{porcentajePagado.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${porcentajePagado}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
              />
            </div>
          </div>

          {orden.bancoOrigenId && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <p className="mb-1 text-xs text-white/40">Banco de Pago</p>
              <p className="text-sm text-white/80 capitalize">
                {orden.bancoOrigenId.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </QuantumGlassCard>

        {/* Observaciones */}
        {orden.observaciones && (
          <QuantumGlassCard variant="elevated">
            <div className="mb-3 flex items-center gap-3">
              <Truck className="h-5 w-5 text-white/40" />
              <h4 className="text-lg font-semibold text-white">Observaciones</h4>
            </div>
            <p className="text-white/70">{orden.observaciones}</p>
          </QuantumGlassCard>
        )}
      </div>
    </Modal>
  )
}
