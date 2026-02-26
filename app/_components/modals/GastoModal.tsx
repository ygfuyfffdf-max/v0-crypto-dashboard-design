'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL GASTO iOS PREMIUM
// Registro de gastos con diseño iOS glassmorphism avanzado
// ═══════════════════════════════════════════════════════════════════════════

import { BANCOS_ORDENADOS } from '@/app/_lib/constants/bancos'
import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import type { BancoId } from '@/app/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Minus, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { iOSModal as IOSModal, iOSButton as IOSButton, iOSGlassCard, iOSInput, iOSPill } from '../ui/ios'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const GastoSchema = z.object({
  bancoId: z.string().min(1, 'Selecciona un banco'),
  monto: z.number().positive('Monto debe ser positivo'),
  concepto: z.string().min(1, 'Concepto requerido'),
  categoria: z.string().optional(),
})

type GastoFormData = z.infer<typeof GastoSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface GastoModalProps {
  isOpen: boolean
  onClose: () => void
  bancoPreseleccionado?: BancoId
}

const CATEGORIAS = [
  'Operaciones',
  'Transporte',
  'Servicios',
  'Nómina',
  'Impuestos',
  'Mantenimiento',
  'Marketing',
  'Otros',
]

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function GastoModal({ isOpen, onClose, bancoPreseleccionado }: GastoModalProps) {
  const [isPending, startTransition] = useTransition()

  // Zustand store
  const { bancos, registrarGasto } = useChronosStore()

  const form = useForm<GastoFormData>({
    resolver: zodResolver(GastoSchema),
    defaultValues: {
      bancoId: bancoPreseleccionado || '',
      monto: 0,
      concepto: '',
      categoria: 'Operaciones',
    },
  })

  const watchedValues = form.watch()
  const bancoSeleccionado = bancos[watchedValues.bancoId as BancoId]
  const capitalDisponible = bancoSeleccionado?.capitalActual || 0
  const hasEnoughCapital = capitalDisponible >= (watchedValues.monto || 0)

  const handleReset = () => {
    form.reset({
      bancoId: bancoPreseleccionado || '',
      monto: 0,
      concepto: '',
      categoria: 'Operaciones',
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
        description: 'Debe ingresar un concepto para el gasto',
      })
      return
    }

    if (!hasEnoughCapital) {
      toast.error('Capital insuficiente', {
        description: `Disponible: ${formatCurrency(capitalDisponible)}`,
      })
      return
    }

    logger.info('🚀 Iniciando registro de gasto', {
      context: 'GastoModal',
      data: {
        bancoId: data.bancoId,
        monto: data.monto,
        concepto: data.concepto,
        categoria: data.categoria,
        capitalDisponible,
      },
    })

    startTransition(async () => {
      try {
        const conceptoCompleto = data.categoria
          ? `[${data.categoria}] ${data.concepto}`
          : data.concepto

        // Persistir en DB via API
        const response = await fetch('/api/movimientos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bancoId: data.bancoId,
            tipo: 'gasto',
            monto: data.monto,
            concepto: conceptoCompleto,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al registrar gasto')
        }

        // También actualizar el store local para UI inmediata
        registrarGasto(data.bancoId as BancoId, data.monto, conceptoCompleto)

        toast.success('Gasto registrado', {
          description: `${formatCurrency(data.monto)} - ${data.concepto}`,
        })

        logger.info('Gasto registrado', {
          context: 'GastoModal',
          data: { bancoId: data.bancoId, monto: data.monto, concepto: data.concepto },
        })

        handleReset()
        onClose()
      } catch (error) {
        logger.error('Error registrando gasto', error as Error, { context: 'GastoModal' })
        toast.error('Error al registrar gasto', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <IOSModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Gasto"
      subtitle="Retira fondos de un banco"
      size="lg"
      variant="popup"
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
            <Sparkles className="h-3 w-3 text-violet-500/50" />
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
                      ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
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
          <label className="text-sm text-gray-400">Monto del Gasto</label>
          <input
            type="number"
            {...form.register('monto', { valueAsNumber: true })}
            min={0}
            max={capitalDisponible}
            step="0.01"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white transition-all duration-300 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          />
          {bancoSeleccionado && (
            <p className="text-center text-xs text-gray-500">
              Disponible: {formatCurrency(capitalDisponible)}
            </p>
          )}
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
                    ? 'border border-red-500/30 bg-red-500/20 text-red-400'
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
            placeholder="Describe el gasto..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all duration-300 placeholder:text-gray-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
          />
        </motion.div>

        {/* Warning */}
        <AnimatePresence>
          {!hasEnoughCapital && (watchedValues.monto || 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"
            >
              <p className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Capital insuficiente. Disponible: {formatCurrency(capitalDisponible)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <IOSButton variant="gray" onClick={onClose}>
            Cancelar
          </IOSButton>
          <IOSButton
            type="submit"
            variant="destructive"
            loading={isPending}
            disabled={!hasEnoughCapital || !watchedValues.bancoId}
            icon={Minus}
          >
            Registrar Gasto
          </IOSButton>
        </div>
      </form>
    </IOSModal>
  )
}
