'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👆✨ ADVANCED GESTURES SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de gestures táctiles premium con:
 * - Swipe (left, right, up, down)
 * - Pinch-to-zoom
 * - Long press
 * - Double tap
 * - Pan & drag
 * - Feedback háptico integrado
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeEvent {
  direction: SwipeDirection
  distance: number
  velocity: number
  duration: number
}

export interface PinchEvent {
  scale: number
  center: { x: number; y: number }
}

export interface GestureConfig {
  swipeThreshold?: number // px
  velocityThreshold?: number // px/ms
  longPressDelay?: number // ms
  doubleTapDelay?: number // ms
  enableHaptics?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SWIPE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseSwipeOptions extends GestureConfig {
  onSwipeLeft?: (event: SwipeEvent) => void
  onSwipeRight?: (event: SwipeEvent) => void
  onSwipeUp?: (event: SwipeEvent) => void
  onSwipeDown?: (event: SwipeEvent) => void
}

export function useSwipe<T extends HTMLElement = HTMLDivElement>(options: UseSwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    swipeThreshold = 50,
    velocityThreshold = 0.3,
    enableHaptics = true,
  } = options

  const ref = useRef<T>(null)
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return
      const touch = e.changedTouches[0]
      if (!touch) return

      const start = touchStart.current
      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y
      const duration = Date.now() - start.time
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
      const velocity = distance / duration

      touchStart.current = null

      // Determinar dirección
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > swipeThreshold && velocity > velocityThreshold) {
          const event: SwipeEvent = {
            direction: deltaX > 0 ? 'right' : 'left',
            distance,
            velocity,
            duration,
          }

          // Haptic feedback
          if (enableHaptics && 'vibrate' in navigator) {
            navigator.vibrate(10)
          }

          if (deltaX > 0) onSwipeRight?.(event)
          else onSwipeLeft?.(event)
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > swipeThreshold && velocity > velocityThreshold) {
          const event: SwipeEvent = {
            direction: deltaY > 0 ? 'down' : 'up',
            distance,
            velocity,
            duration,
          }

          // Haptic feedback
          if (enableHaptics && 'vibrate' in navigator) {
            navigator.vibrate(10)
          }

          if (deltaY > 0) onSwipeDown?.(event)
          else onSwipeUp?.(event)
        }
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeThreshold, velocityThreshold, enableHaptics])

  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PINCH-TO-ZOOM HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UsePinchOptions extends GestureConfig {
  onPinch?: (event: PinchEvent) => void
  onPinchStart?: () => void
  onPinchEnd?: () => void
}

export function usePinchZoom<T extends HTMLElement = HTMLDivElement>(options: UsePinchOptions = {}) {
  const { onPinch, onPinchStart, onPinchEnd, enableHaptics = true } = options

  const ref = useRef<T>(null)
  const initialDistance = useRef<number>(0)
  const isPinching = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const getDistance = (touches: TouchList) => {
      const [touch1, touch2] = Array.from(touches)
      if (!touch1 || !touch2) return 0
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx ** 2 + dy ** 2)
    }

    const getCenter = (touches: TouchList) => {
      const [touch1, touch2] = Array.from(touches)
      if (!touch1 || !touch2) return { x: 0, y: 0 }
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        initialDistance.current = getDistance(e.touches)
        isPinching.current = true
        onPinchStart?.()

        if (enableHaptics && 'vibrate' in navigator) {
          navigator.vibrate(15)
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPinching.current || e.touches.length !== 2) return
      e.preventDefault()

      const currentDistance = getDistance(e.touches)
      const scale = currentDistance / initialDistance.current
      const center = getCenter(e.touches)

      onPinch?.({ scale, center })
    }

    const handleTouchEnd = () => {
      if (isPinching.current) {
        isPinching.current = false
        onPinchEnd?.()

        if (enableHaptics && 'vibrate' in navigator) {
          navigator.vibrate(10)
        }
      }
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onPinch, onPinchStart, onPinchEnd, enableHaptics])

  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LONG PRESS HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseLongPressOptions extends GestureConfig {
  onLongPress?: () => void
  onClick?: () => void
}

export function useLongPress<T extends HTMLElement = HTMLButtonElement>(
  options: UseLongPressOptions = {},
) {
  const { onLongPress, onClick, longPressDelay = 500, enableHaptics = true } = options

  const ref = useRef<T>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)

  const start = useCallback(() => {
    isLongPress.current = false
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true
      onLongPress?.()

      if (enableHaptics && 'vibrate' in navigator) {
        navigator.vibrate([20, 10, 20])
      }
    }, longPressDelay)
  }, [onLongPress, longPressDelay, enableHaptics])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleClick = useCallback(() => {
    if (!isLongPress.current) {
      onClick?.()
    }
    isLongPress.current = false
  }, [onClick])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('mousedown', start)
    element.addEventListener('touchstart', start)
    element.addEventListener('mouseup', cancel)
    element.addEventListener('touchend', cancel)
    element.addEventListener('mouseleave', cancel)
    element.addEventListener('click', handleClick)

    return () => {
      cancel()
      element.removeEventListener('mousedown', start)
      element.removeEventListener('touchstart', start)
      element.removeEventListener('mouseup', cancel)
      element.removeEventListener('touchend', cancel)
      element.removeEventListener('mouseleave', cancel)
      element.removeEventListener('click', handleClick)
    }
  }, [start, cancel, handleClick])

  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DOUBLE TAP HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useDoubleTap<T extends HTMLElement = HTMLDivElement>(
  onDoubleTap: () => void,
  options: GestureConfig = {},
) {
  const { doubleTapDelay = 300, enableHaptics = true } = options
  const ref = useRef<T>(null)
  const lastTap = useRef<number>(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTap = () => {
      const now = Date.now()
      if (now - lastTap.current < doubleTapDelay) {
        onDoubleTap()

        if (enableHaptics && 'vibrate' in navigator) {
          navigator.vibrate([10, 5, 10])
        }
      }
      lastTap.current = now
    }

    element.addEventListener('click', handleTap)
    return () => element.removeEventListener('click', handleTap)
  }, [onDoubleTap, doubleTapDelay, enableHaptics])

  return ref
}
