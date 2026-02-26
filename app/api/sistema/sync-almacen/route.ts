import { db } from '@/database'
import {
  almacen,
  entradaAlmacen,
  ordenesCompra,
  salidaAlmacen,
  ventas,
} from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * GET/POST /api/sistema/sync-almacen
 * Sincroniza entradas y salidas de almacén con OCs y ventas
 */
async function syncAlmacen() {
  const resultado = {
    entradasCreadas: 0,
    salidasCreadas: 0,
    productosActualizados: 0,
    detalles: [] as string[],
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. CREAR ENTRADAS PARA ÓRDENES DE COMPRA SIN ENTRADA
  // ═══════════════════════════════════════════════════════════════════
  const ordenesExistentes = await db.select().from(ordenesCompra)

  for (const oc of ordenesExistentes) {
    // Verificar si ya existe entrada para esta OC
    const [entradaExistente] = await db
      .select()
      .from(entradaAlmacen)
      .where(eq(entradaAlmacen.ordenCompraId, oc.id))

    if (!entradaExistente && oc.cantidad && oc.cantidad > 0) {
      const entradaId = uuidv4()
      const fechaOC = oc.fecha || Math.floor(Date.now() / 1000)

      await db.insert(entradaAlmacen).values({
        id: entradaId,
        ordenCompraId: oc.id,
        productoId: oc.productoId || null,
        cantidad: oc.cantidad,
        costoTotal: oc.total || oc.cantidad * (oc.precioUnitario || 0),
        fecha: fechaOC,
        observaciones: `Entrada automática por OC ${oc.numeroOrden} - ${oc.producto} (${oc.cantidad} unidades)`,
      })

      resultado.entradasCreadas++
      resultado.detalles.push(`✅ Entrada creada: OC ${oc.numeroOrden} - ${oc.cantidad} unidades`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. CREAR SALIDAS PARA VENTAS SIN SALIDA
  // ═══════════════════════════════════════════════════════════════════
  const ventasExistentes = await db.select().from(ventas)

  for (const venta of ventasExistentes) {
    // Verificar si ya existe salida para esta venta
    const [salidaExistente] = await db
      .select()
      .from(salidaAlmacen)
      .where(eq(salidaAlmacen.ventaId, venta.id))

    if (!salidaExistente && venta.cantidad && venta.cantidad > 0) {
      const salidaId = uuidv4()
      const fechaVenta = venta.fecha || Math.floor(Date.now() / 1000)

      // Construir origenLotes si hay OC relacionada
      let origenLotes: string | null = null
      if (venta.ocId) {
        origenLotes = JSON.stringify([{ ocId: venta.ocId, cantidad: venta.cantidad }])
      }

      await db.insert(salidaAlmacen).values({
        id: salidaId,
        ventaId: venta.id,
        productoId: venta.productoId || null,
        cantidad: venta.cantidad,
        origenLotes,
        fecha: fechaVenta,
        observaciones: `Salida automática por Venta ${venta.id.slice(0, 8)} - ${venta.cantidad} unidades`,
      })

      resultado.salidasCreadas++
      resultado.detalles.push(`✅ Salida creada: Venta ${venta.id.slice(0, 8)} - ${venta.cantidad} unidades`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. ACTUALIZAR TOTALES EN PRODUCTOS DE ALMACÉN
  // ═══════════════════════════════════════════════════════════════════
  const productosAlmacen = await db.select().from(almacen)

  for (const producto of productosAlmacen) {
    // Calcular total de entradas para este producto
    const [entradaSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(cantidad), 0)` })
      .from(entradaAlmacen)
      .where(eq(entradaAlmacen.productoId, producto.id))

    // Calcular total de salidas para este producto
    const [salidaSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(cantidad), 0)` })
      .from(salidaAlmacen)
      .where(eq(salidaAlmacen.productoId, producto.id))

    const totalEntradas = entradaSum?.total || 0
    const totalSalidas = salidaSum?.total || 0

    // Actualizar producto
    await db
      .update(almacen)
      .set({
        totalEntradas,
        totalSalidas,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(almacen.id, producto.id))

    resultado.productosActualizados++
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. CONTAR TOTALES
  // ═══════════════════════════════════════════════════════════════════
  const [entradasCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(entradaAlmacen)
  const [salidasCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(salidaAlmacen)

  return {
    success: true,
    mensaje: 'Sincronización de almacén completada',
    ...resultado,
    totales: {
      entradas: entradasCount?.count || 0,
      salidas: salidasCount?.count || 0,
    },
  }
}

export async function POST() {
  try {
    const resultado = await syncAlmacen()
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error en sincronización de almacén:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar almacén', details: String(error) },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const resultado = await syncAlmacen()
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error en sincronización de almacén:', error)
    return NextResponse.json(
      { error: 'Error al sincronizar almacén', details: String(error) },
      { status: 500 },
    )
  }
}
