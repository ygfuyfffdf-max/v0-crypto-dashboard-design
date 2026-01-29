'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SERVER ACTIONS: ÓRDENES DE COMPRA
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { movimientos, ordenesCompra } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

// Re-exportar para compatibilidad

/**
 * Obtener todas las órdenes de compra
 */
export async function getOrdenes(limit?: number) {
  try {
    const result = await db.query.ordenesCompra.findMany({
      with: { distribuidor: true },
      orderBy: desc(ordenesCompra.createdAt),
      limit: limit ?? 100,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener órdenes', error, { context: 'getOrdenes' })
    return { success: false, error: 'Error al obtener órdenes' }
  }
}

/**
 * Obtener órdenes de compra con filtros para tablas
 */
export async function getOrdenesCompra(distribuidorId?: string, limit?: number) {
  try {
    const result = await db.query.ordenesCompra.findMany({
      with: { distribuidor: true },
      orderBy: desc(ordenesCompra.createdAt),
      limit: limit ?? 100,
    })

    // Filtrar por distribuidor si se proporciona
    let filtered = result
    if (distribuidorId) {
      filtered = result.filter(oc => oc.distribuidorId === distribuidorId)
    }

    return { success: true, data: filtered }
  } catch (error) {
    logger.error('Error al obtener órdenes de compra', error, { context: 'getOrdenesCompra' })
    return { success: false, error: 'Error al obtener órdenes de compra' }
  }
}

/**
 * Obtener orden por ID
 */
export async function getOrden(id: string) {
  try {
    const orden = await db.query.ordenesCompra.findFirst({
      where: eq(ordenesCompra.id, id),
      with: { distribuidor: true },
    })
    if (!orden) {
      return { success: false, error: 'Orden no encontrada' }
    }
    return { success: true, data: orden }
  } catch (error) {
    logger.error('Error al obtener orden', error, { context: 'getOrden', id })
    return { success: false, error: 'Error al obtener orden' }
  }
}

/**
 * Crear orden de compra simple
 */
export async function createOrden(input: {
  distribuidorId: string
  cantidad: number
  precioUnitario: number
  iva?: number
  numeroOrden?: string
  observaciones?: string
}) {
  try {
    const id = nanoid()
    const subtotal = input.cantidad * input.precioUnitario
    const totalConIva = subtotal + (input.iva ?? 0)

    await db.insert(ordenesCompra).values({
      id,
      distribuidorId: input.distribuidorId,
      fecha: new Date(),
      cantidad: input.cantidad,
      precioUnitario: input.precioUnitario,
      subtotal,
      iva: input.iva ?? 0,
      total: totalConIva,
      montoPagado: 0,
      montoRestante: totalConIva,
      estado: 'pendiente',
      numeroOrden: input.numeroOrden || `OC-${Date.now()}`,
    })

    revalidatePath('/ordenes')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al crear orden', error, { context: 'createOrden', input })
    return { success: false, error: 'Error al crear orden' }
  }
}

/**
 * Registrar pago de orden
 */
export async function pagarOrden(input: {
  ordenId: string
  monto: number
  bancoOrigenId: string
  referencia?: string
}) {
  try {
    const orden = await db.query.ordenesCompra.findFirst({
      where: eq(ordenesCompra.id, input.ordenId),
    })

    if (!orden) {
      return { success: false, error: 'Orden no encontrada' }
    }

    const nuevoMontoPagado = (orden.montoPagado ?? 0) + input.monto
    const nuevoSaldo = (orden.total ?? 0) - nuevoMontoPagado
    const nuevoEstado = nuevoSaldo <= 0 ? 'completo' : 'parcial'

    await db
      .update(ordenesCompra)
      .set({
        montoPagado: nuevoMontoPagado,
        montoRestante: Math.max(0, nuevoSaldo),
        estado: nuevoEstado,
        fechaUltimoPago: new Date(),
        numeroPagos: (orden.numeroPagos ?? 0) + 1,
        porcentajePagado: (nuevoMontoPagado / (orden.total ?? 1)) * 100,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(ordenesCompra.id, input.ordenId))

    // Registrar movimiento
    await db.insert(movimientos).values({
      id: nanoid(),
      bancoId: input.bancoOrigenId,
      tipo: 'gasto',
      monto: input.monto,
      concepto: `Pago orden ${orden.numeroOrden || orden.id}`,
      fecha: new Date(),
      referencia: input.referencia,
    })

    revalidatePath('/ordenes')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    return { success: true, data: { nuevoSaldo, nuevoEstado } }
  } catch (error) {
    logger.error('Error al pagar orden', error, { context: 'pagarOrden', input })
    return { success: false, error: 'Error al registrar pago' }
  }
}

/**
 * Cancelar orden
 */
export async function cancelarOrden(id: string) {
  try {
    await db
      .update(ordenesCompra)
      .set({
        estado: 'cancelado',
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(ordenesCompra.id, id))

    revalidatePath('/ordenes')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error al cancelar orden', error, { context: 'cancelarOrden', id })
    return { success: false, error: 'Error al cancelar orden' }
  }
}

/**
 * Actualizar orden existente
 */
export async function updateOrden(
  id: string,
  input: Partial<{
    cantidad: number
    precioUnitario: number
    fleteUnitario: number
    observaciones: string
    estado: string
  }>,
) {
  try {
    const orden = await db.query.ordenesCompra.findFirst({
      where: eq(ordenesCompra.id, id),
    })

    if (!orden) {
      return { success: false, error: 'Orden no encontrada' }
    }

    // Recalcular totales si cambian precios
    const cantidad = input.cantidad ?? orden.cantidad ?? 0
    const precioUnitario = input.precioUnitario ?? orden.precioUnitario ?? 0
    const fleteUnitario = input.fleteUnitario ?? orden.fleteUnitario ?? 0
    const subtotal = cantidad * precioUnitario
    const fleteTotal = cantidad * fleteUnitario
    const total = subtotal + fleteTotal

    await db
      .update(ordenesCompra)
      .set({
        cantidad,
        precioUnitario,
        fleteUnitario,
        subtotal,
        fleteTotal,
        total,
        montoRestante: total - (orden.montoPagado ?? 0),
        observaciones: input.observaciones ?? orden.observaciones,
        estado: (input.estado ?? orden.estado) as
          | 'pendiente'
          | 'parcial'
          | 'completo'
          | 'cancelado'
          | null,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(ordenesCompra.id, id))

    revalidatePath('/ordenes')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al actualizar orden', error, { context: 'updateOrden', id, input })
    return { success: false, error: 'Error al actualizar orden' }
  }
}

/**
 * Obtener estadísticas de órdenes
 */
export async function getOrdenesStats() {
  try {
    const todas = await db.query.ordenesCompra.findMany()

    const total = todas.length
    const pendientes = todas.filter((o) => o.estado === 'pendiente').length
    const parciales = todas.filter((o) => o.estado === 'parcial').length
    const completadas = todas.filter((o) => o.estado === 'completo').length
    const canceladas = todas.filter((o) => o.estado === 'cancelado').length

    const montoTotal = todas.reduce((sum, o) => sum + (o.total ?? 0), 0)
    const montoPagado = todas.reduce((sum, o) => sum + (o.montoPagado ?? 0), 0)
    const montoPendiente = todas.reduce((sum, o) => sum + (o.montoRestante ?? 0), 0)

    return {
      success: true,
      data: {
        total,
        pendientes,
        parciales,
        completadas,
        canceladas,
        montoTotal,
        montoPagado,
        montoPendiente,
      },
    }
  } catch (error) {
    logger.error('Error al obtener stats', error, { context: 'getOrdenesStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}
