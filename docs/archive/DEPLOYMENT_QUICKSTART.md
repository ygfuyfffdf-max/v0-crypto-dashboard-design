# 🚀 GUÍA RÁPIDA DE DEPLOYMENT VERCEL — CHRONOS INFINITY 2026

## ⚡ DEPLOYMENT AUTOMÁTICO (RECOMENDADO)

### Opción 1: Script Todo-en-Uno
```bash
./scripts/deploy-vercel.sh
```

Este script ejecuta automáticamente:
1. ✅ Verificaciones pre-deployment
2. 🧹 Limpieza de builds anteriores
3. 🔍 TypeScript + Lint check
4. 🔐 Login Vercel
5. 🔗 Link proyecto
6. 🚀 Deployment (preview o production)

---

## 🔧 DEPLOYMENT MANUAL (PASO POR PASO)

### PASO 1: Instalar Vercel CLI

```bash
npm install -g vercel
# o con sudo si hay permisos
sudo npm install -g vercel
```

### PASO 2: Login a Vercel

```bash
vercel login
# Abrir navegador y autorizar
```

### PASO 3: Configurar Environment Variables

**Opción A: Script Interactivo**
```bash
./scripts/setup-vercel-env.sh
```

**Opción B: Manual desde Dashboard**
1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto
3. Settings > Environment Variables
4. Agregar cada variable (ver lista abajo)

**Variables REQUERIDAS:**
```bash
DATABASE_URL=libsql://tu-db.turso.io
DATABASE_AUTH_TOKEN=tu-token-turso
NEXTAUTH_SECRET=generado-con-openssl-rand-base64-32
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

**Variables OPCIONALES (recomendadas):**
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=el_...
DEEPGRAM_API_KEY=dg_...
NEXT_PUBLIC_ZERO_VOICE_ID=TxGEqnHWrfWFTfGW9XjX
GOOGLE_TTS_API_KEY=AIza...
ASSEMBLYAI_API_KEY=...
```

### PASO 4: Link Proyecto

```bash
cd /workspaces/v0-crypto-dashboard-design
vercel link
# Seguir prompts:
# - Link to existing project? Y
# - Seleccionar org/team
# - Seleccionar proyecto o crear nuevo
```

### PASO 5: Deploy Preview (Testing)

```bash
vercel
# Deploy a rama actual como preview
# URL: https://chronos-infinity-[hash].vercel.app
```

### PASO 6: Deploy Production

```bash
vercel --prod
# Deploy a production
# URL: https://chronos-infinity.vercel.app
# o tu custom domain
```

---

## 📋 CONFIGURACIÓN DE TURSO

### 1. Crear Database en Turso

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear database
turso db create chronos-db --location lhr

# Obtener URL
turso db show chronos-db --url

# Crear token
turso db tokens create chronos-db
```

### 2. Agregar Credenciales a Vercel

```bash
# Via CLI
echo "libsql://chronos-db-[user].turso.io" | vercel env add DATABASE_URL production
echo "[tu-token]" | vercel env add DATABASE_AUTH_TOKEN production

# O via Dashboard en Vercel
```

### 3. Push Schema a Turso

```bash
# Desde local
npm run db:push

# O via Drizzle Studio
npm run db:studio
```

---

## 🔗 CONFIGURAR CUSTOM DOMAIN (OPCIONAL)

### Dashboard Vercel

1. Ir a: Settings > Domains
2. Add domain: `tudominio.com`
3. Configurar DNS:

**Opción A: Nameservers (Recomendado)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Opción B: Records**
```
A Record:
  Name: @
  Value: 76.76.21.21
  TTL: 3600

CNAME Record:
  Name: www
  Value: cname.vercel-dns.com
  TTL: 3600
```

4. Esperar propagación (5-30 min)
5. ✅ SSL auto-issued por Vercel

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Verificaciones Inmediatas

```bash
# Health check
curl https://tu-dominio.vercel.app/api/health

# Verificar database conectada
curl https://tu-dominio.vercel.app/api/bancos

# Test Zero Force voice (si configurado)
# Abrir en navegador y decir "zero"
```

### Dashboard Vercel

- [ ] Build completado sin errores
- [ ] Functions desplegadas (31+ routes)
- [ ] Environment variables configuradas
- [ ] Custom domain (si aplica)
- [ ] SSL certificate válido

### Métricas

- [ ] Speed Insights > 90/100
- [ ] TTI < 600ms
- [ ] LCP < 2.5s
- [ ] CLS < 0.1

---

## 🐛 TROUBLESHOOTING

### Build Failed

```bash
# Limpiar y reconstruir
rm -rf .next node_modules
npm install
npm run build

# Verificar TypeScript
npm run type-check
```

### Database Connection Failed

```bash
# Verificar env vars en Vercel
vercel env ls

# Re-agregar credentials
vercel env add DATABASE_URL production
vercel env add DATABASE_AUTH_TOKEN production
```

### Functions Timeout

```bash
# En vercel.json, aumentar maxDuration
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## 📊 COMANDOS ÚTILES

```bash
# Ver deployments
vercel ls

# Ver logs en vivo
vercel logs --follow

# Pull environment variables
vercel env pull .env.production

# Rollback a deployment anterior
vercel rollback [deployment-url]

# Info del proyecto
vercel inspect

# Eliminar proyecto
vercel remove chronos-infinity
```

---

## 🎯 OPTIMIZACIONES POST-DEPLOY

### Edge Functions (Low Latency)

```typescript
// app/api/edge/route.ts
export const runtime = 'edge'
export const preferredRegion = ['iad1', 'sfo1']
```

### ISR (Incremental Static Regeneration)

```typescript
// app/dashboard/page.tsx
export const revalidate = 60 // Regenerate cada 60s
```

### Caching

```typescript
// app/api/ventas/route.ts
return Response.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
  }
})
```

---

## 🔐 SEGURIDAD

### Headers

Ya configurados en `vercel.json`:
- ✅ HSTS
- ✅ X-Frame-Options
- ✅ CSP
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection

### Rate Limiting

Implementado en APIs:
- 30 req/min por IP
- 100 req/min global

---

## 📞 SOPORTE

- **Vercel Docs**: https://vercel.com/docs
- **Turso Docs**: https://docs.turso.tech
- **GitHub Issues**: https://github.com/zoro488/v0-crypto-dashboard-design/issues

---

**✨ CHRONOS INFINITY 2026 — LISTO PARA PRODUCCIÓN ✨**
