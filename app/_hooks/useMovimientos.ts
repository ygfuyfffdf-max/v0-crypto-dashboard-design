'use client'

import type { Movimiento } from '@/database/schema'
import { useCallback, useEffect, useState } from 'react'

interface UseMovimientosResult {
  movimientos: Movimiento[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface UseMovimientosOptions {
  bancoId?: string
  tipo?: string
  categoria?: string
  limit?: number
}

export function useMovimientos(options: UseMovimientosOptions = {}): UseMovimientosResult {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMovimientos = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (options.bancoId) params.set('bancoId', options.bancoId)
      if (options.tipo) params.set('tipo', options.tipo)
      if (options.categoria) params.set('categoria', options.categoria)
      if (options.limit) params.set('limit', options.limit.toString())

      const response = await fetch(`/api/movimientos?${params}`)
      if (!response.ok) throw new Error('Error fetching movimientos')
      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : [])
      setMovimientos(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [options.bancoId, options.tipo, options.categoria, options.limit])

  useEffect(() => {
    fetchMovimientos()
    const interval = setInterval(fetchMovimientos, 30000)
    return () => clearInterval(interval)
  }, [fetchMovimientos])

  return { movimientos, loading, error, refetch: fetchMovimientos }
}

export function useMovimientosData() {
  const result = useMovimientos()
  return {
    ...result,
    data: result.movimientos,
  }
}

// Hooks específicos por tipo
export function useIngresosBanco(bancoId?: string) {
  const { movimientos, loading, error, refetch } = useMovimientos({ bancoId, tipo: 'ingreso' })
  return { ingresos: movimientos, loading, error, refetch, data: movimientos }
}

export function useGastos(bancoId?: string, categoria?: string) {
  const { movimientos, loading, error, refetch } = useMovimientos({
    bancoId,
    tipo: 'gasto',
    categoria,
  })
  return { gastos: movimientos, loading, error, refetch, data: movimientos }
}

export function useTransferencias(bancoId?: string) {
  const { movimientos, loading, error, refetch } = useMovimientos({
    bancoId,
    tipo: 'transferencia_entrada',
  })
  return { transferencias: movimientos, loading, error, refetch, data: movimientos }
}

export function useCorteBancario(bancoId?: string) {
  // El corte bancario es calculado, no un query simple
  return { corte: null, loading: false, error: null, refetch: async () => {} }
}
