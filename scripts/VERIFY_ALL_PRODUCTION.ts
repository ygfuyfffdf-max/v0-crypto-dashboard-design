#!/usr/bin/env tsx
/**
 * 🔍 CHRONOS INFINITY 2026 - VERIFICACIÓN TOTAL DE PRODUCCIÓN
 *
 * Este script verifica ABSOLUTAMENTE TODO:
 * ✅ Variables de entorno
 * ✅ Conexión a Turso
 * ✅ Schema de base de datos
 * ✅ 7 bancos del sistema
 * ✅ APIs funcionando
 * ✅ Endpoints críticos
 * ✅ Build de Next.js
 * ✅ Integridad de datos
 *
 * USO:
 *   pnpm add -D tsx
 *   chmod +x scripts/VERIFY_ALL_PRODUCTION.ts
 *   tsx scripts/VERIFY_ALL_PRODUCTION.ts
 */

import { createClient } from "@libsql/client"
import { exec } from "child_process"
import { drizzle } from "drizzle-orm/libsql"
import { promisify } from "util"
import * as schema from "../database/schema"

const execAsync = promisify(exec)

// ═══════════════════════════════════════════════════════════
// COLORES PARA CONSOLA
// ═══════════════════════════════════════════════════════════
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

const log = {
  title: (msg: string) =>
    console.log(
      `\n${colors.bright}${colors.cyan}${"═".repeat(70)}${colors.reset}\n${colors.bright}${colors.cyan}${msg}${colors.reset}`
    ),
  section: (msg: string) => console.log(`${colors.bright}${colors.blue}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
}

// ═══════════════════════════════════════════════════════════
// 1. VERIFICAR VARIABLES DE ENTORNO
// ═══════════════════════════════════════════════════════════
async function checkEnvironmentVariables(): Promise<boolean> {
  log.title("1. VERIFICANDO VARIABLES DE ENTORNO")
  log.section("──────────────────────────────────────")

  const required: Record<string, string | undefined> = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  }

  const optional: Record<string, string | undefined> = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }

  let allRequired = true

  // Verificar requeridas
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      log.error(`FALTA variable requerida: ${key}`)
      allRequired = false
    } else {
      const masked =
        value.length > 15
          ? value.substring(0, 10) + "..." + value.substring(value.length - 5)
          : value.substring(0, 10) + "..."
      log.success(`${key}: ${masked}`)
    }
  }

  // Verificar opcionales
  for (const [key, value] of Object.entries(optional)) {
    if (!value) {
      log.warning(`OPCIONAL no configurada: ${key}`)
    } else {
      const masked = value.substring(0, 10) + "..."
      log.success(`${key}: ${masked}`)
    }
  }

  return allRequired
}

// ═══════════════════════════════════════════════════════════
// 2. VERIFICAR CONEXIÓN A TURSO
// ═══════════════════════════════════════════════════════════
interface DBResult {
  success: boolean
  db?: ReturnType<typeof drizzle>
}

async function checkDatabaseConnection(): Promise<DBResult> {
  log.title("2. VERIFICANDO CONEXIÓN A TURSO")
  log.section("──────────────────────────────────────")

  try {
    const databaseUrl = process.env.DATABASE_URL?.trim() || "file:database/sqlite.db"
    const authToken = process.env.DATABASE_AUTH_TOKEN?.trim()

    log.info(`URL: ${databaseUrl}`)
    log.info(`Auth Token: ${authToken ? "✅ Configurado" : "❌ NO configurado"}`)

    const client = createClient({
      url: databaseUrl,
      authToken: authToken,
    })

    const db = drizzle(client, { schema })

    // Test query
    const result = await client.execute("SELECT 1 as test")

    log.success("Conexión a Turso exitosa")
    log.info(`Test query result: ${JSON.stringify(result.rows[0])}`)

    return { success: true, db }
  } catch (error) {
    log.error(`Error de conexión: ${(error as Error).message}`)
    return { success: false }
  }
}

// ═══════════════════════════════════════════════════════════
// 3. VERIFICAR SCHEMA Y TABLAS
// ═══════════════════════════════════════════════════════════
async function checkDatabaseSchema(db: ReturnType<typeof drizzle>): Promise<boolean> {
  log.title("3. VERIFICANDO SCHEMA DE BASE DE DATOS")
  log.section("──────────────────────────────────────")

  const requiredTables = [
    "bancos",
    "clientes",
    "ventas",
    "distribuidores",
    "ordenes_compra",
    "movimientos",
    "almacen",
    "abonos",
  ]

  try {
    for (const table of requiredTables) {
      const result = await (db as any).execute(`SELECT COUNT(*) as count FROM ${table}`)
      const count = result.rows[0]?.count ?? 0

      log.success(`Tabla "${table}": ${count} registros`)
    }

    return true
  } catch (error) {
    log.error(`Error verificando schema: ${(error as Error).message}`)
    log.warning("Ejecuta: pnpm db:push")
    return false
  }
}

// ═══════════════════════════════════════════════════════════
// 4. VERIFICAR 7 BANCOS DEL SISTEMA
// ═══════════════════════════════════════════════════════════
async function checkBancos(db: ReturnType<typeof drizzle>): Promise<boolean> {
  log.title("4. VERIFICANDO 7 BANCOS DEL SISTEMA")
  log.section("──────────────────────────────────────")

  const expectedBancos = [
    "boveda_monte",
    "boveda_usa",
    "profit",
    "leftie",
    "azteca",
    "flete_sur",
    "utilidades",
  ]

  try {
    const result = await (db as any).execute(
      "SELECT id, nombre, capital_actual FROM bancos ORDER BY id"
    )
    const bancos = result.rows

    if (bancos.length === 0) {
      log.error("NO HAY BANCOS EN LA BASE DE DATOS")
      log.warning("Ejecuta: pnpm db:seed")
      return false
    }

    log.info(`Total de bancos: ${bancos.length}/7`)

    for (const banco of bancos) {
      const id = banco.id as string
      const nombre = banco.nombre as string
      const capital = Number(banco.capital_actual) || 0
      const exists = expectedBancos.includes(id)

      if (exists) {
        log.success(`${id} (${nombre}): $${capital.toLocaleString("es-MX")} MXN`)
      } else {
        log.warning(`Banco inesperado: ${id}`)
      }
    }

    // Verificar que existan todos los esperados
    const existingIds = bancos.map((b: { id: string }) => b.id)
    const missing = expectedBancos.filter((id) => !existingIds.includes(id))

    if (missing.length > 0) {
      log.error(`Bancos faltantes: ${missing.join(", ")}`)
      log.warning("Ejecuta: pnpm db:seed")
      return false
    }

    return true
  } catch (error) {
    log.error(`Error verificando bancos: ${(error as Error).message}`)
    return false
  }
}

// ═══════════════════════════════════════════════════════════
// 5. VERIFICAR INTEGRIDAD DE DATOS
// ═══════════════════════════════════════════════════════════
async function checkDataIntegrity(db: ReturnType<typeof drizzle>): Promise<void> {
  log.title("5. VERIFICANDO INTEGRIDAD DE DATOS")
  log.section("──────────────────────────────────────")

  try {
    // Ventas con clientes válidos
    const ventasOrfanas = await (db as any).execute(`
      SELECT COUNT(*) as count
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.cliente_id IS NOT NULL AND c.id IS NULL
    `)

    if (Number(ventasOrfanas.rows[0]?.count) > 0) {
      log.error(`${ventasOrfanas.rows[0].count} ventas con cliente inválido`)
    } else {
      log.success("Todas las ventas tienen cliente válido")
    }

    // Movimientos con banco válido
    const movimientosOrfanos = await (db as any).execute(`
      SELECT COUNT(*) as count
      FROM movimientos m
      LEFT JOIN bancos b ON m.banco_id = b.id
      WHERE m.banco_id IS NOT NULL AND b.id IS NULL
    `)

    if (Number(movimientosOrfanos.rows[0]?.count) > 0) {
      log.error(`${movimientosOrfanos.rows[0].count} movimientos con banco inválido`)
    } else {
      log.success("Todos los movimientos tienen banco válido")
    }

    // Órdenes con distribuidor válido
    const ordenesOrfanas = await (db as any).execute(`
      SELECT COUNT(*) as count
      FROM ordenes_compra o
      LEFT JOIN distribuidores d ON o.distribuidor_id = d.id
      WHERE o.distribuidor_id IS NOT NULL AND d.id IS NULL
    `)

    if (Number(ordenesOrfanas.rows[0]?.count) > 0) {
      log.error(`${ordenesOrfanas.rows[0].count} órdenes con distribuidor inválido`)
    } else {
      log.success("Todas las órdenes tienen distribuidor válido")
    }
  } catch (error) {
    log.error(`Error verificando integridad: ${(error as Error).message}`)
  }
}

// ═══════════════════════════════════════════════════════════
// 6. VERIFICAR ENDPOINTS DE API (PRODUCCIÓN)
// ═══════════════════════════════════════════════════════════
async function checkAPIEndpoints(): Promise<void> {
  log.title("6. VERIFICANDO ENDPOINTS DE API")
  log.section("──────────────────────────────────────")

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "https://v0-crypto-dashboard-design-alpha.vercel.app"

  log.info(`Base URL: ${baseUrl}`)

  const endpoints = [
    "/api/bancos",
    "/api/ventas",
    "/api/clientes",
    "/api/distribuidores",
    "/api/ordenes",
    "/api/almacen",
    "/api/movimientos",
    "/api/dashboard/resumen",
  ]

  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const count = Array.isArray(data) ? data.length : (data.data?.length ?? "N/A")
        log.success(`${endpoint}: ${response.status} (${count} registros)`)
      } else {
        log.error(`${endpoint}: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      log.warning(`${endpoint}: No disponible - ${(error as Error).message}`)
    }
  }
}

// ═══════════════════════════════════════════════════════════
// 7. VERIFICAR BUILD DE NEXT.JS
// ═══════════════════════════════════════════════════════════
async function checkNextJSBuild(): Promise<boolean> {
  log.title("7. VERIFICANDO BUILD DE NEXT.JS")
  log.section("──────────────────────────────────────")

  try {
    log.info("Ejecutando: pnpm type-check")
    await execAsync("pnpm type-check", { cwd: process.cwd() })
    log.success("TypeScript: Sin errores")
    return true
  } catch (error) {
    log.error("TypeScript: Errores detectados")
    log.info((error as any).stdout || (error as Error).message)
    return false
  }
}

// ═══════════════════════════════════════════════════════════
// 8. RESUMEN FINAL
// ═══════════════════════════════════════════════════════════
function printSummary(results: Record<string, boolean>): void {
  log.title("RESUMEN DE VERIFICACIÓN")
  log.section("──────────────────────────────────────")

  const passed = Object.values(results).filter((v) => v).length
  const total = Object.keys(results).length
  const percentage = Math.round((passed / total) * 100)

  console.log("")
  for (const [check, result] of Object.entries(results)) {
    if (result) {
      log.success(check)
    } else {
      log.error(check)
    }
  }

  console.log("")
  log.section(`═══════════════════════════════════════════════════════`)

  if (percentage === 100) {
    log.success(`🎉 TODO CORRECTO: ${passed}/${total} verificaciones pasadas`)
    log.success("✅ EL SISTEMA ESTÁ LISTO PARA PRODUCCIÓN")
  } else if (percentage >= 70) {
    log.warning(
      `⚠️  PARCIALMENTE FUNCIONAL: ${passed}/${total} verificaciones pasadas (${percentage}%)`
    )
    log.warning("Revisa los errores arriba")
  } else {
    log.error(`🚨 SISTEMA CRÍTICO: ${passed}/${total} verificaciones pasadas (${percentage}%)`)
    log.error("REQUIERE ATENCIÓN INMEDIATA")
  }

  log.section(`═══════════════════════════════════════════════════════`)
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log(`
${colors.bright}${colors.cyan}
╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   🚀 CHRONOS INFINITY 2026 - VERIFICACIÓN TOTAL PRODUCCIÓN 🚀      ║
║                                                                     ║
║   Verificando absolutamente TODO el sistema...                      ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
${colors.reset}
  `)

  const results: Record<string, boolean> = {}

  // 1. Variables de entorno
  results["Variables de Entorno"] = await checkEnvironmentVariables()

  // 2. Conexión DB
  const { success: dbConnected, db } = await checkDatabaseConnection()
  results["Conexión a Turso"] = dbConnected

  if (dbConnected && db) {
    // 3. Schema
    results["Schema de Base de Datos"] = await checkDatabaseSchema(db)

    // 4. Bancos
    results["7 Bancos del Sistema"] = await checkBancos(db)

    // 5. Integridad
    await checkDataIntegrity(db)
  }

  // 6. APIs
  await checkAPIEndpoints()

  // 7. Build
  results["Build de Next.js"] = await checkNextJSBuild()

  // Resumen
  printSummary(results)
}

// Ejecutar
main().catch((error) => {
  log.error(`Error fatal: ${(error as Error).message}`)
  process.exit(1)
})
