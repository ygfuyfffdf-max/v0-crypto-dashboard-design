import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
  almacen,
  bancos,
  clientes,
  movimientos,
  ordenesCompra,
  salidaAlmacen,
  ventas,
} from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener una venta específica por ID
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 })
    }

    // Usar leftJoin en lugar de 'with' para compatibilidad con libSQL
    const result = await db
      .select({
        id: ventas.id,
        clienteId: ventas.clienteId,
        fecha: ventas.fecha,
        cantidad: ventas.cantidad,
        precioVentaUnidad: ventas.precioVentaUnidad,
        precioCompraUnidad: ventas.precioCompraUnidad,
        precioFlete: ventas.precioFlete,
        precioTotalVenta: ventas.precioTotalVenta,
        montoPagado: ventas.montoPagado,
        montoRestante: ventas.montoRestante,
        montoBovedaMonte: ventas.montoBovedaMonte,
        montoFletes: ventas.montoFletes,
        montoUtilidades: ventas.montoUtilidades,
        estadoPago: ventas.estadoPago,
        observaciones: ventas.observaciones,
        createdAt: ventas.createdAt,
        clienteIdJoin: clientes.id,
        clienteNombre: clientes.nombre,
        clienteEmail: clientes.email,
        clienteTelefono: clientes.telefono,
      })
      .from(ventas)
      .leftJoin(clientes, eq(ventas.clienteId, clientes.id))
      .where(eq(ventas.id, id))
      .limit(1)

    const firstResult = result[0]
    if (!firstResult) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    // Construir respuesta directamente usando el resultado verificado
    const venta = {
      id: firstResult.id,
      clienteId: firstResult.clienteId,
      fecha: firstResult.fecha,
      cantidad: firstResult.cantidad,
      precioVentaUnidad: firstResult.precioVentaUnidad,
      precioCompraUnidad: firstResult.precioCompraUnidad,
      precioFlete: firstResult.precioFlete,
      precioTotalVenta: firstResult.precioTotalVenta,
      montoPagado: firstResult.montoPagado,
      montoRestante: firstResult.montoRestante,
      montoBovedaMonte: firstResult.montoBovedaMonte,
      montoFletes: firstResult.montoFletes,
      montoUtilidades: firstResult.montoUtilidades,
      estadoPago: firstResult.estadoPago,
      observaciones: firstResult.observaciones,
      createdAt: firstResult.createdAt,
      cliente: firstResult.clienteIdJoin
        ? {
            id: firstResult.clienteIdJoin,
            nombre: firstResult.clienteNombre,
            email: firstResult.clienteEmail,
            telefono: firstResult.clienteTelefono,
          }
        : null,
    }

    return NextResponse.json(venta)
  } catch (error) {
    logger.error('Error obteniendo venta:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar una venta específica
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 })
    }

    // Verificar que la venta existe
    const [ventaActual] = await db.select().from(ventas).where(eq(ventas.id, id))

    if (!ventaActual) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    const now = new Date()
    const { montoPagado: nuevoMontoPagado, observaciones, estadoPago } = body

    // Calcular nuevo estado si se actualiza el monto pagado
    if (nuevoMontoPagado !== undefined) {
      const diferenciaPago = nuevoMontoPagado - (ventaActual.montoPagado || 0)

      if (diferenciaPago > 0) {
        // Recalcular distribución para el abono adicional
        const proporcionAbono = diferenciaPago / (ventaActual.precioTotalVenta || 1)

        const abonoBovedaMonte = (ventaActual.montoBovedaMonte || 0) * proporcionAbono
        const abonoFletes = (ventaActual.montoFletes || 0) * proporcionAbono
        const abonoUtilidades = (ventaActual.montoUtilidades || 0) * proporcionAbono

        // Actualizar bancos con el abono
        if (abonoBovedaMonte > 0) {
          await db
            .update(bancos)
            .set({
              capitalActual: sql`capital_actual + ${abonoBovedaMonte}`,
              historicoIngresos: sql`historico_ingresos + ${abonoBovedaMonte}`,
              updatedAt: now,
            })
            .where(eq(bancos.id, 'boveda_monte'))

          // Crear movimiento de ingreso para Bóveda Monte
          await db.insert(movimientos).values({
            id: crypto.randomUUID(),
            bancoId: 'boveda_monte',
            tipo: 'ingreso',
            monto: abonoBovedaMonte,
            fecha: now,
            concepto: `Abono venta - Costo producto (${ventaActual.cantidad} unidades)`,
            referencia: id,
            ventaId: id,
          })
        }

        if (abonoFletes > 0) {
          await db
            .update(bancos)
            .set({
              capitalActual: sql`capital_actual + ${abonoFletes}`,
              historicoIngresos: sql`historico_ingresos + ${abonoFletes}`,
              updatedAt: now,
            })
            .where(eq(bancos.id, 'flete_sur'))

          // Crear movimiento de ingreso para Flete Sur
          await db.insert(movimientos).values({
            id: crypto.randomUUID(),
            bancoId: 'flete_sur',
            tipo: 'ingreso',
            monto: abonoFletes,
            fecha: now,
            concepto: `Abono venta - Flete (${ventaActual.cantidad} unidades)`,
            referencia: id,
            ventaId: id,
          })
        }

        if (abonoUtilidades > 0) {
          await db
            .update(bancos)
            .set({
              capitalActual: sql`capital_actual + ${abonoUtilidades}`,
              historicoIngresos: sql`historico_ingresos + ${abonoUtilidades}`,
              updatedAt: now,
            })
            .where(eq(bancos.id, 'utilidades'))

          // Crear movimiento de ingreso para Utilidades
          await db.insert(movimientos).values({
            id: crypto.randomUUID(),
            bancoId: 'utilidades',
            tipo: 'ingreso',
            monto: abonoUtilidades,
            fecha: now,
            concepto: `Abono venta - Utilidad neta (${ventaActual.cantidad} unidades)`,
            referencia: id,
            ventaId: id,
          })
        }

        // Actualizar deuda del cliente
        await db
          .update(clientes)
          .set({
            saldoPendiente: sql`saldo_pendiente - ${diferenciaPago}`,
            updatedAt: now,
          })
          .where(eq(clientes.id, ventaActual.clienteId))
      }

      // Determinar nuevo estado
      const nuevoMontoRestante = (ventaActual.precioTotalVenta || 0) - nuevoMontoPagado
      let nuevoEstado: 'completo' | 'parcial' | 'pendiente' = 'pendiente'

      if (nuevoMontoRestante <= 0) {
        nuevoEstado = 'completo'
      } else if (nuevoMontoPagado > 0) {
        nuevoEstado = 'parcial'
      }

      // Actualizar venta
      await db
        .update(ventas)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: Math.max(0, nuevoMontoRestante),
          estadoPago: nuevoEstado,
          observaciones: observaciones ?? ventaActual.observaciones,
          updatedAt: now,
        })
        .where(eq(ventas.id, id))
    } else if (observaciones !== undefined || estadoPago !== undefined) {
      // Actualizar solo campos editables
      await db
        .update(ventas)
        .set({
          observaciones: observaciones ?? ventaActual.observaciones,
          estadoPago: estadoPago ?? ventaActual.estadoPago,
          updatedAt: now,
        })
        .where(eq(ventas.id, id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando venta:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar venta y revertir distribución GYA
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 })
    }

    // Obtener venta actual
    const [ventaActual] = await db.select().from(ventas).where(eq(ventas.id, id))

    if (!ventaActual) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    const now = new Date()

    // Si la venta tenía pagos, revertir la distribución de los bancos
    const montoPagado = ventaActual.montoPagado || 0

    if (montoPagado > 0) {
      // Revertir distribución proporcional
      const montoBovedaMonte = ventaActual.montoBovedaMonte || 0
      const montoFletes = ventaActual.montoFletes || 0
      const montoUtilidades = ventaActual.montoUtilidades || 0

      const proporcionPagada = montoPagado / (ventaActual.precioTotalVenta || 1)

      // Restar de cada banco
      if (montoBovedaMonte > 0) {
        const restar = montoBovedaMonte * proporcionPagada
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${restar}`,
            historicoIngresos: sql`historico_ingresos - ${restar}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'boveda_monte'))
      }

      if (montoFletes > 0) {
        const restar = montoFletes * proporcionPagada
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${restar}`,
            historicoIngresos: sql`historico_ingresos - ${restar}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'flete_sur'))
      }

      if (montoUtilidades > 0) {
        const restar = montoUtilidades * proporcionPagada
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${restar}`,
            historicoIngresos: sql`historico_ingresos - ${restar}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'utilidades'))
      }

      // Actualizar saldo del cliente (eliminar la deuda pendiente)
      const montoRestante = ventaActual.montoRestante || 0
      if (montoRestante > 0) {
        await db
          .update(clientes)
          .set({
            saldoPendiente: sql`saldo_pendiente - ${montoRestante}`,
            updatedAt: now,
          })
          .where(eq(clientes.id, ventaActual.clienteId))
      }
    }

    // Eliminar movimientos asociados
    await db.delete(movimientos).where(eq(movimientos.ventaId, id))

    // ═══════════════════════════════════════════════════════════════════════
    // REVERTIR STOCK: Recuperar stock en OC y Producto
    // ═══════════════════════════════════════════════════════════════════════

    // Revertir stock en la OC (si existe)
    if (ventaActual.ocId) {
      await db
        .update(ordenesCompra)
        .set({
          stockActual: sql`stock_actual + ${ventaActual.cantidad}`,
          stockVendido: sql`MAX(0, COALESCE(stock_vendido, 0) - ${ventaActual.cantidad})`,
          piezasVendidas: sql`MAX(0, COALESCE(piezas_vendidas, 0) - ${ventaActual.cantidad})`,
          numeroVentas: sql`MAX(0, COALESCE(numero_ventas, 0) - 1)`,
          updatedAt: now,
        })
        .where(eq(ordenesCompra.id, ventaActual.ocId))

      logger.info('Stock revertido en OC', {
        context: 'API/ventas/delete',
        data: { ocId: ventaActual.ocId, cantidadRevertida: ventaActual.cantidad },
      })
    }

    // Revertir stock en el producto (si existe)
    if (ventaActual.productoId) {
      await db
        .update(almacen)
        .set({
          cantidad: sql`cantidad + ${ventaActual.cantidad}`,
          totalSalidas: sql`MAX(0, COALESCE(total_salidas, 0) - ${ventaActual.cantidad})`,
          updatedAt: now,
        })
        .where(eq(almacen.id, ventaActual.productoId))

      logger.info('Stock revertido en producto', {
        context: 'API/ventas/delete',
        data: { productoId: ventaActual.productoId, cantidadRevertida: ventaActual.cantidad },
      })
    }

    // Eliminar registro de salida de almacén
    await db.delete(salidaAlmacen).where(eq(salidaAlmacen.ventaId, id))

    // Eliminar la venta
    await db.delete(ventas).where(eq(ventas.id, id))

    logger.info('Venta eliminada', {
      context: 'API',
      data: { ventaId: id, montoPagadoRevertido: montoPagado },
    })

    return NextResponse.json({
      success: true,
      message: 'Venta eliminada y distribución revertida',
    })
  } catch (error) {
    logger.error('Error eliminando venta:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
