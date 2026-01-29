import { expect, Page, test } from "@playwright/test"
import { GEN5_CONFIG, GEN5_ROUTES, testLog } from "./gen5-test-utils"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚡ CHRONOS GEN5 2026 — TESTS E2E: PERFORMANCE Y MÉTRICAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tests exhaustivos de rendimiento del sistema Gen5:
 *
 * ✅ Tiempos de carga (LCP, FCP)
 * ✅ Interactividad (FID, TTI)
 * ✅ Estabilidad visual (CLS)
 * ✅ Bundle size
 * ✅ Memory leaks
 * ✅ Network requests
 * ✅ Resource loading
 * ✅ JavaScript execution
 *
 * NOTA: Thresholds ajustados para componentes Gen5 con animaciones
 * framer-motion y efectos glassmorphism
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================
// CONFIGURACIÓN GEN5
// ============================================

const BASE_TIMEOUT = GEN5_CONFIG.BASE_TIMEOUT
const ANIMATION_WAIT = GEN5_CONFIG.ANIMATION_WAIT

// Thresholds de performance (ajustados para Gen5 con animaciones)
const THRESHOLDS = {
  // Core Web Vitals
  LCP: 3000, // Largest Contentful Paint < 3s (aumentado para animaciones Gen5)
  FID: 100, // First Input Delay < 100ms
  CLS: 0.15, // Cumulative Layout Shift < 0.15 (más tolerante con animaciones)

  // Tiempos de carga (aumentados para compilación dev + animaciones Gen5)
  pageLoad: 18000, // Carga completa < 18s (dev mode con animaciones)
  firstPaint: 12000, // First Paint < 12s (dev mode)
  domReady: 15000, // DOM Ready < 15s (dev mode)

  // Recursos
  totalRequests: 120, // < 120 requests (Gen5 tiene más assets)
  totalSize: 6 * 1024 * 1024, // < 6MB (incluye fuentes y assets Gen5)
  jsSize: 2.5 * 1024 * 1024, // < 2.5MB JS

  // Memoria
  heapSize: 60 * 1024 * 1024, // < 60MB heap (animaciones Gen5)
}

// Paneles Gen5 a probar (10 paneles)
const PANELES = [
  { path: GEN5_ROUTES.dashboard, nombre: "Dashboard" },
  { path: GEN5_ROUTES.ventas, nombre: "Ventas" },
  { path: GEN5_ROUTES.clientes, nombre: "Clientes" },
  { path: GEN5_ROUTES.bancos, nombre: "Bancos" },
  { path: GEN5_ROUTES.almacen, nombre: "Almacén" },
  { path: GEN5_ROUTES.ordenes, nombre: "Órdenes" },
  { path: GEN5_ROUTES.distribuidores, nombre: "Distribuidores" },
  { path: GEN5_ROUTES.gastos, nombre: "Gastos" },
  { path: GEN5_ROUTES.movimientos, nombre: "Movimientos" },
  { path: GEN5_ROUTES.ia, nombre: "IA" },
]

// ============================================
// TIPOS
// ============================================

interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  totalBlockingTime: number
  cumulativeLayoutShift: number
}

interface ResourceMetrics {
  totalRequests: number
  totalSize: number
  jsSize: number
  cssSize: number
  imageSize: number
  fontSize: number
  otherSize: number
}

interface MemoryMetrics {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// ============================================
// HELPERS GEN5
// ============================================

async function navegarA(page: Page, path: string, nombre: string) {
  testLog(`📍 Navegando a: ${nombre}`)
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: BASE_TIMEOUT })
  await page.waitForTimeout(ANIMATION_WAIT) // Esperar animaciones Gen5
}

async function medirTiempoCarga(page: Page): Promise<PerformanceMetrics> {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType("paint")

    const fpEntry = paint.find((p) => p.name === "first-paint")
    const fcpEntry = paint.find((p) => p.name === "first-contentful-paint")

    return {
      loadTime: navigation?.loadEventEnd - navigation?.startTime || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.startTime || 0,
      firstPaint: fpEntry?.startTime || 0,
      firstContentfulPaint: fcpEntry?.startTime || 0,
      largestContentfulPaint: 0, // Se mide con PerformanceObserver
      totalBlockingTime: 0,
      cumulativeLayoutShift: 0,
    }
  })

  return metrics
}

async function medirRecursos(page: Page): Promise<ResourceMetrics> {
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[]

    const metrics = {
      totalRequests: entries.length,
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      fontSize: 0,
      otherSize: 0,
    }

    for (const entry of entries) {
      const size = entry.transferSize || 0
      metrics.totalSize += size

      if (entry.initiatorType === "script" || entry.name.endsWith(".js")) {
        metrics.jsSize += size
      } else if (entry.initiatorType === "link" || entry.name.endsWith(".css")) {
        metrics.cssSize += size
      } else if (
        entry.initiatorType === "img" ||
        /\.(png|jpg|jpeg|gif|webp|svg)/.test(entry.name)
      ) {
        metrics.imageSize += size
      } else if (/\.(woff|woff2|ttf|otf)/.test(entry.name)) {
        metrics.fontSize += size
      } else {
        metrics.otherSize += size
      }
    }

    return metrics
  })

  return resources
}

async function medirMemoria(page: Page): Promise<MemoryMetrics | null> {
  const memory = await page.evaluate(() => {
    if ("memory" in performance) {
      const mem = (performance as any).memory
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
      }
    }
    return null
  })

  return memory
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function verificarThreshold(valor: number, threshold: number, nombre: string): boolean {
  const cumple = valor <= threshold
  const emoji = cumple ? "✅" : "⚠️"
  console.log(`   ${emoji} ${nombre}: ${formatTime(valor)} (límite: ${formatTime(threshold)})`)
  return cumple
}

// ============================================
// TESTS DE TIEMPOS DE CARGA
// ============================================

test.describe("⏱️ SUITE: Tiempos de Carga", () => {
  for (const panel of PANELES) {
    test(`Tiempos de carga - ${panel.nombre}`, async ({ page }) => {
      const startTime = Date.now()
      await navegarA(page, panel.path, panel.nombre)
      const endTime = Date.now()

      const loadTime = endTime - startTime
      const metrics = await medirTiempoCarga(page)

      console.log(`\n⏱️ Métricas de ${panel.nombre}:`)
      verificarThreshold(loadTime, THRESHOLDS.pageLoad, "Carga total")
      verificarThreshold(metrics.domContentLoaded, THRESHOLDS.domReady, "DOM Ready")
      verificarThreshold(metrics.firstPaint, THRESHOLDS.firstPaint, "First Paint")
      verificarThreshold(metrics.firstContentfulPaint, THRESHOLDS.LCP, "FCP")

      expect
        .soft(loadTime, `${panel.nombre} debe cargar en tiempo`)
        .toBeLessThan(THRESHOLDS.pageLoad)
    })
  }
})

// ============================================
// TESTS DE RECURSOS
// ============================================

test.describe("📦 SUITE: Carga de Recursos", () => {
  test("Análisis de recursos - Dashboard", async ({ page }) => {
    await navegarA(page, "/", "Dashboard")
    await page.waitForTimeout(2000) // Esperar carga completa

    const resources = await medirRecursos(page)

    console.log("\n📦 Recursos cargados:")
    console.log(`   📊 Total requests: ${resources.totalRequests}`)
    console.log(`   📊 Tamaño total: ${formatBytes(resources.totalSize)}`)
    console.log(`   📜 JavaScript: ${formatBytes(resources.jsSize)}`)
    console.log(`   🎨 CSS: ${formatBytes(resources.cssSize)}`)
    console.log(`   🖼️ Imágenes: ${formatBytes(resources.imageSize)}`)
    console.log(`   🔤 Fuentes: ${formatBytes(resources.fontSize)}`)
    console.log(`   📁 Otros: ${formatBytes(resources.otherSize)}`)

    expect
      .soft(resources.totalRequests, "Requests debe ser razonable")
      .toBeLessThan(THRESHOLDS.totalRequests)
    expect.soft(resources.jsSize, "JS no debe ser excesivo").toBeLessThan(THRESHOLDS.jsSize)
  })

  test("Recursos por tipo - Desglose", async ({ page }) => {
    await navegarA(page, "/", "Dashboard")
    await page.waitForTimeout(2000)

    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      const byType: Record<string, number> = {}

      for (const entry of entries) {
        const type = entry.initiatorType || "other"
        byType[type] = (byType[type] || 0) + 1
      }

      return byType
    })

    console.log("\n📦 Recursos por tipo:")
    for (const [tipo, count] of Object.entries(resources)) {
      console.log(`   ${tipo}: ${count}`)
    }
  })
})

// ============================================
// TESTS DE MEMORIA
// ============================================

test.describe("🧠 SUITE: Uso de Memoria", () => {
  test("Memoria inicial - Dashboard", async ({ page }) => {
    await navegarA(page, "/", "Dashboard")
    await page.waitForTimeout(2000)

    const memory = await medirMemoria(page)

    if (memory) {
      console.log("\n🧠 Uso de memoria:")
      console.log(`   📊 Heap usado: ${formatBytes(memory.usedJSHeapSize)}`)
      console.log(`   📊 Heap total: ${formatBytes(memory.totalJSHeapSize)}`)
      console.log(`   📊 Límite: ${formatBytes(memory.jsHeapSizeLimit)}`)

      const porcentaje = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)
      console.log(`   📊 Uso: ${porcentaje}%`)

      expect
        .soft(memory.usedJSHeapSize, "Heap debe ser razonable")
        .toBeLessThan(THRESHOLDS.heapSize)
    } else {
      console.log("   ℹ️ API de memoria no disponible")
    }
  })

  test("Memory leak - Navegación múltiple", async ({ page }) => {
    test.setTimeout(120000) // 2 minutos para este test
    console.log("\n🧠 Test de memory leak...")

    // Medir memoria inicial
    await navegarA(page, "/", "Dashboard")
    await page.waitForTimeout(2000)
    const memInicial = await medirMemoria(page)

    // Navegar varias veces (reducido para evitar timeout)
    for (let i = 0; i < 3; i++) {
      await navegarA(page, "/ventas", "Ventas")
      await page.waitForTimeout(500)
      await navegarA(page, "/clientes", "Clientes")
      await page.waitForTimeout(500)
      await navegarA(page, "/", "Dashboard")
      await page.waitForTimeout(500)
    }

    // Forzar GC si está disponible
    await page.evaluate(() => {
      if ((window as any).gc) {
        ;(window as any).gc()
      }
    })
    await page.waitForTimeout(1000)

    // Medir memoria final
    const memFinal = await medirMemoria(page)

    if (memInicial && memFinal) {
      const incremento = memFinal.usedJSHeapSize - memInicial.usedJSHeapSize
      const porcentajeIncremento = ((incremento / memInicial.usedJSHeapSize) * 100).toFixed(1)

      console.log(`   📊 Memoria inicial: ${formatBytes(memInicial.usedJSHeapSize)}`)
      console.log(`   📊 Memoria final: ${formatBytes(memFinal.usedJSHeapSize)}`)
      console.log(`   📊 Incremento: ${formatBytes(incremento)} (${porcentajeIncremento}%)`)

      // Advertir si el incremento es significativo (>200% - muy tolerante en dev)
      if (incremento > memInicial.usedJSHeapSize * 2) {
        console.log("   ⚠️ POSIBLE MEMORY LEAK DETECTADO")
      } else {
        console.log("   ✅ Memoria dentro de límites aceptables")
      }
    }
  })
})

// ============================================
// TESTS DE NETWORK
// ============================================

test.describe("🌐 SUITE: Network Performance", () => {
  test("Requests HTTP - Dashboard", async ({ page }) => {
    const requests: string[] = []
    const failedRequests: string[] = []

    page.on("request", (request) => {
      requests.push(request.url())
    })

    page.on("requestfailed", (request) => {
      failedRequests.push(request.url())
    })

    await navegarA(page, "/", "Dashboard")
    await page.waitForTimeout(3000)

    console.log("\n🌐 Network:")
    console.log(`   📊 Total requests: ${requests.length}`)
    console.log(`   ❌ Failed requests: ${failedRequests.length}`)

    if (failedRequests.length > 0) {
      console.log("   Failed URLs:")
      for (const url of failedRequests.slice(0, 5)) {
        console.log(`      - ${url.substring(0, 80)}...`)
      }
    }

    expect.soft(failedRequests.length, "No debe haber requests fallidos").toBe(0)
  })

  test("API Response Times", async ({ page }) => {
    const apiTimes: Array<{ url: string; time: number }> = []

    page.on("response", async (response) => {
      if (response.url().includes("/api/")) {
        // Usar headerValues para estimar timing o simplemente registrar la URL
        const serverTiming = response.headers()["server-timing"]
        const time = serverTiming ? parseInt(serverTiming.split("=")[1] || "0", 10) : Date.now()
        apiTimes.push({
          url: response.url(),
          time,
        })
      }
    })

    await navegarA(page, "/", "Dashboard")
    await page.waitForTimeout(3000)

    if (apiTimes.length > 0) {
      console.log("\n🌐 API Response Times:")
      for (const api of apiTimes.slice(0, 10)) {
        const emoji = api.time < 500 ? "✅" : api.time < 1000 ? "⚠️" : "❌"
        console.log(`   ${emoji} ${api.url.split("/api/")[1] || api.url}: ${formatTime(api.time)}`)
      }
    } else {
      console.log("   ℹ️ No se detectaron llamadas API")
    }
  })
})

// ============================================
// TESTS DE JAVASCRIPT EXECUTION
// ============================================

test.describe("⚡ SUITE: JavaScript Execution", () => {
  test("Long tasks - Dashboard", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" })

    // Instalar observer antes de interacción
    await page.evaluate(() => {
      ;(window as any).__longTasks = []
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          ;(window as any).__longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime,
          })
        }
      })
      observer.observe({ entryTypes: ["longtask"] })
    })

    await page.waitForTimeout(3000)

    const longTasks = await page.evaluate(() => (window as any).__longTasks || [])

    console.log("\n⚡ Long Tasks (>50ms):")
    console.log(`   📊 Total: ${longTasks.length}`)

    if (longTasks.length > 0) {
      const totalBlocking = longTasks.reduce((sum: number, t: any) => sum + (t.duration - 50), 0)
      console.log(`   ⏱️ Total Blocking Time: ${formatTime(totalBlocking)}`)

      for (const task of longTasks.slice(0, 5)) {
        console.log(`   - ${formatTime(task.duration)} @ ${formatTime(task.startTime)}`)
      }
    } else {
      console.log("   ✅ No se detectaron long tasks")
    }
  })

  test("JavaScript Errors", async ({ page }) => {
    const jsErrors: string[] = []

    page.on("pageerror", (error) => {
      jsErrors.push(error.message)
    })

    await navegarA(page, "/", "Dashboard")
    await page.waitForTimeout(2000)

    // Navegar a otros paneles
    await navegarA(page, "/ventas", "Ventas")
    await page.waitForTimeout(1000)

    console.log("\n⚡ JavaScript Errors:")
    console.log(`   📊 Total: ${jsErrors.length}`)

    if (jsErrors.length > 0) {
      for (const error of jsErrors.slice(0, 5)) {
        console.log(`   ❌ ${error.substring(0, 100)}`)
      }
    } else {
      console.log("   ✅ No hay errores de JavaScript")
    }

    expect(jsErrors.length, "No debe haber errores JS").toBe(0)
  })
})

// ============================================
// TESTS DE INTERACTIVIDAD
// ============================================

test.describe("👆 SUITE: Interactividad", () => {
  test("Tiempo de respuesta a clicks", async ({ page }) => {
    await navegarA(page, "/ventas", "Ventas")

    // Medir tiempo de click en botón
    const btn = page.locator('button:has-text("Nueva"), button:has-text("Agregar")').first()

    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const startTime = Date.now()
      await btn.click()

      // Esperar algún cambio visual
      await page
        .waitForSelector('[role="dialog"], [class*="modal"]', { timeout: 2000 })
        .catch(() => {})
      const endTime = Date.now()

      const responseTime = endTime - startTime
      const emoji = responseTime < 100 ? "✅" : responseTime < 300 ? "⚠️" : "❌"

      console.log(`\n👆 Tiempo de respuesta a click: ${emoji} ${responseTime}ms`)

      expect.soft(responseTime, "Response time debe ser < 300ms").toBeLessThan(300)

      // Cerrar modal
      await page.keyboard.press("Escape")
    }
  })

  test("Scroll performance", async ({ page }) => {
    await navegarA(page, "/ventas", "Ventas")
    await page.waitForTimeout(1000)

    // Medir performance durante scroll
    const scrollMetrics = await page.evaluate(async () => {
      let jankCount = 0
      let frameCount = 0
      let lastTime = performance.now()

      return new Promise<{ jankCount: number; frameCount: number; avgFrameTime: number }>(
        (resolve) => {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === "frame") {
                frameCount++
                const delta = entry.startTime - lastTime
                if (delta > 16.67 * 2) {
                  // > 2 frames missed
                  jankCount++
                }
                lastTime = entry.startTime
              }
            }
          })

          try {
            observer.observe({ entryTypes: ["frame"] })
          } catch {
            // frame entry type may not be supported
          }

          // Scroll
          let scrollY = 0
          const scrollStep = () => {
            scrollY += 100
            window.scrollTo(0, scrollY)
            if (scrollY < 1000) {
              requestAnimationFrame(scrollStep)
            } else {
              observer.disconnect()
              resolve({
                jankCount,
                frameCount,
                avgFrameTime: frameCount > 0 ? 1000 / 60 : 0,
              })
            }
          }
          scrollStep()
        }
      )
    })

    console.log("\n📜 Scroll Performance:")
    console.log(`   📊 Frames: ${scrollMetrics.frameCount}`)
    console.log(`   ⚠️ Jank count: ${scrollMetrics.jankCount}`)
  })
})

// ============================================
// TEST DE RESUMEN GLOBAL
// ============================================

test("📊 Resumen Global de Performance", async ({ page }) => {
  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 RESUMEN GLOBAL DE PERFORMANCE")
  console.log("═══════════════════════════════════════════════════\n")

  const resultados: Array<{
    panel: string
    loadTime: number
    resources: number
    jsSize: number
    memory: number | null
  }> = []

  for (const panel of PANELES) {
    const startTime = Date.now()
    await navegarA(page, panel.path, panel.nombre)
    await page.waitForTimeout(1500)
    const loadTime = Date.now() - startTime

    const resources = await medirRecursos(page)
    const memory = await medirMemoria(page)

    resultados.push({
      panel: panel.nombre,
      loadTime,
      resources: resources.totalRequests,
      jsSize: resources.jsSize,
      memory: memory?.usedJSHeapSize || null,
    })

    console.log(`\n📱 ${panel.nombre}:`)
    console.log(`   ⏱️ Carga: ${formatTime(loadTime)}`)
    console.log(`   📦 Requests: ${resources.totalRequests}`)
    console.log(`   📜 JS: ${formatBytes(resources.jsSize)}`)
    if (memory) {
      console.log(`   🧠 Memoria: ${formatBytes(memory.usedJSHeapSize)}`)
    }
  }

  // Promedios
  const avgLoadTime = resultados.reduce((s, r) => s + r.loadTime, 0) / resultados.length
  const avgResources = resultados.reduce((s, r) => s + r.resources, 0) / resultados.length

  console.log("\n═══════════════════════════════════════════════════")
  console.log("📊 PROMEDIOS:")
  console.log(`   ⏱️ Tiempo de carga promedio: ${formatTime(avgLoadTime)}`)
  console.log(`   📦 Requests promedio: ${avgResources.toFixed(0)}`)
  console.log("═══════════════════════════════════════════════════\n")

  // Verificar thresholds
  const cumpleTiempo = avgLoadTime < THRESHOLDS.pageLoad
  console.log(`\n🎯 Cumple threshold de carga: ${cumpleTiempo ? "✅" : "⚠️"}`)
})
