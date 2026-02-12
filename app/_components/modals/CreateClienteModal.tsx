'use client'

import { UltraFormModal } from '@/app/_components/ui/ios'
import { FormInput } from '@/app/_components/ui/ios/iOSFormSystem'
import { useCreateCliente } from '@/app/hooks/useDataHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const clienteSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional()
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface CreateClienteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateClienteModal({ isOpen, onClose }: CreateClienteModalProps) {
  const { mutate: createCliente, isPending } = useCreateCliente()
  const queryClient = useQueryClient()

  const methods = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: ''
    }
  })

  const { reset, handleSubmit, formState: { isDirty } } = methods

  useEffect(() => {
    if (isOpen) {
      reset({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
      })
    }
  }, [isOpen, reset])

  const onSubmit = async (data: ClienteFormData) => {
    return new Promise<void>((resolve) => {
      createCliente({
        nombre: data.nombre,
        email: data.email || undefined,
        telefono: data.telefono || undefined,
        direccion: data.direccion || undefined
      }, {
        onSuccess: () => {
          toast.success('Cliente registrado correctamente')
          queryClient.invalidateQueries({ queryKey: ['clientes'] })
          onClose()
          resolve()
        },
        onError: (error) => {
          toast.error('Error al registrar cliente: ' + error.message)
          resolve()
        }
      })
    })
  }

  return (
    <UltraFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Cliente"
      subtitle="Registrar información de cliente"
      onSubmit={handleSubmit(onSubmit)}
      loading={isPending}
      hasUnsavedChanges={isDirty}
      submitLabel="Guardar Cliente"
      size="sm"
    >
      <FormProvider {...methods}>
        <div className="space-y-4 py-2">
          <FormInput
            name="nombre"
            label="Nombre Completo / Empresa"
            placeholder="Ej. Distribuidora del Norte"
            required
            autoFocus
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="email"
              label="Correo Electrónico"
              type="email"
              placeholder="contacto@empresa.com"
            />
            <FormInput
              name="telefono"
              label="Teléfono"
              type="tel"
              placeholder="+52 ..."
            />
          </div>

          <FormInput
            name="direccion"
            label="Dirección Fiscal / Entrega"
            placeholder="Calle, Número, Colonia..."
          />
        </div>
      </FormProvider>
    </UltraFormModal>
  )
}
