# 🚀 CHRONOS ELITE - GUÍA DE DESPLIEGUE PRODUCCIÓN VERCEL

> **Versión**: 3.0.0
> **Stack**: Next.js 16 + Turso + Drizzle + NextAuth + ElevenLabs + Deepgram + Vercel AI SDK
> **Última actualización**: Enero 2026

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos-previos)
2. [Variables de Entorno](#variables-de-entorno)
3. [Configuración Inicial](#configuración-inicial)
4. [Despliegue Paso a Paso](#despliegue-paso-a-paso)
5. [Configuración de Turso](#configuración-de-turso)
6. [Configuración de IA](#configuración-de-ia)
7. [Configuración de Voz](#configuración-de-voz)
8. [Optimizaciones de Producción](#optimizaciones-de-producción)
9. [Monitoreo y Logs](#monitoreo-y-logs)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 REQUISITOS PREVIOS

### Software Necesario

```bash
# Node.js 22+ (LTS)
node --version  # v22.x.x

# pnpm 9+
pnpm --version  # 9.x.x

# Vercel CLI
pnpm add -g vercel
vercel --version
```

### Cuentas Requeridas

| Servicio | URL | Propósito |
|----------|-----|-----------|
| **Vercel** | https://vercel.com | Hosting y despliegue |
| **Turso** | https://turso.tech | Base de datos edge |
| **xAI** | https://x.ai/api | IA principal (Grok) |
| **OpenAI** | https://platform.openai.com | IA fallback |
| **ElevenLabs** | https://elevenlabs.io | Text-to-Speech |
| **Deepgram** | https://deepgram.com | Speech-to-Text |

---

## 🔐 VARIABLES DE ENTORNO

### 🔴 CRÍTICAS (Requeridas)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de Turso | `libsql://chronos-db.turso.io` |
| `DATABASE_AUTH_TOKEN` | Token auth Turso | `eyJ...` |
| `NEXTAUTH_URL` | URL de producción | `https://chronos.vercel.app` |
| `NEXTAUTH_SECRET` | Secret JWT | `openssl rand -base64 32` |

### 🟠 IA (Al menos una requerida)

| Variable | Descripción | Prioridad |
|----------|-------------|-----------|
| `XAI_API_KEY` | xAI Grok API key | Principal |
| `OPENAI_API_KEY` | OpenAI API key | Fallback |
| `ANTHROPIC_API_KEY` | Anthropic Claude | Alternativa |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini | Alternativa |

### 🟡 VOZ (Opcional)

| Variable | Descripción | Servicio |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | ElevenLabs TTS | Síntesis de voz |
| `DEEPGRAM_API_KEY` | Deepgram STT | Transcripción |

### 🟢 PÚBLICAS

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | URL base de la app |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` |

---

## ⚙️ CONFIGURACIÓN INICIAL

### 1. Login en Vercel

```bash
vercel login
```

### 2. Linkear Proyecto

```bash
cd /path/to/chronos-elite
vercel link
```

Seleccionar:
- **Scope**: Tu organización o cuenta personal
- **Link to existing project?**: Sí (si ya existe) o No (nuevo proyecto)
- **Project name**: `chronos-elite`

### 3. Configurar Variables de Entorno

#### Método Interactivo (Recomendado)

```bash
pnpm vercel:env
# O directamente:
bash scripts/vercel-env-setup.sh
```

#### Método Manual

```bash
# Críticas
vercel env add DATABASE_URL production
vercel env add DATABASE_AUTH_TOKEN production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# IA
vercel env add XAI_API_KEY production
vercel env add OPENAI_API_KEY production

# Voz (opcional)
vercel env add ELEVENLABS_API_KEY production
vercel env add DEEPGRAM_API_KEY production

# Verificar
vercel env ls
```

---

## 🚀 DESPLIEGUE PASO A PASO

### Opción A: Script Automático

```bash
pnpm deploy
# O directamente:
bash scripts/deploy-production.sh
```

### Opción B: Comandos Manuales

```bash
# 1. Verificar código
pnpm pre-deploy  # lint + type-check + build

# 2. Deploy a preview
pnpm deploy:preview

# 3. Verificar preview funciona correctamente

# 4. Deploy a producción
pnpm deploy:prod
```

### Opción C: Git Push (CI/CD Automático)

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# Vercel despliega automáticamente
```

---

## 🗄️ CONFIGURACIÓN DE TURSO

### 1. Crear Base de Datos

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear base de datos
turso db create chronos-db

# Obtener URL
turso db show chronos-db --url
# Output: libsql://chronos-db-[org].turso.io

# Crear token
turso db tokens create chronos-db
```

### 2. Migrar Schema

```bash
# Local
pnpm db:push

# O ejecutar migraciones
pnpm db:migrate
```

### 3. Seed Inicial (Opcional)

```bash
pnpm db:seed
```

---

## 🤖 CONFIGURACIÓN DE IA

### Proveedores Soportados

| Proveedor | Modelo Principal | Uso |
|-----------|-----------------|-----|
| **xAI** | Grok-2 Latest | Chat principal |
| **OpenAI** | GPT-4 Turbo | Fallback |
| **Anthropic** | Claude 3.5 Sonnet | Análisis |
| **Google** | Gemini 1.5 Pro | Alternativa |

### Orden de Prioridad

El sistema usa automáticamente el primer proveedor disponible:

1. xAI Grok (si `XAI_API_KEY` existe)
2. OpenAI GPT (si `OPENAI_API_KEY` existe)
3. Anthropic Claude (si `ANTHROPIC_API_KEY` existe)
4. Google Gemini (si `GOOGLE_GENERATIVE_AI_API_KEY` existe)

### Verificar Configuración

```typescript
// En app/lib/ai/gateway-config.ts
import { checkApiKeys } from '@/app/lib/ai/gateway-config'
console.log(checkApiKeys())
// { xai: true, openai: true, anthropic: false, google: false }
```

---

## 🔊 CONFIGURACIÓN DE VOZ

### ElevenLabs (Text-to-Speech)

1. Crear cuenta en https://elevenlabs.io
2. Obtener API key en Settings > API Keys
3. Configurar en Vercel:
   ```bash
   vercel env add ELEVENLABS_API_KEY production
   ```

**Voces Disponibles**:
- `sofia` - Spanish female (default)
- `miguel` - Spanish male
- `chronos` - Assistant voice

### Deepgram (Speech-to-Text)

1. Crear cuenta en https://console.deepgram.com
2. Crear API key con permisos de transcripción
3. Configurar en Vercel:
   ```bash
   vercel env add DEEPGRAM_API_KEY production
   ```

**Modelo Usado**: Nova-2 (optimizado para español)

---

## ⚡ OPTIMIZACIONES DE PRODUCCIÓN

### Configuración de vercel.json

```json
{
  "regions": ["iad1", "sfo1", "cdg1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "app/api/ai/**/*.ts": {
      "maxDuration": 120,
      "memory": 1024
    }
  }
}
```

### Headers de Seguridad

Ya configurados automáticamente:
- ✅ HSTS (Strict-Transport-Security)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### Cache Headers

- Assets estáticos: 1 año (`immutable`)
- Imágenes: 1 año
- Fonts: 1 año

---

## 📊 MONITOREO Y LOGS

### Ver Logs en Tiempo Real

```bash
pnpm vercel:logs
# O:
vercel logs --follow
```

### Dashboard de Vercel

1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto `chronos-elite`
3. Ver:
   - Deployments
   - Analytics
   - Logs
   - Speed Insights

### Integración con Sentry (Opcional)

```bash
vercel env add SENTRY_DSN production
```

---

## 🔧 TROUBLESHOOTING

### Error: Build Failed

```bash
# 1. Verificar localmente
pnpm build

# 2. Revisar logs de Vercel
vercel logs

# 3. Limpiar cache
rm -rf .next node_modules/.cache
pnpm install
pnpm build
```

### Error: Database Connection

```bash
# 1. Verificar URL de Turso
turso db show chronos-db --url

# 2. Verificar token
turso db tokens create chronos-db

# 3. Actualizar en Vercel
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
```

### Error: API Key Invalid

```bash
# 1. Verificar variable está configurada
vercel env ls

# 2. Eliminar y recrear
vercel env rm XAI_API_KEY production
vercel env add XAI_API_KEY production
```

### Error: Function Timeout

Ajustar en `vercel.json`:
```json
{
  "functions": {
    "app/api/ai/**/*.ts": {
      "maxDuration": 120
    }
  }
}
```

---

## 📝 COMANDOS RÁPIDOS

| Comando | Descripción |
|---------|-------------|
| `pnpm deploy` | Script completo de despliegue |
| `pnpm deploy:preview` | Despliegue a preview |
| `pnpm deploy:prod` | Despliegue a producción |
| `pnpm vercel:env` | Configurar variables interactivo |
| `pnpm vercel:logs` | Ver logs en tiempo real |
| `pnpm pre-deploy` | Validar antes de desplegar |
| `vercel rollback` | Revertir a versión anterior |
| `vercel promote` | Promover preview a producción |

---

## 🔗 RECURSOS

- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Next.js 16](https://nextjs.org/docs)
- [Documentación Turso](https://docs.turso.tech)
- [Documentación Drizzle](https://orm.drizzle.team/docs/overview)
- [Documentación ElevenLabs](https://docs.elevenlabs.io)
- [Documentación Deepgram](https://developers.deepgram.com)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

**🚀 CHRONOS ELITE - Desplegado con éxito en Vercel**

> Para soporte, revisar los logs de Vercel o contactar al equipo de desarrollo.
