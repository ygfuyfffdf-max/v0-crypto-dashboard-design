# 🔊 GUÍA DE IMPLEMENTACIÓN - SOUND EFFECTS SUTILES

> Sistema de audio premium para CHRONOS Infinity 2026

---

## 📋 OVERVIEW

Implementar sistema de efectos de sonido sutiles que mejoren la experiencia de usuario sin ser intrusivos.

**Tiempo Estimado**: 2-3 horas
**Complejidad**: 🟢 BAJA
**Prioridad**: 🟡 MEDIA

---

## 🎵 1. CREAR SISTEMA DE AUDIO

### Paso 1.1: Sound System Core

```typescript
// Crear archivo: app/lib/audio/SoundSystem.ts

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔊 SOUND SYSTEM — CHRONOS INFINITY 2026
 * Sistema de efectos de sonido premium con preload y control de volumen
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '../utils/logger'

export type SoundEffect =
  | 'click'
  | 'success'
  | 'error'
  | 'notification'
  | 'swipe'
  | 'whoosh'
  | 'pop'
  | 'ding'
  | 'chime'
  | 'toggle'

interface SoundConfig {
  url: string
  volume?: number
  playbackRate?: number
}

export class SoundSystem {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private globalVolume: number = 0.3
  private initialized: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private initialize() {
    const soundConfigs: Record<SoundEffect, SoundConfig> = {
      click: { url: '/sounds/click.mp3', volume: 0.2 },
      success: { url: '/sounds/success.mp3', volume: 0.4 },
      error: { url: '/sounds/error.mp3', volume: 0.35 },
      notification: { url: '/sounds/notification.mp3', volume: 0.3 },
      swipe: { url: '/sounds/swipe.mp3', volume: 0.15 },
      whoosh: { url: '/sounds/whoosh.mp3', volume: 0.25 },
      pop: { url: '/sounds/pop.mp3', volume: 0.2 },
      ding: { url: '/sounds/ding.mp3', volume: 0.3 },
      chime: { url: '/sounds/chime.mp3', volume: 0.25 },
      toggle: { url: '/sounds/toggle.mp3', volume: 0.2 },
    }

    Object.entries(soundConfigs).forEach(([key, config]) => {
      const audio = new Audio(config.url)
      audio.volume = (config.volume ?? 1) * this.globalVolume
      audio.preload = 'auto'
      this.sounds.set(key as SoundEffect, audio)
    })

    this.initialized = true
    logger.info('SoundSystem inicializado', {
      context: 'SoundSystem',
      data: { sounds: this.sounds.size }
    })
  }

  /**
   * Reproduce un efecto de sonido
   */
  play(sound: SoundEffect, options?: { volume?: number; rate?: number }) {
    if (!this.enabled || !this.initialized) return

    const audio = this.sounds.get(sound)
    if (!audio) {
      logger.warn(`Sonido no encontrado: ${sound}`, { context: 'SoundSystem' })
      return
    }

    try {
      // Clone para permitir múltiples reproducciones simultáneas
      const audioClone = audio.cloneNode() as HTMLAudioElement
      audioClone.volume = (options?.volume ?? 1) * this.globalVolume
      audioClone.playbackRate = options?.rate ?? 1

      audioClone.play().catch((err) => {
        // Ignore autoplay policy errors silently
        if (err.name !== 'NotAllowedError') {
          logger.error('Error reproduciendo sonido', err, {
            context: 'SoundSystem',
            data: { sound }
          })
        }
      })
    } catch (err) {
      logger.error('Error al reproducir sonido', err as Error, {
        context: 'SoundSystem'
      })
    }
  }

  /**
   * Establece el volumen global (0-1)
   */
  setVolume(volume: number) {
    this.globalVolume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach((audio) => {
      audio.volume = this.globalVolume
    })
    logger.info('Volumen actualizado', {
      context: 'SoundSystem',
      data: { volume: this.globalVolume }
    })
  }

  /**
   * Activa/desactiva todos los sonidos
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    logger.info(`Sonidos ${enabled ? 'activados' : 'desactivados'}`, {
      context: 'SoundSystem'
    })
  }

  /**
   * Obtiene el estado actual
   */
  getState() {
    return {
      enabled: this.enabled,
      volume: this.globalVolume,
      initialized: this.initialized,
      soundsLoaded: this.sounds.size,
    }
  }
}

// Instancia singleton
export const soundSystem = new SoundSystem()
```

---

### Paso 1.2: React Hook

```typescript
// Crear archivo: app/hooks/useSoundEffect.ts

'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎵 USE SOUND EFFECT HOOK
 * Hook para reproducir efectos de sonido en componentes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useCallback } from 'react'
import { soundSystem, type SoundEffect } from '@/app/lib/audio/SoundSystem'
import { useAppStore } from '@/app/lib/store/useAppStore'

export function useSoundEffect() {
  const soundEnabled = useAppStore((state) => state.soundEnabled)

  const play = useCallback(
    (sound: SoundEffect, options?: { volume?: number; rate?: number }) => {
      if (soundEnabled) {
        soundSystem.play(sound, options)
      }
    },
    [soundEnabled],
  )

  const setVolume = useCallback((volume: number) => {
    soundSystem.setVolume(volume)
  }, [])

  const toggle = useCallback(() => {
    const newState = !soundEnabled
    useAppStore.setState({ soundEnabled: newState })
    soundSystem.setEnabled(newState)
  }, [soundEnabled])

  return {
    play,
    setVolume,
    toggle,
    enabled: soundEnabled,
    state: soundSystem.getState(),
  }
}
```

---

## 🎨 2. INTEGRAR EN COMPONENTES

### Paso 2.1: Actualizar UltraPremiumButton

```typescript
// Archivo: app/_components/ui/premium/UltraPremiumButton.tsx
// AGREGAR al inicio del componente:

import { useSoundEffect } from '@/app/hooks/useSoundEffect'

export function UltraPremiumButton({ onClick, ... }: UltraPremiumButtonProps) {
  const { play } = useSoundEffect()

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Reproducir sonido según variante
    const soundMap = {
      primary: 'click',
      secondary: 'click',
      ghost: 'pop',
      danger: 'error',
      success: 'success',
      gold: 'chime',
    }

    play(soundMap[variant] as SoundEffect)
    onClick?.(e)
  }, [onClick, variant, play])

  return (
    <motion.button onClick={handleClick} ...>
      {/* resto del código */}
    </motion.button>
  )
}
```

---

### Paso 2.2: Integrar en Modales

```typescript
// Archivo: app/_components/ui/omega/OmegaModals.tsx
// AGREGAR:

import { useSoundEffect } from '@/app/hooks/useSoundEffect'

export function OmegaModal({ isOpen, onClose, ... }: OmegaModalProps) {
  const { play } = useSoundEffect()

  useEffect(() => {
    if (isOpen) {
      play('whoosh', { volume: 0.5 })
    }
  }, [isOpen, play])

  const handleClose = useCallback(() => {
    play('swipe', { volume: 0.3 })
    onClose()
  }, [onClose, play])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div onClick={handleClose} ...>
          {/* resto del código */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

### Paso 2.3: Integrar en Forms

```typescript
// Archivo: app/_components/chronos-2026/forms/PremiumForms.tsx
// AGREGAR en FormModal:

const { play } = useSoundEffect()

const handleSubmit = async () => {
  if (loading) return

  try {
    await onSubmit?.()
    play('success')
  } catch (error) {
    play('error')
  }
}
```

---

## 🎧 3. DESCARGAR AUDIO FILES

### Opción 1: Biblioteca Libre (Recomendado)

Descargar de:
- **Zapsplat**: https://www.zapsplat.com (gratis con atribución)
- **Freesound**: https://freesound.org (creative commons)
- **Mixkit**: https://mixkit.co/free-sound-effects (gratis, sin atribución)

### Opción 2: Generar con Herramientas

Usar generadores online:
- **jfxr**: https://jfxr.frozenfractal.com
- **SFXR**: https://sfxr.me
- **Bfxr**: https://www.bfxr.net

### Especificaciones de Audio

```
Format: MP3 (mejor compatibilidad)
Bitrate: 128kbps
Duration: 100-500ms (efectos UI)
Sample Rate: 44.1kHz
Channels: Mono (estéreo no necesario para UI)
File Size: <20KB por archivo
```

### Carpeta de Destino

```bash
mkdir -p public/sounds

# Estructura:
public/sounds/
├── click.mp3       # Click de botón (suave)
├── success.mp3     # Acción exitosa (campanita)
├── error.mp3       # Error (tono bajo)
├── notification.mp3 # Notificación (ding corto)
├── swipe.mp3       # Swipe gesture (whoosh sutil)
├── whoosh.mp3      # Modal open (aire)
├── pop.mp3         # Popup appear (pop suave)
├── ding.mp3        # Completar tarea
├── chime.mp3       # Hover importante
└── toggle.mp3      # Switch toggle
```

---

## 🎛️ 4. UI DE CONFIGURACIÓN

### Paso 4.1: Settings Panel

```typescript
// Crear: app/_components/chronos-2026/widgets/AudioSettings.tsx

'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useSoundEffect } from '@/app/hooks/useSoundEffect'
import { UltraPremiumButton } from '@/app/_components/ui/premium/UltraPremiumButton'

export function AudioSettings() {
  const { enabled, state, toggle, setVolume } = useSoundEffect()

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <span className="font-medium">Efectos de Sonido</span>
        </div>

        <UltraPremiumButton
          variant={enabled ? 'success' : 'ghost'}
          size="sm"
          onClick={toggle}
        >
          {enabled ? 'Activado' : 'Desactivado'}
        </UltraPremiumButton>
      </div>

      {enabled && (
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Volumen: {Math.round(state.volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={state.volume * 100}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      )}

      {/* Test buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => soundSystem.play('click')}
          className="rounded-lg bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
        >
          Test Click
        </button>
        <button
          onClick={() => soundSystem.play('success')}
          className="rounded-lg bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
        >
          Test Success
        </button>
      </div>
    </div>
  )
}
```

---

### Paso 4.2: Agregar a Settings Page

```typescript
// app/(dashboard)/settings/page.tsx
// AGREGAR:

import { AudioSettings } from '@/app/_components/chronos-2026/widgets/AudioSettings'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1>Configuración</h1>

      {/* Audio Settings */}
      <section>
        <h2>Audio</h2>
        <AudioSettings />
      </section>

      {/* Otras configuraciones */}
    </div>
  )
}
```

---

## 🔧 5. ACTUALIZAR STORE

### Paso 5.1: Agregar Campo soundEnabled

```typescript
// Archivo: app/lib/store/useAppStore.ts
// AGREGAR en interface AppState:

interface AppState {
  // ... campos existentes

  // ========== Audio State ==========
  soundEnabled: boolean
  soundVolume: number

  // Actions
  setSoundEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
}

// AGREGAR en create():

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // ... estado existente

        // Audio
        soundEnabled: true,
        soundVolume: 0.3,

        // Actions
        setSoundEnabled: (enabled) => {
          set({ soundEnabled: enabled })
          soundSystem.setEnabled(enabled)
        },

        setSoundVolume: (volume) => {
          set({ soundVolume: volume })
          soundSystem.setVolume(volume)
        },
      }),
      {
        name: 'chronos-store',
        // ...
      }
    )
  )
)
```

---

## 🎯 6. CASOS DE USO

### Ejemplo 1: Button Click
```typescript
<UltraPremiumButton onClick={handleCreate}>
  Crear Venta
</UltraPremiumButton>
// ⚡ Reproduce automáticamente "click" al hacer clic
```

### Ejemplo 2: Form Submit Success
```typescript
const handleSubmit = async (data) => {
  try {
    await crearVenta(data)
    play('success') // ✅
    toast.success('Venta creada')
  } catch (error) {
    play('error') // ❌
    toast.error('Error')
  }
}
```

### Ejemplo 3: Modal Open
```typescript
// OmegaModal reproduce "whoosh" al abrir automáticamente
<OmegaModal isOpen={isOpen}>...</OmegaModal>
```

### Ejemplo 4: Swipe Gesture
```typescript
const swipeRef = useSwipe({
  onSwipeLeft: () => {
    play('swipe')
    cambiarPanel('anterior')
  }
})
```

### Ejemplo 5: Notification
```typescript
useEffect(() => {
  if (newNotification) {
    play('notification')
  }
}, [newNotification])
```

---

## 📦 7. ARCHIVOS DE AUDIO RECOMENDADOS

### Lista de Descarga

| Sonido | Descripción | Duración | Uso |
|--------|-------------|----------|-----|
| `click.mp3` | Click suave de botón | 50ms | Botones generales |
| `success.mp3` | Campanita de éxito | 300ms | Submit exitoso |
| `error.mp3` | Tono de error | 250ms | Errores, validación fallida |
| `notification.mp3` | Ding de notificación | 200ms | Toasts, alerts |
| `swipe.mp3` | Whoosh de swipe | 150ms | Gestures swipe |
| `whoosh.mp3` | Aire, apertura | 200ms | Modales open |
| `pop.mp3` | Pop suave | 100ms | Tooltips, popovers |
| `ding.mp3` | Ding corto | 150ms | Tareas completadas |
| `chime.mp3` | Chime premium | 300ms | Botones gold/premium |
| `toggle.mp3` | Switch toggle | 80ms | Toggles, checkboxes |

---

## ✅ 8. TESTING

### Test Manual

```typescript
// En cualquier componente de test:
import { soundSystem } from '@/app/lib/audio/SoundSystem'

function TestSounds() {
  return (
    <div className="space-y-2">
      <button onClick={() => soundSystem.play('click')}>
        Test Click
      </button>
      <button onClick={() => soundSystem.play('success')}>
        Test Success
      </button>
      <button onClick={() => soundSystem.play('error')}>
        Test Error
      </button>
    </div>
  )
}
```

### Automated Test

```typescript
// __tests__/lib/audio/SoundSystem.test.ts

import { soundSystem } from '@/app/lib/audio/SoundSystem'

describe('SoundSystem', () => {
  it('should initialize with correct sounds', () => {
    const state = soundSystem.getState()
    expect(state.soundsLoaded).toBe(10)
  })

  it('should change volume', () => {
    soundSystem.setVolume(0.5)
    expect(soundSystem.getState().volume).toBe(0.5)
  })

  it('should toggle enabled state', () => {
    soundSystem.setEnabled(false)
    expect(soundSystem.getState().enabled).toBe(false)
  })
})
```

---

## 🚀 9. DEPLOYMENT

### Verificar Audio Files en Build

```bash
# Build
pnpm build

# Verificar que /sounds está en .next/static
ls .next/static/sounds/

# O en public/ (Next.js copia automáticamente)
ls public/sounds/
```

### Configuración Vercel

```json
// vercel.json - Asegurar que sounds se sirven correctamente
{
  "headers": [
    {
      "source": "/sounds/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 📊 10. MÉTRICAS ESPERADAS

### Bundle Size Impact
```
Audio System Code:     ~2KB (gzipped)
Audio Files:           ~150KB total (10 files × 15KB avg)
Total Impact:          ~152KB

Benefit:               Improved UX
Cost:                  Minimal
```

### Performance
```
Audio preload:         ~100ms on page load
Play latency:          <10ms
Memory usage:          ~5MB (loaded sounds)
CPU usage:             <1% (idle)
```

---

## 🎉 RESULTADO FINAL

Después de implementar:

✅ **Experiencia Premium**
- Feedback auditivo en todas las interacciones
- Sonidos sutiles que no molestan
- Control total del usuario

✅ **Performance Óptimo**
- Preload inteligente
- Clonación de audio para concurrencia
- Error handling silencioso

✅ **Fácil Mantenimiento**
- Sistema centralizado
- Hook reutilizable
- Configuración por usuario

---

**Tiempo Real de Implementación**: 2-3 horas
**Archivos Nuevos**: 3
**Archivos Modificados**: 5-8
**Complejidad**: 🟢 BAJA
**ROI**: 🟢 ALTO (gran mejora UX con poco esfuerzo)

---

**Próximo paso**: Descargar audio files y ejecutar Paso 1.1

---

**Creado**: 22 Enero 2026
**Autor**: IY SUPREME Agent
**Versión**: 1.0
