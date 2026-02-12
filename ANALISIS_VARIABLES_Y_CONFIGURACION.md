# 📊 Análisis de Variables de Entorno y Configuración

**Fecha:** 2026-02-12  
**Proyecto:** CHRONOS INFINITY  
**Directorio analizado:** `v0-crypto-dashboard-design-feature-3d-integration-panels/`

---

## 1. RESUMEN EJECUTIVO

| Servicio | Estado | Ubicación | Notas |
|----------|--------|-----------|-------|
| **Clerk** | ✅ CONFIGURADO | `.env.local` | Keys reales (pk_test_, sk_test_) |
| **Turso** | ❌ NO CONFIGURADO | — | Usa `DATABASE_URL` (PostgreSQL) en lugar de `TURSO_*` |
| **ElevenLabs** | ⚠️ PARCIAL | `.env.voice` | Key en .env.voice pero API usa `ELEVENLABS_API_KEY` |
| **Deepgram** | ❌ NO CONFIGURADO | `.env.voice` | Placeholder `your_deepgram_api_key_here` |
| **OpenAI** | ❌ NO en .env.local | — | Requerido por varios servicios |
| **Vercel** | ✅ VINCULADO | `.env.vercel` | Proyecto `v0-crypto-dashboard-design` vinculado |

---

## 2. ARCHIVOS .ENV ENCONTRADOS

### 2.1 Ubicaciones

| Archivo | Ruta | Uso por Next.js |
|---------|------|------------------|
| `.env.local` | `v0-crypto-dashboard.../` | ✅ SÍ (carga automática) |
| `.env.voice` | `v0-crypto-dashboard.../` | ❌ NO (Next.js no lo carga) |
| `.env.vercel` | `v0-crypto-dashboard.../` | ❌ NO (solo referencia Vercel) |
| `.env.local` | Raíz del workspace | ⚠️ Contexto Azure diferente |
| `.env.example` | `v0-crypto-dashboard.../` | ❌ Template |
| `.env.production.example` | `v0-crypto-dashboard.../` | ❌ Template |
| `.env.production.template` | `v0-crypto-dashboard.../` | ❌ Template |
| `.env.local.example` | `v0-crypto-dashboard.../` | ❌ Template |

### 2.2 Qué carga Next.js

Next.js (desde `v0-crypto-dashboard-design-feature-3d-integration-panels/`) carga en este orden:
1. `.env`
2. `.env.local` ← **Archivo principal usado**
3. `.env.development` / `.env.production`
4. `.env.development.local` / `.env.production.local`

**Importante:** `.env.voice` **NO** se carga automáticamente. Sus variables deben estar en `.env.local` o cargarse manualmente.

---

## 3. ANÁLISIS POR SERVICIO

### 3.1 CLERK (Autenticación) ✅

**Variables requeridas por el código:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_test_ o pk_live_)
- `CLERK_SECRET_KEY` (sk_test_ o sk_live_)

**Estado en `.env.local` del proyecto:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Z29sZGVuLXNreWxhcmstMTcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_35ROe4EmWTtPhtZEid8z4FNgr8EtVw2nZFKvXh6X2l
```

**Veredicto:** ✅ **CONFIGURADO** — Keys de desarrollo Clerk presentes y con formato correcto.

**Opcionales usados en el código:**
- `CLERK_WEBHOOK_SECRET` — Para webhooks (no está en .env.local)

---

### 3.2 TURSO (Base de datos) ❌

**Variables requeridas por el código:**
- `TURSO_DATABASE_URL` — `database/index.ts`, `drizzle.config.ts`, `database/migrate.ts`
- `TURSO_AUTH_TOKEN`

**Estado en `.env.local` del proyecto:**
```
DATABASE_URL=your_database_url_here
```

**Problema:** El proyecto usa `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`, pero `.env.local` tiene `DATABASE_URL` con placeholder. **No hay variables TURSO_* configuradas.**

**Archivos que usan TURSO:**
- `database/index.ts` línea 7-8
- `drizzle.config.ts` línea 8-9
- `database/migrate.ts` línea 8-9
- `app/lib/services/config.ts` — verifica `TURSO_DATABASE_URL?.includes('turso.io')`
- `app/lib/services/enterprise/production-services.ts` línea 23-24

**Veredicto:** ❌ **NO CONFIGURADO** — La base de datos no funcionará hasta configurar Turso.

**Acción:** Añadir a `.env.local`:
```
TURSO_DATABASE_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu-token-aqui
```

---

### 3.3 ELEVENLABS (Voz / TTS) ⚠️ PARCIAL

**Variables usadas en el código:**
- `ELEVENLABS_API_KEY` — API routes: `app/api/voice/synthesize/route.ts`, `app/api/ai/voice/synthesize/route.ts`

**Estado:**
- **`.env.local`:** No contiene `ELEVENLABS_API_KEY`
- **`.env.voice`:** Contiene `NEXT_PUBLIC_ELEVENLABS_API_KEY=f4030d942e6d44b0647fc7e6afaca77bca619196a6b802ce2a5bec114ad7d40c`
  - Problema 1: El API route usa `ELEVENLABS_API_KEY`, no `NEXT_PUBLIC_ELEVENLABS_API_KEY`
  - Problema 2: `.env.voice` no se carga automáticamente
  - Problema 3: La key parece hex (64 chars); las de ElevenLabs suelen empezar por `el_`

**Hooks:**
- `useElevenLabsService.ts` — Tiene key hardcodeada como default (fallback de desarrollo)

**Veredicto:** ⚠️ **PARCIAL** — Hay una key en `.env.voice` pero:
1. `.env.voice` no se carga por defecto
2. El nombre de variable es distinto (`NEXT_PUBLIC_` vs sin prefijo)
3. Para producción, usar `ELEVENLABS_API_KEY` en `.env.local`

---

### 3.4 DEEPGRAM (Voz / STT) ❌

**Variables usadas en el código:**
- `DEEPGRAM_API_KEY` — `app/api/voice/transcribe/route.ts`, `app/api/voice/stream/route.ts`, `app/api/ai/voice/transcribe/route.ts`

**Estado en `.env.voice`:**
```
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key_here
DEEPGRAM_MODEL=nova-2
```

**Problemas:**
1. Placeholder, no key real
2. API usa `DEEPGRAM_API_KEY` (server-side), no `NEXT_PUBLIC_`
3. `.env.voice` no se carga

**Veredicto:** ❌ **NO CONFIGURADO**

---

### 3.5 VERCEL ✅

**Archivo `.env.vercel`:**
- Contiene `VERCEL_OIDC_TOKEN` (token temporal de Vercel CLI)
- Indica proyecto vinculado: `v0-crypto-dashboard-design`, org `manis-projects-48838690`

**Veredicto:** ✅ Proyecto vinculado a Vercel. Las variables de producción deben configurarse en el dashboard de Vercel.

---

### 3.6 OTRAS VARIABLES USADAS EN EL CÓDIGO

| Variable | Usado en | En .env.local |
|----------|----------|---------------|
| `OPENAI_API_KEY` | openai-service.ts, ai-service.ts, config.ts | ❌ No |
| `ANTHROPIC_API_KEY` | openai-service.ts | ❌ No |
| `GOOGLE_AI_API_KEY` | openai-service.ts | ❌ No |
| `UPSTASH_REDIS_REST_URL` | adaptive-redis, config | ❌ No |
| `UPSTASH_REDIS_REST_TOKEN` | adaptive-redis | ❌ No |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHogProvider, config | ❌ No |
| `ABLY_API_KEY` | ably-realtime, config | ❌ No |
| `RESEND_API_KEY` | resend-email, config | ❌ No |
| `SENTRY_AUTH_TOKEN` | config | ❌ No |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | algolia-search | ❌ No |
| `VAPI_API_KEY` | vapi-client, VapiService | ❌ No |
| `BANXICO_API_TOKEN` | profit-banxico-api | ❌ No |
| `NEXT_PUBLIC_WS_URL` | WebSocketProvider | ❌ No (default: ws://localhost:3001) |
| `CRON_SECRET` | api/cron/* | ❌ No |
| `ADMIN_EMAILS` | api/cron/daily-report | ❌ No |
| `NEXT_PUBLIC_ZERO_VOICE_ID` | zero-force-voice.ts | En .env.voice |
| `NEXT_PUBLIC_APP_URL` | cron routes | ❌ No |

---

## 4. CONFIGURACIONES (drizzle, next, etc.)

### 4.1 drizzle.config.ts
```ts
dbCredentials: {
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
}
```
**Requiere:** `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`

### 4.2 database/index.ts
```ts
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
```
**Requiere:** Las mismas variables.

### 4.3 middleware.ts
- Usa `process.env.NODE_ENV` para debug
- No requiere variables adicionales

### 4.4 scripts/validate-services.ts
Considera **requeridas** (fail si faltan):
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `ABLY_API_KEY`
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`

**Nota:** La validación es estricta. Varios de estos servicios tienen fallbacks en `config.ts` (p. ej. Clerk bypass, Redis in-memory).

---

## 5. SETTINGS.JSON

### 5.1 Raíz `.vscode/settings.json`
```json
{"git.ignoreLimitWarning":true}
```
Solo ajuste de Git.

### 5.2 `v0-crypto-dashboard.../.vscode/settings.json`
Configuración larga del IDE:
- Git, Copilot, TypeScript
- Tailwind, ESLint
- Path mappings: `@` → workspace
- No define variables de entorno

**Nota:** `path-intellisense.mappings` apunta a `@/app`, `@/components`, etc. bajo `workspaceFolder`. Si el workspace es la raíz, podría no coincidir con la estructura real (`app/` dentro del subproyecto).

---

## 6. INCONSISTENCIAS Y RIESGOS

### 6.1 Varios orígenes de configuración
- Raíz: `.env.local` con stack **Azure** (Azure OpenAI, Speech, Redis, etc.)
- Subproyecto: `.env.local` con **Clerk** y placeholder DB
- `.env.voice`: ElevenLabs y Deepgram (no cargado automáticamente)

### 6.2 Nombres de variables
- DB: Código usa `TURSO_*`, templates usan también `DATABASE_URL` / `DATABASE_AUTH_TOKEN`
- Voz: Mezcla de `ELEVENLABS_API_KEY` (API) y `NEXT_PUBLIC_ELEVENLABS_API_KEY` (`.env.voice`)

### 6.3 Hook con valores hardcodeados
`useElevenLabsService.ts` línea 25-26:
```ts
apiKey = 'f4030d942e6d44b0647fc7e6afaca77bca619196a6b802ce2a5bec114ad7d40c',
voiceId = 'spPXlKT5a4JMfbhPRAzA',
```
Riesgo de exponer credenciales en el bundle si se usa en cliente.

---

## 7. CHECKLIST DE ACCIÓN

### Críticas (para que la app funcione)
- [ ] Añadir `TURSO_DATABASE_URL` a `.env.local`
- [ ] Añadir `TURSO_AUTH_TOKEN` a `.env.local`
- [ ] Ejecutar `pnpm db:push` o `pnpm db:migrate` tras configurar Turso

### Clerk
- [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Configurado
- [x] `CLERK_SECRET_KEY` — Configurado

### ElevenLabs
- [ ] Añadir `ELEVENLABS_API_KEY` a `.env.local` (o mover/copiar desde `.env.voice` si la key es válida)
- [ ] Verificar que la key de ElevenLabs sea real (formato `el_...`)

### Deepgram
- [ ] Añadir `DEEPGRAM_API_KEY` a `.env.local`
- [ ] Sustituir `your_deepgram_api_key_here` por key real

### Opcionales
- [ ] `OPENAI_API_KEY` — Para panel de IA
- [ ] `CLERK_WEBHOOK_SECRET` — Para webhooks
- [ ] Unificar o documentar uso de `.env.voice` vs `.env.local`

### Consolidación
- [ ] Decidir si `.env.voice` se usa: si no, migrar sus variables a `.env.local` y eliminarlo o dejarlo solo como documentación
- [ ] Evitar keys hardcodeadas en hooks (usar `process.env` o props)

---

## 8. COMANDO DE VERIFICACIÓN

```powershell
cd v0-crypto-dashboard-design-feature-3d-integration-panels
pnpm tsx scripts/validate-services.ts
```

Este script valida las variables cargadas desde `.env.local`.

---

**Documento generado por análisis del workspace**
