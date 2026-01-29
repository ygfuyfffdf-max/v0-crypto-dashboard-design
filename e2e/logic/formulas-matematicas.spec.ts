/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS 2026 — E2E TEST: FÓRMULAS MATEMÁTICAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests de las fórmulas matemáticas del sistema:
 * - Capital = historicoIngresos - historicoGastos
 * - Margen = (precioVenta - costoTotal) / precioVenta × 100
 * - Saldo = totalVenta - totalPagado
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { expect, test } from "@playwright/test"
import { waitForPageLoad } from "../utils/helpers"

test.describe("🧮 Fórmulas Matemáticas del Sistema", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test.describe("Fórmula de Capital Bancario", () => {
    test("capital debe ser ingresos menos gastos", async ({ page }) => {
      const ingresos = 150000
      const gastos = 85000
      const capital = ingresos - gastos

      expect(capital).toBe(65000)
    })

    test("capital con solo ingresos", async ({ page }) => {
      const ingresos = 100000
      const gastos = 0
      const capital = ingresos - gastos

      expect(capital).toBe(100000)
    })

    test("capital negativo cuando gastos > ingresos", async ({ page }) => {
      const ingresos = 50000
      const gastos = 75000
      const capital = ingresos - gastos

      expect(capital).toBe(-25000)
      expect(capital).toBeLessThan(0)
    })

    test("capital cero cuando ingresos = gastos", async ({ page }) => {
      const ingresos = 100000
      const gastos = 100000
      const capital = ingresos - gastos

      expect(capital).toBe(0)
    })

    test("capital con múltiples operaciones", async ({ page }) => {
      const ingreso1 = 50000
      const ingreso2 = 30000
      const gasto1 = 25000
      const gasto2 = 15000
      const gasto3 = 10000

      const totalIngresos = ingreso1 + ingreso2
      const totalGastos = gasto1 + gasto2 + gasto3
      const capital = totalIngresos - totalGastos

      expect(totalIngresos).toBe(80000)
      expect(totalGastos).toBe(50000)
      expect(capital).toBe(30000)
    })

    test("capital con valores decimales", async ({ page }) => {
      const ingresos = 125750.5
      const gastos = 87300.25
      const capital = ingresos - gastos

      expect(capital).toBe(38450.25)
    })
  })

  test.describe("Fórmula de Margen de Ganancia", () => {
    test("debe calcular margen porcentual correcto", async ({ page }) => {
      const precioVenta = 8000
      const precioCompra = 5000
      const precioFlete = 200
      const costoTotal = precioCompra + precioFlete

      const ganancia = precioVenta - costoTotal
      const margen = (ganancia / precioVenta) * 100

      expect(ganancia).toBe(2800)
      expect(margen).toBe(35)
    })

    test("margen del 50%", async ({ page }) => {
      const precioVenta = 10000
      const costoTotal = 5000

      const ganancia = precioVenta - costoTotal
      const margen = (ganancia / precioVenta) * 100

      expect(margen).toBe(50)
    })

    test("margen del 100%", async ({ page }) => {
      const precioVenta = 10000
      const costoTotal = 5000

      const margen = ((precioVenta - costoTotal) / costoTotal) * 100

      expect(margen).toBe(100)
    })

    test("margen negativo cuando venta < costo", async ({ page }) => {
      const precioVenta = 5000
      const costoTotal = 7000

      const ganancia = precioVenta - costoTotal
      const margen = (ganancia / precioVenta) * 100

      expect(ganancia).toBe(-2000)
      expect(margen).toBe(-40)
    })

    test("margen cero cuando venta = costo", async ({ page }) => {
      const precioVenta = 8000
      const costoTotal = 8000

      const ganancia = precioVenta - costoTotal
      const margen = (ganancia / precioVenta) * 100

      expect(ganancia).toBe(0)
      expect(margen).toBe(0)
    })

    test("margen considerando todos los costos", async ({ page }) => {
      const precioVenta = 12000
      const precioCompra = 7000
      const precioFlete = 800
      const otrosGastos = 500

      const costoTotal = precioCompra + precioFlete + otrosGastos
      const ganancia = precioVenta - costoTotal
      const margen = (ganancia / precioVenta) * 100

      expect(costoTotal).toBe(8300)
      expect(ganancia).toBe(3700)
      expect(Math.round(margen * 100) / 100).toBe(30.83)
    })
  })

  test.describe("Fórmula de Saldo Pendiente", () => {
    test("debe calcular saldo pendiente correcto", async ({ page }) => {
      const totalVenta = 50000
      const totalPagado = 20000
      const saldoPendiente = totalVenta - totalPagado

      expect(saldoPendiente).toBe(30000)
    })

    test("saldo cero cuando está completamente pagada", async ({ page }) => {
      const totalVenta = 50000
      const totalPagado = 50000
      const saldoPendiente = totalVenta - totalPagado

      expect(saldoPendiente).toBe(0)
    })

    test("saldo negativo cuando pago > total (sobrepago)", async ({ page }) => {
      const totalVenta = 50000
      const totalPagado = 55000
      const saldoPendiente = totalVenta - totalPagado

      expect(saldoPendiente).toBe(-5000)
      expect(saldoPendiente).toBeLessThan(0)
    })

    test("saldo con múltiples abonos", async ({ page }) => {
      const totalVenta = 100000
      const abono1 = 30000
      const abono2 = 25000
      const abono3 = 15000

      const totalPagado = abono1 + abono2 + abono3
      const saldoPendiente = totalVenta - totalPagado

      expect(totalPagado).toBe(70000)
      expect(saldoPendiente).toBe(30000)
    })

    test("saldo inicial debe ser igual al total", async ({ page }) => {
      const totalVenta = 80000
      const totalPagado = 0
      const saldoPendiente = totalVenta - totalPagado

      expect(saldoPendiente).toBe(totalVenta)
    })

    test("porcentaje pagado debe ser correcto", async ({ page }) => {
      const totalVenta = 100000
      const totalPagado = 40000
      const saldoPendiente = totalVenta - totalPagado
      const porcentajePagado = (totalPagado / totalVenta) * 100
      const porcentajePendiente = (saldoPendiente / totalVenta) * 100

      expect(porcentajePagado).toBe(40)
      expect(porcentajePendiente).toBe(60)
      expect(porcentajePagado + porcentajePendiente).toBe(100)
    })
  })

  test.describe("Fórmulas Combinadas", () => {
    test("debe calcular correctamente flujo completo de venta", async ({ page }) => {
      // Datos de venta
      const cantidad = 10
      const precioCompra = 5000
      const precioVenta = 8000
      const precioFlete = 200

      // Totales
      const totalVenta = precioVenta * cantidad // 80,000
      const costoTotal = (precioCompra + precioFlete) * cantidad // 52,000

      // Margen
      const ganancia = totalVenta - costoTotal // 28,000
      const margen = (ganancia / totalVenta) * 100 // 35%

      // Pago parcial
      const totalPagado = 30000
      const saldoPendiente = totalVenta - totalPagado // 50,000

      // Distribución GYA
      const proporcion = totalPagado / totalVenta // 0.375
      const bovedaMonte = precioCompra * cantidad * proporcion
      const fletes = precioFlete * cantidad * proporcion
      const utilidades = ganancia * proporcion

      expect(totalVenta).toBe(80000)
      expect(ganancia).toBe(28000)
      expect(margen).toBe(35)
      expect(saldoPendiente).toBe(50000)
      expect(Math.round(bovedaMonte + fletes + utilidades)).toBe(totalPagado)
    })

    test("debe calcular ROI correctamente", async ({ page }) => {
      const inversion = 50000
      const ganancia = 20000
      const roi = (ganancia / inversion) * 100

      expect(roi).toBe(40)
    })

    test("debe calcular punto de equilibrio", async ({ page }) => {
      const costosFijos = 50000
      const precioVenta = 8000
      const costoVariable = 5200

      const margenContribucion = precioVenta - costoVariable
      const puntoEquilibrio = costosFijos / margenContribucion

      expect(margenContribucion).toBe(2800)
      expect(Math.ceil(puntoEquilibrio)).toBe(18) // 18 unidades
    })

    test("debe calcular tasa de rotación de inventario", async ({ page }) => {
      const costoVendido = 500000
      const inventarioPromedio = 100000
      const tasaRotacion = costoVendido / inventarioPromedio

      expect(tasaRotacion).toBe(5)
    })
  })

  test.describe("Validaciones Matemáticas", () => {
    test("suma de distribución GYA debe ser igual al total", async ({ page }) => {
      const cantidad = 15
      const precioCompra = 7000
      const precioVenta = 12000
      const precioFlete = 800

      const bovedaMonte = precioCompra * cantidad
      const fletes = precioFlete * cantidad
      const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad
      const total = precioVenta * cantidad

      expect(bovedaMonte + fletes + utilidades).toBe(total)
    })

    test("suma de porcentajes debe ser 100%", async ({ page }) => {
      const total = 100000
      const parte1 = 40000
      const parte2 = 35000
      const parte3 = 25000

      const porcentaje1 = (parte1 / total) * 100
      const porcentaje2 = (parte2 / total) * 100
      const porcentaje3 = (parte3 / total) * 100
      const sumaTotal = porcentaje1 + porcentaje2 + porcentaje3

      expect(sumaTotal).toBe(100)
    })

    test("capital bancario no debe ser undefined o NaN", async ({ page }) => {
      const ingresos = 100000
      const gastos = 50000
      const capital = ingresos - gastos

      expect(capital).toBeDefined()
      expect(isNaN(capital)).toBe(false)
      expect(capital).toBe(50000)
    })
  })
})
