/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS CORE BUSINESS LOGIC TESTS - Tests de Lógica de Negocio GYA
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Tests unitarios exhaustivos para la lógica de negocio GYA (Ganancia y Asignación)
 * Objetivo: 90% cobertura en cálculos financieros, validaciones y triggers
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { 
  calcularDistribucionGYA, 
  calcularVentaCompleta,
  validarVenta,
  aplicarDescuentos,
  calcularComisiones,
  FLETE_DEFAULT 
} from '@/app/_lib/gya-formulas'
import { db } from '@/database'
import { ventas, clientes, bancos, almacen } from '@/database/schema'
import { eq } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 MOCK DATA - Datos de prueba
// ═══════════════════════════════════════════════════════════════════════════════

const mockVentaData = {
  id: 'venta-test-001',
  clienteId: 'cliente-test-001',
  productoId: 'producto-test-001',
  cantidad: 10,
  precioVenta: 1500,
  precioCompra: 800,
  precioFlete: 50,
  fecha: new Date('2024-01-15')
}

const mockClienteData = {
  id: 'cliente-test-001',
  nombre: 'Cliente Test',
  limiteCredito: 50000,
  saldoPendiente: 5000,
  scoreCredito: 75
}

const mockProductoData = {
  id: 'producto-test-001',
  nombre: 'Producto Test',
  stockActual: 100,
  stockMinimo: 20,
  precioVenta: 1500,
  precioCompra: 800
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧮 GYA CALCULATIONS TESTS - Tests de Cálculos GYA
// ═══════════════════════════════════════════════════════════════════════════════

describe('GYA Calculations', () => {
  describe('calcularDistribucionGYA', () => {
    test('should calculate correct GYA distribution for standard sale', () => {
      const venta = {
        cantidad: 10,
        precioVenta: 1500,
        precioCompra: 800,
        precioFlete: 50
      }
      
      const resultado = calcularDistribucionGYA(venta)
      
      // Bóveda Monte = precioCompra × cantidad = 800 × 10 = 8000
      expect(resultado.montoBovedaMonte).toBe(8000)
      
      // Flete Sur = precioFlete × cantidad = 50 × 10 = 500
      expect(resultado.montoFletes).toBe(500)
      
      // Utilidades = (precioVenta - precioCompra - precioFlete) × cantidad
      // = (1500 - 800 - 50) × 10 = 650 × 10 = 6500
      expect(resultado.montoUtilidades).toBe(6500)
      
      // Total venta = precioVenta × cantidad = 1500 × 10 = 15000
      expect(resultado.precioTotalVenta).toBe(15000)
      
      // Margen neto = utilidades / total venta × 100 = 6500 / 15000 × 100 = 43.33%
      expect(resultado.margenNeto).toBeCloseTo(43.33, 2)
      
      // Margen bruto = utilidades / (costo + flete) × 100 = 6500 / 8500 × 100 = 76.47%
      expect(resultado.margenBruto).toBeCloseTo(76.47, 2)
    })

    test('should handle zero flete price correctly', () => {
      const venta = {
        cantidad: 5,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 0
      }
      
      const resultado = calcularDistribucionGYA(venta)
      
      expect(resultado.montoBovedaMonte).toBe(3000)
      expect(resultado.montoFletes).toBe(0)
      expect(resultado.montoUtilidades).toBe(2000)
      expect(resultado.precioTotalVenta).toBe(5000)
    })

    test('should handle large quantities correctly', () => {
      const venta = {
        cantidad: 1000,
        precioVenta: 500,
        precioCompra: 300,
        precioFlete: 25
      }
      
      const resultado = calcularDistribucionGYA(venta)
      
      expect(resultado.montoBovedaMonte).toBe(300000)
      expect(resultado.montoFletes).toBe(25000)
      expect(resultado.montoUtilidades).toBe(175000)
      expect(resultado.precioTotalVenta).toBe(500000)
    })

    test('should handle decimal prices correctly', () => {
      const venta = {
        cantidad: 3,
        precioVenta: 123.45,
        precioCompra: 67.89,
        precioFlete: 5.67
      }
      
      const resultado = calcularDistribucionGYA(venta)
      
      expect(resultado.montoBovedaMonte).toBeCloseTo(203.67, 2)
      expect(resultado.montoFletes).toBeCloseTo(17.01, 2)
      expect(resultado.montoUtilidades).toBeCloseTo(152.67, 2)
      expect(resultado.precioTotalVenta).toBeCloseTo(370.35, 2)
    })

    test('should throw error for negative quantities', () => {
      const venta = {
        cantidad: -5,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 50
      }
      
      expect(() => calcularDistribucionGYA(venta)).toThrow('La cantidad debe ser mayor a 0')
    })

    test('should throw error for zero quantities', () => {
      const venta = {
        cantidad: 0,
        precioVenta: 1000,
        precioCompra: 600,
        precioFlete: 50
      }
      
      expect(() => calcularDistribucionGYA(venta)).toThrow('La cantidad debe ser mayor a 0')
    })

    test('should throw error for negative prices', () => {
      const venta = {
        cantidad: 10,
        precioVenta: -1000,
        precioCompra: 600,
        precioFlete: 50
      }
      
      expect(() => calcularDistribucionGYA(venta)).toThrow('Los precios deben ser mayores a 0')
    })
  })

  describe('calcularVentaCompleta', () => {
    test('should calculate complete sale with all components', () => {
      const ventaData = {
        cantidad: 10,
        precioVenta: 1500,
        precioCompra: 800,
        precioFlete: 50,
        clienteId: 'cliente-001',
        productoId: 'producto-001'
      }
      
      const resultado = calcularVentaCompleta(ventaData)
      
      expect(resultado.totalVenta).toBe(15000)
      expect(resultado.ingresoVenta).toBe(15000)
      expect(resultado.costoTotal).toBe(8000)
      expect(resultado.fleteTotal).toBe(500)
      expect(resultado.utilidadNeta).toBe(6500)
      expect(resultado.margenNeto).toBeCloseTo(43.33, 2)
      expect(resultado.estadoPago).toBe('pendiente')
    })

    test('should handle partial payment correctly', () => {
      const ventaData = {
        cantidad: 10,
        precioVenta: 1500,
        precioCompra: 800,
        precioFlete: 50,
        montoPagado: 5000,
        clienteId: 'cliente-001',
        productoId: 'producto-001'
      }
      
      const resultado = calcularVentaCompleta(ventaData)
      
      expect(resultado.totalVenta).toBe(15000)
      expect(resultado.montoPagado).toBe(5000)
      expect(resultado.montoRestante).toBe(10000)
      expect(resultado.estadoPago).toBe('parcial')
      expect(resultado.porcentajePagado).toBeCloseTo(33.33, 2)
    })

    test('should handle full payment correctly', () => {
      const ventaData = {
        cantidad: 10,
        precioVenta: 1500,
        precioCompra: 800,
        precioFlete: 50,
        montoPagado: 15000,
        clienteId: 'cliente-001',
        productoId: 'producto-001'
      }
      
      const resultado = calcularVentaCompleta(ventaData)
      
      expect(resultado.totalVenta).toBe(15000)
      expect(resultado.montoPagado).toBe(15000)
      expect(resultado.montoRestante).toBe(0)
      expect(resultado.estadoPago).toBe('completo')
      expect(resultado.porcentajePagado).toBe(100)
    })
  })

  describe('validarVenta', () => {
    test('should validate correct sale data', () => {
      const ventaData = {
        cantidad: 10,
        precioVenta: 1500,
        precioCompra: 800,
        precioFlete: 50,
        clienteId: 'cliente-001',
        productoId: 'producto-001'
      }
      
      const resultado = validarVenta(ventaData)
      
      expect(resultado.isValid).toBe(true)
      expect(resultado.errors).toHaveLength(0)
    })

    test('should validate missing required fields', () => {
      const ventaData = {
        cantidad: 10,
        precioVenta: 1500,
        // Missing precioCompra
        precioFlete: 50,
        clienteId: 'cliente-001',
        productoId: 'producto-001'
      }
      
      const resultado = validarVenta(ventaData)
      
      expect(resultado.isValid).toBe(false)
      expect(resultado.errors).toContain('precioCompra es requerido')
    })

    test('should validate stock availability', () => {
      const ventaData = {
        cantidad: 150, // More than available stock
        precioVenta: 1500,
        precioCompra: 800,
        precioFlete: 50,
        clienteId: 'cliente-001',
        productoId: 'producto-001',
        stockDisponible: 100
      }
      
      const resultado = validarVenta(ventaData)
      
      expect(resultado.isValid).toBe(false)
      expect(resultado.errors).toContain('Stock insuficiente')
    })

    test('should validate client credit limit', () => {
      const ventaData = {
        cantidad: 10,
        precioVenta: 1500,
        precioCompra: 800,
        precioFlete: 50,
        clienteId: 'cliente-001',
        productoId: 'producto-001',
        limiteCreditoCliente: 10000,
        deudaActualCliente: 5000,
        totalVenta: 15000
      }
      
      const resultado = validarVenta(ventaData)
      
      expect(resultado.isValid).toBe(false)
      expect(resultado.errors).toContain('Límite de crédito excedido')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 💰 COMMISSIONS AND DISCOUNTS TESTS - Tests de Comisiones y Descuentos
// ═══════════════════════════════════════════════════════════════════════════════

describe('Comisiones y Descuentos', () => {
  describe('calcularComisiones', () => {
    test('should calculate commissions correctly', () => {
      const ventaData = {
        totalVenta: 15000,
        utilidadNeta: 6500,
        tipoComision: 'porcentaje_venta',
        porcentajeComision: 5
      }
      
      const resultado = calcularComisiones(ventaData)
      
      expect(resultado.montoComision).toBe(750) // 5% de 15000
      expect(resultado.tipoComision).toBe('porcentaje_venta')
      expect(resultado.baseCalculo).toBe(15000)
    })

    test('should calculate profit-based commissions', () => {
      const ventaData = {
        totalVenta: 15000,
        utilidadNeta: 6500,
        tipoComision: 'porcentaje_utilidad',
        porcentajeComision: 10
      }
      
      const resultado = calcularComisiones(ventaData)
      
      expect(resultado.montoComision).toBe(650) // 10% de 6500
      expect(resultado.tipoComision).toBe('porcentaje_utilidad')
      expect(resultado.baseCalculo).toBe(6500)
    })

    test('should handle fixed amount commissions', () => {
      const ventaData = {
        totalVenta: 15000,
        utilidadNeta: 6500,
        tipoComision: 'monto_fijo',
        montoComisionFijo: 500
      }
      
      const resultado = calcularComisiones(ventaData)
      
      expect(resultado.montoComision).toBe(500)
      expect(resultado.tipoComision).toBe('monto_fijo')
      expect(resultado.baseCalculo).toBe(500)
    })
  })

  describe('aplicarDescuentos', () => {
    test('should apply percentage discounts correctly', () => {
      const ventaData = {
        totalVenta: 15000,
        tipoDescuento: 'porcentaje',
        porcentajeDescuento: 10
      }
      
      const resultado = aplicarDescuentos(ventaData)
      
      expect(resultado.montoDescuento).toBe(1500) // 10% de 15000
      expect(resultado.totalConDescuento).toBe(13500)
      expect(resultado.porcentajeDescuentoAplicado).toBe(10)
    })

    test('should apply fixed amount discounts', () => {
      const ventaData = {
        totalVenta: 15000,
        tipoDescuento: 'monto_fijo',
        montoDescuentoFijo: 2000
      }
      
      const resultado = aplicarDescuentos(ventaData)
      
      expect(resultado.montoDescuento).toBe(2000)
      expect(resultado.totalConDescuento).toBe(13000)
      expect(resultado.porcentajeDescuentoAplicado).toBeCloseTo(13.33, 2)
    })

    test('should handle bulk discounts', () => {
      const ventaData = {
        totalVenta: 50000,
        cantidad: 100,
        tipoDescuento: 'volumen',
        umbralesDescuento: [
          { min: 50, max: 99, descuento: 5 },
          { min: 100, max: Infinity, descuento: 10 }
        ]
      }
      
      const resultado = aplicarDescuentos(ventaData)
      
      expect(resultado.montoDescuento).toBe(5000) // 10% de 50000
      expect(resultado.totalConDescuento).toBe(45000)
      expect(resultado.tipoDescuentoAplicado).toBe('volumen')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 TRIGGER TESTS - Tests de Triggers Automáticos
// ═══════════════════════════════════════════════════════════════════════════════

describe('Triggers Automáticos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('triggerPostVenta', () => {
    test('should update client metrics after sale', async () => {
      const ventaId = 'venta-test-001'
      const clienteId = 'cliente-test-001'
      
      // Mock database calls
      jest.spyOn(db, 'select').mockResolvedValue([
        { id: ventaId, clienteId, precioTotalVenta: 15000, montoPagado: 0, montoRestante: 15000 }
      ])
      
      jest.spyOn(db, 'update').mockResolvedValue({ changes: 1 })
      
      // Execute trigger
      const resultado = await triggerPostVenta(clienteId)
      
      expect(resultado).toBeDefined()
      expect(db.update).toHaveBeenCalled()
    })

    test('should update bank balances correctly', async () => {
      const ventaId = 'venta-test-001'
      const distribucion = {
        montoBovedaMonte: 8000,
        montoFletes: 500,
        montoUtilidades: 6500
      }
      
      jest.spyOn(db, 'update').mockResolvedValue({ changes: 1 })
      
      // Execute bank updates
      await actualizarBancosPostVenta(distribucion)
      
      expect(db.update).toHaveBeenCalledTimes(3) // 3 bancos
    })

    test('should update inventory correctly', async () => {
      const ventaData = {
        productoId: 'producto-test-001',
        cantidad: 10,
        stockAnterior: 100
      }
      
      jest.spyOn(db, 'update').mockResolvedValue({ changes: 1 })
      
      await actualizarInventarioPostVenta(ventaData)
      
      expect(db.update).toHaveBeenCalledWith(
        almacen,
        { stockActual: 90 },
        expect.any(Object)
      )
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 EDGE CASES AND ERROR HANDLING - Casos Edge y Manejo de Errores
// ═══════════════════════════════════════════════════════════════════════════════

describe('Edge Cases and Error Handling', () => {
  test('should handle very large numbers', () => {
    const venta = {
      cantidad: 1000000,
      precioVenta: 999999.99,
      precioCompra: 500000.50,
      precioFlete: 25000.25
    }
    
    const resultado = calcularDistribucionGYA(venta)
    
    expect(resultado.montoBovedaMonte).toBe(500000500000)
    expect(resultado.montoFletes).toBe(25000250000)
    expect(resultado.montoUtilidades).toBe(474999240000)
    expect(resultado.precioTotalVenta).toBe(999999990000)
  })

  test('should handle very small numbers', () => {
    const venta = {
      cantidad: 1,
      precioVenta: 0.01,
      precioCompra: 0.005,
      precioFlete: 0.001
    }
    
    const resultado = calcularDistribucionGYA(venta)
    
    expect(resultado.montoBovedaMonte).toBeCloseTo(0.005, 6)
    expect(resultado.montoFletes).toBeCloseTo(0.001, 6)
    expect(resultado.montoUtilidades).toBeCloseTo(0.004, 6)
    expect(resultado.precioTotalVenta).toBeCloseTo(0.01, 6)
  })

  test('should handle floating point precision', () => {
    const venta = {
      cantidad: 3,
      precioVenta: 100.33,
      precioCompra: 33.33,
      precioFlete: 10.00
    }
    
    const resultado = calcularDistribucionGYA(venta)
    
    // Check that calculations are consistent
    const totalCalculated = resultado.montoBovedaMonte + resultado.montoFletes + resultado.montoUtilidades
    expect(totalCalculated).toBeCloseTo(resultado.precioTotalVenta, 2)
  })

  test('should validate data types', () => {
    const ventaData = {
      cantidad: '10', // String instead of number
      precioVenta: 1500,
      precioCompra: 800,
      precioFlete: 50
    }
    
    expect(() => validarVenta(ventaData)).toThrow()
  })

  test('should handle null values gracefully', () => {
    const ventaData = {
      cantidad: 10,
      precioVenta: null,
      precioCompra: 800,
      precioFlete: 50
    }
    
    expect(() => validarVenta(ventaData)).toThrow()
  })

  test('should handle undefined values gracefully', () => {
    const ventaData = {
      cantidad: 10,
      precioVenta: undefined,
      precioCompra: 800,
      precioFlete: 50
    }
    
    expect(() => validarVenta(ventaData)).toThrow()
  })
})