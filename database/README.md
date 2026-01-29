# 🗄️ Database - CHRONOS SYSTEM

> Turso (LibSQL) con Drizzle ORM - Edge Database Ultra-Rápida

## 📁 Estructura de Archivos

```
database/
├── index.ts                          # Cliente Drizzle + conexión Turso
├── schema.ts                         # Schema completo (852 líneas)
├── migrate.ts                        # Script de migraciones
├── seed-bancos.ts                    # Seed inicial de bancos
├── verify-movimientos-migration.ts   # Verificar migración
├── SECURITY.md                       # Guía de seguridad (455 líneas)
├── MIGRATION_STATUS.md               # Estado de migración (239 líneas)
└── README.md                         # Este archivo
```

---

## 🚀 Quick Start

### 1. Configurar Variables de Entorno

```bash
# .env.local
TURSO_DATABASE_URL=libsql://[your-db].turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
```

### 2. Instalar Dependencias

```bash
npm install @libsql/client drizzle-orm
npm install -D drizzle-kit
```

### 3. Generar y Aplicar Migraciones

```bash
# Generar migración desde schema
npm run db:generate

# Aplicar migraciones a Turso
npm run db:push

# Ver datos en Drizzle Studio
npm run db:studio
```

---

## 📊 Schema de Base de Datos

### Tablas Principales (7)

| Tabla            | Propósito                                    | Registros Típicos |
| ---------------- | -------------------------------------------- | ----------------- |
| `usuarios`       | Usuarios del sistema (admin/operator/viewer) | 5-20              |
| `clientes`       | Clientes con métricas completas              | 64+               |
| `distribuidores` | Proveedores con scoring                      | 14+               |
| `ventas`         | Transacciones de venta + GYA                 | 193+              |
| `ordenes_compra` | Lotes de producto con trazabilidad           | 300+              |
| `bancos`         | 7 bancos del sistema                         | 7                 |
| `movimientos`    | **Registro unificado de transacciones**      | Miles             |

### Tablas de Auditoría (5)

| Tabla                | Propósito                        | Inmutable |
| -------------------- | -------------------------------- | --------- |
| `abonos`             | Historial de pagos de clientes   | ✅        |
| `pagos_distribuidor` | Historial de pagos a proveedores | ✅        |
| `entrada_almacen`    | Entradas al inventario           | ✅        |
| `salida_almacen`     | Salidas del inventario           | ✅        |
| `kpis_globales`      | Snapshots diarios del sistema    | ✅        |

### Tabla de Inventario

| Tabla     | Propósito                      |
| --------- | ------------------------------ |
| `almacen` | Inventario actual de productos |

---

## 🔐 Seguridad

Ver documentación completa en [`SECURITY.md`](./SECURITY.md).

### Resumen de Permisos

| Rol          | Lectura | Escritura      | Config | Usuarios |
| ------------ | ------- | -------------- | ------ | -------- |
| **viewer**   | ✅ Todo | ❌             | ❌     | ❌       |
| **operator** | ✅ Todo | ✅ Operaciones | ❌     | ❌       |
| **admin**    | ✅ Todo | ✅ Todo        | ✅     | ✅       |

### Tablas Inmutables

Las siguientes tablas son **solo inserción** (no se pueden modificar ni eliminar):

- ✅ `movimientos` - Registro financiero completo
- ✅ `abonos` - Pagos de clientes
- ✅ `pagos_distribuidor` - Pagos a proveedores
- ✅ `entrada_almacen` - Entradas al inventario
- ✅ `salida_almacen` - Salidas del inventario

**Razón:** Auditoría y cumplimiento legal.

---

## 📈 Fórmulas de Negocio

### Capital de Banco

```typescript
capitalActual = historicoIngresos - historicoGastos
```

- `historicoIngresos`: Suma acumulativa (solo incrementa)
- `historicoGastos`: Suma acumulativa (solo incrementa)
- `capitalActual`: Calculado dinámicamente

### Distribución GYA (Venta)

```typescript
// Fórmula correcta de distribución
montoBovedaMonte = precioCompraUnidad × cantidad    // COSTO
montoFletes = precioFlete × cantidad                 // FLETE
montoUtilidades = (precioVenta - precioCompra - flete) × cantidad  // GANANCIA
```

### Pago Parcial (Proporcional)

```typescript
proporcion = montoPagado / precioTotalVenta

// Distribuir proporcionalmente
capitalBovedaMonte = montoBovedaMonte × proporcion
capitalFletes = montoFletes × proporcion
capitalUtilidades = montoUtilidades × proporcion
```

---

## 🔄 Migración de Firebase

Ver estado completo en [`MIGRATION_STATUS.md`](./MIGRATION_STATUS.md).

### Antes (Firebase)

```
21 colecciones fragmentadas:
- boveda_monte_ingresos
- boveda_usa_ingresos
- profit_ingresos
- ... (18 más)
```

### Ahora (Turso)

```
1 tabla unificada:
- movimientos (todos los tipos)
```

### Verificar Migración

```bash
npx tsx database/verify-movimientos-migration.ts
```

Este script verifica:

- ✅ Tabla `movimientos` existe con schema correcto
- ✅ Tipos de movimiento válidos
- ✅ Integridad referencial con bancos
- ✅ No existen colecciones fragmentadas
- ✅ Índices configurados correctamente
- 📊 Genera reporte de movimientos

---

## 🛠️ Scripts de Database

### Comandos npm/pnpm

```bash
# Migraciones
pnpm db:generate      # Generar migración desde schema.ts
pnpm db:push          # Aplicar schema a Turso
pnpm db:migrate       # Ejecutar migraciones pendientes

# Visualización
pnpm db:studio        # Abrir Drizzle Studio (UI)

# Verificación
npx tsx database/verify-movimientos-migration.ts

# Seed
npx tsx database/seed-bancos.ts
```

### Scripts en package.json

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:migrate": "tsx database/migrate.ts"
  }
}
```

---

## 📝 Uso del ORM

### Queries Básicas

```typescript
import { db } from "@/database"
import { ventas, clientes } from "@/database/schema"
import { eq, desc, and } from "drizzle-orm"

// SELECT con relaciones
const data = await db.query.ventas.findMany({
  with: { cliente: true },
  where: eq(ventas.estadoPago, "pendiente"),
  orderBy: desc(ventas.fecha),
  limit: 10,
})

// INSERT
await db.insert(ventas).values({
  clienteId: "cliente-1",
  cantidad: 10,
  precioVentaUnidad: 100,
  // ...
})

// UPDATE
await db.update(ventas).set({ estadoPago: "completo" }).where(eq(ventas.id, "venta-123"))

// DELETE
await db.delete(ventas).where(eq(ventas.id, "venta-123"))
```

### Queries Avanzadas

```typescript
// JOIN manual
const result = await db
  .select({
    venta: ventas,
    cliente: clientes,
  })
  .from(ventas)
  .leftJoin(clientes, eq(ventas.clienteId, clientes.id))
  .where(and(eq(ventas.estadoPago, "pendiente"), gte(ventas.montoRestante, 1000)))
  .orderBy(desc(ventas.fecha))

// Agregaciones
const totales = await db
  .select({
    totalVentas: sum(ventas.precioTotalVenta),
    totalGanancia: sum(ventas.gananciaTotal),
    count: count(),
  })
  .from(ventas)
  .where(eq(ventas.estadoPago, "completo"))
```

---

## 🔍 Índices

Los siguientes índices están definidos en el schema:

### Tablas con Índices

| Tabla                | Índices                                    |
| -------------------- | ------------------------------------------ |
| `usuarios`           | email                                      |
| `clientes`           | nombre, estado, categoria, scoreTotal      |
| `distribuidores`     | nombre, categoria, scoreTotal              |
| `ventas`             | clienteId, fecha, estadoPago, esMoroso     |
| `ordenes_compra`     | distribuidorId, fecha, estado, estadoStock |
| `movimientos`        | bancoId, tipo, fecha, referencia           |
| `abonos`             | ventaId, clienteId, fecha                  |
| `pagos_distribuidor` | ordenCompraId, distribuidorId, fecha       |

---

## 📊 Performance

### Turso Edge

- **Latencia:** < 50ms (réplicas automáticas en edge)
- **Reads:** Ilimitados (gratis)
- **Writes:** ~50k/segundo
- **Conexiones:** ~1000 concurrentes
- **Límite DB:** 9GB gratis

### Optimizaciones

1. **Índices:** En campos frecuentemente consultados
2. **Prepared Statements:** Automático con Drizzle
3. **Connection Pooling:** Manejado por Turso
4. **Edge Caching:** Réplicas geográficas

---

## 🧪 Testing

### Tests de Integración

```typescript
// __tests__/integration/database.test.ts
import { db } from "@/database"
import { ventas } from "@/database/schema"

describe("Database", () => {
  it("debe crear venta", async () => {
    const [result] = await db
      .insert(ventas)
      .values({
        // ...
      })
      .returning()

    expect(result.id).toBeDefined()
  })
})
```

### Mock para Tests

```typescript
// jest.setup.ts
import { createClient } from "@libsql/client"

jest.mock("@/database", () => ({
  db: createClient({
    url: ":memory:", // SQLite en memoria
  }),
}))
```

---

## 📚 Referencias

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Turso Docs](https://docs.turso.tech/)
- [LibSQL](https://github.com/libsql/libsql)
- [Schema Original](./schema.ts)
- [Guía de Seguridad](./SECURITY.md)
- [Estado de Migración](./MIGRATION_STATUS.md)

---

## 🐛 Troubleshooting

### Error: "no such table"

```bash
# Aplicar schema a DB
pnpm db:push
```

### Error: "column does not exist"

```bash
# Regenerar y aplicar migraciones
pnpm db:generate
pnpm db:push
```

### Lentitud en Queries

1. Verificar índices en `schema.ts`
2. Usar `.explain()` para análisis:
   ```typescript
   const query = db.select().from(ventas)
   console.log(query.toSQL())
   ```
3. Limitar resultados con `.limit()`

### Error de Conexión

1. Verificar `TURSO_DATABASE_URL` en `.env.local`
2. Verificar `TURSO_AUTH_TOKEN` válido
3. Comprobar conectividad:
   ```bash
   curl $TURSO_DATABASE_URL
   ```

---

**Última actualización:** 2025-12-15  
**Versión:** 2.0 (Turso/Drizzle)
