'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — MOVIMIENTO MODALS
 * Modales premium para gestión de movimientos bancarios
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cancelarMovimiento, getMovimientoById, updateMovimiento } from '@/app/_actions/movimientos'
import { logger } from '@/app/lib/utils/logger'
import {
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Tag,
  Trash2,
} from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Modal, ModalFooter } from '../ui/Modal'
import { QuantumButton, QuantumGlassCard, QuantumInput } from '../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovimientoData {
  id: string
  tipo: string
  monto: number
  concepto: string | null
  referencia: string | null
  observaciones: string | null
  bancoId: string
  fecha: Date | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DETALLE MOVIMIENTO MODAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DetalleMovimientoModalProps {
  open: boolean
  onClose: () => void
  movimientoId: string
  onEdit?: () => void
  onDelete?: () => void
}

export function DetalleMovimientoModal({
  open,
  onClose,
  movimientoId,
  onEdit,
  onDelete,
}: DetalleMovimientoModalProps) {
  const [movimiento, setMovimiento] = useState<MovimientoData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && movimientoId) {
      setLoading(true)
      getMovimientoById(movimientoId)
        .then((result) => {
          if (result.success && result.data) {
            setMovimiento(result.data as unknown as MovimientoData)
          }
        })
        .catch((error) => {
          logger.error('Error al cargar movimiento', error, { context: 'DetalleMovimientoModal' })
        })
        .finally(() => setLoading(false))
    }
  }, [open, movimientoId])

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(monto)
  }

  const formatFecha = (fecha: Date | null) => {
    if (!fecha) return 'Sin fecha'
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(fecha))
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Detalle del Movimiento"
      subtitle="Información completa del movimiento"
      size="md"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500" />
        </div>
      ) : movimiento ? (
        <div className="space-y-4">
          <QuantumGlassCard className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <Tag className="h-5 w-5 text-violet-400" />
              <span className="text-sm text-gray-400">Tipo</span>
            </div>
            <p className="font-medium text-white capitalize">{movimiento.tipo}</p>
          </QuantumGlassCard>

          <QuantumGlassCard className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-violet-400" />
              <span className="text-sm text-gray-400">Monto</span>
            </div>
            <p
              className={`text-2xl font-bold ${movimiento.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {movimiento.tipo === 'ingreso' ? '+' : '-'}
              {formatMonto(movimiento.monto)}
            </p>
          </QuantumGlassCard>

          <QuantumGlassCard className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <FileText className="h-5 w-5 text-violet-400" />
              <span className="text-sm text-gray-400">Concepto</span>
            </div>
            <p className="text-white">{movimiento.concepto || 'Sin concepto'}</p>
          </QuantumGlassCard>

          {movimiento.referencia && (
            <QuantumGlassCard className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <FileText className="h-5 w-5 text-violet-400" />
                <span className="text-sm text-gray-400">Referencia</span>
              </div>
              <p className="text-white">{movimiento.referencia}</p>
            </QuantumGlassCard>
          )}

          <div className="grid grid-cols-2 gap-4">
            <QuantumGlassCard className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-violet-400" />
                <span className="text-sm text-gray-400">Fecha</span>
              </div>
              <p className="text-sm text-white">{formatFecha(movimiento.fecha)}</p>
            </QuantumGlassCard>

            <QuantumGlassCard className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <Building2 className="h-5 w-5 text-violet-400" />
                <span className="text-sm text-gray-400">Banco</span>
              </div>
              <p className="text-sm text-white">{movimiento.bancoId}</p>
            </QuantumGlassCard>
          </div>
        </div>
      ) : (
        <p className="py-4 text-center text-gray-400">Movimiento no encontrado</p>
      )}

      <ModalFooter>
        <div className="flex w-full justify-end gap-3">
          {onEdit && (
            <QuantumButton variant="secondary" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </QuantumButton>
          )}
          {onDelete && (
            <QuantumButton variant="danger" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Cancelar
            </QuantumButton>
          )}
          <QuantumButton variant="ghost" onClick={onClose}>
            Cerrar
          </QuantumButton>
        </div>
      </ModalFooter>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EDITAR MOVIMIENTO MODAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EditarMovimientoModalProps {
  open: boolean
  onClose: () => void
  movimientoId: string
  onSuccess?: () => void
}

export function EditarMovimientoModal({
  open,
  onClose,
  movimientoId,
  onSuccess,
}: EditarMovimientoModalProps) {
  const [movimiento, setMovimiento] = useState<MovimientoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [concepto, setConcepto] = useState('')
  const [referencia, setReferencia] = useState('')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (open && movimientoId) {
      setLoading(true)
      getMovimientoById(movimientoId)
        .then((result) => {
          if (result.success && result.data) {
            const data = result.data as unknown as MovimientoData
            setMovimiento(data)
            setConcepto(data.concepto || '')
            setReferencia(data.referencia || '')
            setObservaciones(data.observaciones || '')
          }
        })
        .catch((error) => {
          logger.error('Error al cargar movimiento', error, { context: 'EditarMovimientoModal' })
        })
        .finally(() => setLoading(false))
    }
  }, [open, movimientoId])

  const handleSave = async () => {
    if (!movimiento) return

    setSaving(true)
    try {
      const result = await updateMovimiento({
        id: movimientoId,
        concepto,
        referencia,
        observaciones,
      })

      if (result.success) {
        toast.success('Movimiento actualizado')
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Error al actualizar')
      }
    } catch (error) {
      logger.error('Error al guardar movimiento', error, { context: 'EditarMovimientoModal' })
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange =
    (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
    }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Editar Movimiento"
      subtitle="Modifica los datos del movimiento"
      size="md"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500" />
        </div>
      ) : movimiento ? (
        <div className="space-y-4">
          <QuantumInput
            label="Concepto"
            value={concepto}
            onChange={handleInputChange(setConcepto)}
            placeholder="Descripción del movimiento"
            icon={<FileText className="h-4 w-4" />}
          />
          <QuantumInput
            label="Referencia"
            value={referencia}
            onChange={handleInputChange(setReferencia)}
            placeholder="Número de referencia (opcional)"
            icon={<Tag className="h-4 w-4" />}
          />
          <QuantumInput
            label="Observaciones"
            value={observaciones}
            onChange={handleInputChange(setObservaciones)}
            placeholder="Notas adicionales (opcional)"
            icon={<FileText className="h-4 w-4" />}
          />
        </div>
      ) : (
        <p className="py-4 text-center text-gray-400">Movimiento no encontrado</p>
      )}

      <ModalFooter>
        <div className="flex w-full justify-end gap-3">
          <QuantumButton variant="ghost" onClick={onClose}>
            Cancelar
          </QuantumButton>
          <QuantumButton variant="primary" onClick={handleSave} disabled={saving || !movimiento}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </QuantumButton>
        </div>
      </ModalFooter>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ELIMINAR MOVIMIENTO MODAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EliminarMovimientoModalProps {
  open: boolean
  onClose: () => void
  movimientoId: string
  onSuccess?: () => void
}

export function EliminarMovimientoModal({
  open,
  onClose,
  movimientoId,
  onSuccess,
}: EliminarMovimientoModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await cancelarMovimiento(movimientoId)

      if (result.success) {
        toast.success('Movimiento cancelado')
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Error al cancelar')
      }
    } catch (error) {
      logger.error('Error al cancelar movimiento', error, { context: 'EliminarMovimientoModal' })
      toast.error('Error al cancelar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Cancelar Movimiento"
      subtitle="Esta acción revertirá el efecto en el banco"
      size="sm"
      variant="danger"
    >
      <QuantumGlassCard className="border-rose-500/20 p-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-rose-500/10 p-3">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <p className="mb-1 font-medium text-white">¿Estás seguro?</p>
            <p className="text-sm text-gray-400">
              Al cancelar este movimiento se revertirá automáticamente el efecto en el balance del
              banco asociado.
            </p>
          </div>
        </div>
      </QuantumGlassCard>

      <ModalFooter>
        <div className="flex w-full justify-end gap-3">
          <QuantumButton variant="ghost" onClick={onClose}>
            No, mantener
          </QuantumButton>
          <QuantumButton variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Cancelando...' : 'Sí, cancelar movimiento'}
          </QuantumButton>
        </div>
      </ModalFooter>
    </Modal>
  )
}
