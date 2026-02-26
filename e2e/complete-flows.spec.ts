// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS E2E TESTS - Tests End-to-End Completos
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Tests E2E exhaustivos para flujos críticos del sistema CHRONOS
 * Objetivo: 70% cobertura de flujos críticos con Playwright
 */

import { test, expect, Page } from '@playwright/test'
import { faker } from '@faker-js/faker'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 TEST DATA - Datos de Prueba
// ═══════════════════════════════════════════════════════════════════════════════

const testData = {
  cliente: {
    nombre: faker.person.fullName(),
    email: faker.internet.email(),
    telefono: faker.phone.number('+52 ### ### ####'),
    direccion: faker.location.streetAddress(),
    limiteCredito: faker.number.int({ min: 10000, max: 100000 })
  },
  producto: {
    nombre: faker.commerce.productName(),
    descripcion: faker.commerce.productDescription(),
    precioCompra: faker.number.int({ min: 100, max: 1000 }),
    precioVenta: faker.number.int({ min: 1000, max: 5000 }),
    stockInicial: faker.number.int({ min: 50, max: 500 }),
    stockMinimo: faker.number.int({ min: 10, max: 50 })
  },
  venta: {
    cantidad: faker.number.int({ min: 1, max: 10 }),
    precioVenta: faker.number.int({ min: 1000, max: 5000 }),
    precioCompra: faker.number.int({ min: 500, max: 2000 }),
    precioFlete: faker.number.int({ min: 50, max: 200 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION TESTS - Tests de Autenticación
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL('/dashboard')
    
    // Verify dashboard is loaded
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@email.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Logout
    await page.click('button[aria-label="Logout"]')
    await page.waitForURL('/login')
    
    // Verify logout
    await expect(page.locator('h1')).toContainText('Login')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 VENTAS FLOW TESTS - Tests de Flujo de Ventas
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Ventas Flow', () => {
  test('should create new sale successfully', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to ventas
    await page.click('nav a[href="/ventas"]')
    await page.waitForURL('/ventas')
    
    // Click new sale button
    await page.click('button:has-text("Nueva Venta")')
    
    // Fill sale form
    await page.selectOption('select[name="clienteId"]', 'cliente-001')
    await page.selectOption('select[name="productoId"]', 'producto-001')
    await page.fill('input[name="cantidad"]', testData.venta.cantidad.toString())
    await page.fill('input[name="precioVenta"]', testData.venta.precioVenta.toString())
    await page.fill('input[name="precioCompra"]', testData.venta.precioCompra.toString())
    await page.fill('input[name="precioFlete"]', testData.venta.precioFlete.toString())
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Crear Venta")')
    
    // Wait for success
    await expect(page.locator('[role="status"]')).toContainText('Venta creada exitosamente')
    
    // Verify sale appears in list
    await expect(page.locator('table')).toContainText(testData.cliente.nombre)
  })

  test('should validate sale form correctly', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to ventas
    await page.click('nav a[href="/ventas"]')
    await page.waitForURL('/ventas')
    
    // Click new sale button
    await page.click('button:has-text("Nueva Venta")')
    
    // Submit empty form
    await page.click('button[type="submit"]:has-text("Crear Venta")')
    
    // Check validation errors
    await expect(page.locator('[role="alert"]')).toContainText('Cliente es requerido')
    await expect(page.locator('[role="alert"]')).toContainText('Producto es requerido')
    await expect(page.locator('[role="alert"]')).toContainText('Cantidad es requerida')
  })

  test('should calculate GYA distribution correctly', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to ventas
    await page.click('nav a[href="/ventas"]')
    await page.waitForURL('/ventas')
    
    // Click new sale button
    await page.click('button:has-text("Nueva Venta")')
    
    // Fill sale form
    await page.selectOption('select[name="clienteId"]', 'cliente-001')
    await page.selectOption('select[name="productoId"]', 'producto-001')
    await page.fill('input[name="cantidad"]', '10')
    await page.fill('input[name="precioVenta"]', '1500')
    await page.fill('input[name="precioCompra"]', '800')
    await page.fill('input[name="precioFlete"]', '50')
    
    // Check GYA calculation preview
    await expect(page.locator('#gya-preview')).toContainText('Bóveda Monte: $8,000')
    await expect(page.locator('#gya-preview')).toContainText('Flete Sur: $500')
    await expect(page.locator('#gya-preview')).toContainText('Utilidades: $6,500')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 ÓRDENES DE COMPRA FLOW - Tests de Flujo de Órdenes de Compra
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Ordenes de Compra Flow', () => {
  test('should create new purchase order', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to ordenes
    await page.click('nav a[href="/ordenes"]')
    await page.waitForURL('/ordenes')
    
    // Click new order button
    await page.click('button:has-text("Nueva Orden")')
    
    // Fill order form
    await page.selectOption('select[name="distribuidorId"]', 'distribuidor-001')
    await page.selectOption('select[name="productoId"]', 'producto-001')
    await page.fill('input[name="cantidad"]', '50')
    await page.fill('input[name="precioCompra"]', '500')
    await page.fill('input[name="precioFlete"]', '100')
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Crear Orden")')
    
    // Wait for success
    await expect(page.locator('[role="status"]')).toContainText('Orden creada exitosamente')
  })

  test('should handle partial payments on orders', async ({ page }) => {
    // Login and navigate to ordenes
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await page.click('nav a[href="/ordenes"]')
    await page.waitForURL('/ordenes')
    
    // Find an existing order with pending payment
    await page.click('tr:has-text("Pendiente") button:has-text("Pagar")')
    
    // Enter partial payment amount
    await page.fill('input[name="montoPago"]', '2500')
    await page.click('button:has-text("Registrar Pago")')
    
    // Verify payment was registered
    await expect(page.locator('[role="status"]')).toContainText('Pago registrado')
    
    // Check that order status updated
    await expect(page.locator('tr:has-text("Parcial")')).toBeVisible()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 💰 BANCOS AND FINANCIAL FLOW - Tests de Flujo Financiero
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Bancos Flow', () => {
  test('should display bank balances correctly', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to bancos
    await page.click('nav a[href="/bancos"]')
    await page.waitForURL('/bancos')
    
    // Check all 7 banks are displayed
    await expect(page.locator('table')).toContainText('Bóveda Monte')
    await expect(page.locator('table')).toContainText('Bóveda USA')
    await expect(page.locator('table')).toContainText('Flete Sur')
    await expect(page.locator('table')).toContainText('Utilidades')
    await expect(page.locator('table')).toContainText('Azteca')
    await expect(page.locator('table')).toContainText('Leftie')
    await expect(page.locator('table')).toContainText('Profit')
    
    // Verify balances are displayed
    await expect(page.locator('td:has-text("$")')).toHaveCount(7)
  })

  test('should handle bank transfers correctly', async ({ page }) => {
    // Login and navigate to bancos
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await page.click('nav a[href="/bancos"]')
    await page.waitForURL('/bancos')
    
    // Click transfer button
    await page.click('button:has-text("Transferir")')
    
    // Fill transfer form
    await page.selectOption('select[name="bancoOrigen"]', 'boveda-monte')
    await page.selectOption('select[name="bancoDestino"]', 'utilidades')
    await page.fill('input[name="monto"]', '5000')
    await page.fill('textarea[name="descripcion"]', 'Transferencia de prueba')
    
    // Submit transfer
    await page.click('button[type="submit"]:has-text("Transferir")')
    
    // Verify transfer was successful
    await expect(page.locator('[role="status"]')).toContainText('Transferencia realizada')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 AI PANEL FLOW - Tests de Flujo de Panel IA
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('AI Panel Flow', () => {
  test('should load AI panel successfully', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to AI panel
    await page.click('nav a[href="/ia"]')
    await page.waitForURL('/ia')
    
    // Verify AI panel loads
    await expect(page.locator('h1')).toContainText('Asistente Inteligente')
    await expect(page.locator('[data-testid="ai-chat-container"]')).toBeVisible()
  })

  test('should send message to AI assistant', async ({ page }) => {
    // Login and navigate to AI panel
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await page.click('nav a[href="/ia"]')
    await page.waitForURL('/ia')
    
    // Send message
    await page.fill('input[placeholder="Escribe tu mensaje..."]', '¿Cuáles son las ventas de hoy?')
    await page.click('button:has-text("Enviar")')
    
    // Wait for AI response
    await page.waitForTimeout(2000) // Wait for AI processing
    
    // Verify response appears
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(2) // User message + AI response
  })

  test('should use voice recognition', async ({ page }) => {
    // Login and navigate to AI panel
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await page.click('nav a[href="/ia"]')
    await page.waitForURL('/ia')
    
    // Click voice button
    await page.click('button[aria-label="Activar voz"]')
    
    // Wait for voice recognition to start
    await page.waitForTimeout(1000)
    
    // Verify voice recognition is active
    await expect(page.locator('[data-testid="voice-status"]')).toContainText('Escuchando')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📈 REPORTS AND ANALYTICS - Tests de Reportes y Análisis
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Reports and Analytics', () => {
  test('should generate sales report', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to reportes
    await page.click('nav a[href="/reportes"]')
    await page.waitForURL('/reportes')
    
    // Select date range
    await page.fill('input[name="fechaInicio"]', '2024-01-01')
    await page.fill('input[name="fechaFin"]', '2024-01-31')
    
    // Generate report
    await page.click('button:has-text("Generar Reporte")')
    
    // Wait for report to load
    await page.waitForTimeout(2000)
    
    // Verify report contains data
    await expect(page.locator('[data-testid="report-data"]')).toBeVisible()
    await expect(page.locator('canvas')).toBeVisible() // Chart should be visible
  })

  test('should export report to Excel', async ({ page }) => {
    // Login and navigate to reportes
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    await page.click('nav a[href="/reportes"]')
    await page.waitForURL('/reportes')
    
    // Generate report first
    await page.fill('input[name="fechaInicio"]', '2024-01-01')
    await page.fill('input[name="fechaFin"]', '2024-01-31')
    await page.click('button:has-text("Generar Reporte")')
    await page.waitForTimeout(2000)
    
    // Export to Excel
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Exportar Excel")')
    const download = await downloadPromise
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/reporte.*\.xlsx/)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 ACCESSIBILITY AND SECURITY - Tests de Accesibilidad y Seguridad
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Accessibility and Security', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login')
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="email"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="password"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()
    
    // Submit with Enter
    await page.keyboard.press('Enter')
    
    // Should attempt to submit (even if invalid)
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test('should protect against XSS attacks', async ({ page }) => {
    await page.goto('/login')
    
    // Try to inject script
    await page.fill('input[name="email"]', '<script>alert("XSS")</script>')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Script should be escaped and not executed
    await expect(page.locator('body')).not.toContainText('XSS')
    
    // Input should be sanitized
    await expect(page.locator('input[name="email"]')).toHaveValue('<script>alert("XSS")</script>')
  })

  test('should enforce role-based access', async ({ page }) => {
    // Login as operator (limited permissions)
    await page.goto('/login')
    await page.fill('input[name="email"]', 'operator@chronos.com')
    await page.fill('input[name="password"]', 'operator123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Try to access admin-only section
    await page.goto('/admin/configuracion')
    
    // Should be redirected or show access denied
    await expect(page.locator('[role="alert"]')).toContainText(/access denied|no autorizado/i)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 📱 RESPONSIVE DESIGN - Tests de Diseño Responsivo
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/login')
    
    // Login form should be mobile-friendly
    await expect(page.locator('form')).toBeVisible()
    
    // Fill and submit form
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Mobile navigation should work
    await page.click('button[aria-label="Menu"]')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should work on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Tablet layout should be optimized
    await expect(page.locator('.tablet-optimized')).toBeVisible()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 PERFORMANCE TESTS - Tests de Performance
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Performance Tests', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const loadTime = Date.now() - startTime
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check that main content is loaded
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should handle large data sets efficiently', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@chronos.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to ventas with large dataset
    await page.click('nav a[href="/ventas"]')
    await page.waitForURL('/ventas')
    
    // Switch to "All" view to load large dataset
    await page.click('button:has-text("Ver Todo")')
    
    // Measure time to render large table
    const startTime = Date.now()
    await page.waitForSelector('table tbody tr', { timeout: 5000 })
    const renderTime = Date.now() - startTime
    
    // Large dataset should render within 5 seconds
    expect(renderTime).toBeLessThan(5000)
    
    // Check that pagination works
    await page.click('button:has-text("Siguiente")')
    await expect(page.locator('table tbody tr')).toHaveCount(50) // Assuming 50 rows per page
  })
})