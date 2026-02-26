import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, ordenesCompra, ventas } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener un producto específico por ID
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 })
    }

    const [producto] = await db.select().from(almacen).where(eq(almacen.id, id))

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error) {
    logger.error('Error obteniendo producto:', error as Error, { context: 'API/almacen' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar un producto
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 })
    }

    const [productoActual] = await db.select().from(almacen).where(eq(almacen.id, id))

    if (!productoActual) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const now = Math.floor(Date.now() / 1000)

    await db
      .update(almacen)
      .set({
        nombre: body.nombre ?? productoActual.nombre,
        descripcion: body.descripcion ?? productoActual.descripcion,
        sku: body.sku ?? productoActual.sku,
        categoria: body.categoria ?? productoActual.categoria,
        cantidad: body.cantidad ?? productoActual.cantidad,
        minimo: body.minimo ?? productoActual.minimo,
        precioCompra: body.precioCompra ?? productoActual.precioCompra,
        precioVenta: body.precioVenta ?? productoActual.precioVenta,
        updatedAt: now,
      })
      .where(eq(almacen.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando producto:', error as Error, { context: 'API/almacen' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar un producto
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 })
    }

    const [productoActual] = await db.select().from(almacen).where(eq(almacen.id, id))

    if (!productoActual) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Verificar si el producto tiene ventas asociadas
    const ventasAsociadas = await db
      .select({ count: sql<number>`count(*)` })
      .from(ventas)
      .where(eq(ventas.productoId, id))

    const ventasCount = ventasAsociadas[0]?.count ?? 0
    if (ventasCount > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar el producto porque tiene ventas asociadas',
          ventasCount,
          suggestion: 'Puede desactivar el producto en lugar de eliminarlo',
        },
        { status: 400 },
      )
    }

    // Verificar si el producto tiene órdenes de compra asociadas
    const ocAsociadas = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordenesCompra)
      .where(eq(ordenesCompra.productoId, id))

    const ordenesCount = ocAsociadas[0]?.count ?? 0
    if (ordenesCount > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar el producto porque tiene órdenes de compra asociadas',
          ordenesCount,
          suggestion: 'Puede desactivar el producto en lugar de eliminarlo',
        },
        { status: 400 },
      )
    }

    await db.delete(almacen).where(eq(almacen.id, id))

    logger.info(`Producto eliminado: ${productoActual.nombre}`, {
      context: 'API/almacen',
      productoId: id,
    })

    return NextResponse.json({
      success: true,
      message: `Producto "${productoActual.nombre}" eliminado`,
    })
  } catch (error) {
    logger.error('Error eliminando producto:', error as Error, { context: 'API/almacen' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
