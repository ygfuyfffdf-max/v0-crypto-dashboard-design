import { db } from '@/database'
import { distribuidores, ordenesCompra } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

/**
 * GET/POST /api/sistema/sync-distribuidores
 * Sincroniza el saldoPendiente de distribuidores con la suma de montoRestante de sus OCs
 * GET para poder llamarlo fácilmente desde el navegador
 */
async function syncDistribuidores() {
  const resultados: Array<{
    distribuidor: string
    antes: number
    despues: number
    actualizado: boolean
  }> = []

  // Obtener todos los distribuidores
  const dists = await db.select().from(distribuidores)

  for (const d of dists) {
    // Obtener todas las OCs del distribuidor
    const ordenesDelDist = await db
      .select()
      .from(ordenesCompra)
      .where(eq(ordenesCompra.distribuidorId, d.id))

    // Calcular deuda real (suma de montoRestante de OCs activas)
    let deudaCalculada = 0
    let totalCompras = 0
    let totalPagado = 0

    for (const oc of ordenesDelDist) {
      if (oc.estado !== 'cancelado') {
        deudaCalculada += oc.montoRestante || 0
        totalCompras += oc.total || 0
        totalPagado += oc.montoPagado || 0
      }
    }

    const saldoAnterior = d.saldoPendiente || 0
    const diferencia = Math.abs(deudaCalculada - saldoAnterior)
    const necesitaActualizacion = diferencia > 0.01

    if (necesitaActualizacion) {
      await db
        .update(distribuidores)
        .set({
          saldoPendiente: deudaCalculada,
          totalOrdenesCompra: totalCompras,
          totalPagado: totalPagado,
          numeroOrdenes: ordenesDelDist.length,
          updatedAt: new Date(),
        })
        .where(eq(distribuidores.id, d.id))
    }

    resultados.push({
      distribuidor: d.nombre,
      antes: saldoAnterior,
      despues: deudaCalculada,
      actualizado: necesitaActualizacion,
    })
  }

  return {
    success: true,
    mensaje: 'Sincronización completada',
    resultados,
    totalActualizados: resultados.filter((r) => r.actualizado).length,
  }
}

export async function POST() {
  try {
    const resultado = await syncDistribuidores()
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error en sincronización:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar distribuidores' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const resultado = await syncDistribuidores()
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error en sincronización:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar distribuidores' },
      { status: 500 },
    )
  }
}
