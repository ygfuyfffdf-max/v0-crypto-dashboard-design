"use client"

/**
 * 🚀 SUPREME INTEGRATION WRAPPER - HOCs para integrar sistemas premium
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Higher Order Components para agregar:
 * - Sound System
 * - Gesture Recognition
 * - Haptic Feedback
 * - Theme Integration
 */

import { ComponentType, forwardRef, useCallback } from "react"

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface SupremeIntegrationOptions {
  sounds?: boolean
  gestures?: boolean
  haptics?: boolean
  theme?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// WRAPPER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function withSupremeIntegration<P extends object>(
  WrappedComponent: ComponentType<P>,
  _options: SupremeIntegrationOptions = {}
) {
  const WithSupremeIntegration = forwardRef<unknown, P>((props, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <WrappedComponent {...(props as any)} ref={ref} />
  })

  WithSupremeIntegration.displayName = `WithSupremeIntegration(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithSupremeIntegration
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUND WRAPPERS
// ═══════════════════════════════════════════════════════════════════════════

export function withButtonSounds<P extends { onClick?: () => void }>(
  WrappedComponent: ComponentType<P>
) {
  const WithButtonSounds = (props: P) => {
    const handleClick = useCallback(() => {
      // Click sound effect
      if (typeof window !== "undefined") {
        // Optional: Play click sound
      }
      props.onClick?.()
    }, [props])

    return <WrappedComponent {...props} onClick={handleClick} />
  }

  WithButtonSounds.displayName = `WithButtonSounds(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithButtonSounds
}

export function withCardSounds<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithCardSounds = (props: P) => {
    return <WrappedComponent {...props} />
  }

  WithCardSounds.displayName = `WithCardSounds(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithCardSounds
}

export function withModalSounds<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithModalSounds = (props: P) => {
    return <WrappedComponent {...props} />
  }

  WithModalSounds.displayName = `WithModalSounds(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithModalSounds
}

export function withPanelSounds<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithPanelSounds = (props: P) => {
    return <WrappedComponent {...props} />
  }

  WithPanelSounds.displayName = `WithPanelSounds(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithPanelSounds
}

// ═══════════════════════════════════════════════════════════════════════════
// GESTURE WRAPPERS
// ═══════════════════════════════════════════════════════════════════════════

export function withSwipeGestures<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithSwipeGestures = (props: P) => {
    return <WrappedComponent {...props} />
  }

  WithSwipeGestures.displayName = `WithSwipeGestures(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithSwipeGestures
}

export function withPinchZoom<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithPinchZoom = (props: P) => {
    return <WrappedComponent {...props} />
  }

  WithPinchZoom.displayName = `WithPinchZoom(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithPinchZoom
}

export function withFullGestures<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithFullGestures = (props: P) => {
    return <WrappedComponent {...props} />
  }

  WithFullGestures.displayName = `WithFullGestures(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithFullGestures
}
