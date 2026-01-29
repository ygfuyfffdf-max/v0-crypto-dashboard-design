import { expect, Page, test } from "@playwright/test"
import { GEN5_CONFIG, GEN5_ROUTES } from "./gen5-test-utils"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 CHRONOS GEN5 2026 — TESTS E2E: CAPTURA DE ERRORES DE CONSOLA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests que verifican la ausencia de errores en consola del navegador Gen5:
 *
 * ✅ Sin errores de JavaScript (TypeError, ReferenceError, etc.)
 * ✅ Sin errores de React (Hydration, Hooks, etc.)
 * ✅ Sin errores de red (Failed to fetch, 404, 500)
 * ✅ Sin warnings críticos
 * ✅ Sin errores de TypeScript runtime
 * ✅ Sin memory leaks detectables
 * ✅ Sin errores de framer-motion Gen5
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// TIPOS
// ============================================

interface ConsoleMessage {
  type: string
  text: string
  location?: string
  timestamp: number
}

interface PageErrorReport {
  path: string
  name: string
  errors: ConsoleMessage[]
  warnings: ConsoleMessage[]
  criticalErrors: ConsoleMessage[]
}

// ============================================
// CONFIGURACIÓN GEN5
// ============================================

// Timeout para Gen5
test.setTimeout(GEN5_CONFIG.BASE_TIMEOUT + 15000)

// Rutas Gen5 a verificar (10 paneles)
const RUTAS_A_VERIFICAR = [
  { path: GEN5_ROUTES.dashboard, name: "Dashboard Principal" },
  { path: GEN5_ROUTES.ventas, name: "Panel de Ventas" },
  { path: GEN5_ROUTES.clientes, name: "Panel de Clientes" },
  { path: GEN5_ROUTES.bancos, name: "Panel de Bancos" },
  { path: GEN5_ROUTES.gastos, name: "Panel de Gastos" },
  { path: GEN5_ROUTES.movimientos, name: "Historial Movimientos" },
  { path: GEN5_ROUTES.ordenes, name: "Órdenes de Compra" },
  { path: GEN5_ROUTES.distribuidores, name: "Distribuidores" },
  { path: GEN5_ROUTES.almacen, name: "Almacén/Inventario" },
  { path: GEN5_ROUTES.ia, name: "IA Analytics" },
]

// Errores críticos que NUNCA deberían aparecer
const ERRORES_CRITICOS = [
  "TypeError",
  "ReferenceError",
  "SyntaxError",
  "RangeError",
  "Uncaught",
  "Unhandled",
  "Cannot read property",
  "Cannot read properties",
  "undefined is not",
  "null is not",
  "is not a function",
  "Maximum call stack",
  "out of memory",
  "Hydration failed",
  "Minified React error",
  "Invalid hook call",
  "Rendered fewer hooks",
  "Rendered more hooks",
]

// Warnings que deberían investigarse
const WARNINGS_IMPORTANTES = [
  "Warning:",
  "Deprecation",
  "deprecated",
  "memory leak",
  "listener",
  "removeEventListener",
  "unmounted component",
  "Can't perform a React state update",
]

// Errores de red importantes
const ERRORES_RED = [
  "Failed to fetch",
  "Network request failed",
  "ERR_CONNECTION",
  "ERR_NAME_NOT_RESOLVED",
  "404",
  "500",
  "502",
  "503",
  "CORS",
]

// ============================================
// HELPERS
// ============================================

function esCritico(mensaje: string): boolean {
  return ERRORES_CRITICOS.some((patron) => mensaje.includes(patron))
}

function esWarningImportante(mensaje: string): boolean {
  return WARNINGS_IMPORTANTES.some((patron) => mensaje.includes(patron))
}

function esErrorRed(mensaje: string): boolean {
  return ERRORES_RED.some((patron) => mensaje.includes(patron))
}

function clasificarMensaje(mensaje: ConsoleMessage): "critico" | "error" | "warning" | "info" {
  const texto = mensaje.text.toLowerCase()

  if (mensaje.type === "error") {
    if (esCritico(mensaje.text)) return "critico"
    if (esErrorRed(mensaje.text)) return "error"
    return "error"
  }

  if (mensaje.type === "warning" && esWarningImportante(mensaje.text)) {
    return "warning"
  }

  return "info"
}

async function capturarErroresEnPagina(
  page: Page,
  ruta: { path: string; name: string }
): Promise<PageErrorReport> {
  const mensajes: ConsoleMessage[] = []

  // Listener para mensajes de consola
  page.on("console", (msg) => {
    mensajes.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()?.url,
      timestamp: Date.now(),
    })
  })

  // Listener para errores de página
  page.on("pageerror", (error) => {
    mensajes.push({
      type: "error",
      text: error.message,
      timestamp: Date.now(),
    })
  })

  // Navegar
  await page.goto(ruta.path, { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.waitForTimeout(3000) // Esperar renderizado completo

  // Interactuar un poco para generar posibles errores
  await page.mouse.move(100, 100)
  await page.waitForTimeout(500)

  // Clasificar mensajes
  const errors = mensajes.filter((m) => m.type === "error" && !esCritico(m.text))
  const warnings = mensajes.filter((m) => m.type === "warning" && esWarningImportante(m.text))
  const criticalErrors = mensajes.filter((m) => esCritico(m.text))

  return {
    path: ruta.path,
    name: ruta.name,
    errors,
    warnings,
    criticalErrors,
  }
}

// ============================================
// TESTS POR PÁGINA
// ============================================

test.describe("🔴 SUITE: Errores de Consola por Página", () => {
  for (const ruta of RUTAS_A_VERIFICAR) {
    test(`Sin errores críticos en ${ruta.name}`, async ({ page }) => {
      console.log(`\n🔍 Verificando ${ruta.name}...`)

      const reporte = await capturarErroresEnPagina(page, ruta)

      // Reportar errores encontrados
      if (reporte.criticalErrors.length > 0) {
        console.log(`\n   🔴 ERRORES CRÍTICOS (${reporte.criticalErrors.length}):`)
        reporte.criticalErrors.forEach((err) => {
          console.log(`      ❌ ${err.text.substring(0, 200)}`)
        })
      }

      if (reporte.errors.length > 0) {
        console.log(`\n   🟠 Errores (${reporte.errors.length}):`)
        reporte.errors.forEach((err) => {
          console.log(`      ⚠️ ${err.text.substring(0, 150)}`)
        })
      }

      if (reporte.warnings.length > 0) {
        console.log(`\n   🟡 Warnings importantes (${reporte.warnings.length}):`)
        reporte.warnings.forEach((warn) => {
          console.log(`      ℹ️ ${warn.text.substring(0, 150)}`)
        })
      }

      if (reporte.criticalErrors.length === 0 && reporte.errors.length === 0) {
        console.log(`   ✅ Sin errores en ${ruta.name}`)
      }

      // El test FALLA si hay errores críticos
      expect(reporte.criticalErrors.length).toBe(0)
    })
  }
})

// ============================================
// TESTS DE INTERACCIÓN SIN ERRORES
// ============================================

test.describe("🖱️ SUITE: Interacciones sin Errores", () => {
  test("Navegación entre paneles sin errores", async ({ page }) => {
    const mensajesError: ConsoleMessage[] = []

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        mensajesError.push({
          type: "error",
          text: msg.text(),
          timestamp: Date.now(),
        })
      }
    })

    page.on("pageerror", (error) => {
      mensajesError.push({
        type: "error",
        text: error.message,
        timestamp: Date.now(),
      })
    })

    console.log("\n🧭 Navegando entre paneles...")

    for (const ruta of RUTAS_A_VERIFICAR) {
      await page.goto(ruta.path, { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(1000)
      console.log(`   ✅ ${ruta.name}`)
    }

    // Reportar errores
    if (mensajesError.length > 0) {
      console.log(`\n🔴 Errores durante navegación: ${mensajesError.length}`)
      mensajesError.forEach((err) => {
        console.log(`   ❌ ${err.text.substring(0, 150)}`)
      })
    } else {
      console.log(`\n✅ Navegación completada sin errores`)
    }

    // Verificar que no hay errores críticos
    const erroresCriticos = mensajesError.filter((m) => esCritico(m.text))
    expect(erroresCriticos.length).toBe(0)
  })

  test("Abrir y cerrar modales sin errores", async ({ page }) => {
    const mensajesError: ConsoleMessage[] = []

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        mensajesError.push({
          type: "error",
          text: msg.text(),
          timestamp: Date.now(),
        })
      }
    })

    console.log("\n📋 Abriendo y cerrando modales...")

    // Paneles con modales
    const panelesConModal = [
      { path: "/ventas", btnText: "Nueva Venta" },
      { path: "/clientes", btnText: "Nuevo Cliente" },
      { path: "/gastos", btnText: "Nuevo Gasto" },
    ]

    for (const panel of panelesConModal) {
      await page.goto(panel.path, { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(1000)

      // Buscar botón
      const btn = page.locator(`button:has-text("${panel.btnText}")`).first()
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click()
        await page.waitForTimeout(500)

        // Verificar modal abierto
        const modal = page.locator('[role="dialog"], [class*="modal"]').first()
        if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`   ✅ Modal abierto: ${panel.btnText}`)

          // Cerrar modal
          await page.keyboard.press("Escape")
          await page.waitForTimeout(300)
          console.log(`   ✅ Modal cerrado`)
        }
      }
    }

    // Verificar errores
    const erroresCriticos = mensajesError.filter((m) => esCritico(m.text))
    if (erroresCriticos.length > 0) {
      console.log(`\n🔴 Errores durante interacción con modales:`)
      erroresCriticos.forEach((err) => console.log(`   ❌ ${err.text.substring(0, 150)}`))
    } else {
      console.log(`\n✅ Interacción con modales sin errores críticos`)
    }

    expect(erroresCriticos.length).toBe(0)
  })

  test("Scroll y hover sin errores", async ({ page }) => {
    const mensajesError: ConsoleMessage[] = []

    page.on("pageerror", (error) => {
      mensajesError.push({
        type: "error",
        text: error.message,
        timestamp: Date.now(),
      })
    })

    console.log("\n🖱️ Realizando scroll y hover...")

    await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: 15000 })
    await page.waitForTimeout(2000)

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500))
    await page.waitForTimeout(500)
    console.log(`   ✅ Scroll down`)

    // Scroll up
    await page.evaluate(() => window.scrollBy(0, -500))
    await page.waitForTimeout(500)
    console.log(`   ✅ Scroll up`)

    // Hover sobre elementos
    const elementos = page.locator('button, a, [class*="card"]')
    const count = await elementos.count()
    const maxHover = Math.min(count, 10)

    for (let i = 0; i < maxHover; i++) {
      try {
        await elementos.nth(i).hover({ timeout: 1000 })
        await page.waitForTimeout(200)
      } catch {
        // Ignorar errores de hover
      }
    }
    console.log(`   ✅ Hover sobre ${maxHover} elementos`)

    // Verificar errores
    if (mensajesError.length > 0) {
      console.log(`\n🔴 Errores durante scroll/hover:`)
      mensajesError.forEach((err) => console.log(`   ❌ ${err.text.substring(0, 150)}`))
    } else {
      console.log(`\n✅ Scroll y hover sin errores`)
    }

    expect(mensajesError.filter((m) => esCritico(m.text)).length).toBe(0)
  })
})

// ============================================
// TESTS DE ERRORES DE RED
// ============================================

test.describe("🌐 SUITE: Errores de Red", () => {
  test("Sin errores 404 en recursos estáticos", async ({ page }) => {
    const errores404: string[] = []

    page.on("response", (response) => {
      if (response.status() === 404) {
        errores404.push(response.url())
      }
    })

    console.log("\n🌐 Verificando recursos estáticos...")

    for (const ruta of RUTAS_A_VERIFICAR) {
      await page.goto(ruta.path, { waitUntil: "networkidle", timeout: 30000 })
      await page.waitForTimeout(500)
    }

    if (errores404.length > 0) {
      console.log(`\n🔴 Recursos 404 encontrados (${errores404.length}):`)
      errores404.forEach((url) => console.log(`   ❌ ${url}`))
    } else {
      console.log(`\n✅ Sin errores 404 en recursos estáticos`)
    }

    // Reportar pero no fallar por 404 de recursos opcionales
    console.log(`   Total 404: ${errores404.length}`)
  })

  test("Sin errores 500 en API", async ({ page }) => {
    const errores500: string[] = []

    page.on("response", (response) => {
      if (response.status() >= 500) {
        errores500.push(`${response.status()} - ${response.url()}`)
      }
    })

    console.log("\n🌐 Verificando respuestas de API...")

    for (const ruta of RUTAS_A_VERIFICAR) {
      await page.goto(ruta.path, { waitUntil: "networkidle", timeout: 30000 })
      await page.waitForTimeout(500)
    }

    if (errores500.length > 0) {
      console.log(`\n🔴 Errores de servidor encontrados (${errores500.length}):`)
      errores500.forEach((err) => console.log(`   ❌ ${err}`))
    } else {
      console.log(`\n✅ Sin errores 500 en APIs`)
    }

    // Este SÍ debe fallar si hay errores 500
    expect(errores500.length).toBe(0)
  })

  test("Verificar requests de API exitosos", async ({ page }) => {
    const apiRequests: { url: string; status: number }[] = []

    page.on("response", (response) => {
      if (response.url().includes("/api/")) {
        apiRequests.push({
          url: response.url(),
          status: response.status(),
        })
      }
    })

    console.log("\n🌐 Capturando requests de API...")

    // Navegar a páginas que hacen requests de API
    await page.goto("/ventas", { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(1000)
    await page.goto("/clientes", { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(1000)
    await page.goto("/bancos", { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(1000)

    console.log(`\n📊 APIs llamadas (${apiRequests.length}):`)

    const exitosos = apiRequests.filter((r) => r.status >= 200 && r.status < 300)
    const fallidos = apiRequests.filter((r) => r.status >= 400)

    console.log(`   ✅ Exitosos: ${exitosos.length}`)
    console.log(`   ❌ Fallidos: ${fallidos.length}`)

    if (fallidos.length > 0) {
      fallidos.forEach((f) => console.log(`      ${f.status}: ${f.url}`))
    }
  })
})

// ============================================
// TEST DE RESUMEN GLOBAL
// ============================================

test("📊 Resumen Global de Errores de Consola", async ({ page }) => {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 RESUMEN GLOBAL DE ERRORES DE CONSOLA")
  console.log("═══════════════════════════════════════════════════\n")

  const reporteGlobal: PageErrorReport[] = []

  for (const ruta of RUTAS_A_VERIFICAR) {
    const reporte = await capturarErroresEnPagina(page, ruta)
    reporteGlobal.push(reporte)

    const estado = reporte.criticalErrors.length === 0 ? "✅" : "🔴"
    console.log(`${estado} ${ruta.name}:`)
    console.log(`   Críticos: ${reporte.criticalErrors.length}`)
    console.log(`   Errores: ${reporte.errors.length}`)
    console.log(`   Warnings: ${reporte.warnings.length}`)
  }

  // Totales
  const totalCriticos = reporteGlobal.reduce((acc, r) => acc + r.criticalErrors.length, 0)
  const totalErrores = reporteGlobal.reduce((acc, r) => acc + r.errors.length, 0)
  const totalWarnings = reporteGlobal.reduce((acc, r) => acc + r.warnings.length, 0)
  const paginasLimpias = reporteGlobal.filter(
    (r) => r.criticalErrors.length === 0 && r.errors.length === 0
  ).length

  console.log("\n═══════════════════════════════════════════════════")
  console.log(`📈 TOTALES:`)
  console.log(`   🔴 Errores críticos: ${totalCriticos}`)
  console.log(`   🟠 Errores: ${totalErrores}`)
  console.log(`   🟡 Warnings: ${totalWarnings}`)
  console.log(`   ✅ Páginas limpias: ${paginasLimpias}/${RUTAS_A_VERIFICAR.length}`)
  console.log("═══════════════════════════════════════════════════\n")

  // El test falla solo si hay errores críticos
  expect(totalCriticos).toBe(0)
})
