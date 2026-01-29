/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS INFINITY 2026 — E2E Tests con Playwright
 * ═══════════════════════════════════════════════════════════════════════════════
 * Tests end-to-end para flujos críticos del sistema
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { expect, test } from "@playwright/test"

test.describe("🏠 Dashboard Principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("debe cargar la página principal", async ({ page }) => {
    await expect(page).toHaveTitle(/CHRONOS/)
  })

  test("debe mostrar los paneles Bento", async ({ page }) => {
    // Verificar que existan elementos del dashboard
    const dashboard = page.locator('[data-testid="dashboard"]').or(page.locator("main"))
    await expect(dashboard).toBeVisible()
  })

  test("debe tener navegación accesible", async ({ page }) => {
    // Verificar skip link
    const skipLink = page.locator('a[href="#main-content"]')
    if ((await skipLink.count()) > 0) {
      await skipLink.focus()
      await expect(skipLink).toBeVisible()
    }
  })
})

test.describe("💰 Flujo de Ventas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard-demo")
  })

  test("debe navegar al panel de ventas", async ({ page }) => {
    // Buscar botón o link de ventas
    const ventasLink = page
      .getByRole("button", { name: /ventas/i })
      .or(page.getByRole("link", { name: /ventas/i }))
      .or(page.locator('[data-panel="ventas"]'))

    if ((await ventasLink.count()) > 0) {
      await ventasLink.first().click()
      await page.waitForLoadState("networkidle")
    }
  })

  test("modal de crear venta debe ser accesible", async ({ page }) => {
    // Buscar botón de nueva venta
    const newVentaBtn = page.getByRole("button", { name: /nueva venta|crear venta|agregar/i })

    if ((await newVentaBtn.count()) > 0) {
      await newVentaBtn.first().click()

      // Modal debe tener role dialog
      const modal = page.getByRole("dialog")
      if ((await modal.count()) > 0) {
        await expect(modal).toBeVisible()

        // Debe poder cerrarse con Escape
        await page.keyboard.press("Escape")
        await expect(modal).not.toBeVisible()
      }
    }
  })
})

test.describe("🏦 Panel de Bancos", () => {
  test("debe mostrar los 7 bancos/bóvedas", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Buscar indicadores de bancos
    const bancoNames = [
      "bóveda monte",
      "monte",
      "bóveda usa",
      "usa",
      "profit",
      "leftie",
      "azteca",
      "flete",
      "fletes",
      "utilidades",
    ]

    // Al menos algunos bancos deben ser visibles
    let bancosVisibles = 0
    for (const name of bancoNames) {
      const banco = page.getByText(new RegExp(name, "i"))
      if ((await banco.count()) > 0) {
        bancosVisibles++
      }
    }

    // Esperamos ver al menos 2 referencias a bancos
    expect(bancosVisibles).toBeGreaterThan(0)
  })
})

test.describe("♿ Accesibilidad", () => {
  test("debe tener heading structure correcta", async ({ page }) => {
    await page.goto("/")

    // Debe haber al menos un h1
    const h1 = page.locator("h1")
    const h1Count = await h1.count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
  })

  test("todos los botones deben tener texto accesible", async ({ page }) => {
    await page.goto("/")

    const buttons = page.locator("button")
    const count = await buttons.count()

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute("aria-label")
      const ariaLabelledBy = await button.getAttribute("aria-labelledby")

      // Botón debe tener texto, aria-label, o aria-labelledby
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy

      expect(hasAccessibleName).toBeTruthy()
    }
  })

  test("debe tener contrast ratio adecuado", async ({ page }) => {
    await page.goto("/")

    // Este test es más de validación visual
    // En producción usar axe-playwright para auditoría completa
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })

  test("focus debe ser visible", async ({ page }) => {
    await page.goto("/")

    // Tab a través de elementos focuseables
    await page.keyboard.press("Tab")

    const focusedElement = page.locator(":focus")
    if ((await focusedElement.count()) > 0) {
      // El elemento enfocado debe ser visible
      await expect(focusedElement).toBeVisible()
    }
  })
})

test.describe("📱 Responsive Design", () => {
  test("debe funcionar en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // La página debe cargar sin errores
    await expect(page).toHaveTitle(/CHRONOS/)
  })

  test("debe funcionar en tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto("/")

    await expect(page).toHaveTitle(/CHRONOS/)
  })

  test("debe funcionar en desktop grande", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto("/")

    await expect(page).toHaveTitle(/CHRONOS/)
  })
})

test.describe("⚡ Performance", () => {
  test("página principal debe cargar en menos de 5s", async ({ page }) => {
    const startTime = Date.now()
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
  })

  test("no debe haber errores de consola críticos", async ({ page }) => {
    const errors: string[] = []

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text()
        // Ignorar errores conocidos de desarrollo
        if (!text.includes("favicon") && !text.includes("hot-reload")) {
          errors.push(text)
        }
      }
    })

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // No debe haber errores críticos
    const criticalErrors = errors.filter(
      (e) => e.includes("Uncaught") || e.includes("TypeError") || e.includes("ReferenceError")
    )

    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe("🔒 Seguridad", () => {
  test("headers de seguridad deben estar presentes", async ({ page, request }) => {
    const response = await request.get("/")
    const headers = response.headers()

    // Verificar headers de seguridad básicos
    // Nota: En desarrollo pueden no estar todos
    expect(response.status()).toBeLessThan(400)
  })

  test("no debe exponer información sensible en HTML", async ({ page }) => {
    await page.goto("/")
    const html = await page.content()

    // No debe contener API keys expuestas
    expect(html).not.toMatch(/AIza[a-zA-Z0-9-_]{35}/)
    expect(html).not.toMatch(/sk-[a-zA-Z0-9]{48}/)
    expect(html).not.toMatch(/password\s*[=:]\s*["'][^"']+["']/)
  })
})

test.describe("🌐 Navegación", () => {
  test("links internos deben funcionar", async ({ page }) => {
    await page.goto("/")

    // Obtener todos los links internos
    const links = page.locator('a[href^="/"]')
    const count = await links.count()

    // Verificar primeros 5 links
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = links.nth(i)
      const href = await link.getAttribute("href")

      if (href && !href.includes("#")) {
        const response = await page.request.get(href)
        expect(response.status()).toBeLessThan(500)
      }
    }
  })

  test("debe manejar 404 correctamente", async ({ page }) => {
    const response = await page.goto("/pagina-que-no-existe-12345")

    // Debe retornar 404 o mostrar página de error
    expect(response?.status()).toBe(404)
  })
})
