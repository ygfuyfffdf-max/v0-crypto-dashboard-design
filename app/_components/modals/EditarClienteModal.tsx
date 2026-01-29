'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — EDITAR CLIENTE MODAL
 * Modal para editar información de cliente existente
 * CONECTADO A TURSO - Carga datos desde API
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getClienteById, updateCliente } from '@/app/_actions/clientes'
import { UpdateClienteInput, UpdateClienteSchema } from '@/app/_actions/types'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Phone, Save, User } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal, ModalFooter } from '../ui/Modal'
import { QuantumButton, QuantumGlassCard, QuantumInput } from '../ui/QuantumElevatedUI'

// Tipo para cliente desde API
interface ClienteFromAPI {
  id: string
  nombre: string
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  rfc?: string | null
}

interface EditarClienteModalProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  onSuccess?: () => void
}

export function EditarClienteModal({ isOpen, onClose, clienteId, onSuccess }: EditarClienteModalProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [cliente, setCliente] = useState<ClienteFromAPI | null>(null)
  const { actualizarCliente } = useChronosStore()

  // Omit 'id' from the form because it comes from props, we merge it on submit
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<UpdateClienteInput, 'id'>>({
    resolver: zodResolver(UpdateClienteSchema.omit({ id: true })),
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CARGAR CLIENTE DESDE API AL ABRIR
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen && clienteId) {
      setIsLoading(true)
      getClienteById(clienteId)
        .then((result) => {
          if (result.error || !result.data) throw new Error(result.error || 'Cliente no encontrado')
          const data = result.data
          setCliente(data)
          reset({
            nombre: data.nombre,
            telefono: data.telefono || '',
            email: data.email || '',
            direccion: data.direccion || '',
          })
          logger.info('Cliente cargado desde API', {
            context: 'EditarClienteModal',
            data: { id: clienteId },
          })
        })
        .catch((err) => {
          logger.error('Error cargando cliente', err, { context: 'EditarClienteModal' })
          toast.error('Error al cargar cliente')
          setCliente(null)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, clienteId, reset])

  const onSubmit = (data: Omit<UpdateClienteInput, 'id'>) => {
    // ═══ PRE-SUBMIT VALIDATION ROBUSTO ═══
    if (!cliente) {
      toast.error('Cliente no encontrado', {
        description: 'No se pudo cargar el cliente para editar',
      })
      return
    }

    if (!data.nombre || data.nombre.trim().length < 2) {
      toast.error('Nombre inválido', {
        description: 'El nombre debe tener al menos 2 caracteres',
      })
      return
    }

    // Validar email si se proporciona
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast.error('Email inválido', {
        description: 'Por favor ingresa un email válido',
      })
      return
    }

    logger.info('🚀 Iniciando actualización de cliente', {
      context: 'EditarClienteModal',
      data: { clienteId, nombre: data.nombre },
    })

    startTransition(async () => {
      try {
        // ═══════════════════════════════════════════════════════════════════
        // PERSISTIR EN API - Actualizar cliente en base de datos
        // ═══════════════════════════════════════════════════════════════════
        const result = await updateCliente({
          id: clienteId,
          ...data,
        })

        if (result.error) {
          throw new Error(result.error)
        }

        // Actualizar Zustand para UI inmediata
        actualizarCliente(clienteId, {
          nombre: data.nombre,
          telefono: data.telefono || undefined,
          email: data.email || undefined,
          direccion: data.direccion || undefined,
        })

        toast.success('Cliente actualizado correctamente')
        logger.info('Cliente actualizado', {
          context: 'EditarClienteModal',
          data: { id: clienteId },
        })
        onSuccess?.()
        onClose()
        reset()
      } catch (error) {
        toast.error('Error al actualizar cliente')
        logger.error('Error al actualizar cliente', error as Error, {
          context: 'EditarClienteModal',
        })
      }
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADOS DE CARGA Y ERROR
  // ═══════════════════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="md">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <span className="ml-3 text-white/60">Cargando cliente...</span>
        </div>
      </Modal>
    )
  }

  if (!cliente) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="md">
        <div className="flex h-64 flex-col items-center justify-center text-white/60">
          <User className="mb-4 h-12 w-12 text-rose-400/50" />
          <p>Cliente no encontrado</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <User className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Información del Cliente</h3>
          </div>

          <div className="space-y-4">
            <QuantumInput
              label="Nombre Completo"
              placeholder="Ej: Juan Pérez"
              error={errors.nombre?.message}
              icon={<User className="h-4 w-4" />}
              {...register('nombre')}
            />

            <QuantumInput
              label="Teléfono"
              placeholder="Ej: 555-1234"
              error={errors.telefono?.message}
              icon={<Phone className="h-4 w-4" />}
              {...register('telefono')}
            />

            <QuantumInput
              label="Email"
              type="email"
              placeholder="cliente@example.com"
              error={errors.email?.message}
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Dirección</label>
              <textarea
                {...register('direccion')}
                rows={3}
                placeholder="Dirección completa..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white backdrop-blur-sm placeholder:text-white/20 focus:ring-2 focus:ring-violet-500/50 focus:outline-none"
              />
              {errors.direccion && (
                <span className="text-xs text-rose-400">{errors.direccion.message}</span>
              )}
            </div>
          </div>
        </QuantumGlassCard>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/5 px-6 py-3 font-medium text-white/80 transition-spring hover:bg-white/10 hover:text-white hover:scale-105"
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
