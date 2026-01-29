'use client'

import { logger } from '@/app/lib/utils/logger'
import type { Cliente } from '@/database/schema'
import { useCallback, useEffect, useState } from 'react'

export interface CrearClienteInput {
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
}

interface UseClientesResult {
  clientes: Cliente[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  crearCliente: (
    data: CrearClienteInput
  ) => Promise<{ success: boolean; id?: string; error?: string }>
  actualizarCliente: (
    id: string,
    data: Partial<CrearClienteInput>
  ) => Promise<{ success: boolean; error?: string }>
  eliminarCliente: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function useClientes(): UseClientesResult {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clientes')
      if (!response.ok) throw new Error('Error fetching clientes')
      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setClientes(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCliente = useCallback(
    async (data: CrearClienteInput) => {
      try {
        const response = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al crear cliente')
        }
        const result = await response.json()
        await fetchClientes()
        logger.info('Cliente creado', { context: 'useClientes', data: { id: result.id } })
        return { success: true, id: result.id }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al crear cliente', err as Error, { context: 'useClientes' })
        return { success: false, error: errorMsg }
      }
    },
    [fetchClientes],
  )

  const actualizarCliente = useCallback(
    async (id: string, data: Partial<CrearClienteInput>) => {
      try {
        const response = await fetch('/api/clientes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar cliente')
        }
        await fetchClientes()
        logger.info('Cliente actualizado', { context: 'useClientes', data: { id } })
        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al actualizar cliente', err as Error, { context: 'useClientes' })
        return { success: false, error: errorMsg }
      }
    },
    [fetchClientes],
  )

  const eliminarCliente = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/clientes?id=${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al eliminar cliente')
        }
        await fetchClientes()
        logger.info('Cliente eliminado', { context: 'useClientes', data: { id } })
        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al eliminar cliente', err as Error, { context: 'useClientes' })
        return { success: false, error: errorMsg }
      }
    },
    [fetchClientes],
  )

  useEffect(() => {
    fetchClientes()
    const interval = setInterval(fetchClientes, 30000)
    return () => clearInterval(interval)
  }, [fetchClientes])

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  }
}

export function useClientesData() {
  const result = useClientes()
  return {
    ...result,
    data: result.clientes,
  }
}
