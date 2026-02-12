# 🔧 Configuración Completa: Git, GitHub, Vercel, Turso, ElevenLabs, Clerk

Guía paso a paso para conectar y configurar todos los servicios del proyecto CHRONOS INFINITY.

---

## 📋 Índice

1. [Git y GitHub](#1-git-y-github)
2. [Clerk (Autenticación)](#2-clerk-autenticación)
3. [Turso (Base de Datos)](#3-turso-base-de-datos)
4. [ElevenLabs (Voz)](#4-elevenlabs-voz)
5. [Vercel (Hosting)](#5-vercel-hosting)
6. [Integración Final](#6-integración-final)

---

## 1. Git y GitHub

### 1.1 Inicializar repositorio (si no existe)

```powershell
cd v0-crypto-dashboard-design-feature-3d-integration-panels
git init
git add .
git commit -m "Initial commit - CHRONOS INFINITY"
```

### 1.2 Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre sugerido: `chronos-infinity` o `v0-crypto-dashboard`
3. Visibilidad: **Private** (recomendado) o Public
4. **NO** marques "Add README" si ya tienes código
5. Click **Create repository**

### 1.3 Conectar y subir

```powershell
# Añadir remoto (reemplaza USER y REPO con tus datos)
git remote add origin https://github.com/USUARIO/REPOSITORIO.git

# O con SSH
git remote add origin git@github.com:USUARIO/REPOSITORIO.git

# Subir código
git branch -M main
git push -u origin main
```

### 1.4 Configurar rama por defecto

En GitHub: **Settings** → **Branches** → Default branch: `main`

---

## 2. Clerk (Autenticación)

### 2.1 Crear cuenta

1. Ve a [clerk.com](https://clerk.com)
2. Sign up / Login
3. Click **Create application**
4. Nombre: `CHRONOS INFINITY`
5. Elige métodos de login: Email, Google, etc.

### 2.2 Obtener API Keys

1. En el dashboard de Clerk → **API Keys**
2. Copia:
   - **Publishable key** (empieza con `pk_test_` o `pk_live_`)
   - **Secret key** (empieza con `sk_test_` o `sk_live_`)

### 2.3 Configurar URLs de redirección

En Clerk → **Paths**:

| Configuración | Valor |
|---------------|-------|
| Sign-in URL | `/login` |
| Sign-up URL | `/register` |
| After sign-in URL | `/dashboard` o `/welcome` |
| After sign-up URL | `/dashboard` o `/welcome` |

### 2.4 Variables de entorno Clerk

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxx

# URLs (opcionales, tienen defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2.5 Webhook para producción (opcional)

En Clerk → **Webhooks** → Add endpoint:
- URL: `https://tu-dominio.vercel.app/api/webhooks/clerk`
- Eventos: `user.created`, `user.updated`, `user.deleted`

---

## 3. Turso (Base de Datos)

### 3.1 Instalar Turso CLI

**Windows (PowerShell):**
```powershell
irm get.turso.tech/install.ps1 | iex
```

**O con npm:**
```powershell
npm install -g turso
```

### 3.2 Crear cuenta y base de datos

```powershell
# Login
turso auth login

# Crear base de datos
turso db create chronos-infinity --region iad

# Obtener URL
turso db show chronos-infinity --url

# Crear token de acceso
turso db tokens create chronos-infinity
```

### 3.3 Ejecutar migraciones

```powershell
cd v0-crypto-dashboard-design-feature-3d-integration-panels

# Configurar variables antes
$env:TURSO_DATABASE_URL = "libsql://chronos-infinity-xxx.turso.io"
$env:TURSO_AUTH_TOKEN = "tu-token-aqui"

# Aplicar esquema
pnpm db:push

# O ejecutar migraciones
pnpm db:migrate

# (Opcional) Seed de datos iniciales
pnpm db:seed
```

### 3.4 Variables de entorno Turso

```env
TURSO_DATABASE_URL=libsql://chronos-infinity-xxxxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

> **Nota:** El proyecto usa `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` (no DATABASE_URL). Ver `drizzle.config.ts` y `database/index.ts`.

---

## 4. ElevenLabs (Voz)

### 4.1 Crear cuenta

1. Ve a [elevenlabs.io](https://elevenlabs.io)
2. Sign up (plan gratuito disponible)
3. Dashboard → **Profile** → **API Key**
4. Copia tu API Key (empieza con `el_`)

### 4.2 Obtener Voice ID (opcional)

1. En ElevenLabs → **Voices**
2. Elige una voz (ej: "Rachel", "Adam")
3. El Voice ID está en la URL o en los detalles (ej: `IKne3meq5aSn9XLyUdCD`)

### 4.3 Variables de entorno ElevenLabs

```env
ELEVENLABS_API_KEY=el_xxxxxxxxxxxxx

# Opcionales
ELEVENLABS_VOICE_ID=IKne3meq5aSn9XLyUdCD
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
```

### 4.4 Deepgram (Speech-to-Text, opcional)

Para transcripción de voz:
1. Ve a [deepgram.com](https://deepgram.com)
2. Crea cuenta y obtén API Key (empieza con `dg_`)

```env
DEEPGRAM_API_KEY=dg_xxxxxxxxxxxxx
DEEPGRAM_MODEL=nova-2
```

---

## 5. Vercel (Hosting)

### 5.1 Crear cuenta

1. Ve a [vercel.com](https://vercel.com)
2. Sign up con GitHub (recomendado para integración automática)

### 5.2 Conectar proyecto

1. **New Project** → Import from **GitHub**
2. Selecciona tu repositorio
3. **Import**

### 5.3 Configurar proyecto

| Configuración | Valor |
|---------------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `v0-crypto-dashboard-design-feature-3d-integration-panels` (si el repo tiene subcarpeta) o `.` (si el repo es el proyecto directo) |
| **Build Command** | `pnpm build` |
| **Output Directory** | `.next` (default) |
| **Install Command** | `pnpm install` |

### 5.4 Variables de entorno en Vercel

En **Settings** → **Environment Variables**, añade:

#### Críticas (obligatorias)

| Name | Value | Environments |
|------|-------|--------------|
| `TURSO_DATABASE_URL` | `libsql://xxx.turso.io` | Production, Preview |
| `TURSO_AUTH_TOKEN` | `eyJ...` | Production, Preview |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Production, Preview |
| `CLERK_SECRET_KEY` | `sk_test_...` | Production, Preview |

#### Opcionales (IA y Voz)

| Name | Value | Environments |
|------|-------|--------------|
| `ELEVENLABS_API_KEY` | `el_...` | Production, Preview |
| `DEEPGRAM_API_KEY` | `dg_...` | Production, Preview |
| `OPENAI_API_KEY` | `sk-...` | Production, Preview |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview |

### 5.5 Deploy

- **Automático:** Cada push a `main` despliega a producción
- **Preview:** Cada PR genera un preview
- **Manual:** `vercel --prod` desde CLI

### 5.6 Configurar dominio (opcional)

En **Settings** → **Domains** → Add: `tu-dominio.com`

---

## 6. Integración Final

### 6.1 Archivo .env.local completo

Crea `v0-crypto-dashboard-design-feature-3d-integration-panels/.env.local`:

```env
# ═══ TURSO (Base de datos) ═══
TURSO_DATABASE_URL=libsql://chronos-infinity-xxxxx.turso.io
TURSO_AUTH_TOKEN=tu-token-aqui

# ═══ CLERK (Autenticación) ═══
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ═══ ELEVENLABS (Voz) ═══
ELEVENLABS_API_KEY=el_xxxxx
ELEVENLABS_VOICE_ID=IKne3meq5aSn9XLyUdCD
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5

# ═══ DEEPGRAM (Speech-to-Text) - Opcional ═══
DEEPGRAM_API_KEY=dg_xxxxx
DEEPGRAM_MODEL=nova-2

# ═══ OPENAI (IA) - Opcional ═══
OPENAI_API_KEY=sk-xxxxx

# ═══ App ═══
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development
```

### 6.2 GitHub Secrets (para CI/CD)

En tu repo GitHub → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Descripción |
|--------|-------------|
| `TURSO_DATABASE_URL` | URL de Turso |
| `TURSO_AUTH_TOKEN` | Token de Turso |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable |
| `CLERK_SECRET_KEY` | Clerk Secret |
| `ELEVENLABS_API_KEY` | ElevenLabs (opcional) |
| `DEEPGRAM_API_KEY` | Deepgram (opcional) |
| `OPENAI_API_KEY` | OpenAI (opcional) |
| `VERCEL_TOKEN` | Para deploy automático |
| `ORG_ID` | Vercel Org ID |
| `PROJECT_ID` | Vercel Project ID |

#### Cómo obtener Vercel Token, Org ID y Project ID

```powershell
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Vincular proyecto
vercel link

# Los IDs están en .vercel/project.json
# Para el token: vercel.com/account/tokens → Create
```

### 6.3 Verificar configuración

```powershell
cd v0-crypto-dashboard-design-feature-3d-integration-panels

# Instalar dependencias
pnpm install

# Verificar conexión a DB (con .env.local configurado)
pnpm db:push

# Desarrollo
pnpm dev
```

Abre http://localhost:3000 y verifica:
- ✅ Login/Register (Clerk)
- ✅ Dashboard carga
- ✅ Sin errores en consola

### 6.4 Deploy a producción

```powershell
# Opción 1: Push a main (si CI/CD está configurado)
git add .
git commit -m "feat: configuración completa de servicios"
git push origin main

# Opción 2: Deploy manual con Vercel CLI
vercel --prod
```

---

## 📋 Checklist Final

- [ ] Repositorio en GitHub creado y conectado
- [ ] Clerk: cuenta creada, API keys configuradas
- [ ] Turso: base de datos creada, migraciones ejecutadas
- [ ] ElevenLabs: API key configurada
- [ ] Vercel: proyecto importado, variables configuradas
- [ ] .env.local creado con todas las variables
- [ ] GitHub Secrets configurados (si usas CI/CD)
- [ ] pnpm dev funciona localmente
- [ ] Deploy a producción exitoso

---

## 🆘 Solución de Problemas

### Error: "TURSO_DATABASE_URL is not defined"
- Verifica que `.env.local` existe y tiene `TURSO_DATABASE_URL`
- Reinicia el servidor de desarrollo

### Error: "Clerk: Invalid publishable key"
- Usa `pk_test_` para desarrollo, `pk_live_` para producción
- Verifica que no hay espacios extra en el valor

### Error: "Database connection failed"
- Verifica que el token de Turso no ha expirado
- Ejecuta `turso db tokens create chronos-infinity` para generar uno nuevo

### Build falla en Vercel
- Verifica que **Root Directory** está configurado correctamente
- Revisa que todas las variables de entorno están en Vercel
- Revisa los logs de build en Vercel Dashboard

---

**Última actualización:** 2026-02-12
