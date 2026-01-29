# 🏗️ Arquitectura API — CHRONOS INFINITY 2026

> **Documento de Referencia Técnica** Guía completa sobre cuándo usar API Routes vs Server Actions,
> formato de respuestas, y mejores prácticas.

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [API Routes vs Server Actions](#api-routes-vs-server-actions)
3. [Formato de Respuestas](#formato-de-respuestas)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Arquitectura de Cacheo](#arquitectura-de-cacheo)
6. [Manejo de Errores](#manejo-de-errores)
7. [Health Check](#health-check)
8. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Resumen Ejecutivo

CHRONOS usa una **arquitectura híbrida** que combina:

- **API Routes** (`/app/api/**/*.ts`) — Para operaciones de lectura, listados, exportación y
  endpoints públicos
- **Server Actions** (`app/_actions/**/*.ts`) — Para operaciones de escritura (CREATE, UPDATE,
  DELETE) desde componentes React

### Regla de Oro

```typescript
// ✅ CORRECTO: Usar API Route para GET
export async function GET() {
  /* ... */
}

// ✅ CORRECTO: Usar Server Action para POST/PUT/DELETE desde componentes
;("use server")
export async function crearVenta(data: CrearVentaInput) {
  /* ... */
}

// ❌ INCORRECTO: POST/PUT/DELETE en API Routes para uso interno
export async function POST() {
  /* ... */
} // Solo si es API pública externa
```

---

## 🔀 API Routes vs Server Actions

### Cuándo usar **API Routes**

| Caso de Uso          | Ejemplo                 | Endpoint                        |
| -------------------- | ----------------------- | ------------------------------- |
| **Lectura de datos** | Obtener lista de ventas | `GET /api/ventas`               |
| **Datos públicos**   | Dashboard público       | `GET /api/stats`                |
| **Exportación**      | Descargar CSV           | `GET /api/export/ventas`        |
| **Health check**     | Monitor de salud        | `GET /api/health`               |
| **Webhooks**         | Notificaciones externas | `POST /api/webhooks/payment`    |
| **Integraciones**    | APIs de terceros        | `POST /api/integrations/stripe` |

### Cuándo usar **Server Actions**

| Caso de Uso            | Ejemplo          | Archivo                                 |
| ---------------------- | ---------------- | --------------------------------------- |
| **Crear registros**    | Nueva venta      | `app/_actions/ventas/crear.ts`          |
| **Actualizar datos**   | Editar cliente   | `app/_actions/clientes/actualizar.ts`   |
| **Eliminar datos**     | Borrar OC        | `app/_actions/ordenes/eliminar.ts`      |
| **Procesos complejos** | Distribución GYA | `app/_actions/ventas/distribuir-gya.ts` |
| **Validaciones**       | Validar stock    | `app/_actions/almacen/validar-stock.ts` |

### ¿Por qué esta separación?

```typescript
// ❌ PROBLEMA: API Route para mutación interna
// app/api/ventas/route.ts
export async function POST(request: Request) {
  // 1. Más boilerplate (parse request, validar, etc.)
  // 2. Menos type-safety (JSON en lugar de tipos TS)
  // 3. Serialización innecesaria
  // 4. Más difícil de testear
}

// ✅ SOLUCIÓN: Server Action
// app/_actions/ventas/crear.ts
;("use server")
export async function crearVenta(input: CrearVentaInput) {
  // 1. Llamada directa desde componente
  // 2. Type-safety completo
  // 3. Sin serialización
  // 4. Tests más simples
}
```

---

## 📤 Formato de Respuestas

### Formato Estándar (API Routes)

Todas las API Routes deben retornar este formato:

```typescript
// lib/api-response.ts
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
    timestamp: string
  }
}

// Uso
export async function GET() {
  try {
    const ventas = await db.select().from(ventas)

    return NextResponse.json({
      success: true,
      data: ventas,
      meta: {
        total: ventas.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Error al obtener ventas",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    )
  }
}
```

### Formato Server Actions

```typescript
// Server Actions retornan objetos directos
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function crearVenta(input: CrearVentaInput): Promise<ActionResult<Venta>> {
  try {
    const venta = await db.insert(ventas).values(input).returning()
    return { success: true, data: venta[0] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
```

---

## 🌐 Endpoints Disponibles

### Core Endpoints

| Endpoint              | Método | Descripción              | Formato                       |
| --------------------- | ------ | ------------------------ | ----------------------------- |
| `/api/health`         | GET    | Health check del sistema | `HealthCheck`                 |
| `/api/bancos`         | GET    | Lista de los 7 bancos    | `ApiResponse<Banco[]>`        |
| `/api/clientes`       | GET    | Lista de clientes        | `ApiResponse<Cliente[]>`      |
| `/api/distribuidores` | GET    | Lista de distribuidores  | `ApiResponse<Distribuidor[]>` |
| `/api/ventas`         | GET    | Lista de ventas          | `ApiResponse<Venta[]>`        |
| `/api/ordenes`        | GET    | Órdenes de compra        | `ApiResponse<OrdenCompra[]>`  |
| `/api/movimientos`    | GET    | Movimientos bancarios    | `ApiResponse<Movimiento[]>`   |
| `/api/kpis`           | GET    | KPIs globales            | `ApiResponse<KpisGlobales>`   |

### Analytics & Insights

| Endpoint        | Método | Descripción             |
| --------------- | ------ | ----------------------- |
| `/api/stats`    | GET    | Estadísticas generales  |
| `/api/insights` | GET    | Insights de IA          |
| `/api/metrics`  | GET    | Métricas de performance |

### Export

| Endpoint               | Método | Descripción             |
| ---------------------- | ------ | ----------------------- |
| `/api/export/ventas`   | GET    | Exportar ventas a CSV   |
| `/api/export/clientes` | GET    | Exportar clientes a CSV |

---

## 💾 Arquitectura de Cacheo

### Estrategia por Endpoint

```typescript
// 🔴 NUNCA cachear (datos críticos en tiempo real)
export const dynamic = "force-dynamic"
export const revalidate = 0

// Aplicar en:
// - /api/health
// - /api/bancos
// - /api/movimientos

// 🟡 Cachear con revalidación corta (60 segundos)
export const dynamic = "force-dynamic"
export const revalidate = 60

// Aplicar en:
// - /api/ventas
// - /api/clientes
// - /api/ordenes

// 🟢 Cachear con revalidación larga (5 minutos)
export const revalidate = 300

// Aplicar en:
// - /api/stats
// - /api/insights (si no son en tiempo real)
```

### Headers de Cache

```typescript
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate", // Sin cache
    // O
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120", // Con cache
  },
})
```

---

## ⚠️ Manejo de Errores

### Códigos de Error Estándar

```typescript
export const ERROR_CODES = {
  // Database
  DATABASE_ERROR: "Error de base de datos",
  CONNECTION_FAILED: "No se pudo conectar a la BD",

  // Validación
  VALIDATION_ERROR: "Datos inválidos",
  MISSING_REQUIRED_FIELD: "Falta campo requerido",

  // Negocio
  INSUFFICIENT_STOCK: "Stock insuficiente",
  INVALID_BANK: "Banco inválido",
  CALCULATION_ERROR: "Error en cálculo GYA",

  // Auth
  UNAUTHORIZED: "No autorizado",
  FORBIDDEN: "Acceso denegado",

  // General
  INTERNAL_ERROR: "Error interno del servidor",
  NOT_FOUND: "Recurso no encontrado",
} as const
```

### Ejemplo de Manejo

```typescript
export async function GET(request: Request) {
  try {
    // Intentar operación
    const data = await db.select().from(ventas)

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "No se encontraron ventas",
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      meta: { total: data.length, timestamp: new Date().toISOString() },
    })
  } catch (error) {
    // Log del error (usar logger, no console.log)
    logger.error("Error en GET /api/ventas", error, { context: "VentasAPI" })

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Error al obtener ventas",
          details:
            process.env.NODE_ENV === "development"
              ? error instanceof Error
                ? error.message
                : String(error)
              : undefined,
        },
      },
      { status: 500 }
    )
  }
}
```

---

## 🏥 Health Check

### Endpoint de Salud

```bash
curl https://tu-app.vercel.app/api/health | jq
```

**Respuesta Healthy:**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T12:00:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "message": "Conectado (45ms)",
      "details": { "latency": 45 }
    },
    "bancos": {
      "status": "ok",
      "message": "7 bancos operacionales",
      "details": {
        "capitalTotal": 1500000,
        "bancos": [...]
      }
    },
    "tablas": {
      "status": "ok",
      "message": "Todas las tablas operacionales",
      "details": {
        "clientes": 150,
        "ventas": 2340,
        ...
      }
    },
    "performance": {
      "status": "ok",
      "message": "Performance normal (23ms)"
    }
  },
  "meta": {
    "version": "1.0.0",
    "environment": "production",
    "uptime": 123
  }
}
```

**Respuesta Degraded:**

Status HTTP: 200, pero `status: "degraded"` indica problemas no críticos.

**Respuesta Unhealthy:**

Status HTTP: 503, sistema no operacional.

---

## ✅ Mejores Prácticas

### 1. Logging

```typescript
// ❌ NUNCA
console.log("algo")

// ✅ SIEMPRE
import { logger } from "@/app/lib/utils/logger"
logger.info("Operación exitosa", { context: "API", endpoint: "/api/ventas" })
logger.error("Error crítico", error, { context: "API", endpoint: "/api/ventas" })
```

### 2. Validación de Entrada

```typescript
// ✅ Validar con Zod ANTES de usar datos
import { CrearVentaSchema } from "@/app/lib/schemas/ventas.schema"

export async function crearVenta(input: CrearVentaInput) {
  const validated = CrearVentaSchema.safeParse(input)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors.map((e) => e.message).join(", "),
    }
  }

  // Ahora usar validated.data de forma segura
  const venta = await db.insert(ventas).values(validated.data)
  return { success: true, data: venta }
}
```

### 3. Type Safety

```typescript
// ✅ Tipos explícitos siempre
export async function GET(): Promise<NextResponse<ApiResponse<Venta[]>>> {
  // ...
}

// ✅ Nunca usar 'any'
const data: unknown = await fetch(...)
if (isVenta(data)) { /* type guard */ }
```

### 4. Transacciones

```typescript
// ✅ Usar transacciones para operaciones múltiples
import { db } from "@/database"

await db.transaction(async (tx) => {
  // Crear venta
  const venta = await tx.insert(ventas).values(ventaData).returning()

  // Distribuir a bancos
  await tx.insert(movimientos).values([
    { bancoId: "boveda_monte", tipo: "ingreso", monto: distribucion.bovedaMonte },
    { bancoId: "flete_sur", tipo: "ingreso", monto: distribucion.fletes },
    { bancoId: "utilidades", tipo: "ingreso", monto: distribucion.utilidades },
  ])

  // Actualizar cliente
  await tx
    .update(clientes)
    .set({ deudaTotal: sql`${clientes.deudaTotal} + ${venta[0].total}` })
    .where(eq(clientes.id, venta[0].clienteId))
})
```

### 5. Performance

```typescript
// ❌ N+1 Queries
for (const venta of ventas) {
  const cliente = await db.select().from(clientes).where(eq(clientes.id, venta.clienteId))
}

// ✅ Query con JOIN
const ventasConCliente = await db.query.ventas.findMany({
  with: { cliente: true },
})
```

---

## 📊 Métricas y Monitoring

### Logs de Producción

Todos los endpoints deben loguear:

1. **Request recibido** (con params)
2. **Tiempo de ejecución**
3. **Resultado** (success/error)
4. **Errores** (stack trace completo)

```typescript
export async function GET(request: Request) {
  const startTime = Date.now()
  logger.info("GET /api/ventas iniciado", { context: "VentasAPI" })

  try {
    const data = await obtenerVentas()
    const duration = Date.now() - startTime

    logger.info("GET /api/ventas exitoso", {
      context: "VentasAPI",
      duration,
      count: data.length,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error("GET /api/ventas falló", error, {
      context: "VentasAPI",
      duration,
    })

    return NextResponse.json(
      {
        success: false,
        error: {
          /* ... */
        },
      },
      { status: 500 }
    )
  }
}
```

---

## 🔐 Seguridad

### Headers de Seguridad

```typescript
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
}

return NextResponse.json(data, { headers: securityHeaders })
```

### Autenticación

```typescript
// Para endpoints privados
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "No autorizado" },
      },
      { status: 401 }
    )
  }

  // Proceder con operación
}
```

---

## 📚 Referencias

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Turso](https://turso.tech/docs)

---

**Última actualización**: 15 de enero de 2026 **Versión del documento**: 1.0.0 **Mantenido por**: IY
SUPREME AGENT
