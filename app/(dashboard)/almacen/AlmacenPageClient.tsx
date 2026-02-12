'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🏭 ALMACEN PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Página completa de gestión de almacén/inventario con panel Aurora premium
 */

import { useState } from 'react'
import { AuroraAlmacenPanelUnified } from '@/app/_components/chronos-2026/panels/AuroraAlmacenPanelUnified'
import { ProductoModal } from '@/app/_components/modals/ProductoModal'
import { CorteAlmacenModal } from '@/app/_components/modals/CorteAlmacenModal'
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
import { toast } from 'sonner'
import { useAlmacenData } from '@/app/hooks/useDataHooks'

export function AlmacenPageClient() {
  const [showProductoModal, setShowProductoModal] = useState(false)
  const [showCorteModal, setShowCorteModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedProductoId, setSelectedProductoId] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const { data: almacenData, loading, refetch } = useAlmacenData()

  const handleNuevoProducto = () => {
    setModalMode('create')
    setSelectedProductoId(null)
    setShowProductoModal(true)
  }

  const handleEditarProducto = (productoId: string) => {
    setModalMode('edit')
    setSelectedProductoId(productoId)
    setShowProductoModal(true)
  }

  const handleEliminarProducto = (productoId: string) => {
    setSelectedProductoId(productoId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedProductoId) return

    try {
      const response = await fetch(`/api/almacen/${selectedProductoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Producto eliminado correctamente')
        setShowDeleteConfirm(false)
        setSelectedProductoId(null)
        await refetch()
      } else {
        throw new Error('Error al eliminar producto')
      }
    } catch (error) {
      toast.error('Error al eliminar producto')
      console.error(error)
    }
  }

  const handleNuevaEntrada = () => {
    // Implementar modal de entrada
    toast.info('Funcionalidad de entrada en desarrollo')
  }

  const handleNuevaSalida = () => {
    // Implementar modal de salida
    toast.info('Funcionalidad de salida en desarrollo')
  }

  const handleNuevoCorte = () => {
    setShowCorteModal(true)
  }

  const handleExportar = async (formato: 'csv' | 'excel' | 'pdf', tipo: string) => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'almacen',
          subtipo: tipo,
          formato,
          datos: almacenData,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `almacen_${tipo}_${new Date().toISOString()}.${formato === 'excel' ? 'xlsx' : formato}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success(`Exportación ${formato.toUpperCase()} completada`)
      } else {
        throw new Error('Error en la exportación')
      }
    } catch (error) {
      toast.error('Error al exportar datos')
      console.error(error)
    }
  }

  // Transformar datos de API al formato esperado por el panel
  const productos = almacenData?.productos || []
  const movimientos = almacenData?.movimientos || []
  const entradas = almacenData?.entradas || []
  const salidas = almacenData?.salidas || []
  const cortes = almacenData?.cortes || []

  return (
    <>
      <AuroraAlmacenPanelUnified
        productos={productos}
        movimientos={movimientos}
        entradas={entradas}
        salidas={salidas}
        cortes={cortes}
        onNuevoProducto={handleNuevoProducto}
        onNuevaEntrada={handleNuevaEntrada}
        onNuevaSalida={handleNuevaSalida}
        onNuevoCorte={handleNuevoCorte}
        onEditarProducto={handleEditarProducto}
        onEliminarProducto={handleEliminarProducto}
        onExportar={handleExportar}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Modales */}
      <ProductoModal
        isOpen={showProductoModal}
        onClose={() => {
          setShowProductoModal(false)
          setSelectedProductoId(null)
          refetch()
        }}
        productoId={selectedProductoId || undefined}
        mode={modalMode}
      />

      <CorteAlmacenModal
        isOpen={showCorteModal}
        onClose={() => {
          setShowCorteModal(false)
          refetch()
        }}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setSelectedProductoId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
      />
    </>
  )
}
