'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — NUEVO CLIENTE MODAL iOS PREMIUM
 * Modal premium para crear nuevo cliente con validación Zod y diseño iOS
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createCliente } from '@/app/_actions/clientes'
import { CreateClienteInput, CreateClienteSchema } from '@/app/_actions/types'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, CreditCard, Mail, MapPin, Phone, Plus, Sparkles, User } from 'lucide-react'
import { motion } from 'motion/react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { iOSModal, iOSButton, iOSGlassCard, iOSInput, iOSNumberInput } from '../ui/ios'

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface NuevoClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (_clienteId: string) => void
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function NuevoClienteModal({ isOpen, onClose, onSuccess }: NuevoClienteModalProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(CreateClienteSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      rfc: '',
      limiteCredito: 0,
    },
  })

  const onSubmit = handleSubmit((data: CreateClienteInput) => {
    // ═══ PRE-SUBMIT VALIDATION ROBUSTO ═══
    if (!data.nombre || data.nombre.trim().length < 2) {
      toast.error('Nombre inválido', {
        description: 'El nombre del cliente debe tener al menos 2 caracteres',
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

    logger.info('🚀 Iniciando creación de cliente', {
      context: 'NuevoClienteModal',
      data: { nombre: data.nombre },
    })

    startTransition(async () => {
      try {
        const result = await createCliente(data)

        if (result.error) {
          throw new Error(result.error)
        }

        if (!result.success || !result.data?.id) {
          throw new Error('Error desconocido al crear cliente')
        }

        logger.info('Cliente creado', {
          context: 'NuevoClienteModal',
          data: { id: result.data.id },
        })

        toast.success('Cliente creado exitosamente', {
          description: `${data.nombre} ha sido agregado al sistema`,
        })

        reset()
        onSuccess?.(result.data.id)
        onClose()
      } catch (error) {
        logger.error('Error creando cliente', error as Error, { context: 'NuevoClienteModal' })
        toast.error('Error al crear cliente', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Cliente"
      subtitle="Registra un nuevo cliente en el sistema"
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Info Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <QuantumGlassCard className="hover-lift p-4 transition-all duration-300">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-400">
              <User className="h-4 w-4 text-violet-400" />
              Información Principal
              <Sparkles className="ml-auto h-3 w-3 text-violet-500/50" />
            </h4>

            <div className="space-y-4">
              <QuantumInput
                label="Nombre completo"
                placeholder="Nombre del cliente"
                icon={<User className="h-4 w-4" />}
                error={errors.nombre?.message}
                {...register('nombre')}
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
            </div>
          </QuantumGlassCard>
        </motion.div>

        {/* Dirección y RFC */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <QuantumGlassCard className="hover-lift p-4 transition-all duration-300">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-400">
              <Building2 className="h-4 w-4 text-emerald-400" />
              Datos Fiscales
              <Sparkles className="ml-auto h-3 w-3 text-emerald-500/50" />
            </h4>

            <div className="space-y-4">
              <QuantumInput
                label="Dirección"
                placeholder="Dirección completa"
                icon={<MapPin className="h-4 w-4" />}
                error={errors.direccion?.message}
                {...register('direccion')}
              />

              <div className="grid grid-cols-2 gap-4">
                <QuantumInput
                  label="RFC"
                  placeholder="XAXX010101000"
                  icon={<Building2 className="h-4 w-4" />}
                  error={errors.rfc?.message}
                  {...register('rfc')}
                />

                <QuantumInput
                  label="Límite de Crédito"
                  type="number"
                  placeholder="0.00"
                  icon={<CreditCard className="h-4 w-4" />}
                  error={errors.limiteCredito?.message}
                  {...register('limiteCredito', { valueAsNumber: true })}
                />
              </div>
            </div>
          </QuantumGlassCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
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
              {isPending ? 'Creando...' : 'Crear Cliente'}
            </QuantumButton>
          </ModalFooter>
        </motion.div>
      </form>
    </Modal>
  )
}
