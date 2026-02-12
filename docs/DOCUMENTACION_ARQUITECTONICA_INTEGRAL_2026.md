# Documentación Arquitectónica Integral - CHRONOS INFINITY 2026

**Versión:** 1.0.0  
**Fecha:** 2026-02-12  
**Estado:** Completo

---

## Índice

1. [Documentación Arquitectónica Integral](#1-documentación-arquitectónica-integral)
2. [Análisis de Flujos de Trabajo](#2-análisis-de-flujos-de-trabajo)
3. [Análisis de Lógica de Negocio](#3-análisis-de-lógica-de-negocio)
4. [Evaluación Técnica Detallada](#4-evaluación-técnica-detallada)
5. [Seguridad y Manejo de Errores](#5-seguridad-y-manejo-de-errores)
6. [Propuesta de División AuroraVentasPanelUnified](#6-propuesta-de-división-auroraventaspanelunified)
7. [Documentación Metodológica](#7-documentación-metodológica)
8. [Entregables Sprint de Mantenimiento](#8-entregables-sprint-de-mantenimiento)

---

## 1. Documentación Arquitectónica Integral

### 1.1 Visión General

**CHRONOS INFINITY** es un sistema ERP de gestión empresarial con dashboard financiero, ventas, inventario, bancos y reportes. Integra autenticación (Clerk), base de datos (Turso/LibSQL), IA (OpenAI, Anthropic), voz (ElevenLabs, Deepgram) y despliegue en Vercel.

### 1.2 Diagrama C4 - Nivel Contexto

```
[Usuario] --> [CHRONOS Infinity Web App]
[CHRONOS Infinity] --> [Clerk Auth]
[CHRONOS Infinity] --> [Turso DB]
[CHRONOS Infinity] --> [OpenAI/ElevenLabs/Deepgram]
[CHRONOS Infinity] --> [Vercel Edge]
```

### 1.3 Diagrama C4 - Nivel Contenedor

| Contenedor | Tecnología | Responsabilidad |
|------------|------------|-----------------|
| Web App | Next.js 16 | SSR, routing, UI |
| API Routes | Next.js | REST endpoints |
| Server Actions | Next.js | Mutaciones, lógica |
| Database | Turso/LibSQL | Persistencia |
| Auth | Clerk | Identidad |

### 1.4 Puntos de Entrada

| Tipo | Ruta/Archivo | Descripción |
|------|--------------|-------------|
| Página | `/` | Landing |
| Página | `/login`, `/register` | Auth Clerk |
| Página | `/dashboard` | Dashboard principal |
| Página | `/ventas` | Panel ventas |
| Página | `/clientes` | Panel clientes |
| Página | `/almacen` | Panel almacén |
| Página | `/bancos` | Panel bancos |
| Página | `/ordenes` | Órdenes de compra |
| API | `/api/*` | Endpoints REST |
| Webhook | `/api/webhooks/clerk` | Sincronización Clerk |

### 1.5 Catálogo de APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/ventas` | GET, POST | CRUD ventas |
| `/api/clientes` | GET, POST, PUT, DELETE | CRUD clientes |
| `/api/bancos` | GET, POST | Bancos |
| `/api/almacen` | GET, POST | Inventario |
| `/api/ordenes` | GET, POST | Órdenes compra |
| `/api/ai/chat` | POST | Chat IA |
| `/api/voice/synthesize` | POST | TTS ElevenLabs |
| `/api/voice/transcribe` | POST | STT Deepgram |
| `/api/health` | GET | Health check |

### 1.6 Servicios Externos

| Servicio | Variable ENV | Uso |
|----------|--------------|-----|
| Clerk | `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY` | Auth |
| Turso | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | DB |
| OpenAI | `OPENAI_API_KEY` | IA |
| ElevenLabs | `ELEVENLABS_API_KEY` | TTS |
| Deepgram | `DEEPGRAM_API_KEY` | STT |
| Vercel | Auto | Hosting |

---

## 2. Análisis de Flujos de Trabajo

### 2.1 Flujo de Autenticación

```
1. Usuario → /login
2. Clerk → Formulario
3. Submit → Clerk API
4. Success → Redirect /welcome
5. Middleware valida sesión en cada request
6. No auth → Redirect /login
```

### 2.2 Flujo de Creación de Venta

```
1. Usuario abre CreateVentaModal
2. Selecciona cliente, cantidad, precios
3. Validación Zod en submit
4. Server Action / API POST /api/ventas
5. DB: insert venta, actualizar almacén, bancos
6. React Query invalidate
7. Toast éxito, cerrar modal
```

### 2.3 Flujo de Registro de Gasto/Ingreso

```
1. Modal GastoModal/IngresoModal
2. Selección banco, monto, concepto
3. POST /api/gastos o /api/ingresos
4. Actualización capital banco
5. Refresh datos
```

### 2.4 Estados y Transiciones por Flujo

| Flujo | Estados | Validaciones |
|-------|---------|--------------|
| Venta | draft → submitted → confirmed | Cliente req, cantidad>0, precios≥0 |
| Orden Compra | borrador → enviada → recibida | Distribuidor, productos, total |
| Almacén | entrada → en_stock → salida | Stock≥0, stock_mínimo |

### 2.5 Actores y Roles

| Rol | Permisos |
|-----|----------|
| Usuario | Ver dashboard, propias operaciones |
| Manager | CRUD ventas, clientes, reportes |
| Admin | Usuarios, configuración, sistema |

---

## 3. Análisis de Lógica de Negocio

### 3.1 Reglas Implementadas

- **GYA (Ganancia/Yield/Análisis)**: `gya-calculo.ts` — distribución de ganancia por banco
- **Stock FIFO**: Asignación de lotes en ventas
- **Capital bancos**: Proporcional a contribución
- **Alertas stock**: stock < stock_mínimo

### 3.2 Edge Cases

- Venta sin cliente → validación Zod rechaza
- Stock insuficiente → validación antes de confirmar
- Banco sin capital → GastoModal valida capital disponible

### 3.3 Decisiones Críticas

| Decisión | Impacto |
|----------|---------|
| Turso vs PostgreSQL | Latencia edge, costo |
| Clerk vs NextAuth | UX auth, mantenimiento |
| Server Actions vs API | Simplificación, tipos |

---

## 4. Evaluación Técnica Detallada

### 4.1 Patrones de Diseño

- **Provider/Context**: VentasProvider, QueryProvider, ClerkProvider
- **Repository**: Server Actions como capa de datos
- **Adapter**: Servicios adaptativos (Redis fallback memory, Algolia fallback Fuse)

### 4.2 Cuellos de Botella

- Componentes 3D pesados → lazy load recomendado
- Paneles grandes (2000+ líneas legacy) → ya refactorizados (Ventas)

### 4.3 Escalabilidad

- **Horizontal**: Vercel serverless, Turso distribuido
- **Vertical**: React Query cache, optimistic updates

### 4.4 KPIs Técnicos

| Métrica | Objetivo |
|---------|----------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Build | Sin errores TS |

---

## 5. Seguridad y Manejo de Errores

### 5.1 Auditoría por Componente

| Componente | Vulnerabilidades | Mitigación |
|------------|------------------|------------|
| API Routes | Inyección | Zod validation |
| Auth | Session hijack | Clerk JWT, HTTPS |
| DB | SQL injection | Drizzle parametrizado |
| Env | Secret leak | .gitignore, Vercel secrets |

### 5.2 Puntos de Fallo

- Turso no disponible → fallback file: SQLite local
- Clerk down → bypass mode desarrollo
- OpenAI rate limit → mensaje usuario

### 5.3 Recuperación y Resiliencia

- `connectWithRetry` en database
- React Query retry automático
- Error boundaries en layouts

### 5.4 Logs y Monitoreo

- `logger` en `app/_lib/utils/logger`
- Sentry (si configurado)
- PostHog analytics (opcional)

---

## 6. Propuesta de División AuroraVentasPanelUnified

### 6.1 Estado Actual

**Ya refactorizado.** El panel se compone de:
- `ventas/index.tsx` — Orquestador (~42 líneas)
- `VentasProvider` — Estado
- `VentasHeader` — Header y acciones
- `VentasStats` — KPIs
- `VentasTable` — Tabla
- `CreateVentaModal` — Modal

### 6.2 Componentes Reutilizables

- `VentasFilters` — Extraer de VentasHeader si crece
- `VentaRow` — Item de tabla
- `VentaStatsCard` — Card KPI

### 6.3 Criterios Done

- [x] Panel < 100 líneas
- [x] Subcomponentes con responsabilidad única
- [x] Tests de integración

---

## 7. Documentación Metodológica

### 7.1 Estructura por Flujos

```
/docs
  /flujos
    autenticacion.md
    ventas.md
    almacen.md
  /logica
    reglas-negocio.md
  /datos
    esquema-db.md
    apis.md
```

### 7.2 Catálogo de Archivos Clave

| Archivo | Propósito | Dependencias |
|---------|-----------|--------------|
| `database/index.ts` | Cliente DB | libsql, drizzle |
| `database/schema.ts` | Esquema | drizzle-orm, drizzle-zod |
| `middleware.ts` | Auth | @clerk/nextjs |
| `app/layout.tsx` | Root | AppProviders |
| `app/api/ventas/route.ts` | API ventas | db, schema |

### 7.3 Matriz de Trazabilidad

| Requisito | Implementación |
|-----------|----------------|
| R1: Login | Clerk, middleware |
| R2: CRUD Ventas | /api/ventas, VentasProvider |
| R3: Reportes | /api/export, export-supreme |

---

## 8. Entregables Sprint de Mantenimiento

### 8.1 Documentación

- [x] Este documento
- [ ] Diagramas PlantUML en `/docs/diagramas`
- [ ] Especificación interfaces en `/docs/contracts`

### 8.2 Plan de Pruebas

- Unit: Jest en `__tests__/`
- E2E: Playwright en `e2e/`
- Cobertura: `pnpm test:coverage`

### 8.3 Estimaciones

| Tarea | Esfuerzo |
|-------|----------|
| Variables/env | 0.5d |
| Doc arquitectura | 1d |
| Tests adicionales | 2d |

---

## Anexo A: Variables de Entorno Completas

Ver `ANALISIS_VARIABLES_Y_CONFIGURACION.md` y `.env.example`.

## Anexo B: Configuración Actual Aplicada

- **database/index.ts**: Fallback a `file:./database/sqlite.db` si no hay TURSO_*
- **drizzle.config.ts**: Soporta file: y libsql://
- **.env.local**: Consolidado con Clerk, DB, ElevenLabs, Deepgram
