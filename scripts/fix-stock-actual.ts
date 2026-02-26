#!/usr/bin/env tsx
/**
 * Script para corregir stockActual en órdenes de compra existentes
 * Establece stockActual = cantidad para órdenes donde stockActual es 0
 */

import { sql } from "drizzle-orm"
import { db } from "../database"
import { ordenesCompra } from "../database/schema"

async function fixStockActual() {
  console.log("🔧 Iniciando corrección de stockActual...")

  try {
    // Actualizar stockActual donde es 0 o null
    const result = await db
      .update(ordenesCompra)
      .set({
        stockActual: sql`cantidad`,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(sql`stock_actual = 0 OR stock_actual IS NULL`)

    console.log(`✅ Actualizado: ${result.rowsAffected || 0} órdenes`)

    // Mostrar resumen
    const ordenes = await db.select().from(ordenesCompra)
    console.log("\n📊 Resumen de órdenes:")
    ordenes.forEach((oc) => {
      console.log(`  - ${oc.numeroOrden}: ${oc.producto} | Stock: ${oc.stockActual}/${oc.cantidad}`)
    })

    console.log("\n✨ Corrección completada")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

fixStockActual()
