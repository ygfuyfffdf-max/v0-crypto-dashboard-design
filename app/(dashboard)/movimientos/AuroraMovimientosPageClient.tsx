/**
 * 💸 AURORA MOVIMIENTOS PAGE CLIENT - CHRONOS 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Cliente de página que conecta AuroraMovimientosPanel con FormModal integrado
 * Incluye modal de nuevo movimiento con estilo premium
 *
 * FLUJO DE PAGO A DISTRIBUIDOR:
 * 1. Usuario selecciona categoría "Pago a Distribuidor"
 * 2. Se muestra lista de distribuidores con deuda
 * 3. Al seleccionar distribuidor, se muestran sus órdenes pendientes
 * 4. El pago se registra y actualiza la orden de compra
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
    FormModal,
    GlassInput,
    GlassMoneyInput,
    GlassSelect,
    GlassTextarea,
} from '@/app/_components/chronos-2026/forms/PremiumForms'
import { AuroraMovimientosPanel } from '@/app/_components/chronos-2026/panels/AuroraMovimientosPanel'
import { AuroraButton } from '@/app/_components/ui/AuroraGlassSystem'
import { useDistribuidores } from '@/app/_hooks/useDistribuidores'
import { useMovimientos } from '@/app/_hooks/useMovimientos'
import { useOrdenes } from '@/app/_hooks/useOrdenes'
import { logger } from '@/app/lib/utils/logger'
import { AnimatePresence, motion } from 'motion/react'
import {
    AlertCircle,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Loader2,
    Package,
    Truck,
    Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

const movimientoSchema = z.object({
  tipo: z.enum(['ingreso', 'gasto', 'transferencia']),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  concepto: z.string().min(1, 'El concepto es requerido'),
  bancoId: z.string().min(1, 'Selecciona un banco'),
  bancoDestinoId: z.string().optional(),
  categoria: z.string().optional(),
  distribuidorId: z.string().optional(),
  ordenCompraId: z.string().optional(),
  observaciones: z.string().optional(),
})

type MovimientoFormData = z.infer<typeof movimientoSchema>

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const BANCOS_OPTIONS = [
  {
    value: 'boveda_monte',
    label: 'Bóveda Monte',
    icon: <Wallet className="h-4 w-4 text-violet-400" />,
  },
  { value: 'boveda_usa', label: 'Bóveda USA', icon: <Wallet className="h-4 w-4 text-cyan-400" /> },
  { value: 'profit', label: 'Profit', icon: <Wallet className="h-4 w-4 text-emerald-400" /> },
  { value: 'leftie', label: 'Leftie', icon: <Wallet className="h-4 w-4 text-amber-400" /> },
  { value: 'azteca', label: 'Azteca', icon: <Wallet className="h-4 w-4 text-orange-400" /> },
  { value: 'flete_sur', label: 'Flete Sur', icon: <Wallet className="h-4 w-4 text-pink-400" /> },
  { value: 'utilidades', label: 'Utilidades', icon: <Wallet className="h-4 w-4 text-green-400" /> },
]

const TIPO_OPTIONS = [
  {
    value: 'ingreso',
    label: 'Ingreso',
    icon: <ArrowUpRight className="h-4 w-4 text-emerald-400" />,
  },
  { value: 'gasto', label: 'Gasto', icon: <ArrowDownRight className="h-4 w-4 text-red-400" /> },
  {
    value: 'transferencia',
    label: 'Transferencia',
    icon: <ArrowLeftRight className="h-4 w-4 text-violet-400" />,
  },
]

const CATEGORIAS_INGRESO = [
  { value: 'venta', label: 'Venta' },
  { value: 'cobro', label: 'Cobro a Cliente' },
  { value: 'prestamo', label: 'Préstamo Recibido' },
  { value: 'inversion', label: 'Retorno de Inversión' },
  { value: 'otro', label: 'Otro Ingreso' },
]

const CATEGORIAS_GASTO = [
  { value: 'pago_distribuidor', label: '💳 Pago a Distribuidor' },
  { value: 'compra', label: 'Compra de Mercancía' },
  { value: 'operativo', label: 'Gasto Operativo' },
  { value: 'flete', label: 'Flete / Transporte' },
  { value: 'otro', label: 'Otro Gasto' },
]

// Helper para formatear fechas
function formatDate(date: Date | string | number | null | undefined): string {
  try {
    if (!date) return new Date().toISOString().slice(0, 10)
    const d = new Date(date)
    return d.toISOString().slice(0, 10)
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

function formatTime(date: Date | string | number | null | undefined): string {
  try {
    if (!date) return '00:00'
    const d = new Date(date)
    return d.toTimeString().slice(0, 5)
  } catch {
    return '00:00'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function AuroraMovimientosPageClient() {
  const { movimientos, loading, error, refetch } = useMovimientos()
  const { distribuidores } = useDistribuidores()
  const { ordenes } = useOrdenes()

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Partial<MovimientoFormData>>({
    tipo: 'ingreso',
    bancoId: 'boveda_monte',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Distribuidores con deuda (para pagos)
  const distribuidoresConDeuda = useMemo(() => {
    return distribuidores
      .filter((d) => (d.saldoPendiente ?? 0) > 0)
      .map((d) => ({
        id: d.id,
        value: d.id,
        label: `${d.nombre} - Deuda: ${formatCurrency(d.saldoPendiente ?? 0)}`,
        icon: <Truck className="h-4 w-4 text-orange-400" />,
        deuda: d.saldoPendiente ?? 0,
        nombre: d.nombre,
      }))
  }, [distribuidores])

  // Órdenes pendientes del distribuidor seleccionado
  const ordenesPendientes = useMemo(() => {
    if (!formData.distribuidorId) return []
    return ordenes
      .filter(
        (o) =>
          o.distribuidorId === formData.distribuidorId &&
          (o.estado === 'pendiente' || o.estado === 'parcial') &&
          (o.montoRestante ?? 0) > 0,
      )
      .map((o) => ({
        id: o.id,
        value: o.id,
        label: `OC-${o.numeroOrden || o.id.slice(0, 6)} | ${o.producto || 'Sin producto'} | Deuda: ${formatCurrency(o.montoRestante ?? 0)}`,
        icon: <Package className="h-4 w-4 text-violet-400" />,
        deuda: o.montoRestante ?? 0,
        producto: o.producto,
        estado: o.estado,
        costoTotal: o.total ?? 0,
      }))
  }, [ordenes, formData.distribuidorId])

  // Información del distribuidor seleccionado
  const distribuidorSeleccionado = useMemo(() => {
    if (!formData.distribuidorId) return null
    return distribuidores.find((d) => d.id === formData.distribuidorId)
  }, [distribuidores, formData.distribuidorId])

  // Información de la orden seleccionada
  const ordenSeleccionada = useMemo(() => {
    if (!formData.ordenCompraId) return null
    return ordenes.find((o) => o.id === formData.ordenCompraId)
  }, [ordenes, formData.ordenCompraId])

  // Auto-generar concepto cuando se selecciona pago a distribuidor
  useEffect(() => {
    if (formData.categoria === 'pago_distribuidor' && distribuidorSeleccionado) {
      const ordenInfo = ordenSeleccionada
        ? ` - OC-${ordenSeleccionada.numeroOrden || ordenSeleccionada.id.slice(0, 6)}`
        : ''
      setFormData((f) => ({
        ...f,
        concepto: `Pago a ${distribuidorSeleccionado.nombre}${ordenInfo}`,
      }))
    }
  }, [formData.categoria, distribuidorSeleccionado, ordenSeleccionada])

  // Transform data for panel
  const movimientosData = useMemo(() => {
    if (!movimientos?.length) return undefined

    return movimientos.map((m) => ({
      id: m.id,
      fecha: formatDate(m.fecha),
      hora: formatTime(m.fecha),
      tipo: m.tipo as 'ingreso' | 'gasto' | 'transferencia',
      monto: m.monto ?? 0,
      concepto: m.concepto ?? '',
      bancoId: m.bancoId ?? 'boveda_monte',
      bancoNombre: BANCOS_OPTIONS.find((b) => b.value === m.bancoId)?.label ?? 'Bóveda Monte',
      bancoColor: '#8B5CF6',
      estado: 'completado' as const,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
    }))
  }, [movimientos])

  // Handlers
  const handleNuevoMovimiento = useCallback(() => {
    setFormData({ tipo: 'ingreso', bancoId: 'boveda_monte' })
    setFormErrors({})
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setFormData({ tipo: 'ingreso', bancoId: 'boveda_monte' })
    setFormErrors({})
  }, [])

  const handleSubmit = useCallback(async () => {
    // Validación especial para pago a distribuidor
    if (formData.categoria === 'pago_distribuidor') {
      if (!formData.distribuidorId) {
        setFormErrors({ distribuidorId: 'Selecciona un distribuidor' })
        return
      }
      // Validar que el monto no exceda la deuda
      const deudaTotal = distribuidorSeleccionado?.saldoPendiente ?? 0
      if (formData.monto && formData.monto > deudaTotal) {
        setFormErrors({ monto: `El monto excede la deuda total (${formatCurrency(deudaTotal)})` })
        return
      }
    }

    // Validate
    const result = movimientoSchema.safeParse(formData)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message
      })
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      // Call API to create movimiento
      const response = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: result.data.tipo,
          monto: result.data.monto,
          concepto: result.data.concepto,
          bancoId: result.data.bancoId,
          bancoDestinoId: result.data.bancoDestinoId,
          categoria: result.data.categoria,
          distribuidorId: formData.distribuidorId,
          ordenCompraId: formData.ordenCompraId,
          observaciones: result.data.observaciones,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear movimiento')
      }

      // Si es pago a distribuidor, mostrar mensaje especial
      if (formData.categoria === 'pago_distribuidor' && distribuidorSeleccionado) {
        toast.success(
          `💳 Pago registrado a ${distribuidorSeleccionado.nombre}: ${formatCurrency(result.data.monto)}`,
        )
      } else {
        toast.success(
          `${result.data.tipo === 'ingreso' ? '✅ Ingreso' : result.data.tipo === 'gasto' ? '📉 Gasto' : '🔄 Transferencia'} registrado correctamente`,
        )
      }

      handleCloseModal()
      refetch()
    } catch (err) {
      logger.error('Error al crear movimiento', err as Error, {
        context: 'AuroraMovimientosPageClient',
      })
      toast.error('Error al registrar movimiento')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, handleCloseModal, refetch, distribuidorSeleccionado])

  const handleRefresh = useCallback(() => {
    refetch()
    toast.success('Datos actualizados')
  }, [refetch])

  const handleVerDetalle = useCallback(
    (mov: { id: string; concepto: string; monto: number; tipo: string }) => {
      toast.info(`📋 ${mov.concepto}\n💵 $${mov.monto.toLocaleString()}\n🏷️ ${mov.tipo}`)
      logger.info('Ver detalle movimiento', {
        context: 'AuroraMovimientosPageClient',
        data: { id: mov.id },
      })
    },
    [],
  )

  // Get categorias based on tipo
  const categoriasOptions = formData.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="text-sm text-white/60">Cargando movimientos...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-400">
          <p>Error al cargar movimientos</p>
          <p className="text-sm text-white/40">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AuroraMovimientosPanel
        movimientos={movimientosData}
        onNuevoMovimiento={handleNuevoMovimiento}
        onVerDetalle={handleVerDetalle}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: Nuevo Movimiento (Estilo Premium como Órdenes)
      ═══════════════════════════════════════════════════════════════════════ */}
      <FormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Nuevo Movimiento"
        subtitle="Registra un ingreso, gasto o transferencia"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <AuroraButton variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </AuroraButton>
            <AuroraButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Movimiento'}
            </AuroraButton>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Tipo de Movimiento */}
          <GlassSelect
            label="Tipo de Movimiento"
            value={formData.tipo || ''}
            onChange={(val) =>
              setFormData((f) => ({
                ...f,
                tipo: val as MovimientoFormData['tipo'],
                categoria: undefined,
              }))
            }
            options={TIPO_OPTIONS}
            error={formErrors.tipo}
            required
          />

          {/* Banco Origen */}
          <GlassSelect
            label={formData.tipo === 'transferencia' ? 'Banco Origen' : 'Banco'}
            value={formData.bancoId || ''}
            onChange={(val) => setFormData((f) => ({ ...f, bancoId: val }))}
            options={BANCOS_OPTIONS}
            error={formErrors.bancoId}
            required
          />

          {/* Banco Destino (solo transferencias) */}
          {formData.tipo === 'transferencia' && (
            <GlassSelect
              label="Banco Destino"
              value={formData.bancoDestinoId || ''}
              onChange={(val) => setFormData((f) => ({ ...f, bancoDestinoId: val }))}
              options={BANCOS_OPTIONS.filter((b) => b.value !== formData.bancoId)}
              error={formErrors.bancoDestinoId}
              required
            />
          )}

          {/* Monto */}
          <GlassMoneyInput
            label="Monto"
            value={formData.monto || 0}
            onChange={(val) => setFormData((f) => ({ ...f, monto: val }))}
            error={formErrors.monto}
            required
          />

          {/* Categoría (solo ingreso/gasto) */}
          {formData.tipo !== 'transferencia' && (
            <GlassSelect
              label="Categoría"
              value={formData.categoria || ''}
              onChange={(val) =>
                setFormData((f) => ({
                  ...f,
                  categoria: val,
                  // Reset distribuidor/orden if changing category
                  distribuidorId: val === 'pago_distribuidor' ? f.distribuidorId : undefined,
                  ordenCompraId: val === 'pago_distribuidor' ? f.ordenCompraId : undefined,
                }))
              }
              options={categoriasOptions}
              placeholder="Seleccionar categoría..."
            />
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECCIÓN ESPECIAL: Pago a Distribuidor
              Muestra selector de distribuidor y orden de compra pendiente
          ═══════════════════════════════════════════════════════════════ */}
          <AnimatePresence>
            {formData.categoria === 'pago_distribuidor' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Alerta informativa */}
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-300">Pago a Distribuidor</p>
                    <p className="mt-0.5 text-xs text-amber-200/70">
                      Selecciona el distribuidor y opcionalmente la orden de compra específica a la
                      que se aplica este pago.
                    </p>
                  </div>
                </div>

                {/* Selector de Distribuidor */}
                <GlassSelect
                  label="Distribuidor"
                  value={formData.distribuidorId || ''}
                  onChange={(val) =>
                    setFormData((f) => ({
                      ...f,
                      distribuidorId: val,
                      ordenCompraId: undefined, // Reset orden al cambiar distribuidor
                    }))
                  }
                  options={
                    distribuidoresConDeuda.length > 0
                      ? distribuidoresConDeuda.map((d) => ({
                          value: d.id,
                          label: `${d.nombre} • Deuda: ${formatCurrency(d.deuda ?? 0)}`,
                        }))
                      : [{ value: '', label: 'No hay distribuidores con deuda pendiente' }]
                  }
                  error={formErrors.distribuidorId}
                  required
                  placeholder="Seleccionar distribuidor..."
                />

                {/* Info del distribuidor seleccionado */}
                {distribuidorSeleccionado && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                        <Truck className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{distribuidorSeleccionado.nombre}</p>
                        <div className="mt-0.5 flex items-center gap-4 text-xs text-white/50">
                          <span>📞 {distribuidorSeleccionado.telefono || 'Sin teléfono'}</span>
                          <span>📍 {distribuidorSeleccionado.direccion || 'Sin dirección'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40">Deuda Total</p>
                        <p className="text-lg font-bold text-amber-400">
                          {formatCurrency(distribuidorSeleccionado.saldoPendiente ?? 0)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Selector de Orden de Compra (opcional) */}
                {formData.distribuidorId && ordenesPendientes.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <GlassSelect
                      label="Orden de Compra (opcional)"
                      value={formData.ordenCompraId || ''}
                      onChange={(val) =>
                        setFormData((f) => ({ ...f, ordenCompraId: val || undefined }))
                      }
                      options={[
                        { value: '', label: 'Pago general (sin orden específica)' },
                        ...ordenesPendientes.map((o) => ({
                          value: o.id,
                          label: `OC-${o.id.slice(0, 6)} • Restante: ${formatCurrency(o.deuda ?? o.costoTotal)}`,
                        })),
                      ]}
                      placeholder="Seleccionar orden..."
                    />

                    {/* Info de la orden seleccionada */}
                    {ordenSeleccionada && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                            <Package className="h-5 w-5 text-violet-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              Orden #{ordenSeleccionada.numeroOrden}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  ordenSeleccionada.estado === 'pendiente'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                {ordenSeleccionada.estado === 'pendiente' ? (
                                  <>
                                    <Clock className="mr-1 inline h-3 w-3" />
                                    Pendiente
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-1 inline h-3 w-3" />
                                    Parcial
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/40">Por pagar</p>
                            <p className="text-lg font-bold text-violet-400">
                              {formatCurrency(
                                ordenSeleccionada.montoRestante ?? ordenSeleccionada.total,
                              )}
                            </p>
                            <p className="text-xs text-white/30">
                              de {formatCurrency(ordenSeleccionada.total)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Sin órdenes pendientes */}
                {formData.distribuidorId && ordenesPendientes.length === 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <p className="text-sm text-blue-300">
                      Este distribuidor no tiene órdenes de compra pendientes. El pago se registrará
                      como pago general.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Concepto */}
          <GlassInput
            label="Concepto"
            value={formData.concepto || ''}
            onChange={(e) => setFormData((f) => ({ ...f, concepto: e.target.value }))}
            placeholder={
              formData.tipo === 'ingreso'
                ? 'Ej: Venta de producto premium'
                : formData.tipo === 'gasto'
                  ? 'Ej: Pago a distribuidor'
                  : 'Ej: Transferencia para inversión'
            }
            error={formErrors.concepto}
            required
          />

          {/* Observaciones */}
          <GlassTextarea
            label="Observaciones (opcional)"
            value={formData.observaciones || ''}
            onChange={(e) => setFormData((f) => ({ ...f, observaciones: e.target.value }))}
            placeholder="Notas adicionales..."
          />

          {/* Preview */}
          {formData.monto && formData.monto > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-emerald-500/5 to-transparent p-4"
            >
              <p className="mb-2 text-sm text-white/50">Vista previa</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      formData.tipo === 'ingreso'
                        ? 'bg-emerald-500/20'
                        : formData.tipo === 'gasto'
                          ? 'bg-red-500/20'
                          : 'bg-violet-500/20'
                    }`}
                  >
                    {formData.tipo === 'ingreso' ? (
                      <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                    ) : formData.tipo === 'gasto' ? (
                      <ArrowDownRight className="h-5 w-5 text-red-400" />
                    ) : (
                      <ArrowLeftRight className="h-5 w-5 text-violet-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{formData.concepto || 'Sin concepto'}</p>
                    <p className="text-xs text-white/40">
                      {BANCOS_OPTIONS.find((b) => b.value === formData.bancoId)?.label}
                      {formData.tipo === 'transferencia' &&
                        formData.bancoDestinoId &&
                        ` → ${BANCOS_OPTIONS.find((b) => b.value === formData.bancoDestinoId)?.label}`}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-xl font-bold ${
                    formData.tipo === 'ingreso'
                      ? 'text-emerald-400'
                      : formData.tipo === 'gasto'
                        ? 'text-red-400'
                        : 'text-violet-400'
                  }`}
                >
                  {formData.tipo === 'ingreso' ? '+' : formData.tipo === 'gasto' ? '-' : ''}$
                  {formData.monto.toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </FormModal>
    </>
  )
}
