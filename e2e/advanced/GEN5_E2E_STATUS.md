# 🧪 CHRONOS GEN5 2026 — Estado Tests E2E Avanzados

## ✅ OPTIMIZACIÓN COMPLETADA

Todos los tests E2E avanzados han sido actualizados para usar los componentes y selectores Gen5.

## 📁 Archivos Actualizados

### Utilidades Compartidas (NUEVO)

| Archivo              | Descripción                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `gen5-test-utils.ts` | Utilidades centralizadas Gen5: selectores, helpers, configuración |

### Tests Principales

| Archivo                             | Líneas | Estado  | Descripción                                |
| ----------------------------------- | ------ | ------- | ------------------------------------------ |
| `all-panels-buttons.spec.ts`        | ~850   | ✅ GEN5 | Test exhaustivo de botones en 10 paneles   |
| `distribucion-gya-completo.spec.ts` | ~600   | ✅ GEN5 | Tests de distribución GYA (3 bancos)       |
| `navegacion-completa.spec.ts`       | ~400   | ✅ GEN5 | Navegación KosmosHeader entre paneles      |
| `modales-crud-todos.spec.ts`        | ~743   | ✅ GEN5 | Tests de modales CRUD en todos los paneles |

### Tests de Métricas

| Archivo                        | Líneas | Estado  | Descripción                             |
| ------------------------------ | ------ | ------- | --------------------------------------- |
| `kpis-charts-datos.spec.ts`    | ~584   | ✅ GEN5 | KPIs, charts y visualización de datos   |
| `performance-metricas.spec.ts` | ~614   | ✅ GEN5 | Performance y Core Web Vitals           |
| `responsive-movil.spec.ts`     | ~489   | ✅ GEN5 | Tests responsive en múltiples viewports |

### Tests de Seguridad y Calidad

| Archivo                          | Líneas | Estado  | Descripción                      |
| -------------------------------- | ------ | ------- | -------------------------------- |
| `auth-permisos.spec.ts`          | ~527   | ✅ GEN5 | Autenticación y permisos por rol |
| `console-errors-capture.spec.ts` | ~514   | ✅ GEN5 | Captura de errores de consola    |
| `formulas-matematicas.spec.ts`   | ~559   | ✅ GEN5 | Fórmulas matemáticas del sistema |

### Tests de Funcionalidades

| Archivo                          | Líneas | Estado  | Descripción                         |
| -------------------------------- | ------ | ------- | ----------------------------------- |
| `persistencia-db-ui.spec.ts`     | ~482   | ✅ GEN5 | Ciclo completo Form → DB → UI       |
| `exportaciones-formatos.spec.ts` | ~589   | ✅ GEN5 | Exportaciones en múltiples formatos |

---

## 🔧 Cambios Clave Realizados

### 1. Utilidades Centralizadas (`gen5-test-utils.ts`)

```typescript
// Selectores Gen5 compartidos
export const GEN5_SELECTORS = {
  modal: '[role="dialog"], [class*="FormModal"], [class*="glass"][class*="modal"]',
  tabList: '[role="tablist"], [class*="GlassTabs"]',
  button: 'button[class*="glass"], button[class*="Glass"]',
  primaryButton: 'button:has-text("Nueva"), button:has-text("Crear")',
  input: 'input[class*="glass"], [class*="GlassInput"] input',
  table: 'table, [role="grid"], [class*="PremiumDataTable"]',
  // ... más selectores
}

// Configuración compartida
export const GEN5_CONFIG = {
  BASE_TIMEOUT: 25000,
  MODAL_TIMEOUT: 8000,
  ANIMATION_WAIT: 600,
  NAV_WAIT: 2500,
}

// Rutas de paneles Gen5
export const GEN5_ROUTES = {
  dashboard: "/dashboard",
  ventas: "/ventas",
  clientes: "/clientes",
  bancos: "/bancos",
  // ... 10 paneles
}

// Helpers compartidos
export async function openModal(page, triggers)
export async function closeModal(page)
export async function navigateToRoute(page, route)
export async function searchInPanel(page, text)
// ... más helpers
```

### 2. Timeouts Aumentados

- `test.setTimeout(45000)` - Para animaciones framer-motion Gen5
- `ANIMATION_WAIT: 600` - Espera estándar entre acciones

### 3. 10 Paneles Gen5 Soportados

1. Dashboard
2. Ventas
3. Clientes
4. Bancos
5. Distribuidores
6. Órdenes
7. Almacén
8. Gastos
9. Movimientos
10. IA

### 4. Selectores Actualizados para Componentes Gen5

- `GlassTabs` → `[role="tablist"], [class*="GlassTabs"]`
- `GlassInput` → `input[class*="glass"], [class*="GlassInput"] input`
- `GlassSelect` → `select[class*="glass"], [class*="GlassSelect"]`
- `GlassButton` → `button[class*="glass"], button[class*="Glass"]`
- `FormModal` → `[role="dialog"], [class*="FormModal"]`
- `PremiumDataTable` → `table, [role="grid"], [class*="PremiumDataTable"]`

---

## 🚀 Comandos de Ejecución

```bash
# Ejecutar todos los tests E2E avanzados
pnpm playwright test e2e/advanced/

# Ejecutar test específico
pnpm playwright test e2e/advanced/all-panels-buttons.spec.ts

# Ejecutar con UI
pnpm playwright test e2e/advanced/ --ui

# Ejecutar en modo headed
pnpm playwright test e2e/advanced/ --headed

# Ver reporte
pnpm playwright show-report
```

---

## 📊 Resumen de Cobertura

| Categoría        | Tests | Estado                          |
| ---------------- | ----- | ------------------------------- |
| Navegación       | ✅    | Todos los paneles Gen5          |
| Modales CRUD     | ✅    | FormModal con GlassInput/Select |
| Botones          | ✅    | 100+ botones en 10 paneles      |
| KPIs/Charts      | ✅    | GlassMetricCard y charts        |
| Performance      | ✅    | Thresholds ajustados para Gen5  |
| Responsive       | ✅    | 7 viewports, KosmosHeader       |
| Auth             | ✅    | 10 rutas protegidas             |
| Errores          | ✅    | Captura en 10 paneles           |
| Persistencia     | ✅    | Selectores Gen5 para CRUD       |
| Exportaciones    | ✅    | Rutas y botones Gen5            |
| Matemáticas      | ✅    | Lógica sagrada CHRONOS          |
| Distribución GYA | ✅    | 3 bancos automáticos            |

---

_Última actualización: Diciembre 2025_ _Generado por optimización E2E Gen5_
