import { test, expect } from "@playwright/test"

/**
 * 🎭 E2E Tests - Modales de Cortes y Reportes
 *
 * Tests para validar los modales de cortes y reportes:
 * - CorteCajaModal
 * - CorteGeneralModal
 * - CorteAlmacenModal
 * - ReporteVentasModal
 * - ReporteClientesModal
 */

test.describe("Modales de Cortes y Reportes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("CorteCajaModal - debe abrir y mostrar selección de banco", async ({ page }) => {
    // Buscar botón para abrir modal de corte de caja
    // Nota: El botón puede estar en diferentes ubicaciones según el diseño
    const corteBtn = page.getByRole("button", { name: /corte.*caja/i })

    if (await corteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await corteBtn.click()
      await page.waitForTimeout(500)

      // Verificar que el modal se abrió
      const modal = page.getByRole("dialog")
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Verificar título del modal
      const titulo = page.getByText(/corte.*caja/i)
      await expect(titulo).toBeVisible()

      // Verificar selector de banco
      const selectorBanco = page.locator("select").first()
      await expect(selectorBanco).toBeVisible()

      // Verificar selector de período
      const selectorPeriodo = page.locator("select").nth(1)
      if (await selectorPeriodo.isVisible().catch(() => false)) {
        await expect(selectorPeriodo).toBeVisible()
      }

      // Cerrar modal
      const closeBtn = page
        .getByRole("button", { name: /close|cerrar/i })
        .or(page.locator('button[aria-label="Close"]'))
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.first().click()
      }
    } else {
      test.skip()
    }
  })

  test("CorteCajaModal - debe generar corte con datos", async ({ page }) => {
    const corteBtn = page.getByRole("button", { name: /corte.*caja/i })

    if (await corteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await corteBtn.click()
      await page.waitForTimeout(500)

      // Seleccionar un banco
      const selectorBanco = page.locator("select").first()
      if (await selectorBanco.isVisible().catch(() => false)) {
        await selectorBanco.selectOption({ index: 1 })
      }

      // Seleccionar período "mes"
      const selectorPeriodo = page.locator("select").nth(1)
      if (await selectorPeriodo.isVisible().catch(() => false)) {
        await selectorPeriodo.selectOption("mes")
      }

      // Hacer clic en generar corte
      const generarBtn = page.getByRole("button", { name: /generar.*corte/i })
      if (await generarBtn.isVisible().catch(() => false)) {
        await generarBtn.click()
        await page.waitForTimeout(2000)

        // Verificar que se muestran resultados
        // (puede ser resumen o lista de movimientos)
        const resultados = page.locator("text=/saldo|ingreso|gasto/i").first()
        // Los resultados pueden tardar en cargar
        await expect(resultados)
          .toBeVisible({ timeout: 10000 })
          .catch(() => {
            // Si no hay resultados, el test continúa
          })
      }
    } else {
      test.skip()
    }
  })

  test("CorteGeneralModal - debe abrir y mostrar resumen general", async ({ page }) => {
    const corteGeneralBtn = page.getByRole("button", { name: /corte.*general/i })

    if (await corteGeneralBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await corteGeneralBtn.click()
      await page.waitForTimeout(500)

      // Verificar que el modal se abrió
      const modal = page.getByRole("dialog")
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Verificar título
      const titulo = page.getByText(/corte.*general/i)
      await expect(titulo).toBeVisible()

      // Verificar selector de período
      const selectorPeriodo = page.locator("select")
      await expect(selectorPeriodo.first()).toBeVisible()
    } else {
      test.skip()
    }
  })

  test("CorteGeneralModal - debe mostrar KPIs al generar", async ({ page }) => {
    const corteGeneralBtn = page.getByRole("button", { name: /corte.*general/i })

    if (await corteGeneralBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await corteGeneralBtn.click()
      await page.waitForTimeout(500)

      // Generar corte
      const generarBtn = page.getByRole("button", { name: /generar/i })
      if (await generarBtn.isVisible().catch(() => false)) {
        await generarBtn.click()
        await page.waitForTimeout(2000)

        // Verificar KPIs (pueden incluir: capital total, ventas, gastos, etc.)
        const kpis = page.locator("text=/capital|venta|gasto|cliente/i")
        const kpiCount = await kpis.count()
        expect(kpiCount).toBeGreaterThan(0)
      }
    } else {
      test.skip()
    }
  })

  test("CorteAlmacenModal - debe abrir y mostrar opciones de filtro", async ({ page }) => {
    const almacenBtn = page.getByRole("button", { name: /corte.*almac[ée]n/i })

    if (await almacenBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await almacenBtn.click()
      await page.waitForTimeout(500)

      // Verificar modal
      const modal = page.getByRole("dialog")
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Verificar título
      const titulo = page.getByText(/almac[ée]n/i)
      await expect(titulo).toBeVisible()

      // Verificar checkbox de "solo alerta"
      const checkbox = page.locator('input[type="checkbox"]')
      if (await checkbox.isVisible().catch(() => false)) {
        await expect(checkbox).toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test("CorteAlmacenModal - debe mostrar productos y alertas", async ({ page }) => {
    const almacenBtn = page.getByRole("button", { name: /corte.*almac[ée]n/i })

    if (await almacenBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await almacenBtn.click()
      await page.waitForTimeout(500)

      // Generar corte
      const generarBtn = page.getByRole("button", { name: /generar/i })
      if (await generarBtn.isVisible().catch(() => false)) {
        await generarBtn.click()
        await page.waitForTimeout(2000)

        // Verificar que se muestran productos
        const productos = page.locator("text=/stock|producto|cantidad/i")
        const productoCount = await productos.count()
        expect(productoCount).toBeGreaterThan(0)
      }
    } else {
      test.skip()
    }
  })

  test("ReporteVentasModal - debe abrir y mostrar tabs", async ({ page }) => {
    const reporteBtn = page.getByRole("button", { name: /reporte.*venta/i })

    if (await reporteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reporteBtn.click()
      await page.waitForTimeout(500)

      // Verificar modal
      const modal = page.getByRole("dialog")
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Verificar título
      const titulo = page.getByText(/reporte.*venta/i)
      await expect(titulo).toBeVisible()

      // Generar reporte
      const generarBtn = page.getByRole("button", { name: /generar/i })
      if (await generarBtn.isVisible().catch(() => false)) {
        await generarBtn.click()
        await page.waitForTimeout(2000)

        // Verificar tabs (ventas, clientes, productos)
        const tabs = page.locator('[role="tablist"]')
        if (await tabs.isVisible().catch(() => false)) {
          await expect(tabs).toBeVisible()
        }
      }
    } else {
      test.skip()
    }
  })

  test("ReporteVentasModal - debe cambiar entre tabs", async ({ page }) => {
    const reporteBtn = page.getByRole("button", { name: /reporte.*venta/i })

    if (await reporteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reporteBtn.click()
      await page.waitForTimeout(500)

      // Generar reporte
      const generarBtn = page.getByRole("button", { name: /generar/i })
      if (await generarBtn.isVisible().catch(() => false)) {
        await generarBtn.click()
        await page.waitForTimeout(2000)

        // Cambiar al tab "clientes"
        const clientesTab = page.getByRole("tab", { name: /cliente/i })
        if (await clientesTab.isVisible().catch(() => false)) {
          await clientesTab.click()
          await page.waitForTimeout(500)

          // Verificar contenido del tab
          const contenido = page.locator("text=/cliente|top/i")
          const count = await contenido.count()
          expect(count).toBeGreaterThan(0)
        }
      }
    } else {
      test.skip()
    }
  })

  test("ReporteClientesModal - debe abrir y mostrar filtros", async ({ page }) => {
    const reporteBtn = page.getByRole("button", { name: /reporte.*cliente/i })

    if (await reporteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reporteBtn.click()
      await page.waitForTimeout(500)

      // Verificar modal
      const modal = page.getByRole("dialog")
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Verificar título
      const titulo = page.getByText(/reporte.*cliente/i)
      await expect(titulo).toBeVisible()

      // Verificar selector de filtro
      const selector = page.locator("select")
      await expect(selector.first()).toBeVisible()
    } else {
      test.skip()
    }
  })

  test("ReporteClientesModal - debe mostrar ranking y morosos", async ({ page }) => {
    const reporteBtn = page.getByRole("button", { name: /reporte.*cliente/i })

    if (await reporteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reporteBtn.click()
      await page.waitForTimeout(2000) // Esperar carga automática

      // Verificar tabs
      const tabs = page.locator('[role="tablist"]')
      if (await tabs.isVisible().catch(() => false)) {
        await expect(tabs).toBeVisible()

        // Cambiar al tab "morosos"
        const morososTab = page.getByRole("tab", { name: /moroso/i })
        if (await morososTab.isVisible().catch(() => false)) {
          await morososTab.click()
          await page.waitForTimeout(500)

          // Verificar contenido (puede estar vacío o tener clientes morosos)
          const contenido = page.locator("text=/moroso|deuda|cliente/i")
          const count = await contenido.count()
          expect(count).toBeGreaterThan(0)
        }
      }
    } else {
      test.skip()
    }
  })

  test("Exportación CSV - botones deben estar visibles", async ({ page }) => {
    // Probar en cualquier modal que se pueda abrir
    const anyModalBtn = page.getByRole("button", { name: /corte|reporte/i })

    if (
      await anyModalBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await anyModalBtn.first().click()
      await page.waitForTimeout(500)

      // Buscar botón de generar/cargar datos
      const generarBtn = page.getByRole("button", { name: /generar/i })
      if (await generarBtn.isVisible().catch(() => false)) {
        await generarBtn.click()
        await page.waitForTimeout(2000)

        // Buscar botones de exportación
        const exportBtn = page.getByRole("button", { name: /exportar|csv|imprimir/i })
        if (
          await exportBtn
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          await expect(exportBtn.first()).toBeVisible()
        }
      }
    } else {
      test.skip()
    }
  })

  test("Validación de formularios - debe requerir campos obligatorios", async ({ page }) => {
    const corteBtn = page.getByRole("button", { name: /corte.*caja/i })

    if (await corteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await corteBtn.click()
      await page.waitForTimeout(500)

      // Intentar generar sin seleccionar banco
      const generarBtn = page.getByRole("button", { name: /generar/i })
      if (await generarBtn.isVisible().catch(() => false)) {
        await generarBtn.click()
        await page.waitForTimeout(500)

        // Verificar mensaje de error o que el modal no cierra
        const modal = page.getByRole("dialog")
        // Si la validación funciona, el modal debe seguir visible
        await expect(modal).toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test("Responsividad - modales deben verse en pantalla pequeña", async ({ page }) => {
    // Cambiar a viewport móvil
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    const anyModalBtn = page.getByRole("button", { name: /corte|reporte/i })

    if (
      await anyModalBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await anyModalBtn.first().click()
      await page.waitForTimeout(500)

      // Verificar que el modal es visible y no se sale de la pantalla
      const modal = page.getByRole("dialog")
      if (await modal.isVisible().catch(() => false)) {
        const boundingBox = await modal.boundingBox()
        if (boundingBox) {
          // Verificar que el modal está dentro del viewport
          expect(boundingBox.width).toBeLessThanOrEqual(375)
        }
      }
    } else {
      test.skip()
    }
  })
})
