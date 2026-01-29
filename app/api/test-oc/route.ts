import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, distribuidores, entradaAlmacen, ordenesCompra } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    logger.info('TEST OC - Body recibido', { context: 'TestOC', data: body })

    const ahora = new Date()
    let distribuidorId = body.distribuidorId
    let productoId = body.productoId
    let distribuidorNuevo = false
    let productoNuevo = false

    // Calcular totales
    const cantidad = body.cantidad || 1
    const precioUnitario = body.precioUnitario || 0
    const fleteUnitario = body.fleteUnitario || 0
    const subtotal = precioUnitario * cantidad
    const fleteTotal = fleteUnitario * cantidad
    const total = subtotal + fleteTotal
    const montoPagado = body.montoPagoInicial || 0
    const montoRestante = total - montoPagado

    // Generar IDs
    const ordenId = `oc_${nanoid(12)}`
    const entradaId = `entrada_${nanoid(12)}`
    const numeroOrden = `OC-${Date.now().toString(36).toUpperCase()}`

    await db.transaction(async (tx) => {
      // PASO 1: Crear distribuidor si es nuevo
      if (!distribuidorId && body.distribuidorNombre) {
        const nuevoDistribuidorId = `dist_${nanoid(12)}`
        await tx.insert(distribuidores).values({
          id: nuevoDistribuidorId,
          nombre: body.distribuidorNombre,
          telefono: body.distribuidorTelefono ?? null,
          email: body.distribuidorEmail ?? null,
          saldoPendiente: 0,
          totalOrdenesCompra: 0,
          totalPagado: 0,
          numeroOrdenes: 0,
          numeroPagos: 0,
          createdAt: ahora,
          updatedAt: ahora,
        })
        distribuidorId = nuevoDistribuidorId
        distribuidorNuevo = true
      }

      // PASO 2: Crear producto si es nuevo
      if (!productoId && body.productoNombre) {
        const nuevoProductoId = `prod_${nanoid(12)}`
        const precioCompraConFlete = precioUnitario + fleteUnitario
        await tx.insert(almacen).values({
          id: nuevoProductoId,
          nombre: body.productoNombre,
          descripcion: body.productoDescripcion ?? null,
          sku: body.productoSku ?? null,
          cantidad: 0,
          stockActual: 0,
          totalEntradas: 0,
          totalSalidas: 0,
          precioCompra: precioCompraConFlete, // Incluye flete
          precioVenta: precioCompraConFlete * 1.5,
          valorStockCosto: 0,
          ordenesCompraActivas: 0,
          distribuidorPrincipalId: distribuidorId ?? null,
          createdAt: ahora,
          updatedAt: ahora,
        })
        productoId = nuevoProductoId
        productoNuevo = true
      }

      // PASO 3: Crear orden de compra
      const estado = montoRestante <= 0 ? 'completo' : montoPagado > 0 ? 'parcial' : 'pendiente'

      await tx.insert(ordenesCompra).values({
        id: ordenId,
        distribuidorId: distribuidorId!,
        productoId: productoId ?? null,
        fecha: ahora,
        numeroOrden,
        cantidad,
        precioUnitario,
        fleteUnitario,
        subtotal,
        iva: 0,
        total,
        montoPagado,
        montoRestante,
        stockActual: cantidad,
        stockVendido: 0,
        estado,
        bancoOrigenId: body.bancoOrigenId ?? null,
        observaciones: body.observaciones ?? null,
      })

      // PASO 4: Actualizar stock del producto
      if (productoId) {
        const precioCompraConFlete = precioUnitario + fleteUnitario
        const valorStockNuevo = precioCompraConFlete * cantidad
        await tx
          .update(almacen)
          .set({
            cantidad: sql`${almacen.cantidad} + ${cantidad}`,
            stockActual: sql`${almacen.stockActual} + ${cantidad}`,
            totalEntradas: sql`${almacen.totalEntradas} + ${cantidad}`,
            precioCompra: precioCompraConFlete, // Incluye flete
            valorStockCosto: sql`COALESCE(${almacen.valorStockCosto}, 0) + ${valorStockNuevo}`,
            ordenesCompraActivas: sql`COALESCE(${almacen.ordenesCompraActivas}, 0) + 1`,
            updatedAt: ahora,
          })
          .where(eq(almacen.id, productoId))
      }

      // PASO 5: Registrar entrada
      await tx.insert(entradaAlmacen).values({
        id: entradaId,
        ordenCompraId: ordenId,
        productoId: productoId ?? '',
        cantidad,
        costoTotal: total,
        fecha: ahora,
        observaciones: `Entrada automática por OC ${numeroOrden}`,
      })

      // PASO 6: Actualizar distribuidor
      if (distribuidorId) {
        await tx
          .update(distribuidores)
          .set({
            saldoPendiente: sql`${distribuidores.saldoPendiente} + ${montoRestante}`,
            totalOrdenesCompra: sql`${distribuidores.totalOrdenesCompra} + ${total}`,
            numeroOrdenes: sql`${distribuidores.numeroOrdenes} + 1`,
            updatedAt: ahora,
          })
          .where(eq(distribuidores.id, distribuidorId))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ordenId,
        numeroOrden,
        distribuidorId,
        productoId,
        total,
        distribuidorNuevo,
        productoNuevo,
        entradaAlmacenId: entradaId,
      },
    })
  } catch (error) {
    logger.error('TEST OC - Error', error as Error, { context: 'TestOC' })
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
