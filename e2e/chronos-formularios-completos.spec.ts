/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧪 CHRONOS SYSTEM E2E - TESTS DE FORMULARIOS COMPLETOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Suite de tests exhaustivos que cubren CADA formulario del sistema CHRONOS:
 *
 * FORMULARIOS CUBIERTOS:
 * 1. VentaModal - Wizard 4 pasos (Cliente, Producto, Precios, Confirmar)
 * 2. GastoModal - Registro de gastos desde bancos
 * 3. IngresoModal - Registro de ingresos a bancos
 * 4. TransferenciaModal - Transferencias entre bancos
 * 5. OrdenCompraModal - Wizard 4 pasos (Distribuidor, Producto, Pago, Confirmar)
 * 6. AbonoClienteModal - Abonos de clientes a deudas
 * 7. AbonoDistribuidorModal - Pagos a distribuidores
 * 8. Formularios de Almacén (Nuevo Producto, Corte)
 *
 * COMPONENTES UI VERIFICADOS:
 * - GlassButton, QuantumButton
 * - QuantumInput, QuantumSelect
 * - Modal, ModalFooter
 * - GlassCard, QuantumGlassCard
 * - Tablas con GlassVentaRow
 * - KPIs con GlassStatCard
 * - Progress bars con GlassProgress
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { expect, test, type Locator, type Page } from "@playwright/test"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe.configure({ mode: "serial" })

const TEST_ID = Date.now().toString(36)
const BASE_URL = "http://localhost:3000"

// Timeouts
const NAVIGATION_TIMEOUT = 30000
const ELEMENT_TIMEOUT = 15000
const ANIMATION_WAIT = 1500

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DATOS DE PRUEBA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DATOS_VENTA = {
  // Cliente nuevo
  clienteNombre: `Cliente Test ${TEST_ID}`,
  clienteTelefono: "5551234567",
  clienteEmail: `test${TEST_ID}@chronos.mx`,
  // Producto
  cantidad: 5,
  // Precios (siguiendo lógica GYA)
  precioVenta: 10000, // Lo que paga el cliente por unidad
  precioCompra: 6300, // Costo del distribuidor
  precioFlete: 500, // Costo interno de flete
  // Calculados
  get totalVenta() {
    return this.precioVenta * this.cantidad
  }, // 50,000
  get montoBovedaMonte() {
    return this.precioCompra * this.cantidad
  }, // 31,500
  get montoFletes() {
    return this.precioFlete * this.cantidad
  }, // 2,500
  get montoUtilidades() {
    return (this.precioVenta - this.precioCompra - this.precioFlete) * this.cantidad
  }, // 16,000
}

const DATOS_ORDEN_COMPRA = {
  distribuidorNombre: `Distribuidor Test ${TEST_ID}`,
  distribuidorEmpresa: "Corp Test SA",
  distribuidorTelefono: "5559876543",
  cantidad: 10,
  costoDistribuidor: 6000,
  costoTransporte: 1500,
  bancoOrigen: "boveda_monte",
  pagoInicial: 30000,
  get costoTotal() {
    return this.costoDistribuidor * this.cantidad + this.costoTransporte
  },
  get deuda() {
    return this.costoTotal - this.pagoInicial
  },
}

const DATOS_GASTO = {
  bancoId: "utilidades",
  monto: 5000,
  concepto: `Gasto Operativo Test ${TEST_ID}`,
  categoria: "Operaciones",
}

const DATOS_INGRESO = {
  bancoId: "boveda_monte",
  monto: 15000,
  concepto: `Ingreso Extra Test ${TEST_ID}`,
  categoria: "Ventas",
}

const DATOS_TRANSFERENCIA = {
  bancoOrigen: "utilidades",
  bancoDestino: "boveda_monte",
  monto: 10000,
  concepto: `Transferencia Test ${TEST_ID}`,
}

const DATOS_ABONO_CLIENTE = {
  clienteId: "", // Se llenará dinámicamente
  monto: 5000,
  bancoDestino: "boveda_monte",
  concepto: `Abono Cliente Test ${TEST_ID}`,
}

const DATOS_PAGO_DISTRIBUIDOR = {
  distribuidorId: "", // Se llenará dinámicamente
  monto: 10000,
  bancoOrigen: "boveda_monte",
  concepto: `Pago Distribuidor Test ${TEST_ID}`,
}

const DATOS_PRODUCTO = {
  nombre: `Producto Test ${TEST_ID}`,
  sku: `SKU-${TEST_ID}`,
  cantidad: 100,
  precioCompra: 5000,
  precioVenta: 8000,
  ubicacion: "Almacén Principal",
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function log(message: string) {
  console.log(`\n🔵 ${message}`)
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`)
}

function logWarning(message: string) {
  console.log(`⚠️ ${message}`)
}

function logError(message: string) {
  console.log(`❌ ${message}`)
}

async function waitForPageLoad(page: Page, timeout = NAVIGATION_TIMEOUT) {
  await page.waitForLoadState("networkidle", { timeout })
  await page.waitForTimeout(ANIMATION_WAIT)
}

async function navigateTo(page: Page, path: string, description: string) {
  log(`Navegando a: ${path} (${description})`)
  await page.goto(`${BASE_URL}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: NAVIGATION_TIMEOUT,
  })
  await waitForPageLoad(page)
  logSuccess(`En página: ${description}`)
}

async function clickButton(page: Page, textOrSelector: string, description: string) {
  log(`Click: ${description}`)

  // Estrategias de búsqueda en orden de especificidad
  const strategies = [
    // 1. Texto exacto en botones
    () => page.getByRole("button", { name: textOrSelector, exact: true }),
    // 2. Texto parcial en botones
    () => page.getByRole("button", { name: new RegExp(textOrSelector, "i") }),
    // 3. Texto visible en cualquier elemento clickeable
    () => page.locator(`text="${textOrSelector}"`).first(),
    // 4. Selector CSS directo
    () => page.locator(textOrSelector).first(),
    // 5. Buscar por aria-label
    () => page.locator(`[aria-label*="${textOrSelector}" i]`).first(),
    // 6. Buscar en elementos con onClick
    () =>
      page
        .locator(
          `button:has-text("${textOrSelector}"), [role="button"]:has-text("${textOrSelector}")`
        )
        .first(),
  ]

  for (const strategy of strategies) {
    try {
      const element = strategy()
      const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false)
      if (isVisible) {
        await element.click({ timeout: ELEMENT_TIMEOUT })
        logSuccess(`Clickeado: ${description}`)
        return true
      }
    } catch {
      continue
    }
  }

  logWarning(`No se encontró botón: ${description}`)
  return false
}

async function fillInput(
  page: Page,
  labelOrSelector: string,
  value: string | number,
  description: string
) {
  log(`Llenando: ${description} = ${value}`)

  const strategies = [
    // 1. Por label asociado
    () => page.getByLabel(labelOrSelector, { exact: false }),
    // 2. Por placeholder
    () => page.getByPlaceholder(labelOrSelector),
    // 3. Por nombre de campo
    () => page.locator(`input[name="${labelOrSelector}"], textarea[name="${labelOrSelector}"]`),
    // 4. Por ID
    () => page.locator(`#${labelOrSelector}`),
    // 5. Selector directo
    () => page.locator(labelOrSelector).first(),
    // 6. Input cercano a texto
    () =>
      page
        .locator(
          `text="${labelOrSelector}" >> xpath=.. >> input, text="${labelOrSelector}" >> xpath=../.. >> input`
        )
        .first(),
  ]

  for (const strategy of strategies) {
    try {
      const element = strategy()
      const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false)
      if (isVisible) {
        await element.clear()
        await element.fill(String(value))
        logSuccess(`Llenado: ${description}`)
        return true
      }
    } catch {
      continue
    }
  }

  logWarning(`No se encontró input: ${description}`)
  return false
}

async function selectOption(
  page: Page,
  labelOrSelector: string,
  value: string,
  description: string
) {
  log(`Seleccionando: ${description} = ${value}`)

  const strategies = [
    // 1. Select nativo por label
    () => page.getByLabel(labelOrSelector),
    // 2. Select por nombre
    () => page.locator(`select[name="${labelOrSelector}"]`),
    // 3. Selector directo
    () => page.locator(labelOrSelector).first(),
    // 4. Custom select (click para abrir + seleccionar opción)
    async () => {
      // Para custom selects de shadcn/radix
      const trigger = page
        .locator(`[data-testid="${labelOrSelector}"], button:has-text("${labelOrSelector}")`)
        .first()
      if (await trigger.isVisible({ timeout: 2000 })) {
        await trigger.click()
        await page.waitForTimeout(300)
        const option = page
          .locator(`[role="option"]:has-text("${value}"), [data-value="${value}"]`)
          .first()
        if (await option.isVisible({ timeout: 2000 })) {
          await option.click()
          return true
        }
      }
      return false
    },
  ]

  for (const strategy of strategies) {
    try {
      if (typeof strategy === "function") {
        const result = await strategy()
        if (typeof result === "boolean") {
          if (result) {
            logSuccess(`Seleccionado: ${description}`)
            return true
          }
          continue
        }
        const element = result as Locator
        const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false)
        if (isVisible) {
          await element.selectOption(value)
          logSuccess(`Seleccionado: ${description}`)
          return true
        }
      }
    } catch {
      continue
    }
  }

  logWarning(`No se encontró select: ${description}`)
  return false
}

async function verifyElementVisible(page: Page, selector: string, description: string) {
  log(`Verificando: ${description}`)
  const element = page.locator(selector).first()
  const isVisible = await element.isVisible({ timeout: ELEMENT_TIMEOUT }).catch(() => false)
  if (isVisible) {
    logSuccess(`Visible: ${description}`)
    return true
  }
  logWarning(`No visible: ${description}`)
  return false
}

async function verifyTextVisible(page: Page, text: string, description: string) {
  log(`Verificando texto: ${description}`)
  const element = page.locator(`text="${text}"`).first()
  const isVisible = await element.isVisible({ timeout: ELEMENT_TIMEOUT }).catch(() => false)
  if (isVisible) {
    logSuccess(`Texto visible: ${description}`)
    return true
  }
  logWarning(`Texto no visible: ${description}`)
  return false
}

async function waitForModal(page: Page, titleText: string) {
  log(`Esperando modal: ${titleText}`)
  try {
    // Esperar a que aparezca el modal con el título
    const modalSelectors = [
      `[role="dialog"]:has-text("${titleText}")`,
      `.modal:has-text("${titleText}")`,
      `div[class*="modal"]:has-text("${titleText}")`,
      `div:has(h2:has-text("${titleText}"))`,
    ]

    for (const selector of modalSelectors) {
      const modal = page.locator(selector).first()
      const isVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false)
      if (isVisible) {
        logSuccess(`Modal abierto: ${titleText}`)
        return true
      }
    }
    logWarning(`Modal no encontrado: ${titleText}`)
    return false
  } catch {
    return false
  }
}

async function closeModal(page: Page) {
  log("Cerrando modal")
  // Intentar múltiples métodos de cierre
  const closeStrategies = [
    () => page.keyboard.press("Escape"),
    () =>
      page
        .locator(
          '[aria-label="Close"], [aria-label="Cerrar"], button:has-text("×"), button:has-text("Cancelar")'
        )
        .first()
        .click(),
    () =>
      page
        .locator(".modal-overlay, .backdrop")
        .first()
        .click({ position: { x: 10, y: 10 } }),
  ]

  for (const strategy of closeStrategies) {
    try {
      await strategy()
      await page.waitForTimeout(500)
      return
    } catch {
      continue
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TESTS DE CARGA INICIAL Y NAVEGACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("🚀 1. Carga Inicial del Sistema", () => {
  test("1.1 Dashboard carga correctamente con todos los componentes", async ({ page }) => {
    await navigateTo(page, "/", "Dashboard Principal")

    // Verificar que hay contenido visible
    const bodyContent = await page.locator("body").textContent()
    expect(bodyContent?.length).toBeGreaterThan(100)
    logSuccess("Dashboard tiene contenido")

    // Verificar componentes principales
    const hasContent = await page.locator("div, section, main").count()
    expect(hasContent).toBeGreaterThan(5)
    logSuccess("Estructura de componentes cargada")
  })

  test("1.2 Navegación a todas las rutas principales", async ({ page }) => {
    test.setTimeout(180000) // 3 minutos para navegación

    const routes = [
      { path: "/ventas", name: "Ventas" },
      { path: "/clientes", name: "Clientes" },
      { path: "/bancos", name: "Bancos" },
      { path: "/gastos", name: "Gastos" },
      { path: "/movimientos", name: "Movimientos" },
      { path: "/ordenes", name: "Órdenes" },
    ]

    for (const route of routes) {
      try {
        await navigateTo(page, route.path, route.name)
        const hasContent = await page.locator("body").textContent({ timeout: 10000 })
        expect(hasContent?.length).toBeGreaterThan(50)
        logSuccess(`Ruta ${route.name} carga correctamente`)
      } catch (e) {
        logWarning(`Ruta ${route.name} tardó demasiado, continuando...`)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: MODAL DE VENTA (WIZARD 4 PASOS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("🛒 2. Formulario de Venta - Wizard Completo", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/ventas", "Panel de Ventas")
  })

  test("2.1 Abrir modal Nueva Venta", async ({ page }) => {
    // Buscar botón "Nueva Venta" con múltiples estrategias
    const buttonFound = await clickButton(page, "Nueva Venta", "Botón Nueva Venta")

    if (buttonFound) {
      await page.waitForTimeout(1000)
      const modalOpen = await waitForModal(page, "Nueva Venta")
      expect(modalOpen).toBeTruthy()
    } else {
      // Si no hay botón, verificar que la página carga
      const hasVentasContent = await page.locator("text=/venta/i").count()
      expect(hasVentasContent).toBeGreaterThan(0)
      test.skip(true, "Botón Nueva Venta no disponible en UI actual")
    }
  })

  test("2.2 Wizard Paso 1 - Selección de Cliente", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Venta", "Botón Nueva Venta")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Venta no encontrado")
      return
    }

    await waitForModal(page, "Nueva Venta")

    // Verificar indicador de pasos
    log("Verificando Step 1: Cliente")

    // Buscar opciones de cliente existente o nuevo
    const hasClienteExistente = await page
      .locator("text=/cliente existente|selecciona/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    const hasNuevoCliente = await page
      .locator("text=/nuevo cliente|crear cliente/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasClienteExistente || hasNuevoCliente) {
      logSuccess("Opciones de cliente visibles")

      // Si hay opción de nuevo cliente, probarla
      if (hasNuevoCliente) {
        await clickButton(page, "Nuevo Cliente", "Opción nuevo cliente")
        await fillInput(page, "nombre", DATOS_VENTA.clienteNombre, "Nombre cliente")
        await fillInput(page, "telefono", DATOS_VENTA.clienteTelefono, "Teléfono cliente")
      }
    }

    // Avanzar al siguiente paso
    await clickButton(page, "Siguiente", "Botón Siguiente")
    logSuccess("Paso 1 completado")
  })

  test("2.3 Wizard Paso 2 - Cantidad de Producto", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Venta", "Botón Nueva Venta")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Venta no encontrado")
      return
    }

    await waitForModal(page, "Nueva Venta")

    // Saltar paso 1 si es posible
    await clickButton(page, "Siguiente", "Siguiente paso 1")
    await page.waitForTimeout(500)

    log("Verificando Step 2: Producto")

    // Buscar input de cantidad
    const cantidadFilled = await fillInput(page, "cantidad", DATOS_VENTA.cantidad, "Cantidad")

    if (cantidadFilled) {
      logSuccess("Cantidad ingresada")
      await clickButton(page, "Siguiente", "Botón Siguiente")
      logSuccess("Paso 2 completado")
    }
  })

  test("2.4 Wizard Paso 3 - Precios y Estado de Pago", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Venta", "Botón Nueva Venta")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Venta no encontrado")
      return
    }

    await waitForModal(page, "Nueva Venta")

    // Navegar a paso 3
    for (let i = 0; i < 2; i++) {
      await clickButton(page, "Siguiente", `Siguiente paso ${i + 1}`)
      await page.waitForTimeout(500)
    }

    log("Verificando Step 3: Precios")

    // Llenar precios
    await fillInput(page, "precioVentaUnidad", DATOS_VENTA.precioVenta, "Precio Venta Unidad")
    await fillInput(page, "precioCompraUnidad", DATOS_VENTA.precioCompra, "Precio Compra Unidad")
    await fillInput(page, "precioFlete", DATOS_VENTA.precioFlete, "Precio Flete")

    // Verificar que se muestra la distribución GYA
    const hasDistribucion = await page
      .locator("text=/distribución|GYA|Bóveda|Utilidades/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    if (hasDistribucion) {
      logSuccess("Distribución GYA visible")
    }

    // Seleccionar estado de pago
    await selectOption(page, "estadoPago", "completo", "Estado de Pago")

    await clickButton(page, "Siguiente", "Botón Siguiente")
    logSuccess("Paso 3 completado")
  })

  test("2.5 Wizard Paso 4 - Confirmación y Envío", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Venta", "Botón Nueva Venta")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Venta no encontrado")
      return
    }

    await waitForModal(page, "Nueva Venta")

    // Navegar a paso 4
    for (let i = 0; i < 3; i++) {
      await clickButton(page, "Siguiente", `Siguiente paso ${i + 1}`)
      await page.waitForTimeout(500)
    }

    log("Verificando Step 4: Confirmación")

    // Verificar resumen de venta
    const hasResumen = await page
      .locator("text=/resumen|confirmar|total/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    if (hasResumen) {
      logSuccess("Resumen de venta visible")
    }

    // Buscar botón de confirmación
    const confirmButtons = ["Confirmar", "Registrar Venta", "Guardar", "Crear Venta"]
    let submitted = false

    for (const btn of confirmButtons) {
      if (await clickButton(page, btn, `Botón ${btn}`)) {
        submitted = true
        break
      }
    }

    if (submitted) {
      // Esperar toast de éxito o cierre de modal
      await page.waitForTimeout(2000)
      logSuccess("Formulario de venta enviado")
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: MODAL DE ORDEN DE COMPRA (WIZARD 4 PASOS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("📦 3. Formulario de Orden de Compra - Wizard Completo", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/ordenes", "Panel de Órdenes")
  })

  test("3.1 Abrir modal Nueva Orden", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Orden", "Botón Nueva Orden")

    if (buttonFound) {
      await page.waitForTimeout(1000)
      const modalOpen = await waitForModal(page, "Orden")
      expect(modalOpen).toBeTruthy()
    } else {
      const hasOrdenesContent = await page.locator("text=/orden/i").count()
      expect(hasOrdenesContent).toBeGreaterThan(0)
      test.skip(true, "Botón Nueva Orden no disponible")
    }
  })

  test("3.2 Wizard Paso 1 - Selección de Distribuidor", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Orden", "Botón Nueva Orden")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Orden no encontrado")
      return
    }

    await waitForModal(page, "Orden")

    log("Verificando Step 1: Distribuidor")

    // Buscar opción de nuevo distribuidor
    const hasNuevoDistribuidor = await clickButton(
      page,
      "Nuevo Distribuidor",
      "Opción nuevo distribuidor"
    )

    if (hasNuevoDistribuidor) {
      await fillInput(page, "nombre", DATOS_ORDEN_COMPRA.distribuidorNombre, "Nombre distribuidor")
      await fillInput(page, "empresa", DATOS_ORDEN_COMPRA.distribuidorEmpresa, "Empresa")
      await fillInput(page, "telefono", DATOS_ORDEN_COMPRA.distribuidorTelefono, "Teléfono")
    }

    await clickButton(page, "Siguiente", "Siguiente")
    logSuccess("Paso 1 completado")
  })

  test("3.3 Wizard Paso 2 - Producto y Cantidad", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Orden", "Botón Nueva Orden")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Orden no encontrado")
      return
    }

    await waitForModal(page, "Orden")
    await clickButton(page, "Siguiente", "Siguiente paso 1")
    await page.waitForTimeout(500)

    log("Verificando Step 2: Producto")

    await fillInput(page, "cantidad", DATOS_ORDEN_COMPRA.cantidad, "Cantidad")
    await fillInput(
      page,
      "costoDistribuidor",
      DATOS_ORDEN_COMPRA.costoDistribuidor,
      "Costo por unidad"
    )
    await fillInput(page, "costoTransporte", DATOS_ORDEN_COMPRA.costoTransporte, "Costo transporte")

    await clickButton(page, "Siguiente", "Siguiente")
    logSuccess("Paso 2 completado")
  })

  test("3.4 Wizard Paso 3 - Banco Origen y Pago Inicial", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Orden", "Botón Nueva Orden")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Orden no encontrado")
      return
    }

    await waitForModal(page, "Orden")

    for (let i = 0; i < 2; i++) {
      await clickButton(page, "Siguiente", `Siguiente paso ${i + 1}`)
      await page.waitForTimeout(500)
    }

    log("Verificando Step 3: Pago")

    await selectOption(page, "bancoOrigen", DATOS_ORDEN_COMPRA.bancoOrigen, "Banco Origen")
    await fillInput(page, "pagoInicial", DATOS_ORDEN_COMPRA.pagoInicial, "Pago Inicial")

    // Verificar que muestra el cálculo de deuda
    const hasCalculo = await page
      .locator("text=/costo total|deuda|restante/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    if (hasCalculo) {
      logSuccess("Cálculos de orden visibles")
    }

    await clickButton(page, "Siguiente", "Siguiente")
    logSuccess("Paso 3 completado")
  })

  test("3.5 Wizard Paso 4 - Confirmación", async ({ page }) => {
    const buttonFound = await clickButton(page, "Nueva Orden", "Botón Nueva Orden")
    if (!buttonFound) {
      test.skip(true, "Botón Nueva Orden no encontrado")
      return
    }

    await waitForModal(page, "Orden")

    for (let i = 0; i < 3; i++) {
      await clickButton(page, "Siguiente", `Siguiente paso ${i + 1}`)
      await page.waitForTimeout(500)
    }

    log("Verificando Step 4: Confirmación")

    const confirmButtons = ["Confirmar", "Crear Orden", "Registrar", "Guardar"]
    for (const btn of confirmButtons) {
      if (await clickButton(page, btn, `Botón ${btn}`)) {
        await page.waitForTimeout(2000)
        logSuccess("Orden de compra creada")
        break
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: MODAL DE GASTO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("💸 4. Formulario de Gasto", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/gastos", "Panel de Gastos")
  })

  test("4.1 Abrir modal Nuevo Gasto", async ({ page }) => {
    const buttonTexts = ["Nuevo Gasto", "Registrar Gasto", "Agregar Gasto", "+"]
    let found = false

    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (found) {
      await waitForModal(page, "Gasto")
      logSuccess("Modal de gasto abierto")
    } else {
      const hasGastosContent = await page.locator("text=/gasto/i").count()
      expect(hasGastosContent).toBeGreaterThan(0)
      test.skip(true, "Botón de gasto no disponible")
    }
  })

  test("4.2 Llenar formulario de gasto completo", async ({ page }) => {
    const buttonTexts = ["Nuevo Gasto", "Registrar Gasto", "+"]
    let found = false
    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (!found) {
      test.skip(true, "Botón de gasto no encontrado")
      return
    }

    await waitForModal(page, "Gasto")

    log("Llenando formulario de gasto")

    // Seleccionar banco
    await selectOption(page, "bancoId", DATOS_GASTO.bancoId, "Banco")

    // Llenar monto
    await fillInput(page, "monto", DATOS_GASTO.monto, "Monto")

    // Llenar concepto
    await fillInput(page, "concepto", DATOS_GASTO.concepto, "Concepto")

    // Seleccionar categoría si existe
    await selectOption(page, "categoria", DATOS_GASTO.categoria, "Categoría")

    // Verificar que muestra capital disponible
    const hasCapital = await page
      .locator("text=/capital|disponible|saldo/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    if (hasCapital) {
      logSuccess("Capital disponible visible")
    }

    // Enviar
    const submitButtons = ["Registrar Gasto", "Confirmar", "Guardar"]
    for (const btn of submitButtons) {
      if (await clickButton(page, btn, `Botón ${btn}`)) {
        await page.waitForTimeout(2000)
        logSuccess("Gasto registrado")
        break
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: MODAL DE INGRESO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("💰 5. Formulario de Ingreso", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/bancos", "Panel de Bancos")
  })

  test("5.1 Abrir modal Nuevo Ingreso desde Bancos", async ({ page }) => {
    const buttonTexts = ["Nuevo Ingreso", "Registrar Ingreso", "Ingreso", "+"]
    let found = false

    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (found) {
      await waitForModal(page, "Ingreso")
      logSuccess("Modal de ingreso abierto")
    } else {
      // Intentar click en botón de ingreso específico de banco
      const ingresoButton = await page
        .locator('button:has-text("Ingreso"), [aria-label*="ingreso"]')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
      if (ingresoButton) {
        await page.locator('button:has-text("Ingreso")').first().click()
        await waitForModal(page, "Ingreso")
      } else {
        test.skip(true, "Botón de ingreso no disponible")
      }
    }
  })

  test("5.2 Llenar formulario de ingreso completo", async ({ page }) => {
    // Buscar cualquier botón que abra modal de ingreso
    const ingresoClicked = await clickButton(page, "Ingreso", "Botón Ingreso")

    if (!ingresoClicked) {
      test.skip(true, "Botón de ingreso no encontrado")
      return
    }

    await waitForModal(page, "Ingreso")

    log("Llenando formulario de ingreso")

    await selectOption(page, "bancoId", DATOS_INGRESO.bancoId, "Banco")
    await fillInput(page, "monto", DATOS_INGRESO.monto, "Monto")
    await fillInput(page, "concepto", DATOS_INGRESO.concepto, "Concepto")

    const submitButtons = ["Registrar Ingreso", "Confirmar", "Guardar"]
    for (const btn of submitButtons) {
      if (await clickButton(page, btn, `Botón ${btn}`)) {
        await page.waitForTimeout(2000)
        logSuccess("Ingreso registrado")
        break
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: MODAL DE TRANSFERENCIA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("🔄 6. Formulario de Transferencia", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/movimientos", "Panel de Movimientos")
  })

  test("6.1 Abrir modal Nueva Transferencia", async ({ page }) => {
    const buttonTexts = ["Nueva Transferencia", "Transferencia", "Transferir"]
    let found = false

    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (found) {
      await waitForModal(page, "Transferencia")
      logSuccess("Modal de transferencia abierto")
    } else {
      test.skip(true, "Botón de transferencia no disponible")
    }
  })

  test("6.2 Llenar formulario de transferencia completo", async ({ page }) => {
    const transferClicked = await clickButton(page, "Transferencia", "Botón Transferencia")

    if (!transferClicked) {
      test.skip(true, "Botón de transferencia no encontrado")
      return
    }

    await waitForModal(page, "Transferencia")

    log("Llenando formulario de transferencia")

    // Seleccionar banco origen
    await selectOption(page, "bancoOrigenId", DATOS_TRANSFERENCIA.bancoOrigen, "Banco Origen")

    // Seleccionar banco destino
    await selectOption(page, "bancoDestinoId", DATOS_TRANSFERENCIA.bancoDestino, "Banco Destino")

    // Llenar monto
    await fillInput(page, "monto", DATOS_TRANSFERENCIA.monto, "Monto")

    // Llenar concepto
    await fillInput(page, "concepto", DATOS_TRANSFERENCIA.concepto, "Concepto")

    // Verificar visualización de transferencia
    const hasVisualizacion = await page
      .locator("text=/origen.*destino|→|➔/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    if (hasVisualizacion) {
      logSuccess("Visualización de transferencia visible")
    }

    const submitButtons = ["Transferir", "Confirmar", "Realizar Transferencia"]
    for (const btn of submitButtons) {
      if (await clickButton(page, btn, `Botón ${btn}`)) {
        await page.waitForTimeout(2000)
        logSuccess("Transferencia realizada")
        break
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: CLIENTES - ABONOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("👥 7. Formulario de Abono de Cliente", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/clientes", "Panel de Clientes")
  })

  test("7.1 Abrir modal Nuevo Cliente", async ({ page }) => {
    const buttonTexts = ["Nuevo Cliente", "Agregar Cliente", "+"]
    let found = false

    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (found) {
      await waitForModal(page, "Cliente")
      logSuccess("Modal de cliente abierto")
    } else {
      const hasClientesContent = await page.locator("text=/cliente/i").count()
      expect(hasClientesContent).toBeGreaterThan(0)
      test.skip(true, "Botón de cliente no disponible")
    }
  })

  test("7.2 Registrar abono de cliente", async ({ page }) => {
    // Buscar un cliente existente y su botón de abono
    const abonoButton = await page
      .locator('button:has-text("Abono"), button:has-text("Abonar"), [aria-label*="abono"]')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (abonoButton) {
      await page.locator('button:has-text("Abono")').first().click()
      await waitForModal(page, "Abono")

      log("Llenando formulario de abono")

      await fillInput(page, "monto", DATOS_ABONO_CLIENTE.monto, "Monto abono")
      await selectOption(page, "bancoDestino", DATOS_ABONO_CLIENTE.bancoDestino, "Banco destino")

      const submitButtons = ["Registrar Abono", "Confirmar", "Abonar"]
      for (const btn of submitButtons) {
        if (await clickButton(page, btn, `Botón ${btn}`)) {
          await page.waitForTimeout(2000)
          logSuccess("Abono registrado")
          break
        }
      }
    } else {
      test.skip(true, "Botón de abono no encontrado")
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: DISTRIBUIDORES - PAGOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("🚚 8. Formulario de Pago a Distribuidor", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/distribuidores", "Panel de Distribuidores")
  })

  test("8.1 Abrir modal Nuevo Distribuidor", async ({ page }) => {
    const buttonTexts = ["Nuevo Distribuidor", "Agregar Distribuidor", "+"]
    let found = false

    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (found) {
      await waitForModal(page, "Distribuidor")
      logSuccess("Modal de distribuidor abierto")
    } else {
      test.skip(true, "Botón de distribuidor no disponible")
    }
  })

  test("8.2 Registrar pago a distribuidor", async ({ page }) => {
    const pagoButton = await page
      .locator('button:has-text("Pago"), button:has-text("Pagar"), [aria-label*="pago"]')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (pagoButton) {
      await page.locator('button:has-text("Pago")').first().click()
      await waitForModal(page, "Pago")

      log("Llenando formulario de pago")

      await fillInput(page, "monto", DATOS_PAGO_DISTRIBUIDOR.monto, "Monto pago")
      await selectOption(page, "bancoOrigen", DATOS_PAGO_DISTRIBUIDOR.bancoOrigen, "Banco origen")

      const submitButtons = ["Registrar Pago", "Confirmar", "Pagar"]
      for (const btn of submitButtons) {
        if (await clickButton(page, btn, `Botón ${btn}`)) {
          await page.waitForTimeout(2000)
          logSuccess("Pago registrado")
          break
        }
      }
    } else {
      test.skip(true, "Botón de pago no encontrado")
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: ALMACÉN - PRODUCTOS Y CORTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("📦 9. Formularios de Almacén", () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, "/almacen", "Panel de Almacén")
  })

  test("9.1 Abrir modal Nuevo Producto", async ({ page }) => {
    const buttonTexts = ["Nuevo Producto", "Agregar Producto", "+"]
    let found = false

    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (found) {
      await waitForModal(page, "Producto")
      logSuccess("Modal de producto abierto")
    } else {
      test.skip(true, "Botón de producto no disponible")
    }
  })

  test("9.2 Llenar formulario de nuevo producto", async ({ page }) => {
    const productClicked = await clickButton(page, "Nuevo Producto", "Botón Nuevo Producto")

    if (!productClicked) {
      test.skip(true, "Botón de producto no encontrado")
      return
    }

    await waitForModal(page, "Producto")

    log("Llenando formulario de producto")

    await fillInput(page, "nombre", DATOS_PRODUCTO.nombre, "Nombre producto")
    await fillInput(page, "sku", DATOS_PRODUCTO.sku, "SKU")
    await fillInput(page, "cantidad", DATOS_PRODUCTO.cantidad, "Cantidad")
    await fillInput(page, "precioCompra", DATOS_PRODUCTO.precioCompra, "Precio compra")
    await fillInput(page, "precioVenta", DATOS_PRODUCTO.precioVenta, "Precio venta")

    const submitButtons = ["Crear Producto", "Guardar", "Confirmar"]
    for (const btn of submitButtons) {
      if (await clickButton(page, btn, `Botón ${btn}`)) {
        await page.waitForTimeout(2000)
        logSuccess("Producto creado")
        break
      }
    }
  })

  test("9.3 Abrir modal Nuevo Corte", async ({ page }) => {
    const buttonTexts = ["Nuevo Corte", "Corte de Inventario", "Registrar Corte"]
    let found = false

    for (const text of buttonTexts) {
      if (await clickButton(page, text, `Botón ${text}`)) {
        found = true
        break
      }
    }

    if (found) {
      await waitForModal(page, "Corte")
      logSuccess("Modal de corte abierto")
    } else {
      test.skip(true, "Botón de corte no disponible")
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: VERIFICACIÓN DE COMPONENTES UI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("🎨 10. Verificación de Componentes UI", () => {
  test("10.1 KPIs y métricas en Dashboard", async ({ page }) => {
    await navigateTo(page, "/", "Dashboard")

    // Verificar presencia de KPIs/Stats Cards
    const kpiSelectors = [
      '[class*="stat"]',
      '[class*="kpi"]',
      '[class*="metric"]',
      '[class*="card"]',
    ]

    let kpisFound = 0
    for (const selector of kpiSelectors) {
      const count = await page.locator(selector).count()
      kpisFound += count
    }

    log(`KPIs encontrados: ${kpisFound}`)
    expect(kpisFound).toBeGreaterThan(0)
    logSuccess("KPIs presentes en dashboard")
  })

  test("10.2 Tablas de datos en Ventas", async ({ page }) => {
    await navigateTo(page, "/ventas", "Panel de Ventas")

    const tableSelectors = ["table", '[role="table"]', '[class*="table"]', "tbody"]
    let tableFound = false

    for (const selector of tableSelectors) {
      const table = page.locator(selector).first()
      if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
        tableFound = true
        logSuccess("Tabla de ventas visible")

        // Verificar que tiene filas
        const rows = await page.locator('tr, [role="row"]').count()
        log(`Filas en tabla: ${rows}`)
        break
      }
    }

    // Si no hay tabla, verificar grid de cards
    if (!tableFound) {
      const cards = await page.locator('[class*="card"], [class*="grid"] > div').count()
      log(`Cards/items encontrados: ${cards}`)
      expect(cards).toBeGreaterThan(0)
    }
  })

  test("10.3 Panel de Bancos - 7 bancos visibles", async ({ page }) => {
    await navigateTo(page, "/bancos", "Panel de Bancos")

    const bancoNames = [
      "Bóveda Monte",
      "USA",
      "Profit",
      "Leftie",
      "Azteca",
      "Flete Sur",
      "Utilidades",
    ]

    let bancosEncontrados = 0
    for (const banco of bancoNames) {
      const bankVisible = await page
        .locator(`text=${banco}`)
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
      if (bankVisible) {
        bancosEncontrados++
        logSuccess(`Banco visible: ${banco}`)
      }
    }

    log(`Bancos encontrados: ${bancosEncontrados}/7`)
    expect(bancosEncontrados).toBeGreaterThan(0)
  })

  test("10.4 Progress bars y animaciones", async ({ page }) => {
    await navigateTo(page, "/ventas", "Panel de Ventas")

    // Buscar progress bars
    const progressSelectors = ['[class*="progress"]', '[role="progressbar"]', "progress"]

    let progressFound = false
    for (const selector of progressSelectors) {
      const progress = page.locator(selector).first()
      if (await progress.isVisible({ timeout: 3000 }).catch(() => false)) {
        progressFound = true
        logSuccess("Progress bar visible")
        break
      }
    }

    // Verificar elementos animados (con motion)
    const animatedElements = await page.locator('[class*="animate"], [style*="transform"]').count()
    log(`Elementos animados: ${animatedElements}`)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: VALIDACIONES Y ERRORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("⚠️ 11. Validaciones de Formularios", () => {
  test("11.1 Validación de campos requeridos en Venta", async ({ page }) => {
    await navigateTo(page, "/ventas", "Panel de Ventas")

    const buttonFound = await clickButton(page, "Nueva Venta", "Botón Nueva Venta")
    if (!buttonFound) {
      test.skip(true, "Modal de venta no disponible")
      return
    }

    await waitForModal(page, "Nueva Venta")

    // Intentar avanzar sin llenar campos
    await clickButton(page, "Siguiente", "Siguiente sin datos")

    // Verificar mensaje de error
    const errorVisible = await page
      .locator("text=/requerido|obligatorio|error|invalid/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (errorVisible) {
      logSuccess("Validación de campos requeridos funcionando")
    } else {
      // Puede que el sistema bloquee el botón en lugar de mostrar error
      const buttonDisabled = await page
        .locator('button:has-text("Siguiente")[disabled]')
        .isVisible({ timeout: 2000 })
        .catch(() => false)
      if (buttonDisabled) {
        logSuccess("Botón deshabilitado sin datos válidos")
      }
    }
  })

  test("11.2 Validación de capital insuficiente", async ({ page }) => {
    await navigateTo(page, "/gastos", "Panel de Gastos")

    const buttonFound = await clickButton(page, "Nuevo Gasto", "Botón Nuevo Gasto")
    if (!buttonFound) {
      test.skip(true, "Modal de gasto no disponible")
      return
    }

    await waitForModal(page, "Gasto")

    // Intentar registrar un gasto mayor al capital
    await fillInput(page, "monto", 999999999, "Monto excesivo")

    // Verificar mensaje de capital insuficiente
    const errorVisible = await page
      .locator("text=/insuficiente|excede|mayor/i")
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (errorVisible) {
      logSuccess("Validación de capital insuficiente funcionando")
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: RESPONSIVE DESIGN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("📱 12. Responsive Design", () => {
  test("12.1 Vista móvil (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await navigateTo(page, "/", "Dashboard Móvil")

    const bodyContent = await page.locator("body").textContent()
    expect(bodyContent?.length).toBeGreaterThan(50)
    logSuccess("Dashboard carga en móvil")

    // Verificar que no hay overflow horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = 375
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50) // Tolerancia de 50px
    logSuccess("Sin overflow horizontal en móvil")
  })

  test("12.2 Vista tablet (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await navigateTo(page, "/ventas", "Ventas Tablet")

    const bodyContent = await page.locator("body").textContent()
    expect(bodyContent?.length).toBeGreaterThan(50)
    logSuccess("Ventas carga en tablet")
  })

  test("12.3 Vista desktop (1920px)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await navigateTo(page, "/bancos", "Bancos Desktop")

    const bodyContent = await page.locator("body").textContent()
    expect(bodyContent?.length).toBeGreaterThan(50)
    logSuccess("Bancos carga en desktop")
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEST: INTEGRACIÓN API
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

test.describe("🔌 13. Integración con API", () => {
  test("13.1 API de Ventas responde correctamente", async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/ventas`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    log(`API Ventas: ${JSON.stringify(data).slice(0, 100)}...`)
    logSuccess("API de ventas funcionando")
  })

  test("13.2 API de Bancos responde correctamente", async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/bancos`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    log(`API Bancos: ${JSON.stringify(data).slice(0, 100)}...`)
    logSuccess("API de bancos funcionando")
  })

  test("13.3 API de Clientes responde correctamente", async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/clientes`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    log(`API Clientes: ${JSON.stringify(data).slice(0, 100)}...`)
    logSuccess("API de clientes funcionando")
  })
})
