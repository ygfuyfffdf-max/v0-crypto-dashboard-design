# 🚀 AI SUPREME — Documentación Completa

> Sistema de inteligencia empresarial OMEGA-Level integrado con CHRONOS

---

## 📊 Estado del Sistema

| Módulo               | Estado        | Líneas | Descripción                        |
| -------------------- | ------------- | ------ | ---------------------------------- |
| **AI Supreme Core**  | ✅ Producción | 7,050+ | Motor NLP + Analytics + Decisiones |
| **AI Supreme Voice** | ✅ Producción | 1,500+ | TTS/STT con ElevenLabs + Deepgram  |
| **UI Dashboard**     | ✅ Producción | 1,200+ | Glassmorphism + Animaciones        |

---

## 🏗️ Arquitectura

### Backend (`app/lib/ai/supreme/`)

```
app/lib/ai/supreme/
├── types.ts              (900 líneas) - 112 tipos TypeScript
├── IntentDetector.ts     (600 líneas) - NLP y clasificación
├── AISupremeEngine.ts    (900 líneas) - Orquestador principal
├── FormAutomationEngine.ts (1000 líneas) - CRUD automatizado
├── AnalyticsEngine.ts    (600 líneas) - Analytics con Drizzle
├── DecisionEngine.ts     (1200 líneas) - Recomendaciones y alertas
├── VoiceEngine.ts        (500 líneas) - TTS/STT
├── useAIStore.ts         (300 líneas) - Estado Zustand
└── index.ts              (200 líneas) - Exports
```

### Frontend (`app/components/ai-supreme/`)

```
app/components/ai-supreme/
├── AISupremeDashboard.tsx (800 líneas) - Dashboard principal
├── AISupremeChat.tsx      (400 líneas) - Chat modal
├── AISupremeOrb.tsx       (600 líneas) - Orb 3D interactivo
└── index.ts               - Barrel exports
```

### Páginas

```
app/ai-supreme/page.tsx       - Dashboard IA
app/ai-supreme-voice/page.tsx - Interface de voz
```

---

## 🎯 Capacidades Principales

### 1️⃣ Detección de Intención (NLP)

- **104 palabras clave** clasificadas en 8 categorías
- Extracción de entidades (fechas, números, IDs)
- Scoring de confianza
- Clasificación multi-label

```typescript
const intent = intentDetector.detectIntent("Mostrar ventas del mes con deuda > 5000")
// {
//   primaryIntent: "query",
//   secondaryIntents: ["analytics", "filter"],
//   confidence: 0.95,
//   entities: { timeframe: "mes", filters: [...] }
// }
```

### 2️⃣ Motor Analítico (30+ queries)

- Cálculo de KPIs en tiempo real
- Generación de gráficos (line, bar, pie, area, donut)
- Filtros y agregaciones avanzadas con Drizzle ORM

```typescript
const kpis = await analyticsEngine.calculateKPIs("mes")
// [
//   { label: "Ventas Totales", value: 150000, unit: "MXN", trend: "up" },
//   { label: "Clientes Activos", value: 45, unit: "clientes" },
// ]
```

### 3️⃣ Motor de Decisiones

- **19 queries** de análisis de riesgos
- Generación de recomendaciones priorizadas
- Sistema de alertas (critical, high, medium, low)
- Scoring de crédito y rentabilidad

### 4️⃣ Automatización CRUD

- Create, Read, Update, Delete completo
- Validación con Zod automática
- Operaciones batch (bulk create/update/delete)
- Transacciones atómicas

### 5️⃣ Voice Interface

- **ElevenLabs** TTS (9 voces premium)
- **Deepgram** STT (streaming WebSocket)
- **Fallback** a Web Speech API (gratis)
- Canvas visualizations reactivas al audio

---

## 🔌 Integración con Turso/Drizzle

```typescript
// Queries type-safe con Drizzle ORM
import { db } from "@/database"
import { ventas, clientes, bancos } from "@/database/schema"

const results = await db.query.ventas.findMany({
  where: and(gt(ventas.montoRestante, 5000), gte(ventas.fecha, startOfMonth)),
  with: { cliente: true },
})
```

**Tablas soportadas:**

- `ventas` - Transacciones con distribución GYA
- `clientes` - Con métricas y scoring
- `distribuidores` - Proveedores
- `ordenes_compra` - Lotes de producto
- `bancos` - 7 bancos del sistema
- `movimientos` - Registro unificado

---

## 🎨 Diseño Premium

### Paleta de Colores

```css
/* Primarios */
violet-500/600   /* Acciones principales */
indigo-500/600   /* Secundario */
fuchsia-500      /* Acentos */

/* Fondos */
gray-950/900     /* Background */
white/5          /* Glassmorphism */
border-white/10  /* Bordes sutiles */
```

### Efectos

- **Glassmorphism**: `backdrop-blur-xl bg-white/5`
- **Glows**: `shadow-xl shadow-violet-500/30`
- **Animaciones**: Framer Motion con stagger

---

## 🚀 Uso Rápido

### Dashboard IA

```bash
# Acceder a:
http://localhost:3000/ai-supreme
```

### Interface de Voz

```bash
# Acceder a:
http://localhost:3000/ai-supreme-voice
```

### Desde Código

```typescript
import { aiSupremeEngine } from "@/app/lib/ai/supreme"

const response = await aiSupremeEngine.processQuery("Mostrar clientes con deuda alta")
```

### Componentes React

```tsx
import { AISupremeDashboard, AISupremeOrb } from '@/app/components/ai-supreme'

// Dashboard completo
<AISupremeDashboard />

// Orb flotante con voz
<AISupremeOrb
  elevenLabsApiKey={process.env.NEXT_PUBLIC_ELEVENLABS_KEY}
  deepgramApiKey={process.env.NEXT_PUBLIC_DEEPGRAM_KEY}
/>
```

---

## 🔑 Configuración de API Keys (Voz)

### Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_your_key_here
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_token_here
```

### Obtener Keys

**ElevenLabs (TTS):**

1. https://elevenlabs.io → Sign up
2. Dashboard → API Keys → Generate
3. Copiar key (empieza con `sk_`)

**Deepgram (STT):**

1. https://deepgram.com → Sign up
2. Dashboard → Create API Key
3. Copiar token

> Sin keys, el sistema usa Web Speech API automáticamente (calidad menor pero gratis)

---

## 🎯 Estados del Orb

| Estado      | Icono       | Color            | Descripción       |
| ----------- | ----------- | ---------------- | ----------------- |
| `idle`      | ✨ Sparkles | Violeta          | Esperando input   |
| `listening` | 🎤 Mic      | Violeta pulsante | Grabando voz      |
| `thinking`  | 🧠 Brain    | Fucsia girando   | Procesando IA     |
| `speaking`  | 🔊 Volume   | Cyan             | Reproduciendo voz |
| `error`     | ⚠️ Alert    | Rojo             | Error temporal    |

---

## 🔐 Seguridad

- ✅ **Queries parametrizadas** con Drizzle (previene SQL injection)
- ✅ **Validación Zod** en todos los inputs
- ✅ **TypeScript strict** - NO usa `any`
- ✅ **Logger profesional** (no console.log)
- ✅ **Credenciales en .env** protegidas

---

## 🧪 Testing

```bash
# Test de conectividad
pnpm tsx app/lib/ai/supreme/test-connection.ts

# Validar tipos
pnpm type-check

# Lint
pnpm lint
```

---

## 📈 KPIs Disponibles

1. **Ventas Totales** - Suma de `precioTotalVenta`
2. **Clientes Activos** - Count con `estado = 'activo'`
3. **Capital Total** - Suma de `capitalActual` de bancos
4. **Cuentas por Cobrar** - Suma de `montoRestante`
5. **Deudas con Distribuidores** - OCs pendientes

---

## 🛠️ Troubleshooting

### "Micrófono no funciona"

- Verificar permisos del navegador
- Settings → Privacy → Microphone → Permitir

### "Voz robótica"

- Configurar API keys de ElevenLabs/Deepgram
- Sin keys usa Web Speech API (calidad menor)

### "Canvas no se ve"

- Actualizar navegador a última versión
- Verificar soporte Canvas API

---

## 🎓 Roadmap

### v1.1

- [ ] Wake word ("Hey Chronos")
- [ ] Streaming bidireccional
- [ ] Multi-idioma dinámico
- [ ] Historial persistente

### v1.2

- [ ] Voice cloning personalizado
- [ ] Emociones en TTS
- [ ] Análisis de sentimiento

---

**Versión:** SUPREME-2026 **Estado:** ✅ PRODUCTION READY **Última Actualización:** 10 Enero 2026
