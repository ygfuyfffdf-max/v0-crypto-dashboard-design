'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL ABONO CLIENTE iOS PREMIUM
// Cobrar deuda de cliente con diseño iOS glassmorphism
// ═══════════════════════════════════════════════════════════════════════════

import { formatCurrency } from '@/app/_lib/utils/formatters'
import { logger } from '@/app/lib/utils/logger'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { ArrowDown, Loader2, Sparkles, User } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { iOSModal, iOSButton, iOSGlassCard, iOSInput, iOSSelect, iOSProgress } from '../ui/ios'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const AbonoClienteSchema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente'),
  monto: z.number().positive('Monto debe ser positivo'),
  concepto: z.string().optional(),
})

type AbonoClienteFormData = z.infer<typeof AbonoClienteSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface AbonoClienteModalProps {
  isOpen: boolean
  onClose: () => void
  clientePreseleccionado?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function AbonoClienteModal({
  isOpen,
  onClose,
  clientePreseleccionado,
}: AbonoClienteModalProps) {
  const [isPending, startTransition] = useTransition()

  // ═══════════════════════════════════════════════════════════════════════
  // CARGAR CLIENTES DESDE API (no Zustand)
  // ═══════════════════════════════════════════════════════════════════════
  const [clientesAPI, setClientesAPI] = useState<
    Array<{
      id: string
      nombre: string
      telefono?: string
      email?: string
      saldoPendiente?: number
      deudaTotal?: number
    }>
  >([])

  // ═══════════════════════════════════════════════════════════════════════
  // CARGAR VENTAS PENDIENTES DESDE API (no Zustand)
  // ═══════════════════════════════════════════════════════════════════════
  const [ventasAPI, setVentasAPI] = useState<
    Array<{
      id: string
      clienteId: string
      precioTotalVenta: number
      montoPagado: number
      montoRestante: number
      estadoPago: string
      fecha: string
    }>
  >([])
  const [loadingVentas, setLoadingVentas] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetch('/api/clientes')
        .then((r) => r.json())
        .then((response) => {
          const data = Array.isArray(response) ? response : (response.data || [])
          setClientesAPI(Array.isArray(data) ? data : [])
          logger.info('Clientes cargados desde API', {
            context: 'AbonoClienteModal',
            count: Array.isArray(data) ? data.length : 0,
          })
        })
        .catch((err) => {
          logger.error('Error cargando clientes', err, { context: 'AbonoClienteModal' })
          setClientesAPI([])
        })
    }
  }, [isOpen])

  // Cargar ventas cuando cambia el cliente seleccionado
  const cargarVentasCliente = useCallback(async (clienteId: string) => {
    if (!clienteId) {
      setVentasAPI([])
      return
    }
    setLoadingVentas(true)
    try {
      const res = await fetch('/api/ventas')
      const data = await res.json()
      const ventasCliente = (Array.isArray(data) ? data : data.data || [])
        .filter(
          (v: { clienteId: string; estadoPago: string }) =>
            v.clienteId === clienteId &&
            (v.estadoPago === 'pendiente' || v.estadoPago === 'parcial'),
        )
        .sort(
          (a: { fecha: string }, b: { fecha: string }) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        )
      setVentasAPI(ventasCliente)
      logger.info('Ventas pendientes cargadas desde API', {
        context: 'AbonoClienteModal',
        count: ventasCliente.length,
      })
    } catch (err) {
      logger.error('Error cargando ventas', err as Error, { context: 'AbonoClienteModal' })
    } finally {
      setLoadingVentas(false)
    }
  }, [])

  // Solo clientes con deuda desde API
  const clientesConDeuda = useMemo(
    () => clientesAPI.filter((c) => (c.saldoPendiente || c.deudaTotal || 0) > 0),
    [clientesAPI],
  )

  const form = useForm<AbonoClienteFormData>({
    resolver: zodResolver(AbonoClienteSchema),
    defaultValues: {
      clienteId: clientePreseleccionado || '',
      monto: 0,
      concepto: 'Abono a cuenta',
    },
  })

  const watchedValues = form.watch()
  const clienteSeleccionado = clientesAPI.find((c) => c.id === watchedValues.clienteId)
  const deudaCliente = clienteSeleccionado?.saldoPendiente || clienteSeleccionado?.deudaTotal || 0
  const montoValido = (watchedValues.monto || 0) <= deudaCliente

  // Cargar ventas cuando cambia el cliente
  useEffect(() => {
    cargarVentasCliente(watchedValues.clienteId)
  }, [watchedValues.clienteId, cargarVentasCliente])

  // Ventas pendientes del cliente (ahora desde API)
  const ventasPendientes = ventasAPI

  const handleSaldarCompleto = () => {
    if (deudaCliente > 0) {
      form.setValue('monto', deudaCliente)
    }
  }

  const handleReset = () => {
    form.reset({
      clienteId: clientePreseleccionado || '',
      monto: 0,
      concepto: 'Abono a cuenta',
    })
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIÓN PRE-SUBMIT: Asegurar datos válidos antes de enviar
    // ═══════════════════════════════════════════════════════════════════

    if (!data.clienteId) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un cliente',
      })
      return
    }

    if (!data.monto || data.monto <= 0) {
      toast.error('Error de validación', {
        description: 'El monto debe ser mayor a 0',
      })
      return
    }

    if (!montoValido) {
      toast.error('El monto excede la deuda del cliente')
      return
    }

    if (ventasPendientes.length === 0) {
      toast.error('Error de validación', {
        description: 'El cliente no tiene ventas pendientes de cobro',
      })
      return
    }

    logger.info('🚀 Iniciando cobro a cliente', {
      context: 'AbonoClienteModal',
      data: {
        clienteId: data.clienteId,
        clienteNombre: clienteSeleccionado?.nombre,
        monto: data.monto,
        ventasPendientes: ventasPendientes.length,
        deudaTotal: deudaCliente,
      },
    })

    startTransition(async () => {
      try {
        // ═══════════════════════════════════════════════════════════════════
        // PERSISTIR EN API - Aplicar abono a ventas pendientes (FIFO)
        // ═══════════════════════════════════════════════════════════════════
        let montoRestante = data.monto

        for (const venta of ventasPendientes) {
          if (montoRestante <= 0) break

          const deudaVenta = venta.montoRestante || venta.precioTotalVenta - venta.montoPagado || 0
          const abonoVenta = Math.min(montoRestante, deudaVenta)

          if (abonoVenta > 0) {
            // ═══════════════════════════════════════════════════════════════
            // LLAMAR API para cada venta (distribución GYA automática)
            // ═══════════════════════════════════════════════════════════════
            const response = await fetch('/api/abonos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clienteId: data.clienteId,
                monto: abonoVenta,
                ventaId: venta.id,
                fecha: new Date().toISOString(),
                notas: data.concepto || 'Abono a cuenta',
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Error al registrar abono en BD')
            }

            montoRestante -= abonoVenta
          }
        }

        toast.success('Abono registrado', {
          description: `${formatCurrency(data.monto)} cobrado de ${clienteSeleccionado?.nombre}`,
        })

        logger.info('Abono cliente registrado', {
          context: 'AbonoClienteModal',
          data: { clienteId: data.clienteId, monto: data.monto },
        })

        handleReset()
        onClose()
      } catch (error) {
        logger.error('Error registrando abono cliente', error as Error, {
          context: 'AbonoClienteModal',
        })
        toast.error('Error al registrar abono', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cobrar a Cliente"
      subtitle="Registra abono de deuda"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cliente */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Seleccionar Cliente</label>
          <select
            {...form.register('clienteId')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-green-500"
          >
            <option value="">Seleccionar cliente con deuda...</option>
            {clientesConDeuda.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} — Deuda: {formatCurrency(c.saldoPendiente || c.deudaTotal || 0)}
              </option>
            ))}
          </select>
        </div>

        {/* Info Cliente */}
        {clienteSeleccionado && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">{clienteSeleccionado.nombre}</p>
                <p className="text-xs text-gray-400">
                  {clienteSeleccionado.telefono || clienteSeleccionado.email || 'Sin contacto'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-2">
                <p className="text-xs text-gray-400">Deuda Total</p>
                <p className="font-bold text-red-400">{formatCurrency(deudaCliente)}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <p className="text-xs text-gray-400">Ventas Pendientes</p>
                {loadingVentas ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <p className="font-medium text-white">{ventasPendientes.length}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Monto */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Monto a Cobrar</label>
          <input
            type="number"
            {...form.register('monto', { valueAsNumber: true })}
            min={0}
            max={deudaCliente}
            step="0.01"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white focus:border-green-500"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => form.setValue('monto', deudaCliente * 0.25)}
              className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => form.setValue('monto', deudaCliente * 0.5)}
              className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              50%
            </button>
            <button
              type="button"
              onClick={handleSaldarCompleto}
              className="flex-1 rounded-lg bg-green-500/20 py-1.5 text-xs text-green-400 hover:bg-green-500/30"
            >
              Saldar Todo
            </button>
          </div>
        </div>

        {/* Concepto */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Concepto (opcional)</label>
          <input
            {...form.register('concepto')}
            placeholder="Abono a cuenta..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500"
          />
        </div>

        {/* Warning */}
        {!montoValido && (watchedValues.monto || 0) > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">
              ⚠️ El monto excede la deuda. Máximo: {formatCurrency(deudaCliente)}
            </p>
          </div>
        )}

        {/* Preview distribución */}
        {(watchedValues.monto || 0) > 0 && montoValido && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-green-500/20 bg-green-500/10 p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Distribución automática GYA
              </span>
            </div>
            <p className="text-xs text-gray-400">
              El abono se distribuirá proporcionalmente a los 3 bancos según las ventas originales
            </p>
          </motion.div>
        )}

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={!watchedValues.clienteId || !montoValido || (watchedValues.monto || 0) <= 0}
            icon={<ArrowDown className="h-4 w-4" />}
          >
            Cobrar Abono
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
