# 🔐 CONFIGURACIÓN RÁPIDA DE VARIABLES DE ENTORNO

## ⚡ MÉTODO 1: SCRIPT AUTOMATIZADO (RECOMENDADO)

```bash
./setup-vercel-env.sh
```

**El script te preguntará**:

1. ¿Qué variables configurar? (Solo críticas / Todas / Generar archivo)
2. ¿A qué ambientes? (Production / Preview / Ambos)
3. ¡Y las configura automáticamente!

---

## 🎯 MÉTODO 2: CONFIGURACIÓN MANUAL

### Paso 1: Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

**Resultado**: `qT8vN2xR7pK9wL4mF6jH1yD5nS3cZ8aE0uB9tV7iO2=` (ejemplo)

### Paso 2: Ir a Vercel Dashboard

🌐 **URL**: https://vercel.com/dashboard

1. **Seleccionar** tu proyecto: `v0-crypto-dashboard-design`
2. **Navegar a**: `Settings` → `Environment Variables`
3. **Click**: `Add New`

### Paso 3: Agregar Variables Críticas (4)

#### 1. DATABASE_URL

- **Name**: `DATABASE_URL`
- **Value**: `libsql://chronos-infinity-2026-zoro488.aws-us-west-2.turso.io`
- **Environments**: ✅ Production, ✅ Preview

#### 2. DATABASE_AUTH_TOKEN

- **Name**: `DATABASE_AUTH_TOKEN`
- **Value**: (copiar de `.env.local`)

```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njg0ODAwNjcsImlkIjoiZWYyMGY1NTItZDE2OC00MDA0LWI5NjYtMmZlZTUwYTA3NTRkIiwicmlkIjoiODQxZDgwOTctMGEwNC00MTI4LWJhNDUtYjA0OGIyYjQ2NTk2In0.oB9N5IL20VxnnRVlVKBW-e6BwYFQu1yPY0A9nRbTKYDhomUr7Ygrd_NIhD6_UyQVCe5SjwzWxTKnMgHxd_PmDA
```

- **Environments**: ✅ Production, ✅ Preview

#### 3. NEXTAUTH_URL

- **Name**: `NEXTAUTH_URL`
- **Value**: Tu dominio de Vercel
  - Si aún no has deployado: `https://v0-crypto-dashboard-design.vercel.app`
  - Actualizar después del primer deploy con tu URL real
- **Environments**: ✅ Production, ✅ Preview

#### 4. NEXTAUTH_SECRET

- **Name**: `NEXTAUTH_SECRET`
- **Value**: (el generado con openssl)
- **Environments**: ✅ Production, ✅ Preview

---

## 🤖 VARIABLES DE IA (OPCIONAL)

### APIs de IA (Si quieres funcionalidad de voz y chat)

#### XAI (Grok)

- **Name**: `XAI_API_KEY`
- **Value**: (copiar de `.env.local`)

#### ElevenLabs (Text-to-Speech)

- **Name**: `ELEVENLABS_API_KEY`
- **Value**: (copiar de `.env.local`)
- **Name**: `ELEVENLABS_VOICE_ID`
- **Value**: `IKne3meq5aSn9XLyUdCD`
- **Name**: `ELEVENLABS_MODEL_ID`
- **Value**: `eleven_turbo_v2_5`

#### Deepgram (Speech-to-Text)

- **Name**: `DEEPGRAM_API_KEY`
- **Value**: (copiar de `.env.local`)
- **Name**: `DEEPGRAM_MODEL`
- **Value**: `nova-2`

#### OpenAI (Fallback)

- **Name**: `OPENAI_API_KEY`
- **Value**: (copiar de `.env.local`)

#### GitHub Models (GRATIS - Alternativa)

- **Name**: `GITHUB_MODELS_ENDPOINT`
- **Value**: `https://models.inference.ai.azure.com`
- **Name**: `GITHUB_MODEL_PRIMARY`
- **Value**: `openai/gpt-4o`
- **Name**: `GITHUB_MODEL_REASONING`
- **Value**: `deepseek/deepseek-r1`
- **Name**: `GITHUB_MODEL_FAST`
- **Value**: `openai/gpt-4o-mini`

### Variables Públicas (UI)

- **Name**: `NEXT_PUBLIC_ENABLE_VOICE`
- **Value**: `true`
- **Name**: `NEXT_PUBLIC_VOICE_LANGUAGE`
- **Value**: `es`
- **Name**: `NEXT_PUBLIC_AI_NAME`
- **Value**: `Zero Force`

---

## 📋 MÉTODO 3: VIA VERCEL CLI

```bash
export PATH="/home/vscode/.local/share/pnpm:$PATH"

# Agregar variables una por una
vercel env add DATABASE_URL production
# Pega el valor cuando te lo pida

vercel env add DATABASE_AUTH_TOKEN production
# Pega el valor cuando te lo pida

vercel env add NEXTAUTH_URL production
# Ingresa tu URL de Vercel

vercel env add NEXTAUTH_SECRET production
# Pega el secret generado
```

---

## 🎬 MÉTODO 4: GENERAR ARCHIVO .ENV.PRODUCTION

```bash
./setup-vercel-env.sh
# Seleccionar opción 3: "Generar archivo .env.production"
```

Luego copiar las variables del archivo generado a Vercel Dashboard.

---

## ✅ VERIFICAR CONFIGURACIÓN

### Ver variables configuradas

```bash
export PATH="/home/vscode/.local/share/pnpm:$PATH"
vercel env ls
```

### Descargar variables (para verificar)

```bash
vercel env pull .env.vercel
cat .env.vercel
```

---

## 🚀 DESPUÉS DE CONFIGURAR

Una vez configuradas las variables:

### Opción A: Deploy Automatizado

```bash
./deploy.sh
```

### Opción B: Deploy Manual

```bash
export PATH="/home/vscode/.local/share/pnpm:$PATH"
vercel --prod
```

---

## 🐛 TROUBLESHOOTING

### Error: "Missing NEXTAUTH_SECRET"

**Solución**: Verificar que se agregó correctamente en Vercel Dashboard

### Error: "Database connection failed"

**Solución**: Verificar `DATABASE_URL` y `DATABASE_AUTH_TOKEN`

### Error: "Invalid NEXTAUTH_URL"

**Solución**: Debe ser HTTPS (excepto localhost). Formato: `https://tu-app.vercel.app`

---

## 📊 CHECKLIST

Marca cuando hayas configurado:

**Variables Críticas** (Obligatorias):

- [ ] DATABASE_URL
- [ ] DATABASE_AUTH_TOKEN
- [ ] NEXTAUTH_URL
- [ ] NEXTAUTH_SECRET

**Variables de IA** (Opcionales):

- [ ] XAI_API_KEY
- [ ] ELEVENLABS_API_KEY
- [ ] DEEPGRAM_API_KEY
- [ ] OPENAI_API_KEY
- [ ] GitHub Models (4 variables)
- [ ] Voice Settings (3 variables públicas)

**Después de configurar**:

- [ ] Verificar con `vercel env ls`
- [ ] Ejecutar `./deploy.sh`
- [ ] Validar deployment en preview
- [ ] Deploy a producción

---

**🎯 LISTO**: Una vez marcadas las 4 variables críticas, ¡puedes deployar!

```bash
./deploy.sh
```
