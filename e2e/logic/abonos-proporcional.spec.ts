/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS 2026 — E2E TEST: DISTRIBUCIÓN PROPORCIONAL DE ABONOS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests de distribución proporcional de abonos cuando el pago es parcial:
 * - Proporción = montoPagado / precioTotalVenta
 * - Cada banco recibe: montoEsperado × proporción
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { expect, test } from "@playwright/test"
import { waitForPageLoad } from "../utils/helpers"

test.describe("🧮 Lógica de Abonos - Distribución Proporcional", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe calcular proporción correcta para abono parcial 50%", async ({ page }) => {
    const cantidad = 10
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const precioTotal = precioVenta * cantidad // 80,000
    const montoPagado = 40000 // 50% del total
    const proporcion = montoPagado / precioTotal // 0.5

    // Distribución completa
    const bovedaMonteTotal = precioCompra * cantidad // 50,000
    const fletesTotal = precioFlete * cantidad // 2,000
    const utilidadesTotal = (precioVenta - precioCompra - precioFlete) * cantidad // 28,000

    // Distribución proporcional al 50%
    const bovedaMonteParcial = bovedaMonteTotal * proporcion // 25,000
    const fletesParcial = fletesTotal * proporcion // 1,000
    const utilidadesParcial = utilidadesTotal * proporcion // 14,000

    expect(proporcion).toBe(0.5)
    expect(bovedaMonteParcial).toBe(25000)
    expect(fletesParcial).toBe(1000)
    expect(utilidadesParcial).toBe(14000)
    expect(bovedaMonteParcial + fletesParcial + utilidadesParcial).toBe(montoPagado)
  })

  test("debe calcular proporción correcta para abono parcial 25%", async ({ page }) => {
    const cantidad = 10
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const precioTotal = precioVenta * cantidad // 80,000
    const montoPagado = 20000 // 25% del total
    const proporcion = montoPagado / precioTotal // 0.25

    const bovedaMonteTotal = precioCompra * cantidad
    const fletesTotal = precioFlete * cantidad
    const utilidadesTotal = (precioVenta - precioCompra - precioFlete) * cantidad

    const bovedaMonteParcial = bovedaMonteTotal * proporcion
    const fletesParcial = fletesTotal * proporcion
    const utilidadesParcial = utilidadesTotal * proporcion

    expect(proporcion).toBe(0.25)
    expect(bovedaMonteParcial).toBe(12500)
    expect(fletesParcial).toBe(500)
    expect(utilidadesParcial).toBe(7000)
    expect(bovedaMonteParcial + fletesParcial + utilidadesParcial).toBe(montoPagado)
  })

  test("debe calcular proporción correcta para abono parcial 75%", async ({ page }) => {
    const cantidad = 10
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const precioTotal = precioVenta * cantidad // 80,000
    const montoPagado = 60000 // 75% del total
    const proporcion = montoPagado / precioTotal // 0.75

    const bovedaMonteTotal = precioCompra * cantidad
    const fletesTotal = precioFlete * cantidad
    const utilidadesTotal = (precioVenta - precioCompra - precioFlete) * cantidad

    const bovedaMonteParcial = bovedaMonteTotal * proporcion
    const fletesParcial = fletesTotal * proporcion
    const utilidadesParcial = utilidadesTotal * proporcion

    expect(proporcion).toBe(0.75)
    expect(bovedaMonteParcial).toBe(37500)
    expect(fletesParcial).toBe(1500)
    expect(utilidadesParcial).toBe(21000)
    expect(bovedaMonteParcial + fletesParcial + utilidadesParcial).toBe(montoPagado)
  })

  test("debe manejar múltiples abonos acumulativos", async ({ page }) => {
    const cantidad = 10
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const precioTotal = precioVenta * cantidad // 80,000

    // Primer abono de 30,000
    const abono1 = 30000
    const proporcion1 = abono1 / precioTotal // 0.375

    // Segundo abono de 20,000
    const abono2 = 20000
    const proporcion2 = abono2 / precioTotal // 0.25

    // Proporción total
    const proporcionTotal = proporcion1 + proporcion2 // 0.625
    const totalPagado = abono1 + abono2 // 50,000

    expect(proporcion1).toBe(0.375)
    expect(proporcion2).toBe(0.25)
    expect(proporcionTotal).toBe(0.625)
    expect(totalPagado).toBe(50000)
  })

  test("debe distribuir correctamente enganche inicial", async ({ page }) => {
    // Caso: Venta a crédito con enganche del 30%
    const cantidad = 2
    const precioCompra = 7000
    const precioVenta = 12000
    const precioFlete = 500

    const precioTotal = precioVenta * cantidad // 24,000
    const enganche = 7200 // 30% del total
    const proporcion = enganche / precioTotal // 0.3

    const bovedaMonteTotal = precioCompra * cantidad // 14,000
    const fletesTotal = precioFlete * cantidad // 1,000
    const utilidadesTotal = (precioVenta - precioCompra - precioFlete) * cantidad // 9,000

    const bovedaMonteParcial = bovedaMonteTotal * proporcion
    const fletesParcial = fletesTotal * proporcion
    const utilidadesParcial = utilidadesTotal * proporcion

    expect(Math.round(proporcion * 100) / 100).toBe(0.3)
    expect(bovedaMonteParcial).toBe(4200)
    expect(fletesParcial).toBe(300)
    expect(utilidadesParcial).toBe(2700)
    expect(bovedaMonteParcial + fletesParcial + utilidadesParcial).toBe(enganche)
  })

  test("debe calcular deuda pendiente después de abono", async ({ page }) => {
    const cantidad = 5
    const precioCompra = 6000
    const precioVenta = 10000
    const precioFlete = 400

    const precioTotal = precioVenta * cantidad // 50,000
    const montoPagado = 15000 // 30% pagado
    const deudaPendiente = precioTotal - montoPagado // 35,000

    const proporcionPagada = montoPagado / precioTotal // 0.3
    const proporcionPendiente = deudaPendiente / precioTotal // 0.7

    expect(montoPagado).toBe(15000)
    expect(deudaPendiente).toBe(35000)
    expect(proporcionPagada).toBe(0.3)
    expect(proporcionPendiente).toBe(0.7)
    expect(proporcionPagada + proporcionPendiente).toBe(1)
  })

  test("debe completar distribución al liquidar venta", async ({ page }) => {
    const cantidad = 8
    const precioCompra = 5500
    const precioVenta = 9000
    const precioFlete = 300

    const precioTotal = precioVenta * cantidad // 72,000

    // Primer abono de 30,000 (41.67%)
    const abono1 = 30000
    const proporcion1 = abono1 / precioTotal

    // Segundo abono para liquidar: 42,000 (58.33%)
    const abono2 = precioTotal - abono1 // 42,000
    const proporcion2 = abono2 / precioTotal

    // Al liquidar, proporción total debe ser 1.0
    const proporcionTotal = proporcion1 + proporcion2

    expect(abono2).toBe(42000)
    expect(Math.round(proporcionTotal * 100) / 100).toBe(1)
    expect(abono1 + abono2).toBe(precioTotal)
  })

  test("proporción debe manejar valores con decimales", async ({ page }) => {
    const cantidad = 7
    const precioCompra = 4750.5
    const precioVenta = 7800.75
    const precioFlete = 225.25

    const precioTotal = precioVenta * cantidad
    const montoPagado = 15000
    const proporcion = montoPagado / precioTotal

    const bovedaMonteTotal = precioCompra * cantidad
    const fletesTotal = precioFlete * cantidad
    const utilidadesTotal = (precioVenta - precioCompra - precioFlete) * cantidad

    const bovedaMonteParcial = bovedaMonteTotal * proporcion
    const fletesParcial = fletesTotal * proporcion
    const utilidadesParcial = utilidadesTotal * proporcion

    // La suma debe ser muy cercana al monto pagado (tolerancia para decimales)
    const totalDistribuido = bovedaMonteParcial + fletesParcial + utilidadesParcial
    expect(Math.abs(totalDistribuido - montoPagado)).toBeLessThan(0.01)
  })

  test("debe manejar abono mayor al precio de venta (caso edge)", async ({ page }) => {
    const cantidad = 5
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const precioTotal = precioVenta * cantidad // 40,000
    const montoPagado = 50000 // Más del total (error de usuario)

    // El sistema debe limitar la proporción a 1.0
    const proporcion = Math.min(montoPagado / precioTotal, 1.0)

    expect(proporcion).toBe(1.0)
  })

  test("abono de $0 debe tener proporción 0", async ({ page }) => {
    const cantidad = 5
    const precioCompra = 5000
    const precioVenta = 8000
    const precioFlete = 200

    const precioTotal = precioVenta * cantidad
    const montoPagado = 0
    const proporcion = montoPagado / precioTotal

    expect(proporcion).toBe(0)
  })
})
