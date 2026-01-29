# 👆 GUÍA DE INTEGRACIÓN - GESTURES TÁCTILES AVANZADOS

> Integrar sistema de gestures ya existente en paneles principales

---

## 📋 OVERVIEW

El sistema de gestures **YA ESTÁ IMPLEMENTADO** en `app/lib/gestures/advanced-gestures.tsx`.
Solo falta integrarlo en los componentes principales.

**Tiempo Estimado**: 3-4 horas
**Complejidad**: 🟡 MEDIA
**Prioridad**: 🟡 MEDIA
**Status**: 80% implementado, 20% integración pendiente

---

## ✅ LO QUE YA EXISTE

### Hooks Disponibles

```typescript
// app/lib/gestures/advanced-gestures.tsx

// 1. Swipe Detection (4 direcciones)
export function useSwipe<T extends HTMLElement = HTMLDivElement>(
  options: UseSwipeOptions
): RefObject<T>

// 2. Pinch-to-Zoom
export function usePinchZoom<T extends HTMLElement = HTMLDivElement>(
  options: UsePinchOptions
): RefObject<T>

// 3. Long Press
export function useLongPress<T extends HTMLElement = HTMLDivElement>(
  options: UseLongPressOptions
): RefObject<T>

// 4. Double Tap
export function useDoubleTap<T extends HTMLElement = HTMLDivElement>(
  options: UseDoubleTapOptions
): RefObject<T>

// 5. Pan & Drag
export function usePan<T extends HTMLElement = HTMLDivElement>(
  options: UsePanOptions
): RefObject<T>
```

### Características Implementadas

✅ **Haptic Feedback** - Vibración en cada gesture
✅ **Threshold configurable** - Distancia mínima
✅ **Velocity detection** - Velocidad de gesture
✅ **Passive event listeners** - Performance optimizado
✅ **TypeScript strict** - Tipos completos
✅ **Cleanup automático** - No memory leaks

---

## 🎯 INTEGRACIÓN EN PANELES

### Panel 1: AuroraBancosPanelUnified

```typescript
// app/_components/chronos-2026/panels/AuroraBancosPanelUnified.tsx

import { useSwipe, useDoubleTap } from '@/app/lib/gestures/advanced-gestures'
import { useSoundEffect } from '@/app/hooks/useSoundEffect'

export function AuroraBancosPanelUnified({ ... }) {
  const { play } = useSoundEffect()

  // Swipe para cambiar entre tabs
  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: () => {
      play('swipe')
      cambiarTabSiguiente()
    },
    onSwipeRight: () => {
      play('swipe')
      cambiarTabAnterior()
    },
    swipeThreshold: 50,
    velocityThreshold: 0.3,
    enableHaptics: true,
  })

  // Double tap para refresh
  const doubleTapRef = useDoubleTap<HTMLDivElement>({
    onDoubleTap: () => {
      play('pop')
      refetchAPI()
      toast.info('Datos actualizados')
    },
    doubleTapDelay: 300,
    enableHaptics: true,
  })

  return (
    <div ref={swipeRef}>
      <div ref={doubleTapRef}>
        {/* Contenido del panel */}
      </div>
    </div>
  )
}
```

---

### Panel 2: AuroraVentasPanel

```typescript
// app/_components/chronos-2026/panels/AuroraVentasPanel.tsx

import { useSwipe, useLongPress } from '@/app/lib/gestures/advanced-gestures'

export function AuroraVentasPanel({ ... }) {
  // Swipe para filtros rápidos
  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeUp: () => {
      aplicarFiltro('todas')
    },
    onSwipeDown: () => {
      limpiarFiltros()
    },
  })

  // Long press en venta para menú contextual
  const createLongPressRef = (ventaId: string) => {
    return useLongPress<HTMLDivElement>({
      onLongPress: () => {
        abrirMenuContextual(ventaId)
      },
      longPressDelay: 500,
    })
  }

  return (
    <div ref={swipeRef}>
      {ventas.map(venta => (
        <div key={venta.id} ref={createLongPressRef(venta.id)}>
          <VentaCard venta={venta} />
        </div>
      ))}
    </div>
  )
}
```

---

### Panel 3: AuroraDashboardUnified

```typescript
// app/_components/chronos-2026/panels/AuroraDashboardUnified.tsx

import { useSwipe, usePinchZoom } from '@/app/lib/gestures/advanced-gestures'

export function AuroraDashboardUnified({ ... }) {
  const [zoom, setZoom] = useState(1)

  // Pinch para zoom de gráficas
  const pinchRef = usePinchZoom<HTMLDivElement>({
    onPinch: (event) => {
      setZoom(Math.max(0.5, Math.min(2, event.scale)))
    },
    enableHaptics: true,
  })

  // Swipe para navegar entre secciones
  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: () => scrollToNextSection(),
    onSwipeRight: () => scrollToPrevSection(),
  })

  return (
    <div ref={swipeRef}>
      <div ref={pinchRef} style={{ transform: `scale(${zoom})` }}>
        {/* Charts y widgets */}
      </div>
    </div>
  )
}
```

---

## 🎮 GESTURES POR CASO DE USO

### Navegación entre Paneles
```typescript
const swipeRef = useSwipe<HTMLDivElement>({
  onSwipeLeft: () => navegarSiguientePanel(),
  onSwipeRight: () => navegarPanelAnterior(),
  swipeThreshold: 100, // Más threshold para evitar swipes accidentales
})
```

### Refresh de Datos
```typescript
const doubleTapRef = useDoubleTap<HTMLDivElement>({
  onDoubleTap: () => refetchData(),
  doubleTapDelay: 300,
})
```

### Menú Contextual
```typescript
const longPressRef = useLongPress<HTMLButtonElement>({
  onLongPress: () => abrirMenuContextual(),
  longPressDelay: 500,
})
```

### Zoom de Gráficas
```typescript
const pinchRef = usePinchZoom<HTMLDivElement>({
  onPinch: ({ scale }) => setZoomLevel(scale),
})
```

### Drag & Drop
```typescript
const panRef = usePan<HTMLDivElement>({
  onPanStart: () => console.log('Start drag'),
  onPan: ({ deltaX, deltaY }) => {
    updatePosition(deltaX, deltaY)
  },
  onPanEnd: ({ deltaX, deltaY, velocity }) => {
    finalizarDrag(deltaX, deltaY, velocity)
  },
})
```

---

## 📱 RESPONSIVE CONSIDERATIONS

### Mobile-First Approach

```typescript
export function ResponsivePanel() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Solo habilitar gestures en mobile
  const swipeRef = useSwipe<HTMLDivElement>({
    onSwipeLeft: isMobile ? handleSwipeLeft : undefined,
    onSwipeRight: isMobile ? handleSwipeRight : undefined,
  })

  return (
    <div ref={isMobile ? swipeRef : null}>
      {/* Contenido */}
    </div>
  )
}
```

---

## 🎨 FEEDBACK VISUAL

### Indicador de Gesture

```typescript
export function SwipeIndicator({ direction }: { direction: SwipeDirection }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === 'left' ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-violet-500/20 px-4 py-2 backdrop-blur-xl"
    >
      <span className="text-sm font-medium text-white">
        {direction === 'left' && '← Anterior'}
        {direction === 'right' && 'Siguiente →'}
      </span>
    </motion.div>
  )
}

// Uso:
const [showIndicator, setShowIndicator] = useState<SwipeDirection | null>(null)

const swipeRef = useSwipe({
  onSwipeLeft: () => {
    setShowIndicator('left')
    setTimeout(() => setShowIndicator(null), 1000)
  },
})

return (
  <>
    <div ref={swipeRef}>Panel</div>
    <AnimatePresence>
      {showIndicator && <SwipeIndicator direction={showIndicator} />}
    </AnimatePresence>
  </>
)
```

---

## 🧪 TESTING GESTURES

### Test en Dispositivos

```markdown
1. iPhone/iPad (Safari)
   - ✅ Swipe
   - ✅ Pinch
   - ✅ Long press
   - ✅ Double tap
   - ✅ Haptic feedback

2. Android (Chrome)
   - ✅ Todos los gestures
   - ✅ Haptic vibration

3. Desktop (Chrome/Firefox/Safari)
   - ⚠️ Solo mouse events (no touch)
   - ✅ Click, double-click funcionan
```

### Playwright E2E Test

```typescript
// e2e/gestures.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Gestures', () => {
  test('should swipe to next panel', async ({ page }) => {
    await page.goto('/bancos')

    // Simular swipe left
    await page.touchscreen.swipe(
      { x: 300, y: 400 },
      { x: 100, y: 400 }
    )

    // Verificar cambio de panel
    await expect(page).toHaveURL(/\/ventas/)
  })

  test('should double tap to refresh', async ({ page }) => {
    await page.goto('/bancos')

    // Double tap
    await page.tap('body', { count: 2 })

    // Verificar que se actualiza
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible()
  })
})
```

---

## 📊 PLAN DE INTEGRACIÓN

### Paneles a Integrar (15 total)

| # | Panel | Gestures | Prioridad | Tiempo |
|---|-------|----------|-----------|--------|
| 1 | Dashboard | Swipe, DoubleTap | 🔴 Alta | 20min |
| 2 | Bancos | Swipe, DoubleTap, LongPress | 🔴 Alta | 25min |
| 3 | Ventas | Swipe, LongPress | 🔴 Alta | 20min |
| 4 | Clientes | Swipe, LongPress | 🟡 Media | 15min |
| 5 | Distribuidores | Swipe, LongPress | 🟡 Media | 15min |
| 6 | Órdenes | Swipe, DoubleTap | 🟡 Media | 15min |
| 7 | Movimientos | Swipe, Pinch | 🟡 Media | 20min |
| 8 | Almacén | Swipe | 🟢 Baja | 10min |
| 9-15 | Otros | Swipe básico | 🟢 Baja | 10min c/u |

**Tiempo Total**: ~3-4 horas

---

## ✅ CHECKLIST

### Implementación
- [ ] Integrar en Dashboard (swipe + double tap)
- [ ] Integrar en Bancos (swipe + double tap + long press)
- [ ] Integrar en Ventas (swipe + long press)
- [ ] Integrar en otros 12 paneles (swipe básico)
- [ ] Agregar feedback visual (SwipeIndicator)
- [ ] Testing en mobile devices

### Validación
- [ ] Gestures no interfieren con scroll
- [ ] Haptic feedback funciona
- [ ] Transiciones smooth
- [ ] No hay false positives
- [ ] Performance 60fps

---

**Próximo paso**: Integrar en Dashboard como piloto

---

**Creado**: 22 Enero 2026
**Autor**: IY SUPREME Agent
**Versión**: 1.0
