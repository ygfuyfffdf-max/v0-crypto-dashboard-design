# 🌌 Aura AI Widget — FULL FEATURED

Widget de IA ultra-premium inspirado en el diseño "Aura AI Concept" para CHRONOS.
**Versión completa con TODAS las funcionalidades del CognitoWidget original.**

## 📸 Características COMPLETAS

### 🎙️ Voice Chat Screen (Pantalla Principal)
- **Orbe 3D holográfico** con gradientes violeta/rosa/azul animados
- **Sistema de partículas** orbitando el orbe
- **Estados visuales** dinámicos: idle, listening, thinking, speaking
- **Quick Actions** - Botones de acción rápida para consultas comunes
- **Botón de micrófono** prominente con efectos de pulso
- **Respuestas** que se muestran debajo del orbe con animación elegante

### 💬 Chat Screen (Pantalla Secundaria) — COMPLETA
- **Interfaz de mensajes** con burbujas premium
- **Avatar del asistente** con gradientes
- **Metadata de mensajes** (confianza, tiempo de ejecución)
- **KPIs inline** en respuestas cuando aplica
- **Sugerencias de seguimiento** clickeables
- **Botón de copiar** al hover
- **Autocompletado inteligente** en el input
- **Campo de entrada** elegante con soporte para voz

### 📊 Panel de Métricas
- Consultas de hoy
- Precisión del asistente
- Insights generados
- Tiempo de respuesta promedio

### 💡 Sugerencias Proactivas
- Alertas críticas (rojo)
- Alertas importantes (amber)
- Sugerencias (azul)
- Tips (gris)
- Botones de acción y dismiss

### 🎯 Selector de Modo
- **Chat** — Conversación general
- **Análisis** — Análisis profundo de datos
- **Predicciones** — Proyecciones financieras
- **Insights** — Descubrimiento de oportunidades
- **Automatización** — Automatización de tareas

### ⚡ Quick Actions
| Acción | Query |
|--------|-------|
| Ventas de hoy | "¿Cuáles son las ventas de hoy?" |
| Capital total | "¿Cuál es el capital total en bancos?" |
| Clientes con deuda | "Muéstrame los clientes con deuda" |
| Análisis rápido | "Dame un análisis financiero rápido" |

### 🎨 Características Visuales
- **Glassmorphism** premium con blur y transparencias
- **Gradientes dinámicos** de fondo que responden al estado
- **Transiciones cinematográficas** entre pantallas
- **Glow effects** y sombras suaves
- **Animaciones fluidas** con Framer Motion

## 🚀 Uso

```tsx
import { AuraAIWidget } from '@/app/_components/widgets/AuraAIWidget'

// Uso completo con todas las funcionalidades
<AuraAIWidget
  initialScreen="voice"  // "voice" | "chat"
  initialMode="chat"     // "chat" | "analysis" | "predictions" | "insights" | "automation"
  showMetrics={true}
  enableVoice={true}
  enableProactive={true}
  fullScreen={false}
  onClose={() => console.log('Cerrado')}
  onMessage={(msg) => console.log('Mensaje:', msg)}
  onStateChange={(state) => console.log('Estado:', state)}
  onModeChange={(mode) => console.log('Modo:', mode)}
  onActionExecuted={(action) => console.log('Acción:', action)}
/>
```

## 📁 Estructura de Archivos

```
AuraAIWidget/
├── AuraAIWidgetFull.tsx  # Componente COMPLETO (1249 líneas)
├── AuraAIWidget.tsx      # Versión básica (964 líneas)
├── AuraOrb.tsx           # Orbe 3D con partículas (471 líneas)
├── index.ts              # Exports
└── README.md             # Documentación
```

## 🔧 Props Completos

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `className` | string | - | Clases CSS adicionales |
| `onClose` | () => void | - | Callback al cerrar |
| `initialScreen` | "voice" \| "chat" | "voice" | Pantalla inicial |
| `initialMode` | CognitoMode | "chat" | Modo de IA inicial |
| `fullScreen` | boolean | false | Modo pantalla completa |
| `showMetrics` | boolean | true | Mostrar panel de métricas |
| `enableVoice` | boolean | true | Habilitar funciones de voz |
| `enableProactive` | boolean | true | Habilitar sugerencias proactivas |
| `onMessage` | (msg) => void | - | Callback en mensajes |
| `onStateChange` | (state) => void | - | Callback en cambio de estado |
| `onModeChange` | (mode) => void | - | Callback en cambio de modo |
| `onActionExecuted` | (action) => void | - | Callback en acción ejecutada |

## 🎨 Estados y Colores

| Estado | Color | Descripción |
|--------|-------|-------------|
| `idle` | Violeta | Esperando interacción |
| `listening` | Cyan | Escuchando voz del usuario |
| `thinking` | Amarillo | Procesando consulta |
| `speaking` | Verde | Reproduciendo respuesta |
| `success` | Verde | Operación exitosa |
| `error` | Rojo | Error de conexión |
| `proactive` | Naranja | Ofreciendo sugerencia |

## 🔊 Funcionalidades de Voz

- **Speech-to-Text**: Reconocimiento de voz nativo
- **Text-to-Speech**: Síntesis de voz para respuestas
- **Visualización de audio**: El orbe reacciona al nivel de audio
- **Control de mute**: Silenciar/activar voz del asistente
- **Wake word**: Compatible con activación por voz

## 📊 Integración con CHRONOS

El widget utiliza:
- **CognitoEngine** — Motor de procesamiento de consultas IA (Turso/Drizzle)
- **CognitoVoice** — Sistema de reconocimiento y síntesis de voz
- **useCognitoStore** — Estado global Zustand
- **Types completos** — CognitoMessage, CognitoMode, CognitoState, KPIData, etc.

## 🆚 Comparación con CognitoWidget Original

| Característica | CognitoWidget | AuraAIWidget |
|----------------|---------------|--------------|
| MetricsPanel | ✅ | ✅ |
| ProactiveSuggestions | ✅ | ✅ |
| ModeSelector | ✅ | ✅ |
| QuickActions | ✅ | ✅ |
| MessageBubble + KPIs | ✅ | ✅ |
| TypingIndicator | ✅ | ✅ |
| VoiceButton | ✅ | ✅ |
| ChatInput + Autocomplete | ✅ | ✅ |
| **Voice Chat Screen** | ❌ | ✅ |
| **Orbe 3D Holográfico** | ❌ | ✅ |
| **Partículas Orbitales** | ❌ | ✅ |
| **Diseño Aura AI Style** | ❌ | ✅ |

---

**Total: ~2,700 líneas de código premium**

Desarrollado para **CHRONOS INFINITY** 🚀
