import { PagoDistribuidorSchema } from '@/app/lib/schemas'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, distribuidores, movimientos, ordenesCompra } from '@/database/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener historial de pagos a distribuidores
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const distribuidorId = searchParams.get('distribuidorId')
    const ordenCompraId = searchParams.get('ordenCompraId')
    const limite = parseInt(searchParams.get('limite') || '100')

    // Buscar en movimientos relacionados con pagos a distribuidores
    const conditions = [
      sql`${movimientos.concepto} LIKE '%Pago%distribuidor%' OR ${movimientos.concepto} LIKE '%orden%compra%'`,
    ]

    const pagos = await db
      .select({
        id: movimientos.id,
        bancoId: movimientos.bancoId,
        monto: movimientos.monto,
        concepto: movimientos.concepto,
        referencia: movimientos.referencia,
        fecha: movimientos.fecha,
      })
      .from(movimientos)
      .where(and(...conditions))
      .orderBy(desc(movimientos.fecha))
      .limit(limite)

    // Calcular total pagado
    const totalResult = await db
      .select({ total: sql<number>`SUM(${movimientos.monto})` })
      .from(movimientos)
      .where(and(...conditions))

    return NextResponse.json({
      success: true,
      data: pagos,
      total: totalResult[0]?.total || 0,
      count: pagos.length,
    })
  } catch (error) {
    logger.error('Error obteniendo pagos a distribuidores', error as Error, {
      context: 'API/pagos-distribuidor',
    })
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Registrar pago a distribuidor por orden de compra
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    logger.info('🔍 Input recibido en API/pagos-distribuidor POST', {
      context: 'API/pagos-distribuidor',
      data: {
        distribuidorId: body.distribuidorId,
        ordenCompraId: body.ordenCompraId,
        monto: body.monto,
        bancoOrigenId: body.bancoOrigenId,
      },
    })

    // Validación con Zod
    const validation = PagoDistribuidorSchema.safeParse(body)

    if (!validation.success) {
      logger.error('❌ Error de validación en pago distribuidor', validation.error, {
        context: 'API/pagos-distribuidor',
        data: { errors: validation.error.errors },
      })
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { distribuidorId, ordenCompraId, monto, bancoOrigenId, fecha } = validation.data

    // Verificar que la orden de compra existe y pertenece al distribuidor
    const [orden] = await db.select().from(ordenesCompra).where(eq(ordenesCompra.id, ordenCompraId))

    if (!orden) {
      return NextResponse.json({ error: 'Orden de compra no encontrada' }, { status: 404 })
    }

    if (orden.distribuidorId !== distribuidorId) {
      return NextResponse.json(
        { error: 'La orden no pertenece al distribuidor especificado' },
        { status: 400 },
      )
    }

    const montoRestante = orden.montoRestante || 0

    if (montoRestante <= 0) {
      return NextResponse.json({ error: 'La orden ya está pagada completamente' }, { status: 400 })
    }

    // Calcular el pago efectivo (no puede exceder la deuda)
    const pagoEfectivo = Math.min(monto, montoRestante)

    // Verificar que el banco tiene suficiente capital
    const [banco] = await db.select().from(bancos).where(eq(bancos.id, bancoOrigenId))

    if (!banco) {
      return NextResponse.json({ error: 'Banco no encontrado' }, { status: 404 })
    }

    if ((banco.capitalActual || 0) < pagoEfectivo) {
      return NextResponse.json(
        {
          error: 'Capital insuficiente en el banco seleccionado',
          capitalDisponible: banco.capitalActual,
          montoRequerido: pagoEfectivo,
        },
        { status: 400 },
      )
    }

    const now = new Date(fecha || Date.now())
    const pagoId = uuidv4()

    // Descontar del banco origen
    await db
      .update(bancos)
      .set({
        capitalActual: sql`capital_actual - ${pagoEfectivo}`,
        historicoGastos: sql`historico_gastos + ${pagoEfectivo}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, bancoOrigenId))

    // Registrar movimiento de pago
    await db.insert(movimientos).values({
      id: pagoId,
      bancoId: bancoOrigenId,
      tipo: 'pago',
      monto: pagoEfectivo,
      fecha: now,
      concepto: `Pago a distribuidor - OC ${orden.numeroOrden}`,
      referencia: ordenCompraId,
      ordenCompraId,
      distribuidorId,
    })

    // Actualizar orden de compra
    const nuevoMontoPagado = (orden.montoPagado || 0) + pagoEfectivo
    const nuevoMontoRestante = (orden.total || 0) - nuevoMontoPagado

    let nuevoEstado: 'pendiente' | 'parcial' | 'completo' | 'cancelado' = 'pendiente'

    if (nuevoMontoRestante <= 0) {
      nuevoEstado = 'completo'
    } else if (nuevoMontoPagado > 0) {
      nuevoEstado = 'parcial'
    }

    await db
      .update(ordenesCompra)
      .set({
        montoPagado: nuevoMontoPagado,
        montoRestante: Math.max(0, nuevoMontoRestante),
        estado: nuevoEstado,
        updatedAt: now,
      })
      .where(eq(ordenesCompra.id, ordenCompraId))

    // Actualizar saldo del distribuidor - INCLUIR totalPagado y numeroPagos
    await db
      .update(distribuidores)
      .set({
        saldoPendiente: sql`COALESCE(saldo_pendiente, 0) - ${pagoEfectivo}`,
        totalPagado: sql`COALESCE(total_pagado, 0) + ${pagoEfectivo}`,
        numeroPagos: sql`COALESCE(numero_pagos, 0) + 1`,
        updatedAt: now,
      })
      .where(eq(distribuidores.id, distribuidorId))

    logger.info(`Pago a distribuidor registrado: $${pagoEfectivo}`, {
      context: 'API/pagos-distribuidor',
      distribuidorId,
      ordenCompraId,
      bancoOrigenId,
      monto: pagoEfectivo,
    })

    return NextResponse.json({
      success: true,
      pagoId,
      montoAplicado: pagoEfectivo,
      nuevoEstadoOrden: nuevoEstado,
      nuevoMontoRestante: Math.max(0, nuevoMontoRestante),
      capitalRestanteBanco: (banco.capitalActual || 0) - pagoEfectivo,
    })
  } catch (error) {
    logger.error('Error registrando pago a distribuidor:', error as Error, {
      context: 'API/pagos-distribuidor',
    })
    return NextResponse.json(
      {
        error: 'Error interno al registrar pago',
      },
      { status: 500 },
    )
  }
}
