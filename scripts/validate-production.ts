#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ CHRONOS INFINITY 2026 — VALIDACIÓN FINAL DE PRODUCCIÓN
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Script de validación completa ANTES de hacer deploy.
 * Ejecutar SIEMPRE antes de mergear a main.
 *
 * EJECUTAR: pnpm tsx scripts/validate-production.ts
 *
 * @version 1.0.0 - IY SUPREME EDITION
 */

import { exec } from "child_process"
import * as fs from "fs/promises"
import * as path from "path"
import { promisify } from "util"

const execAsync = promisify(exec)

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
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

function section(title: string) {
  console.log(`\n${"═".repeat(80)}`)
  console.log(`🎯 ${title}`)
  console.log("═".repeat(80))
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIONES
// ═══════════════════════════════════════════════════════════════════════════

async function checkEnvironmentVariables(): Promise<boolean> {
  log("Verificando variables de entorno...", "🔐")

  const requiredVars = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"]
  const missing: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    error(`Faltan variables: ${missing.join(", ")}`)
    return false
  }

  success("Variables de entorno OK")
  return true
}

async function runLint(): Promise<boolean> {
  log("Ejecutando ESLint...", "🔍")

  try {
    const { stdout, stderr } = await execAsync("pnpm lint")
    if (stderr && !stderr.includes("warnings")) {
      error("ESLint encontró errores")
      console.log(stderr)
      return false
    }
    success("ESLint OK")
    return true
  } catch (err) {
    error("ESLint falló")
    if (err instanceof Error && "stdout" in err) {
      console.log((err as { stdout: string }).stdout)
    }
    return false
  }
}

async function runTypeCheck(): Promise<boolean> {
  log("Verificando tipos TypeScript...", "📘")

  try {
    await execAsync("pnpm type-check")
    success("TypeScript OK")
    return true
  } catch (err) {
    error("TypeScript encontró errores")
    if (err instanceof Error && "stdout" in err) {
      console.log((err as { stdout: string }).stdout)
    }
    return false
  }
}

async function runTests(): Promise<boolean> {
  log("Ejecutando tests...", "🧪")

  try {
    const { stdout } = await execAsync("pnpm test --passWithNoTests")
    success("Tests OK")

    // Extraer resumen de tests
    const match = stdout.match(/Tests:.*passed/)
    if (match) {
      log(`  ${match[0]}`, "📊")
    }

    return true
  } catch (err) {
    error("Tests fallaron")
    if (err instanceof Error && "stdout" in err) {
      console.log((err as { stdout: string }).stdout)
    }
    return false
  }
}

async function runBuild(): Promise<boolean> {
  log("Compilando aplicación...", "🏗️")

  try {
    const { stdout, stderr } = await execAsync("pnpm build", {
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    })

    // Verificar si hay errores críticos
    if (stderr && stderr.includes("Error:")) {
      error("Build falló")
      console.log(stderr)
      return false
    }

    success("Build OK")

    // Extraer métricas de build
    const sizeMatch = stdout.match(/Total Size:.*/)
    if (sizeMatch) {
      log(`  ${sizeMatch[0]}`, "📦")
    }

    return true
  } catch (err) {
    error("Build falló")
    if (err instanceof Error && "stderr" in err) {
      console.log((err as { stderr: string }).stderr)
    }
    return false
  }
}

async function checkCriticalFiles(): Promise<boolean> {
  log("Verificando archivos críticos...", "📁")

  const criticalFiles = [
    "app/lib/api-response.ts",
    "app/api/health/route.ts",
    "scripts/verify-production-complete.ts",
    "database/schema.ts",
    "database/index.ts",
    ".github/workflows/production-deploy.yml",
    "next.config.ts",
    "package.json",
    "tsconfig.json",
  ]

  const missing: string[] = []

  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file)
    try {
      await fs.access(filePath)
    } catch {
      missing.push(file)
    }
  }

  if (missing.length > 0) {
    error(`Archivos faltantes: ${missing.join(", ")}`)
    return false
  }

  success(`${criticalFiles.length} archivos críticos OK`)
  return true
}

async function checkDatabaseSchema(): Promise<boolean> {
  log("Verificando schema de base de datos...", "🗄️")

  try {
    const schemaPath = path.join(process.cwd(), "database/schema.ts")
    const schemaContent = await fs.readFile(schemaPath, "utf-8")

    // Verificar que existan las tablas críticas
    const requiredTables = [
      "usuarios",
      "clientes",
      "distribuidores",
      "bancos",
      "ventas",
      "ordenesCompra",
      "movimientos",
      "abonos",
      "almacen",
      "kpisGlobales",
    ]

    const missingTables: string[] = []

    for (const table of requiredTables) {
      if (!schemaContent.includes(`export const ${table} = sqliteTable`)) {
        missingTables.push(table)
      }
    }

    if (missingTables.length > 0) {
      error(`Tablas faltantes en schema: ${missingTables.join(", ")}`)
      return false
    }

    success(`${requiredTables.length} tablas en schema OK`)
    return true
  } catch (err) {
    error("Error leyendo schema")
    console.error(err)
    return false
  }
}

async function checkAPIEndpoints(): Promise<boolean> {
  log("Verificando endpoints de API...", "🌐")

  const endpoints = [
    "app/api/health/route.ts",
    "app/api/bancos/route.ts",
    "app/api/clientes/route.ts",
    "app/api/distribuidores/route.ts",
    "app/api/ventas/route.ts",
    "app/api/ordenes/route.ts",
    "app/api/movimientos/route.ts",
  ]

  const missing: string[] = []

  for (const endpoint of endpoints) {
    const endpointPath = path.join(process.cwd(), endpoint)
    try {
      await fs.access(endpointPath)

      // Verificar que use el formato estándar
      const content = await fs.readFile(endpointPath, "utf-8")
      if (!content.includes("api-response") && endpoint !== "app/api/health/route.ts") {
        log(`  ⚠️  ${endpoint} no usa api-response estándar`, "⚠️")
      }
    } catch {
      missing.push(endpoint)
    }
  }

  if (missing.length > 0) {
    error(`Endpoints faltantes: ${missing.join(", ")}`)
    return false
  }

  success(`${endpoints.length} endpoints OK`)
  return true
}

async function checkGitStatus(): Promise<boolean> {
  log("Verificando estado de Git...", "📝")

  try {
    const { stdout } = await execAsync("git status --porcelain")

    if (stdout.trim()) {
      error("Hay cambios sin commitear")
      console.log("\nArchivos modificados:")
      console.log(stdout)
      return false
    }

    success("Working directory limpio")
    return true
  } catch (err) {
    error("Error verificando Git")
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.clear()
  console.log("╔" + "═".repeat(78) + "╗")
  console.log("║" + " ".repeat(78) + "║")
  console.log("║" + "   ✅ CHRONOS INFINITY 2026 — VALIDACIÓN DE PRODUCCIÓN   ".padEnd(79) + "║")
  console.log("║" + " ".repeat(78) + "║")
  console.log("╚" + "═".repeat(78) + "╝")

  const checks = [
    { name: "Variables de entorno", fn: checkEnvironmentVariables },
    { name: "Archivos críticos", fn: checkCriticalFiles },
    { name: "Schema de base de datos", fn: checkDatabaseSchema },
    { name: "Endpoints de API", fn: checkAPIEndpoints },
    { name: "ESLint", fn: runLint },
    { name: "TypeScript", fn: runTypeCheck },
    { name: "Tests unitarios", fn: runTests },
    { name: "Build de producción", fn: runBuild },
    { name: "Estado de Git", fn: checkGitStatus },
  ]

  const results: boolean[] = []
  const startTime = Date.now()

  for (const check of checks) {
    section(check.name)
    const result = await check.fn()
    results.push(result)

    if (!result) {
      console.log("\n⚠️  Verificación falló. Corrige los errores antes de continuar.\n")
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  // Resumen final
  section("RESUMEN FINAL")

  const passed = results.filter((r) => r).length
  const total = results.length

  console.log(`\n📊 Resultados: ${passed}/${total} verificaciones pasadas`)
  console.log(`⏱️  Duración: ${duration}s\n`)

  for (let i = 0; i < results.length; i++) {
    const emoji = results[i] ? "✅" : "❌"
    console.log(`${emoji} ${checks[i].name}`)
  }

  if (passed === total) {
    console.log("\n🎉 ¡TODO CORRECTO! Sistema listo para producción.\n")
    console.log("✅ Puedes proceder con:")
    console.log("   git push origin main")
    console.log("   (GitHub Actions hará deploy automático)\n")
    process.exit(0)
  } else {
    console.log("\n⚠️  HAY PROBLEMAS. Corrige los errores arriba.\n")
    console.log("❌ NO hacer push hasta que todas las verificaciones pasen.\n")
    process.exit(1)
  }
}

// Ejecutar
main().catch((err) => {
  error(`Error fatal: ${err instanceof Error ? err.message : String(err)}`)
  console.error(err)
  process.exit(1)
})
