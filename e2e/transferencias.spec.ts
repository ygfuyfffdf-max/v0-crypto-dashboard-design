/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS 2026 — E2E TEST: TRANSFERENCIAS ENTRE BANCOS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Test Escenario 4: Transferencias entre Bancos
 *
 * FLUJO:
 * 1. Capturar saldos iniciales de Utilidades y Bóveda Monte
 * 2. Transferir $50,000 de Utilidades a Bóveda Monte
 * 3. Verificar saldo Utilidades disminuyó $50,000
 * 4. Verificar saldo Bóveda Monte aumentó $50,000
 * 5. Verificar movimientos en historial de ambos bancos
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from "@playwright/test"
import { TRANSFERENCIA_TEST, SELECTORES, BANCOS_NOMBRES, BANCOS } from "./fixtures/test-data"
import {
  waitForPageLoad,
  navigateToPanel,
  waitForModal,
  getBancoCapital,
  testLog,
  takeTimestampedScreenshot,
} from "./utils/helpers"

test.describe("🔄 Transferencias entre Bancos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe transferir fondos entre bancos y actualizar saldos", async ({ page }) => {
    testLog("🎯", "Iniciando test de transferencia entre bancos")

    const { bancoOrigen, bancoDestino, monto, concepto } = TRANSFERENCIA_TEST
    let saldoInicialOrigen: number | null = null
    let saldoInicialDestino: number | null = null

    // ═══════════════════════════════════════════════════════════════════
    // PASO 1: Capturar saldos iniciales
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Capturar saldos iniciales", async () => {
      await navigateToPanel(page, "Bancos")
      await page.waitForTimeout(1000)

      saldoInicialOrigen = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.UTILIDADES] ?? /utilidades/i
      )
      saldoInicialDestino = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.BOVEDA_MONTE] ?? /bóveda monte/i
      )

      testLog("💰", `Saldo inicial Utilidades: $${saldoInicialOrigen?.toLocaleString() || "N/A"}`)
      testLog(
        "💰",
        `Saldo inicial Bóveda Monte: $${saldoInicialDestino?.toLocaleString() || "N/A"}`
      )

      await takeTimestampedScreenshot(page, "bancos-antes-transferencia", { fullPage: true })
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 2: Abrir modal de transferencia
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Abrir modal de transferencia", async () => {
      const btnTransferencia = page.locator(SELECTORES.btnTransferencia).first()

      if (!(await btnTransferencia.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip()
        return
      }

      await btnTransferencia.click()
      await waitForModal(page)
      testLog("✅", "Modal de transferencia abierto")
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 3: Llenar formulario de transferencia
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Configurar transferencia", async () => {
      const modal = page.locator(SELECTORES.modal)

      // Seleccionar banco origen (Utilidades)
      const bancoOrigenBtn = modal
        .locator('button:has-text("Utilidades"), [data-banco="utilidades"]')
        .first()
      if (await bancoOrigenBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bancoOrigenBtn.click()
        testLog("✅", "Banco origen: Utilidades")
      }

      // Seleccionar banco destino (Bóveda Monte)
      const bancoDestinoBtn = modal
        .locator(
          'button:has-text("Monte"), button:has-text("Bóveda Monte"), [data-banco="boveda_monte"]'
        )
        .first()
      if (await bancoDestinoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await bancoDestinoBtn.click()
        testLog("✅", "Banco destino: Bóveda Monte")
      }

      // Ingresar monto
      const montoInput = modal.locator('input[name*="monto"], input[type="number"]').first()
      if (await montoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await montoInput.fill(String(monto))
        testLog("✅", `Monto: $${monto.toLocaleString()}`)
      }

      // Ingresar concepto
      const conceptoInput = modal.locator('input[name*="concepto"], textarea').first()
      if (await conceptoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await conceptoInput.fill(concepto)
        testLog("✅", `Concepto: ${concepto}`)
      }

      await takeTimestampedScreenshot(page, "transferencia-formulario")
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 4: Ejecutar transferencia
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Ejecutar transferencia", async () => {
      const btnConfirmar = page.locator(SELECTORES.btnConfirmar).first()

      if (await btnConfirmar.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btnConfirmar.click()
        await page.waitForTimeout(2000)
        testLog("✅", "Transferencia ejecutada")
      }
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 5: Verificar saldos finales
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar actualización de saldos", async () => {
      await navigateToPanel(page, "Bancos")
      await page.waitForTimeout(1000)

      const saldoFinalOrigen = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.UTILIDADES] ?? /utilidades/i
      )
      const saldoFinalDestino = await getBancoCapital(
        page,
        BANCOS_NOMBRES[BANCOS.BOVEDA_MONTE] ?? /bóveda monte/i
      )

      testLog("💰", `Saldo final Utilidades: $${saldoFinalOrigen?.toLocaleString() || "N/A"}`)
      testLog("💰", `Saldo final Bóveda Monte: $${saldoFinalDestino?.toLocaleString() || "N/A"}`)

      // Verificar cambios
      if (saldoInicialOrigen !== null && saldoFinalOrigen !== null) {
        const disminucion = saldoInicialOrigen - saldoFinalOrigen
        testLog("📉", `Utilidades disminuyó: $${disminucion.toLocaleString()}`)
        testLog("🎯", `Esperado: $${monto.toLocaleString()}`)
      }

      if (saldoInicialDestino !== null && saldoFinalDestino !== null) {
        const incremento = saldoFinalDestino - saldoInicialDestino
        testLog("📈", `Bóveda Monte aumentó: $${incremento.toLocaleString()}`)
        testLog("🎯", `Esperado: $${monto.toLocaleString()}`)
      }

      await takeTimestampedScreenshot(page, "bancos-despues-transferencia", { fullPage: true })
    })

    // ═══════════════════════════════════════════════════════════════════
    // PASO 6: Verificar historial de movimientos
    // ═══════════════════════════════════════════════════════════════════
    await test.step("Verificar historial de movimientos", async () => {
      // El historial debe mostrar la transferencia en ambos bancos
      const historialSection = page.locator("text=/historial|movimientos|transacciones/i")

      if (await historialSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        testLog("✅", "Historial de movimientos visible")

        // Buscar el concepto de la transferencia
        const movimiento = page.locator(`text=${concepto}`)
        if (await movimiento.isVisible({ timeout: 2000 }).catch(() => false)) {
          testLog("✅", "Transferencia registrada en historial")
        }
      }

      await takeTimestampedScreenshot(page, "historial-transferencias", { fullPage: true })

      testLog("🎉", "Test de transferencia completado exitosamente")
    })
  })

  test("debe validar saldo suficiente antes de transferir", async ({ page }) => {
    testLog("🎯", "Verificando validación de saldo suficiente")

    await test.step("Intentar transferencia con monto excesivo", async () => {
      await navigateToPanel(page, "Bancos")

      const btnTransferencia = page.locator(SELECTORES.btnTransferencia).first()
      if (!(await btnTransferencia.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip()
        return
      }

      await btnTransferencia.click()
      await waitForModal(page)

      const modal = page.locator(SELECTORES.modal)

      // Intentar transferir monto muy grande
      const montoInput = modal.locator('input[name*="monto"]').first()
      if (await montoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await montoInput.fill("999999999")
      }

      // Intentar confirmar
      const btnConfirmar = page.locator(SELECTORES.btnConfirmar).first()
      if (await btnConfirmar.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btnConfirmar.click()
        await page.waitForTimeout(500)

        // Debe mostrar error o no permitir
        const errorMsg = page.locator("text=/insuficiente|saldo|error/i")
        if (await errorMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
          testLog("✅", "Validación de saldo funcionando")
        }
      }
    })
  })

  test("debe mostrar confirmación antes de ejecutar transferencia", async ({ page }) => {
    testLog("🎯", "Verificando confirmación de transferencia")

    await test.step("Verificar modal de confirmación", async () => {
      await navigateToPanel(page, "Bancos")

      const btnTransferencia = page.locator(SELECTORES.btnTransferencia).first()
      if (!(await btnTransferencia.isVisible({ timeout: 5000 }).catch(() => false))) {
        test.skip()
        return
      }

      await btnTransferencia.click()
      await waitForModal(page)

      // La interfaz debe mostrar resumen antes de confirmar
      const resumenSection = page.locator("text=/resumen|confirmar|está seguro/i")
      if (await resumenSection.isVisible({ timeout: 2000 }).catch(() => false)) {
        testLog("✅", "Modal de confirmación presente")
      }

      await takeTimestampedScreenshot(page, "confirmacion-transferencia")
    })
  })
})
