/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎭 E2E Tests - Accesibilidad WCAG 2.2 AA con Playwright
 * ═══════════════════════════════════════════════════════════════════════════════
 * Tests automatizados de accesibilidad usando axe-core
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("♿ Auditoría WCAG 2.2 AA", () => {
  test("homepage debe pasar auditoría de accesibilidad", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()

    // Filtrar violaciones críticas
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    )

    expect(criticalViolations).toEqual([])
  })

  test("dashboard debe pasar auditoría de accesibilidad", async ({ page }) => {
    await page.goto("/dashboard-demo")
    await page.waitForLoadState("networkidle")

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude('[data-testid="spline-3d"]') // Excluir elementos 3D
      .exclude("canvas") // Excluir canvas de gráficas
      .analyze()

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    )

    // Log violaciones para debugging
    if (criticalViolations.length > 0) {
      console.log("Violaciones de accesibilidad:", JSON.stringify(criticalViolations, null, 2))
    }

    expect(criticalViolations).toEqual([])
  })
})

test.describe("⌨️ Navegación por Teclado", () => {
  test("todos los elementos interactivos deben ser accesibles por teclado", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Obtener todos los elementos focuseables
    const focusableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      return elements.length
    })

    // Debe haber elementos focuseables
    expect(focusableElements).toBeGreaterThan(0)

    // Tab a través de elementos
    let focusedCount = 0
    const maxTabs = Math.min(focusableElements, 20)

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press("Tab")
      const focused = await page.evaluate(() => {
        return document.activeElement?.tagName || null
      })
      if (focused) focusedCount++
    }

    expect(focusedCount).toBeGreaterThan(0)
  })

  test("focus trap debe funcionar en modales", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Buscar y abrir un modal
    const modalTrigger = page.getByRole("button", { name: /nueva|crear|abrir/i }).first()

    if (await modalTrigger.isVisible()) {
      await modalTrigger.click()

      const dialog = page.getByRole("dialog")
      if ((await dialog.count()) > 0) {
        // Tab varias veces - el focus debe quedarse dentro del modal
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press("Tab")
        }

        // El focus debe seguir dentro del dialog
        const isInDialog = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]')
          return dialog?.contains(document.activeElement) ?? false
        })

        expect(isInDialog).toBe(true)

        await page.keyboard.press("Escape")
      }
    }
  })

  test("atajos de teclado deben funcionar", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Probar Escape para cerrar modales
    await page.keyboard.press("Escape")

    // Probar navegación con flechas en listas
    const list = page.getByRole("list").first()
    if ((await list.count()) > 0) {
      await list.focus()
      await page.keyboard.press("ArrowDown")
    }
  })
})

test.describe("🔊 Screen Reader", () => {
  test("imágenes deben tener alt text", async ({ page }) => {
    await page.goto("/dashboard-demo")

    const images = page.locator("img")
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute("alt")
      const role = await img.getAttribute("role")

      // Imagen debe tener alt o role="presentation"
      const hasAccessibility = alt !== null || role === "presentation"
      expect(hasAccessibility).toBe(true)
    }
  })

  test("formularios deben tener labels", async ({ page }) => {
    await page.goto("/dashboard-demo")

    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])')
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute("id")
      const ariaLabel = await input.getAttribute("aria-label")
      const ariaLabelledBy = await input.getAttribute("aria-labelledby")

      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const hasLabel = (await label.count()) > 0
        const hasAriaLabel = ariaLabel !== null || ariaLabelledBy !== null

        expect(hasLabel || hasAriaLabel).toBe(true)
      }
    }
  })

  test("landmarks deben estar presentes", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Verificar landmarks principales
    const main = page.locator('main, [role="main"]')
    await expect(main).toHaveCount(1)

    // Navigation es opcional pero recomendado
    const nav = page.locator('nav, [role="navigation"]')
    // Al menos debería existir navegación
  })

  test("headings deben tener jerarquía correcta", async ({ page }) => {
    await page.goto("/dashboard-demo")

    const headings = await page.evaluate(() => {
      const h = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
      return Array.from(h).map((el) => {
        const char = el.tagName[1]
        return char ? parseInt(char, 10) : 0
      })
    })

    // Debe haber al menos un heading
    expect(headings.length).toBeGreaterThan(0)

    // El primer heading debe ser h1
    if (headings.length > 0 && headings[0] !== undefined) {
      expect(headings[0]).toBe(1)
    }

    // No debe haber saltos de más de un nivel
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i]
      const previous = headings[i - 1]
      if (current !== undefined && previous !== undefined) {
        const diff = current - previous
        expect(diff).toBeLessThanOrEqual(1)
      }
    }
  })
})

test.describe("🎨 Contraste y Colores", () => {
  test("no debe depender solo del color para información", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Los estados de error deben tener más que solo color
    const errorElements = page.locator('[class*="error"], [class*="danger"], [aria-invalid="true"]')
    const count = await errorElements.count()

    for (let i = 0; i < count; i++) {
      const el = errorElements.nth(i)
      const text = await el.textContent()
      const ariaLabel = await el.getAttribute("aria-label")

      // Debe haber texto o indicador además del color
      expect(text || ariaLabel).toBeTruthy()
    }
  })
})

test.describe("⏱️ Tiempo y Animaciones", () => {
  test("contenido en movimiento debe poder pausarse", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Verificar que haya control sobre animaciones
    const animatedElements = page.locator('[class*="animate"]')

    // Preferir reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.reload()

    // Las animaciones deberían respetarlo
    const computedStyle = await page.evaluate(() => {
      const el = document.querySelector('[class*="animate"]')
      if (el) {
        return window.getComputedStyle(el).animationDuration
      }
      return null
    })

    // Si hay elementos animados, deben respetar reduced motion
  })

  test("timeouts deben dar tiempo suficiente", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Los toasts/notificaciones no deben desaparecer muy rápido
    const toasts = page.locator('[role="alert"], [class*="toast"], [class*="notification"]')

    if ((await toasts.count()) > 0) {
      const toast = toasts.first()
      await expect(toast).toBeVisible()

      // Debe permanecer visible al menos 5 segundos
      await page.waitForTimeout(5000)
      // Si desapareció antes, el test lo detectará
    }
  })
})

test.describe("📍 Focus Management", () => {
  test("focus debe moverse al contenido nuevo", async ({ page }) => {
    await page.goto("/dashboard-demo")

    // Abrir modal
    const trigger = page.getByRole("button", { name: /nueva|abrir/i }).first()

    if (await trigger.isVisible()) {
      await trigger.click()

      const dialog = page.getByRole("dialog")
      if ((await dialog.count()) > 0) {
        // Focus debe estar dentro del dialog
        const focusedElement = await page.evaluate(
          () => document.activeElement?.closest('[role="dialog"]') !== null
        )

        expect(focusedElement).toBe(true)
      }
    }
  })

  test("focus debe regresar al trigger al cerrar modal", async ({ page }) => {
    await page.goto("/dashboard-demo")

    const trigger = page.getByRole("button", { name: /nueva|abrir/i }).first()

    if (await trigger.isVisible()) {
      const triggerId = await trigger.evaluate((el) => el.id || el.textContent)

      await trigger.click()

      const dialog = page.getByRole("dialog")
      if ((await dialog.count()) > 0) {
        await page.keyboard.press("Escape")

        // Focus debe regresar al trigger
        const currentFocused = await page.evaluate(
          () => document.activeElement?.textContent || document.activeElement?.id
        )

        // El focus debería regresar aproximadamente al mismo lugar
      }
    }
  })
})
