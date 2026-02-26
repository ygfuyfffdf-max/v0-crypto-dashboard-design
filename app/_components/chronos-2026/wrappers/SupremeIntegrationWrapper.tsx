'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🚀✨ SUPREME INTEGRATION WRAPPER — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper HOC que integra TODAS las mejoras Supreme en cualquier componente:
 * ✅ Sound Effects (clicks, hovers, focus)
 * ✅ Advanced Gestures (swipe, pinch, long press, double tap)
 * ✅ Haptic Feedback
 * ✅ Theme awareness
 * ✅ Performance optimizations
 *
 * USO:
 * ```tsx
 * const EnhancedPanel = withSupremeIntegration(MyPanel, {
 *   enableSound: true,
 *   enableGestures: true,
 *   soundPreset: 'panel',
 *   gesturesConfig: { enableSwipe: true, enablePinch: true }
 * })
 * ```
 */

import { cn } from '@/app/_lib/utils'
import { useSoundManager } from '@/app/lib/audio/sound-system'
import {
    useDoubleTap,
    useLongPress,
    usePinchZoom,
    useSwipe,
} from '@/app/lib/gestures/advanced-gestures'
import React, { ComponentType, forwardRef, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type SoundPreset = 'button' | 'card' | 'modal' | 'panel' | 'tab' | 'input'

interface GesturesConfig {
  enableSwipe?: boolean
  enablePinch?: boolean
  enableLongPress?: boolean
  enableDoubleTap?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onLongPress?: () => void
  onDoubleTap?: () => void
}

interface SupremeIntegrationOptions {
  enableSound?: boolean
  enableGestures?: boolean
  enableHaptics?: boolean
  soundPreset?: SoundPreset
  gesturesConfig?: GesturesConfig
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SOUND PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SOUND_PRESETS: Record<SoundPreset, { click?: string; hover?: string; focus?: string }> = {
  button: { click: 'click', hover: 'hover' },
  card: { click: 'cardFlip', hover: 'hover' },
  modal: { click: 'whoosh', hover: 'hover' },
  panel: { click: 'swoosh', hover: 'softPop' },
  tab: { click: 'tabSwitch', hover: 'hover' },
  input: { focus: 'softPop' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOC WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function withSupremeIntegration<P extends object>(
  Component: ComponentType<P>,
  options: SupremeIntegrationOptions = {},
) {
  const {
    enableSound = true,
    enableGestures = false,
    enableHaptics = true,
    soundPreset = 'button',
    gesturesConfig = {},
    className,
  } = options

  const WrappedComponent = forwardRef<HTMLDivElement, P>((props, ref) => {
    const { play } = useSoundManager()
    const soundConfig = SOUND_PRESETS[soundPreset]

    // ═════════════════════════════════════════════════════════════════════════════════════════════════
    // GESTURES SETUP
    // ═════════════════════════════════════════════════════════════════════════════════════════════════

    const swipeHandlers = useSwipe({
      onSwipeLeft: gesturesConfig.onSwipeLeft,
      onSwipeRight: gesturesConfig.onSwipeRight,
      onSwipeUp: gesturesConfig.onSwipeUp,
      onSwipeDown: gesturesConfig.onSwipeDown,
      swipeThreshold: 50,
    })

    const pinchHandlers = usePinchZoom({
      onPinch: gesturesConfig.onPinch ? (e) => gesturesConfig.onPinch!(e.scale) : undefined,
    })

    const longPressHandlers = useLongPress({
      onLongPress: gesturesConfig.onLongPress ?? (() => {}),
      longPressDelay: 500,
    })

    const doubleTapHandlers = useDoubleTap(
      gesturesConfig.onDoubleTap ?? (() => {}),
      { doubleTapDelay: 300 },
    )

    // ═════════════════════════════════════════════════════════════════════════════════════════════════
    // SOUND HANDLERS
    // ═════════════════════════════════════════════════════════════════════════════════════════════════

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (enableSound && soundConfig.click) {
          play(soundConfig.click as any)
        }
        if (enableHaptics) {
          navigator.vibrate?.(5)
        }
        // @ts-expect-error - onClick might exist on props
        props.onClick?.(e)
      },
      [enableSound, soundConfig, play, enableHaptics, props],
    )

    const handleMouseEnter = useCallback(() => {
      if (enableSound && soundConfig.hover) {
        play(soundConfig.hover as any)
      }
    }, [enableSound, soundConfig, play])

    const handleFocus = useCallback(() => {
      if (enableSound && soundConfig.focus) {
        play(soundConfig.focus as any)
      }
    }, [enableSound, soundConfig, play])

    // ═════════════════════════════════════════════════════════════════════════════════════════════════
    // COMBINE HANDLERS
    // ═════════════════════════════════════════════════════════════════════════════════════════════════

    const combinedHandlers = {
      ...(enableGestures && gesturesConfig.enableSwipe ? swipeHandlers : {}),
      ...(enableGestures && gesturesConfig.enablePinch ? pinchHandlers : {}),
      ...(enableGestures && gesturesConfig.enableLongPress ? longPressHandlers : {}),
      ...(enableGestures && gesturesConfig.enableDoubleTap ? doubleTapHandlers : {}),
      ...(enableSound
        ? {
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
            onFocus: handleFocus,
          }
        : {}),
    }

    return (
      <div ref={ref} className={cn('supreme-wrapper', className)} {...(combinedHandlers as any)}>
        <Component {...(props as any)} />
      </div>
    )
  })

  WrappedComponent.displayName = `withSupremeIntegration(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET WRAPPERS (Convenience)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const withButtonSounds = <P extends object>(Component: ComponentType<P>) =>
  withSupremeIntegration(Component, { soundPreset: 'button', enableSound: true })

export const withCardSounds = <P extends object>(Component: ComponentType<P>) =>
  withSupremeIntegration(Component, { soundPreset: 'card', enableSound: true })

export const withModalSounds = <P extends object>(Component: ComponentType<P>) =>
  withSupremeIntegration(Component, { soundPreset: 'modal', enableSound: true })

export const withPanelSounds = <P extends object>(Component: ComponentType<P>) =>
  withSupremeIntegration(Component, { soundPreset: 'panel', enableSound: true })

export const withSwipeGestures = <P extends object>(
  Component: ComponentType<P>,
  handlers: Pick<GesturesConfig, 'onSwipeLeft' | 'onSwipeRight' | 'onSwipeUp' | 'onSwipeDown'>,
) =>
  withSupremeIntegration(Component, {
    enableGestures: true,
    gesturesConfig: { enableSwipe: true, ...handlers },
  })

export const withPinchZoom = <P extends object>(Component: ComponentType<P>, onPinch: (scale: number) => void) =>
  withSupremeIntegration(Component, {
    enableGestures: true,
    gesturesConfig: { enablePinch: true, onPinch },
  })

export const withFullGestures = <P extends object>(Component: ComponentType<P>, config: GesturesConfig) =>
  withSupremeIntegration(Component, {
    enableGestures: true,
    gesturesConfig: {
      enableSwipe: true,
      enablePinch: true,
      enableLongPress: true,
      enableDoubleTap: true,
      ...config,
    },
  })
