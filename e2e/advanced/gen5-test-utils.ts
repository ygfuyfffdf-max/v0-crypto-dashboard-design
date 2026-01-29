import { Page } from "@playwright/test"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛠️ CHRONOS GEN5 2026 — UTILIDADES COMPARTIDAS E2E
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Utilidades centralizadas para tests E2E de paneles Gen5 Complete:
 * - Selectores Gen5 (GlassTabs, GlassInput, FormModal, etc.)
 * - Helpers de navegación
 * - Funciones de interacción con modales
 * - Validadores de UI
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// SELECTORES GEN5 CENTRALIZADOS
// ============================================

export const GEN5_SELECTORS = {
  // Modales Gen5 (FormModal glassmorphism)
  modal:
    '[role="dialog"], [class*="FormModal"], [class*="glass"][class*="modal"], [class*="Dialog"]',
  modalTitle:
    '[class*="modal"] h2, [role="dialog"] h2, [class*="FormModal"] h2, [class*="Dialog"] h2',
  modalClose:
    'button:has-text("Cancelar"), button:has-text("Cerrar"), button[aria-label*="close"], [class*="close"]',
  modalSubmit:
    'button[type="submit"], button:has-text("Guardar"), button:has-text("Crear"), button:has-text("Confirmar")',

  // Tabs Gen5 (GlassTabs)
  tabList: '[role="tablist"], [class*="GlassTabs"], [class*="glass"][class*="tab"]',
  tab: '[role="tab"], button[class*="glass"][class*="tab"]',
  activeTab: '[role="tab"][data-state="active"], [role="tab"][aria-selected="true"]',

  // Botones Gen5 (GlassButton)
  button: 'button[class*="glass"], button[class*="Glass"], [class*="GlassButton"]',
  primaryButton:
    'button[class*="glass"][class*="primary"], button:has-text("Nueva"), button:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Agregar")',
  secondaryButton: 'button[class*="glass"][class*="secondary"]',
  dangerButton:
    'button[class*="glass"][class*="danger"], button:has-text("Eliminar"), button:has-text("Borrar")',

  // Inputs Gen5 (GlassInput, GlassSelect)
  input: 'input[class*="glass"], input[class*="Glass"], [class*="GlassInput"] input',
  select: 'select[class*="glass"], [class*="GlassSelect"] select, select',
  search:
    'input[type="search"], input[placeholder*="Buscar"], input[placeholder*="buscar"], [class*="search"] input',
  textarea: 'textarea[class*="glass"], [class*="GlassTextarea"] textarea',

  // Tablas Gen5 (PremiumDataTable)
  table: 'table, [role="grid"], [class*="PremiumDataTable"], [class*="glass"][class*="table"]',
  tableHeader: 'thead, [role="rowgroup"]:first-child',
  tableBody: 'tbody, [role="rowgroup"]:last-child',
  tableRow: 'tbody tr, [role="row"]',
  tableCell: 'td, [role="gridcell"]',
  tableAction: 'tbody tr button, [role="row"] button',

  // Header y Navegación (KosmosHeader)
  header: 'header, [class*="KosmosHeader"], [class*="header"]',
  nav: 'nav, [class*="nav"]',
  navLink: 'a[href^="/"], nav a, header a',
  activeNavLink: 'a[class*="active"], a[data-active="true"]',

  // Cards y contenedores Gen5
  card: '[class*="glass"][class*="card"], [class*="Card"], [class*="bento"]',
  kpiCard: '[class*="kpi"], [class*="metric"], [class*="stat"]',

  // Sección GYA (Distribución automática)
  gyaSection: '[class*="GYA"], [class*="distribution"], [class*="gya"], [class*="Distribution"]',
  bancoCard: '[data-banco], [class*="banco"], [class*="boveda"]',

  // Estados de carga
  loading: '[class*="loading"], [class*="spinner"], [class*="skeleton"]',
  skeleton: '[class*="skeleton"], [class*="Skeleton"]',

  // Notificaciones (Toast)
  toast: '[class*="toast"], [class*="Toast"], [role="alert"]',
  toastSuccess: '[class*="toast"][class*="success"], [class*="Toast"][class*="success"]',
  toastError: '[class*="toast"][class*="error"], [class*="Toast"][class*="error"]',

  // Otros componentes Gen5
  badge: '[class*="badge"], [class*="Badge"]',
  avatar: '[class*="avatar"], [class*="Avatar"]',
  tooltip: '[class*="tooltip"], [role="tooltip"]',
}

// ============================================
// TIMEOUTS Y CONFIGURACIÓN
// ============================================

export const GEN5_CONFIG = {
  // Timeouts ajustados para animaciones framer-motion
  BASE_TIMEOUT: 25000,
  MODAL_TIMEOUT: 8000,
  ANIMATION_WAIT: 600,
  SHORT_WAIT: 300,
  LONG_WAIT: 2500,

  // Timeouts para operaciones específicas
  NAV_WAIT: 2500,
  FORM_SUBMIT_WAIT: 3000,
  TABLE_LOAD_WAIT: 2000,
}

// ============================================
// RUTAS DE PANELES GEN5
// ============================================

export const GEN5_ROUTES = {
  dashboard: "/dashboard",
  ventas: "/ventas",
  clientes: "/clientes",
  bancos: "/bancos",
  distribuidores: "/distribuidores",
  ordenes: "/ordenes",
  almacen: "/almacen",
  gastos: "/gastos",
  movimientos: "/movimientos",
  ia: "/ia",
} as const

export type Gen5Route = keyof typeof GEN5_ROUTES

// ============================================
// HELPERS DE NAVEGACIÓN
// ============================================

/**
 * Navega a una ruta específica y espera animación Gen5
 */
export async function navigateToRoute(page: Page, route: Gen5Route | string) {
  const path =
    typeof route === "string" && route.startsWith("/") ? route : GEN5_ROUTES[route as Gen5Route]

  await page.goto(path, { waitUntil: "domcontentloaded", timeout: GEN5_CONFIG.BASE_TIMEOUT })
  await page.waitForTimeout(GEN5_CONFIG.NAV_WAIT)
}

/**
 * Verifica que la URL actual coincida con la ruta esperada
 */
export function verifyCurrentRoute(page: Page, expectedPath: string): boolean {
  const url = page.url()
  return url.endsWith(expectedPath) || url.includes(expectedPath)
}

/**
 * Espera a que el contenido principal se cargue
 */
export async function waitForMainContent(page: Page): Promise<boolean> {
  const mainSelectors = [
    "main",
    '[class*="panel"]',
    '[class*="Panel"]',
    '[class*="content"]',
    '[class*="glass"]',
  ]

  for (const selector of mainSelectors) {
    const element = page.locator(selector).first()
    if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
      return true
    }
  }
  return false
}

// ============================================
// HELPERS DE MODALES
// ============================================

/**
 * Abre un modal haciendo click en el trigger
 */
export async function openModal(page: Page, triggerTexts: string[]): Promise<boolean> {
  // Intentar con textos específicos
  for (const text of triggerTexts) {
    const selectors = [
      `button:has-text("${text}")`,
      `button[class*="glass"]:has-text("${text}")`,
      `[role="button"]:has-text("${text}")`,
    ]

    for (const selector of selectors) {
      const btn = page.locator(selector).first()
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click()
        await page.waitForTimeout(GEN5_CONFIG.ANIMATION_WAIT)

        const modal = page.locator(GEN5_SELECTORS.modal).first()
        return await modal.isVisible({ timeout: GEN5_CONFIG.MODAL_TIMEOUT }).catch(() => false)
      }
    }
  }

  // Fallback: buscar botón con ícono plus
  const plusBtn = page.locator('button:has(svg[class*="plus" i])').first()
  if (await plusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await plusBtn.click()
    await page.waitForTimeout(GEN5_CONFIG.ANIMATION_WAIT)

    const modal = page.locator(GEN5_SELECTORS.modal).first()
    return await modal.isVisible({ timeout: GEN5_CONFIG.MODAL_TIMEOUT }).catch(() => false)
  }

  return false
}

/**
 * Cierra el modal actual
 */
export async function closeModal(page: Page): Promise<void> {
  const closeBtn = page.locator(GEN5_SELECTORS.modalClose).first()
  if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await closeBtn.click()
  } else {
    await page.keyboard.press("Escape")
  }
  await page.waitForTimeout(GEN5_CONFIG.SHORT_WAIT)
}

/**
 * Verifica si un modal está abierto
 */
export async function isModalOpen(page: Page): Promise<boolean> {
  return await page
    .locator(GEN5_SELECTORS.modal)
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false)
}

// ============================================
// HELPERS DE TABLAS
// ============================================

/**
 * Obtiene el número de filas en una tabla
 */
export async function getTableRowCount(page: Page): Promise<number> {
  const table = page.locator(GEN5_SELECTORS.table).first()
  if (!(await table.isVisible({ timeout: 3000 }).catch(() => false))) {
    return 0
  }
  return await page.locator(GEN5_SELECTORS.tableRow).count()
}

/**
 * Hace click en una acción de una fila específica
 */
export async function clickTableRowAction(
  page: Page,
  rowIndex: number,
  actionText: string
): Promise<boolean> {
  const row = page.locator(GEN5_SELECTORS.tableRow).nth(rowIndex)
  if (!(await row.isVisible({ timeout: 2000 }).catch(() => false))) {
    return false
  }

  const actionBtn = row.locator(`button:has-text("${actionText}"), button:has(svg)`).first()
  if (await actionBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await actionBtn.click()
    await page.waitForTimeout(GEN5_CONFIG.ANIMATION_WAIT)
    return true
  }
  return false
}

// ============================================
// HELPERS DE TABS
// ============================================

/**
 * Hace click en un tab específico
 */
export async function clickTab(page: Page, tabText: string): Promise<boolean> {
  const selectors = [
    `[role="tab"]:has-text("${tabText}")`,
    `button[class*="glass"]:has-text("${tabText}")`,
    `[class*="GlassTabs"] button:has-text("${tabText}")`,
  ]

  for (const selector of selectors) {
    const tab = page.locator(selector).first()
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tab.click()
      await page.waitForTimeout(GEN5_CONFIG.SHORT_WAIT)
      return true
    }
  }
  return false
}

/**
 * Obtiene el tab activo actual
 */
export async function getActiveTab(page: Page): Promise<string | null> {
  const activeTab = page.locator(GEN5_SELECTORS.activeTab).first()
  if (await activeTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    return await activeTab.textContent()
  }
  return null
}

// ============================================
// HELPERS DE INPUTS
// ============================================

/**
 * Llena un input por nombre o placeholder
 */
export async function fillInput(page: Page, identifier: string, value: string): Promise<boolean> {
  const selectors = [
    `input[name="${identifier}"]`,
    `input[placeholder*="${identifier}" i]`,
    `[class*="GlassInput"] input[name="${identifier}"]`,
    `label:has-text("${identifier}") + input`,
    `label:has-text("${identifier}") input`,
  ]

  for (const selector of selectors) {
    const input = page.locator(selector).first()
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.clear()
      await input.fill(value)
      return true
    }
  }
  return false
}

/**
 * Selecciona una opción en un select
 */
export async function selectOption(
  page: Page,
  identifier: string,
  value: string
): Promise<boolean> {
  const selectors = [
    `select[name="${identifier}"]`,
    `[class*="GlassSelect"] select[name="${identifier}"]`,
    `label:has-text("${identifier}") + select`,
    `label:has-text("${identifier}") select`,
  ]

  for (const selector of selectors) {
    const select = page.locator(selector).first()
    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.selectOption(value)
      return true
    }
  }
  return false
}

// ============================================
// HELPERS DE BÚSQUEDA
// ============================================

/**
 * Realiza una búsqueda en el campo de búsqueda del panel
 */
export async function searchInPanel(page: Page, searchText: string): Promise<boolean> {
  const searchInput = page.locator(GEN5_SELECTORS.search).first()
  if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await searchInput.clear()
    await searchInput.fill(searchText)
    await page.waitForTimeout(GEN5_CONFIG.TABLE_LOAD_WAIT) // Esperar debounce
    return true
  }
  return false
}

// ============================================
// HELPERS DE VALIDACIÓN
// ============================================

/**
 * Verifica si hay un toast de éxito visible
 */
export async function hasSuccessToast(page: Page): Promise<boolean> {
  return await page
    .locator(GEN5_SELECTORS.toastSuccess)
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false)
}

/**
 * Verifica si hay un toast de error visible
 */
export async function hasErrorToast(page: Page): Promise<boolean> {
  return await page
    .locator(GEN5_SELECTORS.toastError)
    .first()
    .isVisible({ timeout: 3000 })
    .catch(() => false)
}

/**
 * Verifica si el panel está en estado de carga
 */
export async function isLoading(page: Page): Promise<boolean> {
  return await page
    .locator(GEN5_SELECTORS.loading)
    .first()
    .isVisible({ timeout: 1000 })
    .catch(() => false)
}

// ============================================
// HELPERS DE LOGGING
// ============================================

/**
 * Log con timestamp para tests
 */
export function testLog(message: string, data?: unknown) {
  const isoString = new Date().toISOString()
  const timePart = isoString.split("T")[1] ?? "00:00:00.000Z"
  const timestamp = timePart.split(".")[0] ?? "00:00:00"
  if (data) {
    console.log(`[${timestamp}] ${message}`, data)
  } else {
    console.log(`[${timestamp}] ${message}`)
  }
}

/**
 * Log de resultado de test
 */
export function logTestResult(testName: string, passed: boolean, details?: string) {
  const emoji = passed ? "✅" : "❌"
  const status = passed ? "PASS" : "FAIL"
  console.log(`${emoji} [${status}] ${testName}${details ? ` - ${details}` : ""}`)
}
