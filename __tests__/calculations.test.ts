/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS 2026 — TESTS DE CÁLCULOS MATEMÁTICOS (15 CASOS)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests que verifican los 15 casos matemáticos documentados en
 * docs/casos_matematicos.md
 *
 * Todos los cálculos deben coincidir exactamente con la documentación.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  calcularDistribucionVenta,
  calcularMontoRestante,
  calcularPrecioTotalVenta,
  determinarEstadoPago,
  type VentaData,
} from "@/app/lib/utils/calculations"

describe("15 Casos Matemáticos - CHRONOS 2026", () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 1: Venta Completa con Flete
  // ═══════════════════════════════════════════════════════════════════════════

  // NOTA IMPORTANTE: precioVentaUnidad YA INCLUYE el flete
  // Por lo tanto: total = precioVentaUnidad × cantidad

  describe("Caso 1: Venta Completa con Flete", () => {
    // Total = 10,000 × 10 = 100,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 10,
      precioVentaUnidad: 10000,
      precioCompraUnidad: 6300,
      precioFlete: 500,
      montoPagado: 100000,
    }

    it("debe calcular precio total correcto", () => {
      const total = calcularPrecioTotalVenta(venta)
      expect(total).toBe(100000) // precioVentaUnidad × cantidad
    })

    it("debe distribuir correctamente en los 3 bancos", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(63000) // 6,300 × 10
      expect(dist.fletes).toBe(5000) // 500 × 10
      expect(dist.utilidades).toBe(32000) // (10,000 - 6,300 - 500) × 10
      expect(dist.total).toBe(100000) // precioVentaUnidad × cantidad
    })

    it("debe estar pagado completamente", () => {
      const estado = determinarEstadoPago(100000, 100000)
      expect(estado).toBe("completo")
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 2: Venta Sin Flete
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 2: Venta Sin Flete", () => {
    const venta: VentaData = {
      cantidad: 5,
      precioVentaUnidad: 8000,
      precioCompraUnidad: 5000,
      precioFlete: 0,
      montoPagado: 40000,
    }

    it("debe calcular distribución sin flete", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(25000) // 5,000 × 5
      expect(dist.fletes).toBe(0)
      expect(dist.utilidades).toBe(15000) // (8,000 - 5,000) × 5
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 3: Pago Parcial (50%)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 3: Pago Parcial 50%", () => {
    // Total = 15,000 × 20 = 300,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 20,
      precioVentaUnidad: 15000,
      precioCompraUnidad: 10000,
      precioFlete: 800,
      montoPagado: 150000, // 50% de 300,000
    }

    it("debe aplicar proporción 0.5 a todos los bancos", () => {
      const dist = calcularDistribucionVenta(venta)

      // Base: bovedaMonte=200,000, fletes=16,000, utilidades=84,000
      // Con 50%: 100,000 / 8,000 / 42,000
      expect(dist.bovedaMonte).toBe(100000)
      expect(dist.fletes).toBe(8000)
      expect(dist.utilidades).toBe(42000)
    })

    it("debe ser pago parcial", () => {
      const estado = determinarEstadoPago(300000, 150000)
      expect(estado).toBe("parcial")
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 4: Venta Pendiente (0%)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 4: Venta Pendiente", () => {
    // Total = 12,000 × 8 = 96,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 8,
      precioVentaUnidad: 12000,
      precioCompraUnidad: 7500,
      precioFlete: 600,
      montoPagado: 0,
    }

    it("debe marcar como pendiente", () => {
      const estado = determinarEstadoPago(96000, 0)
      expect(estado).toBe("pendiente")
    })

    it("debe calcular deuda total", () => {
      const total = calcularPrecioTotalVenta(venta)
      expect(total).toBe(96000) // precioVentaUnidad × cantidad
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 5: Venta Grande (15 unidades) - ✅ CORREGIDO
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 5: Venta Grande - CORREGIDO", () => {
    // Total = 12,000 × 15 = 180,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 15,
      precioVentaUnidad: 12000,
      precioCompraUnidad: 7000,
      precioFlete: 800,
      montoPagado: 180000,
    }

    it("debe calcular utilidades correctamente (63,000)", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(105000) // 7,000 × 15
      expect(dist.fletes).toBe(12000) // 800 × 15
      expect(dist.utilidades).toBe(63000) // (12,000 - 7,000 - 800) × 15 = 4,200 × 15
    })

    it("la suma debe ser el total", () => {
      const dist = calcularDistribucionVenta(venta)
      const suma = dist.bovedaMonte + dist.fletes + dist.utilidades
      expect(suma).toBe(180000) // precioVentaUnidad × cantidad
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 6: Venta con Alto Margen
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 6: Alto Margen (60%)", () => {
    // Total = 25,000 × 3 = 75,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 3,
      precioVentaUnidad: 25000,
      precioCompraUnidad: 10000,
      precioFlete: 1000,
      montoPagado: 75000,
    }

    it("debe tener alto margen en utilidades", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.utilidades).toBe(42000) // (25,000 - 10,000 - 1,000) × 3

      // Margen: 42,000 / 75,000 = 56%
      const margen = (dist.utilidades / dist.total) * 100
      expect(margen).toBeGreaterThan(50)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 7: Pago Parcial (25%)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 7: Pago Parcial 25%", () => {
    // Total = 18,000 × 12 = 216,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 12,
      precioVentaUnidad: 18000,
      precioCompraUnidad: 12000,
      precioFlete: 900,
      montoPagado: 54000, // 25% de 216,000
    }

    it("debe aplicar proporción 0.25", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(36000) // 144,000 × 0.25
      expect(dist.fletes).toBe(2700) // 10,800 × 0.25
      expect(dist.utilidades).toBe(15300) // 61,200 × 0.25
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 8: Ventas Múltiples Mismo Cliente - ✅ CORREGIDO
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 8: Ventas Múltiples - CORREGIDO", () => {
    // Venta 1: Total = 10,000 × 5 = 50,000
    const venta1: VentaData = {
      cantidad: 5,
      precioVentaUnidad: 10000,
      precioCompraUnidad: 6000,
      precioFlete: 400,
      montoPagado: 50000,
    }

    // Venta 2: Total = 15,000 × 8 = 120,000
    const venta2: VentaData = {
      cantidad: 8,
      precioVentaUnidad: 15000,
      precioCompraUnidad: 9000,
      precioFlete: 600,
      montoPagado: 120000,
    }

    // Venta 3: Total = 12,000 × 10 = 120,000
    const venta3: VentaData = {
      cantidad: 10,
      precioVentaUnidad: 12000,
      precioCompraUnidad: 7500,
      precioFlete: 600,
      montoPagado: 120000,
    }

    it("debe acumular fletes correctamente (12,800)", () => {
      const dist1 = calcularDistribucionVenta(venta1)
      const dist2 = calcularDistribucionVenta(venta2)
      const dist3 = calcularDistribucionVenta(venta3)

      const totalFletes = dist1.fletes + dist2.fletes + dist3.fletes
      expect(totalFletes).toBe(12800) // ✅ 2,000 + 4,800 + 6,000 = 12,800
    })

    it("debe acumular utilidades correctamente (100,200)", () => {
      const dist1 = calcularDistribucionVenta(venta1)
      const dist2 = calcularDistribucionVenta(venta2)
      const dist3 = calcularDistribucionVenta(venta3)

      const totalUtilidades = dist1.utilidades + dist2.utilidades + dist3.utilidades
      expect(totalUtilidades).toBe(100200) // ✅ 18,000 + 43,200 + 39,000
    })

    it("debe acumular bóveda monte correctamente (177,000)", () => {
      const dist1 = calcularDistribucionVenta(venta1)
      const dist2 = calcularDistribucionVenta(venta2)
      const dist3 = calcularDistribucionVenta(venta3)

      const totalBoveda = dist1.bovedaMonte + dist2.bovedaMonte + dist3.bovedaMonte
      expect(totalBoveda).toBe(177000) // 30,000 + 72,000 + 75,000
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 9: Bajo Margen (15%)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 9: Bajo Margen", () => {
    // Total = 8,500 × 25 = 212,500 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 25,
      precioVentaUnidad: 8500,
      precioCompraUnidad: 7000,
      precioFlete: 200,
      montoPagado: 212500,
    }

    it("debe tener bajo margen", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.utilidades).toBe(32500) // (8,500 - 7,000 - 200) × 25

      const margen = (dist.utilidades / dist.total) * 100
      expect(margen).toBeLessThan(20)
      expect(margen).toBeGreaterThan(10)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 10: Pago Parcial (75%)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 10: Pago Parcial 75%", () => {
    // Total = 20,000 × 6 = 120,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 6,
      precioVentaUnidad: 20000,
      precioCompraUnidad: 13000,
      precioFlete: 1200,
      montoPagado: 90000, // 75% de 120,000
    }

    it("debe aplicar proporción 0.75", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(58500) // 78,000 × 0.75
      expect(dist.fletes).toBe(5400) // 7,200 × 0.75
      expect(dist.utilidades).toBe(26100) // 34,800 × 0.75
    })

    it("debe calcular deuda restante", () => {
      const restante = calcularMontoRestante(venta)
      expect(restante).toBe(30000) // 120,000 - 90,000
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 11: Venta Unitaria Premium
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 11: Venta Unitaria", () => {
    // Total = 50,000 × 1 = 50,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 1,
      precioVentaUnidad: 50000,
      precioCompraUnidad: 30000,
      precioFlete: 2000,
      montoPagado: 50000,
    }

    it("debe funcionar con 1 unidad", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(30000)
      expect(dist.fletes).toBe(2000)
      expect(dist.utilidades).toBe(18000)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 12: Flete Alto
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 12: Flete Alto", () => {
    // Total = 14,000 × 7 = 98,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 7,
      precioVentaUnidad: 14000,
      precioCompraUnidad: 8500,
      precioFlete: 2500, // 18% del precio
      montoPagado: 98000,
    }

    it("debe manejar flete alto correctamente", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.fletes).toBe(17500) // 2,500 × 7
      expect(dist.utilidades).toBe(21000) // (14,000 - 8,500 - 2,500) × 7

      // Flete es ~18% del precio venta
      const porcentajeFlete = (dist.fletes / (venta.precioVentaUnidad * venta.cantidad)) * 100
      expect(porcentajeFlete).toBeGreaterThan(15)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 13: Pago Parcial (10%)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 13: Enganche Mínimo 10%", () => {
    // Total = 22,000 × 15 = 330,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 15,
      precioVentaUnidad: 22000,
      precioCompraUnidad: 15000,
      precioFlete: 1000,
      montoPagado: 33000, // 10% de 330,000
    }

    it("debe aplicar proporción 0.10", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(22500) // 225,000 × 0.10
      expect(dist.fletes).toBe(1500) // 15,000 × 0.10
      expect(dist.utilidades).toBe(9000) // 90,000 × 0.10
    })

    it("debe tener alta deuda restante", () => {
      const restante = calcularMontoRestante(venta)
      expect(restante).toBeGreaterThan(290000) // 330,000 - 33,000 = 297,000
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 14: Mayoreo (50 unidades)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 14: Venta al Mayoreo", () => {
    // Total = 9,000 × 50 = 450,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 50,
      precioVentaUnidad: 9000,
      precioCompraUnidad: 6500,
      precioFlete: 300,
      montoPagado: 450000,
    }

    it("debe manejar volumen alto", () => {
      const dist = calcularDistribucionVenta(venta)

      expect(dist.bovedaMonte).toBe(325000) // 6,500 × 50
      expect(dist.fletes).toBe(15000) // 300 × 50
      expect(dist.utilidades).toBe(110000) // (9,000 - 6,500 - 300) × 50
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // CASO 15: Margen Excepcional
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Caso 15: Margen Excepcional", () => {
    // Total = 30,000 × 4 = 120,000 (precioVenta YA incluye flete)
    const venta: VentaData = {
      cantidad: 4,
      precioVentaUnidad: 30000,
      precioCompraUnidad: 12000,
      precioFlete: 1500,
      montoPagado: 120000,
    }

    it("debe tener margen excepcional", () => {
      const dist = calcularDistribucionVenta(venta)

      // utilidades = (30,000 - 12,000 - 1,500) × 4 = 16,500 × 4 = 66,000
      expect(dist.utilidades).toBe(66000)

      const margen = (dist.utilidades / dist.total) * 100
      expect(margen).toBeGreaterThan(50) // 66,000 / 120,000 = 55%
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICACIONES INVARIANTES
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Verificaciones Invariantes", () => {
    it("la suma de distribuciones siempre debe igualar el total", () => {
      // NOTA: precioVentaUnidad ya incluye el flete
      const casos: VentaData[] = [
        {
          cantidad: 10,
          precioVentaUnidad: 10000,
          precioCompraUnidad: 6300,
          precioFlete: 500,
          montoPagado: 100000,
        },
        {
          cantidad: 5,
          precioVentaUnidad: 8000,
          precioCompraUnidad: 5000,
          precioFlete: 0,
          montoPagado: 40000,
        },
        {
          cantidad: 15,
          precioVentaUnidad: 12000,
          precioCompraUnidad: 7000,
          precioFlete: 800,
          montoPagado: 180000,
        },
      ]

      casos.forEach((venta, idx) => {
        const dist = calcularDistribucionVenta(venta)
        const suma = dist.bovedaMonte + dist.fletes + dist.utilidades

        // La suma debe igualar el precio venta total
        const precioVentaTotal = venta.precioVentaUnidad * venta.cantidad
        expect(suma).toBe(precioVentaTotal)
      })
    })

    it("pagos parciales deben mantener proporción uniforme", () => {
      const ventaBase: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
      }

      const proporciones = [0.25, 0.5, 0.75]

      proporciones.forEach((prop) => {
        // precioVentaUnidad ya incluye el flete
        const precioTotal = ventaBase.precioVentaUnidad * ventaBase.cantidad
        const montoPagado = precioTotal * prop

        const dist = calcularDistribucionVenta({ ...ventaBase, montoPagado })
        const distCompleta = calcularDistribucionVenta({ ...ventaBase, montoPagado: precioTotal })

        // Verificar proporción
        expect(dist.bovedaMonte / distCompleta.bovedaMonte).toBeCloseTo(prop, 2)
        expect(dist.fletes / distCompleta.fletes).toBeCloseTo(prop, 2)
        expect(dist.utilidades / distCompleta.utilidades).toBeCloseTo(prop, 2)
      })
    })

    it("ventas pendientes no deben afectar bancos", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
        montoPagado: 0,
      }

      const estado = determinarEstadoPago(calcularPrecioTotalVenta(venta), 0)
      expect(estado).toBe("pendiente")

      // En la implementación real, las ventas pendientes no afectan capital
      // Solo se registran como deuda
    })
  })
})
