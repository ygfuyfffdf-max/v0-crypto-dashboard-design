'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 ORDEN COMPRA FORM PREMIUM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario completo de orden de compra con:
 * - Selección de distribuidor
 * - Cálculos automáticos en tiempo real
 * - Control de pagos y pendientes
 * - Diseño glassmorphism premium
 *
 * @version 3.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { formatCurrency } from '@/app/_lib/utils/formatters'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Building,
    CheckCircle,
    CreditCard,
    DollarSign,
    Info,
    Package,
    Save,
    Truck,
    X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
    BANCO_IDS,
    CalculationPanel,
    FormActions,
    FormCurrencyInput,
    FormGrid,
    FormInput,
    FormModal,
    FormSection,
    FormSelect,
    FormTextarea,
    OrdenCompraFormSchema,
    SubmitButton,
    type OrdenCompraFormData,
    type SelectOption,
} from './CompleteForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const BANCOS_INFO: Record<string, { nombre: string; color: string }> = {
  boveda_monte: { nombre: 'Bóveda Monte', color: '#8B5CF6' },
  boveda_usa: { nombre: 'Bóveda USA', color: '#3B82F6' },
  utilidades: { nombre: 'Utilidades', color: '#10B981' },
  flete_sur: { nombre: 'Flete Sur', color: '#F59E0B' },
  azteca: { nombre: 'Azteca', color: '#EF4444' },
  leftie: { nombre: 'Leftie', color: '#EC4899' },
  profit: { nombre: 'Profit', color: '#06B6D4' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrdenCompraFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: OrdenCompraFormData & { calculos: OrdenCalculations }) => Promise<void>
  distribuidores: Array<{ id: string; nombre: string; empresa?: string }>
  bancosCapital?: Record<string, number>
  initialData?: Partial<OrdenCompraFormData>
  mode?: 'create' | 'edit'
}

interface OrdenCalculations {
  costoTotal: number
  fleteTotal: number
  montoTotal: number
  montoPendiente: number
  estadoPago: 'completo' | 'parcial' | 'pendiente'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function calcularOrden(data: Partial<OrdenCompraFormData>): OrdenCalculations {
  const cantidad = data.cantidad || 0
  const precioUnitario = data.precioUnitario || 0
  const precioFlete = data.precioFlete || 0
  const montoPagado = data.montoPagado || 0

  const costoTotal = cantidad * precioUnitario
  const fleteTotal = cantidad * precioFlete
  const montoTotal = costoTotal + fleteTotal
  const montoPendiente = montoTotal - montoPagado

  let estadoPago: 'completo' | 'parcial' | 'pendiente' = 'pendiente'
  if (montoPagado >= montoTotal) estadoPago = 'completo'
  else if (montoPagado > 0) estadoPago = 'parcial'

  return {
    costoTotal,
    fleteTotal,
    montoTotal,
    montoPendiente,
    estadoPago,
  }
}

function getBancoOptions(): SelectOption[] {
  return BANCO_IDS.map((id) => ({
    value: id,
    label: BANCOS_INFO[id]?.nombre || id,
    icon: (
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: BANCOS_INFO[id]?.color || '#888' }}
      />
    ),
  }))
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ORDEN COMPRA FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function OrdenCompraFormPremium({
  isOpen,
  onClose,
  onSubmit,
  distribuidores,
  bancosCapital = {},
  initialData,
  mode = 'create',
}: OrdenCompraFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [calculations, setCalculations] = useState<OrdenCalculations>({
    costoTotal: 0,
    fleteTotal: 0,
    montoTotal: 0,
    montoPendiente: 0,
    estadoPago: 'pendiente',
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<OrdenCompraFormData>({
    resolver: zodResolver(OrdenCompraFormSchema),
    defaultValues: {
      distribuidorId: initialData?.distribuidorId || '',
      producto: initialData?.producto || '',
      cantidad: initialData?.cantidad || 1,
      precioUnitario: initialData?.precioUnitario || 0,
      precioFlete: initialData?.precioFlete || 0,
      bancoOrigenId: initialData?.bancoOrigenId || 'boveda_monte',
      montoPagado: initialData?.montoPagado || 0,
      observaciones: initialData?.observaciones || '',
    },
    mode: 'onChange',
  })

  const watchedValues = watch()
  const watchedBancoId = watch('bancoOrigenId')

  const capitalDisponible = bancosCapital[watchedBancoId] || 0

  // Update calculations when values change
  useEffect(() => {
    const newCalcs = calcularOrden(watchedValues)
    setCalculations(newCalcs)
  }, [watchedValues])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        distribuidorId: initialData?.distribuidorId || '',
        producto: initialData?.producto || '',
        cantidad: initialData?.cantidad || 1,
        precioUnitario: initialData?.precioUnitario || 0,
        precioFlete: initialData?.precioFlete || 0,
        bancoOrigenId: initialData?.bancoOrigenId || 'boveda_monte',
        montoPagado: initialData?.montoPagado || 0,
        observaciones: initialData?.observaciones || '',
      })
      setShowSuccess(false)
    }
  }, [isOpen, initialData, reset])

  const bancoOptions = useMemo(() => getBancoOptions(), [])

  const distribuidorOptions: SelectOption[] = useMemo(
    () =>
      distribuidores.map((d) => ({
        value: d.id,
        label: d.nombre,
        description: d.empresa || undefined,
        icon: <Building className="h-4 w-4 text-emerald-400" />,
      })),
    [distribuidores],
  )

  const onFormSubmit = useCallback(
    async (data: OrdenCompraFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit({ ...data, calculos: calculations })
        setShowSuccess(true)
        setTimeout(() => onClose(), 1000)
      } catch (error) {
        console.error('Error al crear orden de compra:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, calculations, onClose],
  )

  // Calculation items for display
  const calculationItems = useMemo(
    () => [
      { label: `${watchedValues.cantidad || 0} × ${formatCurrency(watchedValues.precioUnitario || 0)}`, value: calculations.costoTotal },
      { label: 'Flete total', value: calculations.fleteTotal },
      { label: 'Total de la orden', value: calculations.montoTotal, highlight: true },
      { label: 'Monto pagado', value: watchedValues.montoPagado || 0, color: 'success' as const },
      { label: 'Pendiente', value: calculations.montoPendiente, color: calculations.montoPendiente > 0 ? 'warning' as const : 'success' as const, highlight: true },
    ],
    [calculations, watchedValues],
  )

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nueva Orden de Compra' : 'Editar Orden de Compra'}
      subtitle="Complete los datos de la orden"
      icon={<Truck className="h-5 w-5" />}
      size="lg"
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
            >
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </motion.div>
            <h3 className="text-lg font-medium text-white">
              {mode === 'create' ? 'Orden Creada' : 'Orden Actualizada'}
            </h3>
            <p className="mt-1 text-sm text-white/50">Los cambios se guardaron correctamente</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onFormSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Form */}
              <div className="space-y-6 lg:col-span-2">
                {/* Distribuidor */}
                <FormSection title="Distribuidor" icon={<Building className="h-4 w-4" />}>
                  <Controller
                    name="distribuidorId"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        label="Seleccionar Distribuidor"
                        options={distribuidorOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Buscar distribuidor..."
                        searchable
                        required
                        error={errors.distribuidorId?.message}
                      />
                    )}
                  />
                </FormSection>

                {/* Producto */}
                <FormSection title="Información del Producto" icon={<Package className="h-4 w-4" />}>
                  <FormGrid cols={2}>
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
                      name="precioUnitario"
                      control={control}
                      render={({ field }) => (
                        <FormCurrencyInput
                          label="Precio Unitario"
                          value={field.value}
                          onChange={field.onChange}
                          required
                          error={errors.precioUnitario?.message}
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

                {/* Pago */}
                <FormSection title="Información de Pago" icon={<DollarSign className="h-4 w-4" />}>
                  <FormGrid cols={2}>
                    <Controller
                      name="bancoOrigenId"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Banco para el Pago"
                          options={bancoOptions}
                          value={field.value}
                          onChange={field.onChange}
                          required
                          error={errors.bancoOrigenId?.message}
                          icon={<CreditCard className="h-4 w-4" />}
                        />
                      )}
                    />

                    <Controller
                      name="montoPagado"
                      control={control}
                      render={({ field }) => (
                        <FormCurrencyInput
                          label="Monto a Pagar Ahora"
                          value={field.value || 0}
                          onChange={field.onChange}
                          max={Math.min(calculations.montoTotal, capitalDisponible)}
                          error={errors.montoPagado?.message}
                          showCalculation
                          calculationLabel="Capital disponible"
                          calculationValue={capitalDisponible}
                        />
                      )}
                    />
                  </FormGrid>

                  {/* Estado Preview */}
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

                  <Controller
                    name="observaciones"
                    control={control}
                    render={({ field }) => (
                      <FormTextarea
                        {...field}
                        label="Observaciones"
                        placeholder="Notas adicionales..."
                        rows={2}
                        maxLength={500}
                        showCount
                      />
                    )}
                  />
                </FormSection>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <CalculationPanel title="Resumen de la Orden" items={calculationItems} />

                {/* Warning if capital insufficient */}
                {(watchedValues.montoPagado || 0) > capitalDisponible && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4"
                  >
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <div className="text-xs text-rose-300/80">
                      <p className="font-medium">Capital Insuficiente</p>
                      <p className="mt-1">
                        El monto a pagar excede el capital disponible en el banco seleccionado.
                      </p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4"
                >
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <div className="text-xs text-blue-300/80">
                    <p className="font-medium">Pagos Parciales</p>
                    <p className="mt-1">
                      Puede realizar pagos parciales. El monto pendiente quedará registrado para
                      abonos futuros.
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
                disabled={!isValid || (watchedValues.montoPagado || 0) > capitalDisponible}
                icon={<Save className="h-4 w-4" />}
              >
                {mode === 'create' ? 'Crear Orden' : 'Guardar Cambios'}
              </SubmitButton>
            </FormActions>
          </motion.form>
        )}
      </AnimatePresence>
    </FormModal>
  )
}

export default OrdenCompraFormPremium
