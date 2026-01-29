# 🏗️ ARQUITECTURA DEL SISTEMA CHRONOS

> Sistema empresarial de gestión financiera con dashboard premium

---

## 📐 Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "🖥️ Cliente (Browser)"
        UI[React 19 + shadcn/ui]
        Canvas[Canvas 60fps]
        Spline[Spline 3D]
        Zustand[Zustand Store]
    end

    subgraph "⚡ Next.js 16 App Router"
        Pages[Pages & Layouts]
        Actions[Server Actions]
        API[API Route Handlers]
        RSC[React Server Components]
    end

    subgraph "🔧 Capa de Servicios"
        Formulas[Fórmulas GYA]
        Schemas[Zod Schemas]
        Logger[Logger Service]
    end

    subgraph "🗄️ Base de Datos"
        Drizzle[Drizzle ORM]
        Turso[(Turso LibSQL Edge)]
    end

    UI --> Pages
    Canvas --> Pages
    Spline --> Pages
    UI <--> Zustand

    Pages --> Actions
    Pages --> API
    Pages --> RSC

    Actions --> Formulas
    Actions --> Schemas
    Actions --> Logger
    API --> Formulas
    API --> Schemas

    Actions --> Drizzle
    API --> Drizzle
    RSC --> Drizzle

    Drizzle --> Turso
```

---

## 🏛️ Capas de la Arquitectura

### 1. Capa de Presentación (Frontend)

```mermaid
graph LR
    subgraph "Componentes UI"
        Panels[10 Paneles Bento]
        Modals[14 Modales CRUD]
        Viz[10 Visualizaciones Canvas]
    end

    subgraph "Estado"
        ZStore[Zustand Store]
        RQuery[React Query Cache]
    end

    Panels --> ZStore
    Modals --> ZStore
    Viz --> ZStore
```

**Tecnologías:**

- React 19 con Server Components
- Tailwind CSS + shadcn/ui
- Framer Motion (animaciones)
- Canvas API + Spline 3D

### 2. Capa de Lógica de Negocio (Backend)

```mermaid
graph TD
    Actions[Server Actions] --> Formulas[formulas.ts]
    Actions --> Schemas[Zod Schemas]
    Actions --> DB[Drizzle ORM]

    API[API Routes] --> Formulas
    API --> Schemas
    API --> DB

    Formulas --> |GYA| DistGYA[Distribución 3 Bancos]
```

**Archivos Clave:**

- `app/_actions/` - 16 Server Actions
- `app/lib/formulas.ts` - Fórmulas centralizadas
- `app/lib/schemas/` - 9 schemas Zod

### 3. Capa de Datos (Persistencia)

```mermaid
erDiagram
    BANCOS ||--o{ MOVIMIENTOS : tiene
    CLIENTES ||--o{ VENTAS : realiza
    VENTAS ||--o{ MOVIMIENTOS : genera
    VENTAS ||--o{ ABONOS : recibe
    DISTRIBUIDORES ||--o{ ORDENES_COMPRA : provee
    ORDENES_COMPRA ||--o{ MOVIMIENTOS : genera
```

**Tecnologías:**

- Turso (LibSQL Edge Database)
- Drizzle ORM (Type-safe queries)
- SQLite (desarrollo local)

---

## 🔄 Flujos de Datos

### Flujo de Venta

```mermaid
sequenceDiagram
    participant U as Usuario
    participant M as Modal CRUD
    participant A as Server Action
    participant F as Fórmulas GYA
    participant DB as Turso DB

    U->>M: Crear Venta
    M->>M: Validar Zod
    M->>A: Submit FormData
    A->>F: calcularVentaCompleta()
    F-->>A: Distribución GYA
    A->>DB: INSERT venta
    A->>DB: UPDATE cliente.saldoPendiente
    A->>A: revalidatePath()
    A-->>M: { success: true }
    M-->>U: Toast + Actualizar UI
```

### Flujo de Abono

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as Server Action
    participant F as Fórmulas GYA
    participant DB as Turso DB

    U->>A: Registrar Abono
    A->>DB: SELECT venta
    A->>F: calcularDistribucionAbono()
    F-->>A: Distribución proporcional
    A->>DB: UPDATE venta.montoPagado
    A->>DB: UPDATE cliente.saldoPendiente
    A->>DB: INSERT movimiento (x3 bancos)
    A->>DB: UPDATE bancos.capitalActual
    A-->>U: { success: true }
```

---

## 📁 Estructura de Directorios

```
chronos-elite/
├── app/
│   ├── _actions/              # 16 Server Actions
│   │   ├── ventas.ts
│   │   ├── bancos.ts
│   │   ├── clientes.ts
│   │   ├── ordenes.ts
│   │   └── ...
│   ├── _components/           # Componentes 2026
│   ├── components/
│   │   ├── panels/
│   │   │   └── definitivos/   # 10 Paneles Bento
│   │   ├── modals/            # 14 Modales CRUD
│   │   └── visualizations/    # 10 Canvas 60fps
│   ├── lib/
│   │   ├── formulas.ts        # Fórmulas GYA centralizadas
│   │   ├── store/             # Zustand stores
│   │   ├── schemas/           # Zod schemas
│   │   └── utils/
│   │       └── logger.ts      # Logger centralizado
│   ├── api/                   # 25 Route Handlers
│   └── types/
│       └── index.ts           # 741 líneas de tipos
├── database/
│   ├── schema.ts              # 912 líneas - Drizzle schema
│   └── index.ts               # Cliente Turso
├── __tests__/                 # 27 archivos Jest
└── e2e/                       # Playwright E2E
```

---

## 🔐 Seguridad

### Flujo de Validación

```mermaid
graph LR
    Input[User Input] --> Zod[Zod Schema]
    Zod --> |Valid| Action[Server Action]
    Zod --> |Invalid| Error[Error Response]
    Action --> Drizzle[Drizzle Query]
    Drizzle --> |Parametrizado| DB[(Turso)]
```

### Protecciones Implementadas

| Capa     | Protección           | Implementación                |
| -------- | -------------------- | ----------------------------- |
| Frontend | Validación Form      | react-hook-form + zodResolver |
| Backend  | Validación Server    | Zod schemas                   |
| Database | SQL Injection        | Drizzle parametrizado         |
| Secrets  | Variables de Entorno | .env.local (gitignored)       |

---

## 📊 Patrones de Diseño

### 1. Server Actions Pattern

```typescript
// app/_actions/ventas.ts
'use server'

export async function createVenta(formData: FormData) {
  const parsed = CreateVentaSchema.safeParse(rawData)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const resultado = calcularVentaCompleta(parsed.data)

  await db.transaction(async (tx) => {
    await tx.insert(ventas).values({...})
    await tx.update(clientes).set({...})
  })

  revalidatePath('/ventas')
  return { success: true }
}
```

### 2. Zustand Store Pattern

```typescript
// app/lib/store/useAppStore.ts
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        currentPanel: "dashboard",
        theme: "dark",
        setCurrentPanel: (panel) => set({ currentPanel: panel }),
      }),
      { name: "chronos-ui-storage" }
    )
  )
)
```

### 3. Canvas Animation Pattern

```typescript
// Cleanup correcto en todos los componentes Canvas
useEffect(() => {
  const animationId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(animationId)
}, [])
```

---

## 🚀 Despliegue

```mermaid
graph LR
    Dev[Desarrollo Local] --> |push| GitHub
    GitHub --> |trigger| Vercel[Vercel Build]
    Vercel --> |deploy| Edge[Vercel Edge]
    Edge --> |query| Turso[(Turso Edge DB)]
```

### Variables de Entorno Requeridas

| Variable            | Ambiente | Requerida   |
| ------------------- | -------- | ----------- |
| DATABASE_URL        | All      | ✅          |
| DATABASE_AUTH_TOKEN | All      | ✅          |
| NEXTAUTH_SECRET     | All      | ✅          |
| NEXTAUTH_URL        | All      | ✅          |
| OPENAI_API_KEY      | Prod     | ❌ Opcional |

---

> **Última actualización:** 20 de Diciembre, 2025
