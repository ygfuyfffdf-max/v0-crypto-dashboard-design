'use client'

import type { Almacen } from '@/database/schema'
import { useCallback, useEffect, useState } from 'react'

interface UseAlmacenResult {
  productos: Almacen[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAlmacen(): UseAlmacenResult {
  const [productos, setProductos] = useState<Almacen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/almacen')
      if (!response.ok) throw new Error('Error fetching almacen')
      const result = await response.json()
      // Extraer data del formato { success: true, data: [] }
      const dataArray = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : []
      setProductos(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductos()
    // Polling cada 30 segundos - el usuario puede usar refetch() para actualizar
    const interval = setInterval(fetchProductos, 30000)
    return () => clearInterval(interval)
  }, [fetchProductos])

  return { productos, loading, error, refetch: fetchProductos }
}

export function useAlmacenData() {
  const result = useAlmacen()
  return {
    ...result,
    data: result.productos,
  }
}

export function useProductos() {
  return useAlmacen()
}

// ═══════════════════════════════════════════════════════════════
// HOOKS PARA ENTRADAS Y SALIDAS - IMPLEMENTACIÓN REAL
// ═══════════════════════════════════════════════════════════════

interface EntradaAlmacen {
  id: string
  fecha: string
  hora: string
  productoId: string
  productoNombre: string
  cantidad: number
  ordenCompraId?: string
  numeroOrden?: string
  precioUnitario: number
  costoTotal: number
  usuario: string
  notas?: string
}

interface SalidaAlmacen {
  id: string
  fecha: string
  hora: string
  productoId: string
  productoNombre: string
  cantidad: number
  ventaId?: string
  clienteNombre?: string
  precioVenta: number
  motivo: 'venta' | 'devolucion' | 'merma' | 'traslado' | 'otro'
  usuario: string
  notas?: string
}

export function useEntradasAlmacen() {
  const [entradas, setEntradas] = useState<EntradaAlmacen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEntradas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/almacen/entradas')
      if (!response.ok) throw new Error('Error fetching entradas')
      const result = await response.json()
      const dataArray = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : []
      setEntradas(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntradas()
    // Polling cada 30 segundos
    const interval = setInterval(fetchEntradas, 30000)
    return () => clearInterval(interval)
  }, [fetchEntradas])

  return { entradas, loading, error, data: entradas, refetch: fetchEntradas }
}

export function useSalidasAlmacen() {
  const [salidas, setSalidas] = useState<SalidaAlmacen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSalidas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/almacen/salidas')
      if (!response.ok) throw new Error('Error fetching salidas')
      const result = await response.json()
      const dataArray = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : []
      setSalidas(dataArray)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSalidas()
    // Polling cada 30 segundos
    const interval = setInterval(fetchSalidas, 30000)
    return () => clearInterval(interval)
  }, [fetchSalidas])

  return { salidas, loading, error, data: salidas, refetch: fetchSalidas }
}
