/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 ANALYTICS METRICS API — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { movimientos, abonos } from '@/database/schema'
import { and, gte, lte } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    const startTimestamp = Math.floor(startDate.getTime() / 1000)
    const endTimestamp = Math.floor(now.getTime() / 1000)

    // Fetch all movements in period
    const movimientosData = await db.query.movimientos.findMany({
      where: and(
        gte(movimientos.fecha, startTimestamp),
        lte(movimientos.fecha, endTimestamp)
      ),
    })

    // Calculate totals from movimientos
    let totalIngresos = 0
    let totalEgresos = 0
    let totalGastos = 0
    let totalTransferencias = 0

    movimientosData.forEach((mov) => {
      if (mov.tipo === 'ingreso') totalIngresos += mov.monto
      else if (mov.tipo === 'gasto') {
        totalEgresos += mov.monto
        totalGastos += mov.monto // Gastos are tracked in movimientos
      }
      else if (mov.tipo === 'transferencia_entrada' || mov.tipo === 'transferencia_salida') {
        totalTransferencias += mov.monto
      }
    })

    // Fetch abonos total
    const abonosData = await db.query.abonos.findMany({
      where: and(
        gte(abonos.fecha, startTimestamp),
        lte(abonos.fecha, endTimestamp)
      ),
    })
    const totalAbonos = abonosData.reduce((acc, a) => acc + a.monto, 0)

    // Calculate balance
    const balanceGeneral = totalIngresos + totalAbonos - totalEgresos
    const flujoNeto = totalIngresos - totalEgresos

    // Get previous period for comparison
    const prevPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const prevStartTimestamp = Math.floor(prevPeriodStart.getTime() / 1000)

    const prevMovimientos = await db.query.movimientos.findMany({
      where: and(
        gte(movimientos.fecha, prevStartTimestamp),
        lte(movimientos.fecha, startTimestamp)
      ),
    })

    let prevIngresos = 0
    let prevEgresos = 0
    prevMovimientos.forEach((mov) => {
      if (mov.tipo === 'ingreso') prevIngresos += mov.monto
      else if (mov.tipo === 'gasto') prevEgresos += mov.monto
    })

    const prevAbonos = await db.query.abonos.findMany({
      where: and(
        gte(abonos.fecha, prevStartTimestamp),
        lte(abonos.fecha, startTimestamp)
      ),
    })
    const prevTotalAbonos = prevAbonos.reduce((acc, a) => acc + a.monto, 0)

    // Calculate changes
    const cambioIngresos = prevIngresos > 0 ? ((totalIngresos - prevIngresos) / prevIngresos) * 100 : 0
    const cambioEgresos = prevEgresos > 0 ? ((totalEgresos - prevEgresos) / prevEgresos) * 100 : 0
    const cambioAbonos = prevTotalAbonos > 0 ? ((totalAbonos - prevTotalAbonos) / prevTotalAbonos) * 100 : 0

    return NextResponse.json({
      totalIngresos,
      totalEgresos,
      totalAbonos,
      totalGastos,
      totalTransferencias,
      pagoDistribuidores: 0, // TODO: calculate from pagos distribuidores
      balanceGeneral,
      cambioIngresos: Math.round(cambioIngresos * 10) / 10,
      cambioEgresos: Math.round(cambioEgresos * 10) / 10,
      cambioAbonos: Math.round(cambioAbonos * 10) / 10,
      flujoNeto,
    })
  } catch (error) {
    console.error('Analytics metrics error:', error)
    return NextResponse.json(
      { error: 'Error fetching metrics' },
      { status: 500 }
    )
  }
}
