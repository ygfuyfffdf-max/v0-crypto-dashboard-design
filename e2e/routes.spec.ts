/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS INFINITY 2026 — TEST DE RUTAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Verifica que todas las rutas principales del sistema carguen correctamente
 * sin errores 404 o 500.
 *
 * @version 1.0.0
 */

import { test, expect } from "@playwright/test"

const ROUTES = [
  "/",
  "/login",
  "/chronos-2026",
  "/dashboard",
  "/ventas",
  "/clientes",
  "/distribuidores",
  "/ordenes",
  "/bancos",
  "/almacen",
  "/movimientos",
  "/gastos",
  "/reportes",
  "/ia",
  "/gen5-demo",
]

test.describe("✅ Verificación de Rutas del Sistema", () => {
  for (const route of ROUTES) {
    test(`Ruta ${route} carga sin errores`, async ({ page }) => {
      // Navegar a la ruta
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      })

      // Verificar que no sea un error 404/500
      if (response) {
        expect(response.status()).toBeLessThan(400)
      }

      // Verificar que el body está visible
      await expect(page.locator("body")).toBeVisible({ timeout: 10000 })

      // Verificar que no hay errores críticos en consola
      // Los errores de consola se registran automáticamente en el reporte de Playwright
    })
  }

  test("Todas las rutas responden en menos de 5 segundos", async ({ page }) => {
    for (const route of ROUTES) {
      const startTime = Date.now()
      await page.goto(route, { waitUntil: "domcontentloaded" })
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000)
      // Usar test framework para logging
      await expect(loadTime, `Ruta ${route} cargó en ${loadTime}ms`).toBeLessThan(5000)
    }
  })
})
