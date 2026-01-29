'use client'

// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 — HOOK DE MÉTRICAS FINANCIERAS
// Acceso rápido a las 30 métricas CFO desde cualquier componente
// Usa Zustand store para datos en tiempo real
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useChronosStore } from '@/app/lib/store'
import { BANCOS_CONFIG, type BancoId } from '@/app/_lib/constants/bancos'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface MetricasResumen {
  // Capital
  capitalTotal: number
  capitalPorBanco: Record<BancoId, number>
  bancoMayorCapital: { id: BancoId; nombre: string; monto: number }

  // Ingresos/Gastos
  totalIngresos: number
  totalGastos: number
  balanceNeto: number

  // Ventas
  totalVentas: number
  ventasPendientes: number
  ventasCompletadas: number
  montoVentasPendientes: number

  // Clientes
  totalClientes: number
  clientesActivos: number
  clientesMorosos: number

  // Métricas calculadas
  roce: number // Return on Capital Employed %
  margenNeto: number // Margen neto %
  liquidezDias: number // Días de liquidez
  eficienciaGYA: number // Eficiencia distribución %
  saludFinanciera: number // Índice 0-100
  rotacionCapital: number // Veces al año

  // Distribución GYA totales
  gyaBovedaMonte: number
  gyaFletes: number
  gyaUtilidades: number

  // Tendencias (placeholder para futuro)
  tendencia: 'creciendo' | 'estable' | 'decreciendo'
}

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useMetricasRapidas(): MetricasResumen {
  const bancos = useChronosStore((state) => state.bancos)
  const ventas = useChronosStore((state) => state.ventas)
  const clientes = useChronosStore((state) => state.clientes)

  return useMemo(() => {
    // === CAPITAL ===
    const bancosArray = Object.entries(bancos)
    const capitalTotal = bancosArray.reduce((sum, [, b]) => sum + b.capitalActual, 0)

    const capitalPorBanco = bancosArray.reduce(
      (acc, [id, b]) => {
        acc[id as BancoId] = b.capitalActual
        return acc
      },
      {} as Record<BancoId, number>,
    )

    const bancoMayor = bancosArray.reduce(
      (max, [id, b]) => {
        if (b.capitalActual > max.monto) {
          return {
            id: id as BancoId,
            nombre: BANCOS_CONFIG[id as BancoId]?.nombre || b.nombre,
            monto: b.capitalActual,
          }
        }
        return max
      },
      { id: 'boveda_monte' as BancoId, nombre: 'Bóveda Monte', monto: 0 },
    )

    // === INGRESOS/GASTOS ===
    const totalIngresos = bancosArray.reduce((sum, [, b]) => sum + b.historicoIngresos, 0)
    const totalGastos = bancosArray.reduce((sum, [, b]) => sum + b.historicoGastos, 0)
    const balanceNeto = totalIngresos - totalGastos

    // === VENTAS ===
    const totalVentas = ventas.length
    const ventasPendientes = ventas.filter((v) => v.estadoPago === 'pendiente').length
    const ventasCompletadas = ventas.filter((v) => v.estadoPago === 'completo').length
    const montoVentasPendientes = ventas
      .filter((v) => v.estadoPago === 'pendiente')
      .reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)

    // === CLIENTES ===
    const totalClientes = clientes.length
    const clientesActivos = clientes.filter((c) => c.estado === 'activo').length
    // Morosos: clientes con deudas pendientes (calculado desde ventas)
    const clientesConDeuda = new Set(
      ventas
        .filter((v) => v.estadoPago === 'pendiente' || v.estadoPago === 'parcial')
        .map((v) => v.clienteId),
    )
    const clientesMorosos = clientesConDeuda.size

    // === GYA TOTALES ===
    const gyaBovedaMonte = ventas.reduce((sum, v) => sum + (v.bovedaMonte || 0), 0)
    const gyaFletes = ventas.reduce((sum, v) => sum + (v.fleteUtilidad || 0), 0)
    const gyaUtilidades = ventas.reduce((sum, v) => sum + (v.utilidad || 0), 0)

    // === MÉTRICAS CALCULADAS ===

    // ROCE: (Ganancia / Capital) * 100
    const roce = capitalTotal > 0 ? (gyaUtilidades / capitalTotal) * 100 : 0

    // Margen Neto: (Utilidades / Ventas Totales) * 100
    const ventasTotalesMonto = ventas.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const margenNeto = ventasTotalesMonto > 0 ? (gyaUtilidades / ventasTotalesMonto) * 100 : 0

    // Liquidez: Capital / (Gastos promedio diario estimado)
    const gastoPromedioDiario = totalGastos / 365
    const liquidezDias =
      gastoPromedioDiario > 0 ? Math.floor(capitalTotal / gastoPromedioDiario) : 365

    // Eficiencia GYA: Utilidades / (Bóveda Monte + Fletes) * 100
    const costoTotal = gyaBovedaMonte + gyaFletes
    const eficienciaGYA = costoTotal > 0 ? (gyaUtilidades / costoTotal) * 100 : 0

    // Salud Financiera: Ponderación de múltiples factores (0-100)
    const saludCapital = Math.min(50, (capitalTotal / 1000000) * 50) // Max 50 puntos por capital
    const saludLiquidez = Math.min(20, (liquidezDias / 90) * 20) // Max 20 puntos por liquidez
    const saludMargen = Math.min(15, (margenNeto / 30) * 15) // Max 15 puntos por margen
    const saludEficiencia = Math.min(15, (eficienciaGYA / 50) * 15) // Max 15 puntos por eficiencia
    const saludFinanciera = Math.round(saludCapital + saludLiquidez + saludMargen + saludEficiencia)

    // Rotación de Capital: Ingresos / Capital
    const rotacionCapital = capitalTotal > 0 ? totalIngresos / capitalTotal : 0

    // Tendencia basada en balance
    let tendencia: 'creciendo' | 'estable' | 'decreciendo' = 'estable'
    if (balanceNeto > totalIngresos * 0.1) tendencia = 'creciendo'
    if (balanceNeto < 0) tendencia = 'decreciendo'

    return {
      // Capital
      capitalTotal,
      capitalPorBanco,
      bancoMayorCapital: bancoMayor,

      // Ingresos/Gastos
      totalIngresos,
      totalGastos,
      balanceNeto,

      // Ventas
      totalVentas,
      ventasPendientes,
      ventasCompletadas,
      montoVentasPendientes,

      // Clientes
      totalClientes,
      clientesActivos,
      clientesMorosos,

      // Métricas calculadas
      roce: Number(roce.toFixed(2)),
      margenNeto: Number(margenNeto.toFixed(2)),
      liquidezDias,
      eficienciaGYA: Number(eficienciaGYA.toFixed(2)),
      saludFinanciera,
      rotacionCapital: Number(rotacionCapital.toFixed(2)),

      // GYA
      gyaBovedaMonte,
      gyaFletes,
      gyaUtilidades,

      // Tendencias
      tendencia,
    }
  }, [bancos, ventas, clientes])
}

// ═══════════════════════════════════════════════════════════════
// HOOKS ESPECÍFICOS (más ligeros)
// ═══════════════════════════════════════════════════════════════

export function useCapitalTotal(): number {
  const bancos = useChronosStore((state) => state.bancos)
  return useMemo(() => Object.values(bancos).reduce((sum, b) => sum + b.capitalActual, 0), [bancos])
}

export function useSaludFinanciera(): number {
  const metricas = useMetricasRapidas()
  return metricas.saludFinanciera
}

export function useROCE(): number {
  const metricas = useMetricasRapidas()
  return metricas.roce
}

export function useLiquidezDias(): number {
  const metricas = useMetricasRapidas()
  return metricas.liquidezDias
}

export function useDistribucionGYA(): { monte: number; fletes: number; utilidades: number } {
  const metricas = useMetricasRapidas()
  return {
    monte: metricas.gyaBovedaMonte,
    fletes: metricas.gyaFletes,
    utilidades: metricas.gyaUtilidades,
  }
}

export default useMetricasRapidas
