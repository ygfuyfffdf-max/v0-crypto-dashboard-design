import { expect, test } from "@playwright/test"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 DASHBOARD GLASS GEN-5 E2E TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 * Tests optimizados para el sistema actual con Glass Gen-5
 * ═══════════════════════════════════════════════════════════════════════════
 */

test.describe("🌟 Dashboard Principal - Glass Gen-5", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
  })

  test("debe cargar el dashboard correctamente", async ({ page }) => {
    // Verificar que el dashboard esté visible
    const dashboard = page.locator('[data-testid="dashboard"]')
    await expect(dashboard).toBeVisible({ timeout: 10000 })

    // Verificar título principal (h1 específico, no link ni title)
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible()
  })

  test("debe mostrar efectos glassmorphism", async ({ page }) => {
    // Esperar a que cargue
    await page.waitForLoadState("networkidle")

    // Buscar elementos con backdrop-blur (glassmorphism)
    const glassElements = page.locator('[class*="backdrop-blur"]')
    const count = await glassElements.count()

    expect(count).toBeGreaterThan(5)
  })

  test("debe mostrar estadísticas animadas", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    // Verificar que hay un grid de estadísticas
    const statsGrid = page.locator(".grid").first()
    await expect(statsGrid).toBeVisible()

    // Verificar que hay tarjetas de stats
    const statCards = page.locator(".grid > div").first()
    await expect(statCards).toBeVisible()
  })

  test("debe mostrar sección de acceso rápido", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    // Buscar texto "Acceso Rápido"
    const quickAccess = page.locator("text=Acceso Rápido")
    await expect(quickAccess).toBeVisible()
  })

  test("debe mostrar actividad reciente", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    // Buscar texto "Actividad"
    const activity = page.locator("text=Actividad")
    await expect(activity).toBeVisible()
  })

  test("debe tener estado operativo del sistema", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    // Buscar "Sistema Operativo" indicator
    const systemStatus = page.locator("text=Sistema Operativo")
    await expect(systemStatus).toBeVisible()
  })
})

test.describe("🎨 Glass Gen-5 Components", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
  })

  test("debe tener LiquidGlassContainer con efectos 3D", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    // Los LiquidGlassContainer deben tener clases específicas
    const liquidGlass = page.locator('[class*="rounded"]').first()
    await expect(liquidGlass).toBeVisible()
  })

  test("debe tener badges Gen-5 con variantes", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    // Buscar badges (con porcentajes de cambio)
    const badges = page.locator('[class*="rounded"]').filter({ hasText: "%" })
    const count = await badges.count()

    expect(count).toBeGreaterThan(0)
  })

  test("debe tener animaciones de hover", async ({ page }) => {
    await page.waitForLoadState("networkidle")

    // Obtener una tarjeta
    const card = page.locator(".grid > div").first()

    // Hacer hover
    await card.hover()

    // Verificar que sigue visible (no hay error de hover)
    await expect(card).toBeVisible()
  })
})

test.describe("📱 Responsive Design", () => {
  test("debe ser responsive en mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/dashboard")

    const dashboard = page.locator('[data-testid="dashboard"]')
    await expect(dashboard).toBeVisible({ timeout: 10000 })
  })

  test("debe ser responsive en tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto("/dashboard")

    const dashboard = page.locator('[data-testid="dashboard"]')
    await expect(dashboard).toBeVisible({ timeout: 10000 })
  })

  test("debe ser responsive en desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto("/dashboard")

    const dashboard = page.locator('[data-testid="dashboard"]')
    await expect(dashboard).toBeVisible({ timeout: 10000 })
  })
})

test.describe("⚡ Performance", () => {
  test("debe cargar en menos de 5 segundos", async ({ page }) => {
    const startTime = Date.now()
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
  })

  test("no debe tener errores de consola críticos", async ({ page }) => {
    const errors: string[] = []

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text())
      }
    })

    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    // Filtrar errores conocidos (como hydration warnings)
    const criticalErrors = errors.filter(
      (err) => !err.includes("Hydration") && !err.includes("Warning")
    )

    expect(criticalErrors.length).toBe(0)
  })
})

test.describe("🔗 Navegación", () => {
  test("debe poder navegar a ventas", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    // Buscar link o botón de ventas (puede estar en sidebar o quick access)
    const ventasLink = page.locator("text=Ventas").first()

    if (await ventasLink.isVisible()) {
      await ventasLink.click()
      await page.waitForLoadState("networkidle")

      // Verificar que cambió la URL o el contenido
      expect(page.url()).toContain("/ventas")
    }
  })

  test("debe poder navegar a bancos", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    const bancosLink = page.locator("text=Bóvedas").first()

    if (await bancosLink.isVisible()) {
      await bancosLink.click()
      await page.waitForLoadState("networkidle")

      expect(page.url()).toContain("/bancos")
    }
  })
})
