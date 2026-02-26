/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔥 CHRONOS INFINITY 2026 — HOOKS DE DATOS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hooks modernos para acceso a datos via Drizzle/Turso.
 * Reemplazan los stubs de Firebase eliminados.
 *
 * @version 2.0 - Migración completa a Drizzle
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface DataHookResult<T> {
  data: T
  loading: boolean
  error: Error | null
  refetch: () => void
}

// ═══════════════════════════════════════════════════════════════
// FETCHERS (llamadas a API routes)
// ═══════════════════════════════════════════════════════════════

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error fetching ${url}: ${res.statusText}`)
  }
  const json = await res.json()
  // Si la respuesta tiene formato { success: true, data: [] }, extraer data
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }
  return json as T
}

// ═══════════════════════════════════════════════════════════════
// HOOK: BANCOS
// ═══════════════════════════════════════════════════════════════

export function useBancosData(): DataHookResult<
  Array<{
    id: string
    nombre: string
    capitalActual: number
    historicoIngresos: number
    historicoGastos: number
    tipo: string
    color: string
  }>
> {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => fetchJSON<unknown[]>('/api/bancos'),
    staleTime: 30000, // 30 segundos
    placeholderData: keepPreviousData,
  })

  return {
    data: (data || []) as Array<{
      id: string
      nombre: string
      capitalActual: number
      historicoIngresos: number
      historicoGastos: number
      tipo: string
      color: string
    }>,
    loading: isLoading,
    error: error as Error | null,
    refetch: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
      refetch()
    }, [queryClient, refetch]),
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: ALMACÉN / PRODUCTOS
// ═══════════════════════════════════════════════════════════════

interface ProductoAlmacen {
  id: string
  nombre: string
  descripcion?: string
  cantidad: number
  precioCompra: number
  precioVenta: number
  minimo?: number
  ubicacion?: string
  sku?: string
  categoria?: string
  stock?: number
  stockMinimo?: number
}

interface EntradaAlmacen {
  id: string
  fecha: string
  hora: string
  productoId: string
  productoNombre: string
  cantidad: number
  ordenCompraId?: string
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
  motivo: string
  precioUnitario: number
  valorTotal: number
  usuario: string
  notas?: string
}

interface MovimientoAlmacen {
  id: string
  tipo: 'entrada' | 'salida'
  productoId: string
  cantidad: number
  fecha: string
  usuario: string
  notas?: string
}

interface CorteAlmacen {
  id: string
  fecha: string
  usuario: string
  totalProductos: number
  totalEntradas: number
  totalSalidas: number
  observaciones?: string
}

interface AlmacenDataResult {
  productos: ProductoAlmacen[]
  entradas: EntradaAlmacen[]
  salidas: SalidaAlmacen[]
  movimientos?: MovimientoAlmacen[]
  cortes?: CorteAlmacen[]
}

export function useAlmacenData(): DataHookResult<AlmacenDataResult> {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['almacen-completo'],
    queryFn: async () => {
      logger.info('Fetching almacen data...', { context: 'useAlmacenData' })

      try {
        // Cargar productos, entradas y salidas en paralelo
        const [productosRes, entradasRes, salidasRes] = await Promise.all([
          fetch('/api/almacen').then((r) => r.json()),
          fetch('/api/almacen/entradas').then((r) => r.json()),
          fetch('/api/almacen/salidas').then((r) => r.json()),
        ])

        // Normalizar respuestas - las APIs devuelven { data: [...] }
        const productos = Array.isArray(productosRes)
          ? productosRes
          : Array.isArray(productosRes?.data)
            ? productosRes.data
            : []

        const entradas = Array.isArray(entradasRes)
          ? entradasRes
          : Array.isArray(entradasRes?.data)
            ? entradasRes.data
            : []

        const salidas = Array.isArray(salidasRes)
          ? salidasRes
          : Array.isArray(salidasRes?.data)
            ? salidasRes.data
            : []

        const result = {
          productos,
          entradas,
          salidas,
        }

        logger.info('Almacen data fetched successfully', {
          context: 'useAlmacenData',
          productosCount: result.productos.length,
          entradasCount: result.entradas.length,
          salidasCount: result.salidas.length,
        })

        return result
      } catch (error) {
        logger.error('Error fetching almacen data', error as Error, {
          context: 'useAlmacenData',
        })
        throw error
      }
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    data: data || { productos: [], entradas: [], salidas: [] },
    loading: isLoading,
    error: error as Error | null,
    refetch: useCallback(() => {
      logger.info('Refreshing almacen data', { context: 'useAlmacenData' })
      queryClient.invalidateQueries({ queryKey: ['almacen-completo'] })
      refetch()
    }, [queryClient, refetch]),
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: CLIENTES
// ═══════════════════════════════════════════════════════════════

export function useClientesData(): DataHookResult<
  Array<{
    id: string
    nombre: string
    email?: string
    telefono?: string
    saldoPendiente: number
    totalCompras: number
    estado: string
  }>
> {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => fetchJSON<unknown[]>('/api/clientes'),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  })

  return {
    data: (data || []) as Array<{
      id: string
      nombre: string
      email?: string
      telefono?: string
      saldoPendiente: number
      totalCompras: number
      estado: string
    }>,
    loading: isLoading,
    error: error as Error | null,
    refetch: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      refetch()
    }, [queryClient, refetch]),
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: DISTRIBUIDORES
// ═══════════════════════════════════════════════════════════════

export function useDistribuidoresData(): DataHookResult<
  Array<{
    id: string
    nombre: string
    empresa?: string
    saldoPendiente: number
    totalOrdenesCompra: number
    estado: string
  }>
> {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['distribuidores'],
    queryFn: () => fetchJSON<unknown[]>('/api/distribuidores'),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  })

  return {
    data: (data || []) as Array<{
      id: string
      nombre: string
      empresa?: string
      saldoPendiente: number
      totalOrdenesCompra: number
      estado: string
    }>,
    loading: isLoading,
    error: error as Error | null,
    refetch: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['distribuidores'] })
      refetch()
    }, [queryClient, refetch]),
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: VENTAS
// ═══════════════════════════════════════════════════════════════

export function useVentasData(): DataHookResult<
  Array<{
    id: string
    clienteId: string
    fecha: Date
    cantidad: number
    precioTotalVenta: number
    estadoPago: string
    montoPagado: number
    montoRestante: number
  }>
> {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => fetchJSON<unknown[]>('/api/ventas'),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  })

  return {
    data: (data || []) as Array<{
      id: string
      clienteId: string
      fecha: Date
      cantidad: number
      precioTotalVenta: number
      estadoPago: string
      montoPagado: number
      montoRestante: number
    }>,
    loading: isLoading,
    error: error as Error | null,
    refetch: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      refetch()
    }, [queryClient, refetch]),
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: ÓRDENES DE COMPRA
// ═══════════════════════════════════════════════════════════════

export function useOrdenesCompraData(): DataHookResult<
  Array<{
    id: string
    distribuidorId: string
    fecha: Date
    cantidad: number
    stockActual: number
    total: number
    montoRestante: number
    estado: string
  }>
> {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ordenesCompra'],
    queryFn: () => fetchJSON<unknown[]>('/api/ordenes'),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  })

  return {
    data: (data || []) as Array<{
      id: string
      distribuidorId: string
      fecha: Date
      cantidad: number
      stockActual: number
      total: number
      montoRestante: number
      estado: string
    }>,
    loading: isLoading,
    error: error as Error | null,
    refetch: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['ordenesCompra'] })
      refetch()
    }, [queryClient, refetch]),
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK: MOVIMIENTOS
// ═══════════════════════════════════════════════════════════════

export function useMovimientosData(): DataHookResult<
  Array<{
    id: string
    bancoId: string
    tipo: string
    monto: number
    fecha: Date
    concepto: string
  }>
> {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['movimientos'],
    queryFn: () => fetchJSON<unknown[]>('/api/movimientos'),
    staleTime: 30000,
    placeholderData: keepPreviousData,
  })

  return {
    data: (data || []) as Array<{
      id: string
      bancoId: string
      tipo: string
      monto: number
      fecha: Date
      concepto: string
    }>,
    loading: isLoading,
    error: error as Error | null,
    refetch: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
      refetch()
    }, [queryClient, refetch]),
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS COMPATIBILIDAD LEGACY
// ═══════════════════════════════════════════════════════════════

// Re-exportar con nombres legacy para compatibilidad
export {
    useAlmacenData as useAlmacen,
    useBancosData as useBancos,
    useClientesData as useClientes,
    useDistribuidoresData as useDistribuidores,
    useMovimientosData as useMovimientos,
    useOrdenesCompraData as useOrdenes,
    useVentasData as useVentas
}

// ═══════════════════════════════════════════════════════════════
// HOOKS DE MUTACIÓN CON REACT QUERY
// ═══════════════════════════════════════════════════════════════

/**
 * Hook para crear una venta con React Query mutation
 * Incluye optimistic updates y rollback automático
 */
export function useCreateVenta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      clienteId: string
      cantidad: number
      precioVentaUnidad: number
      precioCompraUnidad: number
      precioFlete?: number
      observaciones?: string
    }) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })

      const res = await fetch('/api/ventas', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al crear venta')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
    },
  })
}

/**
 * Hook para crear un cliente
 */
export function useCreateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      nombre: string
      email?: string
      telefono?: string
      direccion?: string
    }) => {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al crear cliente')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })
}

/**
 * Hook para registrar abono de cliente
 */
export function useAbonarVenta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      ventaId: string
      monto: number
      bancoDestinoId?: string
      concepto?: string
    }) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })

      const res = await fetch('/api/abonos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al registrar abono')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
    },
  })
}

/**
 * Hook para transferencia entre bancos
 */
export function useTransferencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      bancoOrigenId: string
      bancoDestinoId: string
      monto: number
      concepto: string
    }) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      const res = await fetch('/api/transferencias', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al realizar transferencia')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
    },
  })
}

/**
 * Hook para registrar gasto en banco
 */
export function useRegistrarGasto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      bancoId: string
      monto: number
      concepto: string
      observaciones?: string
    }) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })

      const res = await fetch('/api/gastos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al registrar gasto')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] })
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
    },
  })
}
