'use client'

import { UltraFormModal } from '@/app/_components/ui/ios'
import { FormInput, FormSelect, FormCurrencyInput, FormDatePicker } from '@/app/_components/ui/ios/iOSFormSystem'
import { useCreateVenta, useClientesData } from '@/app/hooks/useDataHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const ventaSchema = z.object({
  clienteId: z.string().min(1, 'Seleccione un cliente'),
  fecha: z.string().optional(), // Opcional, por defecto hoy en backend o se envía
  cantidad: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Debe ser mayor a 0'),
  precioVentaUnidad: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Precio inválido'),
  precioCompraUnidad: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Costo inválido'),
  precioFlete: z.string().optional(),
  observaciones: z.string().optional()
})

type VentaFormData = z.infer<typeof ventaSchema>

interface CreateVentaModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateVentaModal({ isOpen, onClose }: CreateVentaModalProps) {
  const { mutate: createVenta, isPending } = useCreateVenta()
  const { data: clientes } = useClientesData()
  const queryClient = useQueryClient()

  const methods = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      cantidad: '1',
      precioFlete: '0',
      fecha: new Date().toISOString().split('T')[0]
    }
  })

  const { reset, handleSubmit, watch, formState: { isDirty } } = methods

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        cantidad: '1',
        precioFlete: '0',
        fecha: new Date().toISOString().split('T')[0],
        clienteId: '',
        precioVentaUnidad: '',
        precioCompraUnidad: '',
        observaciones: ''
      })
    }
  }, [isOpen, reset])

  const clienteOptions = useMemo(() => {
    return clientes?.map(c => ({ value: c.id, label: c.nombre })) || []
  }, [clientes])

  const onSubmit = async (data: VentaFormData) => {
    return new Promise<void>((resolve) => {
      createVenta({
        clienteId: data.clienteId,
        cantidad: Number(data.cantidad),
        precioVentaUnidad: Number(data.precioVentaUnidad),
        precioCompraUnidad: Number(data.precioCompraUnidad),
        precioFlete: data.precioFlete ? Number(data.precioFlete) : 0,
        observaciones: data.observaciones
      }, {
        onSuccess: () => {
          toast.success('Venta registrada correctamente')
          queryClient.invalidateQueries({ queryKey: ['ventas'] })
          onClose()
          resolve()
        },
        onError: (error) => {
          toast.error('Error al registrar venta: ' + error.message)
          resolve()
        }
      })
    })
  }

  // Cálculos en tiempo real
  const cantidad = Number(watch('cantidad') || 0)
  const precioVenta = Number(watch('precioVentaUnidad') || 0)
  const total = cantidad * precioVenta

  return (
    <UltraFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Venta"
      subtitle="Registrar operación comercial"
      onSubmit={handleSubmit(onSubmit)}
      loading={isPending}
      hasUnsavedChanges={isDirty}
      submitLabel="Registrar Venta"
    >
      <FormProvider {...methods}>
        <div className="space-y-6 py-2">
          {/* Cliente y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              name="clienteId"
              label="Cliente"
              placeholder="Seleccionar cliente..."
              options={clienteOptions}
              required
            />
            <FormDatePicker
              name="fecha"
              label="Fecha de Venta"
            />
          </div>

          {/* Detalles Económicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              name="cantidad"
              label="Cantidad (Ton/Unidad)"
              type="number"
              required
            />
            <FormCurrencyInput
              name="precioVentaUnidad"
              label="Precio Venta (Unitario)"
              placeholder="0.00"
              required
            />
            <FormCurrencyInput
              name="precioCompraUnidad"
              label="Costo Compra (Unitario)"
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormCurrencyInput
              name="precioFlete"
              label="Costo Flete (Opcional)"
              placeholder="0.00"
            />
             {/* Total Estimado (Read Only Visual) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white/60">Total Estimado</label>
              <div className="w-full rounded-xl bg-white/[0.02] border border-white/[0.08] px-4 py-2.5 text-emerald-400 font-mono text-right">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <FormInput
            name="observaciones"
            label="Observaciones"
            placeholder="Notas adicionales..."
          />
        </div>
      </FormProvider>
    </UltraFormModal>
  )
}
