'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SERVER ACTIONS: MOVIMIENTOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

/**
 * Obtener todos los movimientos
 */
export async function getAllMovimientos(limit?: number) {
  try {
    const result = await db.query.movimientos.findMany({
      with: { banco: true },
      orderBy: desc(movimientos.createdAt),
      limit: limit ?? 100,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener movimientos', error, { context: 'getAllMovimientos' })
    return { success: false, error: 'Error al obtener movimientos' }
  }
}

/**
 * Obtener movimientos por banco
 */
export async function getMovimientosByBanco(bancoId: string, limit?: number) {
  try {
    const result = await db.query.movimientos.findMany({
      where: eq(movimientos.bancoId, bancoId),
      orderBy: desc(movimientos.createdAt),
      limit: limit ?? 50,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener movimientos por banco', error, {
      context: 'getMovimientosByBanco',
      bancoId,
    })
    return { success: false, error: 'Error al obtener movimientos' }
  }
}

/**
 * Obtener movimiento por ID
 */
export async function getMovimientoById(id: string) {
  try {
    const movimiento = await db.query.movimientos.findFirst({
      where: eq(movimientos.id, id),
      with: { banco: true },
    })
    if (!movimiento) {
      return { success: false, error: 'Movimiento no encontrado' }
    }
    return { success: true, data: movimiento }
  } catch (error) {
    logger.error('Error al obtener movimiento', error, { context: 'getMovimientoById', id })
    return { success: false, error: 'Error al obtener movimiento' }
  }
}

/**
 * Crear movimiento
 */
export async function createMovimiento(input: {
  bancoId: string
  tipo:
    | 'ingreso'
    | 'gasto'
    | 'transferencia_entrada'
    | 'transferencia_salida'
    | 'abono'
    | 'pago'
    | 'distribucion_gya'
  monto: number
  concepto: string
  referencia?: string
}) {
  try {
    const id = nanoid()

    await db.insert(movimientos).values({
      id,
      bancoId: input.bancoId,
      tipo: input.tipo,
      monto: input.monto,
      fecha: Math.floor(Date.now() / 1000),
      concepto: input.concepto,
      referencia: input.referencia,
    })

    // Actualizar capital del banco
    const banco = await db.query.bancos.findFirst({
      where: eq(bancos.id, input.bancoId),
    })

    if (banco) {
      const esIngreso = ['ingreso', 'abono', 'transferencia_entrada'].includes(input.tipo)
      const nuevoCapital = esIngreso
        ? (banco.capitalActual ?? 0) + input.monto
        : (banco.capitalActual ?? 0) - input.monto

      await db
        .update(bancos)
        .set({
          capitalActual: nuevoCapital,
          historicoIngresos: esIngreso
            ? (banco.historicoIngresos ?? 0) + input.monto
            : banco.historicoIngresos,
          historicoGastos: !esIngreso
            ? (banco.historicoGastos ?? 0) + input.monto
            : banco.historicoGastos,
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(bancos.id, input.bancoId))
    }

    revalidatePath('/movimientos')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al crear movimiento', error, { context: 'createMovimiento', input })
    return { success: false, error: 'Error al crear movimiento' }
  }
}

/**
 * Cancelar movimiento
 */
export async function cancelarMovimiento(id: string) {
  try {
    const movimiento = await db.query.movimientos.findFirst({
      where: eq(movimientos.id, id),
    })

    if (!movimiento) {
      return { success: false, error: 'Movimiento no encontrado' }
    }

    // No hay campo estado en movimientos, solo eliminar
    await db.delete(movimientos).where(eq(movimientos.id, id))

    // Revertir efecto en banco
    const banco = await db.query.bancos.findFirst({
      where: eq(bancos.id, movimiento.bancoId),
    })

    if (banco) {
      const esIngreso = ['ingreso', 'abono', 'transferencia_entrada'].includes(movimiento.tipo)
      const nuevoCapital = esIngreso
        ? (banco.capitalActual ?? 0) - movimiento.monto
        : (banco.capitalActual ?? 0) + movimiento.monto

      await db
        .update(bancos)
        .set({
          capitalActual: nuevoCapital,
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(bancos.id, movimiento.bancoId))
    }

    revalidatePath('/movimientos')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error al cancelar movimiento', error, { context: 'cancelarMovimiento', id })
    return { success: false, error: 'Error al cancelar movimiento' }
  }
}

/**
 * Obtener movimientos recientes
 */
export async function getMovimientosRecientes(limit = 10) {
  try {
    const result = await db.query.movimientos.findMany({
      with: { banco: true },
      orderBy: desc(movimientos.createdAt),
      limit,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener movimientos recientes', error, {
      context: 'getMovimientosRecientes',
    })
    return { success: false, error: 'Error al obtener movimientos' }
  }
}

/**
 * Obtener movimientos con filtros avanzados para tablas
 */
export async function getMovimientos(options?: {
  bancoId?: string
  tipo?: 'ingreso' | 'gasto' | 'transferencia_entrada' | 'transferencia_salida' | 'abono' | 'pago' | 'distribucion_gya'
  limit?: number
}) {
  try {
    const { bancoId, tipo, limit = 100 } = options || {}

    const result = await db.query.movimientos.findMany({
      with: {
        banco: true,
      },
      orderBy: desc(movimientos.createdAt),
      limit,
    })

    // Filter in JS for simplicity
    let filtered = result
    if (bancoId) {
      filtered = filtered.filter(m => m.bancoId === bancoId)
    }
    if (tipo) {
      filtered = filtered.filter(m => m.tipo === tipo)
    }

    return { success: true, data: filtered }
  } catch (error) {
    logger.error('Error al obtener movimientos', error, { context: 'getMovimientos' })
    return { success: false, error: 'Error al obtener movimientos' }
  }
}

/**
 * Obtener todos los abonos
 */
export async function getAbonos(limit?: number) {
  try {
    const result = await db.query.abonos.findMany({
      with: {
        cliente: true,
        venta: true,
      },
      orderBy: desc(movimientos.createdAt),
      limit: limit ?? 100,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener abonos', error, { context: 'getAbonos' })
    return { success: false, error: 'Error al obtener abonos' }
  }
}

/**
 * Obtener resumen de movimientos
 */
export async function getMovimientosResumen() {
  try {
    const todos = await db.query.movimientos.findMany()

    const ingresos = todos
      .filter((m) => ['ingreso', 'abono', 'transferencia_entrada'].includes(m.tipo))
      .reduce((sum, m) => sum + m.monto, 0)

    const gastos = todos
      .filter((m) => ['gasto', 'pago', 'transferencia_salida'].includes(m.tipo))
      .reduce((sum, m) => sum + m.monto, 0)

    return {
      success: true,
      data: {
        totalMovimientos: todos.length,
        ingresos,
        gastos,
        balance: ingresos - gastos,
      },
    }
  } catch (error) {
    logger.error('Error al obtener resumen', error, { context: 'getMovimientosResumen' })
    return { success: false, error: 'Error al obtener resumen' }
  }
}

/**
 * Obtener estadísticas de movimientos
 */
export async function getMovimientosStats() {
  try {
    const todos = await db.query.movimientos.findMany()

    const total = todos.length

    const porTipo = {
      ingresos: todos.filter((m) => m.tipo === 'ingreso').length,
      gastos: todos.filter((m) => m.tipo === 'gasto').length,
      abonos: todos.filter((m) => m.tipo === 'abono').length,
      transferencias: todos.filter(
        (m) => m.tipo === 'transferencia_entrada' || m.tipo === 'transferencia_salida',
      ).length,
    }

    return {
      success: true,
      data: {
        total,
        porTipo,
      },
    }
  } catch (error) {
    logger.error('Error al obtener stats', error, { context: 'getMovimientosStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}

/**
 * Actualizar movimiento (solo campos editables: concepto, referencia, observaciones)
 */
export async function updateMovimiento(
  input: {
    id: string
    concepto?: string
    referencia?: string
    observaciones?: string
  },
  _options?: { revalidate?: boolean },
) {
  try {
    const { id, concepto, referencia, observaciones } = input

    const movimiento = await db.query.movimientos.findFirst({
      where: eq(movimientos.id, id),
    })

    if (!movimiento) {
      return { success: false, error: 'Movimiento no encontrado' }
    }

    await db
      .update(movimientos)
      .set({
        concepto: concepto ?? movimiento.concepto,
        referencia: referencia ?? movimiento.referencia,
        observaciones: observaciones ?? movimiento.observaciones,
      })
      .where(eq(movimientos.id, id))

    revalidatePath('/movimientos')
    revalidatePath('/bancos')

    return { success: true }
  } catch (error) {
    logger.error('Error al actualizar movimiento', error, { context: 'updateMovimiento', input })
    return { success: false, error: 'Error al actualizar movimiento' }
  }
}
