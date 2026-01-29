'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🚚 DISTRIBUIDORES PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { AuroraDistribuidoresPanelUnified } from '@/app/_components/chronos-2026/panels'
import { AbonoDistribuidorModal } from '@/app/_components/modals/AbonoDistribuidorModal'
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
import { EditarDistribuidorModal } from '@/app/_components/modals/EditarDistribuidorModal'
import { HistorialDistribuidorModal } from '@/app/_components/modals/HistorialDistribuidorModal'
import { NuevoDistribuidorModal } from '@/app/_components/modals/NuevoDistribuidorModal'
import { OrdenCompraModal } from '@/app/_components/modals/OrdenCompraModal'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES (matching AuroraDistribuidoresPanelUnified internal types)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type EstadoDistribuidor = 'activo' | 'inactivo' | 'suspendido'
type CategoriaDistribuidor = 'estrategico' | 'preferido' | 'normal' | 'ocasional' | 'nuevo'

interface Distribuidor {
  id: string
  nombre: string
  alias?: string
  empresa?: string
  telefono?: string
  email?: string
  direccion?: string
  ubicacion?: string
  tipoProductos?: string
  totalCompras: number
  deudaActual: number
  totalPagado: number
  saldoPendiente: number
  numeroOrdenes: number
  ordenesCompletadas: number
  ordenesPendientes: number
  ultimaOrden?: string
  diasSinOrdenar: number
  rating: number
  scoreTotal: number
  categoria: CategoriaDistribuidor
  confiabilidad: number
  tiempoPromedioEntrega: number
  estado: EstadoDistribuidor
  notas?: string
  createdAt: string
}

interface DistribuidorFromAPI {
  id: string
  nombre: string
  empresa?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  tipoProductos?: string | null
  saldoPendiente?: number
  totalOrdenesCompra?: number
  numeroOrdenes?: number
  estado: 'activo' | 'inactivo' | 'suspendido'
  categoria?: string
  scoreTotal?: number
  createdAt: Date | string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function transformDistribuidorForPanel(d: DistribuidorFromAPI): Distribuidor {
  return {
    id: d.id,
    nombre: d.nombre,
    empresa: d.empresa ?? undefined,
    telefono: d.telefono ?? undefined,
    email: d.email ?? undefined,
    direccion: d.direccion ?? undefined,
    tipoProductos: d.tipoProductos ?? undefined,
    totalCompras: d.totalOrdenesCompra ?? 0,
    deudaActual: d.saldoPendiente ?? 0,
    totalPagado: 0,
    saldoPendiente: d.saldoPendiente ?? 0,
    numeroOrdenes: d.numeroOrdenes ?? 0,
    ordenesCompletadas: 0,
    ordenesPendientes: 0,
    diasSinOrdenar: 0,
    rating: 4.5,
    scoreTotal: d.scoreTotal ?? 50,
    categoria: 'normal',
    confiabilidad: 90,
    tiempoPromedioEntrega: 3,
    estado: d.estado ?? 'activo',
    createdAt: new Date(d.createdAt).toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function DistribuidoresPageClient() {
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [showNuevoModal, setShowNuevoModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [showHistorialModal, setShowHistorialModal] = useState(false)
  const [showOrdenModal, setShowOrdenModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDistribuidor, setSelectedDistribuidor] = useState<Distribuidor | null>(null)

  // Fetch data
  const fetchDistribuidores = useCallback(async () => {
    setLoading(true)
    try {
      // Primero sincronizar saldos para asegurar datos correctos
      try {
        await fetch('/api/sistema/sync-distribuidores', { method: 'POST' })
      } catch {
        // Ignorar error de sincronización, continuar con fetch
      }

      const response = await fetch('/api/distribuidores')
      if (!response.ok) throw new Error('Error fetching distribuidores')

      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setDistribuidores(dataArray.map(transformDistribuidorForPanel))

      logger.info('Distribuidores cargados', {
        context: 'DistribuidoresPageClient',
        data: { count: dataArray.length },
      })
    } catch (error) {
      logger.error('Error cargando distribuidores', error as Error, {
        context: 'DistribuidoresPageClient',
      })
      toast.error('Error al cargar distribuidores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDistribuidores()
  }, [fetchDistribuidores, refreshKey])

  // Handlers - usando las firmas correctas del panel
  const handleCrear = useCallback(async (_data: Partial<Distribuidor>) => {
    setShowNuevoModal(true)
  }, [])

  const handleEditar = useCallback(
    async (id: string, _data: Partial<Distribuidor>) => {
      const dist = distribuidores.find((d) => d.id === id)
      if (dist) {
        setSelectedDistribuidor(dist)
        setShowEditarModal(true)
      }
    },
    [distribuidores],
  )

  const handleEliminar = useCallback(
    async (id: string) => {
      const dist = distribuidores.find((d) => d.id === id)
      if (dist) {
        setSelectedDistribuidor(dist)
        setShowDeleteModal(true)
      }
    },
    [distribuidores],
  )

  const handleVerDetalle = useCallback((d: Distribuidor) => {
    setSelectedDistribuidor(d)
    setShowHistorialModal(true)
  }, [])

  const handleVerHistorial = useCallback((d: Distribuidor) => {
    setSelectedDistribuidor(d)
    setShowHistorialModal(true)
  }, [])

  const handleNuevaOrden = useCallback(async (_data: Partial<unknown>) => {
    setShowOrdenModal(true)
  }, [])

  const handleRegistrarPago = useCallback(
    async (distribuidorId: string, _ordenId: string, _monto: number) => {
      const dist = distribuidores.find((d) => d.id === distribuidorId)
      if (dist) {
        setSelectedDistribuidor(dist)
        setShowAbonoModal(true)
      }
    },
    [distribuidores],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedDistribuidor) return

    try {
      const response = await fetch(`/api/distribuidores/${selectedDistribuidor.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error eliminando distribuidor')
      }

      toast.success('Distribuidor eliminado correctamente')
      setShowDeleteModal(false)
      setSelectedDistribuidor(null)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      logger.error('Error eliminando distribuidor', error as Error, {
        context: 'DistribuidoresPageClient',
      })
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    }
  }, [selectedDistribuidor])

  const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const handleModalClose = useCallback(() => {
    setShowNuevoModal(false)
    setShowEditarModal(false)
    setShowAbonoModal(false)
    setShowHistorialModal(false)
    setShowOrdenModal(false)
    setShowDeleteModal(false)
    setSelectedDistribuidor(null)
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <>
      <AuroraDistribuidoresPanelUnified
        distribuidores={distribuidores}
        onCrear={handleCrear}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onVerDetalle={handleVerDetalle}
        onVerHistorial={handleVerHistorial}
        onNuevaOrden={handleNuevaOrden}
        onRegistrarPago={handleRegistrarPago}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <NuevoDistribuidorModal
        isOpen={showNuevoModal}
        onClose={handleModalClose}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {selectedDistribuidor && (
        <EditarDistribuidorModal
          isOpen={showEditarModal}
          onClose={handleModalClose}
          distribuidorId={selectedDistribuidor.id}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      <AbonoDistribuidorModal
        isOpen={showAbonoModal}
        onClose={handleModalClose}
        distribuidorPreseleccionado={selectedDistribuidor?.id}
      />

      {selectedDistribuidor && (
        <HistorialDistribuidorModal
          isOpen={showHistorialModal}
          onClose={handleModalClose}
          distribuidorId={selectedDistribuidor.id}
        />
      )}

      <OrdenCompraModal isOpen={showOrdenModal} onClose={handleModalClose} />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Distribuidor"
        message={`¿Estás seguro de eliminar a ${selectedDistribuidor?.nombre}?`}
        itemName={selectedDistribuidor?.nombre}
        warningMessage={selectedDistribuidor?.saldoPendiente && selectedDistribuidor.saldoPendiente > 0
          ? `Tienes una deuda pendiente de $${selectedDistribuidor.saldoPendiente.toLocaleString()} con este distribuidor. El estado será cambiado a inactivo.`
          : 'El distribuidor será desactivado y no podrá recibir nuevas órdenes de compra.'
        }
        isDestructive={true}
      />
    </>
  )
}
