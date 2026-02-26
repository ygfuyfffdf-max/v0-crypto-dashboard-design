import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Obtener todos los bancos activos
    const bancosData = await db.query.bancos.findMany({
      where: eq(bancos.activo, 1),
      orderBy: [bancos.orden],
    })

    // Calcular totales
    const [totales] = await db
      .select({
        capitalTotal: sql<number>`sum(${bancos.capitalActual})`,
        ingresosHistoricos: sql<number>`sum(${bancos.historicoIngresos})`,
        gastosHistoricos: sql<number>`sum(${bancos.historicoGastos})`,
      })
      .from(bancos)
      .where(eq(bancos.activo, 1))

    return NextResponse.json({
      success: true,
      data: {
        capitalTotal: totales?.capitalTotal || 0,
        ingresosHistoricos: totales?.ingresosHistoricos || 0,
        gastosHistoricos: totales?.gastosHistoricos || 0,
        bancos: bancosData,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error en API capital:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error al obtener capital' }, { status: 500 })
  }
}
