/**
 * Tests para validaciones de integridad matemática
 */

import {
  validateGYADistribution,
  validateClientBalance,
  validateBankCapital,
  validateStock,
  validateProportionalPayment,
  type VentaValidation,
  type ClienteValidation,
  type BancoValidation,
  type ProductoValidation,
} from "@/app/lib/validation/mathIntegrity"

describe("Validaciones de Integridad Matemática", () => {
  describe("validateGYADistribution", () => {
    it("debe validar distribución correcta", () => {
      const venta: VentaValidation = {
        id: "1",
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6300,
        precioFlete: 500,
        cantidad: 10,
        montoPagado: 100000,
        estadoPago: "completo",
      }

      const result = validateGYADistribution(venta)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.details?.gananciaNeta).toBe(32000)
    })

    it("debe detectar pérdidas", () => {
      const venta: VentaValidation = {
        id: "1",
        precioVentaUnidad: 1000,
        precioCompraUnidad: 1500,
        precioFlete: 100,
        cantidad: 1,
        montoPagado: 1000,
        estadoPago: "completo",
      }

      const result = validateGYADistribution(venta)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain("pérdida")
    })
  })

  describe("validateClientBalance", () => {
    it("debe validar balance correcto", () => {
      const cliente: ClienteValidation = {
        id: "1",
        nombre: "Test",
        totalCompras: 10000,
        totalPagado: 6000,
        saldoPendiente: 4000,
        limiteCredito: 5000,
      }

      const result = validateClientBalance(cliente)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("debe detectar balance inconsistente", () => {
      const cliente: ClienteValidation = {
        id: "1",
        nombre: "Test",
        totalCompras: 10000,
        totalPagado: 6000,
        saldoPendiente: 5000,
        limiteCredito: 8000,
      }

      const result = validateClientBalance(cliente)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes("inconsistente"))).toBe(true)
    })
  })

  describe("validateBankCapital", () => {
    it("debe validar capital correcto", () => {
      const banco: BancoValidation = {
        id: "boveda_monte",
        capitalActual: 100000,
        historicoIngresos: 150000,
        historicoGastos: 50000,
        historicoTransferencias: 0,
      }

      const result = validateBankCapital(banco)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe("validateStock", () => {
    it("debe validar stock suficiente", () => {
      const producto: ProductoValidation = {
        id: "1",
        nombre: "Test",
        stockDisponible: 100,
        stockReservado: 20,
        stockMinimo: 10,
      }

      const result = validateStock(producto, 50)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("debe detectar stock insuficiente", () => {
      const producto: ProductoValidation = {
        id: "1",
        nombre: "Test",
        stockDisponible: 100,
        stockReservado: 80,
        stockMinimo: 10,
      }

      const result = validateStock(producto, 50)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes("insuficiente"))).toBe(true)
    })
  })

  describe("validateProportionalPayment", () => {
    it("debe validar abono proporcional correcto", () => {
      const venta: VentaValidation = {
        id: "1",
        precioVentaUnidad: 100,
        precioCompraUnidad: 60,
        precioFlete: 10,
        cantidad: 10,
        montoPagado: 500,
        estadoPago: "parcial",
      }

      const result = validateProportionalPayment(venta, 500)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.details?.proporcion).toBe(0.5)
    })

    it("debe detectar abono mayor al total", () => {
      const venta: VentaValidation = {
        id: "1",
        precioVentaUnidad: 100,
        precioCompraUnidad: 60,
        precioFlete: 10,
        cantidad: 1,
        montoPagado: 0,
        estadoPago: "pendiente",
      }

      const result = validateProportionalPayment(venta, 200)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes("mayor"))).toBe(true)
    })
  })
})
