# 🛠️ Servicios y Configuración - CHRONOS 2026

> Guía completa de todos los servicios, herramientas y tecnologías del sistema CHRONOS

## 📋 Stack Tecnológico

### Core Framework

- **Next.js 16** - App Router + React 19 + TypeScript (strict mode)
- **Turbo** - Build system optimizado
- **pnpm** - Package manager

### Base de Datos

- **Turso** - LibSQL Edge Database (SQLite distribuido)
- **Drizzle ORM** - Type-safe ORM con migraciones

### Autenticación

- **NextAuth.js** - Authentication framework
- ~~Firebase Auth~~ - **ELIMINADO** (migrado a NextAuth)

### Estilos y UI

- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Componentes React
- **Radix UI** - Primitivos accesibles

### Estado

- **Zustand** - State management
- **React Query** - Server state & caching

### Visualizaciones

- **Spline** - 3D scenes
- **Three.js** - WebGL 3D
- **Canvas API** - 2D animations

### Testing

- **Jest** - Unit tests
- **Playwright** - E2E tests
- **React Testing Library** - Component tests

### Monitoreo

- **Sentry** - Error tracking
- **Vercel Analytics** - Performance monitoring
- **OpenTelemetry** - Distributed tracing

### AI/ML

- **xAI (Grok)** - API de IA
- Anthropic, OpenAI, Google AI - SDKs disponibles

### DevOps

- **Vercel** - Deployment & hosting
- **GitHub Actions** - CI/CD
- **Turso CLI** - Database management

---

## 🔧 Configuración de Servicios

### 1. Turso (Database)

#### Instalación CLI

```bash
# Ya instalado en devcontainer
turso --version
```

#### Autenticación

```bash
turso auth login
```

#### Ver bases de datos

```bash
turso db list
turso db show chronos-infinity-2026
```

#### Obtener credenciales

```bash
# URL de conexión
turso db show chronos-infinity-2026 --url

# Token de autenticación
turso db tokens create chronos-infinity-2026
```

#### Configurar en proyecto

```bash
# .env.local
DATABASE_URL="libsql://chronos-infinity-2026-zoro488.aws-us-west-2.turso.io"
DATABASE_AUTH_TOKEN="<tu-token-aqui>"
```

#### Comandos útiles

```bash
pnpm db:push        # Aplicar schema a Turso
pnpm db:studio      # Abrir Drizzle Studio
pnpm db:migrate     # Ejecutar migraciones
pnpm db:seed        # Seed inicial
```

---

### 2. Vercel (Deployment)

#### Instalación CLI

```bash
pnpm add -g vercel
```

#### Autenticación

```bash
vercel login
```

#### Vincular proyecto

```bash
vercel link
```

#### Variables de entorno

**Usar script automatizado:**

```bash
bash scripts/setup-vercel.sh
```

**Agregar manualmente:**

```bash
# Production
vercel env add DATABASE_URL production
vercel env add DATABASE_AUTH_TOKEN production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# Preview
vercel env add DATABASE_URL preview
vercel env add DATABASE_AUTH_TOKEN preview
vercel env add NEXTAUTH_SECRET preview

# Development
vercel env add NEXTAUTH_SECRET development
```

**Ver variables:**

```bash
vercel env ls
```

**Eliminar variable:**

```bash
vercel env rm VARIABLE_NAME production
```

#### Deploy

```bash
# Preview
vercel

# Production
vercel --prod
```

---

### 3. GitHub (Version Control & CI/CD)

#### Instalación CLI

```bash
apk add github-cli
```

#### Autenticación

```bash
gh auth login
```

**Usar script automatizado:**

```bash
bash scripts/setup-github.sh
```

#### Secrets del repositorio

```bash
# Listar secrets
gh secret list

# Agregar secret
gh secret set DATABASE_URL < <(echo "valor-aqui")
gh secret set DATABASE_AUTH_TOKEN
# Prompt interactivo para ingresar valor
```

#### Comandos útiles

```bash
gh repo view              # Info del repo
gh pr list                # Listar PRs
gh pr create              # Crear PR
gh issue list             # Listar issues
gh workflow list          # Listar workflows
gh workflow run           # Ejecutar workflow
```

---

### 4. Sentry (Error Tracking)

#### Configuración

Variables en `.env.local`:

```bash
SENTRY_DSN="<tu-dsn>"
SENTRY_AUTH_TOKEN="<tu-token>"
```

#### Ver en proyecto

- `next.config.ts` - Configuración Sentry
- `app/lib/monitoring/` - Utilidades monitoring

---

### 5. xAI (Grok API)

#### Configuración

```bash
# .env.local
XAI_API_KEY="xai-..."
```

#### Uso en proyecto

```typescript
import { xai } from "@/app/lib/ai"
const completion = await xai.chat.completions.create(...)
```

---

## 📦 Servicios Adicionales

### Kubiks

```bash
KUBIKS_API_KEY="kubiks_..."
```

### MXBAI

```bash
MXBAI_API_KEY="mxb_..."
MXBAI_STORE_ID="..."
```

### Hypertune (Feature Flags)

```bash
NEXT_PUBLIC_HYPERTUNE_TOKEN="..."
```

---

## 🚀 Scripts Automatizados

### Setup Completo

```bash
# Vercel
bash scripts/setup-vercel.sh

# GitHub
bash scripts/setup-github.sh

# Push variables a Vercel
bash scripts/push-env-vercel.sh
```

### Verificación

```bash
# Health check completo
pnpm health

# Verificar errores
pnpm verify
```

---

## 🔐 Variables de Entorno

### Esenciales (requeridas)

- `DATABASE_URL` - URL Turso
- `DATABASE_AUTH_TOKEN` - Token Turso
- `NEXTAUTH_URL` - URL de la app
- `NEXTAUTH_SECRET` - Secret key para NextAuth

### Opcionales

- `XAI_API_KEY` - API de xAI/Grok
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_ENVIRONMENT` - development/preview/production
- `NEXT_PUBLIC_BASE_URL` - URL base

### Para desarrollo local

```bash
DATABASE_URL="file:./sqlite.db"
DATABASE_AUTH_TOKEN=""
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🧹 Limpieza de Firebase (COMPLETADO)

✅ Firebase **completamente eliminado** del proyecto:

- ❌ `firestore.indexes.json` - Eliminado
- ❌ `firestore.rules` - Eliminado
- ❌ Variables `NEXT_PUBLIC_FIREBASE_*` - Eliminadas de Vercel
- ✅ Migrado a **Turso + Drizzle + NextAuth**

### Adaptador Legacy

El directorio `app/lib/firebase/` contiene un **adaptador de compatibilidad** que traduce llamadas
Firebase → Drizzle. Es solo para código legacy, nuevas features deben usar Drizzle directamente.

---

## 📚 Documentación Adicional

- [Turso Docs](https://docs.turso.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vercel Docs](https://vercel.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [GitHub CLI](https://cli.github.com/)

---

## ⚡ Comandos Rápidos

```bash
# Development
pnpm dev                  # Iniciar servidor
pnpm dev:turbo           # Con Turbopack

# Database
pnpm db:studio           # UI visual
pnpm db:push             # Aplicar schema
pnpm db:migrate          # Migraciones

# Testing
pnpm test                # Unit tests
pnpm test:e2e            # E2E tests
pnpm type-check          # TypeScript

# Validación completa
pnpm validate            # lint + type + test

# Deploy
vercel                   # Preview
vercel --prod            # Production
```

---

**Última actualización:** 10 de enero de 2026 **Versión:** CHRONOS 3.0.0 SUPREME
