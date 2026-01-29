/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2030 — SCRIPT DE DATOS DE DEMOSTRACIÓN
 * ═══════════════════════════════════════════════════════════════════════════════
 * Genera datos realistas de ventas, movimientos y órdenes para demo
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { db } from "../database"
import {
  ventas,
  movimientos,
  ordenesCompra,
  clientes,
  distribuidores,
  bancos,
} from "../database/schema"
import { nanoid } from "nanoid"
import { sql, eq } from "drizzle-orm"

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(daysBack: number): Date {
  const now = new Date()
  const pastDate = new Date(now.getTime() - randomBetween(0, daysBack) * 24 * 60 * 60 * 1000)
  return pastDate
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED VENTAS
// ═══════════════════════════════════════════════════════════════════════════════

async function seedVentas() {
  console.log("📊 Generando ventas de demostración...")

  // Obtener clientes existentes
  const clientesDB = await db.select().from(clientes).limit(10)

  if (clientesDB.length === 0) {
    console.log("⚠️ No hay clientes en la base de datos. Creando algunos...")
    return
  }

  const estadosPago: ("completo" | "parcial" | "pendiente")[] = [
    "completo",
    "completo",
    "completo",
    "parcial",
    "pendiente",
  ]

  // Generar 20 ventas de demostración
  const ventasDemo = []

  for (let i = 0; i < 20; i++) {
    const cliente = clientesDB[randomBetween(0, clientesDB.length - 1)]
    const cantidad = randomBetween(5, 50)
    const precioVenta = randomBetween(8000, 15000)
    const precioCompra = Math.floor(precioVenta * 0.6) // 60% del precio de venta
    const precioFlete = 500
    const precioTotalVenta = cantidad * precioVenta

    // Calcular distribución GYA
    const montoBovedaMonte = cantidad * precioCompra
    const montoFletes = cantidad * precioFlete
    const montoUtilidades = cantidad * (precioVenta - precioCompra - precioFlete)

    const estadoPago = estadosPago[randomBetween(0, estadosPago.length - 1)]
    let montoPagado = 0

    if (estadoPago === "completo") {
      montoPagado = precioTotalVenta
    } else if (estadoPago === "parcial") {
      montoPagado = Math.floor(precioTotalVenta * (randomBetween(30, 80) / 100))
    }

    const ventaId = nanoid()
    const fecha = randomDate(30)

    ventasDemo.push({
      id: ventaId,
      clienteId: cliente.id,
      fecha,
      cantidad,
      precioVentaUnidad: precioVenta,
      precioCompraUnidad: precioCompra,
      precioFlete,
      precioTotalVenta,
      montoPagado,
      montoRestante: precioTotalVenta - montoPagado,
      montoBovedaMonte,
      montoFletes,
      montoUtilidades,
      estadoPago,
      observaciones: `Venta demo #${i + 1}`,
    })
  }

  // Insertar ventas
  for (const venta of ventasDemo) {
    try {
      await db.insert(ventas).values(venta)
      console.log(
        `  ✅ Venta ${venta.id} creada: ${venta.cantidad} uds x $${venta.precioVentaUnidad}`
      )

      // Si la venta está pagada, actualizar bancos
      if (venta.estadoPago === "completo") {
        const proporcion = 1

        // Actualizar Bóveda Monte
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${venta.montoBovedaMonte * proporcion}`,
            historicoIngresos: sql`historico_ingresos + ${venta.montoBovedaMonte * proporcion}`,
          })
          .where(eq(bancos.id, "boveda_monte"))

        // Actualizar Flete Sur
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${venta.montoFletes * proporcion}`,
            historicoIngresos: sql`historico_ingresos + ${venta.montoFletes * proporcion}`,
          })
          .where(eq(bancos.id, "flete_sur"))

        // Actualizar Utilidades
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${venta.montoUtilidades * proporcion}`,
            historicoIngresos: sql`historico_ingresos + ${venta.montoUtilidades * proporcion}`,
          })
          .where(eq(bancos.id, "utilidades"))

        // Registrar movimientos
        await db.insert(movimientos).values([
          {
            id: nanoid(),
            bancoId: "boveda_monte",
            tipo: "ingreso",
            monto: venta.montoBovedaMonte * proporcion,
            concepto: `Venta ${venta.id} - Costo`,
            fecha: venta.fecha,
            ventaRelacionada: venta.id,
          },
          {
            id: nanoid(),
            bancoId: "flete_sur",
            tipo: "ingreso",
            monto: venta.montoFletes * proporcion,
            concepto: `Venta ${venta.id} - Flete`,
            fecha: venta.fecha,
            ventaRelacionada: venta.id,
          },
          {
            id: nanoid(),
            bancoId: "utilidades",
            tipo: "ingreso",
            monto: venta.montoUtilidades * proporcion,
            concepto: `Venta ${venta.id} - Utilidad`,
            fecha: venta.fecha,
            ventaRelacionada: venta.id,
          },
        ])
      }
    } catch (err) {
      console.error(`  ❌ Error creando venta:`, err)
    }
  }

  console.log(`✅ ${ventasDemo.length} ventas creadas`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED ÓRDENES DE COMPRA
// ═══════════════════════════════════════════════════════════════════════════════

async function seedOrdenes() {
  console.log("📦 Generando órdenes de compra...")

  // Obtener distribuidores
  const distribuidoresDB = await db.select().from(distribuidores).limit(5)

  if (distribuidoresDB.length === 0) {
    console.log("⚠️ No hay distribuidores. Saltando órdenes.")
    return
  }

  const estados: ("pendiente" | "en_transito" | "recibida" | "cancelada")[] = [
    "pendiente",
    "en_transito",
    "recibida",
    "recibida",
  ]

  for (let i = 0; i < 10; i++) {
    const distribuidor = distribuidoresDB[randomBetween(0, distribuidoresDB.length - 1)]
    const cantidad = randomBetween(20, 100)
    const precioCompra = randomBetween(5000, 8000)
    const total = cantidad * precioCompra
    const estado = estados[randomBetween(0, estados.length - 1)]

    try {
      await db.insert(ordenesCompra).values({
        id: nanoid(),
        distribuidorId: distribuidor.id,
        fecha: randomDate(45),
        cantidad,
        precioCompraUnidad: precioCompra,
        total,
        estado,
        fechaEstimadaEntrega: randomDate(-7), // Fecha futura
        observaciones: `Orden demo #${i + 1}`,
      })
      console.log(`  ✅ Orden creada: ${cantidad} uds x $${precioCompra}`)
    } catch (err) {
      console.error(`  ❌ Error:`, err)
    }
  }

  console.log("✅ Órdenes de compra creadas")
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("═══════════════════════════════════════════════════════════════")
  console.log("🌌 CHRONOS INFINITY — Seed de Datos de Demostración")
  console.log("═══════════════════════════════════════════════════════════════")

  try {
    await seedVentas()
    await seedOrdenes()

    console.log("")
    console.log("═══════════════════════════════════════════════════════════════")
    console.log("✅ DATOS DE DEMOSTRACIÓN CREADOS EXITOSAMENTE")
    console.log("═══════════════════════════════════════════════════════════════")

    // Verificar bancos
    const bancosActualizados = await db.select().from(bancos)
    console.log("\n📊 Estado de Bancos:")
    for (const banco of bancosActualizados) {
      console.log(`  ${banco.nombre}: $${banco.capitalActual.toLocaleString()}`)
    }
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }

  process.exit(0)
}

main()
