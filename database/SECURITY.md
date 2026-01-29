# 🔒 Seguridad de Base de Datos - CHRONOS SYSTEM

> Documentación de implementación de seguridad en Turso/Drizzle

## Resumen Ejecutivo

El sistema CHRONOS implementa seguridad en múltiples capas para proteger los datos financieros:

1. **Autenticación**: NextAuth.js con JWT
2. **Autorización**: Middleware de Next.js con roles
3. **Validación**: Schemas Zod en todas las operaciones
4. **Auditoría**: Registro inmutable de movimientos
5. **Queries seguras**: Drizzle ORM con prepared statements

---

## 🎭 Sistema de Roles

### Roles Disponibles

| Rol          | Permisos                                          | Casos de Uso            |
| ------------ | ------------------------------------------------- | ----------------------- |
| **admin**    | Acceso total, modificar configuración de bancos   | Director, CFO           |
| **operator** | Crear/editar ventas, OC, clientes, distribuidores | Contador, Operador      |
| **viewer**   | Solo lectura de dashboards y reportes             | Inversionista, Analista |

### Definición en Schema

```typescript
// database/schema.ts
export const usuarios = sqliteTable("usuarios", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  nombre: text("nombre").notNull(),
  role: text("role", {
    enum: ["admin", "operator", "viewer"],
  }).default("viewer"),
  // ...
})
```

---

## 🛡️ Middleware de Autenticación

El archivo `middleware.ts` implementa protección de rutas:

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")

  // Rutas públicas
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next()
  }

  // Verificar autenticación
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verificar rol para rutas admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const userRole = getUserRole(token) // Decodificar JWT
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## 🔐 Reglas de Seguridad por Colección

### Usuarios

```typescript
// ✅ Permitido: Lectura - Todos autenticados
// ✅ Permitido: Escritura - Admin o el propio usuario
// ❌ Prohibido: Modificar rol propio

async function getUserProfile(userId: string, requestingUserId: string) {
  // Solo puede ver su propio perfil o admin
  if (userId !== requestingUserId && !isAdmin(requestingUserId)) {
    throw new Error("No autorizado")
  }

  return await db.query.usuarios.findFirst({
    where: eq(usuarios.id, userId),
  })
}
```

### Clientes

```typescript
// ✅ Permitido: Lectura - Todos autenticados
// ✅ Permitido: Escritura - Admin y Operators
// ❌ Prohibido: Viewer crear/modificar

async function createCliente(data: InsertCliente, userId: string) {
  const user = await getUser(userId)

  if (user.role === "viewer") {
    throw new Error("No autorizado - Se requiere rol operator o admin")
  }

  // Validar con Zod
  const validated = crearClienteSchema.parse(data)

  return await db.insert(clientes).values({
    ...validated,
    createdBy: userId,
  })
}
```

### Ventas

```typescript
// ✅ Permitido: Lectura - Todos autenticados
// ✅ Permitido: Escritura - Admin y Operators
// ⚠️ Validación: Campos críticos (precio, cantidad, cliente)

async function createVenta(data: InsertVenta, userId: string) {
  const user = await getUser(userId)

  if (!["admin", "operator"].includes(user.role)) {
    throw new Error("No autorizado")
  }

  // Validación Zod
  const validated = crearVentaSchema.parse(data)

  // Validar cliente existe
  const cliente = await db.query.clientes.findFirst({
    where: eq(clientes.id, validated.clienteId),
  })

  if (!cliente) {
    throw new Error("Cliente no encontrado")
  }

  // Validar campos críticos
  if (validated.cantidad <= 0) {
    throw new Error("Cantidad debe ser mayor a 0")
  }

  if (validated.precioVentaUnidad <= 0) {
    throw new Error("Precio debe ser mayor a 0")
  }

  return await db.insert(ventas).values({
    ...validated,
    createdBy: userId,
    createdAt: sql`(unixepoch())`,
  })
}
```

### Movimientos (CRÍTICO - Inmutable)

```typescript
// ✅ Permitido: Lectura - Todos autenticados
// ✅ Permitido: Crear - Admin y Operators
// ❌ PROHIBIDO: Modificar o eliminar (auditoría)

async function createMovimiento(data: InsertMovimiento, userId: string) {
  const user = await getUser(userId)

  if (!["admin", "operator"].includes(user.role)) {
    throw new Error("No autorizado")
  }

  // Validación Zod
  const validated = crearMovimientoSchema.parse(data)

  // Los movimientos NO se pueden modificar después de crear
  return await db.insert(movimientos).values({
    ...validated,
    createdBy: userId,
    createdAt: sql`(unixepoch())`,
  })
}

// ❌ PROHIBIDO - No existe función updateMovimiento()
// ❌ PROHIBIDO - No existe función deleteMovimiento()
```

### Bancos (Configuración Crítica)

```typescript
// ✅ Permitido: Lectura - Todos autenticados
// ✅ Permitido: Escritura - Solo Admin
// ❌ PROHIBIDO: Eliminar bancos

async function updateBanco(id: BancoId, data: Partial<Banco>, userId: string) {
  const user = await getUser(userId)

  if (user.role !== "admin") {
    throw new Error("Solo administradores pueden modificar bancos")
  }

  // Prohibir modificar campos críticos
  const { id: _, capitalActual, historicoIngresos, historicoGastos, ...safeData } = data

  return await db
    .update(bancos)
    .set({
      ...safeData,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(bancos.id, id))
}

// ❌ PROHIBIDO - No se pueden eliminar bancos
async function deleteBanco() {
  throw new Error("Los bancos no se pueden eliminar")
}
```

---

## ✅ Validación con Zod

Todos los schemas están en `app/lib/schemas/`:

```typescript
// app/lib/schemas/ventas.schema.ts
import { z } from "zod"

export const crearVentaSchema = z
  .object({
    clienteId: z.string().min(1, "Cliente requerido"),
    cantidad: z.number().positive("Cantidad debe ser mayor a 0"),
    precioVentaUnidad: z.number().positive("Precio debe ser mayor a 0"),
    precioCompraUnidad: z.number().positive("Costo debe ser mayor a 0"),
    precioFlete: z.number().nonnegative("Flete no puede ser negativo"),
    fecha: z.date().or(z.string()),
    // ...
  })
  .refine((data) => data.precioVentaUnidad > data.precioCompraUnidad, {
    message: "Precio de venta debe ser mayor al costo",
  })
```

---

## 🚨 Queries Seguras con Drizzle

### ✅ CORRECTO - Prepared Statements

```typescript
// Drizzle siempre usa prepared statements
const clientes = await db.query.clientes.findMany({
  where: eq(clientes.nombre, userInput), // ✅ Seguro
})
```

### ❌ INCORRECTO - SQL Concatenado

```typescript
// ❌ NUNCA hacer esto
const query = `SELECT * FROM clientes WHERE nombre = '${userInput}'`
db.run(query) // Vulnerable a SQL injection
```

---

## 📊 Auditoría y Trazabilidad

### Campos de Auditoría

Todas las tablas críticas tienen:

```typescript
export const ventas = sqliteTable("ventas", {
  id: text("id").primaryKey(),
  // ... campos de negocio

  // 🔍 AUDITORÍA
  createdBy: text("created_by").references(() => usuarios.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
})
```

### Tablas Inmutables

Las siguientes colecciones son **SOLO INSERCIÓN** (no se pueden modificar ni eliminar):

- ✅ `movimientos` - Registro financiero completo
- ✅ `abonos` - Historial de pagos de clientes
- ✅ `pagosDistribuidor` - Historial de pagos a proveedores
- ✅ `entradaAlmacen` - Registro de entradas al inventario
- ✅ `salidaAlmacen` - Registro de salidas del inventario

---

## 🧪 Tests de Seguridad

### Test de Autenticación

```typescript
// __tests__/security/auth.test.ts
describe("Autenticación", () => {
  it("debe rechazar usuarios no autenticados", async () => {
    const response = await fetch("/api/ventas", {
      method: "GET",
      // Sin token
    })

    expect(response.status).toBe(401)
  })

  it("debe rechazar tokens inválidos", async () => {
    const response = await fetch("/api/ventas", {
      headers: { Authorization: "Bearer invalid-token" },
    })

    expect(response.status).toBe(401)
  })
})
```

### Test de Autorización por Rol

```typescript
// __tests__/security/roles.test.ts
describe("Autorización por Rol", () => {
  it("viewer no puede crear ventas", async () => {
    const viewerToken = await getTokenForRole("viewer")

    const response = await fetch("/api/ventas", {
      method: "POST",
      headers: { Authorization: `Bearer ${viewerToken}` },
      body: JSON.stringify({
        /* venta data */
      }),
    })

    expect(response.status).toBe(403)
  })

  it("operator puede crear ventas", async () => {
    const operatorToken = await getTokenForRole("operator")

    const response = await fetch("/api/ventas", {
      method: "POST",
      headers: { Authorization: `Bearer ${operatorToken}` },
      body: JSON.stringify({
        /* venta data */
      }),
    })

    expect(response.status).toBe(201)
  })

  it("solo admin puede modificar bancos", async () => {
    const operatorToken = await getTokenForRole("operator")

    const response = await fetch("/api/bancos/boveda_monte", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${operatorToken}` },
      body: JSON.stringify({ nombre: "Nuevo nombre" }),
    })

    expect(response.status).toBe(403)
  })
})
```

### Test de Validación

```typescript
// __tests__/security/validation.test.ts
describe("Validación de Datos", () => {
  it("debe rechazar venta con precio negativo", async () => {
    const token = await getTokenForRole("operator")

    const response = await fetch("/api/ventas", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        clienteId: "cliente-1",
        cantidad: 10,
        precioVentaUnidad: -100, // ❌ Inválido
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.errors).toContain("Precio debe ser mayor a 0")
  })
})
```

---

## 🔑 Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre validar con Zod** antes de insertar en DB
2. **Usar prepared statements** de Drizzle (automático)
3. **Verificar roles** en API routes y Server Actions
4. **Registrar cambios críticos** en auditoría
5. **Hash passwords** con bcrypt (min 12 rounds)
6. **Usar HTTPS** en producción
7. **Rate limiting** en endpoints públicos

### ❌ DON'T (No hacer)

1. ❌ Concatenar SQL con strings
2. ❌ Confiar en validación del cliente
3. ❌ Guardar passwords en texto plano
4. ❌ Exponer tokens en URLs
5. ❌ Modificar tablas inmutables (movimientos, abonos)
6. ❌ Permitir a viewers modificar datos
7. ❌ Usar `any` en TypeScript

---

## 📚 Referencias

- [Drizzle ORM Security](https://orm.drizzle.team/docs/sql)
- [NextAuth.js](https://next-auth.js.org/)
- [Zod Validation](https://zod.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 📝 Checklist de Seguridad

- [x] Middleware de autenticación implementado
- [x] Sistema de roles (admin/operator/viewer)
- [x] Validación Zod en todos los schemas
- [x] Prepared statements en queries
- [x] Tablas inmutables para auditoría
- [x] Campos createdBy/updatedAt
- [x] Password hashing con bcrypt
- [ ] Tests de seguridad (en progreso)
- [ ] Rate limiting en APIs
- [ ] Logs de auditoría centralizados

---

**Última actualización:** 2025-12-15  
**Versión:** 2.0
