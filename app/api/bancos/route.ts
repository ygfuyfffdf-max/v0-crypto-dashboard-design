import { ERROR_CODES, errorFromException, successWithCache } from '@/app/lib/api-response'
import { CACHE_KEYS, invalidateCache } from '@/app/lib/cache'
import { applyRateLimit } from '@/app/lib/rate-limit'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Configuración de cache para este endpoint (datos críticos en tiempo real)
export const dynamic = 'force-dynamic'
export const revalidate = 0

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener todos los bancos (sin cache - datos en tiempo real)
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  // Rate limit check
  const rateLimitResult = await applyRateLimit(request, 'read')
  if (rateLimitResult) return rateLimitResult

  try {
    const bancosData = await db.select().from(bancos).orderBy(bancos.orden)

    // Sin cache - datos críticos en tiempo real
    return successWithCache(
      bancosData,
      { ttl: 0 }, // No cachear
      { total: bancosData.length },
    )
  } catch (error) {
    return errorFromException(error, 'BancosAPI', ERROR_CODES.DATABASE_ERROR)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar banco (agregar ingreso, gasto o transferencia)
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      operacion, // 'ingreso' | 'gasto' | 'transferencia'
      monto,
      concepto,
      bancoDestinoId, // Para transferencias
      referencia,
    } = body

    if (!id || !operacion || monto === undefined) {
      return NextResponse.json(
        { error: 'Campos requeridos: id, operacion, monto' },
        { status: 400 },
      )
    }

    const [bancoActual] = await db.select().from(bancos).where(eq(bancos.id, id))

    if (!bancoActual) {
      return NextResponse.json({ error: 'Banco no encontrado' }, { status: 404 })
    }

    const now = Math.floor(Date.now() / 1000)

    switch (operacion) {
      case 'ingreso':
        // Agregar ingreso al banco
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${monto}`,
            historicoIngresos: sql`historico_ingresos + ${monto}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, id))

        // Registrar movimiento
        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: id,
          tipo: 'ingreso',
          monto,
          fecha: now,
          concepto: concepto || 'Ingreso manual',
          referencia,
        })
        break

      case 'gasto':
        // Verificar capital suficiente
        if ((bancoActual.capitalActual || 0) < monto) {
          return NextResponse.json({ error: 'Capital insuficiente' }, { status: 400 })
        }

        // Descontar gasto del banco
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${monto}`,
            historicoGastos: sql`historico_gastos + ${monto}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, id))

        // Registrar movimiento
        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: id,
          tipo: 'gasto',
          monto,
          fecha: now,
          concepto: concepto || 'Gasto manual',
          referencia,
        })
        break

      case 'transferencia':
        if (!bancoDestinoId) {
          return NextResponse.json(
            { error: 'bancoDestinoId requerido para transferencias' },
            { status: 400 },
          )
        }

        // Verificar capital suficiente en origen
        if ((bancoActual.capitalActual || 0) < monto) {
          return NextResponse.json(
            { error: 'Capital insuficiente para transferencia' },
            { status: 400 },
          )
        }

        // Verificar que el banco destino existe
        const [bancoDestino] = await db.select().from(bancos).where(eq(bancos.id, bancoDestinoId))
        if (!bancoDestino) {
          return NextResponse.json({ error: 'Banco destino no encontrado' }, { status: 404 })
        }

        // Descontar del origen
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${monto}`,
            historicoGastos: sql`historico_gastos + ${monto}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, id))

        // Agregar al destino
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${monto}`,
            historicoIngresos: sql`historico_ingresos + ${monto}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, bancoDestinoId))

        const transferenciaId = uuidv4()

        // Movimiento de salida
        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: id,
          tipo: 'transferencia_salida',
          monto,
          fecha: now,
          concepto: concepto || `Transferencia a ${bancoDestino.nombre}`,
          referencia: transferenciaId,
          bancoDestinoId,
        })

        // Movimiento de entrada
        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: bancoDestinoId,
          tipo: 'transferencia_entrada',
          monto,
          fecha: now,
          concepto: concepto || `Transferencia desde ${bancoActual.nombre}`,
          referencia: transferenciaId,
          bancoOrigenId: id,
        })
        break

      default:
        return NextResponse.json({ error: 'Operación no válida' }, { status: 400 })
    }

    // Invalidar cache de bancos después de cualquier modificación
    await invalidateCache(CACHE_KEYS.BANCOS_ALL)
    await invalidateCache(CACHE_KEYS.BANCOS_METRICS)
    await invalidateCache(CACHE_KEYS.DASHBOARD_METRICS)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando banco:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
