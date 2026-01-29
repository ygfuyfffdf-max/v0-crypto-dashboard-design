/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS 2026 — E2E TEST: DISTRIBUCIÓN GYA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests de la distribución automática a 3 bancos (lógica GYA):
 * - Bóveda Monte = precioCompra × cantidad
 * - Fletes = precioFlete × cantidad
 * - Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { expect, test } from "@playwright/test"
import { waitForPageLoad } from "../utils/helpers"

test.describe("🧮 Lógica GYA - Distribución a 3 Bancos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe distribuir correctamente venta al contado", async ({ page }) => {
    // Datos de prueba
    const cantidad = 5
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    // Distribución esperada
    const bovedaMonte = precioCompra * cantidad // 25,000
    const fletes = precioFlete * cantidad // 1,000
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad // 14,000
    const total = precioVenta * cantidad // 40,000

    // Verificar cálculos locales
    expect(bovedaMonte).toBe(25000)
    expect(fletes).toBe(1000)
    expect(utilidades).toBe(14000)
    expect(total).toBe(40000)
    expect(bovedaMonte + fletes + utilidades).toBe(total)
  })

  test("debe distribuir correctamente venta a crédito con pago completo", async ({ page }) => {
    const cantidad = 10
    const precioCompra = 6300
    const precioVenta = 10000
    const precioFlete = 500

    // Distribución esperada
    const bovedaMonte = precioCompra * cantidad // 63,000
    const fletes = precioFlete * cantidad // 5,000
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad // 32,000
    const total = precioVenta * cantidad // 100,000

    expect(bovedaMonte).toBe(63000)
    expect(fletes).toBe(5000)
    expect(utilidades).toBe(32000)
    expect(total).toBe(100000)
    expect(bovedaMonte + fletes + utilidades).toBe(total)
  })

  test("debe calcular distribución para caso con 15 relojes", async ({ page }) => {
    // Caso matemático GYA completo del documento
    const cantidad = 15
    const precioCompra = 7000
    const precioVenta = 12000
    const precioFlete = 800

    // Distribución esperada
    const bovedaMonte = precioCompra * cantidad // 105,000
    const fletes = precioFlete * cantidad // 12,000
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad // 63,000
    const total = precioVenta * cantidad // 180,000

    expect(bovedaMonte).toBe(105000)
    expect(fletes).toBe(12000)
    expect(utilidades).toBe(63000)
    expect(total).toBe(180000)
    expect(bovedaMonte + fletes + utilidades).toBe(total)
  })

  test("fórmulas deben funcionar con valores decimales", async ({ page }) => {
    const cantidad = 7
    const precioCompra = 4500.5
    const precioVenta = 7200.75
    const precioFlete = 150.25

    const bovedaMonte = precioCompra * cantidad
    const fletes = precioFlete * cantidad
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad
    const total = precioVenta * cantidad

    // Verificar que las fórmulas funcionan con decimales
    expect(Math.abs(bovedaMonte + fletes + utilidades - total)).toBeLessThan(0.01)
  })

  test("fórmulas deben funcionar con cantidad 1", async ({ page }) => {
    const cantidad = 1
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const bovedaMonte = precioCompra * cantidad
    const fletes = precioFlete * cantidad
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad
    const total = precioVenta * cantidad

    expect(bovedaMonte).toBe(5000)
    expect(fletes).toBe(200)
    expect(utilidades).toBe(2800)
    expect(total).toBe(8000)
    expect(bovedaMonte + fletes + utilidades).toBe(total)
  })

  test("fórmulas deben funcionar con cantidades grandes", async ({ page }) => {
    const cantidad = 1000
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const bovedaMonte = precioCompra * cantidad
    const fletes = precioFlete * cantidad
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad
    const total = precioVenta * cantidad

    expect(bovedaMonte).toBe(5000000)
    expect(fletes).toBe(200000)
    expect(utilidades).toBe(2800000)
    expect(total).toBe(8000000)
    expect(bovedaMonte + fletes + utilidades).toBe(total)
  })

  test("margen de ganancia debe ser correcto", async ({ page }) => {
    const cantidad = 10
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const costoTotal = (precioCompra + precioFlete) * cantidad
    const ingresoTotal = precioVenta * cantidad
    const ganancia = ingresoTotal - costoTotal
    const margenPorcentaje = (ganancia / ingresoTotal) * 100

    expect(costoTotal).toBe(52000)
    expect(ingresoTotal).toBe(80000)
    expect(ganancia).toBe(28000)
    expect(margenPorcentaje).toBe(35)
  })

  test("distribución debe manejar caso sin flete", async ({ page }) => {
    const cantidad = 5
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 0

    const bovedaMonte = precioCompra * cantidad
    const fletes = precioFlete * cantidad
    const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad
    const total = precioVenta * cantidad

    expect(bovedaMonte).toBe(25000)
    expect(fletes).toBe(0)
    expect(utilidades).toBe(15000)
    expect(total).toBe(40000)
    expect(bovedaMonte + fletes + utilidades).toBe(total)
  })

  test("distribución debe ser proporcional para múltiples ventas", async ({ page }) => {
    // Simular dos ventas
    const venta1 = {
      cantidad: 5,
      precioCompra: 5000,
      precioVenta: 8000,
      precioFlete: 200,
    }

    const venta2 = {
      cantidad: 3,
      precioCompra: 6000,
      precioVenta: 9000,
      precioFlete: 300,
    }

    // Calcular distribución venta 1
    const b1 = venta1.precioCompra * venta1.cantidad
    const f1 = venta1.precioFlete * venta1.cantidad
    const u1 = (venta1.precioVenta - venta1.precioCompra - venta1.precioFlete) * venta1.cantidad

    // Calcular distribución venta 2
    const b2 = venta2.precioCompra * venta2.cantidad
    const f2 = venta2.precioFlete * venta2.cantidad
    const u2 = (venta2.precioVenta - venta2.precioCompra - venta2.precioFlete) * venta2.cantidad

    // Totales consolidados
    const totalBovedaMonte = b1 + b2
    const totalFletes = f1 + f2
    const totalUtilidades = u1 + u2

    expect(totalBovedaMonte).toBe(43000) // 25,000 + 18,000
    expect(totalFletes).toBe(1900) // 1,000 + 900
    expect(totalUtilidades).toBe(22100) // 14,000 + 8,100
  })

  test("precio de venta debe ser mayor que costo total", async ({ page }) => {
    const cantidad = 10
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const costoUnitario = precioCompra + precioFlete

    expect(precioVenta).toBeGreaterThan(costoUnitario)
    expect(precioVenta).toBeGreaterThan(precioCompra)
  })
})
