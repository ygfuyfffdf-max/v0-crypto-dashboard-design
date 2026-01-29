/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 API DE ESTADÍSTICAS DE VENTAS — Endpoint para métricas detalladas de ventas
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { ventas } from '@/database/schema'
import { count, sql, sum } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Estadísticas generales de ventas
    const stats = await db
      .select({
        totalVentas: count(),
        montoTotal: sum(ventas.precioTotalVenta),
        montoPagado: sum(ventas.montoPagado),
        ventasCompletas: sql<number>`COUNT(CASE WHEN ${ventas.estadoPago} = 'completo' THEN 1 END)`,
        ventasParciales: sql<number>`COUNT(CASE WHEN ${ventas.estadoPago} = 'parcial' THEN 1 END)`,
        ventasPendientes: sql<number>`COUNT(CASE WHEN ${ventas.estadoPago} = 'pendiente' THEN 1 END)`,
        promedioVenta: sql<number>`AVG(${ventas.precioTotalVenta})`,
      })
      .from(ventas)

    const result = stats[0]

    return NextResponse.json({
      totalVentas: result?.totalVentas ?? 0,
      montoTotal: Number(result?.montoTotal ?? 0),
      montoPagado: Number(result?.montoPagado ?? 0),
      montoPendiente: Number(result?.montoTotal ?? 0) - Number(result?.montoPagado ?? 0),
      ventasCompletas: Number(result?.ventasCompletas ?? 0),
      ventasParciales: Number(result?.ventasParciales ?? 0),
      ventasPendientes: Number(result?.ventasPendientes ?? 0),
      promedioVenta: Number(result?.promedioVenta ?? 0),
      tasaConversion: result?.totalVentas
        ? ((Number(result?.ventasCompletas ?? 0) / result.totalVentas) * 100).toFixed(1)
        : '0',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching sales stats:', error)
    return NextResponse.json(
      {
        totalVentas: 0,
        montoTotal: 0,
        montoPagado: 0,
        montoPendiente: 0,
        ventasCompletas: 0,
        ventasParciales: 0,
        ventasPendientes: 0,
        promedioVenta: 0,
        tasaConversion: '0',
        error: 'Error al obtener estadísticas de ventas',
      },
      { status: 500 },
    )
  }
}
