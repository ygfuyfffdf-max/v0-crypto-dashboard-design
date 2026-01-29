import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/database'
import { almacen } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { logger } from '@/app/lib/utils/logger'
import { AjusteInventarioSchema } from '@/app/lib/schemas/almacen.schema'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Ajustar stock de producto en almacén (ajuste manual de inventario)
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validación con Zod
    const validation = AjusteInventarioSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { productoId, nuevoStock, motivo, notas } = validation.data

    // Verificar que el producto existe
    const [producto] = await db.select().from(almacen).where(eq(almacen.id, productoId))

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const stockAnterior = producto.cantidad || 0
    const diferencia = nuevoStock - stockAnterior
    const now = new Date()

    // Actualizar stock del producto
    await db
      .update(almacen)
      .set({
        cantidad: nuevoStock,
        updatedAt: now,
      })
      .where(eq(almacen.id, productoId))

    logger.info('Ajuste de inventario realizado', {
      context: 'API/almacen/ajuste',
      productoId,
      productoNombre: producto.nombre,
      stockAnterior,
      nuevoStock,
      diferencia,
      motivo,
    })

    return NextResponse.json({
      success: true,
      productoId,
      productoNombre: producto.nombre,
      stockAnterior,
      nuevoStock,
      diferencia,
      tipoAjuste: diferencia > 0 ? 'incremento' : diferencia < 0 ? 'decremento' : 'sin_cambio',
      motivo,
      notas,
    })
  } catch (error) {
    logger.error('Error ajustando inventario:', error as Error, {
      context: 'API/almacen/ajuste',
    })
    return NextResponse.json(
      {
        error: 'Error interno al ajustar inventario',
      },
      { status: 500 },
    )
  }
}
