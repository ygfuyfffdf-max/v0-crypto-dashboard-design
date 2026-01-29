'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏭 ALMACEN PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { deleteProducto, getProductos } from '@/app/_actions/almacen'
import { AuroraAlmacenPanelUnified } from '@/app/_components/chronos-2026/panels'
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
import { ProductoModal } from '@/app/_components/modals/ProductoModal'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ProductoFromAPI {
  id: string
  nombre: string
  descripcion?: string | null
  cantidad: number | null
  precioCompra: number
  precioVenta: number
  minimo: number | null
  ubicacion?: string | null
}

interface ProductoForPanel {
  id: string
  nombre: string
  sku: string
  categoria: string
  stockActual: number
  stockMinimo: number
  stockMaximo: number
  precioUnitario: number
  valorInventario: number
  ultimoMovimiento: string
  ubicacion: string
  estado: 'normal' | 'bajo' | 'critico' | 'exceso'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSFORM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function transformProductoForPanel(p: ProductoFromAPI): ProductoForPanel {
  const stockActual = p.cantidad ?? 0
  const stockMinimo = p.minimo ?? 0
  let estado: ProductoForPanel['estado'] = 'normal'

  if (stockActual === 0) {
    estado = 'critico'
  } else if (stockActual < stockMinimo) {
    estado = 'bajo'
  } else if (stockActual > stockMinimo * 3) {
    estado = 'exceso'
  }

  return {
    id: p.id,
    nombre: p.nombre,
    sku: p.id.slice(0, 8).toUpperCase(),
    categoria: 'General',
    stockActual,
    stockMinimo,
    stockMaximo: stockMinimo * 5,
    precioUnitario: p.precioVenta,
    valorInventario: stockActual * p.precioCompra,
    ultimoMovimiento: 'Hoy',
    ubicacion: p.ubicacion ?? 'A-01',
    estado,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AlmacenPageClient() {
  const [productos, setProductos] = useState<ProductoForPanel[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [showProductoModal, setShowProductoModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<ProductoForPanel | null>(null)
  const [productoModalMode, setProductoModalMode] = useState<'create' | 'edit'>('create')

  // Fetch data
  const fetchProductos = useCallback(async () => {
    setLoading(true)
    try {
      // Primero sincronizar entradas/salidas con OCs y ventas
      try {
        await fetch('/api/sistema/sync-almacen', { method: 'POST' })
      } catch {
        // Ignorar error de sincronización, continuar con fetch
      }

      const result = await getProductos()

      if (result.error || !result.data) {
        throw new Error(result.error || 'Error fetching productos')
      }

      // Asegurar que result.data sea un array
      const dataArray = Array.isArray(result.data) ? result.data : []
      setProductos(dataArray.map((p: any) => transformProductoForPanel(p)))

      logger.info('Productos cargados', {
        context: 'AlmacenPageClient',
        data: { count: dataArray.length },
      })
    } catch (error) {
      logger.error('Error cargando productos', error as Error, { context: 'AlmacenPageClient' })
      toast.error('Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductos()
  }, [fetchProductos, refreshKey])

  // Handlers
  const handleNuevoProducto = useCallback(() => {
    setSelectedProducto(null)
    setProductoModalMode('create')
    setShowProductoModal(true)
  }, [])

  const handleVerProducto = useCallback((p: ProductoForPanel) => {
    toast.info(`${p.nombre} - Stock: ${p.stockActual}`)
  }, [])

  const handleEditarProducto = useCallback((p: ProductoForPanel) => {
    setSelectedProducto(p)
    setProductoModalMode('edit')
    setShowProductoModal(true)
  }, [])

  const handleEliminarProducto = useCallback((p: ProductoForPanel) => {
    setSelectedProducto(p)
    setShowDeleteModal(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProducto) return

    try {
      const result = await deleteProducto(selectedProducto.id)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Producto eliminado')
      setShowDeleteModal(false)
      setSelectedProducto(null)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      logger.error('Error eliminando producto', error as Error, { context: 'AlmacenPageClient' })
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
    }
  }, [selectedProducto])

  const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const handleModalClose = useCallback(() => {
    setShowProductoModal(false)
    setShowDeleteModal(false)
    setSelectedProducto(null)
    setRefreshKey((k) => k + 1)
  }, [])

  const handleExportar = useCallback((formato: 'csv' | 'excel' | 'pdf', tipo: string) => {
    toast.info(`Exportando ${tipo} en formato ${formato.toUpperCase()}`)
  }, [])

  return (
    <>
      <AuroraAlmacenPanelUnified
        productos={productos}
        onNuevoProducto={handleNuevoProducto}
        onVerProducto={handleVerProducto}
        onEditarProducto={handleEditarProducto}
        onEliminarProducto={handleEliminarProducto}
        onExportar={handleExportar}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <ProductoModal
        isOpen={showProductoModal}
        onClose={handleModalClose}
        productoId={selectedProducto?.id}
        mode={productoModalMode}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message={`¿Eliminar "${selectedProducto?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  )
}
