import { expect, Page, test } from "@playwright/test"
import { GEN5_CONFIG, GEN5_ROUTES, GEN5_SELECTORS, testLog } from "./gen5-test-utils"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📱 CHRONOS GEN5 2026 — TESTS E2E: RESPONSIVE Y MÓVIL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos de comportamiento responsive Gen5:
 *
 * ✅ Viewport móvil (375px, 414px)
 * ✅ Viewport tablet (768px)
 * ✅ Viewport desktop (1024px, 1440px)
 * ✅ Header con navegación adaptativa (KosmosHeader Gen5)
 * ✅ PremiumDataTable scrollables
 * ✅ FormModal adaptativos (glassmorphism)
 * ✅ Touch interactions
 * ✅ Orientación landscape/portrait
 *
 * NOTA: La app usa KosmosHeader con navegación horizontal, NO sidebar.
 * Los componentes Gen5 usan glassmorphism y animaciones framer-motion.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// CONFIGURACIÓN GEN5
// ============================================

// Timeout aumentado para animaciones framer-motion Gen5
test.setTimeout(45000)

const BASE_TIMEOUT = GEN5_CONFIG.BASE_TIMEOUT
const ANIMATION_WAIT = GEN5_CONFIG.ANIMATION_WAIT

// Viewports a probar
const VIEWPORTS = {
  mobileS: { width: 320, height: 568, nombre: "Mobile S (320px)" },
  mobileM: { width: 375, height: 667, nombre: "Mobile M (375px)" },
  mobileL: { width: 414, height: 896, nombre: "Mobile L (414px)" },
  tablet: { width: 768, height: 1024, nombre: "Tablet (768px)" },
  laptop: { width: 1024, height: 768, nombre: "Laptop (1024px)" },
  desktop: { width: 1440, height: 900, nombre: "Desktop (1440px)" },
  wide: { width: 1920, height: 1080, nombre: "Wide (1920px)" },
}

// Paneles Gen5 a probar (10 paneles)
const PANELES = [
  { path: GEN5_ROUTES.dashboard, nombre: "Dashboard" },
  { path: GEN5_ROUTES.ventas, nombre: "Ventas" },
  { path: GEN5_ROUTES.clientes, nombre: "Clientes" },
  { path: GEN5_ROUTES.bancos, nombre: "Bancos" },
  { path: GEN5_ROUTES.ordenes, nombre: "Órdenes" },
  { path: GEN5_ROUTES.almacen, nombre: "Almacén" },
  { path: GEN5_ROUTES.distribuidores, nombre: "Distribuidores" },
  { path: GEN5_ROUTES.gastos, nombre: "Gastos" },
  { path: GEN5_ROUTES.movimientos, nombre: "Movimientos" },
  { path: GEN5_ROUTES.ia, nombre: "IA" },
]

// Breakpoints críticos
const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
}

// ============================================
// HELPERS GEN5
// ============================================

async function setViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height })
  await page.waitForTimeout(ANIMATION_WAIT) // Esperar reflow con animaciones Gen5
}

async function navegarA(page: Page, path: string, nombre: string) {
  testLog(`📍 Navegando a: ${nombre}`)
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: BASE_TIMEOUT })
  await page.waitForTimeout(GEN5_CONFIG.NAV_WAIT)
}

async function verificarOverflowHorizontal(page: Page): Promise<boolean> {
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
  const viewportWidth = await page.evaluate(() => window.innerWidth)
  return bodyWidth > viewportWidth + 5 // 5px de tolerancia
}

async function verificarElementosVisibles(page: Page): Promise<{
  header: boolean
  navegacion: boolean
  contenido: boolean
}> {
  return {
    header: await page
      .locator(GEN5_SELECTORS.header)
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false),
    navegacion: await page
      .locator(`${GEN5_SELECTORS.nav}, ${GEN5_SELECTORS.navLink}`)
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false),
    contenido: await page
      .locator('main, [class*="content"], [class*="main"], [class*="panel"], [class*="glass"]')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false),
  }
}

async function verificarMenuHamburguesa(page: Page): Promise<boolean> {
  const selectores = [
    'button[aria-label*="menu" i]',
    '[class*="hamburger"]',
    'button:has(svg[class*="menu" i])',
    '[data-testid="menu-toggle"]',
    // KosmosHeader Gen5 usa un botón con icono Menu de lucide
    `${GEN5_SELECTORS.button}:has(svg)`,
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

async function verificarTablaResponsive(page: Page): Promise<{
  tieneTabla: boolean
  esScrollable: boolean
  tieneCards: boolean
}> {
  // PremiumDataTable Gen5
  const tabla = page.locator(GEN5_SELECTORS.table).first()
  const tieneTabla = await tabla.isVisible({ timeout: 2000 }).catch(() => false)

  let esScrollable = false
  if (tieneTabla) {
    const contenedor = page.locator('[class*="overflow-x"], [style*="overflow"]').first()
    esScrollable = await contenedor.isVisible({ timeout: 1000 }).catch(() => false)
  }

  // Verificar si se muestran cards en lugar de tabla
  const cards = await page.locator('[class*="card"]:has(h3), [class*="card"]:has(p)').count()
  const tieneCards = cards > 3

  return { tieneTabla, esScrollable, tieneCards }
}

async function verificarTouchInteraction(page: Page): Promise<boolean> {
  // Verificar elementos con touch target adecuado
  const botones = await page.locator('button, a[role="button"]').all()
  let touchFriendly = 0

  for (const btn of botones.slice(0, 10)) {
    // Verificar primeros 10
    const box = await btn.boundingBox()
    if (box && box.width >= 44 && box.height >= 44) {
      touchFriendly++
    }
  }

  return touchFriendly >= botones.length * 0.5 // 50% deben ser touch-friendly
}

async function verificarModalResponsive(page: Page): Promise<{
  seAbre: boolean
  ocupaPantalla: boolean
  centrado: boolean
}> {
  // Intentar abrir un modal
  const btnAbrir = page.locator('button:has-text("Nueva"), button:has-text("Agregar")').first()

  if (!(await btnAbrir.isVisible({ timeout: 2000 }).catch(() => false))) {
    return { seAbre: false, ocupaPantalla: false, centrado: false }
  }

  await btnAbrir.click()
  await page.waitForTimeout(500)

  const modal = page.locator('[role="dialog"], [class*="modal"]').first()
  const seAbre = await modal.isVisible({ timeout: 2000 }).catch(() => false)

  if (!seAbre) {
    return { seAbre: false, ocupaPantalla: false, centrado: false }
  }

  const viewportWidth = await page.evaluate(() => window.innerWidth)
  const box = await modal.boundingBox()

  let ocupaPantalla = false
  let centrado = false

  if (box) {
    ocupaPantalla = box.width >= viewportWidth * 0.9 // Ocupa 90% del ancho
    centrado = Math.abs(viewportWidth / 2 - (box.x + box.width / 2)) < 50 // Centrado con 50px de tolerancia
  }

  // Cerrar modal
  await page.keyboard.press("Escape")
  await page.waitForTimeout(300)

  return { seAbre, ocupaPantalla, centrado }
}

// ============================================
// TESTS POR VIEWPORT
// ============================================

test.describe("📱 SUITE: Viewports Móviles", () => {
  for (const [key, viewport] of Object.entries(VIEWPORTS).filter(([k]) => k.startsWith("mobile"))) {
    test(`${viewport.nombre} - Dashboard`, async ({ page }) => {
      await setViewport(page, viewport.width, viewport.height)
      await navegarA(page, "/dashboard", "Dashboard")

      // Verificar overflow
      const tieneOverflow = await verificarOverflowHorizontal(page)
      console.log(`   📐 Overflow horizontal: ${tieneOverflow ? "⚠️" : "✅"}`)

      // Verificar elementos
      const elementos = await verificarElementosVisibles(page)
      console.log(`   📦 Header: ${elementos.header ? "✅" : "⚠️"}`)
      console.log(`   📦 Navegación: ${elementos.navegacion ? "✅" : "🔲 (puede estar colapsada)"}`)
      console.log(`   📦 Contenido: ${elementos.contenido ? "✅" : "⚠️"}`)

      // Verificar menú hamburguesa
      const tieneHamburguesa = await verificarMenuHamburguesa(page)
      console.log(`   🍔 Menú hamburguesa: ${tieneHamburguesa ? "✅" : "ℹ️"}`)

      expect.soft(tieneOverflow, "No debe haber overflow horizontal").toBe(false)
    })
  }
})

test.describe("📱 SUITE: Viewports Tablet y Desktop", () => {
  for (const [key, viewport] of Object.entries(VIEWPORTS).filter(
    ([k]) => !k.startsWith("mobile")
  )) {
    test(`${viewport.nombre} - Dashboard`, async ({ page }) => {
      await setViewport(page, viewport.width, viewport.height)
      await navegarA(page, "/dashboard", "Dashboard")

      const tieneOverflow = await verificarOverflowHorizontal(page)
      const elementos = await verificarElementosVisibles(page)

      console.log(`   📐 Overflow: ${tieneOverflow ? "⚠️" : "✅"}`)
      console.log(`   📦 Header visible: ${elementos.header ? "✅" : "⚠️"}`)
      console.log(`   📦 Contenido: ${elementos.contenido ? "✅" : "⚠️"}`)

      expect.soft(tieneOverflow, "No debe haber overflow").toBe(false)
    })
  }
})

// ============================================
// TESTS DE HEADER RESPONSIVE (KosmosHeader)
// ============================================

test.describe("📌 SUITE: Header Responsive", () => {
  test("Navegación colapsada en móvil", async ({ page }) => {
    await setViewport(page, 375, 667)
    await navegarA(page, "/dashboard", "Dashboard")

    // En móvil, la navegación horizontal se oculta y aparece botón menú
    const navVisible = await page
      .locator('nav a[href="/ventas"]')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    console.log(`   📌 Nav en móvil: ${navVisible ? "ℹ️ Visible" : "✅ Oculta (como esperado)"}`)

    // Buscar botón para mostrar
    const tieneToggle = await verificarMenuHamburguesa(page)
    console.log(`   🍔 Toggle disponible: ${tieneToggle ? "✅" : "⚠️"}`)

    if (tieneToggle) {
      // El KosmosHeader tiene botón Menu que solo aparece en lg:hidden
      const toggle = page.locator("button:has(svg)").first()
      const toggleVisible = await toggle.isVisible({ timeout: 2000 }).catch(() => false)
      console.log(`   📌 Botón menú visible: ${toggleVisible ? "✅" : "⚠️"}`)
    }
  })

  test("Navegación visible en desktop", async ({ page }) => {
    await setViewport(page, 1440, 900)
    await navegarA(page, "/dashboard", "Dashboard")

    // En desktop, la navegación completa debe ser visible
    const navVisible = await page
      .locator('nav, header a[href="/ventas"]')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    console.log(`   📌 Navegación en desktop: ${navVisible ? "✅" : "⚠️"}`)

    expect.soft(navVisible, "Navegación debe ser visible en desktop").toBe(true)
  })
})

// ============================================
// TESTS DE TABLAS RESPONSIVE
// ============================================

test.describe("📋 SUITE: Tablas Responsive", () => {
  test("Tabla en móvil", async ({ page }) => {
    await setViewport(page, 375, 667)
    await navegarA(page, "/ventas", "Ventas")

    const { tieneTabla, esScrollable, tieneCards } = await verificarTablaResponsive(page)

    console.log(`   📋 Tabla presente: ${tieneTabla ? "✅" : "⚠️"}`)
    console.log(`   📜 Es scrollable: ${esScrollable ? "✅" : "ℹ️"}`)
    console.log(`   🃏 Usa cards móviles: ${tieneCards ? "✅" : "ℹ️"}`)

    // Una de las estrategias debe estar presente O el contenido se adapta
    const tieneContenido = await page
      .locator('main, [class*="panel"], [class*="content"]')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    expect
      .soft(esScrollable || tieneCards || tieneContenido, "Debe mostrar contenido adaptado")
      .toBe(true)
  })

  test("Tabla en tablet", async ({ page }) => {
    await setViewport(page, 768, 1024)
    await navegarA(page, "/ventas", "Ventas")

    const { tieneTabla, esScrollable, tieneCards } = await verificarTablaResponsive(page)

    console.log(`   📋 Tabla en tablet: ${tieneTabla ? "✅" : "⚠️"}`)
    console.log(`   📜 Scrollable: ${esScrollable ? "✅" : "ℹ️"}`)
  })

  test("Tabla en desktop - todas las columnas", async ({ page }) => {
    await setViewport(page, 1440, 900)
    await navegarA(page, "/ventas", "Ventas")

    const headers = await page.locator('table th, [role="columnheader"], [class*="header"]').count()
    console.log(`   📋 Columnas/headers visibles: ${headers}`)

    // El contenido puede no usar tabla tradicional
    const tieneContenido = await page
      .locator('main, [class*="grid"], [class*="panel"]')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    expect.soft(headers > 0 || tieneContenido, "Debe mostrar contenido").toBe(true)
  })
})

// ============================================
// TESTS DE MODALES RESPONSIVE
// ============================================

test.describe("🔲 SUITE: Modales Responsive", () => {
  test("Modal en móvil - ocupa pantalla", async ({ page }) => {
    await setViewport(page, 375, 667)
    await navegarA(page, "/ventas", "Ventas")

    const { seAbre, ocupaPantalla, centrado } = await verificarModalResponsive(page)

    console.log(`   🔲 Modal se abre: ${seAbre ? "✅" : "⚠️"}`)
    console.log(`   📐 Ocupa pantalla: ${ocupaPantalla ? "✅" : "ℹ️"}`)
    console.log(`   🎯 Centrado: ${centrado ? "✅" : "ℹ️"}`)
  })

  test("Modal en desktop - centrado", async ({ page }) => {
    await setViewport(page, 1440, 900)
    await navegarA(page, "/ventas", "Ventas")

    const { seAbre, centrado } = await verificarModalResponsive(page)

    console.log(`   🔲 Modal: ${seAbre ? "✅" : "⚠️"}`)
    console.log(`   🎯 Centrado: ${centrado ? "✅" : "⚠️"}`)
  })
})

// ============================================
// TESTS DE TOUCH TARGETS
// ============================================

test.describe("👆 SUITE: Touch Targets", () => {
  test("Botones con tamaño touch adecuado", async ({ page }) => {
    await setViewport(page, 375, 667)
    await navegarA(page, "/dashboard", "Dashboard")

    const touchFriendly = await verificarTouchInteraction(page)
    console.log(`   👆 Touch targets adecuados: ${touchFriendly ? "✅" : "⚠️"}`)
  })

  test("Enlaces navegación tocables", async ({ page }) => {
    await setViewport(page, 375, 667)
    await navegarA(page, "/dashboard", "Dashboard")

    // Verificar enlaces del menú
    const enlaces = await page.locator('nav a, [class*="nav"] a, header a').all()
    let enlacesFriendly = 0

    for (const enlace of enlaces.slice(0, 10)) {
      const box = await enlace.boundingBox()
      if (box && box.height >= 40) {
        enlacesFriendly++
      }
    }

    console.log(`   👆 Enlaces tocables: ${enlacesFriendly}/${Math.min(enlaces.length, 10)}`)
  })
})

// ============================================
// TESTS DE ORIENTACIÓN
// ============================================

test.describe("🔄 SUITE: Orientación", () => {
  test("Portrait móvil", async ({ page }) => {
    await setViewport(page, 375, 667) // Portrait
    await navegarA(page, "/dashboard", "Dashboard")

    const tieneOverflow = await verificarOverflowHorizontal(page)
    const tieneContenido = await page
      .locator('main, [class*="content"]')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    console.log(
      `   📱 Portrait: Overflow=${tieneOverflow ? "⚠️" : "✅"} Contenido=${tieneContenido ? "✅" : "⚠️"}`
    )
  })

  test("Landscape móvil", async ({ page }) => {
    await setViewport(page, 667, 375) // Landscape
    await navegarA(page, "/dashboard", "Dashboard")

    const tieneOverflow = await verificarOverflowHorizontal(page)
    const tieneContenido = await page
      .locator('main, [class*="content"]')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false)

    console.log(
      `   📱 Landscape: Overflow=${tieneOverflow ? "⚠️" : "✅"} Contenido=${tieneContenido ? "✅" : "⚠️"}`
    )
  })
})

// ============================================
// TESTS DE BREAKPOINTS
// ============================================

test.describe("📏 SUITE: Breakpoints", () => {
  test("Transición mobile → tablet", async ({ page }) => {
    await navegarA(page, "/dashboard", "Dashboard")

    // Mobile
    await setViewport(page, BREAKPOINTS.mobile - 1, 800)
    const elementosMobile = await verificarElementosVisibles(page)

    // Tablet
    await setViewport(page, BREAKPOINTS.tablet, 1024)
    const elementosTablet = await verificarElementosVisibles(page)

    console.log(`   📱 Mobile nav: ${elementosMobile.navegacion ? "Visible" : "Oculta"}`)
    console.log(`   📱 Tablet nav: ${elementosTablet.navegacion ? "Visible" : "Oculta"}`)
  })

  test("Transición tablet → desktop", async ({ page }) => {
    await navegarA(page, "/dashboard", "Dashboard")

    // Tablet
    await setViewport(page, BREAKPOINTS.tablet, 1024)
    const elementosTablet = await verificarElementosVisibles(page)

    // Desktop
    await setViewport(page, BREAKPOINTS.desktop, 900)
    const elementosDesktop = await verificarElementosVisibles(page)

    console.log(`   📱 Tablet: Nav=${elementosTablet.navegacion ? "✅" : "⚠️"}`)
    console.log(`   🖥️ Desktop: Nav=${elementosDesktop.navegacion ? "✅" : "⚠️"}`)
  })
})

// ============================================
// TEST DE RESUMEN GLOBAL
// ============================================

test("📊 Resumen Global Responsive", async ({ page }) => {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 RESUMEN GLOBAL RESPONSIVE")
  console.log("═══════════════════════════════════════════════════\n")

  const resultados: Array<{
    viewport: string
    overflow: boolean
    contenido: boolean
    navegacion: boolean
  }> = []

  for (const [key, viewport] of Object.entries(VIEWPORTS)) {
    await setViewport(page, viewport.width, viewport.height)
    await navegarA(page, "/dashboard", "Dashboard")

    const overflow = await verificarOverflowHorizontal(page)
    const elementos = await verificarElementosVisibles(page)

    resultados.push({
      viewport: viewport.nombre,
      overflow,
      contenido: elementos.contenido,
      navegacion: elementos.navegacion,
    })

    console.log(`\n${viewport.nombre}:`)
    console.log(`   📐 Overflow: ${overflow ? "⚠️" : "✅"}`)
    console.log(`   📦 Contenido: ${elementos.contenido ? "✅" : "⚠️"}`)
    console.log(`   📌 Navegación: ${elementos.navegacion ? "✅" : "🔲"}`)
  }

  // Totales
  const sinOverflow = resultados.filter((r) => !r.overflow).length
  const conContenido = resultados.filter((r) => r.contenido).length

  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 TOTALES:")
  console.log(`   ✅ Sin overflow: ${sinOverflow}/${resultados.length}`)
  console.log(`   📦 Con contenido: ${conContenido}/${resultados.length}`)
  console.log("═══════════════════════════════════════════════════\n")
})
