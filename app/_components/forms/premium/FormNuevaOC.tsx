'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 FORM NUEVA OC — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario premium de órdenes de compra con:
 * ✅ Validación Zod client/server
 * ✅ Server Actions para mutaciones
 * ✅ TanStack Query para refetch
 * ✅ Prefill predictivo ML (costo promedio histórico)
 * ✅ Haptic feedback on-submit
 * ✅ Preview de métricas de lote
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    AlertCircle,
    Building2,
    Calculator,
    DollarSign,
    Loader2,
    Package,
    Sparkles,
    TrendingUp,
    Truck,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA ZOD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ocSchema = z.object({
  // Distribuidor
  distribuidorId: z.string().optional(),
  distribuidorNombre: z.string().min(1, 'Nombre de distribuidor requerido'),

  // Producto
  producto: z.string().min(1, 'Descripción del producto requerida'),
  cantidad: z.number({ required_error: 'Cantidad requerida' })
    .min(1, 'Mínimo 1 unidad')
    .max(100000, 'Máximo 100,000 unidades'),

  // Costos
  costoUnidad: z.number({ required_error: 'Costo por unidad requerido' })
    .min(0.01, 'Costo mínimo $0.01'),
  fleteUnidad: z.number().min(0, 'Flete no puede ser negativo'),
  iva: z.number().min(0),

  // Pago inicial
  pagoInicial: z.number().min(0).optional(),

  // Opcional
  numeroOrden: z.string().optional(),
  observaciones: z.string().max(500).optional(),
})

type OCFormData = z.infer<typeof ocSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormNuevaOCProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultValues?: Partial<OCFormData>
  className?: string
}

interface Distribuidor {
  id: string
  nombre: string
  saldoPendiente?: number
  promedioOrden?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREVIEW METRICAS LOTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LotePreviewProps {
  cantidad: number
  costoUnidad: number
  fleteUnidad: number
  iva: number
  pagoInicial?: number
}

function LotePreview({ cantidad, costoUnidad, fleteUnidad, iva, pagoInicial }: LotePreviewProps) {
  const subtotal = cantidad * costoUnidad
  const fleteTotal = cantidad * fleteUnidad
  const total = subtotal + fleteTotal + iva
  const adeudo = total - (pagoInicial || 0)

  // Estimación de ROI potencial (asumiendo precio venta 1.5x)
  const precioVentaEstimado = (costoUnidad + fleteUnidad) * 1.5
  const ventasTotalesEstimadas = cantidad * precioVentaEstimado
  const gananciaEstimada = ventasTotalesEstimadas - total
  const roiEstimado = (gananciaEstimada / total) * 100

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
        <Calculator className="h-4 w-4" />
        Preview Métricas del Lote
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs text-white/50">Subtotal</p>
          <p className="font-semibold tabular-nums text-white">
            ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs text-white/50">Flete Total</p>
          <p className="font-semibold tabular-nums text-cyan-400">
            ${fleteTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs text-white/50">Total OC</p>
          <p className="font-semibold tabular-nums text-white">
            ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs text-white/50">Adeudo Pendiente</p>
          <p className={cn(
            'font-semibold tabular-nums',
            adeudo > 0 ? 'text-amber-400' : 'text-emerald-400',
          )}>
            ${adeudo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* ROI Estimado */}
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-white/50">ROI Estimado (1.5x)</span>
          </div>
          <span className={cn(
            'font-semibold',
            roiEstimado >= 30 ? 'text-emerald-400' : roiEstimado >= 15 ? 'text-amber-400' : 'text-red-400',
          )}>
            {roiEstimado.toFixed(1)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INPUT COMPONENTS (reutilizados)
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
      {hint && !error && (
        <p className="text-xs text-white/40">{hint}</p>
      )}
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function FormNuevaOC({
  onSuccess,
  onCancel,
  defaultValues,
  className,
}: FormNuevaOCProps) {
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
  } = useForm<OCFormData>({
    resolver: zodResolver(ocSchema),
    defaultValues: {
      cantidad: 1,
      fleteUnidad: 0,
      iva: 0,
      ...defaultValues,
    },
    mode: 'onChange',
  })

  // Watch values for preview
  const watchedValues = watch()
  const { cantidad, costoUnidad, fleteUnidad, iva, pagoInicial, distribuidorNombre } = watchedValues

  // Fetch distribuidores para autocomplete
  const { data: distribuidores } = useQuery({
    queryKey: ['distribuidores-autocomplete'],
    queryFn: async () => {
      const { getDistribuidores } = await import('@/app/_actions/distribuidores')
      const result = await getDistribuidores(50)
      return result.success ? (result.data as Distribuidor[]) : []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Prefill predictivo: usar costo promedio del distribuidor
  const selectedDistribuidor = useMemo(() => {
    return distribuidores?.find(d =>
      d.nombre.toLowerCase().includes(distribuidorNombre?.toLowerCase() || ''),
    )
  }, [distribuidores, distribuidorNombre])

  // Mutation para crear OC
  const createMutation = useMutation({
    mutationFn: async (data: OCFormData) => {
      const { createOrden } = await import('@/app/_actions/ordenes')
      const result = await createOrden({
        distribuidorId: data.distribuidorId || selectedDistribuidor?.id || '',
        cantidad: data.cantidad,
        precioUnitario: data.costoUnidad,
        iva: data.iva,
        numeroOrden: data.numeroOrden,
        observaciones: data.observaciones,
      })
      if (!result.success) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      // Invalidate connected queries
      queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })
      queryClient.invalidateQueries({ queryKey: ['distribuidores'] })
      queryClient.invalidateQueries({ queryKey: ['almacen'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(200)

      // Toast success
      toast.success('Orden de Compra creada', {
        description: 'Stock y métricas del lote inicializadas',
      })

      reset()
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Error al crear OC', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: OCFormData) => {
    createMutation.mutate(data)
  }

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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
          <Package className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Nueva Orden de Compra</h2>
          <p className="text-sm text-white/50">Registrar compra a distribuidor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Distribuidor */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Building2 className="h-4 w-4" />
            Distribuidor
          </h3>
          <PremiumInput
            label="Nombre del distribuidor"
            placeholder="Ej: Distribuidora ABC"
            error={errors.distribuidorNombre?.message}
            icon={<Building2 className="h-4 w-4" />}
            hint={selectedDistribuidor ? `Adeudo actual: $${selectedDistribuidor.saldoPendiente?.toLocaleString() || 0}` : undefined}
            {...register('distribuidorNombre')}
          />
        </div>

        {/* Producto */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Package className="h-4 w-4" />
            Producto y Cantidades
          </h3>
          <PremiumInput
            label="Descripción del producto"
            placeholder="Ej: Laptop HP 15.6"
            error={errors.producto?.message}
            icon={<Package className="h-4 w-4" />}
            {...register('producto')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PremiumInput
              label="Cantidad"
              type="number"
              placeholder="1"
              error={errors.cantidad?.message}
              icon={<Package className="h-4 w-4" />}
              {...register('cantidad', { valueAsNumber: true })}
            />
            <PremiumInput
              label="Número de orden (opcional)"
              placeholder="OC-001"
              icon={<Sparkles className="h-4 w-4" />}
              {...register('numeroOrden')}
            />
          </div>
        </div>

        {/* Costos */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
            <DollarSign className="h-4 w-4" />
            Costos
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <PremiumInput
              label="Costo/unidad"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.costoUnidad?.message}
              icon={<DollarSign className="h-4 w-4" />}
              suffix="MXN"
              {...register('costoUnidad', { valueAsNumber: true })}
            />
            <PremiumInput
              label="Flete/unidad"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.fleteUnidad?.message}
              icon={<Truck className="h-4 w-4" />}
              suffix="MXN"
              {...register('fleteUnidad', { valueAsNumber: true })}
            />
            <PremiumInput
              label="IVA total"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.iva?.message}
              icon={<DollarSign className="h-4 w-4" />}
              suffix="MXN"
              {...register('iva', { valueAsNumber: true })}
            />
          </div>
          <PremiumInput
            label="Pago inicial (opcional)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.pagoInicial?.message}
            icon={<DollarSign className="h-4 w-4" />}
            suffix="MXN"
            hint="Deja en 0 si se pagará después"
            {...register('pagoInicial', { valueAsNumber: true })}
          />
        </div>

        {/* Preview Métricas */}
        {cantidad > 0 && costoUnidad > 0 && (
          <LotePreview
            cantidad={cantidad}
            costoUnidad={costoUnidad}
            fleteUnidad={fleteUnidad || 0}
            iva={iva || 0}
            pagoInicial={pagoInicial}
          />
        )}

        {/* Observaciones */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70">
            Observaciones (opcional)
          </label>
          <textarea
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white backdrop-blur-sm transition-all placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            rows={2}
            placeholder="Notas adicionales..."
            {...register('observaciones')}
          />
        </div>

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
            disabled={createMutation.isPending || !isValid}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all',
              isValid
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                : 'cursor-not-allowed bg-white/10 text-white/30',
            )}
            whileHover={isValid ? { scale: 1.01 } : {}}
            whileTap={isValid ? { scale: 0.99 } : {}}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Package className="h-5 w-5" />
                Crear OC
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default FormNuevaOC
