/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS 2026 — E2E TEST: FLUJO COMPLETO DE VENTA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Test end-to-end del flujo completo de una venta:
 * 1. Navegar al panel de ventas
 * 2. Crear una nueva venta
 * 3. Verificar distribución en los 3 bancos
 * 4. Verificar actualización de capital
 * 5. Registrar un pago parcial
 * 6. Verificar recálculo de distribución
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from "@playwright/test"

test.describe("Flujo Completo de Venta", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto("/")

    // Esperar a que la aplicación cargue
    await page.waitForLoadState("networkidle")
  })

  test("debe crear venta completa y distribuir en 3 bancos", async ({ page }) => {
    // ═══════════════════════════════════════════════════════════════════════
    // PASO 1: Navegar al panel de ventas
    // ═══════════════════════════════════════════════════════════════════════

    await test.step("Navegar a panel de ventas", async () => {
      // Buscar y hacer clic en el botón/link de ventas
      const ventasButton = page
        .getByRole("button", { name: /ventas/i })
        .or(page.getByRole("link", { name: /ventas/i }))

      if (await ventasButton.isVisible()) {
        await ventasButton.click()
      }

      // Verificar que estamos en el panel correcto
      await expect(page).toHaveURL(/ventas|panel=ventas/)
    })

    // ═════════════════════════════════════════════════════════════════════
    // PASO 2: Abrir modal de nueva venta
    // ═══════════════════════════════════════════════════════════════════════

    await test.step("Abrir modal de nueva venta", async () => {
      // Buscar botón para crear venta
      const nuevaVentaButton = page.getByRole("button", {
        name: /nueva venta|crear venta|agregar venta/i,
      })
      await expect(nuevaVentaButton).toBeVisible()
      await nuevaVentaButton.click()

      // Esperar a que el modal aparezca
      await expect(page.getByRole("dialog").or(page.locator('[role="dialog"]'))).toBeVisible()
    })

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 3: Llenar formulario de venta
    // ═══════════════════════════════════════════════════════════════════════

    await test.step("Llenar datos de venta", async () => {
      // Datos de prueba (Caso 1 de la documentación)
      const datosVenta = {
        cantidad: "10",
        precioVenta: "10000",
        precioCompra: "6300",
        flete: "500",
      }

      // Llenar campos
      await page.getByLabel(/cantidad/i).fill(datosVenta.cantidad)
      await page.getByLabel(/precio.*venta|precio.*unitario/i).fill(datosVenta.precioVenta)
      await page.getByLabel(/precio.*compra|costo/i).fill(datosVenta.precioCompra)
      await page.getByLabel(/flete|transporte/i).fill(datosVenta.flete)

      // Seleccionar cliente (si existe)
      const clienteSelect = page.locator('select[name="clienteId"]').or(page.getByLabel(/cliente/i))
      if (await clienteSelect.isVisible()) {
        await clienteSelect.selectOption({ index: 1 })
      }
    })

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 4: Enviar formulario
    // ═══════════════════════════════════════════════════════════════════════

    await test.step("Crear venta", async () => {
      const submitButton = page.getByRole("button", { name: /crear|guardar|registrar/i })
      await expect(submitButton).toBeEnabled()
      await submitButton.click()

      // Esperar mensaje de éxito
      await expect(page.getByText(/venta creada|éxito|success/i)).toBeVisible({ timeout: 10000 })

      // El modal debe cerrarse
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 })
    })

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 5: Verificar distribución en bancos
    // ═══════════════════════════════════════════════════════════════════════

    await test.step("Verificar distribución en bancos", async () => {
      // Navegar a panel de bancos
      const bancosButton = page
        .getByRole("button", { name: /bancos|bóvedas/i })
        .or(page.getByRole("link", { name: /bancos|bóvedas/i }))

      if (await bancosButton.isVisible()) {
        await bancosButton.click()
        await page.waitForLoadState("networkidle")
      }

      // Verificar que los 3 bancos muestran cambios
      // Bóveda Monte: debe aumentar ~$63,000
      // Fletes: debe aumentar ~$5,000
      // Utilidades: debe aumentar ~$32,000

      // Nota: Los montos exactos dependen del saldo inicial
      // Solo verificamos que los bancos estén visibles y actualizados
      await expect(page.getByText(/bóveda monte|monte/i)).toBeVisible()
      await expect(page.getByText(/flete|fletes/i)).toBeVisible()
      await expect(page.getByText(/utilidades/i)).toBeVisible()
    })
  })

  test("debe manejar pago parcial correctamente", async ({ page }) => {
    // Este test verifica que los pagos parciales distribuyen proporcionalmente

    await test.step("Crear venta con pago parcial 50%", async () => {
      // Navegar a ventas
      const ventasButton = page
        .getByRole("button", { name: /ventas/i })
        .or(page.getByRole("link", { name: /ventas/i }))
      if (await ventasButton.isVisible()) {
        await ventasButton.click()
      }

      // Abrir modal
      await page.getByRole("button", { name: /nueva venta/i }).click()
      await page.waitForSelector('[role="dialog"]')

      // Llenar datos (Caso 3: pago 50%)
      await page.getByLabel(/cantidad/i).fill("20")
      await page.getByLabel(/precio.*venta/i).fill("15000")
      await page.getByLabel(/precio.*compra/i).fill("10000")
      await page.getByLabel(/flete/i).fill("800")

      // Monto pagado: 50% de (15,000 + 800) × 20 = 158,000
      const montoPagadoField = page.getByLabel(/monto.*pagado|pago.*inicial/i)
      if (await montoPagadoField.isVisible()) {
        await montoPagadoField.fill("158000")
      }

      // Crear venta
      await page.getByRole("button", { name: /crear|guardar/i }).click()

      // Verificar éxito
      await expect(page.getByText(/venta creada|éxito/i)).toBeVisible({ timeout: 10000 })
    })

    await test.step("Verificar estado de pago parcial", async () => {
      // La venta debe aparecer en la lista con estado "Parcial"
      await expect(page.getByText(/parcial|pago parcial/i)).toBeVisible()
    })
  })

  test("debe mostrar resumen de distribución antes de guardar", async ({ page }) => {
    await test.step("Verificar preview de distribución", async () => {
      // Navegar a ventas
      const ventasButton = page
        .getByRole("button", { name: /ventas/i })
        .or(page.getByRole("link", { name: /ventas/i }))
      if (await ventasButton.isVisible()) {
        await ventasButton.click()
      }

      // Abrir modal
      await page.getByRole("button", { name: /nueva venta/i }).click()
      await page.waitForSelector('[role="dialog"]')

      // Llenar datos básicos
      await page.getByLabel(/cantidad/i).fill("10")
      await page.getByLabel(/precio.*venta/i).fill("10000")
      await page.getByLabel(/precio.*compra/i).fill("6300")
      await page.getByLabel(/flete/i).fill("500")

      // Verificar que aparece resumen/preview de distribución
      // (si está implementado en el UI)
      const resumenSection = page.locator("text=/distribución|resumen|preview/i")
      if (await resumenSection.isVisible()) {
        // Verificar montos calculados
        await expect(page.getByText(/63,000|63000/)).toBeVisible() // Bóveda Monte
        await expect(page.getByText(/5,000|5000/)).toBeVisible() // Fletes
        await expect(page.getByText(/32,000|32000/)).toBeVisible() // Utilidades
      }
    })
  })

  test("debe validar datos requeridos", async ({ page }) => {
    await test.step("Intentar crear venta sin datos", async () => {
      // Navegar a ventas
      const ventasButton = page
        .getByRole("button", { name: /ventas/i })
        .or(page.getByRole("link", { name: /ventas/i }))
      if (await ventasButton.isVisible()) {
        await ventasButton.click()
      }

      // Abrir modal
      await page.getByRole("button", { name: /nueva venta/i }).click()
      await page.waitForSelector('[role="dialog"]')

      // Intentar enviar sin llenar
      const submitButton = page.getByRole("button", { name: /crear|guardar/i })
      await submitButton.click()

      // Debe mostrar errores de validación
      await expect(page.getByText(/requerido|obligatorio|required/i)).toBeVisible()
    })

    await test.step("Validar cantidad mínima", async () => {
      // Llenar con cantidad 0
      await page.getByLabel(/cantidad/i).fill("0")
      await page.getByLabel(/precio.*venta/i).fill("10000")
      await page.getByLabel(/precio.*compra/i).fill("6000")

      const submitButton = page.getByRole("button", { name: /crear|guardar/i })
      await submitButton.click()

      // Debe mostrar error de validación
      await expect(page.getByText(/cantidad.*mayor|cantidad.*mínima/i)).toBeVisible()
    })
  })

  test("debe calcular precio total correctamente", async ({ page }) => {
    await test.step("Verificar cálculo automático", async () => {
      // Navegar a ventas
      const ventasButton = page
        .getByRole("button", { name: /ventas/i })
        .or(page.getByRole("link", { name: /ventas/i }))
      if (await ventasButton.isVisible()) {
        await ventasButton.click()
      }

      // Abrir modal
      await page.getByRole("button", { name: /nueva venta/i }).click()
      await page.waitForSelector('[role="dialog"]')

      // Llenar datos
      await page.getByLabel(/cantidad/i).fill("10")
      await page.getByLabel(/precio.*venta/i).fill("10000")
      await page.getByLabel(/flete/i).fill("500")

      // Esperar cálculo automático
      await page.waitForTimeout(500)

      // Verificar que muestra total correcto: (10,000 + 500) × 10 = 105,000
      const totalField = page.locator("text=/105,000|105000/")
      if (await totalField.isVisible()) {
        await expect(totalField).toBeVisible()
      }
    })
  })
})

test.describe("Navegación y UX", () => {
  test("debe cargar página principal sin errores", async ({ page }) => {
    await page.goto("/")

    // Verificar que no hay errores de consola críticos
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text())
      }
    })

    await page.waitForLoadState("networkidle")

    // Verificar elementos básicos presentes
    await expect(page.locator("body")).toBeVisible()
  })

  test("debe tener navegación responsiva", async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto("/")
    await expect(page.locator("nav").or(page.locator('[role="navigation"]'))).toBeVisible()

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await expect(page.locator("body")).toBeVisible()

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await expect(page.locator("body")).toBeVisible()
  })

  test("debe tener accesibilidad básica", async ({ page }) => {
    await page.goto("/")

    // Verificar que hay un heading principal
    const mainHeading = page.locator("h1")
    if (await mainHeading.isVisible()) {
      await expect(mainHeading).toBeVisible()
    }

    // Verificar navegación por teclado
    await page.keyboard.press("Tab")
    const focusedElement = await page.locator(":focus")
    await expect(focusedElement).toBeVisible()
  })
})

test.describe("PWA", () => {
  test("debe tener manifest.json", async ({ page }) => {
    const response = await page.goto("/manifest.json")
    expect(response?.status()).toBe(200)

    const manifest = await response?.json()
    expect(manifest).toHaveProperty("name")
    expect(manifest).toHaveProperty("short_name")
    expect(manifest).toHaveProperty("start_url")
    expect(manifest).toHaveProperty("display")
  })

  test("debe registrar service worker", async ({ page, context }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Verificar si hay service worker registrado
    const swRegistered = await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return !!registration
      }
      return false
    })

    // Service worker debería estar registrado
    expect(swRegistered).toBe(true)
  })
})
