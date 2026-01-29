'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 ORDENES PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AuroraComprasPanelUnified } from '@/app/_components/chronos-2026/panels/AuroraComprasPanelUnified'
import { DetalleOrdenCompraModal } from '@/app/_components/modals/DetalleOrdenCompraModal'
import { EditarOrdenCompraModal } from '@/app/_components/modals/EditarOrdenCompraModal'
import { OrdenCompraModal } from '@/app/_components/modals/OrdenCompraModal'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrdenFromAPI {
  id: string
  distribuidorId: string
  fecha: Date | string
  numeroOrden?: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  iva?: number
  total: number
  montoPagado?: number
  montoRestante?: number
  estado: 'pendiente' | 'parcial' | 'completo' | 'cancelado'
  bancoOrigenId?: string
  observaciones?: string
  distribuidor?: {
    id: string
    nombre: string
    empresa?: string
  }
}

interface OrdenForPanel {
  id: string
  fecha: string
  hora: string
  distribuidor: string
  distribuidorId: string
  producto: string
  cantidad: number
  precioUnitario: number
  precioTotal: number
  estado:
    | 'pendiente'
    | 'parcial'
    | 'completo'
    | 'completada' // Alias de completo
    | 'cancelado'
    | 'cancelada' // Alias de cancelado
  fechaEntrega?: string
  notas?: string
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function transformOrdenForPanel(o: OrdenFromAPI): OrdenForPanel {
  const fecha = new Date(o.fecha)
  return {
    id: o.id,
    fecha: fecha.toISOString().split('T')[0] ?? '',
    hora: fecha.toTimeString().slice(0, 5),
    distribuidor: o.distribuidor?.nombre ?? 'Distribuidor',
    distribuidorId: o.distribuidorId,
    producto: o.numeroOrden ?? `OC-${o.id.slice(0, 6)}`,
    cantidad: o.cantidad,
    precioUnitario: o.precioUnitario,
    precioTotal: o.total,
    estado: o.estado,
    notas: o.observaciones ?? undefined,
    createdAt: fecha.toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function OrdenesPageClient() {
  const [ordenes, setOrdenes] = useState<OrdenForPanel[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [showNuevoModal, setShowNuevoModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [_showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [selectedOrden, setSelectedOrden] = useState<OrdenForPanel | null>(null)

  // Fetch data
  const fetchOrdenes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ordenes')
      if (!response.ok) throw new Error('Error fetching ordenes')

      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setOrdenes(dataArray.map(transformOrdenForPanel))

      logger.info('Órdenes cargadas', {
        context: 'OrdenesPageClient',
        data: { count: dataArray.length },
      })
    } catch (error) {
      logger.error('Error cargando órdenes', error as Error, { context: 'OrdenesPageClient' })
      toast.error('Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrdenes()
  }, [fetchOrdenes, refreshKey])

  // Handlers
  const handleNuevaOrden = useCallback(() => setShowNuevoModal(true), [])

  const handleVerDetalle = useCallback((o: OrdenForPanel) => {
    setSelectedOrden(o)
    setShowDetalleModal(true)
  }, [])

  const handleEditarOrden = useCallback((o: OrdenForPanel) => {
    setSelectedOrden(o)
    setShowEditarModal(true)
  }, [])

  const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const handleModalClose = useCallback(() => {
    setShowNuevoModal(false)
    setShowEditarModal(false)
    setShowDeleteModal(false)
    setShowDetalleModal(false)
    setSelectedOrden(null)
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <>
      <AuroraComprasPanelUnified
        ordenes={ordenes}
        onNuevaOrden={handleNuevaOrden}
        onVerDetalle={handleVerDetalle}
        onEditarOrden={handleEditarOrden}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <OrdenCompraModal isOpen={showNuevoModal} onClose={handleModalClose} />

      {selectedOrden && (
        <DetalleOrdenCompraModal
          isOpen={showDetalleModal}
          onClose={handleModalClose}
          ordenId={selectedOrden.id}
        />
      )}

      {selectedOrden && (
        <EditarOrdenCompraModal
          isOpen={showEditarModal}
          onClose={handleModalClose}
          ordenId={selectedOrden.id}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </>
  )
}
