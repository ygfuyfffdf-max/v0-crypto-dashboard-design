// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — SERVER ACTIONS: DEVOLUCIONES
// ═══════════════════════════════════════════════════════════════════════════════
//
// Server Actions para gestión de devoluciones con reversión GYA.
// Flujo completo: solicitar → aprobar → procesar → reembolsar
//
// ═══════════════════════════════════════════════════════════════════════════════

'use server'

import {
    procesarDevolucion as procesarDevolucionService,
    registrarAuditLog,
    type DevolucionInput,
} from '@/app/_lib/services/business-logic-drizzle.service'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { clientes, devoluciones, ventas } from '@/database/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SolicitarDevolucionInput {
  ventaId: string
  cantidadDevuelta: number
  motivo:
    | 'defectuoso'
    | 'error_cantidad'
    | 'error_precio'
    | 'cliente_cambio_opinion'
    | 'producto_incorrecto'
    | 'duplicado'
    | 'otro'
  devolverStock?: boolean
  observaciones?: string
}

export interface DevolucionConVenta {
  id: string
  ventaId: string
  clienteId: string
  tipo: 'total' | 'parcial'
  motivo: string
  estado: string
  cantidadOriginal: number
  cantidadDevuelta: number
  montoTotalDevolucion: number
  reversionBovedaMonte: number
  reversionFletes: number
  reversionUtilidades: number
  montoReembolso: number
  estadoReembolso: string | null
  observaciones: string | null
  createdAt: Date | null
  // Datos de la venta
  clienteNombre?: string
  ventaTotal?: number
}

// ═══════════════════════════════════════════════════════════════
// SOLICITAR DEVOLUCIÓN (crea en estado pendiente)
// ═══════════════════════════════════════════════════════════════

export async function solicitarDevolucion(
  input: SolicitarDevolucionInput,
): Promise<{ success: boolean; devolucionId?: string; error?: string }> {
  try {
    // 1. Obtener venta
    const ventaResult = await db
      .select({
        id: ventas.id,
        clienteId: ventas.clienteId,
        cantidad: ventas.cantidad,
        precioVentaUnidad: ventas.precioVentaUnidad,
        precioCompraUnidad: ventas.precioCompraUnidad,
        precioFlete: ventas.precioFlete,
        precioTotalVenta: ventas.precioTotalVenta,
        montoPagado: ventas.montoPagado,
        montoBovedaMonte: ventas.montoBovedaMonte,
        montoFletes: ventas.montoFletes,
        montoUtilidades: ventas.montoUtilidades,
        estado: ventas.estado,
        ocId: ventas.ocId,
      })
      .from(ventas)
      .where(eq(ventas.id, input.ventaId))
      .limit(1)

    const venta = ventaResult[0]
    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }

    // 2. Validaciones
    if (venta.estado === 'devuelta') {
      return { success: false, error: 'Esta venta ya fue devuelta completamente' }
    }

    if (venta.estado === 'cancelada') {
      return { success: false, error: 'No se puede devolver una venta cancelada' }
    }

    if (input.cantidadDevuelta > venta.cantidad) {
      return {
        success: false,
        error: `La cantidad a devolver (${input.cantidadDevuelta}) excede la cantidad vendida (${venta.cantidad})`,
      }
    }

    if (input.cantidadDevuelta <= 0) {
      return { success: false, error: 'La cantidad a devolver debe ser mayor a 0' }
    }

    // 3. Verificar si ya existe solicitud pendiente
    const devolucionExistente = await db
      .select()
      .from(devoluciones)
      .where(and(eq(devoluciones.ventaId, input.ventaId), eq(devoluciones.estado, 'pendiente')))
      .limit(1)

    if (devolucionExistente.length > 0) {
      return {
        success: false,
        error: 'Ya existe una solicitud de devolución pendiente para esta venta',
      }
    }

    // 4. Calcular montos
    const devolucionId = `dev_${nanoid(12)}`
    const ahora = Math.floor(Date.now() / 1000)
    const tipo = input.cantidadDevuelta === venta.cantidad ? 'total' : 'parcial'
    const proporcion = input.cantidadDevuelta / venta.cantidad

    const montoTotalDevolucion = Number(venta.precioTotalVenta) * proporcion
    const reversionBovedaMonte = Number(venta.montoBovedaMonte) * proporcion
    const reversionFletes = Number(venta.montoFletes) * proporcion
    const reversionUtilidades = Number(venta.montoUtilidades) * proporcion

    // Calcular reembolso (proporcional a lo pagado)
    const porcentajePagado = Number(venta.montoPagado) / Number(venta.precioTotalVenta)
    const montoReembolso = montoTotalDevolucion * porcentajePagado

    // 5. Crear solicitud de devolución
    await db.insert(devoluciones).values({
      id: devolucionId,
      ventaId: input.ventaId,
      clienteId: venta.clienteId,
      tipo,
      motivo: input.motivo,
      estado: 'pendiente', // Requiere aprobación
      cantidadOriginal: venta.cantidad,
      cantidadDevuelta: input.cantidadDevuelta,
      precioVentaUnidad: Number(venta.precioVentaUnidad),
      precioCompraUnidad: Number(venta.precioCompraUnidad),
      precioFleteUnidad: Number(venta.precioFlete),
      montoTotalDevolucion,
      reversionBovedaMonte,
      reversionFletes,
      reversionUtilidades,
      montoReembolso,
      estadoReembolso: montoReembolso > 0 ? 'pendiente' : 'no_aplica',
      devolverStock: (input.devolverStock ?? true) ? 1 : 0,
      ocDestinoId: venta.ocId,
      observaciones: input.observaciones || null,
      createdAt: ahora,
    })

    logger.info('Solicitud de devolución creada', {
      context: 'DevolucionesActions',
      data: { devolucionId, ventaId: input.ventaId, monto: montoTotalDevolucion },
    })

    revalidatePath('/dashboard')
    revalidatePath('/ventas')

    return { success: true, devolucionId }
  } catch (error) {
    logger.error('Error solicitando devolución', error as Error, { context: 'DevolucionesActions' })
    return { success: false, error: 'Error al crear solicitud de devolución' }
  }
}

// ═══════════════════════════════════════════════════════════════
// APROBAR DEVOLUCIÓN
// ═══════════════════════════════════════════════════════════════

export async function aprobarDevolucion(
  devolucionId: string,
  aprobadoPor?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const devolucionResult = await db
      .select()
      .from(devoluciones)
      .where(eq(devoluciones.id, devolucionId))
      .limit(1)

    const devolucion = devolucionResult[0]
    if (!devolucion) {
      return { success: false, error: 'Devolución no encontrada' }
    }

    if (devolucion.estado !== 'pendiente') {
      return {
        success: false,
        error: `No se puede aprobar una devolución en estado: ${devolucion.estado}`,
      }
    }

    await db
      .update(devoluciones)
      .set({
        estado: 'aprobada',
        aprobadoPor: aprobadoPor || null,
        fechaAprobacion: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(devoluciones.id, devolucionId))

    await registrarAuditLog(
      'aprobar',
      'devolucion',
      devolucionId,
      { userId: aprobadoPor },
      {
        descripcion: `Devolución ${devolucionId} aprobada`,
        montoInvolucrado: Number(devolucion.montoTotalDevolucion),
      },
    )

    logger.info('Devolución aprobada', {
      context: 'DevolucionesActions',
      data: { devolucionId },
    })

    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error aprobando devolución', error as Error, { context: 'DevolucionesActions' })
    return { success: false, error: 'Error al aprobar devolución' }
  }
}

// ═══════════════════════════════════════════════════════════════
// PROCESAR DEVOLUCIÓN (ejecuta la reversión GYA)
// ═══════════════════════════════════════════════════════════════

export async function procesarDevolucionCompleta(
  devolucionId: string,
  procesadoPor?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const devolucionResult = await db
      .select()
      .from(devoluciones)
      .where(eq(devoluciones.id, devolucionId))
      .limit(1)

    const devolucion = devolucionResult[0]
    if (!devolucion) {
      return { success: false, error: 'Devolución no encontrada' }
    }

    if (devolucion.estado !== 'aprobada') {
      return {
        success: false,
        error: `Solo se pueden procesar devoluciones aprobadas. Estado actual: ${devolucion.estado}`,
      }
    }

    // Usar el servicio centralizado para procesar
    const result = await procesarDevolucionService(
      {
        ventaId: devolucion.ventaId,
        cantidadDevuelta: devolucion.cantidadDevuelta,
        motivo: devolucion.motivo as DevolucionInput['motivo'],
        devolverStock: Boolean(devolucion.devolverStock ?? 1),
        ocDestinoId: devolucion.ocDestinoId || undefined,
        observaciones: devolucion.observaciones || undefined,
        userId: procesadoPor,
      },
      { userId: procesadoPor },
    )

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Actualizar estado de la devolución original
    await db
      .update(devoluciones)
      .set({
        estado: 'procesada',
        procesadoPor: procesadoPor || null,
        fechaProcesamiento: Math.floor(Date.now() / 1000),
        stockDevuelto: devolucion.devolverStock ?? 1,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(devoluciones.id, devolucionId))

    logger.info('Devolución procesada completamente', {
      context: 'DevolucionesActions',
      data: { devolucionId, ventaId: devolucion.ventaId },
    })

    revalidatePath('/dashboard')
    revalidatePath('/ventas')
    revalidatePath('/bancos')

    return { success: true }
  } catch (error) {
    logger.error('Error procesando devolución', error as Error, { context: 'DevolucionesActions' })
    return { success: false, error: 'Error al procesar devolución' }
  }
}

// ═══════════════════════════════════════════════════════════════
// RECHAZAR DEVOLUCIÓN
// ═══════════════════════════════════════════════════════════════

export async function rechazarDevolucion(
  devolucionId: string,
  motivoRechazo: string,
  rechazadoPor?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const devolucionResult = await db
      .select()
      .from(devoluciones)
      .where(eq(devoluciones.id, devolucionId))
      .limit(1)

    const devolucion = devolucionResult[0]
    if (!devolucion) {
      return { success: false, error: 'Devolución no encontrada' }
    }

    if (devolucion.estado !== 'pendiente') {
      return { success: false, error: 'Solo se pueden rechazar devoluciones pendientes' }
    }

    await db
      .update(devoluciones)
      .set({
        estado: 'rechazada',
        motivoRechazo,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(devoluciones.id, devolucionId))

    await registrarAuditLog(
      'rechazar',
      'devolucion',
      devolucionId,
      { userId: rechazadoPor },
      {
        descripcion: `Devolución ${devolucionId} rechazada: ${motivoRechazo}`,
      },
    )

    logger.info('Devolución rechazada', {
      context: 'DevolucionesActions',
      data: { devolucionId, motivoRechazo },
    })

    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error rechazando devolución', error as Error, { context: 'DevolucionesActions' })
    return { success: false, error: 'Error al rechazar devolución' }
  }
}

// ═══════════════════════════════════════════════════════════════
// CONSULTAS
// ═══════════════════════════════════════════════════════════════

// Tipos para estados válidos
type DevolucionEstado = 'pendiente' | 'aprobada' | 'procesada' | 'rechazada' | 'cancelada'

export async function obtenerDevoluciones(filtros?: {
  estado?: DevolucionEstado
  clienteId?: string
  ventaId?: string
  limit?: number
}): Promise<DevolucionConVenta[]> {
  try {
    let query = db
      .select({
        id: devoluciones.id,
        ventaId: devoluciones.ventaId,
        clienteId: devoluciones.clienteId,
        tipo: devoluciones.tipo,
        motivo: devoluciones.motivo,
        estado: devoluciones.estado,
        cantidadOriginal: devoluciones.cantidadOriginal,
        cantidadDevuelta: devoluciones.cantidadDevuelta,
        montoTotalDevolucion: devoluciones.montoTotalDevolucion,
        reversionBovedaMonte: devoluciones.reversionBovedaMonte,
        reversionFletes: devoluciones.reversionFletes,
        reversionUtilidades: devoluciones.reversionUtilidades,
        montoReembolso: devoluciones.montoReembolso,
        estadoReembolso: devoluciones.estadoReembolso,
        observaciones: devoluciones.observaciones,
        createdAt: devoluciones.createdAt,
        clienteNombre: clientes.nombre,
        ventaTotal: ventas.precioTotalVenta,
      })
      .from(devoluciones)
      .leftJoin(clientes, eq(devoluciones.clienteId, clientes.id))
      .leftJoin(ventas, eq(devoluciones.ventaId, ventas.id))
      .orderBy(desc(devoluciones.createdAt))

    // Aplicar filtros dinámicamente
    const conditions = []
    if (filtros?.estado) {
      const estadoValido = filtros.estado as
        | 'pendiente'
        | 'aprobada'
        | 'procesada'
        | 'rechazada'
        | 'cancelada'
      conditions.push(eq(devoluciones.estado, estadoValido))
    }
    if (filtros?.clienteId) {
      conditions.push(eq(devoluciones.clienteId, filtros.clienteId))
    }
    if (filtros?.ventaId) {
      conditions.push(eq(devoluciones.ventaId, filtros.ventaId))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }

    const limit = filtros?.limit ?? 100
    const results = await query.limit(limit)

    return results as DevolucionConVenta[]
  } catch (error) {
    logger.error('Error obteniendo devoluciones', error as Error, {
      context: 'DevolucionesActions',
    })
    return []
  }
}

export async function obtenerDevolucionPorId(
  devolucionId: string,
): Promise<DevolucionConVenta | null> {
  try {
    const result = await db
      .select({
        id: devoluciones.id,
        ventaId: devoluciones.ventaId,
        clienteId: devoluciones.clienteId,
        tipo: devoluciones.tipo,
        motivo: devoluciones.motivo,
        estado: devoluciones.estado,
        cantidadOriginal: devoluciones.cantidadOriginal,
        cantidadDevuelta: devoluciones.cantidadDevuelta,
        montoTotalDevolucion: devoluciones.montoTotalDevolucion,
        reversionBovedaMonte: devoluciones.reversionBovedaMonte,
        reversionFletes: devoluciones.reversionFletes,
        reversionUtilidades: devoluciones.reversionUtilidades,
        montoReembolso: devoluciones.montoReembolso,
        estadoReembolso: devoluciones.estadoReembolso,
        observaciones: devoluciones.observaciones,
        createdAt: devoluciones.createdAt,
        clienteNombre: clientes.nombre,
        ventaTotal: ventas.precioTotalVenta,
      })
      .from(devoluciones)
      .leftJoin(clientes, eq(devoluciones.clienteId, clientes.id))
      .leftJoin(ventas, eq(devoluciones.ventaId, ventas.id))
      .where(eq(devoluciones.id, devolucionId))
      .limit(1)

    return (result[0] as DevolucionConVenta) || null
  } catch (error) {
    logger.error('Error obteniendo devolución', error as Error, { context: 'DevolucionesActions' })
    return null
  }
}

export async function contarDevolucionesPendientes(): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(devoluciones)
      .where(eq(devoluciones.estado, 'pendiente'))

    return result[0]?.count ?? 0
  } catch (error) {
    logger.error('Error contando devoluciones', error as Error, { context: 'DevolucionesActions' })
    return 0
  }
}
