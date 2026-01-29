'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL ABONO DISTRIBUIDOR
// Pagar deuda a distribuidor desde cualquier banco
// ═══════════════════════════════════════════════════════════════════════════

import { BANCOS_CONFIG, BANCOS_ORDENADOS } from '@/app/_lib/constants/bancos'
import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import { logger } from '@/app/lib/utils/logger'
import type { BancoId } from '@/app/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { ArrowUp, Truck } from 'lucide-react'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Modal, ModalFooter } from '../ui/Modal'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const AbonoDistribuidorSchema = z.object({
  distribuidorId: z.string().min(1, 'Selecciona un distribuidor'),
  monto: z.number().positive('Monto debe ser positivo'),
  bancoOrigenId: z.string().min(1, 'Selecciona un banco'),
  concepto: z.string().optional(),
})

type AbonoDistribuidorFormData = z.infer<typeof AbonoDistribuidorSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface AbonoDistribuidorModalProps {
  isOpen: boolean
  onClose: () => void
  distribuidorPreseleccionado?: string
  ordenPreseleccionada?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function AbonoDistribuidorModal({
  isOpen,
  onClose,
  distribuidorPreseleccionado,
  ordenPreseleccionada,
}: AbonoDistribuidorModalProps) {
  const [isPending, startTransition] = useTransition()

  // Estados para datos reales de API
  const [distribuidores, setDistribuidores] = useState<any[]>([])
  const [ordenesCompra, setOrdenesCompra] = useState<any[]>([])
  const [bancosReales, setBancosReales] = useState<Record<string, any>>({})

  // Zustand store (solo para abonarOrdenCompra action)
  const { abonarOrdenCompra } = useChronosStore()

  // Fetch datos reales de APIs
  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      try {
        // Fetch distribuidores
        const distRes = await fetch('/api/distribuidores')
        const distData = await distRes.json()
        const dists = Array.isArray(distData) ? distData : (distData.data || [])
        setDistribuidores(dists)

        // Fetch ordenes compra
        const ocRes = await fetch('/api/ordenes')
        const ocData = await ocRes.json()
        const ocs = Array.isArray(ocData) ? ocData : (ocData.data || [])
        setOrdenesCompra(ocs)

        // Fetch bancos
        const bancosRes = await fetch('/api/bancos')
        const bancosData = await bancosRes.json()
        const bancosArray = Array.isArray(bancosData) ? bancosData : (bancosData.data || [])
        const bancosMap = bancosArray.reduce((acc: any, b: any) => {
          acc[b.id] = b
          return acc
        }, {})
        setBancosReales(bancosMap)
      } catch (error) {
        logger.error('Error fetching data for modal', error as Error, {
          context: 'AbonoDistribuidorModal',
        })
      }
    }

    fetchData()
  }, [isOpen])

  // Si hay una orden preseleccionada, obtener su distribuidor
  const ordenSeleccionada = ordenPreseleccionada
    ? ordenesCompra.find((oc: any) => oc.id === ordenPreseleccionada)
    : null
  const distribuidorIdInicial =
    distribuidorPreseleccionado || ordenSeleccionada?.distribuidorId || ''

  // Solo distribuidores con deuda - PRIORIZAR saldoPendiente
  const distribuidoresConDeuda = useMemo(
    () => distribuidores.filter((d: any) => (d.saldoPendiente || d.pendiente || d.deudaTotal || 0) > 0),
    [distribuidores],
  )

  const form = useForm<AbonoDistribuidorFormData>({
    resolver: zodResolver(AbonoDistribuidorSchema),
    defaultValues: {
      distribuidorId: distribuidorIdInicial,
      monto: 0,
      bancoOrigenId: 'boveda_monte',
      concepto: 'Pago a distribuidor',
    },
  })

  const watchedValues = form.watch()
  const distribuidorSeleccionado = distribuidores.find((d: any) => d.id === watchedValues.distribuidorId)
  // PRIORIZAR saldoPendiente - es el campo correcto de la BD
  const deudaDistribuidor =
    distribuidorSeleccionado?.saldoPendiente || distribuidorSeleccionado?.pendiente || distribuidorSeleccionado?.deudaTotal || 0
  const montoValido = (watchedValues.monto || 0) <= deudaDistribuidor

  // Capital del banco seleccionado - USAR DATOS REALES DE API
  const bancoOrigen = bancosReales[watchedValues.bancoOrigenId as BancoId]
  const capitalDisponible = bancoOrigen?.capitalActual || 0
  const haySuficienteCapital = capitalDisponible >= (watchedValues.monto || 0)

  // OC pendientes del distribuidor
  const ocPendientes = useMemo(
    () =>
      ordenesCompra
        .filter((oc: any) => oc.distribuidorId === watchedValues.distribuidorId && (oc.montoRestante || oc.deuda || oc.saldoPendiente || 0) > 0)
        .sort((a, b) => {
          const dateA = typeof a.fecha === 'string' ? new Date(a.fecha) : new Date()
          const dateB = typeof b.fecha === 'string' ? new Date(b.fecha) : new Date()
          return dateA.getTime() - dateB.getTime()
        }),
    [ordenesCompra, watchedValues.distribuidorId],
  )

  const handleSaldarCompleto = () => {
    if (deudaDistribuidor > 0) {
      const montoMaximo = Math.min(deudaDistribuidor, capitalDisponible)
      form.setValue('monto', montoMaximo)
    }
  }

  const handleReset = () => {
    form.reset({
      distribuidorId: distribuidorPreseleccionado || '',
      monto: 0,
      bancoOrigenId: 'boveda_monte',
      concepto: 'Pago a distribuidor',
    })
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIÓN PRE-SUBMIT: Asegurar datos válidos antes de enviar
    // ═══════════════════════════════════════════════════════════════════

    if (!data.distribuidorId) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un distribuidor',
      })
      return
    }

    if (!data.bancoOrigenId) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un banco origen',
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
      toast.error('El monto excede la deuda del distribuidor')
      return
    }

    if (!haySuficienteCapital) {
      toast.error('Capital insuficiente en el banco seleccionado')
      return
    }

    if (ocPendientes.length === 0) {
      toast.error('Error de validación', {
        description: 'El distribuidor no tiene órdenes de compra pendientes',
      })
      return
    }

    logger.info('🚀 Iniciando pago a distribuidor', {
      context: 'AbonoDistribuidorModal',
      data: {
        distribuidorId: data.distribuidorId,
        distribuidorNombre: distribuidorSeleccionado?.nombre,
        monto: data.monto,
        bancoOrigen: data.bancoOrigenId,
        capitalDisponible,
        ocPendientes: ocPendientes.length,
      },
    })

    startTransition(async () => {
      try {
        // ═══════════════════════════════════════════════════════════════════
        // PERSISTIR EN API - Aplicar pago a OC pendientes (FIFO)
        // ═══════════════════════════════════════════════════════════════════
        let montoRestante = data.monto

        for (const oc of ocPendientes) {
          if (montoRestante <= 0) break

          const deudaOC = oc.montoRestante || oc.deuda || 0
          const pagoOC = Math.min(montoRestante, deudaOC)

          if (pagoOC > 0) {
            // ═══════════════════════════════════════════════════════════════
            // LLAMAR API para cada OC (descuento del banco automático)
            // ═══════════════════════════════════════════════════════════════
            const response = await fetch('/api/pagos-distribuidor', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                distribuidorId: data.distribuidorId,
                ordenCompraId: oc.id,
                monto: pagoOC,
                bancoOrigenId: data.bancoOrigenId,
                fecha: new Date().toISOString(),
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Error al registrar pago en BD')
            }

            // Actualizar Zustand para UI inmediata
            abonarOrdenCompra(oc.id, pagoOC, data.bancoOrigenId as BancoId)
            montoRestante -= pagoOC
          }
        }

        toast.success('Pago registrado', {
          description: `${formatCurrency(data.monto)} pagado a ${distribuidorSeleccionado?.nombre}`,
        })

        logger.info('Pago distribuidor registrado', {
          context: 'AbonoDistribuidorModal',
          data: { distribuidorId: data.distribuidorId, monto: data.monto },
        })

        handleReset()
        onClose()
      } catch (error) {
        logger.error('Error registrando pago distribuidor', error as Error, {
          context: 'AbonoDistribuidorModal',
        })
        toast.error('Error al registrar pago', {
          description: error instanceof Error ? error.message : 'Intenta de nuevo',
        })
      }
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pagar a Distribuidor"
      subtitle="Registra pago de deuda"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Distribuidor */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Seleccionar Distribuidor</label>
          <select
            {...form.register('distribuidorId')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500"
          >
            <option value="">Seleccionar distribuidor con deuda...</option>
            {distribuidoresConDeuda.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} {d.empresa ? `(${d.empresa})` : ''} — Deuda:{' '}
                {formatCurrency(d.saldoPendiente || d.pendiente || d.deudaTotal || 0)}
              </option>
            ))}
          </select>
        </div>

        {/* Info Distribuidor */}
        {distribuidorSeleccionado && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                <Truck className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">{distribuidorSeleccionado.nombre}</p>
                <p className="text-xs text-gray-400">
                  {distribuidorSeleccionado.empresa ||
                    distribuidorSeleccionado.contacto ||
                    'Sin empresa'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-2">
                <p className="text-xs text-gray-400">Deuda Total</p>
                <p className="font-bold text-red-400">{formatCurrency(deudaDistribuidor)}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <p className="text-xs text-gray-400">OC Pendientes</p>
                <p className="font-medium text-white">{ocPendientes.length}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Banco Origen */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Pagar desde Banco</label>
          <div className="grid grid-cols-2 gap-2">
            {BANCOS_ORDENADOS.map((config) => {
              const bancoId = config.id
              const banco = bancosReales[bancoId] // USAR bancosReales en lugar de bancos
              const isSelected = watchedValues.bancoOrigenId === bancoId

              return (
                <button
                  key={bancoId}
                  type="button"
                  onClick={() => form.setValue('bancoOrigenId', bancoId)}
                  className={cn(
                    'rounded-xl border p-2 text-left transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{config.icono}</span>
                    <span className="text-xs font-medium text-white">{config.nombre}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatCurrency(banco?.capitalActual || 0)}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Monto */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Monto a Pagar</label>
          <input
            type="number"
            {...form.register('monto', { valueAsNumber: true })}
            min={0}
            max={Math.min(deudaDistribuidor, capitalDisponible)}
            step="0.01"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold text-white focus:border-blue-500"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                form.setValue('monto', Math.min(deudaDistribuidor * 0.25, capitalDisponible))
              }
              className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() =>
                form.setValue('monto', Math.min(deudaDistribuidor * 0.5, capitalDisponible))
              }
              className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              50%
            </button>
            <button
              type="button"
              onClick={handleSaldarCompleto}
              className="flex-1 rounded-lg bg-blue-500/20 py-1.5 text-xs text-blue-400 hover:bg-blue-500/30"
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
            placeholder="Pago a distribuidor..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>

        {/* Warnings */}
        {!montoValido && (watchedValues.monto || 0) > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">
              ⚠️ El monto excede la deuda. Máximo: {formatCurrency(deudaDistribuidor)}
            </p>
          </div>
        )}

        {!haySuficienteCapital && (watchedValues.monto || 0) > 0 && montoValido && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
            <p className="text-sm text-yellow-400">
              ⚠️ Capital insuficiente en{' '}
              {BANCOS_CONFIG[watchedValues.bancoOrigenId as BancoId]?.nombre}. Disponible:{' '}
              {formatCurrency(capitalDisponible)}
            </p>
          </div>
        )}

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={
              !watchedValues.distribuidorId ||
              !montoValido ||
              !haySuficienteCapital ||
              (watchedValues.monto || 0) <= 0 ||
              ocPendientes.length === 0
            }
            icon={<ArrowUp className="h-4 w-4" />}
          >
            Realizar Pago
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
