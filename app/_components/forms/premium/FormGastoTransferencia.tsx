'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💸 FORM GASTO/TRANSFERENCIA — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario premium para gastos y transferencias bancarias con:
 * ✅ Tipo dinámico (gasto/transferencia)
 * ✅ Campos condicionales según tipo
 * ✅ Selección de bancos origen/destino
 * ✅ Categorías de gasto predefinidas
 * ✅ Preview de flujo actualizado
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  ArrowLeftRight,
  Calculator,
  Check,
  ChevronDown,
  DollarSign,
  Loader2,
  Receipt,
  Send,
  Tag,
  Wallet,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA ZOD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const gastoTransferenciaSchema = z.object({
  tipo: z.enum(['gasto', 'transferencia'], {
    required_error: 'Selecciona el tipo de operación',
  }),
  monto: z.number({ required_error: 'Monto requerido' })
    .min(0.01, 'Monto mínimo $0.01'),
  concepto: z.string().min(1, 'Concepto requerido').max(200),
  categoria: z.string().optional(),
  bancoDestinoId: z.string().optional(),
  referencia: z.string().max(100).optional(),
  observaciones: z.string().max(500).optional(),
}).refine((data) => {
  // Si es transferencia, banco destino es requerido
  if (data.tipo === 'transferencia' && !data.bancoDestinoId) {
    return false
  }
  return true
}, {
  message: 'Selecciona el banco destino para la transferencia',
  path: ['bancoDestinoId'],
})

type GastoTransferenciaFormData = z.infer<typeof gastoTransferenciaSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormGastoTransferenciaProps {
  bancoOrigenId: string
  bancoOrigenNombre: string
  bancoOrigenCapital: number
  bancoOrigenColor: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

interface Banco {
  id: string
  nombre: string
  capitalActual: number
  color: string
}

// Categorías predefinidas de gastos
const CATEGORIAS_GASTO = [
  { value: 'operaciones', label: '🔧 Operaciones' },
  { value: 'nomina', label: '👥 Nómina' },
  { value: 'servicios', label: '💡 Servicios' },
  { value: 'impuestos', label: '📋 Impuestos' },
  { value: 'logistica', label: '🚚 Logística' },
  { value: 'marketing', label: '📢 Marketing' },
  { value: 'mantenimiento', label: '🔨 Mantenimiento' },
  { value: 'otros', label: '📦 Otros' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREVIEW FLUJO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FlujoPreviewProps {
  tipo: 'gasto' | 'transferencia'
  monto: number
  bancoOrigen: { nombre: string; capital: number; color: string }
  bancoDestino?: { nombre: string; capital: number; color: string }
}

function FlujoPreview({ tipo, monto, bancoOrigen, bancoDestino }: FlujoPreviewProps) {
  const nuevoCapitalOrigen = bancoOrigen.capital - monto
  const nuevoCapitalDestino = bancoDestino ? bancoDestino.capital + monto : 0

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
        <Calculator className="h-4 w-4" />
        Preview de Flujo
      </h4>

      <div className="flex items-center justify-between gap-4">
        {/* Banco origen */}
        <div className="flex-1 rounded-lg bg-white/5 p-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bancoOrigen.color }} />
            <span className="text-sm text-white/70">{bancoOrigen.nombre}</span>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-white/40">Actual</p>
            <p className="font-semibold tabular-nums text-white">
              ${bancoOrigen.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-1 space-y-1">
            <p className="text-xs text-white/40">Después</p>
            <p className={cn(
              'font-semibold tabular-nums',
              nuevoCapitalOrigen < 0 ? 'text-red-400' : 'text-amber-400',
            )}>
              ${nuevoCapitalOrigen.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          <motion.div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              tipo === 'gasto' ? 'bg-red-500/20 text-red-400' : 'bg-violet-500/20 text-violet-400',
            )}
            animate={{ x: tipo === 'transferencia' ? [0, 5, 0] : 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {tipo === 'gasto' ? (
              <Receipt className="h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </motion.div>
          <span className="mt-1 text-xs font-medium text-white/50">
            -${monto.toLocaleString()}
          </span>
        </div>

        {/* Banco destino (solo transferencia) */}
        {tipo === 'transferencia' && bancoDestino ? (
          <div className="flex-1 rounded-lg bg-white/5 p-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bancoDestino.color }} />
              <span className="text-sm text-white/70">{bancoDestino.nombre}</span>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-white/40">Actual</p>
              <p className="font-semibold tabular-nums text-white">
                ${bancoDestino.capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="mt-1 space-y-1">
              <p className="text-xs text-white/40">Después</p>
              <p className="font-semibold tabular-nums text-emerald-400">
                ${nuevoCapitalDestino.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ) : tipo === 'gasto' ? (
          <div className="flex-1 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">Gasto</span>
            </div>
            <p className="mt-2 text-xs text-red-400/70">
              El monto saldrá del sistema
            </p>
          </div>
        ) : null}
      </div>

      {/* Warning si capital negativo */}
      {nuevoCapitalOrigen < 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2"
        >
          <p className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-3 w-3" />
            Capital insuficiente en el banco origen
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INPUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  suffix?: string
}

function PremiumInput({ label, error, icon, suffix, className, ...props }: PremiumInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full rounded-xl border bg-white/5 px-4 py-2.5 text-white backdrop-blur-sm',
            'transition-all duration-200 placeholder:text-white/30',
            'focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
            icon && 'pl-10',
            suffix && 'pr-12',
            error ? 'border-red-500/50' : 'border-white/10',
            className,
          )}
          {...props}
        />
        {suffix && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            {suffix}
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1 text-xs text-red-400"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PremiumSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; color?: string }>
  error?: string
  placeholder?: string
}

function PremiumSelect({ label, value, onChange, options, error, placeholder }: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className="relative space-y-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border bg-white/5 px-4 py-2.5 text-left backdrop-blur-sm',
          error ? 'border-red-500/50' : 'border-white/10',
        )}
      >
        <div className="flex items-center gap-2">
          {selected?.color && (
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selected.color }} />
          )}
          <span className={selected ? 'text-white' : 'text-white/30'}>
            {selected?.label || placeholder || 'Seleccionar...'}
          </span>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform', isOpen && 'rotate-180')} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-gray-900/95 py-1 shadow-xl backdrop-blur-xl"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
                    option.value === value
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {option.color && (
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />
                  )}
                  {option.value === value && <Check className="h-4 w-4" />}
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function FormGastoTransferencia({
  bancoOrigenId,
  bancoOrigenNombre,
  bancoOrigenCapital,
  bancoOrigenColor,
  onSuccess,
  onCancel,
  className,
}: FormGastoTransferenciaProps) {
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<GastoTransferenciaFormData>({
    resolver: zodResolver(gastoTransferenciaSchema),
    defaultValues: {
      tipo: 'gasto',
    },
    mode: 'onChange',
  })

  const watchedValues = watch()
  const { tipo, monto, bancoDestinoId } = watchedValues

  // Fetch otros bancos para transferencias
  const { data: bancos } = useQuery({
    queryKey: ['bancos-select'],
    queryFn: async () => {
      const { getBancos } = await import('@/app/_actions/bancos')
      const result = await getBancos()
      return result.success ? (result.data as Banco[]) : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const bancosDestinoOptions = useMemo(() => {
    return (bancos || [])
      .filter(b => b.id !== bancoOrigenId)
      .map((b) => ({
        value: b.id,
        label: `${b.nombre} ($${b.capitalActual.toLocaleString()})`,
        color: b.color,
      }))
  }, [bancos, bancoOrigenId])

  const selectedBancoDestino = useMemo(() => {
    return bancos?.find(b => b.id === bancoDestinoId)
  }, [bancos, bancoDestinoId])

  // Mutation
  const mutation = useMutation({
    mutationFn: async (data: GastoTransferenciaFormData) => {
      const { createMovimiento } = await import('@/app/_actions/movimientos')
      
      if (data.tipo === 'gasto') {
        const result = await createMovimiento({
          bancoId: bancoOrigenId,
          tipo: 'gasto',
          monto: data.monto,
          concepto: data.concepto,
          referencia: data.referencia,
        })
        if (!result.success) throw new Error(result.error)
      } else {
        // Transferencia: crear salida y entrada
        const resultSalida = await createMovimiento({
          bancoId: bancoOrigenId,
          tipo: 'transferencia_salida',
          monto: data.monto,
          concepto: `Transferencia a ${selectedBancoDestino?.nombre}: ${data.concepto}`,
          referencia: data.referencia,
        })
        if (!resultSalida.success) throw new Error(resultSalida.error)

        const resultEntrada = await createMovimiento({
          bancoId: data.bancoDestinoId!,
          tipo: 'transferencia_entrada',
          monto: data.monto,
          concepto: `Transferencia desde ${bancoOrigenNombre}: ${data.concepto}`,
          referencia: data.referencia,
        })
        if (!resultEntrada.success) throw new Error(resultEntrada.error)
      }
      
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      if (navigator.vibrate) navigator.vibrate(200)
      
      toast.success(tipo === 'gasto' ? 'Gasto registrado' : 'Transferencia realizada', {
        description: 'Flujo y métricas actualizados',
      })
      
      reset()
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Error en la operación', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: GastoTransferenciaFormData) => {
    mutation.mutate(data)
  }

  const tipoOptions = [
    { value: 'gasto', label: '💸 Gasto' },
    { value: 'transferencia', label: '↔️ Transferencia' },
  ]

  const capitalInsuficiente = (monto || 0) > bancoOrigenCapital

  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-red-500/20">
          <ArrowLeftRight className="h-6 w-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Gasto / Transferencia</h2>
          <p className="text-sm text-white/50">
            Desde: <span className="text-violet-400">{bancoOrigenNombre}</span>
          </p>
        </div>
      </div>

      {/* Capital actual */}
      <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bancoOrigenColor }} />
            <span className="text-sm text-white/70">Capital disponible</span>
          </div>
          <span className="text-xl font-bold tabular-nums text-white">
            ${bancoOrigenCapital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo */}
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <PremiumSelect
              label="Tipo de operación"
              value={field.value}
              onChange={field.onChange}
              options={tipoOptions}
              error={errors.tipo?.message}
            />
          )}
        />

        {/* Monto */}
        <PremiumInput
          label="Monto"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.monto?.message}
          icon={<DollarSign className="h-4 w-4" />}
          suffix="MXN"
          {...register('monto', { valueAsNumber: true })}
        />

        {/* Concepto */}
        <PremiumInput
          label="Concepto"
          placeholder="Describe el movimiento..."
          error={errors.concepto?.message}
          icon={<Tag className="h-4 w-4" />}
          {...register('concepto')}
        />

        {/* Categoría (solo gastos) */}
        <AnimatePresence>
          {tipo === 'gasto' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Controller
                name="categoria"
                control={control}
                render={({ field }) => (
                  <PremiumSelect
                    label="Categoría"
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={CATEGORIAS_GASTO}
                    placeholder="Seleccionar categoría..."
                  />
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banco destino (solo transferencias) */}
        <AnimatePresence>
          {tipo === 'transferencia' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Controller
                name="bancoDestinoId"
                control={control}
                render={({ field }) => (
                  <PremiumSelect
                    label="Banco destino"
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={bancosDestinoOptions}
                    error={errors.bancoDestinoId?.message}
                    placeholder="Seleccionar banco destino..."
                  />
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview flujo */}
        {monto > 0 && (
          <FlujoPreview
            tipo={tipo}
            monto={monto}
            bancoOrigen={{
              nombre: bancoOrigenNombre,
              capital: bancoOrigenCapital,
              color: bancoOrigenColor,
            }}
            bancoDestino={selectedBancoDestino ? {
              nombre: selectedBancoDestino.nombre,
              capital: selectedBancoDestino.capitalActual,
              color: selectedBancoDestino.color,
            } : undefined}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <motion.button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Cancelar
            </motion.button>
          )}
          <motion.button
            type="submit"
            disabled={mutation.isPending || !isValid || capitalInsuficiente}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all',
              isValid && !capitalInsuficiente
                ? tipo === 'gasto'
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white hover:shadow-lg hover:shadow-red-500/25'
                  : 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-violet-500/25'
                : 'cursor-not-allowed bg-white/10 text-white/30',
            )}
            whileHover={isValid && !capitalInsuficiente ? { scale: 1.01 } : {}}
            whileTap={isValid && !capitalInsuficiente ? { scale: 0.99 } : {}}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : tipo === 'gasto' ? (
              <>
                <Receipt className="h-5 w-5" />
                Registrar Gasto
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Realizar Transferencia
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default FormGastoTransferencia
