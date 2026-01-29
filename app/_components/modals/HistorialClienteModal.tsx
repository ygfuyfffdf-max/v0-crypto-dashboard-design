'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — HISTORIAL CLIENTE MODAL
 * Modal para ver historial completo de ventas y pagos de un cliente
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { formatCurrency, toDate } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { motion } from 'motion/react'
import {
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Package,
    Receipt,
    TrendingUp,
} from 'lucide-react'
import { useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { QuantumGlassCard } from '../ui/QuantumElevatedUI'

interface HistorialClienteModalProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
}

export function HistorialClienteModal({ isOpen, onClose, clienteId }: HistorialClienteModalProps) {
  const { clientes, ventas } = useChronosStore()

  const cliente = useMemo(() => clientes.find((c) => c.id === clienteId), [clientes, clienteId])

  const ventasCliente = useMemo(
    () =>
      ventas
        .filter((v) => v.clienteId === clienteId)
        .sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()),
    [ventas, clienteId],
  )

  const estadisticas = useMemo(() => {
    const totalCompras = ventasCliente.reduce((sum, v) => sum + v.precioTotalVenta, 0)
    const totalPagado = ventasCliente.reduce((sum, v) => sum + (v.montoPagado || 0), 0)
    const adeudoActual = totalCompras - totalPagado
    const numCompras = ventasCliente.length
    const ventasCompletas = ventasCliente.filter((v) => v.estadoPago === 'completo').length

    return {
      totalCompras,
      totalPagado,
      adeudoActual,
      numCompras,
      ventasCompletas,
      promedioCompra: numCompras > 0 ? totalCompras / numCompras : 0,
    }
  }, [ventasCliente])

  if (!cliente) {
    return null
  }

  const statusConfig = {
    completo: { label: 'Completada', color: 'emerald', icon: CheckCircle2 },
    parcial: { label: 'Parcial', color: 'violet', icon: Clock },
    pendiente: { label: 'Pendiente', color: 'amber', icon: Clock },
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Historial de ${cliente.nombre}`} size="xl">
      <div className="space-y-6 p-6">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuantumGlassCard variant="elevated">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                <Receipt className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase">Total Compras</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(estadisticas.totalCompras)}
                </p>
              </div>
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard variant="elevated">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase">Total Pagado</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(estadisticas.totalPagado)}
                </p>
              </div>
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard variant="elevated">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <DollarSign className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase">Adeudo Actual</p>
                <p className="text-xl font-bold text-amber-300">
                  {formatCurrency(estadisticas.adeudoActual)}
                </p>
              </div>
            </div>
          </QuantumGlassCard>
        </div>

        {/* Métricas Adicionales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Número de Compras</span>
              <span className="font-bold text-white">{estadisticas.numCompras}</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Promedio por Compra</span>
              <span className="font-bold text-white">
                {formatCurrency(estadisticas.promedioCompra)}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Ventas */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Historial de Compras</h3>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {ventasCliente.length === 0 ? (
              <p className="py-8 text-center text-white/40">No hay compras registradas</p>
            ) : (
              ventasCliente.map((venta, index) => {
                const status = statusConfig[venta.estadoPago]
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={venta.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 transition-spring hover:bg-white/8 hover-elevate"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                          <Package className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Venta #{venta.id.slice(0, 8)}</p>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {toDate(venta.fecha).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-white">
                          {formatCurrency(venta.precioTotalVenta)}
                        </p>
                        <div className={`flex items-center gap-1 text-xs text-${status.color}-400`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{status.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-white/40">
                      <span>{venta.cantidad} unidades</span>
                      {venta.estadoPago === 'parcial' && (
                        <span>Pagado: {formatCurrency(venta.montoPagado || 0)}</span>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </QuantumGlassCard>
      </div>
    </Modal>
  )
}
