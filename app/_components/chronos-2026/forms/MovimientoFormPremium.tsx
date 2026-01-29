'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 MOVIMIENTO FORM PREMIUM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario completo de movimientos financieros con:
 * - Registro de ingresos, gastos, transferencias
 * - Selección de banco origen/destino
 * - Referencia a clientes/distribuidores/ventas/OC
 * - Validación avanzada con Zod
 * - Diseño glassmorphism premium
 *
 * @version 3.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { formatCurrency } from '@/app/_lib/utils/formatters'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Building,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Hash,
  Receipt,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  BANCO_IDS,
  FormActions,
  FormCurrencyInput,
  FormGrid,
  FormInput,
  FormModal,
  FormSection,
  FormSelect,
  FormTextarea,
  SubmitButton,
  type SelectOption,
} from './CompleteForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const BANCOS_INFO: Record<string, { nombre: string; color: string; icon: string }> = {
  boveda_monte: { nombre: 'Bóveda Monte', color: '#8B5CF6', icon: '🏔️' },
  boveda_usa: { nombre: 'Bóveda USA', color: '#3B82F6', icon: '🇺🇸' },
  utilidades: { nombre: 'Utilidades', color: '#10B981', icon: '💰' },
  flete_sur: { nombre: 'Flete Sur', color: '#F59E0B', icon: '🚚' },
  azteca: { nombre: 'Azteca', color: '#EF4444', icon: '🏦' },
  leftie: { nombre: 'Leftie', color: '#EC4899', icon: '🎯' },
  profit: { nombre: 'Profit', color: '#06B6D4', icon: '📈' },
}

const TIPOS_MOVIMIENTO = [
  {
    value: 'ingreso',
    label: 'Ingreso',
    icon: <ArrowDownLeft className="h-4 w-4 text-emerald-400" />,
    color: '#10B981',
  },
  {
    value: 'gasto',
    label: 'Gasto',
    icon: <ArrowUpRight className="h-4 w-4 text-rose-400" />,
    color: '#EF4444',
  },
  {
    value: 'transferencia_entrada',
    label: 'Transferencia (Entrada)',
    icon: <ArrowRightLeft className="h-4 w-4 text-blue-400" />,
    color: '#3B82F6',
  },
  {
    value: 'transferencia_salida',
    label: 'Transferencia (Salida)',
    icon: <ArrowRightLeft className="h-4 w-4 text-amber-400" />,
    color: '#F59E0B',
  },
  {
    value: 'abono',
    label: 'Abono de Cliente',
    icon: <ArrowDownLeft className="h-4 w-4 text-violet-400" />,
    color: '#8B5CF6',
  },
  {
    value: 'pago',
    label: 'Pago a Distribuidor',
    icon: <ArrowUpRight className="h-4 w-4 text-orange-400" />,
    color: '#F97316',
  },
] as const

const CATEGORIAS_MOVIMIENTO: SelectOption[] = [
  { value: 'Operaciones', label: 'Operaciones', description: 'Movimientos operativos diarios' },
  { value: 'Ventas', label: 'Ventas', description: 'Relacionado con ventas' },
  { value: 'Compras', label: 'Compras', description: 'Relacionado con compras/OC' },
  { value: 'Administrativo', label: 'Administrativo', description: 'Gastos administrativos' },
  { value: 'Financiero', label: 'Financiero', description: 'Comisiones, intereses, etc.' },
  { value: 'Personal', label: 'Personal', description: 'Sueldos, bonos, etc.' },
  { value: 'Otros', label: 'Otros', description: 'Otros movimientos' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MovimientoFormSchema = z
  .object({
    bancoId: z.enum(BANCO_IDS, { errorMap: () => ({ message: 'Seleccione un banco' }) }),
    tipo: z.enum(
      ['ingreso', 'gasto', 'transferencia_entrada', 'transferencia_salida', 'abono', 'pago'],
      {
        errorMap: () => ({ message: 'Seleccione un tipo de movimiento' }),
      },
    ),
    monto: z.number().positive('El monto debe ser mayor a 0'),
    concepto: z.string().min(1, 'El concepto es requerido').max(200, 'Máximo 200 caracteres'),
    categoria: z.string().optional(),
    referencia: z.string().max(100, 'Máximo 100 caracteres').optional(),
    fecha: z.string().optional(),
    // Referencias opcionales
    bancoOrigenId: z.enum([...BANCO_IDS, '']).optional(),
    bancoDestinoId: z.enum([...BANCO_IDS, '']).optional(),
    clienteId: z.string().optional(),
    distribuidorId: z.string().optional(),
    ventaId: z.string().optional(),
    ordenCompraId: z.string().optional(),
    observaciones: z.string().max(500, 'Máximo 500 caracteres').optional(),
  })
  .refine(
    (data) => {
      // Si es transferencia, debe tener banco destino u origen
      if (data.tipo === 'transferencia_entrada' && !data.bancoOrigenId) {
        return false
      }
      if (data.tipo === 'transferencia_salida' && !data.bancoDestinoId) {
        return false
      }
      return true
    },
    {
      message: 'Las transferencias requieren especificar banco origen/destino',
      path: ['bancoDestinoId'],
    },
  )

export type MovimientoFormData = z.infer<typeof MovimientoFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovimientoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MovimientoFormData) => Promise<void>
  bancosCapital?: Record<string, number>
  clientes?: Array<{ id: string; nombre: string }>
  distribuidores?: Array<{ id: string; nombre: string }>
  ventas?: Array<{ id: string; producto: string; total: number }>
  ordenesCompra?: Array<{ id: string; producto: string; total: number }>
  initialData?: Partial<MovimientoFormData>
  defaultTipo?: MovimientoFormData['tipo']
  defaultBancoId?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function getBancoOptions(): SelectOption[] {
  return BANCO_IDS.map((id) => ({
    value: id,
    label: BANCOS_INFO[id]?.nombre || id,
    icon: (
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
        style={{ backgroundColor: `${BANCOS_INFO[id]?.color}20` }}
      >
        {BANCOS_INFO[id]?.icon || '💰'}
      </div>
    ),
  }))
}

function getBancoOptionsWithEmpty(): SelectOption[] {
  return [{ value: '', label: 'Seleccionar banco...' }, ...getBancoOptions()]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOVIMIENTO FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function MovimientoFormPremium({
  isOpen,
  onClose,
  onSubmit,
  bancosCapital = {},
  clientes = [],
  distribuidores = [],
  ventas = [],
  ordenesCompra = [],
  initialData,
  defaultTipo = 'ingreso',
  defaultBancoId = 'boveda_monte',
}: MovimientoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<MovimientoFormData>({
    resolver: zodResolver(MovimientoFormSchema),
    defaultValues: {
      bancoId: initialData?.bancoId || (defaultBancoId as (typeof BANCO_IDS)[number]),
      tipo: initialData?.tipo || defaultTipo,
      monto: initialData?.monto || 0,
      concepto: initialData?.concepto || '',
      categoria: initialData?.categoria || 'Operaciones',
      referencia: initialData?.referencia || '',
      fecha: initialData?.fecha || new Date().toISOString().split('T')[0],
      bancoOrigenId: initialData?.bancoOrigenId || '',
      bancoDestinoId: initialData?.bancoDestinoId || '',
      clienteId: initialData?.clienteId || '',
      distribuidorId: initialData?.distribuidorId || '',
      ventaId: initialData?.ventaId || '',
      ordenCompraId: initialData?.ordenCompraId || '',
      observaciones: initialData?.observaciones || '',
    },
    mode: 'onChange',
  })

  const watchedTipo = watch('tipo')
  const watchedBancoId = watch('bancoId')
  const watchedMonto = watch('monto')

  const capitalActual = bancosCapital[watchedBancoId] || 0
  const esEgreso = ['gasto', 'transferencia_salida', 'pago'].includes(watchedTipo)
  const nuevoCapital = esEgreso
    ? capitalActual - (watchedMonto || 0)
    : capitalActual + (watchedMonto || 0)

  const bancoOptions = useMemo(() => getBancoOptions(), [])
  const bancoOptionsWithEmpty = useMemo(() => getBancoOptionsWithEmpty(), [])

  const tipoOptions: SelectOption[] = useMemo(
    () =>
      TIPOS_MOVIMIENTO.map((t) => ({
        value: t.value,
        label: t.label,
        icon: t.icon,
      })),
    [],
  )

  const clienteOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'Sin cliente asociado' },
      ...clientes.map((c) => ({
        value: c.id,
        label: c.nombre,
        icon: <User className="h-4 w-4 text-violet-400" />,
      })),
    ],
    [clientes],
  )

  const distribuidorOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'Sin distribuidor asociado' },
      ...distribuidores.map((d) => ({
        value: d.id,
        label: d.nombre,
        icon: <Building className="h-4 w-4 text-emerald-400" />,
      })),
    ],
    [distribuidores],
  )

  const ventaOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'Sin venta asociada' },
      ...ventas.map((v) => ({
        value: v.id,
        label: v.producto,
        description: formatCurrency(v.total),
        icon: <Receipt className="h-4 w-4 text-blue-400" />,
      })),
    ],
    [ventas],
  )

  const ocOptions: SelectOption[] = useMemo(
    () => [
      { value: '', label: 'Sin OC asociada' },
      ...ordenesCompra.map((oc) => ({
        value: oc.id,
        label: oc.producto,
        description: formatCurrency(oc.total),
        icon: <Receipt className="h-4 w-4 text-amber-400" />,
      })),
    ],
    [ordenesCompra],
  )

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        bancoId: initialData?.bancoId || (defaultBancoId as (typeof BANCO_IDS)[number]),
        tipo: initialData?.tipo || defaultTipo,
        monto: initialData?.monto || 0,
        concepto: initialData?.concepto || '',
        categoria: initialData?.categoria || 'Operaciones',
        referencia: initialData?.referencia || '',
        fecha: initialData?.fecha || new Date().toISOString().split('T')[0],
        bancoOrigenId: initialData?.bancoOrigenId || '',
        bancoDestinoId: initialData?.bancoDestinoId || '',
        clienteId: initialData?.clienteId || '',
        distribuidorId: initialData?.distribuidorId || '',
        ventaId: initialData?.ventaId || '',
        ordenCompraId: initialData?.ordenCompraId || '',
        observaciones: initialData?.observaciones || '',
      })
      setShowSuccess(false)
    }
  }, [isOpen, initialData, defaultTipo, defaultBancoId, reset])

  // Auto-set concepto prefix based on tipo
  useEffect(() => {
    const currentConcepto = watch('concepto')
    if (!currentConcepto) {
      const tipoInfo = TIPOS_MOVIMIENTO.find((t) => t.value === watchedTipo)
      if (tipoInfo) {
        setValue('concepto', `${tipoInfo.label}: `)
      }
    }
  }, [watchedTipo, watch, setValue])

  const onFormSubmit = useCallback(
    async (data: MovimientoFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data)
        setShowSuccess(true)
        setTimeout(() => onClose(), 1000)
      } catch (error) {
        console.error('Error al registrar movimiento:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, onClose],
  )

  const getTipoIcon = () => {
    const tipo = TIPOS_MOVIMIENTO.find((t) => t.value === watchedTipo)
    return tipo?.icon || <Wallet className="h-5 w-5" />
  }

  const getTipoColor = () => {
    const tipo = TIPOS_MOVIMIENTO.find((t) => t.value === watchedTipo)
    return tipo?.color || '#8B5CF6'
  }

  const showTransferFields =
    watchedTipo === 'transferencia_entrada' || watchedTipo === 'transferencia_salida'
  const showClienteField = watchedTipo === 'abono' || watchedTipo === 'ingreso'
  const showDistribuidorField = watchedTipo === 'pago'
  const showVentaField = watchedTipo === 'abono'
  const showOCField = watchedTipo === 'pago'

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Movimiento"
      subtitle="Registra un movimiento financiero en el sistema"
      icon={getTipoIcon()}
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
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${getTipoColor()}20` }}
            >
              <CheckCircle className="h-8 w-8" style={{ color: getTipoColor() }} />
            </motion.div>
            <h3 className="text-lg font-medium text-white">Movimiento Registrado</h3>
            <p className="mt-1 text-sm text-white/50">El movimiento se guardó correctamente</p>
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
            {/* Tipo y Banco */}
            <FormSection title="Información del Movimiento" icon={<Wallet className="h-4 w-4" />}>
              <FormGrid cols={2}>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Tipo de Movimiento"
                      options={tipoOptions}
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.tipo?.message}
                    />
                  )}
                />

                <Controller
                  name="bancoId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Banco Principal"
                      options={bancoOptions}
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.bancoId?.message}
                      icon={<CreditCard className="h-4 w-4" />}
                    />
                  )}
                />
              </FormGrid>

              {/* Transferencia Fields */}
              <AnimatePresence>
                {showTransferFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FormGrid cols={2}>
                      {watchedTipo === 'transferencia_entrada' && (
                        <Controller
                          name="bancoOrigenId"
                          control={control}
                          render={({ field }) => (
                            <FormSelect
                              label="Banco Origen"
                              options={bancoOptionsWithEmpty}
                              value={field.value || ''}
                              onChange={field.onChange}
                              required
                              error={errors.bancoOrigenId?.message}
                              helperText="De dónde viene el dinero"
                            />
                          )}
                        />
                      )}
                      {watchedTipo === 'transferencia_salida' && (
                        <Controller
                          name="bancoDestinoId"
                          control={control}
                          render={({ field }) => (
                            <FormSelect
                              label="Banco Destino"
                              options={bancoOptionsWithEmpty}
                              value={field.value || ''}
                              onChange={field.onChange}
                              required
                              error={errors.bancoDestinoId?.message}
                              helperText="A dónde va el dinero"
                            />
                          )}
                        />
                      )}
                    </FormGrid>
                  </motion.div>
                )}
              </AnimatePresence>
            </FormSection>

            {/* Monto y Fecha */}
            <FormSection title="Monto y Fecha" icon={<CreditCard className="h-4 w-4" />}>
              <FormGrid cols={2}>
                <Controller
                  name="monto"
                  control={control}
                  render={({ field }) => (
                    <FormCurrencyInput
                      label="Monto"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      max={esEgreso ? capitalActual : undefined}
                      error={errors.monto?.message}
                    />
                  )}
                />

                <Controller
                  name="fecha"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      type="date"
                      label="Fecha"
                      icon={<Calendar className="h-4 w-4" />}
                    />
                  )}
                />
              </FormGrid>

              {/* Capital Preview */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 grid grid-cols-3 gap-3"
              >
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xs text-white/50">Capital Actual</p>
                  <p className="font-mono text-base font-bold text-white">
                    {formatCurrency(capitalActual)}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{
                      color: esEgreso ? '#EF4444' : '#10B981',
                    }}
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    {esEgreso ? (
                      <>
                        <ArrowUpRight className="h-4 w-4" />
                        <span>- {formatCurrency(watchedMonto || 0)}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="h-4 w-4" />
                        <span>+ {formatCurrency(watchedMonto || 0)}</span>
                      </>
                    )}
                  </motion.div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xs text-white/50">Después</p>
                  <p
                    className={`font-mono text-base font-bold ${
                      nuevoCapital < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatCurrency(nuevoCapital)}
                  </p>
                </div>
              </motion.div>
            </FormSection>

            {/* Detalles */}
            <FormSection title="Detalles" icon={<FileText className="h-4 w-4" />}>
              <Controller
                name="concepto"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    label="Concepto"
                    placeholder="Describe el motivo del movimiento..."
                    required
                    error={errors.concepto?.message}
                  />
                )}
              />

              <FormGrid cols={2}>
                <Controller
                  name="categoria"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Categoría"
                      options={CATEGORIAS_MOVIMIENTO}
                      value={field.value || 'Operaciones'}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="referencia"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      label="Referencia (Opcional)"
                      placeholder="No. de factura, recibo, etc."
                      icon={<Hash className="h-4 w-4" />}
                    />
                  )}
                />
              </FormGrid>
            </FormSection>

            {/* Referencias opcionales */}
            <AnimatePresence>
              {(showClienteField || showDistribuidorField || showVentaField || showOCField) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FormSection
                    title="Referencias (Opcional)"
                    icon={<Receipt className="h-4 w-4" />}
                    collapsible
                    defaultExpanded
                  >
                    <FormGrid cols={2}>
                      {showClienteField && clientes.length > 0 && (
                        <Controller
                          name="clienteId"
                          control={control}
                          render={({ field }) => (
                            <FormSelect
                              label="Cliente"
                              options={clienteOptions}
                              value={field.value || ''}
                              onChange={field.onChange}
                              searchable
                            />
                          )}
                        />
                      )}

                      {showDistribuidorField && distribuidores.length > 0 && (
                        <Controller
                          name="distribuidorId"
                          control={control}
                          render={({ field }) => (
                            <FormSelect
                              label="Distribuidor"
                              options={distribuidorOptions}
                              value={field.value || ''}
                              onChange={field.onChange}
                              searchable
                            />
                          )}
                        />
                      )}

                      {showVentaField && ventas.length > 0 && (
                        <Controller
                          name="ventaId"
                          control={control}
                          render={({ field }) => (
                            <FormSelect
                              label="Venta Relacionada"
                              options={ventaOptions}
                              value={field.value || ''}
                              onChange={field.onChange}
                              searchable
                            />
                          )}
                        />
                      )}

                      {showOCField && ordenesCompra.length > 0 && (
                        <Controller
                          name="ordenCompraId"
                          control={control}
                          render={({ field }) => (
                            <FormSelect
                              label="Orden de Compra"
                              options={ocOptions}
                              value={field.value || ''}
                              onChange={field.onChange}
                              searchable
                            />
                          )}
                        />
                      )}
                    </FormGrid>
                  </FormSection>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Observaciones */}
            <FormSection title="Notas" icon={<FileText className="h-4 w-4" />} collapsible>
              <Controller
                name="observaciones"
                control={control}
                render={({ field }) => (
                  <FormTextarea
                    {...field}
                    label="Observaciones"
                    placeholder="Notas adicionales sobre el movimiento..."
                    rows={2}
                    maxLength={500}
                    showCount
                  />
                )}
              />
            </FormSection>

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
                loadingText="Registrando..."
                disabled={!isValid || (esEgreso && nuevoCapital < 0)}
                icon={getTipoIcon()}
              >
                Registrar Movimiento
              </SubmitButton>
            </FormActions>
          </motion.form>
        )}
      </AnimatePresence>
    </FormModal>
  )
}

export default MovimientoFormPremium
