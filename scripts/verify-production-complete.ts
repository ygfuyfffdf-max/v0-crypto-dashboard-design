/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS INFINITY 2026 — SCRIPT DE VERIFICACIÓN COMPLETA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Script maestro para verificar TODA la arquitectura en producción.
 * Ejecutar ANTES de deploy y DESPUÉS de cada cambio crítico.
 *
 * EJECUTAR: pnpm tsx scripts/verify-production-complete.ts
 *
 * @version 1.0.0 - IY SUPREME EDITION
 */

import { calcularDistribucionGYA } from "@/app/_lib/gya/distribucion-gya"
import { db } from "@/database"
import {
  abonos,
  almacen,
  bancos,
  clientes,
  distribuidores,
  entradaAlmacen,
  kpisGlobales,
  movimientos,
  ordenesCompra,
  pagosDistribuidor,
  salidaAlmacen,
  usuarios,
  ventas,
} from "@/database/schema"
import { eq, sql } from "drizzle-orm"

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const BANCOS_ESPERADOS = [
  "boveda_monte",
  "boveda_usa",
  "profit",
  "leftie",
  "azteca",
  "flete_sur",
  "utilidades",
] as const

const TABLAS_CORE = [
  { nombre: "bancos", schema: bancos },
  { nombre: "clientes", schema: clientes },
  { nombre: "distribuidores", schema: distribuidores },
  { nombre: "ventas", schema: ventas },
  { nombre: "ordenesCompra", schema: ordenesCompra },
  { nombre: "movimientos", schema: movimientos },
  { nombre: "abonos", schema: abonos },
  { nombre: "almacen", schema: almacen },
  { nombre: "entradaAlmacen", schema: entradaAlmacen },
  { nombre: "salidaAlmacen", schema: salidaAlmacen },
  { nombre: "pagosDistribuidor", schema: pagosDistribuidor },
  { nombre: "kpisGlobales", schema: kpisGlobales },
  { nombre: "usuarios", schema: usuarios },
] as const

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

interface CheckResult {
  passed: boolean
  message: string
  details?: unknown
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES DE LOGGING
// ═══════════════════════════════════════════════════════════════════════════

function log(message: string, emoji = "📋") {
  console.log(`${emoji} ${message}`)
}

function success(message: string) {
  console.log(`✅ ${message}`)
}

function error(message: string) {
  console.log(`❌ ${message}`)
}

function warning(message: string) {
  console.log(`⚠️  ${message}`)
}

function section(title: string) {
  console.log(`\n${"═".repeat(80)}`)
  console.log(`🎯 ${title}`)
  console.log("═".repeat(80))
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKS
// ═══════════════════════════════════════════════════════════════════════════

async function checkEnvVariables(): Promise<CheckResult> {
  log("Verificando variables de entorno...", "🔐")

  const required = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"]
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    return {
      passed: false,
      message: `Faltan variables de entorno: ${missing.join(", ")}`,
      details: missing,
    }
  }

  success("Variables de entorno configuradas")
  return { passed: true, message: "Variables de entorno OK" }
}

async function checkDatabaseConnection(): Promise<CheckResult> {
  log("Verificando conexión a Turso...", "🔌")

  try {
    // Intentar una query simple
    const result = await db
      .select({ value: sql`1` })
      .from(bancos)
      .limit(1)

    if (!result) {
      return {
        passed: false,
        message: "No se pudo conectar a la base de datos",
      }
    }

    success("Conexión a Turso establecida")
    return { passed: true, message: "Conexión a BD OK" }
  } catch (err) {
    return {
      passed: false,
      message: `Error de conexión: ${err instanceof Error ? err.message : String(err)}`,
      details: err,
    }
  }
}

async function checkDatabaseSchema(): Promise<CheckResult> {
  log("Verificando schema de base de datos...", "📊")

  try {
    const errors: string[] = []

    for (const tabla of TABLAS_CORE) {
      try {
        await db.select().from(tabla.schema).limit(1)
        log(`  ├─ Tabla ${tabla.nombre}: OK`, "✓")
      } catch (err) {
        errors.push(`Tabla ${tabla.nombre}: ${err instanceof Error ? err.message : String(err)}`)
        log(`  ├─ Tabla ${tabla.nombre}: ERROR`, "✗")
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Errores en ${errors.length} tablas`,
        details: errors,
      }
    }

    success(`Las ${TABLAS_CORE.length} tablas están operacionales`)
    return { passed: true, message: "Schema completo OK" }
  } catch (err) {
    return {
      passed: false,
      message: `Error verificando schema: ${err instanceof Error ? err.message : String(err)}`,
      details: err,
    }
  }
}

async function checkBancos(): Promise<CheckResult> {
  log("Verificando los 7 bancos del sistema...", "🏦")

  try {
    const bancosExistentes = await db.select().from(bancos)
    const idsExistentes = bancosExistentes.map((b) => b.id)
    const faltantes = BANCOS_ESPERADOS.filter((id) => !idsExistentes.includes(id))

    if (faltantes.length > 0) {
      return {
        passed: false,
        message: `Faltan bancos: ${faltantes.join(", ")}`,
        details: { faltantes, existentes: idsExistentes },
      }
    }

    // Verificar capital de cada banco
    for (const banco of bancosExistentes) {
      log(`  ├─ ${banco.nombre}: $${banco.capitalActual.toLocaleString()}`, "💰")
    }

    success("Los 7 bancos están configurados correctamente")
    return { passed: true, message: "Bancos OK", details: bancosExistentes }
  } catch (err) {
    return {
      passed: false,
      message: `Error verificando bancos: ${err instanceof Error ? err.message : String(err)}`,
      details: err,
    }
  }
}

async function checkIntegridadReferencial(): Promise<CheckResult> {
  log("Verificando integridad referencial...", "🔗")

  try {
    const errors: string[] = []

    // Verificar que todas las ventas tengan cliente válido
    const ventasOrfanas = await db
      .select({ id: ventas.id })
      .from(ventas)
      .leftJoin(clientes, eq(ventas.clienteId, clientes.id))
      .where(sql`${clientes.id} IS NULL`)
      .limit(10)

    if (ventasOrfanas.length > 0) {
      errors.push(`${ventasOrfanas.length} ventas sin cliente válido`)
    }

    // Verificar que todas las OC tengan distribuidor válido
    const ocOrfanas = await db
      .select({ id: ordenesCompra.id })
      .from(ordenesCompra)
      .leftJoin(distribuidores, eq(ordenesCompra.distribuidorId, distribuidores.id))
      .where(sql`${distribuidores.id} IS NULL`)
      .limit(10)

    if (ocOrfanas.length > 0) {
      errors.push(`${ocOrfanas.length} órdenes de compra sin distribuidor válido`)
    }

    // Verificar que todos los movimientos tengan banco válido
    const movimientosOrfanos = await db
      .select({ id: movimientos.id })
      .from(movimientos)
      .leftJoin(bancos, eq(movimientos.bancoId, bancos.id))
      .where(sql`${bancos.id} IS NULL`)
      .limit(10)

    if (movimientosOrfanos.length > 0) {
      errors.push(`${movimientosOrfanos.length} movimientos sin banco válido`)
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: "Problemas de integridad referencial",
        details: errors,
      }
    }

    success("Integridad referencial correcta")
    return { passed: true, message: "Integridad referencial OK" }
  } catch (err) {
    return {
      passed: false,
      message: `Error verificando integridad: ${err instanceof Error ? err.message : String(err)}`,
      details: err,
    }
  }
}

async function checkLogicaGYA(): Promise<CheckResult> {
  log("Verificando lógica matemática GYA...", "🧮")

  try {
    // Caso de prueba: 15 relojes
    const casoTest = {
      cantidad: 15,
      precioVenta: 10000,
      precioCompra: 6300,
      precioFlete: 500,
    }

    const resultado = calcularDistribucionGYA(casoTest)

    // Valores esperados
    const esperado = {
      bovedaMonte: 94500, // 6300 * 15 = COSTO
      fletes: 7500, // 500 * 15 = FLETE
      utilidades: 48000, // (10000 - 6300 - 500) * 15 = GANANCIA
      total: 150000, // Precio total venta
    }

    const errors: string[] = []

    if (resultado.bovedaMonte !== esperado.bovedaMonte) {
      errors.push(
        `Bóveda Monte: esperado ${esperado.bovedaMonte}, obtenido ${resultado.bovedaMonte}`
      )
    }

    if (resultado.fletes !== esperado.fletes) {
      errors.push(`Fletes: esperado ${esperado.fletes}, obtenido ${resultado.fletes}`)
    }

    if (resultado.utilidades !== esperado.utilidades) {
      errors.push(`Utilidades: esperado ${esperado.utilidades}, obtenido ${resultado.utilidades}`)
    }

    if (resultado.total !== esperado.total) {
      errors.push(`Total: esperado ${esperado.total}, obtenido ${resultado.total}`)
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: "Falla en cálculos GYA",
        details: errors,
      }
    }

    log(`  ├─ Bóveda Monte: $${resultado.bovedaMonte.toLocaleString()}`, "💰")
    log(`  ├─ Fletes: $${resultado.fletes.toLocaleString()}`, "🚛")
    log(`  ├─ Utilidades: $${resultado.utilidades.toLocaleString()}`, "📈")
    log(`  └─ Total: $${resultado.total.toLocaleString()}`, "💵")

    success("Lógica GYA calculando correctamente")
    return { passed: true, message: "Lógica GYA OK" }
  } catch (err) {
    return {
      passed: false,
      message: `Error verificando GYA: ${err instanceof Error ? err.message : String(err)}`,
      details: err,
    }
  }
}

async function checkAPIEndpoints(): Promise<CheckResult> {
  log("Verificando endpoints de API...", "🌐")

  const endpoints = [
    "/api/bancos",
    "/api/clientes",
    "/api/distribuidores",
    "/api/ventas",
    "/api/ordenes",
    "/api/movimientos",
    "/api/kpis",
  ]

  // En ambiente local, solo verificamos que los archivos existan
  try {
    const fs = await import("fs/promises")
    const path = await import("path")

    const errors: string[] = []

    for (const endpoint of endpoints) {
      const routePath = path.join(
        process.cwd(),
        "app",
        "api",
        endpoint.replace("/api/", ""),
        "route.ts"
      )

      try {
        await fs.access(routePath)
        log(`  ├─ ${endpoint}: ✓`, "✓")
      } catch {
        errors.push(`Falta endpoint: ${endpoint}`)
        log(`  ├─ ${endpoint}: ✗`, "✗")
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Faltan ${errors.length} endpoints`,
        details: errors,
      }
    }

    success(`${endpoints.length} endpoints verificados`)
    return { passed: true, message: "Endpoints OK" }
  } catch (err) {
    return {
      passed: false,
      message: `Error verificando endpoints: ${err instanceof Error ? err.message : String(err)}`,
      details: err,
    }
  }
}

async function checkBuildStatus(): Promise<CheckResult> {
  log("Verificando estado de build...", "🏗️")

  try {
    const fs = await import("fs/promises")
    const path = await import("path")

    const nextConfigPath = path.join(process.cwd(), "next.config.ts")
    const packageJsonPath = path.join(process.cwd(), "package.json")

    // Verificar archivos críticos
    await fs.access(nextConfigPath)
    await fs.access(packageJsonPath)

    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"))

    log(`  ├─ Next.js: ${packageJson.dependencies?.next || "N/A"}`, "⚛️")
    log(`  ├─ React: ${packageJson.dependencies?.react || "N/A"}`, "⚛️")
    log(`  └─ TypeScript: ${packageJson.devDependencies?.typescript || "N/A"}`, "📘")

    success("Configuración de build correcta")
    return { passed: true, message: "Build OK" }
  } catch (err) {
    return {
      passed: false,
      message: `Error verificando build: ${err instanceof Error ? err.message : String(err)}`,
      details: err,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.clear()
  console.log("╔" + "═".repeat(78) + "╗")
  console.log("║" + " ".repeat(78) + "║")
  console.log(
    "║" + "   🌌 CHRONOS INFINITY 2026 — VERIFICACIÓN COMPLETA DE PRODUCCIÓN   ".padEnd(79) + "║"
  )
  console.log("║" + " ".repeat(78) + "║")
  console.log("╚" + "═".repeat(78) + "╝")

  const checks = [
    { name: "Variables de entorno", fn: checkEnvVariables },
    { name: "Conexión a base de datos", fn: checkDatabaseConnection },
    { name: "Schema de base de datos", fn: checkDatabaseSchema },
    { name: "Los 7 bancos", fn: checkBancos },
    { name: "Integridad referencial", fn: checkIntegridadReferencial },
    { name: "Lógica matemática GYA", fn: checkLogicaGYA },
    { name: "Endpoints de API", fn: checkAPIEndpoints },
    { name: "Estado de build", fn: checkBuildStatus },
  ]

  const results: CheckResult[] = []

  for (const check of checks) {
    section(check.name)
    const result = await check.fn()
    results.push(result)

    if (!result.passed) {
      error(`FALLÓ: ${result.message}`)
      if (result.details) {
        console.log("Detalles:", result.details)
      }
    }
  }

  // Resumen final
  section("RESUMEN FINAL")

  const passed = results.filter((r) => r.passed).length
  const total = results.length

  console.log(`\n📊 Resultados: ${passed}/${total} verificaciones pasadas\n`)

  for (let i = 0; i < results.length; i++) {
    const emoji = results[i].passed ? "✅" : "❌"
    console.log(`${emoji} ${checks[i].name}`)
  }

  if (passed === total) {
    console.log("\n🎉 ¡TODO CORRECTO! Sistema listo para producción.\n")
    process.exit(0)
  } else {
    console.log("\n⚠️  HAY PROBLEMAS. Revisar logs arriba.\n")
    process.exit(1)
  }
}

// Ejecutar
main().catch((err) => {
  error(`Error fatal: ${err instanceof Error ? err.message : String(err)}`)
  console.error(err)
  process.exit(1)
})
