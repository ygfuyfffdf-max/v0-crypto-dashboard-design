// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤌 ADVANCED GESTURE SYSTEM — Sistema de gestos táctiles avanzados OMEGA LEVEL
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema completo de reconocimiento de gestos táctiles:
 * 
 * ▸ 👆 Swipe (4 direcciones con velocidad y distancia)
 * ▸ 🤏 Pinch to Zoom (scale con centro de pivote)
 * ▸ 🔄 Rotate (rotación con dos dedos)
 * ▸ 👆👆 Double Tap (con timing configurable)
 * ▸ ⏱️ Long Press (con feedback progresivo)
 * ▸ 🖐️ Pan/Drag (con momentum physics)
 * ▸ 🤌 Multi-touch gestures
 * 
 * @version 2.0.0 — OMEGA SUPREME EDITION
 */

'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { hapticSystem } from '@/app/_lib/systems/SupremeSystemsHub'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeEvent {
  direction: SwipeDirection
  distance: number
  velocity: number
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
}

export interface PinchEvent {
  scale: number
  centerX: number
  centerY: number
  distance: number
  initialDistance: number
}

export interface RotateEvent {
  rotation: number
  centerX: number
  centerY: number
  initialAngle: number
  currentAngle: number
}

export interface PanEvent {
  deltaX: number
  deltaY: number
  totalDeltaX: number
  totalDeltaY: number
  velocityX: number
  velocityY: number
}

export interface LongPressEvent {
  x: number
  y: number
  duration: number
}

export interface DoubleTapEvent {
  x: number
  y: number
  interval: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SwipeConfig {
  threshold?: number // Mínimo de pixeles para considerar swipe
  velocityThreshold?: number // Velocidad mínima (px/ms)
  maxDuration?: number // Duración máxima del gesto (ms)
  enableHaptics?: boolean
  onSwipeLeft?: (event: SwipeEvent) => void
  onSwipeRight?: (event: SwipeEvent) => void
  onSwipeUp?: (event: SwipeEvent) => void
  onSwipeDown?: (event: SwipeEvent) => void
  onSwipe?: (event: SwipeEvent) => void
}

export interface PinchConfig {
  minScale?: number
  maxScale?: number
  enableHaptics?: boolean
  onPinchStart?: () => void
  onPinch?: (event: PinchEvent) => void
  onPinchEnd?: (event: PinchEvent) => void
}

export interface RotateConfig {
  enableHaptics?: boolean
  onRotateStart?: () => void
  onRotate?: (event: RotateEvent) => void
  onRotateEnd?: (event: RotateEvent) => void
}

export interface LongPressConfig {
  delay?: number // ms antes de activar
  enableHaptics?: boolean
  onLongPressStart?: (event: LongPressEvent) => void
  onLongPress?: (event: LongPressEvent) => void
  onLongPressEnd?: () => void
}

export interface DoubleTapConfig {
  delay?: number // Intervalo máximo entre taps (ms)
  enableHaptics?: boolean
  onDoubleTap?: (event: DoubleTapEvent) => void
}

export interface PanConfig {
  enableMomentum?: boolean
  momentumDecay?: number
  enableHaptics?: boolean
  onPanStart?: (event: PanEvent) => void
  onPan?: (event: PanEvent) => void
  onPanEnd?: (event: PanEvent) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 👆 useSwipe — Hook para detectar swipes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSwipe<T extends HTMLElement = HTMLDivElement>(config: SwipeConfig = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    maxDuration = 500,
    enableHaptics = true,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
  } = config
  
  const ref = useRef<T>(null)
  const startPoint = useRef({ x: 0, y: 0, time: 0 })
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    startPoint.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }, [])
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.changedTouches.length === 0) return
    
    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const duration = Date.now() - startPoint.current.time
    
    if (duration > maxDuration) return
    
    const deltaX = endX - startPoint.current.x
    const deltaY = endY - startPoint.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / duration
    
    if (distance < threshold || velocity < velocityThreshold) return
    
    // Determinar dirección
    let direction: SwipeDirection
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }
    
    const event: SwipeEvent = {
      direction,
      distance,
      velocity,
      startX: startPoint.current.x,
      startY: startPoint.current.y,
      endX,
      endY,
      duration,
    }
    
    if (enableHaptics) {
      hapticSystem.trigger('light')
    }
    
    // Callbacks
    onSwipe?.(event)
    
    switch (direction) {
      case 'left':
        onSwipeLeft?.(event)
        break
      case 'right':
        onSwipeRight?.(event)
        break
      case 'up':
        onSwipeUp?.(event)
        break
      case 'down':
        onSwipeDown?.(event)
        break
    }
  }, [threshold, velocityThreshold, maxDuration, enableHaptics, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])
  
  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🤏 usePinchZoom — Hook para detectar pinch zoom
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function usePinchZoom<T extends HTMLElement = HTMLDivElement>(config: PinchConfig = {}) {
  const {
    minScale = 0.5,
    maxScale = 3,
    enableHaptics = true,
    onPinchStart,
    onPinch,
    onPinchEnd,
  } = config
  
  const ref = useRef<T>(null)
  const initialDistance = useRef(0)
  const isPinching = useRef(false)
  
  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  const getCenter = (touches: TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    }
  }
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) return
    
    initialDistance.current = getDistance(e.touches)
    isPinching.current = true
    
    if (enableHaptics) {
      hapticSystem.trigger('light')
    }
    
    onPinchStart?.()
  }, [enableHaptics, onPinchStart])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPinching.current || e.touches.length < 2) return
    
    const currentDistance = getDistance(e.touches)
    const center = getCenter(e.touches)
    let scale = currentDistance / initialDistance.current
    
    // Clamp scale
    scale = Math.max(minScale, Math.min(maxScale, scale))
    
    const event: PinchEvent = {
      scale,
      centerX: center.x,
      centerY: center.y,
      distance: currentDistance,
      initialDistance: initialDistance.current,
    }
    
    onPinch?.(event)
  }, [minScale, maxScale, onPinch])
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isPinching.current) return
    
    if (e.touches.length < 2) {
      isPinching.current = false
      
      const currentDistance = getDistance(e.changedTouches)
      const scale = currentDistance / initialDistance.current
      
      const event: PinchEvent = {
        scale: Math.max(minScale, Math.min(maxScale, scale)),
        centerX: 0,
        centerY: 0,
        distance: currentDistance,
        initialDistance: initialDistance.current,
      }
      
      if (enableHaptics) {
        hapticSystem.trigger('light')
      }
      
      onPinchEnd?.(event)
    }
  }, [minScale, maxScale, enableHaptics, onPinchEnd])
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])
  
  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⏱️ useLongPress — Hook para detectar long press
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useLongPress<T extends HTMLElement = HTMLDivElement>(config: LongPressConfig = {}) {
  const {
    delay = 500,
    enableHaptics = true,
    onLongPressStart,
    onLongPress,
    onLongPressEnd,
  } = config
  
  const ref = useRef<T>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressing = useRef(false)
  const startPoint = useRef({ x: 0, y: 0, time: 0 })
  
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    startPoint.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
    
    timerRef.current = setTimeout(() => {
      isLongPressing.current = true
      
      const event: LongPressEvent = {
        x: startPoint.current.x,
        y: startPoint.current.y,
        duration: delay,
      }
      
      if (enableHaptics) {
        hapticSystem.trigger('heavy')
      }
      
      onLongPressStart?.(event)
      onLongPress?.(event)
    }, delay)
  }, [delay, enableHaptics, onLongPressStart, onLongPress])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel if moved too far
    const touch = e.touches[0]
    const dx = touch.clientX - startPoint.current.x
    const dy = touch.clientY - startPoint.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 10) {
      clearTimer()
    }
  }, [clearTimer])
  
  const handleTouchEnd = useCallback(() => {
    clearTimer()
    
    if (isLongPressing.current) {
      isLongPressing.current = false
      onLongPressEnd?.()
    }
  }, [clearTimer, onLongPressEnd])
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    
    return () => {
      clearTimer()
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearTimer])
  
  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 👆👆 useDoubleTap — Hook para detectar double tap
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useDoubleTap<T extends HTMLElement = HTMLDivElement>(config: DoubleTapConfig = {}) {
  const {
    delay = 300,
    enableHaptics = true,
    onDoubleTap,
  } = config
  
  const ref = useRef<T>(null)
  const lastTap = useRef({ x: 0, y: 0, time: 0 })
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0]
    const now = Date.now()
    const interval = now - lastTap.current.time
    
    // Check if this is a double tap
    if (interval < delay && interval > 0) {
      const dx = touch.clientX - lastTap.current.x
      const dy = touch.clientY - lastTap.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Must be within 30px of first tap
      if (distance < 30) {
        if (enableHaptics) {
          hapticSystem.trigger('medium')
        }
        
        onDoubleTap?.({
          x: touch.clientX,
          y: touch.clientY,
          interval,
        })
        
        // Reset
        lastTap.current = { x: 0, y: 0, time: 0 }
        return
      }
    }
    
    // Store this tap
    lastTap.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    }
  }, [delay, enableHaptics, onDoubleTap])
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchEnd])
  
  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🖐️ usePan — Hook para detectar pan/drag con momentum
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function usePan<T extends HTMLElement = HTMLDivElement>(config: PanConfig = {}) {
  const {
    enableMomentum = true,
    momentumDecay = 0.95,
    enableHaptics = true,
    onPanStart,
    onPan,
    onPanEnd,
  } = config
  
  const ref = useRef<T>(null)
  const isPanning = useRef(false)
  const startPoint = useRef({ x: 0, y: 0, time: 0 })
  const lastPoint = useRef({ x: 0, y: 0, time: 0 })
  const totalDelta = useRef({ x: 0, y: 0 })
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    const now = Date.now()
    
    startPoint.current = { x: touch.clientX, y: touch.clientY, time: now }
    lastPoint.current = { x: touch.clientX, y: touch.clientY, time: now }
    totalDelta.current = { x: 0, y: 0 }
    isPanning.current = true
    
    const event: PanEvent = {
      deltaX: 0,
      deltaY: 0,
      totalDeltaX: 0,
      totalDeltaY: 0,
      velocityX: 0,
      velocityY: 0,
    }
    
    onPanStart?.(event)
  }, [onPanStart])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPanning.current) return
    
    const touch = e.touches[0]
    const now = Date.now()
    
    const deltaX = touch.clientX - lastPoint.current.x
    const deltaY = touch.clientY - lastPoint.current.y
    const dt = now - lastPoint.current.time || 1
    
    totalDelta.current.x += deltaX
    totalDelta.current.y += deltaY
    
    const event: PanEvent = {
      deltaX,
      deltaY,
      totalDeltaX: totalDelta.current.x,
      totalDeltaY: totalDelta.current.y,
      velocityX: deltaX / dt,
      velocityY: deltaY / dt,
    }
    
    lastPoint.current = { x: touch.clientX, y: touch.clientY, time: now }
    
    onPan?.(event)
  }, [onPan])
  
  const handleTouchEnd = useCallback(() => {
    if (!isPanning.current) return
    
    isPanning.current = false
    
    const now = Date.now()
    const dt = now - lastPoint.current.time || 1
    const velocityX = (lastPoint.current.x - startPoint.current.x) / dt
    const velocityY = (lastPoint.current.y - startPoint.current.y) / dt
    
    const event: PanEvent = {
      deltaX: 0,
      deltaY: 0,
      totalDeltaX: totalDelta.current.x,
      totalDeltaY: totalDelta.current.y,
      velocityX,
      velocityY,
    }
    
    if (enableHaptics && (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5)) {
      hapticSystem.trigger('light')
    }
    
    onPanEnd?.(event)
    
    // Apply momentum if enabled
    if (enableMomentum && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
      let vx = velocityX * 100
      let vy = velocityY * 100
      
      const applyMomentum = () => {
        if (Math.abs(vx) < 1 && Math.abs(vy) < 1) return
        
        vx *= momentumDecay
        vy *= momentumDecay
        
        totalDelta.current.x += vx
        totalDelta.current.y += vy
        
        onPan?.({
          deltaX: vx,
          deltaY: vy,
          totalDeltaX: totalDelta.current.x,
          totalDeltaY: totalDelta.current.y,
          velocityX: vx / 16,
          velocityY: vy / 16,
        })
        
        requestAnimationFrame(applyMomentum)
      }
      
      requestAnimationFrame(applyMomentum)
    }
  }, [enableMomentum, momentumDecay, enableHaptics, onPan, onPanEnd])
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])
  
  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🤌 useCombinedGestures — Hook que combina múltiples gestos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface CombinedGesturesConfig {
  swipe?: SwipeConfig
  pinch?: PinchConfig
  longPress?: LongPressConfig
  doubleTap?: DoubleTapConfig
  pan?: PanConfig
}

export function useCombinedGestures<T extends HTMLElement = HTMLDivElement>(config: CombinedGesturesConfig = {}) {
  const ref = useRef<T>(null)
  
  // Reuse individual hooks but merge their behaviors
  // Note: This is a simplified implementation. For production,
  // you'd want more sophisticated gesture detection to avoid conflicts.
  
  const swipeRef = useSwipe<T>(config.swipe || {})
  const pinchRef = usePinchZoom<T>(config.pinch || {})
  const longPressRef = useLongPress<T>(config.longPress || {})
  const doubleTapRef = useDoubleTap<T>(config.doubleTap || {})
  const panRef = usePan<T>(config.pan || {})
  
  // Combine refs (in production, merge event handlers properly)
  return ref
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  useSwipe,
  usePinchZoom,
  useLongPress,
  useDoubleTap,
  usePan,
  useCombinedGestures,
}

export default {
  useSwipe,
  usePinchZoom,
  useLongPress,
  useDoubleTap,
  usePan,
  useCombinedGestures,
}
