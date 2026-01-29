'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SERVER ACTIONS: CLIENTES
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { clientes } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import type { CreateClienteInput, UpdateClienteInput } from './types'

/**
 * Obtener todos los clientes
 */
export async function getClientes(limit?: number) {
  try {
    const result = await db.query.clientes.findMany({
      orderBy: desc(clientes.createdAt),
      limit: limit ?? 100,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener clientes', error, { context: 'getClientes' })
    return { success: false, error: 'Error al obtener clientes' }
  }
}

/**
 * Obtener clientes activos
 */
export async function getClientesActivos() {
  try {
    const result = await db.query.clientes.findMany({
      where: eq(clientes.estado, 'activo'),
      orderBy: desc(clientes.createdAt),
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener clientes activos', error, { context: 'getClientesActivos' })
    return { success: false, error: 'Error al obtener clientes activos' }
  }
}

/**
 * Obtener cliente por ID
 */
export async function getClienteById(id: string) {
  try {
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
    })
    if (!cliente) {
      return { success: false, error: 'Cliente no encontrado' }
    }
    return { success: true, data: cliente }
  } catch (error) {
    logger.error('Error al obtener cliente', error, { context: 'getClienteById', id })
    return { success: false, error: 'Error al obtener cliente' }
  }
}

/**
 * Crear nuevo cliente - Soporta FormData y objeto directo
 */
export async function createCliente(formDataOrInput: FormData | CreateClienteInput) {
  try {
    let input: CreateClienteInput

    logger.info('🔍 Input recibido en createCliente', {
      context: 'clientes/createCliente',
      data: { isFormData: formDataOrInput instanceof FormData },
    })

    // Soportar FormData (para formularios) y objetos directos
    if (formDataOrInput instanceof FormData) {
      const nombre = formDataOrInput.get('nombre') as string | null
      const email = formDataOrInput.get('email') as string | null
      const telefono = formDataOrInput.get('telefono') as string | null
      const direccion = formDataOrInput.get('direccion') as string | null
      const rfc = formDataOrInput.get('rfc') as string | null
      const limiteCreditoRaw = formDataOrInput.get('limiteCredito') as string | null

      // Validación básica
      if (!nombre || nombre.trim().length < 2) {
        logger.error('❌ Nombre inválido en createCliente', new Error('Invalid nombre'), {
          context: 'clientes/createCliente',
          data: { nombre },
        })
        return {
          success: false,
          error: 'El nombre es requerido y debe tener al menos 2 caracteres',
        }
      }

      // Validar email si está presente
      if (email && email.trim() !== '' && !email.includes('@')) {
        logger.error('❌ Email inválido en createCliente', new Error('Invalid email'), {
          context: 'clientes/createCliente',
          data: { email },
        })
        return { success: false, error: 'Email inválido' }
      }

      input = {
        nombre: nombre.trim(),
        email: email || undefined,
        telefono: telefono || undefined,
        direccion: direccion || undefined,
        rfc: rfc || undefined,
        limiteCredito: limiteCreditoRaw ? Number(limiteCreditoRaw) : 0,
      }
    } else {
      // Validación para input directo
      if (!formDataOrInput.nombre || formDataOrInput.nombre.trim().length < 2) {
        logger.error(
          '❌ Nombre inválido en createCliente (direct input)',
          new Error('Invalid nombre'),
          {
            context: 'clientes/createCliente',
            data: { nombre: formDataOrInput.nombre },
          },
        )
        return {
          success: false,
          error: 'El nombre es requerido y debe tener al menos 2 caracteres',
        }
      }
      input = formDataOrInput
    }

    logger.info('✅ Validación exitosa, insertando cliente', {
      context: 'clientes/createCliente',
      data: { nombre: input.nombre },
    })

    const id = nanoid()

    await db.insert(clientes).values({
      id,
      nombre: input.nombre,
      email: input.email || null,
      telefono: input.telefono || null,
      direccion: input.direccion || null,
      rfc: input.rfc || null,
      limiteCredito: input.limiteCredito ?? 0,
      creditoDisponible: input.limiteCredito ?? 0,
      estado: 'activo',
      categoria: 'nuevo',
    })

    revalidatePath('/clientes')
    revalidatePath('/dashboard')

    return { success: true, id, data: { id } }
  } catch (error) {
    logger.error('Error al crear cliente', error, { context: 'createCliente' })
    return { success: false, error: 'Error al crear cliente' }
  }
}

/**
 * Actualizar cliente - Soporta FormData y objeto directo
 */
export async function updateCliente(formDataOrInput: FormData | UpdateClienteInput) {
  try {
    let input: UpdateClienteInput

    // Soportar FormData (para formularios) y objetos directos
    if (formDataOrInput instanceof FormData) {
      const id = formDataOrInput.get('id') as string | null
      const nombre = formDataOrInput.get('nombre') as string | null
      const email = formDataOrInput.get('email') as string | null
      const telefono = formDataOrInput.get('telefono') as string | null
      const direccion = formDataOrInput.get('direccion') as string | null
      const rfc = formDataOrInput.get('rfc') as string | null
      const estado = formDataOrInput.get('estado') as string | null
      const limiteCreditoRaw = formDataOrInput.get('limiteCredito') as string | null

      // Validación: ID es requerido
      if (!id) {
        return { success: false, error: 'ID de cliente requerido' }
      }

      input = {
        id,
        nombre: nombre || undefined,
        email: email || undefined,
        telefono: telefono || undefined,
        direccion: direccion || undefined,
        rfc: rfc || undefined,
        estado: estado as 'activo' | 'inactivo' | 'suspendido' | undefined,
        limiteCredito: limiteCreditoRaw ? Number(limiteCreditoRaw) : undefined,
      }
    } else {
      // Validación para input directo
      if (!formDataOrInput.id) {
        return { success: false, error: 'ID de cliente requerido' }
      }
      input = formDataOrInput
    }

    const { id, ...datos } = input

    await db
      .update(clientes)
      .set({
        ...datos,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(clientes.id, id))

    revalidatePath('/clientes')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al actualizar cliente', error, { context: 'updateCliente' })
    return { success: false, error: 'Error al actualizar cliente' }
  }
}

/**
 * Eliminar cliente
 */
export async function deleteCliente(id: string) {
  try {
    await db.delete(clientes).where(eq(clientes.id, id))

    revalidatePath('/clientes')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error al eliminar cliente', error, { context: 'deleteCliente', id })
    return { success: false, error: 'Error al eliminar cliente' }
  }
}

/**
 * Obtener estadísticas de clientes
 */
export async function getClientesStats() {
  try {
    const todosClientes = await db.query.clientes.findMany()

    const totalClientes = todosClientes.length
    const clientesActivos = todosClientes.filter((c) => c.estado === 'activo').length
    const clientesInactivos = todosClientes.filter((c) => c.estado === 'inactivo').length
    const clientesMorosos = todosClientes.filter((c) => c.categoria === 'moroso').length
    const clientesVIP = todosClientes.filter((c) => c.categoria === 'VIP').length

    const deudaTotal = todosClientes.reduce((sum, c) => sum + (c.saldoPendiente ?? 0), 0)
    const comprasTotales = todosClientes.reduce((sum, c) => sum + (c.totalCompras ?? 0), 0)

    return {
      success: true,
      data: {
        totalClientes,
        clientesActivos,
        clientesInactivos,
        clientesMorosos,
        clientesVIP,
        deudaTotal,
        comprasTotales,
      },
    }
  } catch (error) {
    logger.error('Error al obtener stats de clientes', error, { context: 'getClientesStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}
