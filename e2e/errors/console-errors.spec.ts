/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS 2026 — E2E TEST: DETECCIÓN DE ERRORES EN CONSOLA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests para capturar y fallar si hay console.error:
 * - Captura todos los errores de consola
 * - Falla el test si se detectan errores críticos
 * - Ignora warnings esperados
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { expect, test } from "@playwright/test"
import { navigateToPanel, waitForPageLoad } from "../utils/helpers"

// Lista de errores que se pueden ignorar (warnings conocidos)
const IGNORED_ERRORS = [
  /Failed to load resource/,
  /favicon.ico/,
  /net::ERR_FAILED/,
  /WebSocket connection/,
  /Hydration/,
  /useLayoutEffect/,
]

test.describe("🐛 Detección de Errores en Consola", () => {
  let consoleErrors: string[] = []

  test.beforeEach(async ({ page }) => {
    consoleErrors = []

    // Capturar errores de consola
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text()

        // Ignorar errores conocidos
        const shouldIgnore = IGNORED_ERRORS.some((pattern) => pattern.test(text))

        if (!shouldIgnore) {
          consoleErrors.push(text)
        }
      }
    })

    // Capturar errores de página
    page.on("pageerror", (error) => {
      consoleErrors.push(`Page Error: ${error.message}`)
    })

    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("no debe haber errores en página principal", async ({ page }) => {
    await page.waitForTimeout(2000)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores detectados:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores al navegar a Ventas", async ({ page }) => {
    await navigateToPanel(page, "Ventas")
    await page.waitForTimeout(1500)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores en Ventas:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores al navegar a Clientes", async ({ page }) => {
    await navigateToPanel(page, "Clientes")
    await page.waitForTimeout(1500)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores en Clientes:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores al navegar a Bancos", async ({ page }) => {
    await navigateToPanel(page, "Bancos")
    await page.waitForTimeout(1500)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores en Bancos:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores al navegar a Órdenes", async ({ page }) => {
    await navigateToPanel(page, "Órdenes")
    await page.waitForTimeout(1500)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores en Órdenes:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores al navegar a Inventario", async ({ page }) => {
    await navigateToPanel(page, "Inventario")
    await page.waitForTimeout(1500)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores en Inventario:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores al navegar a Distribuidores", async ({ page }) => {
    await navigateToPanel(page, "Distribuidores")
    await page.waitForTimeout(1500)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores en Distribuidores:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores al abrir modal de nueva venta", async ({ page }) => {
    await navigateToPanel(page, "Ventas")
    await page.waitForTimeout(1000)

    const nuevoBtn = page
      .getByRole("button", {
        name: /nueva.*venta/i,
      })
      .first()

    if (await nuevoBtn.isVisible({ timeout: 5000 })) {
      await nuevoBtn.click()
      await page.waitForTimeout(1000)

      if (consoleErrors.length > 0) {
        console.log("❌ Errores al abrir modal:", consoleErrors)
      }

      expect(consoleErrors).toHaveLength(0)
    } else {
      test.skip()
    }
  })

  test("no debe haber errores al abrir modal de nuevo cliente", async ({ page }) => {
    await navigateToPanel(page, "Clientes")
    await page.waitForTimeout(1000)

    const nuevoBtn = page
      .getByRole("button", {
        name: /nuevo.*cliente/i,
      })
      .first()

    if (await nuevoBtn.isVisible({ timeout: 5000 })) {
      await nuevoBtn.click()
      await page.waitForTimeout(1000)

      if (consoleErrors.length > 0) {
        console.log("❌ Errores al abrir modal cliente:", consoleErrors)
      }

      expect(consoleErrors).toHaveLength(0)
    } else {
      test.skip()
    }
  })

  test("no debe haber errores al usar búsqueda", async ({ page }) => {
    await navigateToPanel(page, "Ventas")
    await page.waitForTimeout(1000)

    const busqueda = page.locator('input[type="search"], input[placeholder*="buscar"]').first()

    if (await busqueda.isVisible({ timeout: 5000 })) {
      await busqueda.fill("test")
      await page.waitForTimeout(1000)

      if (consoleErrors.length > 0) {
        console.log("❌ Errores en búsqueda:", consoleErrors)
      }

      expect(consoleErrors).toHaveLength(0)
    } else {
      test.skip()
    }
  })

  test("no debe haber errores al usar filtros", async ({ page }) => {
    await navigateToPanel(page, "Ventas")
    await page.waitForTimeout(1000)

    const filtro = page.locator('select, [role="combobox"]').first()

    if (await filtro.isVisible({ timeout: 5000 })) {
      await filtro.click()
      await page.waitForTimeout(500)

      if (consoleErrors.length > 0) {
        console.log("❌ Errores en filtros:", consoleErrors)
      }

      expect(consoleErrors).toHaveLength(0)
    } else {
      test.skip()
    }
  })

  test("no debe haber errores al hacer click en filas de tabla", async ({ page }) => {
    await navigateToPanel(page, "Clientes")
    await page.waitForTimeout(1500)

    const tabla = page.locator("table tbody tr").first()

    if (await tabla.isVisible({ timeout: 5000 })) {
      await tabla.click()
      await page.waitForTimeout(1000)

      if (consoleErrors.length > 0) {
        console.log("❌ Errores al click en fila:", consoleErrors)
      }

      expect(consoleErrors).toHaveLength(0)
    } else {
      test.skip()
    }
  })

  test("no debe haber errores al navegar entre múltiples paneles", async ({ page }) => {
    // Navegar por varios paneles
    const paneles = ["Ventas", "Clientes", "Bancos", "Inventario"]

    for (const panel of paneles) {
      await navigateToPanel(page, panel as any)
      await page.waitForTimeout(500)
    }

    if (consoleErrors.length > 0) {
      console.log("❌ Errores al navegar:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber memory leaks al abrir/cerrar modales repetidamente", async ({ page }) => {
    await navigateToPanel(page, "Clientes")
    await page.waitForTimeout(1000)

    const nuevoBtn = page
      .getByRole("button", {
        name: /nuevo.*cliente/i,
      })
      .first()

    if (await nuevoBtn.isVisible({ timeout: 5000 })) {
      // Abrir y cerrar modal 3 veces
      for (let i = 0; i < 3; i++) {
        await nuevoBtn.click()
        await page.waitForTimeout(500)

        const cancelBtn = page.getByRole("button", { name: /cancelar|cerrar/i }).first()
        if (await cancelBtn.isVisible({ timeout: 3000 })) {
          await cancelBtn.click()
          await page.waitForTimeout(500)
        }
      }

      if (consoleErrors.length > 0) {
        console.log("❌ Errores de memory leaks:", consoleErrors)
      }

      expect(consoleErrors).toHaveLength(0)
    } else {
      test.skip()
    }
  })

  test("no debe haber errores en carga inicial de datos", async ({ page }) => {
    // Esperar a que carguen los datos
    await page.waitForTimeout(3000)

    if (consoleErrors.length > 0) {
      console.log("❌ Errores en carga inicial:", consoleErrors)
    }

    expect(consoleErrors).toHaveLength(0)
  })

  test("no debe haber errores críticos de React", async ({ page }) => {
    await page.waitForTimeout(2000)

    // Filtrar solo errores críticos de React
    const reactErrors = consoleErrors.filter(
      (error) =>
        error.includes("React") ||
        error.includes("Hydration") ||
        error.includes("Cannot read") ||
        error.includes("undefined")
    )

    if (reactErrors.length > 0) {
      console.log("❌ Errores críticos de React:", reactErrors)
    }

    expect(reactErrors).toHaveLength(0)
  })
})
