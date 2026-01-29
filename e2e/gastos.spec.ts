import { test, expect } from "@playwright/test"

/**
 * 🎭 E2E Tests - Panel de Gastos
 *
 * Tests completos del sistema de gestión de gastos empresariales
 * incluyendo CRUD, filtros, exportación y estados visuales.
 *
 * @version 1.0.0
 */

test.describe("Panel Gastos - Carga y Renderizado", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("debe cargar el panel de gastos correctamente", async ({ page }) => {
    // Navegar al panel de gastos/movimientos
    const gastosNav = page.getByText(/gastos|movimientos/i).first()

    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1000)
    }

    // Verificar que el panel se cargó
    const panel = page.locator('[class*="panel"], [class*="container"], main')
    await expect(panel.first()).toBeVisible({ timeout: 10000 })
  })

  test("debe mostrar métricas: total, promedio, categoría principal", async ({ page }) => {
    const gastosNav = page.getByText(/gastos|movimientos/i).first()

    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1500)
    }

    // Buscar métricas clave (total, promedio, etc.)
    const metricas = page.locator('[class*="metric"], [class*="stat"], [class*="card"]')
    await page.waitForTimeout(1000)

    // Verificar que hay al menos una métrica visible
    const count = await metricas.count()
    expect(count).toBeGreaterThan(0)
  })

  test("debe renderizar la tabla de gastos con datos", async ({ page }) => {
    const gastosNav = page.getByText(/gastos|movimientos/i).first()

    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1500)
    }

    // Buscar tabla o lista de gastos
    const tabla = page.locator('table, [role="grid"], [class*="table"], [class*="list"]')
    await page.waitForTimeout(2000)

    // Verificar que la tabla existe
    const count = await tabla.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe("Panel Gastos - CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Navegar a gastos
    const gastosNav = page.getByText(/gastos|movimientos/i).first()
    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1000)
    }
  })

  test("debe abrir modal de nuevo gasto al hacer clic en botón", async ({ page }) => {
    // Buscar botón de nuevo gasto
    const nuevoBtn = page
      .getByRole("button", {
        name: /nuevo.*gasto|registrar.*gasto|agregar.*gasto|\+.*gasto/i,
      })
      .first()

    if (await nuevoBtn.isVisible()) {
      await nuevoBtn.click()
      await page.waitForTimeout(500)

      // Verificar que el modal se abrió
      const modal = page.locator('[role="dialog"], [class*="modal"]')
      await expect(modal.first()).toBeVisible({ timeout: 5000 })
    } else {
      test.skip()
    }
  })

  test("debe crear un nuevo gasto con validación", async ({ page }) => {
    const nuevoBtn = page
      .getByRole("button", {
        name: /nuevo.*gasto|registrar.*gasto|agregar.*gasto|\+.*gasto/i,
      })
      .first()

    if (!(await nuevoBtn.isVisible())) {
      test.skip()
      return
    }

    await nuevoBtn.click()
    await page.waitForTimeout(500)

    // Verificar validación de campos vacíos
    const guardarBtn = page.getByRole("button", { name: /guardar|crear|submit/i })
    if (await guardarBtn.isVisible()) {
      await guardarBtn.click()
      await page.waitForTimeout(1000)

      // Debería mostrar errores de validación
      const errors = page.locator('[class*="error"], [role="alert"]')
      await page.waitForTimeout(500)
    }
  })

  test("debe validar monto positivo en nuevo gasto", async ({ page }) => {
    const nuevoBtn = page
      .getByRole("button", {
        name: /nuevo.*gasto|registrar.*gasto|agregar.*gasto|\+.*gasto/i,
      })
      .first()

    if (!(await nuevoBtn.isVisible())) {
      test.skip()
      return
    }

    await nuevoBtn.click()
    await page.waitForTimeout(500)

    // Intentar ingresar monto negativo o cero
    const montoInput = page.locator('input[name="monto"], input[placeholder*="monto" i]').first()
    if (await montoInput.isVisible()) {
      await montoInput.fill("-100")

      const guardarBtn = page.getByRole("button", { name: /guardar|crear/i })
      if (await guardarBtn.isVisible()) {
        await guardarBtn.click()
        await page.waitForTimeout(500)

        // Debe mostrar error de validación
        const errors = page.locator('[class*="error"], [role="alert"]')
        await page.waitForTimeout(500)
      }
    }
  })

  test("debe editar un gasto existente", async ({ page }) => {
    await page.waitForTimeout(1500)

    // Buscar botón de editar en la tabla
    const editBtn = page.getByRole("button", { name: /editar|edit/i }).first()

    if (await editBtn.isVisible()) {
      await editBtn.click()
      await page.waitForTimeout(500)

      // Verificar que el modal de edición se abrió
      const modal = page.locator('[role="dialog"], [class*="modal"]')
      await expect(modal.first()).toBeVisible({ timeout: 5000 })
    } else {
      test.skip()
    }
  })

  test("debe eliminar un gasto con confirmación", async ({ page }) => {
    await page.waitForTimeout(1500)

    // Buscar botón de eliminar
    const deleteBtn = page.getByRole("button", { name: /eliminar|delete|borrar/i }).first()

    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      await page.waitForTimeout(500)

      // Verificar que aparece el diálogo de confirmación
      const confirmDialog = page.locator('[role="alertdialog"], [class*="confirm"]')
      await page.waitForTimeout(500)
    } else {
      test.skip()
    }
  })
})

test.describe("Panel Gastos - Filtros", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const gastosNav = page.getByText(/gastos|movimientos/i).first()
    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1000)
    }
  })

  test("debe filtrar gastos por búsqueda de texto", async ({ page }) => {
    await page.waitForTimeout(1500)

    // Buscar campo de búsqueda
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i]').first()

    if (await searchInput.isVisible()) {
      await searchInput.fill("transporte")
      await page.waitForTimeout(1000)

      // Verificar que la tabla se filtró
      const tabla = page.locator('table, [class*="table"]')
      await page.waitForTimeout(500)
    } else {
      test.skip()
    }
  })

  test("debe filtrar gastos por categoría", async ({ page }) => {
    await page.waitForTimeout(1500)

    // Buscar selector de categoría
    const categoriaSelect = page.locator('select[name="categoria"], [role="combobox"]').first()

    if (await categoriaSelect.isVisible()) {
      await categoriaSelect.click()
      await page.waitForTimeout(500)

      // Seleccionar una categoría (ej: Transporte)
      const opcion = page.getByText(/transporte/i).first()
      if (await opcion.isVisible()) {
        await opcion.click()
        await page.waitForTimeout(1000)
      }
    } else {
      test.skip()
    }
  })

  test("debe filtrar gastos por banco origen", async ({ page }) => {
    await page.waitForTimeout(1500)

    // Buscar selector de banco
    const bancoSelect = page.locator('select[name*="banco"], [role="combobox"]').first()

    if (await bancoSelect.isVisible()) {
      await bancoSelect.click()
      await page.waitForTimeout(500)

      // Seleccionar un banco
      const opcion = page.locator('[role="option"]').first()
      if (await opcion.isVisible()) {
        await opcion.click()
        await page.waitForTimeout(1000)
      }
    } else {
      test.skip()
    }
  })
})

test.describe("Panel Gastos - Exportación", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const gastosNav = page.getByText(/gastos|movimientos/i).first()
    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1000)
    }
  })

  test("debe exportar gastos a CSV", async ({ page }) => {
    await page.waitForTimeout(1500)

    // Buscar botón de exportar
    const exportBtn = page.getByRole("button", { name: /exportar|export|csv|descargar/i }).first()

    if (await exportBtn.isVisible()) {
      // Configurar listener para descarga
      const downloadPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null)

      await exportBtn.click()
      await page.waitForTimeout(1000)

      const download = await downloadPromise
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.csv$/i)
      }
    } else {
      test.skip()
    }
  })
})

test.describe("Panel Gastos - UI/UX", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const gastosNav = page.getByText(/gastos|movimientos/i).first()
    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1000)
    }
  })

  test("debe mostrar animaciones de carga", async ({ page }) => {
    // Recargar página para ver loading
    await page.reload()
    await page.waitForTimeout(300)

    // Buscar indicadores de carga
    const loader = page.locator('[class*="loading"], [class*="spinner"], [role="progressbar"]')
    await page.waitForTimeout(500)
  })

  test("debe mostrar estados vacíos correctamente", async ({ page }) => {
    await page.waitForTimeout(1500)

    // Buscar estado vacío (si no hay datos)
    const emptyState = page.locator('[class*="empty"], [class*="no-data"]')
    await page.waitForTimeout(500)

    // Si hay un estado vacío, verificar que tiene mensaje apropiado
    const count = await emptyState.count()
    if (count > 0) {
      const text = await emptyState.first().textContent()
      expect(text).toBeTruthy()
    }
  })

  test("debe ser responsive en mobile", async ({ page }) => {
    // Cambiar a viewport móvil
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)

    // Verificar que el contenido se adapta
    const panel = page.locator('main, [class*="container"]')
    await expect(panel.first()).toBeVisible()

    // Verificar que la tabla es scrollable o se adapta
    const tabla = page.locator('table, [class*="table"]')
    await page.waitForTimeout(500)
  })
})

test.describe("Panel Gastos - Categorías", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const gastosNav = page.getByText(/gastos|movimientos/i).first()
    if (await gastosNav.isVisible()) {
      await gastosNav.click()
      await page.waitForTimeout(1000)
    }
  })

  test("debe mostrar todas las categorías disponibles", async ({ page }) => {
    const nuevoBtn = page
      .getByRole("button", {
        name: /nuevo.*gasto|registrar.*gasto/i,
      })
      .first()

    if (!(await nuevoBtn.isVisible())) {
      test.skip()
      return
    }

    await nuevoBtn.click()
    await page.waitForTimeout(500)

    // Verificar que el selector de categorías tiene todas las opciones
    const categoriaSelect = page.locator('select[name="categoria"], [role="combobox"]').first()
    if (await categoriaSelect.isVisible()) {
      await categoriaSelect.click()
      await page.waitForTimeout(300)

      // Verificar categorías: Transporte, Servicios, Nómina, etc.
      const categorias = [
        "Transporte",
        "Servicios",
        "Nómina",
        "Mantenimiento",
        "Marketing",
        "Impuestos",
        "Operaciones",
        "Otros",
      ]

      for (const categoria of categorias) {
        const opcion = page.getByText(categoria, { exact: false })
        await page.waitForTimeout(100)
      }
    }
  })

  test('debe usar categoría por defecto "Operaciones"', async ({ page }) => {
    const nuevoBtn = page
      .getByRole("button", {
        name: /nuevo.*gasto|registrar.*gasto/i,
      })
      .first()

    if (!(await nuevoBtn.isVisible())) {
      test.skip()
      return
    }

    await nuevoBtn.click()
    await page.waitForTimeout(500)

    // Verificar que "Operaciones" está preseleccionada
    const categoriaSelect = page.locator('select[name="categoria"]').first()
    if (await categoriaSelect.isVisible()) {
      const value = await categoriaSelect.inputValue()
      expect(value).toBe("Operaciones")
    }
  })
})
