# CHRONOS System - Copilot Instructions

> Sistema empresarial de gestión financiera con dashboard premium, visualizaciones Canvas y Turso +
> Drizzle. 📋 **Toolset completo**: `.vscode/chronos-toolset.json`

## 🤖 MCP Servers Disponibles (10 Optimizados)

| Servidor              | Descripción                  | Tools Principales                                      |
| --------------------- | ---------------------------- | ------------------------------------------------------ |
| `filesystem`          | Operaciones de archivos      | read_file, write_file, search_files, directory_tree    |
| `memory`              | Persistencia de conocimiento | create_entities, read_graph, search_nodes              |
| `fetch`               | HTTP requests                | fetch                                                  |
| `github`              | Integración GitHub           | create_issue, create_pull_request, search_code         |
| `sequential-thinking` | Razonamiento O3-level        | sequentialthinking                                     |
| `time`                | Operaciones temporales       | get_current_time, convert_time                         |
| `context7`            | Documentación de bibliotecas | resolve-library-id, get-library-docs                   |
| `sqlite`              | Base de datos Turso          | read_query, write_query, list_tables                   |
| `playwright`          | E2E & Browser automation     | browser_navigate, browser_screenshot, browser_click    |
| `serena`              | Code Intelligence            | find_symbol, get_symbols_overview, replace_symbol_body |
| `markitdown`          | Conversión documentos        | convert_to_markdown                                    |

## Arquitectura del Proyecto

### Stack Tecnológico

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Estilos**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand (`app/lib/store/useAppStore.ts`) + React Query
- **Database**: Turso (LibSQL edge) + Drizzle ORM
- **3D/Visualizaciones**: Spline + Canvas API (8 componentes en `app/components/visualizations/`)
- **Testing**: Jest + Playwright (E2E en `e2e/`)

### Estructura de Directorios Clave

```
app/
├── components/
│   ├── panels/          # 15 paneles Bento* (BentoDashboard, BentoVentas, etc.)
│   ├── modals/          # Modales CRUD con patrón *ModalSmart.tsx
│   ├── visualizations/  # 8 Canvas components (60fps animations)
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom hooks (useDrizzle, useAuth, etc.)
├── lib/
│   ├── store/           # useAppStore.ts (Zustand)
│   ├── schemas/         # Validación Zod (ventas.schema.ts)
│   └── utils/           # logger.ts (usar SIEMPRE en lugar de console.log)
├── types/               # index.ts contiene TODOS los tipos del dominio
database/
├── index.ts             # Cliente Drizzle + Turso
├── schema.ts            # Schema Drizzle (tablas, relaciones)
├── migrate.ts           # Script de migraciones
└── seed-bancos.ts       # Seed inicial
```

### Modelo de Datos (Turso/Drizzle)

7 bancos/bóvedas: `boveda_monte`, `boveda_usa`, `profit`, `leftie`, `azteca`, `flete_sur`,
`utilidades` Colecciones principales: `ventas`, `clientes`, `distribuidores`, `ordenes_compra`,
`movimientos`, `almacen` Ver tipos completos en `app/types/index.ts` (BancoId, Venta, Cliente,
OrdenCompra, etc.)

## Lógica de Negocio Crítica

### Distribución Automática de Ventas (3 Bancos)

Cuando se registra una venta, el dinero se distribuye automáticamente:

```typescript
// Datos de entrada
const precioVentaUnidad = 10000 // Precio VENTA al cliente
const precioCompraUnidad = 6300 // Precio COMPRA (costo distribuidor)
const precioFlete = 500 // Flete por unidad
const cantidad = 10

// DISTRIBUCIÓN CORRECTA:
const montoBovedaMonte = precioCompraUnidad * cantidad // 63,000 (COSTO)
const montoFletes = precioFlete * cantidad // 5,000
const montoUtilidades = (precioVentaUnidad - precioCompraUnidad - precioFlete) * cantidad // 32,000 (GANANCIA NETA)
```

### Estados de Pago

- **Completo**: 100% distribuido a los 3 bancos
- **Parcial**: Distribución proporcional (`proporcion = montoPagado / precioTotalVenta`)
- **Pendiente**: Solo se registra en histórico, NO afecta capital actual

### Fórmulas de Capital Bancario

```typescript
capitalActual = historicoIngresos - historicoGastos // Dinámico
// historicoIngresos y historicoGastos son acumulativos fijos, NUNCA disminuyen
```

## Convenciones Críticas

### Idioma

- Respuestas, comentarios y mensajes de error: **Español**
- Commits: Español con conventional commits (`feat:`, `fix:`, `docs:`)

### Logging (OBLIGATORIO)

```typescript
// ❌ PROHIBIDO: console.log
// ✅ CORRECTO: usar logger de app/lib/utils/logger.ts
import { logger } from '@/app/lib/utils/logger'
logger.info('Mensaje', { context: 'Componente', data: {...} })
logger.error('Error', error, { context: 'Servicio' })
```

### Turso + Drizzle ORM

```typescript
// Usar Drizzle para todas las operaciones de base de datos
import { db } from "@/database"
import { ventas, clientes } from "@/database/schema"
import { eq, desc, and } from "drizzle-orm"

// SELECT con relaciones
const data = await db.query.ventas.findMany({
  with: { cliente: true },
  where: eq(ventas.estado, "activa"),
  orderBy: desc(ventas.fecha),
})

// INSERT
await db.insert(ventas).values({ ...nuevaVenta })

// UPDATE
await db.update(ventas).set({ estado: "pagada" }).where(eq(ventas.id, id))

// DELETE
await db.delete(ventas).where(eq(ventas.id, id))
```

### Validación con Zod

```typescript
// Usar schemas de app/lib/schemas/ para validar datos antes de insertar en Turso
import { CrearVentaSchema, validarVenta } from "@/app/lib/schemas/ventas.schema"
const result = validarVenta(formData)
if (!result.success) {
  /* manejar errores */
}
```

### Estado Global (Zustand)

```typescript
import { useAppStore } from "@/app/lib/store/useAppStore"
const { currentPanel, setCurrentPanel, bancos, triggerDataRefresh } = useAppStore()
```

## Seguridad (Tolerancia Cero)

### Database Security (Turso)

- SIEMPRE usar queries parametrizadas con Drizzle (previene SQL injection)
- NUNCA concatenar strings en queries SQL
- Validar inputs con Zod ANTES de insertar en DB

### Credenciales

- NUNCA hardcodear API keys - usar `.env.local`
- Alertar: "🔒 CREDENCIALES DETECTADAS" si se encuentran keys reales

### TypeScript

- PROHIBIDO: `any`, `@ts-ignore`, `@ts-expect-error`
- ALTERNATIVA: `unknown` + type guards

## Comandos de Desarrollo

```bash
pnpm dev              # Desarrollo (puerto 3000)
pnpm build            # Build producción
pnpm lint             # ESLint
pnpm type-check       # Verificar tipos sin compilar
pnpm test             # Jest tests
pnpm test:e2e         # Playwright E2E
pnpm db:generate      # Generar migraciones Drizzle
pnpm db:push          # Push schema a Turso
pnpm db:studio        # Abrir Drizzle Studio
pnpm cleanup          # Limpiar proyecto
```

## Base de Datos (Turso + Drizzle)

Scripts en `database/` para gestionar la base de datos:

```bash
pnpm db:generate      # Generar migraciones desde schema
pnpm db:push          # Aplicar schema a Turso
pnpm db:migrate       # Ejecutar migraciones
pnpm db:studio        # UI visual de Drizzle
pnpm db:seed          # Seed inicial de datos
```

Schema en `database/schema.ts`, cliente en `database/index.ts`

## Patrones del Proyecto

### Componentes Panel (Bento\*)

Todos siguen estructura: datos de Turso/Drizzle → estado local → renderizado con visualización
Canvas

```typescript
// Ejemplo: BentoVentas.tsx
import { db } from "@/database"
import { ventas } from "@/database/schema"
const data = await db.query.ventas.findMany()
```

### Modales CRUD (\*ModalSmart)

Patrón: Form con react-hook-form + Zod validation + Drizzle insert/update

```typescript
// Ejemplo: CreateVentaModalSmart.tsx
const form = useForm<CrearVentaInput>({ resolver: zodResolver(CrearVentaSchema) })
```

### Visualizaciones Canvas

8 componentes con animaciones 60fps, cleanup obligatorio:

```typescript
useEffect(() => {
  const animationId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(animationId)
}, [])
```

### Componentes Spline 3D

Cargar con `@splinetool/react-spline`, archivos en raíz (`*.spline`, `*.splinecode`):

```typescript
import Spline from "@splinetool/react-spline"
;<Spline scene="url-o-archivo.splinecode" />
```

## Alertas de Seguridad

Cuando detectes código peligroso, advertir:

- `⚠️ RIESGO DE SEGURIDAD`: Reglas Firestore permisivas, credenciales expuestas
- `⚠️ ALERTA TYPESCRIPT`: Uso de `any` o supresión de errores
- `⚠️ MEMORY LEAK`: useEffect sin cleanup en listeners

## 🎨 Diseño Web Premium - Guía de Estilo

### Filosofía de Diseño CHRONOS

El diseño debe ser **elegante, moderno, premium y satisfactorio visualmente**. Seguimos estos
principios:

1. **Glassmorphism**: Usar `backdrop-blur`, bordes sutiles `border-white/10`, fondos
   semi-transparentes
2. **Gradientes**: Preferir gradientes suaves violeta-índigo-fucsia para acentos
3. **Animaciones**: Micro-interacciones en hover, transiciones fluidas 300-500ms
4. **Espaciado**: Generoso, usando múltiplos de 4 (p-4, p-6, p-8)
5. **Sombras**: Glows para elementos destacados, shadows sutiles para profundidad

### Paleta de Colores Preferida

```typescript
// Acentos principales
violet: "violet-500/600" // Primario
indigo: "indigo-500/600" // Secundario
fuchsia: "fuchsia-500" // Destacados
pink: "pink-500" // Alertas suaves

// Fondos
dark: "gray-900/950" // Fondo principal
surface: "gray-800/900" // Superficies elevadas
glass: "white/5 backdrop-blur-xl" // Glassmorphism
```

### Snippets Disponibles para Diseño

| Prefijo      | Descripción                   |
| ------------ | ----------------------------- |
| `glass`      | Card con efecto glassmorphism |
| `gradtext`   | Texto con gradiente           |
| `btnani`     | Botón animado premium         |
| `hero`       | Sección hero con efectos      |
| `bento`      | Item de grid bento            |
| `glow`       | Container con efecto glow     |
| `shimmer`    | Loading skeleton              |
| `morphbg`    | Fondo animado con blobs       |
| `gridbg`     | Fondo con patrón de grid      |
| `cardstack`  | Card con efecto apilado       |
| `inputfloat` | Input con label flotante      |
| `counter`    | Contador animado              |
| `parallax`   | Sección con parallax          |
| `stats`      | Grid de estadísticas          |

### Animaciones Tailwind Disponibles

```css
animate-blob       /* Morfing orgánico */
animate-gradient   /* Gradiente en movimiento */
animate-glow       /* Efecto glow pulsante */
animate-morph      /* Transformación de bordes */
animate-spotlight  /* Efecto spotlight */
animate-float      /* Flotación suave */
animate-wiggle     /* Movimiento wiggle */
```

### Ejemplos de Código Recomendados

**Card Premium:**

```tsx
<div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/10">
  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
  {/* Contenido */}
</div>
```

**Botón Atractivo:**

```tsx
<button className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25">
  Acción
</button>
```

**Fondo Dinámico:**

```tsx
<div className="absolute inset-0">
  <div className="animate-blob absolute top-0 left-1/4 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
  <div className="animation-delay-2000 animate-blob absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
</div>
```

### Reglas de UI/UX

1. **Feedback Visual**: Todo elemento interactivo debe tener hover/focus visible
2. **Jerarquía**: Usar tamaños de fuente consistentes (text-sm, text-base, text-lg, text-xl,
   text-2xl)
3. **Contraste**: Texto principal `text-white`, secundario `text-gray-400`
4. **Iconos**: Usar Lucide icons con tamaños consistentes (w-4, w-5, w-6)
5. **Loading States**: Siempre mostrar skeletons o spinners durante carga

---

## 🚀 PROMPT DE ELEVACIÓN PREMIUM

Para tareas de mejora visual avanzada, consultar el **Prompt Supremo de Diseño Premium**:

📄 **`.github/prompts/PREMIUM_DESIGN_ELEVATION.prompt.md`**

Este documento contiene:

- Sistema completo de animaciones cinematográficas (50+)
- Patrones de Glassmorphism GEN5
- Micro-interacciones premium
- Templates de componentes premium
- Efectos especiales (partículas, aurora, cyber grid)
- Checklist de validación funcional
- Guías de implementación segura

### Animaciones Ultra-Avanzadas Disponibles

```css
/* 🎬 CINEMATOGRÁFICAS */
animate-glitch           /* Efecto glitch cyber */
animate-hologram         /* Parpadeo holográfico */
animate-chromatic        /* Aberración cromática */
animate-neon-flicker     /* Neón parpadeante */
animate-cyber-glitch     /* Glitch con clip-path */
animate-scan-line        /* Línea de escaneo CRT */
animate-matrix-rain      /* Lluvia matrix */

/* 🌌 ESPACIALES 3D */
animate-parallax-float   /* Flotación con parallax 3D */
animate-3d-rotate-x      /* Rotación eje X */
animate-3d-rotate-y      /* Rotación eje Y */
animate-perspective-shift/* Cambio perspectiva */
animate-depth-pulse      /* Pulso con profundidad */

/* 🌈 CÓSMICAS */
animate-quantum-wave     /* Onda cuántica */
animate-aurora-dance     /* Danza aurora */
animate-nebula-swirl     /* Remolino nebulosa */
animate-photon-burst     /* Explosión fotónica */
animate-plasma-flow      /* Flujo plasma */
animate-warp-speed       /* Velocidad warp */
animate-crystallize      /* Cristalización */

/* ⚡ ENERGÉTICAS */
animate-energy-pulse     /* Pulso de energía */
animate-liquid-morph     /* Morfeo líquido */
animate-gravity-pull     /* Efecto gravedad */
```

### Comando Rápido de Elevación

Cuando el usuario pida "elevar diseño" o "mejorar UI/UX premium", seguir el prompt en:
**`.github/prompts/PREMIUM_DESIGN_ELEVATION.prompt.md`**
