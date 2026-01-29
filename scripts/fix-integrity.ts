#!/usr/bin/env tsx
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║        CHRONOS SYSTEM - SCRIPT DE CORRECCIÓN DE INTEGRIDAD                 ║
 * ║                    Remediación Automática de Datos                         ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Ejecuta correcciones críticas:
 * 1. Recalcula distribución GYA en ventas sin distribución
 * 2. Sincroniza abonos con ventas
 * 3. Genera movimientos históricos faltantes
 * 4. Recalcula capitalActual de bancos
 *
 * @usage pnpm tsx scripts/fix-integrity.ts
 * @version 1.0.0 - Diciembre 2025
 */

import { eq, sql } from "drizzle-orm"
import { nanoid } from "nanoid"
import { db } from "../database"
import { abonos, bancos, movimientos, ventas } from "../database/schema"

// ═══════════════════════════════════════════════════════════════════════════
// COLORES PARA CONSOLA
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// ═══════════════════════════════════════════════════════════════════════════
// LÓGICA GYA SAGRADA
// ═══════════════════════════════════════════════════════════════════════════

interface DistribucionGYA {
  bovedaMonte: number
  fletes: number
  utilidades: number
  total: number
}

function calcularDistribucionGYA(
  cantidad: number,
  precioVenta: number,
  precioCompra: number,
  precioFlete: number = 500
): DistribucionGYA {
  const bovedaMonte = precioCompra * cantidad
  const fletes = precioFlete * cantidad
  const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad
  const total = bovedaMonte + fletes + utilidades

  return { bovedaMonte, fletes, utilidades, total }
}

// ═══════════════════════════════════════════════════════════════════════════
// CORRECCIÓN 1: DISTRIBUCIÓN GYA EN VENTAS
// ═══════════════════════════════════════════════════════════════════════════

async function fixGYADistribution(): Promise<number> {
  log("magenta", "\n═══ CORRECCIÓN 1: DISTRIBUCIÓN GYA ═══")

  // Obtener ventas sin distribución GYA (montoBovedaMonte = 0 pero tienen total)
  const ventasSinGYA = await db
    .select()
    .from(ventas)
    .where(sql`${ventas.montoBovedaMonte} = 0 AND ${ventas.precioTotalVenta} > 0`)

  if (ventasSinGYA.length === 0) {
    log("green", "✅ No hay ventas sin distribución GYA")
    return 0
  }

  log("yellow", `⚠️ Encontradas ${ventasSinGYA.length} ventas sin distribución GYA`)

  let corregidas = 0

  for (const venta of ventasSinGYA) {
    const distribucion = calcularDistribucionGYA(
      venta.cantidad,
      venta.precioVentaUnidad,
      venta.precioCompraUnidad,
      venta.precioFlete || 500
    )

    // Calcular distribución proporcional según estado de pago
    let proporcion = 0
    if (venta.estadoPago === "completo") {
      proporcion = 1
    } else if (venta.estadoPago === "parcial" && venta.precioTotalVenta > 0) {
      proporcion = (venta.montoPagado || 0) / venta.precioTotalVenta
    }

    const capitalBovedaMonte = distribucion.bovedaMonte * proporcion
    const capitalFletes = distribucion.fletes * proporcion
    const capitalUtilidades = distribucion.utilidades * proporcion

    // Calcular métricas adicionales
    const costoTotal = venta.precioCompraUnidad * venta.cantidad
    const fleteTotal = (venta.precioFlete || 500) * venta.cantidad
    const gananciaTotal = distribucion.utilidades
    const margenBruto =
      venta.precioTotalVenta > 0
        ? ((venta.precioTotalVenta - costoTotal) / venta.precioTotalVenta) * 100
        : 0
    const gananciaPorUnidad =
      venta.precioVentaUnidad - venta.precioCompraUnidad - (venta.precioFlete || 500)

    await db
      .update(ventas)
      .set({
        // Distribución base (100%)
        montoBovedaMonte: distribucion.bovedaMonte,
        montoFletes: distribucion.fletes,
        montoUtilidades: distribucion.utilidades,
        // Distribución efectiva (proporcional)
        capitalBovedaMonte,
        capitalFletes,
        capitalUtilidades,
        // Métricas adicionales
        costoTotal,
        fleteTotal,
        gananciaTotal,
        margenBruto,
        gananciaPorUnidad,
        margenSobreCosto: costoTotal > 0 ? (gananciaTotal / costoTotal) * 100 : 0,
        porcentajePagado: proporcion * 100,
        updatedAt: new Date(),
      })
      .where(eq(ventas.id, venta.id))

    log("green", `   ✅ Venta ${venta.id.substring(0, 8)}... corregida:`)
    log("cyan", `      Total: $${venta.precioTotalVenta?.toLocaleString()}`)
    log(
      "cyan",
      `      GYA: Monte=$${distribucion.bovedaMonte.toLocaleString()}, Fletes=$${distribucion.fletes.toLocaleString()}, Util=$${distribucion.utilidades.toLocaleString()}`
    )

    corregidas++
  }

  log("green", `\n✅ ${corregidas} ventas corregidas con distribución GYA`)
  return corregidas
}

// ═══════════════════════════════════════════════════════════════════════════
// CORRECCIÓN 2: GENERAR MOVIMIENTOS HISTÓRICOS
// ═══════════════════════════════════════════════════════════════════════════

async function generateHistoricalMovements(): Promise<number> {
  log("magenta", "\n═══ CORRECCIÓN 2: MOVIMIENTOS HISTÓRICOS ═══")

  // Obtener bancos con histórico pero sin movimientos correspondientes
  const bancosData = await db.select().from(bancos)

  // Obtener suma de movimientos por banco
  const movimientosSum = await db
    .select({
      bancoId: movimientos.bancoId,
      totalIngresos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientos.tipo} IN ('ingreso', 'abono', 'distribucion_gya', 'transferencia_entrada') THEN ${movimientos.monto} ELSE 0 END), 0)`,
      totalEgresos: sql<number>`COALESCE(SUM(CASE WHEN ${movimientos.tipo} IN ('gasto', 'pago', 'transferencia_salida') THEN ${movimientos.monto} ELSE 0 END), 0)`,
    })
    .from(movimientos)
    .groupBy(movimientos.bancoId)

  const movimientosMap = new Map(movimientosSum.map((m) => [m.bancoId, m]))

  let movimientosCreados = 0

  for (const banco of bancosData) {
    const movs = movimientosMap.get(banco.id)
    const sumaIngresos = movs?.totalIngresos || 0
    const sumaEgresos = movs?.totalEgresos || 0

    const diferenciaIngresos = (banco.historicoIngresos || 0) - sumaIngresos
    const diferenciaEgresos = (banco.historicoGastos || 0) - sumaEgresos

    // Crear movimiento de ajuste de ingresos si hay diferencia significativa
    if (diferenciaIngresos > 1) {
      await db.insert(movimientos).values({
        id: nanoid(),
        bancoId: banco.id,
        tipo: "ingreso",
        monto: diferenciaIngresos,
        fecha: new Date(),
        concepto: "Ajuste histórico de ingresos - Migración",
        referencia: `AJUSTE-${Date.now()}`,
        categoria: "Ajustes",
        observaciones:
          "Movimiento generado automáticamente para sincronizar histórico con movimientos",
        createdAt: new Date(),
      })

      log(
        "cyan",
        `   📥 ${banco.nombre}: Ingreso de ajuste $${diferenciaIngresos.toLocaleString()}`
      )
      movimientosCreados++
    }

    // Crear movimiento de ajuste de egresos si hay diferencia significativa
    if (diferenciaEgresos > 1) {
      await db.insert(movimientos).values({
        id: nanoid(),
        bancoId: banco.id,
        tipo: "gasto",
        monto: diferenciaEgresos,
        fecha: new Date(),
        concepto: "Ajuste histórico de gastos - Migración",
        referencia: `AJUSTE-${Date.now()}`,
        categoria: "Ajustes",
        observaciones:
          "Movimiento generado automáticamente para sincronizar histórico con movimientos",
        createdAt: new Date(),
      })

      log("cyan", `   📤 ${banco.nombre}: Gasto de ajuste $${diferenciaEgresos.toLocaleString()}`)
      movimientosCreados++
    }
  }

  if (movimientosCreados === 0) {
    log("green", "✅ No se requieren movimientos de ajuste")
  } else {
    log("green", `\n✅ ${movimientosCreados} movimientos de ajuste creados`)
  }

  return movimientosCreados
}

// ═══════════════════════════════════════════════════════════════════════════
// CORRECCIÓN 3: SINCRONIZAR ABONOS CON VENTAS
// ═══════════════════════════════════════════════════════════════════════════

async function syncAbonosWithVentas(): Promise<number> {
  log("magenta", "\n═══ CORRECCIÓN 3: SINCRONIZACIÓN DE ABONOS ═══")

  // Obtener ventas con montoPagado > 0 pero sin abonos registrados
  const ventasConPago = await db
    .select()
    .from(ventas)
    .where(sql`${ventas.montoPagado} > 0`)

  // Obtener abonos existentes agrupados por venta
  const abonosExistentes = await db
    .select({
      ventaId: abonos.ventaId,
      totalAbonos: sql<number>`COALESCE(SUM(${abonos.monto}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(abonos)
    .groupBy(abonos.ventaId)

  const abonosMap = new Map(abonosExistentes.map((a) => [a.ventaId, a]))

  let abonosCreados = 0

  for (const venta of ventasConPago) {
    const abonoInfo = abonosMap.get(venta.id)
    const totalAbonosRegistrados = abonoInfo?.totalAbonos || 0
    const diferencia = (venta.montoPagado || 0) - totalAbonosRegistrados

    if (diferencia > 1) {
      // Calcular distribución proporcional del abono
      const proporcion = venta.precioTotalVenta > 0 ? diferencia / venta.precioTotalVenta : 0

      const montoBovedaMonte = (venta.montoBovedaMonte || 0) * proporcion
      const montoFletes = (venta.montoFletes || 0) * proporcion
      const montoUtilidades = (venta.montoUtilidades || 0) * proporcion

      await db.insert(abonos).values({
        id: nanoid(),
        ventaId: venta.id,
        clienteId: venta.clienteId,
        monto: diferencia,
        fecha: new Date(),
        proporcion,
        montoBovedaMonte,
        montoFletes,
        montoUtilidades,
        montoPagadoAcumulado: venta.montoPagado || 0,
        montoRestantePostAbono: venta.montoRestante || 0,
        estadoPagoResultante: venta.estadoPago || "pendiente",
        concepto: "Abono de sincronización - Migración",
        createdAt: new Date(),
      })

      // Actualizar contador de abonos en la venta
      await db
        .update(ventas)
        .set({
          numeroAbonos: (abonoInfo?.count || 0) + 1,
          fechaPrimerAbono: venta.fechaPrimerAbono || new Date(),
          fechaUltimoAbono: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ventas.id, venta.id))

      log(
        "cyan",
        `   💳 Venta ${venta.id.substring(0, 8)}...: Abono de $${diferencia.toLocaleString()}`
      )
      abonosCreados++
    }
  }

  if (abonosCreados === 0) {
    log("green", "✅ Todos los abonos están sincronizados")
  } else {
    log("green", `\n✅ ${abonosCreados} abonos de sincronización creados`)
  }

  return abonosCreados
}

// ═══════════════════════════════════════════════════════════════════════════
// CORRECCIÓN 4: RECALCULAR CAPITAL DE BANCOS
// ═══════════════════════════════════════════════════════════════════════════

async function recalculateBankCapital(): Promise<number> {
  log("magenta", "\n═══ CORRECCIÓN 4: RECÁLCULO DE CAPITAL BANCARIO ═══")

  const bancosData = await db.select().from(bancos)
  let corregidos = 0

  for (const banco of bancosData) {
    const capitalCalculado = (banco.historicoIngresos || 0) - (banco.historicoGastos || 0)
    const diferencia = Math.abs((banco.capitalActual || 0) - capitalCalculado)

    if (diferencia > 0.01) {
      await db
        .update(bancos)
        .set({
          capitalActual: capitalCalculado,
          updatedAt: new Date(),
        })
        .where(eq(bancos.id, banco.id))

      log(
        "cyan",
        `   🏦 ${banco.nombre}: $${banco.capitalActual?.toLocaleString()} → $${capitalCalculado.toLocaleString()}`
      )
      corregidos++
    }
  }

  if (corregidos === 0) {
    log("green", "✅ Todos los capitales bancarios están correctos")
  } else {
    log("green", `\n✅ ${corregidos} bancos recalculados`)
  }

  return corregidos
}

// ═══════════════════════════════════════════════════════════════════════════
// EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("")
  log("cyan", "╔════════════════════════════════════════════════════════════════╗")
  log("cyan", "║       CHRONOS - CORRECCIÓN DE INTEGRIDAD DE DATOS             ║")
  log("cyan", "╚════════════════════════════════════════════════════════════════╝")
  console.log("")
  log("blue", `📅 Fecha: ${new Date().toLocaleString("es-MX")}`)
  console.log("")

  try {
    // Ejecutar correcciones en orden
    const gyaCorregidas = await fixGYADistribution()
    const movimientosCreados = await generateHistoricalMovements()
    const abonosSincronizados = await syncAbonosWithVentas()
    const bancosRecalculados = await recalculateBankCapital()

    // Resumen final
    console.log("")
    log("cyan", "════════════════════════════════════════════════════════════════")
    log("bold", "\n📊 RESUMEN DE CORRECCIONES:")
    console.log(`   • Ventas con GYA corregida: ${gyaCorregidas}`)
    console.log(`   • Movimientos de ajuste creados: ${movimientosCreados}`)
    console.log(`   • Abonos sincronizados: ${abonosSincronizados}`)
    console.log(`   • Bancos recalculados: ${bancosRecalculados}`)

    const totalCorrecciones =
      gyaCorregidas + movimientosCreados + abonosSincronizados + bancosRecalculados

    console.log("")
    if (totalCorrecciones === 0) {
      log("green", "✅ SISTEMA ÍNTEGRO - No se requirieron correcciones")
    } else {
      log("green", `✅ ${totalCorrecciones} CORRECCIONES APLICADAS EXITOSAMENTE`)
      log("yellow", "\n⚠️ Ejecuta validate-integrity.ts para verificar")
    }

    console.log("")
    process.exit(0)
  } catch (error) {
    log("red", `\n💥 Error fatal: ${error instanceof Error ? error.message : String(error)}`)
    console.error(error)
    process.exit(1)
  }
}

main()
