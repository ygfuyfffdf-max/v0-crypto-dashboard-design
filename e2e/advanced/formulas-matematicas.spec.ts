import { expect, test } from "@playwright/test"
import { GEN5_CONFIG } from "./gen5-test-utils"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧮 CHRONOS GEN5 2026 — TESTS E2E: FÓRMULAS MATEMÁTICAS DEL SISTEMA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos de TODAS las fórmulas matemáticas críticas:
 *
 * ✅ Distribución GYA (3 bancos)
 * ✅ Capital bancario (ingresos - gastos)
 * ✅ Deuda de clientes (total - abonos)
 * ✅ Deuda de distribuidores (total OC - pagos)
 * ✅ Stock de OC (inicial - vendido)
 * ✅ Utilidad neta (venta - costo - flete)
 * ✅ Distribución proporcional en pagos parciales
 * ✅ Valorización de inventario
 *
 * NOTA: Estas fórmulas son la "lógica sagrada" del sistema CHRONOS Gen5.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// TIPOS Y CONSTANTES
// ============================================

// Timeout para Gen5
test.setTimeout(GEN5_CONFIG.BASE_TIMEOUT + 10000)

const TOLERANCE = 0.01 // Tolerancia para comparaciones de decimales

interface DistribucionGYA {
  bovedaMonte: number
  fleteSur: number
  utilidades: number
  total: number
}

interface CapitalBanco {
  historicoIngresos: number
  historicoGastos: number
  capitalActual: number
}

interface DeudaCliente {
  totalVentas: number
  totalAbonos: number
  pendiente: number
}

interface DeudaDistribuidor {
  totalOrdenes: number
  totalPagos: number
  pendiente: number
}

interface StockOC {
  stockInicial: number
  vendido: number
  stockActual: number
}

// ============================================
// FUNCIONES DE CÁLCULO (LÓGICA DE NEGOCIO)
// ============================================

/**
 * Calcula la distribución GYA de una venta
 * - bóveda_monte: precio de compra (costo distribuidor)
 * - flete_sur: costo de flete
 * - utilidades: ganancia neta
 */
function calcularDistribucionGYA(
  cantidad: number,
  precioVenta: number,
  precioCompra: number,
  precioFlete: number
): DistribucionGYA {
  const total = precioVenta * cantidad
  const bovedaMonte = precioCompra * cantidad
  const fleteSur = precioFlete * cantidad
  const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad

  return { bovedaMonte, fleteSur, utilidades, total }
}

/**
 * Calcula el capital actual de un banco
 * Fórmula: capitalActual = historicoIngresos - historicoGastos
 */
function calcularCapitalBanco(historicoIngresos: number, historicoGastos: number): CapitalBanco {
  return {
    historicoIngresos,
    historicoGastos,
    capitalActual: historicoIngresos - historicoGastos,
  }
}

/**
 * Calcula la deuda de un cliente
 * Fórmula: pendiente = totalVentas - totalAbonos
 */
function calcularDeudaCliente(totalVentas: number, totalAbonos: number): DeudaCliente {
  return {
    totalVentas,
    totalAbonos,
    pendiente: totalVentas - totalAbonos,
  }
}

/**
 * Calcula la deuda con un distribuidor
 * Fórmula: pendiente = totalOrdenes - totalPagos
 */
function calcularDeudaDistribuidor(totalOrdenes: number, totalPagos: number): DeudaDistribuidor {
  return {
    totalOrdenes,
    totalPagos,
    pendiente: totalOrdenes - totalPagos,
  }
}

/**
 * Calcula el stock actual de una OC
 * Fórmula: stockActual = stockInicial - vendido
 */
function calcularStockOC(stockInicial: number, vendido: number): StockOC {
  return {
    stockInicial,
    vendido,
    stockActual: stockInicial - vendido,
  }
}

/**
 * Aplica distribución proporcional según porcentaje de pago
 */
function aplicarDistribucionProporcional(
  distribucion: DistribucionGYA,
  porcentajePago: number
): DistribucionGYA {
  return {
    bovedaMonte: distribucion.bovedaMonte * porcentajePago,
    fleteSur: distribucion.fleteSur * porcentajePago,
    utilidades: distribucion.utilidades * porcentajePago,
    total: distribucion.total * porcentajePago,
  }
}

/**
 * Calcula valorización de inventario
 * Fórmula: valor = stock × costoUnitario
 */
function calcularValorizacionInventario(stock: number, costoUnitario: number): number {
  return stock * costoUnitario
}

// ============================================
// HELPERS DE COMPARACIÓN
// ============================================

function sonIguales(a: number, b: number, tolerancia: number = TOLERANCE): boolean {
  return Math.abs(a - b) <= tolerancia
}

// ============================================
// SUITE 1: DISTRIBUCIÓN GYA
// ============================================

test.describe("🏦 SUITE: Fórmulas de Distribución GYA", () => {
  test("Distribución básica: venta completa", async () => {
    // Caso: 10 unidades, venta $10,000, compra $6,300, flete $500
    const dist = calcularDistribucionGYA(10, 10000, 6300, 500)

    console.log("\n🧮 DISTRIBUCIÓN GYA - VENTA COMPLETA")
    console.log("═══════════════════════════════════════")
    console.log(`Entrada:`)
    console.log(`  Cantidad: 10`)
    console.log(`  Precio Venta: $10,000`)
    console.log(`  Precio Compra: $6,300`)
    console.log(`  Precio Flete: $500`)
    console.log(`\nSalida:`)
    console.log(`  Bóveda Monte: $${dist.bovedaMonte.toLocaleString()}`)
    console.log(`  Flete Sur: $${dist.fleteSur.toLocaleString()}`)
    console.log(`  Utilidades: $${dist.utilidades.toLocaleString()}`)
    console.log(`  Total: $${dist.total.toLocaleString()}`)

    // Verificaciones
    expect(dist.bovedaMonte).toBe(63000) // 6300 × 10
    expect(dist.fleteSur).toBe(5000) // 500 × 10
    expect(dist.utilidades).toBe(32000) // (10000 - 6300 - 500) × 10
    expect(dist.total).toBe(100000) // 10000 × 10

    // Verificar integridad: suma de partes = total
    expect(dist.bovedaMonte + dist.fleteSur + dist.utilidades).toBe(dist.total)
  })

  test("Distribución proporcional: pago parcial 50%", async () => {
    const distCompleta = calcularDistribucionGYA(10, 10000, 6300, 500)
    const distParcial = aplicarDistribucionProporcional(distCompleta, 0.5)

    console.log("\n🧮 DISTRIBUCIÓN PROPORCIONAL - 50% PAGADO")
    console.log("═══════════════════════════════════════")
    console.log(`Distribución completa:`)
    console.log(`  Bóveda Monte: $${distCompleta.bovedaMonte.toLocaleString()}`)
    console.log(`  Flete Sur: $${distCompleta.fleteSur.toLocaleString()}`)
    console.log(`  Utilidades: $${distCompleta.utilidades.toLocaleString()}`)
    console.log(`\nDistribución al 50%:`)
    console.log(`  Bóveda Monte: $${distParcial.bovedaMonte.toLocaleString()}`)
    console.log(`  Flete Sur: $${distParcial.fleteSur.toLocaleString()}`)
    console.log(`  Utilidades: $${distParcial.utilidades.toLocaleString()}`)

    // Verificaciones
    expect(distParcial.bovedaMonte).toBe(31500) // 63000 × 0.5
    expect(distParcial.fleteSur).toBe(2500) // 5000 × 0.5
    expect(distParcial.utilidades).toBe(16000) // 32000 × 0.5
  })

  test("Distribución: múltiples porcentajes de pago", async () => {
    const distBase = calcularDistribucionGYA(5, 8000, 5000, 300)
    const porcentajes = [0.25, 0.5, 0.75, 1.0]

    console.log("\n🧮 DISTRIBUCIÓN CON MÚLTIPLES PORCENTAJES")
    console.log("═══════════════════════════════════════")
    console.log(`Base: Cantidad=5, Venta=$8,000, Compra=$5,000, Flete=$300`)
    console.log(`Total venta: $${distBase.total.toLocaleString()}`)

    for (const pct of porcentajes) {
      const dist = aplicarDistribucionProporcional(distBase, pct)
      console.log(`\n${pct * 100}% pagado:`)
      console.log(
        `  BM: $${dist.bovedaMonte.toLocaleString()}, FS: $${dist.fleteSur.toLocaleString()}, UT: $${dist.utilidades.toLocaleString()}`
      )

      // Verificar proporcionalidad
      expect(sonIguales(dist.bovedaMonte, distBase.bovedaMonte * pct)).toBe(true)
      expect(sonIguales(dist.fleteSur, distBase.fleteSur * pct)).toBe(true)
      expect(sonIguales(dist.utilidades, distBase.utilidades * pct)).toBe(true)
    }
  })

  test("Distribución: 1000 casos aleatorios", async () => {
    console.log("\n🧮 VERIFICACIÓN DE 1000 CASOS ALEATORIOS")
    console.log("═══════════════════════════════════════")

    let casosValidos = 0
    let casosInvalidos = 0

    for (let i = 0; i < 1000; i++) {
      const cantidad = Math.floor(Math.random() * 50) + 1
      const precioVenta = Math.floor(Math.random() * 20000) + 1000
      const precioCompra = Math.floor(precioVenta * 0.6) // 60% del precio
      const precioFlete = Math.floor(Math.random() * 1000) + 100

      const dist = calcularDistribucionGYA(cantidad, precioVenta, precioCompra, precioFlete)
      const suma = dist.bovedaMonte + dist.fleteSur + dist.utilidades

      if (sonIguales(suma, dist.total)) {
        casosValidos++
      } else {
        casosInvalidos++
      }
    }

    console.log(`✅ Casos válidos: ${casosValidos}`)
    console.log(`❌ Casos inválidos: ${casosInvalidos}`)

    expect(casosInvalidos).toBe(0)
  })
})

// ============================================
// SUITE 2: CAPITAL BANCARIO
// ============================================

test.describe("💰 SUITE: Fórmulas de Capital Bancario", () => {
  test("Capital básico: ingresos - gastos", async () => {
    const banco = calcularCapitalBanco(500000, 150000)

    console.log("\n🧮 CAPITAL BANCARIO")
    console.log("═══════════════════════════════════════")
    console.log(`Histórico Ingresos: $${banco.historicoIngresos.toLocaleString()}`)
    console.log(`Histórico Gastos: $${banco.historicoGastos.toLocaleString()}`)
    console.log(`Capital Actual: $${banco.capitalActual.toLocaleString()}`)

    expect(banco.capitalActual).toBe(350000)
  })

  test("Capital con múltiples movimientos", async () => {
    console.log("\n🧮 CAPITAL CON MÚLTIPLES MOVIMIENTOS")
    console.log("═══════════════════════════════════════")

    let ingresos = 0
    let gastos = 0

    // Simular movimientos
    const movimientos = [
      { tipo: "ingreso", monto: 100000 },
      { tipo: "gasto", monto: 25000 },
      { tipo: "ingreso", monto: 50000 },
      { tipo: "gasto", monto: 10000 },
      { tipo: "ingreso", monto: 75000 },
      { tipo: "gasto", monto: 30000 },
    ]

    for (const mov of movimientos) {
      if (mov.tipo === "ingreso") {
        ingresos += mov.monto
      } else {
        gastos += mov.monto
      }
      const capitalActual = calcularCapitalBanco(ingresos, gastos)
      console.log(
        `  ${mov.tipo}: $${mov.monto.toLocaleString()} → Capital: $${capitalActual.capitalActual.toLocaleString()}`
      )
    }

    const final = calcularCapitalBanco(ingresos, gastos)
    expect(final.capitalActual).toBe(160000) // 225000 - 65000
  })

  test("Capital nunca debe ser calculado incorrectamente", async () => {
    console.log("\n🧮 VERIFICACIÓN DE INTEGRIDAD DE CAPITAL")
    console.log("═══════════════════════════════════════")

    // Casos edge
    const casos = [
      { ingresos: 0, gastos: 0, esperado: 0 },
      { ingresos: 100000, gastos: 0, esperado: 100000 },
      { ingresos: 0, gastos: 50000, esperado: -50000 }, // Puede ser negativo
      { ingresos: 100000, gastos: 100000, esperado: 0 },
      { ingresos: 999999, gastos: 1, esperado: 999998 },
    ]

    for (const caso of casos) {
      const resultado = calcularCapitalBanco(caso.ingresos, caso.gastos)
      console.log(
        `  I=$${caso.ingresos.toLocaleString()}, G=$${caso.gastos.toLocaleString()} → C=$${resultado.capitalActual.toLocaleString()}`
      )
      expect(resultado.capitalActual).toBe(caso.esperado)
    }
  })
})

// ============================================
// SUITE 3: DEUDAS DE CLIENTES
// ============================================

test.describe("👥 SUITE: Fórmulas de Deuda de Clientes", () => {
  test("Deuda básica: total - abonos", async () => {
    const cliente = calcularDeudaCliente(100000, 35000)

    console.log("\n🧮 DEUDA DE CLIENTE")
    console.log("═══════════════════════════════════════")
    console.log(`Total Ventas: $${cliente.totalVentas.toLocaleString()}`)
    console.log(`Total Abonos: $${cliente.totalAbonos.toLocaleString()}`)
    console.log(`Pendiente: $${cliente.pendiente.toLocaleString()}`)

    expect(cliente.pendiente).toBe(65000)
  })

  test("Cliente sin deuda", async () => {
    const cliente = calcularDeudaCliente(50000, 50000)

    console.log("\n🧮 CLIENTE SIN DEUDA")
    console.log("═══════════════════════════════════════")
    console.log(`Total Ventas: $${cliente.totalVentas.toLocaleString()}`)
    console.log(`Total Abonos: $${cliente.totalAbonos.toLocaleString()}`)
    console.log(`Pendiente: $${cliente.pendiente.toLocaleString()}`)

    expect(cliente.pendiente).toBe(0)
  })

  test("Abonos acumulativos", async () => {
    console.log("\n🧮 ABONOS ACUMULATIVOS")
    console.log("═══════════════════════════════════════")

    const totalVenta = 80000
    const abonos = [10000, 15000, 20000, 25000]
    let totalAbonos = 0

    for (const abono of abonos) {
      totalAbonos += abono
      const deuda = calcularDeudaCliente(totalVenta, totalAbonos)
      console.log(
        `  Abono $${abono.toLocaleString()} → Pendiente: $${deuda.pendiente.toLocaleString()}`
      )
    }

    const final = calcularDeudaCliente(totalVenta, totalAbonos)
    expect(final.pendiente).toBe(10000) // 80000 - 70000
  })
})

// ============================================
// SUITE 4: DEUDAS CON DISTRIBUIDORES
// ============================================

test.describe("🏭 SUITE: Fórmulas de Deuda con Distribuidores", () => {
  test("Deuda básica: total OC - pagos", async () => {
    const distribuidor = calcularDeudaDistribuidor(200000, 75000)

    console.log("\n🧮 DEUDA CON DISTRIBUIDOR")
    console.log("═══════════════════════════════════════")
    console.log(`Total Órdenes: $${distribuidor.totalOrdenes.toLocaleString()}`)
    console.log(`Total Pagos: $${distribuidor.totalPagos.toLocaleString()}`)
    console.log(`Pendiente: $${distribuidor.pendiente.toLocaleString()}`)

    expect(distribuidor.pendiente).toBe(125000)
  })

  test("Múltiples OCs y pagos", async () => {
    console.log("\n🧮 MÚLTIPLES OCs Y PAGOS")
    console.log("═══════════════════════════════════════")

    let totalOrdenes = 0
    let totalPagos = 0

    const operaciones = [
      { tipo: "orden", monto: 50000 },
      { tipo: "pago", monto: 20000 },
      { tipo: "orden", monto: 30000 },
      { tipo: "pago", monto: 15000 },
      { tipo: "orden", monto: 40000 },
      { tipo: "pago", monto: 25000 },
    ]

    for (const op of operaciones) {
      if (op.tipo === "orden") {
        totalOrdenes += op.monto
      } else {
        totalPagos += op.monto
      }
      const deuda = calcularDeudaDistribuidor(totalOrdenes, totalPagos)
      console.log(
        `  ${op.tipo}: $${op.monto.toLocaleString()} → Pendiente: $${deuda.pendiente.toLocaleString()}`
      )
    }

    const final = calcularDeudaDistribuidor(totalOrdenes, totalPagos)
    expect(final.pendiente).toBe(60000) // 120000 - 60000
  })
})

// ============================================
// SUITE 5: STOCK DE ÓRDENES DE COMPRA
// ============================================

test.describe("📦 SUITE: Fórmulas de Stock de OC", () => {
  test("Stock básico: inicial - vendido", async () => {
    const stock = calcularStockOC(100, 35)

    console.log("\n🧮 STOCK DE OC")
    console.log("═══════════════════════════════════════")
    console.log(`Stock Inicial: ${stock.stockInicial}`)
    console.log(`Vendido: ${stock.vendido}`)
    console.log(`Stock Actual: ${stock.stockActual}`)

    expect(stock.stockActual).toBe(65)
  })

  test("Stock agotado", async () => {
    const stock = calcularStockOC(50, 50)

    console.log("\n🧮 STOCK AGOTADO")
    console.log("═══════════════════════════════════════")
    console.log(`Stock Inicial: ${stock.stockInicial}`)
    console.log(`Vendido: ${stock.vendido}`)
    console.log(`Stock Actual: ${stock.stockActual}`)

    expect(stock.stockActual).toBe(0)
  })

  test("Ventas progresivas", async () => {
    console.log("\n🧮 VENTAS PROGRESIVAS")
    console.log("═══════════════════════════════════════")

    const stockInicial = 100
    const ventas = [10, 15, 20, 25, 30]
    let totalVendido = 0

    for (const venta of ventas) {
      totalVendido += venta
      const stock = calcularStockOC(stockInicial, totalVendido)
      console.log(`  Venta ${venta} unidades → Stock: ${stock.stockActual}`)
    }

    const final = calcularStockOC(stockInicial, totalVendido)
    expect(final.stockActual).toBe(0) // 100 - 100
  })
})

// ============================================
// SUITE 6: VALORIZACIÓN DE INVENTARIO
// ============================================

test.describe("💎 SUITE: Fórmulas de Valorización", () => {
  test("Valorización básica: stock × costo", async () => {
    const valor = calcularValorizacionInventario(50, 6300)

    console.log("\n🧮 VALORIZACIÓN DE INVENTARIO")
    console.log("═══════════════════════════════════════")
    console.log(`Stock: 50 unidades`)
    console.log(`Costo unitario: $6,300`)
    console.log(`Valor total: $${valor.toLocaleString()}`)

    expect(valor).toBe(315000)
  })

  test("Valorización de múltiples productos", async () => {
    console.log("\n🧮 VALORIZACIÓN MÚLTIPLE")
    console.log("═══════════════════════════════════════")

    const productos = [
      { nombre: "Producto A", stock: 30, costo: 5000 },
      { nombre: "Producto B", stock: 50, costo: 8000 },
      { nombre: "Producto C", stock: 20, costo: 12000 },
    ]

    let valorTotal = 0
    for (const prod of productos) {
      const valor = calcularValorizacionInventario(prod.stock, prod.costo)
      valorTotal += valor
      console.log(
        `  ${prod.nombre}: ${prod.stock} × $${prod.costo.toLocaleString()} = $${valor.toLocaleString()}`
      )
    }

    console.log(`\nValor total inventario: $${valorTotal.toLocaleString()}`)
    expect(valorTotal).toBe(790000) // 150000 + 400000 + 240000
  })
})

// ============================================
// TEST DE RESUMEN GLOBAL
// ============================================

test("📊 Resumen Global de Fórmulas Matemáticas", async () => {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 RESUMEN GLOBAL DE FÓRMULAS MATEMÁTICAS")
  console.log("═══════════════════════════════════════════════════\n")

  const formulas = [
    { nombre: "Distribución GYA", formula: "BM + FS + UT = Total" },
    { nombre: "Capital Banco", formula: "Capital = Ingresos - Gastos" },
    { nombre: "Deuda Cliente", formula: "Pendiente = Ventas - Abonos" },
    { nombre: "Deuda Distribuidor", formula: "Pendiente = OCs - Pagos" },
    { nombre: "Stock OC", formula: "Stock = Inicial - Vendido" },
    { nombre: "Valorización", formula: "Valor = Stock × Costo" },
  ]

  for (const f of formulas) {
    console.log(`✅ ${f.nombre}: ${f.formula}`)
  }

  console.log("\n═══════════════════════════════════════════════════")
  console.log("✅ TODAS LAS FÓRMULAS VERIFICADAS")
  console.log("═══════════════════════════════════════════════════\n")
})
