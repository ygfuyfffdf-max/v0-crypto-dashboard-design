# 🚀 Ultra Premium Components System - CHRONOS 2026

> Sistema de componentes premium de nivel enterprise con animaciones cinematográficas y efectos avanzados

## 📋 Índice

- [Introducción](#introducción)
- [Instalación](#instalación)
- [Componentes Disponibles](#componentes-disponibles)
  - [UltraPremiumButton](#ultrapremiumbutton)
  - [UltraPremiumCard](#ultrapremiumcard)
  - [UltraPremiumInput](#ultrapremiuminput)
- [Animaciones CSS](#animaciones-css)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Personalización](#personalización)
- [Performance](#performance)

---

## 🎯 Introducción

El sistema **Ultra Premium Components** es una colección de componentes React con animaciones cinematográficas de nivel supremo, diseñados específicamente para el sistema CHRONOS 2026. Cada componente incluye:

- ✨ **Animaciones cinematográficas** (ripple, shimmer, aurora dance, scan line)
- 🌊 **Glassmorphism GEN5** con efectos de profundidad
- ⚡ **Micro-interacciones avanzadas** (energy pulse, chromatic aberration)
- 🎨 **Múltiples variantes** para diferentes contextos
- 📱 **Responsive** y accesible (WCAG 2.1 AA)
- 🚀 **Performance optimizado** (60fps garantizados)

---

## 📦 Instalación

Los componentes ya están integrados en el proyecto. Dependencias necesarias:

```bash
# Ya instalado
pnpm add framer-motion
```

### Importación

```typescript
import {
  UltraPremiumButton,
  UltraPremiumCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  UltraPremiumInput,
  UltraPremiumTextarea,
} from '@/app/_components/ui/premium'
```

---

## 🎨 Componentes Disponibles

### UltraPremiumButton

Botón con efectos premium avanzados: ripple effect, shimmer sweep, energy pulse.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'gold' \| 'success'` | `'primary'` | Estilo del botón |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamaño del botón |
| `icon` | `LucideIcon` | - | Icono opcional |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posición del icono |
| `loading` | `boolean` | `false` | Estado de carga |
| `ripple` | `boolean` | `true` | Activar efecto ripple |
| `shimmer` | `boolean` | `true` | Activar efecto shimmer |
| `energyPulse` | `boolean` | `false` | Activar efecto energy pulse |
| `chromatic` | `boolean` | `false` | Activar aberración cromática |

#### Ejemplo

```tsx
import { Sparkles } from 'lucide-react'

<UltraPremiumButton
  variant="primary"
  size="lg"
  icon={Sparkles}
  energyPulse
>
  Comenzar
</UltraPremiumButton>
```

#### Variantes

```tsx
{/* Primary - Gradiente violet/indigo */}
<UltraPremiumButton variant="primary">Primary</UltraPremiumButton>

{/* Secondary - Glassmorphism */}
<UltraPremiumButton variant="secondary">Secondary</UltraPremiumButton>

{/* Danger - Gradiente red/pink */}
<UltraPremiumButton variant="danger">Danger</UltraPremiumButton>

{/* Gold - Gradiente yellow/orange */}
<UltraPremiumButton variant="gold">Gold</UltraPremiumButton>

{/* Success - Gradiente green/emerald */}
<UltraPremiumButton variant="success">Success</UltraPremiumButton>

{/* Ghost - Transparente */}
<UltraPremiumButton variant="ghost">Ghost</UltraPremiumButton>
```

---

### UltraPremiumCard

Card con glassmorphism GEN5 y efectos cinematográficos: aurora dance, scan line, energy border.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'glassmorphic' \| 'neon' \| 'holographic'` | `'glassmorphic'` | Estilo del card |
| `hover` | `'lift' \| 'glow' \| 'scale' \| 'none'` | `'lift'` | Efecto al hover |
| `scanLine` | `boolean` | `true` | Activar scan line effect |
| `auroraBackground` | `boolean` | `true` | Activar aurora background |
| `energyBorder` | `boolean` | `true` | Activar energy border |
| `parallax` | `boolean` | `false` | Activar parallax float |
| `chromatic` | `boolean` | `false` | Aberración cromática en hover |

#### Ejemplo

```tsx
<UltraPremiumCard variant="glassmorphic" hover="lift">
  <CardHeader>
    <CardTitle>Título Premium</CardTitle>
    <CardDescription>Descripción del card</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenido con glassmorphism GEN5</p>
  </CardContent>
  <CardFooter>
    <UltraPremiumButton variant="primary">Acción</UltraPremiumButton>
  </CardFooter>
</UltraPremiumCard>
```

#### Variantes

```tsx
{/* Default - Glassmorphism básico */}
<UltraPremiumCard variant="default">...</UltraPremiumCard>

{/* Glassmorphic - GEN5 con gradientes */}
<UltraPremiumCard variant="glassmorphic">...</UltraPremiumCard>

{/* Neon - Efecto neón con brillo */}
<UltraPremiumCard variant="neon">...</UltraPremiumCard>

{/* Holographic - Efecto holográfico */}
<UltraPremiumCard variant="holographic">...</UltraPremiumCard>
```

---

### UltraPremiumInput

Input con float label animado, energy line y glow effect.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Label flotante |
| `error` | `string` | - | Mensaje de error |
| `success` | `boolean` | `false` | Estado de éxito |
| `icon` | `LucideIcon` | - | Icono opcional |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posición del icono |
| `energyLine` | `boolean` | `true` | Activar energy line |
| `glowEffect` | `boolean` | `true` | Activar glow effect |
| `variant` | `'default' \| 'glass' \| 'neon'` | `'glass'` | Estilo del input |

#### Ejemplo

```tsx
import { Mail, Lock } from 'lucide-react'

{/* Input con Float Label */}
<UltraPremiumInput
  label="Correo Electrónico"
  type="email"
  icon={Mail}
  iconPosition="left"
  variant="glass"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  success={email.includes('@')}
/>

{/* Input con Error */}
<UltraPremiumInput
  label="Contraseña"
  type="password"
  icon={Lock}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={password.length < 8 ? 'Mínimo 8 caracteres' : ''}
/>

{/* Textarea */}
<UltraPremiumTextarea
  label="Mensaje"
  rows={5}
  variant="glass"
/>
```

---

## 🎬 Animaciones CSS

Todas las animaciones están definidas en `globals.css`:

### Animaciones Disponibles

| Animación | Descripción | Clase CSS |
|-----------|-------------|-----------|
| `ripple` | Efecto de onda expansiva | `animate-ripple` |
| `shimmer` | Brillo desplazante | `animate-shimmer` |
| `aurora-dance` | Aurora boreal animada | `animate-aurora-dance` |
| `scan-line` | Línea de escaneo CRT | `animate-scan-line` |
| `energy-pulse` | Pulso de energía | `animate-energy-pulse` |
| `parallax-float` | Flotación parallax 3D | `animate-parallax-float` |
| `chromatic` | Aberración cromática | `animate-chromatic` |
| `quantum-wave` | Onda cuántica | `animate-quantum-wave` |
| `nebula-swirl` | Remolino de nebulosa | `animate-nebula-swirl` |
| `photon-burst` | Explosión de fotones | `animate-photon-burst` |
| `liquid-morph` | Morfeo líquido | `animate-liquid-morph` |
| `depth-pulse` | Pulso de profundidad 3D | `animate-depth-pulse` |

### Clases de Glow

```css
shadow-glow-sm   /* Glow pequeño */
shadow-glow      /* Glow medio */
shadow-glow-lg   /* Glow grande */
shadow-neon      /* Efecto neón */
shadow-inner-glow /* Glow interno */
```

---

## 💡 Ejemplos de Uso

### Formulario de Login Premium

```tsx
<UltraPremiumCard className="mx-auto max-w-md">
  <CardHeader>
    <CardTitle>Iniciar Sesión</CardTitle>
    <CardDescription>Accede a tu cuenta CHRONOS</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <UltraPremiumInput
      label="Email"
      type="email"
      icon={Mail}
      variant="glass"
    />
    <UltraPremiumInput
      label="Contraseña"
      type="password"
      icon={Lock}
      variant="glass"
    />
  </CardContent>
  <CardFooter className="flex gap-4">
    <UltraPremiumButton variant="primary" className="flex-1">
      Ingresar
    </UltraPremiumButton>
    <UltraPremiumButton variant="secondary">
      Cancelar
    </UltraPremiumButton>
  </CardFooter>
</UltraPremiumCard>
```

### Grid de Estadísticas Premium

```tsx
<div className="grid gap-6 md:grid-cols-3">
  <UltraPremiumCard variant="neon" hover="glow">
    <CardHeader>
      <CardTitle>Ventas</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold text-white">$128,450</p>
      <p className="text-green-400">+12.5%</p>
    </CardContent>
  </UltraPremiumCard>

  <UltraPremiumCard variant="glassmorphic" hover="lift">
    <CardHeader>
      <CardTitle>Clientes</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold text-white">342</p>
      <p className="text-green-400">+5.2%</p>
    </CardContent>
  </UltraPremiumCard>

  <UltraPremiumCard variant="holographic" hover="scale">
    <CardHeader>
      <CardTitle>Órdenes</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold text-white">15</p>
      <p className="text-yellow-400">Pendientes</p>
    </CardContent>
  </UltraPremiumCard>
</div>
```

---

## 🎨 Personalización

### Colores Custom

Puedes personalizar los colores en `tailwind.config.ts`:

```typescript
// Colores de glow personalizados
boxShadow: {
  'glow-custom': '0 0 40px rgba(TU_COLOR_RGB, 0.7)',
}
```

### Animaciones Custom

Agregar nuevas animaciones en `globals.css`:

```css
@keyframes tu-animacion {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

---

## ⚡ Performance

### Optimizaciones Implementadas

- ✅ **Cleanup automático** de ripples y animaciones
- ✅ **Memoización** de funciones pesadas
- ✅ **useCallback** para handlers
- ✅ **AnimatePresence** para exit animations
- ✅ **GPU acceleration** con `transform3d`

### Accesibilidad

- ✅ **Prefers-reduced-motion** respetado
- ✅ **Focus visible** con ring violet
- ✅ **ARIA labels** implementados
- ✅ **Keyboard navigation** funcional

### Bundle Size

- **framer-motion**: ~50KB gzipped (justificado)
- **Componentes**: ~15KB adicionales
- **Total impact**: < 65KB

---

## 📊 Showcase

Ver todos los componentes en acción:

```tsx
import { UltraPremiumShowcase } from '@/app/_components/ui/premium'

<UltraPremiumShowcase />
```

---

## 🤝 Contribución

Para agregar nuevos componentes premium:

1. Crear el archivo en `app/_components/ui/premium/`
2. Seguir la convención `UltraPremium[Nombre].tsx`
3. Agregar keyframes CSS necesarios en `globals.css`
4. Exportar en `index.ts`
5. Actualizar esta documentación

---

## 📝 Licencia

Sistema propietario CHRONOS 2026 - Todos los derechos reservados

---

**Diseñado con ❤️ por el equipo CHRONOS**
