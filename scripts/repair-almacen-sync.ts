/**
 * Script de reparación para sincronizar entradas/salidas de almacén
 * con órdenes de compra y ventas existentes
 */

import { eq, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database'
import {
  almacen,
  entradaAlmacen,
  ordenesCompra,
  salidaAlmacen,
  ventas,
} from '../database/schema'

async function main() {
  console.log('🔧 REPARACIÓN DE ENTRADAS Y SALIDAS DE ALMACÉN')
  console.log('═'.repeat(60))

  // ═══════════════════════════════════════════════════════════════════
  // 1. CREAR ENTRADAS PARA ÓRDENES DE COMPRA EXISTENTES
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📥 Creando entradas de almacén para órdenes de compra existentes...')

  const ordenesExistentes = await db.select().from(ordenesCompra)
  let entradasCreadas = 0

  for (const oc of ordenesExistentes) {
    // Verificar si ya existe entrada para esta OC
    const [entradaExistente] = await db
      .select()
      .from(entradaAlmacen)
      .where(eq(entradaAlmacen.ordenCompraId, oc.id))

    if (!entradaExistente && oc.cantidad && oc.cantidad > 0) {
      const entradaId = uuidv4()
      const fechaOC = oc.fecha || new Date()

      await db.insert(entradaAlmacen).values({
        id: entradaId,
        ordenCompraId: oc.id,
        productoId: oc.productoId || null,
        cantidad: oc.cantidad,
        costoTotal: oc.total || oc.cantidad * (oc.precioUnitario || 0),
        fecha: fechaOC,
        observaciones: `Entrada por OC ${oc.numeroOrden} - ${oc.producto} (${oc.cantidad} unidades) [Reparación]`,
      })

      entradasCreadas++
      console.log(`   ✅ Entrada creada para OC: ${oc.numeroOrden} | ${oc.cantidad} unidades`)
    }
  }

  console.log(`   📊 Total entradas creadas: ${entradasCreadas}`)

  // ═══════════════════════════════════════════════════════════════════
  // 2. CREAR SALIDAS PARA VENTAS EXISTENTES
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📤 Creando salidas de almacén para ventas existentes...')

  const ventasExistentes = await db.select().from(ventas)
  let salidasCreadas = 0

  for (const venta of ventasExistentes) {
    // Verificar si ya existe salida para esta venta
    const [salidaExistente] = await db
      .select()
      .from(salidaAlmacen)
      .where(eq(salidaAlmacen.ventaId, venta.id))

    if (!salidaExistente && venta.cantidad && venta.cantidad > 0) {
      const salidaId = uuidv4()
      const fechaVenta = venta.fecha || new Date()

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
        observaciones: `Venta ${venta.id.slice(0, 8)} - ${venta.cantidad} unidades [Reparación]`,
      })

      salidasCreadas++
      console.log(`   ✅ Salida creada para Venta: ${venta.id.slice(0, 8)} | ${venta.cantidad} unidades`)
    }
  }

  console.log(`   📊 Total salidas creadas: ${salidasCreadas}`)

  // ═══════════════════════════════════════════════════════════════════
  // 3. ACTUALIZAR totalEntradas y totalSalidas EN PRODUCTOS DE ALMACÉN
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n🔄 Actualizando totales en productos de almacén...')

  const productosAlmacen = await db.select().from(almacen)
  let productosActualizados = 0

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
        updatedAt: new Date(),
      })
      .where(eq(almacen.id, producto.id))

    productosActualizados++
    console.log(`   ✅ ${producto.nombre}: Entradas=${totalEntradas}, Salidas=${totalSalidas}`)
  }

  console.log(`   📊 Total productos actualizados: ${productosActualizados}`)

  // ═══════════════════════════════════════════════════════════════════
  // 4. RESUMEN FINAL
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  console.log('📊 RESUMEN DE REPARACIÓN:')
  console.log(`   - Entradas de almacén creadas: ${entradasCreadas}`)
  console.log(`   - Salidas de almacén creadas: ${salidasCreadas}`)
  console.log(`   - Productos actualizados: ${productosActualizados}`)
  console.log('\n✅ Reparación completada exitosamente!')
}

main().catch(console.error)
