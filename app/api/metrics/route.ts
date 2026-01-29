/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📈 API DE MÉTRICAS — Endpoint para métricas de rendimiento del sistema
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { bancos, clientes, ventas } from '@/database/schema'
import { count, sum } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// HEAD request support
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

// POST request support (para enviar métricas desde el cliente)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Aquí se podrían guardar las métricas del cliente en la DB
    // Por ahora solo confirmamos la recepción
    return NextResponse.json({
      success: true,
      received: body,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al procesar métricas' },
      { status: 400 },
    )
  }
}

export async function GET() {
  try {
    // Métricas básicas
    const [ventasCount, clientesCount, bancosData] = await Promise.all([
      db.select({ total: count() }).from(ventas),
      db.select({ total: count() }).from(clientes),
      db.select({ capital: sum(bancos.capitalActual) }).from(bancos),
    ])

    // Calcular métricas de rendimiento simuladas
    const metrics = {
      // Métricas del negocio
      totalVentas: ventasCount[0]?.total ?? 0,
      totalClientes: clientesCount[0]?.total ?? 0,
      capitalTotal: Number(bancosData[0]?.capital ?? 0),

      // Métricas de rendimiento (simuladas para desarrollo)
      responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
      uptime: 99.9,
      requestsPerMinute: Math.floor(Math.random() * 50) + 10,
      errorRate: Math.random() * 0.5, // 0-0.5%

      // Métricas de sistema
      memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
      cpuUsage: Math.floor(Math.random() * 20) + 10, // 10-30%
      dbConnections: Math.floor(Math.random() * 5) + 1,

      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      {
        totalVentas: 0,
        totalClientes: 0,
        capitalTotal: 0,
        responseTime: 0,
        uptime: 0,
        requestsPerMinute: 0,
        errorRate: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        dbConnections: 0,
        error: 'Error al obtener métricas',
      },
      { status: 500 },
    )
  }
}
