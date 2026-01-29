# 📚 CHRONOS INFINITY 2026 — DOCUMENTACIÓN COMPLETA DE APIs

> **Documento Técnico Exhaustivo** — Sistema Financiero Enterprise con Distribución GYA Automática

---

## 📖 ÍNDICE

1. [Arquitectura General](#1-arquitectura-general)
2. [APIs REST (Route Handlers)](#2-apis-rest-route-handlers)
3. [Server Actions (Flujos Atómicos)](#3-server-actions-flujos-atómicos)
4. [Fórmulas GYA (Core Financiero)](#4-fórmulas-gya-core-financiero)
5. [Sistema de Triggers Automáticos](#5-sistema-de-triggers-automáticos)
6. [Schemas de Validación Zod](#6-schemas-de-validación-zod)
7. [Sistema de Cache y Rate Limiting](#7-sistema-de-cache-y-rate-limiting)
8. [Zustand Store (Estado Global)](#8-zustand-store-estado-global)
9. [Database Schema (Drizzle/Turso)](#9-database-schema-drizzleturso)

---

## 1. ARQUITECTURA GENERAL

### Stack Tecnológico

| Capa           | Tecnología                  | Propósito                            |
| -------------- | --------------------------- | ------------------------------------ |
| **Framework**  | Next.js 16 + App Router     | SSR/SSG + Server Components          |
| **Runtime**    | React 19                    | Server Actions + Concurrent Features |
| **Database**   | Turso (LibSQL edge)         | Base de datos SQLite distribuida     |
| **ORM**        | Drizzle ORM                 | Type-safe queries                    |
| **Estado**     | Zustand + Persist           | Estado global + IndexedDB            |
| **Validación** | Zod                         | Schema validation                    |
| **Estilos**    | Tailwind CSS v4 + shadcn/ui | Design system premium                |

### Flujo de Datos Principal

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │  React 19    │──▶│  Zustand     │◀─▶│  Server      │    │
│  │  Components  │   │  Store       │   │  Actions     │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
                      Server Action / API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Next.js)                        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │ Route        │   │ Validators   │   │ Business     │    │
│  │ Handlers     │◀─▶│ (Zod)        │◀─▶│ Logic        │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
                         Drizzle ORM
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    TURSO DATABASE                            │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │ Entidades    │   │ Transacciones│   │ Históricos   │    │
│  │ (CRUD)       │   │ (Atomicidad) │   │ (Inmutables) │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. APIs REST (Route Handlers)

### 2.1 Endpoints de Ventas

#### `GET /api/ventas`

Obtiene todas las ventas con trazabilidad completa.

**Response:**

```typescript
interface VentaResponse {
  id: string
  clienteId: string
  productoId: string | null
  ocId: string | null
  fecha: Date
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  precioTotalVenta: number
  montoPagado: number
  montoRestante: number
  estadoPago: "completo" | "parcial" | "pendiente"
  // Distribución GYA
  montoBovedaMonte: number
  montoFletes: number
  montoUtilidades: number
  // Trazabilidad
  clienteNombre: string
  productoNombre: string | null
  ocNumero: string | null
}
```

#### `POST /api/ventas`

Crea una nueva venta con distribución GYA automática.

**Request Body:**

```typescript
interface CrearVentaRequest {
  clienteId: string
  productoId?: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad?: number
  precioFlete?: number
  montoPagado?: number
  observaciones?: string
  ocRelacionada: string
}
```

**Response:**

```typescript
interface CrearVentaResponse {
  success: true
  venta: Venta
  distribucion: {
    bovedaMonte: number
    fletes: number
    utilidades: number
  }
}
```

---

### 2.2 Endpoints de Clientes

#### `GET /api/clientes`

Obtiene todos los clientes ordenados por nombre.

#### `POST /api/clientes`

Crea un nuevo cliente.

```typescript
interface CrearClienteRequest {
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  rfc?: string
  limiteCredito?: number
}
```

#### `PUT /api/clientes`

Actualiza un cliente existente.

#### `DELETE /api/clientes/[id]`

Elimina un cliente (soft delete recomendado).

---

### 2.3 Endpoints de Bancos

#### `GET /api/bancos`

Obtiene los 7 bancos con capital actual.

```typescript
// 7 Bancos del Sistema
type BancoId =
  | "boveda_monte" // Capital principal (recibe COSTO)
  | "boveda_usa" // Bóveda USD
  | "flete_sur" // Recibe FLETES
  | "utilidades" // Recibe GANANCIA
  | "azteca" // Banco operativo
  | "leftie" // Banco operativo
  | "profit" // Banco operativo
```

#### `PUT /api/bancos`

Realiza operaciones sobre un banco.

```typescript
interface OperacionBancoRequest {
  id: BancoId
  operacion: "ingreso" | "gasto" | "transferencia"
  monto: number
  concepto: string
  bancoDestinoId?: BancoId // Para transferencias
  referencia?: string
}
```

---

### 2.4 Endpoints de Órdenes de Compra

#### `GET /api/ordenes`

Obtiene todas las órdenes de compra con información del distribuidor.

#### `POST /api/ordenes`

Crea una nueva orden de compra.

#### `GET /api/ordenes/[id]`

Obtiene detalle de una OC específica.

---

### 2.5 Endpoints de Almacén

#### `GET /api/almacen`

Obtiene todos los productos del inventario.

#### `POST /api/almacen/ajuste`

Realiza ajuste de inventario.

#### `POST /api/almacen/sync-stock`

Sincroniza stock de todas las OC.

---

### 2.6 Endpoints de Movimientos

#### `GET /api/movimientos`

Obtiene movimientos financieros con filtros.

```typescript
// Query Params
interface MovimientosQuery {
  bancoId?: BancoId
  tipo?: "ingreso" | "gasto" | "transferencia_entrada" | "transferencia_salida"
  fechaInicio?: string
  fechaFin?: string
  limit?: number
  offset?: number
}
```

---

## 3. SERVER ACTIONS (Flujos Atómicos)

### 3.1 crearOrdenCompraCompleta

Crea una OC con todos los efectos colaterales garantizando atomicidad.

**Ubicación:** `app/_actions/flujos-completos.ts`

```typescript
export async function crearOrdenCompraCompleta(
  input: OrdenCompraCompletaInput
): Promise<ActionResult<OrdenCompletaResponse>>
```

**Flujo Completo:**

1. ✅ Validar input con Zod
2. ✅ Crear distribuidor si es nuevo
3. ✅ Crear producto en almacén si es nuevo
4. ✅ Registrar orden de compra
5. ✅ Actualizar stock del almacén (entrada)
6. ✅ Registrar entrada en historial
7. ✅ Actualizar deuda con distribuidor
8. ✅ Si hay pago inicial, reduce capital del banco
9. ✅ Ejecutar triggers automáticos
10. ✅ Revalidar cache

**Input Schema:**

```typescript
const OrdenCompraCompletaSchema = z.object({
  // Distribuidor existente o nuevo
  distribuidorId: z.string().optional(),
  distribuidorNombre: z.string().optional(),
  distribuidorTelefono: z.string().optional(),
  distribuidorEmail: z.string().email().optional().or(z.literal("")),

  // Producto
  productoId: z.string().optional(),
  productoNombre: z.string().optional(),
  productoDescripcion: z.string().optional(),

  // Datos de la orden
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().positive(),
  fleteUnitario: z.number().min(0).default(0),
  iva: z.number().min(0).default(0),

  // Pago inicial
  montoPagoInicial: z.number().min(0).default(0),
  bancoOrigenId: z.string().optional(),

  // Metadata
  numeroOrden: z.string().optional(),
  observaciones: z.string().optional(),
})
```

---

### 3.2 crearVentaCompleta

Crea una venta con distribución GYA automática a 3 bancos.

```typescript
export async function crearVentaCompleta(
  input: VentaCompletaInput
): Promise<ActionResult<VentaCompletaResponse>>
```

**Flujo Completo:**

1. ✅ Validar input con Zod
2. ✅ Crear cliente si es nuevo
3. ✅ Validar stock disponible
4. ✅ Calcular distribución GYA
5. ✅ Registrar venta
6. ✅ Actualizar stock del almacén (salida)
7. ✅ Ejecutar distribución GYA a 3 bancos:
   - `boveda_monte` ← precioCompra × cantidad
   - `flete_sur` ← precioFlete × cantidad
   - `utilidades` ← (precioVenta - precioCompra - precioFlete) × cantidad
8. ✅ Actualizar deuda del cliente
9. ✅ Ejecutar triggers automáticos
10. ✅ Revalidar cache

**Response:**

```typescript
interface VentaCompletaResponse {
  ventaId: string
  clienteId: string
  productoId: string
  precioTotalVenta: number
  clienteNuevo: boolean
  distribucion: {
    montoBovedaMonte: number
    montoFletes: number
    montoUtilidades: number
    capitalDistribuido: number
    historicoRegistrado: number
  }
  salidaAlmacenId: string
}
```

---

### 3.3 registrarAbonoVenta

Registra un abono con distribución proporcional a los 3 bancos.

```typescript
export async function registrarAbonoVenta(
  ventaId: string,
  monto: number,
  concepto?: string
): Promise<
  ActionResult<{
    nuevoMontoPagado: number
    nuevoEstado: string
    capitalDistribuido: number
  }>
>
```

**Lógica de Distribución Proporcional:**

```typescript
// Si el cliente abona $42,000 de una venta de $100,000:
const proporcion = 42000 / 100000 // = 0.42 (42%)

// Cada banco recibe su porcentaje proporcional:
incrementoBovedaMonte = montoBovedaMonte × 0.42
incrementoFletes = montoFletes × 0.42
incrementoUtilidades = montoUtilidades × 0.42
```

---

### 3.4 transferirEntreBancos

Realiza transferencia entre dos bancos del sistema.

**Ubicación:** `app/_actions/bancos.ts`

```typescript
export async function transferirEntreBancos(formData: FormData)
```

**Flujo:**

1. Validar monto y bancos
2. Verificar capital suficiente en origen
3. Reducir capital banco origen
4. Aumentar capital banco destino
5. Registrar movimientos de entrada/salida
6. Actualizar históricos

---

## 4. FÓRMULAS GYA (Core Financiero)

### 4.1 Distribución GYA Base

**Ubicación:** `app/lib/formulas.ts` y `app/_lib/gya/distribucion-gya.ts`

```typescript
/**
 * FÓRMULAS SAGRADAS GYA (NUNCA MODIFICAR)
 *
 * El cliente paga: precioVenta × cantidad
 * El flete es COSTO INTERNO, NO se cobra adicional
 */
export function calcularDistribucionGYA(datos: DatosVentaCalculo): DistribucionGYA {
  const { cantidad, precioVenta, precioCompra, precioFlete = 500 } = datos

  // 1. BÓVEDA MONTE = Precio Compra × Cantidad (COSTO)
  const bovedaMonte = precioCompra * cantidad

  // 2. FLETES = Precio Flete × Cantidad (TRANSPORTE)
  const fletes = precioFlete * cantidad

  // 3. UTILIDADES = (Venta - Compra - Flete) × Cantidad (GANANCIA NETA)
  const utilidades = (precioVenta - precioCompra - precioFlete) * cantidad

  // 4. Total = Lo que paga el cliente
  const total = bovedaMonte + fletes + utilidades
  // total === precioVenta × cantidad ✓

  return { bovedaMonte, fletes, utilidades, total }
}
```

### 4.2 Ejemplo Numérico Completo

```typescript
// Datos de entrada
const venta = {
  cantidad: 10,
  precioVenta: 10000,    // Precio al cliente
  precioCompra: 6300,    // Costo del distribuidor
  precioFlete: 500       // Flete interno
}

// DISTRIBUCIÓN GYA:
const resultado = {
  bovedaMonte: 6300 × 10 = 63000,  // → banco boveda_monte
  fletes: 500 × 10 = 5000,          // → banco flete_sur
  utilidades: (10000 - 6300 - 500) × 10 = 32000, // → banco utilidades
  total: 100000                      // Lo que paga el cliente
}

// VERIFICACIÓN:
// 63000 + 5000 + 32000 = 100000 ✓
// 10000 × 10 = 100000 ✓
```

### 4.3 Reglas de Capital

```typescript
// REGLAS INMUTABLES:

// 1. Histórico NUNCA disminuye
historicoIngresos += monto  // Solo suma
historicoGastos += monto    // Solo suma

// 2. Capital es DINÁMICO
capitalActual = historicoIngresos - historicoGastos

// 3. Distribución proporcional al pago
if (estadoPago === 'completo') {
  capitalDistribuido = 100% del total
} else if (estadoPago === 'parcial') {
  capitalDistribuido = (montoPagado / precioTotalVenta) × total
} else {
  capitalDistribuido = 0 // Pendiente: solo histórico
}
```

---

## 5. SISTEMA DE TRIGGERS AUTOMÁTICOS

**Ubicación:** `app/_actions/triggers.ts`

### 5.1 Triggers Disponibles

| Trigger                          | Cuándo se Ejecuta      | Qué Hace                                     |
| -------------------------------- | ---------------------- | -------------------------------------------- |
| `actualizarMetricasCliente`      | Post-venta, Post-abono | Recalcula scoring, categoría, frecuencia     |
| `actualizarMetricasDistribuidor` | Post-OC, Post-pago     | Recalcula stock, rentabilidad, rotación      |
| `actualizarMetricasOC`           | Post-venta             | Recalcula stock vendido, margen, estado      |
| `actualizarMetricasProducto`     | Post-venta, Post-OC    | Recalcula stock, ventas, ganancia            |
| `actualizarMetricasBanco`        | Post-operación         | Recalcula flujo, tendencias, scoring         |
| `triggerPostVentaCompleto`       | Después de venta       | Orquesta todos los triggers relacionados     |
| `triggerPostOC`                  | Después de OC          | Orquesta triggers de distribuidor y producto |
| `triggerPostAbono`               | Después de abono       | Actualiza cliente y bancos                   |

### 5.2 Ejemplo de Trigger

```typescript
export async function actualizarMetricasCliente(clienteId: string): Promise<void> {
  // Obtener todas las ventas del cliente
  const ventasCliente = await db.select().from(ventas)
    .where(eq(ventas.clienteId, clienteId))

  // Calcular métricas
  const totalCompras = ventasCliente.reduce((sum, v) => sum + v.precioTotalVenta, 0)
  const totalPagado = ventasCliente.reduce((sum, v) => sum + v.montoPagado, 0)
  const saldoPendiente = totalCompras - totalPagado
  const scoreCredito = calcularScoreCredito({ ... })
  const categoria = determinarCategoria({ ... })

  // Actualizar cliente
  await db.update(clientes).set({
    totalCompras,
    totalPagado,
    saldoPendiente,
    scoreCredito,
    categoria,
    updatedAt: new Date()
  }).where(eq(clientes.id, clienteId))
}
```

---

## 6. SCHEMAS DE VALIDACIÓN ZOD

**Ubicación:** `app/lib/schemas/`

### 6.1 Schemas de Ventas

```typescript
// ventas.schema.ts

export const MontoSchema = z
  .number()
  .positive("El monto debe ser mayor a 0")
  .multipleOf(0.01, "Máximo 2 decimales")

export const CantidadSchema = z.number().int("Debe ser entero").positive("Mayor a 0")

export const BancoIdSchema = z.enum([
  "boveda_monte",
  "boveda_usa",
  "utilidades",
  "flete_sur",
  "azteca",
  "leftie",
  "profit",
])

export const EstadoPagoSchema = z.enum(["completo", "parcial", "pendiente"])

export const CrearVentaSchema = z
  .object({
    fecha: z.string().datetime().or(z.date()),
    cliente: z.string().min(1).max(100),
    producto: z.string().min(1).max(100),
    cantidad: CantidadSchema,
    precioVentaUnidad: MontoSchema,
    precioCompraUnidad: MontoSchema,
    precioFlete: z.number().min(0),
    precioTotalVenta: MontoSchema,
    montoPagado: z.number().min(0),
    montoRestante: z.number().min(0),
    estadoPago: EstadoPagoSchema,
    distribucionBancos: z.object({
      bovedaMonte: MontoSchema.or(z.literal(0)),
      fletes: MontoSchema.or(z.literal(0)),
      utilidades: MontoSchema.or(z.literal(0)),
    }),
  })
  .refine((data) => data.precioVentaUnidad > data.precioCompraUnidad, {
    message: "Precio venta debe ser mayor a costo",
  })
  .refine((data) => data.montoPagado + data.montoRestante === data.precioTotalVenta, {
    message: "Suma de pagado + restante debe igualar total",
  })
```

### 6.2 Schemas de Órdenes de Compra

```typescript
// ordenes-compra.schema.ts

export const EstadoOrdenSchema = z.enum(["pendiente", "parcial", "completo", "cancelada"])

export const CrearOrdenCompraSchema = z.object({
  distribuidorId: z.string().min(1),
  productoId: z.string().optional(),
  cantidad: CantidadSchema,
  precioUnitario: MontoSchema,
  fleteUnitario: z.number().min(0).default(0),
  iva: z.number().min(0).default(0),
  montoPagoInicial: z.number().min(0).default(0),
  bancoOrigenId: BancoIdSchema.optional(),
  observaciones: z.string().max(500).optional(),
})
```

---

## 7. SISTEMA DE CACHE Y RATE LIMITING

### 7.1 Cache Layer

**Ubicación:** `app/lib/cache/index.ts`

```typescript
// TTL Configurables
export const CACHE_TTL = {
  SHORT: 30, // 30 seg - datos muy dinámicos
  MEDIUM: 60 * 5, // 5 min - métricas dashboard
  LONG: 60 * 30, // 30 min - listas de entidades
  VERY_LONG: 60 * 60, // 1 hora - configuración
}

// Keys de Cache
export const CACHE_KEYS = {
  BANCOS_ALL: "bancos:all",
  CLIENTES: "clientes:all",
  VENTAS: "ventas:all",
  ORDENES: "ordenes:all",
  DASHBOARD_STATS: "dashboard:stats",
}

// Uso
const resultado = await getCached(CACHE_KEYS.CLIENTES, async () => db.select().from(clientes), {
  ttl: CACHE_TTL.MEDIUM,
  staleWhileRevalidate: true,
})
```

### 7.2 Rate Limiting

**Ubicación:** `app/lib/rate-limit/index.ts`

```typescript
export const RATE_LIMITS = {
  default: { requests: 100, windowMs: 60_000 }, // 100/min
  read: { requests: 200, windowMs: 60_000 }, // 200/min
  write: { requests: 50, windowMs: 60_000 }, // 50/min
  auth: { requests: 10, windowMs: 60_000 }, // 10/min
  ai: { requests: 20, windowMs: 60_000 }, // 20/min
  export: { requests: 5, windowMs: 60_000 }, // 5/min
}

// Uso en Route Handler
export async function GET(request: NextRequest) {
  const rateLimitResult = await applyRateLimit(request, "read")
  if (rateLimitResult) return rateLimitResult
  // ...
}
```

---

## 8. ZUSTAND STORE (Estado Global)

**Ubicación:** `app/lib/store/index.ts`

### 8.1 Estructura del Store

```typescript
interface ChronosState {
  // === DATOS ===
  bancos: Banco[]
  clientes: Cliente[]
  distribuidores: Distribuidor[]
  ventas: Venta[]
  ordenesCompra: OrdenCompra[]
  productos: Producto[]
  movimientos: Movimiento[]

  // === UI STATE ===
  currentPanel: PanelId
  sidebarOpen: boolean
  theme: "dark" | "light"

  // === ACCIONES ===
  crearVenta: (input: CrearVentaInput) => Promise<Venta>
  crearCliente: (input: CrearClienteInput) => Promise<Cliente>
  crearOrdenCompra: (input: CrearOCInput) => Promise<OrdenCompra>
  registrarAbono: (ventaId: string, monto: number) => Promise<void>
  transferirEntreBancos: (origen: BancoId, destino: BancoId, monto: number) => Promise<void>

  // === SINCRONIZACIÓN ===
  syncFromServer: () => Promise<void>
  triggerDataRefresh: () => void
}
```

### 8.2 Persistencia IndexedDB

```typescript
const useChronosStore = create<ChronosState>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial y acciones...
      }),
      {
        name: "chronos-store",
        storage: createJSONStorage(() => indexedDBStorage),
        partialize: (state) => ({
          // Solo persistir datos esenciales
          bancos: state.bancos,
          clientes: state.clientes,
          theme: state.theme,
        }),
      }
    )
  )
)
```

---

## 9. DATABASE SCHEMA (Drizzle/Turso)

**Ubicación:** `database/schema.ts`

### 9.1 Tablas Principales

```typescript
// CLIENTES (31+ registros)
export const clientes = sqliteTable("clientes", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email"),
  telefono: text("telefono"),
  direccion: text("direccion"),
  rfc: text("rfc"),

  // Historial de compras
  totalCompras: real("total_compras").default(0),
  numeroVentas: integer("numero_ventas").default(0),
  promedioCompra: real("promedio_compra").default(0),
  ultimaCompra: integer("ultima_compra", { mode: "timestamp" }),

  // Pagos y deudas
  totalPagado: real("total_pagado").default(0),
  saldoPendiente: real("saldo_pendiente").default(0),

  // Scoring
  scoreCredito: integer("score_credito").default(50),
  categoria: text("categoria", {
    enum: ["VIP", "frecuente", "ocasional", "nuevo", "inactivo", "moroso"],
  }).default("nuevo"),

  // Estado
  estado: text("estado", { enum: ["activo", "inactivo", "suspendido"] }).default("activo"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
})

// BANCOS (7 bancos sagrados)
export const bancos = sqliteTable("bancos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  tipo: text("tipo", {
    enum: ["operativo", "inversion", "ahorro", "ganancia", "flete"],
  }).notNull(),

  // Capital dinámico
  capitalActual: real("capital_actual").default(0).notNull(),
  capitalMinimo: real("capital_minimo").default(0),

  // Histórico INMUTABLE
  historicoIngresos: real("historico_ingresos").default(0).notNull(),
  historicoGastos: real("historico_gastos").default(0).notNull(),

  // Flujo temporal
  ingresosHoy: real("ingresos_hoy").default(0),
  gastosHoy: real("gastos_hoy").default(0),
  ingresosMes: real("ingresos_mes").default(0),
  gastosMes: real("gastos_mes").default(0),

  // Tendencias y scoring
  tendenciaCapital: text("tendencia_capital", {
    enum: ["subiendo", "estable", "bajando"],
  }).default("estable"),
  scoreTotal: integer("score_total").default(50),
  estadoSalud: text("estado_salud", {
    enum: ["excelente", "bueno", "regular", "critico"],
  }).default("bueno"),

  // Visual
  color: text("color").notNull(),
  icono: text("icono"),
  orden: integer("orden").default(0),
  activo: integer("activo", { mode: "boolean" }).default(true),
})

// VENTAS
export const ventas = sqliteTable("ventas", {
  id: text("id").primaryKey(),
  clienteId: text("cliente_id")
    .notNull()
    .references(() => clientes.id),
  productoId: text("producto_id").references(() => almacen.id),
  ocId: text("oc_id").references(() => ordenesCompra.id),
  fecha: integer("fecha", { mode: "timestamp" }).notNull(),

  // Cantidades y precios
  cantidad: integer("cantidad").notNull(),
  precioVentaUnidad: real("precio_venta_unidad").notNull(),
  precioCompraUnidad: real("precio_compra_unidad").notNull(),
  precioFlete: real("precio_flete").default(0),
  precioTotalVenta: real("precio_total_venta").notNull(),

  // Estado de pago
  montoPagado: real("monto_pagado").default(0),
  montoRestante: real("monto_restante").notNull(),
  estadoPago: text("estado_pago", {
    enum: ["pendiente", "parcial", "completo"],
  }).default("pendiente"),

  // Distribución GYA (Histórico 100%)
  montoBovedaMonte: real("monto_boveda_monte").default(0),
  montoFletes: real("monto_fletes").default(0),
  montoUtilidades: real("monto_utilidades").default(0),

  // Capital distribuido (Proporcional al pago)
  capitalBovedaMonte: real("capital_boveda_monte").default(0),
  capitalFletes: real("capital_fletes").default(0),
  capitalUtilidades: real("capital_utilidades").default(0),

  // Rentabilidad
  gananciaTotal: real("ganancia_total").default(0),
  margenBruto: real("margen_bruto").default(0),

  // Trazabilidad
  origenLotes: text("origen_lotes"), // JSON de OCs

  // Auditoría
  metodoPago: text("metodo_pago", {
    enum: ["efectivo", "transferencia", "crypto", "cheque", "credito"],
  }),
  observaciones: text("observaciones"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
})
```

### 9.2 Relaciones Drizzle

```typescript
// Relaciones de Ventas
export const ventasRelations = relations(ventas, ({ one }) => ({
  cliente: one(clientes, {
    fields: [ventas.clienteId],
    references: [clientes.id],
  }),
  producto: one(almacen, {
    fields: [ventas.productoId],
    references: [almacen.id],
  }),
  ordenCompra: one(ordenesCompra, {
    fields: [ventas.ocId],
    references: [ordenesCompra.id],
  }),
}))

// Relaciones de Movimientos
export const movimientosRelations = relations(movimientos, ({ one }) => ({
  banco: one(bancos, {
    fields: [movimientos.bancoId],
    references: [bancos.id],
  }),
  venta: one(ventas, {
    fields: [movimientos.ventaId],
    references: [ventas.id],
  }),
  cliente: one(clientes, {
    fields: [movimientos.clienteId],
    references: [clientes.id],
  }),
}))
```

---

## 🎯 RESUMEN DE ENDPOINTS

| Método | Endpoint                 | Descripción              |
| ------ | ------------------------ | ------------------------ |
| GET    | `/api/ventas`            | Listar todas las ventas  |
| POST   | `/api/ventas`            | Crear nueva venta        |
| GET    | `/api/ventas/[id]`       | Obtener venta específica |
| PUT    | `/api/ventas/[id]`       | Actualizar venta         |
| DELETE | `/api/ventas/[id]`       | Eliminar venta           |
| GET    | `/api/clientes`          | Listar clientes          |
| POST   | `/api/clientes`          | Crear cliente            |
| PUT    | `/api/clientes`          | Actualizar cliente       |
| GET    | `/api/bancos`            | Listar 7 bancos          |
| PUT    | `/api/bancos`            | Operación en banco       |
| GET    | `/api/ordenes`           | Listar órdenes de compra |
| POST   | `/api/ordenes`           | Crear OC                 |
| GET    | `/api/almacen`           | Listar productos         |
| POST   | `/api/almacen/ajuste`    | Ajuste de inventario     |
| GET    | `/api/movimientos`       | Listar movimientos       |
| GET    | `/api/dashboard/resumen` | KPIs del dashboard       |
| GET    | `/api/kpis`              | Métricas generales       |

---

## 📝 NOTAS FINALES

### Convenciones de Código

- Usar `logger` de `@/app/lib/utils/logger` en lugar de `console.log`
- Validar SIEMPRE con Zod antes de insertar en DB
- TypeScript strict mode: NO usar `any`
- Idioma: Código en inglés, comentarios/mensajes en español

### Seguridad

- Queries parametrizadas con Drizzle (previene SQL injection)
- Rate limiting en todos los endpoints
- Validación de inputs con Zod
- No hardcodear credenciales

---

_Documentación generada automáticamente — CHRONOS INFINITY 2026_
