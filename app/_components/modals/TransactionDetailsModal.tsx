'use client'

import { UltraFormModal } from '@/app/_components/ui/ios'
import { StatusPill, UserAvatar } from '@/app/_components/ui/ios/iOSVisualComponents'
import { formatMoney, formatDate } from '@/app/_lib/utils/formatters'
import { CheckCircle2, Circle, Clock, ArrowRight, DollarSign, FileText, Building2, User } from 'lucide-react'
import { useMemo } from 'react'

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: any // Typing could be improved with a union of Venta | Orden | Movimiento
  type: 'venta' | 'compra' | 'movimiento'
}

export function TransactionDetailsModal({ isOpen, onClose, transaction, type }: TransactionDetailsModalProps) {
  if (!transaction) return null

  const steps = useMemo(() => {
    // Logic to determine timeline steps based on transaction state
    const baseSteps = [
      { label: 'Solicitud Creada', date: transaction.fecha, completed: true },
      { label: 'Procesado por Sistema', date: transaction.fecha, completed: true },
    ]

    if (type === 'venta') {
      const isPaid = transaction.estadoPago === 'completo'
      return [
        ...baseSteps,
        { label: 'Validación de Inventario', date: transaction.fecha, completed: true },
        { label: 'Pago Recibido', date: isPaid ? transaction.fecha : null, completed: isPaid, pending: !isPaid },
        { label: 'Entregado al Cliente', date: null, completed: false, pending: true } // Mock logic
      ]
    }
    
    if (type === 'compra') {
      const isReceived = transaction.estado === 'completada'
      return [
        ...baseSteps,
        { label: 'Autorización de Compra', date: transaction.fecha, completed: true },
        { label: 'Pago a Proveedor', date: transaction.fecha, completed: true },
        { label: 'Recepción de Mercancía', date: isReceived ? transaction.fecha : null, completed: isReceived, pending: !isReceived }
      ]
    }

    return baseSteps
  }, [transaction, type])

  return (
    <UltraFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Transacción"
      subtitle={`ID: ${transaction.id?.slice(0, 8).toUpperCase()}`}
      hideFooter
    >
      <div className="space-y-8 py-2">
        {/* Header Amount */}
        <div className="text-center space-y-1">
          <p className="text-sm text-white/50 uppercase tracking-wider">Monto Total</p>
          <div className="text-4xl font-bold text-white tracking-tight">
            {formatMoney(transaction.precioTotalVenta || transaction.total || transaction.monto || 0)}
          </div>
          <div className="flex justify-center mt-2">
            <StatusPill 
              label={transaction.estadoPago || transaction.estado || transaction.tipo || 'Completado'} 
              variant={
                (transaction.estadoPago === 'completo' || transaction.estado === 'completada' || transaction.tipo === 'ingreso') 
                ? 'success' 
                : 'warning'
              }
              pulsing={transaction.estadoPago === 'pendiente' || transaction.estado === 'pendiente'}
            />
          </div>
        </div>

        {/* Entity Card */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10">
            {type === 'venta' ? <User className="text-violet-400" /> : <Building2 className="text-fuchsia-400" />}
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase">
              {type === 'venta' ? 'Cliente' : type === 'compra' ? 'Proveedor' : 'Entidad'}
            </p>
            <p className="text-lg font-medium text-white">
              {transaction.clienteNombre || transaction.distribuidorNombre || 'Entidad General'}
            </p>
            {(transaction.clienteEmail || transaction.distribuidorEmail) && (
              <p className="text-sm text-white/50">{transaction.clienteEmail || transaction.distribuidorEmail}</p>
            )}
          </div>
        </div>

        {/* Traceability Timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <Clock size={14} /> Trazabilidad de Operación
          </h3>
          <div className="relative pl-4 border-l border-white/10 space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${step.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-black border-white/30'}`} />
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm font-medium ${step.completed ? 'text-white' : 'text-white/40'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-white/30 mt-0.5">
                        {formatDate(new Date(step.date))}
                      </p>
                    )}
                  </div>
                  {step.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-white/40 mb-1">Método de Pago</p>
            <p className="text-sm text-white flex items-center gap-2">
              <DollarSign size={14} className="text-white/50" />
              Transferencia SPEI
            </p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Factura / Recibo</p>
            <p className="text-sm text-white flex items-center gap-2">
              <FileText size={14} className="text-white/50" />
              #FAC-{Math.floor(Math.random() * 10000)}
            </p>
          </div>
        </div>
      </div>
    </UltraFormModal>
  )
}
