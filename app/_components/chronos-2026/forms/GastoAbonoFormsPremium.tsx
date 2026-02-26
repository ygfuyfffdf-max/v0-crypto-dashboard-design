'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💸 GASTO & ABONO FORMS PREMIUM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formularios de movimientos financieros:
 * - Gasto: Registrar salida de dinero
 * - Abono: Registrar entrada de pago (cliente/distribuidor)
 * - Transferencia: Mover entre bancos
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
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  AbonoFormSchema,
  BANCO_IDS,
  FormActions,
  FormCurrencyInput,
  FormGrid,
  FormInput,
  FormModal,
  FormSection,
  FormSelect,
  FormTextarea,
  GastoFormSchema,
  SubmitButton,
  TransferenciaFormSchema,
  type AbonoFormData,
  type GastoFormData,
  type SelectOption,
  type TransferenciaFormData,
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

const CATEGORIAS_GASTO: SelectOption[] = [
  { value: 'operativo', label: 'Operativo', description: 'Gastos del día a día' },
  { value: 'administrativo', label: 'Administrativo', description: 'Oficina, papelería, etc.' },
  { value: 'financiero', label: 'Financiero', description: 'Comisiones, intereses' },
  { value: 'otros', label: 'Otros', description: 'Gastos diversos' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

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
// GASTO FORM — Registrar gasto/egreso
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GastoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GastoFormData) => Promise<void>
  bancosCapital?: Record<string, number>
}

export function GastoFormPremium({
  isOpen,
  onClose,
  onSubmit,
  bancosCapital = {},
}: GastoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<GastoFormData>({
    resolver: zodResolver(GastoFormSchema) as any,
    defaultValues: {
      bancoId: 'boveda_monte',
      monto: 0,
      concepto: '',
      categoria: 'operativo',
      observaciones: '',
    },
    mode: 'onChange',
  })

  const watchedBancoId = watch('bancoId')
  const watchedMonto = watch('monto')

  const capitalDisponible = bancosCapital[watchedBancoId] || 0
  const nuevoCapital = capitalDisponible - (watchedMonto || 0)

  const bancoOptions = useMemo(() => getBancoOptions(), [])

  useEffect(() => {
    if (isOpen) {
      reset({
        bancoId: 'boveda_monte',
        monto: 0,
        concepto: '',
        categoria: 'operativo',
        observaciones: '',
      })
      setShowSuccess(false)
    }
  }, [isOpen, reset])

  const onFormSubmit = useCallback(
    async (data: GastoFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data)
        setShowSuccess(true)
        setTimeout(() => onClose(), 1000)
      } catch (error) {
        console.error('Error al registrar gasto:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, onClose],
  )

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Gasto"
      subtitle="Salida de dinero de un banco"
      icon={<ArrowUpRight className="h-5 w-5" />}
      size="md"
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
            <h3 className="text-lg font-medium text-white">Gasto Registrado</h3>
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
            {/* Banco y Monto */}
            <FormSection title="Origen del Gasto" icon={<Wallet className="h-4 w-4" />}>
              <FormGrid cols={2}>
                <Controller
                  name="bancoId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Banco Origen"
                      options={bancoOptions}
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.bancoId?.message}
                      icon={<CreditCard className="h-4 w-4" />}
                    />
                  )}
                />

                <Controller
                  name="monto"
                  control={control}
                  render={({ field }) => (
                    <FormCurrencyInput
                      label="Monto"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      max={capitalDisponible}
                      error={errors.monto?.message}
                    />
                  )}
                />
              </FormGrid>

              {/* Capital Preview */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 grid grid-cols-2 gap-4"
              >
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xs text-white/50">Capital Actual</p>
                  <p className="font-mono text-lg font-bold text-white">
                    {formatCurrency(capitalDisponible)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xs text-white/50">Después del Gasto</p>
                  <p
                    className={`font-mono text-lg font-bold ${nuevoCapital < 0 ? 'text-rose-400' : 'text-emerald-400'}`}
                  >
                    {formatCurrency(nuevoCapital)}
                  </p>
                </div>
              </motion.div>
            </FormSection>

            {/* Detalles */}
            <FormSection title="Detalles del Gasto" icon={<FileText className="h-4 w-4" />}>
              <Controller
                name="concepto"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    label="Concepto"
                    placeholder="Describe el motivo del gasto..."
                    required
                    error={errors.concepto?.message}
                  />
                )}
              />

              <Controller
                name="categoria"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Categoría"
                    options={CATEGORIAS_GASTO}
                    value={field.value || 'operativo'}
                    onChange={field.onChange}
                    error={errors.categoria?.message}
                  />
                )}
              />

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
                variant="warning"
                isLoading={isSubmitting}
                loadingText="Registrando..."
                disabled={!isValid || nuevoCapital < 0}
                icon={<ArrowUpRight className="h-4 w-4" />}
              >
                Registrar Gasto
              </SubmitButton>
            </FormActions>
          </motion.form>
        )}
      </AnimatePresence>
    </FormModal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ABONO FORM — Registrar pago/abono de cliente o distribuidor
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AbonoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AbonoFormData) => Promise<void>
  clientes?: Array<{ id: string; nombre: string; deuda: number }>
  distribuidores?: Array<{ id: string; nombre: string; pendiente: number }>
  tipo?: 'cliente' | 'distribuidor'
  preselectedId?: string
}

export function AbonoFormPremium({
  isOpen,
  onClose,
  onSubmit,
  clientes = [],
  distribuidores = [],
  tipo = 'cliente',
  preselectedId,
}: AbonoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [abonoTipo, setAbonoTipo] = useState<'cliente' | 'distribuidor'>(tipo)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<AbonoFormData>({
    resolver: zodResolver(AbonoFormSchema) as any,
    defaultValues: {
      clienteId: tipo === 'cliente' ? preselectedId || '' : '',
      distribuidorId: tipo === 'distribuidor' ? preselectedId || '' : '',
      monto: 0,
      bancoDestinoId: 'boveda_monte',
      concepto: '',
    },
    mode: 'onChange',
  })

  const watchedClienteId = watch('clienteId')
  const watchedDistribuidorId = watch('distribuidorId')
  const watchedMonto = watch('monto')

  const bancoOptions = useMemo(() => getBancoOptions(), [])

  const clienteOptions: SelectOption[] = useMemo(
    () =>
      clientes.map((c) => ({
        value: c.id,
        label: c.nombre,
        description: c.deuda > 0 ? `Deuda: ${formatCurrency(c.deuda)}` : 'Sin deuda',
        icon: <User className="h-4 w-4 text-violet-400" />,
      })),
    [clientes],
  )

  const distribuidorOptions: SelectOption[] = useMemo(
    () =>
      distribuidores.map((d) => ({
        value: d.id,
        label: d.nombre,
        description:
          d.pendiente > 0 ? `Pendiente: ${formatCurrency(d.pendiente)}` : 'Sin pendiente',
        icon: <Building className="h-4 w-4 text-emerald-400" />,
      })),
    [distribuidores],
  )

  // Get selected entity's debt
  const selectedDeuda = useMemo(() => {
    if (abonoTipo === 'cliente' && watchedClienteId) {
      return clientes.find((c) => c.id === watchedClienteId)?.deuda || 0
    }
    if (abonoTipo === 'distribuidor' && watchedDistribuidorId) {
      return distribuidores.find((d) => d.id === watchedDistribuidorId)?.pendiente || 0
    }
    return 0
  }, [abonoTipo, watchedClienteId, watchedDistribuidorId, clientes, distribuidores])

  useEffect(() => {
    if (isOpen) {
      setAbonoTipo(tipo)
      reset({
        clienteId: tipo === 'cliente' ? preselectedId || '' : '',
        distribuidorId: tipo === 'distribuidor' ? preselectedId || '' : '',
        monto: 0,
        bancoDestinoId: 'boveda_monte',
        concepto: '',
      })
      setShowSuccess(false)
    }
  }, [isOpen, tipo, preselectedId, reset])

  // Clear the other field when switching tipo
  useEffect(() => {
    if (abonoTipo === 'cliente') {
      setValue('distribuidorId', '')
    } else {
      setValue('clienteId', '')
    }
  }, [abonoTipo, setValue])

  const onFormSubmit = useCallback(
    async (data: AbonoFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data)
        setShowSuccess(true)
        setTimeout(() => onClose(), 1000)
      } catch (error) {
        console.error('Error al registrar abono:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, onClose],
  )

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Abono"
      subtitle="Entrada de pago de cliente o a distribuidor"
      icon={<ArrowDownLeft className="h-5 w-5" />}
      size="md"
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
            <h3 className="text-lg font-medium text-white">Abono Registrado</h3>
            <p className="mt-1 text-sm text-white/50">El pago se guardó correctamente</p>
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
            {/* Tipo de Abono Toggle */}
            <div className="flex gap-2 rounded-xl bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setAbonoTipo('cliente')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  abonoTipo === 'cliente'
                    ? 'bg-violet-500/30 text-violet-300'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <User className="mr-2 inline h-4 w-4" />
                De Cliente
              </button>
              <button
                type="button"
                onClick={() => setAbonoTipo('distribuidor')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  abonoTipo === 'distribuidor'
                    ? 'bg-emerald-500/30 text-emerald-300'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Building className="mr-2 inline h-4 w-4" />A Distribuidor
              </button>
            </div>

            {/* Origen del Abono */}
            <FormSection
              title={abonoTipo === 'cliente' ? 'Cliente' : 'Distribuidor'}
              icon={
                abonoTipo === 'cliente' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building className="h-4 w-4" />
                )
              }
            >
              {abonoTipo === 'cliente' ? (
                <Controller
                  name="clienteId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Seleccionar Cliente"
                      options={clienteOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Buscar cliente..."
                      searchable
                      required
                      error={errors.clienteId?.message}
                    />
                  )}
                />
              ) : (
                <Controller
                  name="distribuidorId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Seleccionar Distribuidor"
                      options={distribuidorOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Buscar distribuidor..."
                      searchable
                      required
                      error={errors.distribuidorId?.message}
                    />
                  )}
                />
              )}

              {/* Deuda Info */}
              {selectedDeuda > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3"
                >
                  <p className="text-xs text-amber-300">
                    {abonoTipo === 'cliente' ? 'Deuda actual:' : 'Pendiente:'}
                    <span className="ml-2 font-mono font-bold">
                      {formatCurrency(selectedDeuda)}
                    </span>
                  </p>
                </motion.div>
              )}
            </FormSection>

            {/* Monto y Destino */}
            <FormSection title="Datos del Abono" icon={<DollarSign className="h-4 w-4" />}>
              <FormGrid cols={2}>
                <Controller
                  name="monto"
                  control={control}
                  render={({ field }) => (
                    <FormCurrencyInput
                      label="Monto del Abono"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.monto?.message}
                    />
                  )}
                />

                <Controller
                  name="bancoDestinoId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label={abonoTipo === 'cliente' ? 'Banco Destino' : 'Banco Origen'}
                      options={bancoOptions}
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.bancoDestinoId?.message}
                      icon={<CreditCard className="h-4 w-4" />}
                    />
                  )}
                />
              </FormGrid>

              <Controller
                name="concepto"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    label="Concepto (Opcional)"
                    placeholder="Descripción del pago..."
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
                disabled={!isValid}
                icon={<ArrowDownLeft className="h-4 w-4" />}
              >
                Registrar Abono
              </SubmitButton>
            </FormActions>
          </motion.form>
        )}
      </AnimatePresence>
    </FormModal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFERENCIA FORM — Mover dinero entre bancos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TransferenciaFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TransferenciaFormData) => Promise<void>
  bancosCapital?: Record<string, number>
}

export function TransferenciaFormPremium({
  isOpen,
  onClose,
  onSubmit,
  bancosCapital = {},
}: TransferenciaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TransferenciaFormData>({
    resolver: zodResolver(TransferenciaFormSchema) as any,
    defaultValues: {
      bancoOrigenId: 'boveda_monte',
      bancoDestinoId: 'utilidades',
      monto: 0,
      concepto: '',
    },
    mode: 'onChange',
  })

  const watchedOrigenId = watch('bancoOrigenId')
  const watchedDestinoId = watch('bancoDestinoId')
  const watchedMonto = watch('monto')

  const capitalOrigen = bancosCapital[watchedOrigenId] || 0
  const capitalDestino = bancosCapital[watchedDestinoId] || 0
  const nuevoCapitalOrigen = capitalOrigen - (watchedMonto || 0)
  const nuevoCapitalDestino = capitalDestino + (watchedMonto || 0)

  const bancoOptions = useMemo(() => getBancoOptions(), [])

  useEffect(() => {
    if (isOpen) {
      reset({
        bancoOrigenId: 'boveda_monte',
        bancoDestinoId: 'utilidades',
        monto: 0,
        concepto: '',
      })
      setShowSuccess(false)
    }
  }, [isOpen, reset])

  const onFormSubmit = useCallback(
    async (data: TransferenciaFormData) => {
      setIsSubmitting(true)
      try {
        await onSubmit(data)
        setShowSuccess(true)
        setTimeout(() => onClose(), 1000)
      } catch (error) {
        console.error('Error al realizar transferencia:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit, onClose],
  )

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferencia entre Bancos"
      subtitle="Mover capital de un banco a otro"
      icon={<ArrowRightLeft className="h-5 w-5" />}
      size="md"
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
            <h3 className="text-lg font-medium text-white">Transferencia Realizada</h3>
            <p className="mt-1 text-sm text-white/50">El movimiento se completó correctamente</p>
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
            {/* Bancos */}
            <FormSection title="Bancos" icon={<CreditCard className="h-4 w-4" />}>
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <Controller
                  name="bancoOrigenId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Banco Origen"
                      options={bancoOptions.filter((b) => b.value !== watchedDestinoId)}
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.bancoOrigenId?.message}
                    />
                  )}
                />

                <motion.div
                  className="mt-6 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <ArrowRightLeft className="h-4 w-4 text-violet-400" />
                </motion.div>

                <Controller
                  name="bancoDestinoId"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Banco Destino"
                      options={bancoOptions.filter((b) => b.value !== watchedOrigenId)}
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.bancoDestinoId?.message}
                    />
                  )}
                />
              </div>

              {/* Capital Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/50">Capital Origen</p>
                  <p className="font-mono text-sm text-white">{formatCurrency(capitalOrigen)}</p>
                  <p className="mt-1 text-xs text-white/30">Después:</p>
                  <p
                    className={`font-mono text-sm font-bold ${nuevoCapitalOrigen < 0 ? 'text-rose-400' : 'text-amber-400'}`}
                  >
                    {formatCurrency(nuevoCapitalOrigen)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/50">Capital Destino</p>
                  <p className="font-mono text-sm text-white">{formatCurrency(capitalDestino)}</p>
                  <p className="mt-1 text-xs text-white/30">Después:</p>
                  <p className="font-mono text-sm font-bold text-emerald-400">
                    {formatCurrency(nuevoCapitalDestino)}
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Detalles */}
            <FormSection title="Detalles" icon={<FileText className="h-4 w-4" />}>
              <Controller
                name="monto"
                control={control}
                render={({ field }) => (
                  <FormCurrencyInput
                    label="Monto a Transferir"
                    value={field.value}
                    onChange={field.onChange}
                    required
                    max={capitalOrigen}
                    error={errors.monto?.message}
                  />
                )}
              />

              <Controller
                name="concepto"
                control={control}
                render={({ field }) => (
                  <FormInput
                    {...field}
                    label="Concepto"
                    placeholder="Motivo de la transferencia..."
                    required
                    error={errors.concepto?.message}
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
                variant="primary"
                isLoading={isSubmitting}
                loadingText="Transfiriendo..."
                disabled={!isValid || nuevoCapitalOrigen < 0}
                icon={<ArrowRightLeft className="h-4 w-4" />}
              >
                Realizar Transferencia
              </SubmitButton>
            </FormActions>
          </motion.form>
        )}
      </AnimatePresence>
    </FormModal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type { AbonoFormProps, GastoFormProps, TransferenciaFormProps }
