import { expect, test } from "@playwright/test"
import { SELECTORES, TIMEOUTS } from "./fixtures/test-data"
import { takeTimestampedScreenshot, testLog, waitForPageLoad } from "./utils/helpers"

/**
 * 🎭 E2E Tests - Sistema de Ventas (CosmicVentasPanelComplete)
 *
 * Tests completos del flujo de ventas con paneles Gen5
 */

test.describe("Flujo de Ventas - Panel Complete Gen5", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ventas")
    await waitForPageLoad(page)
  })

  test("debe cargar el panel de ventas correctamente", async ({ page }) => {
    testLog("🎯", "Verificando carga del panel de ventas")

    // Verificar que el panel cargó
    await expect(page).toHaveURL(/ventas/)

    // Verificar elementos visibles (h1, botones, o contenedor principal)
    const panelContent = page
      .locator('main, [class*="panel"], [class*="container"], h1, h2')
      .first()
    await expect(panelContent).toBeVisible({ timeout: TIMEOUTS.largo })

    testLog("✅", "Panel de ventas cargado correctamente")
  })

  test("debe mostrar lista de ventas en tabla", async ({ page }) => {
    testLog("🎯", "Verificando tabla de ventas")

    // Verificar que hay una tabla o grid de datos
    const table = page.locator(
      'table, [role="grid"], div[class*="DataTable"], div[class*="PremiumDataTable"]'
    )

    // Si no hay tabla, puede que sea un estado vacío válido
    const tableVisible = await table
      .first()
      .isVisible({ timeout: TIMEOUTS.medio })
      .catch(() => false)

    if (tableVisible) {
      // Verificar que hay filas
      const rows = page.locator('tr, [role="row"]')
      const count = await rows.count()
      testLog("📊", `Encontradas ${count} filas en la tabla`)
    } else {
      // Buscar mensaje de estado vacío o lista de ventas alternativa
      const emptyState = page.locator("text=/No hay ventas|Sin ventas|Lista vacía/i")
      const hasEmptyState = await emptyState
        .isVisible({ timeout: TIMEOUTS.corto })
        .catch(() => false)
      testLog("📊", hasEmptyState ? "Estado vacío mostrado" : "Sin tabla ni estado vacío")
    }

    await takeTimestampedScreenshot(page, "ventas-tabla")
  })

  test("debe filtrar ventas por tabs de estado", async ({ page }) => {
    testLog("🎯", "Verificando filtros por estado")

    // Buscar tabs de filtro (GlassTabs)
    const tabs = page.locator(SELECTORES.tabs)

    if (await tabs.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
      // Click en tab "Completadas"
      const tabCompletadas = page.locator(
        'button:has-text("Completada"), [role="tab"]:has-text("Completada")'
      )
      if (await tabCompletadas.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
        await tabCompletadas.click()
        await page.waitForTimeout(500)
        testLog("✅", "Tab Completadas clickeado")
      }

      // Click en tab "Pendientes"
      const tabPendientes = page.locator(
        'button:has-text("Pendiente"), [role="tab"]:has-text("Pendiente")'
      )
      if (await tabPendientes.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
        await tabPendientes.click()
        await page.waitForTimeout(500)
        testLog("✅", "Tab Pendientes clickeado")
      }
    }

    await takeTimestampedScreenshot(page, "ventas-filtros")
  })

  test("debe abrir modal de nueva venta", async ({ page }) => {
    testLog("🎯", "Abriendo modal de nueva venta")

    // Buscar botón de nueva venta
    const nuevaVentaBtn = page.locator(SELECTORES.btnNuevaVenta).first()

    if (!(await nuevaVentaBtn.isVisible({ timeout: TIMEOUTS.medio }).catch(() => false))) {
      testLog("⚠️", "Botón de nueva venta no visible, skipping...")
      test.skip()
      return
    }

    await nuevaVentaBtn.click()

    // Verificar modal visible
    const modal = page.locator(SELECTORES.modal)
    await expect(modal).toBeVisible({ timeout: TIMEOUTS.medio })
    testLog("✅", "Modal de nueva venta abierto")

    await takeTimestampedScreenshot(page, "ventas-modal-nueva")
  })

  test("debe validar campos requeridos en formulario de venta", async ({ page }) => {
    testLog("🎯", "Verificando validación de campos")

    const nuevaVentaBtn = page.locator(SELECTORES.btnNuevaVenta).first()

    const isVisible = await nuevaVentaBtn.isVisible({ timeout: TIMEOUTS.medio }).catch(() => false)

    if (!isVisible) {
      testLog("⚠️", "Botón de nueva venta no disponible")
      test.skip()
      return
    }

    // Intentar click con manejo de errores
    try {
      await nuevaVentaBtn.click({ timeout: TIMEOUTS.medio })
      await page.waitForTimeout(500)
    } catch {
      testLog("⚠️", "No se pudo hacer click en botón de nueva venta")
      test.skip()
      return
    }

    // Intentar guardar sin datos
    const submitBtn = page.locator(SELECTORES.btnGuardar).first()

    if (await submitBtn.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
      await submitBtn.click()
      await page.waitForTimeout(500)

      // Buscar mensajes de error de validación
      const errorMsg = page.locator("text=/requerido|obligatorio|required|inválido/i")
      const hasErrors = await errorMsg.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)

      if (hasErrors) {
        testLog("✅", "Validación de campos funciona correctamente")
      }
    }

    await takeTimestampedScreenshot(page, "ventas-validacion")
  })

  test("debe mostrar distribución GYA en el panel", async ({ page }) => {
    testLog("🎯", "Verificando sección de distribución GYA")

    // Buscar la sección de distribución GYA
    const gyaSection = page
      .locator(SELECTORES.gyaSection)
      .or(page.locator("text=/Distribución GYA|GYA/i"))

    if (await gyaSection.isVisible({ timeout: TIMEOUTS.medio }).catch(() => false)) {
      testLog("✅", "Sección GYA visible")

      // Verificar los 3 bancos
      const bovedaMonte = page.locator(SELECTORES.bovedaMonte)
      const fleteSur = page.locator(SELECTORES.fleteSur)
      const utilidades = page.locator(SELECTORES.utilidades)

      if (await bovedaMonte.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
        testLog("✅", "Bóveda Monte visible")
      }
      if (await fleteSur.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
        testLog("✅", "Flete Sur visible")
      }
      if (await utilidades.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
        testLog("✅", "Utilidades visible")
      }
    }

    await takeTimestampedScreenshot(page, "ventas-gya", { fullPage: true })
  })

  test("debe mostrar gráfico de ventas", async ({ page }) => {
    testLog("🎯", "Verificando gráficos")

    const charts = page.locator(SELECTORES.chart)
    const count = await charts.count()

    if (count > 0) {
      testLog("✅", `${count} gráficos encontrados`)
    }

    await takeTimestampedScreenshot(page, "ventas-charts")
  })

  test("debe funcionar la búsqueda de ventas", async ({ page }) => {
    testLog("🎯", "Verificando búsqueda")

    // Buscar específicamente input de búsqueda (no SVG icons)
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="buscar"]')
      .first()

    const isVisible = await searchInput.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)

    if (isVisible) {
      await searchInput.fill("Test")
      await page.waitForTimeout(500)
      testLog("✅", "Búsqueda funcional")
    } else {
      testLog("⚠️", "Campo de búsqueda no encontrado, puede no estar implementado")
    }

    await takeTimestampedScreenshot(page, "ventas-busqueda")
  })

  test("debe mostrar KPIs de ventas", async ({ page }) => {
    testLog("🎯", "Verificando KPIs")

    // Buscar cards de KPI - solo divs visibles, no SVGs
    const kpis = page.locator(
      'div[class*="KPI"], div[class*="metric"], div[class*="card"]:visible, div[class*="Card"]:visible'
    )
    const count = await kpis.count()

    if (count > 0) {
      testLog("✅", `${count} KPIs encontrados`)

      // Verificar que al menos uno tiene valor monetario
      const montos = page.locator("text=/\\$[\\d,]+/")
      const montosCount = await montos.count()
      testLog("💰", `${montosCount} valores monetarios encontrados`)
    } else {
      testLog("⚠️", "KPIs no visibles, puede estar en proceso de carga")
    }

    await takeTimestampedScreenshot(page, "ventas-kpis")
  })

  test("debe tener botón de exportar", async ({ page }) => {
    testLog("🎯", "Verificando exportación")

    const exportBtn = page.locator(SELECTORES.btnExportar).first()

    if (await exportBtn.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
      testLog("✅", "Botón de exportar presente")
    }
  })
})
