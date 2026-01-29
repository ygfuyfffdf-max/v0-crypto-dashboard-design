'use client'

import type { Distribuidor, OrdenCompra } from '@/database/schema'
import { useCallback, useEffect, useState } from 'react'

export interface OrdenConDistribuidor extends OrdenCompra {
  distribuidor?: Distribuidor
}

interface UseOrdenesResult {
  ordenes: OrdenConDistribuidor[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useOrdenes(): UseOrdenesResult {
  const [ordenes, setOrdenes] = useState<OrdenConDistribuidor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchOrdenes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ordenes')
      if (!response.ok) throw new Error('Error fetching ordenes')
      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setOrdenes(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrdenes()
    const interval = setInterval(fetchOrdenes, 30000)
    return () => clearInterval(interval)
  }, [fetchOrdenes])

  return { ordenes, loading, error, refetch: fetchOrdenes }
}

export function useOrdenesCompra() {
  return useOrdenes()
}

export function useOrdenesCompraData() {
  const result = useOrdenes()
  return {
    ...result,
    data: result.ordenes,
  }
}
