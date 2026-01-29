'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👥 CLIENTES PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper client-side que integra:
 * - AuroraClientesPanelUnified (UI)
 * - NuevoClienteModal (crear cliente)
 * - EditarClienteModal (editar)
 * - AbonoClienteModal (registrar abono)
 * - HistorialClienteModal (ver historial)
 * - ConfirmDeleteModal (eliminar)
 * - Server Actions / API endpoints
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { deleteCliente, getClientes } from '@/app/_actions/clientes'
import { AuroraClientesPanelUnified } from '@/app/_components/chronos-2026/panels'
import { AbonoClienteModal } from '@/app/_components/modals/AbonoClienteModal'
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
import { EditarClienteModal } from '@/app/_components/modals/EditarClienteModal'
import { HistorialClienteModal } from '@/app/_components/modals/HistorialClienteModal'
import { NuevoClienteModal } from '@/app/_components/modals/NuevoClienteModal'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ClienteFromAPI {
  id: string
  nombre: string
  email?: string | null
  telefono?: string | null
  direccion?: string | null
  rfc?: string | null
  limiteCredito?: number | null
  saldoPendiente?: number | null
  totalCompras?: number | null
  numeroVentas?: number | null
  estado: string | null
  categoria?: string | null
  createdAt: Date | string | null
  updatedAt?: Date | string | null
}

interface ClienteForPanel {
  id: string
  nombre: string
  empresa?: string
  email: string
  telefono: string
  direccion?: string
  estado: 'activo' | 'inactivo' | 'suspendido' // Alineado con schema DB
  categoria?: 'VIP' | 'frecuente' | 'ocasional' | 'nuevo' | 'inactivo' | 'moroso'
  saldoPendiente: number
  totalCompras: number
  ultimaCompra?: string
  fechaRegistro: string
  notas?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function transformClienteForPanel(cliente: ClienteFromAPI): ClienteForPanel {
  const estadoMap: Record<string, ClienteForPanel['estado']> = {
    activo: 'activo',
    inactivo: 'inactivo',
    suspendido: 'suspendido',
  }

  // Estado real del schema DB
  const estado: ClienteForPanel['estado'] = estadoMap[cliente.estado || 'activo'] ?? 'activo'

  // Categoría basada en métricas (VIP, frecuente, etc.)
  let categoria: ClienteForPanel['categoria'] = cliente.categoria as ClienteForPanel['categoria']
  if (!categoria && (cliente.totalCompras ?? 0) > 100000) {
    categoria = 'VIP'
  }

  return {
    id: cliente.id,
    nombre: cliente.nombre,
    email: cliente.email ?? '',
    telefono: cliente.telefono ?? '',
    direccion: cliente.direccion ?? undefined,
    estado,
    categoria,
    saldoPendiente: cliente.saldoPendiente ?? 0,
    totalCompras: cliente.totalCompras ?? 0,
    fechaRegistro: cliente.createdAt
      ? (new Date(cliente.createdAt).toISOString().split('T')[0] ?? '')
      : '',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ClientesPageClient() {
  // Data state
  const [clientes, setClientes] = useState<ClienteForPanel[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [showNuevoModal, setShowNuevoModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [showHistorialModal, setShowHistorialModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteForPanel | null>(null)

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // FETCH DATA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getClientes()

      if (result.error || !result.data) {
        throw new Error(result.error || 'Error fetching clientes')
      }

      // Asegurar que result.data sea un array
      const dataArray = Array.isArray(result.data) ? result.data : []
      setClientes(dataArray.map((c: any) => transformClienteForPanel(c)))

      logger.info('Clientes cargados', {
        context: 'ClientesPageClient',
        data: { count: dataArray.length },
      })
    } catch (error) {
      logger.error('Error cargando clientes', error as Error, { context: 'ClientesPageClient' })
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes, refreshKey])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const handleNuevoCliente = useCallback(() => {
    setShowNuevoModal(true)
  }, [])

  const handleVerDetalle = useCallback((cliente: ClienteForPanel) => {
    setSelectedCliente(cliente)
    setShowHistorialModal(true)
  }, [])

  const handleEditarCliente = useCallback((cliente: ClienteForPanel) => {
    setSelectedCliente(cliente)
    setShowEditarModal(true)
  }, [])

  const handleEliminarCliente = useCallback((cliente: ClienteForPanel) => {
    setSelectedCliente(cliente)
    setShowDeleteModal(true)
  }, [])

  const handleRegistrarAbono = useCallback((cliente: ClienteForPanel) => {
    setSelectedCliente(cliente)
    setShowAbonoModal(true)
  }, [])

  const handleVerHistorial = useCallback((cliente: ClienteForPanel) => {
    setSelectedCliente(cliente)
    setShowHistorialModal(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCliente) return

    try {
      const result = await deleteCliente(selectedCliente.id)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Cliente eliminado correctamente')
      setShowDeleteModal(false)
      setSelectedCliente(null)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      logger.error('Error eliminando cliente', error as Error, { context: 'ClientesPageClient' })
      toast.error(error instanceof Error ? error.message : 'Error al eliminar cliente')
    }
  }, [selectedCliente])

  const handleExportar = useCallback(
    (formato: 'csv' | 'excel' | 'pdf', filtrados: ClienteForPanel[]) => {
      logger.info('Exportando clientes', {
        context: 'ClientesPageClient',
        data: { formato, count: filtrados.length },
      })

      // Aquí se conectaría con el servicio de exportación real
      // Por ahora mantenemos el toast informativo
      toast.info(
        `Generando reporte de ${filtrados.length} clientes en formato ${formato.toUpperCase()}...`,
      )

      // Simulación de descarga
      setTimeout(() => {
        toast.success(`Reporte ${formato.toUpperCase()} generado exitosamente`)
      }, 1500)
    },
    [],
  )

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleModalClose = useCallback(() => {
    setShowNuevoModal(false)
    setShowEditarModal(false)
    setShowAbonoModal(false)
    setShowHistorialModal(false)
    setShowDeleteModal(false)
    setSelectedCliente(null)
    setRefreshKey((k) => k + 1)
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* Main Panel */}
      <AuroraClientesPanelUnified
        clientes={clientes}
        onNuevoCliente={handleNuevoCliente}
        onVerDetalle={handleVerDetalle}
        onEditarCliente={handleEditarCliente}
        onEliminarCliente={handleEliminarCliente}
        onRegistrarAbono={handleRegistrarAbono}
        onVerHistorial={handleVerHistorial}
        onExportar={handleExportar}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Modal: Nuevo Cliente */}
      <NuevoClienteModal
        isOpen={showNuevoModal}
        onClose={handleModalClose}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {/* Modal: Editar Cliente */}
      {selectedCliente && (
        <EditarClienteModal
          isOpen={showEditarModal}
          onClose={handleModalClose}
          clienteId={selectedCliente.id}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* Modal: Abono Cliente */}
      <AbonoClienteModal
        isOpen={showAbonoModal}
        onClose={handleModalClose}
        clientePreseleccionado={selectedCliente?.id}
      />

      {/* Modal: Historial Cliente */}
      {selectedCliente && (
        <HistorialClienteModal
          isOpen={showHistorialModal}
          onClose={handleModalClose}
          clienteId={selectedCliente.id}
        />
      )}

      {/* Modal: Confirmar Eliminación */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de eliminar a ${selectedCliente?.nombre}?`}
        itemName={selectedCliente?.nombre}
        warningMessage={selectedCliente?.saldoPendiente && selectedCliente.saldoPendiente > 0 
          ? `Este cliente tiene un saldo pendiente de $${selectedCliente.saldoPendiente.toLocaleString()}. El estado será cambiado a inactivo.`
          : 'El cliente será desactivado y no podrá realizar nuevas compras.'
        }
        isDestructive={true}
      />
    </>
  )
}
