import { CACHE_KEYS, CACHE_TTL, getCached, invalidateCache } from '@/app/lib/cache'
import { calcularOrdenCompra } from '@/app/lib/formulas'
import { applyRateLimit } from '@/app/lib/rate-limit'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
    almacen,
    bancos,
    distribuidores,
    entradaAlmacen,
    movimientos,
    ordenesCompra,
    ventas,
} from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener todas las órdenes de compra
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await applyRateLimit(request, 'read')
  if (rateLimitResult) return rateLimitResult

  try {
    const ordenes = await getCached(
      CACHE_KEYS.ORDENES_ALL,
      async () => {
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
            stockVendido: ordenesCompra.stockVendido,
            stockReservado: ordenesCompra.stockReservado,
            precioUnitario: ordenesCompra.precioUnitario,
            fleteUnitario: ordenesCompra.fleteUnitario,
            costoUnitarioTotal: ordenesCompra.costoUnitarioTotal,
            subtotal: ordenesCompra.subtotal,
            fleteTotal: ordenesCompra.fleteTotal,
            iva: ordenesCompra.iva,
            total: ordenesCompra.total,
            montoPagado: ordenesCompra.montoPagado,
            montoRestante: ordenesCompra.montoRestante,
            porcentajePagado: ordenesCompra.porcentajePagado,
            numeroPagos: ordenesCompra.numeroPagos,
            fechaUltimoPago: ordenesCompra.fechaUltimoPago,
            estado: ordenesCompra.estado,
            totalVentasGeneradas: ordenesCompra.totalVentasGeneradas,
            piezasVendidas: ordenesCompra.piezasVendidas,
            precioVentaPromedio: ordenesCompra.precioVentaPromedio,
            numeroVentas: ordenesCompra.numeroVentas,
            montoCobrado: ordenesCompra.montoCobrado,
            montoSinCobrar: ordenesCompra.montoSinCobrar,
            porcentajeCobrado: ordenesCompra.porcentajeCobrado,
            gananciaTotal: ordenesCompra.gananciaTotal,
            gananciaRealizada: ordenesCompra.gananciaRealizada,
            gananciaPotencial: ordenesCompra.gananciaPotencial,
            margenBruto: ordenesCompra.margenBruto,
            margenSobreCosto: ordenesCompra.margenSobreCosto,
            roi: ordenesCompra.roi,
            efectivoNeto: ordenesCompra.efectivoNeto,
            velocidadVenta: ordenesCompra.velocidadVenta,
            diasEstimadosAgotamiento: ordenesCompra.diasEstimadosAgotamiento,
            rotacionDias: ordenesCompra.rotacionDias,
            diasDesdeCompra: ordenesCompra.diasDesdeCompra,
            porcentajeVendido: ordenesCompra.porcentajeVendido,
            tiempoPromedioVentaPieza: ordenesCompra.tiempoPromedioVentaPieza,
            eficienciaRotacion: ordenesCompra.eficienciaRotacion,
            estadoStock: ordenesCompra.estadoStock,
            estadoRentabilidad: ordenesCompra.estadoRentabilidad,
            bancoOrigenId: ordenesCompra.bancoOrigenId,
            observaciones: ordenesCompra.observaciones,
            alertas: ordenesCompra.alertas,
            createdBy: ordenesCompra.createdBy,
            createdAt: ordenesCompra.createdAt,
            updatedAt: ordenesCompra.updatedAt,
            // Distribuidor
            distId: distribuidores.id,
            distNombre: distribuidores.nombre,
            distEmpresa: distribuidores.empresa,
            distTelefono: distribuidores.telefono,
            distEmail: distribuidores.email,
          })
          .from(ordenesCompra)
          .leftJoin(distribuidores, eq(ordenesCompra.distribuidorId, distribuidores.id))
          .orderBy(desc(ordenesCompra.fecha))

        // Transformar resultado para mantener estructura anidada
        const ordenes = result.map((row) => ({
          id: row.id,
          distribuidorId: row.distribuidorId,
          fecha: row.fecha,
          numeroOrden: row.numeroOrden,
          producto: row.producto,
          cantidad: row.cantidad,
          stockActual: row.stockActual,
          stockVendido: row.stockVendido,
          stockReservado: row.stockReservado,
          precioUnitario: row.precioUnitario,
          fleteUnitario: row.fleteUnitario,
          costoUnitarioTotal: row.costoUnitarioTotal,
          subtotal: row.subtotal,
          fleteTotal: row.fleteTotal,
          iva: row.iva,
          total: row.total,
          montoPagado: row.montoPagado,
          montoRestante: row.montoRestante,
          porcentajePagado: row.porcentajePagado,
          numeroPagos: row.numeroPagos,
          fechaUltimoPago: row.fechaUltimoPago,
          estado: row.estado,
          totalVentasGeneradas: row.totalVentasGeneradas,
          piezasVendidas: row.piezasVendidas,
          precioVentaPromedio: row.precioVentaPromedio,
          numeroVentas: row.numeroVentas,
          montoCobrado: row.montoCobrado,
          montoSinCobrar: row.montoSinCobrar,
          porcentajeCobrado: row.porcentajeCobrado,
          gananciaTotal: row.gananciaTotal,
          gananciaRealizada: row.gananciaRealizada,
          gananciaPotencial: row.gananciaPotencial,
          margenBruto: row.margenBruto,
          margenSobreCosto: row.margenSobreCosto,
          roi: row.roi,
          efectivoNeto: row.efectivoNeto,
          velocidadVenta: row.velocidadVenta,
          diasEstimadosAgotamiento: row.diasEstimadosAgotamiento,
          rotacionDias: row.rotacionDias,
          diasDesdeCompra: row.diasDesdeCompra,
          porcentajeVendido: row.porcentajeVendido,
          tiempoPromedioVentaPieza: row.tiempoPromedioVentaPieza,
          eficienciaRotacion: row.eficienciaRotacion,
          estadoStock: row.estadoStock,
          estadoRentabilidad: row.estadoRentabilidad,
          bancoOrigenId: row.bancoOrigenId,
          observaciones: row.observaciones,
          alertas: row.alertas,
          createdBy: row.createdBy,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          distribuidor: row.distId
            ? {
                id: row.distId,
                nombre: row.distNombre,
                empresa: row.distEmpresa,
                telefono: row.distTelefono,
                email: row.distEmail,
              }
            : null,
        }))

        return ordenes
      },
      { ttl: CACHE_TTL.MEDIUM, staleWhileRevalidate: true },
    )

    return NextResponse.json(ordenes)
  } catch (error) {
    logger.error('Error fetching ordenes:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear nueva orden de compra
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()

    const {
      distribuidorId,
      productoId,
      cantidad,
      precioUnitario,
      pagoInicial = 0,
      bancoOrigenId,
      observaciones,
    } = body

    // Validaciones
    if (!distribuidorId || !cantidad || !precioUnitario) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: distribuidorId, cantidad, precioUnitario' },
        { status: 400 },
      )
    }

    // Verificar producto si se especifica
    let productoNombre = 'Producto General'
    if (productoId) {
      const [producto] = await db.select().from(almacen).where(eq(almacen.id, productoId))
      if (producto) {
        productoNombre = producto.nombre
      }
    }

    // Verificar que el distribuidor existe
    const [existingDistribuidor] = await db
      .select()
      .from(distribuidores)
      .where(eq(distribuidores.id, distribuidorId))
      .limit(1)

    if (!existingDistribuidor) {
      // NO crear automáticamente - retornar error
      return NextResponse.json(
        {
          error: `El distribuidor con ID ${distribuidorId} no existe. Por favor, créalo primero en la sección de Distribuidores.`,
        },
        { status: 404 },
      )
    }

    // Calcular usando fórmulas centralizadas
    const resultado = calcularOrdenCompra({
      cantidad,
      costoDistribuidor: precioUnitario,
      costoTransporte: 0,
      pagoInicial,
    })

    const ordenId = uuidv4()
    const now = new Date()

    // Generar número de orden secuencial (buscar el número más alto, no el más reciente)
    const [maxOrder] = await db
      .select({
        maxNum: sql<number>`MAX(CAST(SUBSTR(numero_orden, 3) AS INTEGER))`,
      })
      .from(ordenesCompra)
      .where(sql`numero_orden LIKE 'OC%'`)

    const nextNumber = (maxOrder?.maxNum || 0) + 1
    const numeroOrden = `OC${nextNumber.toString().padStart(4, '0')}`

    // Crear la orden de compra
    await db.insert(ordenesCompra).values({
      id: ordenId,
      distribuidorId,
      productoId: productoId || null,
      producto: productoNombre,
      fecha: now,
      numeroOrden,
      cantidad: resultado.stockInicial,
      stockActual: resultado.stockInicial, // Inicializar stockActual con la cantidad inicial
      precioUnitario,
      subtotal: resultado.costoTotal,
      iva: 0,
      total: resultado.costoTotal,
      montoPagado: pagoInicial,
      montoRestante: resultado.deuda,
      estado: resultado.estado,
      bancoOrigenId,
      observaciones,
    })

    // ═══════════════════════════════════════════════════════════════════════
    // REGISTRAR ENTRADA EN ALMACÉN (SIEMPRE - trazabilidad completa)
    // ═══════════════════════════════════════════════════════════════════════

    // Si hay productoId, actualizar stock del producto en almacén
    if (productoId) {
      await db
        .update(almacen)
        .set({
          cantidad: sql`COALESCE(cantidad, 0) + ${cantidad}`,
          totalEntradas: sql`COALESCE(total_entradas, 0) + ${cantidad}`,
          updatedAt: now,
        })
        .where(eq(almacen.id, productoId))

      logger.info('Stock de producto actualizado en almacén', {
        context: 'API/ordenes',
        productoId,
        cantidadAgregada: cantidad,
      })
    }

    // SIEMPRE registrar entrada en historial (con o sin productoId)
    const entradaId = uuidv4()
    await db.insert(entradaAlmacen).values({
      id: entradaId,
      productoId: productoId || null, // Puede ser null si no hay producto en almacén
      cantidad,
      ordenCompraId: ordenId,
      costoTotal: resultado.costoTotal,
      fecha: now,
      observaciones: `Entrada por OC ${numeroOrden} - ${productoNombre} (${cantidad} unidades)`,
    })

    logger.info(`Entrada almacén registrada: ${cantidad} unidades de ${productoNombre}`, {
      context: 'API/ordenes',
      productoId: productoId || 'SIN_PRODUCTO_ALMACEN',
      ordenId,
      numeroOrden,
      entradaId,
    })

    // ═══════════════════════════════════════════════════════════════════════
    // SI HAY PAGO INICIAL, DESCONTAR DEL BANCO ORIGEN
    // ═══════════════════════════════════════════════════════════════════════

    if (pagoInicial > 0 && bancoOrigenId) {
      // Verificar que el banco tiene suficiente capital
      const [banco] = await db.select().from(bancos).where(eq(bancos.id, bancoOrigenId))

      if (banco && (banco.capitalActual || 0) >= pagoInicial) {
        // Descontar del banco
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${pagoInicial}`,
            historicoGastos: sql`historico_gastos + ${pagoInicial}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, bancoOrigenId))

        // Registrar movimiento de gasto
        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: bancoOrigenId,
          tipo: 'gasto',
          monto: pagoInicial,
          fecha: now,
          concepto: `Pago OC ${numeroOrden} - Compra a distribuidor`,
          referencia: ordenId,
          ordenCompraId: ordenId,
          distribuidorId,
        })
      } else {
        return NextResponse.json(
          { error: 'Capital insuficiente en el banco seleccionado' },
          { status: 400 },
        )
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTUALIZAR SALDO PENDIENTE DEL DISTRIBUIDOR SI HAY DEUDA
    // ═══════════════════════════════════════════════════════════════════════

    if (resultado.deuda > 0) {
      await db
        .update(distribuidores)
        .set({
          saldoPendiente: sql`saldo_pendiente + ${resultado.deuda}`,
          updatedAt: now,
        })
        .where(eq(distribuidores.id, distribuidorId))
    }

    // Invalidar caches relacionados
    await Promise.all([
      invalidateCache(CACHE_KEYS.ORDENES_ALL),
      invalidateCache(CACHE_KEYS.BANCOS_ALL),
      invalidateCache(CACHE_KEYS.DISTRIBUIDORES_ALL),
    ])

    return NextResponse.json({
      success: true,
      ordenId,
      numeroOrden,
      stockInicial: resultado.stockInicial,
      costoTotal: resultado.costoTotal,
      deuda: resultado.deuda,
      estado: resultado.estado,
    })
  } catch (error) {
    logger.error('Error creando orden de compra:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar orden (pagos adicionales, actualizar stock, etc.)
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()
    const { id, montoPagado: nuevoMontoPagado, bancoOrigenId, cantidad: nuevaCantidad } = body

    if (!id) {
      return NextResponse.json({ error: 'ID de orden requerido' }, { status: 400 })
    }

    const [ordenActual] = await db.select().from(ordenesCompra).where(eq(ordenesCompra.id, id))

    if (!ordenActual) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const now = new Date()

    // Actualizar stock si se proporciona nueva cantidad
    if (nuevaCantidad !== undefined) {
      await db
        .update(ordenesCompra)
        .set({
          cantidad: nuevaCantidad,
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
          return NextResponse.json({ error: 'Capital insuficiente en el banco' }, { status: 400 })
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
          updatedAt: now,
        })
        .where(eq(ordenesCompra.id, id))
    }

    // Invalidar caches relacionados
    await invalidateCache(CACHE_KEYS.ORDENES_ALL)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando orden:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar orden CON REVERSIÓN COMPLETA DE TRAZABILIDAD
// Revierte: capital bancario, deuda distribuidor, stock de almacén, entrada de almacén
export async function DELETE(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Obtener la orden antes de eliminar para revertir cambios
    const ordenExistente = await db
      .select()
      .from(ordenesCompra)
      .where(eq(ordenesCompra.id, id))
      .limit(1)

    if (!ordenExistente.length) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const orden = ordenExistente[0]
    const now = new Date()
    const cantidad = orden?.cantidad || 0

    logger.info('🗑️ Iniciando eliminación completa de OC con reversión', {
      context: 'API/ordenes/DELETE',
      data: {
        ordenId: id,
        productoId: orden?.productoId,
        cantidad,
        montoPagado: orden?.montoPagado,
        distribuidorId: orden?.distribuidorId,
      },
    })

    // Verificar si hay ventas asociadas - NO permitir eliminar si hay ventas
    const ventasAsociadas = await db
      .select({ id: ventas.id })
      .from(ventas)
      .where(eq(ventas.ocId, id))
      .limit(1)

    if (ventasAsociadas.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar la orden porque tiene ventas asociadas',
          detalle: 'Elimina primero las ventas de esta orden de compra',
        },
        { status: 400 },
      )
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 1. REVERTIR CAPITAL BANCARIO - Devolver el dinero pagado al banco origen
    // ═══════════════════════════════════════════════════════════════════════
    const montoPagado = Number(orden?.montoPagado || 0)
    if (montoPagado > 0 && orden?.bancoOrigenId) {
      await db
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${montoPagado}`,
          historicoGastos: sql`${bancos.historicoGastos} - ${montoPagado}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, orden.bancoOrigenId))

      logger.info('Capital bancario restaurado', {
        context: 'API/ordenes/DELETE',
        bancoId: orden.bancoOrigenId,
        montoRestaurado: montoPagado,
      })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. REVERTIR DEUDA Y MÉTRICAS DEL DISTRIBUIDOR
    // ═══════════════════════════════════════════════════════════════════════
    const deudaPendiente = Number(orden?.montoRestante || 0)
    const totalOrden = Number(orden?.total || 0)
    if (orden?.distribuidorId) {
      await db
        .update(distribuidores)
        .set({
          saldoPendiente: sql`COALESCE(saldo_pendiente, 0) - ${deudaPendiente}`,
          totalOrdenesCompra: sql`COALESCE(total_ordenes_compra, 0) - ${totalOrden}`,
          numeroOrdenes: sql`COALESCE(numero_ordenes, 0) - 1`,
          totalPagado: sql`COALESCE(total_pagado, 0) - ${montoPagado}`,
          updatedAt: now,
        })
        .where(eq(distribuidores.id, orden.distribuidorId))

      logger.info('Métricas de distribuidor revertidas', {
        context: 'API/ordenes/DELETE',
        distribuidorId: orden.distribuidorId,
        deudaReducida: deudaPendiente,
      })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. REVERTIR STOCK EN ALMACÉN (si hay productoId)
    // ═══════════════════════════════════════════════════════════════════════
    if (orden?.productoId && cantidad > 0) {
      await db
        .update(almacen)
        .set({
          cantidad: sql`COALESCE(cantidad, 0) - ${cantidad}`,
          stockActual: sql`COALESCE(stock_actual, 0) - ${cantidad}`,
          totalEntradas: sql`COALESCE(total_entradas, 0) - ${cantidad}`,
          ordenesCompraActivas: sql`COALESCE(ordenes_compra_activas, 0) - 1`,
          updatedAt: now,
        })
        .where(eq(almacen.id, orden.productoId))

      logger.info('Stock de almacén revertido', {
        context: 'API/ordenes/DELETE',
        productoId: orden.productoId,
        cantidadRestada: cantidad,
      })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. ELIMINAR ENTRADA DE ALMACÉN (historial)
    // ═══════════════════════════════════════════════════════════════════════
    await db.delete(entradaAlmacen).where(eq(entradaAlmacen.ordenCompraId, id))

    logger.info('Entrada de almacén eliminada', {
      context: 'API/ordenes/DELETE',
      ordenId: id,
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 5. ELIMINAR MOVIMIENTOS ASOCIADOS
    // ═══════════════════════════════════════════════════════════════════════
    await db.delete(movimientos).where(eq(movimientos.ordenCompraId, id))

    // ═══════════════════════════════════════════════════════════════════════
    // 6. ELIMINAR LA ORDEN
    // ═══════════════════════════════════════════════════════════════════════
    await db.delete(ordenesCompra).where(eq(ordenesCompra.id, id))

    // Invalidar caches relacionados
    await Promise.all([
      invalidateCache(CACHE_KEYS.ORDENES_ALL),
      invalidateCache(CACHE_KEYS.BANCOS_ALL),
      invalidateCache(CACHE_KEYS.DISTRIBUIDORES_ALL),
    ])

    logger.info('✅ Orden eliminada completamente con toda su trazabilidad', {
      context: 'API/ordenes/DELETE',
      ordenId: id,
    })

    return NextResponse.json({
      success: true,
      mensaje: 'Orden eliminada y toda su trazabilidad revertida',
      revertido: {
        capitalRecuperado: montoPagado,
        deudaReducida: deudaPendiente,
        stockAlmacenReducido: orden?.productoId ? cantidad : 0,
        entradaAlmacenEliminada: true,
      },
    })
  } catch (error) {
    logger.error('Error eliminando orden:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
