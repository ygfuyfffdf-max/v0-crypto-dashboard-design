'use client'

import { formatCurrency, toDate } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { motion } from 'motion/react'
import { Calendar, CheckCircle2, Clock, DollarSign, Package, Receipt } from 'lucide-react'
import { useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { QuantumGlassCard } from '../ui/QuantumElevatedUI'

interface HistorialDistribuidorModalProps {
  isOpen: boolean
  onClose: () => void
  distribuidorId: string
}

export function HistorialDistribuidorModal({
  isOpen,
  onClose,
  distribuidorId,
}: HistorialDistribuidorModalProps) {
  const { distribuidores, ordenesCompra } = useChronosStore()

  const distribuidor = useMemo(
    () => distribuidores.find((d) => d.id === distribuidorId),
    [distribuidores, distribuidorId],
  )

  const ordenesDistribuidor = useMemo(
    () =>
      ordenesCompra
        .filter((o) => o.distribuidorId === distribuidorId)
        .sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime()),
    [ordenesCompra, distribuidorId],
  )

  const estadisticas = useMemo(() => {
    const totalOrdenes = ordenesDistribuidor.reduce((sum, o) => sum + (o.costoTotal || 0), 0)
    const totalPagado = ordenesDistribuidor.reduce((sum, o) => sum + (o.pagoDistribuidor || 0), 0)
    const pendiente = totalOrdenes - totalPagado
    const numOrdenes = ordenesDistribuidor.length
    const ordenesCompletas = ordenesDistribuidor.filter((o) => o.estado === 'recibida').length

    return {
      totalOrdenes,
      totalPagado,
      pendiente,
      numOrdenes,
      ordenesCompletas,
    }
  }, [ordenesDistribuidor])

  if (!distribuidor) {
    return null
  }

  const statusConfig = {
    pendiente: { label: 'Pendiente', color: 'amber', icon: Clock },
    en_transito: { label: 'En Tránsito', color: 'blue', icon: Package },
    recibida: { label: 'Recibida', color: 'emerald', icon: CheckCircle2 },
    cancelada: { label: 'Cancelada', color: 'red', icon: Clock },
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de ${distribuidor.nombre}`}
      size="xl"
    >
      <div className="space-y-6 p-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuantumGlassCard variant="elevated">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                <Receipt className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Total Órdenes</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(estadisticas.totalOrdenes)}
                </p>
              </div>
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard variant="elevated">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Pagado</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(estadisticas.totalPagado)}
                </p>
              </div>
            </div>
          </QuantumGlassCard>

          <QuantumGlassCard variant="elevated">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <DollarSign className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Pendiente</p>
                <p className="text-xl font-bold text-amber-300">
                  {formatCurrency(estadisticas.pendiente)}
                </p>
              </div>
            </div>
          </QuantumGlassCard>
        </div>

        {/* Lista de Órdenes */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Órdenes de Compra</h3>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {ordenesDistribuidor.length === 0 ? (
              <p className="py-8 text-center text-white/40">No hay órdenes registradas</p>
            ) : (
              ordenesDistribuidor.map((orden, index) => {
                const status =
                  statusConfig[orden.estado as keyof typeof statusConfig] || statusConfig.pendiente
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={orden.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 transition-spring hover:bg-white/8 hover-elevate"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                          <Package className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Orden #{orden.id.slice(0, 8)}</p>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Calendar className="h-3 w-3" />
                            <span>{toDate(orden.fecha).toLocaleDateString('es-MX')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-white">
                          {formatCurrency(orden.costoTotal || 0)}
                        </p>
                        <div className={`flex items-center gap-1 text-xs text-${status.color}-400`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{status.label}</span>
                        </div>
                      </div>
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
