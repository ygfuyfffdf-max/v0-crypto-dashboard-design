'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL TRANSFERENCIA iOS PREMIUM
// Transferencia entre bancos con diseño iOS glassmorphism avanzado
// ═══════════════════════════════════════════════════════════════════════════

import { transferirEntreBancos } from '@/app/_actions/bancos'
import { BANCOS_ORDENADOS } from '@/app/_lib/constants/bancos'
import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import type { BancoId } from '@/app/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, ArrowRightLeft, Check, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { iOSModal as IOSModal, iOSButton as IOSButton, iOSGlassCard, iOSInput } from '../ui/ios'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const TransferenciaSchema = z
  .object({
    bancoOrigenId: z.string().min(1, 'Selecciona banco origen'),
    bancoDestinoId: z.string().min(1, 'Selecciona banco destino'),
    monto: z.number().positive('Monto debe ser positivo'),
    concepto: z.string().min(1, 'Concepto requerido'),
  })
  .refine((data) => data.bancoOrigenId !== data.bancoDestinoId, {
    message: 'Origen y destino deben ser diferentes',
    path: ['bancoDestinoId'],
  })

type TransferenciaFormData = z.infer<typeof TransferenciaSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface TransferenciaModalProps {
  isOpen: boolean
  onClose: () => void
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function TransferenciaModal({ isOpen, onClose }: TransferenciaModalProps) {
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)

  // Zustand store
  const { bancos, transferir } = useChronosStore()

  const form = useForm<TransferenciaFormData>({
    resolver: zodResolver(TransferenciaSchema),
    defaultValues: {
      bancoOrigenId: '',
      bancoDestinoId: '',
      monto: 0,
      concepto: 'Transferencia entre cuentas',
    },
  })

  const watchedValues = form.watch()
  const bancoOrigen = bancos[watchedValues.bancoOrigenId as BancoId]
  const bancoDestino = bancos[watchedValues.bancoDestinoId as BancoId]
  const capitalDisponible = bancoOrigen?.capitalActual || 0
  const hasEnoughCapital = capitalDisponible >= (watchedValues.monto || 0)

  const handleReset = () => {
    form.reset()
    setShowSuccess(false)
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIÓN PRE-SUBMIT: Asegurar datos válidos antes de enviar
    // ═══════════════════════════════════════════════════════════════════

    if (!data.bancoOrigenId) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un banco origen',
      })
      return
    }

    if (!data.bancoDestinoId) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un banco destino',
      })
      return
    }

    if (data.bancoOrigenId === data.bancoDestinoId) {
      toast.error('Error de validación', {
        description: 'Los bancos de origen y destino deben ser diferentes',
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
        description: 'Debe ingresar un concepto para la transferencia',
      })
      return
    }

    if (!hasEnoughCapital) {
      toast.error('Capital insuficiente en banco origen', {
        description: `Disponible: ${formatCurrency(capitalDisponible)}`,
      })
      return
    }

    logger.info('🚀 Iniciando transferencia entre bancos', {
      context: 'TransferenciaModal',
      data: {
        bancoOrigen: data.bancoOrigenId,
        bancoDestino: data.bancoDestinoId,
        monto: data.monto,
        concepto: data.concepto,
        capitalDisponible,
      },
    })

    startTransition(async () => {
      try {
        // ═══════════════════════════════════════════════════════════════════
        // SERVER ACTION - Transferencia entre bancos
        // ═══════════════════════════════════════════════════════════════════
        const result = await transferirEntreBancos({
          bancoOrigenId: data.bancoOrigenId,
          bancoDestinoId: data.bancoDestinoId,
          monto: data.monto,
          concepto: data.concepto,
        })

        if (!result.success) {
          throw new Error(result.error)
        }

        setShowSuccess(true)
        setTimeout(() => {
          toast.success('Transferencia completada', {
            description: `${formatCurrency(data.monto)} transferido exitosamente`,
          })
          handleReset()
          onClose()
        }, 1500)
      } catch (error) {
        logger.error('Error en transferencia', error, {
          context: 'TransferenciaModal',
          datos: {
            bancoOrigen: data.bancoOrigenId,
            bancoDestino: data.bancoDestinoId,
            monto: data.monto,
          },
        })
        toast.error('Error en transferencia', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <IOSModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferencia entre Bancos"
      subtitle="Mueve fondos entre tus cuentas"
      size="lg"
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
            >
              <Check className="h-10 w-10 text-green-400" />
            </motion.div>
            <h3 className="mb-2 text-xl font-bold text-white">¡Transferencia Exitosa!</h3>
            <p className="text-gray-400">{formatCurrency(watchedValues.monto)} transferido</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Banco Origen */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2"
            >
              <label className="flex items-center gap-2 text-sm text-gray-400">
                Banco Origen
                <Sparkles className="h-3 w-3 text-violet-500/50" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BANCOS_ORDENADOS.map((config) => {
                  const bancoId = config.id
                  const banco = bancos[bancoId]
                  const isSelected = watchedValues.bancoOrigenId === bancoId
                  const isDestino = watchedValues.bancoDestinoId === bancoId

                  return (
                    <motion.button
                      key={bancoId}
                      type="button"
                      disabled={isDestino}
                      onClick={() => form.setValue('bancoOrigenId', bancoId)}
                      className={cn(
                        'rounded-xl border p-3 text-left transition-all duration-300',
                        isSelected
                          ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                          : isDestino
                            ? 'cursor-not-allowed border-white/5 bg-white/5 opacity-50'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
                      )}
                      whileHover={!isDestino ? { scale: 1.02 } : {}}
                      whileTap={!isDestino ? { scale: 0.98 } : {}}
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

            {/* Flecha animada */}
            {watchedValues.bancoOrigenId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="rounded-full border border-violet-500/30 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-3"
                >
                  <ArrowRightLeft className="h-5 w-5 rotate-90 text-violet-400" />
                </motion.div>
              </motion.div>
            )}

            {/* Banco Destino */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-2"
            >
              <label className="text-sm text-gray-400">Banco Destino</label>
              <div className="grid grid-cols-2 gap-2">
                {BANCOS_ORDENADOS.map((config) => {
                  const bancoId = config.id
                  const banco = bancos[bancoId]
                  const isSelected = watchedValues.bancoDestinoId === bancoId
                  const isOrigen = watchedValues.bancoOrigenId === bancoId

                  return (
                    <motion.button
                      key={bancoId}
                      type="button"
                      disabled={isOrigen}
                      onClick={() => form.setValue('bancoDestinoId', bancoId)}
                      className={cn(
                        'rounded-xl border p-3 text-left transition-all duration-300',
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                          : isOrigen
                            ? 'cursor-not-allowed border-white/5 bg-white/5 opacity-50'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
                      )}
                      whileHover={!isOrigen ? { scale: 1.02 } : {}}
                      whileTap={!isOrigen ? { scale: 0.98 } : {}}
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
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-2"
            >
              <label className="text-sm text-gray-400">Monto a Transferir</label>
              <input
                type="number"
                {...form.register('monto', { valueAsNumber: true })}
                min={0}
                max={capitalDisponible}
                step="0.01"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white transition-all duration-300 focus:border-violet-500 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
              />
              {bancoOrigen && (
                <p className="text-center text-xs text-gray-500">
                  Disponible: {formatCurrency(capitalDisponible)}
                </p>
              )}
            </motion.div>

            {/* Concepto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-2"
            >
              <label className="text-sm text-gray-400">Concepto</label>
              <input
                {...form.register('concepto')}
                placeholder="Razón de la transferencia"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all duration-300 placeholder:text-gray-500 focus:border-violet-500 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
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

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.08]">
              <IOSButton variant="gray" onClick={onClose}>
                Cancelar
              </IOSButton>
              <IOSButton
                type="submit"
                variant="filled"
                loading={isPending}
                disabled={
                  !hasEnoughCapital || !watchedValues.bancoOrigenId || !watchedValues.bancoDestinoId
                }
                icon={ArrowRightLeft}
              >
                Transferir
              </IOSButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </IOSModal>
  )
}
