'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 👥 CLIENTES PAGE CLIENT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Página completa de gestión de clientes con panel Aurora premium
 */

import { useState } from 'react'
import { AuroraClientesPanelUnified } from '@/app/_components/chronos-2026/panels/AuroraClientesPanelUnified'
import { CreateClienteModal } from '@/app/_components/modals/CreateClienteModal'
import { EditarClienteModal } from '@/app/_components/modals/EditarClienteModal'
import { DetalleVentaModal } from '@/app/_components/modals/DetalleVentaModal'
import { HistorialClienteModal } from '@/app/_components/modals/HistorialClienteModal'
import { AbonoClienteModal } from '@/app/_components/modals/AbonoClienteModal'
import { ConfirmDeleteModal } from '@/app/_components/modals/ConfirmDeleteModal'
import { toast } from 'sonner'
import { useClientes } from '@/app/_hooks/useClientes'
import type { Cliente } from '@/database/schema'

export function ClientesPageClient() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showHistorialModal, setShowHistorialModal] = useState(false)
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  const { clientes, loading, refetch, eliminarCliente } = useClientes()

  const handleNuevoCliente = () => {
    setShowCreateModal(true)
  }

  const handleVerDetalle = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setShowDetailModal(true)
  }

  const handleEditarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setShowEditModal(true)
  }

  const handleEliminarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedCliente) return

    const result = await eliminarCliente(selectedCliente.id)
    if (result.success) {
      toast.success('Cliente eliminado correctamente')
      setShowDeleteConfirm(false)
      setSelectedCliente(null)
      await refetch()
    } else {
      toast.error(result.error || 'Error al eliminar cliente')
    }
  }

  const handleRegistrarAbono = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setShowAbonoModal(true)
  }

  const handleVerHistorial = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setShowHistorialModal(true)
  }

  const handleExportar = async (formato: 'csv' | 'excel' | 'pdf', filtrados: Cliente[]) => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'clientes',
          formato,
          datos: filtrados,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `clientes_${new Date().toISOString()}.${formato === 'excel' ? 'xlsx' : formato}`
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

  return (
    <>
      <AuroraClientesPanelUnified
        clientes={clientes}
        onNuevoCliente={handleNuevoCliente}
        onVerDetalle={handleVerDetalle}
        onEditarCliente={handleEditarCliente}
        onEliminarCliente={handleEliminarCliente}
        onRegistrarAbono={handleRegistrarAbono}
        onVerHistorial={handleVerHistorial}
        onExportar={handleExportar}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Modales */}
      <CreateClienteModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          refetch()
        }}
      />

      {selectedCliente && (
        <>
          <EditarClienteModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedCliente(null)
              refetch()
            }}
            clienteId={selectedCliente.id}
          />

          <DetalleVentaModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedCliente(null)
            }}
            ventaId={selectedCliente.id}
          />

          <HistorialClienteModal
            isOpen={showHistorialModal}
            onClose={() => {
              setShowHistorialModal(false)
              setSelectedCliente(null)
            }}
            clienteId={selectedCliente.id}
          />

          <AbonoClienteModal
            isOpen={showAbonoModal}
            onClose={() => {
              setShowAbonoModal(false)
              setSelectedCliente(null)
              refetch()
            }}
            clienteId={selectedCliente.id}
          />
        </>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setSelectedCliente(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de eliminar a ${selectedCliente?.nombre}? Esta acción no se puede deshacer.`}
      />
    </>
  )
}
