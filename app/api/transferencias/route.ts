import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener historial de transferencias
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bancoId = searchParams.get('bancoId')
    const limite = parseInt(searchParams.get('limite') || '50')

    // Las transferencias se identifican por concepto que contiene "Transferencia"
    const transferencias = await db
      .select({
        id: movimientos.id,
        bancoId: movimientos.bancoId,
        tipo: movimientos.tipo,
        monto: movimientos.monto,
        concepto: movimientos.concepto,
        referencia: movimientos.referencia,
        fecha: movimientos.fecha,
      })
      .from(movimientos)
      .where(
        and(
          sql`${movimientos.concepto} LIKE '%Transferencia%'`,
          bancoId ? eq(movimientos.bancoId, bancoId) : sql`1=1`,
        ),
      )
      .orderBy(desc(movimientos.fecha))
      .limit(limite)

    return NextResponse.json({
      success: true,
      data: transferencias,
      count: transferencias.length,
    })
  } catch (error) {
    logger.error('Error obteniendo transferencias', error as Error, {
      context: 'API/transferencias',
    })
    return NextResponse.json({ error: 'Error al obtener transferencias' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear transferencia entre bancos
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { bancoOrigen, bancoDestino, monto, concepto } = body

    // Validaciones
    if (!bancoOrigen || !bancoDestino || !monto) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: bancoOrigen, bancoDestino, monto' },
        { status: 400 },
      )
    }

    if (bancoOrigen === bancoDestino) {
      return NextResponse.json(
        { error: 'El banco origen y destino no pueden ser iguales' },
        { status: 400 },
      )
    }

    if (monto <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
    }

    // Verificar capital del banco origen
    const [bancoOrigenData] = await db
      .select()
      .from(bancos)
      .where(eq(bancos.id, bancoOrigen))
      .limit(1)

    if (!bancoOrigenData) {
      return NextResponse.json({ error: 'Banco origen no encontrado' }, { status: 404 })
    }

    const capitalOrigen = Number(bancoOrigenData.capitalActual) || 0
    if (capitalOrigen < monto) {
      return NextResponse.json(
        {
          error: `Capital insuficiente en ${bancoOrigenData.nombre}. Disponible: $${capitalOrigen.toLocaleString()}`,
        },
        { status: 400 },
      )
    }

    // Verificar banco destino existe
    const [bancoDestinoData] = await db
      .select()
      .from(bancos)
      .where(eq(bancos.id, bancoDestino))
      .limit(1)

    if (!bancoDestinoData) {
      return NextResponse.json({ error: 'Banco destino no encontrado' }, { status: 404 })
    }

    const now = new Date()
    const conceptoFinal =
      concepto || `Transferencia de ${bancoOrigenData.nombre} a ${bancoDestinoData.nombre}`

    // Crear movimiento de salida (origen)
    const movimientoSalidaId = uuidv4()
    await db.insert(movimientos).values({
      id: movimientoSalidaId,
      bancoId: bancoOrigen,
      tipo: 'transferencia_salida',
      monto: monto,
      concepto: conceptoFinal,
      bancoDestinoId: bancoDestino,
      fecha: now,
    })

    // Crear movimiento de entrada (destino)
    const movimientoEntradaId = uuidv4()
    await db.insert(movimientos).values({
      id: movimientoEntradaId,
      bancoId: bancoDestino,
      tipo: 'transferencia_entrada',
      monto: monto,
      concepto: conceptoFinal,
      bancoOrigenId: bancoOrigen,
      fecha: now,
    })

    // Actualizar capital del banco origen (restar)
    await db
      .update(bancos)
      .set({
        capitalActual: sql`${bancos.capitalActual} - ${monto}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, bancoOrigen))

    // Actualizar capital del banco destino (sumar)
    const capitalDestino = Number(bancoDestinoData.capitalActual) || 0
    await db
      .update(bancos)
      .set({
        capitalActual: sql`${bancos.capitalActual} + ${monto}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, bancoDestino))

    logger.info('Transferencia completada', {
      context: 'API/transferencias',
      data: {
        bancoOrigen,
        bancoDestino,
        monto,
        movimientoSalidaId,
        movimientoEntradaId,
      },
    })

    return NextResponse.json({
      success: true,
      transferencia: {
        bancoOrigen: {
          id: bancoOrigen,
          nombre: bancoOrigenData.nombre,
          capitalAnterior: capitalOrigen,
          capitalNuevo: capitalOrigen - monto,
        },
        bancoDestino: {
          id: bancoDestino,
          nombre: bancoDestinoData.nombre,
          capitalAnterior: capitalDestino,
          capitalNuevo: capitalDestino + monto,
        },
        monto,
        concepto: conceptoFinal,
      },
    })
  } catch (error) {
    logger.error('Error en transferencia:', error as Error, { context: 'API' })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 },
    )
  }
}
