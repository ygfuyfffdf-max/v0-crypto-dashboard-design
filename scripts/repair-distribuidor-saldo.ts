/**
 * Script de reparación para sincronizar saldoPendiente de distribuidores
 * con la suma de montoRestante de sus órdenes de compra
 */

import { eq } from 'drizzle-orm'
import { db } from '../database'
import { distribuidores, ordenesCompra } from '../database/schema'

async function main() {
  console.log('🔧 REPARACIÓN DE SALDOS DE DISTRIBUIDORES')
  console.log('═'.repeat(60))

  // 1. Obtener todos los distribuidores
  const dists = await db.select().from(distribuidores)
  console.log(`\n📊 Encontrados ${dists.length} distribuidores`)

  // 2. Para cada distribuidor, calcular deuda real desde sus OCs
  for (const d of dists) {
    console.log(`\n🔍 Procesando: ${d.nombre}`)

    // Obtener todas las OCs del distribuidor
    const ordenesDelDist = await db
      .select({
        id: ordenesCompra.id,
        numeroOrden: ordenesCompra.numeroOrden,
        total: ordenesCompra.total,
        montoPagado: ordenesCompra.montoPagado,
        montoRestante: ordenesCompra.montoRestante,
        estado: ordenesCompra.estado,
      })
      .from(ordenesCompra)
      .where(eq(ordenesCompra.distribuidorId, d.id))

    console.log(`   📦 Órdenes de compra: ${ordenesDelDist.length}`)

    // Calcular deuda real (suma de montoRestante de OCs activas)
    let deudaCalculada = 0
    let totalCompras = 0
    let totalPagado = 0

    for (const oc of ordenesDelDist) {
      if (oc.estado !== 'cancelado') {
        deudaCalculada += oc.montoRestante || 0
        totalCompras += oc.total || 0
        totalPagado += oc.montoPagado || 0
      }
      console.log(`     - ${oc.numeroOrden}: Total=$${oc.total}, Pagado=$${oc.montoPagado}, Restante=$${oc.montoRestante}, Estado=${oc.estado}`)
    }

    console.log(`   📊 Resumen:`)
    console.log(`     • Total compras: $${totalCompras.toLocaleString()}`)
    console.log(`     • Total pagado: $${totalPagado.toLocaleString()}`)
    console.log(`     • Deuda calculada: $${deudaCalculada.toLocaleString()}`)
    console.log(`     • saldoPendiente actual: $${(d.saldoPendiente || 0).toLocaleString()}`)

    const diferencia = Math.abs(deudaCalculada - (d.saldoPendiente || 0))

    if (diferencia > 0.01) {
      console.log(`   ⚠️ INCONSISTENCIA DETECTADA - Diferencia: $${diferencia.toLocaleString()}`)

      // Actualizar saldoPendiente
      await db
        .update(distribuidores)
        .set({
          saldoPendiente: deudaCalculada,
          totalOrdenesCompra: totalCompras,
          totalPagado: totalPagado,
          numeroOrdenes: ordenesDelDist.length,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(distribuidores.id, d.id))

      console.log(`   ✅ ACTUALIZADO: saldoPendiente = $${deudaCalculada.toLocaleString()}`)
    } else {
      console.log(`   ✅ CONSISTENTE - No requiere actualización`)
    }
  }

  // 3. Verificación final
  console.log('\n' + '═'.repeat(60))
  console.log('📊 VERIFICACIÓN FINAL:')

  const distsActualizados = await db.select().from(distribuidores)
  for (const d of distsActualizados) {
    console.log(`   ${d.nombre}: saldoPendiente = $${(d.saldoPendiente || 0).toLocaleString()}`)
  }

  console.log('\n✅ Reparación completada')
}

main().catch(console.error)
