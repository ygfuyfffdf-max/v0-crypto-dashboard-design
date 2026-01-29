import { ERROR_CODES, errorFromException, successWithCache } from '@/app/lib/api-response'
import { CACHE_KEYS, invalidateCache } from '@/app/lib/cache'
import { applyRateLimit } from '@/app/lib/rate-limit'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { clientes } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// Configuración de cache (revalidar cada 60 segundos)
export const dynamic = 'force-dynamic'
export const revalidate = 60

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const CrearClienteAPISchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).trim(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().max(20).optional().or(z.literal('')),
  direccion: z.string().max(200).optional().or(z.literal('')),
  rfc: z.string().max(20).optional().or(z.literal('')),
  limiteCredito: z.number().min(0).optional().default(0),
})

const ActualizarClienteAPISchema = CrearClienteAPISchema.partial().extend({
  id: z.string().min(1, 'ID de cliente requerido'),
})

// Campos permitidos para actualización (lista blanca)
const CAMPOS_ACTUALIZABLES = [
  'nombre',
  'email',
  'telefono',
  'direccion',
  'rfc',
  'limiteCredito',
] as const

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener todos los clientes
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await applyRateLimit(request, 'read')
  if (rateLimitResult) return rateLimitResult

  try {
    const clientesData = await db.select().from(clientes).orderBy(clientes.nombre)

    return successWithCache(
      clientesData,
      { ttl: 60, staleWhileRevalidate: 120 },
      { total: clientesData.length },
    )
  } catch (error) {
    return errorFromException(error, 'ClientesAPI', ERROR_CODES.DATABASE_ERROR)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear nuevo cliente
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()

    // Validación Zod
    const validation = CrearClienteAPISchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de cliente inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { nombre, email, telefono, direccion, rfc, limiteCredito } = validation.data

    const clienteId = uuidv4()
    const now = new Date()

    await db.insert(clientes).values({
      id: clienteId,
      nombre,
      email: email || null,
      telefono: telefono || null,
      direccion: direccion || null,
      rfc: rfc || null,
      limiteCredito,
      saldoPendiente: 0,
      estado: 'activo',
      createdAt: now,
      updatedAt: now,
    })

    // Invalidar cache de clientes
    await invalidateCache(CACHE_KEYS.CLIENTES_ALL)

    return NextResponse.json({
      success: true,
      clienteId,
      nombre,
    })
  } catch (error) {
    logger.error('Error creando cliente:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar cliente
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()

    // Validación Zod
    const validation = ActualizarClienteAPISchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de actualización inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { id, ...rawUpdateData } = validation.data

    // Lista blanca: solo permitir campos actualizables
    const updateData = Object.fromEntries(
      Object.entries(rawUpdateData).filter(([key]) =>
        CAMPOS_ACTUALIZABLES.includes(key as (typeof CAMPOS_ACTUALIZABLES)[number]),
      ),
    )

    const [clienteExistente] = await db.select().from(clientes).where(eq(clientes.id, id))

    if (!clienteExistente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    await db
      .update(clientes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(clientes.id, id))

    // Invalidar cache de clientes
    await invalidateCache(CACHE_KEYS.CLIENTES_ALL)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando cliente:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar cliente permanentemente de la base de datos
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de cliente requerido' }, { status: 400 })
    }

    // Verificar que el cliente existe
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id))

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Verificar si el cliente tiene deuda pendiente
    if ((cliente.saldoPendiente || 0) > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar un cliente con deuda pendiente',
          deudaPendiente: cliente.saldoPendiente,
        },
        { status: 400 },
      )
    }

    // Hard delete - eliminar permanentemente de la base de datos
    await db.delete(clientes).where(eq(clientes.id, id))

    // Invalidar cache de clientes
    await invalidateCache(CACHE_KEYS.CLIENTES_ALL)

    logger.info('Cliente eliminado permanentemente', {
      context: 'API',
      data: { clienteId: id, nombre: cliente.nombre },
    })

    return NextResponse.json({ success: true, message: 'Cliente eliminado permanentemente' })
  } catch (error) {
    logger.error('Error eliminando cliente:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
