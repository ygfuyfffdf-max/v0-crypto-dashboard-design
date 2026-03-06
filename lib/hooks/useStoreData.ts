"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store/useAppStore"
import type { IngresosBanco, GastosBanco, Transferencia, CorteBanco } from "@/types"

// Standard hook return interface matching the old Firebase hooks
interface HookResult<T> {
  data: T[]
  loading: boolean
  error: string | null
}

// ═══════════════════════════════════════════════════
// DATA HOOKS — Replace Firebase firestore-hooks.service
// ═══════════════════════════════════════════════════

export function useDistribuidoresData(): HookResult<any> {
  const distribuidores = useAppStore((s) => s.distribuidores)
  return { data: distribuidores, loading: false, error: null }
}

export function useClientesData(): HookResult<any> {
  const clientes = useAppStore((s) => s.clientes)
  return { data: clientes, loading: false, error: null }
}

export function useVentasData(): HookResult<any> {
  const ventas = useAppStore((s) => s.ventas)
  return { data: ventas, loading: false, error: null }
}

export function useOrdenesCompraData(): HookResult<any> {
  const ordenesCompra = useAppStore((s) => s.ordenesCompra)
  return { data: ordenesCompra, loading: false, error: null }
}

export function useAlmacenData(): HookResult<any> {
  const productos = useAppStore((s) => s.productos)
  return { data: productos, loading: false, error: null }
}

export function useBancoData(bancoId: string) {
  const bancos = useAppStore((s) => s.bancos)
  const banco = bancos.find((b) => b.id === bancoId)

  const stats = useMemo(
    () => ({
      totalIngresos: banco?.historicoIngresos ?? 0,
      totalGastos: banco?.historicoGastos ?? 0,
      saldoNeto: banco?.capitalActual ?? 0,
      transacciones: (banco?.operaciones?.length ?? 0),
    }),
    [banco],
  )

  return { data: banco ? [banco] : [], loading: false, error: null, stats }
}

export function useIngresosBanco(bancoId: string): HookResult<IngresosBanco> {
  const ingresos = useAppStore((s) => s.ingresos)
  const filtered = useMemo(
    () => ingresos.filter((i) => i.bancoId === bancoId),
    [ingresos, bancoId],
  )
  return { data: filtered, loading: false, error: null }
}

export function useGastos(bancoId: string): HookResult<GastosBanco> {
  const gastos = useAppStore((s) => s.gastos)
  const filtered = useMemo(
    () => gastos.filter((g) => g.bancoId === bancoId),
    [gastos, bancoId],
  )
  return { data: filtered, loading: false, error: null }
}

export function useTransferencias(bancoId: string): HookResult<Transferencia> {
  const transferencias = useAppStore((s) => s.transferencias)
  const filtered = useMemo(
    () => transferencias.filter((t) => t.bancoOrigen === bancoId || t.bancoDestino === bancoId),
    [transferencias, bancoId],
  )
  return { data: filtered, loading: false, error: null }
}

export function useCorteBancario(_bancoId: string): HookResult<CorteBanco> {
  return { data: [], loading: false, error: null }
}

export function useEntradasAlmacen(): HookResult<any> {
  const productos = useAppStore((s) => s.productos)
  const entradas = useMemo(
    () => productos.flatMap((p) => (p.entradas ?? []).map((e: any) => ({ ...e, producto: p.nombre }))),
    [productos],
  )
  return { data: entradas, loading: false, error: null }
}

export function useSalidasAlmacen(): HookResult<any> {
  const productos = useAppStore((s) => s.productos)
  const salidas = useMemo(
    () => productos.flatMap((p) => (p.salidas ?? []).map((s: any) => ({ ...s, producto: p.nombre }))),
    [productos],
  )
  return { data: salidas, loading: false, error: null }
}

export function useDashboardData() {
  const distribuidores = useAppStore((s) => s.distribuidores)
  const clientes = useAppStore((s) => s.clientes)
  const ventas = useAppStore((s) => s.ventas)
  const ordenesCompra = useAppStore((s) => s.ordenesCompra)
  const bancos = useAppStore((s) => s.bancos)
  const productos = useAppStore((s) => s.productos)

  const totales = useMemo(
    () => ({
      totalDistribuidores: distribuidores.length,
      totalClientes: clientes.length,
      totalVentas: ventas.length,
      totalOrdenesCompra: ordenesCompra.length,
      totalProductos: productos.length,
      capitalTotal: bancos.reduce((sum, b) => sum + (b.capitalActual ?? 0), 0),
      deudaDistribuidores: distribuidores.reduce((sum, d) => sum + d.deudaTotal, 0),
      deudaClientes: clientes.reduce((sum, c) => sum + c.deudaTotal, 0),
    }),
    [distribuidores, clientes, ventas, ordenesCompra, bancos, productos],
  )

  return { data: [], loading: false, error: null, totales }
}

export function useGYAData(): HookResult<any> {
  return { data: [], loading: false, error: null }
}

// ═══════════════════════════════════════════════════
// EXPORT ALIASES — Match old hook names
// ═══════════════════════════════════════════════════
export const useVentas = useVentasData
export const useOrdenesCompra = useOrdenesCompraData
export const useProductos = useAlmacenData
export const useClientes = useClientesData
export const useDistribuidores = useDistribuidoresData
