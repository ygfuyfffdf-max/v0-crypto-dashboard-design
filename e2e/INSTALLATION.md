# 🚀 Instalación y Configuración de Tests E2E

## Prerequisitos

- Node.js 18+ instalado
- npm o pnpm instalado
- Dependencias del proyecto instaladas

## Instalación Paso a Paso

### 1. Instalar Dependencias del Proyecto

```bash
# Con npm
npm install

# O con pnpm (recomendado)
pnpm install
```

### 2. Instalar Navegadores de Playwright

Playwright necesita descargar los navegadores para ejecutar los tests:

```bash
# Instalar todos los navegadores
npx playwright install

# O solo Chrome (más rápido)
npx playwright install chromium
```

### 3. Verificar Instalación

```bash
# Verificar que Playwright está instalado
npx playwright --version

# Listar tests disponibles
npx playwright test --list
```

Deberías ver algo como:

```
venta-contado.spec.ts
venta-credito.spec.ts
inventario.spec.ts
transferencias.spec.ts
ordenes.spec.ts
aria.spec.ts
componentes-3d.spec.ts
logica-gya.spec.ts
```

## Ejecución de Tests

### Ejecutar Todos los Tests

```bash
# Usando el script del package.json
npm run test:e2e

# O directamente con Playwright
npx playwright test
```

### Ejecutar en Modo UI (Recomendado para desarrollo)

```bash
npm run test:e2e:ui
```

Esto abre una interfaz gráfica donde puedes:

- Ver todos los tests
- Ejecutar tests individuales
- Ver el progreso en tiempo real
- Inspeccionar elementos
- Ver screenshots y traces

### Ejecutar Test Específico

```bash
# Test de lógica GYA (crítico)
npx playwright test logica-gya.spec.ts

# Test de venta al contado
npx playwright test venta-contado.spec.ts

# Con patrón
npx playwright test venta-*
```

### Ejecutar en Modo Debug

```bash
# Abre el inspector de Playwright
npx playwright test --debug

# Debug de un test específico
npx playwright test logica-gya.spec.ts --debug
```

### Ejecutar en Navegador Visible (Headed Mode)

```bash
# Ver la ejecución en el navegador
npx playwright test --headed

# Con slow motion (útil para ver qué hace cada paso)
npx playwright test --headed --slow-mo=500
```

## Ver Reportes

### Reporte HTML

Después de ejecutar los tests:

```bash
npx playwright show-report
```

Esto abre un navegador con:

- Resumen de tests (passed/failed)
- Duración de cada test
- Screenshots de fallos
- Traces interactivos

### Trace Viewer

Para ver el trace de un test específico:

```bash
npx playwright show-trace path/to/trace.zip
```

## Solución de Problemas

### Error: Cannot find module '@playwright/test'

**Solución:**

```bash
# Reinstalar dependencias
npm install

# Verificar que @playwright/test está en package.json
grep @playwright/test package.json

# Instalar explícitamente si falta
npm install -D @playwright/test
```

### Error: Browser executable not found

**Solución:**

```bash
# Instalar navegadores
npx playwright install chromium
```

### Error: Port 3000 already in use

**Solución:**

```bash
# Matar el proceso en el puerto 3000
kill -9 $(lsof -ti:3000)

# O usar otro puerto en playwright.config.ts
```

### Tests muy lentos

**Solución:**

```bash
# Ejecutar solo en Chrome (más rápido)
npx playwright test --project=chromium

# Reducir workers
npx playwright test --workers=1

# Desactivar headed mode
npx playwright test --headed=false
```

### Screenshots no se generan

**Solución:**

Verificar configuración en `playwright.config.ts`:

```typescript
use: {
  screenshot: 'only-on-failure',  // o 'on'
  video: 'retain-on-failure',     // o 'on'
}
```

## Configuración de CI/CD

### GitHub Actions

Ejemplo básico:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install chromium

      - name: Run tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## Desarrollo de Tests

### Estructura de un Test

```typescript
import { test, expect } from "@playwright/test"
import { waitForPageLoad } from "./utils/helpers"

test.describe("Mi Módulo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe hacer algo", async ({ page }) => {
    // Arrange
    await navigateToPanel(page, "Ventas")

    // Act
    const btn = page.locator('button:has-text("Nueva Venta")')
    await btn.click()

    // Assert
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})
```

### Usar Fixtures y Helpers

```typescript
import { VENTA_CONTADO_CASO_1 } from "./fixtures/test-data"
import { testLog, takeTimestampedScreenshot } from "./utils/helpers"

test("mi test", async ({ page }) => {
  const { cantidad, precioVenta } = VENTA_CONTADO_CASO_1

  testLog("📝", `Creando venta de ${cantidad} unidades`)

  // ... realizar acciones ...

  await takeTimestampedScreenshot(page, "mi-screenshot")
})
```

## Tips y Mejores Prácticas

### 1. Usar Selectores Estables

```typescript
// ❌ Malo (frágil)
page.locator(".css-1234567")

// ✅ Bueno (estable)
page.locator('[data-testid="nueva-venta"]')
page.locator('button:has-text("Nueva Venta")')
```

### 2. Esperar Correctamente

```typescript
// ❌ Malo (hard wait)
await page.waitForTimeout(5000)

// ✅ Bueno (wait for condition)
await page.waitForLoadState("networkidle")
await expect(element).toBeVisible({ timeout: 5000 })
```

### 3. Tests Independientes

```typescript
// Cada test debe poder ejecutarse solo
test.describe("Ventas", () => {
  test("test 1", async ({ page }) => {
    // Setup propio
    // No depender de test anterior
  })
})
```

### 4. Limpiar Datos de Test

```typescript
test.afterEach(async ({ page }) => {
  // Limpiar datos creados
  // Cerrar modales
  // Reset estado si es necesario
})
```

## Recursos Adicionales

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selectors](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)

## Comandos Útiles

```bash
# Ver versión de Playwright
npx playwright --version

# Actualizar Playwright
npm install -D @playwright/test@latest
npx playwright install

# Generar código de test (record mode)
npx playwright codegen http://localhost:3000

# Ejecutar solo tests que fallaron
npx playwright test --last-failed

# Ejecutar tests en paralelo (máximo 4 workers)
npx playwright test --workers=4

# Generar trace para debugging
npx playwright test --trace on

# Ver configuración
npx playwright show-config
```

---

**Última actualización:** Diciembre 2024  
**Soporte:** Ver README.md principal
