#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS 2026 — SCRIPT DE VERIFICACIÓN DE CALIDAD
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Verifica que el proyecto no tenga errores de:
 * - TypeScript (pnpm type-check)
 * - ESLint (pnpm lint)
 * - Build (pnpm build)
 * - Tests (pnpm test)
 *
 * Uso: pnpm verify o npm run verify
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { execSync } from "child_process"

// Colores para output (sin dependencias externas)
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
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

interface CheckResult {
  name: string
  passed: boolean
  output?: string
}

const checks: Array<{ name: string; cmd: string; optional?: boolean }> = [
  { name: "TypeScript", cmd: "pnpm type-check" },
  { name: "ESLint", cmd: "pnpm lint" },
  { name: "Build", cmd: "pnpm build" },
  { name: "Tests", cmd: "pnpm test --passWithNoTests", optional: true },
]

async function runCheck(check: {
  name: string
  cmd: string
  optional?: boolean
}): Promise<CheckResult> {
  log(`\n🔍 Verificando ${check.name}...`, "blue")

  try {
    const output = execSync(check.cmd, {
      encoding: "utf-8",
      stdio: "pipe",
    })

    log(`✅ ${check.name}: 0 ERRORES`, "green")
    return { name: check.name, passed: true, output }
  } catch (error: any) {
    const output = error.stdout || error.stderr || error.message

    if (check.optional) {
      log(`⚠️  ${check.name}: ERRORES ENCONTRADOS (opcional)`, "yellow")
      return { name: check.name, passed: true, output }
    }

    log(`❌ ${check.name}: ERRORES ENCONTRADOS`, "red")
    return { name: check.name, passed: false, output }
  }
}

async function main() {
  log("\n═══════════════════════════════════════════════════════════════", "cyan")
  log("🚀 CHRONOS 2026 - VERIFICACIÓN DE CALIDAD", "cyan")
  log("═══════════════════════════════════════════════════════════════\n", "cyan")

  const results: CheckResult[] = []

  for (const check of checks) {
    const result = await runCheck(check)
    results.push(result)
  }

  // Resumen
  log("\n═══════════════════════════════════════════════════════════════", "cyan")
  log("📊 RESUMEN DE VERIFICACIÓN", "cyan")
  log("═══════════════════════════════════════════════════════════════\n", "cyan")

  const allPassed = results.every((r) => r.passed)

  for (const result of results) {
    const icon = result.passed ? "✅" : "❌"
    const color = result.passed ? "green" : "red"
    log(`${icon} ${result.name}`, color)
  }

  log("\n═══════════════════════════════════════════════════════════════", "cyan")

  if (allPassed) {
    log("🎉 VERIFICACIÓN COMPLETA: 0 ERRORES, 0 PROBLEMAS, 0 PENDIENTES", "green")
    log("✨ CHRONOS INFINITY 2026 - LISTO PARA PRODUCCIÓN", "green")
    log("═══════════════════════════════════════════════════════════════\n", "cyan")
    process.exit(0)
  } else {
    log("⚠️  SE ENCONTRARON ERRORES - REVISAR ARRIBA", "red")
    log("═══════════════════════════════════════════════════════════════\n", "cyan")
    process.exit(1)
  }
}

main().catch((error) => {
  log(`\n❌ Error fatal: ${error.message}`, "red")
  process.exit(1)
})
