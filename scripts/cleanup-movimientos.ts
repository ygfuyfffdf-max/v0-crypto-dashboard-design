// Script para limpiar movimientos extra y resetear bancos
import { eq } from "drizzle-orm"
import { db } from "../database"
import { bancos, movimientos } from "../database/schema"

async function cleanupExtraMovimientos() {
  const ventaId = "7502dee7-160a-4075-899f-2643ff8be068"

  console.log("🧹 LIMPIANDO MOVIMIENTOS EXTRA...\n")

  // Eliminar movimientos que NO tienen '(corrección)' - son del abono de prueba
  const movsVenta = await db.select().from(movimientos).where(eq(movimientos.ventaId, ventaId))

  for (const mov of movsVenta) {
    if (!mov.concepto?.includes("(corrección)")) {
      console.log("Eliminando:", mov.id.substring(0, 8), mov.bancoId, "$" + mov.monto)
      await db.delete(movimientos).where(eq(movimientos.id, mov.id))
    }
  }

  // Resetear bancos GYA a valores correctos para $6000 pagados
  console.log("\n🏦 RESETEANDO BANCOS GYA...\n")

  await db
    .update(bancos)
    .set({
      capitalActual: 3150,
      historicoIngresos: 3150,
      historicoGastos: 0,
      updatedAt: new Date(),
    })
    .where(eq(bancos.id, "boveda_monte"))
  console.log("✅ boveda_monte: $3150")

  await db
    .update(bancos)
    .set({
      capitalActual: 2500,
      historicoIngresos: 2500,
      historicoGastos: 0,
      updatedAt: new Date(),
    })
    .where(eq(bancos.id, "flete_sur"))
  console.log("✅ flete_sur: $2500")

  await db
    .update(bancos)
    .set({
      capitalActual: 350,
      historicoIngresos: 350,
      historicoGastos: 0,
      updatedAt: new Date(),
    })
    .where(eq(bancos.id, "utilidades"))
  console.log("✅ utilidades: $350")

  // Verificar
  console.log("\n📊 VERIFICACIÓN FINAL:\n")
  const movsFinales = await db.select().from(movimientos).where(eq(movimientos.ventaId, ventaId))
  console.log("Movimientos:", movsFinales.length)
  let suma = 0
  movsFinales.forEach((m) => {
    suma += m.monto || 0
    console.log("  •", m.bancoId + ": $" + m.monto)
  })
  console.log("SUMA: $" + suma)

  const bancosGYA = await db.select().from(bancos)
  console.log("\nBancos GYA:")
  bancosGYA
    .filter((b) => ["boveda_monte", "flete_sur", "utilidades"].includes(b.id))
    .forEach((b) => console.log("  •", b.id + ": $" + b.capitalActual))
}

cleanupExtraMovimientos().catch(console.error)
