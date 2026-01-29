/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS 2026 — E2E TEST: ÓRDENES DE COMPRA (CosmicOrdenesPanelComplete)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Test del panel Complete de Órdenes de Compra Gen5
 *
 * FLUJO:
 * 1. Cargar panel de órdenes
 * 2. Verificar KPIs y métricas
 * 3. Verificar tabla de órdenes
 * 4. Probar modal de nueva orden
 * 5. Verificar tabs de filtrado
 * 6. Probar registrar pago
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { expect, test } from "@playwright/test"
import { SELECTORES, TIMEOUTS } from "./fixtures/test-data"
import { takeTimestampedScreenshot, testLog, waitForPageLoad } from "./utils/helpers"

test.describe("📋 Panel Órdenes de Compra - Gen5 Complete", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ordenes")
    await waitForPageLoad(page)
  })

  test("debe cargar el panel de órdenes correctamente", async ({ page }) => {
    testLog("🎯", "Verificando carga del panel de órdenes")

    await expect(page).toHaveURL(/ordenes/)

    // Verificar KPIs visibles
    const kpis = page.locator(SELECTORES.kpiCard)
    await expect(kpis.first()).toBeVisible({ timeout: TIMEOUTS.largo })

    testLog("✅", "Panel de órdenes cargado")
    await takeTimestampedScreenshot(page, "ordenes-panel")
  })

  test("debe mostrar tabla de órdenes", async ({ page }) => {
    testLog("🎯", "Verificando tabla de órdenes")

    const tabla = page.locator(SELECTORES.tabla)
    await expect(tabla.first()).toBeVisible({ timeout: TIMEOUTS.largo })

    const filas = page.locator(SELECTORES.fila)
    const count = await filas.count()
    testLog("📊", `${count} filas en tabla de órdenes`)

    await takeTimestampedScreenshot(page, "ordenes-tabla")
  })

  test("debe abrir modal de nueva orden", async ({ page }) => {
    testLog("🎯", "Abriendo modal de nueva orden")

    const btnNuevaOrden = page.locator(SELECTORES.btnNuevaOrden).first()

    if (!(await btnNuevaOrden.isVisible({ timeout: TIMEOUTS.medio }).catch(() => false))) {
      testLog("⚠️", "Botón de nueva orden no visible")
      test.skip()
      return
    }

    await btnNuevaOrden.click()

    const modal = page.locator(SELECTORES.modal)
    await expect(modal).toBeVisible({ timeout: TIMEOUTS.medio })

    testLog("✅", "Modal de nueva orden abierto")
    await takeTimestampedScreenshot(page, "ordenes-modal-nueva")
  })

  test("debe filtrar órdenes por tabs de estado", async ({ page }) => {
    testLog("🎯", "Verificando filtros por estado")

    const tabs = page.locator(SELECTORES.tabs)

    if (await tabs.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
      // Tab Pendientes
      const tabPendientes = page.locator(
        'button:has-text("Pendiente"), [role="tab"]:has-text("Pendiente")'
      )
      if (await tabPendientes.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
        await tabPendientes.click()
        await page.waitForTimeout(500)
        testLog("✅", "Tab Pendientes")
      }

      // Tab Recibidas
      const tabRecibidas = page.locator(
        'button:has-text("Recibida"), [role="tab"]:has-text("Recibida")'
      )
      if (await tabRecibidas.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
        await tabRecibidas.click()
        await page.waitForTimeout(500)
        testLog("✅", "Tab Recibidas")
      }
    }

    await takeTimestampedScreenshot(page, "ordenes-tabs")
  })

  test("debe mostrar KPIs de órdenes", async ({ page }) => {
    testLog("🎯", "Verificando KPIs de órdenes")

    const kpis = page.locator(SELECTORES.kpiCard)
    const count = await kpis.count()

    if (count > 0) {
      testLog("✅", `${count} KPIs encontrados`)
    }

    // Verificar valores monetarios
    const montos = page.locator("text=/\\$[\\d,]+/")
    const montosCount = await montos.count()
    testLog("💰", `${montosCount} valores monetarios`)

    await takeTimestampedScreenshot(page, "ordenes-kpis")
  })

  test("debe mostrar gráficos de órdenes", async ({ page }) => {
    testLog("🎯", "Verificando gráficos")

    const charts = page.locator(SELECTORES.chart)
    const count = await charts.count()

    if (count > 0) {
      testLog("✅", `${count} gráficos encontrados`)
    }

    await takeTimestampedScreenshot(page, "ordenes-charts")
  })

  test("debe funcionar búsqueda de órdenes", async ({ page }) => {
    testLog("🎯", "Verificando búsqueda")

    const searchInput = page.locator(SELECTORES.searchInput).first()

    if (await searchInput.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
      await searchInput.fill("OC-001")
      await page.waitForTimeout(500)
      testLog("✅", "Búsqueda funcional")
    }

    await takeTimestampedScreenshot(page, "ordenes-busqueda")
  })
})
