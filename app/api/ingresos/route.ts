import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener ingresos con filtros opcionales
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bancoId = searchParams.get('bancoId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const limite = parseInt(searchParams.get('limite') || '100')

    const conditions = [eq(movimientos.tipo, 'ingreso')]

    if (bancoId) {
      conditions.push(eq(movimientos.bancoId, bancoId))
    }

    if (fechaInicio) {
      conditions.push(gte(movimientos.fecha, new Date(fechaInicio)))
    }

    if (fechaFin) {
      conditions.push(lte(movimientos.fecha, new Date(fechaFin)))
    }

    const ingresos = await db
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

    const totalResult = await db
      .select({ total: sql<number>`SUM(${movimientos.monto})` })
      .from(movimientos)
      .where(and(...conditions))

    return NextResponse.json({
      success: true,
      data: ingresos,
      total: totalResult[0]?.total || 0,
      count: ingresos.length,
    })
  } catch (error) {
    logger.error('Error obteniendo ingresos', error as Error, { context: 'API/ingresos' })
    return NextResponse.json({ error: 'Error al obtener ingresos' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Registrar nuevo ingreso
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { bancoDestino, monto, concepto, categoria, referencia, notas } = body

    // Validaciones
    if (!bancoDestino || !monto || !concepto) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: bancoDestino, monto, concepto' },
        { status: 400 },
      )
    }

    if (monto <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
    }

    // Verificar que el banco destino existe
    const [bancoData] = await db.select().from(bancos).where(eq(bancos.id, bancoDestino)).limit(1)

    if (!bancoData) {
      return NextResponse.json({ error: 'Banco destino no encontrado' }, { status: 404 })
    }

    const movimientoId = uuidv4()
    const now = new Date()

    // Crear movimiento de ingreso
    await db.insert(movimientos).values({
      id: movimientoId,
      bancoId: bancoDestino,
      tipo: 'ingreso',
      monto: monto,
      concepto: `[${categoria || 'General'}] ${concepto}`,
      referencia: referencia || null,
      fecha: now,
    })

    // Actualizar capital del banco
    const capitalActual = Number(bancoData.capitalActual) || 0
    await db
      .update(bancos)
      .set({
        capitalActual: sql`${bancos.capitalActual} + ${monto}`,
        historicoIngresos: sql`${bancos.historicoIngresos} + ${monto}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, bancoDestino))

    logger.info('Ingreso registrado', {
      context: 'API/ingresos',
      data: { movimientoId, bancoDestino, monto, concepto },
    })

    return NextResponse.json({
      success: true,
      movimientoId,
      bancoDestino,
      monto,
      nuevoCapital: capitalActual + monto,
    })
  } catch (error) {
    logger.error('Error registrando ingreso:', error as Error, { context: 'API' })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 },
    )
  }
}
