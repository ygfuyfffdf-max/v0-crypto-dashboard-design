/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS INFINITY — TESTS EXHAUSTIVOS DE CALCULATIONS.TS (100% COVERAGE)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este archivo complementa calculations.test.ts para alcanzar 100% coverage
 * en el módulo de cálculos. Incluye:
 *
 * - Tests unitarios de TODAS las funciones
 * - Property-based testing con fast-check
 * - Edge cases y boundary conditions
 * - Tests de invariantes matemáticos
 *
 * INVARIANTE FUNDAMENTAL:
 * bovedaMonte + fletes + utilidades = precioVentaUnidad × cantidad
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  calcularAnalisisMargen,
  calcularCantidadReorden,

  // Bancos
  calcularCapitalTotal,
  calcularCostoPorUnidad,
  // Órdenes de Compra
  calcularCostoTotalOrden,
  calcularCrecimiento,
  calcularDeudaOrden,
  // Clientes
  calcularDeudaTotalClientes,
  calcularDiasInventario,
  calcularDiasMora,
  calcularDistribucionVenta,
  // Márgenes
  calcularMargenBruto,
  calcularMargenNeto,
  calcularMontoRestante,
  calcularPorcentajeBanco,
  calcularPorcentajeMargen,
  // Ventas
  calcularPrecioTotalVenta,
  // Proyecciones
  calcularPromedioMovil,
  calcularRentabilidad,
  calcularRotacionInventario,
  calcularTendencia,
  // Inventario
  calcularValorInventario,
  clasificarClienteDeuda,
  determinarEstadoPago,
  // Formato
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
  necesitaReabastecimiento,
  proyectarValorFuturo,
  proyectarVentas,
  redondear,
  validarTransferencia,
  type OrdenCompraData,
  type ProyeccionData,
  // Tipos
  type VentaData,
} from "@/app/lib/utils/calculations"
import * as fc from "fast-check"

// ═══════════════════════════════════════════════════════════════════════════
// ARBITRARIES PARA PROPERTY-BASED TESTING
// ═══════════════════════════════════════════════════════════════════════════

// Generador de VentaData válida
const ventaDataArb = fc
  .record({
    cantidad: fc.integer({ min: 1, max: 1000 }),
    precioVentaUnidad: fc.integer({ min: 100, max: 100000 }),
    precioCompraUnidad: fc.integer({ min: 50, max: 90000 }),
    precioFlete: fc.integer({ min: 0, max: 5000 }),
    montoPagado: fc.option(fc.integer({ min: 0, max: 100000000 }), { nil: undefined }),
  })
  .filter((v) => v.precioCompraUnidad + v.precioFlete <= v.precioVentaUnidad)

// Generador de OrdenCompraData válida
const ordenCompraDataArb = fc.record({
  cantidad: fc.integer({ min: 1, max: 1000 }),
  costoDistribuidor: fc.integer({ min: 100, max: 100000 }),
  costoTransporte: fc.integer({ min: 0, max: 10000 }),
  pagoInicial: fc.option(fc.integer({ min: 0, max: 100000000 }), { nil: undefined }),
})

// Generador de arrays de números positivos
const positiveArrayArb = fc.array(fc.integer({ min: 1, max: 1000000 }), {
  minLength: 1,
  maxLength: 100,
})

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTY-BASED TESTS — INVARIANTES MATEMÁTICOS
// ═══════════════════════════════════════════════════════════════════════════

describe("Property-Based Tests — Invariantes Matemáticos", () => {
  describe("Distribución de Ventas", () => {
    it("INVARIANTE: bovedaMonte + fletes + utilidades = precioVentaUnidad × cantidad (pago completo)", () => {
      fc.assert(
        fc.property(ventaDataArb, (venta) => {
          // Pago completo
          const ventaCompleta = { ...venta, montoPagado: venta.precioVentaUnidad * venta.cantidad }
          const dist = calcularDistribucionVenta(ventaCompleta)

          const suma = dist.bovedaMonte + dist.fletes + dist.utilidades
          const esperado = venta.precioVentaUnidad * venta.cantidad

          return Math.abs(suma - esperado) < 0.01
        }),
        { numRuns: 1000 }
      )
    })

    it("INVARIANTE: distribución proporcional para pagos parciales", () => {
      // Arbitrario específico para este test: sin montoPagado opcional y con precioFlete > 0
      const ventaConFleteArb = fc
        .record({
          cantidad: fc.integer({ min: 1, max: 1000 }),
          precioVentaUnidad: fc.integer({ min: 100, max: 100000 }),
          precioCompraUnidad: fc.integer({ min: 50, max: 90000 }),
          precioFlete: fc.integer({ min: 10, max: 5000 }), // precioFlete > 0 para evitar división por 0
        })
        .filter((v) => v.precioCompraUnidad + v.precioFlete <= v.precioVentaUnidad)

      const proporciones = [0.25, 0.5, 0.75]

      fc.assert(
        fc.property(ventaConFleteArb, fc.constantFrom(...proporciones), (venta, proporcion) => {
          const total = venta.precioVentaUnidad * venta.cantidad
          const montoParcial = total * proporcion

          const distParcial = calcularDistribucionVenta({ ...venta, montoPagado: montoParcial })
          const distCompleta = calcularDistribucionVenta({ ...venta, montoPagado: total })

          // Verificar que la proporción se mantiene en cada componente
          // Tolerancia generosa para manejar precisión de punto flotante
          const tolerancia = 0.05

          // Solo verificar si el valor completo es significativo
          const propBoveda =
            distCompleta.bovedaMonte > 10
              ? Math.abs(distParcial.bovedaMonte / distCompleta.bovedaMonte - proporcion)
              : 0
          const propFletes =
            distCompleta.fletes > 10
              ? Math.abs(distParcial.fletes / distCompleta.fletes - proporcion)
              : 0
          const propUtilidades =
            distCompleta.utilidades > 10
              ? Math.abs(distParcial.utilidades / distCompleta.utilidades - proporcion)
              : 0

          return propBoveda < tolerancia && propFletes < tolerancia && propUtilidades < tolerancia
        }),
        { numRuns: 100 }
      )
    })

    it("INVARIANTE: bovedaMonte = precioCompra × cantidad × proporción", () => {
      fc.assert(
        fc.property(ventaDataArb, (venta) => {
          const total = venta.precioVentaUnidad * venta.cantidad
          // Usar pago completo para simplificar verificación
          const montoPagado = total
          const proporcion = 1

          const dist = calcularDistribucionVenta({ ...venta, montoPagado })
          const esperado = venta.precioCompraUnidad * venta.cantidad * proporcion

          // Verificación exacta para pago completo
          return dist.bovedaMonte === esperado
        }),
        { numRuns: 500 }
      )
    })

    it("INVARIANTE: fletes = precioFlete × cantidad × proporción", () => {
      fc.assert(
        fc.property(ventaDataArb, (venta) => {
          const total = venta.precioVentaUnidad * venta.cantidad
          // Usar pago completo para simplificar verificación
          const montoPagado = total

          const dist = calcularDistribucionVenta({ ...venta, montoPagado })
          const esperado = venta.precioFlete * venta.cantidad

          // Verificación exacta para pago completo
          return dist.fletes === esperado
        }),
        { numRuns: 500 }
      )
    })

    it("INVARIANTE: utilidades = (precioVenta - precioCompra - flete) × cantidad × proporción", () => {
      fc.assert(
        fc.property(ventaDataArb, (venta) => {
          const total = venta.precioVentaUnidad * venta.cantidad
          // Usar pago completo para simplificar verificación
          const montoPagado = total

          const dist = calcularDistribucionVenta({ ...venta, montoPagado })
          const margenUnitario =
            venta.precioVentaUnidad - venta.precioCompraUnidad - venta.precioFlete
          const esperado = margenUnitario * venta.cantidad

          // Verificación exacta para pago completo
          return dist.utilidades === esperado
        }),
        { numRuns: 500 }
      )
    })
  })

  describe("Órdenes de Compra", () => {
    it("INVARIANTE: costo total = (costoDistribuidor × cantidad) + costoTransporte", () => {
      fc.assert(
        fc.property(ordenCompraDataArb, (orden) => {
          const total = calcularCostoTotalOrden(orden)
          const esperado = orden.costoDistribuidor * orden.cantidad + orden.costoTransporte
          return total === esperado
        }),
        { numRuns: 500 }
      )
    })

    it("INVARIANTE: deuda = max(0, total - pagoInicial)", () => {
      fc.assert(
        fc.property(ordenCompraDataArb, (orden) => {
          const total = calcularCostoTotalOrden(orden)
          const deuda = calcularDeudaOrden(orden)
          const esperado = Math.max(0, total - (orden.pagoInicial || 0))
          return deuda === esperado
        }),
        { numRuns: 500 }
      )
    })
  })

  describe("Proyecciones", () => {
    it("INVARIANTE: promedio móvil está entre min y max del período", () => {
      fc.assert(
        fc.property(positiveArrayArb, fc.integer({ min: 1, max: 10 }), (valores, periodo) => {
          if (valores.length < periodo) return true

          const promedio = calcularPromedioMovil(valores, periodo)
          const ultimos = valores.slice(-periodo)
          const min = Math.min(...ultimos)
          const max = Math.max(...ultimos)

          return promedio >= min && promedio <= max
        }),
        { numRuns: 500 }
      )
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE VENTAS
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Ventas — Unit Tests", () => {
  describe("calcularPrecioTotalVenta", () => {
    it("debe calcular total como precioVentaUnidad × cantidad", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 5000,
        precioCompraUnidad: 3000,
        precioFlete: 500,
      }
      expect(calcularPrecioTotalVenta(venta)).toBe(50000)
    })

    it("debe funcionar con cantidad 1", () => {
      const venta: VentaData = {
        cantidad: 1,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
      }
      expect(calcularPrecioTotalVenta(venta)).toBe(10000)
    })

    it("debe manejar cantidades grandes", () => {
      const venta: VentaData = {
        cantidad: 10000,
        precioVentaUnidad: 100,
        precioCompraUnidad: 60,
        precioFlete: 5,
      }
      expect(calcularPrecioTotalVenta(venta)).toBe(1000000)
    })
  })

  describe("calcularMontoRestante", () => {
    it("debe calcular correctamente el monto restante", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
        montoPagado: 50000,
      }
      expect(calcularMontoRestante(venta)).toBe(50000)
    })

    it("debe retornar 0 si pago excede total", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
        montoPagado: 200000,
      }
      expect(calcularMontoRestante(venta)).toBe(0)
    })

    it("debe retornar total completo si no hay pago", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
        montoPagado: 0,
      }
      expect(calcularMontoRestante(venta)).toBe(100000)
    })

    it("debe manejar montoPagado undefined", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
      }
      expect(calcularMontoRestante(venta)).toBe(100000)
    })
  })

  describe("determinarEstadoPago", () => {
    it('debe retornar "completo" cuando monto >= total', () => {
      expect(determinarEstadoPago(100000, 100000)).toBe("completo")
      expect(determinarEstadoPago(100000, 150000)).toBe("completo")
    })

    it('debe retornar "parcial" cuando 0 < monto < total', () => {
      expect(determinarEstadoPago(100000, 50000)).toBe("parcial")
      expect(determinarEstadoPago(100000, 1)).toBe("parcial")
      expect(determinarEstadoPago(100000, 99999)).toBe("parcial")
    })

    it('debe retornar "pendiente" cuando monto = 0', () => {
      expect(determinarEstadoPago(100000, 0)).toBe("pendiente")
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE ÓRDENES DE COMPRA
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Órdenes de Compra — Unit Tests", () => {
  describe("calcularCostoTotalOrden", () => {
    it("debe calcular correctamente el costo total", () => {
      const orden: OrdenCompraData = {
        cantidad: 100,
        costoDistribuidor: 5000,
        costoTransporte: 2000,
      }
      expect(calcularCostoTotalOrden(orden)).toBe(502000)
    })

    it("debe funcionar sin costo de transporte", () => {
      const orden: OrdenCompraData = {
        cantidad: 50,
        costoDistribuidor: 1000,
        costoTransporte: 0,
      }
      expect(calcularCostoTotalOrden(orden)).toBe(50000)
    })
  })

  describe("calcularCostoPorUnidad", () => {
    it("debe calcular costo unitario incluyendo transporte", () => {
      const orden: OrdenCompraData = {
        cantidad: 100,
        costoDistribuidor: 5000,
        costoTransporte: 10000,
      }
      // 5000 + (10000/100) = 5000 + 100 = 5100
      expect(calcularCostoPorUnidad(orden)).toBe(5100)
    })

    it("debe funcionar con transporte = 0", () => {
      const orden: OrdenCompraData = {
        cantidad: 50,
        costoDistribuidor: 1000,
        costoTransporte: 0,
      }
      expect(calcularCostoPorUnidad(orden)).toBe(1000)
    })
  })

  describe("calcularDeudaOrden", () => {
    it("debe calcular deuda correctamente", () => {
      const orden: OrdenCompraData = {
        cantidad: 100,
        costoDistribuidor: 5000,
        costoTransporte: 2000,
        pagoInicial: 200000,
      }
      expect(calcularDeudaOrden(orden)).toBe(302000)
    })

    it("debe retornar 0 si pago inicial excede total", () => {
      const orden: OrdenCompraData = {
        cantidad: 10,
        costoDistribuidor: 1000,
        costoTransporte: 500,
        pagoInicial: 50000,
      }
      expect(calcularDeudaOrden(orden)).toBe(0)
    })

    it("debe retornar total si no hay pago inicial", () => {
      const orden: OrdenCompraData = {
        cantidad: 10,
        costoDistribuidor: 1000,
        costoTransporte: 500,
      }
      expect(calcularDeudaOrden(orden)).toBe(10500)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE MÁRGENES
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Márgenes — Unit Tests", () => {
  describe("calcularMargenBruto", () => {
    it("debe calcular margen bruto correctamente", () => {
      expect(calcularMargenBruto(10000, 6000)).toBe(4000)
    })

    it("debe retornar negativo si costo > precio", () => {
      expect(calcularMargenBruto(5000, 7000)).toBe(-2000)
    })
  })

  describe("calcularMargenNeto", () => {
    it("debe calcular margen neto incluyendo flete", () => {
      expect(calcularMargenNeto(10000, 6000, 500)).toBe(3500)
    })

    it("debe retornar negativo si costo + flete > precio", () => {
      expect(calcularMargenNeto(5000, 4000, 2000)).toBe(-1000)
    })
  })

  describe("calcularPorcentajeMargen", () => {
    it("debe calcular porcentaje correctamente", () => {
      expect(calcularPorcentajeMargen(4000, 10000)).toBe(40)
    })

    it("debe retornar 0 si precio es 0", () => {
      expect(calcularPorcentajeMargen(1000, 0)).toBe(0)
    })
  })

  describe("calcularRentabilidad", () => {
    it("debe calcular rentabilidad sobre costo", () => {
      expect(calcularRentabilidad(4000, 6000)).toBeCloseTo(66.67, 1)
    })

    it("debe retornar 0 si costo es 0", () => {
      expect(calcularRentabilidad(1000, 0)).toBe(0)
    })
  })

  describe("calcularAnalisisMargen", () => {
    it("debe retornar análisis completo", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
      }
      const analisis = calcularAnalisisMargen(venta)

      expect(analisis.margenBruto).toBe(4000)
      expect(analisis.margenNeto).toBe(3500)
      expect(analisis.porcentajeMargen).toBe(35)
      expect(analisis.rentabilidad).toBeCloseTo(53.85, 1)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE INVENTARIO
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Inventario — Unit Tests", () => {
  describe("calcularValorInventario", () => {
    it("debe calcular valor total de inventario", () => {
      const productos = [
        { stockActual: 100, valorUnitario: 1000 },
        { stockActual: 50, valorUnitario: 2000 },
        { stockActual: 25, valorUnitario: 5000 },
      ]
      expect(calcularValorInventario(productos)).toBe(325000)
    })

    it("debe retornar 0 para inventario vacío", () => {
      expect(calcularValorInventario([])).toBe(0)
    })
  })

  describe("calcularRotacionInventario", () => {
    it("debe calcular rotación correctamente", () => {
      expect(calcularRotacionInventario(120000, 50000, 50000)).toBe(2.4)
    })

    it("debe retornar 0 si inventario promedio es 0", () => {
      expect(calcularRotacionInventario(100000, 0, 0)).toBe(0)
    })
  })

  describe("calcularDiasInventario", () => {
    it("debe calcular días de inventario", () => {
      expect(calcularDiasInventario(12)).toBeCloseTo(30.42, 1)
    })

    it("debe retornar 0 si rotación es 0", () => {
      expect(calcularDiasInventario(0)).toBe(0)
    })
  })

  describe("necesitaReabastecimiento", () => {
    it("debe retornar true si stock <= mínimo", () => {
      expect(necesitaReabastecimiento(10, 10)).toBe(true)
      expect(necesitaReabastecimiento(5, 10)).toBe(true)
    })

    it("debe retornar false si stock > mínimo", () => {
      expect(necesitaReabastecimiento(11, 10)).toBe(false)
    })
  })

  describe("calcularCantidadReorden", () => {
    it("debe calcular cantidad de reorden", () => {
      expect(calcularCantidadReorden(5, 10, 100)).toBe(95)
    })

    it("debe retornar 0 si stock > mínimo", () => {
      expect(calcularCantidadReorden(15, 10, 100)).toBe(0)
    })

    it("debe retornar máximo 0", () => {
      expect(calcularCantidadReorden(5, 10, 3)).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE BANCOS
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Bancos — Unit Tests", () => {
  describe("calcularCapitalTotal", () => {
    it("debe sumar saldos de todos los bancos", () => {
      const bancos = [{ saldo: 100000 }, { saldo: 50000 }, { saldo: 25000 }]
      expect(calcularCapitalTotal(bancos)).toBe(175000)
    })

    it("debe retornar 0 para bancos vacíos", () => {
      expect(calcularCapitalTotal([])).toBe(0)
    })
  })

  describe("calcularPorcentajeBanco", () => {
    it("debe calcular porcentaje correctamente", () => {
      expect(calcularPorcentajeBanco(50000, 100000)).toBe(50)
    })

    it("debe retornar 0 si capital total es 0", () => {
      expect(calcularPorcentajeBanco(10000, 0)).toBe(0)
    })
  })

  describe("validarTransferencia", () => {
    it("debe validar transferencia correcta", () => {
      const result = validarTransferencia(100000, 50000)
      expect(result.valido).toBe(true)
      expect(result.mensaje).toBe("Transferencia válida")
    })

    it("debe rechazar monto <= 0", () => {
      const result = validarTransferencia(100000, 0)
      expect(result.valido).toBe(false)
      expect(result.mensaje).toBe("El monto debe ser mayor a 0")
    })

    it("debe rechazar si saldo insuficiente", () => {
      const result = validarTransferencia(50000, 100000)
      expect(result.valido).toBe(false)
      expect(result.mensaje).toBe("Saldo insuficiente en banco origen")
    })

    it("debe rechazar monto negativo", () => {
      const result = validarTransferencia(100000, -5000)
      expect(result.valido).toBe(false)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE PROYECCIONES
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Proyecciones — Unit Tests", () => {
  describe("calcularPromedioMovil", () => {
    it("debe calcular promedio móvil correctamente", () => {
      const valores = [100, 200, 300, 400, 500]
      expect(calcularPromedioMovil(valores, 3)).toBe(400) // (300+400+500)/3
    })

    it("debe retornar 0 si valores < periodo", () => {
      expect(calcularPromedioMovil([100, 200], 5)).toBe(0)
    })
  })

  describe("calcularTendencia", () => {
    it("debe calcular tendencia lineal ascendente", () => {
      const valores = [100, 200, 300, 400, 500]
      const tendencia = calcularTendencia(valores)
      expect(tendencia.pendiente).toBe(100)
      expect(tendencia.intercepto).toBe(100)
    })

    it("debe manejar array de un elemento", () => {
      const tendencia = calcularTendencia([500])
      expect(tendencia.pendiente).toBe(0)
      expect(tendencia.intercepto).toBe(500)
    })

    it("debe manejar array vacío", () => {
      const tendencia = calcularTendencia([])
      expect(tendencia.pendiente).toBe(0)
      expect(tendencia.intercepto).toBe(0)
    })
  })

  describe("proyectarValorFuturo", () => {
    it("debe proyectar valor futuro", () => {
      const valores = [100, 200, 300, 400, 500]
      expect(proyectarValorFuturo(valores, 1)).toBe(600) // intercepto(100) + pendiente(100) * 5
    })

    it("debe retornar mínimo 0", () => {
      const valores = [500, 400, 300, 200, 100]
      // Tendencia descendente, proyección puede ser negativa
      const proyeccion = proyectarValorFuturo(valores, 10)
      expect(proyeccion).toBeGreaterThanOrEqual(0)
    })
  })

  describe("calcularCrecimiento", () => {
    it("debe calcular crecimiento positivo", () => {
      expect(calcularCrecimiento(100, 150)).toBe(50)
    })

    it("debe calcular crecimiento negativo", () => {
      expect(calcularCrecimiento(100, 80)).toBe(-20)
    })

    it("debe retornar 100 si valor anterior es 0 y actual > 0", () => {
      expect(calcularCrecimiento(0, 100)).toBe(100)
    })

    it("debe retornar 0 si ambos valores son 0", () => {
      expect(calcularCrecimiento(0, 0)).toBe(0)
    })
  })

  describe("proyectarVentas", () => {
    it("debe proyectar ventas para múltiples meses", () => {
      const data: ProyeccionData = {
        ventasHistoricas: [100000, 120000, 140000, 160000],
        meses: 3,
      }
      const proyecciones = proyectarVentas(data)

      expect(proyecciones).toHaveLength(3)
      expect(proyecciones[0]).toBeGreaterThan(160000)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE CLIENTES
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Clientes — Unit Tests", () => {
  describe("calcularDeudaTotalClientes", () => {
    it("debe sumar deudas de todos los clientes", () => {
      const clientes = [{ deudaTotal: 10000 }, { deudaTotal: 25000 }, { deudaTotal: 5000 }]
      expect(calcularDeudaTotalClientes(clientes)).toBe(40000)
    })

    it("debe retornar 0 para clientes vacíos", () => {
      expect(calcularDeudaTotalClientes([])).toBe(0)
    })
  })

  describe("clasificarClienteDeuda", () => {
    const limites = { bajo: 10000, medio: 50000 }

    it("debe clasificar como bajo", () => {
      expect(clasificarClienteDeuda(5000, limites)).toBe("bajo")
      expect(clasificarClienteDeuda(10000, limites)).toBe("bajo")
    })

    it("debe clasificar como medio", () => {
      expect(clasificarClienteDeuda(10001, limites)).toBe("medio")
      expect(clasificarClienteDeuda(50000, limites)).toBe("medio")
    })

    it("debe clasificar como alto", () => {
      expect(clasificarClienteDeuda(50001, limites)).toBe("alto")
      expect(clasificarClienteDeuda(100000, limites)).toBe("alto")
    })
  })

  describe("calcularDiasMora", () => {
    it("debe calcular días de mora correctamente", () => {
      const fechaVenta = new Date("2025-12-01")
      const fechaActual = new Date("2025-12-23")
      expect(calcularDiasMora(fechaVenta, fechaActual)).toBe(22)
    })

    it("debe retornar 0 para fechas futuras", () => {
      const fechaVenta = new Date("2025-12-30")
      const fechaActual = new Date("2025-12-23")
      expect(calcularDiasMora(fechaVenta, fechaActual)).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITARIOS — FUNCIONES DE FORMATO
// ═══════════════════════════════════════════════════════════════════════════

describe("Funciones de Formato — Unit Tests", () => {
  describe("formatearMoneda", () => {
    it("debe formatear como moneda MXN", () => {
      const resultado = formatearMoneda(1234567.89)
      expect(resultado).toContain("1,234,567")
      // Puede contener MXN o $
      expect(resultado.includes("MXN") || resultado.includes("$")).toBe(true)
    })
  })

  describe("formatearPorcentaje", () => {
    it("debe formatear con decimales por defecto", () => {
      expect(formatearPorcentaje(45.678)).toBe("45.7%")
    })

    it("debe formatear con decimales especificados", () => {
      expect(formatearPorcentaje(45.678, 2)).toBe("45.68%")
    })
  })

  describe("formatearNumero", () => {
    it("debe formatear con separadores", () => {
      const resultado = formatearNumero(1234567)
      // Puede usar coma o punto como separador de miles
      expect(resultado.includes("1,234,567") || resultado.includes("1.234.567")).toBe(true)
    })
  })

  describe("redondear", () => {
    it("debe redondear a 2 decimales por defecto", () => {
      expect(redondear(3.14159)).toBe(3.14)
    })

    it("debe redondear a decimales especificados", () => {
      expect(redondear(3.14159, 3)).toBe(3.142)
    })

    it("debe redondear hacia arriba cuando corresponde", () => {
      expect(redondear(3.145, 2)).toBe(3.15)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// EDGE CASES Y BOUNDARY CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("Edge Cases y Boundary Conditions", () => {
  describe("Valores extremos", () => {
    it("debe manejar cantidades muy grandes", () => {
      const venta: VentaData = {
        cantidad: 1000000,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 500,
        montoPagado: 10000000000,
      }
      const dist = calcularDistribucionVenta(venta)
      expect(dist.total).toBe(10000000000)
    })

    it("debe manejar precios muy pequeños", () => {
      const venta: VentaData = {
        cantidad: 1,
        precioVentaUnidad: 1,
        precioCompraUnidad: 0.5,
        precioFlete: 0.1,
        montoPagado: 1,
      }
      const dist = calcularDistribucionVenta(venta)
      expect(dist.total).toBe(1)
      expect(dist.bovedaMonte).toBeCloseTo(0.5, 2)
    })
  })

  describe("Casos límite de distribución", () => {
    it("debe manejar flete = 0", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 10000,
        precioCompraUnidad: 6000,
        precioFlete: 0,
        montoPagado: 100000,
      }
      const dist = calcularDistribucionVenta(venta)
      expect(dist.fletes).toBe(0)
      expect(dist.bovedaMonte + dist.utilidades).toBe(100000)
    })

    it("debe manejar margen = 0", () => {
      const venta: VentaData = {
        cantidad: 10,
        precioVentaUnidad: 6500,
        precioCompraUnidad: 6000,
        precioFlete: 500,
        montoPagado: 65000,
      }
      const dist = calcularDistribucionVenta(venta)
      expect(dist.utilidades).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// TESTS DE REGRESIÓN
// ═══════════════════════════════════════════════════════════════════════════

describe("Tests de Regresión", () => {
  it("BUG FIX: calcularPrecioTotalVenta no debe sumar flete (ya incluido)", () => {
    // Antes del fix: total = (precioVentaUnidad + precioFlete) × cantidad (INCORRECTO)
    // Después del fix: total = precioVentaUnidad × cantidad (CORRECTO)
    const venta: VentaData = {
      cantidad: 10,
      precioVentaUnidad: 10000,
      precioCompraUnidad: 6300,
      precioFlete: 500,
      montoPagado: 100000,
    }

    const total = calcularPrecioTotalVenta(venta)

    // El total debe ser 100,000, NO 105,000
    expect(total).toBe(100000)
    expect(total).not.toBe(105000) // Asegurar que no se suma el flete
  })

  it("INVARIANTE: Sum(distribuciones) = total siempre", () => {
    const venta: VentaData = {
      cantidad: 10,
      precioVentaUnidad: 10000,
      precioCompraUnidad: 6300,
      precioFlete: 500,
      montoPagado: 100000,
    }
    const dist = calcularDistribucionVenta(venta)

    // bovedaMonte(63000) + fletes(5000) + utilidades(32000) = 100000
    expect(dist.bovedaMonte + dist.fletes + dist.utilidades).toBe(dist.total)
    expect(dist.total).toBe(100000)
  })
})
