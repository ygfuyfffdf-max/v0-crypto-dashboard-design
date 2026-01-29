'use client'

import { logger } from '@/app/lib/utils/logger'
import type { Cliente, Venta } from '@/database/schema'
import { useCallback, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface VentaConCliente extends Venta {
  cliente?: Cliente
}

export interface CrearVentaInput {
  clienteId: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad?: number
  precioFlete?: number
  montoPagado?: number
  observaciones?: string
  ocRelacionada?: string
}

interface UseVentasResult {
  ventas: VentaConCliente[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  crearVenta: (data: CrearVentaInput) => Promise<{ success: boolean; error?: string }>
  actualizarVenta: (
    id: string,
    data: Partial<CrearVentaInput>
  ) => Promise<{ success: boolean; error?: string }>
  eliminarVenta: (id: string) => Promise<{ success: boolean; error?: string }>
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useVentas
// ═══════════════════════════════════════════════════════════════

export function useVentas(): UseVentasResult {
  const [ventas, setVentas] = useState<VentaConCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchVentas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ventas')
      if (!response.ok) throw new Error('Error fetching ventas')
      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setVentas(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  const crearVenta = useCallback(
    async (data: CrearVentaInput) => {
      try {
        const response = await fetch('/api/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al crear venta')
        }
        await fetchVentas()
        logger.info('Venta creada exitosamente', { context: 'useVentas' })
        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al crear venta', err as Error, { context: 'useVentas' })
        return { success: false, error: errorMsg }
      }
    },
    [fetchVentas],
  )

  const actualizarVenta = useCallback(
    async (id: string, data: Partial<CrearVentaInput>) => {
      try {
        const response = await fetch('/api/ventas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar venta')
        }
        await fetchVentas()
        logger.info('Venta actualizada', { context: 'useVentas', data: { id } })
        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al actualizar venta', err as Error, { context: 'useVentas' })
        return { success: false, error: errorMsg }
      }
    },
    [fetchVentas],
  )

  const eliminarVenta = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/ventas?id=${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al eliminar venta')
        }
        await fetchVentas()
        logger.info('Venta eliminada', { context: 'useVentas', data: { id } })
        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al eliminar venta', err as Error, { context: 'useVentas' })
        return { success: false, error: errorMsg }
      }
    },
    [fetchVentas],
  )

  useEffect(() => {
    fetchVentas()
    const interval = setInterval(fetchVentas, 30000)
    return () => clearInterval(interval)
  }, [fetchVentas])

  return {
    ventas,
    loading,
    error,
    refetch: fetchVentas,
    crearVenta,
    actualizarVenta,
    eliminarVenta,
  }
}

// Alias para compatibilidad
export function useVentasData() {
  const result = useVentas()
  return {
    ...result,
    data: result.ventas,
  }
}
