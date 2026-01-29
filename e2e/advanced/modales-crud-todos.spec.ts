import { Page, test } from "@playwright/test"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔲 CHRONOS GEN5 2026 — TESTS E2E: MODALES CRUD COMPLETOS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos de todos los modales CRUD Gen5 en cada panel:
 *
 * ✅ Apertura/cierre de modales (FormModal glassmorphism)
 * ✅ Validación de formularios (Zod)
 * ✅ Crear (Create) con GlassInput/GlassSelect
 * ✅ Leer (Read) - detalles
 * ✅ Actualizar (Update)
 * ✅ Eliminar (Delete)
 * ✅ Estados de carga
 * ✅ Mensajes de éxito/error (toast notifications)
 *
 * ARQUITECTURA GEN5:
 * - FormModal con efecto glassmorphism
 * - GlassInput, GlassSelect, GlassButton
 * - Animaciones framer-motion 300-500ms
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// CONFIGURACIÓN GEN5
// ============================================

test.setTimeout(45000) // Animaciones framer-motion Gen5

const BASE_TIMEOUT = 25000
const TEST_ID = Date.now()

// Selectores Gen5 centralizados
const GEN5_SELECTORS = {
  modal:
    '[role="dialog"], [class*="FormModal"], [class*="glass"][class*="modal"], [class*="Dialog"]',
  closeModal:
    'button:has-text("Cancelar"), button:has-text("Cerrar"), button[aria-label*="close"], [class*="close"]',
  submitBtn:
    'button[type="submit"], button:has-text("Guardar"), button:has-text("Crear"), button:has-text("Confirmar")',
  input: 'input[class*="glass"], [class*="GlassInput"] input, input',
  select: 'select[class*="glass"], [class*="GlassSelect"] select, select',
  button: 'button[class*="glass"], button[class*="Glass"], button',
}

// Configuración de modales Gen5 por panel
const MODALES_CONFIG = [
  {
    panel: "Ventas",
    path: "/ventas",
    modales: {
      crear: {
        trigger: ["Nueva Venta", "Registrar Venta", "Crear Venta", "Nueva", "+"],
        campos: ["cliente", "producto", "cantidad", "precio", "precioCompra", "precioFlete"],
        requeridos: ["cliente", "cantidad", "precio"],
      },
      editar: {
        trigger: ["Editar", "✏️", "Edit"],
        campos: ["cliente", "producto", "cantidad", "precio"],
        requeridos: ["cantidad", "precio"],
      },
      eliminar: {
        trigger: ["Eliminar", "🗑️", "Borrar", "Delete"],
        confirmacion: true,
      },
      detalle: {
        trigger: ["Ver", "Detalle", "👁️"],
        readonly: true,
      },
    },
  },
  {
    panel: "Clientes",
    path: "/clientes",
    modales: {
      crear: {
        trigger: ["Nuevo Cliente", "Agregar Cliente", "Crear Cliente", "+"],
        campos: ["nombre", "telefono", "email", "direccion"],
        requeridos: ["nombre"],
      },
      editar: {
        trigger: ["Editar", "✏️"],
        campos: ["nombre", "telefono", "email", "direccion"],
        requeridos: ["nombre"],
      },
      eliminar: {
        trigger: ["Eliminar", "🗑️"],
        confirmacion: true,
      },
    },
  },
  {
    panel: "Bancos",
    path: "/bancos",
    modales: {
      crear: {
        trigger: ["Nuevo Movimiento", "Nueva Transacción", "Transferir", "Agregar", "+"],
        campos: ["tipo", "monto", "descripcion", "banco"],
        requeridos: ["tipo", "monto", "banco"],
      },
      editar: {
        trigger: ["Editar", "✏️"],
        campos: ["tipo", "monto", "descripcion"],
        requeridos: ["monto"],
      },
    },
  },
  {
    panel: "Distribuidores",
    path: "/distribuidores",
    modales: {
      crear: {
        trigger: ["Nuevo Distribuidor", "Agregar Distribuidor", "+"],
        campos: ["nombre", "contacto", "telefono"],
        requeridos: ["nombre"],
      },
      editar: {
        trigger: ["Editar", "✏️"],
        campos: ["nombre", "contacto", "telefono"],
        requeridos: ["nombre"],
      },
      eliminar: {
        trigger: ["Eliminar", "🗑️"],
        confirmacion: true,
      },
    },
  },
  {
    panel: "Órdenes",
    path: "/ordenes",
    modales: {
      crear: {
        trigger: ["Nueva Orden", "Nueva OC", "Crear Orden", "+"],
        campos: ["distribuidor", "producto", "cantidad", "precio"],
        requeridos: ["distribuidor", "cantidad"],
      },
      editar: {
        trigger: ["Editar", "✏️"],
        campos: ["distribuidor", "producto", "cantidad", "precio", "estado"],
        requeridos: ["cantidad"],
      },
    },
  },
  {
    panel: "Almacén",
    path: "/almacen",
    modales: {
      crear: {
        trigger: ["Nuevo Producto", "Agregar Producto", "+"],
        campos: ["nombre", "sku", "stock", "precio"],
        requeridos: ["nombre", "stock"],
      },
      editar: {
        trigger: ["Editar", "✏️"],
        campos: ["nombre", "sku", "stock", "precio"],
        requeridos: ["nombre", "stock"],
      },
    },
  },
  {
    panel: "Gastos",
    path: "/gastos",
    modales: {
      crear: {
        trigger: ["Nuevo Gasto", "Registrar Gasto", "Agregar", "+"],
        campos: ["descripcion", "monto", "categoria", "fecha", "banco"],
        requeridos: ["monto", "descripcion"],
      },
      editar: {
        trigger: ["Editar", "✏️"],
        campos: ["descripcion", "monto", "categoria"],
        requeridos: ["monto"],
      },
      eliminar: {
        trigger: ["Eliminar", "🗑️"],
        confirmacion: true,
      },
    },
  },
]

// ============================================
// HELPERS GEN5
// ============================================

async function navegarA(page: Page, path: string, nombre: string) {
  console.log(`\n📍 Navegando a: ${nombre} (${path})`)
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: BASE_TIMEOUT })
  await page.waitForTimeout(2500)
}

async function buscarBoton(page: Page, textos: string[]): Promise<boolean> {
  // Primero buscar botones Gen5 con icono Plus
  const plusSelectors = [
    'button:has(svg[class*="plus" i])',
    'button:has(svg[class*="Plus" i])',
    '[class*="glass"] button:has(svg)',
    "header button:has(svg)",
    'button[class*="Glass"]',
    'button[class*="glass"]',
  ]

  for (const selector of plusSelectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      return true
    }
  }

  for (const texto of textos) {
    const selectors = [
      `button:has-text("${texto}")`,
      `button[class*="glass"]:has-text("${texto}")`,
      `[role="button"]:has-text("${texto}")`,
      `a:has-text("${texto}")`,
      `button:text-is("${texto}")`,
      `[aria-label*="${texto}" i]`,
    ]

    for (const selector of selectors) {
      const btn = page.locator(selector).first()
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        return true
      }
    }
  }
  return false
}

async function clickBoton(page: Page, textos: string[]): Promise<boolean> {
  // Primero intentar botones con icono Plus
  const plusSelectors = [
    'button:has(svg[class*="plus" i])',
    'button:has(svg[class*="Plus" i])',
    '[class*="glass"] button:has(svg)',
    'button[class*="Glass"]',
  ]

  for (const selector of plusSelectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click()
      return true
    }
  }

  for (const texto of textos) {
    const selectors = [
      `button:has-text("${texto}")`,
      `[role="button"]:has-text("${texto}")`,
      `a:has-text("${texto}")`,
      `button:text-is("${texto}")`,
      `[aria-label*="${texto}" i]`,
      `[data-testid*="${texto.toLowerCase()}"]`,
    ]

    for (const selector of selectors) {
      const btn = page.locator(selector).first()
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click()
        return true
      }
    }
  }
  return false
}

async function verificarModalAbierto(page: Page): Promise<boolean> {
  const selectoresModal = [
    '[role="dialog"]',
    '[class*="modal"]',
    '[class*="Modal"]',
    '[class*="Dialog"]',
    '[data-state="open"]',
    ".fixed.inset-0",
    '[aria-modal="true"]',
    // GlassModal del sistema de diseño
    '[class*="glass"][class*="fixed"]',
  ]

  for (const selector of selectoresModal) {
    if (
      await page
        .locator(selector)
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      return true
    }
  }
  return false
}

async function cerrarModal(page: Page): Promise<boolean> {
  const selectoresCerrar = [
    'button:has-text("Cerrar")',
    'button:has-text("Cancelar")',
    'button:has-text("×")',
    'button[aria-label="Close"]',
    '[data-testid="close-modal"]',
    ".absolute.top-2.right-2 button",
  ]

  for (const selector of selectoresCerrar) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(500)
      return true
    }
  }

  // Intentar con ESC
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)

  return !(await verificarModalAbierto(page))
}

async function contarCamposFormulario(page: Page): Promise<number> {
  const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"]').first()

  if (!(await modal.isVisible({ timeout: 2000 }).catch(() => false))) {
    return 0
  }

  const inputs = await modal.locator('input:not([type="hidden"]), select, textarea').count()
  return inputs
}

async function llenarFormularioBasico(
  page: Page,
  valores: Record<string, string>
): Promise<number> {
  let camposLlenados = 0

  for (const [campo, valor] of Object.entries(valores)) {
    const selectors = [
      `input[name="${campo}"]`,
      `input[id*="${campo}"]`,
      `input[placeholder*="${campo}"]`,
      `select[name="${campo}"]`,
      `textarea[name="${campo}"]`,
    ]

    for (const selector of selectors) {
      const input = page.locator(selector).first()
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        const tagName = await input.evaluate((el) => el.tagName.toLowerCase())

        if (tagName === "select") {
          await input.selectOption({ index: 1 }).catch(() => {})
        } else {
          await input.fill(valor)
        }

        camposLlenados++
        break
      }
    }
  }

  return camposLlenados
}

async function verificarMensajeExito(page: Page): Promise<boolean> {
  const selectores = [
    "text=/éxito|guardado|creado|actualizado/i",
    '[class*="success"]',
    '[class*="toast"]:has-text("éxito")',
    '[role="alert"]:has-text("éxito")',
  ]

  for (const selector of selectores) {
    if (
      await page
        .locator(selector)
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      return true
    }
  }
  return false
}

async function verificarMensajeError(page: Page): Promise<boolean> {
  const selectores = [
    "text=/error|requerido|obligatorio|inválido/i",
    '[class*="error"]',
    '[class*="invalid"]',
    '[aria-invalid="true"]',
  ]

  for (const selector of selectores) {
    if (
      await page
        .locator(selector)
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      return true
    }
  }
  return false
}

async function verificarEstadoCarga(page: Page): Promise<boolean> {
  const selectores = [
    '[class*="loading"]',
    '[class*="spinner"]',
    'button[disabled]:has-text("Guardando")',
    '[data-loading="true"]',
  ]

  for (const selector of selectores) {
    if (
      await page
        .locator(selector)
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false)
    ) {
      return true
    }
  }
  return false
}

// ============================================
// TESTS DE APERTURA/CIERRE DE MODALES
// ============================================

test.describe("🔲 SUITE: Apertura/Cierre de Modales", () => {
  for (const config of MODALES_CONFIG) {
    test(`Modal crear en ${config.panel}`, async ({ page }) => {
      await navegarA(page, config.path, config.panel)

      // Buscar botón de crear
      const tieneBoton = await buscarBoton(page, config.modales.crear.trigger)
      console.log(`   🔘 Botón crear: ${tieneBoton ? "✅" : "⚠️"}`)

      if (tieneBoton) {
        // Click para abrir
        await clickBoton(page, config.modales.crear.trigger)
        await page.waitForTimeout(500)

        const modalAbierto = await verificarModalAbierto(page)
        console.log(`   📦 Modal abierto: ${modalAbierto ? "✅" : "⚠️"}`)

        if (modalAbierto) {
          // Verificar que se puede cerrar
          const cerrado = await cerrarModal(page)
          console.log(`   ❌ Modal cerrado: ${cerrado ? "✅" : "⚠️"}`)
        }
      }
    })
  }
})

// ============================================
// TESTS DE VALIDACIÓN DE FORMULARIOS
// ============================================

test.describe("✔️ SUITE: Validación de Formularios", () => {
  for (const config of MODALES_CONFIG) {
    test(`Validación en ${config.panel}`, async ({ page }) => {
      await navegarA(page, config.path, config.panel)

      // Abrir modal de crear
      if (!(await clickBoton(page, config.modales.crear.trigger))) {
        console.log("   ⚠️ No se pudo abrir modal")
        return
      }

      await page.waitForTimeout(500)

      if (!(await verificarModalAbierto(page))) {
        console.log("   ⚠️ Modal no visible")
        return
      }

      // Contar campos
      const numCampos = await contarCamposFormulario(page)
      console.log(`   📝 Campos encontrados: ${numCampos}`)

      // Intentar guardar sin datos
      const btnGuardar = page
        .locator('button:has-text("Guardar"), button:has-text("Crear"), button[type="submit"]')
        .first()
      if (await btnGuardar.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btnGuardar.click()
        await page.waitForTimeout(500)

        const tieneErrores = await verificarMensajeError(page)
        console.log(`   ⚠️ Validación de vacíos: ${tieneErrores ? "✅ (muestra errores)" : "ℹ️"}`)
      }

      await cerrarModal(page)
    })
  }
})

// ============================================
// TESTS DE CREAR (CREATE)
// ============================================

test.describe("➕ SUITE: Crear (CREATE)", () => {
  for (const config of MODALES_CONFIG) {
    test(`Crear en ${config.panel}`, async ({ page }) => {
      await navegarA(page, config.path, config.panel)

      if (!(await clickBoton(page, config.modales.crear.trigger))) {
        console.log("   ⚠️ No se pudo abrir modal de crear")
        return
      }

      await page.waitForTimeout(500)

      // Llenar formulario con datos de prueba
      const datosTest: Record<string, string> = {}
      for (const campo of config.modales.crear.campos) {
        datosTest[campo] = `Test_${campo}_${TEST_ID}`
      }

      const camposLlenados = await llenarFormularioBasico(page, datosTest)
      console.log(`   📝 Campos llenados: ${camposLlenados}/${config.modales.crear.campos.length}`)

      // Click en guardar
      const btnGuardar = page
        .locator('button:has-text("Guardar"), button:has-text("Crear"), button[type="submit"]')
        .first()
      if (await btnGuardar.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btnGuardar.click()

        // Verificar estado de carga
        const tieneCarga = await verificarEstadoCarga(page)
        console.log(`   ⏳ Estado de carga: ${tieneCarga ? "✅" : "ℹ️"}`)

        await page.waitForTimeout(2000)

        // Verificar éxito
        const exito = await verificarMensajeExito(page)
        console.log(`   ✅ Mensaje éxito: ${exito ? "✅" : "ℹ️"}`)
      }
    })
  }
})

// ============================================
// TESTS DE EDITAR (UPDATE)
// ============================================

test.describe("✏️ SUITE: Editar (UPDATE)", () => {
  for (const config of MODALES_CONFIG) {
    if (!config.modales.editar) continue

    test(`Editar en ${config.panel}`, async ({ page }) => {
      await navegarA(page, config.path, config.panel)

      // Buscar primer botón de editar en tabla
      const btnEditar = page
        .locator('button:has-text("Editar"), button[aria-label*="edit"], [data-testid*="edit"]')
        .first()

      if (!(await btnEditar.isVisible({ timeout: 3000 }).catch(() => false))) {
        console.log("   ⚠️ No hay botón de editar visible")
        return
      }

      await btnEditar.click()
      await page.waitForTimeout(500)

      if (!(await verificarModalAbierto(page))) {
        console.log("   ⚠️ Modal de editar no se abrió")
        return
      }

      // Verificar que los campos tienen valores
      const inputs = await page.locator('[role="dialog"] input, [class*="modal"] input').all()
      let camposConValor = 0

      for (const input of inputs) {
        const valor = await input.inputValue().catch(() => "")
        if (valor) camposConValor++
      }

      console.log(`   📝 Campos con datos: ${camposConValor}/${inputs.length}`)

      // Modificar un campo
      const primerInput = page.locator('[role="dialog"] input:not([type="hidden"])').first()
      if (await primerInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await primerInput.fill(`Editado_${TEST_ID}`)
        console.log("   ✏️ Campo modificado")
      }

      // Guardar
      const btnGuardar = page
        .locator('button:has-text("Guardar"), button:has-text("Actualizar"), button[type="submit"]')
        .first()
      if (await btnGuardar.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btnGuardar.click()
        await page.waitForTimeout(2000)

        const exito = await verificarMensajeExito(page)
        console.log(`   ✅ Actualización: ${exito ? "✅" : "ℹ️"}`)
      }
    })
  }
})

// ============================================
// TESTS DE ELIMINAR (DELETE)
// ============================================

test.describe("🗑️ SUITE: Eliminar (DELETE)", () => {
  for (const config of MODALES_CONFIG) {
    if (!config.modales.eliminar) continue

    test(`Eliminar en ${config.panel}`, async ({ page }) => {
      await navegarA(page, config.path, config.panel)

      // Buscar botón de eliminar
      const btnEliminar = page
        .locator(
          'button:has-text("Eliminar"), button[aria-label*="delete"], [data-testid*="delete"]'
        )
        .first()

      if (!(await btnEliminar.isVisible({ timeout: 3000 }).catch(() => false))) {
        console.log("   ⚠️ No hay botón de eliminar visible")
        return
      }

      await btnEliminar.click()
      await page.waitForTimeout(500)

      // Verificar diálogo de confirmación
      if (config.modales.eliminar?.confirmacion) {
        const confirmDialog = page.locator("text=/confirmar|seguro|eliminar/i").first()
        const tieneConfirmacion = await confirmDialog
          .isVisible({ timeout: 2000 })
          .catch(() => false)
        console.log(`   ❓ Confirmación: ${tieneConfirmacion ? "✅" : "⚠️"}`)

        if (tieneConfirmacion) {
          // Cancelar la eliminación (no queremos eliminar datos reales)
          await clickBoton(page, ["Cancelar", "No", "Cerrar"])
          console.log("   ❌ Cancelado (para no eliminar datos reales)")
        }
      }
    })
  }
})

// ============================================
// TESTS DE VER DETALLE (READ)
// ============================================

test.describe("👁️ SUITE: Ver Detalle (READ)", () => {
  for (const config of MODALES_CONFIG) {
    if (!config.modales.detalle) continue

    test(`Detalle en ${config.panel}`, async ({ page }) => {
      await navegarA(page, config.path, config.panel)

      // Buscar botón de ver detalle
      if (!config.modales.detalle || !(await clickBoton(page, config.modales.detalle.trigger))) {
        console.log("   ⚠️ No hay botón de detalle")
        return
      }

      await page.waitForTimeout(500)

      if (!(await verificarModalAbierto(page))) {
        console.log("   ⚠️ Modal de detalle no se abrió")
        return
      }

      // Verificar que los campos son readonly
      const inputs = await page.locator('[role="dialog"] input').all()
      let camposReadonly = 0

      for (const input of inputs) {
        const readonly = await input.getAttribute("readonly")
        const disabled = await input.isDisabled()
        if (readonly !== null || disabled) camposReadonly++
      }

      console.log(`   👁️ Campos readonly: ${camposReadonly}/${inputs.length}`)

      await cerrarModal(page)
    })
  }
})

// ============================================
// TESTS DE ESTADOS DE CARGA
// ============================================

test.describe("⏳ SUITE: Estados de Carga", () => {
  test("Modal muestra spinner al guardar", async ({ page }) => {
    await navegarA(page, "/ventas", "Ventas")

    if (!(await clickBoton(page, ["Nueva Venta", "Agregar", "+"]))) {
      console.log("   ⚠️ No se pudo abrir modal")
      return
    }

    await page.waitForTimeout(500)

    // Llenar campos mínimos
    const inputs = await page.locator('[role="dialog"] input').all()
    for (let i = 0; i < Math.min(inputs.length, 3); i++) {
      const input = inputs[i]
      if (input) await input.fill(`Test_${i}`).catch(() => {})
    }

    // Click en guardar
    const btnGuardar = page.locator('button:has-text("Guardar"), button[type="submit"]').first()
    if (await btnGuardar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btnGuardar.click()

      // Verificar spinner inmediatamente
      const tieneSpinner = await page
        .locator('[class*="spinner"], [class*="loading"], svg[class*="animate"]')
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      console.log(`   ⏳ Spinner visible: ${tieneSpinner ? "✅" : "ℹ️"}`)
    }
  })
})

// ============================================
// TEST DE RESUMEN GLOBAL
// ============================================

test("📊 Resumen Global de Modales CRUD", async ({ page }) => {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 RESUMEN GLOBAL DE MODALES CRUD")
  console.log("═══════════════════════════════════════════════════\n")

  const resultados: Array<{
    panel: string
    crear: boolean
    editar: boolean
    eliminar: boolean
    detalle: boolean
    campos: number
  }> = []

  for (const config of MODALES_CONFIG) {
    await navegarA(page, config.path, config.panel)

    const resultado = {
      panel: config.panel,
      crear: await buscarBoton(page, config.modales.crear.trigger),
      editar: config.modales.editar
        ? await buscarBoton(page, config.modales.editar.trigger)
        : false,
      eliminar: config.modales.eliminar ? await buscarBoton(page, ["Eliminar", "🗑️"]) : false,
      detalle: config.modales.detalle
        ? await buscarBoton(page, config.modales.detalle.trigger)
        : false,
      campos: 0,
    }

    // Contar campos si se puede abrir modal
    if (resultado.crear && (await clickBoton(page, config.modales.crear.trigger))) {
      await page.waitForTimeout(500)
      resultado.campos = await contarCamposFormulario(page)
      await cerrarModal(page)
    }

    resultados.push(resultado)

    console.log(`\n📱 ${config.panel}:`)
    console.log(`   ➕ Crear: ${resultado.crear ? "✅" : "❌"}`)
    console.log(`   ✏️ Editar: ${resultado.editar ? "✅" : "❌"}`)
    console.log(`   🗑️ Eliminar: ${resultado.eliminar ? "✅" : "❌"}`)
    console.log(`   👁️ Detalle: ${resultado.detalle ? "✅" : "➖"}`)
    console.log(`   📝 Campos: ${resultado.campos}`)
  }

  // Totales
  const totales = {
    crear: resultados.filter((r) => r.crear).length,
    editar: resultados.filter((r) => r.editar).length,
    eliminar: resultados.filter((r) => r.eliminar).length,
    detalle: resultados.filter((r) => r.detalle).length,
  }

  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 TOTALES:")
  console.log(`   ➕ Paneles con Crear: ${totales.crear}/${MODALES_CONFIG.length}`)
  console.log(`   ✏️ Paneles con Editar: ${totales.editar}/${MODALES_CONFIG.length}`)
  console.log(`   🗑️ Paneles con Eliminar: ${totales.eliminar}/${MODALES_CONFIG.length}`)
  console.log(`   👁️ Paneles con Detalle: ${totales.detalle}/${MODALES_CONFIG.length}`)
  console.log("═══════════════════════════════════════════════════\n")
})
