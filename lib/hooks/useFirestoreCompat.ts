"use client"

/**
 * Compatibility hooks that wrap useAppStore (Zustand/Turso)
 * to match the V0 CHRONOS Firebase hook interface.
 * 
 * All hooks return: { data: T[], loading: boolean, error: string | null, refresh: () => Promise<void> }
 */

import { useMemo, useCallback } from "react"
import { useAppStore } from "@/lib/store/useAppStore"
import type {
  Banco,
  Distribuidor,
  Cliente,
  OrdenCompra,
  Venta,
  Producto,
  IngresosBanco,
  GastosBanco,
  Transferencia,
} from "@/types"

// ===================================================================
// TYPES — matching V0 CHRONOS HookResult<T>
// ===================================================================
export interface HookResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export interface BancoStats {
  totalIngresos: number
  totalGastos: number
  saldoNeto: number
  transacciones: number
}

export interface BancoDataResult {
  data: Banco[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  stats: BancoStats
}

export interface DashboardTotales {
  totalVentas: number
  totalOrdenesCompra: number
  totalCapital: number
  totalClientes: number
  totalProductos: number
  totalDistribuidores: number
}

export interface DashboardDataResult {
  data: DashboardTotales[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  totales: DashboardTotales
}

// ===================================================================
// BASE HELPER
// ===================================================================
function useStoreHook<T>(selector: (state: ReturnType<typeof useAppStore.getState>) => T[]): HookResult<T> {
  const data = useAppStore(selector)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return {
    data,
    loading: !dbLoaded,
    error: null,
    refresh,
  }
}

// ===================================================================
// VENTAS
// ===================================================================
export function useVentasData(): HookResult<Venta> {
  return useStoreHook((s) => s.ventas)
}

export const useVentas = useVentasData

// ===================================================================
// BANCOS
// ===================================================================
export function useBancosData(): HookResult<Banco> {
  return useStoreHook((s) => s.bancos)
}

export function useBancoData(bancoId?: string): BancoDataResult {
  const bancos = useAppStore((s) => s.bancos)
  const ingresos = useAppStore((s) => s.ingresos)
  const gastos = useAppStore((s) => s.gastos)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const data = useMemo(() => {
    if (!bancoId) return bancos
    return bancos.filter((b) => b.id === bancoId)
  }, [bancos, bancoId])

  const stats = useMemo((): BancoStats => {
    if (!bancoId) {
      return { totalIngresos: 0, totalGastos: 0, saldoNeto: 0, transacciones: 0 }
    }
    const bancoIngresos = ingresos.filter((i) => i.bancoId === bancoId)
    const bancoGastos = gastos.filter((g) => g.bancoId === bancoId)
    const totalIngresos = bancoIngresos.reduce((sum, i) => sum + (i.monto || 0), 0)
    const totalGastos = bancoGastos.reduce((sum, g) => sum + (g.monto || 0), 0)
    return {
      totalIngresos,
      totalGastos,
      saldoNeto: totalIngresos - totalGastos,
      transacciones: bancoIngresos.length + bancoGastos.length,
    }
  }, [bancoId, ingresos, gastos])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return {
    data,
    loading: !dbLoaded,
    error: null,
    refresh,
    stats,
  }
}

// ===================================================================
// ALMACEN / PRODUCTOS
// ===================================================================
export function useAlmacenData(): HookResult<Producto> {
  return useStoreHook((s) => s.productos)
}

export const useProductos = useAlmacenData

// ===================================================================
// CLIENTES
// ===================================================================
export function useClientesData(): HookResult<Cliente> {
  return useStoreHook((s) => s.clientes)
}

export const useClientes = useClientesData

// ===================================================================
// DISTRIBUIDORES
// ===================================================================
export function useDistribuidoresData(): HookResult<Distribuidor> {
  return useStoreHook((s) => s.distribuidores)
}

export const useDistribuidores = useDistribuidoresData

// ===================================================================
// ORDENES DE COMPRA
// ===================================================================
export function useOrdenesCompraData(): HookResult<OrdenCompra> {
  return useStoreHook((s) => s.ordenesCompra)
}

export const useOrdenesCompra = useOrdenesCompraData

// ===================================================================
// DASHBOARD
// ===================================================================
export function useDashboardData(): DashboardDataResult {
  const ventas = useAppStore((s) => s.ventas)
  const ordenesCompra = useAppStore((s) => s.ordenesCompra)
  const productos = useAppStore((s) => s.productos)
  const clientes = useAppStore((s) => s.clientes)
  const distribuidores = useAppStore((s) => s.distribuidores)
  const totalCapital = useAppStore((s) => s.totalCapital)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const totales = useMemo((): DashboardTotales => ({
    totalVentas: ventas.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0),
    totalOrdenesCompra: ordenesCompra.reduce((sum, o) => sum + (o.costoTotal || 0), 0),
    totalCapital,
    totalClientes: clientes.length,
    totalProductos: productos.length,
    totalDistribuidores: distribuidores.length,
  }), [ventas, ordenesCompra, totalCapital, clientes, productos, distribuidores])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return {
    data: [totales],
    loading: !dbLoaded,
    error: null,
    refresh,
    totales,
  }
}

// ===================================================================
// GASTOS Y ASIGNACIONES (GYA)
// ===================================================================
export function useGYAData(): HookResult<GastosBanco> {
  return useStoreHook((s) => s.gastos)
}

// ===================================================================
// INGRESOS POR BANCO
// ===================================================================
export function useIngresosBanco(bancoId?: string): HookResult<IngresosBanco> {
  const ingresos = useAppStore((s) => s.ingresos)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const data = useMemo(() => {
    if (!bancoId) return ingresos
    return ingresos.filter((i) => i.bancoId === bancoId)
  }, [ingresos, bancoId])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return { data, loading: !dbLoaded, error: null, refresh }
}

// ===================================================================
// GASTOS POR BANCO
// ===================================================================
export function useGastos(bancoId?: string): HookResult<GastosBanco> {
  const gastos = useAppStore((s) => s.gastos)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const data = useMemo(() => {
    if (!bancoId) return gastos
    return gastos.filter((g) => g.bancoId === bancoId)
  }, [gastos, bancoId])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return { data, loading: !dbLoaded, error: null, refresh }
}

// ===================================================================
// TRANSFERENCIAS POR BANCO
// ===================================================================
export function useTransferencias(bancoId?: string): HookResult<Transferencia> {
  const transferencias = useAppStore((s) => s.transferencias)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const data = useMemo(() => {
    if (!bancoId) return transferencias
    return transferencias.filter(
      (t) => t.bancoOrigen === bancoId || t.bancoDestino === bancoId
    )
  }, [transferencias, bancoId])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return { data, loading: !dbLoaded, error: null, refresh }
}

// ===================================================================
// CORTE BANCARIO
// ===================================================================
export function useCorteBancario(bancoId?: string) {
  const bancos = useAppStore((s) => s.bancos)
  const ingresos = useAppStore((s) => s.ingresos)
  const gastos = useAppStore((s) => s.gastos)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const data = useMemo(() => {
    if (!bancoId) return []
    const banco = bancos.find((b) => b.id === bancoId)
    if (!banco) return []
    const bancoIngresos = ingresos.filter((i) => i.bancoId === bancoId)
    const bancoGastos = gastos.filter((g) => g.bancoId === bancoId)
    const totalIng = bancoIngresos.reduce((s, i) => s + (i.monto || 0), 0)
    const totalGas = bancoGastos.reduce((s, g) => s + (g.monto || 0), 0)
    return [{
      id: `corte-${bancoId}`,
      bancoId,
      periodo: "mensual" as const,
      fechaInicio: new Date(Date.now() - 30 * 86400000).toISOString(),
      fechaFin: new Date().toISOString(),
      capitalInicial: banco.capitalActual - totalIng + totalGas,
      totalIngresosPeriodo: totalIng,
      totalGastosPeriodo: totalGas,
      capitalFinal: banco.capitalActual,
      diferencia: totalIng - totalGas,
      variacionPorcentaje: banco.capitalActual > 0
        ? ((totalIng - totalGas) / banco.capitalActual) * 100
        : 0,
      estado: (totalIng >= totalGas ? "positivo" : "negativo") as "positivo" | "negativo",
      createdAt: new Date().toISOString(),
    }]
  }, [bancoId, bancos, ingresos, gastos])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return { data, loading: !dbLoaded, error: null, refresh }
}

// ===================================================================
// ENTRADAS / SALIDAS ALMACEN
// ===================================================================
export function useEntradasAlmacen(): HookResult<Producto> {
  const productos = useAppStore((s) => s.productos)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const data = useMemo(() => {
    return productos.filter((p) => p.totalEntradas > 0)
  }, [productos])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return { data, loading: !dbLoaded, error: null, refresh }
}

export function useSalidasAlmacen(): HookResult<Producto> {
  const productos = useAppStore((s) => s.productos)
  const dbLoaded = useAppStore((s) => s.dbLoaded)
  const loadFromDB = useAppStore((s) => s.loadFromDB)

  const data = useMemo(() => {
    return productos.filter((p) => p.totalSalidas > 0)
  }, [productos])

  const refresh = useCallback(async () => {
    await loadFromDB()
  }, [loadFromDB])

  return { data, loading: !dbLoaded, error: null, refresh }
}
