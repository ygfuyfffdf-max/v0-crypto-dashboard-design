# 🎭 Tests E2E - CHRONOS 2026

Tests end-to-end exhaustivos que simulan exactamente cómo el usuario opera el sistema en la vida
real, verificando que toda la lógica de negocio funcione correctamente.

## 📋 Estructura de Tests

### Tests Implementados

#### 1. **venta-contado.spec.ts** - Venta al Contado

Verifica el flujo completo de una venta al contado con distribución automática a 3 bancos.

**Caso de Prueba:**

- 3 relojes a $8,000 c/u
- Costo: $5,000 c/u
- Flete: $200 c/u

**Distribución Esperada:**

- Bóveda Monte: $15,000 (5,000 × 3)
- Fletes: $600 (200 × 3)
- Utilidades: $8,400 ((8,000 - 5,000 - 200) × 3)

#### 2. **venta-credito.spec.ts** - Venta a Crédito con Abonos

Verifica el flujo de venta a crédito con abonos progresivos hasta liquidación.

**Caso de Prueba:**

- 2 relojes a $12,000 c/u
- Enganche: $5,000
- Deuda inicial: $19,000
- Abonos: $10,000 + $9,000

#### 3. **inventario.spec.ts** - Gestión de Inventario

Verifica el ciclo completo de gestión de stock.

**Flujo:**

- Captura stock inicial
- Registra entrada de 10 unidades
- Crea venta de 3 unidades
- Verifica reducción automática de stock

#### 4. **transferencias.spec.ts** - Transferencias entre Bancos

Verifica la transferencia de fondos entre bancos y actualización de saldos.

**Caso de Prueba:**

- Transferir $50,000 de Utilidades a Bóveda Monte
- Verificar disminución/incremento exacto
- Verificar registro en historial

#### 5. **ordenes.spec.ts** - Órdenes de Compra

Verifica el flujo completo de una orden de compra.

**Flujo:**

- Crear orden de 20 unidades a $5,000
- Marcar como recibida
- Verificar incremento en almacén
- Pagar a distribuidor

#### 6. **aria.spec.ts** - IA Conversacional

Verifica el funcionamiento de la IA conversacional ARIA.

**Pruebas:**

- Widget visible
- Comandos de navegación
- Consultas de información

#### 7. **componentes-3d.spec.ts** - Visualizaciones 3D

Verifica la carga y renderizado de componentes 3D/Spline.

**Componentes:**

- SoulOrbQuantum (dashboard)
- BankVault3D (bancos)
- Warehouse3D (inventario)
- QuantumLiquidVoid (fondo)

#### 8. **logica-gya.spec.ts** - Caso Matemático Crítico ⚠️

**TEST MÁS IMPORTANTE** - Valida la lógica matemática fundamental del sistema.

**Caso de Prueba Crítico:**

- 15 relojes
- Precio compra: $7,000
- Precio venta: $12,000
- Flete: $800

**Distribución Esperada (EXACTA):**

- Bóveda Monte: $105,000 (7,000 × 15)
- Fletes: $12,000 (800 × 15)
- Utilidades: $63,000 ((12,000 - 7,000 - 800) × 15)
- **TOTAL: $180,000** ← Debe sumar exactamente

## 🚀 Ejecución

### Ejecutar todos los tests

```bash
npm run test:e2e
```

### Modo UI interactivo

```bash
npm run test:e2e:ui
```

### Ejecutar test específico

```bash
npx playwright test venta-contado.spec.ts
npx playwright test logica-gya.spec.ts
```

### Ver reporte HTML

```bash
npx playwright show-report
```

### Debug mode

```bash
npx playwright test --debug
```

## 📊 Estructura de Archivos

```
e2e/
├── README.md                      # Este archivo
├── fixtures/
│   └── test-data.ts              # Datos de prueba centralizados
├── utils/
│   └── helpers.ts                # Funciones auxiliares reutilizables
├── venta-contado.spec.ts         # Test 1: Venta contado
├── venta-credito.spec.ts         # Test 2: Venta crédito + abonos
├── inventario.spec.ts            # Test 3: Gestión de inventario
├── transferencias.spec.ts        # Test 4: Transferencias bancarias
├── ordenes.spec.ts               # Test 5: Órdenes de compra
├── aria.spec.ts                  # Test 6: IA conversacional
├── componentes-3d.spec.ts        # Test 7: Visualizaciones 3D
└── logica-gya.spec.ts            # Test 8: Caso matemático crítico
```

## 🎯 Fixtures y Helpers

### Fixtures (`fixtures/test-data.ts`)

Contiene todos los datos de prueba centralizados:

- Casos de venta (contado, crédito, GYA)
- Datos de clientes y distribuidores
- Configuraciones de bancos
- Selectores comunes del DOM
- Timeouts y URLs

### Helpers (`utils/helpers.ts`)

Funciones auxiliares reutilizables:

- `navigateToPanel()` - Navegar entre paneles
- `waitForModal()` - Esperar modales
- `getBancoCapital()` - Obtener saldo de banco
- `calcularDistribucionGYA()` - Calcular distribución
- `takeTimestampedScreenshot()` - Screenshots con timestamp
- Y más...

## 📸 Screenshots y Videos

Los tests capturan automáticamente:

- **Screenshots**: En cada paso importante y en fallos
- **Videos**: Solo cuando un test falla
- **Traces**: En el primer reintento de un test fallido

Ubicación: `test-results/` y `playwright-report/`

## ⚙️ Configuración

La configuración de Playwright está en `playwright.config.ts`:

- Timeout global: 60 segundos
- Reintentos: 2 en CI, 1 en local
- Navegadores: Chrome (desktop + mobile)
- Servidor: Inicia automáticamente con `npm run dev`

## 🧪 Patrones de Test

### Estructura típica:

```typescript
test.describe("Módulo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await waitForPageLoad(page)
  })

  test("debe hacer X", async ({ page }) => {
    await test.step("Paso 1", async () => {
      // Acciones
      testLog("✅", "Paso completado")
    })

    await test.step("Paso 2", async () => {
      // Verificaciones
      expect(resultado).toBe(esperado)
    })
  })
})
```

### Logging:

Todos los tests usan `testLog()` para logging consistente:

```typescript
testLog("🎯", "Iniciando test")
testLog("✅", "Paso completado")
testLog("❌", "Error detectado")
testLog("💰", "Capital: $100,000")
```

## 🎨 Tests Especiales

### Test de Lógica GYA (Crítico)

El test más importante del sistema. Valida que la distribución matemática sea exacta:

```typescript
// Caso: 15 relojes
const esperado = {
  bovedaMonte: 105000, // 7,000 × 15
  fletes: 12000, // 800 × 15
  utilidades: 63000, // (12,000 - 7,000 - 800) × 15
  total: 180000, // Suma exacta
}
```

Si este test falla, **hay un error crítico en la lógica de negocio**.

## 🐛 Debugging

### Ver test en slow motion:

```bash
npx playwright test --headed --slow-mo=1000
```

### Inspector de Playwright:

```bash
npx playwright test --debug
```

### Trace viewer:

```bash
npx playwright show-trace trace.zip
```

## 📝 Agregar Nuevos Tests

1. Crear archivo en `e2e/nombre-test.spec.ts`
2. Importar fixtures y helpers:

```typescript
import { test, expect } from "@playwright/test"
import { SELECTORES } from "./fixtures/test-data"
import { waitForPageLoad, testLog } from "./utils/helpers"
```

3. Seguir la estructura de tests existentes
4. Usar `testLog()` para logging
5. Capturar screenshots en pasos clave

## 🚦 CI/CD

Los tests E2E se ejecutan automáticamente en CI cuando:

- Se hace push a main
- Se abre un Pull Request
- Se ejecuta workflow manual

Configuración CI en `.github/workflows/`

## 📚 Recursos

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)

## ✅ Checklist de Test Completo

Un test completo debe:

- [ ] Tener descripción clara del caso de prueba
- [ ] Usar fixtures para datos de prueba
- [ ] Usar helpers para acciones comunes
- [ ] Capturar estado inicial
- [ ] Ejecutar acción
- [ ] Verificar resultado esperado
- [ ] Tomar screenshots en pasos clave
- [ ] Manejar casos de error gracefully
- [ ] Usar `testLog()` para tracking
- [ ] Ser independiente (no depender de otros tests)

---

**Última actualización:** Diciembre 2024 **Versión:** 1.0.0
