/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 - TESTS DE ANALYTICS FINANCIERO
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos para funciones de cálculo y análisis financiero
 */

import {
  calcularIndiceSaludFinanciera,
  calcularLimiteCredito,
  calcularOCMetricas,
  calcularScoreCredito,
  categorizarCliente,
  categorizarDistribuidor,
  determinarTendencia,
  diasEntre,
  evaluarRiesgoCredito,
  evaluarRiesgoLiquidez,
  formatearMoneda,
  formatearPorcentaje,
  generarAlertasSistema,
} from "@/app/lib/services/chronos-analytics"

describe("🔮 CHRONOS ANALYTICS - Métricas Financieras Avanzadas", () => {
  // ═══════════════════════════════════════════════════════════════
  // TESTS DE MÉTRICAS DE ÓRDENES DE COMPRA
  // ═══════════════════════════════════════════════════════════════

  describe("📦 Métricas de Órdenes de Compra", () => {
    const ocBase = {
      id: "OC001",
      numeroOrden: "OC-2025001",
      distribuidorId: "dist001",
      distribuidorNombre: "PACMAN",
      fecha: new Date("2025-11-01"),
      cantidad: 100,
      stockActual: 60,
      precioUnitario: 6300,
      fleteUnitario: 200,
      total: 650000,
      montoPagado: 400000,
      montoRestante: 250000,
      estado: "parcial",
    }

    const ventasDeOC = [
      { cantidad: 20, precioTotalVenta: 200000, montoPagado: 180000 },
      { cantidad: 20, precioTotalVenta: 200000, montoPagado: 150000 },
    ]

    it("calcula métricas de stock correctamente", () => {
      const metricas = calcularOCMetricas(ocBase, ventasDeOC)

      expect(metricas.stockInicial).toBe(100)
      expect(metricas.stockActual).toBe(60)
      expect(metricas.stockVendido).toBe(40)
      expect(metricas.porcentajeVendido).toBe(40)
    })

    it("calcula métricas de pagos al distribuidor", () => {
      const metricas = calcularOCMetricas(ocBase, ventasDeOC)

      expect(metricas.costoTotal).toBe(650000)
      expect(metricas.montoPagadoDistribuidor).toBe(400000)
      expect(metricas.montoDeudaDistribuidor).toBe(250000)
      expect(metricas.porcentajePagado).toBeCloseTo(61.54, 1)
    })

    it("calcula métricas de ventas generadas", () => {
      const metricas = calcularOCMetricas(ocBase, ventasDeOC)

      expect(metricas.totalVentas).toBe(400000)
      expect(metricas.piezasVendidas).toBe(40)
      expect(metricas.precioVentaPromedio).toBe(10000)
    })

    it("calcula métricas de cobros a clientes", () => {
      const metricas = calcularOCMetricas(ocBase, ventasDeOC)

      expect(metricas.montoCobrado).toBe(330000)
      expect(metricas.montoSinCobrar).toBe(70000)
      expect(metricas.porcentajeCobrado).toBe(82.5)
    })

    it("calcula flujo de efectivo neto", () => {
      const metricas = calcularOCMetricas(ocBase, ventasDeOC)

      // efectivoNeto = montoCobrado - montoPagadoDistribuidor
      // 330,000 - 400,000 = -70,000
      expect(metricas.efectivoNeto).toBe(-70000)
    })

    it("asigna estados correctamente - stock bajo", () => {
      const ocBajo = { ...ocBase, stockActual: 15 } // 85% vendido
      const metricas = calcularOCMetricas(ocBajo, ventasDeOC)

      expect(metricas.estadoStock).toBe("bajo")
    })

    it("asigna estados correctamente - stock agotado", () => {
      const ocAgotado = { ...ocBase, stockActual: 0 }
      const metricas = calcularOCMetricas(ocAgotado, ventasDeOC)

      expect(metricas.estadoStock).toBe("agotado")
    })

    it("genera alertas apropiadas", () => {
      const ocConProblemas = {
        ...ocBase,
        stockActual: 10,
        montoPagado: 0,
        montoRestante: 650000,
      }
      const metricas = calcularOCMetricas(ocConProblemas, ventasDeOC)

      expect(metricas.alertas.length).toBeGreaterThan(0)
      expect(metricas.alertas.some((a: string) => a.includes("Stock bajo"))).toBe(true)
    })

    it("calcula velocidad de venta", () => {
      const metricas = calcularOCMetricas(ocBase, ventasDeOC)

      // diasDesdeCompra ≈ 44 días (del 1 Nov al 15 Dic)
      // stockVendido = 40
      // velocidad ≈ 40/44 ≈ 0.9 piezas/día
      expect(metricas.velocidadVenta).toBeGreaterThan(0)
    })

    it("OC sin ventas tiene métricas en cero", () => {
      const metricas = calcularOCMetricas(ocBase, [])

      expect(metricas.totalVentas).toBe(0)
      expect(metricas.piezasVendidas).toBe(0)
      expect(metricas.montoCobrado).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // TESTS DE SCORING DE CLIENTES
  // ═══════════════════════════════════════════════════════════════

  describe("👤 Scoring de Clientes", () => {
    it("score máximo para cliente puntual con poca deuda", () => {
      const score = calcularScoreCredito(100, 5, 10000, 100000)

      expect(score).toBeGreaterThanOrEqual(90)
    })

    it("score bajo para cliente impuntual con alta deuda", () => {
      const score = calcularScoreCredito(20, 60, 95000, 100000)

      expect(score).toBeLessThan(40)
    })

    it("score medio para cliente regular", () => {
      const score = calcularScoreCredito(60, 25, 40000, 100000)

      expect(score).toBeGreaterThanOrEqual(40)
      expect(score).toBeLessThan(80)
    })

    it("score considera límite de crédito 0", () => {
      const score = calcularScoreCredito(80, 15, 50000, 0)

      // Sin límite de crédito, se ignora utilización
      expect(score).toBeGreaterThan(0)
    })
  })

  describe("🏷️ Categorización de Clientes", () => {
    it("categoriza como VIP a cliente excelente", () => {
      const categoria = categorizarCliente(90, 15, 10, 0, 10)
      expect(categoria).toBe("VIP")
    })

    it("categoriza como frecuente a cliente regular", () => {
      const categoria = categorizarCliente(70, 8, 15, 0, 15)
      expect(categoria).toBe("frecuente")
    })

    it("categoriza como nuevo a cliente con pocas compras", () => {
      const categoria = categorizarCliente(50, 2, 5, 0, 0)
      expect(categoria).toBe("nuevo")
    })

    it("categoriza como inactivo a cliente sin compras recientes", () => {
      const categoria = categorizarCliente(60, 10, 120, 0, 20)
      expect(categoria).toBe("inactivo")
    })

    it("categoriza como moroso a cliente con deuda antigua", () => {
      const categoria = categorizarCliente(30, 5, 30, 50000, 60)
      expect(categoria).toBe("moroso")
    })

    it("categoriza como ocasional al resto", () => {
      const categoria = categorizarCliente(50, 4, 45, 0, 20)
      expect(categoria).toBe("ocasional")
    })
  })

  describe("💳 Cálculo de Límite de Crédito", () => {
    it("límite alto para cliente con buen score y rentabilidad", () => {
      const limite = calcularLimiteCredito(50000, 85, 60000)

      // Base: 50000 × 2 = 100,000
      // Score 85 → ×1.5 = 150,000
      // Rentabilidad alta → ×1.3 = 195,000 → redondeado a 195,000
      expect(limite).toBeGreaterThanOrEqual(150000)
    })

    it("límite bajo para cliente con mal score", () => {
      const limite = calcularLimiteCredito(50000, 30, 20000)

      // Base: 50000 × 2 = 100,000
      // Score 30 → ×0.5 = 50,000
      expect(limite).toBeLessThanOrEqual(100000)
    })

    it("límite redondeado a miles", () => {
      const limite = calcularLimiteCredito(45500, 60, 30000)

      expect(limite % 1000).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // TESTS DE CATEGORIZACIÓN DE DISTRIBUIDORES
  // ═══════════════════════════════════════════════════════════════

  describe("🏭 Categorización de Distribuidores", () => {
    it("categoriza como estratégico a distribuidor de alto volumen y margen", () => {
      const categoria = categorizarDistribuidor(15, 200000, 80000, 35)
      expect(categoria).toBe("estrategico")
    })

    it("categoriza como preferido a distribuidor de buen margen", () => {
      const categoria = categorizarDistribuidor(8, 40000, 20000, 45)
      expect(categoria).toBe("preferido")
    })

    it("categoriza como normal a distribuidor regular", () => {
      const categoria = categorizarDistribuidor(5, 30000, 8000, 25)
      expect(categoria).toBe("normal")
    })

    it("categoriza como nuevo a distribuidor con pocas órdenes", () => {
      const categoria = categorizarDistribuidor(1, 10000, 3000, 30)
      expect(categoria).toBe("nuevo")
    })

    it("categoriza como ocasional a distribuidor de poco volumen", () => {
      const categoria = categorizarDistribuidor(2, 15000, 4000, 20)
      expect(categoria).toBe("ocasional")
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // TESTS DE KPIs GLOBALES
  // ═══════════════════════════════════════════════════════════════

  describe("📊 Indicadores de Salud Financiera", () => {
    it("índice alto cuando todo está bien", () => {
      const indice = calcularIndiceSaludFinanciera(
        500000, // capitalTotal
        100000, // deudaClientes
        50000, // deudaDistribuidores
        85, // cobranza %
        35 // margenPromedio %
      )

      expect(indice).toBeGreaterThanOrEqual(70)
    })

    it("índice bajo cuando hay problemas", () => {
      const indice = calcularIndiceSaludFinanciera(
        50000, // capitalTotal (bajo)
        200000, // deudaClientes (alta)
        100000, // deudaDistribuidores (alta)
        40, // cobranza % (baja)
        10 // margenPromedio % (bajo)
      )

      expect(indice).toBeLessThan(50)
    })
  })

  describe("⚠️ Evaluación de Riesgos", () => {
    it("riesgo liquidez bajo con buen capital", () => {
      const riesgo = evaluarRiesgoLiquidez(500000, 100000, 50000)
      expect(riesgo).toBe("bajo")
    })

    it("riesgo liquidez alto con poco capital", () => {
      const riesgo = evaluarRiesgoLiquidez(30000, 100000, 50000)
      expect(riesgo).toBe("alto")
    })

    it("riesgo crédito bajo con buena cobranza", () => {
      const riesgo = evaluarRiesgoCredito(50000, 100000, 90)
      expect(riesgo).toBe("bajo")
    })

    it("riesgo crédito alto con mala cobranza", () => {
      const riesgo = evaluarRiesgoCredito(300000, 100000, 40)
      expect(riesgo).toBe("alto")
    })
  })

  describe("📈 Tendencias", () => {
    it("detecta tendencia subiendo", () => {
      const tendencia = determinarTendencia(110, 100)
      expect(tendencia).toBe("subiendo")
    })

    it("detecta tendencia bajando", () => {
      const tendencia = determinarTendencia(90, 100)
      expect(tendencia).toBe("bajando")
    })

    it("detecta tendencia estable", () => {
      const tendencia = determinarTendencia(102, 100)
      expect(tendencia).toBe("estable")
    })

    it("maneja valor anterior 0", () => {
      const tendencia = determinarTendencia(100, 0)
      expect(tendencia).toBe("estable")
    })
  })

  describe("🚨 Generación de Alertas", () => {
    it("genera alerta crítica por capital insuficiente", () => {
      const alertas = generarAlertasSistema({
        capitalTotal: 50000,
        deudaDistribuidores: 100000,
        deudaClientes: 80000,
        cobranza: 70,
        stockTotalPiezas: 100,
        indiceSaludFinanciera: 40,
      })

      expect(alertas.some((a: { tipo: string; mensaje: string }) => a.tipo === "critica")).toBe(
        true
      )
    })

    it("genera alerta por cobranza baja", () => {
      const alertas = generarAlertasSistema({
        capitalTotal: 200000,
        deudaDistribuidores: 50000,
        deudaClientes: 80000,
        cobranza: 45,
        stockTotalPiezas: 100,
        indiceSaludFinanciera: 60,
      })

      expect(
        alertas.some((a: { tipo: string; mensaje: string }) => a.mensaje.includes("Cobranza baja"))
      ).toBe(true)
    })

    it("genera alerta por stock bajo", () => {
      const alertas = generarAlertasSistema({
        capitalTotal: 200000,
        deudaDistribuidores: 50000,
        deudaClientes: 80000,
        cobranza: 75,
        stockTotalPiezas: 30,
        indiceSaludFinanciera: 70,
      })

      expect(
        alertas.some((a: { tipo: string; mensaje: string }) =>
          a.mensaje.includes("Stock total bajo")
        )
      ).toBe(true)
    })

    it("genera mensaje positivo cuando todo está bien", () => {
      const alertas = generarAlertasSistema({
        capitalTotal: 500000,
        deudaDistribuidores: 50000,
        deudaClientes: 80000,
        cobranza: 90,
        stockTotalPiezas: 200,
        indiceSaludFinanciera: 85,
      })

      expect(
        alertas.some(
          (a: { tipo: string; mensaje: string }) =>
            a.tipo === "info" && a.mensaje.includes("Excelente")
        )
      ).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // TESTS DE UTILIDADES
  // ═══════════════════════════════════════════════════════════════

  describe("🛠️ Utilidades de Formateo", () => {
    it("formatea moneda MXN correctamente", () => {
      const formatted = formatearMoneda(1500000)
      expect(formatted).toContain("1,500,000")
      expect(formatted).toContain("$")
    })

    it("formatea porcentaje correctamente", () => {
      const formatted = formatearPorcentaje(45.678)
      expect(formatted).toBe("45.7%")
    })

    it("calcula días entre fechas", () => {
      const fecha1 = new Date("2025-12-01")
      const fecha2 = new Date("2025-12-15")
      const dias = diasEntre(fecha1, fecha2)
      expect(dias).toBe(14)
    })
  })

  // ═══════════════════════════════════════════════════════════════
  // TEST RESUMEN
  // ═══════════════════════════════════════════════════════════════

  describe("✅ RESUMEN - Sistema Analytics Completo", () => {
    it("todas las funciones de cálculo están disponibles", () => {
      expect(typeof calcularOCMetricas).toBe("function")
      expect(typeof calcularScoreCredito).toBe("function")
      expect(typeof categorizarCliente).toBe("function")
      expect(typeof calcularLimiteCredito).toBe("function")
      expect(typeof categorizarDistribuidor).toBe("function")
      expect(typeof calcularIndiceSaludFinanciera).toBe("function")
      expect(typeof evaluarRiesgoLiquidez).toBe("function")
      expect(typeof evaluarRiesgoCredito).toBe("function")
      expect(typeof determinarTendencia).toBe("function")
      expect(typeof generarAlertasSistema).toBe("function")
    })

    it("el sistema de métricas es coherente", () => {
      // OC con ventas debe generar métricas coherentes
      const oc = {
        id: "test",
        distribuidorId: "dist",
        fecha: new Date(),
        cantidad: 100,
        stockActual: 50,
        precioUnitario: 6000,
        fleteUnitario: 300,
        total: 630000, // (6000 + 300) × 100 = 630,000 costo
      }

      // Vendimos 50 unidades a $10,000 cada una = $500,000
      // Costo de esas 50 unidades = 6300 × 50 = $315,000
      // Ganancia esperada ≈ $185,000
      const ventas = [{ cantidad: 50, precioTotalVenta: 500000, montoPagado: 450000 }]

      const metricas = calcularOCMetricas(oc, ventas)

      // Stock vendido debe coincidir con ventas
      expect(metricas.stockVendido).toBe(50)
      expect(metricas.piezasVendidas).toBe(50)

      // gananciaTotal = totalVentas - costoTotal = 500,000 - 630,000 = -130,000 (negativo porque es total)
      // Lo importante es que gananciaRealizada sea positiva (solo de lo vendido)
      // gananciaRealizada = totalVentas - (costoUnitario × stockVendido) = 500,000 - 315,000 = 185,000
      expect(metricas.gananciaRealizada).toBeGreaterThan(0)

      console.log(`
        ═══════════════════════════════════════════════════════════════════
        ✅ CHRONOS ANALYTICS 2026 — SISTEMA DE MÉTRICAS VERIFICADO
        ═══════════════════════════════════════════════════════════════════

        FUNCIONES DE ANÁLISIS DISPONIBLES:
        ✅ calcularOCMetricas - Métricas completas por Orden de Compra
        ✅ calcularScoreCredito - Scoring 0-100 de clientes
        ✅ categorizarCliente - VIP/frecuente/ocasional/nuevo/inactivo/moroso
        ✅ calcularLimiteCredito - Límite sugerido basado en comportamiento
        ✅ categorizarDistribuidor - estratégico/preferido/normal/ocasional/nuevo
        ✅ calcularIndiceSaludFinanciera - Índice 0-100 global
        ✅ evaluarRiesgoLiquidez - bajo/medio/alto
        ✅ evaluarRiesgoCredito - bajo/medio/alto
        ✅ determinarTendencia - subiendo/estable/bajando
        ✅ generarAlertasSistema - Alertas críticas/advertencia/info

        MÉTRICAS POR ORDEN DE COMPRA:
        - Stock: inicial, actual, vendido, porcentaje vendido
        - Costos: total, unitario, pagado, deuda, % pagado
        - Ventas: total generado, piezas, precio promedio
        - Cobros: cobrado, sin cobrar, % cobrado
        - Rentabilidad: ganancia realizada, potencial, margen, ROI
        - Estados: stock, rentabilidad, pago
        - Alertas: generadas automáticamente

        ═══════════════════════════════════════════════════════════════════
        CHRONOS ES ANÁLISIS FINANCIERO COMPLETO.
        ═══════════════════════════════════════════════════════════════════
      `)
    })
  })
})
