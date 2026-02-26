import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, clientes, ordenesCompra, salidaAlmacen, ventas } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener todas las salidas de almacén
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const result = await db
      .select({
        id: salidaAlmacen.id,
        productoId: salidaAlmacen.productoId,
        ventaId: salidaAlmacen.ventaId,
        cantidad: salidaAlmacen.cantidad,
        origenLotes: salidaAlmacen.origenLotes,
        fecha: salidaAlmacen.fecha,
        observaciones: salidaAlmacen.observaciones,
        createdAt: salidaAlmacen.createdAt,
        // Datos del producto (si existe)
        productoNombre: almacen.nombre,
        productoSku: almacen.sku,
        precioVenta: almacen.precioVenta,
        // Datos de la venta (para obtener cliente y OC)
        ventaOcId: ventas.ocId,
        ventaPrecioVenta: ventas.precioVentaUnidad,
        ventaCantidad: ventas.cantidad,
        // Datos del cliente
        clienteNombre: clientes.nombre,
      })
      .from(salidaAlmacen)
      .leftJoin(almacen, eq(salidaAlmacen.productoId, almacen.id))
      .leftJoin(ventas, eq(salidaAlmacen.ventaId, ventas.id))
      .leftJoin(clientes, eq(ventas.clienteId, clientes.id))
      .orderBy(desc(salidaAlmacen.fecha))

    // Transformar para el frontend
    const salidas = await Promise.all(
      result.map(async (s) => {
        // Si hay origenLotes, extraer el nombre del producto de la OC
        let productoNombre = s.productoNombre || 'Producto'
        let precioVenta = s.precioVenta || s.ventaPrecioVenta || 0

        if (!s.productoNombre && s.origenLotes) {
          try {
            const lotes = JSON.parse(s.origenLotes)
            if (lotes && lotes[0]?.ocId) {
              const [oc] = await db
                .select()
                .from(ordenesCompra)
                .where(eq(ordenesCompra.id, lotes[0].ocId))
              if (oc) {
                productoNombre = oc.producto || `OC ${oc.numeroOrden}`
                precioVenta = s.ventaPrecioVenta || oc.precioUnitario || 0
              }
            }
          } catch {
            // Ignorar error de parseo
          }
        }

        return {
          id: s.id,
          fecha: s.fecha ? new Date(s.fecha).toISOString().split('T')[0] : '',
          hora: s.fecha ? new Date(s.fecha).toTimeString().substring(0, 5) : '',
          productoId: s.productoId || '',
          productoNombre,
          cantidad: s.cantidad,
          ventaId: s.ventaId,
          clienteNombre: s.clienteNombre,
          motivo: s.ventaId ? 'venta' : 'otro',
          precioUnitario: precioVenta,
          valorTotal: precioVenta * s.cantidad,
          usuario: 'Sistema',
          notas: s.observaciones,
          origenLotes: s.origenLotes,
        }
      }),
    )

    return NextResponse.json({ data: salidas })
  } catch (error) {
    logger.error('Error fetching salidas almacén:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear nueva salida de almacén
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { productoId, ventaId, cantidad, motivo = 'otro', observaciones } = body

    if (!productoId || !cantidad || cantidad <= 0) {
      return NextResponse.json(
        { error: 'Campos requeridos: productoId, cantidad (mayor a 0)' },
        { status: 400 },
      )
    }

    // Verificar que el producto existe y tiene stock suficiente
    const [producto] = await db.select().from(almacen).where(eq(almacen.id, productoId))
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if ((producto.cantidad || 0) < cantidad) {
      return NextResponse.json(
        {
          error: `Stock insuficiente. Disponible: ${producto.cantidad || 0}, Solicitado: ${cantidad}`,
        },
        { status: 400 },
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const salidaId = crypto.randomUUID()

    // Crear registro de salida
    await db.insert(salidaAlmacen).values({
      id: salidaId,
      productoId,
      ventaId: ventaId || null,
      cantidad,
      fecha: now,
      observaciones: observaciones || `Salida por ${motivo}`,
    })

    // Actualizar stock del producto
    await db
      .update(almacen)
      .set({
        cantidad: sql`cantidad - ${cantidad}`,
        updatedAt: now,
      })
      .where(eq(almacen.id, productoId))

    logger.info(`Salida de almacén creada: ${cantidad} unidades de ${producto.nombre}`, {
      context: 'Almacén',
      data: { salidaId, productoId, cantidad, motivo },
    })

    return NextResponse.json({
      success: true,
      salidaId,
      mensaje: `Salida de ${cantidad} unidades registrada correctamente`,
    })
  } catch (error) {
    logger.error('Error creando salida almacén:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
