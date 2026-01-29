'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — EDITAR ORDEN COMPRA MODAL
 * Modal para editar orden de compra existente
 * CONECTADO A TURSO - Carga datos desde API
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSign, Loader2, Package, Save } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Modal, ModalFooter } from '../ui/Modal'
import { QuantumButton, QuantumGlassCard, QuantumInput } from '../ui/QuantumElevatedUI'

const EditOrdenSchema = z.object({
  cantidad: z.number().min(1, 'Cantidad mínima: 1'),
  precioUnitario: z.number().min(0.01, 'Precio requerido'),
  estado: z.enum(['pendiente', 'en_transito', 'recibida', 'cancelada']),
  observaciones: z.string().optional(),
})

type EditOrdenFormData = z.infer<typeof EditOrdenSchema>

// Tipo para orden desde API
interface OrdenFromAPI {
  id: string
  cantidad: number
  precioUnitario: number
  estado: string
  observaciones?: string | null
  producto?: string
  distribuidor?: { nombre: string }
}

interface EditarOrdenCompraModalProps {
  isOpen: boolean
  onClose: () => void
  ordenId: string
  onSuccess?: () => void
}

export function EditarOrdenCompraModal({ isOpen, onClose, ordenId, onSuccess }: EditarOrdenCompraModalProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [orden, setOrden] = useState<OrdenFromAPI | null>(null)
  const { actualizarOrdenCompra } = useChronosStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditOrdenFormData>({
    resolver: zodResolver(EditOrdenSchema),
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CARGAR ORDEN DESDE API AL ABRIR
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen && ordenId) {
      setIsLoading(true)
      fetch(`/api/ordenes/${ordenId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Orden no encontrada')
          return res.json()
        })
        .then((data: OrdenFromAPI) => {
          setOrden(data)
          reset({
            cantidad: data.cantidad,
            precioUnitario: data.precioUnitario,
            estado: data.estado as any,
            observaciones: data.observaciones || '',
          })
          logger.info('Orden cargada desde API', {
            context: 'EditarOrdenCompraModal',
            data: { id: ordenId },
          })
        })
        .catch((err) => {
          logger.error('Error cargando orden', err, { context: 'EditarOrdenCompraModal' })
          toast.error('Error al cargar orden')
          setOrden(null)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, ordenId, reset])

  const onSubmit = (data: EditOrdenFormData) => {
    // ═══ PRE-SUBMIT VALIDATION ROBUSTO ═══
    if (!orden) {
      toast.error('Orden no encontrada', {
        description: 'No se pudo cargar la orden para editar',
      })
      return
    }

    if (data.cantidad < 1) {
      toast.error('Cantidad inválida', {
        description: 'La cantidad debe ser al menos 1',
      })
      return
    }

    if (data.precioUnitario <= 0) {
      toast.error('Precio inválido', {
        description: 'El precio unitario debe ser mayor a 0',
      })
      return
    }

    logger.info('🚀 Iniciando actualización de orden de compra', {
      context: 'EditarOrdenCompraModal',
      data: { ordenId, cantidad: data.cantidad, estado: data.estado },
    })

    startTransition(async () => {
      try {
        const precioTotal = data.cantidad * data.precioUnitario

        // ═══════════════════════════════════════════════════════════════════
        // PRIMERO: Persistir en base de datos vía API
        // ═══════════════════════════════════════════════════════════════════
        const response = await fetch('/api/ordenes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: ordenId,
            cantidad: data.cantidad,
            precioUnitario: data.precioUnitario,
            costoTotal: precioTotal,
            estado: data.estado,
            observaciones: data.observaciones,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar orden')
        }

        // ═══════════════════════════════════════════════════════════════════
        // DESPUÉS: Actualizar estado local para UI inmediata
        // ═══════════════════════════════════════════════════════════════════
        actualizarOrdenCompra(ordenId, {
          cantidad: data.cantidad,
          precioUnitario: data.precioUnitario,
          costoTotal: precioTotal,
          estado: data.estado,
          observaciones: data.observaciones,
        })

        toast.success('Orden actualizada correctamente')
        logger.info('Orden actualizada', {
          context: 'EditarOrdenCompraModal',
          data: { id: ordenId },
        })
        onSuccess?.()
        onClose()
        reset()
      } catch (error) {
        toast.error('Error al actualizar orden')
        logger.error('Error al actualizar orden', error as Error, {
          context: 'EditarOrdenCompraModal',
        })
      }
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADOS DE CARGA Y ERROR
  // ═══════════════════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Orden de Compra" size="md">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <span className="ml-3 text-white/60">Cargando orden...</span>
        </div>
      </Modal>
    )
  }

  if (!orden) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Orden de Compra" size="md">
        <div className="flex h-64 flex-col items-center justify-center text-white/60">
          <Package className="mb-4 h-12 w-12 text-rose-400/50" />
          <p>Orden no encontrada</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Orden de Compra" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Detalles de la Orden</h3>
          </div>

          <div className="space-y-4">
            <QuantumInput
              label="Cantidad"
              type="number"
              step="1"
              error={errors.cantidad?.message}
              {...register('cantidad', { valueAsNumber: true })}
            />

            <QuantumInput
              label="Precio Unitario"
              type="number"
              step="0.01"
              error={errors.precioUnitario?.message}
              icon={<DollarSign className="h-4 w-4" />}
              {...register('precioUnitario', { valueAsNumber: true })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Estado</label>
              <select
                {...register('estado')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
              >
                <option value="pendiente" className="bg-gray-900">
                  Pendiente
                </option>
                <option value="en_transito" className="bg-gray-900">
                  En Tránsito
                </option>
                <option value="recibida" className="bg-gray-900">
                  Recibida
                </option>
                <option value="cancelada" className="bg-gray-900">
                  Cancelada
                </option>
              </select>
              {errors.estado && (
                <span className="text-xs text-rose-400">{errors.estado.message}</span>
              )}
            </div>

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
