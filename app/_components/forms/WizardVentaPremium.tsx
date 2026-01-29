'use client'

// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 — WIZARD DE VENTA PREMIUM
// Wizard step-by-step con distribución GYA automática
// IA colaborativa que guía y confirma cada paso
// Paleta: #000000 / #8B00FF / #FFD700 / #FF1493 (CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Users,
  Package,
  DollarSign,
  Truck,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/app/_lib/utils'
// Server action para crear venta
import { crearVentaConDistribucion, type VentaInput } from '@/app/_actions/automatizacion-gya'
// Funciones puras de cálculo (cliente/servidor)
import { calcularDistribucionGYA, type DistribucionGYA } from '@/app/_lib/utils/gya-calculo'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface WizardVentaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (venta: unknown) => void
  clientes?: Array<{ id: string; nombre: string }>
}

type WizardStep = 'cliente' | 'cantidad' | 'precios' | 'confirmacion' | 'resultado'

interface FormState {
  clienteId: string
  clienteNombre: string
  cantidad: number
  precioVenta: number
  precioCompra: number
  precioFlete: number
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE STEP INDICATOR
// ═══════════════════════════════════════════════════════════════

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: { id: WizardStep; label: string }[]
  currentStep: WizardStep
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              'border-2 transition-colors duration-300',
              index < currentIndex && 'border-violet-600 bg-violet-600 text-white',
              index === currentIndex && 'border-violet-500 bg-violet-500/20 text-violet-400',
              index > currentIndex && 'border-white/20 bg-transparent text-white/40',
            )}
            animate={index === currentIndex ? { scale: [1, 1.1, 1] } : {}}
            transition={{
              duration: 0.5,
              repeat: index === currentIndex ? Infinity : 0,
              repeatDelay: 1,
            }}
          >
            {index < currentIndex ? <Check className="h-4 w-4" /> : index + 1}
          </motion.div>

          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-1 h-0.5 w-12',
                index < currentIndex ? 'bg-violet-600' : 'bg-white/20',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE INPUT PREMIUM
// ═══════════════════════════════════════════════════════════════

function PremiumInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
  suffix,
  error,
  autoFocus,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number'
  placeholder?: string
  prefix?: string
  suffix?: string
  error?: string
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/60">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/40">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full rounded-xl px-4 py-3',
            'border bg-violet-900/30',
            'text-white placeholder-white/30',
            'focus:ring-2 focus:ring-violet-500/50 focus:outline-none',
            'transition-all duration-300',
            prefix && 'pl-8',
            suffix && 'pr-16',
            error ? 'border-red-500/50' : 'border-violet-500/20 focus:border-violet-500/50',
          )}
        />
        {suffix && (
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40">{suffix}</span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DISTRIBUCIÓN GYA VISUAL
// ═══════════════════════════════════════════════════════════════

function DistribucionVisual({ distribucion }: { distribucion: DistribucionGYA }) {
  const items = [
    {
      label: 'Bóveda Monte',
      value: distribucion.montoBovedaMonte,
      color: 'from-amber-500 to-amber-600',
      description: 'Costo de mercancía',
    },
    {
      label: 'Fletes',
      value: distribucion.montoFletes,
      color: 'from-violet-500 to-violet-600',
      description: 'Transporte',
    },
    {
      label: 'Utilidades',
      value: distribucion.montoUtilidades,
      color: 'from-pink-500 to-pink-600',
      description: 'Ganancia neta',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <p className="text-sm text-white/60">Total a cobrar al cliente</p>
        <motion.p
          key={distribucion.precioTotalVenta}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          ${distribucion.precioTotalVenta.toLocaleString()}
        </motion.p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className={cn('h-3 w-3 rounded-full bg-gradient-to-r', item.color)} />
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white">{item.label}</span>
                <span className="text-lg font-semibold text-white">
                  ${item.value.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-white/40">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Margen neto</span>
          <span
            className={cn(
              'text-lg font-bold',
              distribucion.margenNeto > 35
                ? 'text-emerald-400'
                : distribucion.margenNeto > 25
                  ? 'text-amber-400'
                  : 'text-red-400',
            )}
          >
            {distribucion.margenNeto.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: WIZARD DE VENTA
// ═══════════════════════════════════════════════════════════════

export function WizardVentaPremium({
  isOpen,
  onClose,
  onSuccess,
  clientes = [],
}: WizardVentaProps) {
  const [step, setStep] = useState<WizardStep>('cliente')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<unknown>(null)

  const [form, setForm] = useState<FormState>({
    clienteId: '',
    clienteNombre: '',
    cantidad: 0,
    precioVenta: 0,
    precioCompra: 0,
    precioFlete: 500, // Default
  })

  const steps: { id: WizardStep; label: string }[] = [
    { id: 'cliente', label: 'Cliente' },
    { id: 'cantidad', label: 'Cantidad' },
    { id: 'precios', label: 'Precios' },
    { id: 'confirmacion', label: 'Confirmar' },
  ]

  // Calcular distribución en tiempo real
  const distribucion = useMemo(() => {
    if (form.precioVenta && form.precioCompra && form.cantidad) {
      return calcularDistribucionGYA(
        form.precioVenta,
        form.precioCompra,
        form.precioFlete,
        form.cantidad,
      )
    }
    return null
  }, [form.precioVenta, form.precioCompra, form.precioFlete, form.cantidad])

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setStep('cliente')
      setForm({
        clienteId: '',
        clienteNombre: '',
        cantidad: 0,
        precioVenta: 0,
        precioCompra: 0,
        precioFlete: 500,
      })
      setError(null)
      setResultado(null)
    }
  }, [isOpen])

  const handleNext = useCallback(() => {
    setError(null)

    switch (step) {
      case 'cliente':
        if (!form.clienteId) {
          setError('Selecciona un cliente')
          return
        }
        setStep('cantidad')
        break
      case 'cantidad':
        if (!form.cantidad || form.cantidad <= 0) {
          setError('Ingresa una cantidad válida')
          return
        }
        setStep('precios')
        break
      case 'precios':
        if (!form.precioVenta || form.precioVenta <= 0) {
          setError('Ingresa un precio de venta válido')
          return
        }
        if (!form.precioCompra || form.precioCompra <= 0) {
          setError('Ingresa un precio de compra válido')
          return
        }
        if (form.precioVenta <= form.precioCompra + form.precioFlete) {
          setError('El precio de venta debe ser mayor al costo + flete')
          return
        }
        setStep('confirmacion')
        break
    }
  }, [step, form])

  const handleBack = useCallback(() => {
    setError(null)
    switch (step) {
      case 'cantidad':
        setStep('cliente')
        break
      case 'precios':
        setStep('cantidad')
        break
      case 'confirmacion':
        setStep('precios')
        break
    }
  }, [step])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const input: VentaInput = {
        clienteId: form.clienteId,
        cantidad: form.cantidad,
        precioVentaUnidad: form.precioVenta,
        precioCompraUnidad: form.precioCompra,
        precioFlete: form.precioFlete,
      }

      const result = await crearVentaConDistribucion(input)

      if (result.success && result.data) {
        setResultado(result.data)
        setStep('resultado')
        onSuccess?.(result.data)

        logger.info('Venta creada desde wizard', {
          context: 'WizardVenta',
          data: result.data as unknown as Record<string, unknown>,
        })
      } else {
        setError(result.error || 'Error al crear venta')
      }
    } catch (err) {
      setError('Error inesperado al crear venta')
      logger.error('Error en wizard de venta', err as Error, { context: 'WizardVenta' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'w-full max-w-lg',
            'bg-gradient-to-b from-violet-950/95 to-black/95',
            'border border-violet-500/30',
            'overflow-hidden rounded-2xl',
            'shadow-2xl shadow-violet-500/20',
          )}
        >
          {/* Header */}
          <div className="border-b border-violet-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/20 p-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Nueva Venta</h2>
                  <p className="text-xs text-white/60">Distribución GYA automática</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-white/5"
              >
                <X className="h-5 w-5 text-white/60" />
              </button>
            </div>

            {step !== 'resultado' && <StepIndicator steps={steps} currentStep={step} />}
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step: Cliente */}
              {step === 'cliente' && (
                <motion.div
                  key="cliente"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-4 flex items-center gap-2 text-white/60">
                    <Users className="h-5 w-5" />
                    <span>Selecciona el cliente</span>
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {clientes.map((cliente) => (
                      <button
                        key={cliente.id}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            clienteId: cliente.id,
                            clienteNombre: cliente.nombre,
                          }))
                        }
                        className={cn(
                          'w-full rounded-lg p-3 text-left',
                          'border transition-all duration-200',
                          form.clienteId === cliente.id
                            ? 'border-violet-500/50 bg-violet-500/20'
                            : 'border-white/10 bg-white/5 hover:border-violet-500/30',
                        )}
                      >
                        <span className="text-white">{cliente.nombre}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step: Cantidad */}
              {step === 'cantidad' && (
                <motion.div
                  key="cantidad"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-4 flex items-center gap-2 text-white/60">
                    <Package className="h-5 w-5" />
                    <span>¿Cuántas piezas?</span>
                  </div>

                  <PremiumInput
                    label="Cantidad de piezas"
                    value={form.cantidad || ''}
                    onChange={(v) => setForm((f) => ({ ...f, cantidad: parseInt(v) || 0 }))}
                    type="number"
                    placeholder="Ej: 20"
                    suffix="piezas"
                    autoFocus
                  />
                </motion.div>
              )}

              {/* Step: Precios */}
              {step === 'precios' && (
                <motion.div
                  key="precios"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-4 flex items-center gap-2 text-white/60">
                    <DollarSign className="h-5 w-5" />
                    <span>Precios por unidad</span>
                  </div>

                  <PremiumInput
                    label="Precio de venta"
                    value={form.precioVenta || ''}
                    onChange={(v) => setForm((f) => ({ ...f, precioVenta: parseFloat(v) || 0 }))}
                    type="number"
                    placeholder="Ej: 12,500"
                    prefix="$"
                    autoFocus
                  />

                  <PremiumInput
                    label="Precio de compra (costo)"
                    value={form.precioCompra || ''}
                    onChange={(v) => setForm((f) => ({ ...f, precioCompra: parseFloat(v) || 0 }))}
                    type="number"
                    placeholder="Ej: 7,800"
                    prefix="$"
                  />

                  <PremiumInput
                    label="Flete por unidad"
                    value={form.precioFlete}
                    onChange={(v) => setForm((f) => ({ ...f, precioFlete: parseFloat(v) || 0 }))}
                    type="number"
                    placeholder="Ej: 500"
                    prefix="$"
                  />
                </motion.div>
              )}

              {/* Step: Confirmación */}
              {step === 'confirmacion' && distribucion && (
                <motion.div
                  key="confirmacion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
                    <p className="mb-1 text-sm text-white/60">Cliente</p>
                    <p className="text-lg font-semibold text-white">{form.clienteNombre}</p>
                    <p className="mt-1 text-sm text-violet-400">{form.cantidad} piezas</p>
                  </div>

                  <DistribucionVisual distribucion={distribucion} />
                </motion.div>
              )}

              {/* Step: Resultado */}
              {step === 'resultado' && (
                <motion.div
                  key="resultado"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600"
                  >
                    <Check className="h-10 w-10 text-white" />
                  </motion.div>

                  <h3 className="mb-2 text-xl font-semibold text-white">¡Venta registrada!</h3>
                  <p className="mb-4 text-white/60">
                    La distribución GYA se aplicó automáticamente
                  </p>

                  {distribucion && (
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="text-amber-400">
                        Bóveda: ${distribucion.montoBovedaMonte.toLocaleString()}
                      </div>
                      <div className="text-violet-400">
                        Fletes: ${distribucion.montoFletes.toLocaleString()}
                      </div>
                      <div className="text-pink-400">
                        Utilidades: ${distribucion.montoUtilidades.toLocaleString()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3"
              >
                <p className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-violet-500/20 p-6">
            {step !== 'resultado' && step !== 'cliente' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-white/70 transition-colors hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </button>
            )}

            <div className="flex-1" />

            {step === 'resultado' ? (
              <button
                onClick={onClose}
                className="rounded-lg bg-violet-600 px-6 py-2 text-white transition-colors hover:bg-violet-500"
              >
                Cerrar
              </button>
            ) : step === 'confirmacion' ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2 text-white transition-all hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirmar venta
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2 text-white transition-colors hover:bg-violet-500"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WizardVentaPremium
