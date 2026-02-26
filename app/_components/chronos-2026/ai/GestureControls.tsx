// @ts-nocheck
/**
 * 🎮 GESTURE CONTROLS — Sistema avanzado de controles por gestos
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Multi-touch, pinch-zoom, swipe, rotate
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useEffect, useRef, useState } from 'react'

export interface GestureState {
  scale: number
  rotation: number
  translateX: number
  translateY: number
  velocity: { x: number; y: number }
  isSwipe: boolean
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null
}

interface UseGestureOptions {
  onPinch?: (scale: number) => void
  onRotate?: (rotation: number) => void
  onSwipe?: (direction: GestureState['swipeDirection']) => void
  onDoubleTap?: () => void
  minScale?: number
  maxScale?: number
}

export const useGesture = (
  elementRef: React.RefObject<HTMLElement>,
  options: UseGestureOptions = {},
) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    velocity: { x: 0, y: 0 },
    isSwipe: false,
    swipeDirection: null,
  })

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<number>(0)
  const initialPinchRef = useRef<{ distance: number; angle: number } | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const { minScale = 0.5, maxScale = 3, onPinch, onRotate, onSwipe, onDoubleTap } = options

    // Calcular distancia entre dos puntos
    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    // Calcular ángulo entre dos puntos
    const getAngle = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX
      const dy = touch1.clientY - touch2.clientY
      return (Math.atan2(dy, dx) * 180) / Math.PI
    }

    // Touch start
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]!
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        }

        // Detectar doble tap
        const now = Date.now()
        if (now - lastTapRef.current < 300) {
          onDoubleTap?.()
        }
        lastTapRef.current = now
      } else if (e.touches.length === 2) {
        // Iniciar pinch/rotate
        const distance = getDistance(e.touches[0]!, e.touches[1]!)
        const angle = getAngle(e.touches[0]!, e.touches[1]!)
        initialPinchRef.current = { distance, angle }
      }
    }

    // Touch move
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchRef.current) {
        e.preventDefault()

        // Pinch to zoom
        const currentDistance = getDistance(e.touches[0]!, e.touches[1]!)
        const scale = currentDistance / initialPinchRef.current.distance
        const newScale = Math.max(minScale, Math.min(maxScale, gestureState.scale * scale))

        // Rotation
        const currentAngle = getAngle(e.touches[0]!, e.touches[1]!)
        const rotation = currentAngle - initialPinchRef.current.angle

        setGestureState((prev) => ({
          ...prev,
          scale: newScale,
          rotation: prev.rotation + rotation,
        }))

        onPinch?.(newScale)
        onRotate?.(rotation)

        initialPinchRef.current = { distance: currentDistance, angle: currentAngle }
      } else if (e.touches.length === 1 && touchStartRef.current) {
        const touch = e.touches[0]!
        const dx = touch.clientX - touchStartRef.current.x
        const dy = touch.clientY - touchStartRef.current.y

        setGestureState((prev) => ({
          ...prev,
          translateX: dx,
          translateY: dy,
        }))
      }
    }

    // Touch end
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current && e.touches.length === 0) {
        const touch = e.changedTouches[0]
        const dx = touch.clientX - touchStartRef.current.x
        const dy = touch.clientY - touchStartRef.current.y
        const dt = Date.now() - touchStartRef.current.time
        const velocity = {
          x: dx / dt,
          y: dy / dt,
        }

        // Detectar swipe
        const threshold = 50
        const speedThreshold = 0.5
        let swipeDirection: GestureState['swipeDirection'] = null

        if (Math.abs(dx) > threshold || Math.abs(velocity.x) > speedThreshold) {
          swipeDirection = dx > 0 ? 'right' : 'left'
        } else if (Math.abs(dy) > threshold || Math.abs(velocity.y) > speedThreshold) {
          swipeDirection = dy > 0 ? 'down' : 'up'
        }

        if (swipeDirection) {
          onSwipe?.(swipeDirection)
          setGestureState((prev) => ({
            ...prev,
            isSwipe: true,
            swipeDirection,
            velocity,
          }))

          // Reset swipe después de un tiempo
          setTimeout(() => {
            setGestureState((prev) => ({
              ...prev,
              isSwipe: false,
              swipeDirection: null,
            }))
          }, 300)
        }

        touchStartRef.current = null
      }

      if (e.touches.length < 2) {
        initialPinchRef.current = null
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [elementRef, options, gestureState.scale])

  return gestureState
}

/**
 * 🎯 MOUSE PARALLAX — Efecto parallax basado en posición del mouse
 */
export const useMouseParallax = (intensity = 20) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * intensity
      const y = (e.clientY / window.innerHeight - 0.5) * intensity

      setMousePosition({ x: e.clientX, y: e.clientY })
      setParallaxOffset({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [intensity])

  return { mousePosition, parallaxOffset }
}

/**
 * 📱 DEVICE ORIENTATION — Gyroscope para efectos 3D
 */
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 })
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setIsSupported(true)

      const handleOrientation = (e: DeviceOrientationEvent) => {
        setOrientation({
          alpha: e.alpha || 0,
          beta: e.beta || 0,
          gamma: e.gamma || 0,
        })
      }

      window.addEventListener('deviceorientation', handleOrientation)
      return () => window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  return { orientation, isSupported }
}
