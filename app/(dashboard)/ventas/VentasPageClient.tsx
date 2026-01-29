'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰 VENTAS PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper client-side que integra:
 * - AuroraVentasPanelUnified (UI)
 * - VentaModal (crear venta)
 * - DetalleVentaModal (ver detalle)
 * - EditarVentaModal (editar)
 * - ConfirmDeleteModal (eliminar)
 * - Server Actions / API endpoints
 *
 * Flujo de datos:
 * 1. Carga inicial desde API /api/ventas
 * 2. Modal crea/edita → API → Revalidate
 * 3. UI se actualiza en tiempo real
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Dynamic imports para evitar problemas de HMR con Turbopack
const AuroraVentasPanelUnified = dynamic(
  () =>
    import('@/app/_components/chronos-2026/panels/AuroraVentasPanelUnified').then(
      (mod) => mod.AuroraVentasPanelUnified,
    ),
  { ssr: false, loading: () => <div className="h-screen animate-pulse bg-transparent" /> },
)

const ConfirmDeleteModal = dynamic(
  () => import('@/app/_components/modals/ConfirmDeleteModal').then((mod) => mod.ConfirmDeleteModal),
  { ssr: false },
)

const DetalleVentaModal = dynamic(
  () => import('@/app/_components/modals/DetalleVentaModal').then((mod) => mod.DetalleVentaModal),
  { ssr: false },
)

const EditarVentaModal = dynamic(
  () => import('@/app/_components/modals/EditarVentaModal').then((mod) => mod.EditarVentaModal),
  { ssr: false },
)

const VentaModal = dynamic(
  () => import('@/app/_components/modals/VentaModal').then((mod) => mod.VentaModal),
  { ssr: false },
)

// Tipo base de Venta
interface VentaBase {
  id: string
  clienteId: string
  clienteNombre?: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  precioTotalVenta: number
  montoPagado: number
  montoRestante: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  fecha: Date | string | number
  observaciones?: string
  distribucionGYA?: {
    montoBovedaMonte: number
    montoFletes: number
    montoUtilidades: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES - CON TRAZABILIDAD COMPLETA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VentaFromAPI {
  id: string
  clienteId: string
  productoId?: string | null // ← TRAZABILIDAD
  ocId?: string | null // ← TRAZABILIDAD: Orden de Compra
  fecha: Date | string
  createdAt?: Date | string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  precioTotalVenta: number
  costoTotal?: number
  fleteTotal?: number
  montoPagado: number
  montoRestante: number
  porcentajePagado?: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  numeroAbonos?: number
  metodoPago?: string
  observaciones?: string

  // Distribución GYA desde API
  distribucionGYA?: {
    montoBovedaMonte: number
    montoFletes: number
    montoUtilidades: number
    capitalBovedaMonte: number
    capitalFletes: number
    capitalUtilidades: number
  }

  // Rentabilidad
  rentabilidad?: {
    gananciaTotal: number
    margenBruto: number
    gananciaPorUnidad: number
  }

  // Trazabilidad de lotes
  origenLotes?: Array<{
    ocId: string
    cantidad: number
    costoUnidad: number
    distribuidorId?: string
  }> | null
  numeroLotes?: number

  // Objetos relacionados
  cliente?: {
    id: string
    nombre: string
    email?: string
    telefono?: string
  } | null

  producto?: {
    id: string
    nombre?: string
    sku?: string
  } | null

  ordenCompra?: {
    id: string
    distribuidorId?: string
  } | null
}

// VentaForPanel extends VentaBase with required fields for local state
type VentaForPanel = VentaBase & {
  precioCompraUnidad: number // Required in local state
  precioFlete: number // Required in local state
  montoPagado: number // Required in local state
  montoRestante: number // Required in local state
  porcentajePagado: number // Required in local state
  createdAt: string // Required in local state
  distribucionGYA: {
    bovedaMonte: number
    fleteSur: number
    utilidades: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function transformVentaForPanel(venta: VentaFromAPI): VentaForPanel {
  const fecha = new Date(venta.fecha)
  const estadoMap: Record<string, VentaForPanel['estado']> = {
    completo: 'pagada',
    parcial: 'parcial',
    pendiente: 'pendiente',
  }

  // Calcular distribución GYA proporcional al pago
  const precioCompra = venta.precioCompraUnidad || 0
  const precioFlete = venta.precioFlete || 0
  const cantidad = venta.cantidad || 0
  const totalVenta = venta.precioTotalVenta || 0
  const montoPagado = venta.montoPagado || 0

  // Distribución base (100%)
  const baseBovedaMonte = precioCompra * cantidad
  const baseFleteSur = precioFlete * cantidad
  const baseUtilidades = (venta.precioVentaUnidad - precioCompra - precioFlete) * cantidad

  // Proporción pagada - SIEMPRE recalcular para garantizar precisión
  const proporcion = totalVenta > 0 ? Math.min(montoPagado / totalVenta, 1) : 0
  // Bug fix: Si porcentajePagado viene como 0 de la API pero hay montoPagado, recalcular
  const porcentajePagado =
    venta.porcentajePagado && venta.porcentajePagado > 0 ? venta.porcentajePagado : proporcion * 100

  // Usar distribución GYA de la API si está disponible, sino calcular
  const distribucionGYA = venta.distribucionGYA
    ? {
        bovedaMonte: venta.distribucionGYA.capitalBovedaMonte || baseBovedaMonte * proporcion,
        fleteSur: venta.distribucionGYA.capitalFletes || baseFleteSur * proporcion,
        utilidades: venta.distribucionGYA.capitalUtilidades || baseUtilidades * proporcion,
      }
    : {
        bovedaMonte: baseBovedaMonte * proporcion,
        fleteSur: baseFleteSur * proporcion,
        utilidades: baseUtilidades * proporcion,
      }

  // Determinar nombre del producto
  const productoNombre =
    venta.producto?.nombre ||
    (venta.origenLotes && venta.origenLotes.length > 0
      ? `Lote OC-${venta.origenLotes[0]?.ocId?.slice(0, 8) || 'N/A'}`
      : `${cantidad} unidades`)

  return {
    id: venta.id,
    fecha: fecha.toISOString().split('T')[0] ?? '',
    hora: fecha.toTimeString().slice(0, 5),
    cliente: venta.cliente?.nombre ?? 'Cliente',
    clienteId: venta.clienteId,
    producto: productoNombre,
    cantidad: venta.cantidad,
    precioUnitario: venta.precioVentaUnidad,
    precioCompraUnidad: precioCompra,
    precioFlete: precioFlete,
    precioTotal: totalVenta,
    montoPagado: montoPagado,
    montoRestante: venta.montoRestante || totalVenta - montoPagado,
    porcentajePagado,
    estado: estadoMap[venta.estadoPago] ?? 'pendiente',
    metodoPago:
      (venta.metodoPago as VentaForPanel['metodoPago']) ||
      (montoPagado > 0 ? 'transferencia' : undefined),
    notas: venta.observaciones ?? undefined,
    createdAt: fecha.toISOString(),

    // ═══════════════════════════════════════════════════════════════
    // TRAZABILIDAD COMPLETA
    // ═══════════════════════════════════════════════════════════════
    productoId: venta.productoId,
    productoNombre: venta.producto?.nombre,
    productoSku: venta.producto?.sku,
    ocId: venta.ocId,
    ocDistribuidorId: venta.ordenCompra?.distribuidorId,
    origenLotes: venta.origenLotes,
    numeroLotes: venta.numeroLotes,
    numeroAbonos: venta.numeroAbonos,

    distribucionGYA,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function VentasPageClient() {
  // Data state
  const [ventas, setVentas] = useState<VentaForPanel[]>([])
  const [rawVentas, setRawVentas] = useState<VentaFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [showVentaModal, setShowVentaModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState<VentaForPanel | null>(null)
  const [_selectedVentaRaw, setSelectedVentaRaw] = useState<VentaFromAPI | null>(null)

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // FETCH DATA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const fetchVentas = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ventas')
      if (!response.ok) throw new Error('Error fetching ventas')

      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : []
      setRawVentas(dataArray)
      setVentas(dataArray.map(transformVentaForPanel))

      logger.info('Ventas cargadas', {
        context: 'VentasPageClient',
        data: { count: dataArray.length },
      })
    } catch (error) {
      logger.error('Error cargando ventas', error as Error, { context: 'VentasPageClient' })
      toast.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas, refreshKey])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const handleNuevaVenta = useCallback(() => {
    setShowVentaModal(true)
  }, [])

  const handleVerDetalle = useCallback(
    (venta: VentaBase) => {
      // Cast to VentaForPanel since our local data has all required fields
      const ventaPanel = venta as VentaForPanel
      setSelectedVenta(ventaPanel)
      const raw = rawVentas.find((v) => v.id === venta.id)
      setSelectedVentaRaw(raw ?? null)
      setShowDetalleModal(true)
    },
    [rawVentas],
  )

  const handleEditarVenta = useCallback(
    (venta: VentaBase) => {
      // Cast to VentaForPanel since our local data has all required fields
      const ventaPanel = venta as VentaForPanel
      setSelectedVenta(ventaPanel)
      const raw = rawVentas.find((v) => v.id === venta.id)
      setSelectedVentaRaw(raw ?? null)
      setShowEditarModal(true)
    },
    [rawVentas],
  )

  const handleEliminarVenta = useCallback(
    async (ventaId: string) => {
      const venta = ventas.find((v) => v.id === ventaId)
      if (venta) {
        setSelectedVenta(venta)
        setShowDeleteModal(true)
      }
    },
    [ventas],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedVenta) return

    try {
      const response = await fetch(`/api/ventas/${selectedVenta.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error eliminando venta')
      }

      toast.success('Venta eliminada correctamente')
      setShowDeleteModal(false)
      setSelectedVenta(null)
      setRefreshKey((k) => k + 1) // Trigger refresh
    } catch (error) {
      logger.error('Error eliminando venta', error as Error, { context: 'VentasPageClient' })
      toast.error(error instanceof Error ? error.message : 'Error al eliminar venta')
    }
  }, [selectedVenta])

  const handleExportar = useCallback(
    (formato: 'csv' | 'excel' | 'pdf') => {
      // El panel ya tiene lógica de export CSV built-in
      // Para Excel y PDF se podría implementar con librerías adicionales
      logger.info('Exportando ventas', {
        context: 'VentasPageClient',
        data: { formato, count: ventas.length },
      })
      toast.info(`Exportando ${ventas.length} ventas en formato ${formato.toUpperCase()}`)
    },
    [ventas.length],
  )

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleModalClose = useCallback(() => {
    setShowVentaModal(false)
    setShowDetalleModal(false)
    setShowEditarModal(false)
    setShowDeleteModal(false)
    setSelectedVenta(null)
    setSelectedVentaRaw(null)
    // Refresh data after any modal closes
    setRefreshKey((k) => k + 1)
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* Main Panel */}
      <AuroraVentasPanelUnified
        ventas={ventas}
        onNuevaVenta={handleNuevaVenta}
        onVerDetalle={handleVerDetalle}
        onEditarVenta={handleEditarVenta}
        onEliminarVenta={handleEliminarVenta}
        onExportar={handleExportar}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Modal: Nueva Venta */}
      <VentaModal isOpen={showVentaModal} onClose={handleModalClose} />

      {/* Modal: Ver Detalle */}
      {selectedVenta && (
        <DetalleVentaModal
          isOpen={showDetalleModal}
          onClose={handleModalClose}
          ventaId={selectedVenta.id}
        />
      )}

      {/* Modal: Editar Venta */}
      {selectedVenta && (
        <EditarVentaModal
          isOpen={showEditarModal}
          onClose={handleModalClose}
          ventaId={selectedVenta.id}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* Modal: Confirmar Eliminación */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Venta"
        message={`¿Estás seguro de eliminar la venta a ${selectedVenta?.cliente}?`}
        itemName={selectedVenta?.cliente}
        warningMessage="Esta acción revertirá la distribución GYA y restaurará el stock. Todos los movimientos asociados serán eliminados."
        isDestructive={true}
      />
    </>
  )
}
