// Script para corregir la distribución GYA de la venta con abono de $6000
import { eq, sql } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { db } from "../database"
import { bancos, movimientos, ventas } from "../database/schema"

async function fixVentaDistribucion() {
  const ventaId = "7502dee7-160a-4075-899f-2643ff8be068"
  const now = new Date()

  // Obtener la venta
  const [venta] = await db.select().from(ventas).where(eq(ventas.id, ventaId))

  if (!venta) {
    console.error("Venta no encontrada")
    return
  }

  console.log("=== VENTA ACTUAL ===")
  console.log("montoPagado:", venta.montoPagado)
  console.log("montoBovedaMonte:", venta.montoBovedaMonte)
  console.log("montoFletes:", venta.montoFletes)
  console.log("montoUtilidades:", venta.montoUtilidades)
  console.log("precioTotalVenta:", venta.precioTotalVenta)

  // Calcular distribución del abono de 6000
  const montoPagado = venta.montoPagado || 0
  const proporcionAbono = montoPagado / (venta.precioTotalVenta || 1)

  const abonoBovedaMonte = (venta.montoBovedaMonte || 0) * proporcionAbono
  const abonoFletes = (venta.montoFletes || 0) * proporcionAbono
  const abonoUtilidades = (venta.montoUtilidades || 0) * proporcionAbono

  console.log("\n=== DISTRIBUCIÓN CALCULADA ===")
  console.log("proporción:", proporcionAbono.toFixed(4))
  console.log("abonoBovedaMonte:", abonoBovedaMonte)
  console.log("abonoFletes:", abonoFletes)
  console.log("abonoUtilidades:", abonoUtilidades)
  console.log("suma:", abonoBovedaMonte + abonoFletes + abonoUtilidades)

  const abonoId = uuidv4()

  // Crear movimientos
  console.log("\n=== CREANDO MOVIMIENTOS ===")

  if (abonoBovedaMonte > 0) {
    await db.insert(movimientos).values({
      id: uuidv4(),
      bancoId: "boveda_monte",
      tipo: "ingreso",
      monto: abonoBovedaMonte,
      fecha: now,
      concepto: "Abono venta - Costo producto (corrección)",
      referencia: abonoId,
      categoria: "Abonos",
      ventaId,
      clienteId: venta.clienteId,
    })

    await db
      .update(bancos)
      .set({
        capitalActual: sql`capital_actual + ${abonoBovedaMonte}`,
        historicoIngresos: sql`historico_ingresos + ${abonoBovedaMonte}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, "boveda_monte"))

    console.log("✅ boveda_monte: +" + abonoBovedaMonte)
  }

  if (abonoFletes > 0) {
    await db.insert(movimientos).values({
      id: uuidv4(),
      bancoId: "flete_sur",
      tipo: "ingreso",
      monto: abonoFletes,
      fecha: now,
      concepto: "Abono venta - Flete (corrección)",
      referencia: abonoId,
      categoria: "Abonos",
      ventaId,
      clienteId: venta.clienteId,
    })

    await db
      .update(bancos)
      .set({
        capitalActual: sql`capital_actual + ${abonoFletes}`,
        historicoIngresos: sql`historico_ingresos + ${abonoFletes}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, "flete_sur"))

    console.log("✅ flete_sur: +" + abonoFletes)
  }

  if (abonoUtilidades > 0) {
    await db.insert(movimientos).values({
      id: uuidv4(),
      bancoId: "utilidades",
      tipo: "ingreso",
      monto: abonoUtilidades,
      fecha: now,
      concepto: "Abono venta - Ganancia (corrección)",
      referencia: abonoId,
      categoria: "Abonos",
      ventaId,
      clienteId: venta.clienteId,
    })

    await db
      .update(bancos)
      .set({
        capitalActual: sql`capital_actual + ${abonoUtilidades}`,
        historicoIngresos: sql`historico_ingresos + ${abonoUtilidades}`,
        updatedAt: now,
      })
      .where(eq(bancos.id, "utilidades"))

    console.log("✅ utilidades: +" + abonoUtilidades)
  }

  // Actualizar capitalGYA en la venta
  await db
    .update(ventas)
    .set({
      capitalBovedaMonte: abonoBovedaMonte,
      capitalFletes: abonoFletes,
      capitalUtilidades: abonoUtilidades,
      updatedAt: now,
    })
    .where(eq(ventas.id, ventaId))

  console.log("✅ Venta actualizada con capitalGYA")

  console.log("\n=== VERIFICACIÓN FINAL ===")
  const bancosActualizados = await db.select().from(bancos)
  bancosActualizados.forEach((b) => {
    console.log(`${b.id}: capital=${b.capitalActual}, ingresos=${b.historicoIngresos}`)
  })

  const movsNuevos = await db.select().from(movimientos).where(eq(movimientos.ventaId, ventaId))
  console.log("\nMovimientos creados:", movsNuevos.length)
  movsNuevos.forEach((m) => console.log(`  - ${m.bancoId}: $${m.monto} - ${m.concepto}`))
}

fixVentaDistribucion().catch(console.error)
