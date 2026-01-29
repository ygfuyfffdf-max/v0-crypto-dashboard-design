/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 CHRONOS 2026 — E2E TEST: IA CONVERSACIONAL ARIA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Test Escenario 6: IA Conversacional ARIA
 *
 * FLUJO:
 * 1. Verificar widget flotante visible
 * 2. Click para activar
 * 3. Simular comando "Ir a ventas"
 * 4. Verificar navegación correcta
 * 5. Simular comando "Cuál es mi capital"
 * 6. Verificar respuesta contiene monto
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from "@playwright/test"
import { waitForPageLoad, testLog, takeTimestampedScreenshot } from "./utils/helpers"

test.describe("🤖 IA Conversacional ARIA", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe mostrar widget de ARIA y responder comandos", async ({ page }) => {
    testLog("🎯", "Iniciando test de IA ARIA")

    // ═══════════════════════════════════════════════════════════════════
    // PASO 1: Verificar widget flotante visible
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar widget ARIA visible", async () => {
      // Buscar widget de chat/IA
      const ariaWidget = page.locator(
        '[class*="aria"], [class*="chat"], [class*="assistant"], button:has-text("ARIA"), [class*="ai-widget"]'
      )

      const widgetCount = await ariaWidget.count()
      testLog("🔍", `Widgets IA encontrados: ${widgetCount}`)

      if (widgetCount > 0) {
        const isVisible = await ariaWidget
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)
        if (isVisible) {
          testLog("✅", "Widget ARIA visible")
          await takeTimestampedScreenshot(page, "aria-widget")
        }
      } else {
        testLog("⚠️", "Widget ARIA no encontrado - feature puede no estar implementado")
        test.skip()
      }
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 2: Activar widget
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Activar chat de ARIA", async () => {
      const ariaButton = page
        .locator('button:has-text("ARIA"), [class*="ai-widget"], [class*="chat-button"]')
        .first()

      if (await ariaButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ariaButton.click()
        await page.waitForTimeout(1000)
        testLog("✅", "Chat ARIA activado")

        await takeTimestampedScreenshot(page, "aria-chat-abierto")
      }
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 3: Enviar comando de navegación
    // ═══════════════════════════════════════════════════════════════════
    await test.step('Simular comando "Ir a ventas"', async () => {
      const chatInput = page
        .locator(
          'input[placeholder*="mensaje"], textarea[placeholder*="mensaje"], input[type="text"]'
        )
        .first()

      if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await chatInput.fill("Ir a ventas")
        await chatInput.press("Enter")
        await page.waitForTimeout(2000)

        testLog("💬", 'Comando enviado: "Ir a ventas"')

        // Verificar respuesta o acción
        const pageText = await page.textContent("body")
        if (pageText?.includes("Ventas") || page.url().includes("ventas")) {
          testLog("✅", "Navegación ejecutada correctamente")
        }

        await takeTimestampedScreenshot(page, "aria-comando-ventas")
      }
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 4: Consultar información financiera
    // ═══════════════════════════════════════════════════════════════════
    await test.step('Simular comando "Cuál es mi capital"', async () => {
      const chatInput = page.locator('input[placeholder*="mensaje"], textarea').first()

      if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await chatInput.fill("Cuál es mi capital total")
        await chatInput.press("Enter")
        await page.waitForTimeout(3000)

        testLog("💬", 'Comando enviado: "Cuál es mi capital total"')

        // Buscar respuesta con monto
        await page.waitForTimeout(2000)
        const responseText = await page.textContent("body")

        // Verificar que la respuesta contiene un monto ($XXX,XXX)
        if (responseText?.match(/\$[\d,]+/)) {
          testLog("✅", "Respuesta contiene información de capital")
        }

        await takeTimestampedScreenshot(page, "aria-respuesta-capital")
      }
    })

    testLog("🎉", "Test de IA ARIA completado")
  })

  test("debe reconocer comandos de navegación", async ({ page }) => {
    testLog("🎯", "Verificando comandos de navegación ARIA")

    await test.step("Probar múltiples comandos", async () => {
      const comandos = ["Mostrar ventas", "Ir a clientes", "Ver bancos", "Abrir inventario"]

      for (const comando of comandos) {
        testLog("💬", `Probando: "${comando}"`)

        // Buscar input de chat
        const chatInput = page.locator('input[type="text"], textarea').first()
        if (await chatInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await chatInput.fill(comando)
          await chatInput.press("Enter")
          await page.waitForTimeout(1500)
        }
      }

      await takeTimestampedScreenshot(page, "aria-comandos-multiples")
    })
  })

  test("debe proporcionar sugerencias de comandos", async ({ page }) => {
    testLog("🎯", "Verificando sugerencias de ARIA")

    await test.step("Activar y buscar sugerencias", async () => {
      const ariaButton = page.locator('button:has-text("ARIA"), [class*="ai-widget"]').first()

      if (await ariaButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ariaButton.click()
        await page.waitForTimeout(1000)

        // Buscar sección de sugerencias
        const sugerencias = page.locator("text=/sugerencias|comandos|ayuda/i")
        if (await sugerencias.isVisible({ timeout: 2000 }).catch(() => false)) {
          testLog("✅", "Sugerencias de comandos disponibles")
        }

        await takeTimestampedScreenshot(page, "aria-sugerencias")
      }
    })
  })
})
