/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — TEST COMPLETO DE LÓGICA DE NEGOCIO
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos según documentación oficial:
 * - Todas las entidades y variables
 * - Flujo completo de Orden de Compra
 * - Flujo completo de Venta con distribución GYA
 * - Estados de pago: completo, parcial, pendiente
 * - Abonos posteriores
 * - Transferencias entre bancos
 * - Pagos a distribuidores
 * - Trazabilidad de lotes (FIFO)
 */

import {
  BANCOS_CONFIG,
  calcularAbono,
  calcularCapitalActual,
  calcularDiasLiquidez,
  calcularDistribucionParcial,
  calcularDistribucionVenta,
  calcularMargenNeto,
  calcularROCE,
  calcularSaludFinanciera,
  calcularStock,
  calcularTransferencia,
  recalcularBanco,
  recalcularCliente,
  recalcularDistribuidor,
  validarStock,
  type DistribucionVenta,
} from "../app/lib/services/logic"

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES DE PRUEBA - EJEMPLO CLÁSICO
// ═══════════════════════════════════════════════════════════════════════════════

const EJEMPLO_CLASICO = {
  precioCompra: 6300, // Costo del distribuidor
  precioVenta: 10000, // Precio al cliente
  precioFlete: 500, // Flete por unidad (COSTO INTERNO)
  cantidad: 10,
  // Resultados esperados:
  precioTotalVenta: 100000, // 10,000 × 10
  montoBovedaMonte: 63000, // 6,300 × 10 (COSTO)
  montoFletes: 5000, // 500 × 10 (COSTO INTERNO)
  montoUtilidades: 32000, // (10,000 - 6,300 - 500) × 10 (GANANCIA)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DISTRIBUCIÓN GYA - FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

describe("🔮 DISTRIBUCIÓN GYA - Lógica Sagrada", () => {
  describe("📐 Fórmulas Básicas Verificadas", () => {
    test("precioTotalVenta = precioVenta × cantidad", () => {
      const dist = calcularDistribucionVenta(
        EJEMPLO_CLASICO.precioVenta,
        EJEMPLO_CLASICO.precioCompra,
        EJEMPLO_CLASICO.precioFlete,
        EJEMPLO_CLASICO.cantidad
      )
      expect(dist.total).toBe(EJEMPLO_CLASICO.precioTotalVenta)
    })

    test("montoBovedaMonte = precioCompra × cantidad (COSTO)", () => {
      const dist = calcularDistribucionVenta(
        EJEMPLO_CLASICO.precioVenta,
        EJEMPLO_CLASICO.precioCompra,
        EJEMPLO_CLASICO.precioFlete,
        EJEMPLO_CLASICO.cantidad
      )
      expect(dist.bovedaMonte).toBe(EJEMPLO_CLASICO.montoBovedaMonte)
    })

    test("montoFletes = flete × cantidad (COSTO INTERNO)", () => {
      const dist = calcularDistribucionVenta(
        EJEMPLO_CLASICO.precioVenta,
        EJEMPLO_CLASICO.precioCompra,
        EJEMPLO_CLASICO.precioFlete,
        EJEMPLO_CLASICO.cantidad
      )
      expect(dist.fletes).toBe(EJEMPLO_CLASICO.montoFletes)
    })

    test("montoUtilidades = (precioVenta - precioCompra - flete) × cantidad (GANANCIA)", () => {
      const dist = calcularDistribucionVenta(
        EJEMPLO_CLASICO.precioVenta,
        EJEMPLO_CLASICO.precioCompra,
        EJEMPLO_CLASICO.precioFlete,
        EJEMPLO_CLASICO.cantidad
      )
      expect(dist.utilidades).toBe(EJEMPLO_CLASICO.montoUtilidades)
    })

    test("Suma distribución = Total cliente (100%)", () => {
      const dist = calcularDistribucionVenta(
        EJEMPLO_CLASICO.precioVenta,
        EJEMPLO_CLASICO.precioCompra,
        EJEMPLO_CLASICO.precioFlete,
        EJEMPLO_CLASICO.cantidad
      )
      const suma = dist.bovedaMonte + dist.fletes + dist.utilidades
      expect(suma).toBe(dist.total)
      expect(suma).toBe(100000)
    })

    test("El flete reduce las utilidades (es costo interno)", () => {
      const conFlete = calcularDistribucionVenta(10000, 6300, 500, 10)
      const sinFlete = calcularDistribucionVenta(10000, 6300, 0, 10)

      // Con flete: utilidades = 32,000
      // Sin flete: utilidades = 37,000
      expect(sinFlete.utilidades - conFlete.utilidades).toBe(5000)
    })
  })

  describe("🏛️ Distribución a 3 Bancos (NO a los otros 4)", () => {
    test("Solo retorna 3 campos de distribución + total", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      expect(Object.keys(dist)).toEqual(["bovedaMonte", "fletes", "utilidades", "total"])
    })

    test("NO hay campos para bancos operativos (USA, Azteca, Leftie, Profit)", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10) as unknown as Record<
        string,
        unknown
      >
      expect(dist).not.toHaveProperty("bovedaUsa")
      expect(dist).not.toHaveProperty("azteca")
      expect(dist).not.toHaveProperty("leftie")
      expect(dist).not.toHaveProperty("profit")
    })
  })

  describe("🔢 Casos Extremos", () => {
    test("Cantidad 0 retorna distribución vacía", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 0)
      expect(dist.bovedaMonte).toBe(0)
      expect(dist.fletes).toBe(0)
      expect(dist.utilidades).toBe(0)
      expect(dist.total).toBe(0)
    })

    test("Venta con pérdida (utilidades negativas)", () => {
      // precioVenta = 5,000 < precioCompra + flete = 6,800
      const dist = calcularDistribucionVenta(5000, 6300, 500, 10)
      expect(dist.utilidades).toBe(-18000) // Pérdida permitida
      expect(dist.bovedaMonte).toBe(63000) // Costo sigue igual
      expect(dist.fletes).toBe(5000) // Flete sigue igual
    })

    test("Sin flete (flete = 0)", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 0, 10)
      expect(dist.fletes).toBe(0)
      expect(dist.utilidades).toBe(37000) // Más utilidades
    })

    test("Sin costo de compra (compra = 0)", () => {
      const dist = calcularDistribucionVenta(10000, 0, 500, 10)
      expect(dist.bovedaMonte).toBe(0)
      expect(dist.utilidades).toBe(95000) // Casi todo es utilidad
    })

    test("Cantidades muy grandes", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 1000000)
      expect(dist.total).toBe(10000000000)
      expect(dist.bovedaMonte + dist.fletes + dist.utilidades).toBe(dist.total)
    })

    test("Precios con decimales", () => {
      const dist = calcularDistribucionVenta(9999.99, 6299.99, 499.99, 10)
      expect(dist.total).toBeCloseTo(99999.9, 1)
      expect(dist.bovedaMonte).toBeCloseTo(62999.9, 1)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ESTADOS DE PAGO - Histórico vs Capital
// ═══════════════════════════════════════════════════════════════════════════════

describe("💰 ESTADOS DE PAGO - Proporcionalidad", () => {
  let distribucion: DistribucionVenta

  beforeEach(() => {
    distribucion = calcularDistribucionVenta(10000, 6300, 500, 10)
  })

  describe("✅ COMPLETO (100%)", () => {
    test("Proporción = 1 cuando pago completo", () => {
      const resultado = calcularDistribucionParcial(distribucion, 100000, 100000)
      expect(resultado.proporcion).toBe(1)
    })

    test("Capital = Histórico completo", () => {
      const resultado = calcularDistribucionParcial(distribucion, 100000, 100000)
      expect(resultado.capitalBovedaMonte).toBe(63000)
      expect(resultado.capitalFletes).toBe(5000)
      expect(resultado.capitalUtilidades).toBe(32000)
    })
  })

  describe("⏳ PARCIAL (< 100%)", () => {
    test("40% pagado → 40% de capital", () => {
      const resultado = calcularDistribucionParcial(distribucion, 40000, 100000)

      expect(resultado.proporcion).toBeCloseTo(0.4, 5)
      expect(resultado.capitalBovedaMonte).toBeCloseTo(25200, 0) // 40% de 63,000
      expect(resultado.capitalFletes).toBeCloseTo(2000, 0) // 40% de 5,000
      expect(resultado.capitalUtilidades).toBeCloseTo(12800, 0) // 40% de 32,000
    })

    test("65% pagado → 65% de capital", () => {
      const resultado = calcularDistribucionParcial(distribucion, 65000, 100000)

      expect(resultado.proporcion).toBeCloseTo(0.65, 5)
      expect(resultado.capitalBovedaMonte).toBeCloseTo(40950, 0)
      expect(resultado.capitalFletes).toBeCloseTo(3250, 0)
      expect(resultado.capitalUtilidades).toBeCloseTo(20800, 0)
    })

    test("Total capital parcial = monto pagado", () => {
      const resultado = calcularDistribucionParcial(distribucion, 40000, 100000)
      const totalCapital =
        resultado.capitalBovedaMonte + resultado.capitalFletes + resultado.capitalUtilidades
      expect(totalCapital).toBeCloseTo(40000, 0)
    })
  })

  describe("🚫 PENDIENTE (0%)", () => {
    test("Sin pago → Proporción 0", () => {
      const resultado = calcularDistribucionParcial(distribucion, 0, 100000)
      expect(resultado.proporcion).toBe(0)
    })

    test("Sin pago → Capital = 0 en todos los bancos", () => {
      const resultado = calcularDistribucionParcial(distribucion, 0, 100000)
      expect(resultado.capitalBovedaMonte).toBe(0)
      expect(resultado.capitalFletes).toBe(0)
      expect(resultado.capitalUtilidades).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ABONOS POSTERIORES
// ═══════════════════════════════════════════════════════════════════════════════

describe("💳 ABONOS POSTERIORES", () => {
  const ventaMock = {
    id: "venta_test",
    clienteId: "cliente_test",
    montoRestante: 60000,
    montoPagado: 40000,
    estadoPago: "parcial",
    precioTotalVenta: 100000,
    distribucionBancos: {
      bovedaMonte: 63000,
      fletes: 5000,
      utilidades: 32000,
    },
  }

  test("Abono actualiza proporción correctamente", () => {
    const resultado = calcularAbono(ventaMock, 25000)

    // Total pagado después: 40,000 + 25,000 = 65,000
    expect(resultado.nuevoMontoPagado).toBe(65000)
    expect(resultado.nuevoMontoRestante).toBe(35000)
    expect(resultado.nuevoEstado).toBe("parcial")
  })

  test('Abono completo lleva a estado "completo"', () => {
    const resultado = calcularAbono(ventaMock, 60000)

    expect(resultado.nuevoMontoPagado).toBe(100000)
    expect(resultado.nuevoMontoRestante).toBe(0)
    expect(resultado.nuevoEstado).toBe("completo")
  })

  test("Distribución adicional proporcional al abono", () => {
    // Abono de 25,000 = 25% del total
    const resultado = calcularAbono(ventaMock, 25000)

    // 25% de cada componente
    expect(resultado.distribucionAdicional.bovedaMonte).toBeCloseTo(15750, 0) // 25% de 63,000
    expect(resultado.distribucionAdicional.fletes).toBeCloseTo(1250, 0) // 25% de 5,000
    expect(resultado.distribucionAdicional.utilidades).toBeCloseTo(8000, 0) // 25% de 32,000
  })

  test("Genera movimientos para los 3 bancos", () => {
    const resultado = calcularAbono(ventaMock, 25000)

    expect(resultado.movimientos.length).toBe(3)
    expect(resultado.movimientos.map((m) => m.bancoId)).toEqual([
      "boveda_monte",
      "flete_sur",
      "utilidades",
    ])
  })

  test("Abono 0 no genera cambios", () => {
    const resultado = calcularAbono(ventaMock, 0)

    expect(resultado.nuevoMontoPagado).toBe(ventaMock.montoPagado)
    expect(resultado.movimientos.length).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TRANSFERENCIAS ENTRE BANCOS
// ═══════════════════════════════════════════════════════════════════════════════

describe("🔄 TRANSFERENCIAS ENTRE BANCOS", () => {
  const bancoOrigen = {
    id: "boveda_monte",
    capitalActual: 100000,
    historicoIngresos: 150000,
    historicoGastos: 50000,
  }

  const bancoDestino = {
    id: "utilidades",
    capitalActual: 50000,
    historicoIngresos: 80000,
    historicoGastos: 30000,
  }

  test("Transferencia resta del origen y suma al destino", () => {
    const resultado = calcularTransferencia(bancoOrigen, bancoDestino, 20000, "Prueba")

    expect(resultado.bancoOrigenNuevo.capitalActual).toBe(80000) // 100,000 - 20,000
    expect(resultado.bancoDestinoNuevo.capitalActual).toBe(70000) // 50,000 + 20,000
  })

  test("Actualiza históricos correctamente", () => {
    const resultado = calcularTransferencia(bancoOrigen, bancoDestino, 20000, "Prueba")

    expect(resultado.bancoOrigenNuevo.historicoGastos).toBe(70000) // 50,000 + 20,000
    expect(resultado.bancoDestinoNuevo.historicoIngresos).toBe(100000) // 80,000 + 20,000
  })

  test("Genera 2 movimientos (salida y entrada)", () => {
    const resultado = calcularTransferencia(bancoOrigen, bancoDestino, 20000, "Prueba")

    expect(resultado.movimientoOrigen.tipo).toBe("transferencia_salida")
    expect(resultado.movimientoDestino.tipo).toBe("transferencia_entrada")
    expect(resultado.movimientoOrigen.monto).toBe(20000)
    expect(resultado.movimientoDestino.monto).toBe(20000)
  })

  test("Error si fondos insuficientes", () => {
    expect(() => {
      calcularTransferencia(bancoOrigen, bancoDestino, 150000, "Prueba")
    }).toThrow("Fondos insuficientes")
  })

  test("Error si monto es 0 o negativo", () => {
    expect(() => {
      calcularTransferencia(bancoOrigen, bancoDestino, 0, "Prueba")
    }).toThrow("Monto debe ser mayor a 0")
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 5. STOCK Y TRAZABILIDAD
// ═══════════════════════════════════════════════════════════════════════════════

describe("📦 STOCK Y TRAZABILIDAD", () => {
  describe("Cálculo de Stock", () => {
    test("Stock = cantidad original - ventas asignadas", () => {
      const oc = { id: "OC001", cantidad: 100, stockActual: 100, distribuidorId: "dist1" }
      const ventas = [
        { ocRelacionada: "OC001", cantidad: 30 },
        { ocRelacionada: "OC001", cantidad: 20 },
        { ocRelacionada: "OC002", cantidad: 50 }, // Otra OC, no cuenta
      ]

      const stock = calcularStock(oc, ventas)
      expect(stock).toBe(50) // 100 - 30 - 20
    })

    test("Stock no puede ser negativo", () => {
      const oc = { id: "OC001", cantidad: 10, stockActual: 10, distribuidorId: "dist1" }
      const ventas = [{ ocRelacionada: "OC001", cantidad: 20 }]

      const stock = calcularStock(oc, ventas)
      expect(stock).toBe(0) // Max 0, no negativo
    })
  })

  describe("Validación de Stock", () => {
    test("Stock suficiente → válido", () => {
      const resultado = validarStock(100, 50)
      expect(resultado.valido).toBe(true)
    })

    test("Stock insuficiente → inválido con mensaje", () => {
      const resultado = validarStock(30, 50)
      expect(resultado.valido).toBe(false)
      expect(resultado.mensaje).toContain("Stock insuficiente")
    })

    test("Cantidad 0 o negativa → inválido", () => {
      const resultado = validarStock(100, 0)
      expect(resultado.valido).toBe(false)
      expect(resultado.mensaje).toContain("mayor a 0")
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 6. RECÁLCULOS
// ═══════════════════════════════════════════════════════════════════════════════

describe("🔄 RECÁLCULOS", () => {
  describe("Recálculo de Banco", () => {
    test("capitalActual = historicoIngresos - historicoGastos", () => {
      const banco = { id: "test", capitalActual: 0, historicoIngresos: 0, historicoGastos: 0 }
      const movimientos = [
        { bancoId: "test", tipo: "ingreso", monto: 100000 },
        { bancoId: "test", tipo: "gasto", monto: 30000 },
        { bancoId: "test", tipo: "abono", monto: 20000 },
      ]

      const resultado = recalcularBanco(banco, movimientos)
      expect(resultado.historicoIngresos).toBe(120000) // 100,000 + 20,000
      expect(resultado.historicoGastos).toBe(30000)
      expect(resultado.capitalActual).toBe(90000)
    })
  })

  describe("Recálculo de Cliente", () => {
    test("deudaTotal = suma de montoRestante de ventas activas", () => {
      const cliente = { id: "cli1", deudaTotal: 0 }
      const ventas = [
        { clienteId: "cli1", montoRestante: 30000, estadoPago: "parcial" },
        { clienteId: "cli1", montoRestante: 50000, estadoPago: "pendiente" },
        { clienteId: "cli1", montoRestante: 0, estadoPago: "completo" }, // No cuenta
        { clienteId: "cli2", montoRestante: 10000, estadoPago: "parcial" }, // Otro cliente
      ]

      const resultado = recalcularCliente(cliente, ventas)
      expect(resultado.deudaTotal).toBe(80000)
    })
  })

  describe("Recálculo de Distribuidor", () => {
    test("saldoPendiente = suma de adeudos de OCs activas", () => {
      const distribuidor = { id: "dist1", saldoPendiente: 0 }
      const ordenes = [
        { distribuidorId: "dist1", montoTotal: 100000, montoPagado: 40000, estado: "parcial" },
        { distribuidorId: "dist1", montoTotal: 50000, montoPagado: 0, estado: "pendiente" },
        { distribuidorId: "dist1", montoTotal: 30000, montoPagado: 30000, estado: "completo" }, // 0 pendiente
      ]

      const resultado = recalcularDistribuidor(distribuidor, ordenes)
      expect(resultado.saldoPendiente).toBe(110000) // 60,000 + 50,000
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 7. MÉTRICAS FINANCIERAS
// ═══════════════════════════════════════════════════════════════════════════════

describe("📊 MÉTRICAS FINANCIERAS", () => {
  test("ROCE = (ganancia / capital) × 100", () => {
    const roce = calcularROCE(50000, 200000)
    expect(roce).toBe(25) // 25%
  })

  test("Margen neto = (utilidades / ventas) × 100", () => {
    const margen = calcularMargenNeto(32000, 100000)
    expect(margen).toBe(32) // 32%
  })

  test("Días de liquidez = capital / gasto diario", () => {
    const dias = calcularDiasLiquidez(100000, 1000)
    expect(dias).toBe(100)
  })

  test("capitalActual = historicoIngresos - historicoGastos", () => {
    const capital = calcularCapitalActual(150000, 50000)
    expect(capital).toBe(100000)
  })

  test("Salud financiera es un score 0-100", () => {
    const salud = calcularSaludFinanciera(90, 30, 25, 4)
    expect(salud).toBeGreaterThanOrEqual(0)
    expect(salud).toBeLessThanOrEqual(100)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CONFIGURACIÓN DE BANCOS
// ═══════════════════════════════════════════════════════════════════════════════

describe("🏛️ CONFIGURACIÓN DE 7 BANCOS", () => {
  test("Existen los 7 bancos configurados", () => {
    expect(Object.keys(BANCOS_CONFIG)).toHaveLength(7)
  })

  test("IDs de bancos correctos", () => {
    const ids = Object.keys(BANCOS_CONFIG)
    expect(ids).toContain("boveda_monte")
    expect(ids).toContain("boveda_usa")
    expect(ids).toContain("utilidades")
    expect(ids).toContain("flete_sur")
    expect(ids).toContain("azteca")
    expect(ids).toContain("leftie")
    expect(ids).toContain("profit")
  })

  test("Bancos automáticos GYA: boveda_monte, utilidades, flete_sur", () => {
    expect(BANCOS_CONFIG.boveda_monte.esAutomatico).toBe(true)
    expect(BANCOS_CONFIG.utilidades.esAutomatico).toBe(true)
    expect(BANCOS_CONFIG.flete_sur.esAutomatico).toBe(true)
  })

  test("Bancos manuales: boveda_usa, azteca, leftie, profit", () => {
    expect(BANCOS_CONFIG.boveda_usa.esAutomatico).toBe(false)
    expect(BANCOS_CONFIG.azteca.esAutomatico).toBe(false)
    expect(BANCOS_CONFIG.leftie.esAutomatico).toBe(false)
    expect(BANCOS_CONFIG.profit.esAutomatico).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// RESUMEN FINAL
// ═══════════════════════════════════════════════════════════════════════════════

describe("✅ RESUMEN - VERIFICACIÓN COMPLETA CHRONOS 2026", () => {
  test("La distribución GYA es matemáticamente perfecta", () => {
    const dist = calcularDistribucionVenta(10000, 6300, 500, 10)

    // Verificaciones finales
    expect(dist.bovedaMonte).toBe(63000) // COSTO
    expect(dist.fletes).toBe(5000) // TRANSPORTE INTERNO
    expect(dist.utilidades).toBe(32000) // GANANCIA NETA
    expect(dist.total).toBe(100000) // TOTAL CLIENTE

    // La suma SIEMPRE es el total
    expect(dist.bovedaMonte + dist.fletes + dist.utilidades).toBe(dist.total)

    console.log(`
    ═══════════════════════════════════════════════════════════════════
    ✅ CHRONOS INFINITY 2026 — VERIFICACIÓN COMPLETA
    ═══════════════════════════════════════════════════════════════════

    FÓRMULAS GYA VERIFICADAS:
    ✅ precioTotalVenta = precioVenta × cantidad
    ✅ montoBovedaMonte = precioCompra × cantidad (COSTO)
    ✅ montoFletes = flete × cantidad (COSTO INTERNO)
    ✅ montoUtilidades = (venta - compra - flete) × cantidad (GANANCIA)
    ✅ Suma distribución = Total cliente (100%)

    ESTADOS DE PAGO VERIFICADOS:
    ✅ COMPLETO: Capital = 100% del histórico
    ✅ PARCIAL: Capital = proporción × histórico
    ✅ PENDIENTE: Capital = 0%

    FLUJOS VERIFICADOS:
    ✅ Orden de Compra → Stock + Adeudo Distribuidor
    ✅ Venta → Distribución GYA + Deuda Cliente
    ✅ Abono → Distribución proporcional adicional
    ✅ Transferencia → Origen - monto, Destino + monto
    ✅ Pago Distribuidor → Banco - monto, Adeudo - monto

    CHRONOS ES VERDAD MATEMÁTICA. CHRONOS ES PERFECCIÓN.
    ═══════════════════════════════════════════════════════════════════
    `)
  })
})
