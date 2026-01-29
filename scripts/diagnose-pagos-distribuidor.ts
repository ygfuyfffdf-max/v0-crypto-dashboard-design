/**
 * Script de diagnóstico para verificar el estado de pagos a distribuidores
 */

import { desc, sql } from 'drizzle-orm'
import * as fs from 'fs'
import { db } from '../database'
import { bancos, distribuidores, movimientos, ordenesCompra } from '../database/schema'

const output: string[] = []
const log = (msg: string) => {
  console.log(msg)
  output.push(msg)
}

async function main() {
  console.log('🔍 DIAGNÓSTICO DE PAGOS A DISTRIBUIDORES')
  console.log('═'.repeat(60))

  // 1. Estado de distribuidores
  console.log('\n📊 DISTRIBUIDORES:')
  const dists = await db.select().from(distribuidores)
  dists.forEach((d) => {
    console.log(`   - ${d.nombre}:`)
    console.log(`     • saldoPendiente: $${d.saldoPendiente?.toLocaleString() || 0}`)
    console.log(`     • totalPagado: $${d.totalPagado?.toLocaleString() || 0}`)
    console.log(`     • numeroOrdenes: ${d.numeroOrdenes || 0}`)
  })

  // 2. Estado de órdenes de compra
  console.log('\n📦 ÓRDENES DE COMPRA:')
  const ordenes = await db.select().from(ordenesCompra)
  let totalDeuda = 0
  ordenes.forEach((oc) => {
    const deuda = oc.montoRestante || 0
    totalDeuda += deuda
    console.log(`   - ${oc.numeroOrden} (${oc.producto}):`)
    console.log(`     • total: $${oc.total?.toLocaleString() || 0}`)
    console.log(`     • montoPagado: $${oc.montoPagado?.toLocaleString() || 0}`)
    console.log(`     • montoRestante: $${oc.montoRestante?.toLocaleString() || 0}`)
    console.log(`     • estado: ${oc.estado}`)
    console.log(`     • distribuidorId: ${oc.distribuidorId}`)
  })
  console.log(`   📊 Total deuda en OCs: $${totalDeuda.toLocaleString()}`)

  // 3. Movimientos de tipo pago
  console.log('\n💸 MOVIMIENTOS DE PAGO A DISTRIBUIDORES:')
  const pagos = await db
    .select()
    .from(movimientos)
    .where(
      sql`${movimientos.concepto} LIKE '%distribuidor%' OR ${movimientos.tipo} = 'pago' OR ${movimientos.distribuidorId} IS NOT NULL`,
    )
    .orderBy(desc(movimientos.fecha))
    .limit(10)

  if (pagos.length === 0) {
    console.log('   ⚠️ NO HAY MOVIMIENTOS DE PAGO A DISTRIBUIDORES')
  } else {
    pagos.forEach((p) => {
      console.log(`   - ${p.concepto}:`)
      console.log(`     • monto: $${p.monto?.toLocaleString() || 0}`)
      console.log(`     • banco: ${p.bancoId}`)
      console.log(`     • tipo: ${p.tipo}`)
      console.log(`     • distribuidorId: ${p.distribuidorId || 'N/A'}`)
      console.log(`     • ordenCompraId: ${p.ordenCompraId || 'N/A'}`)
    })
  }

  // 4. Estado de bancos
  console.log('\n🏦 BANCOS:')
  const bancosData = await db.select().from(bancos)
  bancosData.forEach((b) => {
    console.log(`   - ${b.nombre}:`)
    console.log(`     • capitalActual: $${b.capitalActual?.toLocaleString() || 0}`)
    console.log(`     • historicoGastos: $${b.historicoGastos?.toLocaleString() || 0}`)
  })

  // 5. VERIFICACIÓN DE CONSISTENCIA
  console.log('\n🔎 VERIFICACIÓN DE CONSISTENCIA:')

  // Suma de montoRestante de todas las OCs por distribuidor
  for (const d of dists) {
    const ordenesDelDist = ordenes.filter((oc) => oc.distribuidorId === d.id)
    const deudaCalculada = ordenesDelDist.reduce((sum, oc) => sum + (oc.montoRestante || 0), 0)
    const deudaRegistrada = d.saldoPendiente || 0

    const diferencia = Math.abs(deudaCalculada - deudaRegistrada)
    const esConsistente = diferencia < 0.01

    console.log(`   ${d.nombre}:`)
    console.log(`     • Deuda calculada (sum OCs): $${deudaCalculada.toLocaleString()}`)
    console.log(`     • Deuda registrada (saldoPendiente): $${deudaRegistrada.toLocaleString()}`)
    console.log(`     • ${esConsistente ? '✅ CONSISTENTE' : `❌ INCONSISTENTE (diferencia: $${diferencia.toLocaleString()})`}`)

    if (!esConsistente) {
      console.log(`     ⚠️ REQUIERE SINCRONIZACIÓN`)
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ Diagnóstico completado')

  // Guardar resultado
  fs.writeFileSync('/tmp/diagnostico-dist.txt', output.join('\n'))
  console.log('\n📁 Resultado guardado en /tmp/diagnostico-dist.txt')
}

main().catch(console.error)
