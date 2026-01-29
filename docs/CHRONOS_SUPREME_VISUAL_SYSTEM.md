# 🌌 CHRONOS SUPREME VISUAL SYSTEM — Documentación

> **Versión**: 1.0.0 SUPREME ELITE **Fecha**: Enero 2026 **Autor**: CHRONOS INFINITY TEAM

---

## 📋 Tabla de Contenidos

1. [Animación de Inicio - Chronos Rising](#-animación-de-inicio---chronos-rising)
2. [Página de Login - Glassmorphic Gateway](#-página-de-login---glassmorphic-gateway)
3. [Widget de IA - The Oracle Within](#-widget-de-ia---the-oracle-within)
4. [Integración y Uso](#-integración-y-uso)
5. [Paleta de Colores CHRONOS](#-paleta-de-colores-chronos)
6. [Especificaciones Técnicas](#-especificaciones-técnicas)

---

## 🌌 Animación de Inicio - "Chronos Rising"

### Concepto

La animación evoca el despertar de una inteligencia poderosa y atemporal. El nombre "ΧΡΟΝΟΣ" surge
de una forma visualmente cautivadora, representando el tiempo mismo tomando forma.

### Características

| Feature                   | Descripción                                              |
| ------------------------- | -------------------------------------------------------- |
| **Sistema de Partículas** | 500+ partículas cósmicas con física avanzada             |
| **Fases de Animación**    | void → stardust → convergence → singularity → revelation |
| **Duración**              | 3-5 segundos configurable                                |
| **Logo Orbital**          | Núcleo de singularidad con órbitas elípticas animadas    |
| **Tipografía**            | ΧΡΟΝΟΣ con efectos de glow y sombras cósmicas            |
| **Paleta**                | Azules profundos, púrpuras, plateados, dorados           |

### Uso

```tsx
import { ChronosRisingAnimation } from "@/app/_components/chronos-2026"

function App() {
  const handleComplete = () => {
    // Navegar al contenido principal
    router.push("/dashboard")
  }

  return (
    <ChronosRisingAnimation
      onComplete={handleComplete}
      duration={4500} // 4.5 segundos
      skipEnabled={true} // Permitir saltar
      showProgress={true} // Mostrar barra de progreso
      variant="cosmic" // cosmic | singularity | nebula | quantum
    />
  )
}
```

### Props

| Prop           | Tipo         | Default    | Descripción          |
| -------------- | ------------ | ---------- | -------------------- |
| `onComplete`   | `() => void` | -          | Callback al terminar |
| `duration`     | `number`     | `4500`     | Duración en ms       |
| `skipEnabled`  | `boolean`    | `true`     | Permitir saltar      |
| `showProgress` | `boolean`    | `true`     | Mostrar progreso     |
| `variant`      | `string`     | `'cosmic'` | Variante visual      |

### Fases de Animación

1. **Void (0-15%)**: Oscuridad total con partículas emergiendo
2. **Stardust (15-35%)**: Partículas en órbita suave
3. **Convergence (35-55%)**: Partículas convergen al centro
4. **Singularity (55-75%)**: Órbita rápida, logo emerge
5. **Revelation (75-95%)**: Expansión épica, ΧΡΟΝΟΣ aparece

---

## 🔮 Página de Login - "Glassmorphic Gateway"

### Concepto

Página de login premium con glassmorphism Gen-5 auténtico, inspirada en diseño futurista con
elementos flotantes sobre fondos translúcidos.

### Características

| Feature                       | Descripción                                      |
| ----------------------------- | ------------------------------------------------ |
| **Glassmorphism Gen-5**       | Fondo completamente visible con blur avanzado    |
| **Fondo Animado**             | Partículas cósmicas + orbes de luz ambiental     |
| **Validación en Tiempo Real** | Feedback visual inmediato                        |
| **Efectos Hover**             | Bordes brillantes, sombras de glow               |
| **Seguridad**                 | HTTPS, encriptación, protección anti-brute force |
| **Social Login**              | Google, Apple, GitHub                            |

### Uso

```tsx
import { GlassmorphicGateway } from "@/app/_components/chronos-2026"

function LoginPage() {
  return (
    <GlassmorphicGateway
      onSuccess={() => router.push("/dashboard")}
      onRegisterClick={() => router.push("/register")}
      showSocialLogin={true}
      enableBiometric={false}
    />
  )
}
```

### Props

| Prop              | Tipo         | Default        | Descripción          |
| ----------------- | ------------ | -------------- | -------------------- |
| `onSuccess`       | `() => void` | -              | Login exitoso        |
| `onRegisterClick` | `() => void` | -              | Ir a registro        |
| `redirectUrl`     | `string`     | `'/dashboard'` | URL de redirección   |
| `showSocialLogin` | `boolean`    | `true`         | Mostrar login social |
| `enableBiometric` | `boolean`    | `false`        | Habilitar biométrico |

### Componentes Internos

- **AnimatedBackground**: Canvas con partículas y orbes de luz
- **OrbitalLogoCompact**: Logo orbital animado
- **GlassInput**: Input con glassmorphism y validación
- **GlassButton**: Botón premium con gradientes

---

## 🤖 Widget de IA - "The Oracle Within"

### Concepto

Widget de Asistente IA Premium que transmite confianza, conocimiento y accesibilidad. Diseño
inspirado en interfaces de IA futuristas.

### Características

| Feature               | Descripción                                |
| --------------------- | ------------------------------------------ |
| **Avatar Orb**        | Orb animado con estados visuales           |
| **Estados**           | idle, listening, thinking, speaking, error |
| **Chat Interface**    | Burbujas de mensaje con acciones           |
| **Voice Support**     | Visualizador de ondas de voz               |
| **Context Memory**    | Mantiene contexto de conversación          |
| **Quick Suggestions** | Sugerencias rápidas predefinidas           |

### Uso

```tsx
import { TheOracleWithin } from "@/app/_components/chronos-2026"

function Dashboard() {
  return (
    <div>
      {/* Tu contenido */}

      {/* Widget de IA flotante */}
      <TheOracleWithin
        position="bottom-right"
        initialOpen={false}
        onMessage={(userMsg, aiResponse) => {
          console.log("Conversación:", userMsg, aiResponse)
        }}
      />
    </div>
  )
}
```

### Props

| Prop           | Tipo       | Default          | Descripción          |
| -------------- | ---------- | ---------------- | -------------------- |
| `className`    | `string`   | `''`             | Clase CSS adicional  |
| `initialOpen`  | `boolean`  | `false`          | Abrir por defecto    |
| `position`     | `string`   | `'bottom-right'` | Posición del widget  |
| `onMessage`    | `function` | -                | Callback de mensajes |
| `customConfig` | `object`   | -                | Config del asistente |

### Estados del Orb

| Estado      | Color   | Animación       |
| ----------- | ------- | --------------- |
| `idle`      | Violeta | Pulso suave     |
| `listening` | Verde   | Pulso + anillos |
| `thinking`  | Dorado  | Rotación rápida |
| `speaking`  | Rosa    | Ondas de audio  |
| `error`     | Rojo    | Pulso rápido    |

### Componentes Internos

- **OracleOrb**: Avatar visual con Canvas
- **VoiceVisualizer**: Barras de audio animadas
- **MessageBubble**: Burbujas de chat con acciones

---

## 🔌 Integración y Uso

### Página de Login Completa

```tsx
// app/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { ChronosRisingAnimation } from "@/app/_components/chronos-2026"
import { GlassmorphicGateway } from "@/app/_components/chronos-2026"

export default function LoginPage() {
  const router = useRouter()
  const [showIntro, setShowIntro] = useState(true)
  const [isReady, setIsReady] = useState(false)

  // Verificar si ya se mostró la intro
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("chronos-intro-seen")
    if (hasSeenIntro) {
      setShowIntro(false)
      setIsReady(true)
    }
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem("chronos-intro-seen", "true")
    setShowIntro(false)
    setTimeout(() => setIsReady(true), 100)
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {showIntro && <ChronosRisingAnimation onComplete={handleIntroComplete} duration={4500} />}
      </AnimatePresence>

      <AnimatePresence>
        {!showIntro && isReady && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassmorphicGateway
              onSuccess={() => router.push("/dashboard")}
              onRegisterClick={() => router.push("/register")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Dashboard con Widget IA

```tsx
// app/(dashboard)/layout.tsx
import { TheOracleWithin } from "@/app/_components/chronos-2026"

export default function DashboardLayout({ children }) {
  return (
    <div>
      {children}

      {/* Widget IA disponible en todo el dashboard */}
      <TheOracleWithin
        position="bottom-right"
        customConfig={{
          name: "Oracle",
          personality: "professional",
          contextMemory: true,
        }}
      />
    </div>
  )
}
```

---

## 🎨 Paleta de Colores CHRONOS

### Colores Primarios

| Color             | Hex       | RGB            | Uso                  |
| ----------------- | --------- | -------------- | -------------------- |
| Violeta Eléctrico | `#8B00FF` | `139, 0, 255`  | Acciones principales |
| Oro Premium       | `#FFD700` | `255, 215, 0`  | Acentos, destacados  |
| Plasma Fucsia     | `#FF1493` | `255, 20, 147` | Estados activos      |

### Colores de Fondo

| Color         | Hex       | RGB          | Uso              |
| ------------- | --------- | ------------ | ---------------- |
| Void Black    | `#000000` | `0, 0, 0`    | Fondo principal  |
| Deep Space    | `#050510` | `5, 5, 16`   | Fondo secundario |
| Nebula Purple | `#1a1025` | `26, 16, 37` | Cards, modals    |

### Colores Neutrales

| Color       | Hex       | RGB             | Uso             |
| ----------- | --------- | --------------- | --------------- |
| Silver Star | `#E0E0E0` | `224, 224, 224` | Texto principal |
| White       | `#FFFFFF` | `255, 255, 255` | Highlights      |

### Glassmorphism

| Color        | Valor                    | Uso               |
| ------------ | ------------------------ | ----------------- |
| Glass Light  | `rgba(255,255,255,0.06)` | Fondos sutiles    |
| Glass Medium | `rgba(255,255,255,0.10)` | Cards principales |
| Glass Border | `rgba(255,255,255,0.12)` | Bordes            |
| Glass Hover  | `rgba(255,255,255,0.15)` | Estados hover     |

### ⛔ Colores Prohibidos

- **Cyan puro** (`#00FFFF`)
- **Turquesa**
- **Azul frío puro**

---

## ⚙️ Especificaciones Técnicas

### Dependencias

```json
{
  "motion": "latest",
  "lucide-react": "latest"
}
```

### Performance

| Componente          | FPS Target | Canvas Size   | Particles |
| ------------------- | ---------- | ------------- | --------- |
| ChronosRising       | 60         | Fullscreen    | 500+      |
| GlassmorphicGateway | 60         | Fullscreen    | 100       |
| TheOracleWithin     | 60         | 64x64 - 96x96 | N/A       |

### Compatibilidad

| Browser | Soporte |
| ------- | ------- |
| Chrome  | ✅ 100+ |
| Firefox | ✅ 100+ |
| Safari  | ✅ 15+  |
| Edge    | ✅ 100+ |

### Responsividad

| Breakpoint | Comportamiento                 |
| ---------- | ------------------------------ |
| < 640px    | Widget pequeño, login compacto |
| 640-1024px | Tamaño medio                   |
| > 1024px   | Tamaño completo                |

---

## 📁 Estructura de Archivos

```
app/_components/chronos-2026/
├── branding/
│   ├── ChronosRisingAnimation.tsx  # 🌌 Animación de inicio
│   ├── ChronosLogo.tsx
│   ├── CinematicOpening.tsx
│   └── index.ts
├── auth/
│   ├── GlassmorphicGateway.tsx     # 🔮 Login premium
│   └── index.ts
├── ai/
│   ├── TheOracleWithin.tsx         # 🤖 Widget IA
│   ├── ZeroAIWidget.tsx
│   └── index.ts
└── index.ts                         # Exports unificados
```

---

## 🚀 Roadmap

- [ ] Integración con GPT-4/Claude para respuestas reales
- [ ] Soporte de voz con ElevenLabs/Deepgram
- [ ] Más variantes de animación de inicio
- [ ] Temas personalizables (light mode)
- [ ] Animaciones de transición entre páginas

---

**Creado con ❤️ por CHRONOS INFINITY TEAM**
