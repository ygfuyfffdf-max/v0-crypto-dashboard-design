# 📚 CHRONOS INFINITY 2026 - Guía de Integración Completa

## 🚀 Inicio Rápido

### Paso 1: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus valores
code .env.local
```

**Variables críticas:**
```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
TURSO_DATABASE_URL="file:./database/sqlite.db"
JWT_SECRET="your-secret-key"
```

### Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias
pnpm install

# Instalar dependencias del servidor WebSocket
cd server && npm install && cd ..
```

### Paso 3: Iniciar el Sistema

**Windows (PowerShell):**
```powershell
.\start-chronos.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x start-chronos.sh
./start-chronos.sh
```

**O manualmente:**
```bash
# Terminal 1: WebSocket Server
cd server && npx tsx watch websocket-server.ts

# Terminal 2: Next.js
pnpm dev
```

---

## 🔌 Sistema WebSocket

### Conectar desde un Componente

```tsx
'use client'

import { useWebSocket, useWebSocketEvent, WebSocketEventType } from '@/app/lib/hooks/useWebSocket'

function MyComponent() {
  const { status, isConnected, send, metrics } = useWebSocket({
    autoConnect: true,
    onConnect: () => console.log('¡Conectado!'),
    onDisconnect: () => console.log('Desconectado'),
    onError: (error) => console.error('Error:', error),
  })

  // Escuchar eventos específicos
  useWebSocketEvent(WebSocketEventType.NOTIFICATION, (data) => {
    console.log('Nueva notificación:', data)
  })

  // Enviar mensaje
  const handleSendMessage = () => {
    send(WebSocketEventType.USER_ACTIVITY, {
      action: 'click',
      target: 'button',
      timestamp: Date.now(),
    })
  }

  return (
    <div>
      <p>Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</p>
      <p>Latencia: {metrics?.averageLatency}ms</p>
      <button onClick={handleSendMessage}>Enviar Mensaje</button>
    </div>
  )
}
```

### Tipos de Eventos Disponibles

```typescript
enum WebSocketEventType {
  // Notificaciones
  NOTIFICATION = 'notification',
  AUDIT_LOG = 'audit_log',
  SYSTEM_ALERT = 'system_alert',
  
  // Datos en tiempo real
  MARKET_UPDATE = 'market_update',
  PRICE_CHANGE = 'price_change',
  TRANSACTION = 'transaction',
  
  // Sistema
  USER_ACTIVITY = 'user_activity',
  WORKFLOW_UPDATE = 'workflow_update',
  REPORT_READY = 'report_ready',
  
  // Gestión
  PERMISSION_CHANGE = 'permission_change',
  THEME_UPDATE = 'theme_update',
  CONFIG_UPDATE = 'config_update',
}
```

---

## 📊 Dashboard de Métricas

### Usar el Hook de Métricas

```tsx
import { useRealtimeMetrics } from '@/app/lib/hooks/useAdvancedAPIs'

function MetricsPanel() {
  const { data, isLoading, refetch } = useRealtimeMetrics({
    type: 'all',
    period: '24h',
    refreshInterval: 30000, // 30 segundos
  })

  if (isLoading) return <Loading />

  return (
    <div>
      <h2>Ingresos: ${data?.kpis.revenue.value.toLocaleString()}</h2>
      <p>Tendencia: {data?.kpis.revenue.trend}</p>
    </div>
  )
}
```

### API Endpoint: GET /api/realtime-metrics

**Parámetros:**
- `type`: `all` | `kpis` | `timeseries` | `distribution` | `performance`
- `period`: `1h` | `24h` | `7d` | `30d` | `1y`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "revenue": {
        "id": "revenue",
        "name": "Ingresos Totales",
        "value": 125430,
        "previousValue": 111512,
        "change": 13918,
        "changePercent": 12.5,
        "trend": "up",
        "unit": "MXN"
      }
    },
    "timeseries": [...],
    "distribution": [...],
    "performance": [...]
  },
  "generatedAt": 1706540400000
}
```

---

## 🔄 Sistema de Workflows

### Crear un Workflow

```tsx
import { useWorkflows } from '@/app/lib/hooks/useAdvancedAPIs'

function CreateWorkflowButton() {
  const { createWorkflow, isLoading } = useWorkflows()

  const handleCreate = async () => {
    await createWorkflow.mutateAsync({
      templateId: 'tpl-expenses',
      title: 'Gasto de Viaje',
      description: 'Conferencia Tech 2026',
      requestedBy: 'usuario@email.com',
      metadata: {
        amount: 15000,
        currency: 'MXN',
      },
    })
  }

  return (
    <button onClick={handleCreate} disabled={createWorkflow.isPending}>
      Crear Workflow
    </button>
  )
}
```

### Aprobar/Rechazar Workflow

```tsx
const { updateWorkflow } = useWorkflows()

// Aprobar
await updateWorkflow.mutateAsync({
  workflowId: 'wf-1',
  action: 'approve',
  approverId: 'manager-1',
  comment: 'Aprobado, gastos justificados',
})

// Rechazar
await updateWorkflow.mutateAsync({
  workflowId: 'wf-1',
  action: 'reject',
  approverId: 'manager-1',
  comment: 'Gastos excesivos',
})

// Delegar
await updateWorkflow.mutateAsync({
  workflowId: 'wf-1',
  action: 'delegate',
  approverId: 'manager-1',
  delegateTo: 'manager-2',
})
```

---

## 📧 Reportes Programados

### Crear un Reporte

```tsx
import { useScheduledReports } from '@/app/lib/hooks/useAdvancedAPIs'

function ReportsManager() {
  const { reports, createReport, runReport, deleteReport } = useScheduledReports()

  const handleCreate = async () => {
    await createReport.mutateAsync({
      name: 'Reporte de Ventas Diario',
      description: 'Resumen de ventas del día',
      frequency: 'daily',
      format: 'pdf',
      recipients: ['admin@empresa.com', 'ventas@empresa.com'],
      filters: { status: 'completed' },
      columns: ['fecha', 'cliente', 'total'],
    })
  }

  const handleRunNow = async (scheduleId: string) => {
    await runReport.mutateAsync(scheduleId)
  }

  return (
    <div>
      {reports?.map(report => (
        <div key={report.id}>
          <h3>{report.name}</h3>
          <button onClick={() => handleRunNow(report.id)}>
            Ejecutar Ahora
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Formatos Disponibles
- `pdf`: Documento PDF profesional
- `excel`: Archivo Excel (.xlsx)
- `csv`: CSV simple
- `json`: JSON para integración

### Frecuencias Disponibles
- `once`: Ejecución única
- `daily`: Diario (cada 24h)
- `weekly`: Semanal
- `monthly`: Mensual
- `custom`: Expresión cron personalizada

---

## 🔍 Filtros Guardados

### Crear y Aplicar Filtros

```tsx
import { useSavedFilters } from '@/app/lib/hooks/useAdvancedAPIs'

function FiltersPanel() {
  const { filters, createFilter, toggleFavorite, deleteFilter } = useSavedFilters({
    module: 'sales',
  })

  const handleCreateFilter = async () => {
    await createFilter.mutateAsync({
      name: 'Ventas Activas',
      module: 'sales',
      conditions: [
        { id: 'c1', field: 'status', operator: 'equals', value: 'active' },
        { id: 'c2', field: 'amount', operator: 'greater_than', value: 1000 },
      ],
      logic: 'and',
      isFavorite: true,
      isShared: false,
      isDefault: false,
      createdBy: 'admin',
    })
  }

  return (
    <div>
      {filters?.map(filter => (
        <div key={filter.id}>
          <h3>{filter.name}</h3>
          <button onClick={() => toggleFavorite(filter.id, filter.isFavorite)}>
            {filter.isFavorite ? '⭐' : '☆'}
          </button>
          <button onClick={() => deleteFilter.mutate(filter.id)}>
            🗑️
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Operadores Disponibles

| Operador | Descripción | Tipos |
|----------|-------------|-------|
| `equals` | Igual a | Todos |
| `not_equals` | No es igual a | Todos |
| `contains` | Contiene | Texto |
| `not_contains` | No contiene | Texto |
| `starts_with` | Empieza con | Texto |
| `ends_with` | Termina con | Texto |
| `greater_than` | Mayor que | Número, Fecha |
| `less_than` | Menor que | Número, Fecha |
| `between` | Entre | Número, Fecha |
| `in` | Está en lista | Select |
| `not_in` | No está en lista | Select |
| `is_null` | Está vacío | Todos |
| `is_not_null` | No está vacío | Todos |

---

## 🎨 Temas Personalizados

### Cambiar Tema

```tsx
import { useThemes } from '@/app/lib/hooks/useAdvancedAPIs'

function ThemeSelector() {
  const { themes, activeTheme, activateTheme, createTheme } = useThemes()

  const handleCreateTheme = async () => {
    await createTheme.mutateAsync({
      name: 'Mi Tema',
      description: 'Tema personalizado',
      mode: 'dark',
      colors: {
        primary: '#ff5722',
        secondary: '#2196f3',
        accent: '#ffeb3b',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        background: '#121212',
        foreground: '#ffffff',
        muted: '#9e9e9e',
        border: 'rgba(255,255,255,0.12)',
      },
    })
  }

  return (
    <div>
      <h2>Tema Activo: {activeTheme?.name}</h2>
      
      {themes?.map(theme => (
        <button
          key={theme.id}
          onClick={() => activateTheme.mutate(theme.id)}
          disabled={theme.isActive}
        >
          {theme.name}
        </button>
      ))}
    </div>
  )
}
```

### Temas Predefinidos

1. **Purple Dream** - Morado vibrante (predeterminado)
2. **Ocean Breeze** - Azul fresco
3. **Sunset Glow** - Naranja cálido
4. **Forest Zen** - Verde natural
5. **Midnight Blue** - Azul profundo
6. **Rose Gold** - Rosa elegante

---

## 🧪 Ejecutar Tests

```bash
# Ejecutar todos los tests
pnpm test

# Tests de APIs avanzadas
pnpm test:advanced

# Tests con cobertura
pnpm test:coverage

# Tests en modo watch
pnpm test:watch
```

---

## 📁 Estructura de Archivos

```
├── app/
│   ├── api/
│   │   ├── realtime-metrics/route.ts    # API de métricas
│   │   ├── workflows/route.ts           # API de workflows
│   │   ├── scheduled-reports/route.ts   # API de reportes
│   │   ├── saved-filters/route.ts       # API de filtros
│   │   └── themes/route.ts              # API de temas
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts          # Hook WebSocket
│   │   │   └── useAdvancedAPIs.ts       # Hooks de APIs
│   │   └── services/
│   │       └── websocket-service.ts     # Servicio WebSocket
│   ├── _components/
│   │   ├── dashboards/                  # Componentes dashboard
│   │   ├── workflows/                   # Componentes workflows
│   │   ├── reports/                     # Componentes reportes
│   │   ├── filters/                     # Componentes filtros
│   │   ├── theme/                       # Editor de temas
│   │   └── notifications/               # Panel notificaciones
│   └── providers/
│       └── WebSocketProvider.tsx        # Provider WebSocket
├── server/
│   └── websocket-server.ts              # Servidor WebSocket
├── __tests__/
│   └── advanced-systems-api.test.ts     # Tests
├── .env.local                           # Variables de entorno
└── start-chronos.ps1                    # Script de inicio
```

---

## 🔒 Seguridad

### Rate Limiting

El servidor WebSocket incluye rate limiting:
- **100 mensajes por minuto** por cliente
- Bloqueo automático si se excede

### Autenticación

```typescript
// Autenticar cliente WebSocket
send('authenticate', {
  token: 'jwt-token',
  userId: 'user-id',
})
```

### CORS

Configurar en `.env.local`:
```env
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

---

## 🐛 Debugging

### Logs del WebSocket Server

El servidor muestra logs en tiempo real:
```
📗 [2026-01-29T12:00:00.000Z] Client connected: abc123
📗 [2026-01-29T12:00:01.000Z] Client abc123 authenticated as user@email.com
📘 [2026-01-29T12:00:02.000Z] Client abc123 joined room notifications
```

### Health Check

```bash
curl http://localhost:3001/health
```

Respuesta:
```json
{
  "status": "ok",
  "activeConnections": 5,
  "messagesReceived": 1234,
  "messagesSent": 2345,
  "uptime": 3600000
}
```

---

## 📝 Notas Adicionales

1. **El servidor WebSocket es independiente** - Debe iniciarse por separado
2. **Los datos en memoria son para desarrollo** - En producción, usar base de datos
3. **Los hooks usan React Query** - Caching automático y optimistic updates
4. **Los temas se persisten** - En localStorage y sincronizados con API

---

**¿Preguntas?** Consulta `ADVANCED_SYSTEMS_DOCUMENTATION.md` para documentación técnica completa.
