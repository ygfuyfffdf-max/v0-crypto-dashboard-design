# Panel de IA Mejorado - CHRONOS AI

## Descripción

Panel de IA premium implementado con Vercel AI SDK que permite chat streaming con herramientas
integradas para consultar datos del sistema CHRONOS.

## Características

### ✨ Funcionalidades Principales

- **Chat Streaming**: Respuestas en tiempo real usando Vercel AI SDK
- **Tool Calling**: Consultas a base de datos Turso/Drizzle
- **Análisis Avanzados**: 6 tipos de análisis especializados
- **UI Premium**: Diseño glassmorphism con efectos visuales
- **Persistencia**: Historial de chat guardado en localStorage
- **Quick Actions**: Botones para consultas comunes

### 🛠️ Herramientas de AI (Tools)

El sistema incluye 4 herramientas que consultan datos reales:

1. **consultarVentas**: Consulta ventas con filtros (fechas, cliente, límite)
2. **consultarBancos**: Estado financiero de bancos/bóvedas
3. **consultarClientes**: Información de clientes y deudas
4. **generarReporte**: Reportes analíticos por tipo y periodo

### 📊 Análisis Especializados

Endpoint `/api/ai/analyze` con 6 tipos:

1. **ventas_prediccion**: Proyección de ventas del próximo mes
2. **anomalias**: Detección de patrones irregulares
3. **recomendaciones_inventario**: Sugerencias de reabastecimiento
4. **tendencias**: Análisis de tendencias históricas
5. **clientes_riesgo**: Identificación de clientes morosos
6. **optimizacion_capital**: Recomendaciones financieras

## Archivos Creados

### Componentes UI

- `app/_components/chronos-2026/panels/CosmicIAPanel.tsx` - Panel principal con chat
- `app/chronos-ai/page.tsx` - Página de demostración

### Lógica de Negocio

- `app/lib/ai/tools.ts` - Herramientas para consultar datos
- `app/lib/ai/prompts.ts` - System prompts especializados
- `app/_hooks/useAIChat.ts` - Hook personalizado con persistencia

### API Routes

- `app/api/ai/chat/route.ts` - Chat streaming con Vercel AI SDK
- `app/api/ai/analyze/route.ts` - Análisis especializados

## Configuración

### Variables de Entorno Requeridas

Agregar a `.env.local`:

```env
# OpenAI API Key (REQUERIDO)
OPENAI_API_KEY=sk-...

# Database (Ya configurado)
DATABASE_URL=libsql://...
DATABASE_AUTH_TOKEN=...
```

### Instalación

```bash
# Instalar dependencias (ya incluidas)
npm install
# o
pnpm install

# Iniciar desarrollo
npm run dev
```

## Uso

### Acceso al Panel

1. **Vía URL**: Navegar a `/chronos-ai`
2. **Integración**: Importar y usar `<CosmicIAPanel />` en cualquier página

```tsx
import { CosmicIAPanel } from "@/app/_components/chronos-2026/panels/CosmicIAPanel"

export default function MyPage() {
  return <CosmicIAPanel />
}
```

### Hook Personalizado

```tsx
import { useAIChat } from "@/app/_hooks/useAIChat"

function MyComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, clearHistory } = useAIChat({
    api: "/api/ai/chat",
    persistHistory: true,
  })

  // Tu lógica aquí
}
```

### Análisis Programático

```tsx
import { useAIAnalysis } from "@/app/_hooks/useAIChat"

function MyComponent() {
  const { analyze, isAnalyzing, result } = useAIAnalysis()

  const handleAnalyze = async () => {
    const data = await analyze({
      type: "ventas_prediccion",
      periodo: "mes",
    })
    console.log(data)
  }

  return <button onClick={handleAnalyze}>Analizar</button>
}
```

## Ejemplos de Consultas

### Quick Actions Predefinidas

- "¿Cuáles fueron las ventas de hoy?"
- "¿Qué clientes tienen deuda pendiente?"
- "¿Cuál es el capital total en bancos?"
- "¿Quiénes son los mejores clientes del mes?"

### Consultas Personalizadas

- "Muestra las ventas de la última semana del cliente ABC"
- "¿Cómo está distribuido el capital entre los bancos?"
- "Genera un reporte de ventas del mes"
- "Analiza las tendencias de compra de los clientes"

## Sistema de Prompts

### Prompts Contextuales

El sistema incluye prompts especializados para diferentes contextos:

- **General**: Asistente completo de CHRONOS
- **Ventas**: Enfocado en análisis de ventas
- **Clientes**: Gestión de clientes y cobranza
- **Bancos**: Gestión financiera
- **Inventario**: Control de stock
- **Reportes**: Generación de insights

Seleccionar contexto:

```tsx
import { getSystemPrompt } from "@/app/lib/ai/prompts"

const prompt = getSystemPrompt("ventas") // o "clientes", "bancos", etc.
```

## Arquitectura

### Flujo de Datos

```
Usuario → CosmicIAPanel → useAIChat → /api/ai/chat
                                          ↓
                                    Vercel AI SDK
                                          ↓
                                   OpenAI GPT-4o-mini
                                          ↓
                                    Tool Calling
                                          ↓
                           Consultas a Turso/Drizzle
                                          ↓
                                   Respuesta Streaming
```

### Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **UI**: Tailwind CSS + Framer Motion
- **AI**: Vercel AI SDK v5 + OpenAI
- **Database**: Turso (LibSQL) + Drizzle ORM
- **State**: Hook personalizado con localStorage

## Seguridad

### Validación de Datos

- Todos los inputs validados con Zod
- Queries parametrizadas (prevención SQL injection)
- Rate limiting recomendado para endpoints AI

### Manejo de Errores

- Logging centralizado con `logger` utility
- Retry automático en caso de fallos
- Mensajes de error amigables al usuario
- Fallback sin API key configurada

## Optimizaciones

### Performance

- Streaming de respuestas (mejor UX)
- Persistencia en localStorage (historial)
- Límite de 50 mensajes guardados
- Lazy loading de componentes

### Costos de API

- Modelo GPT-4o-mini (más económico)
- Límite de tokens: 2048
- Temperatura: 0.7 (balance calidad/costo)
- Tools ejecutados bajo demanda

## Testing

### Endpoints de Health Check

```bash
# Chat endpoint
curl http://localhost:3000/api/ai/chat

# Analyze endpoint
curl http://localhost:3000/api/ai/analyze
```

### Respuestas Esperadas

```json
{
  "status": "ok",
  "endpoint": "AI Chat (Vercel AI SDK)",
  "provider": "OpenAI",
  "model": "gpt-4o-mini",
  "hasApiKey": true,
  "tools": ["consultarVentas", "consultarBancos", "consultarClientes", "generarReporte"]
}
```

## Troubleshooting

### "OpenAI API key not configured"

**Solución**: Agregar `OPENAI_API_KEY` a `.env.local`

### "Error al consultar ventas"

**Posibles causas**:

- Database no conectada
- Schema incorrecto
- Datos corruptos

**Solución**: Verificar `DATABASE_URL` y ejecutar migraciones

### Chat no responde

**Verificar**:

1. API key configurada
2. Endpoint `/api/ai/chat` accesible
3. Console del navegador para errores
4. Network tab para requests fallidos

## Próximas Mejoras

- [ ] Modo de voz (speech-to-text)
- [ ] Exportar conversaciones
- [ ] Compartir análisis
- [ ] Más herramientas (crear venta, actualizar cliente)
- [ ] Gráficos en respuestas
- [ ] Multi-idioma
- [ ] Temas personalizables

## Referencias

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Turso](https://turso.tech/docs)

## Licencia

Parte del proyecto CHRONOS System - Uso interno
