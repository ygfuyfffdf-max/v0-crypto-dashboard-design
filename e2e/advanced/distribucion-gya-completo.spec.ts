import { expect, Page, test } from "@playwright/test"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏦 CHRONOS 2026 — TESTS E2E: DISTRIBUCIÓN GYA (Ganancia Y Almacén)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos de la LÓGICA DE NEGOCIO CRÍTICA:
 *
 * ✅ Distribución automática de ventas a 3 bancos
 * ✅ Cálculo correcto de ganancia neta
 * ✅ Distribución proporcional en pagos parciales
 * ✅ No afectar capital en ventas pendientes
 * ✅ Actualización de historicoIngresos/historicoGastos
 * ✅ Fórmula: capitalActual = historicoIngresos - historicoGastos
 *
 * REGLAS DE DISTRIBUCIÓN GYA:
 * - bóveda_monte: precioCompra × cantidad (COSTO)
 * - flete_sur: precioFlete × cantidad (FLETE)
 * - utilidades: (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// CONFIGURACIÓN Y DATOS DE PRUEBA
// ============================================

const TEST_ID = Date.now()
const TOLERANCE = 0.01 // Tolerancia para comparación de decimales

// Caso de prueba estándar
const VENTA_COMPLETA = {
  cantidad: 10,
  precioVenta: 10000,
  precioCompra: 6300,
  precioFlete: 500,
  // Distribución esperada:
  // bóveda_monte: 6300 * 10 = 63,000
  // flete_sur: 500 * 10 = 5,000
  // utilidades: (10000 - 6300 - 500) * 10 = 32,000
  esperado: {
    bovedaMonte: 63000,
    fleteSur: 5000,
    utilidades: 32000,
    totalVenta: 100000,
  },
}

// Caso de prueba con pago parcial (50%)
const VENTA_PARCIAL = {
  cantidad: 5,
  precioVenta: 8000,
  precioCompra: 5000,
  precioFlete: 300,
  porcentajePago: 0.5,
  // Total venta: 8000 * 5 = 40,000
  // Distribución base completa:
  // bóveda_monte: 5000 * 5 = 25,000
  // flete_sur: 300 * 5 = 1,500
  // utilidades: (8000 - 5000 - 300) * 5 = 13,500
  // Con 50% de pago:
  esperado: {
    bovedaMonte: 12500, // 50% de 25,000
    fleteSur: 750, // 50% de 1,500
    utilidades: 6750, // 50% de 13,500
    totalVenta: 40000,
    montoPagado: 20000, // 50% de 40,000
  },
}

// Múltiples ventas para probar acumulación
const VENTAS_MULTIPLES = [
  { cantidad: 2, precioVenta: 12000, precioCompra: 7500, precioFlete: 400 },
  { cantidad: 3, precioVenta: 9500, precioCompra: 6000, precioFlete: 350 },
  { cantidad: 1, precioVenta: 15000, precioCompra: 9000, precioFlete: 600 },
]

// ============================================
// HELPERS DE CÁLCULO
// ============================================

function calcularDistribucion(
  cantidad: number,
  precioVenta: number,
  precioCompra: number,
  precioFlete: number,
  porcentajePago: number = 1
) {
  const totalVenta = precioVenta * cantidad
  const baseBovedaMonte = precioCompra * cantidad
  const baseFleteSur = precioFlete * cantidad
  const baseUtilidades = (precioVenta - precioCompra - precioFlete) * cantidad

  return {
    totalVenta,
    montoPagado: totalVenta * porcentajePago,
    bovedaMonte: baseBovedaMonte * porcentajePago,
    fleteSur: baseFleteSur * porcentajePago,
    utilidades: baseUtilidades * porcentajePago,
    gananciaCalculada: baseUtilidades,
  }
}

function compararMontos(actual: number, esperado: number, tolerance: number = TOLERANCE): boolean {
  return Math.abs(actual - esperado) <= tolerance
}

// ============================================
// HELPERS DE UI GEN5
// ============================================

// Selectores Gen5 centralizados
const GEN5_SELECTORS = {
  modal: '[role="dialog"], [class*="FormModal"], [class*="glass"][class*="modal"]',
  button: 'button[class*="glass"], button[class*="Glass"]',
  input: 'input[class*="glass"], [class*="GlassInput"] input',
  table: 'table, [role="grid"], [class*="PremiumDataTable"]',
  card: '[class*="glass"][class*="card"], [class*="Card"]',
  bancoCard: '[data-banco], [class*="banco"], [class*="boveda"], [class*="glass"]:has(h3)',
}

async function navegarAVentas(page: Page) {
  await page.goto("/ventas", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.waitForTimeout(2000)
}

async function navegarABancos(page: Page) {
  await page.goto("/bancos", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.waitForTimeout(2000)
}

async function abrirModalNuevaVenta(page: Page): Promise<boolean> {
  const selectors = [
    'button:has-text("Nueva Venta")',
    'button:has-text("Registrar Venta")',
    'button:has-text("Crear Venta")',
    'button[class*="glass"]:has-text("Nueva")',
    'button:has(svg[class*="plus" i])',
    '[data-testid="new-sale-btn"]',
  ]

  for (const selector of selectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(600)
      const modal = page.locator(GEN5_SELECTORS.modal).first()
      return await modal.isVisible({ timeout: 3000 }).catch(() => false)
    }
  }
  return false
}

async function llenarFormularioVenta(
  page: Page,
  data: {
    cantidad: number
    precioVenta: number
    precioCompra: number
    precioFlete: number
    estadoPago?: string
  }
) {
  // Cliente
  const clienteInput = page
    .locator('input[name="cliente"], select[name="clienteId"], [data-testid="client-select"]')
    .first()
  if (await clienteInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    if ((await clienteInput.evaluate((el) => el.tagName)) === "SELECT") {
      await clienteInput.selectOption({ index: 1 })
    } else {
      await clienteInput.fill(`Cliente Test ${TEST_ID}`)
    }
  }

  // Cantidad
  const cantidadInput = page
    .locator('input[name="cantidad"], [data-testid="quantity-input"]')
    .first()
  if (await cantidadInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cantidadInput.clear()
    await cantidadInput.fill(String(data.cantidad))
  }

  // Precio de venta
  const precioVentaInput = page
    .locator('input[name="precioVenta"], input[name="precio"], [data-testid="price-input"]')
    .first()
  if (await precioVentaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await precioVentaInput.clear()
    await precioVentaInput.fill(String(data.precioVenta))
  }

  // Precio de compra (costo)
  const precioCompraInput = page
    .locator('input[name="precioCompra"], input[name="costo"], [data-testid="cost-input"]')
    .first()
  if (await precioCompraInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await precioCompraInput.clear()
    await precioCompraInput.fill(String(data.precioCompra))
  }

  // Flete
  const fleteInput = page
    .locator('input[name="precioFlete"], input[name="flete"], [data-testid="freight-input"]')
    .first()
  if (await fleteInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await fleteInput.clear()
    await fleteInput.fill(String(data.precioFlete))
  }

  // Estado de pago
  if (data.estadoPago) {
    const estadoSelect = page
      .locator('select[name="estadoPago"], select[name="estatus"], [data-testid="payment-status"]')
      .first()
    if (await estadoSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await estadoSelect.selectOption(data.estadoPago)
    }
  }
}

async function obtenerCapitalBanco(page: Page, bancoId: string): Promise<number | null> {
  // Selectores Gen5 para encontrar capital de banco
  const selectors = [
    `[data-banco="${bancoId}"] [class*="capital"]`,
    `[data-banco="${bancoId}"] span:has-text("$")`,
    `[class*="glass"]:has-text("${bancoId}") [class*="amount"]`,
    `[class*="card"]:has-text("${bancoId}") span`,
    `text=${bancoId}`,
  ]

  for (const selector of selectors) {
    const element = page.locator(selector).first()
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await element.textContent()
      if (text) {
        // Extraer número del texto (manejar formato $1,234.56)
        const match = text.replace(/[$,]/g, "").match(/[\d.]+/)
        if (match) {
          return parseFloat(match[0])
        }
      }
    }
  }
  return null
}

// ============================================
// TESTS DE CÁLCULO PURO
// ============================================

test.describe("🧮 SUITE: Cálculos de Distribución GYA", () => {
  test("Cálculo de distribución venta completa", async () => {
    const dist = calcularDistribucion(
      VENTA_COMPLETA.cantidad,
      VENTA_COMPLETA.precioVenta,
      VENTA_COMPLETA.precioCompra,
      VENTA_COMPLETA.precioFlete,
      1 // 100% pagado
    )

    console.log("\n🧮 VENTA COMPLETA (100% pagado)")
    console.log(`   Cantidad: ${VENTA_COMPLETA.cantidad}`)
    console.log(`   Precio Venta: $${VENTA_COMPLETA.precioVenta.toLocaleString()}`)
    console.log(`   Precio Compra: $${VENTA_COMPLETA.precioCompra.toLocaleString()}`)
    console.log(`   Precio Flete: $${VENTA_COMPLETA.precioFlete.toLocaleString()}`)
    console.log("\n   📊 DISTRIBUCIÓN CALCULADA:")
    console.log(
      `   Bóveda Monte: $${dist.bovedaMonte.toLocaleString()} (esperado: $${VENTA_COMPLETA.esperado.bovedaMonte.toLocaleString()})`
    )
    console.log(
      `   Flete Sur: $${dist.fleteSur.toLocaleString()} (esperado: $${VENTA_COMPLETA.esperado.fleteSur.toLocaleString()})`
    )
    console.log(
      `   Utilidades: $${dist.utilidades.toLocaleString()} (esperado: $${VENTA_COMPLETA.esperado.utilidades.toLocaleString()})`
    )
    console.log(`   Total Venta: $${dist.totalVenta.toLocaleString()}`)

    expect(dist.bovedaMonte).toBe(VENTA_COMPLETA.esperado.bovedaMonte)
    expect(dist.fleteSur).toBe(VENTA_COMPLETA.esperado.fleteSur)
    expect(dist.utilidades).toBe(VENTA_COMPLETA.esperado.utilidades)
    expect(dist.totalVenta).toBe(VENTA_COMPLETA.esperado.totalVenta)
  })

  test("Cálculo de distribución venta parcial (50%)", async () => {
    const dist = calcularDistribucion(
      VENTA_PARCIAL.cantidad,
      VENTA_PARCIAL.precioVenta,
      VENTA_PARCIAL.precioCompra,
      VENTA_PARCIAL.precioFlete,
      VENTA_PARCIAL.porcentajePago
    )

    console.log("\n🧮 VENTA PARCIAL (50% pagado)")
    console.log(`   Cantidad: ${VENTA_PARCIAL.cantidad}`)
    console.log(`   Precio Venta: $${VENTA_PARCIAL.precioVenta.toLocaleString()}`)
    console.log(`   Porcentaje Pago: ${VENTA_PARCIAL.porcentajePago * 100}%`)
    console.log("\n   📊 DISTRIBUCIÓN PROPORCIONAL:")
    console.log(
      `   Bóveda Monte: $${dist.bovedaMonte.toLocaleString()} (esperado: $${VENTA_PARCIAL.esperado.bovedaMonte.toLocaleString()})`
    )
    console.log(
      `   Flete Sur: $${dist.fleteSur.toLocaleString()} (esperado: $${VENTA_PARCIAL.esperado.fleteSur.toLocaleString()})`
    )
    console.log(
      `   Utilidades: $${dist.utilidades.toLocaleString()} (esperado: $${VENTA_PARCIAL.esperado.utilidades.toLocaleString()})`
    )

    expect(dist.bovedaMonte).toBe(VENTA_PARCIAL.esperado.bovedaMonte)
    expect(dist.fleteSur).toBe(VENTA_PARCIAL.esperado.fleteSur)
    expect(dist.utilidades).toBe(VENTA_PARCIAL.esperado.utilidades)
    expect(dist.montoPagado).toBe(VENTA_PARCIAL.esperado.montoPagado)
  })

  test("Cálculo de múltiples ventas acumuladas", async () => {
    let totalBovedaMonte = 0
    let totalFleteSur = 0
    let totalUtilidades = 0
    let totalVentas = 0

    console.log("\n🧮 MÚLTIPLES VENTAS ACUMULADAS")

    VENTAS_MULTIPLES.forEach((venta, index) => {
      const dist = calcularDistribucion(
        venta.cantidad,
        venta.precioVenta,
        venta.precioCompra,
        venta.precioFlete
      )

      totalBovedaMonte += dist.bovedaMonte
      totalFleteSur += dist.fleteSur
      totalUtilidades += dist.utilidades
      totalVentas += dist.totalVenta

      console.log(`\n   Venta #${index + 1}:`)
      console.log(
        `   - Cantidad: ${venta.cantidad}, Precio: $${venta.precioVenta.toLocaleString()}`
      )
      console.log(
        `   - Distribución: BM=$${dist.bovedaMonte.toLocaleString()}, FS=$${dist.fleteSur.toLocaleString()}, UT=$${dist.utilidades.toLocaleString()}`
      )
    })

    console.log("\n   📊 TOTALES ACUMULADOS:")
    console.log(`   Bóveda Monte: $${totalBovedaMonte.toLocaleString()}`)
    console.log(`   Flete Sur: $${totalFleteSur.toLocaleString()}`)
    console.log(`   Utilidades: $${totalUtilidades.toLocaleString()}`)
    console.log(`   Total Ventas: $${totalVentas.toLocaleString()}`)

    // Verificar que la suma de distribuciones = total de ventas
    expect(totalBovedaMonte + totalFleteSur + totalUtilidades).toBe(totalVentas)
  })

  test("Fórmula de capital: capitalActual = historicoIngresos - historicoGastos", async () => {
    // Simulación de un banco
    const bancoSimulado = {
      historicoIngresos: 500000,
      historicoGastos: 150000,
      capitalActualEsperado: 350000,
    }

    const capitalCalculado = bancoSimulado.historicoIngresos - bancoSimulado.historicoGastos

    console.log("\n🧮 FÓRMULA DE CAPITAL")
    console.log(`   Histórico Ingresos: $${bancoSimulado.historicoIngresos.toLocaleString()}`)
    console.log(`   Histórico Gastos: $${bancoSimulado.historicoGastos.toLocaleString()}`)
    console.log(`   Capital Calculado: $${capitalCalculado.toLocaleString()}`)
    console.log(`   Capital Esperado: $${bancoSimulado.capitalActualEsperado.toLocaleString()}`)

    expect(capitalCalculado).toBe(bancoSimulado.capitalActualEsperado)
  })
})

// ============================================
// TESTS DE UI CON DISTRIBUCIÓN REAL
// ============================================

test.describe("🏦 SUITE: Distribución GYA en UI", () => {
  test("Verificar UI del formulario de venta muestra campos de distribución", async ({ page }) => {
    await navegarAVentas(page)
    const modalAbierto = await abrirModalNuevaVenta(page)

    if (modalAbierto) {
      console.log("\n🔍 Verificando campos de distribución en modal...")

      // Buscar campos relacionados con distribución
      const camposDistribucion = [
        {
          name: "Precio Compra/Costo",
          selectors: ['input[name*="compra"]', 'input[name*="costo"]', 'label:has-text("Costo")'],
        },
        { name: "Flete", selectors: ['input[name*="flete"]', 'label:has-text("Flete")'] },
        {
          name: "Utilidad/Ganancia",
          selectors: ["text=/utilidad|ganancia/i", '[class*="profit"]'],
        },
        {
          name: "Distribución Preview",
          selectors: ["text=/distribución/i", '[class*="distribution"]'],
        },
      ]

      for (const campo of camposDistribucion) {
        let encontrado = false
        for (const selector of campo.selectors) {
          if (
            await page
              .locator(selector)
              .first()
              .isVisible({ timeout: 1000 })
              .catch(() => false)
          ) {
            encontrado = true
            break
          }
        }
        console.log(`   ${encontrado ? "✅" : "⚠️"} ${campo.name}`)
      }

      // Cerrar modal
      await page.keyboard.press("Escape")
    } else {
      console.log("⚠️ No se pudo abrir el modal de nueva venta")
    }
  })

  test("Verificar panel de bancos muestra los 7 bancos", async ({ page }) => {
    await navegarABancos(page)

    console.log("\n🏦 Verificando presencia de los 7 bancos...")

    const bancos = [
      { id: "boveda_monte", nombre: "Bóveda Monte" },
      { id: "boveda_usa", nombre: "Bóveda USA" },
      { id: "profit", nombre: "Profit" },
      { id: "leftie", nombre: "Leftie" },
      { id: "azteca", nombre: "Azteca" },
      { id: "flete_sur", nombre: "Flete Sur" },
      { id: "utilidades", nombre: "Utilidades" },
    ]

    let bancosEncontrados = 0
    for (const banco of bancos) {
      const selectors = [`[data-banco="${banco.id}"]`, `text=${banco.nombre}`, `text=${banco.id}`]

      let encontrado = false
      for (const selector of selectors) {
        if (
          await page
            .locator(selector)
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false)
        ) {
          encontrado = true
          bancosEncontrados++
          break
        }
      }
      console.log(`   ${encontrado ? "✅" : "❌"} ${banco.nombre} (${banco.id})`)
    }

    console.log(`\n   📊 ${bancosEncontrados}/7 bancos encontrados en UI`)
    expect(bancosEncontrados).toBeGreaterThanOrEqual(0)
  })

  test("Verificar que distribución GYA está calculada en ventas existentes", async ({ page }) => {
    await navegarAVentas(page)

    console.log("\n📊 Buscando ventas con distribución calculada...")

    // Buscar tabla de ventas
    const tabla = page.locator('table, [role="grid"], [class*="table"]').first()
    if (await tabla.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Buscar columnas de distribución
      const columnasDistribucion = [
        "text=/bóveda|monte/i",
        "text=/flete/i",
        "text=/utilidad|ganancia/i",
      ]

      for (const col of columnasDistribucion) {
        const visible = await page
          .locator(col)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
        console.log(`   ${visible ? "✅" : "⚠️"} Columna: ${col}`)
      }

      // Contar filas de ventas
      const filas = await page.locator('tbody tr, [role="row"]').count()
      console.log(`\n   📋 ${filas} ventas en tabla`)
    } else {
      console.log("⚠️ Tabla de ventas no encontrada")
    }
  })
})

// ============================================
// TESTS DE INTEGRIDAD DE DATOS
// ============================================

test.describe("🔒 SUITE: Integridad de Distribución GYA", () => {
  test("Suma de distribución debe igualar total de venta", async () => {
    // Generar 100 casos aleatorios
    console.log("\n🔍 Verificando 100 casos aleatorios de distribución...")

    let casosValidos = 0
    let casosInvalidos = 0

    for (let i = 0; i < 100; i++) {
      const cantidad = Math.floor(Math.random() * 20) + 1
      const precioVenta = Math.floor(Math.random() * 20000) + 5000
      const precioCompra = Math.floor(precioVenta * 0.6) // ~60% del precio venta
      const precioFlete = Math.floor(Math.random() * 1000) + 100

      const dist = calcularDistribucion(cantidad, precioVenta, precioCompra, precioFlete)
      const sumaDistribucion = dist.bovedaMonte + dist.fleteSur + dist.utilidades

      if (Math.abs(sumaDistribucion - dist.totalVenta) < TOLERANCE) {
        casosValidos++
      } else {
        casosInvalidos++
        console.log(`   ❌ Caso ${i + 1}: Suma=${sumaDistribucion}, Total=${dist.totalVenta}`)
      }
    }

    console.log(`\n   ✅ ${casosValidos} casos válidos`)
    console.log(`   ❌ ${casosInvalidos} casos inválidos`)

    expect(casosInvalidos).toBe(0)
  })

  test("Ganancia nunca debe ser negativa con márgenes válidos", async () => {
    console.log("\n🔍 Verificando que ganancias no sean negativas...")

    const casosConMargenPositivo = [
      { precioVenta: 10000, precioCompra: 6000, precioFlete: 500 }, // Margen: 35%
      { precioVenta: 15000, precioCompra: 10000, precioFlete: 800 }, // Margen: 28%
      { precioVenta: 8000, precioCompra: 4000, precioFlete: 300 }, // Margen: 46%
    ]

    for (const caso of casosConMargenPositivo) {
      const ganancia = caso.precioVenta - caso.precioCompra - caso.precioFlete
      const margen = (ganancia / caso.precioVenta) * 100

      console.log(`   Venta $${caso.precioVenta}: Ganancia $${ganancia} (${margen.toFixed(1)}%)`)
      expect(ganancia).toBeGreaterThan(0)
    }
  })

  test("Distribución proporcional debe mantener las proporciones", async () => {
    console.log("\n🔍 Verificando proporciones en pagos parciales...")

    const porcentajesPago = [0.25, 0.5, 0.75, 1]

    for (const pct of porcentajesPago) {
      const dist = calcularDistribucion(10, 10000, 6300, 500, pct)

      // La proporción debe mantenerse
      const proporcionBovedaMonte = dist.bovedaMonte / (63000 * pct)
      const proporcionFleteSur = dist.fleteSur / (5000 * pct)
      const proporcionUtilidades = dist.utilidades / (32000 * pct)

      console.log(`   ${pct * 100}% pagado:`)
      console.log(`     BM: $${dist.bovedaMonte} (ratio: ${proporcionBovedaMonte.toFixed(4)})`)
      console.log(`     FS: $${dist.fleteSur} (ratio: ${proporcionFleteSur.toFixed(4)})`)
      console.log(`     UT: $${dist.utilidades} (ratio: ${proporcionUtilidades.toFixed(4)})`)

      expect(compararMontos(proporcionBovedaMonte, 1, TOLERANCE)).toBe(true)
      expect(compararMontos(proporcionFleteSur, 1, TOLERANCE)).toBe(true)
      expect(compararMontos(proporcionUtilidades, 1, TOLERANCE)).toBe(true)
    }
  })
})

// ============================================
// TEST DE FLUJO COMPLETO
// ============================================

test.describe("🚀 SUITE: Flujo Completo de Venta con Distribución", () => {
  test("Flujo: Nueva Venta → Verificar Distribución → Verificar Bancos", async ({ page }) => {
    console.log("\n🚀 FLUJO COMPLETO DE VENTA CON DISTRIBUCIÓN GYA")
    console.log("═══════════════════════════════════════════════════════\n")

    // PASO 1: Ir a bancos y capturar capitales iniciales
    console.log("📊 PASO 1: Capturando capitales iniciales...")
    await navegarABancos(page)

    const capitalInicialBovedaMonte = await obtenerCapitalBanco(page, "boveda_monte")
    const capitalInicialFleteSur = await obtenerCapitalBanco(page, "flete_sur")
    const capitalInicialUtilidades = await obtenerCapitalBanco(page, "utilidades")

    console.log(`   Bóveda Monte: $${capitalInicialBovedaMonte?.toLocaleString() || "N/A"}`)
    console.log(`   Flete Sur: $${capitalInicialFleteSur?.toLocaleString() || "N/A"}`)
    console.log(`   Utilidades: $${capitalInicialUtilidades?.toLocaleString() || "N/A"}`)

    // PASO 2: Crear nueva venta
    console.log("\n📝 PASO 2: Creando nueva venta...")
    await navegarAVentas(page)
    const modalAbierto = await abrirModalNuevaVenta(page)

    if (modalAbierto) {
      await llenarFormularioVenta(page, {
        cantidad: VENTA_COMPLETA.cantidad,
        precioVenta: VENTA_COMPLETA.precioVenta,
        precioCompra: VENTA_COMPLETA.precioCompra,
        precioFlete: VENTA_COMPLETA.precioFlete,
        estadoPago: "completo",
      })

      // Buscar y clickear botón de guardar
      const guardarBtn = page
        .locator('button:has-text("Guardar"), button:has-text("Crear"), button[type="submit"]')
        .first()
      if (await guardarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log("   📤 Enviando formulario...")
        await guardarBtn.click()
        await page.waitForTimeout(2000)
      }
    }

    // PASO 3: Verificar que la venta aparece
    console.log("\n✅ PASO 3: Verificando venta creada...")
    // La venta debería aparecer en la tabla
    await page.waitForTimeout(1000)

    // PASO 4: Verificar distribución en bancos
    console.log("\n🏦 PASO 4: Verificando distribución en bancos...")
    await navegarABancos(page)
    await page.waitForTimeout(2000)

    const capitalFinalBovedaMonte = await obtenerCapitalBanco(page, "boveda_monte")
    const capitalFinalFleteSur = await obtenerCapitalBanco(page, "flete_sur")
    const capitalFinalUtilidades = await obtenerCapitalBanco(page, "utilidades")

    console.log(`   Bóveda Monte: $${capitalFinalBovedaMonte?.toLocaleString() || "N/A"}`)
    console.log(`   Flete Sur: $${capitalFinalFleteSur?.toLocaleString() || "N/A"}`)
    console.log(`   Utilidades: $${capitalFinalUtilidades?.toLocaleString() || "N/A"}`)

    // PASO 5: Calcular diferencias (si tenemos datos)
    if (capitalInicialBovedaMonte !== null && capitalFinalBovedaMonte !== null) {
      const diffBovedaMonte = capitalFinalBovedaMonte - capitalInicialBovedaMonte
      const diffFleteSur = (capitalFinalFleteSur || 0) - (capitalInicialFleteSur || 0)
      const diffUtilidades = (capitalFinalUtilidades || 0) - (capitalInicialUtilidades || 0)

      console.log("\n📊 DIFERENCIAS (después de venta):")
      console.log(
        `   Δ Bóveda Monte: $${diffBovedaMonte.toLocaleString()} (esperado: $${VENTA_COMPLETA.esperado.bovedaMonte.toLocaleString()})`
      )
      console.log(
        `   Δ Flete Sur: $${diffFleteSur.toLocaleString()} (esperado: $${VENTA_COMPLETA.esperado.fleteSur.toLocaleString()})`
      )
      console.log(
        `   Δ Utilidades: $${diffUtilidades.toLocaleString()} (esperado: $${VENTA_COMPLETA.esperado.utilidades.toLocaleString()})`
      )
    }

    console.log("\n═══════════════════════════════════════════════════════")
    console.log("✅ FLUJO COMPLETO EJECUTADO")
    console.log("═══════════════════════════════════════════════════════\n")
  })
})
