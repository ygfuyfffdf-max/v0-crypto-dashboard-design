'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛒 VENTA FORM PREMIUM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario completo de venta con:
 * - Selección de cliente con búsqueda
 * - Cálculos automáticos en tiempo real
 * - Distribución automática de bancos
 * - Validación avanzada con Zod
 * - Diseño glassmorphism premium
 *
 * @version 3.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { formatCurrency } from '@/app/_lib/utils/formatters'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    DollarSign,
    Info,
    Package,
    Save,
    ShoppingCart,
    User,
    X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
    CalculationPanel,
    FormActions,
    FormCurrencyInput,
    FormGrid,
    FormInput,
    FormModal,
    FormSection,
    FormSelect,
    FormTextarea,
    SubmitButton,
    VentaFormSchema,
    type SelectOption,
    type VentaFormData,
} from './CompleteForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VentaFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: VentaFormData & { calculos: VentaCalculations }) => Promise<void>
  clientes: Array<{ id: string; nombre: string; deuda?: number }>
  ordenesCompra?: Array<{ id: string; producto: string; precioUnitario: number; cantidad: number }>
  initialData?: Partial<VentaFormData>
  mode?: 'create' | 'edit'
}

interface VentaCalculations {
  precioTotalVenta: number
  costoTotal: number
  fleteTotal: number
  utilidadBruta: number
  montoRestante: number
  estadoPago: 'completo' | 'parcial' | 'pendiente'
  distribucion: {
    bovedaMonte: number
    fletes: number
    utilidades: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function calcularVenta(data: Partial<VentaFormData>): VentaCalculations {
  const cantidad = data.cantidad || 0
  const precioVentaUnidad = data.precioVentaUnidad || 0
  const precioCompraUnidad = data.precioCompraUnidad || 0
  const precioFlete = data.precioFlete || 0
  const montoPagado = data.montoPagado || 0

  const precioTotalVenta = cantidad * precioVentaUnidad
  const costoTotal = cantidad * precioCompraUnidad
  const fleteTotal = cantidad * precioFlete
  const utilidadBruta = precioTotalVenta - costoTotal - fleteTotal
  const montoRestante = precioTotalVenta - montoPagado

  // Estado de pago
  let estadoPago: 'completo' | 'parcial' | 'pendiente' = 'pendiente'
  if (montoPagado >= precioTotalVenta) estadoPago = 'completo'
  else if (montoPagado > 0) estadoPago = 'parcial'

  // Distribución proporcional según el estado de pago
  const proporcion = precioTotalVenta > 0 ? montoPagado / precioTotalVenta : 0

  const distribucion = {
    bovedaMonte: costoTotal * proporcion,
    fletes: fleteTotal * proporcion,
    utilidades: utilidadBruta * proporcion,
  }

  return {
    precioTotalVenta,
    costoTotal,
    fleteTotal,
    utilidadBruta,
    montoRestante,
    estadoPago,
    distribucion,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VENTA FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function VentaFormPremium({
  isOpen,
  onClose,
  onSubmit,
  clientes,
  ordenesCompra = [],
  initialData,
  mode = 'create',
}: VentaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculations, setCalculations] = useState<VentaCalculations>({
    precioTotalVenta: 0,
    costoTotal: 0,
    fleteTotal: 0,
    utilidadBruta: 0,
    montoRestante: 0,
    estadoPago: 'pendiente',
    distribucion: { bovedaMonte: 0, fletes: 0, utilidades: 0 },
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<VentaFormData>({
    resolver: zodResolver(VentaFormSchema),
    defaultValues: {
      clienteId: initialData?.clienteId || '',
      producto: initialData?.producto || '',
      cantidad: initialData?.cantidad || 1,
      precioVentaUnidad: initialData?.precioVentaUnidad || 0,
      precioCompraUnidad: initialData?.precioCompraUnidad || 0,
      precioFlete: initialData?.precioFlete || 0,
      montoPagado: initialData?.montoPagado || 0,
      ordenCompraId: initialData?.ordenCompraId || '',
      observaciones: initialData?.observaciones || '',
    },
    mode: 'onChange',
  })

  // Watch values for calculations
  const watchedValues = watch()

  // Update calculations when values change
  useEffect(() => {
    const newCalcs = calcularVenta(watchedValues)
    setCalculations(newCalcs)
  }, [watchedValues])

  // Auto-fill from selected OC
  const selectedOC = useMemo(() => {
    return ordenesCompra.find((oc) => oc.id === watchedValues.ordenCompraId)
  }, [ordenesCompra, watchedValues.ordenCompraId])

  useEffect(() => {
    if (selectedOC) {
      setValue('producto', selectedOC.producto)
      setValue('precioCompraUnidad', selectedOC.precioUnitario)
    }
  }, [selectedOC, setValue])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        clienteId: initialData?.clienteId || '',
        producto: initialData?.producto || '',
        cantidad: initialData?.cantidad || 1,
        precioVentaUnidad: initialData?.precioVentaUnidad || 0,
        precioCompraUnidad: initialData?.precioCompraUnidad || 0,
        precioFlete: initialData?.precioFlete || 0,
        montoPagado: initialData?.montoPagado || 0,
        ordenCompraId: initialData?.ordenCompraId || '',
        observaciones: initialData?.observaciones || '',
      })
    }
  }, [isOpen, initialData, reset])

  // Client options
  const clienteOptions: SelectOption[] = useMemo(
    () =>
      clientes.map((c) => ({
        value: c.id,
        label: c.nombre,
        icon: <User className="h-4 w-4 text-violet-400" />,
        description: c.deuda && c.deuda > 0 ? `Deuda: ${formatCurrency(c.deuda)}` : undefined,
      })),
    [clientes],
  )

  // OC options
  const ocOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'Sin orden de compra' },
      ...ordenesCompra.map((oc) => ({
        value: oc.id,
        label: oc.producto,
        icon: <Package className="h-4 w-4 text-emerald-400" />,
        description: `${oc.cantidad} unidades @ ${formatCurrency(oc.precioUnitario)}`,
      })),
    ],
    [ordenesCompra],
  )

  // Submit handler
  const onFormSubmit = useCallback(
    async (data: VentaFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit({ ...data, calculos: calculations })
        onClose()
      } catch (error) {
        console.error('Error al crear venta:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, calculations, onClose],
  )

  // Calculation items for display
  const calculationItems = useMemo(
    () => [
      { label: 'Precio unitario venta', value: watchedValues.precioVentaUnidad || 0 },
      { label: `× ${watchedValues.cantidad || 0} unidades`, value: calculations.precioTotalVenta },
      { label: 'Costo total (Compra)', value: calculations.costoTotal, color: 'warning' as const },
      { label: 'Flete total', value: calculations.fleteTotal },
      { label: 'Utilidad bruta', value: calculations.utilidadBruta, color: 'success' as const },
      { label: 'Monto pagado', value: watchedValues.montoPagado || 0 },
      { label: 'Monto restante', value: calculations.montoRestante, color: calculations.montoRestante > 0 ? 'error' as const : 'success' as const, highlight: true },
    ],
    [calculations, watchedValues],
  )

  const distribucionItems = useMemo(
    () => [
      { label: 'Bóveda Monte (Costo)', value: calculations.distribucion.bovedaMonte },
      { label: 'Flete Sur', value: calculations.distribucion.fletes },
      { label: 'Utilidades', value: calculations.distribucion.utilidades, color: 'success' as const },
    ],
    [calculations],
  )

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Registrar Nueva Venta' : 'Editar Venta'}
      subtitle="Complete los datos de la venta"
      icon={<ShoppingCart className="h-5 w-5" />}
      size="xl"
    >
      <form onSubmit={handleSubmit((data) => onFormSubmit(data))} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Cliente Section */}
            <FormSection title="Información del Cliente" icon={<User className="h-4 w-4" />}>
              <Controller
                name="clienteId"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Cliente"
                    options={clienteOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar cliente..."
                    searchable
                    required
                    error={errors.clienteId?.message}
                    icon={<User className="h-4 w-4" />}
                  />
                )}
              />
            </FormSection>

            {/* Producto Section */}
            <FormSection title="Información del Producto" icon={<Package className="h-4 w-4" />}>
              <FormGrid cols={2}>
                <Controller
                  name="ordenCompraId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Orden de Compra (Opcional)"
                      options={ocOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Seleccionar OC..."
                      searchable
                      clearable
                      icon={<Package className="h-4 w-4" />}
                    />
                  )}
                />

                <Controller
                  name="producto"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      label="Producto"
                      placeholder="Nombre del producto"
                      required
                      error={errors.producto?.message}
                      icon={<Package className="h-4 w-4" />}
                    />
                  )}
                />

                <Controller
                  name="cantidad"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      type="number"
                      label="Cantidad"
                      placeholder="1"
                      min={1}
                      required
                      error={errors.cantidad?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  )}
                />

                <Controller
                  name="precioVentaUnidad"
                  control={control}
                  render={({ field }) => (
                    <FormCurrencyInput
                      label="Precio Venta (Unitario)"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.precioVentaUnidad?.message}
                    />
                  )}
                />

                <Controller
                  name="precioCompraUnidad"
                  control={control}
                  render={({ field }) => (
                    <FormCurrencyInput
                      label="Precio Compra (Unitario)"
                      value={field.value || 0}
                      onChange={field.onChange}
                      helperText="Costo del distribuidor"
                      error={errors.precioCompraUnidad?.message}
                    />
                  )}
                />

                <Controller
                  name="precioFlete"
                  control={control}
                  render={({ field }) => (
                    <FormCurrencyInput
                      label="Flete (Unitario)"
                      value={field.value || 0}
                      onChange={field.onChange}
                      helperText="Costo de envío por unidad"
                      error={errors.precioFlete?.message}
                    />
                  )}
                />
              </FormGrid>
            </FormSection>

            {/* Pago Section */}
            <FormSection title="Información de Pago" icon={<DollarSign className="h-4 w-4" />}>
              <FormGrid cols={2}>
                <Controller
                  name="montoPagado"
                  control={control}
                  render={({ field }) => (
                    <FormCurrencyInput
                      label="Monto Pagado"
                      value={field.value || 0}
                      onChange={field.onChange}
                      max={calculations.precioTotalVenta}
                      error={errors.montoPagado?.message}
                      showCalculation
                      calculationLabel="Total a pagar"
                      calculationValue={calculations.precioTotalVenta}
                    />
                  )}
                />

                <div className="flex items-end">
                  <motion.div
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4"
                    animate={{
                      borderColor:
                        calculations.estadoPago === 'completo'
                          ? 'rgba(16, 185, 129, 0.5)'
                          : calculations.estadoPago === 'parcial'
                            ? 'rgba(245, 158, 11, 0.5)'
                            : 'rgba(239, 68, 68, 0.5)',
                      backgroundColor:
                        calculations.estadoPago === 'completo'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : calculations.estadoPago === 'parcial'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                    }}
                  >
                    <span className="text-sm font-medium capitalize">
                      Estado: {calculations.estadoPago}
                    </span>
                  </motion.div>
                </div>
              </FormGrid>

              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <FormTextarea
                    {...field}
                    label="Observaciones"
                    placeholder="Notas adicionales sobre la venta..."
                    rows={3}
                    maxLength={500}
                    showCount
                  />
                )}
              />
            </FormSection>
          </div>

          {/* Calculations Sidebar */}
          <div className="space-y-4">
            <CalculationPanel title="Resumen de Venta" items={calculationItems} />

            <CalculationPanel title="Distribución Bancaria" items={distribucionItems} />

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <div className="text-xs text-blue-300/80">
                <p className="font-medium">Distribución Automática</p>
                <p className="mt-1">
                  El dinero pagado se distribuirá automáticamente según la proporción de pago a los
                  bancos correspondientes.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Actions */}
        <FormActions align="between">
          <SubmitButton
            type="button"
            variant="danger"
            onClick={onClose}
            disabled={isSubmitting}
            icon={<X className="h-4 w-4" />}
          >
            Cancelar
          </SubmitButton>

          <SubmitButton
            type="submit"
            variant="success"
            isLoading={isSubmitting}
            loadingText="Guardando..."
            disabled={!isValid}
            icon={<Save className="h-4 w-4" />}
          >
            {mode === 'create' ? 'Registrar Venta' : 'Guardar Cambios'}
          </SubmitButton>
        </FormActions>
      </form>
    </FormModal>
  )
}

export default VentaFormPremium
