"use client"

/**
 * Compatibility shim — re-exports all hooks from useFirestoreCompat (Zustand-backed).
 * Bento panels import from this path; this file ensures they work without Firebase SDK.
 */

// Re-export all hooks
export {
  useVentasData,
  useVentas,
  useBancosData,
  useBancoData,
  useAlmacenData,
  useProductos,
  useClientesData,
  useClientes,
  useDistribuidoresData,
  useDistribuidores,
  useOrdenesCompraData,
  useOrdenesCompra,
  useDashboardData,
  useGYAData,
  useIngresosBanco,
  useGastos,
  useTransferencias,
  useCorteBancario,
  useEntradasAlmacen,
  useSalidasAlmacen,
} from "@/lib/hooks/useFirestoreCompat"

// Re-export types so existing imports still resolve
export type {
  Banco,
  OrdenCompra,
  Venta,
  Distribuidor,
  Cliente,
  HistorialPago,
  Producto,
  MovimientoAlmacen,
  Operacion,
  IngresosBanco,
  GastosBanco,
  Transferencia,
  CorteBanco,
} from "@/types"

// Re-export hook result types
export type { HookResult, BancoStats, BancoDataResult, DashboardTotales, DashboardDataResult } from "@/lib/hooks/useFirestoreCompat"
