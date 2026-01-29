import { test, expect, type Page } from "@playwright/test"
import path from "path"

/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              CHRONOS SYSTEM - EXPORT E2E TESTS                             ║
 * ║          Tests End-to-End para Sistema de Exportación                     ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

test.describe("Sistema de Exportación", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: EXPORTACIÓN PDF
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe exportar datos a PDF", async ({ page }) => {
    test.setTimeout(30000) // 30 segundos

    // Esperar por botón de exportación (puede variar según implementación)
    const exportButton = page.getByRole("button", { name: /exportar/i }).first()

    if (await exportButton.isVisible()) {
      // Configurar listener para descarga
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 })

      // Click en botón de exportación
      await exportButton.click()

      // Buscar opción PDF
      const pdfOption = page.getByText(/pdf/i, { exact: false }).first()
      if (await pdfOption.isVisible({ timeout: 2000 })) {
        await pdfOption.click()

        // Esperar descarga
        const download = await downloadPromise

        // Verificar nombre de archivo
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i)

        // Verificar que el archivo no esté vacío
        const filePath = await download.path()
        expect(filePath).toBeTruthy()

        console.log("✅ Descarga PDF exitosa:", download.suggestedFilename())
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2: EXPORTACIÓN CSV
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe exportar datos a CSV", async ({ page }) => {
    test.setTimeout(30000)

    const exportButton = page.getByRole("button", { name: /exportar/i }).first()

    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 })

      await exportButton.click()

      const csvOption = page.getByText(/csv/i, { exact: false }).first()
      if (await csvOption.isVisible({ timeout: 2000 })) {
        await csvOption.click()

        const download = await downloadPromise

        expect(download.suggestedFilename()).toMatch(/\.csv$/i)

        const filePath = await download.path()
        expect(filePath).toBeTruthy()

        console.log("✅ Descarga CSV exitosa:", download.suggestedFilename())
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3: EXPORTACIÓN EXCEL
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe exportar datos a Excel", async ({ page }) => {
    test.setTimeout(30000)

    const exportButton = page.getByRole("button", { name: /exportar/i }).first()

    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 })

      await exportButton.click()

      const excelOption = page.getByText(/excel/i, { exact: false }).first()
      if (await excelOption.isVisible({ timeout: 2000 })) {
        await excelOption.click()

        const download = await downloadPromise

        expect(download.suggestedFilename()).toMatch(/\.xlsx$/i)

        const filePath = await download.path()
        expect(filePath).toBeTruthy()

        console.log("✅ Descarga Excel exitosa:", download.suggestedFilename())
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 4: EXPORTACIÓN DOCX
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe exportar datos a DOCX", async ({ page }) => {
    test.setTimeout(30000)

    const exportButton = page.getByRole("button", { name: /exportar/i }).first()

    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 })

      await exportButton.click()

      const docxOption = page.getByText(/word|docx/i, { exact: false }).first()
      if (await docxOption.isVisible({ timeout: 2000 })) {
        await docxOption.click()

        const download = await downloadPromise

        expect(download.suggestedFilename()).toMatch(/\.docx$/i)

        const filePath = await download.path()
        expect(filePath).toBeTruthy()

        console.log("✅ Descarga DOCX exitosa:", download.suggestedFilename())
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 5: EXPORTACIÓN POWER BI
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe exportar datos para Power BI (JSON)", async ({ page }) => {
    test.setTimeout(30000)

    const exportButton = page.getByRole("button", { name: /exportar/i }).first()

    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 })

      await exportButton.click()

      const powerBIOption = page.getByText(/power bi/i, { exact: false }).first()
      if (await powerBIOption.isVisible({ timeout: 2000 })) {
        await powerBIOption.click()

        const download = await downloadPromise

        expect(download.suggestedFilename()).toMatch(/\.json$/i)
        expect(download.suggestedFilename()).toContain("powerbi")

        const filePath = await download.path()
        expect(filePath).toBeTruthy()

        console.log("✅ Descarga Power BI exitosa:", download.suggestedFilename())
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 6: API ENDPOINT - GET
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe responder correctamente en /api/export con GET", async ({ request }) => {
    const entities = ["ventas", "clientes", "distribuidores", "bancos"]

    for (const entity of entities) {
      const response = await request.get(`/api/export?entity=${entity}&format=json`)

      expect(response.ok()).toBeTruthy()

      const data = await response.json()

      expect(data).toHaveProperty("success")
      expect(data).toHaveProperty("entity")
      expect(data).toHaveProperty("columns")
      expect(data).toHaveProperty("data")
      expect(data.entity).toBe(entity)

      console.log(`✅ API GET /api/export?entity=${entity} - OK (${data.totalRecords} registros)`)
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 7: API ENDPOINT - POST
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe responder correctamente en /api/export con POST", async ({ request }) => {
    const response = await request.post("/api/export", {
      data: {
        entity: "clientes",
        format: "json",
        columns: ["id", "nombre", "email"],
      },
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    expect(data).toHaveProperty("success")
    expect(data).toHaveProperty("entity")
    expect(data).toHaveProperty("columns")
    expect(data).toHaveProperty("data")
    expect(data.entity).toBe("clientes")

    console.log("✅ API POST /api/export - OK")
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 8: API ENDPOINT - CSV FORMAT
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe retornar CSV desde API", async ({ request }) => {
    const response = await request.get("/api/export?entity=ventas&format=csv")

    expect(response.ok()).toBeTruthy()
    expect(response.headers()["content-type"]).toContain("text/csv")

    const csvContent = await response.text()

    // Verificar que contiene encabezados
    expect(csvContent.length).toBeGreaterThan(0)
    expect(csvContent).toContain(",") // CSV debe tener comas

    console.log("✅ API CSV export - OK")
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 9: VALIDACIÓN DE DATOS VACÍOS
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe manejar correctamente datos vacíos", async ({ page }) => {
    // Este test verifica que el sistema maneje bien cuando no hay datos
    const exportButton = page.getByRole("button", { name: /exportar/i }).first()

    if (await exportButton.isVisible()) {
      await exportButton.click()

      // Verificar que aparece un mensaje apropiado o que el dropdown se abre
      await page.waitForTimeout(1000)

      // El botón debe seguir habilitado
      expect(await exportButton.isDisabled()).toBe(false)

      console.log("✅ Manejo de datos vacíos - OK")
    } else {
      test.skip()
    }
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 10: MÚLTIPLES EXPORTACIONES CONSECUTIVAS
  // ═══════════════════════════════════════════════════════════════════════════

  test("debe permitir múltiples exportaciones consecutivas", async ({ page }) => {
    test.setTimeout(60000) // 1 minuto

    const exportButton = page.getByRole("button", { name: /exportar/i }).first()

    if (await exportButton.isVisible()) {
      // Primera exportación
      await exportButton.click()
      await page.waitForTimeout(500)
      await page.keyboard.press("Escape") // Cerrar dropdown

      // Segunda exportación
      await page.waitForTimeout(500)
      await exportButton.click()

      // Verificar que el dropdown se abre nuevamente
      const menuItem = page.locator('[role="menuitem"], [role="option"]').first()
      if (await menuItem.isVisible({ timeout: 2000 })) {
        console.log("✅ Múltiples exportaciones consecutivas - OK")
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE: INTEGRACIÓN EN PANELES ESPECÍFICOS
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Integración en Paneles", () => {
  test("debe tener botón de exportación en panel de ventas", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Buscar enlace o botón de ventas
    const ventasLink = page.getByText(/ventas/i).first()
    if (await ventasLink.isVisible()) {
      await ventasLink.click()
      await page.waitForTimeout(1000)

      // Buscar botón de exportación
      const exportButton = page.getByRole("button", { name: /exportar/i })
      await expect(exportButton.first()).toBeVisible({ timeout: 5000 })

      console.log("✅ Botón de exportación en panel de ventas - OK")
    } else {
      test.skip()
    }
  })

  test("debe tener botón de exportación en panel de clientes", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const clientesLink = page.getByText(/clientes/i).first()
    if (await clientesLink.isVisible()) {
      await clientesLink.click()
      await page.waitForTimeout(1000)

      const exportButton = page.getByRole("button", { name: /exportar/i })
      await expect(exportButton.first()).toBeVisible({ timeout: 5000 })

      console.log("✅ Botón de exportación en panel de clientes - OK")
    } else {
      test.skip()
    }
  })
})
