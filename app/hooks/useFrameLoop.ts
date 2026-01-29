'use client'

import { useCallback, useEffect, useRef } from 'react'

export interface FrameLoopCallback {
  (deltaTime: number, elapsedTime: number): void
}

export interface UseFrameLoopOptions {
  autoStart?: boolean
  maxFPS?: number
}

export interface UseFrameLoopReturn {
  start: () => void
  stop: () => void
  isRunning: boolean
  fps: number
}

/**
 * Hook personalizado para requestAnimationFrame con delta time preciso
 * Optimizado para animaciones 60fps con control de performance
 */
export function useFrameLoop(
  callback: FrameLoopCallback,
  options: UseFrameLoopOptions = {},
): UseFrameLoopReturn {
  const { autoStart = true, maxFPS = 60 } = options

  const rafIdRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const lastTimeRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const fpsRef = useRef<number>(60)
  const frameCountRef = useRef<number>(0)
  const fpsTimeRef = useRef<number>(0)

  const minFrameTime = 1000 / maxFPS

  const animate = useCallback(
    (currentTime: number) => {
      if (!isRunningRef.current) return

      // Calcular delta time
      const deltaTime = currentTime - lastTimeRef.current

      // Limitar FPS si es necesario
      if (deltaTime < minFrameTime) {
        rafIdRef.current = requestAnimationFrame(animate)
        return
      }

      lastTimeRef.current = currentTime
      const elapsedTime = currentTime - startTimeRef.current

      // Calcular FPS real
      frameCountRef.current++
      if (currentTime - fpsTimeRef.current > 1000) {
        fpsRef.current = Math.round(
          (frameCountRef.current * 1000) / (currentTime - fpsTimeRef.current),
        )
        frameCountRef.current = 0
        fpsTimeRef.current = currentTime
      }

      // Ejecutar callback con delta time en segundos
      callback(deltaTime / 1000, elapsedTime / 1000)

      rafIdRef.current = requestAnimationFrame(animate)
    },
    [callback, minFrameTime],
  )

  const start = useCallback(() => {
    if (isRunningRef.current) return

    isRunningRef.current = true
    startTimeRef.current = performance.now()
    lastTimeRef.current = startTimeRef.current
    fpsTimeRef.current = startTimeRef.current
    frameCountRef.current = 0

    rafIdRef.current = requestAnimationFrame(animate)
  }, [animate])

  const stop = useCallback(() => {
    if (!isRunningRef.current) return

    isRunningRef.current = false
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [])

  useEffect(() => {
    if (autoStart) {
      start()
    }

    return () => {
      stop()
    }
  }, [autoStart, start, stop])

  return {
    start,
    stop,
    isRunning: isRunningRef.current,
    fps: fpsRef.current,
  }
}
