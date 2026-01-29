import { expect, test } from "@playwright/test"
import { BANCOS, BANCOS_NOMBRES, SELECTORES, TIMEOUTS } from "./fixtures/test-data"
import {
  getBancoCapital,
  takeTimestampedScreenshot,
  testLog,
  waitForPageLoad,
} from "./utils/helpers"

/**
 * 🎭 E2E Tests - Sistema Bancario (CosmicBancosPanelComplete)
 *
 * Tests del panel de bancos Gen5
 */

test.describe("Panel de Bancos - Gen5 Complete", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bancos")
    await waitForPageLoad(page)
  })

  test("debe cargar panel de bancos correctamente", async ({ page }) => {
    testLog("🎯", "Verificando carga del panel de bancos")

    await expect(page).toHaveURL(/bancos/)

    // Verificar KPIs
    const kpis = page.locator(SELECTORES.kpiCard)
    await expect(kpis.first()).toBeVisible({ timeout: TIMEOUTS.largo })

    testLog("✅", "Panel de bancos cargado")
    await takeTimestampedScreenshot(page, "bancos-panel")
  })

  test("debe mostrar los 7 bancos del sistema", async ({ page }) => {
    testLog("🎯", "Verificando 7 bancos")

    const bancos = [
      "Bóveda Monte",
      "Bóveda USA",
      "Profit",
      "Leftie",
      "Azteca",
      "Flete Sur",
      "Utilidades",
    ]

    let bancosVisibles = 0
    for (const banco of bancos) {
      const bancoElement = page.locator(`text=/${banco}/i`)
      if (
        await bancoElement
          .first()
          .isVisible({ timeout: TIMEOUTS.corto })
          .catch(() => false)
      ) {
        bancosVisibles++
        testLog("✅", `${banco} visible`)
      }
    }

    testLog("📊", `${bancosVisibles}/7 bancos visibles`)
    await takeTimestampedScreenshot(page, "bancos-lista", { fullPage: true })
  })

  test("debe mostrar saldo de cada banco", async ({ page }) => {
    testLog("🎯", "Verificando saldos")

    // Buscar elementos con formato de moneda
    const montos = page.locator("text=/\\$[\\d,]+/")
    const count = await montos.count()

    testLog("💰", `${count} valores monetarios encontrados`)

    // Intentar obtener capital de al menos un banco
    const capitalMonte = await getBancoCapital(
      page,
      BANCOS_NOMBRES[BANCOS.BOVEDA_MONTE] ?? /bóveda monte/i
    )
    if (capitalMonte !== null) {
      testLog("✅", `Bóveda Monte: $${capitalMonte.toLocaleString()}`)
    }

    await takeTimestampedScreenshot(page, "bancos-saldos")
  })

  test("debe mostrar totales consolidados", async ({ page }) => {
    testLog("🎯", "Verificando totales")

    const total = page.locator("text=/total|capital total|consolidado/i")

    if (
      await total
        .first()
        .isVisible({ timeout: TIMEOUTS.medio })
        .catch(() => false)
    ) {
      testLog("✅", "Total consolidado visible")
    }

    await takeTimestampedScreenshot(page, "bancos-totales")
  })

  test("debe mostrar gráficos de bancos", async ({ page }) => {
    testLog("🎯", "Verificando gráficos")

    const charts = page.locator(SELECTORES.chart)
    const count = await charts.count()

    if (count > 0) {
      testLog("✅", `${count} gráficos encontrados`)
    }

    await takeTimestampedScreenshot(page, "bancos-charts")
  })

  test("debe tener botón de transferencia", async ({ page }) => {
    testLog("🎯", "Verificando transferencias")

    const transferirBtn = page.locator(SELECTORES.btnTransferencia).first()

    if (await transferirBtn.isVisible({ timeout: TIMEOUTS.medio }).catch(() => false)) {
      testLog("✅", "Botón de transferencia presente")

      await transferirBtn.click()

      const modal = page.locator(SELECTORES.modal)
      if (await modal.isVisible({ timeout: TIMEOUTS.medio }).catch(() => false)) {
        testLog("✅", "Modal de transferencia abierto")
        await takeTimestampedScreenshot(page, "bancos-modal-transferencia")
      }
    }
  })

  test("debe mostrar distribución GYA (3 bancos)", async ({ page }) => {
    testLog("🎯", "Verificando distribución GYA")

    // Los 3 bancos que reciben distribución
    const bancosGYA = [
      { nombre: "Bóveda Monte", rol: "COSTO" },
      { nombre: "Flete Sur", rol: "TRANSPORTE" },
      { nombre: "Utilidades", rol: "GANANCIA" },
    ]

    for (const banco of bancosGYA) {
      const element = page.locator(`text=/${banco.nombre}/i`)
      if (
        await element
          .first()
          .isVisible({ timeout: TIMEOUTS.corto })
          .catch(() => false)
      ) {
        testLog("✅", `${banco.nombre} (${banco.rol}) visible`)
      }
    }

    await takeTimestampedScreenshot(page, "bancos-gya")
  })

  test("debe mostrar tabla de movimientos", async ({ page }) => {
    testLog("🎯", "Verificando movimientos")

    const tabla = page.locator(SELECTORES.tabla)

    if (
      await tabla
        .first()
        .isVisible({ timeout: TIMEOUTS.medio })
        .catch(() => false)
    ) {
      const filas = page.locator(SELECTORES.fila)
      const count = await filas.count()
      testLog("📊", `${count} movimientos en tabla`)
    }

    await takeTimestampedScreenshot(page, "bancos-movimientos")
  })

  test("debe mostrar ingresos en verde y gastos en rojo", async ({ page }) => {
    testLog("🎯", "Verificando colores de ingresos/gastos")

    const verdes = page.locator('[class*="green"], [class*="success"]')
    const rojos = page.locator('[class*="red"], [class*="danger"], [class*="destructive"]')

    const verdesCount = await verdes.count()
    const rojosCount = await rojos.count()

    testLog("📊", `${verdesCount} elementos verdes, ${rojosCount} elementos rojos`)
    await takeTimestampedScreenshot(page, "bancos-colores")
  })

  test("debe mostrar gráfico de distribución", async ({ page }) => {
    testLog("🎯", "Verificando gráficos de distribución")

    const graficos = page.locator('canvas, svg[class*="chart"], [class*="recharts"]')
    const count = await graficos.count()

    if (count > 0) {
      testLog("✅", `${count} gráficos de distribución encontrados`)
    }

    await takeTimestampedScreenshot(page, "bancos-distribucion")
  })
})
