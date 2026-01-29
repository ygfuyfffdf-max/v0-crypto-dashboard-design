/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏥 CHRONOS INFINITY 2026 — HEALTH CHECK ENDPOINT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Endpoint para verificar el estado del sistema en tiempo real.
 * Retorna información sobre BD, bancos, y métricas críticas.
 *
 * URL: /api/health
 * Method: GET
 * Auth: None (público para monitoring)
 *
 * @version 1.0.0 - IY SUPREME EDITION
 */

import { db } from '@/database'
import {
  bancos,
  clientes,
  distribuidores,
  movimientos,
  ordenesCompra,
  ventas,
} from '@/database/schema'
import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: CheckStatus
    bancos: CheckStatus
    tablas: CheckStatus
    performance: CheckStatus
  }
  meta: {
    version: string
    environment: string
    uptime: number
  }
}

interface CheckStatus {
  status: 'ok' | 'warning' | 'error'
  message: string
  details?: unknown
}

const BANCOS_ESPERADOS = [
  'boveda_monte',
  'boveda_usa',
  'profit',
  'leftie',
  'azteca',
  'flete_sur',
  'utilidades',
]

async function checkDatabase(): Promise<CheckStatus> {
  try {
    const startTime = Date.now()
    await db
      .select({ value: sql`1` })
      .from(bancos)
      .limit(1)
    const latency = Date.now() - startTime

    if (latency > 1000) {
      return {
        status: 'warning',
        message: `Conexión lenta (${latency}ms)`,
        details: { latency },
      }
    }

    return {
      status: 'ok',
      message: `Conectado (${latency}ms)`,
      details: { latency },
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'No se pudo conectar a la base de datos',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function checkBancos(): Promise<CheckStatus> {
  try {
    const bancosExistentes = await db
      .select({ id: bancos.id, nombre: bancos.nombre, capitalActual: bancos.capitalActual })
      .from(bancos)
    const idsExistentes = bancosExistentes.map((b) => b.id)
    const faltantes = BANCOS_ESPERADOS.filter((id) => !idsExistentes.includes(id))

    if (faltantes.length > 0) {
      return {
        status: 'error',
        message: `Faltan ${faltantes.length} bancos`,
        details: { faltantes, existentes: idsExistentes },
      }
    }

    // Verificar capital
    const capitalTotal = bancosExistentes.reduce((sum, b) => sum + b.capitalActual, 0)

    return {
      status: 'ok',
      message: '7 bancos operacionales',
      details: {
        bancos: bancosExistentes.map((b) => ({
          id: b.id,
          nombre: b.nombre,
          capital: b.capitalActual,
        })),
        capitalTotal,
      },
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Error verificando bancos',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function checkTablas(): Promise<CheckStatus> {
  try {
    const counts = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(clientes),
      db.select({ count: sql<number>`count(*)` }).from(distribuidores),
      db.select({ count: sql<number>`count(*)` }).from(ventas),
      db.select({ count: sql<number>`count(*)` }).from(ordenesCompra),
      db.select({ count: sql<number>`count(*)` }).from(movimientos),
    ])

    const totales = {
      clientes: counts[0][0]?.count ?? 0,
      distribuidores: counts[1][0]?.count ?? 0,
      ventas: counts[2][0]?.count ?? 0,
      ordenesCompra: counts[3][0]?.count ?? 0,
      movimientos: counts[4][0]?.count ?? 0,
    }

    return {
      status: 'ok',
      message: 'Todas las tablas operacionales',
      details: totales,
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Error accediendo a tablas',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function checkPerformance(): Promise<CheckStatus> {
  try {
    const startTime = Date.now()

    // Query de prueba
    await db.select().from(ventas).limit(10)

    const queryTime = Date.now() - startTime

    if (queryTime > 500) {
      return {
        status: 'warning',
        message: `Queries lentas (${queryTime}ms)`,
        details: { queryTime },
      }
    }

    return {
      status: 'ok',
      message: `Performance normal (${queryTime}ms)`,
      details: { queryTime },
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Error verificando performance',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function GET() {
  try {
    const startTime = Date.now()

    // Ejecutar checks en paralelo
    const [databaseCheck, bancosCheck, tablasCheck, performanceCheck] = await Promise.all([
      checkDatabase(),
      checkBancos(),
      checkTablas(),
      checkPerformance(),
    ])

    const checks = {
      database: databaseCheck,
      bancos: bancosCheck,
      tablas: tablasCheck,
      performance: performanceCheck,
    }

    // Determinar estado general
    const hasError = Object.values(checks).some((c) => c.status === 'error')
    const hasWarning = Object.values(checks).some((c) => c.status === 'warning')

    const status: 'healthy' | 'degraded' | 'unhealthy' = hasError
      ? 'unhealthy'
      : hasWarning
        ? 'degraded'
        : 'healthy'

    const totalTime = Date.now() - startTime

    const response: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      checks,
      meta: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: totalTime,
      },
    }

    return NextResponse.json(response, {
      status: status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': status,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 503 },
    )
  }
}
