import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { distribuidores, ordenesCompra } from '@/database/schema'
import { count, eq, sum } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const ActualizarDistribuidorAPISchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100)
    .trim()
    .optional(),
  empresa: z.string().max(100).optional().or(z.literal('')),
  telefono: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  tipoProductos: z.string().max(200).optional().or(z.literal('')),
})

// Campos permitidos para actualización (lista blanca)
const CAMPOS_ACTUALIZABLES = ['nombre', 'empresa', 'telefono', 'email', 'tipoProductos'] as const

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener un distribuidor específico por ID
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de distribuidor requerido' }, { status: 400 })
    }

    const [distribuidor] = await db.select().from(distribuidores).where(eq(distribuidores.id, id))

    if (!distribuidor) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 })
    }

    // Obtener estadísticas adicionales
    const ordenesStats = await db
      .select({
        count: count(),
        total: sum(ordenesCompra.total),
      })
      .from(ordenesCompra)
      .where(eq(ordenesCompra.distribuidorId, id))

    return NextResponse.json({
      ...distribuidor,
      stats: {
        totalOrdenes: ordenesStats[0]?.count ?? 0,
        montoTotalCompras: Number(ordenesStats[0]?.total ?? 0),
      },
    })
  } catch (error) {
    logger.error('Error obteniendo distribuidor:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar distribuidor específico
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID de distribuidor requerido' }, { status: 400 })
    }

    // Validación Zod
    const validation = ActualizarDistribuidorAPISchema.safeParse(body)
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

    const [distribuidorExistente] = await db
      .select()
      .from(distribuidores)
      .where(eq(distribuidores.id, id))

    if (!distribuidorExistente) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 })
    }

    await db
      .update(distribuidores)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(distribuidores.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando distribuidor:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar distribuidor (soft delete - cambiar estado a inactivo)
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de distribuidor requerido' }, { status: 400 })
    }

    // Verificar que el distribuidor existe
    const [distribuidor] = await db.select().from(distribuidores).where(eq(distribuidores.id, id))

    if (!distribuidor) {
      return NextResponse.json({ error: 'Distribuidor no encontrado' }, { status: 404 })
    }

    // Verificar si el distribuidor tiene deuda pendiente (nosotros le debemos)
    if ((distribuidor.saldoPendiente || 0) > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar un distribuidor con deuda pendiente',
          deudaPendiente: distribuidor.saldoPendiente,
        },
        { status: 400 },
      )
    }

    // Soft delete - cambiar estado a inactivo
    await db
      .update(distribuidores)
      .set({
        estado: 'inactivo',
        updatedAt: new Date(),
      })
      .where(eq(distribuidores.id, id))

    logger.info('Distribuidor desactivado', {
      context: 'API',
      data: { distribuidorId: id, nombre: distribuidor.nombre },
    })

    return NextResponse.json({
      success: true,
      message: 'Distribuidor desactivado exitosamente',
    })
  } catch (error) {
    logger.error('Error eliminando distribuidor:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
