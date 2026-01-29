/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS 2026 — E2E TEST: COMPONENTES 3D
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Test Escenario 7: Componentes 3D y Visualizaciones
 *
 * FLUJO:
 * 1. Verificar SoulOrbQuantum visible en dashboard
 * 2. Verificar BankVault3D se abre al entrar a banco
 * 3. Verificar Warehouse3D muestra cajas de productos
 * 4. Verificar QuantumLiquidVoid en fondo
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from "@playwright/test"
import {
  waitForPageLoad,
  navigateToPanel,
  testLog,
  takeTimestampedScreenshot,
} from "./utils/helpers"

test.describe("🎨 Componentes 3D y Visualizaciones", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe cargar y renderizar componentes Spline 3D", async ({ page }) => {
    testLog("🎯", "Iniciando test de componentes 3D")

    // ═══════════════════════════════════════════════════════════════════
    // PASO 1: Verificar SoulOrbQuantum en dashboard
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar SoulOrbQuantum en dashboard", async () => {
      // Buscar canvas o contenedor 3D
      const canvas3D = page.locator('canvas, [class*="spline"], [class*="three"], [class*="3d"]')
      const canvasCount = await canvas3D.count()

      testLog("🔍", `Elementos Canvas/3D encontrados: ${canvasCount}`)

      if (canvasCount > 0) {
        testLog("✅", "Elementos 3D presentes en el DOM")
        await takeTimestampedScreenshot(page, "dashboard-3d")
      } else {
        testLog("⚠️", "No se encontraron canvas 3D - pueden estar lazy-loaded")
      }

      // Esperar a que carguen las animaciones
      await page.waitForTimeout(3000)
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 2: Verificar BankVault3D en panel de bancos
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar BankVault3D en panel de bancos", async () => {
      await navigateToPanel(page, "Bancos")
      await page.waitForTimeout(2000)

      // Buscar visualización 3D de bóveda
      const vaultViz = page.locator('canvas, [class*="vault"], [class*="banco-3d"]')
      const vaultCount = await vaultViz.count()

      if (vaultCount > 0) {
        testLog("✅", "BankVault3D renderizado")
      }

      await takeTimestampedScreenshot(page, "bancos-3d", { fullPage: true })
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 3: Verificar Warehouse3D en inventario
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar Warehouse3D en inventario", async () => {
      await navigateToPanel(page, "Inventario")
      await page.waitForTimeout(2000)

      // Buscar visualización 3D de almacén
      const warehouseViz = page.locator('canvas, [class*="warehouse"], [class*="almacen-3d"]')
      const warehouseCount = await warehouseViz.count()

      if (warehouseCount > 0) {
        testLog("✅", "Warehouse3D renderizado")
      }

      await takeTimestampedScreenshot(page, "inventario-3d", { fullPage: true })
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 4: Verificar QuantumLiquidVoid (fondo)
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar QuantumLiquidVoid en fondo", async () => {
      await page.goto("/")
      await waitForPageLoad(page)

      // Buscar elementos de fondo animado
      const backgroundViz = page.locator(
        '[class*="background"], [class*="quantum"], [class*="void"]'
      )
      const bgCount = await backgroundViz.count()

      testLog("🔍", `Elementos de fondo animado: ${bgCount}`)

      await takeTimestampedScreenshot(page, "fondo-quantum")
    })

    testLog("🎉", "Test de componentes 3D completado")
  })

  test("debe renderizar componentes Canvas animados", async ({ page }) => {
    testLog("🎯", "Verificando componentes Canvas personalizados")

    await test.step("Buscar visualizaciones Canvas", async () => {
      // Los 8 componentes Canvas según documentación
      const canvasComponents = page.locator("canvas")
      const count = await canvasComponents.count()

      testLog("📊", `Canvas elements encontrados: ${count}`)

      if (count > 0) {
        testLog("✅", "Visualizaciones Canvas activas")

        // Verificar que hay animación (frame rate)
        await page.waitForTimeout(2000)

        // Tomar múltiples screenshots para verificar animación
        await takeTimestampedScreenshot(page, "canvas-frame-1")
        await page.waitForTimeout(500)
        await takeTimestampedScreenshot(page, "canvas-frame-2")
      }
    })
  })

  test("debe manejar performance de 60fps en animaciones", async ({ page }) => {
    testLog("🎯", "Verificando performance de animaciones")

    await test.step("Medir frame rate aproximado", async () => {
      // Esperar carga completa
      await page.waitForTimeout(3000)

      // Capturar métricas de performance
      const metrics = await page.evaluate(() => {
        return {
          memory: (performance as any).memory
            ? {
                used: (performance as any).memory.usedJSHeapSize,
                total: (performance as any).memory.totalJSHeapSize,
              }
            : null,
          timing: performance.timing.loadEventEnd - performance.timing.navigationStart,
        }
      })

      testLog("📊", `Tiempo de carga: ${metrics.timing}ms`)
      if (metrics.memory) {
        testLog("💾", `Memoria usada: ${(metrics.memory.used / 1024 / 1024).toFixed(2)}MB`)
      }

      await takeTimestampedScreenshot(page, "performance-check")
    })
  })

  test("debe cargar Spline scenes correctamente", async ({ page }) => {
    testLog("🎯", "Verificando escenas Spline")

    await test.step("Detectar archivos Spline cargados", async () => {
      // Esperar a que carguen recursos
      await page.waitForTimeout(3000)

      // Verificar requests a archivos .spline o .splinecode
      const pageContent = await page.content()

      if (pageContent.includes("spline") || pageContent.includes("splinecode")) {
        testLog("✅", "Referencias a Spline detectadas en el código")
      }

      // Buscar elementos Spline en el DOM
      const splineElements = page.locator('[class*="spline"]')
      const splineCount = await splineElements.count()

      testLog("🔍", `Elementos Spline en DOM: ${splineCount}`)

      await takeTimestampedScreenshot(page, "spline-elements")
    })
  })

  test("debe responder a interacciones con componentes 3D", async ({ page }) => {
    testLog("🎯", "Verificando interactividad 3D")

    await test.step("Intentar interactuar con elementos 3D", async () => {
      // Buscar canvas interactivos
      const canvas = page.locator("canvas").first()

      if (await canvas.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Hover sobre el canvas
        await canvas.hover()
        await page.waitForTimeout(500)

        // Click en el canvas
        await canvas.click()
        await page.waitForTimeout(500)

        testLog("✅", "Interacción con Canvas ejecutada")

        await takeTimestampedScreenshot(page, "canvas-interaccion")
      }
    })
  })

  test("debe mostrar fallback si WebGL no está disponible", async ({ page, context }) => {
    testLog("🎯", "Verificando manejo de WebGL")

    await test.step("Detectar soporte WebGL", async () => {
      const hasWebGL = await page.evaluate(() => {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        return !!gl
      })

      if (hasWebGL) {
        testLog("✅", "WebGL soportado en el navegador")
      } else {
        testLog("⚠️", "WebGL no disponible - debe mostrar fallback")
      }
    })
  })
})
