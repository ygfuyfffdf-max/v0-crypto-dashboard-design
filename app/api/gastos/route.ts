import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const CrearGastoAPISchema = z.object({
  bancoOrigen: z.string().min(1, 'El banco origen es requerido'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  concepto: z.string().min(1, 'El concepto es requerido').max(200),
  categoria: z.string().max(50).optional(),
  referencia: z.string().max(100).optional(),
  notas: z.string().max(500).optional(),
})

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener gastos con filtros opcionales
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bancoId = searchParams.get('bancoId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const limite = parseInt(searchParams.get('limite') || '100')

    // Construir condiciones de filtro
    const conditions = [eq(movimientos.tipo, 'gasto')]

    if (bancoId) {
      conditions.push(eq(movimientos.bancoId, bancoId))
    }

    if (fechaInicio) {
      conditions.push(gte(movimientos.fecha, Math.floor(new Date(fechaInicio).getTime() / 1000)))
    }

    if (fechaFin) {
      conditions.push(lte(movimientos.fecha, Math.floor(new Date(fechaFin).getTime() / 1000)))
    }

    const gastos = await db
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

    // Calcular total
    const totalResult = await db
      .select({ total: sql<number>`SUM(${movimientos.monto})` })
      .from(movimientos)
      .where(and(...conditions))

    return NextResponse.json({
      success: true,
      data: gastos,
      total: totalResult[0]?.total || 0,
      count: gastos.length,
    })
  } catch (error) {
    logger.error('Error obteniendo gastos', error as Error, { context: 'API/gastos' })
    return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Registrar nuevo gasto
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validación Zod
    const validation = CrearGastoAPISchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de gasto inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { bancoOrigen, monto, concepto, categoria, referencia, notas } = validation.data

    // Verificar capital del banco origen
    const [bancoData] = await db.select().from(bancos).where(eq(bancos.id, bancoOrigen)).limit(1)

    if (!bancoData) {
      return NextResponse.json({ error: 'Banco origen no encontrado' }, { status: 404 })
    }

    const capitalActual = Number(bancoData.capitalActual) || 0
    if (capitalActual < monto) {
      return NextResponse.json(
        { error: 'Capital insuficiente para esta operación' },
        { status: 400 },
      )
    }

    const movimientoId = uuidv4()
    const now = Math.floor(Date.now() / 1000)

    // Crear movimiento de gasto
    await db.insert(movimientos).values({
      id: movimientoId,
      bancoId: bancoOrigen,
      tipo: 'gasto',
      monto: monto,
      concepto: `[${categoria || 'General'}] ${concepto}`,
      referencia: referencia || null,
      fecha: now,
    })

    // Actualizar capital del banco
    await db
      .update(bancos)
      .set({
        capitalActual: sql`${bancos.capitalActual} - ${monto}`,
        historicoGastos: sql`${bancos.historicoGastos} + ${monto}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, bancoOrigen))

    logger.info('Gasto registrado', {
      context: 'API/gastos',
      data: { movimientoId, bancoOrigen, monto, concepto },
    })

    return NextResponse.json({
      success: true,
      movimientoId,
      bancoOrigen,
      monto,
      nuevoCapital: capitalActual - monto,
    })
  } catch (error) {
    logger.error('Error registrando gasto:', error as Error, { context: 'API' })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 },
    )
  }
}
