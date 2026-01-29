/**
 * Script de diagnóstico para verificar entradas y salidas de almacén
 */

import { count, desc } from 'drizzle-orm'
import { db } from '../database'
import { almacen, entradaAlmacen, ordenesCompra, salidaAlmacen, ventas } from '../database/schema'

async function main() {
  console.log('🔍 DIAGNÓSTICO DE ALMACÉN')
  console.log('═'.repeat(50))

  // 1. Contar registros en cada tabla
  const [entradas] = await db.select({ count: count() }).from(entradaAlmacen)
  const [salidas] = await db.select({ count: count() }).from(salidaAlmacen)
  const [productos] = await db.select({ count: count() }).from(almacen)
  const [ordenes] = await db.select({ count: count() }).from(ordenesCompra)
  const [ventasCount] = await db.select({ count: count() }).from(ventas)

  console.log('\n📊 CONTEO DE REGISTROS:')
  console.log(`   - Productos en almacén: ${productos.count}`)
  console.log(`   - Órdenes de compra: ${ordenes.count}`)
  console.log(`   - Ventas: ${ventasCount.count}`)
  console.log(`   - Entradas de almacén: ${entradas.count}`)
  console.log(`   - Salidas de almacén: ${salidas.count}`)

  // 2. Ver últimas 5 órdenes de compra
  const ultimasOC = await db
    .select({
      id: ordenesCompra.id,
      producto: ordenesCompra.producto,
      cantidad: ordenesCompra.cantidad,
      stockActual: ordenesCompra.stockActual,
      fecha: ordenesCompra.fecha,
    })
    .from(ordenesCompra)
    .orderBy(desc(ordenesCompra.fecha))
    .limit(5)

  console.log('\n📦 ÚLTIMAS 5 ÓRDENES DE COMPRA:')
  ultimasOC.forEach((oc, i) => {
    console.log(`   ${i + 1}. ${oc.producto} | Cantidad: ${oc.cantidad} | Stock: ${oc.stockActual}`)
  })

  // 3. Ver últimas 5 ventas
  const ultimasVentas = await db
    .select({
      id: ventas.id,
      cantidad: ventas.cantidad,
      precioVenta: ventas.precioVentaUnidad,
      ocId: ventas.ocId,
      productoId: ventas.productoId,
      fecha: ventas.fecha,
    })
    .from(ventas)
    .orderBy(desc(ventas.fecha))
    .limit(5)

  console.log('\n🛒 ÚLTIMAS 5 VENTAS:')
  ultimasVentas.forEach((v, i) => {
    console.log(
      `   ${i + 1}. Cantidad: ${v.cantidad} | Precio: $${v.precioVenta} | OC: ${v.ocId?.slice(0, 8) || 'N/A'} | Producto: ${v.productoId?.slice(0, 8) || 'N/A'}`,
    )
  })

  // 4. Ver últimas 5 entradas
  const ultimasEntradas = await db
    .select()
    .from(entradaAlmacen)
    .orderBy(desc(entradaAlmacen.fecha))
    .limit(5)

  console.log('\n📥 ÚLTIMAS 5 ENTRADAS:')
  if (ultimasEntradas.length === 0) {
    console.log('   ⚠️ NO HAY ENTRADAS REGISTRADAS')
  } else {
    ultimasEntradas.forEach((e, i) => {
      console.log(
        `   ${i + 1}. Cantidad: ${e.cantidad} | OC: ${e.ordenCompraId?.slice(0, 8) || 'N/A'} | Producto: ${e.productoId?.slice(0, 8) || 'N/A'}`,
      )
    })
  }

  // 5. Ver últimas 5 salidas
  const ultimasSalidas = await db
    .select()
    .from(salidaAlmacen)
    .orderBy(desc(salidaAlmacen.fecha))
    .limit(5)

  console.log('\n📤 ÚLTIMAS 5 SALIDAS:')
  if (ultimasSalidas.length === 0) {
    console.log('   ⚠️ NO HAY SALIDAS REGISTRADAS')
  } else {
    ultimasSalidas.forEach((s, i) => {
      console.log(
        `   ${i + 1}. Cantidad: ${s.cantidad} | Venta: ${s.ventaId?.slice(0, 8) || 'N/A'} | Producto: ${s.productoId?.slice(0, 8) || 'N/A'}`,
      )
    })
  }

  console.log('\n' + '═'.repeat(50))
  console.log('✅ Diagnóstico completado')
}

main().catch(console.error)
