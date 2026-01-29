import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, entradaAlmacen, ordenesCompra } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener todas las entradas de almacén
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const result = await db
      .select({
        id: entradaAlmacen.id,
        productoId: entradaAlmacen.productoId,
        ordenCompraId: entradaAlmacen.ordenCompraId,
        cantidad: entradaAlmacen.cantidad,
        costoTotal: entradaAlmacen.costoTotal,
        fecha: entradaAlmacen.fecha,
        observaciones: entradaAlmacen.observaciones,
        createdAt: entradaAlmacen.createdAt,
        // Datos del producto (si existe)
        productoNombre: almacen.nombre,
        productoSku: almacen.sku,
        // Datos de la OC (para obtener nombre si no hay productoId)
        ocProducto: ordenesCompra.producto,
        ocNumeroOrden: ordenesCompra.numeroOrden,
      })
      .from(entradaAlmacen)
      .leftJoin(almacen, eq(entradaAlmacen.productoId, almacen.id))
      .leftJoin(ordenesCompra, eq(entradaAlmacen.ordenCompraId, ordenesCompra.id))
      .orderBy(desc(entradaAlmacen.fecha))

    // Transformar para el frontend
    const entradas = result.map((e) => ({
      id: e.id,
      fecha: e.fecha ? new Date(e.fecha).toISOString().split('T')[0] : '',
      hora: e.fecha ? new Date(e.fecha).toTimeString().substring(0, 5) : '',
      productoId: e.productoId || e.ordenCompraId || '',
      // Priorizar nombre de producto, si no existe usar nombre de OC
      productoNombre: e.productoNombre || e.ocProducto || `OC ${e.ocNumeroOrden}` || 'Producto',
      cantidad: e.cantidad,
      ordenCompraId: e.ordenCompraId,
      numeroOrden: e.ocNumeroOrden,
      precioUnitario: e.costoTotal / (e.cantidad || 1),
      costoTotal: e.costoTotal,
      usuario: 'Sistema',
      notas: e.observaciones,
    }))

    return NextResponse.json({ data: entradas })
  } catch (error) {
    logger.error('Error fetching entradas almacén:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear nueva entrada de almacén
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { productoId, ordenCompraId, cantidad, costoUnitario, observaciones } = body

    if (!productoId || !cantidad || cantidad <= 0) {
      return NextResponse.json(
        { error: 'Campos requeridos: productoId, cantidad (mayor a 0)' },
        { status: 400 },
      )
    }

    // Verificar que el producto existe
    const [producto] = await db.select().from(almacen).where(eq(almacen.id, productoId))
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const now = new Date()
    const entradaId = crypto.randomUUID()
    const costoTotal = (costoUnitario || producto.precioCompra || 0) * cantidad

    // Crear registro de entrada
    await db.insert(entradaAlmacen).values({
      id: entradaId,
      productoId,
      ordenCompraId: ordenCompraId || null,
      cantidad,
      costoTotal,
      fecha: now,
      observaciones,
    })

    // Actualizar stock del producto
    await db
      .update(almacen)
      .set({
        cantidad: sql`cantidad + ${cantidad}`,
        updatedAt: now,
      })
      .where(eq(almacen.id, productoId))

    logger.info(`Entrada de almacén creada: ${cantidad} unidades de ${producto.nombre}`, {
      context: 'Almacén',
      data: { entradaId, productoId, cantidad },
    })

    return NextResponse.json({
      success: true,
      entradaId,
      mensaje: `Entrada de ${cantidad} unidades registrada correctamente`,
    })
  } catch (error) {
    logger.error('Error creando entrada almacén:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
