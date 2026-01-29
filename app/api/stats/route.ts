/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 API DE ESTADÍSTICAS — Endpoint para estadísticas generales del dashboard
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { bancos, clientes, movimientos, ordenesCompra, ventas } from '@/database/schema'
import { count, sql, sum } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Capital total de todos los bancos
    const capitalResult = await db
      .select({
        total: sum(bancos.capitalActual),
      })
      .from(bancos)

    // Total de ventas
    const ventasResult = await db
      .select({
        total: count(),
        monto: sum(ventas.precioTotalVenta),
      })
      .from(ventas)

    // Total de clientes
    const clientesResult = await db.select({ total: count() }).from(clientes)

    // Total de órdenes
    const ordenesResult = await db.select({ total: count() }).from(ordenesCompra)

    // Movimientos del mes actual
    const movimientosResult = await db
      .select({
        ingresos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientos.tipo} = 'ingreso' THEN ${movimientos.monto} ELSE 0 END), 0)`,
        gastos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientos.tipo} = 'egreso' THEN ${movimientos.monto} ELSE 0 END), 0)`,
      })
      .from(movimientos)

    return NextResponse.json({
      capitalTotal: Number(capitalResult[0]?.total ?? 0),
      totalVentas: ventasResult[0]?.total ?? 0,
      montoVentas: Number(ventasResult[0]?.monto ?? 0),
      totalClientes: clientesResult[0]?.total ?? 0,
      totalOrdenes: ordenesResult[0]?.total ?? 0,
      ingresosMes: movimientosResult[0]?.ingresos ?? 0,
      gastosMes: movimientosResult[0]?.gastos ?? 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        capitalTotal: 0,
        totalVentas: 0,
        montoVentas: 0,
        totalClientes: 0,
        totalOrdenes: 0,
        ingresosMes: 0,
        gastosMes: 0,
        error: 'Error al obtener estadísticas',
      },
      { status: 500 },
    )
  }
}
