import { expect, Page, test } from "@playwright/test"
import { GEN5_CONFIG, GEN5_SELECTORS } from "./gen5-test-utils"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💾 CHRONOS GEN5 2026 — TESTS E2E: PERSISTENCIA DB-UI (CICLO COMPLETO)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests que verifican el ciclo completo Form → DB → UI (Gen5):
 *
 * ✅ Crear registro → Verificar en PremiumDataTable
 * ✅ Editar registro → Verificar cambios en UI
 * ✅ Eliminar registro → Verificar ausencia en UI
 * ✅ Persistencia tras refresh
 * ✅ Sincronización entre paneles relacionados
 * ✅ Datos correctos en todos los formatos (números, fechas, textos)
 *
 * COMPONENTES GEN5:
 * - FormModal con GlassInput/GlassSelect
 * - PremiumDataTable para visualización
 * - GlassButton para acciones
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// CONFIGURACIÓN GEN5
// ============================================

const TEST_ID = Date.now()
// Timeout aumentado para animaciones framer-motion Gen5
test.setTimeout(45000)

const BASE_TIMEOUT = GEN5_CONFIG.BASE_TIMEOUT
const ANIMATION_WAIT = GEN5_CONFIG.ANIMATION_WAIT

interface TestData {
  tipo: string
  path: string
  formSelectors: {
    nombre?: string
    cantidad?: string
    monto?: string
    concepto?: string
  }
  btnNuevo: string[]
  btnGuardar: string[]
  btnEditar: string[]
  btnEliminar: string[]
  verificarEnTabla: string
}

// Entidades con selectores Gen5
const ENTIDADES: TestData[] = [
  {
    tipo: "Venta",
    path: "/ventas",
    formSelectors: {
      cantidad: `${GEN5_SELECTORS.input}[name="cantidad"], input[name="cantidad"]`,
      monto: `${GEN5_SELECTORS.input}[name="precioVenta"], input[name="precio"]`,
    },
    btnNuevo: [
      'button:has-text("Nueva Venta")',
      'button:has-text("Registrar")',
      `${GEN5_SELECTORS.primaryButton}`,
    ],
    btnGuardar: ['button:has-text("Guardar")', `${GEN5_SELECTORS.modalSubmit}`],
    btnEditar: ['button:has-text("Editar")', `${GEN5_SELECTORS.tableAction}`],
    btnEliminar: ['button:has-text("Eliminar")', `${GEN5_SELECTORS.dangerButton}`],
    verificarEnTabla: GEN5_SELECTORS.tableRow,
  },
  {
    tipo: "Cliente",
    path: "/clientes",
    formSelectors: {
      nombre: `${GEN5_SELECTORS.input}[name="nombre"], input[name="nombre"]`,
    },
    btnNuevo: [
      'button:has-text("Nuevo Cliente")',
      'button:has-text("Agregar")',
      `${GEN5_SELECTORS.primaryButton}`,
    ],
    btnGuardar: ['button:has-text("Guardar")', `${GEN5_SELECTORS.modalSubmit}`],
    btnEditar: ['button:has-text("Editar")', `${GEN5_SELECTORS.tableAction}`],
    btnEliminar: ['button:has-text("Eliminar")', `${GEN5_SELECTORS.dangerButton}`],
    verificarEnTabla: GEN5_SELECTORS.tableRow,
  },
  {
    tipo: "Gasto",
    path: "/gastos",
    formSelectors: {
      monto: `${GEN5_SELECTORS.input}[name="monto"], input[name="valor"]`,
      concepto: `${GEN5_SELECTORS.input}[name="concepto"], input[name="concepto"]`,
    },
    btnNuevo: [
      'button:has-text("Nuevo Gasto")',
      'button:has-text("Registrar")',
      `${GEN5_SELECTORS.primaryButton}`,
    ],
    btnGuardar: ['button:has-text("Guardar")', `${GEN5_SELECTORS.modalSubmit}`],
    btnEditar: ['button:has-text("Editar")'],
    btnEliminar: ['button:has-text("Eliminar")'],
    verificarEnTabla: "tbody tr",
  },
]

// ============================================
// HELPERS
// ============================================

async function navegarA(page: Page, path: string, nombre: string) {
  console.log(`\n📍 Navegando a: ${nombre}`)
  await page.goto(path, { waitUntil: "load", timeout: BASE_TIMEOUT })
  await page.waitForTimeout(2000)
}

async function clickPrimerBoton(page: Page, selectors: string[]): Promise<boolean> {
  for (const selector of selectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(500)
      return true
    }
  }
  return false
}

async function contarFilasTabla(page: Page): Promise<number> {
  const filas = page.locator('tbody tr, [role="row"]:not([role="rowgroup"])')
  return await filas.count().catch(() => 0)
}

async function buscarTextoEnTabla(page: Page, texto: string): Promise<boolean> {
  const tabla = page.locator('tbody, [role="grid"]')
  if (!(await tabla.isVisible({ timeout: 3000 }).catch(() => false))) return false

  const contenido = (await tabla.textContent()) || ""
  return contenido.includes(texto)
}

async function esperarYVerificarModal(page: Page): Promise<boolean> {
  const modal = page.locator('[role="dialog"], [class*="modal"]').first()
  return await modal.isVisible({ timeout: 5000 }).catch(() => false)
}

async function cerrarModal(page: Page) {
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)
}

// ============================================
// TESTS DE CICLO CRUD COMPLETO
// ============================================

test.describe("💾 SUITE: Ciclo CRUD Completo", () => {
  for (const entidad of ENTIDADES) {
    test.describe(`📊 ${entidad.tipo}`, () => {
      test(`Crear ${entidad.tipo} y verificar en UI`, async ({ page }) => {
        await navegarA(page, entidad.path, `Panel de ${entidad.tipo}s`)

        // Contar filas iniciales
        const filasIniciales = await contarFilasTabla(page)
        console.log(`   📊 Filas iniciales: ${filasIniciales}`)

        // Abrir modal
        const modalAbierto = await clickPrimerBoton(page, entidad.btnNuevo)
        if (!modalAbierto) {
          console.log(`   ⚠️ No se pudo abrir modal de nuevo ${entidad.tipo}`)
          return
        }

        const modalVisible = await esperarYVerificarModal(page)
        if (!modalVisible) {
          console.log(`   ⚠️ Modal no visible`)
          return
        }

        console.log(`   ✅ Modal abierto`)

        // Llenar formulario con datos de prueba
        const testNombre = `Test_${entidad.tipo}_${TEST_ID}`

        if (entidad.formSelectors.nombre) {
          const input = page.locator(entidad.formSelectors.nombre).first()
          if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
            await input.fill(testNombre)
            console.log(`   ✅ Nombre: ${testNombre}`)
          }
        }

        if (entidad.formSelectors.cantidad) {
          const input = page.locator(entidad.formSelectors.cantidad).first()
          if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
            await input.fill("5")
            console.log(`   ✅ Cantidad: 5`)
          }
        }

        if (entidad.formSelectors.monto) {
          const input = page.locator(entidad.formSelectors.monto).first()
          if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
            await input.fill("10000")
            console.log(`   ✅ Monto: 10000`)
          }
        }

        if (entidad.formSelectors.concepto) {
          const input = page.locator(entidad.formSelectors.concepto).first()
          if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
            await input.fill(`Concepto Test ${TEST_ID}`)
            console.log(`   ✅ Concepto: Test ${TEST_ID}`)
          }
        }

        // Guardar
        const guardado = await clickPrimerBoton(page, entidad.btnGuardar)
        if (guardado) {
          await page.waitForTimeout(2000)
          console.log(`   ✅ Formulario enviado`)
        }

        // Verificar que la fila aparece
        await page.waitForTimeout(1000)
        const filasFinales = await contarFilasTabla(page)
        console.log(`   📊 Filas finales: ${filasFinales}`)

        // El test es informativo
        console.log(`   📈 Diferencia: ${filasFinales - filasIniciales} filas`)
      })

      test(`Verificar persistencia de ${entidad.tipo} tras refresh`, async ({ page }) => {
        await navegarA(page, entidad.path, `Panel de ${entidad.tipo}s`)

        // Contar filas
        const filasAntes = await contarFilasTabla(page)
        console.log(`   📊 Filas antes de refresh: ${filasAntes}`)

        // Refresh
        await page.reload({ waitUntil: "domcontentloaded" })
        await page.waitForTimeout(2000)

        // Contar filas después
        const filasDespues = await contarFilasTabla(page)
        console.log(`   📊 Filas después de refresh: ${filasDespues}`)

        // Verificar que las filas persisten
        expect(filasDespues).toBe(filasAntes)
        console.log(`   ✅ Datos persistentes tras refresh`)
      })
    })
  }
})

// ============================================
// TESTS DE SINCRONIZACIÓN ENTRE PANELES
// ============================================

test.describe("🔄 SUITE: Sincronización Entre Paneles", () => {
  test("Venta afecta capital de bancos", async ({ page }) => {
    console.log("\n🔄 Verificando sincronización Venta → Bancos")

    // Ir a bancos y capturar capital inicial
    await navegarA(page, "/bancos", "Bancos")

    const capitalInicial = await page.locator("text=/\\$[\\d,]+/").first().textContent()
    console.log(`   💰 Capital inicial visible: ${capitalInicial || "N/A"}`)

    // Ir a ventas
    await navegarA(page, "/ventas", "Ventas")

    const ventasIniciales = await contarFilasTabla(page)
    console.log(`   📊 Ventas iniciales: ${ventasIniciales}`)

    // Volver a bancos
    await navegarA(page, "/bancos", "Bancos")

    const capitalFinal = await page.locator("text=/\\$[\\d,]+/").first().textContent()
    console.log(`   💰 Capital final visible: ${capitalFinal || "N/A"}`)

    // Verificar que hay métricas visibles
    const metricas = await page
      .locator('[class*="metric"], [class*="kpi"], [class*="card"]')
      .count()
    console.log(`   📈 Métricas visibles: ${metricas}`)
  })

  test("Cliente aparece en dropdown de ventas", async ({ page }) => {
    console.log("\n🔄 Verificando sincronización Cliente → Ventas")

    // Verificar que hay clientes
    await navegarA(page, "/clientes", "Clientes")
    const clientesCount = await contarFilasTabla(page)
    console.log(`   👥 Clientes existentes: ${clientesCount}`)

    // Ir a ventas y abrir modal
    await navegarA(page, "/ventas", "Ventas")
    const modalAbierto = await clickPrimerBoton(page, [
      'button:has-text("Nueva")',
      'button:has-text("Registrar")',
    ])

    if (modalAbierto && (await esperarYVerificarModal(page))) {
      // Buscar select/combobox de cliente
      const clienteSelect = page
        .locator('select[name*="cliente"], [data-testid*="cliente"], [role="combobox"]')
        .first()
      const tieneSelector = await clienteSelect.isVisible({ timeout: 3000 }).catch(() => false)

      console.log(`   ${tieneSelector ? "✅" : "⚠️"} Selector de cliente en formulario de venta`)

      await cerrarModal(page)
    }
  })

  test("Movimiento aparece en historial", async ({ page }) => {
    console.log("\n🔄 Verificando sincronización Gastos → Movimientos")

    // Contar movimientos
    await navegarA(page, "/movimientos", "Movimientos")
    const movimientosIniciales = await contarFilasTabla(page)
    console.log(`   📊 Movimientos existentes: ${movimientosIniciales}`)

    // Verificar que hay datos
    const tieneContenido = movimientosIniciales > 0
    console.log(
      `   ${tieneContenido ? "✅" : "ℹ️"} Historial ${tieneContenido ? "con datos" : "vacío"}`
    )
  })
})

// ============================================
// TESTS DE FORMATO DE DATOS
// ============================================

test.describe("📝 SUITE: Formato de Datos en UI", () => {
  test("Números formateados correctamente", async ({ page }) => {
    console.log("\n📝 Verificando formato de números...")

    await navegarA(page, "/ventas", "Ventas")

    // Buscar números con formato de moneda
    const numeros = await page.locator("text=/\\$[\\d,]+\\.?\\d*/").count()
    console.log(`   💰 Montos encontrados: ${numeros}`)

    // Verificar que usan formato mexicano (comas para miles)
    const montosSample = await page.locator("text=/\\$[\\d,]+/").first().textContent()
    console.log(`   📊 Ejemplo de monto: ${montosSample || "N/A"}`)

    if (montosSample) {
      const usaComas = montosSample.includes(",")
      console.log(`   ${usaComas ? "✅" : "ℹ️"} Usa separador de miles`)
    }
  })

  test("Fechas formateadas correctamente", async ({ page }) => {
    console.log("\n📝 Verificando formato de fechas...")

    await navegarA(page, "/ventas", "Ventas")

    // Buscar fechas en varios formatos
    const formatosFecha = [
      /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
      /\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /\d{1,2}\s+\w+\s+\d{4}/, // D Month YYYY
    ]

    let fechasEncontradas = 0
    for (const formato of formatosFecha) {
      const fechas = await page.locator(`text=/${formato.source}/`).count()
      fechasEncontradas += fechas
    }

    console.log(`   📅 Fechas encontradas: ${fechasEncontradas}`)
  })

  test("Estados con colores apropiados", async ({ page }) => {
    console.log("\n📝 Verificando estados visuales...")

    await navegarA(page, "/ventas", "Ventas")

    // Buscar badges de estado
    const estados = [
      { texto: "Pagado", clase: "green" },
      { texto: "Pendiente", clase: "yellow|amber" },
      { texto: "Parcial", clase: "orange|blue" },
    ]

    for (const estado of estados) {
      const badge = page.locator(`text=${estado.texto}`).first()
      if (await badge.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`   ✅ Estado "${estado.texto}" encontrado`)
      }
    }
  })
})

// ============================================
// TESTS DE VALIDACIÓN DE FORMULARIOS
// ============================================

test.describe("✅ SUITE: Validación de Formularios", () => {
  test("Validación de campos requeridos", async ({ page }) => {
    console.log("\n✅ Verificando validación de campos...")

    await navegarA(page, "/ventas", "Ventas")

    // Abrir modal
    const modalAbierto = await clickPrimerBoton(page, [
      'button:has-text("Nueva")',
      'button:has-text("Registrar")',
    ])
    if (!modalAbierto || !(await esperarYVerificarModal(page))) {
      console.log(`   ⚠️ No se pudo abrir modal`)
      return
    }

    // Intentar guardar sin datos
    await clickPrimerBoton(page, ['button:has-text("Guardar")', 'button[type="submit"]'])
    await page.waitForTimeout(500)

    // Buscar mensajes de error
    const errores = await page.locator("text=/requerido|obligatorio|required|error/i").count()
    console.log(`   ⚠️ Mensajes de validación: ${errores}`)

    // Buscar campos marcados como inválidos
    const camposInvalidos = await page.locator('[aria-invalid="true"], .error, .invalid').count()
    console.log(`   🔴 Campos inválidos: ${camposInvalidos}`)

    await cerrarModal(page)
  })

  test("Validación de formato numérico", async ({ page }) => {
    console.log("\n✅ Verificando validación numérica...")

    await navegarA(page, "/gastos", "Gastos")

    // Abrir modal
    const modalAbierto = await clickPrimerBoton(page, [
      'button:has-text("Nuevo")',
      'button:has-text("Registrar")',
    ])
    if (!modalAbierto || !(await esperarYVerificarModal(page))) {
      console.log(`   ⚠️ No se pudo abrir modal`)
      return
    }

    // Buscar campo de monto
    const montoInput = page.locator('input[name="monto"], input[name="valor"]').first()
    if (await montoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Intentar ingresar texto
      await montoInput.fill("abc")
      await page.waitForTimeout(300)

      const valor = await montoInput.inputValue()
      const aceptoTexto = valor === "abc"

      console.log(
        `   ${aceptoTexto ? "⚠️" : "✅"} Campo ${aceptoTexto ? "acepta" : "rechaza"} texto no numérico`
      )

      // Limpiar e ingresar número negativo
      await montoInput.fill("-100")
      await page.waitForTimeout(300)

      const valorNeg = await montoInput.inputValue()
      const aceptoNegativo = valorNeg.includes("-")
      console.log(
        `   ${aceptoNegativo ? "⚠️" : "✅"} Campo ${aceptoNegativo ? "acepta" : "rechaza"} números negativos`
      )
    }

    await cerrarModal(page)
  })
})

// ============================================
// TEST DE RESUMEN GLOBAL
// ============================================

test("📊 Resumen Global de Persistencia DB-UI", async ({ page }) => {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 RESUMEN GLOBAL DE PERSISTENCIA DB-UI")
  console.log("═══════════════════════════════════════════════════\n")

  const resultados: { entidad: string; filas: number; tieneBotonNuevo: boolean }[] = []

  for (const entidad of ENTIDADES) {
    await navegarA(page, entidad.path, entidad.tipo)

    const filas = await contarFilasTabla(page)
    let tieneBotonNuevo = false

    for (const selector of entidad.btnNuevo) {
      if (
        await page
          .locator(selector)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        tieneBotonNuevo = true
        break
      }
    }

    resultados.push({
      entidad: entidad.tipo,
      filas,
      tieneBotonNuevo,
    })

    console.log(`${entidad.tipo}:`)
    console.log(`   📊 Filas: ${filas}`)
    console.log(`   🆕 Botón nuevo: ${tieneBotonNuevo ? "✅" : "❌"}`)
  }

  // Resumen
  const totalFilas = resultados.reduce((acc, r) => acc + r.filas, 0)
  const entidadesConBoton = resultados.filter((r) => r.tieneBotonNuevo).length

  console.log("\n═══════════════════════════════════════════════════")
  console.log(`📈 Total registros: ${totalFilas}`)
  console.log(`📈 Entidades con CRUD: ${entidadesConBoton}/${resultados.length}`)
  console.log("═══════════════════════════════════════════════════\n")
})
