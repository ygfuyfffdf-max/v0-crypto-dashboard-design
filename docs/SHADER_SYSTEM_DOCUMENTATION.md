# 🌌 CHRONOS SUPREME SHADER SYSTEM — Documentación Completa

> **Versión**: 4.0.0 SUPREME ELITE **Última actualización**: Enero 2026

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Instalación y Uso](#instalación-y-uso)
4. [Shaders GLSL](#shaders-glsl)
5. [Componentes React](#componentes-react)
6. [Sistema de Personalización](#sistema-de-personalización)
7. [Optimización de Rendimiento](#optimización-de-rendimiento)
8. [API Reference](#api-reference)
9. [Ejemplos de Código](#ejemplos-de-código)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

El **CHRONOS Supreme Shader System** es un sistema de efectos visuales de alta gama para dashboards
web, diseñado con las siguientes características:

### Características Principales

| Feature                  | Descripción                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| 🎨 **Paleta CHRONOS**    | Violeta eléctrico (#8B00FF), Oro premium (#FFD700), Plasma (#FF1493) |
| ✨ **Partículas WebGL**  | Sistema de hasta 15,000 partículas con física realista               |
| 🖱️ **Interactividad**    | Hover, click, y scroll con atracción magnética                       |
| 🎚️ **Personalización**   | UI completa para ajustar colores, formas, velocidad, etc.            |
| ⚡ **Rendimiento**       | Auto-ajuste de calidad, lazy rendering, 60fps garantizados           |
| 📱 **Multi-dispositivo** | Detección automática y optimización por dispositivo                  |

### Paleta de Colores Oficial

```
⛔ PROHIBIDO: Cyan (#00FFFF), Turquesa, Azul frío puro

✅ PERMITIDO:
- Violeta Eléctrico: #8B00FF (0.545, 0.0, 1.0)
- Oro Premium:       #FFD700 (1.0, 0.843, 0.0)
- Plasma Fucsia:     #FF1493 (1.0, 0.078, 0.576)
- Glow Violeta:      #C084FC (0.753, 0.518, 0.988)
- Rose Soft:         #FB7185 (0.984, 0.471, 0.659)
- Amber Warm:        #FEAE42 (0.996, 0.682, 0.259)
```

---

## 🏗️ Arquitectura del Sistema

```
app/
├── lib/
│   └── shaders/
│       └── supreme-particle-system.ts    # Código GLSL de shaders
│
└── _components/
    └── chronos-2026/
        └── shaders/
            ├── index.ts                   # Exports centralizados
            ├── SupremeShaderCanvas.tsx    # Canvas WebGL principal
            ├── ShaderCustomizationContext.tsx  # Context + Hook
            ├── ShaderControlPanel.tsx     # UI de personalización
            ├── UnifiedShaderBackground.tsx # Wrapper unificado
            └── ShaderPerformance.tsx      # Utilidades de rendimiento
```

### Flujo de Datos

```
┌─────────────────────┐
│ ShaderCustomization │  ← Context global con configuración
│      Provider       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  UnifiedShader      │  ← Wrapper que combina capas
│    Background       │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌──────────┐
│Gradient│  │ Supreme  │  ← Canvas WebGL con shaders
│ Layer  │  │ Shader   │
│        │  │ Canvas   │
└────────┘  └──────────┘
```

---

## 🚀 Instalación y Uso

### Uso Básico

```tsx
import { UnifiedShaderBackground } from "@/app/_components/chronos-2026/shaders"

function MyPanel() {
  return (
    <UnifiedShaderBackground preset="dashboard" showControls>
      <div className="p-6">{/* Tu contenido aquí */}</div>
    </UnifiedShaderBackground>
  )
}
```

### Con Preset de Panel Específico

```tsx
import { VentasBackground } from "@/app/_components/chronos-2026/shaders"

function VentasPanel() {
  return <VentasBackground intensity={0.8}>{/* Contenido del panel de ventas */}</VentasBackground>
}
```

### Configuración Personalizada

```tsx
import { SupremeShaderCanvas } from "@/app/_components/chronos-2026/shaders"

function CustomShader() {
  return (
    <SupremeShaderCanvas
      shaderType="particle"
      config={{
        uSpeed: 1.2,
        uTurbulence: 0.7,
        uColorPrimary: [0.8, 0.0, 1.0],
        uParticleShape: 1, // Estrellas
      }}
      particleCount={8000}
      interactive
      scrollEffect
    />
  )
}
```

---

## 🎨 Shaders GLSL

### Tipos de Shader Disponibles

| Tipo       | Descripción                         | Uso Recomendado       |
| ---------- | ----------------------------------- | --------------------- |
| `particle` | Partículas con física y turbulencia | Fondos generales      |
| `liquid`   | Distorsión líquida con ondas        | Paneles de flujo      |
| `ripple`   | Ondas de interacción                | Efectos de click      |
| `glowOrb`  | Orbe 3D con ray marching            | Indicadores de estado |

### Uniforms del Shader de Partículas

```glsl
// Tiempo y movimiento
uniform float uTime;
uniform float uSpeed;          // Velocidad general (0-3)
uniform float uTurbulence;     // Intensidad de turbulencia (0-1)
uniform float uWaveAmplitude;  // Amplitud de ondas (0-0.5)
uniform float uPulseIntensity; // Intensidad del pulso (0-2)

// Interacción
uniform vec2 uMouse;           // Posición del mouse normalizada
uniform vec2 uMouseVelocity;   // Velocidad del mouse
uniform float uMousePressed;   // 1 si presionado, 0 si no
uniform float uScroll;         // Posición de scroll normalizada
uniform float uScrollVelocity; // Velocidad de scroll

// Colores (RGB normalizado 0-1)
uniform vec3 uColorPrimary;    // Color principal (violeta)
uniform vec3 uColorSecondary;  // Color secundario (oro)
uniform vec3 uColorAccent;     // Color de acento (plasma)

// Partículas
uniform float uAttraction;     // Fuerza de atracción al mouse (0-1)
uniform float uInteractionRadius; // Radio de interacción (0.1-2)
uniform float uParticleScale;  // Escala de partículas (0.1-3)
uniform int uParticleShape;    // 0:círculo, 1:estrella, 2:diamante, 3:orbe

// Efectos
uniform float uBloomIntensity;       // Intensidad de bloom (0-3)
uniform float uCoreIntensity;        // Brillo del núcleo (0-3)
uniform float uChromaticAberration;  // Aberración cromática (0-1)
uniform float uMood;                 // Estado de ánimo (-1 a 1)
```

---

## 🎛️ Sistema de Personalización

### Usando el Hook

```tsx
import { useShaderCustomization } from "@/app/_components/chronos-2026/shaders"

function MyComponent() {
  const {
    config,
    enabled,
    setEnabled,
    setIntensity,
    setColorPrimary,
    setParticleShape,
    applyPreset,
    resetToDefault,
    presets,
  } = useShaderCustomization()

  return (
    <div>
      {/* Toggle de encendido */}
      <button onClick={() => setEnabled(!enabled)}>
        {enabled ? "Desactivar" : "Activar"} Shaders
      </button>

      {/* Selector de preset */}
      {Object.entries(presets).map(([key, preset]) => (
        <button key={key} onClick={() => applyPreset(preset)}>
          {preset.icon} {preset.name}
        </button>
      ))}

      {/* Slider de intensidad */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.1}
        value={config.intensity}
        onChange={(e) => setIntensity(parseFloat(e.target.value))}
      />
    </div>
  )
}
```

### Presets Disponibles

| Preset           | Descripción                    | Colores                  |
| ---------------- | ------------------------------ | ------------------------ |
| 🌌 `aurora`      | Efectos etéreos violeta/fucsia | Violeta + Glow + Plasma  |
| ✨ `goldRush`    | Partículas doradas premium     | Oro + Ámbar + Blanco     |
| ⚡ `plasma`      | Energía intensa vibrante       | Plasma + Violeta + Rojo  |
| 🌠 `cosmic`      | Profundidad espacial sutil     | Púrpura oscuro + Violeta |
| 🔘 `minimal`     | Rendimiento máximo             | Violeta suave            |
| 🌃 `neon`        | Estilo cyberpunk               | Violeta + Plasma + Oro   |
| 🌸 `rose`        | Elegancia rosada               | Rose + Oro + Glow        |
| 🚀 `performance` | Bajo consumo                   | Colores default, mínimo  |

---

## ⚡ Optimización de Rendimiento

### Detección Automática de Dispositivo

El sistema detecta automáticamente:

- **Ultra** (8+ cores, 8GB+ RAM, GPU dedicada): 15,000 partículas, 120fps
- **High** (6+ cores, 4GB+ RAM): 8,000 partículas, 60fps
- **Medium** (4+ cores): 5,000 partículas, 60fps
- **Low** (móvil, RAM baja, reduced motion): 2,000 partículas, 30fps

### Hook de Rendimiento

```tsx
import { useShaderPerformance } from "@/app/_components/chronos-2026/shaders/ShaderPerformance"

function PerformanceMonitor() {
  const {
    capabilities,
    metrics,
    qualityMultiplier,
    startMonitoring,
    stopMonitoring,
    recommendedSettings,
  } = useShaderPerformance({
    targetFPS: 60,
    autoAdjustQuality: true,
  })

  return (
    <div>
      <p>Tier: {capabilities.tier}</p>
      <p>FPS: {metrics.fps}</p>
      <p>Partículas recomendadas: {recommendedSettings.particleCount}</p>
    </div>
  )
}
```

### Estrategias de Optimización

1. **Lazy Rendering**: Solo renderiza cuando es visible

   ```tsx
   <SupremeShaderCanvas lazyRender />
   ```

2. **Prioridad de Renderizado**: Ajusta el target FPS

   ```tsx
   <SupremeShaderCanvas priority="low" /> // 30fps
   <SupremeShaderCanvas priority="normal" /> // 60fps
   <SupremeShaderCanvas priority="high" /> // 120fps
   ```

3. **Auto-pausa**: Se pausa automáticamente cuando el tab no está visible

4. **Throttling de Eventos**: Mouse y scroll throttled a 16ms

---

## 📚 API Reference

### `<SupremeShaderCanvas />`

| Prop            | Tipo                                              | Default      | Descripción                     |
| --------------- | ------------------------------------------------- | ------------ | ------------------------------- |
| `shaderType`    | `'particle' \| 'liquid' \| 'ripple' \| 'glowOrb'` | `'particle'` | Tipo de shader                  |
| `panelPreset`   | `PanelShaderPreset`                               | -            | Preset para panel específico    |
| `config`        | `ShaderConfig`                                    | `{}`         | Configuración personalizada     |
| `particleCount` | `number`                                          | `5000`       | Cantidad de partículas          |
| `interactive`   | `boolean`                                         | `true`       | Habilitar interacción con mouse |
| `scrollEffect`  | `boolean`                                         | `true`       | Habilitar efecto de scroll      |
| `intensity`     | `number`                                          | `1`          | Intensidad general (0-1)        |
| `lazyRender`    | `boolean`                                         | `true`       | Solo renderizar cuando visible  |
| `priority`      | `'low' \| 'normal' \| 'high'`                     | `'normal'`   | Prioridad de FPS                |
| `opacity`       | `number`                                          | `1`          | Opacidad del canvas             |
| `className`     | `string`                                          | `''`         | Clase CSS adicional             |
| `onReady`       | `() => void`                                      | -            | Callback cuando está listo      |

### `<UnifiedShaderBackground />`

| Prop           | Tipo                | Default       | Descripción                   |
| -------------- | ------------------- | ------------- | ----------------------------- |
| `preset`       | `PanelShaderPreset` | `'dashboard'` | Preset de panel               |
| `showGradient` | `boolean`           | `true`        | Mostrar capa de gradiente     |
| `showVignette` | `boolean`           | `true`        | Mostrar vignette              |
| `showNoise`    | `boolean`           | `true`        | Mostrar textura de ruido      |
| `showControls` | `boolean`           | `false`       | Mostrar botón de controles    |
| `children`     | `ReactNode`         | -             | Contenido a renderizar encima |

### `useShaderCustomization()`

```typescript
interface UseShaderCustomization {
  config: ShaderCustomization
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  setIntensity: (intensity: number) => void
  setQuality: (quality: "low" | "medium" | "high" | "ultra") => void
  setColorPrimary: (color: [number, number, number]) => void
  setColorSecondary: (color: [number, number, number]) => void
  setColorAccent: (color: [number, number, number]) => void
  setParticleCount: (count: number) => void
  setParticleSize: (size: number) => void
  setParticleSpeed: (speed: number) => void
  setParticleShape: (shape: 0 | 1 | 2 | 3) => void
  setTurbulence: (turbulence: number) => void
  setWaveAmplitude: (amplitude: number) => void
  setPulseIntensity: (intensity: number) => void
  setBloomIntensity: (intensity: number) => void
  setChromaticAberration: (aberration: number) => void
  setMouseAttraction: (attraction: number) => void
  setMouseRadius: (radius: number) => void
  setScrollParallax: (enabled: boolean) => void
  setMood: (mood: number) => void
  applyPreset: (preset: ShaderThemePreset) => void
  resetToDefault: () => void
  getUniformValues: () => Record<string, unknown>
  presets: Record<string, ShaderThemePreset>
}
```

---

## 💻 Ejemplos de Código

### Dashboard Completo con Shaders

```tsx
"use client"

import {
  UnifiedShaderBackground,
  ShaderCustomizationProvider,
  ShaderControlPanel,
  ShaderControlTrigger,
} from "@/app/_components/chronos-2026/shaders"
import { useState } from "react"

export default function Dashboard() {
  const [controlsOpen, setControlsOpen] = useState(false)

  return (
    <ShaderCustomizationProvider>
      <UnifiedShaderBackground preset="dashboard" showGradient showVignette showNoise>
        {/* Header */}
        <header className="p-6">
          <h1 className="text-3xl font-bold text-white">CHRONOS Dashboard</h1>
        </header>

        {/* Content Grid */}
        <main className="grid grid-cols-3 gap-6 p-6">
          {/* Cards con glassmorphism */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-xl text-white">Ventas</h2>
            {/* ... */}
          </div>
          {/* ... más cards */}
        </main>

        {/* Controles de Shader */}
        <ShaderControlTrigger onClick={() => setControlsOpen(true)} />
        <ShaderControlPanel isOpen={controlsOpen} onClose={() => setControlsOpen(false)} />
      </UnifiedShaderBackground>
    </ShaderCustomizationProvider>
  )
}
```

### Panel Individual con Shader Personalizado

```tsx
import { SupremeShaderCanvas, useShaderCustomization } from "@/app/_components/chronos-2026/shaders"

function VentasPanel() {
  const { config } = useShaderCustomization()

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      {/* Fondo con shader */}
      <SupremeShaderCanvas
        panelPreset="ventas"
        config={{
          uSpeed: config.particleSpeed * 1.2,
          uColorSecondary: [0.0, 0.8, 0.4], // Verde para ventas
        }}
        className="absolute inset-0"
      />

      {/* Contenido */}
      <div className="relative z-10 p-6">
        <h2 className="text-2xl font-bold text-white">Panel de Ventas</h2>
        {/* ... */}
      </div>
    </div>
  )
}
```

---

## 🔧 Troubleshooting

### WebGL no disponible

```tsx
// El componente muestra un fallback automático
// También puedes verificar manualmente:
const canvas = document.createElement("canvas")
const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
if (!gl) {
  console.warn("WebGL no disponible")
}
```

### Rendimiento bajo

1. **Reducir partículas**: `particleCount={2000}`
2. **Usar prioridad baja**: `priority="low"`
3. **Desactivar efectos costosos**:
   ```tsx
   config={{
     uChromaticAberration: 0,
     uBloomIntensity: 0.5,
     uTurbulence: 0.2,
   }}
   ```

### Colores incorrectos

⚠️ Los colores deben estar en formato RGB normalizado (0-1), no en 0-255:

```tsx
// ❌ Incorrecto
uColorPrimary: [139, 0, 255]

// ✅ Correcto
uColorPrimary: [0.545, 0.0, 1.0] // #8B00FF / 255
```

### Shader no se actualiza

Asegúrate de que el componente esté dentro del `ShaderCustomizationProvider`:

```tsx
// ✅ Correcto
<ShaderCustomizationProvider>
  <UnifiedShaderBackground>{/* contenido */}</UnifiedShaderBackground>
</ShaderCustomizationProvider>
```

---

## 📝 Notas de Versión

### v4.0.0 SUPREME ELITE (Enero 2026)

- ✨ Sistema de shaders GLSL completamente nuevo
- 🎛️ Sistema de personalización con Context + Hook
- 📱 Detección y optimización automática por dispositivo
- 🖱️ Interactividad completa (hover, click, scroll)
- 🎨 8 presets temáticos incluidos
- ⚡ Auto-ajuste de calidad basado en FPS
- 📚 Documentación completa

---

_Desarrollado con ❤️ para CHRONOS INFINITY 2026_
