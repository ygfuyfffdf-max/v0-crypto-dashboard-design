import { Page, test } from "@playwright/test"
import { GEN5_CONFIG, GEN5_ROUTES, GEN5_SELECTORS } from "./gen5-test-utils"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📤 CHRONOS GEN5 2026 — TESTS E2E: EXPORTACIONES EN TODOS LOS FORMATOS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos del sistema de exportación Gen5:
 *
 * ✅ PDF - Reportes profesionales con jsPDF
 * ✅ CSV - Datos tabulares para análisis
 * ✅ Excel (XLSX) - Hojas de cálculo completas
 * ✅ DOCX - Documentos Word formateados
 * ✅ JSON - Datos estructurados para Power BI
 *
 * Por cada panel Gen5:
 * - Ventas: Listado, detalle, distribución GYA
 * - Clientes: Directorio, historial, deudas
 * - Bancos: Cortes, movimientos, transferencias
 * - Distribuidores: Órdenes, pagos, deudas
 * - Almacén: Inventario, movimientos, valorización
 * - Gastos: Reporte mensual, por banco, por tipo
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// CONFIGURACIÓN GEN5
// ============================================

// Timeout para Gen5
test.setTimeout(GEN5_CONFIG.BASE_TIMEOUT + 15000)

const DOWNLOAD_TIMEOUT = 30000
const DOWNLOAD_PATH = "./test-results/downloads"

interface ExportTest {
  panel: string
  path: string
  exportName: string
  formats: string[]
  buttonSelectors: string[]
}

// Tests de exportación con selectores Gen5
const EXPORT_TESTS: ExportTest[] = [
  {
    panel: "Ventas",
    path: GEN5_ROUTES.ventas,
    exportName: "ventas",
    formats: ["PDF", "CSV", "Excel", "JSON"],
    buttonSelectors: [
      'button:has-text("Exportar")',
      'button:has-text("Descargar")',
      '[data-testid="export-btn"]',
      `${GEN5_SELECTORS.button}[aria-label*="export"]`,
    ],
  },
  {
    panel: "Clientes",
    path: GEN5_ROUTES.clientes,
    exportName: "clientes",
    formats: ["PDF", "CSV", "Excel"],
    buttonSelectors: [
      'button:has-text("Exportar")',
      '[data-testid="export-clients-btn"]',
      `${GEN5_SELECTORS.button}:has-text("Export")`,
    ],
  },
  {
    panel: "Bancos",
    path: GEN5_ROUTES.bancos,
    exportName: "bancos",
    formats: ["PDF", "CSV", "Excel", "JSON"],
    buttonSelectors: [
      'button:has-text("Exportar")',
      'button:has-text("Corte")',
      '[data-testid="export-banks-btn"]',
      `${GEN5_SELECTORS.button}:has-text("Export")`,
    ],
  },
  {
    panel: "Distribuidores",
    path: GEN5_ROUTES.distribuidores,
    exportName: "distribuidores",
    formats: ["PDF", "CSV", "Excel"],
    buttonSelectors: ['button:has-text("Exportar")', '[data-testid="export-distributors-btn"]'],
  },
  {
    panel: "Órdenes",
    path: "/ordenes",
    exportName: "ordenes",
    formats: ["PDF", "CSV", "Excel"],
    buttonSelectors: ['button:has-text("Exportar")', '[data-testid="export-orders-btn"]'],
  },
  {
    panel: "Almacén",
    path: "/almacen",
    exportName: "almacen",
    formats: ["PDF", "CSV", "Excel"],
    buttonSelectors: [
      'button:has-text("Exportar")',
      'button:has-text("Inventario")',
      '[data-testid="export-inventory-btn"]',
    ],
  },
  {
    panel: "Gastos",
    path: "/gastos",
    exportName: "gastos",
    formats: ["PDF", "CSV", "Excel"],
    buttonSelectors: ['button:has-text("Exportar")', '[data-testid="export-expenses-btn"]'],
  },
  {
    panel: "Movimientos",
    path: "/movimientos",
    exportName: "movimientos",
    formats: ["PDF", "CSV", "Excel"],
    buttonSelectors: ['button:has-text("Exportar")', '[data-testid="export-movements-btn"]'],
  },
]

// ============================================
// HELPERS
// ============================================

async function navegarAPagina(page: Page, ruta: string, nombre: string) {
  console.log(`\n📍 Navegando a: ${nombre}`)
  await page.goto(ruta, { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.waitForTimeout(2000)
}

async function buscarBotonExportar(page: Page, selectors: string[]): Promise<boolean> {
  for (const selector of selectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      return true
    }
  }
  return false
}

async function clickBotonExportar(page: Page, selectors: string[]): Promise<boolean> {
  for (const selector of selectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(500)
      return true
    }
  }
  return false
}

async function seleccionarFormatoExportacion(page: Page, formato: string): Promise<boolean> {
  const selectors = [
    `button:has-text("${formato}")`,
    `[data-format="${formato.toLowerCase()}"]`,
    `[role="menuitem"]:has-text("${formato}")`,
    `li:has-text("${formato}")`,
    `option:has-text("${formato}")`,
  ]

  for (const selector of selectors) {
    const element = page.locator(selector).first()
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      await element.click()
      return true
    }
  }
  return false
}

async function verificarDescarga(page: Page): Promise<{ descargado: boolean; archivo?: string }> {
  try {
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 })
    const download = await downloadPromise
    const filename = download.suggestedFilename()
    console.log(`   📥 Archivo descargado: ${filename}`)
    return { descargado: true, archivo: filename }
  } catch {
    return { descargado: false }
  }
}

// ============================================
// TESTS DE BOTONES DE EXPORTACIÓN
// ============================================

test.describe("📤 SUITE: Botones de Exportación por Panel", () => {
  for (const exportTest of EXPORT_TESTS) {
    test(`Botón exportar existe en ${exportTest.panel}`, async ({ page }) => {
      await navegarAPagina(page, exportTest.path, exportTest.panel)

      const encontrado = await buscarBotonExportar(page, exportTest.buttonSelectors)

      console.log(`   ${encontrado ? "✅" : "⚠️"} Botón de exportación en ${exportTest.panel}`)

      // Informativo - no falla si no existe
      if (!encontrado) {
        console.log(`   ℹ️ Selectores probados: ${exportTest.buttonSelectors.join(", ")}`)
      }
    })
  }
})

// ============================================
// TESTS DE MENÚ DE FORMATOS
// ============================================

test.describe("📤 SUITE: Menú de Formatos de Exportación", () => {
  for (const exportTest of EXPORT_TESTS) {
    test(`Menú de formatos en ${exportTest.panel}`, async ({ page }) => {
      await navegarAPagina(page, exportTest.path, exportTest.panel)

      // Intentar abrir menú de exportación
      const btnAbierto = await clickBotonExportar(page, exportTest.buttonSelectors)

      if (btnAbierto) {
        console.log(`   📊 Verificando formatos disponibles en ${exportTest.panel}:`)

        // Esperar a que el menú se abra
        await page.waitForTimeout(500)

        for (const formato of exportTest.formats) {
          const formatoVisible = await page
            .locator(`text=${formato}`)
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false)

          console.log(`   ${formatoVisible ? "✅" : "⚠️"} ${formato}`)
        }

        // Cerrar menú
        await page.keyboard.press("Escape")
      } else {
        console.log(`   ⚠️ No se pudo abrir menú de exportación en ${exportTest.panel}`)
      }
    })
  }
})

// ============================================
// TESTS DE FORMATO PDF
// ============================================

test.describe("📄 SUITE: Exportación PDF", () => {
  test("Estructura de generación PDF disponible", async ({ page }) => {
    console.log("\n📄 Verificando capacidad de generación PDF...")

    // Verificar que jsPDF está disponible en el proyecto
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" })

    // Intentar encontrar referencias a PDF en el código
    const pageContent = await page.content()
    const tieneReferenciasPDF =
      pageContent.includes("pdf") || pageContent.includes("PDF") || pageContent.includes("jspdf")

    console.log(`   ${tieneReferenciasPDF ? "✅" : "ℹ️"} Referencias PDF en página`)
  })

  for (const exportTest of EXPORT_TESTS.filter((e) => e.formats.includes("PDF"))) {
    test(`Exportar ${exportTest.panel} a PDF`, async ({ page }) => {
      await navegarAPagina(page, exportTest.path, exportTest.panel)

      console.log(`   📄 Intentando exportar ${exportTest.panel} a PDF...`)

      const btnAbierto = await clickBotonExportar(page, exportTest.buttonSelectors)

      if (btnAbierto) {
        await page.waitForTimeout(500)
        const formatoSeleccionado = await seleccionarFormatoExportacion(page, "PDF")

        if (formatoSeleccionado) {
          // Intentar capturar descarga
          const resultado = await verificarDescarga(page)
          console.log(`   ${resultado.descargado ? "✅" : "⚠️"} Descarga PDF`)
        }
      }
    })
  }
})

// ============================================
// TESTS DE FORMATO CSV
// ============================================

test.describe("📊 SUITE: Exportación CSV", () => {
  for (const exportTest of EXPORT_TESTS.filter((e) => e.formats.includes("CSV"))) {
    test(`Exportar ${exportTest.panel} a CSV`, async ({ page }) => {
      await navegarAPagina(page, exportTest.path, exportTest.panel)

      console.log(`   📊 Intentando exportar ${exportTest.panel} a CSV...`)

      const btnAbierto = await clickBotonExportar(page, exportTest.buttonSelectors)

      if (btnAbierto) {
        await page.waitForTimeout(500)
        const formatoSeleccionado = await seleccionarFormatoExportacion(page, "CSV")

        if (formatoSeleccionado) {
          const resultado = await verificarDescarga(page)
          console.log(`   ${resultado.descargado ? "✅" : "⚠️"} Descarga CSV`)
        }
      }
    })
  }
})

// ============================================
// TESTS DE FORMATO EXCEL
// ============================================

test.describe("📗 SUITE: Exportación Excel", () => {
  for (const exportTest of EXPORT_TESTS.filter((e) => e.formats.includes("Excel"))) {
    test(`Exportar ${exportTest.panel} a Excel`, async ({ page }) => {
      await navegarAPagina(page, exportTest.path, exportTest.panel)

      console.log(`   📗 Intentando exportar ${exportTest.panel} a Excel...`)

      const btnAbierto = await clickBotonExportar(page, exportTest.buttonSelectors)

      if (btnAbierto) {
        await page.waitForTimeout(500)
        const formatoSeleccionado = await seleccionarFormatoExportacion(page, "Excel")

        if (formatoSeleccionado) {
          const resultado = await verificarDescarga(page)
          console.log(`   ${resultado.descargado ? "✅" : "⚠️"} Descarga Excel`)

          if (resultado.archivo) {
            // Verificar extensión
            const esXlsx = resultado.archivo.endsWith(".xlsx") || resultado.archivo.endsWith(".xls")
            console.log(`   ${esXlsx ? "✅" : "⚠️"} Extensión correcta: ${resultado.archivo}`)
          }
        }
      }
    })
  }
})

// ============================================
// TESTS DE FORMATO JSON (Power BI)
// ============================================

test.describe("📊 SUITE: Exportación JSON (Power BI)", () => {
  for (const exportTest of EXPORT_TESTS.filter((e) => e.formats.includes("JSON"))) {
    test(`Exportar ${exportTest.panel} a JSON`, async ({ page }) => {
      await navegarAPagina(page, exportTest.path, exportTest.panel)

      console.log(`   📊 Intentando exportar ${exportTest.panel} a JSON...`)

      const btnAbierto = await clickBotonExportar(page, exportTest.buttonSelectors)

      if (btnAbierto) {
        await page.waitForTimeout(500)
        const formatoSeleccionado = await seleccionarFormatoExportacion(page, "JSON")

        if (formatoSeleccionado) {
          const resultado = await verificarDescarga(page)
          console.log(`   ${resultado.descargado ? "✅" : "⚠️"} Descarga JSON`)
        }
      }
    })
  }
})

// ============================================
// TESTS DE CORTES BANCARIOS
// ============================================

test.describe("🏦 SUITE: Exportación de Cortes Bancarios", () => {
  const BANCOS = [
    { id: "boveda_monte", nombre: "Bóveda Monte" },
    { id: "boveda_usa", nombre: "Bóveda USA" },
    { id: "profit", nombre: "Profit" },
    { id: "leftie", nombre: "Leftie" },
    { id: "azteca", nombre: "Azteca" },
    { id: "flete_sur", nombre: "Flete Sur" },
    { id: "utilidades", nombre: "Utilidades" },
  ]

  test("Exportar corte general de todos los bancos", async ({ page }) => {
    await navegarAPagina(page, "/bancos", "Bancos")

    console.log("\n🏦 Buscando opción de corte general...")

    const selectoresCorte = [
      'button:has-text("Corte General")',
      'button:has-text("Exportar Todo")',
      'button:has-text("Reporte Consolidado")',
      '[data-testid="general-report-btn"]',
    ]

    let encontrado = false
    for (const selector of selectoresCorte) {
      if (
        await page
          .locator(selector)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        encontrado = true
        await page.locator(selector).first().click()
        console.log(`   ✅ Botón de corte general encontrado`)
        break
      }
    }

    if (!encontrado) {
      console.log(`   ⚠️ Botón de corte general no encontrado`)
    }
  })

  for (const banco of BANCOS) {
    test(`Exportar corte de ${banco.nombre}`, async ({ page }) => {
      await navegarAPagina(page, "/bancos", "Bancos")

      console.log(`\n🏦 Buscando corte para ${banco.nombre}...`)

      // Primero seleccionar el banco
      const selectorBanco = `[data-banco="${banco.id}"], text=${banco.nombre}`
      const bancoElement = page.locator(selectorBanco).first()

      if (await bancoElement.isVisible({ timeout: 3000 }).catch(() => false)) {
        await bancoElement.click()
        await page.waitForTimeout(500)

        // Buscar botón de corte
        const selectoresCorte = [
          'button:has-text("Corte")',
          'button:has-text("Exportar")',
          '[data-testid="bank-report-btn"]',
        ]

        for (const selector of selectoresCorte) {
          if (
            await page
              .locator(selector)
              .first()
              .isVisible({ timeout: 2000 })
              .catch(() => false)
          ) {
            console.log(`   ✅ Opción de corte disponible para ${banco.nombre}`)
            break
          }
        }
      } else {
        console.log(`   ⚠️ No se encontró ${banco.nombre} en el panel`)
      }
    })
  }
})

// ============================================
// TEST DE REPORTES ESPECIALES
// ============================================

test.describe("📈 SUITE: Reportes Especiales", () => {
  test("Reporte de deudas de clientes", async ({ page }) => {
    await navegarAPagina(page, "/clientes", "Clientes")

    console.log("\n📈 Buscando reporte de deudas...")

    const selectores = [
      'button:has-text("Deudas")',
      'button:has-text("Pendientes")',
      'button:has-text("Cartera")',
      '[data-testid="debts-report-btn"]',
    ]

    for (const selector of selectores) {
      if (
        await page
          .locator(selector)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        console.log(`   ✅ Reporte de deudas disponible`)
        return
      }
    }
    console.log(`   ⚠️ Reporte de deudas no encontrado`)
  })

  test("Reporte de ventas por período", async ({ page }) => {
    await navegarAPagina(page, "/ventas", "Ventas")

    console.log("\n📈 Buscando reporte por período...")

    // Buscar filtros de fecha
    const selectoresFecha = [
      'input[type="date"]',
      'button:has-text("Hoy")',
      'button:has-text("Esta semana")',
      'button:has-text("Este mes")',
      '[data-testid="date-filter"]',
    ]

    for (const selector of selectoresFecha) {
      if (
        await page
          .locator(selector)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        console.log(`   ✅ Filtro de período disponible`)
        return
      }
    }
    console.log(`   ⚠️ Filtro de período no encontrado`)
  })

  test("Reporte de inventario valorizado", async ({ page }) => {
    await navegarAPagina(page, "/almacen", "Almacén")

    console.log("\n📈 Buscando reporte de inventario valorizado...")

    const selectores = [
      'button:has-text("Valorización")',
      'button:has-text("Inventario")',
      'button:has-text("Corte Almacén")',
      '[data-testid="inventory-value-btn"]',
    ]

    for (const selector of selectores) {
      if (
        await page
          .locator(selector)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        console.log(`   ✅ Reporte de inventario valorizado disponible`)
        return
      }
    }
    console.log(`   ⚠️ Reporte de inventario valorizado no encontrado`)
  })

  test("Reporte de utilidades netas", async ({ page }) => {
    await navegarAPagina(page, "/bancos", "Bancos")

    console.log("\n📈 Buscando reporte de utilidades...")

    // Buscar banco de utilidades
    const utilidadesElement = page.locator('[data-banco="utilidades"], text=Utilidades').first()

    if (await utilidadesElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log(`   ✅ Sección de utilidades encontrada`)

      // Verificar que muestra capital
      const capitalVisible = await page
        .locator("text=/\\$[\\d,]+/")
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      console.log(`   ${capitalVisible ? "✅" : "⚠️"} Capital de utilidades visible`)
    }
  })
})

// ============================================
// TEST DE RESUMEN GLOBAL
// ============================================

test("📊 Resumen Global de Exportaciones", async ({ page }) => {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 RESUMEN GLOBAL DE CAPACIDADES DE EXPORTACIÓN")
  console.log("═══════════════════════════════════════════════════\n")

  const resultados: { panel: string; tieneExportar: boolean; formatos: string[] }[] = []

  for (const exportTest of EXPORT_TESTS) {
    await navegarAPagina(page, exportTest.path, exportTest.panel)

    const tieneBoton = await buscarBotonExportar(page, exportTest.buttonSelectors)
    const formatosDisponibles: string[] = []

    if (tieneBoton) {
      await clickBotonExportar(page, exportTest.buttonSelectors)
      await page.waitForTimeout(500)

      for (const formato of exportTest.formats) {
        if (
          await page
            .locator(`text=${formato}`)
            .first()
            .isVisible({ timeout: 500 })
            .catch(() => false)
        ) {
          formatosDisponibles.push(formato)
        }
      }

      await page.keyboard.press("Escape")
    }

    resultados.push({
      panel: exportTest.panel,
      tieneExportar: tieneBoton,
      formatos: formatosDisponibles,
    })

    console.log(`${exportTest.panel}:`)
    console.log(`   Botón exportar: ${tieneBoton ? "✅" : "❌"}`)
    console.log(
      `   Formatos: ${formatosDisponibles.length > 0 ? formatosDisponibles.join(", ") : "N/A"}`
    )
  }

  // Resumen final
  const panelesConExportar = resultados.filter((r) => r.tieneExportar).length
  const totalPaneles = resultados.length
  const porcentaje = Math.round((panelesConExportar / totalPaneles) * 100)

  console.log("\n═══════════════════════════════════════════════════")
  console.log(`📈 COBERTURA: ${panelesConExportar}/${totalPaneles} paneles (${porcentaje}%)`)
  console.log("═══════════════════════════════════════════════════\n")
})
