'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛒 FORM NUEVA VENTA — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario premium de ventas con:
 * ✅ Validación Zod client/server
 * ✅ Server Actions para mutaciones
 * ✅ TanStack Query para refetch
 * ✅ Haptic feedback on-submit
 * ✅ Toast notifications premium
 * ✅ Cálculo automático GYA preview
 * ✅ Autocomplete clientes/productos
 * ✅ Animaciones Framer Motion
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    AlertCircle,
    Calculator,
    Check,
    ChevronDown,
    DollarSign,
    Loader2,
    Package,
    PiggyBank,
    ShoppingCart,
    Sparkles,
    Truck,
    User,
    Wallet,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA ZOD — Validación completa
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ventaSchema = z.object({
  // Cliente
  clienteId: z.string().optional(),
  clienteNombre: z.string().min(1, 'Nombre de cliente requerido'),

  // Producto
  productoId: z.string().optional(),
  cantidad: z.number({ required_error: 'Cantidad requerida' })
    .min(1, 'Mínimo 1 unidad')
    .max(10000, 'Máximo 10,000 unidades'),

  // Precios
  precioVentaUnidad: z.number({ required_error: 'Precio de venta requerido' })
    .min(0.01, 'Precio mínimo $0.01'),
  precioCompraUnidad: z.number({ required_error: 'Precio de compra requerido' })
    .min(0.01, 'Precio mínimo $0.01'),
  precioFlete: z.number().min(0, 'Flete no puede ser negativo'),

  // Pago
  estadoPago: z.enum(['pendiente', 'parcial', 'completo'], {
    required_error: 'Selecciona estado de pago',
  }),
  abonoInicial: z.number().min(0).optional(),

  // Opcional
  observaciones: z.string().max(500).optional(),
}).refine((data) => {
  // Validar que el abono no sea mayor al total
  if (data.estadoPago === 'parcial' && data.abonoInicial) {
    const total = data.precioVentaUnidad * data.cantidad
    return data.abonoInicial <= total
  }
  return true
}, {
  message: 'El abono no puede ser mayor al total',
  path: ['abonoInicial'],
})

type VentaFormData = z.infer<typeof ventaSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormNuevaVentaProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultValues?: Partial<VentaFormData>
  className?: string
}

interface Cliente {
  id: string
  nombre: string
  saldoPendiente?: number
}

interface Producto {
  id: string
  nombre: string
  precioVenta: number
  precioCompra: number
  stockActual: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREVIEW GYA — Cálculo en tiempo real
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GYAPreviewProps {
  cantidad: number
  precioVenta: number
  precioCompra: number
  flete: number
  estadoPago: string
  abonoInicial?: number
}

function GYAPreview({ cantidad, precioVenta, precioCompra, flete, estadoPago, abonoInicial }: GYAPreviewProps) {
  const total = cantidad * precioVenta
  const costoTotal = cantidad * precioCompra
  const fleteTotal = cantidad * flete
  const utilidadTotal = total - costoTotal - fleteTotal

  // Distribución GYA según estado de pago
  const proporcion = estadoPago === 'completo' ? 1 : estadoPago === 'parcial' && abonoInicial ? abonoInicial / total : 0

  const bovedaMonte = costoTotal * proporcion
  const fletes = fleteTotal * proporcion
  const utilidades = utilidadTotal * proporcion

  const items = [
    { label: 'Total Venta', value: total, color: 'text-white', icon: <DollarSign className="h-4 w-4" /> },
    { label: 'Bóveda Monte', value: bovedaMonte, color: 'text-amber-400', icon: <PiggyBank className="h-4 w-4" /> },
    { label: 'Fletes', value: fletes, color: 'text-cyan-400', icon: <Truck className="h-4 w-4" /> },
    { label: 'Utilidades', value: utilidades, color: 'text-emerald-400', icon: <Sparkles className="h-4 w-4" /> },
  ]

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
        <Calculator className="h-4 w-4" />
        Preview Distribución GYA
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-white/5', item.color)}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-white/50">{item.label}</p>
              <p className={cn('font-semibold tabular-nums', item.color)}>
                ${item.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Margen */}
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Margen bruto</span>
          <span className={cn(
            'font-semibold',
            utilidadTotal / total * 100 >= 20 ? 'text-emerald-400' : 'text-amber-400',
          )}>
            {((utilidadTotal / total) * 100).toFixed(1)}%
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
  options: Array<{ value: string; label: string }>
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
          'focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
          error ? 'border-red-500/50' : 'border-white/10',
        )}
      >
        <span className={selected ? 'text-white' : 'text-white/30'}>
          {selected?.label || placeholder || 'Seleccionar...'}
        </span>
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

export function FormNuevaVenta({
  onSuccess,
  onCancel,
  defaultValues,
  className,
}: FormNuevaVentaProps) {
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
  } = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      estadoPago: 'pendiente',
      precioFlete: 500,
      cantidad: 1,
      ...defaultValues,
    },
    mode: 'onChange',
  })

  // Watch values for preview
  const watchedValues = watch()
  const { cantidad, precioVentaUnidad, precioCompraUnidad, precioFlete, estadoPago, abonoInicial } = watchedValues

  // Fetch clientes para autocomplete
  const { data: clientes } = useQuery({
    queryKey: ['clientes-autocomplete'],
    queryFn: async () => {
      const { getClientes } = await import('@/app/_actions/clientes')
      const result = await getClientes(50)
      return result.success ? (result.data as Cliente[]) : []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Mutation para crear venta
  const createMutation = useMutation({
    mutationFn: async (data: VentaFormData) => {
      const { createVenta } = await import('@/app/_actions/ventas')
      const result = await createVenta({
        clienteId: data.clienteId,
        clienteNombre: data.clienteNombre,
        productoId: data.productoId || 'default',
        cantidad: data.cantidad,
        precioVentaUnidad: data.precioVentaUnidad,
        precioCompraUnidad: data.precioCompraUnidad,
        precioFlete: data.precioFlete,
        montoPagado: data.estadoPago === 'completo'
          ? data.cantidad * data.precioVentaUnidad
          : data.abonoInicial || 0,
        observaciones: data.observaciones,
      })
      if (!result.success) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      // Invalidate connected queries
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(200)

      // Toast success
      toast.success('Venta creada exitosamente', {
        description: 'Métricas y distribución GYA actualizadas',
      })

      reset()
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Error al crear venta', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: VentaFormData) => {
    createMutation.mutate(data)
  }

  // Estado de pago options
  const estadoPagoOptions = [
    { value: 'pendiente', label: '🔴 Pendiente (sin pago)' },
    { value: 'parcial', label: '🟡 Parcial (abono inicial)' },
    { value: 'completo', label: '🟢 Completo (100% pagado)' },
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
          <ShoppingCart className="h-6 w-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Nueva Venta</h2>
          <p className="text-sm text-white/50">Registrar venta con distribución GYA automática</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Cliente */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
            <User className="h-4 w-4" />
            Datos del Cliente
          </h3>
          <PremiumInput
            label="Nombre del cliente"
            placeholder="Ej: Juan Pérez"
            error={errors.clienteNombre?.message}
            icon={<User className="h-4 w-4" />}
            {...register('clienteNombre')}
          />
        </div>

        {/* Producto y Cantidades */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Package className="h-4 w-4" />
            Producto y Cantidades
          </h3>
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
              label="Precio venta/unidad"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.precioVentaUnidad?.message}
              icon={<DollarSign className="h-4 w-4" />}
              suffix="MXN"
              {...register('precioVentaUnidad', { valueAsNumber: true })}
            />
            <PremiumInput
              label="Precio compra/unidad"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.precioCompraUnidad?.message}
              icon={<DollarSign className="h-4 w-4" />}
              suffix="MXN"
              {...register('precioCompraUnidad', { valueAsNumber: true })}
            />
            <PremiumInput
              label="Flete/unidad"
              type="number"
              step="0.01"
              placeholder="500"
              error={errors.precioFlete?.message}
              icon={<Truck className="h-4 w-4" />}
              suffix="MXN"
              {...register('precioFlete', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Estado de Pago */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Wallet className="h-4 w-4" />
            Estado de Pago
          </h3>
          <Controller
            name="estadoPago"
            control={control}
            render={({ field }) => (
              <PremiumSelect
                label="Estado"
                value={field.value}
                onChange={field.onChange}
                options={estadoPagoOptions}
                error={errors.estadoPago?.message}
                placeholder="Seleccionar estado de pago"
              />
            )}
          />

          {/* Abono inicial condicional */}
          <AnimatePresence>
            {estadoPago === 'parcial' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <PremiumInput
                  label="Abono inicial"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.abonoInicial?.message}
                  icon={<DollarSign className="h-4 w-4" />}
                  suffix="MXN"
                  {...register('abonoInicial', { valueAsNumber: true })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview GYA */}
        {cantidad > 0 && precioVentaUnidad > 0 && precioCompraUnidad > 0 && (
          <GYAPreview
            cantidad={cantidad}
            precioVenta={precioVentaUnidad}
            precioCompra={precioCompraUnidad}
            flete={precioFlete || 0}
            estadoPago={estadoPago}
            abonoInicial={abonoInicial}
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
                ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-violet-500/25'
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
                <ShoppingCart className="h-5 w-5" />
                Crear Venta
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default FormNuevaVenta
