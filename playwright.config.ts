import { defineConfig, devices } from "@playwright/test"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎭 CHRONOS 2026 — CONFIGURACIÓN DE PLAYWRIGHT E2E TESTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Configuración optimizada para tests E2E completos del sistema CHRONOS.
 * Tests cubren todos los flujos de negocio y lógica GYA.
 *
 * Uso:
 * - npm run test:e2e         → Ejecutar todos los tests
 * - npm run test:e2e:ui      → Modo UI interactivo
 * - npx playwright show-report → Ver reporte HTML
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default defineConfig({
  testDir: "./e2e",

  // Ejecutar tests en paralelo para mayor velocidad
  fullyParallel: true,

  // No permitir .only en CI para evitar tests incompletos
  forbidOnly: !!process.env.CI,

  // Reintentos en caso de fallos intermitentes
  retries: process.env.CI ? 2 : 1,

  // Workers: 1 en CI para estabilidad, undefined en local para usar CPUs disponibles
  workers: process.env.CI ? 1 : undefined,

  // Reportes HTML con screenshots y traces
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],

  // Timeout global de 60 segundos por test
  timeout: 60 * 1000,

  use: {
    // URL base del sistema
    baseURL: "http://localhost:3000",

    // Capturar trace en el primer reintento para debugging
    trace: "on-first-retry",

    // Screenshots solo en fallos
    screenshot: "only-on-failure",

    // Video solo en fallos
    video: "retain-on-failure",

    // Timeout de acciones individuales
    actionTimeout: 15 * 1000,

    // Timeout de navegación
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        // Usar Chromium del sistema en Alpine Linux
        channel: undefined,
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
        },
      },
    },

    // Descomentar para probar en otros navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports */
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        // Usar Chromium del sistema en Alpine Linux
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
        },
      },
    },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Servidor de desarrollo
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },
})
