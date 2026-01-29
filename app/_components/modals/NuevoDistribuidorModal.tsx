'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — NUEVO DISTRIBUIDOR MODAL
 * Modal premium para crear nuevo distribuidor con validación Zod
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createDistribuidor } from '@/app/_actions/distribuidores'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Mail, Package, Phone, Plus, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Modal, ModalFooter } from '../ui/Modal'
import { QuantumButton, QuantumGlassCard, QuantumInput } from '../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const NuevoDistribuidorSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido (mín. 2 caracteres)').max(100),
  empresa: z.string().max(100).optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  tipoProductos: z.string().max(200).optional(),
})

type NuevoDistribuidorFormData = z.infer<typeof NuevoDistribuidorSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface NuevoDistribuidorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (distribuidorId: string) => void
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function NuevoDistribuidorModal({
  isOpen,
  onClose,
  onSuccess,
}: NuevoDistribuidorModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NuevoDistribuidorFormData>({
    resolver: zodResolver(NuevoDistribuidorSchema),
    defaultValues: {
      nombre: '',
      empresa: '',
      telefono: '',
      email: '',
      tipoProductos: '',
    },
  })

  const onSubmit = handleSubmit((data) => {
    // ═══ PRE-SUBMIT VALIDATION ROBUSTO ═══
    if (!data.nombre || data.nombre.trim().length < 2) {
      toast.error('Nombre inválido', {
        description: 'El nombre del distribuidor debe tener al menos 2 caracteres',
      })
      return
    }

    logger.info('🚀 Iniciando creación de distribuidor', {
      context: 'NuevoDistribuidorModal',
      data: { nombre: data.nombre, empresa: data.empresa },
    })

    startTransition(async () => {
      try {
        const result = await createDistribuidor({
          nombre: data.nombre,
          empresa: data.empresa || '',
          telefono: data.telefono || '',
          email: data.email || '',
          tipoProductos: data.tipoProductos || '',
        })

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Error al crear distribuidor')
        }

        logger.info('Distribuidor creado', {
          context: 'NuevoDistribuidorModal',
          data: { id: result.data.id },
        })

        toast.success('Distribuidor creado exitosamente', {
          description: `${data.nombre} ha sido agregado al sistema`,
        })

        reset()
        onSuccess?.(result.data.id)
        onClose()
        router.refresh() // Actualizar UI
      } catch (error) {
        logger.error('Error creando distribuidor', error as Error, {
          context: 'NuevoDistribuidorModal',
        })
        toast.error('Error al crear distribuidor', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Distribuidor"
      subtitle="Registra un nuevo distribuidor/proveedor"
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Info Principal */}
        <QuantumGlassCard className="p-4">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-400">
            <Truck className="h-4 w-4 text-violet-400" />
            Información del Distribuidor
          </h4>

          <div className="space-y-4">
            <QuantumInput
              label="Nombre/Contacto"
              placeholder="Nombre del distribuidor"
              icon={<Truck className="h-4 w-4" />}
              error={errors.nombre?.message}
              {...register('nombre')}
            />

            <QuantumInput
              label="Empresa"
              placeholder="Nombre de la empresa"
              icon={<Building2 className="h-4 w-4" />}
              error={errors.empresa?.message}
              {...register('empresa')}
            />

            <div className="grid grid-cols-2 gap-4">
              <QuantumInput
                label="Teléfono"
                placeholder="(000) 000-0000"
                icon={<Phone className="h-4 w-4" />}
                error={errors.telefono?.message}
                {...register('telefono')}
              />

              <QuantumInput
                label="Email"
                type="email"
                placeholder="email@ejemplo.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <QuantumInput
              label="Tipo de Productos"
              placeholder="Ej: Materiales, Equipos, etc."
              icon={<Package className="h-4 w-4" />}
              error={errors.tipoProductos?.message}
              {...register('tipoProductos')}
            />
          </div>
        </QuantumGlassCard>

        {/* Footer */}
        <ModalFooter>
          <QuantumButton type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </QuantumButton>
          <QuantumButton
            type="submit"
            variant="primary"
            loading={isPending}
            icon={<Plus className="h-4 w-4" />}
          >
            {isPending ? 'Creando...' : 'Crear Distribuidor'}
          </QuantumButton>
        </ModalFooter>
      </form>
    </Modal>
  )
}
