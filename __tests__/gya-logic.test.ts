/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS INFINITY 2026 — TESTS LÓGICA GYA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests matemáticos exhaustivos de la distribución GYA (Gastos Y Administración).
 * Verifica que los cálculos sean exactos y consistentes.
 *
 * FÓRMULAS SAGRADAS:
 * - Bóveda Monte = precioCompra × cantidad (COSTO)
 * - Flete Sur = precioFlete × cantidad (TRANSPORTE)
 * - Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA)
 *
 * @version 1.0.0
 */

import {
  calcularDistribucionGYA,
  calcularDistribucionParcial,
  calcularVentaCompleta,
  calcularAbonoVenta,
  calcularCapitalBanco,
  validarStockParaVenta,
  FLETE_DEFAULT,
} from "@/app/_lib/gya/distribucion-gya"

describe("🏛️ Lógica GYA — Distribución de Ventas", () => {
  describe("calcularDistribucionGYA - Casos Base", () => {
    test("Caso 1: Venta de $100,000 distribuye correctamente", () => {
      const venta = {
        cantidad: 100,
        precioVenta: 1000, // $1,000 por unidad
        precioCompra: 600, // $600 costo
        precioFlete: 100, // $100 flete
      }

      const resultado = calcularDistribucionGYA(venta)

      expect(resultado.bovedaMonte).toBe(60000) // 600 * 100 = COSTO
      expect(resultado.fletes).toBe(10000) // 100 * 100 = FLETE
      expect(resultado.utilidades).toBe(30000) // (1000-600-100) * 100 = GANANCIA
      expect(resultado.total).toBe(100000) // Suma total
    })

    test("Caso 2: Venta pequeña $10,000", () => {
      const venta = {
        cantidad: 10,
        precioVenta: 1000,
        precioCompra: 630,
        precioFlete: 50,
      }

      const resultado = calcularDistribucionGYA(venta)

      expect(resultado.bovedaMonte).toBe(6300) // 630 * 10
      expect(resultado.fletes).toBe(500) // 50 * 10
      expect(resultado.utilidades).toBe(3200) // (1000-630-50) * 10
      expect(resultado.total).toBe(10000)
    })

    test("Caso 3: Usa flete por defecto si no se especifica", () => {
      const venta = {
        cantidad: 10,
        precioVenta: 1000,
        precioCompra: 450,
      }

      const resultado = calcularDistribucionGYA(venta)

      expect(resultado.fletes).toBe(5000) // 500 (default) * 10
      expect(resultado.bovedaMonte).toBe(4500) // 450 * 10
      expect(resultado.utilidades).toBe(500) // (1000-450-500) * 10
      expect(resultado.total).toBe(10000)
    })

    test("Caso 4: Cantidad 0 retorna todo en 0", () => {
      const venta = {
        cantidad: 0,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 100,
      }

      const resultado = calcularDistribucionGYA(venta)

      expect(resultado.bovedaMonte).toBe(0)
      expect(resultado.fletes).toBe(0)
      expect(resultado.utilidades).toBe(0)
      expect(resultado.total).toBe(0)
    })

    test("Caso 5: Valida integridad de suma total", () => {
      const venta = {
        cantidad: 50,
        precioVenta: 2000,
        precioCompra: 1200,
        precioFlete: 200,
      }

      const resultado = calcularDistribucionGYA(venta)

      const sumaComponentes = resultado.bovedaMonte + resultado.fletes + resultado.utilidades

      expect(sumaComponentes).toBe(resultado.total)
      expect(resultado.total).toBe(venta.cantidad * venta.precioVenta)
    })
  })

  describe("calcularDistribucionParcial - Pagos Parciales", () => {
    test("Pago parcial 50% distribuye proporcionalmente", () => {
      const distribucionBase = {
        bovedaMonte: 6000,
        fletes: 1000,
        utilidades: 3000,
        total: 10000,
      }

      const resultado = calcularDistribucionParcial(distribucionBase, 5000, 10000)

      expect(resultado.bovedaMonte).toBe(3000) // 50% de 6000
      expect(resultado.fletes).toBe(500) // 50% de 1000
      expect(resultado.utilidades).toBe(1500) // 50% de 3000
      expect(resultado.total).toBe(5000)
    })

    test("Pago parcial 25% distribuye correctamente", () => {
      const distribucionBase = {
        bovedaMonte: 8000,
        fletes: 2000,
        utilidades: 10000,
        total: 20000,
      }

      const resultado = calcularDistribucionParcial(distribucionBase, 5000, 20000)

      expect(resultado.bovedaMonte).toBe(2000) // 25% de 8000
      expect(resultado.fletes).toBe(500) // 25% de 2000
      expect(resultado.utilidades).toBe(2500) // 25% de 10000
      expect(resultado.total).toBe(5000)
    })

    test("Pago 100% devuelve distribución completa", () => {
      const distribucionBase = {
        bovedaMonte: 6000,
        fletes: 1000,
        utilidades: 3000,
        total: 10000,
      }

      const resultado = calcularDistribucionParcial(distribucionBase, 10000, 10000)

      expect(resultado.bovedaMonte).toBe(6000)
      expect(resultado.fletes).toBe(1000)
      expect(resultado.utilidades).toBe(3000)
      expect(resultado.total).toBe(10000)
    })

    test("Pago $0 devuelve distribución vacía", () => {
      const distribucionBase = {
        bovedaMonte: 6000,
        fletes: 1000,
        utilidades: 3000,
        total: 10000,
      }

      const resultado = calcularDistribucionParcial(distribucionBase, 0, 10000)

      expect(resultado.bovedaMonte).toBe(0)
      expect(resultado.fletes).toBe(0)
      expect(resultado.utilidades).toBe(0)
      expect(resultado.total).toBe(0)
    })
  })

  describe("calcularVentaCompleta - Estados de Pago", () => {
    test("Estado COMPLETO: 100% pagado", () => {
      const resultado = calcularVentaCompleta({
        cantidad: 10,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 100,
        montoPagado: 10000,
      })

      expect(resultado.estadoPago).toBe("completo")
      expect(resultado.proporcionPagada).toBe(1)
      expect(resultado.montoRestante).toBe(0)
      expect(resultado.distribucionCapital.bovedaMonte).toBe(6000)
      expect(resultado.distribucionCapital.fletes).toBe(1000)
      expect(resultado.distribucionCapital.utilidades).toBe(3000)
    })

    test("Estado PARCIAL: 50% pagado", () => {
      const resultado = calcularVentaCompleta({
        cantidad: 10,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 100,
        montoPagado: 5000,
      })

      expect(resultado.estadoPago).toBe("parcial")
      expect(resultado.proporcionPagada).toBe(0.5)
      expect(resultado.montoRestante).toBe(5000)
      expect(resultado.distribucionCapital.bovedaMonte).toBe(3000) // 50% de 6000
      expect(resultado.distribucionCapital.fletes).toBe(500) // 50% de 1000
      expect(resultado.distribucionCapital.utilidades).toBe(1500) // 50% de 3000
    })

    test("Estado PENDIENTE: $0 pagado", () => {
      const resultado = calcularVentaCompleta({
        cantidad: 10,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 100,
        montoPagado: 0,
      })

      expect(resultado.estadoPago).toBe("pendiente")
      expect(resultado.proporcionPagada).toBe(0)
      expect(resultado.montoRestante).toBe(10000)
      expect(resultado.distribucionCapital.bovedaMonte).toBe(0)
      expect(resultado.distribucionCapital.fletes).toBe(0)
      expect(resultado.distribucionCapital.utilidades).toBe(0)
    })

    test("Calcula márgenes correctamente", () => {
      const resultado = calcularVentaCompleta({
        cantidad: 10,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 100,
        montoPagado: 10000,
      })

      // Margen bruto = (1000 - 600) / 1000 * 100 = 40%
      expect(resultado.margenBruto).toBe(40)

      // Margen neto = 3000 / 10000 * 100 = 30%
      expect(resultado.margenNeto).toBe(30)

      // Ganancia unitaria = 1000 - 600 - 100 = 300
      expect(resultado.gananciaUnitaria).toBe(300)
    })
  })

  describe("calcularAbonoVenta - Abonos a Ventas Existentes", () => {
    test("Abono $5,000 a venta de $10,000", () => {
      const ventaOriginal = {
        totalVenta: 10000,
        bovedaMonte: 6000,
        fletes: 1000,
        utilidades: 3000,
        montoPagado: 0,
      }

      const resultado = calcularAbonoVenta(ventaOriginal, 5000)

      expect(resultado.nuevoMontoPagado).toBe(5000)
      expect(resultado.nuevoMontoRestante).toBe(5000)
      expect(resultado.nuevoEstadoPago).toBe("parcial")
      expect(resultado.distribucionAbono.bovedaMonte).toBe(3000) // 50% de 6000
      expect(resultado.distribucionAbono.fletes).toBe(500) // 50% de 1000
      expect(resultado.distribucionAbono.utilidades).toBe(1500) // 50% de 3000
    })

    test("Abono que completa el pago", () => {
      const ventaOriginal = {
        totalVenta: 10000,
        bovedaMonte: 6000,
        fletes: 1000,
        utilidades: 3000,
        montoPagado: 3000,
      }

      const resultado = calcularAbonoVenta(ventaOriginal, 7000)

      expect(resultado.nuevoMontoPagado).toBe(10000)
      expect(resultado.nuevoMontoRestante).toBe(0)
      expect(resultado.nuevoEstadoPago).toBe("completo")
    })

    test("Abono no puede exceder monto restante", () => {
      const ventaOriginal = {
        totalVenta: 10000,
        bovedaMonte: 6000,
        fletes: 1000,
        utilidades: 3000,
        montoPagado: 9000,
      }

      const resultado = calcularAbonoVenta(ventaOriginal, 5000)

      // Solo se acepta el monto restante ($1,000)
      expect(resultado.nuevoMontoPagado).toBe(10000)
      expect(resultado.distribucionAbono.total).toBe(1000)
    })
  })

  describe("calcularCapitalBanco - Capital de Bancos", () => {
    test("Capital = Ingresos - Gastos", () => {
      const capital = calcularCapitalBanco(100000, 30000)
      expect(capital).toBe(70000)
    })

    test("Capital puede ser negativo", () => {
      const capital = calcularCapitalBanco(50000, 80000)
      expect(capital).toBe(-30000)
    })

    test("Capital con valores cero", () => {
      const capital = calcularCapitalBanco(0, 0)
      expect(capital).toBe(0)
    })
  })

  describe("validarStockParaVenta - Validación de Stock", () => {
    test("Stock suficiente es válido", () => {
      const resultado = validarStockParaVenta(100, 50)
      expect(resultado.valido).toBe(true)
    })

    test("Stock insuficiente es inválido", () => {
      const resultado = validarStockParaVenta(50, 100)
      expect(resultado.valido).toBe(false)
      expect(resultado.mensaje).toContain("Stock insuficiente")
    })

    test("Cantidad 0 es inválida", () => {
      const resultado = validarStockParaVenta(100, 0)
      expect(resultado.valido).toBe(false)
      expect(resultado.mensaje).toContain("mayor a 0")
    })

    test("Cantidad negativa es inválida", () => {
      const resultado = validarStockParaVenta(100, -10)
      expect(resultado.valido).toBe(false)
    })

    test("Stock exacto es válido", () => {
      const resultado = validarStockParaVenta(100, 100)
      expect(resultado.valido).toBe(true)
    })
  })
})
