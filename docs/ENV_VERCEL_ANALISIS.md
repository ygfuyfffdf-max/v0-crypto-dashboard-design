# Análisis variables de entorno — Vercel CLI

**Fecha:** 2026-02-13  
**Comando:** `vercel env ls` (en el proyecto v0-crypto-dashboard-design)

---

## Variables actualmente configuradas en Vercel

| Variable | Entornos | Notas |
|----------|----------|--------|
| `TURSO_DATABASE_URL` | Production, Preview, Development | ✅ Base de datos |
| `TURSO_AUTH_TOKEN` | Production, Preview, Development | ✅ |
| `DATABASE_URL` | Production | Alias/legacy |
| `DATABASE_AUTH_TOKEN` | Production, Preview | Alias/legacy |
| `CLERK_SECRET_KEY` | Production | ✅ Auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Production | ✅ |
| `UPSTASH_REDIS_REST_URL` | Production | Cache |
| `UPSTASH_REDIS_REST_TOKEN` | Production | Cache |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Production | Búsqueda |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | Production | Búsqueda |
| `NEXTAUTH_SECRET` | Production, Preview | NextAuth (legacy) |
| `NEXTAUTH_URL` | Production, Preview | NextAuth (legacy) |
| `AZURE_SUBSCRIPTION_ID` | Production | Azure |
| `AZURE_TENANT_ID` | Production | Azure |
| `AZURE_MONITOR_CONNECTION_STRING` | Production | Azure |
| `AZURE_REDIS_*` (HOST, PORT, KEY, SSL) | Production | Azure Redis |
| `AZURE_SIGNALR_*` (ENDPOINT, KEY) | Production | Azure SignalR |
| `AZURE_SPEECH_*` (REGION, KEY, ENDPOINT) | Production | Azure Speech |
| `AZURE_OPENAI_*` (ENDPOINT, KEY, DEPLOYMENT_NAME) | Production | Azure OpenAI |

---

## Conjunto que usarás (core)

Solo estas (y las que ya están en Vercel que quieras mantener):

| Variable | En Vercel | Acción |
|----------|-----------|--------|
| **Clerk** | ✅ | Ya configurado |
| **Turso** | ✅ | Ya configurado |
| **OpenAI** | ❌ (solo Azure OpenAI) | Añadir `OPENAI_API_KEY` si quieres API directa |
| **ElevenLabs** | ❌ | Añadir `ELEVENLABS_API_KEY` (+ `ELEVENLABS_VOICE_ID` si usas voz) |
| **Deepgram** | ❌ | Añadir `DEEPGRAM_API_KEY` (y opcional `DEEPGRAM_MODEL`) |

Opcionales que ya tienes y puedes dejar: Algolia, Upstash, DATABASE_*, NEXTAUTH_*.  
Azure: si no usas Azure OpenAI/Speech/Redis/SignalR, puedes borrar esas variables en Vercel después.

---

## Comandos útiles Vercel CLI

```bash
# Ver variables
vercel env ls

# Añadir variable (te pide valor y entorno)
vercel env add OPENAI_API_KEY production
vercel env add ELEVENLABS_API_KEY production
vercel env add DEEPGRAM_API_KEY production

# Descargar .env a local (para desarrollo)
vercel env pull .env.local

# Borrar variable
vercel env rm NOMBRE_VAR production
```

---

## Resumen

- **Clerk y Turso:** ya están en Vercel; no hay nada pendiente para ese bloque.
- **OpenAI:** en Vercel solo está Azure OpenAI. Si el código usa `OPENAI_API_KEY` (API directa), hay que añadirla en Vercel.
- **ElevenLabs y Deepgram:** no están en Vercel; hay que añadirlas si usas voz/TTS/STT.

`.env.example` del repo está recortado al conjunto core (Clerk, Turso, OpenAI, ElevenLabs, Deepgram) para que coincida con lo que usarás.
