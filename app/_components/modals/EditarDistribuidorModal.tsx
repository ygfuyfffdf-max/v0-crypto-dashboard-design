'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — EDITAR DISTRIBUIDOR MODAL
 * Modal para editar información de distribuidor existente
 * CONECTADO A TURSO - Carga datos desde API
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2, Mail, Phone, Save, User } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Modal, ModalFooter } from '../ui/Modal'
import { QuantumButton, QuantumGlassCard, QuantumInput } from '../ui/QuantumElevatedUI'

const EditDistribuidorSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

type EditDistribuidorFormData = z.infer<typeof EditDistribuidorSchema>

// Tipo para distribuidor desde API
interface DistribuidorFromAPI {
  id: string
  nombre: string
  empresa?: string | null
  telefono?: string | null
  email?: string | null
  tipoProductos?: string | null
}

interface EditarDistribuidorModalProps {
  isOpen: boolean
  onClose: () => void
  distribuidorId: string
  onSuccess?: () => void
}

export function EditarDistribuidorModal({
  isOpen,
  onClose,
  distribuidorId,
  onSuccess,
}: EditarDistribuidorModalProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [distribuidor, setDistribuidor] = useState<DistribuidorFromAPI | null>(null)
  const { actualizarDistribuidor } = useChronosStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditDistribuidorFormData>({
    resolver: zodResolver(EditDistribuidorSchema),
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CARGAR DISTRIBUIDOR DESDE API AL ABRIR
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen && distribuidorId) {
      setIsLoading(true)
      fetch(`/api/distribuidores/${distribuidorId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Distribuidor no encontrado')
          return res.json()
        })
        .then((data: DistribuidorFromAPI) => {
          setDistribuidor(data)
          reset({
            nombre: data.nombre,
            empresa: data.empresa || '',
            telefono: data.telefono || '',
            email: data.email || '',
          })
          logger.info('Distribuidor cargado desde API', {
            context: 'EditarDistribuidorModal',
            data: { id: distribuidorId },
          })
        })
        .catch((err) => {
          logger.error('Error cargando distribuidor', err, { context: 'EditarDistribuidorModal' })
          toast.error('Error al cargar distribuidor')
          setDistribuidor(null)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, distribuidorId, reset])

  const onSubmit = (data: EditDistribuidorFormData) => {
    // ═══ PRE-SUBMIT VALIDATION ROBUSTO ═══
    if (!distribuidor) {
      toast.error('Distribuidor no encontrado', {
        description: 'No se pudo cargar el distribuidor para editar',
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
    if (data.email && data.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      toast.error('Email inválido', {
        description: 'Por favor ingresa un email válido',
      })
      return
    }

    logger.info('🚀 Iniciando actualización de distribuidor', {
      context: 'EditarDistribuidorModal',
      data: { distribuidorId, nombre: data.nombre },
    })

    startTransition(async () => {
      try {
        // ═══════════════════════════════════════════════════════════════════
        // PERSISTIR EN API - Actualizar distribuidor en base de datos
        // ═══════════════════════════════════════════════════════════════════
        const response = await fetch('/api/distribuidores', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: distribuidorId,
            nombre: data.nombre,
            empresa: data.empresa || '',
            telefono: data.telefono || '',
            email: data.email || '',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar distribuidor en BD')
        }

        // Actualizar Zustand para UI inmediata
        actualizarDistribuidor(distribuidorId, {
          nombre: data.nombre,
          empresa: data.empresa || undefined,
          telefono: data.telefono || undefined,
          email: data.email || undefined,
        })

        toast.success('Distribuidor actualizado correctamente')
        logger.info('Distribuidor actualizado', {
          context: 'EditarDistribuidorModal',
          data: { id: distribuidorId },
        })
        onSuccess?.()
        onClose()
        reset()
      } catch (error) {
        toast.error('Error al actualizar distribuidor')
        logger.error('Error al actualizar distribuidor', error as Error, {
          context: 'EditarDistribuidorModal',
        })
      }
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADOS DE CARGA Y ERROR
  // ═══════════════════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Distribuidor" size="md">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <span className="ml-3 text-white/60">Cargando distribuidor...</span>
        </div>
      </Modal>
    )
  }

  if (!distribuidor) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Distribuidor" size="md">
        <div className="flex h-64 flex-col items-center justify-center text-white/60">
          <Building2 className="mb-4 h-12 w-12 text-rose-400/50" />
          <p>Distribuidor no encontrado</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Distribuidor" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        <QuantumGlassCard variant="elevated">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Información del Distribuidor</h3>
          </div>

          <div className="space-y-4">
            <QuantumInput
              label="Nombre"
              placeholder="Nombre del distribuidor"
              error={errors.nombre?.message}
              icon={<User className="h-4 w-4" />}
              {...register('nombre')}
            />

            <QuantumInput
              label="Empresa"
              placeholder="Nombre de la empresa"
              error={errors.empresa?.message}
              icon={<Building2 className="h-4 w-4" />}
              {...register('empresa')}
            />

            <QuantumInput
              label="Teléfono"
              placeholder="555-1234"
              error={errors.telefono?.message}
              icon={<Phone className="h-4 w-4" />}
              {...register('telefono')}
            />

            <QuantumInput
              label="Email"
              type="email"
              placeholder="distribuidor@example.com"
              error={errors.email?.message}
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
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
