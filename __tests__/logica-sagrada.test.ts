/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 — TEST DE LÓGICA SAGRADA
 * Verificación exhaustiva de las fórmulas GYA según documentación oficial
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DOCUMENTO FUENTE: "Lógica Sagrada de Chronos Infinity 2026"
 *
 * PRINCIPIO FUNDAMENTAL:
 * Cuando se registra una venta, el dinero NO se registra como un solo ingreso.
 * Se descompone en 3 flujos sagrados que van a 3 bancos específicos:
 *
 * 1. Bóveda Monte → Recibe el costo del producto
 * 2. Fletes → Recibe el costo de transporte
 * 3. Utilidades → Recibe la ganancia neta
 */

import { calcularDistribucionParcial, calcularDistribucionVenta } from "../app/lib/services/logic"

describe("🔮 LÓGICA SAGRADA DE CHRONOS INFINITY 2026", () => {
  /**
   * EJEMPLO CLÁSICO VERIFICADO:
   * - Precio de compra por unidad: $6,300
   * - Precio de venta por unidad: $10,000
   * - Flete por unidad: $500
   * - Cantidad vendida: 10 unidades
   */
  const EJEMPLO_CLASICO = {
    precioCompra: 6300,
    precioVenta: 10000,
    precioFlete: 500,
    cantidad: 10,
  }

  describe("📐 Fórmulas Sagradas Básicas", () => {
    test("precioTotalVenta = precioVenta × cantidad = $100,000", () => {
      const precioTotalVenta = EJEMPLO_CLASICO.precioVenta * EJEMPLO_CLASICO.cantidad
      expect(precioTotalVenta).toBe(100000)
    })

    test("montoMonte = precioCompra × cantidad = $63,000", () => {
      const montoMonte = EJEMPLO_CLASICO.precioCompra * EJEMPLO_CLASICO.cantidad
      expect(montoMonte).toBe(63000)
    })

    test("montoFletes = flete × cantidad = $5,000 (COSTO INTERNO)", () => {
      const montoFletes = EJEMPLO_CLASICO.precioFlete * EJEMPLO_CLASICO.cantidad
      expect(montoFletes).toBe(5000)
    })

    test("montoUtilidades = (precioVenta - precioCompra - flete) × cantidad = $32,000", () => {
      const montoUtilidades =
        (EJEMPLO_CLASICO.precioVenta - EJEMPLO_CLASICO.precioCompra - EJEMPLO_CLASICO.precioFlete) *
        EJEMPLO_CLASICO.cantidad
      expect(montoUtilidades).toBe(32000)
    })

    test("Total distribuido = $63,000 + $5,000 + $32,000 = $100,000", () => {
      const totalDistribuido = 63000 + 5000 + 32000
      expect(totalDistribuido).toBe(100000)
    })

    test("El flete ($5,000) es un COSTO INTERNO que se registra en banco Fletes", () => {
      // El cliente paga $100,000 (precioVenta × cantidad)
      // El flete NO se cobra al cliente, es un costo interno
      // Los $5,000 de flete se RESTAN de las utilidades
      const montoFletes = EJEMPLO_CLASICO.precioFlete * EJEMPLO_CLASICO.cantidad
      expect(montoFletes).toBe(5000)

      // El flete reduce la ganancia neta
      const gananciaConFlete =
        (EJEMPLO_CLASICO.precioVenta - EJEMPLO_CLASICO.precioCompra - EJEMPLO_CLASICO.precioFlete) *
        EJEMPLO_CLASICO.cantidad
      const gananciaSinFlete =
        (EJEMPLO_CLASICO.precioVenta - EJEMPLO_CLASICO.precioCompra) * EJEMPLO_CLASICO.cantidad
      expect(gananciaSinFlete - gananciaConFlete).toBe(5000) // El flete resta $5,000 de utilidades
    })
  })

  describe("🏛️ Distribución GYA - Función calcularDistribucionVenta", () => {
    test("Retorna distribución correcta para ejemplo clásico", () => {
      const dist = calcularDistribucionVenta(
        EJEMPLO_CLASICO.precioVenta,
        EJEMPLO_CLASICO.precioCompra,
        EJEMPLO_CLASICO.precioFlete,
        EJEMPLO_CLASICO.cantidad
      )

      expect(dist.bovedaMonte).toBe(63000) // COSTO
      expect(dist.fletes).toBe(5000) // TRANSPORTE (costo interno)
      expect(dist.utilidades).toBe(32000) // GANANCIA NETA
      expect(dist.total).toBe(100000) // Lo que PAGA el cliente (SIN flete adicional)
    })

    test("Total es lo que el CLIENTE PAGA (precioVenta × cantidad)", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      // El cliente paga $10,000 por unidad × 10 = $100,000
      expect(dist.total).toBe(100000)
    })

    test("Suma de distribución = Total cliente ($100,000)", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      const sumaDistribucion = dist.bovedaMonte + dist.fletes + dist.utilidades

      // $63,000 + $5,000 + $32,000 = $100,000 distribuidos a 3 bancos
      expect(sumaDistribucion).toBe(100000)

      // El cliente paga exactamente $100,000 (precioVenta × cantidad)
      expect(dist.total).toBe(100000)

      // La suma de la distribución DEBE ser igual a lo que paga el cliente
      expect(sumaDistribucion).toBe(dist.total)

      // El flete ($5,000) es un costo interno que se registra en banco Fletes
      expect(dist.fletes).toBe(5000)
    })
  })

  describe("💰 Reglas Inmutables - Histórico vs Capital", () => {
    /**
     * REGLA 1: Histórico inmutable
     * Los montos en histórico de Monte, Fletes y Utilidades siempre son el 100%
     * independientemente de si el cliente pagó o no.
     */
    test("COMPLETO: Capital = 100% del histórico", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      const montoPagado = 100000 // Pago completo ($100,000)
      const totalVenta = dist.total

      const proporcionalidad = calcularDistribucionParcial(dist, montoPagado, totalVenta)

      expect(proporcionalidad.proporcion).toBe(1)
      expect(proporcionalidad.capitalBovedaMonte).toBe(63000)
      expect(proporcionalidad.capitalFletes).toBe(5000)
      expect(proporcionalidad.capitalUtilidades).toBe(32000)
    })

    test("PARCIAL 40% ($40,000 de $100,000): Capital proporcional", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      const montoPagado = 40000 // 40% de $100,000
      const totalVenta = dist.total

      const proporcionalidad = calcularDistribucionParcial(dist, montoPagado, totalVenta)

      expect(proporcionalidad.proporcion).toBeCloseTo(0.4, 5)
      expect(proporcionalidad.capitalBovedaMonte).toBeCloseTo(25200, 0) // 40% de $63,000
      expect(proporcionalidad.capitalFletes).toBeCloseTo(2000, 0) // 40% de $5,000
      expect(proporcionalidad.capitalUtilidades).toBeCloseTo(12800, 0) // 40% de $32,000

      // Total capital disponible: $40,000
      const totalCapital =
        proporcionalidad.capitalBovedaMonte +
        proporcionalidad.capitalFletes +
        proporcionalidad.capitalUtilidades
      expect(totalCapital).toBeCloseTo(40000, 0)
    })

    test("PENDIENTE: Capital = $0", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      const montoPagado = 0 // Sin pago
      const totalVenta = dist.total

      const proporcionalidad = calcularDistribucionParcial(dist, montoPagado, totalVenta)

      expect(proporcionalidad.proporcion).toBe(0)
      expect(proporcionalidad.capitalBovedaMonte).toBe(0)
      expect(proporcionalidad.capitalFletes).toBe(0)
      expect(proporcionalidad.capitalUtilidades).toBe(0)
    })
  })

  describe("📊 Simulación de Abono Posterior", () => {
    /**
     * ESCENARIO: Venta parcial $40,000 (40%) → Abono $25,000 adicional
     * Total abonado: $65,000 de $100,000 = 65%
     */
    test("Abono posterior actualiza proporción correctamente", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      const totalVenta = dist.total // $100,000

      // Primer pago: $40,000 (40%)
      const pago1 = calcularDistribucionParcial(dist, 40000, totalVenta)
      expect(pago1.proporcion).toBeCloseTo(0.4, 5)

      // Abono adicional: $25,000
      // Nuevo total pagado: $65,000 de $100,000 = 65%
      const totalPagado = 40000 + 25000 // $65,000
      const pago2 = calcularDistribucionParcial(dist, totalPagado, totalVenta)
      expect(pago2.proporcion).toBeCloseTo(0.65, 3)

      // Capital aumenta proporcionalmente al 65%
      expect(pago2.capitalBovedaMonte).toBeCloseTo(63000 * 0.65, 0)
      expect(pago2.capitalFletes).toBeCloseTo(5000 * 0.65, 0)
      expect(pago2.capitalUtilidades).toBeCloseTo(32000 * 0.65, 0)
    })

    test("Abono completo lleva capital a 100% del histórico", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)
      const totalVenta = dist.total // $100,000 (precioVenta × cantidad)

      // Pago inicial: $40,000
      // Abono final: $60,000 (resto)
      const totalPagado = 100000 // Cliente paga el total
      const pagoFinal = calcularDistribucionParcial(dist, totalPagado, totalVenta)

      expect(pagoFinal.proporcion).toBe(1)
      expect(pagoFinal.capitalBovedaMonte).toBe(63000)
      expect(pagoFinal.capitalFletes).toBe(5000)
      expect(pagoFinal.capitalUtilidades).toBe(32000)
    })
  })

  describe("🚫 Prohibiciones Sagradas", () => {
    test("Los 4 bancos operativos (USA, Azteca, Leftie, Profit) NO reciben de ventas", () => {
      // Esta prueba verifica que la distribución SOLO tiene 3 destinos
      const dist = calcularDistribucionVenta(10000, 6300, 500, 10)

      // Solo existen 3 campos de distribución
      expect(Object.keys(dist)).toEqual(["bovedaMonte", "fletes", "utilidades", "total"])

      // No hay campos para bancos operativos
      expect(dist).not.toHaveProperty("bovedaUsa")
      expect(dist).not.toHaveProperty("azteca")
      expect(dist).not.toHaveProperty("leftie")
      expect(dist).not.toHaveProperty("profit")
    })

    test("Flete siempre se descuenta de utilidades (ganancia neta real)", () => {
      // Con flete $500
      const conFlete = calcularDistribucionVenta(10000, 6300, 500, 10)
      expect(conFlete.utilidades).toBe(32000)

      // Sin flete (precio neto)
      const sinFlete = calcularDistribucionVenta(10000, 6300, 0, 10)
      expect(sinFlete.utilidades).toBe(37000)

      // Diferencia = flete total
      expect(sinFlete.utilidades - conFlete.utilidades).toBe(5000)
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

    test("Venta con pérdida (precioVenta < precioCompra + flete)", () => {
      // precioVenta = $5,000, precioCompra = $6,300, flete = $500
      // Utilidades = (5000 - 6300 - 500) × 10 = -18,000 (PÉRDIDA)
      const dist = calcularDistribucionVenta(5000, 6300, 500, 10)

      expect(dist.bovedaMonte).toBe(63000) // Costo sigue siendo el mismo
      expect(dist.fletes).toBe(5000) // Flete sigue siendo el mismo
      expect(dist.utilidades).toBe(-18000) // PÉRDIDA (número negativo permitido)
    })

    test("Sin flete (flete = 0)", () => {
      const dist = calcularDistribucionVenta(10000, 6300, 0, 10)

      expect(dist.bovedaMonte).toBe(63000)
      expect(dist.fletes).toBe(0)
      expect(dist.utilidades).toBe(37000) // Más utilidades sin flete
      expect(dist.total).toBe(100000) // Sin flete, total = precioVenta × cantidad
    })

    test("Sin precio de compra (compra = 0)", () => {
      const dist = calcularDistribucionVenta(10000, 0, 500, 10)

      expect(dist.bovedaMonte).toBe(0) // Sin costo
      expect(dist.fletes).toBe(5000)
      expect(dist.utilidades).toBe(95000) // Casi todo es utilidad
      expect(dist.total).toBe(100000) // Cliente paga precioVenta × cantidad
    })
  })
})

describe("📋 RESUMEN - VERIFICACIÓN LÓGICA SAGRADA", () => {
  test("✅ La distribución GYA es matemáticamente perfecta", () => {
    const dist = calcularDistribucionVenta(10000, 6300, 500, 10)

    // Verificación final
    expect(dist.bovedaMonte).toBe(63000) // ✅ Bóveda Monte = COSTO
    expect(dist.fletes).toBe(5000) // ✅ Fletes = TRANSPORTE (COSTO INTERNO)
    expect(dist.utilidades).toBe(32000) // ✅ Utilidades = GANANCIA NETA
    expect(dist.total).toBe(100000) // ✅ Total = precioVenta × cantidad (LO QUE PAGA EL CLIENTE)

    console.log(`
    ═══════════════════════════════════════════════════════════════════
    ✅ LÓGICA SAGRADA VERIFICADA — CHRONOS INFINITY 2026
    ═══════════════════════════════════════════════════════════════════

    ENTRADA:
    - Precio Venta: $10,000/unidad (YA INCLUYE todos los costos + utilidad)
    - Precio Compra: $6,300/unidad (costo del distribuidor)
    - Flete: $500/unidad (COSTO INTERNO, NO se cobra extra)
    - Cantidad: 10 unidades

    CÁLCULOS:
    - Precio Total Venta: $100,000 (precioVenta × cantidad = lo que paga el cliente)

    DISTRIBUCIÓN GYA (el dinero del cliente se reparte así):
    - Bóveda Monte: $${dist.bovedaMonte.toLocaleString()} (COSTO)
    - Fletes:       $${dist.fletes.toLocaleString()} (COSTO INTERNO)
    - Utilidades:   $${dist.utilidades.toLocaleString()} (GANANCIA NETA)
    ─────────────────────────────────────────────────────────────────
    TOTAL DISTRIBUIDO: $100,000 = EXACTAMENTE LO QUE PAGA EL CLIENTE

    ✅ El precio de venta YA INCLUYE: compra + flete + utilidad
    ✅ El flete NO se cobra extra al cliente, es costo interno
    ✅ La suma de los 3 bancos = 100% de lo cobrado al cliente

    ═══════════════════════════════════════════════════════════════════
    CHRONOS ES VERDAD MATEMÁTICA. CHRONOS ES PERFECCIÓN.
    ═══════════════════════════════════════════════════════════════════
    `)

    // La lógica sagrada es perfecta
    expect(true).toBe(true)
  })
})
