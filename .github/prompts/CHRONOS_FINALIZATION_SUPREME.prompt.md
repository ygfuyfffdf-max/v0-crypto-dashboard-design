# 🏛️ CHRONOS INFINITY 2026 — PROMPT DE FINALIZACIÓN Y VERIFICACIÓN SUPREMA

## 📋 OBJETIVO

Este prompt guía la verificación exhaustiva y finalización del sistema CHRONOS para garantizar que esté 100% operacional, sin omisiones, con todas las conexiones, procesos y funcionalidades completamente integradas y funcionales.

---

## 🎯 RESUMEN EJECUTIVO DEL SISTEMA

**CHRONOS** es un sistema empresarial de gestión financiera premium con:
- **Dashboard visualizaciones Canvas 60fps** y 3D con Spline
- **Base de datos edge Turso** + Drizzle ORM
- **Lógica GYA** (Distribución automática a 3 bancos)
- **7 bancos/bóvedas financieras**
- **Sistema de IA integrado** con control total del dominio
- **+900 archivos TypeScript/TSX**
- **+1300 tests unitarios** + 40+ tests E2E

---

## 📊 ARQUITECTURA COMPLETA

### Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Framework** | Next.js 16 + React 19 | App Router + Server Actions |
| **Database** | Turso (LibSQL Edge) | Base de datos distribuida |
| **ORM** | Drizzle ORM | Type-safe queries |
| **Estado** | Zustand + React Query | UI State + Server State |
| **Validación** | Zod | Schema validation |
| **Estilos** | Tailwind CSS + shadcn/ui | Design system premium |
| **Testing** | Jest + Playwright | Unit + E2E tests |

### Estructura de Directorios Crítica

```
chronos/
├── app/
│   ├── _actions/              # 22+ Server Actions
│   │   ├── flujos-completos.ts    # ⭐ CRÍTICO: Ventas, OC, Abonos
│   │   ├── ai-domain-controller.ts # ⭐ CRÍTICO: Control IA
│   │   ├── bancos.ts              # Operaciones bancarias
│   │   ├── clientes.ts            # CRUD clientes
│   │   ├── ventas.ts              # CRUD ventas
│   │   └── ...
│   ├── _components/           # Componentes 2026
│   │   └── panels/
│   │       └── AIPanelSupreme.tsx # Panel IA principal
│   ├── lib/
│   │   ├── ai/                # Sistema IA
│   │   ├── store/             # Zustand stores
│   │   ├── schemas/           # Zod schemas
│   │   └── utils/
│   │       └── logger.ts      # Sistema logging
│   ├── _lib/utils/
│   │   └── gya-calculo.ts     # ⭐ FÓRMULAS GYA SAGRADAS
│   ├── api/                   # 31 Route Handlers
│   ├── types/                 # Tipos TypeScript
│   └── (dashboard)/           # Páginas dashboard
├── database/
│   ├── schema.ts              # ⭐ Schema completo (1670 líneas)
│   └── index.ts               # Cliente Drizzle
└── e2e/                       # Tests E2E
```

---

## 🧮 LÓGICA GYA — FÓRMULAS SAGRADAS

### Principio Fundamental (NUNCA MODIFICAR)

Cuando se registra una **venta**, el dinero se distribuye a **3 bancos**:

```typescript
// FÓRMULAS INMUTABLES
montoBovedaMonte = precioCompra × cantidad    // COSTO
montoFletes = precioFlete × cantidad          // TRANSPORTE
montoUtilidades = (precioVenta - precioCompra - precioFlete) × cantidad  // GANANCIA

// VERIFICACIÓN OBLIGATORIA
montoBovedaMonte + montoFletes + montoUtilidades === precioTotalVenta
```

### Ejemplo Numérico

```
Entrada:
- Precio venta: $10,000/u
- Precio compra: $6,300/u
- Flete: $500/u
- Cantidad: 10 unidades

Cálculos:
- Precio total: $100,000
- Bóveda Monte: $63,000 (costo)
- Fletes: $5,000 (transporte)
- Utilidades: $32,000 (ganancia neta)

Verificación: $63,000 + $5,000 + $32,000 = $100,000 ✅
```

### Reglas Inmutables

1. **Histórico SIEMPRE al 100%** independiente del estado de pago
2. **Capital proporcional** al porcentaje pagado
3. **NUNCA restar** del histórico
4. **NUNCA distribuir** a otros bancos desde ventas

---

## 🏦 7 BANCOS DEL SISTEMA

| ID | Nombre | Propósito | Recibe de GYA |
|----|--------|-----------|---------------|
| `boveda_monte` | Bóveda Monte | Capital principal | ✅ COSTO |
| `boveda_usa` | Bóveda USA | Capital USD | ❌ |
| `flete_sur` | Fletes | Costos transporte | ✅ FLETES |
| `utilidades` | Utilidades | Ganancias | ✅ GANANCIA |
| `azteca` | Azteca | Operativo | ❌ |
| `leftie` | Leftie | Operativo | ❌ |
| `profit` | Profit | Operativo | ❌ |

---

## ✅ CHECKLIST DE VERIFICACIÓN COMPLETA

### 1. BASE DE DATOS

```bash
# Ejecutar para verificar conexión y schema
pnpm db:push
pnpm db:studio
```

- [ ] Turso conectado correctamente
- [ ] Schema aplicado (12+ tablas)
- [ ] Relaciones definidas
- [ ] Índices creados
- [ ] Seed de bancos ejecutado

**Verificar en `database/schema.ts`:**
- [ ] Tabla `bancos` con 30+ campos de métricas
- [ ] Tabla `ventas` con campos GYA
- [ ] Tabla `clientes` con scoring
- [ ] Tabla `distribuidores` con métricas
- [ ] Tabla `ordenesCompra` con rotación
- [ ] Tabla `movimientos` unificada
- [ ] Tabla `almacen` con rentabilidad
- [ ] Tablas de auditoría (abonos, pagos, entradas, salidas)

### 2. SERVER ACTIONS

Verificar existencia y funcionalidad en `app/_actions/`:

- [ ] `flujos-completos.ts`:
  - [ ] `crearOrdenCompraCompleta()` - OC + Stock + Distribuidor
  - [ ] `crearVentaCompleta()` - Venta + GYA + Cliente + Stock
  - [ ] `abonarVentaCompleta()` - Abono proporcional a 3 bancos

- [ ] `bancos.ts`:
  - [ ] `getBancos()` - Obtener 7 bancos
  - [ ] `transferirEntreBancos()` - Transferencias
  - [ ] `registrarGasto()` / `registrarIngreso()`

- [ ] `clientes.ts`:
  - [ ] CRUD completo
  - [ ] Actualización de métricas

- [ ] `ventas.ts`:
  - [ ] CRUD completo
  - [ ] Integración con GYA

- [ ] `ai-domain-controller.ts`:
  - [ ] `handleAIRequest()` - Control total IA
  - [ ] Validaciones pre-submit
  - [ ] Operaciones CRUD vía IA

### 3. SISTEMA DE IA

Verificar en `app/lib/ai/` y `app/_components/panels/`:

- [ ] `AIPanelSupreme.tsx` - Panel flotante con orb 3D
- [ ] `ai-domain-controller.ts` - Server Action de IA
- [ ] Flujos conversacionales funcionales
- [ ] Detección de intención
- [ ] Validaciones automáticas
- [ ] Integración con datos reales (Turso)

**Modos de IA:**
- [ ] Chat - Conversación natural
- [ ] Análisis - Análisis de datos
- [ ] Predicciones - Proyecciones
- [ ] Insights - Oportunidades

### 4. COMPONENTES UI

Verificar en `app/_components/`:

- [ ] Header con navegación
- [ ] Sidebar colapsable
- [ ] Dashboard con widgets
- [ ] Modales CRUD funcionales
- [ ] Visualizaciones Canvas (60fps)
- [ ] AI Panel Supreme flotante

### 5. RUTAS Y NAVEGACIÓN

Verificar en `app/(dashboard)/`:

- [ ] `/dashboard` - Dashboard principal
- [ ] `/ventas` - Panel de ventas
- [ ] `/clientes` - Panel de clientes
- [ ] `/distribuidores` - Panel de distribuidores
- [ ] `/ordenes` - Órdenes de compra
- [ ] `/bancos` - Panel bancario
- [ ] `/almacen` - Inventario
- [ ] `/ia` - Panel de IA
- [ ] `/movimientos` - Historial
- [ ] `/reportes` - Reportes

### 6. APIS REST

Verificar en `app/api/`:

- [ ] `/api/ventas` - CRUD ventas
- [ ] `/api/clientes` - CRUD clientes
- [ ] `/api/bancos` - Operaciones bancarias
- [ ] `/api/ordenes` - Órdenes de compra
- [ ] `/api/movimientos` - Historial
- [ ] `/api/almacen` - Inventario
- [ ] `/api/kpis` - Métricas globales
- [ ] `/api/ai/*` - Endpoints IA

### 7. VALIDACIONES ZOD

Verificar en `app/lib/schemas/`:

- [ ] `flujos-completos.schema.ts` - OC y Ventas
- [ ] `ventas.schema.ts` - Validación ventas
- [ ] `clientes.schema.ts` - Validación clientes
- [ ] `ordenes-compra.schema.ts` - Validación OC

### 8. ESTADO GLOBAL

Verificar en `app/lib/store/`:

- [ ] `useAppStore.ts` - Estado UI principal
- [ ] Sincronización con Turso
- [ ] Persistencia con Zustand persist

### 9. TESTING

```bash
# Ejecutar tests
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests
pnpm type-check     # TypeScript
```

- [ ] Unit tests pasando (1300+)
- [ ] E2E tests pasando (40+)
- [ ] TypeScript sin errores
- [ ] Linting sin errores

---

## 🔧 COMANDOS DE VERIFICACIÓN

```bash
# 1. Verificar TypeScript
pnpm type-check

# 2. Verificar Linting
pnpm lint

# 3. Verificar Tests
pnpm test

# 4. Verificar E2E
pnpm test:e2e

# 5. Verificar Base de Datos
pnpm db:push
pnpm db:studio

# 6. Iniciar desarrollo
pnpm dev

# 7. Build producción
pnpm build
```

---

## 🚨 PUNTOS CRÍTICOS A VERIFICAR

### 1. Distribución GYA

```typescript
// Verificar en flujos-completos.ts
// La distribución DEBE llamar a calcularDistribucionGYA()
const distribucion = calcularDistribucionGYA(
  precioVenta,
  precioCompra,
  precioFlete,
  cantidad
);

// Verificar que se actualicen los 3 bancos
await tx.update(bancos)
  .set({ historicoIngresos: sql`... + ${distribucion.montoBovedaMonte}` })
  .where(eq(bancos.id, 'boveda_monte'));

await tx.update(bancos)
  .set({ historicoIngresos: sql`... + ${distribucion.montoFletes}` })
  .where(eq(bancos.id, 'flete_sur'));

await tx.update(bancos)
  .set({ historicoIngresos: sql`... + ${distribucion.montoUtilidades}` })
  .where(eq(bancos.id, 'utilidades'));
```

### 2. Transacciones Atómicas

```typescript
// Todas las operaciones DEBEN usar db.transaction()
await db.transaction(async (tx) => {
  // Operación 1
  // Operación 2
  // ...
  // Si cualquiera falla, TODAS se revierten
});
```

### 3. Revalidación de Rutas

```typescript
// Después de cada operación CRUD
revalidatePath('/ventas');
revalidatePath('/clientes');
revalidatePath('/bancos');
revalidatePath('/dashboard');
revalidatePath('/');
```

### 4. Logging Obligatorio

```typescript
// SIEMPRE usar logger, NUNCA console.log
import { logger } from '@/app/lib/utils/logger';

logger.info('Mensaje', { context: 'Componente', data: {...} });
logger.error('Error', error, { context: 'Servicio' });
```

### 5. Validación Pre-Submit

```typescript
// SIEMPRE validar con Zod antes de insertar
const result = Schema.safeParse(data);
if (!result.success) {
  return { error: result.error.message };
}
```

---

## 🎯 FLUJOS DE NEGOCIO COMPLETOS

### Flujo 1: Orden de Compra

```
1. Crear/Obtener Distribuidor
2. Crear/Obtener Producto en Almacén
3. Calcular totales (subtotal + flete + IVA)
4. Crear Orden de Compra
5. Actualizar Stock (entrada)
6. Registrar Entrada en historial
7. Actualizar deuda Distribuidor
8. Si hay pago: Reducir capital banco + Registrar movimiento
9. Revalidar rutas
```

### Flujo 2: Venta Completa

```
1. Verificar Stock disponible
2. Crear/Obtener Cliente
3. Calcular Distribución GYA
4. Crear Venta
5. Reducir Stock (salida)
6. Registrar Salida en historial
7. Actualizar OC origen (si hay trazabilidad)
8. Distribuir a 3 bancos:
   a. Bóveda Monte: histórico + capital proporcional
   b. Fletes: histórico + capital proporcional
   c. Utilidades: histórico + capital proporcional
9. Registrar movimientos
10. Actualizar deuda Cliente
11. Revalidar rutas
```

### Flujo 3: Abono a Venta

```
1. Validar venta existe y no está completa
2. Validar monto <= montoRestante
3. Calcular proporción del abono
4. Calcular incremento de capital por banco
5. Actualizar Venta (montoPagado, montoRestante, estadoPago)
6. Actualizar Cliente (saldoPendiente, totalAbonos)
7. Distribuir incremento a 3 bancos
8. Registrar movimientos
9. Registrar abono en historial
10. Revalidar rutas
```

---

## 📝 PROMPT PARA VERIFICACIÓN FINAL

Usa este prompt para verificar el sistema:

```
Ejecuta una verificación exhaustiva del sistema CHRONOS:

1. CONEXIÓN DB:
   - Ejecutar: pnpm db:push
   - Verificar logs de conexión Turso
   - Abrir: pnpm db:studio

2. TYPESCRIPT:
   - Ejecutar: pnpm type-check
   - Verificar 0 errores

3. LINTING:
   - Ejecutar: pnpm lint
   - Verificar 0 errores

4. TESTS:
   - Ejecutar: pnpm test
   - Verificar todos pasan

5. E2E:
   - Ejecutar: pnpm test:e2e
   - Verificar flujos críticos:
     * Venta al contado con GYA
     * Venta a crédito con abonos
     * Orden de compra completa
     * Transferencia entre bancos

6. SERVIDOR:
   - Ejecutar: pnpm dev
   - Navegar a cada panel
   - Verificar carga de datos
   - Probar AI Panel Supreme

7. BUILD:
   - Ejecutar: pnpm build
   - Verificar build exitoso
```

---

## ✅ ESTADO FINAL ESPERADO

Cuando el sistema esté 100% operacional:

- [ ] **TypeScript**: 0 errores
- [ ] **Lint**: 0 errores
- [ ] **Tests Unit**: 100% pasando
- [ ] **Tests E2E**: 100% pasando
- [ ] **Build**: Exitoso
- [ ] **DB**: Conectada y sincronizada
- [ ] **GYA**: Distribución correcta verificada
- [ ] **IA**: Panel funcional con CRUD completo
- [ ] **UI**: Todos los paneles renderizando
- [ ] **APIs**: Todos los endpoints respondiendo

---

**VERSIÓN**: 2026-SUPREME
**ÚLTIMA ACTUALIZACIÓN**: Enero 2026
**ESTADO**: VERIFICACIÓN PENDIENTE
