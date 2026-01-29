import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { movimientos } from '@/database/schema'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Generar Corte de Cuenta para un Banco
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bancoId: string }> },
) {
  try {
    const { bancoId } = await params
    const body = await request.json()
    const { fechaInicio, fechaFin, tipo = 'mensual' } = body

    // Determinar rango de fechas
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    if (fechaInicio && fechaFin) {
      startDate = new Date(fechaInicio)
      endDate = new Date(fechaFin)
    } else if (tipo === 'mensual') {
      // Corte del mes actual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    } else if (tipo === 'semanal') {
      // Última semana
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else {
      // Último mes
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Obtener todos los movimientos del periodo
    const movimientosPeriodo = await db
      .select()
      .from(movimientos)
      .where(
        and(
          eq(movimientos.bancoId, bancoId),
          gte(movimientos.fecha, startDate),
          lte(movimientos.fecha, endDate),
        ),
      )
      .orderBy(movimientos.fecha)

    // Calcular totales
    let totalIngresos = 0
    let totalGastos = 0
    let totalTransferenciasEntrada = 0
    let totalTransferenciasSalida = 0

    movimientosPeriodo.forEach((mov) => {
      const monto = Math.abs(mov.monto)
      if (mov.tipo === 'ingreso' || mov.tipo === 'abono') {
        totalIngresos += monto
      } else if (mov.tipo === 'gasto' || mov.tipo === 'pago') {
        totalGastos += monto
      } else if (mov.tipo === 'transferencia_entrada') {
        totalTransferenciasEntrada += monto
      } else if (mov.tipo === 'transferencia_salida') {
        totalTransferenciasSalida += monto
      }
    })

    // Obtener capital inicial (movimientos ANTES del periodo)
    const movimientosAnteriores = await db
      .select({
        totalIngresos: sql<number>`COALESCE(SUM(CASE
          WHEN tipo IN ('ingreso', 'abono', 'transferencia_entrada') THEN ABS(monto)
          ELSE 0
        END), 0)`,
        totalGastos: sql<number>`COALESCE(SUM(CASE
          WHEN tipo IN ('gasto', 'pago', 'transferencia_salida') THEN ABS(monto)
          ELSE 0
        END), 0)`,
      })
      .from(movimientos)
      .where(
        and(
          eq(movimientos.bancoId, bancoId),
          sql`${movimientos.fecha} < ${startDate.toISOString()}`,
        ),
      )

    const capitalInicial =
      (movimientosAnteriores[0]?.totalIngresos ?? 0) - (movimientosAnteriores[0]?.totalGastos ?? 0)

    const balancePeriodo =
      totalIngresos + totalTransferenciasEntrada - totalGastos - totalTransferenciasSalida
    const capitalFinal = capitalInicial + balancePeriodo

    const corte = {
      bancoId,
      periodo: {
        inicio: startDate.toISOString(),
        fin: endDate.toISOString(),
        tipo,
      },
      capital: {
        inicial: capitalInicial,
        final: capitalFinal,
        variacion: balancePeriodo,
      },
      movimientos: {
        total: movimientosPeriodo.length,
        ingresos: {
          cantidad: movimientosPeriodo.filter((m) => m.tipo === 'ingreso' || m.tipo === 'abono')
            .length,
          monto: totalIngresos,
        },
        gastos: {
          cantidad: movimientosPeriodo.filter((m) => m.tipo === 'gasto' || m.tipo === 'pago')
            .length,
          monto: totalGastos,
        },
        transferenciasEntrada: {
          cantidad: movimientosPeriodo.filter((m) => m.tipo === 'transferencia_entrada').length,
          monto: totalTransferenciasEntrada,
        },
        transferenciasSalida: {
          cantidad: movimientosPeriodo.filter((m) => m.tipo === 'transferencia_salida').length,
          monto: totalTransferenciasSalida,
        },
      },
      balance: balancePeriodo,
      fecha_corte: now.toISOString(),
    }

    logger.info('✅ Corte de cuenta generado', {
      context: 'BancosCorteAPI',
      data: {
        bancoId,
        periodo: tipo,
        movimientos: movimientosPeriodo.length,
        capitalFinal,
      },
    })

    return NextResponse.json(corte)
  } catch (error) {
    logger.error('Error al generar corte', error as Error, { context: 'BancosCorteAPI' })
    return NextResponse.json({ error: 'Error al generar corte' }, { status: 500 })
  }
}
