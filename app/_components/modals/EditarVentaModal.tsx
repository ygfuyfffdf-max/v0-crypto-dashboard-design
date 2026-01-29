'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — EDITAR VENTA MODAL
 * Modal para editar una venta existente
 * Mantiene la distribución GYA automática
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import {
    Building2,
    DollarSign,
    Loader2,
    Package,
    PiggyBank,
    Save,
    Sparkles,
    Truck,
} from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Modal, ModalFooter } from '../ui/Modal'
import { QuantumButton, QuantumGlassCard, QuantumInput } from '../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const EditVentaSchema = z.object({
  cantidad: z.number().min(1, 'Cantidad mínima: 1'),
  precioVentaUnidad: z.number().min(0.01, 'Precio venta requerido'),
  precioCompraUnidad: z.number().min(0.01, 'Precio compra requerido'),
  precioFlete: z.number().min(0),
  estadoPago: z.enum(['pendiente', 'parcial', 'completo']),
  montoPagado: z.number().min(0).optional(),
  observaciones: z.string().optional(),
})

type EditVentaFormData = z.infer<typeof EditVentaSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface EditarVentaModalProps {
  isOpen: boolean
  onClose: () => void
  ventaId: string
  onSuccess?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════
// DISTRIBUTION VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function GYADistribution({
  bovedaMonte,
  fletes,
  utilidades,
}: {
  bovedaMonte: number
  fletes: number
  utilidades: number
}) {
  const total = bovedaMonte + fletes + utilidades

  const items = [
    { name: 'Bóveda Monte', value: bovedaMonte, color: '#3B82F6', icon: Building2 },
    { name: 'Fletes', value: fletes, color: '#ec4899', icon: Truck },
    { name: 'Utilidades', value: utilidades, color: '#22C55E', icon: PiggyBank },
  ]

  return (
    <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-400">
        <Sparkles className="h-4 w-4 text-violet-400" />
        Distribución GYA Actualizada
      </h4>

      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-white">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <p className="text-xs text-gray-500">{percentage.toFixed(1)}% del total</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface VentaFromAPI {
  id: string
  clienteId: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  precioTotalVenta: number
  montoPagado: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  observaciones?: string
  cliente?: { nombre: string } | null
}

export function EditarVentaModal({ isOpen, onClose, ventaId, onSuccess }: EditarVentaModalProps) {
  const [isPending, startTransition] = useTransition()
  const [venta, setVenta] = useState<VentaFromAPI | null>(null)
  const [loadingVenta, setLoadingVenta] = useState(false)
  const { actualizarVenta } = useChronosStore()

  // ═══════════════════════════════════════════════════════════════════════
  // CARGAR VENTA DESDE API (no Zustand)
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen && ventaId) {
      setLoadingVenta(true)
      fetch(`/api/ventas/${ventaId}`)
        .then((r) => {
          if (!r.ok) throw new Error('Venta no encontrada')
          return r.json()
        })
        .then((data) => {
          setVenta(data)
          logger.info('Venta cargada desde API', { context: 'EditarVentaModal', ventaId })
        })
        .catch((err) => {
          logger.error('Error cargando venta', err, { context: 'EditarVentaModal' })
          toast.error('Error al cargar la venta')
        })
        .finally(() => setLoadingVenta(false))
    }
  }, [isOpen, ventaId])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditVentaFormData>({
    resolver: zodResolver(EditVentaSchema),
    defaultValues: venta
      ? {
          cantidad: venta.cantidad,
          precioVentaUnidad: venta.precioVentaUnidad,
          precioCompraUnidad: venta.precioCompraUnidad,
          precioFlete: venta.precioFlete,
          estadoPago: venta.estadoPago,
          montoPagado: venta.montoPagado || 0,
          observaciones: venta.observaciones || '',
        }
      : undefined,
  })

  // Actualizar valores del form cuando cambie la venta
  useEffect(() => {
    if (venta) {
      reset({
        cantidad: venta.cantidad,
        precioVentaUnidad: venta.precioVentaUnidad,
        precioCompraUnidad: venta.precioCompraUnidad,
        precioFlete: venta.precioFlete,
        estadoPago: venta.estadoPago,
        montoPagado: venta.montoPagado || 0,
        observaciones: venta.observaciones || '',
      })
    }
  }, [venta, reset])

  // Watch form values para calcular distribución
  const formValues = watch()
  const cantidad = formValues.cantidad || 0
  const precioVenta = formValues.precioVentaUnidad || 0
  const precioCompra = formValues.precioCompraUnidad || 0
  const precioFlete = formValues.precioFlete || 0
  const estadoPago = formValues.estadoPago
  const montoPagado = formValues.montoPagado || 0

  // Calcular distribución GYA
  const distribucion = useMemo(() => {
    const precioTotalVenta = precioVenta * cantidad
    const bovedaMonte = precioCompra * cantidad
    const fletes = precioFlete * cantidad
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad

    // Calcular proporción según estado de pago
    let proporcion = 1
    if (estadoPago === 'pendiente') {
      proporcion = 0
    } else if (estadoPago === 'parcial') {
      proporcion = precioTotalVenta > 0 ? montoPagado / precioTotalVenta : 0
    }

    return {
      precioTotalVenta,
      bovedaMonte: bovedaMonte * proporcion,
      fletes: fletes * proporcion,
      utilidades: utilidades * proporcion,
      proporcion,
    }
  }, [cantidad, precioVenta, precioCompra, precioFlete, estadoPago, montoPagado])

  const onSubmit = (data: EditVentaFormData) => {
    // ═══ PRE-SUBMIT VALIDATION ROBUSTO ═══
    if (!venta) {
      toast.error('Venta no encontrada', {
        description: 'No se pudo cargar la venta para editar',
      })
      return
    }

    if (data.cantidad < 1) {
      toast.error('Cantidad inválida', {
        description: 'La cantidad debe ser al menos 1',
      })
      return
    }

    if (data.precioVentaUnidad <= 0) {
      toast.error('Precio de venta inválido', {
        description: 'El precio de venta debe ser mayor a 0',
      })
      return
    }

    if (data.precioCompraUnidad <= 0) {
      toast.error('Precio de compra inválido', {
        description: 'El precio de compra debe ser mayor a 0',
      })
      return
    }

    // Validar margen positivo
    const margen = data.precioVentaUnidad - data.precioCompraUnidad - data.precioFlete
    if (margen <= 0) {
      toast.error('Margen negativo', {
        description: 'El precio de venta debe cubrir el costo + flete',
      })
      return
    }

    logger.info('🚀 Iniciando actualización de venta', {
      context: 'EditarVentaModal',
      data: { ventaId, cantidad: data.cantidad, estadoPago: data.estadoPago },
    })

    startTransition(async () => {
      try {
        // Calcular valores actualizados
        const precioTotalVenta = data.precioVentaUnidad * data.cantidad
        const montoPagadoFinal =
          data.estadoPago === 'completo' ? precioTotalVenta : data.montoPagado || 0

        // ═══════════════════════════════════════════════════════════════════
        // PERSISTIR EN API - Actualizar venta en base de datos
        // Usando el método PUT existente con el campo id en el body
        // ═══════════════════════════════════════════════════════════════════
        const response = await fetch('/api/ventas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: ventaId,
            cantidad: data.cantidad,
            precioVentaUnidad: data.precioVentaUnidad,
            precioCompraUnidad: data.precioCompraUnidad,
            precioFlete: data.precioFlete,
            estadoPago: data.estadoPago,
            montoPagado: montoPagadoFinal,
            observaciones: data.observaciones,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar venta en BD')
        }

        // Actualizar venta en Zustand para UI inmediata
        actualizarVenta(ventaId, {
          cantidad: data.cantidad,
          precioVentaUnidad: data.precioVentaUnidad,
          precioCompraUnidad: data.precioCompraUnidad,
          precioFlete: data.precioFlete,
          precioTotalVenta,
          estadoPago: data.estadoPago,
          montoPagado: montoPagadoFinal,
          observaciones: data.observaciones,
        })

        toast.success('Venta actualizada correctamente')
        onSuccess?.()
        onClose()
        reset()
      } catch (error) {
        toast.error('Error al actualizar la venta')
        logger.error('Error actualizando venta', error, { context: 'EditarVentaModal', ventaId })
      }
    })
  }

  // Loading state mientras carga la venta
  if (loadingVenta) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Venta" size="lg">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-white/60">Cargando datos de la venta...</p>
        </div>
      </Modal>
    )
  }

  if (!venta) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Venta" size="lg">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
          <p className="text-red-400">Venta no encontrada</p>
          <QuantumButton variant="secondary" onClick={onClose}>
            Cerrar
          </QuantumButton>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Venta" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        {/* Información del Cliente (Solo lectura) */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-3 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Información de Cliente</h3>
          </div>
          <p className="text-white/60">
            Cliente:{' '}
            <span className="font-medium text-white">
              {typeof venta.cliente === 'string'
                ? venta.cliente
                : (venta.cliente as { nombre?: string })?.nombre || 'Sin cliente'}
            </span>
          </p>
        </QuantumGlassCard>

        {/* Detalles de Venta */}
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Detalles de Venta</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <QuantumInput
              label="Cantidad"
              type="number"
              step="1"
              error={errors.cantidad?.message}
              {...register('cantidad', { valueAsNumber: true })}
            />
            <QuantumInput
              label="Precio Venta (unitario)"
              type="number"
              step="0.01"
              error={errors.precioVentaUnidad?.message}
              icon={<DollarSign className="h-4 w-4" />}
              {...register('precioVentaUnidad', { valueAsNumber: true })}
            />
            <QuantumInput
              label="Precio Compra (unitario)"
              type="number"
              step="0.01"
              error={errors.precioCompraUnidad?.message}
              icon={<Building2 className="h-4 w-4" />}
              {...register('precioCompraUnidad', { valueAsNumber: true })}
            />
            <QuantumInput
              label="Precio Flete (unitario)"
              type="number"
              step="0.01"
              error={errors.precioFlete?.message}
              icon={<Truck className="h-4 w-4" />}
              {...register('precioFlete', { valueAsNumber: true })}
            />
          </div>

          <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
            <p className="text-sm text-white/60">
              Total Venta:{' '}
              <span className="text-xl font-bold text-white">
                {formatCurrency(distribucion.precioTotalVenta)}
              </span>
            </p>
          </div>
        </QuantumGlassCard>

        {/* Estado de Pago */}
        <QuantumGlassCard variant="elevated">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Estado de Pago</label>
              <select
                {...register('estadoPago')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
              >
                <option value="pendiente" className="bg-gray-900">
                  Pendiente
                </option>
                <option value="parcial" className="bg-gray-900">
                  Parcial
                </option>
                <option value="completo" className="bg-gray-900">
                  Completo
                </option>
              </select>
              {errors.estadoPago && (
                <span className="text-xs text-rose-400">{errors.estadoPago.message}</span>
              )}
            </div>

            {estadoPago === 'parcial' && (
              <QuantumInput
                label="Monto Pagado"
                type="number"
                step="0.01"
                error={errors.montoPagado?.message}
                icon={<DollarSign className="h-4 w-4" />}
                {...register('montoPagado', { valueAsNumber: true })}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Observaciones</label>
              <textarea
                {...register('observaciones')}
                rows={3}
                placeholder="Notas adicionales..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm placeholder:text-white/20 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
              />
              {errors.observaciones && (
                <span className="text-xs text-rose-400">{errors.observaciones.message}</span>
              )}
            </div>
          </div>
        </QuantumGlassCard>

        {/* Distribución GYA */}
        <GYADistribution
          bovedaMonte={distribucion.bovedaMonte}
          fletes={distribucion.fletes}
          utilidades={distribucion.utilidades}
        />

        {/* Footer con Acciones */}
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/5 px-6 py-3 font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            Cancelar
          </button>
          <QuantumButton type="submit" loading={isPending} icon={<Save className="h-4 w-4" />}>
            Guardar Cambios
          </QuantumButton>
        </ModalFooter>
      </form>
    </Modal>
  )
}
