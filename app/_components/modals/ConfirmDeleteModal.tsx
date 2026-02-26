'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — CONFIRM DELETE MODAL iOS PREMIUM
 * Modal de confirmación para acciones destructivas con diseño iOS
 * Con validación de seguridad y warnings personalizados
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { iOSModal as Modal } from '../ui/iOSModalSystem'
import { QuantumButton } from '../ui/QuantumElevatedUI'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  message?: string
  itemName?: string
  warningMessage?: string
  requireConfirmation?: boolean
  confirmText?: string
  isDestructive?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Eliminación',
  message = '¿Estás seguro de que deseas eliminar este elemento?',
  itemName,
  warningMessage,
  requireConfirmation = false,
  confirmText = 'ELIMINAR',
  isDestructive = true,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')

  const handleConfirm = async () => {
    if (requireConfirmation && confirmationInput !== confirmText) {
      return
    }

    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      logger.error('Error al eliminar', error, { context: 'ConfirmDeleteModal' })
    } finally {
      setIsDeleting(false)
      setConfirmationInput('')
    }
  }

  const handleClose = () => {
    setConfirmationInput('')
    onClose()
  }

  const isConfirmEnabled = !requireConfirmation || confirmationInput === confirmText

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm" showCloseButton={false}>
      <div className="p-6">
        {/* Icon Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-600/10">
              {isDestructive ? (
                <Trash2 className="h-8 w-8 text-red-400" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-amber-400" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="mb-2 text-center text-2xl font-bold text-white">{title}</h2>

        {/* Item Name */}
        {itemName && (
          <p className="mb-4 text-center text-white/60">
            <span className="font-semibold text-white">{itemName}</span>
          </p>
        )}

        {/* Message */}
        <p className="mb-4 text-center text-white/60">{message}</p>

        {/* Warning Message */}
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200/90">{warningMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Confirmation Input */}
        {requireConfirmation && (
          <div className="mb-6">
            <label className="mb-2 block text-sm text-white/60">
              Escribe <span className="font-mono font-bold text-white">{confirmText}</span> para
              confirmar
            </label>
            <div className="relative">
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-spring focus:border-red-500/50 focus:bg-red-500/5 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                placeholder={confirmText}
                autoFocus
                style={{
                  boxShadow:
                    confirmationInput === confirmText
                      ? '0 0 20px rgba(0, 255, 135, 0.2), inset 0 0 10px rgba(0, 255, 135, 0.1)'
                      : undefined,
                }}
              />
              {/* Validation indicator */}
              <motion.div
                className="absolute top-1/2 right-3 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: confirmationInput === confirmText ? 1 : 0,
                  opacity: confirmationInput === confirmText ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <motion.button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>
          <QuantumButton
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || isDeleting}
            loading={isDeleting}
            variant="danger"
            className="flex-1"
          >
            {isDeleting ? 'Eliminando...' : isDestructive ? 'Eliminar' : 'Confirmar'}
          </QuantumButton>
        </div>
      </div>
    </Modal>
  )
}
