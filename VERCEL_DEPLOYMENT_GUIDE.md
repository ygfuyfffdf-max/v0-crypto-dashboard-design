# ═══════════════════════════════════════════════════════════════════════════
# 🚀 GUÍA COMPLETA DE DEPLOYMENT VERCEL — CHRONOS INFINITY 2026
# ═══════════════════════════════════════════════════════════════════════════
#
# Guía exhaustiva paso por paso para desplegar Chronos Infinity 2026
# en producción Vercel al 100% funcional, eficiente y perfecto
#
# Última actualización: 13 de Enero de 2026
# ═══════════════════════════════════════════════════════════════════════════

## 📋 TABLA DE CONTENIDOS

1. [Prerrequisitos](#prerrequisitos)
2. [Configuración Local](#configuración-local)
3. [Environment Variables](#environment-variables)
4. [Deployment desde VS Code](#deployment-desde-vs-code)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Optimizaciones](#optimizaciones)
8. [Monitoring](#monitoring)

---

## 1. PRERREQUISITOS

### ✅ Cuenta Vercel

```bash
# 1. Crear cuenta en vercel.com (email verificado)
# 2. Opcional: Upgrade a Pro ($20/mes) para:
#    - Edge functions ilimitadas
#    - Analytics avanzados
#    - Custom domains sin watermark
#    - Team collaboration
```

### ✅ GitHub Repository

```bash
# 1. Repo en GitHub (public o private)
# 2. Branch main/master lista
# 3. .gitignore actualizado:

node_modules/
.next/
.env
.env.local
.env.*.local
.turso/
coverage/
.vercel/
*.log
.DS_Store
drizzle/migrations/*.tmp
```

### ✅ VS Code Extensions

Instalar las siguientes extensions:

- **Vercel** (official) - Deploy directo desde VS Code
- **GitHub Pull Requests** - Integración GitHub
- **ESLint** - Linting
- **Prettier** - Formatting
- **Tailwind CSS IntelliSense** - Autocomplete Tailwind
- **Drizzle Studio** - DB management
- **Playwright Test Explorer** - E2E tests

### ✅ Local Build Verificado

```bash
# 1. Build local exitoso
pnpm build

# Verificar:
# ✅ 0 errores TypeScript
# ✅ Bundle < 250KB (tree-shaking activo)
# ✅ 71 páginas compiladas

# 2. Test local start
pnpm start

# Verificar:
# ✅ Turso DB conectada
# ✅ Shaders WebGPU renderizan
# ✅ Zero Force voz funciona (mock en dev)
```

### ✅ Tests Passing

```bash
# 1. Unit tests
pnpm test
# ✅ 1300+ tests passed (lógica GYA, métricas)

# 2. E2E tests
pnpm test:e2e
# ✅ 40+ tests passed (flujos completos)
```

---

## 2. CONFIGURACIÓN LOCAL

### Archivos de Configuración

#### `next.config.ts`

Ya configurado con:
- ✅ Output: standalone (edge deploy)
- ✅ Image optimization
- ✅ Compiler optimizations (removeConsole en prod)
- ✅ Bundle analyzer
- ✅ Turbo mode

#### `vercel.json`

Ya configurado con:
- ✅ Headers de seguridad (HSTS, X-Frame-Options, CSP)
- ✅ Functions memory/duration optimized
- ✅ Crons (cleanup, metrics)
- ✅ Git deployment branches

#### `.vercelignore`

Crear si no existe:

```bash
# Tests
__tests__/
e2e/
coverage/
*.test.ts
*.test.tsx
*.spec.ts

# Docs
docs/
*.md
!README.md

# Config local
.env.local
.env.*.local

# Cache
.turso/
node_modules/.cache/

# IDE
.vscode/
.idea/
```

#### `package.json` Scripts

Verificar scripts:

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "deploy": "vercel deploy --prod"
  }
}
```

---

## 3. ENVIRONMENT VARIABLES

### Variables Necesarias

Crear archivo `.env.example`:

```bash
# ═══════════════════════════════════════════════════════════════
# CHRONOS INFINITY 2026 — Environment Variables
# ═══════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────
# DATABASE (Turso)
# ────────────────────────────────────────────────────────────────
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# ────────────────────────────────────────────────────────────────
# AUTHENTICATION (NextAuth.js)
# ────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.vercel.app

# ────────────────────────────────────────────────────────────────
# VOICE AI (Zero Force)
# ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_ZERO_VOICE_ID=TxGEqnHWrfWFTfGW9XjX
ELEVENLABS_API_KEY=your-elevenlabs-key
DEEPGRAM_API_KEY=your-deepgram-key
OPENAI_API_KEY=your-openai-key
ASSEMBLYAI_API_KEY=your-assemblyai-key
GOOGLE_TTS_API_KEY=your-google-key

# ────────────────────────────────────────────────────────────────
# ANALYTICS (opcional)
# ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
VERCEL_ANALYTICS_DEBUG=false

# ────────────────────────────────────────────────────────────────
# OTHER
# ────────────────────────────────────────────────────────────────
NODE_ENV=production
```

### Configurar en Vercel

Dos métodos:

#### Método 1: Desde VS Code (CLI)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link proyecto
vercel link

# 4. Agregar variables (una por una)
vercel env add TURSO_DATABASE_URL production
# Pegar valor cuando pida

vercel env add TURSO_AUTH_TOKEN production
vercel env add NEXTAUTH_SECRET production
vercel env add ELEVENLABS_API_KEY production
vercel env add DEEPGRAM_API_KEY production
vercel env add OPENAI_API_KEY production
vercel env add ASSEMBLYAI_API_KEY production

# 5. Pull para verificar
vercel env pull .env.production
```

#### Método 2: Desde Dashboard Vercel

```bash
# 1. Ir a: https://vercel.com/dashboard
# 2. Seleccionar proyecto
# 3. Settings > Environment Variables
# 4. Add new variable (una por una)
# 5. Seleccionar environment: Production, Preview, Development
# 6. Save
```

---

## 4. DEPLOYMENT DESDE VS CODE

### Método 1: Vercel CLI (Recomendado)

```bash
# ═══════════════════════════════════════════════════════════════
# DEPLOY PASO POR PASO
# ═══════════════════════════════════════════════════════════════

# 1. Verificar branch actualizada
git status
git add .
git commit -m "feat: deploy production ready"
git push origin main

# 2. Verificar build local
pnpm build
# ✅ Debe completar sin errores

# 3. Deploy preview (test antes de prod)
vercel

# Salida esperada:
# ✓ Linked to chronos-infinity (created .vercel)
# ✓ Building
# ✓ Deploying
# ✓ Preview: https://chronos-infinity-abc123.vercel.app

# 4. Verificar preview
# - Abrir URL preview
# - Test flujos críticos:
#   ✓ Crear venta → distribución GYA correcta
#   ✓ Abono → capital proporcional
#   ✓ Zero Force voz (wake word "zero")
#   ✓ Shaders render 60fps
#   ✓ Offline sync funciona

# 5. Si preview OK, deploy a producción
vercel --prod

# Salida esperada:
# ✓ Production: https://chronos-infinity.vercel.app
# ✓ Assigned to custom domain (si configurado)
```

### Método 2: GitHub Auto-Deploy

```bash
# 1. Push a main activa auto-deploy
git push origin main

# 2. Vercel detecta cambios automáticamente
# 3. Build y deploy en background
# 4. Verificar en Dashboard > Deployments
```

### Método 3: Vercel Extension VS Code

```bash
# 1. Instalar extension "Vercel" en VS Code
# 2. Click ícono Vercel en sidebar
# 3. Login con cuenta
# 4. Click "Deploy to Vercel"
# 5. Seleccionar:
#    - Project: chronos-infinity
#    - Environment: Production
# 6. Click "Deploy"
```

---

## 5. POST-DEPLOYMENT

### Custom Domain (Opcional)

```bash
# 1. Dashboard Vercel > Settings > Domains
# 2. Add domain: yourdomain.com
# 3. Configurar DNS:

# Opción A: Nameservers (recomendado)
# - Cambiar nameservers en registrar:
#   ns1.vercel-dns.com
#   ns2.vercel-dns.com

# Opción B: Records
# A Record:
#   Type: A
#   Name: @
#   Value: 76.76.21.21
#   TTL: 3600

# CNAME Record:
#   Type: CNAME
#   Name: www
#   Value: cname.vercel-dns.com
#   TTL: 3600

# 4. Wait propagation (5-30 min)
# 5. Verify SSL certificate auto-issued
```

### Verificaciones Post-Deploy

```bash
# ═══════════════════════════════════════════════════════════════
# CHECKLIST POST-DEPLOY
# ═══════════════════════════════════════════════════════════════

# ✅ 1. Build exitoso
# Dashboard > Deployments > latest build log
# Verify: "Build Completed" green

# ✅ 2. Funciones serverless activas
curl https://chronos-infinity.vercel.app/api/health
# Esperado: {"status": "ok", "timestamp": ...}

# ✅ 3. Database conectada
# Dashboard > Functions > /api/ventas > Logs
# Verify: No "Database connection failed"

# ✅ 4. Analytics activas
# Dashboard > Analytics > Real-time
# Verify: Visitors registrándose

# ✅ 5. Performance metrics
# Dashboard > Speed Insights
# Esperado:
#   - TTI < 600ms
#   - FCP < 1s
#   - LCP < 2.5s
#   - CLS < 0.1

# ✅ 6. Error tracking
# Dashboard > Runtime Logs > Errors
# Verify: 0 errors recurrentes

# ✅ 7. Environment variables
vercel env ls
# Verify: Todas variables production set

# ✅ 8. Cron jobs activos
# Dashboard > Cron Jobs
# Verify: "cleanup" scheduled, last run success

# ✅ 9. Security headers
curl -I https://chronos-infinity.vercel.app
# Verify headers:
#   X-Frame-Options: DENY
#   Strict-Transport-Security: ...
#   X-Content-Type-Options: nosniff

# ✅ 10. E2E tests production
pnpm test:e2e --config playwright.config.production.ts
# Verify: All critical flows pass
```

---

## 6. TROUBLESHOOTING

### Build Errors

```bash
# ════════════════════════════════════════════════════════════════
# ERROR: "Module not found"
# ════════════════════════════════════════════════════════════════
# Causa: Dependency no instalada o import path incorrecto
# Fix:
pnpm install
vercel deploy --prod

# ════════════════════════════════════════════════════════════════
# ERROR: "TypeScript errors"
# ════════════════════════════════════════════════════════════════
# Causa: Type errors no resueltos
# Fix:
pnpm type-check
# Resolver errores mostrados
git commit -m "fix: resolve type errors"
vercel deploy --prod

# ════════════════════════════════════════════════════════════════
# ERROR: "Environment variable not defined"
# ════════════════════════════════════════════════════════════════
# Causa: Falta variable en Vercel
# Fix:
vercel env add VARIABLE_NAME production
vercel deploy --prod

# ════════════════════════════════════════════════════════════════
# ERROR: "Build timeout"
# ════════════════════════════════════════════════════════════════
# Causa: Build > 45 min (free tier limit)
# Fix: Upgrade a Pro plan o optimizar build
# vercel.json:
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Runtime Errors

```bash
# ════════════════════════════════════════════════════════════════
# ERROR: "Database connection failed"
# ════════════════════════════════════════════════════════════════
# Causa: Turso credentials incorrectas
# Fix:
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel deploy --prod

# ════════════════════════════════════════════════════════════════
# ERROR: "Function exceeded timeout"
# ════════════════════════════════════════════════════════════════
# Causa: Función tarda > maxDuration
# Fix: Optimizar query o aumentar timeout
# vercel.json:
{
  "functions": {
    "app/api/heavy-operation/**/*.ts": {
      "maxDuration": 30
    }
  }
}

# ════════════════════════════════════════════════════════════════
# ERROR: "Memory exceeded"
# ════════════════════════════════════════════════════════════════
# Causa: Función consume > 1GB memory
# Fix: Aumentar memory en vercel.json
{
  "functions": {
    "app/api/large-data/**/*.ts": {
      "memory": 3008
    }
  }
}
```

### Performance Issues

```bash
# ════════════════════════════════════════════════════════════════
# ISSUE: Latencia alta (> 1s)
# ════════════════════════════════════════════════════════════════
# Fix:
# 1. Activar Vercel Edge Config para flags
# 2. Usar ISR (Incremental Static Regeneration)
# 3. Enable caching:
export const revalidate = 60 // seconds

# ════════════════════════════════════════════════════════════════
# ISSUE: Shaders no renderizan
# ════════════════════════════════════════════════════════════════
# Fix:
# 1. Verificar WebGPU soporte browser
# 2. Enable flag: chrome://flags/#enable-unsafe-webgpu
# 3. Fallback a Canvas2D si WebGPU no disponible

# ════════════════════════════════════════════════════════════════
# ISSUE: Bundle size grande (> 500KB)
# ════════════════════════════════════════════════════════════════
# Fix:
# 1. Analizar bundle:
pnpm analyze
# 2. Dynamic imports para componentes pesados:
const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false })
# 3. Tree-shaking en next.config.ts:
{
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-three-fiber']
  }
}
```

---

## 7. OPTIMIZACIONES

### Edge Functions

```typescript
// app/api/edge/route.ts
export const runtime = 'edge'
export const preferredRegion = ['iad1', 'sfo1'] // Nearest user

export async function GET() {
  // Ultra-low latency response
  return Response.json({ status: 'ok' })
}
```

### ISR (Incremental Static Regeneration)

```typescript
// app/dashboard/page.tsx
export const revalidate = 60 // Regenerate cada 60s

export default async function DashboardPage() {
  const data = await fetchDashboardData()
  return <Dashboard data={data} />
}
```

### Image Optimization

```typescript
import Image from 'next/image'

// Optimización automática Vercel
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority
  quality={90}
/>
```

### Caching Strategy

```typescript
// app/api/ventas/route.ts
export async function GET() {
  const data = await db.query.ventas.findMany()

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}
```

---

## 8. MONITORING

### Vercel Analytics

```bash
# 1. Activar en Dashboard > Analytics
# 2. Métricas disponibles:
#    - Page views
#    - Unique visitors
#    - Top pages
#    - Referrers
#    - Countries
#    - Devices
```

### Speed Insights

```bash
# 1. Activar en Dashboard > Speed Insights
# 2. Métricas Core Web Vitals:
#    - LCP (Largest Contentful Paint) < 2.5s
#    - FID (First Input Delay) < 100ms
#    - CLS (Cumulative Layout Shift) < 0.1
#    - FCP (First Contentful Paint) < 1s
#    - TTFB (Time to First Byte) < 600ms
```

### Runtime Logs

```bash
# Dashboard > Functions > Runtime Logs
# Filtros:
#   - Errors only
#   - Specific function
#   - Time range

# CLI:
vercel logs --follow
```

### Alertas

```bash
# Dashboard > Settings > Notifications
# Configurar alertas para:
#   - Build failures
#   - Runtime errors
#   - High latency
#   - Rate limit exceeded
#   - Certificate expiration
```

---

## 9. CI/CD AUTOMATION

### GitHub Actions Workflow

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test

      - name: E2E tests
        run: pnpm test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 10. MAINTENANCE

### Updates

```bash
# Actualizar dependencies mensualmente:
pnpm update

# Verificar outdated:
pnpm outdated

# Audit seguridad:
pnpm audit

# Deploy updates:
git commit -m "chore: update dependencies"
git push origin main
```

### Rollback

```bash
# Si deploy tiene problemas, rollback instantáneo:

# Método 1: Dashboard
# Deployments > [deployment anterior] > Promote to Production

# Método 2: CLI
vercel rollback [deployment-url]
```

### Monitoring Continuo

```bash
# Setup alertas Slack/Email para:
# - Error rate > 1%
# - Latency P95 > 1s
# - Build failures
# - Certificate expiration (30 days before)
```

---

## ✅ DEPLOYMENT COMPLETADO

**Chronos Infinity 2026 ahora está desplegado en producción en Vercel.**

**URLs:**
- Production: `https://chronos-infinity.vercel.app`
- Preview: `https://chronos-infinity-[hash].vercel.app`
- Custom domain: `https://yourdomain.com` (si configurado)

**Próximos pasos:**
1. Monitor Analytics daily
2. Review Runtime Logs weekly
3. Update dependencies monthly
4. Backup database regularly
5. Test disaster recovery quarterly

---

**🎉 LANZAMIENTO EXITOSO**
