'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL INGRESO iOS PREMIUM
// Registro de ingresos con diseño iOS glassmorphism avanzado
// ═══════════════════════════════════════════════════════════════════════════

import { registrarIngreso as registrarIngresoAction } from '@/app/_actions/bancos'
import { BANCOS_CONFIG, BANCOS_ORDENADOS } from '@/app/_lib/constants/bancos'
import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import type { BancoId } from '@/app/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Sparkles, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { iOSModal, iOSButton, iOSGlassCard, iOSInput, iOSPill } from '../ui/ios'
// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const IngresoSchema = z.object({
  bancoId: z.string().min(1, 'Selecciona un banco'),
  monto: z.number().positive('Monto debe ser positivo'),
  concepto: z.string().min(1, 'Concepto requerido'),
  categoria: z.string().optional(),
})

type IngresoFormData = z.infer<typeof IngresoSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface IngresoModalProps {
  isOpen: boolean
  onClose: () => void
  bancoPreseleccionado?: BancoId
}

const CATEGORIAS = [
  'Ventas',
  'Cobros',
  'Inversiones',
  'Préstamos',
  'Devoluciones',
  'Intereses',
  'Otros',
]

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function IngresoModal({ isOpen, onClose, bancoPreseleccionado }: IngresoModalProps) {
  const [isPending, startTransition] = useTransition()

  // Zustand store
  const { bancos } = useChronosStore()

  const form = useForm<IngresoFormData>({
    resolver: zodResolver(IngresoSchema),
    defaultValues: {
      bancoId: bancoPreseleccionado || '',
      monto: 0,
      concepto: '',
      categoria: 'Ventas',
    },
  })

  const watchedValues = form.watch()
  const bancoSeleccionado = bancos[watchedValues.bancoId as BancoId]

  const handleReset = () => {
    form.reset({
      bancoId: bancoPreseleccionado || '',
      monto: 0,
      concepto: '',
      categoria: 'Ventas',
    })
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIÓN PRE-SUBMIT: Asegurar datos válidos antes de enviar
    // ═══════════════════════════════════════════════════════════════════

    if (!data.bancoId) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un banco',
      })
      return
    }

    if (!data.monto || data.monto <= 0) {
      toast.error('Error de validación', {
        description: 'El monto debe ser mayor a 0',
      })
      return
    }

    if (!data.concepto?.trim()) {
      toast.error('Error de validación', {
        description: 'Debe ingresar un concepto para el ingreso',
      })
      return
    }

    logger.info('🚀 Iniciando registro de ingreso', {
      context: 'IngresoModal',
      data: {
        bancoId: data.bancoId,
        monto: data.monto,
        concepto: data.concepto,
        categoria: data.categoria,
      },
    })

    startTransition(async () => {
      try {
        const conceptoCompleto = data.categoria
          ? `[${data.categoria}] ${data.concepto}`
          : data.concepto

        // ═══════════════════════════════════════════════════════════════════
        // SERVER ACTION - registrarIngreso
        // ═══════════════════════════════════════════════════════════════════
        const formData = new FormData()
        formData.append('bancoId', data.bancoId)
        formData.append('monto', String(data.monto))
        formData.append('concepto', conceptoCompleto)
        if (data.categoria) {
          formData.append('categoria', data.categoria)
        }
        const result = await registrarIngresoAction(formData)

        if (!result.success) {
          throw new Error(result.error)
        }

        toast.success('Ingreso registrado correctamente', {
          description: `${formatCurrency(data.monto)} agregado a ${BANCOS_CONFIG[data.bancoId as BancoId]?.nombre}`,
        })

        logger.info('Ingreso registrado', {
          context: 'IngresoModal',
          data: { bancoId: data.bancoId, monto: data.monto },
        })

        handleReset()
        onClose()
      } catch (error) {
        logger.error('Error registrando ingreso', error as Error, { context: 'IngresoModal' })
        toast.error('Error al registrar ingreso', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <iOSModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Ingreso"
      subtitle="Agrega fondos a un banco"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banco */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2"
        >
          <label className="flex items-center gap-2 text-sm text-gray-400">
            Seleccionar Banco
            <Sparkles className="h-3 w-3 text-emerald-500/50" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BANCOS_ORDENADOS.map((config) => {
              const bancoId = config.id
              const banco = bancos[bancoId]
              const isSelected = watchedValues.bancoId === bancoId

              return (
                <motion.button
                  key={bancoId}
                  type="button"
                  onClick={() => form.setValue('bancoId', bancoId)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all duration-300',
                    isSelected
                      ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span>{config.icono}</span>
                    <span className="text-sm font-medium text-white">{config.nombre}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(banco?.capitalActual || 0)}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Monto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm text-gray-400">Monto del Ingreso</label>
          <input
            type="number"
            {...form.register('monto', { valueAsNumber: true })}
            min={0}
            step="0.01"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white transition-all duration-300 focus:border-green-500 focus:shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          />
        </motion.div>

        {/* Categoría */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-sm text-gray-400">Categoría</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => form.setValue('categoria', cat)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm transition-all',
                  watchedValues.categoria === cat
                    ? 'border border-green-500/30 bg-green-500/20 text-green-400'
                    : 'border border-transparent bg-white/5 text-gray-400 hover:text-white',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Concepto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm text-gray-400">Concepto / Descripción</label>
          <input
            {...form.register('concepto')}
            placeholder="Describe el ingreso..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all duration-300 placeholder:text-gray-500 focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          />
        </motion.div>

        {/* Preview */}
        <AnimatePresence>
          {bancoSeleccionado && (watchedValues.monto || 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="rounded-xl border border-green-500/20 bg-green-500/10 p-3"
            >
              <div className="mb-2 flex items-center gap-2 text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Previsualización</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Capital actual:</span>
                <span className="text-white">
                  {formatCurrency(bancoSeleccionado.capitalActual || 0)}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-gray-400">Después del ingreso:</span>
                <span className="font-bold text-green-400">
                  {formatCurrency(
                    (bancoSeleccionado.capitalActual || 0) + (watchedValues.monto || 0),
                  )}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <iOSButton variant="secondary" onClick={onClose}>
            Cancelar
          </iOSButton>
          <iOSButton
            type="submit"
            variant="primary"
            loading={isPending}
            disabled={!watchedValues.bancoId || (watchedValues.monto || 0) <= 0}
            icon={<Plus className="h-4 w-4" />}
          >
            Registrar Ingreso
          </iOSButton>
        </div>
      </form>
    </iOSModal>
  )
}
