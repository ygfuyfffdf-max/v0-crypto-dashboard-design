# 🎨 CHRONOS PREMIUM DESIGN ELEVATION PROMPT

> **Prompt Supremo para elevar TODOS los componentes, paneles, UI/UX, animaciones y efectos visuales
> al nivel más avanzado, moderno, premium, elegante y cinematográfico posible.**

---

## 🎯 DIRECTIVA PRINCIPAL

Cuando se solicite mejorar, crear o refactorizar cualquier componente visual de CHRONOS, sigue estas
directrices para lograr un diseño **ULTRA PREMIUM** que sea:

- ✨ **Elegante** - Minimalismo sofisticado con detalles exquisitos
- 🌟 **Moderno** - Tendencias 2025-2026 de diseño web
- 💎 **Premium** - Calidad de producto AAA/enterprise
- 🎬 **Cinematográfico** - Efectos visuales nivel Hollywood
- 🔮 **Interactivo** - Micro-interacciones satisfactorias
- ⚡ **Performante** - 60fps obligatorio, GPU-optimizado

---

## 🚨 REGLAS CRÍTICAS DE SEGURIDAD

### ⛔ NUNCA romper funcionalidad existente

```typescript
// ANTES de cualquier cambio visual:
// 1. Verificar que la lógica de negocio NO se toque
// 2. Mantener todas las props y callbacks intactos
// 3. Preservar estados de formularios y validaciones
// 4. NO eliminar handlers de eventos existentes
// 5. Verificar build después de cada cambio significativo
```

### ✅ Patrón de Edición Segura

```typescript
// 1. Identificar el wrapper/container exterior
// 2. Modificar SOLO clases de estilos
// 3. Agregar efectos como elementos decorativos separados
// 4. Envolver en motion.div para animaciones SIN tocar lógica interna
// 5. Usar CSS variables para colores dinámicos
```

---

## 🎨 SISTEMA DE COLORES PREMIUM

### Variables CSS Disponibles (usar SIEMPRE)

```css
/* Colores Base CHRONOS GEN5 */
--c-void: /* Fondo más oscuro */
  --c-void-deep: /* Profundidad máxima */ --c-surface: /* Superficie principal */
    --c-surface-elevated: /* Superficie elevada */ --c-accent: /* Acento primario violeta */
    --c-accent-subtle: /* Acento sutil */ --c-accent-glow: /* Resplandor accent */
    --c-accent-intense: /* Accent intenso */ --c-gold: /* Dorado premium */
    --c-gold-glow: /* Resplandor dorado */ --c-pink: /* Rosa accent */
    --c-pink-glow: /* Resplandor rosa */ --c-cyan: /* Cian accent */
    --c-cyan-glow: /* Resplandor cian */ /* Aurora Spectrum */ --aurora-1 a
    --aurora-8: /* Gradientes aurora */ /* Colores de Bancos */ --bank-monte,
  --bank-usa, --bank-profit, etc.;
```

### Gradientes Premium Recomendados

```typescript
// Gradiente Aurora Violeta-Rosa-Azul
"bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-indigo-500/20"

// Gradiente Oro Premium
"bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-orange-500/30"

// Gradiente Cristal
"bg-gradient-to-br from-white/5 via-white/10 to-white/5"

// Gradiente Profundidad
"bg-gradient-to-b from-transparent via-c-void/50 to-c-void"

// Mesh Gradient (efecto premium 2026)
"bg-[radial-gradient(ellipse_at_top_left,var(--c-accent-subtle),transparent_50%),radial-gradient(ellipse_at_bottom_right,var(--c-pink-glow),transparent_50%)]"
```

---

## 💫 SISTEMA DE ANIMACIONES

### Animaciones Disponibles en Tailwind

```typescript
// 🌟 BÁSICAS (entrada/salida)
"animate-fade-in" // Fade suave
"animate-slide-up" // Entrada desde abajo
"animate-slide-down" // Entrada desde arriba
"animate-scale-in" // Scale con bounce

// ✨ CONTINUAS SUAVES
"animate-float" // Flotación orgánica
"animate-breathe" // Respiración sutil
"animate-shimmer" // Brillo recorriendo
"animate-gradient" // Gradiente en movimiento
"animate-spotlight" // Efecto spotlight

// 🔮 MORFOLÓGICAS
"animate-blob" // Deformación orgánica
"animate-morph" // Cambio de forma
"animate-liquid-morph" // Morfeo líquido
"animate-aurora-shift" // Aurora dinámica

// 🎬 CINEMATOGRÁFICAS ULTRA
"animate-glitch" // Efecto glitch cyber
"animate-hologram" // Parpadeo holográfico
"animate-chromatic" // Aberración cromática
"animate-neon-flicker" // Neón parpadeante
"animate-cyber-glitch" // Glitch con clip-path
"animate-scan-line" // Línea de escaneo CRT
"animate-matrix-rain" // Lluvia matrix

// 🌌 ESPACIALES 3D
"animate-parallax-float" // Flotación con parallax 3D
"animate-3d-rotate-x" // Rotación eje X
"animate-3d-rotate-y" // Rotación eje Y
"animate-perspective-shift" // Cambio perspectiva
"animate-depth-pulse" // Pulso con profundidad

// 🌈 CÓSMICAS
"animate-quantum-wave" // Onda cuántica
"animate-aurora-dance" // Danza aurora
"animate-nebula-swirl" // Remolino nebulosa
"animate-photon-burst" // Explosión fotónica
"animate-plasma-flow" // Flujo plasma
"animate-warp-speed" // Velocidad warp
"animate-crystallize" // Cristalización

// ⚡ ENERGÉTICAS
"animate-energy-pulse" // Pulso de energía
"animate-gravity-pull" // Efecto gravedad
"animate-quantum-entangle" // Entrelazamiento
```

### Combinaciones Recomendadas

```typescript
// Card Premium con múltiples efectos
<div className="
  group relative overflow-hidden
  animate-fade-in
  hover:animate-depth-pulse
  transition-all duration-500
">
  {/* Fondo con gradiente animado */}
  <div className="absolute inset-0 animate-aurora-shift opacity-30" />

  {/* Efecto glow en hover */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100
    animate-energy-pulse transition-opacity duration-700" />

  {/* Contenido */}
  <div className="relative z-10">...</div>
</div>
```

---

## 🪟 GLASSMORPHISM GEN5

### Patrón Base Premium

```typescript
const GlassCard = ({ children, intensity = 'medium' }) => {
  const intensityClasses = {
    light: 'bg-white/[0.02] backdrop-blur-sm border-white/5',
    medium: 'bg-white/[0.05] backdrop-blur-xl border-white/10',
    strong: 'bg-white/[0.08] backdrop-blur-2xl border-white/15',
    premium: 'bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-3xl border-white/20',
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border
      ${intensityClasses[intensity]}
      shadow-[0_8px_32px_rgba(0,0,0,0.3)]
      before:absolute before:inset-0 before:bg-gradient-to-br
      before:from-white/10 before:to-transparent before:opacity-50
      transition-all duration-500
      hover:border-white/20 hover:shadow-[0_12px_48px_rgba(139,92,246,0.15)]
    `}>
      {children}
    </div>
  )
}
```

### Variante con Glow

```typescript
<div className="
  relative overflow-hidden rounded-2xl
  bg-white/[0.03] backdrop-blur-xl
  border border-white/10
  before:absolute before:inset-0
  before:bg-gradient-to-br before:from-violet-500/10 before:via-transparent before:to-fuchsia-500/10
  after:absolute after:inset-[-1px] after:rounded-2xl
  after:bg-gradient-to-r after:from-violet-500/20 after:via-transparent after:to-pink-500/20
  after:opacity-0 hover:after:opacity-100
  after:transition-opacity after:duration-500
  shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
  hover:shadow-[0_0_40px_rgba(139,92,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)]
">
```

---

## ⚡ MICRO-INTERACCIONES

### Botones Premium

```typescript
// Botón con efecto ripple + glow
<motion.button
  className="
    relative overflow-hidden px-6 py-3 rounded-xl
    bg-gradient-to-r from-violet-600 to-indigo-600
    font-semibold text-white
    shadow-[0_4px_20px_rgba(139,92,246,0.4)]
    hover:shadow-[0_8px_30px_rgba(139,92,246,0.6)]
    active:scale-[0.98]
    transition-all duration-300
    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0
    before:translate-x-[-200%] hover:before:translate-x-[200%]
    before:transition-transform before:duration-700
  "
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <span className="relative z-10">Acción Premium</span>
</motion.button>

// Botón outline elegante
<button className="
  relative px-6 py-3 rounded-xl
  border border-violet-500/50
  text-violet-300
  bg-transparent
  hover:bg-violet-500/10 hover:border-violet-400
  hover:text-violet-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
  active:scale-[0.98]
  transition-all duration-300
  group
">
  <span className="relative z-10 flex items-center gap-2">
    <Icon className="w-4 h-4 group-hover:animate-wiggle" />
    Acción Secundaria
  </span>
</button>
```

### Inputs Premium

```typescript
<div className="relative group">
  {/* Label flotante */}
  <label className="
    absolute left-4 top-1/2 -translate-y-1/2
    text-gray-400 pointer-events-none
    transition-all duration-300
    group-focus-within:top-2 group-focus-within:text-xs
    group-focus-within:text-violet-400
    peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
  ">
    Campo Premium
  </label>

  <input className="
    peer w-full px-4 pt-6 pb-2 rounded-xl
    bg-white/[0.03] border border-white/10
    text-white placeholder-transparent
    focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
    focus:bg-white/[0.05]
    transition-all duration-300
  " />

  {/* Línea de brillo inferior */}
  <div className="
    absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px]
    bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500
    group-focus-within:w-full
    transition-all duration-500
  " />
</div>
```

### Cards Interactivas

```typescript
<motion.div
  className="
    relative overflow-hidden rounded-2xl p-6
    bg-gradient-to-br from-white/[0.05] to-white/[0.02]
    backdrop-blur-xl border border-white/10
    cursor-pointer
    group
  "
  whileHover={{
    scale: 1.02,
    rotateX: 2,
    rotateY: -2,
  }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  style={{ transformStyle: 'preserve-3d' }}
>
  {/* Gradiente que sigue el mouse */}
  <motion.div
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
    style={{
      background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 40%)',
    }}
  />

  {/* Borde brillante en hover */}
  <div className="
    absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
    bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20
    blur-sm transition-opacity duration-500
  " />

  {/* Contenido elevado */}
  <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
    {/* ... */}
  </div>
</motion.div>
```

---

## 📊 PANELES BENTO PREMIUM

### Estructura Base Panel

```typescript
const BentoPanelPremium = ({ title, icon: Icon, children, variant = 'default' }) => {
  const variants = {
    default: 'from-violet-500/10 via-transparent to-indigo-500/10',
    gold: 'from-amber-500/10 via-transparent to-orange-500/10',
    success: 'from-emerald-500/10 via-transparent to-teal-500/10',
    danger: 'from-rose-500/10 via-transparent to-red-500/10',
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="
        relative overflow-hidden rounded-3xl
        bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.01]
        backdrop-blur-2xl
        border border-white/[0.08]
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]
        p-6 lg:p-8
        group
      "
    >
      {/* Fondo decorativo */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${variants[variant]}
        opacity-50 group-hover:opacity-70 transition-opacity duration-700
      `} />

      {/* Grid decorativo */}
      <div className="
        absolute inset-0 opacity-[0.02]
        bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]
        bg-[size:50px_50px]
      " />

      {/* Orbe de luz superior */}
      <div className="
        absolute -top-20 -right-20 w-60 h-60
        bg-gradient-radial from-violet-500/20 to-transparent
        blur-3xl opacity-50 group-hover:opacity-80
        animate-float
        transition-opacity duration-1000
      " />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 mb-6">
        <div className="
          p-3 rounded-2xl
          bg-gradient-to-br from-violet-500/20 to-indigo-500/20
          border border-violet-500/20
          shadow-[0_0_20px_rgba(139,92,246,0.2)]
          group-hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]
          transition-shadow duration-500
        ">
          <Icon className="w-6 h-6 text-violet-400" />
        </div>

        <div>
          <h2 className="
            text-xl font-bold
            bg-gradient-to-r from-white via-violet-200 to-white
            bg-clip-text text-transparent
          ">
            {title}
          </h2>
          <div className="
            h-1 w-12 mt-2 rounded-full
            bg-gradient-to-r from-violet-500 to-fuchsia-500
            group-hover:w-24 transition-all duration-500
          " />
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.section>
  )
}
```

---

## 📈 VISUALIZACIONES DE DATOS

### Métricas con Animación

```typescript
const MetricCard = ({ label, value, change, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="
      relative p-5 rounded-2xl overflow-hidden
      bg-gradient-to-br from-white/[0.05] to-white/[0.02]
      border border-white/10
      group hover:border-violet-500/30
      transition-all duration-500
    "
  >
    <div className="flex items-start justify-between mb-4">
      <div className="
        p-2.5 rounded-xl
        bg-violet-500/10 text-violet-400
        group-hover:bg-violet-500/20
        transition-colors duration-300
      ">
        <Icon className="w-5 h-5" />
      </div>

      <span className={`
        text-sm font-medium px-2 py-1 rounded-lg
        ${change >= 0
          ? 'text-emerald-400 bg-emerald-500/10'
          : 'text-rose-400 bg-rose-500/10'
        }
      `}>
        {change >= 0 ? '+' : ''}{change}%
      </span>
    </div>

    {/* Valor con contador animado */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-3xl font-bold text-white mb-1"
    >
      <CountUp end={value} duration={2} separator="," />
    </motion.div>

    <p className="text-sm text-gray-400">{label}</p>

    {/* Barra de progreso animada */}
    <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '75%' }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
      />
    </div>
  </motion.div>
)
```

### Gráficos con Glow

```typescript
// Agregar a gráficos existentes:
const chartContainerStyles = `
  relative p-6 rounded-2xl
  bg-gradient-to-br from-white/[0.03] to-transparent
  border border-white/10

  /* Efecto glow detrás del gráfico */
  before:absolute before:inset-0 before:rounded-2xl
  before:bg-gradient-radial before:from-violet-500/10 before:to-transparent
  before:blur-2xl before:opacity-50
`

// CSS para líneas de gráfico con glow
const lineGlowStyle = {
  filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))",
}
```

---

## 🎭 MODALES PREMIUM

### Modal Base Cinematográfico

```typescript
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop con blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="
          fixed inset-0 z-50
          bg-black/60 backdrop-blur-md
        "
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="
          fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-lg
          bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-gray-900/95
          backdrop-blur-2xl
          rounded-3xl
          border border-white/10
          shadow-[0_25px_100px_-12px_rgba(0,0,0,0.8),0_0_60px_-15px_rgba(139,92,246,0.3)]
          overflow-hidden
        "
      >
        {/* Decoración superior */}
        <div className="
          absolute top-0 left-0 right-0 h-1
          bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500
        " />

        {/* Orbes decorativos */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl" />

        {/* Contenido */}
        <div className="relative z-10 p-6">
          {children}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

## 🔮 EFECTOS ESPECIALES

### Efecto Partículas Flotantes

```typescript
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="
          absolute w-1 h-1 rounded-full bg-violet-400/30
          animate-float
        "
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`,
        }}
      />
    ))}
  </div>
)
```

### Efecto Scan Line CRT

```typescript
const ScanLineEffect = () => (
  <div className="
    absolute inset-0 pointer-events-none overflow-hidden
    before:absolute before:inset-0
    before:bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)]
    before:bg-[size:100%_4px]
    after:absolute after:inset-0 after:w-full after:h-[2px]
    after:bg-white/5 after:animate-scan-line
  " />
)
```

### Efecto Aurora Background

```typescript
const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="
      absolute -top-1/2 -left-1/2 w-full h-full
      bg-gradient-conic from-violet-500/30 via-fuchsia-500/30 to-violet-500/30
      animate-rotate-slow blur-3xl opacity-30
    " />
    <div className="
      absolute -bottom-1/2 -right-1/2 w-full h-full
      bg-gradient-conic from-indigo-500/30 via-cyan-500/30 to-indigo-500/30
      animate-rotate-slow blur-3xl opacity-30
      animation-delay-4000
    " />
  </div>
)
```

### Efecto Grid Cyber

```typescript
const CyberGrid = () => (
  <div className="
    absolute inset-0 pointer-events-none
    bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)]
    bg-[size:60px_60px]
    [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]
  " />
)
```

---

## 🛡️ CHECKLIST DE VALIDACIÓN

Antes de finalizar cualquier mejora de diseño, verificar:

### Funcionalidad

- [ ] ¿Todos los botones siguen funcionando?
- [ ] ¿Los formularios envían datos correctamente?
- [ ] ¿Los modales abren/cierran sin errores?
- [ ] ¿Las validaciones Zod siguen activas?
- [ ] ¿Los estados (loading, error, success) se muestran?

### Performance

- [ ] ¿Animaciones corren a 60fps? (usar DevTools → Performance)
- [ ] ¿No hay layout shifts (CLS)?
- [ ] ¿Imágenes tienen lazy loading?
- [ ] ¿Efectos pesados usan `will-change`?

### Accesibilidad

- [ ] ¿Contraste de texto suficiente? (4.5:1 mínimo)
- [ ] ¿Respeta `prefers-reduced-motion`?
- [ ] ¿Focus visible en elementos interactivos?
- [ ] ¿Labels en formularios?

### Build

- [ ] `pnpm build` pasa sin errores
- [ ] `pnpm lint` sin warnings críticos
- [ ] `pnpm type-check` sin errores TypeScript

---

## 📝 TEMPLATE DE IMPLEMENTACIÓN

Usar este template al mejorar cualquier componente:

```typescript
// 1. IMPORTACIONES PREMIUM
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/app/lib/utils'

// 2. VARIANTES DE ANIMACIÓN
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { opacity: 0, y: -20 }
}

// 3. COMPONENTE CON DISEÑO PREMIUM
export const ComponentePremium = ({ children, ...props }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        // Base
        'relative overflow-hidden rounded-2xl p-6',
        // Glassmorphism
        'bg-white/[0.03] backdrop-blur-xl border border-white/10',
        // Shadows & Glow
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        'hover:shadow-[0_12px_48px_rgba(139,92,246,0.15)]',
        // Transitions
        'transition-all duration-500',
        // Group para efectos hover
        'group'
      )}
      {...props}
    >
      {/* Efectos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
```

---

## 🎬 RECURSOS ADICIONALES

- **Documentación completa**: `docs/DESIGN_ARSENAL_SUPREME_2026.md`
- **Sistema visual**: `docs/ADVANCED_VISUAL_SYSTEM.md`
- **Shaders disponibles**: `app/shaders/effects/*.glsl`
- **Tailwind config**: `tailwind.config.ts` (661 líneas de animaciones)
- **Snippets VS Code**: `.vscode/chronos.code-snippets`

---

> 💡 **Recuerda**: El diseño premium no es solo estética, es la combinación perfecta de **belleza
> visual + funcionalidad robusta + performance óptimo**. Cada pixel cuenta, cada transición importa,
> cada interacción debe ser satisfactoria.
