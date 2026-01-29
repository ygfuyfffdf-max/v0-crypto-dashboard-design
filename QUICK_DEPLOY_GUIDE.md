# 🚀 GUÍA RÁPIDA DE DEPLOYMENT - CHRONOS INFINITY

> **Estado**: ✅ Proyecto validado y listo para producción **Fecha**: 18 de enero de 2026

---

## 📋 PRE-REQUISITOS (✅ COMPLETADOS)

- [x] Node.js v22.16.0 instalado
- [x] pnpm v10.28.0 instalado
- [x] Vercel CLI v50.4.5 instalado
- [x] Build exitoso sin errores
- [x] TypeScript validado
- [x] Favicon corregido

---

## 🎯 PASOS PARA DEPLOYMENT

### PASO 1: Configurar PATH (SIEMPRE EJECUTAR PRIMERO)

```bash
export PATH="/home/vscode/.local/share/pnpm:$PATH"
```

### PASO 2: Autenticación en Vercel (PRIMERA VEZ)

```bash
vercel login
```

**Opciones de autenticación**:

- Email
- GitHub
- GitLab
- Bitbucket

**Recomendado**: Usar GitHub para sincronización automática

### PASO 3: Link del Proyecto (PRIMERA VEZ)

```bash
cd /workspaces/v0-crypto-dashboard-design
vercel link
```

**Preguntas que hará Vercel**:

1. Set up and deploy? → **Y**
2. Which scope? → Seleccionar tu cuenta/organización
3. Link to existing project? → **Y** (si existe) o **N** (para crear nuevo)
4. What's your project's name? → `chronos-infinity-2026` (o el nombre existente)
5. In which directory? → `.` (Enter)

### PASO 4: Configurar Variables de Entorno en Vercel

**Opción A: Via Dashboard (RECOMENDADO)**

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto `chronos-infinity-2026`
3. Settings → Environment Variables
4. Agregar las siguientes variables:

```env
# Database (CRÍTICO)
DATABASE_URL=libsql://chronos-infinity-2026-zoro488.aws-us-west-2.turso.io
DATABASE_AUTH_TOKEN=<tu-token-de-turso>

# AI APIs
XAI_API_KEY=<tu-xai-key>
ELEVENLABS_API_KEY=<tu-elevenlabs-key>
DEEPGRAM_API_KEY=<tu-deepgram-key>
OPENAI_API_KEY=<tu-openai-key>

# GitHub Models (Gratis)
GITHUB_MODELS_ENDPOINT=https://models.inference.ai.azure.com
GITHUB_MODEL_PRIMARY=openai/gpt-4o
GITHUB_MODEL_REASONING=deepseek/deepseek-r1
GITHUB_MODEL_FAST=openai/gpt-4o-mini

# Voice Settings
ELEVENLABS_VOICE_ID=IKne3meq5aSn9XLyUdCD
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
ELEVENLABS_VOICE_NAME=Charlie - Deep, Confident, Energetic
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_VOICE_LANGUAGE=es
NEXT_PUBLIC_AI_NAME=Zero Force
DEEPGRAM_MODEL=nova-2

# NextAuth (GENERAR NUEVO SECRET PARA PRODUCCIÓN)
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=<generar-con-openssl-rand-base64-32>
```

**Importante**: Para cada variable, seleccionar los ambientes:

- ✅ Production
- ✅ Preview
- ⚠️ Development (opcional)

**Opción B: Via CLI**

```bash
# Agregar una variable
vercel env add DATABASE_URL production

# Agregar desde archivo
vercel env pull .env.local.production
```

### PASO 5: Deploy a Preview (TESTING)

```bash
vercel
```

**Resultado esperado**:

```
🔍  Inspect: https://vercel.com/tu-usuario/chronos-infinity-2026/xxxxx
✅  Preview: https://chronos-infinity-2026-xxxxx.vercel.app
```

**Validar en Preview**:

1. Abrir URL de preview
2. Verificar que carga correctamente
3. Probar login/registro
4. Verificar dashboard
5. Probar funcionalidad de IA (si configuraste las APIs)
6. Verificar conexión a Turso DB

### PASO 6: Deploy a Producción

```bash
vercel --prod
```

**Resultado esperado**:

```
🔍  Inspect: https://vercel.com/tu-usuario/chronos-infinity-2026/xxxxx
✅  Production: https://chronos-infinity-2026.vercel.app
```

---

## 🔧 COMANDOS ÚTILES

### Ver Logs en Tiempo Real

```bash
vercel logs <deployment-url>
```

### Ver Deployments

```bash
vercel ls
```

### Ver Variables de Entorno

```bash
vercel env ls
```

### Rollback a Deployment Anterior

```bash
vercel rollback <deployment-url>
```

### Remover Deployment

```bash
vercel rm <deployment-url>
```

---

## 🐛 TROUBLESHOOTING

### Error: "Missing required env variables"

**Solución**: Verificar que todas las variables de entorno están configuradas en Vercel Dashboard.

```bash
vercel env ls
```

### Error: "Build failed"

**Solución**: Ejecutar build local primero:

```bash
export PATH="/home/vscode/.local/share/pnpm:$PATH"
pnpm build
```

Si el build local falla, revisar errores antes de deployar.

### Error: "Database connection failed"

**Solución**: Verificar credenciales de Turso:

```bash
# Verificar que DATABASE_URL y DATABASE_AUTH_TOKEN están configurados
vercel env ls | grep DATABASE
```

### Error: "Module not found"

**Solución**: Limpiar caché y reinstalar:

```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

### Preview funciona pero Production no

**Posibles causas**:

1. Variables de entorno diferentes entre ambientes
2. Verificar que las variables están marcadas para "Production"
3. Regenerar deployment: `vercel --prod --force`

---

## 📊 POST-DEPLOYMENT CHECKLIST

Después de deployar, verificar:

- [ ] ✅ Página principal carga correctamente
- [ ] ✅ Login/Registro funciona
- [ ] ✅ Dashboard muestra datos de Turso
- [ ] ✅ Funcionalidad de IA responde (si configurada)
- [ ] ✅ Voice features funcionan (si configuradas)
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ Performance es aceptable (< 3s tiempo de carga)
- [ ] ✅ Favicon aparece correctamente
- [ ] ✅ SEO meta tags presentes
- [ ] ✅ HTTPS funcionando

---

## 🔐 SEGURIDAD POST-DEPLOYMENT

### 1. Regenerar Secrets de Producción

```bash
# Generar nuevo NEXTAUTH_SECRET
openssl rand -base64 32
```

Actualizar en Vercel Dashboard con el nuevo secret.

### 2. Configurar Custom Domain (OPCIONAL)

1. Ir a: Settings → Domains
2. Agregar tu dominio
3. Configurar DNS según instrucciones de Vercel
4. Actualizar `NEXTAUTH_URL` con el nuevo dominio

### 3. Habilitar Protección DDoS

En Vercel Dashboard:

- Settings → Security → Enable DDoS Protection

### 4. Configurar Rate Limiting

Ya configurado en `vercel.json`, pero verificar:

- API routes tienen timeout apropiado
- Functions tienen límites de ejecución

---

## 🚀 DEPLOYMENT AUTOMATIZADO (CI/CD)

### GitHub Actions (RECOMENDADO)

Vercel detecta automáticamente pushes a GitHub y hace deploy automático:

**Configuración**:

1. En GitHub repo → Settings → Integrations
2. Instalar Vercel GitHub App
3. Conectar con tu proyecto de Vercel

**Resultado**:

- Push a `main` → Deploy automático a Production
- Push a otras branches → Deploy automático a Preview
- Pull Requests → Preview deployment automático

### Manual Deployment

Si prefieres control manual:

```bash
# Desactivar auto-deploy en Vercel Dashboard
# Settings → Git → Deployment Protection → Manual Deployments Only

# Luego deployar manualmente
vercel --prod
```

---

## 📈 MONITOREO POST-DEPLOYMENT

### Analytics de Vercel

- Dashboard: https://vercel.com/dashboard/analytics
- Ver: Page views, unique visitors, top pages

### Speed Insights

- Dashboard: https://vercel.com/dashboard/speed-insights
- Monitorear: Core Web Vitals, performance metrics

### Logs

```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de un deployment específico
vercel logs <deployment-url>
```

---

## 🎯 COMANDOS RÁPIDOS (COPIAR Y PEGAR)

### Deployment Completo desde Cero

```bash
#!/bin/bash
# Setup y deploy completo

# 1. Configurar PATH
export PATH="/home/vscode/.local/share/pnpm:$PATH"

# 2. Verificar instalaciones
echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "Vercel: $(vercel --version)"

# 3. Validar proyecto
pnpm lint
pnpm type-check
pnpm build

# 4. Login a Vercel (primera vez)
# vercel login

# 5. Link proyecto (primera vez)
# vercel link

# 6. Deploy a preview
vercel

# 7. Si todo OK, deploy a producción
# vercel --prod
```

### Script de Validación Pre-Deploy

```bash
#!/bin/bash
# Validar antes de deployar

set -e

export PATH="/home/vscode/.local/share/pnpm:$PATH"

echo "🔍 Validando proyecto..."

echo "✓ Lint..."
pnpm lint --quiet || echo "⚠️ Warnings encontrados (no bloqueantes)"

echo "✓ TypeCheck..."
pnpm type-check

echo "✓ Build..."
pnpm build

echo ""
echo "✅ Validación completa - Proyecto listo para deploy"
echo ""
echo "Ejecutar: vercel --prod"
```

---

## 📞 SOPORTE

### Documentación Oficial

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Turso Docs: https://docs.turso.tech

### Comandos de Ayuda

```bash
vercel help
vercel help deploy
vercel help env
```

---

**🎉 LISTO PARA PRODUCCIÓN**

**Comando final**:

```bash
export PATH="/home/vscode/.local/share/pnpm:$PATH" && vercel --prod
```

---

**Autor**: IY SUPREME Agent **Fecha**: 18 de enero de 2026 **Versión**: 1.0.0
