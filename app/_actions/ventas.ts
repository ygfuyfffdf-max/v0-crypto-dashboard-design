'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SERVER ACTIONS: VENTAS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { ventas } from '@/database/schema'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// Re-exportar para compatibilidad

/**
 * Obtener todas las ventas con datos del cliente
 */
export async function getVentas(limit?: number) {
  try {
    const result = await db.query.ventas.findMany({
      with: { cliente: true },
      orderBy: desc(ventas.createdAt),
      limit: limit ?? 100,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener ventas', error, { context: 'getVentas' })
    return { success: false, error: 'Error al obtener ventas' }
  }
}

/**
 * Obtener venta por ID
 */
export async function getVentaById(id: string) {
  try {
    const venta = await db.query.ventas.findFirst({
      where: eq(ventas.id, id),
      with: { cliente: true },
    })
    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }
    return { success: true, data: venta }
  } catch (error) {
    logger.error('Error al obtener venta', error, { context: 'getVentaById', id })
    return { success: false, error: 'Error al obtener venta' }
  }
}

/**
 * Crear una venta - usa crearVentaCompleta internamente
 */
export async function createVenta(input: {
  clienteId?: string
  clienteNombre?: string
  productoId: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete?: number
  montoPagado?: number
  observaciones?: string
}) {
  // Delegar a crearVentaCompleta para mantener consistencia
  const { crearVentaCompleta } = await import('./flujos-completos')
  return crearVentaCompleta({
    clienteId: input.clienteId,
    clienteNombre: input.clienteNombre,
    productoId: input.productoId,
    cantidad: input.cantidad,
    precioVentaUnidad: input.precioVentaUnidad,
    precioCompraUnidad: input.precioCompraUnidad,
    precioFlete: input.precioFlete ?? 0,
    abonoInicial: input.montoPagado ?? 0,
    estadoPago: input.montoPagado && input.montoPagado > 0 ? 'parcial' : 'pendiente',
    observaciones: input.observaciones,
  })
}

/**
 * Registrar abono a una venta
 */
export async function abonarVenta(input: {
  ventaId: string
  monto: number
  bancoDestinoId?: string
  referencia?: string
}) {
  const { registrarAbonoVenta } = await import('./flujos-completos')
  return registrarAbonoVenta(input.ventaId, input.monto, input.referencia || 'Abono a venta')
}

/**
 * Obtener estadísticas de ventas
 */
export async function getVentasStats() {
  try {
    const todasVentas = await db.query.ventas.findMany()

    const totalVentas = todasVentas.length
    const ventasCompletas = todasVentas.filter((v) => v.estado === 'pagada').length
    const ventasPendientes = todasVentas.filter((v) => v.estado === 'activa').length
    const ventasCanceladas = todasVentas.filter((v) => v.estado === 'cancelada').length

    const montoTotal = todasVentas.reduce((sum, v) => sum + (v.precioTotalVenta ?? 0), 0)
    const montoCobrado = todasVentas.reduce((sum, v) => sum + (v.montoPagado ?? 0), 0)
    const montoPendiente = todasVentas.reduce((sum, v) => sum + (v.montoRestante ?? 0), 0)

    return {
      success: true,
      data: {
        totalVentas,
        ventasCompletas,
        ventasPendientes,
        ventasCanceladas,
        montoTotal,
        montoCobrado,
        montoPendiente,
      },
    }
  } catch (error) {
    logger.error('Error al obtener stats de ventas', error, { context: 'getVentasStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}

/**
 * Eliminar una venta (cancelar)
 */
export async function deleteVenta(id: string) {
  try {
    await db.update(ventas).set({ estado: 'cancelada' }).where(eq(ventas.id, id))
    revalidatePath('/ventas')
    return { success: true }
  } catch (error) {
    logger.error('Error al eliminar venta', error, { context: 'deleteVenta', id })
    return { success: false, error: 'Error al eliminar venta' }
  }
}

/**
 * Actualizar una venta
 */
export async function updateVenta(
  id: string,
  data: Partial<{
    observaciones: string
    estado: 'activa' | 'pagada' | 'cancelada'
  }>,
) {
  try {
    await db.update(ventas).set(data).where(eq(ventas.id, id))
    revalidatePath('/ventas')
    return { success: true }
  } catch (error) {
    logger.error('Error al actualizar venta', error, { context: 'updateVenta', id })
    return { success: false, error: 'Error al actualizar venta' }
  }
}
