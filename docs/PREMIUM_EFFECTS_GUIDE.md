# 🌟 CHRONOS PREMIUM EFFECTS — Documentación Completa

> **Sistema de efectos premium de nivel OMEGA para CHRONOS 2026**
> Tecnologías TOP 1: Motion, React Spring, Rapier3D

---

## 📚 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Físicas Reales (Rapier3D)](#físicas-reales)
3. [Animaciones Orgánicas (React Spring)](#animaciones-orgánicas)
4. [Scroll Effects 3D](#scroll-effects-3d)
5. [Contadores Animados](#contadores-animados)
6. [Hover Effects Premium](#hover-effects-premium)
7. [Ejemplos Completos](#ejemplos-completos)

---

## 🚀 Instalación

```bash
pnpm install motion @react-spring/web @react-spring/three @dimforge/rapier3d-compat
```

### Importación Centralizada

```typescript
import {
  // Físicas
  initRapier,
  createStandardWorld,

  // Animaciones orgánicas
  OrganicButton,
  useHoverSpring,

  // Scroll
  ParallaxSection,
  ScrollProgressBar,

  // Contadores
  AnimatedCounter,
  CurrencyCounter,

  // Hover
  MagneticButton,
  Tilt3DCard,
  GlowButton,
} from '@/app/_lib/premium-effects'
```

---

## ⚛️ Físicas Reales (Rapier3D)

### Inicialización

```typescript
import { initRapier, createStandardWorld } from '@/app/_lib/premium-effects'

// En tu componente
useEffect(() => {
  async function setupPhysics() {
    await initRapier()
    const world = await createStandardWorld()

    // Tu código de física aquí
  }

  setupPhysics()
}, [])
```

### Crear Objetos con Física

```typescript
import { createSphere, createCube } from '@/app/_lib/premium-effects'

// Esfera dinámica
const sphere = await createSphere(world, {
  type: 'dynamic',
  position: { x: 0, y: 10, z: 0 },
  mass: 1,
  restitution: 0.8, // Bounciness
  friction: 0.5,
}, 1.0) // radio

// Cubo fijo (piso)
const floor = await createCube(world, {
  type: 'fixed',
  position: { x: 0, y: 0, z: 0 },
}, { x: 10, y: 0.1, z: 10 }) // dimensiones
```

### Aplicar Fuerzas

```typescript
import { applyImpulse, applyForce } from '@/app/_lib/premium-effects'

// Impulso instantáneo (salto)
applyImpulse(rigidBody, { x: 0, y: 5, z: 0 })

// Fuerza continua (empuje)
applyForce(rigidBody, { x: 2, y: 0, z: 0 })
```

---

## 🌊 Animaciones Orgánicas (React Spring)

### Botón con Hover Spring

```tsx
import { OrganicButton } from '@/app/_lib/premium-effects'

function MyComponent() {
  return (
    <OrganicButton variant="primary">
      Click Me
    </OrganicButton>
  )
}
```

### Hook Personalizado de Hover

```tsx
import { useHoverSpring } from '@/app/_lib/premium-effects'

function MyCard() {
  const { spring, handlers } = useHoverSpring(1, 1.1)

  return (
    <animated.div style={spring} {...handlers}>
      Contenido
    </animated.div>
  )
}
```

### Entrada Escalonada (Stagger)

```tsx
import { useStaggeredEntranceSpring, animated } from '@/app/_lib/premium-effects'

function MyList({ items }) {
  const trails = useStaggeredEntranceSpring(items)

  return (
    <>
      {trails.map((style, index) => (
        <animated.div key={index} style={style}>
          {items[index]}
        </animated.div>
      ))}
    </>
  )
}
```

---

## 📜 Scroll Effects 3D

### Progress Bar Global

```tsx
import { ScrollProgressBar } from '@/app/_lib/premium-effects'

function Layout({ children }) {
  return (
    <>
      <ScrollProgressBar />
      {children}
    </>
  )
}
```

### Sección con Parallax

```tsx
import { ParallaxSection } from '@/app/_lib/premium-effects'

function Hero() {
  return (
    <ParallaxSection speed={0.5}>
      <h1>Título con Parallax</h1>
    </ParallaxSection>
  )
}
```

### Fade-in al Scrollear

```tsx
import { FadeInSection } from '@/app/_lib/premium-effects'

function Feature() {
  return (
    <FadeInSection>
      <p>Aparece con fade-in</p>
    </FadeInSection>
  )
}
```

### Parallax 3D con Mouse

```tsx
import { MouseParallax3DCard } from '@/app/_lib/premium-effects'

function ProductCard() {
  return (
    <MouseParallax3DCard intensity={10}>
      <img src="/product.jpg" alt="Producto" />
    </MouseParallax3DCard>
  )
}
```

---

## 🔢 Contadores Animados

### Contador Básico

```tsx
import { AnimatedCounter } from '@/app/_lib/premium-effects'

function Stats() {
  return (
    <div>
      <AnimatedCounter value={1250} duration={2000} />
    </div>
  )
}
```

### Contador de Moneda

```tsx
import { CurrencyCounter } from '@/app/_lib/premium-effects'

function Revenue() {
  return (
    <CurrencyCounter
      value={156789.50}
      currency="MXN"
      showSign={true}
    />
  )
}
```

### Contador de Porcentaje

```tsx
import { PercentageCounter } from '@/app/_lib/premium-effects'

function Growth() {
  return (
    <PercentageCounter
      value={23.5}
      showSign={true}
    />
  )
}
```

### Loading States

```tsx
import {
  PremiumSpinner,
  PulsingDots,
  PremiumProgressBar,
  OrbitalLoader
} from '@/app/_lib/premium-effects'

function LoadingDemo() {
  return (
    <>
      <PremiumSpinner size={40} color="#8B5CF6" />
      <PulsingDots color="#8B5CF6" />
      <PremiumProgressBar progress={75} showPercentage />
      <OrbitalLoader size={60} />
    </>
  )
}
```

---

## ✨ Hover Effects Premium

### Botón Magnético

```tsx
import { MagneticButton } from '@/app/_lib/premium-effects'

function CTA() {
  return (
    <MagneticButton strength={0.3}>
      Comprar Ahora
    </MagneticButton>
  )
}
```

### Card con Tilt 3D

```tsx
import { Tilt3DCard } from '@/app/_lib/premium-effects'

function ProductCard() {
  return (
    <Tilt3DCard intensity={15}>
      <img src="/product.jpg" alt="Producto" />
      <h3>Nombre del Producto</h3>
    </Tilt3DCard>
  )
}
```

### Botón con Glow

```tsx
import { GlowButton } from '@/app/_lib/premium-effects'

function Action() {
  return (
    <GlowButton glowColor="#8B5CF6">
      Registrarse
    </GlowButton>
  )
}
```

### Card con Scale + Glow

```tsx
import { ScaleGlowCard } from '@/app/_lib/premium-effects'

function Feature() {
  return (
    <ScaleGlowCard glowColor="#8B5CF6" scaleAmount={1.05}>
      <h3>Feature Title</h3>
      <p>Description</p>
    </ScaleGlowCard>
  )
}
```

### Botón con Ripple Effect

```tsx
import { RippleButton } from '@/app/_lib/premium-effects'

function Submit() {
  return (
    <RippleButton>
      Enviar
    </RippleButton>
  )
}
```

---

## 🎨 Ejemplos Completos

### Dashboard Card Premium

```tsx
import {
  Tilt3DCard,
  AnimatedCounter,
  PremiumProgressBar,
} from '@/app/_lib/premium-effects'

function DashboardCard() {
  return (
    <Tilt3DCard
      intensity={10}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <h3 className="mb-4 text-xl font-bold text-white">
        Ventas del Mes
      </h3>

      <div className="mb-4 text-4xl font-bold text-violet-400">
        <AnimatedCounter value={125678} prefix="$" />
      </div>

      <PremiumProgressBar progress={75} showPercentage />
    </Tilt3DCard>
  )
}
```

### Hero Section con Parallax

```tsx
import {
  ParallaxSection,
  MagneticButton,
  PulsingOrb,
} from '@/app/_lib/premium-effects'

function Hero() {
  return (
    <ParallaxSection speed={0.3} className="relative min-h-screen">
      {/* Fondo animado */}
      <div className="absolute inset-0">
        <PulsingOrb size={400} color="#8B5CF6" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold">CHRONOS 2026</h1>
        <p className="text-xl text-white/60">Sistema Premium</p>

        <MagneticButton strength={0.4}>
          Comenzar Ahora
        </MagneticButton>
      </div>
    </ParallaxSection>
  )
}
```

### Modal con Efectos Múltiples

```tsx
import {
  motion,
  FadeInSection,
  OrganicButton,
  PremiumSpinner,
} from '@/app/_lib/premium-effects'

function PremiumModal({ isOpen, onClose, isLoading }) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <FadeInSection>
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 text-2xl font-bold">Título</h2>

          {isLoading ? (
            <PremiumSpinner size={40} />
          ) : (
            <>
              <p className="mb-6">Contenido del modal</p>

              <div className="flex gap-4">
                <OrganicButton variant="secondary" onClick={onClose}>
                  Cancelar
                </OrganicButton>
                <OrganicButton variant="primary">
                  Confirmar
                </OrganicButton>
              </div>
            </>
          )}
        </motion.div>
      </FadeInSection>
    </motion.div>
  )
}
```

---

## 🎯 Mejores Prácticas

### 1. Performance

- Usa `useSpring` con `stiffness` y `damping` optimizados
- Limita el número de animaciones simultáneas
- Usa `will-change` CSS para animaciones complejas

### 2. Accesibilidad

- Respeta `prefers-reduced-motion`
- Proporciona alternativas sin animación
- Mantén durations razonables (< 500ms para interacciones)

### 3. Mobile

- Reduce `intensity` en dispositivos móviles
- Desactiva efectos 3D complejos en mobile
- Usa `@media (hover: hover)` para efectos hover

### 4. Composición

```tsx
// ✅ BUENO: Combinar efectos
<Tilt3DCard>
  <ScaleGlowCard>
    <AnimatedCounter value={100} />
  </ScaleGlowCard>
</Tilt3DCard>

// ❌ MALO: Demasiados efectos simultáneos
<MagneticButton>
  <Tilt3DCard>
    <GlowButton>
      {/* Overkill */}
    </GlowButton>
  </Tilt3DCard>
</MagneticButton>
```

---

## 🔧 Configuración Avanzada

### Personalizar Spring Physics

```typescript
import { SPRING_CONFIGS } from '@/app/_lib/premium-effects'

const myCustomConfig = {
  tension: 200,
  friction: 25,
}

const { spring } = useHoverSpring(1, 1.1, myCustomConfig)
```

### Crear Preset de Física

```typescript
import { createStandardWorld } from '@/app/_lib/premium-effects'

async function createCustomWorld() {
  const world = await createStandardWorld()
  world.gravity = { x: 0, y: -5, z: 0 } // Gravedad lunar
  return world
}
```

---

## 📊 Comparativa de Tecnologías

| Librería | Uso Principal | Performance | Complejidad |
|----------|---------------|-------------|-------------|
| **Motion** | Transiciones, animaciones declarativas | ⭐⭐⭐⭐⭐ | Baja |
| **React Spring** | Animaciones físicas orgánicas | ⭐⭐⭐⭐ | Media |
| **Rapier3D** | Simulación física real 3D | ⭐⭐⭐ | Alta |

---

## 🆘 Troubleshooting

### Error: "Rapier not initialized"

```typescript
// Asegúrate de llamar a initRapier primero
await initRapier()
```

### Animaciones no suaves

```typescript
// Aumenta damping y reduce stiffness
const config = { stiffness: 80, damping: 25 }
```

### Performance en mobile

```typescript
// Reduce complexity
const isMobile = window.innerWidth < 768
const intensity = isMobile ? 5 : 15
```

---

## 📝 Changelog

### v2.0.0 (Enero 2026)
- ✅ Migración completa a `motion/react`
- ✅ 173 archivos modernizados
- ✅ Sistema de físicas Rapier3D
- ✅ Animaciones orgánicas React Spring
- ✅ Scroll effects 3D + parallax
- ✅ Contadores animados premium
- ✅ Hover effects magnéticos

---

## 🤝 Contribución

Para agregar nuevos efectos:

1. Crear archivo en `/app/_lib/animations/` o `/app/_lib/effects/`
2. Exportar desde `/app/_lib/premium-effects.ts`
3. Documentar en este README
4. Agregar tests E2E

---

## 📄 Licencia

MIT © CHRONOS 2026
