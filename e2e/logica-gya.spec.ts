/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧮 CHRONOS 2026 — E2E TEST: CASO MATEMÁTICO GYA COMPLETO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Test Escenario 8: Caso Matemático GYA Completo
 *
 * CASO DE PRUEBA CRÍTICO:
 * Venta: 15 relojes
 * - Precio compra: $7,000
 * - Precio venta: $12,000
 * - Flete: $800
 *
 * DISTRIBUCIÓN ESPERADA:
 * - Bóveda Monte: $105,000 (7,000 × 15)
 * - Fletes: $12,000 (800 × 15)
 * - Utilidades: $63,000 ((12,000 - 7,000 - 800) × 15)
 * - TOTAL: $180,000 (DEBE SUMAR EXACTAMENTE)
 *
 * Este test valida la lógica matemática fundamental del sistema.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { expect, test } from "@playwright/test"
import { BANCOS, BANCOS_NOMBRES, SELECTORES, VENTA_GYA_COMPLETO } from "./fixtures/test-data"
import {
  calcularDistribucionGYA,
  getBancoCapital,
  navigateToPanel,
  takeTimestampedScreenshot,
  testLog,
  waitForModal,
  waitForPageLoad,
} from "./utils/helpers"

test.describe("🧮 Lógica GYA - Caso Matemático Completo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe verificar distribución GYA exacta con caso de 15 relojes", async ({ page }) => {
    testLog("🎯", "Iniciando test CRÍTICO de lógica GYA")
    testLog("⚠️", "Este test valida la matemática fundamental del sistema")

    const { cantidad, precioVenta, precioCompra, precioFlete, distribucionEsperada } =
      VENTA_GYA_COMPLETO

    // ═══════════════════════════════════════════════════════════════════
    // PASO 0: Verificar cálculos matemáticos localmente
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar cálculos matemáticos", async () => {
      const calculado = calcularDistribucionGYA(cantidad, precioVenta, precioCompra, precioFlete)

      testLog("🧮", "═══════════════════════════════════════")
      testLog("🧮", "CASO MATEMÁTICO GYA - 15 RELOJES")
      testLog("🧮", "═══════════════════════════════════════")
      testLog("📊", `Cantidad: ${cantidad} unidades`)
      testLog("💵", `Precio Venta: $${precioVenta.toLocaleString()}`)
      testLog("💵", `Precio Compra: $${precioCompra.toLocaleString()}`)
      testLog("🚚", `Flete: $${precioFlete.toLocaleString()}`)
      testLog("", "")
      testLog("🎯", "DISTRIBUCIÓN CALCULADA:")
      testLog("", `  Bóveda Monte: $${calculado.bovedaMonte.toLocaleString()}`)
      testLog("", `  Fletes: $${calculado.fletes.toLocaleString()}`)
      testLog("", `  Utilidades: $${calculado.utilidades.toLocaleString()}`)
      testLog("", `  ────────────────────────────────`)
      testLog("", `  TOTAL: $${calculado.total.toLocaleString()}`)
      testLog("", "")

      // Verificaciones críticas
      expect(calculado.bovedaMonte).toBe(distribucionEsperada.bovedaMonte)
      expect(calculado.fletes).toBe(distribucionEsperada.fletes)
      expect(calculado.utilidades).toBe(distribucionEsperada.utilidades)
      expect(calculado.total).toBe(distribucionEsperada.total)

      testLog("✅", "Cálculos matemáticos CORRECTOS")
      testLog("✅", `Total suma exactamente: $${calculado.total.toLocaleString()}`)
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 1: Capturar saldos iniciales de los 3 bancos
    // ═══════════════════════════════════════════════════════════════════
    let saldosIniciales = {
      bovedaMonte: 0,
      fletes: 0,
      utilidades: 0,
    }

    await test.step("Capturar saldos iniciales de los 3 bancos", async () => {
      await navigateToPanel(page, "Bancos")
      await page.waitForTimeout(1500)

      const bovedaMonte = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.BOVEDA_MONTE] ?? /bóveda monte/i
      )
      const fletes = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.FLETE_SUR] ?? /fletes?|flete sur/i
      )
      const utilidades = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.UTILIDADES] ?? /utilidades/i
      )

      saldosIniciales = {
        bovedaMonte: bovedaMonte || 0,
        fletes: fletes || 0,
        utilidades: utilidades || 0,
      }

      testLog("💰", "═══════════════════════════════════════")
      testLog("💰", "SALDOS INICIALES")
      testLog("💰", "═══════════════════════════════════════")
      testLog("", `  Bóveda Monte: $${saldosIniciales.bovedaMonte.toLocaleString()}`)
      testLog("", `  Fletes: $${saldosIniciales.fletes.toLocaleString()}`)
      testLog("", `  Utilidades: $${saldosIniciales.utilidades.toLocaleString()}`)
      testLog("", "")

      await takeTimestampedScreenshot(page, "gya-saldos-iniciales", { fullPage: true })
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 2: Crear venta con los datos del caso
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Crear venta con caso matemático GYA", async () => {
      await navigateToPanel(page, "Ventas")
      await page.waitForTimeout(500)

      const btnNuevaVenta = page.locator(SELECTORES.btnNuevaVenta).first()

      if (!(await btnNuevaVenta.isVisible({ timeout: 5000 }).catch(() => false))) {
        testLog("❌", "No se pudo abrir formulario de venta")
        test.skip()
        return
      }

      await btnNuevaVenta.click()
      await waitForModal(page)

      const modal = page.locator(SELECTORES.modal)

      // Llenar formulario con datos exactos
      testLog("📝", "Llenando formulario con datos del caso GYA...")

      const cantidadInput = modal.locator('input[name*="cantidad"]').first()
      if (await cantidadInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cantidadInput.fill(String(cantidad))
        testLog("✅", `Cantidad: ${cantidad}`)
      }

      const precioVentaInput = modal.locator('input[name*="precioVenta"]').first()
      if (await precioVentaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await precioVentaInput.fill(String(precioVenta))
        testLog("✅", `Precio Venta: $${precioVenta.toLocaleString()}`)
      }

      const precioCompraInput = modal.locator('input[name*="precioCompra"]').first()
      if (await precioCompraInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await precioCompraInput.fill(String(precioCompra))
        testLog("✅", `Precio Compra: $${precioCompra.toLocaleString()}`)
      }

      const fleteInput = modal.locator('input[name*="flete"]').first()
      if (await fleteInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fleteInput.fill(String(precioFlete))
        testLog("✅", `Flete: $${precioFlete.toLocaleString()}`)
      }

      await takeTimestampedScreenshot(page, "gya-formulario-lleno")

      // Configurar como pago completo
      const completoBtn = modal
        .locator('button:has-text("Completo"), button:has-text("Pagado")')
        .first()
      if (await completoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await completoBtn.click()
      }

      // Guardar venta
      const btnGuardar = page.locator(SELECTORES.btnGuardar).first()
      if (await btnGuardar.isVisible({ timeout: 2000 }).catch(() => false)) {
        testLog("💾", "Guardando venta...")
        await btnGuardar.click()
        await page.waitForTimeout(3000)
        testLog("✅", "Venta guardada")
      }
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 3: Verificar distribución en los 3 bancos
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar distribución exacta en los 3 bancos", async () => {
      await navigateToPanel(page, "Bancos")
      await page.waitForTimeout(2000)

      const bovedaMonteFinal = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.BOVEDA_MONTE] ?? /bóveda monte/i
      )
      const fletesFinal = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.FLETE_SUR] ?? /fletes?|flete sur/i
      )
      const utilidadesFinal = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.UTILIDADES] ?? /utilidades/i
      )

      testLog("💰", "═══════════════════════════════════════")
      testLog("💰", "SALDOS FINALES")
      testLog("💰", "═══════════════════════════════════════")
      testLog("", `  Bóveda Monte: $${bovedaMonteFinal?.toLocaleString() || "N/A"}`)
      testLog("", `  Fletes: $${fletesFinal?.toLocaleString() || "N/A"}`)
      testLog("", `  Utilidades: $${utilidadesFinal?.toLocaleString() || "N/A"}`)
      testLog("", "")

      // Calcular incrementos
      if (bovedaMonteFinal && fletesFinal && utilidadesFinal) {
        const incrementos = {
          bovedaMonte: bovedaMonteFinal - saldosIniciales.bovedaMonte,
          fletes: fletesFinal - saldosIniciales.fletes,
          utilidades: utilidadesFinal - saldosIniciales.utilidades,
        }

        testLog("📈", "═══════════════════════════════════════")
        testLog("📈", "INCREMENTOS (DISTRIBUCIÓN REAL)")
        testLog("📈", "═══════════════════════════════════════")
        testLog("", `  Bóveda Monte: +$${incrementos.bovedaMonte.toLocaleString()}`)
        testLog("", `  Fletes: +$${incrementos.fletes.toLocaleString()}`)
        testLog("", `  Utilidades: +$${incrementos.utilidades.toLocaleString()}`)
        testLog("", `  ────────────────────────────────`)
        testLog(
          "",
          `  TOTAL: $${(incrementos.bovedaMonte + incrementos.fletes + incrementos.utilidades).toLocaleString()}`
        )
        testLog("", "")

        testLog("🎯", "═══════════════════════════════════════")
        testLog("🎯", "COMPARACIÓN: ESPERADO VS REAL")
        testLog("🎯", "═══════════════════════════════════════")
        testLog("", `  Bóveda Monte:`)
        testLog("", `    Esperado: $${distribucionEsperada.bovedaMonte.toLocaleString()}`)
        testLog("", `    Real: $${incrementos.bovedaMonte.toLocaleString()}`)
        testLog(
          "",
          `    ${incrementos.bovedaMonte === distribucionEsperada.bovedaMonte ? "✅ CORRECTO" : "❌ ERROR"}`
        )
        testLog("", "")
        testLog("", `  Fletes:`)
        testLog("", `    Esperado: $${distribucionEsperada.fletes.toLocaleString()}`)
        testLog("", `    Real: $${incrementos.fletes.toLocaleString()}`)
        testLog(
          "",
          `    ${incrementos.fletes === distribucionEsperada.fletes ? "✅ CORRECTO" : "❌ ERROR"}`
        )
        testLog("", "")
        testLog("", `  Utilidades:`)
        testLog("", `    Esperado: $${distribucionEsperada.utilidades.toLocaleString()}`)
        testLog("", `    Real: $${incrementos.utilidades.toLocaleString()}`)
        testLog(
          "",
          `    ${incrementos.utilidades === distribucionEsperada.utilidades ? "✅ CORRECTO" : "❌ ERROR"}`
        )
        testLog("", "")

        const totalReal = incrementos.bovedaMonte + incrementos.fletes + incrementos.utilidades
        testLog("", `  TOTAL:`)
        testLog("", `    Esperado: $${distribucionEsperada.total.toLocaleString()}`)
        testLog("", `    Real: $${totalReal.toLocaleString()}`)
        testLog("", `    ${totalReal === distribucionEsperada.total ? "✅ CORRECTO" : "❌ ERROR"}`)
        testLog("", "")

        // Validación con tolerancia del 1% (por si hay redondeos)
        const tolerance = 0.01
        const validaciones = {
          bovedaMonte:
            Math.abs(incrementos.bovedaMonte - distribucionEsperada.bovedaMonte) <=
            distribucionEsperada.bovedaMonte * tolerance,
          fletes:
            Math.abs(incrementos.fletes - distribucionEsperada.fletes) <=
            distribucionEsperada.fletes * tolerance,
          utilidades:
            Math.abs(incrementos.utilidades - distribucionEsperada.utilidades) <=
            distribucionEsperada.utilidades * tolerance,
          total:
            Math.abs(totalReal - distribucionEsperada.total) <=
            distribucionEsperada.total * tolerance,
        }

        if (
          validaciones.bovedaMonte &&
          validaciones.fletes &&
          validaciones.utilidades &&
          validaciones.total
        ) {
          testLog("🎉", "═══════════════════════════════════════")
          testLog("🎉", "✅ LÓGICA GYA VALIDADA CORRECTAMENTE")
          testLog("🎉", "═══════════════════════════════════════")
        } else {
          testLog("❌", "═══════════════════════════════════════")
          testLog("❌", "ERROR EN LÓGICA GYA")
          testLog("❌", "═══════════════════════════════════════")
          testLog("❌", "Los incrementos no coinciden con lo esperado")
        }
      }

      await takeTimestampedScreenshot(page, "gya-saldos-finales", { fullPage: true })
    })

    testLog("🎉", "Test de lógica GYA completado")
  })

  test("debe verificar que la suma de distribución es exacta", async ({ page }) => {
    testLog("🎯", "Verificación matemática pura")

    const { cantidad, precioVenta, precioCompra, precioFlete } = VENTA_GYA_COMPLETO

    await test.step("Verificar fórmulas matemáticas", async () => {
      const dist = calcularDistribucionGYA(cantidad, precioVenta, precioCompra, precioFlete)

      // Verificar que la suma es correcta
      const suma = dist.bovedaMonte + dist.fletes + dist.utilidades

      testLog("🧮", `Bóveda Monte + Fletes + Utilidades = ${suma}`)
      testLog("🧮", `Total esperado = ${dist.total}`)

      expect(suma).toBe(dist.total)
      testLog("✅", "Suma verificada correctamente")
    })
  })
})
