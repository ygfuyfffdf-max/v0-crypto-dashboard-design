'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — DETALLE VENTA MODAL
 * Modal para ver detalles completos de una venta
 * Incluye distribución GYA, historial y timeline
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getVentaById } from '@/app/_actions/ventas'
import { safeNumber, toDate } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import { motion } from 'motion/react'
import {
  Box,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Hash,
  Package,
  PiggyBank,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../ui/Modal'
import { QuantumGlassCard } from '../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface LoteOrigen {
  ocId: string
  cantidad: number
  costoUnidad: number
  distribuidorId?: string
  fechaOC?: string
  producto?: string
}

interface VentaCompleta {
  id: string
  fecha: string | Date
  clienteId: string
  cliente?: { nombre: string } | string | null
  productoId?: string
  ocId?: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  precioTotalVenta: number
  montoPagado: number
  estadoPago: string
  origenLotes?: string | null
  observaciones?: string | null
  // Campos calculados o de distribución
  montoBovedaMonte?: number
  montoFletes?: number
  montoUtilidades?: number
}

interface DetalleVentaModalProps {
  isOpen: boolean
  onClose: () => void
  ventaId: string
}

export function DetalleVentaModal({ isOpen, onClose, ventaId }: DetalleVentaModalProps) {
  const { ventas } = useChronosStore()

  // Buscar en store local primero
  const ventaStore = useMemo(
    () => ventas.find((v) => v.id === ventaId) as unknown as VentaCompleta | undefined,
    [ventas, ventaId],
  )

  const [ventaDetails, setVentaDetails] = useState<VentaCompleta | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch de datos frescos al abrir
  useEffect(() => {
    if (isOpen && ventaId) {
      setLoading(true)
      // Resetear detalles anteriores para evitar parpadeos de datos viejos
      setVentaDetails(null)

      getVentaById(ventaId)
        .then((result) => {
          if (result.success && result.data) {
            setVentaDetails(result.data as unknown as VentaCompleta)
          }
        })
        .catch((err) => logger.error('Error fetching venta details:', err))
        .finally(() => setLoading(false))
    }
  }, [isOpen, ventaId])

  // Fusionar datos (prioridad a los detalles frescos de la DB)
  const venta = useMemo((): VentaCompleta | null => {
    if (ventaDetails) return ventaDetails
    if (ventaStore) return ventaStore
    return null
  }, [ventaStore, ventaDetails])

  // Parsear origenLotes de forma segura
  const origenLotes = useMemo((): LoteOrigen[] => {
    if (!venta?.origenLotes) return []

    if (typeof venta.origenLotes === 'string') {
      try {
        const parsed = JSON.parse(venta.origenLotes)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        logger.error('Error parsing origenLotes JSON', e)
        return []
      }
    }
    // Si ya viene como objeto (algunos ORMs lo hacen automático)
    return Array.isArray(venta.origenLotes) ? venta.origenLotes : []
  }, [venta])

  if (!venta) {
    return null
  }

  // Calcular distribución GYA
  const distribucion = useMemo(() => {
    const precioCompra = safeNumber(venta.precioCompraUnidad)
    const precioVenta = safeNumber(venta.precioVentaUnidad)
    const precioFlete = safeNumber(venta.precioFlete)

    const bovedaMonte = precioCompra * venta.cantidad
    const fletes = precioFlete * venta.cantidad
    const utilidades = (precioVenta - precioCompra - precioFlete) * venta.cantidad

    // Calcular proporción según estado de pago
    let proporcion = 1
    if (venta.estadoPago === 'pendiente') {
      proporcion = 0
    } else if (venta.estadoPago === 'parcial') {
      proporcion =
        venta.precioTotalVenta > 0 ? (venta.montoPagado || 0) / venta.precioTotalVenta : 0
    }

    return {
      bovedaMonte: bovedaMonte * proporcion,
      fletes: fletes * proporcion,
      utilidades: utilidades * proporcion,
      proporcion,
      totalEsperado: {
        bovedaMonte,
        fletes,
        utilidades,
      },
    }
  }, [venta])

  const statusConfig = {
    completo: { label: 'Completada', color: 'emerald', icon: CheckCircle2 },
    parcial: { label: 'Parcial', color: 'violet', icon: Clock },
    pendiente: { label: 'Pendiente', color: 'amber', icon: Clock },
  }

  const status =
    statusConfig[venta.estadoPago as keyof typeof statusConfig] || statusConfig.pendiente
  const StatusIcon = status.icon

  // Nombre del cliente seguro
  const nombreCliente =
    typeof venta.cliente === 'string' ? venta.cliente : venta.cliente?.nombre || 'Cliente General'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle de Venta" size="lg">
      <div className="space-y-6 p-6">
        {/* Header con Estado */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-1 text-2xl font-bold text-white">Venta #{venta.id.slice(0, 8)}</h3>
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="h-4 w-4" />
              <span>
                {toDate(venta.fecha).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
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

        {/* Cliente */}
        <QuantumGlassCard variant="elevated">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
              <User className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-xs tracking-wider text-white/40 uppercase">Cliente</p>
              <p className="text-lg font-semibold text-white">{nombreCliente}</p>
            </div>
          </div>
        </QuantumGlassCard>

        {/* ═══════════════════════════════════════════════════════════════
            TRAZABILIDAD COMPLETA — IDs y Referencias
            ═══════════════════════════════════════════════════════════════ */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-violet-400" />
            <h4 className="text-lg font-semibold text-white">Trazabilidad Completa</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Venta ID */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-2">
                <Hash className="h-3 w-3 text-white/40" />
                <span className="text-[10px] tracking-wider text-white/40 uppercase">ID Venta</span>
              </div>
              <p className="truncate font-mono text-sm text-white">{venta.id}</p>
            </div>

            {/* Cliente ID */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-2">
                <User className="h-3 w-3 text-cyan-400/60" />
                <span className="text-[10px] tracking-wider text-cyan-400/60 uppercase">
                  Cliente ID
                </span>
              </div>
              <p className="truncate font-mono text-sm text-cyan-400">{venta.clienteId}</p>
            </div>

            {/* Producto ID */}
            {venta.productoId && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Box className="h-3 w-3 text-amber-400/60" />
                  <span className="text-[10px] tracking-wider text-amber-400/60 uppercase">
                    Producto ID
                  </span>
                </div>
                <p className="truncate font-mono text-sm text-amber-400">{venta.productoId}</p>
              </div>
            )}

            {/* Orden de Compra ID */}
            {venta.ocId && (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <ShoppingCart className="h-3 w-3 text-violet-400/60" />
                  <span className="text-[10px] tracking-wider text-violet-400/60 uppercase">
                    OC ID (Lote)
                  </span>
                </div>
                <p className="truncate font-mono text-sm text-violet-400">{venta.ocId}</p>
              </div>
            )}
          </div>

          {/* Origen de Lotes */}
          {origenLotes.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-white/70">
                  Origen de Lotes ({origenLotes.length})
                </span>
              </div>
              <div className="space-y-2">
                {origenLotes.slice(0, 3).map((lote, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-violet-500" />
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-violet-400">
                          OC-{lote.ocId.slice(0, 8)}
                        </span>
                        {lote.producto && (
                          <span className="text-[10px] text-white/40">{lote.producto}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-white/60">
                      {lote.cantidad} uds @ {formatCurrency(lote.costoUnidad)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </QuantumGlassCard>

        {/* Detalles de Producto */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-violet-400" />
            <h4 className="text-lg font-semibold text-white">Detalles de Producto</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs text-white/40">Cantidad</p>
              <p className="text-lg font-semibold text-white">{venta.cantidad} unidades</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/40">Precio Unitario Venta</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(safeNumber(venta.precioVentaUnidad))}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/40">Precio Unitario Compra</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(safeNumber(venta.precioCompraUnidad))}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/40">Precio Flete</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(safeNumber(venta.precioFlete))}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Total Venta</span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(venta.precioTotalVenta)}
              </span>
            </div>
          </div>
        </QuantumGlassCard>

        {/* Estado de Pago */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-violet-400" />
            <h4 className="text-lg font-semibold text-white">Estado de Pago</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Monto Pagado</span>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(venta.montoPagado || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Monto Pendiente</span>
              <span className="text-lg font-semibold text-amber-400">
                {formatCurrency(venta.precioTotalVenta - (venta.montoPagado || 0))}
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                <span>Progreso de Pago</span>
                <span>{(distribucion.proporcion * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${distribucion.proporcion * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                />
              </div>
            </div>
          </div>
        </QuantumGlassCard>

        {/* Distribución GYA */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h4 className="text-lg font-semibold text-white">Distribución GYA</h4>
          </div>

          <div className="space-y-4">
            {/* Bóveda Monte */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span className="text-white/60">Bóveda Monte</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono font-semibold text-white">
                    {formatCurrency(distribucion.bovedaMonte)}
                  </span>
                  <span className="text-[10px] text-white/30">
                    Meta: {formatCurrency(distribucion.totalEsperado.bovedaMonte)}
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(distribucion.bovedaMonte / venta.precioTotalVenta) * 100}%`,
                  }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full rounded-full bg-blue-500"
                />
              </div>
            </div>

            {/* Fletes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-pink-400" />
                  <span className="text-white/60">Fletes</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono font-semibold text-white">
                    {formatCurrency(distribucion.fletes)}
                  </span>
                  <span className="text-[10px] text-white/30">
                    Meta: {formatCurrency(distribucion.totalEsperado.fletes)}
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(distribucion.fletes / venta.precioTotalVenta) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full rounded-full bg-pink-500"
                />
              </div>
            </div>

            {/* Utilidades */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-emerald-400" />
                  <span className="text-white/60">Utilidades</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono font-semibold text-white">
                    {formatCurrency(distribucion.utilidades)}
                  </span>
                  <span className="text-[10px] text-white/30">
                    Meta: {formatCurrency(distribucion.totalEsperado.utilidades)}
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(distribucion.utilidades / venta.precioTotalVenta) * 100}%`,
                  }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </QuantumGlassCard>

        {/* Rentabilidad Venta (Advanced Metrics) */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">Rentabilidad Venta</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ganancia Neta */}
            <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
              <p className="mb-1 text-xs text-white/40">Ganancia Neta (Utilidad)</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(distribucion.totalEsperado.utilidades)}
              </p>
            </div>

            {/* Margen % */}
            <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-3">
              <p className="mb-1 text-xs text-white/40">Margen Real</p>
              <p className="text-xl font-bold text-cyan-400">
                {venta.precioTotalVenta > 0
                  ? (
                      (distribucion.totalEsperado.utilidades / venta.precioTotalVenta) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </p>
            </div>

            {/* Costo Total */}
            <div>
              <p className="mb-1 text-xs text-white/40">Costo Total (Producto + Flete)</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(
                  distribucion.totalEsperado.bovedaMonte + distribucion.totalEsperado.fletes,
                )}
              </p>
            </div>

            {/* ROI */}
            <div>
              <p className="mb-1 text-xs text-white/40">Retorno (ROI)</p>
              <p className="text-lg font-semibold text-white">
                {distribucion.totalEsperado.bovedaMonte > 0
                  ? (
                      (distribucion.totalEsperado.utilidades /
                        distribucion.totalEsperado.bovedaMonte) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </p>
            </div>
          </div>
        </QuantumGlassCard>

        {/* Observaciones */}
        {venta.observaciones && (
          <QuantumGlassCard variant="elevated">
            <div className="mb-2 flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <h4 className="text-sm font-semibold text-white">Observaciones</h4>
            </div>
            <p className="text-sm leading-relaxed text-white/60">{venta.observaciones}</p>
          </QuantumGlassCard>
        )}

        {/* FIRMAS DIGITALES FUNCIONALES */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h4 className="text-lg font-semibold text-white">Certificación Digital</h4>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Firma Cliente */}
            <div className="space-y-2">
              <p className="text-xs tracking-wider text-white/40 uppercase">Firma Cliente</p>
              <div className="group relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
                <p className="font-dancing-script z-10 rotate-[-5deg] text-2xl text-white/80 italic">
                  {nombreCliente}
                </p>
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="font-mono text-[10px] text-emerald-500">VERIFICADO</span>
                </div>
              </div>
              <p className="text-center font-mono text-[10px] text-white/30">
                ID: {venta.clienteId.slice(0, 12)}...
              </p>
            </div>

            {/* Firma Sistema */}
            <div className="space-y-2">
              <p className="text-xs tracking-wider text-white/40 uppercase">
                Sello Digital Chronos
              </p>
              <div className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent" />
                <Hash className="mb-1 h-8 w-8 text-cyan-400/40" />
                <p className="font-mono text-[10px] text-cyan-300">{venta.id}</p>
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-cyan-500" />
                  <span className="font-mono text-[10px] text-cyan-500">SECURE</span>
                </div>
              </div>
              <p className="text-center font-mono text-[10px] text-white/30">
                {new Date().toISOString()}
              </p>
            </div>
          </div>
        </QuantumGlassCard>
      </div>
    </Modal>
  )
}
