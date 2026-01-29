# 🌌 QUANTUM PARTICLE SYSTEM — Guía de Uso

## Descripción

El nuevo sistema de partículas **Quantum Particle Field** es un upgrade masivo del sistema anterior, ofreciendo:

- ✨ Partículas 3D con trails y glow procedural
- 🎯 Interactividad avanzada con mouse (repulsión magnética)
- 📜 Efectos de scroll parallax integrados
- 🎨 6 variantes de color preconfiguradas
- ⚡ 4 niveles de intensidad
- 🔄 Auto-resize responsivo
- 🎬 60fps+ garantizados

## Uso Básico

```tsx
import { QuantumParticleField, UnifiedBackground } from '@/app/_components/chronos-2026'

// Opción 1: Solo partículas
<QuantumParticleField
  variant="aurora"
  intensity="normal"
  particleCount={100}
  interactive={true}
  scrollEffect={true}
/>

// Opción 2: Background unificado (Aurora + Partículas)
<UnifiedBackground variant="cosmic" intensity="high">
  <YourContent />
</UnifiedBackground>
```

## Variantes Disponibles

| Variante   | Colores                | Uso Recomendado           |
|------------|------------------------|---------------------------|
| `aurora`   | Violeta/Fucsia/Cyan    | Dashboard principal       |
| `cosmic`   | Indigo/Blue/Teal       | Órdenes, datos           |
| `neural`   | Cyan/Purple/Gold       | AI, conexiones           |
| `energy`   | Emerald/Green/Yellow   | Ventas, finanzas         |
| `quantum`  | Bright Violet/Cyan/Pink| Efectos especiales       |
| `nebula`   | Purple/Rose/Orange     | Fondos dramáticos        |

## Niveles de Intensidad

| Intensidad | Partículas | Glow    | Velocidad | Conexiones |
|------------|------------|---------|-----------|------------|
| `subtle`   | 50%        | 40%     | 60%       | 50%        |
| `normal`   | 100%       | 70%     | 100%      | 100%       |
| `intense`  | 150%       | 100%    | 130%      | 130%       |
| `extreme`  | 200%       | 130%    | 160%      | 150%       |

## Props Completos

```tsx
interface QuantumParticleFieldProps {
  particleCount?: number        // Default: 120
  variant?: VariantType         // Default: 'aurora'
  intensity?: IntensityType     // Default: 'normal'
  interactive?: boolean         // Default: true
  scrollEffect?: boolean        // Default: true
  mouseRadius?: number          // Default: 150
  connectionDistance?: number   // Default: 120
  showTrails?: boolean          // Default: true
  enableGlow?: boolean          // Default: true
  speed?: number                // Default: 1
  depthRange?: number           // Default: 150
  className?: string
}
```

## Hooks Premium de Interacción

```tsx
import { 
  useSmoothMouse,
  useElementMouse,
  use3DTilt,
  useMagnetic,
  useScrollReveal,
  useScrollVelocity,
  useGlowEffect 
} from '@/app/_components/chronos-2026'

// Ejemplo: Efecto 3D tilt en card
function PremiumCard({ children }) {
  const { ref, style, innerStyle, handlers } = use3DTilt<HTMLDivElement>({
    maxTilt: 15,
    scale: 1.05,
  })

  return (
    <motion.div ref={ref} style={style} {...handlers}>
      <motion.div style={innerStyle}>
        {children}
      </motion.div>
    </motion.div>
  )
}

// Ejemplo: Efecto magnético en botón
function MagneticButton({ children }) {
  const { ref, style, handlers } = useMagnetic<HTMLButtonElement>({
    strength: 0.3,
    radius: 100,
  })

  return (
    <motion.button ref={ref} style={style} {...handlers}>
      {children}
    </motion.button>
  )
}
```

## Integración con SupremePanelWrapper

```tsx
import { SupremePanelWrapper } from '@/app/_components/chronos-2026'

// El wrapper ahora usa QuantumParticleField por defecto
function MiPanel() {
  return (
    <SupremePanelWrapper 
      variant="ventas"           // Usa configuración específica para ventas
      useQuantumSystem={true}    // Usar nuevo sistema (default: true)
      particleOpacity={0.5}
    >
      <ContenidoDelPanel />
    </SupremePanelWrapper>
  )
}
```

## Performance Tips

1. **Para dispositivos móviles**: Usar `intensity="subtle"` y `particleCount={50}`
2. **Para paneles con mucho contenido**: Usar `scrollEffect={false}` para reducir cálculos
3. **Para background fijo**: Usar `position: fixed` en el contenedor
4. **Para múltiples instancias**: Compartir el mismo sistema de partículas si es posible

## Migración desde Sistema Anterior

```tsx
// ANTES
<AuroraParticles width={1920} height={1080} className="opacity-40" />

// DESPUÉS
<QuantumParticleField
  variant="aurora"
  intensity="normal"
  particleCount={100}
  className="opacity-40"
/>
```

---

**Versión**: 2.0.0 QUANTUM ELEVATION  
**Autor**: CHRONOS SUPREME AI  
**Fecha**: 2026-01-20
