'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰 FORM ABONO — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario premium de abonos a ventas con:
 * ✅ Recálculo proporcional automático GYA
 * ✅ Preview de distribución a bancos
 * ✅ Selección de banco destino
 * ✅ Haptic feedback + Toast notifications
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
  Calculator,
  Check,
  ChevronDown,
  DollarSign,
  Loader2,
  PiggyBank,
  Sparkles,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA ZOD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const abonoSchema = z.object({
  monto: z.number({ required_error: 'Monto requerido' })
    .min(0.01, 'Monto mínimo $0.01'),
  bancoDestinoId: z.string().optional(),
  referencia: z.string().max(100).optional(),
  observaciones: z.string().max(500).optional(),
})

type AbonoFormData = z.infer<typeof abonoSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormAbonoProps {
  ventaId: string
  clienteId: string
  clienteNombre: string
  deudaPendiente: number
  precioTotalVenta: number
  // Montos GYA de la venta para calcular proporción
  montoBovedaMonte: number
  montoFletes: number
  montoUtilidades: number
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREVIEW DISTRIBUCIÓN GYA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GYADistribucionProps {
  monto: number
  precioTotalVenta: number
  montoBovedaMonte: number
  montoFletes: number
  montoUtilidades: number
}

function GYADistribucion({ monto, precioTotalVenta, montoBovedaMonte, montoFletes, montoUtilidades }: GYADistribucionProps) {
  // Calcular proporción del abono respecto al total
  const proporcion = monto / precioTotalVenta
  
  // Distribución proporcional
  const aBovedaMonte = montoBovedaMonte * proporcion
  const aFletes = montoFletes * proporcion
  const aUtilidades = montoUtilidades * proporcion

  const items = [
    { label: 'A Bóveda Monte', value: aBovedaMonte, color: 'text-amber-400', icon: <PiggyBank className="h-4 w-4" /> },
    { label: 'A Fletes', value: aFletes, color: 'text-cyan-400', icon: <Truck className="h-4 w-4" /> },
    { label: 'A Utilidades', value: aUtilidades, color: 'text-emerald-400', icon: <Sparkles className="h-4 w-4" /> },
  ]

  return (
    <motion.div
      className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
        <Calculator className="h-4 w-4" />
        Distribución Proporcional ({(proporcion * 100).toFixed(1)}% del total)
      </h4>
      
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-white/5', item.color)}>
                {item.icon}
              </div>
              <span className="text-sm text-white/70">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3 text-white/30" />
              <span className={cn('font-semibold tabular-nums', item.color)}>
                ${item.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">Total a distribuir</span>
          <span className="text-lg font-bold text-emerald-400">
            ${monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
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
  hint?: string
}

function PremiumInput({ label, error, icon, suffix, hint, className, ...props }: PremiumInputProps) {
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
            'transition-all duration-200',
            'placeholder:text-white/30',
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
      {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
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
          'transition-all duration-200',
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
              className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-gray-900/95 py-1 shadow-xl backdrop-blur-xl"
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function FormAbono({
  ventaId,
  clienteId,
  clienteNombre,
  deudaPendiente,
  precioTotalVenta,
  montoBovedaMonte,
  montoFletes,
  montoUtilidades,
  onSuccess,
  onCancel,
  className,
}: FormAbonoProps) {
  const queryClient = useQueryClient()
  
  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<AbonoFormData>({
    resolver: zodResolver(abonoSchema),
    defaultValues: {
      monto: deudaPendiente, // Pre-fill con deuda pendiente
    },
    mode: 'onChange',
  })

  const watchedMonto = watch('monto')

  // Fetch bancos para select
  const { data: bancos } = useQuery({
    queryKey: ['bancos-select'],
    queryFn: async () => {
      const { getBancos } = await import('@/app/_actions/bancos')
      const result = await getBancos()
      return result.success ? (result.data as Banco[]) : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const bancosOptions = useMemo(() => {
    return (bancos || []).map((b) => ({
      value: b.id,
      label: `${b.nombre} ($${b.capitalActual.toLocaleString()})`,
      color: b.color,
    }))
  }, [bancos])

  // Mutation para registrar abono
  const abonoMutation = useMutation({
    mutationFn: async (data: AbonoFormData) => {
      const { abonarVenta } = await import('@/app/_actions/ventas')
      const result = await abonarVenta({
        ventaId,
        monto: data.monto,
        bancoDestinoId: data.bancoDestinoId,
        referencia: data.referencia,
      })
      if (!result.success) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      // Invalidate connected queries
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(200)
      
      // Toast success
      toast.success('Abono registrado', {
        description: 'Deuda actualizada y capital distribuido',
      })
      
      reset()
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Error al registrar abono', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: AbonoFormData) => {
    abonoMutation.mutate(data)
  }

  // Quick fill buttons
  const quickFillOptions = [
    { label: '25%', value: deudaPendiente * 0.25 },
    { label: '50%', value: deudaPendiente * 0.5 },
    { label: '75%', value: deudaPendiente * 0.75 },
    { label: '100%', value: deudaPendiente },
  ]

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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
          <Wallet className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Registrar Abono</h2>
          <p className="text-sm text-white/50">
            Cliente: <span className="text-violet-400">{clienteNombre}</span>
          </p>
        </div>
      </div>

      {/* Deuda info */}
      <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-amber-400/70">Deuda pendiente</span>
          <span className="text-2xl font-bold tabular-nums text-amber-400">
            ${deudaPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Monto */}
        <div className="space-y-3">
          <PremiumInput
            label="Monto del abono"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.monto?.message}
            icon={<DollarSign className="h-4 w-4" />}
            suffix="MXN"
            {...register('monto', { valueAsNumber: true })}
          />
          
          {/* Quick fill buttons */}
          <div className="flex gap-2">
            {quickFillOptions.map((opt) => (
              <motion.button
                key={opt.label}
                type="button"
                onClick={() => setValue('monto', opt.value, { shouldValidate: true })}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Banco destino */}
        <Controller
          name="bancoDestinoId"
          control={control}
          render={({ field }) => (
            <PremiumSelect
              label="Banco destino (opcional)"
              value={field.value || ''}
              onChange={field.onChange}
              options={bancosOptions}
              placeholder="Seleccionar banco..."
            />
          )}
        />

        {/* Referencia */}
        <PremiumInput
          label="Referencia (opcional)"
          placeholder="Ej: Transferencia #12345"
          icon={<Sparkles className="h-4 w-4" />}
          {...register('referencia')}
        />

        {/* Preview distribución GYA */}
        {watchedMonto > 0 && watchedMonto <= deudaPendiente && (
          <GYADistribucion
            monto={watchedMonto}
            precioTotalVenta={precioTotalVenta}
            montoBovedaMonte={montoBovedaMonte}
            montoFletes={montoFletes}
            montoUtilidades={montoUtilidades}
          />
        )}

        {/* Warning si monto > deuda */}
        {watchedMonto > deudaPendiente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-3"
          >
            <p className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              El monto no puede ser mayor a la deuda pendiente
            </p>
          </motion.div>
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
            disabled={abonoMutation.isPending || !isValid || watchedMonto > deudaPendiente}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all',
              isValid && watchedMonto <= deudaPendiente
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                : 'cursor-not-allowed bg-white/10 text-white/30',
            )}
            whileHover={isValid ? { scale: 1.01 } : {}}
            whileTap={isValid ? { scale: 0.99 } : {}}
          >
            {abonoMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5" />
                Registrar Abono
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default FormAbono
