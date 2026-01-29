/**
 * Script de Validación de Integridad - CHRONOS
 * =============================================
 *
 * Valida la consistencia de datos en Turso/Drizzle
 *
 * Uso: pnpm tsx scripts/validate-integrity.ts
 *
 * Validaciones:
 * 1. Bancos: capitalActual = historicoIngresos - historicoGastos
 * 2. Ventas huérfanas: Ventas sin cliente válido
 * 3. Distribución GYA: suma de distribución = total de venta
 * 4. Movimientos: Consistencia de referencias
 * 5. Órdenes de compra: Distribuidores válidos
 */

import { and, eq, isNull, sql } from "drizzle-orm"
import { db } from "../database"
import {
  abonos,
  bancos,
  clientes,
  distribuidores,
  movimientos,
  ordenesCompra,
  ventas,
} from "../database/schema"

// Colores para terminal
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log("")
  log(`═══ ${title} ═══`, "cyan")
}

function logSuccess(message: string) {
  log(`✅ ${message}`, "green")
}

function logError(message: string) {
  log(`❌ ${message}`, "red")
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, "yellow")
}

// ════════════════════════════════════════════════════════════════
// VALIDACIÓN 1: Bancos - Capital = Ingresos - Gastos
// ════════════════════════════════════════════════════════════════
async function validateBancos(): Promise<number> {
  logSection("VALIDACIÓN DE BANCOS")

  const bancosData = await db.select().from(bancos)
  let discrepancias = 0

  if (bancosData.length === 0) {
    logWarning("No hay bancos en la base de datos")
    return 0
  }

  for (const banco of bancosData) {
    const historicoIngresos = banco.historicoIngresos ?? 0
    const historicoGastos = banco.historicoGastos ?? 0
    const capitalActual = banco.capitalActual ?? 0

    const calculado = historicoIngresos - historicoGastos
    const diferencia = Math.abs(capitalActual - calculado)

    if (diferencia > 0.01) {
      discrepancias++
      logError(`${banco.nombre}:`)
      console.log(`   Capital actual: $${capitalActual.toLocaleString()}`)
      console.log(`   Calculado: $${calculado.toLocaleString()}`)
      console.log(`   Diferencia: $${diferencia.toLocaleString()}`)
    } else {
      logSuccess(`${banco.nombre}: $${capitalActual.toLocaleString()} (OK)`)
    }
  }

  console.log("")
  if (discrepancias === 0) {
    logSuccess(`Todos los ${bancosData.length} bancos están sincronizados`)
  } else {
    logError(`${discrepancias} de ${bancosData.length} bancos con discrepancias`)
  }

  return discrepancias
}

// ════════════════════════════════════════════════════════════════
// VALIDACIÓN 2: Ventas Huérfanas (sin cliente válido)
// ════════════════════════════════════════════════════════════════
async function validateVentasHuerfanas(): Promise<number> {
  logSection("VENTAS HUÉRFANAS")

  const huerfanas = await db
    .select({
      id: ventas.id,
      clienteId: ventas.clienteId,
      fecha: ventas.fecha,
      precioTotalVenta: ventas.precioTotalVenta,
    })
    .from(ventas)
    .leftJoin(clientes, eq(ventas.clienteId, clientes.id))
    .where(isNull(clientes.id))

  if (huerfanas.length > 0) {
    logError(`${huerfanas.length} ventas sin cliente válido:`)
    huerfanas.forEach((v) => {
      console.log(
        `   - Venta ${v.id.substring(0, 8)}... → Cliente ${v.clienteId?.substring(0, 8) ?? "NULL"}...`
      )
      console.log(`     Fecha: ${v.fecha}, Total: $${v.precioTotalVenta?.toLocaleString() ?? 0}`)
    })
  } else {
    logSuccess("Todas las ventas tienen cliente válido")
  }

  return huerfanas.length
}

// ════════════════════════════════════════════════════════════════
// VALIDACIÓN 3: Distribución GYA
// ════════════════════════════════════════════════════════════════
async function validateDistribucionGYA(): Promise<number> {
  logSection("DISTRIBUCIÓN GYA")

  const ventasData = await db.select().from(ventas)
  let errores = 0
  let ventasValidadas = 0

  if (ventasData.length === 0) {
    logWarning("No hay ventas en la base de datos")
    return 0
  }

  for (const venta of ventasData) {
    // Solo validar ventas con estado COMPLETO
    if (venta.estadoPago !== "completo") continue

    ventasValidadas++

    const precioTotal = venta.precioTotalVenta ?? 0
    const bovedaMonte = venta.montoBovedaMonte ?? 0
    const fletes = venta.montoFletes ?? 0
    const utilidades = venta.montoUtilidades ?? 0

    const sumaGYA = bovedaMonte + fletes + utilidades
    const diff = Math.abs(precioTotal - sumaGYA)

    if (diff > 0.01) {
      errores++
      logError(`Venta ${venta.id.substring(0, 8)}...:`)
      console.log(`   Total venta: $${precioTotal.toLocaleString()}`)
      console.log(`   Suma GYA: $${sumaGYA.toLocaleString()}`)
      console.log(`   Diferencia: $${diff.toLocaleString()}`)
      console.log(`   Distribución: Monte=$${bovedaMonte}, Fletes=$${fletes}, Util=$${utilidades}`)
    }
  }

  console.log("")
  if (errores === 0) {
    logSuccess(`${ventasValidadas} ventas completas con distribución GYA correcta`)
  } else {
    logError(`${errores} de ${ventasValidadas} ventas con errores de distribución`)
  }

  return errores
}

// ════════════════════════════════════════════════════════════════
// VALIDACIÓN 4: Órdenes de Compra Huérfanas
// ════════════════════════════════════════════════════════════════
async function validateOrdenesHuerfanas(): Promise<number> {
  logSection("ÓRDENES DE COMPRA HUÉRFANAS")

  const huerfanas = await db
    .select({
      id: ordenesCompra.id,
      distribuidorId: ordenesCompra.distribuidorId,
      fecha: ordenesCompra.fecha,
    })
    .from(ordenesCompra)
    .leftJoin(distribuidores, eq(ordenesCompra.distribuidorId, distribuidores.id))
    .where(isNull(distribuidores.id))

  if (huerfanas.length > 0) {
    logError(`${huerfanas.length} órdenes sin distribuidor válido:`)
    huerfanas.forEach((oc) => {
      console.log(
        `   - Orden ${oc.id.substring(0, 8)}... → Distribuidor ${oc.distribuidorId?.substring(0, 8) ?? "NULL"}...`
      )
    })
  } else {
    logSuccess("Todas las órdenes tienen distribuidor válido")
  }

  return huerfanas.length
}

// ════════════════════════════════════════════════════════════════
// VALIDACIÓN 5: Abonos vs Ventas
// ════════════════════════════════════════════════════════════════
async function validateAbonos(): Promise<number> {
  logSection("CONSISTENCIA DE ABONOS")

  // Obtener ventas parciales
  const ventasParciales = await db.select().from(ventas).where(eq(ventas.estadoPago, "parcial"))

  let errores = 0

  for (const venta of ventasParciales) {
    // Sumar abonos de esta venta
    const abonosVenta = await db
      .select({ total: sql<number>`COALESCE(SUM(${abonos.monto}), 0)` })
      .from(abonos)
      .where(eq(abonos.ventaId, venta.id))

    const sumaAbonos = abonosVenta[0]?.total ?? 0
    const montoPagado = venta.montoPagado ?? 0
    const diff = Math.abs(sumaAbonos - montoPagado)

    if (diff > 0.01) {
      errores++
      logError(`Venta ${venta.id.substring(0, 8)}...:`)
      console.log(`   Monto pagado registrado: $${montoPagado.toLocaleString()}`)
      console.log(`   Suma de abonos: $${sumaAbonos.toLocaleString()}`)
      console.log(`   Diferencia: $${diff.toLocaleString()}`)
    }
  }

  if (errores === 0) {
    logSuccess(`${ventasParciales.length} ventas parciales con abonos consistentes`)
  } else {
    logError(`${errores} ventas con inconsistencias en abonos`)
  }

  return errores
}

// ════════════════════════════════════════════════════════════════
// VALIDACIÓN 6: Movimientos sin Referencia
// ════════════════════════════════════════════════════════════════
async function validateMovimientos(): Promise<number> {
  logSection("MOVIMIENTOS BANCARIOS")

  // Verificar que los bancos referenciados existen
  const movsSinBanco = await db
    .select({
      id: movimientos.id,
      bancoId: movimientos.bancoId,
      monto: movimientos.monto,
    })
    .from(movimientos)
    .leftJoin(bancos, eq(movimientos.bancoId, bancos.id))
    .where(isNull(bancos.id))

  if (movsSinBanco.length > 0) {
    logError(`${movsSinBanco.length} movimientos sin banco válido`)
  } else {
    logSuccess("Todos los movimientos tienen banco válido")
  }

  // Verificar totales por banco
  const bancosData = await db.select().from(bancos)
  let discrepancias = 0

  for (const banco of bancosData) {
    const ingresos = await db
      .select({ total: sql<number>`COALESCE(SUM(${movimientos.monto}), 0)` })
      .from(movimientos)
      .where(and(eq(movimientos.bancoId, banco.id), eq(movimientos.tipo, "ingreso")))

    const gastos = await db
      .select({ total: sql<number>`COALESCE(SUM(${movimientos.monto}), 0)` })
      .from(movimientos)
      .where(and(eq(movimientos.bancoId, banco.id), eq(movimientos.tipo, "gasto")))

    const sumaIngresos = ingresos[0]?.total ?? 0
    const sumaGastos = gastos[0]?.total ?? 0

    const diffIngresos = Math.abs((banco.historicoIngresos ?? 0) - sumaIngresos)
    const diffGastos = Math.abs((banco.historicoGastos ?? 0) - sumaGastos)

    if (diffIngresos > 0.01 || diffGastos > 0.01) {
      discrepancias++
      logWarning(`${banco.nombre}: Posible desincronización con movimientos`)
      console.log(`   Histórico ingresos: $${banco.historicoIngresos?.toLocaleString() ?? 0}`)
      console.log(`   Suma movimientos ingreso: $${sumaIngresos.toLocaleString()}`)
      console.log(`   Histórico gastos: $${banco.historicoGastos?.toLocaleString() ?? 0}`)
      console.log(`   Suma movimientos egreso: $${sumaGastos.toLocaleString()}`)
    }
  }

  return movsSinBanco.length + discrepancias
}

// ════════════════════════════════════════════════════════════════
// RESUMEN FINAL
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log("")
  log("╔════════════════════════════════════════════════════════════╗", "magenta")
  log("║  VALIDACIÓN DE INTEGRIDAD - SISTEMA CHRONOS                ║", "magenta")
  log(
    "║  Fecha: " +
      new Date().toISOString().split("T")[0] +
      "                                      ║",
    "magenta"
  )
  log("╚════════════════════════════════════════════════════════════╝", "magenta")

  try {
    const errBancos = await validateBancos()
    const errVentasHuerfanas = await validateVentasHuerfanas()
    const errGYA = await validateDistribucionGYA()
    const errOrdenesHuerfanas = await validateOrdenesHuerfanas()
    const errAbonos = await validateAbonos()
    const errMovimientos = await validateMovimientos()

    const total =
      errBancos + errVentasHuerfanas + errGYA + errOrdenesHuerfanas + errAbonos + errMovimientos

    console.log("")
    log("════════════════════════════════════════════════════════════", "magenta")
    logSection("RESUMEN")

    console.log("")
    console.log("┌────────────────────────────────┬──────────┐")
    console.log("│ Validación                     │ Errores  │")
    console.log("├────────────────────────────────┼──────────┤")
    console.log(`│ Bancos (capital)               │    ${errBancos.toString().padStart(4)}  │`)
    console.log(
      `│ Ventas huérfanas               │    ${errVentasHuerfanas.toString().padStart(4)}  │`
    )
    console.log(`│ Distribución GYA               │    ${errGYA.toString().padStart(4)}  │`)
    console.log(
      `│ Órdenes huérfanas              │    ${errOrdenesHuerfanas.toString().padStart(4)}  │`
    )
    console.log(`│ Abonos                         │    ${errAbonos.toString().padStart(4)}  │`)
    console.log(`│ Movimientos                    │    ${errMovimientos.toString().padStart(4)}  │`)
    console.log("├────────────────────────────────┼──────────┤")
    console.log(`│ TOTAL                          │    ${total.toString().padStart(4)}  │`)
    console.log("└────────────────────────────────┴──────────┘")
    console.log("")

    if (total === 0) {
      log("╔════════════════════════════════════════════════════════════╗", "green")
      log("║  ✅ SISTEMA ÍNTEGRO - NO SE ENCONTRARON PROBLEMAS          ║", "green")
      log("╚════════════════════════════════════════════════════════════╝", "green")
    } else {
      log("╔════════════════════════════════════════════════════════════╗", "red")
      log(
        `║  ❌ SE ENCONTRARON ${total.toString().padStart(3)} PROBLEMAS                            ║`,
        "red"
      )
      log("║  Revise los detalles arriba para correcciones             ║", "red")
      log("╚════════════════════════════════════════════════════════════╝", "red")
    }

    console.log("")
    process.exit(total > 0 ? 1 : 0)
  } catch (error) {
    console.log("")
    logError("Error al ejecutar validación:")
    console.error(error)
    process.exit(1)
  }
}

main()
