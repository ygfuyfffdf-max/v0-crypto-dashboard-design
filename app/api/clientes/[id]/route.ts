import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { clientes, ventas } from '@/database/schema'
import { count, eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const ActualizarClienteAPISchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100)
    .trim()
    .optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().max(20).optional().or(z.literal('')),
  direccion: z.string().max(200).optional().or(z.literal('')),
  rfc: z.string().max(20).optional().or(z.literal('')),
  limiteCredito: z.number().min(0).optional(),
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
// GET - Obtener un cliente específico por ID
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de cliente requerido' }, { status: 400 })
    }

    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id))

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Obtener estadísticas adicionales del cliente
    const ventasCount = await db
      .select({ count: count() })
      .from(ventas)
      .where(eq(ventas.clienteId, id))

    return NextResponse.json({
      ...cliente,
      stats: {
        totalVentas: ventasCount[0]?.count ?? 0,
      },
    })
  } catch (error) {
    logger.error('Error obteniendo cliente:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar cliente específico
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID de cliente requerido' }, { status: 400 })
    }

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

    // Lista blanca: solo permitir campos actualizables
    const updateData = Object.fromEntries(
      Object.entries(validation.data).filter(([key]) =>
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
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(clientes.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando cliente:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar cliente (soft delete - cambiar estado a inactivo)
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

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

    // Soft delete - cambiar estado a inactivo
    await db
      .update(clientes)
      .set({
        estado: 'inactivo',
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(clientes.id, id))

    logger.info('Cliente desactivado', {
      context: 'API',
      data: { clienteId: id, nombre: cliente.nombre },
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente desactivado exitosamente',
    })
  } catch (error) {
    logger.error('Error eliminando cliente:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
