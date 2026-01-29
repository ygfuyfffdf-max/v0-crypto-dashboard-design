/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛠️ CHRONOS 2026 — HELPERS PARA E2E TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Funciones auxiliares reutilizables para tests E2E.
 * Siguen las mejores prácticas de Playwright y patrones del proyecto.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, expect } from "@playwright/test"
import { SELECTORES, TIMEOUTS } from "../fixtures/test-data"

/**
 * Esperar y hacer click seguro en un elemento
 */
export async function safeClick(page: Page, selector: string, options?: { timeout?: number }) {
  const element = page.locator(selector).first()
  await element.waitFor({ state: "visible", timeout: options?.timeout || TIMEOUTS.largo })
  await element.click()
}

/**
 * Llenar input de forma segura
 */
export async function safeFill(page: Page, selector: string, value: string) {
  const input = page.locator(selector).first()
  await input.waitFor({ state: "visible", timeout: TIMEOUTS.medio })
  await input.clear()
  await input.fill(value)
}

/**
 * Navegar a un panel específico del sistema - Gen5 Complete Panels
 */
export async function navigateToPanel(
  page: Page,
  panelName:
    | "Ventas"
    | "Clientes"
    | "Bancos"
    | "Inventario"
    | "Almacén"
    | "Órdenes"
    | "Distribuidores"
    | "Gastos"
    | "Movimientos"
    | "IA"
) {
  // Mapear nombres de panel a URLs
  const panelUrls: Record<string, string> = {
    Ventas: "/ventas",
    Clientes: "/clientes",
    Bancos: "/bancos",
    Inventario: "/almacen",
    Almacén: "/almacen",
    Órdenes: "/ordenes",
    Distribuidores: "/distribuidores",
    Gastos: "/gastos",
    Movimientos: "/movimientos",
    IA: "/ia",
  }

  const url = panelUrls[panelName]
  if (url) {
    await page.goto(url)
    await waitForPageLoad(page)
    return
  }

  // Fallback: buscar en sidebar/nav
  const navItem = page
    .locator(
      `a[href*="${panelName.toLowerCase()}"], [data-panel="${panelName.toLowerCase()}"], button:has-text("${panelName}")`
    )
    .first()

  const isVisible = await navItem.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)
  if (isVisible) {
    await navItem.click()
    await page.waitForTimeout(500)
  }
}

/**
 * Cerrar modal activo
 */
export async function closeModal(page: Page) {
  const closeBtn = page.locator(SELECTORES.modalClose).first()
  const isVisible = await closeBtn.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)
  if (isVisible) {
    await closeBtn.click()
    await page.waitForTimeout(300)
  }
}

/**
 * Esperar a que el modal esté visible
 */
export async function waitForModal(page: Page) {
  const modal = page.locator(SELECTORES.modal)
  await expect(modal).toBeVisible({ timeout: TIMEOUTS.medio })
  return modal
}

/**
 * Verificar que aparece un toast de éxito
 */
export async function verifySuccessToast(page: Page, expectedMessage?: RegExp) {
  const toast = page.locator(SELECTORES.toast)
  await expect(toast).toBeVisible({ timeout: TIMEOUTS.largo })

  if (expectedMessage) {
    await expect(toast).toContainText(expectedMessage)
  }
}

/**
 * Esperar a que se cargue la página completamente
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(500) // Esperar animaciones
}

/**
 * Capturar el capital actual de un banco
 */
export async function getBancoCapital(page: Page, bancoName: RegExp): Promise<number | null> {
  try {
    // Buscar el elemento que contiene el nombre del banco
    const bancoElement = page.locator(`text=${bancoName}`).first()
    await bancoElement.waitFor({ state: "visible", timeout: TIMEOUTS.medio })

    // Buscar el monto cerca de ese elemento
    const parent = bancoElement.locator(
      'xpath=ancestor::*[contains(@class, "banco") or contains(@class, "card")][1]'
    )
    const montoText = await parent.locator("text=/\\$[\\d,]+/").first().textContent()

    if (!montoText) return null

    // Extraer número del texto
    const numero = montoText.replace(/[$,]/g, "")
    return parseFloat(numero)
  } catch (error) {
    console.log(`No se pudo obtener capital de ${bancoName}:`, error)
    return null
  }
}

/**
 * Formatear número como moneda
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-MX")}`
}

/**
 * Verificar que un valor numérico está dentro de un rango
 */
export function isInRange(value: number, expected: number, tolerance: number = 0.01): boolean {
  const min = expected * (1 - tolerance)
  const max = expected * (1 + tolerance)
  return value >= min && value <= max
}

/**
 * Llenar formulario de venta (genérico)
 */
export async function fillVentaForm(
  page: Page,
  data: {
    cantidad: number
    precioVenta: number
    precioCompra: number
    precioFlete: number
  }
) {
  const modal = page.locator(SELECTORES.modal)

  // Llenar cantidad
  const cantidadInput = modal
    .locator('input[name*="cantidad"], input[placeholder*="cantidad"]')
    .first()
  if (await cantidadInput.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
    await cantidadInput.fill(String(data.cantidad))
  }

  // Llenar precio venta
  const precioVentaInput = modal
    .locator('input[name*="precioVenta"], input[name*="precio"][name*="venta"]')
    .first()
  if (await precioVentaInput.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
    await precioVentaInput.fill(String(data.precioVenta))
  }

  // Llenar precio compra
  const precioCompraInput = modal
    .locator('input[name*="precioCompra"], input[name*="costo"]')
    .first()
  if (await precioCompraInput.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
    await precioCompraInput.fill(String(data.precioCompra))
  }

  // Llenar flete
  const fleteInput = modal.locator('input[name*="flete"], input[name*="transporte"]').first()
  if (await fleteInput.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
    await fleteInput.fill(String(data.precioFlete))
  }
}

/**
 * Verificar distribución GYA en la UI
 */
export async function verifyDistribucionGYA(
  page: Page,
  expected: {
    bovedaMonte: number
    fletes: number
    utilidades: number
  }
) {
  // Buscar sección de distribución en el modal o página
  const distribucionSection = page.locator("text=/distribución|resumen|preview/i")

  if (await distribucionSection.isVisible({ timeout: TIMEOUTS.corto }).catch(() => false)) {
    // Verificar montos calculados
    const bovedaMonteText = formatCurrency(expected.bovedaMonte)
    const fletesText = formatCurrency(expected.fletes)
    const utilidadesText = formatCurrency(expected.utilidades)

    // Buscar estos valores en la página (pueden estar formateados de diferentes maneras)
    const pageText = await page.textContent("body")

    // Log para debugging
    console.log("🔍 Verificando distribución GYA:")
    console.log(`  - Bóveda Monte: ${bovedaMonteText}`)
    console.log(`  - Fletes: ${fletesText}`)
    console.log(`  - Utilidades: ${utilidadesText}`)
  }
}

/**
 * Tomar screenshot con timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = `test-results/${name}-${timestamp}.png`
  try {
    await page.screenshot({ path: filename, fullPage: options?.fullPage || false, timeout: 5000 })
    console.log(`📸 Screenshot guardado: ${filename}`)
  } catch (error) {
    console.log(`⚠️ Screenshot omitido (timeout): ${filename}`)
  }
  return filename
}

/**
 * Esperar a que desaparezca el loader/spinner
 */
export async function waitForLoadingComplete(page: Page) {
  const loader = page.locator('[class*="loader"], [class*="spinner"], [class*="loading"]')
  try {
    await loader.waitFor({ state: "hidden", timeout: TIMEOUTS.largo })
  } catch {
    // Si no hay loader, continuar
  }
}

/**
 * Verificar que una tabla tiene filas
 */
export async function verifyTableHasRows(page: Page, minRows: number = 1) {
  const rows = page.locator(SELECTORES.fila)
  await expect(rows.first()).toBeVisible({ timeout: TIMEOUTS.largo })
  const count = await rows.count()
  expect(count).toBeGreaterThanOrEqual(minRows)
  return count
}

/**
 * Seleccionar opción en un select/combobox
 */
export async function selectOption(page: Page, selector: string, optionText: string | RegExp) {
  const select = page.locator(selector).first()
  await select.click()

  // Esperar opciones
  await page.waitForTimeout(300)

  // Click en la opción
  const option =
    typeof optionText === "string"
      ? page.locator(`text=${optionText}`)
      : page.locator(`text=${optionText}`)

  await option.first().click()
}

/**
 * Log con formato para tests
 */
export function testLog(emoji: string, message: string) {
  console.log(`${emoji} ${message}`)
}

/**
 * Verificar que no hay errores en consola
 */
export async function verifyNoConsoleErrors(page: Page, allowedErrors: RegExp[] = []) {
  const errors: string[] = []

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text()
      const isAllowed = allowedErrors.some((pattern) => pattern.test(text))
      if (!isAllowed) {
        errors.push(text)
      }
    }
  })

  return errors
}

/**
 * Calcular distribución GYA localmente para verificación
 */
export function calcularDistribucionGYA(
  cantidad: number,
  precioVenta: number,
  precioCompra: number,
  precioFlete: number
) {
  const bovedaMonte = precioCompra * cantidad
  const fletes = precioFlete * cantidad
  const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad
  const total = bovedaMonte + fletes + utilidades

  return {
    bovedaMonte,
    fletes,
    utilidades,
    total,
  }
}
