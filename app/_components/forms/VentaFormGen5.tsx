'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛒 VENTA FORM GEN-5 — CHRONOS 2026 PLATINUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Formulario wizard multi-paso con:
 * - 4 pasos: Cliente → Producto → Pago → Confirmación
 * - Validación Zod en tiempo real
 * - Cálculo automático GYA (Bóveda Monte, Fletes, Utilidades)
 * - Visualización de distribución
 * - Glass Gen-5 ultra premium
 * - Micro-animaciones físicas
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    DollarSign,
    Package,
    PiggyBank,
    ShoppingCart,
    Sparkles,
    Truck,
    User,
    Users,
    X,
} from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
    GlassInput,
    GlassSelect,
    GlassTextarea,
    type SelectOption,
} from '../chronos-2026/forms/PremiumForms'
import { EnhancedAuroraButton as AuroraButton, EnhancedAuroraCard as AuroraGlassCard } from '../ui/EnhancedAuroraSystem'

// Alias para compatibilidad
const GlassButtonGen5 = AuroraButton
const GlassCardGen5 = AuroraGlassCard

// Wrappers simples para mantener compatibilidad
const FormInput = GlassInput
const FormSelect = GlassSelect
const FormTextarea = GlassTextarea

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS ZOD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ClienteStepSchema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente o crea uno nuevo'),
  nuevoClienteNombre: z.string().optional(),
  nuevoClienteEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  nuevoClienteTelefono: z.string().optional(),
  nuevoClienteDireccion: z.string().optional(),
})

const ProductoStepSchema = z.object({
  cantidad: z.number().min(1, 'Cantidad mínima: 1').max(10000, 'Cantidad máxima: 10,000'),
  precioVentaUnidad: z.number().min(0.01, 'Precio de venta requerido'),
  precioCompraUnidad: z.number().min(0.01, 'Precio de compra requerido'),
  precioFlete: z.number().min(0, 'Precio de flete debe ser positivo'),
})

const PagoStepSchema = z.object({
  estadoPago: z.enum(['pendiente', 'parcial', 'completo'], {
    required_error: 'Selecciona el estado de pago',
  }),
  montoPagado: z.number().min(0).optional(),
  observaciones: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

const VentaFormSchema = ClienteStepSchema.merge(ProductoStepSchema).merge(PagoStepSchema)

type VentaFormData = z.infer<typeof VentaFormSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Cliente {
  id: string
  nombre: string
  email?: string
  telefono?: string
}

interface VentaFormGen5Props {
  clientes: Cliente[]
  onSubmit: (data: VentaFormData) => Promise<void>
  onCancel?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: DISTRIBUCIÓN GYA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GYADistributionProps {
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  montoPagado?: number
}

function GYADistributionVisualization({
  cantidad,
  precioVentaUnidad,
  precioCompraUnidad,
  precioFlete,
  estadoPago,
  montoPagado = 0,
}: GYADistributionProps) {
  // Cálculos GYA
  const totalVenta = cantidad * precioVentaUnidad
  const bovedaMonte = cantidad * precioCompraUnidad
  const fletes = cantidad * precioFlete
  const utilidades = cantidad * (precioVentaUnidad - precioCompraUnidad - precioFlete)

  // Proporción según pago
  const proporcion =
    estadoPago === 'completo' ? 1 : estadoPago === 'parcial' ? montoPagado / totalVenta : 0

  const bovedaMonteReal = bovedaMonte * proporcion
  const fletesReal = fletes * proporcion
  const utilidadesReal = utilidades * proporcion

  const items = [
    {
      name: 'Bóveda Monte',
      value: bovedaMonteReal,
      total: bovedaMonte,
      color: '#8B00FF',
      icon: Building2,
      description: 'Costo de compra',
    },
    {
      name: 'Fletes',
      value: fletesReal,
      total: fletes,
      color: '#FF1493',
      icon: Truck,
      description: 'Costo de transporte',
    },
    {
      name: 'Utilidades',
      value: utilidadesReal,
      total: utilidades,
      color: '#FFD700',
      icon: PiggyBank,
      description: 'Ganancia neta',
    },
  ]

  const totalDistribuido = bovedaMonteReal + fletesReal + utilidadesReal

  return (
    <GlassCardGen5    className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-white">
          <Sparkles className="h-6 w-6 text-violet-400" />
          Distribución GYA
        </h3>
        <div className="text-right">
          <p className="text-sm text-white/50">Total a Distribuir</p>
          <p className="text-2xl font-bold text-violet-400">
            ${totalVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = totalVenta > 0 ? (item.total / totalVenta) * 100 : 0
          const realPercentage = proporcion * percentage
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-2"
            >
              {/* Label and amount */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      background: `${item.color}20`,
                      border: `1px solid ${item.color}40`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-white/40">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">
                    ${item.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  {proporcion < 1 && (
                    <p className="text-xs text-white/40">
                      de ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${realPercentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                  className="relative h-full overflow-hidden rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                </motion.div>
              </div>

              {/* Percentage label */}
              <p className="text-right text-xs text-white/40">
                {realPercentage.toFixed(1)}% del total
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="space-y-3 border-t border-white/10 pt-6">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Pagado ({(proporcion * 100).toFixed(0)}%)</span>
          <span className="font-bold text-emerald-400">
            ${totalDistribuido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
        {proporcion < 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Pendiente</span>
            <span className="font-bold text-amber-400">
              $
              {(totalVenta - totalDistribuido).toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
      </div>
    </GlassCardGen5>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: VENTA FORM GEN-5
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function VentaFormGen5({ clientes, onSubmit, onCancel }: VentaFormGen5Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<VentaFormData>({
    resolver: zodResolver(VentaFormSchema),
    defaultValues: {
      clienteId: '',
      cantidad: 1,
      precioVentaUnidad: 0,
      precioCompraUnidad: 0,
      precioFlete: 0,
      estadoPago: 'completo',
      montoPagado: 0,
      observaciones: '',
    },
    mode: 'onChange',
  })

  const {
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = form

  const watchedValues = watch()
  const totalVenta = watchedValues.cantidad * watchedValues.precioVentaUnidad

  // Opciones para selects
  const clienteOptions: SelectOption[] = [
    { value: 'nuevo', label: 'Crear nuevo cliente', icon: <User className="h-4 w-4" /> },
    ...clientes.map((c) => ({ value: c.id, label: c.nombre, icon: <Users className="h-4 w-4" /> })),
  ]

  const estadoPagoOptions: SelectOption[] = [
    { value: 'completo', label: 'Completo (100%)', icon: <Check className="h-4 w-4" /> },
    { value: 'parcial', label: 'Parcial', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'pendiente', label: 'Pendiente', icon: <Package className="h-4 w-4" /> },
  ]

  // Steps configuration
  const steps = [
    { id: 1, name: 'Cliente', icon: User, fields: ['clienteId'] },
    {
      id: 2,
      name: 'Producto',
      icon: Package,
      fields: ['cantidad', 'precioVentaUnidad', 'precioCompraUnidad', 'precioFlete'],
    },
    {
      id: 3,
      name: 'Pago',
      icon: DollarSign,
      fields: ['estadoPago', 'montoPagado', 'observaciones'],
    },
    { id: 4, name: 'Confirmación', icon: Check, fields: [] },
  ]

  const currentStepConfig = steps[currentStep - 1]

  // Validate current step
  const validateStep = () => {
    const fieldsToValidate = currentStepConfig?.fields || []
    const stepErrors = Object.keys(errors).filter((key) => fieldsToValidate.includes(key))
    return stepErrors.length === 0
  }

  const nextStep = () => {
    if (validateStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmitForm = async (data: VentaFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast.success('Venta registrada exitosamente')
    } catch (error) {
      toast.error('Error al registrar venta')
      logger.error('Error registrando venta', error, { context: 'VentaFormGen5' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-full',
                    'transition-all duration-300',
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                      : isActive
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/50'
                        : 'border border-white/10 bg-white/5 text-white/40',
                  )}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-violet-400"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <p
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isActive
                      ? 'text-violet-400'
                      : isCompleted
                        ? 'text-emerald-400'
                        : 'text-white/40',
                  )}
                >
                  {step.name}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="mx-2 -mt-8 h-0.5 flex-1">
                  <div className="h-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Cliente */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCardGen5  className="space-y-6">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                  <User className="h-7 w-7 text-violet-400" />
                  Seleccionar Cliente
                </h2>

                <FormSelect
                  label="Cliente"
                  options={clienteOptions}
                  value={watchedValues.clienteId}
                  onChange={(value: string) => form.setValue('clienteId', value, { shouldValidate: true })}
                  error={errors.clienteId?.message}
                  required
                />

                {watchedValues.clienteId === 'nuevo' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 border-t border-white/10 pt-4"
                  >
                    <h3 className="text-lg font-semibold text-white">Datos del Nuevo Cliente</h3>

                    <FormInput
                      {...form.register('nuevoClienteNombre')}
                      label="Nombre completo"
                      placeholder="Ej: Juan Pérez"
                      icon={<User className="h-5 w-5" />}
                      error={errors.nuevoClienteNombre?.message}
                      required
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormInput
                        {...form.register('nuevoClienteEmail')}
                        type="email"
                        label="Email"
                        placeholder="correo@ejemplo.com"
                        error={errors.nuevoClienteEmail?.message}
                      />

                      <FormInput
                        {...form.register('nuevoClienteTelefono')}
                        label="Teléfono"
                        placeholder="(555) 123-4567"
                        error={errors.nuevoClienteTelefono?.message}
                      />
                    </div>

                    <FormInput
                      {...form.register('nuevoClienteDireccion')}
                      label="Dirección"
                      placeholder="Calle, número, colonia, ciudad"
                      error={errors.nuevoClienteDireccion?.message}
                    />
                  </motion.div>
                )}
              </GlassCardGen5>
            </motion.div>
          )}

          {/* STEP 2: Producto */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <GlassCardGen5  className="space-y-6">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                  <Package className="h-7 w-7 text-violet-400" />
                  Detalles del Producto
                </h2>

                <FormInput
                  {...form.register('cantidad', { valueAsNumber: true })}
                  type="number"
                  label="Cantidad"
                  placeholder="0"
                  icon={<Package className="h-5 w-5" />}
                  error={errors.cantidad?.message}
                  required
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormInput
                    {...form.register('precioVentaUnidad', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    label="Precio Venta/Unidad"
                    placeholder="0.00"
                    icon={<DollarSign className="h-5 w-5" />}
                    error={errors.precioVentaUnidad?.message}
                    required
                  />

                  <FormInput
                    {...form.register('precioCompraUnidad', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    label="Precio Compra/Unidad"
                    placeholder="0.00"
                    icon={<DollarSign className="h-5 w-5" />}
                    error={errors.precioCompraUnidad?.message}
                    required
                  />

                  <FormInput
                    {...form.register('precioFlete', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    label="Flete/Unidad"
                    placeholder="0.00"
                    icon={<Truck className="h-5 w-5" />}
                    error={errors.precioFlete?.message}
                  />
                </div>

                {/* Total preview */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Total de Venta:</span>
                    <span className="text-3xl font-bold text-violet-400">
                      ${totalVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </GlassCardGen5>

              {/* GYA Preview */}
              {watchedValues.cantidad > 0 && watchedValues.precioVentaUnidad > 0 && (
                <GYADistributionVisualization
                  cantidad={watchedValues.cantidad}
                  precioVentaUnidad={watchedValues.precioVentaUnidad}
                  precioCompraUnidad={watchedValues.precioCompraUnidad}
                  precioFlete={watchedValues.precioFlete}
                  estadoPago="completo"
                />
              )}
            </motion.div>
          )}

          {/* STEP 3: Pago */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <GlassCardGen5  className="space-y-6">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                  <DollarSign className="h-7 w-7 text-violet-400" />
                  Información de Pago
                </h2>

                <FormSelect
                  label="Estado de Pago"
                  options={estadoPagoOptions}
                  value={watchedValues.estadoPago}
                  onChange={(value: string) =>
                    form.setValue('estadoPago', value as 'completo' | 'parcial' | 'pendiente', { shouldValidate: true })
                  }
                  error={errors.estadoPago?.message}
                  required
                />

                {watchedValues.estadoPago === 'parcial' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <FormInput
                      {...form.register('montoPagado', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      label="Monto Pagado"
                      placeholder="0.00"
                      icon={<DollarSign className="h-5 w-5" />}
                      error={errors.montoPagado?.message}
                      helperText={`Total: $${totalVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    />
                  </motion.div>
                )}

                <FormTextarea
                  {...form.register('observaciones')}
                  label="Observaciones"
                  placeholder="Notas adicionales sobre la venta..."
                  rows={4}
                  maxLength={500}
                  error={errors.observaciones?.message}
                />
              </GlassCardGen5>

              {/* GYA with payment status */}
              <GYADistributionVisualization
                cantidad={watchedValues.cantidad}
                precioVentaUnidad={watchedValues.precioVentaUnidad}
                precioCompraUnidad={watchedValues.precioCompraUnidad}
                precioFlete={watchedValues.precioFlete}
                estadoPago={watchedValues.estadoPago}
                montoPagado={watchedValues.montoPagado}
              />
            </motion.div>
          )}

          {/* STEP 4: Confirmación */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCardGen5  className="space-y-6">
                <div className="space-y-4 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <Check className="h-10 w-10 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">¡Todo listo!</h2>
                  <p className="text-white/60">Revisa los detalles antes de confirmar la venta</p>
                </div>

                {/* Summary */}
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-1 text-white/40">Cliente</p>
                      <p className="font-semibold text-white">
                        {watchedValues.clienteId === 'nuevo'
                          ? watchedValues.nuevoClienteNombre
                          : clientes.find((c) => c.id === watchedValues.clienteId)?.nombre}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-white/40">Cantidad</p>
                      <p className="font-semibold text-white">{watchedValues.cantidad} unidades</p>
                    </div>
                    <div>
                      <p className="mb-1 text-white/40">Total Venta</p>
                      <p className="font-semibold text-white">
                        ${totalVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-white/40">Estado Pago</p>
                      <p
                        className={cn(
                          'font-semibold',
                          watchedValues.estadoPago === 'completo'
                            ? 'text-emerald-400'
                            : watchedValues.estadoPago === 'parcial'
                              ? 'text-amber-400'
                              : 'text-rose-400',
                        )}
                      >
                        {watchedValues.estadoPago === 'completo'
                          ? 'Completo'
                          : watchedValues.estadoPago === 'parcial'
                            ? 'Parcial'
                            : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Final GYA */}
                <GYADistributionVisualization
                  cantidad={watchedValues.cantidad}
                  precioVentaUnidad={watchedValues.precioVentaUnidad}
                  precioCompraUnidad={watchedValues.precioCompraUnidad}
                  precioFlete={watchedValues.precioFlete}
                  estadoPago={watchedValues.estadoPago}
                  montoPagado={watchedValues.montoPagado}
                />
              </GlassCardGen5>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <GlassButtonGen5

            variant="secondary"
            onClick={currentStep === 1 ? onCancel : prevStep}
            icon={currentStep === 1 ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          >
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </GlassButtonGen5>

          {currentStep < 4 ? (
            <GlassButtonGen5

              variant="primary"
              onClick={nextStep}
              disabled={!validateStep()}
              icon={<ArrowRight className="h-5 w-5" />}
              iconPosition="right"
            >
              Siguiente
            </GlassButtonGen5>
          ) : (
            <GlassButtonGen5

              variant="primary"
              disabled={isSubmitting || !isValid}
              loading={isSubmitting}
              icon={<ShoppingCart className="h-5 w-5" />}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
            </GlassButtonGen5>
          )}
        </div>
      </form>
    </div>
  )
}
