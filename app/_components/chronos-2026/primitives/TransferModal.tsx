/**
 * 💸 TRANSFER MODAL COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * Modal premium para transferencias entre bóvedas
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowRightLeft, Check, Loader2, Vault, X } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  bancos: Array<{
    id: string
    nombre: string
    capital: number
    color: string
  }>
  selectedBancoId?: string
  onTransfer: (fromId: string, toId: string, amount: number, concepto?: string) => Promise<boolean>
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFER MODAL
// ═══════════════════════════════════════════════════════════════════════════

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  bancos,
  selectedBancoId,
  onTransfer,
  className,
}) => {
  const [fromId, setFromId] = useState<string>(selectedBancoId || '')
  const [toId, setToId] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [concepto, setConcepto] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedBancoId) {
      setFromId(selectedBancoId)
    }
  }, [selectedBancoId])

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setAmount(0)
        setConcepto('')
        setIsSuccess(false)
        setError(null)
      }, 300)
    }
  }, [isOpen])

  const fromBanco = useMemo(() => bancos.find((b) => b.id === fromId), [bancos, fromId])

  const toBanco = useMemo(() => bancos.find((b) => b.id === toId), [bancos, toId])

  const availableToBancos = useMemo(() => bancos.filter((b) => b.id !== fromId), [bancos, fromId])

  const isValid = useMemo(() => {
    return fromId && toId && amount > 0 && fromBanco && amount <= fromBanco.capital
  }, [fromId, toId, amount, fromBanco])

  const handleTransfer = async () => {
    if (!isValid) return

    setIsLoading(true)
    setError(null)

    try {
      const success = await onTransfer(fromId, toId, amount, concepto || undefined)

      if (success) {
        setIsSuccess(true)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError('Error al realizar la transferencia')
      }
    } catch (err) {
      setError('Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const quickAmounts = [1000, 5000, 10000, 50000]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={cn(
              'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
              'w-full max-w-md',
              className,
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <ArrowRightLeft className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Transferir Fondos</h2>
                    <p className="text-xs text-white/50">Entre bóvedas</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>

              {/* Content */}
              {isSuccess ? (
                <motion.div
                  className="flex flex-col items-center p-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                  >
                    <Check className="h-10 w-10 text-emerald-400" />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-bold text-white">¡Transferencia Exitosa!</h3>
                  <p className="text-center text-white/60">
                    ${amount.toLocaleString()} transferidos de {fromBanco?.nombre} a{' '}
                    {toBanco?.nombre}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-5 p-5">
                  {/* From / To Selection */}
                  <div className="flex items-center gap-4">
                    {/* From */}
                    <div className="flex-1">
                      <label className="mb-2 block text-xs text-white/50">Desde</label>
                      <select
                        value={fromId}
                        onChange={(e) => setFromId(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-colors focus:border-white/30 focus:outline-none"
                      >
                        <option value="" className="bg-slate-900">
                          Seleccionar...
                        </option>
                        {bancos.map((banco) => (
                          <option key={banco.id} value={banco.id} className="bg-slate-900">
                            {banco.nombre} (${(banco.capital / 1000).toFixed(0)}K)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Arrow */}
                    <div className="pt-6">
                      <ArrowRight className="h-5 w-5 text-white/40" />
                    </div>

                    {/* To */}
                    <div className="flex-1">
                      <label className="mb-2 block text-xs text-white/50">Hacia</label>
                      <select
                        value={toId}
                        onChange={(e) => setToId(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-colors focus:border-white/30 focus:outline-none"
                      >
                        <option value="" className="bg-slate-900">
                          Seleccionar...
                        </option>
                        {availableToBancos.map((banco) => (
                          <option key={banco.id} value={banco.id} className="bg-slate-900">
                            {banco.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Visual Preview */}
                  {fromBanco && toBanco && (
                    <div className="flex items-center justify-center gap-4 py-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: fromBanco.color + '30' }}
                        >
                          <Vault className="h-6 w-6" style={{ color: fromBanco.color }} />
                        </div>
                        <span className="mt-2 text-xs text-white/70">{fromBanco.nombre}</span>
                      </div>

                      <motion.div
                        animate={{ x: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-6 w-6 text-indigo-400" />
                      </motion.div>

                      <div className="flex flex-col items-center">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: toBanco.color + '30' }}
                        >
                          <Vault className="h-6 w-6" style={{ color: toBanco.color }} />
                        </div>
                        <span className="mt-2 text-xs text-white/70">{toBanco.nombre}</span>
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  <div>
                    <label className="mb-2 block text-xs text-white/50">Monto</label>
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white transition-colors focus:border-white/30 focus:outline-none"
                    />

                    {/* Quick amounts */}
                    <div className="mt-3 flex gap-2">
                      {quickAmounts.map((qa) => (
                        <button
                          key={qa}
                          onClick={() => setAmount(qa)}
                          className="flex-1 rounded-lg bg-white/5 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          ${(qa / 1000).toFixed(0)}K
                        </button>
                      ))}
                    </div>

                    {/* Available balance */}
                    {fromBanco && (
                      <p className="mt-2 text-xs text-white/40">
                        Disponible: ${fromBanco.capital.toLocaleString()}
                        {amount > fromBanco.capital && (
                          <span className="ml-2 text-red-400">• Fondos insuficientes</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Concepto */}
                  <div>
                    <label className="mb-2 block text-xs text-white/50">Concepto (opcional)</label>
                    <input
                      type="text"
                      value={concepto}
                      onChange={(e) => setConcepto(e.target.value)}
                      placeholder="Ej: Rebalanceo de capital"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-colors focus:border-white/30 focus:outline-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Footer */}
              {!isSuccess && (
                <div className="flex gap-3 border-t border-white/10 p-5">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!isValid || isLoading}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all',
                      isValid &&
                        'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90',
                      !isValid && 'cursor-not-allowed bg-white/10 text-white/40',
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="h-4 w-4" />
                        Transferir
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TransferModal
