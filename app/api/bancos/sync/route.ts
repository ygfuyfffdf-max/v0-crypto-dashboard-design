import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Recalcular capital de bancos basándose en movimientos existentes
// ═══════════════════════════════════════════════════════════════════════════
// Este endpoint sincroniza historicoIngresos, historicoGastos y capitalActual
// basándose en la suma real de todos los movimientos registrados
// ═══════════════════════════════════════════════════════════════════════════

export async function POST() {
  try {
    // Obtener todos los bancos
    const allBancos = await db.select().from(bancos)

    const resultados = []

    for (const banco of allBancos) {
      // Obtener todos los movimientos de este banco
      const movimientosBanco = await db
        .select()
        .from(movimientos)
        .where(eq(movimientos.bancoId, banco.id))

      // Calcular totales
      let totalIngresos = 0
      let totalGastos = 0

      for (const mov of movimientosBanco) {
        const monto = mov.monto || 0

        if (
          mov.tipo === 'ingreso' ||
          mov.tipo === 'transferencia_entrada' ||
          mov.tipo === 'abono'
        ) {
          totalIngresos += monto
        } else if (
          mov.tipo === 'gasto' ||
          mov.tipo === 'transferencia_salida' ||
          mov.tipo === 'pago'
        ) {
          totalGastos += monto
        }
      }

      const capitalCalculado = totalIngresos - totalGastos

      // Actualizar el banco
      await db
        .update(bancos)
        .set({
          historicoIngresos: totalIngresos,
          historicoGastos: totalGastos,
          capitalActual: capitalCalculado,
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(bancos.id, banco.id))

      resultados.push({
        bancoId: banco.id,
        nombre: banco.nombre,
        movimientos: movimientosBanco.length,
        anterior: {
          historicoIngresos: banco.historicoIngresos,
          historicoGastos: banco.historicoGastos,
          capitalActual: banco.capitalActual,
        },
        nuevo: {
          historicoIngresos: totalIngresos,
          historicoGastos: totalGastos,
          capitalActual: capitalCalculado,
        },
      })
    }

    logger.info('Bancos sincronizados con movimientos', {
      context: 'API/bancos/sync',
      data: { bancosActualizados: resultados.length },
    })

    return NextResponse.json({
      success: true,
      mensaje: 'Capital de bancos recalculado basándose en movimientos reales',
      resultados,
    })
  } catch (error) {
    logger.error('Error sincronizando bancos:', error as Error, {
      context: 'API/bancos/sync',
    })
    return NextResponse.json(
      {
        error: 'Error interno al sincronizar bancos',
      },
      { status: 500 },
    )
  }
}

// GET - Ver estado de sincronización
export async function GET() {
  try {
    const allBancos = await db.select().from(bancos)
    const resultado = []

    for (const banco of allBancos) {
      const movimientosBanco = await db
        .select()
        .from(movimientos)
        .where(eq(movimientos.bancoId, banco.id))

      let calculadoIngresos = 0
      let calculadoGastos = 0

      for (const mov of movimientosBanco) {
        const monto = mov.monto || 0
        if (
          mov.tipo === 'ingreso' ||
          mov.tipo === 'transferencia_entrada' ||
          mov.tipo === 'abono'
        ) {
          calculadoIngresos += monto
        } else if (
          mov.tipo === 'gasto' ||
          mov.tipo === 'transferencia_salida' ||
          mov.tipo === 'pago'
        ) {
          calculadoGastos += monto
        }
      }

      const calculadoCapital = calculadoIngresos - calculadoGastos
      const estaDesincronizado =
        banco.historicoIngresos !== calculadoIngresos ||
        banco.historicoGastos !== calculadoGastos ||
        banco.capitalActual !== calculadoCapital

      resultado.push({
        bancoId: banco.id,
        nombre: banco.nombre,
        movimientos: movimientosBanco.length,
        actual: {
          historicoIngresos: banco.historicoIngresos,
          historicoGastos: banco.historicoGastos,
          capitalActual: banco.capitalActual,
        },
        calculado: {
          historicoIngresos: calculadoIngresos,
          historicoGastos: calculadoGastos,
          capitalActual: calculadoCapital,
        },
        desincronizado: estaDesincronizado,
      })
    }

    const desincronizados = resultado.filter((r) => r.desincronizado)

    return NextResponse.json({
      totalBancos: resultado.length,
      sincronizados: resultado.length - desincronizados.length,
      desincronizados: desincronizados.length,
      detalle: resultado,
    })
  } catch (error) {
    logger.error('Error verificando sincronización:', error as Error, {
      context: 'API/bancos/sync',
    })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
