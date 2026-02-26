import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
    almacen,
    bancos,
    distribuidores,
    entradaAlmacen,
    movimientos,
    ordenesCompra,
} from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener una orden específica por ID
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de orden requerido' }, { status: 400 })
    }

    // Usar leftJoin en lugar de 'with' para compatibilidad con libSQL
    const result = await db
      .select({
        id: ordenesCompra.id,
        distribuidorId: ordenesCompra.distribuidorId,
        fecha: ordenesCompra.fecha,
        numeroOrden: ordenesCompra.numeroOrden,
        producto: ordenesCompra.producto,
        cantidad: ordenesCompra.cantidad,
        stockActual: ordenesCompra.stockActual,
        precioUnitario: ordenesCompra.precioUnitario,
        subtotal: ordenesCompra.subtotal,
        total: ordenesCompra.total,
        montoPagado: ordenesCompra.montoPagado,
        montoRestante: ordenesCompra.montoRestante,
        estado: ordenesCompra.estado,
        observaciones: ordenesCompra.observaciones,
        createdAt: ordenesCompra.createdAt,
        updatedAt: ordenesCompra.updatedAt,
        distId: distribuidores.id,
        distNombre: distribuidores.nombre,
        distEmpresa: distribuidores.empresa,
        distTelefono: distribuidores.telefono,
        distEmail: distribuidores.email,
      })
      .from(ordenesCompra)
      .leftJoin(distribuidores, eq(ordenesCompra.distribuidorId, distribuidores.id))
      .where(eq(ordenesCompra.id, id))
      .limit(1)

    const firstResult = result[0]
    if (!firstResult) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Construir respuesta directamente usando el resultado verificado
    const orden = {
      id: firstResult.id,
      distribuidorId: firstResult.distribuidorId,
      fecha: firstResult.fecha,
      numeroOrden: firstResult.numeroOrden,
      producto: firstResult.producto,
      cantidad: firstResult.cantidad,
      stockActual: firstResult.stockActual,
      precioUnitario: firstResult.precioUnitario,
      subtotal: firstResult.subtotal,
      total: firstResult.total,
      montoPagado: firstResult.montoPagado,
      montoRestante: firstResult.montoRestante,
      estado: firstResult.estado,
      observaciones: firstResult.observaciones,
      createdAt: firstResult.createdAt,
      updatedAt: firstResult.updatedAt,
      distId: firstResult.distId,
      distNombre: firstResult.distNombre,
      distEmpresa: firstResult.distEmpresa,
      distTelefono: firstResult.distTelefono,
      distEmail: firstResult.distEmail,
      distribuidor: firstResult.distId
        ? {
            id: firstResult.distId,
            nombre: firstResult.distNombre,
            empresa: firstResult.distEmpresa,
            telefono: firstResult.distTelefono,
            email: firstResult.distEmail,
          }
        : null,
    }

    return NextResponse.json(orden)
  } catch (error) {
    logger.error('Error obteniendo orden:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar orden específica (pagos adicionales, estado, etc.)
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID de orden requerido' }, { status: 400 })
    }

    const [ordenActual] = await db.select().from(ordenesCompra).where(eq(ordenesCompra.id, id))

    if (!ordenActual) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const now = Math.floor(Date.now() / 1000)
    const {
      montoPagado: nuevoMontoPagado,
      bancoOrigenId,
      observaciones,
      estado,
      cantidad: nuevaCantidad,
      stockActual: nuevoStockActual,
    } = body

    // Actualizar stock si se proporciona
    if (nuevaCantidad !== undefined || nuevoStockActual !== undefined) {
      await db
        .update(ordenesCompra)
        .set({
          ...(nuevaCantidad !== undefined && { cantidad: nuevaCantidad }),
          ...(nuevoStockActual !== undefined && { stockActual: nuevoStockActual }),
          updatedAt: now,
        })
        .where(eq(ordenesCompra.id, id))
    }

    // Procesar pago adicional
    if (nuevoMontoPagado !== undefined && bancoOrigenId) {
      const diferenciaPago = nuevoMontoPagado - (ordenActual.montoPagado || 0)

      if (diferenciaPago > 0) {
        // Verificar capital disponible
        const [banco] = await db.select().from(bancos).where(eq(bancos.id, bancoOrigenId))

        if (!banco || (banco.capitalActual || 0) < diferenciaPago) {
          return NextResponse.json(
            { error: 'Capital insuficiente en el banco seleccionado' },
            { status: 400 },
          )
        }

        // Descontar del banco
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${diferenciaPago}`,
            historicoGastos: sql`historico_gastos + ${diferenciaPago}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, bancoOrigenId))

        // Registrar movimiento
        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: bancoOrigenId,
          tipo: 'pago',
          monto: diferenciaPago,
          fecha: now,
          concepto: `Pago adicional OC ${ordenActual.numeroOrden}`,
          referencia: id,
          ordenCompraId: id,
          distribuidorId: ordenActual.distribuidorId,
        })

        // Actualizar deuda del distribuidor
        await db
          .update(distribuidores)
          .set({
            saldoPendiente: sql`saldo_pendiente - ${diferenciaPago}`,
            updatedAt: now,
          })
          .where(eq(distribuidores.id, ordenActual.distribuidorId))
      }

      // Calcular nuevo estado
      const nuevoMontoRestante = (ordenActual.total || 0) - nuevoMontoPagado
      let nuevoEstado: 'pendiente' | 'parcial' | 'completo' | 'cancelado' = 'pendiente'

      if (nuevoMontoRestante <= 0) {
        nuevoEstado = 'completo'
      } else if (nuevoMontoPagado > 0) {
        nuevoEstado = 'parcial'
      }

      await db
        .update(ordenesCompra)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: Math.max(0, nuevoMontoRestante),
          estado: nuevoEstado,
          observaciones: observaciones ?? ordenActual.observaciones,
          updatedAt: now,
        })
        .where(eq(ordenesCompra.id, id))
    } else if (observaciones !== undefined || estado !== undefined) {
      // Actualizar solo campos editables
      await db
        .update(ordenesCompra)
        .set({
          ...(observaciones !== undefined && { observaciones }),
          ...(estado !== undefined && { estado }),
          updatedAt: now,
        })
        .where(eq(ordenesCompra.id, id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando orden:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar orden y revertir cambios (capital, deuda, stock almacén)
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID de orden requerido' }, { status: 400 })
    }

    // Obtener la orden antes de eliminar
    const [orden] = await db.select().from(ordenesCompra).where(eq(ordenesCompra.id, id))

    if (!orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Verificar si tiene ventas asociadas
    if ((orden.stockVendido ?? 0) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: la orden tiene stock vendido' },
        { status: 400 },
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const montoPagado = Number(orden.montoPagado || 0)
    const deudaPendiente = Number(orden.montoRestante || 0)
    const cantidadStock = Number(orden.cantidad || 0)
    const costoTotal = Number(orden.total || 0)

    // 1. Revertir STOCK EN ALMACÉN
    if (orden.productoId && cantidadStock > 0) {
      await db
        .update(almacen)
        .set({
          cantidad: sql`MAX(0, ${almacen.cantidad} - ${cantidadStock})`,
          stockActual: sql`MAX(0, ${almacen.stockActual} - ${cantidadStock})`,
          totalEntradas: sql`MAX(0, ${almacen.totalEntradas} - ${cantidadStock})`,
          ordenesCompraActivas: sql`MAX(0, COALESCE(${almacen.ordenesCompraActivas}, 0) - 1)`,
          valorStockCosto: sql`MAX(0, COALESCE(${almacen.valorStockCosto}, 0) - ${costoTotal})`,
          updatedAt: now,
        })
        .where(eq(almacen.id, orden.productoId))
    }

    // 2. Revertir CAPITAL BANCARIO - Devolver el dinero pagado al banco origen
    if (montoPagado > 0 && orden.bancoOrigenId) {
      await db
        .update(bancos)
        .set({
          capitalActual: sql`capital_actual + ${montoPagado}`,
          historicoGastos: sql`historico_gastos - ${montoPagado}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, orden.bancoOrigenId))
    }

    // 3. Revertir DEUDA y stats DISTRIBUIDOR
    if (orden.distribuidorId) {
      await db
        .update(distribuidores)
        .set({
          saldoPendiente: sql`MAX(0, ${distribuidores.saldoPendiente} - ${deudaPendiente})`,
          totalOrdenesCompra: sql`MAX(0, ${distribuidores.totalOrdenesCompra} - ${costoTotal})`,
          numeroOrdenes: sql`MAX(0, ${distribuidores.numeroOrdenes} - 1)`,
          updatedAt: now,
        })
        .where(eq(distribuidores.id, orden.distribuidorId))
    }

    // 4. Eliminar entradas de almacén asociadas (el stock ya se revirtió en paso 1)
    await db.delete(entradaAlmacen).where(eq(entradaAlmacen.ordenCompraId, id))

    // 6. Eliminar movimientos asociados
    await db.delete(movimientos).where(eq(movimientos.ordenCompraId, id))

    // 7. Eliminar la orden
    await db.delete(ordenesCompra).where(eq(ordenesCompra.id, id))

    logger.info('Orden eliminada correctamente', {
      context: 'API',
      data: {
        ordenId: id,
        capitalRecuperado: montoPagado,
        deudaReducida: deudaPendiente,
        stockRevertido: cantidadStock,
      },
    })

    return NextResponse.json({
      success: true,
      mensaje: 'Orden eliminada y cambios revertidos correctamente',
      revertido: {
        capitalRecuperado: montoPagado,
        deudaReducida: deudaPendiente,
        stockRevertido: cantidadStock,
        costoRevertido: costoTotal,
      },
    })
  } catch (error) {
    logger.error('Error eliminando orden:', error as Error, { context: 'API' })
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: 'Error interno', details: errorMessage }, { status: 500 })
  }
}
