'use client'

import { logger } from '@/app/lib/utils/logger'
import type { Distribuidor } from '@/database/schema'
import { useCallback, useEffect, useState } from 'react'

export interface CrearDistribuidorInput {
  nombre: string
  empresa?: string
  email?: string
  telefono?: string
}

interface UseDistribuidoresResult {
  distribuidores: Distribuidor[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  crearDistribuidor: (
    data: CrearDistribuidorInput
  ) => Promise<{ success: boolean; id?: string; error?: string }>
  actualizarDistribuidor: (
    id: string,
    data: Partial<CrearDistribuidorInput>
  ) => Promise<{ success: boolean; error?: string }>
  eliminarDistribuidor: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function useDistribuidores(): UseDistribuidoresResult {
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDistribuidores = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/distribuidores')
      if (!response.ok) throw new Error('Error fetching distribuidores')
      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setDistribuidores(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  const crearDistribuidor = useCallback(
    async (data: CrearDistribuidorInput) => {
      try {
        const response = await fetch('/api/distribuidores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al crear distribuidor')
        }
        const result = await response.json()
        await fetchDistribuidores()
        logger.info('Distribuidor creado', {
          context: 'useDistribuidores',
          data: { id: result.id },
        })
        return { success: true, id: result.id }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al crear distribuidor', err as Error, { context: 'useDistribuidores' })
        return { success: false, error: errorMsg }
      }
    },
    [fetchDistribuidores],
  )

  const actualizarDistribuidor = useCallback(
    async (id: string, data: Partial<CrearDistribuidorInput>) => {
      try {
        const response = await fetch(`/api/distribuidores/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar distribuidor')
        }
        await fetchDistribuidores()
        logger.info('Distribuidor actualizado', { context: 'useDistribuidores', data: { id } })
        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al actualizar distribuidor', err as Error, {
          context: 'useDistribuidores',
        })
        return { success: false, error: errorMsg }
      }
    },
    [fetchDistribuidores],
  )

  const eliminarDistribuidor = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/distribuidores/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al eliminar distribuidor')
        }
        await fetchDistribuidores()
        logger.info('Distribuidor eliminado', { context: 'useDistribuidores', data: { id } })
        return { success: true }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        logger.error('Error al eliminar distribuidor', err as Error, {
          context: 'useDistribuidores',
        })
        return { success: false, error: errorMsg }
      }
    },
    [fetchDistribuidores],
  )

  useEffect(() => {
    fetchDistribuidores()
    const interval = setInterval(fetchDistribuidores, 30000)
    return () => clearInterval(interval)
  }, [fetchDistribuidores])

  return {
    distribuidores,
    loading,
    error,
    refetch: fetchDistribuidores,
    crearDistribuidor,
    actualizarDistribuidor,
    eliminarDistribuidor,
  }
}

export function useDistribuidoresData() {
  const result = useDistribuidores()
  return {
    ...result,
    data: result.distribuidores,
  }
}
