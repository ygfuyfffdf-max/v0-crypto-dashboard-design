'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SERVER ACTIONS: DISTRIBUIDORES
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, distribuidores, movimientos, ordenesCompra } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

/**
 * Obtener todos los distribuidores
 */
export async function getDistribuidores(limit?: number) {
  try {
    const result = await db.query.distribuidores.findMany({
      orderBy: desc(distribuidores.createdAt),
      limit: limit ?? 100,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener distribuidores', error, { context: 'getDistribuidores' })
    return { success: false, error: 'Error al obtener distribuidores' }
  }
}

/**
 * Obtener distribuidor por ID
 */
export async function getDistribuidor(id: string) {
  try {
    const distribuidor = await db.query.distribuidores.findFirst({
      where: eq(distribuidores.id, id),
    })
    if (!distribuidor) {
      return { success: false, error: 'Distribuidor no encontrado' }
    }
    return { success: true, data: distribuidor }
  } catch (error) {
    logger.error('Error al obtener distribuidor', error, { context: 'getDistribuidor', id })
    return { success: false, error: 'Error al obtener distribuidor' }
  }
}

/**
 * Crear nuevo distribuidor
 */
export async function createDistribuidor(input: {
  nombre: string
  empresa?: string
  telefono?: string
  email?: string
  tipoProductos?: string
}) {
  try {
    logger.info('🔍 Input recibido en createDistribuidor', {
      context: 'distribuidores/createDistribuidor',
      data: { nombre: input.nombre, empresa: input.empresa },
    })

    // Validación básica
    if (!input.nombre || input.nombre.trim().length < 2) {
      logger.error('❌ Nombre inválido', new Error('Invalid nombre'), {
        context: 'distribuidores/createDistribuidor',
        data: { nombre: input.nombre },
      })
      return { success: false, error: 'El nombre es requerido y debe tener al menos 2 caracteres' }
    }

    // Validar email si está presente
    if (input.email && input.email.trim() !== '' && !input.email.includes('@')) {
      return { success: false, error: 'Email inválido' }
    }

    const id = nanoid()

    await db.insert(distribuidores).values({
      id,
      nombre: input.nombre,
      empresa: input.empresa || null,
      telefono: input.telefono || null,
      email: input.email || null,
      tipoProductos: input.tipoProductos || null,
      estado: 'activo',
      categoria: 'nuevo',
    })

    revalidatePath('/distribuidores')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al crear distribuidor', error, { context: 'createDistribuidor', input })
    return { success: false, error: 'Error al crear distribuidor' }
  }
}

/**
 * Actualizar distribuidor
 */
export async function updateDistribuidor(
  input: { id: string } & Partial<{
    nombre: string
    empresa: string
    telefono: string
    email: string
    tipoProductos: string
    estado: 'activo' | 'inactivo' | null
    categoria: 'ocasional' | 'nuevo' | 'normal' | 'estrategico' | 'preferido' | null
  }>,
) {
  try {
    // Validación: ID es requerido
    if (!input.id) {
      return { success: false, error: 'ID de distribuidor requerido' }
    }

    const { id, ...datos } = input

    await db
      .update(distribuidores)
      .set({
        ...datos,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(distribuidores.id, id))

    revalidatePath('/distribuidores')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al actualizar distribuidor', error, {
      context: 'updateDistribuidor',
      input,
    })
    return { success: false, error: 'Error al actualizar distribuidor' }
  }
}

/**
 * Eliminar distribuidor
 */
export async function deleteDistribuidor(id: string) {
  try {
    await db.delete(distribuidores).where(eq(distribuidores.id, id))

    revalidatePath('/distribuidores')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error al eliminar distribuidor', error, { context: 'deleteDistribuidor', id })
    return { success: false, error: 'Error al eliminar distribuidor' }
  }
}

/**
 * Registrar pago a distribuidor
 */
export async function pagarDistribuidor(
  distribuidorId: string,
  monto: number,
  bancoOrigenId: string,
  referencia?: string,
) {
  try {
    logger.info('🔍 Input recibido en pagarDistribuidor', {
      context: 'distribuidores/pagarDistribuidor',
      data: { distribuidorId, monto, bancoOrigenId, referencia },
    })

    // Validaciones pre-operación
    if (!distribuidorId) {
      logger.error('❌ Distribuidor ID faltante', new Error('Missing distribuidorId'), {
        context: 'distribuidores/pagarDistribuidor',
      })
      return { success: false, error: 'ID de distribuidor requerido' }
    }

    if (!monto || monto <= 0) {
      logger.error('❌ Monto inválido', new Error('Invalid monto'), {
        context: 'distribuidores/pagarDistribuidor',
        data: { monto },
      })
      return { success: false, error: 'El monto debe ser mayor a 0' }
    }

    if (!bancoOrigenId) {
      logger.error('❌ Banco origen faltante', new Error('Missing bancoOrigenId'), {
        context: 'distribuidores/pagarDistribuidor',
      })
      return { success: false, error: 'Banco de origen requerido' }
    }

    // Verificar distribuidor
    const distribuidor = await db.query.distribuidores.findFirst({
      where: eq(distribuidores.id, distribuidorId),
    })

    if (!distribuidor) {
      logger.error('❌ Distribuidor no encontrado', new Error('Distribuidor not found'), {
        context: 'distribuidores/pagarDistribuidor',
        data: { distribuidorId },
      })
      return { success: false, error: 'Distribuidor no encontrado' }
    }

    // Verificar banco origen
    const banco = await db.query.bancos.findFirst({
      where: eq(bancos.id, bancoOrigenId),
    })

    if (!banco) {
      return { success: false, error: 'Banco origen no encontrado' }
    }

    if ((banco.capitalActual ?? 0) < monto) {
      return { 
        success: false, 
        error: `Capital insuficiente. Disponible: $${(banco.capitalActual ?? 0).toLocaleString()}`, 
      }
    }

    const nuevoSaldo = (distribuidor.saldoPendiente ?? 0) - monto
    const ahora = Math.floor(Date.now() / 1000)

    // Ejecutar transacción atómica
    await db.transaction(async (tx) => {
      // 1. Actualizar distribuidor
      await tx
        .update(distribuidores)
        .set({
          saldoPendiente: Math.max(0, nuevoSaldo),
          totalPagado: (distribuidor.totalPagado ?? 0) + monto,
          numeroPagos: (distribuidor.numeroPagos ?? 0) + 1,
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(distribuidores.id, distribuidorId))

      // 2. Reducir capital del banco
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${monto}`,
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(bancos.id, bancoOrigenId))

      // 3. Registrar movimiento
      await tx.insert(movimientos).values({
        id: nanoid(),
        bancoId: bancoOrigenId,
        tipo: 'pago',
        monto: monto,
        concepto: `Pago a distribuidor ${distribuidor.nombre}`,
        fecha: ahora,
        referencia,
        distribuidorId,
      })
    })

    revalidatePath('/distribuidores')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    return { success: true, data: { nuevoSaldo } }
  } catch (error) {
    logger.error('Error al pagar distribuidor', error, {
      context: 'pagarDistribuidor',
      distribuidorId,
    })
    return { success: false, error: 'Error al registrar pago' }
  }
}

/**
 * Obtener historial de pagos de distribuidor
 */
export async function getHistorialPagosDistribuidor(distribuidorId: string) {
  try {
    const ordenes = await db.query.ordenesCompra.findMany({
      where: eq(ordenesCompra.distribuidorId, distribuidorId),
      orderBy: desc(ordenesCompra.createdAt),
    })
    return { success: true, data: ordenes }
  } catch (error) {
    logger.error('Error al obtener historial', error, {
      context: 'getHistorialPagosDistribuidor',
      distribuidorId,
    })
    return { success: false, error: 'Error al obtener historial' }
  }
}

/**
 * Obtener estadísticas de distribuidores
 */
export async function getDistribuidoresStats() {
  try {
    const todos = await db.query.distribuidores.findMany()

    const total = todos.length
    const activos = todos.filter((d) => d.estado === 'activo').length
    const conDeuda = todos.filter((d) => (d.saldoPendiente ?? 0) > 0).length

    const deudaTotal = todos.reduce((sum, d) => sum + (d.saldoPendiente ?? 0), 0)
    const comprasTotal = todos.reduce((sum, d) => sum + (d.totalOrdenesCompra ?? 0), 0)

    return {
      success: true,
      data: {
        total,
        activos,
        conDeuda,
        deudaTotal,
        comprasTotal,
      },
    }
  } catch (error) {
    logger.error('Error al obtener stats', error, { context: 'getDistribuidoresStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}
