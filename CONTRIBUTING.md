# 🤝 Guía de Contribución - CHRONOS INFINITY 2026

Gracias por tu interés en contribuir a CHRONOS. Esta guía te ayudará a comenzar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Commits y PRs](#commits-y-prs)

---

## 📜 Código de Conducta

- Sé respetuoso y profesional
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Respeta la diversidad

---

## 🛠️ Configuración del Entorno

### Requisitos Previos

- Node.js >= 20.x
- pnpm >= 9.x
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/chronos-infinity.git
cd chronos-infinity

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev
```

### Variables de Entorno

```env
# Turso Database (requerido)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# NextAuth (opcional para desarrollo)
NEXTAUTH_SECRET=tu-secret-aqui
NEXTAUTH_URL=http://localhost:3000
```

---

## 🔄 Flujo de Trabajo

### 1. Crear una rama

```bash
# Desde main
git checkout main
git pull origin main

# Crear rama con convención
git checkout -b tipo/descripcion-corta

# Ejemplos:
git checkout -b feat/nuevo-panel-ventas
git checkout -b fix/calculo-gya
git checkout -b docs/actualizar-readme
```

### 2. Hacer cambios

- Sigue los [estándares de código](#estándares-de-código)
- Escribe tests para nuevas funcionalidades
- Ejecuta el linter antes de commit

### 3. Verificar calidad

```bash
# Ejecutar todas las verificaciones
pnpm lint && pnpm type-check && pnpm test
```

### 4. Crear Pull Request

- Descripción clara del cambio
- Referencias a issues si aplica
- Screenshots si hay cambios visuales

---

## 📐 Estándares de Código

### TypeScript

```typescript
// ❌ PROHIBIDO
const data: any = fetch(...)
// @ts-ignore
// @ts-expect-error

// ✅ CORRECTO
interface ApiResponse {
  data: VentaType[]
  total: number
}
const data: ApiResponse = await fetch(...)
```

### Logging

```typescript
// ❌ PROHIBIDO
console.log("Debug:", data)

// ✅ CORRECTO
import { logger } from "@/app/lib/utils/logger"
logger.info("Mensaje", { context: "Componente", data })
logger.error("Error", error, { context: "Servicio" })
```

### Imports

```typescript
// Orden recomendado:
// 1. React/Next.js
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// 2. Librerías externas
import { motion } from "framer-motion"
import { eq, desc } from "drizzle-orm"

// 3. Componentes internos
import { Button } from "@/app/components/ui/button"

// 4. Utils/Types/Hooks
import { formatCurrency } from "@/app/lib/utils/formatters"
import type { VentaType } from "@/app/types"
```

### Convenciones de Nombres

| Tipo        | Convención          | Ejemplo             |
| ----------- | ------------------- | ------------------- |
| Componentes | PascalCase          | `VentasPanel.tsx`   |
| Hooks       | camelCase + `use`   | `useVentas.ts`      |
| Utils       | camelCase           | `formatCurrency.ts` |
| Types       | PascalCase + `Type` | `VentaType`         |
| Constants   | UPPER_SNAKE         | `MAX_ITEMS`         |

### Componentes React

```tsx
// Estructura recomendada
"use client" // si es necesario

import { useState } from "react"
import type { ComponentProps } from "./types"

interface Props {
  title: string
  onAction?: () => void
}

export function MiComponente({ title, onAction }: Props) {
  const [state, setState] = useState(false)

  const handleClick = () => {
    // lógica
    onAction?.()
  }

  return (
    <div className="...">
      <h2>{title}</h2>
      <button onClick={handleClick}>Acción</button>
    </div>
  )
}
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Con coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# Test específico
pnpm test -- -t "GYA"

# E2E
pnpm test:e2e

# Solo accesibilidad
pnpm test:e2e e2e/accessibility/
```

### Escribir Tests

```typescript
// __tests__/mi-modulo.test.ts
import { describe, it, expect } from "@jest/globals"
import { miFuncion } from "@/app/lib/utils/mi-modulo"

describe("miFuncion", () => {
  it("debe retornar X cuando Y", () => {
    const resultado = miFuncion(input)
    expect(resultado).toBe(expectedOutput)
  })

  it("debe manejar edge cases", () => {
    expect(() => miFuncion(null)).toThrow()
  })
})
```

### Property-Based Testing

```typescript
import * as fc from "fast-check"

it("debe funcionar con cualquier número positivo", () => {
  fc.assert(
    fc.property(fc.integer({ min: 1, max: 1000000 }), (n) => {
      const result = miFuncion(n)
      return result >= 0 // invariante
    })
  )
})
```

### Tests de Accesibilidad

```typescript
// e2e/accessibility/mi-test.spec.ts
import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test("página debe ser accesible", async ({ page }) => {
  await page.goto("/mi-pagina")

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()

  expect(results.violations).toHaveLength(0)
})
```

---

## 📝 Commits y PRs

### Formato de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción en español

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

| Tipo       | Uso                        |
| ---------- | -------------------------- |
| `feat`     | Nueva funcionalidad        |
| `fix`      | Corrección de bug          |
| `docs`     | Documentación              |
| `style`    | Formato (no afecta lógica) |
| `refactor` | Refactorización            |
| `test`     | Tests                      |
| `chore`    | Tareas de mantenimiento    |
| `perf`     | Mejora de rendimiento      |

### Ejemplos

```bash
# Nuevas features
git commit -m "feat(ventas): agregar filtro por fecha"
git commit -m "feat(dashboard): implementar panel GYA"

# Fixes
git commit -m "fix(calculos): corregir distribución a bancos"
git commit -m "fix(a11y): agregar aria-labels a navegación"

# Docs
git commit -m "docs: actualizar README con sección de testing"

# Refactor
git commit -m "refactor(store): migrar a Zustand v5"
```

### Pull Request Template

```markdown
## Descripción

[Descripción breve del cambio]

## Tipo de Cambio

- [ ] Nueva feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentación
- [ ] Tests

## Checklist

- [ ] Tests pasan (`pnpm test`)
- [ ] Linter pasa (`pnpm lint`)
- [ ] TypeScript sin errores (`pnpm type-check`)
- [ ] Documentación actualizada (si aplica)
- [ ] PR tiene descripción clara

## Screenshots (si aplica)

[Capturas de cambios visuales]

## Issues Relacionados

Closes #[número]
```

---

## 🏗️ Arquitectura

### Estructura de Carpetas

```
app/
├── _actions/        # Server Actions
├── _components/     # Componentes internos
├── _hooks/          # Custom hooks
├── _lib/            # Utilidades internas
├── api/             # API Routes
├── components/      # Componentes públicos
│   ├── panels/      # Paneles Bento*
│   ├── modals/      # Modales CRUD
│   └── ui/          # shadcn/ui
├── hooks/           # Hooks públicos
├── lib/             # Librerías públicas
│   ├── store/       # Zustand store
│   ├── schemas/     # Validación Zod
│   └── utils/       # Utilidades
└── types/           # TypeScript types

database/
├── schema.ts        # Drizzle schema
├── index.ts         # Cliente DB
└── migrate.ts       # Migraciones

__tests__/           # Jest tests
e2e/                 # Playwright E2E
```

### Flujo de Datos

```
[UI Component]
    ↓
[Zustand Store] ←→ [Server Action]
    ↓                    ↓
[Local State]       [Drizzle ORM]
                         ↓
                    [Turso DB]
```

---

## 🆘 Ayuda

- **Issues**: Crear issue en GitHub
- **Discusiones**: Tab de Discussions
- **Docs**: Carpeta `/docs`

¡Gracias por contribuir! 🚀
