'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ SHADER PERFORMANCE UTILITIES — CHRONOS ELITE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de optimización de rendimiento para shaders con:
 * - Detección automática de capacidades del dispositivo
 * - FPS monitoring y auto-ajuste de calidad
 * - Throttling adaptativo basado en visibilidad
 * - Memory management para WebGL contexts
 * - Power-saving mode detection
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface DeviceCapabilities {
  tier: 'low' | 'medium' | 'high' | 'ultra'
  cores: number
  memory: number | null
  gpu: string | null
  webgl2: boolean
  webgpu: boolean
  prefersReducedMotion: boolean
  isMobile: boolean
  isLowPowerMode: boolean
  maxTextureSize: number
  maxParticles: number
  recommendedFPS: number
}

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  averageFPS: number
  minFPS: number
  maxFPS: number
  frameDrops: number
  memoryUsage: number | null
}

export interface ShaderPerformanceConfig {
  targetFPS: number
  autoAdjustQuality: boolean
  fpsThresholdLow: number
  fpsThresholdHigh: number
  measureInterval: number
  historyLength: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEVICE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return {
      tier: 'medium',
      cores: 4,
      memory: null,
      gpu: null,
      webgl2: false,
      webgpu: false,
      prefersReducedMotion: false,
      isMobile: false,
      isLowPowerMode: false,
      maxTextureSize: 4096,
      maxParticles: 5000,
      recommendedFPS: 60,
    }
  }

  // Core count
  const cores = navigator.hardwareConcurrency || 4

  // Memory (Chrome only)
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || null

  // GPU info via WebGL
  let gpu: string | null = null
  let webgl2 = false
  let maxTextureSize = 4096

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

    if (gl) {
      webgl2 = gl instanceof WebGL2RenderingContext

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      }

      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    }
  } catch {
    // WebGL not available
  }

  // WebGPU support
  const webgpu = 'gpu' in navigator

  // Motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )

  // Low power mode (battery saver)
  const isLowPowerMode = window.matchMedia('(prefers-reduced-data: reduce)').matches

  // Determine tier
  let tier: DeviceCapabilities['tier'] = 'medium'
  let maxParticles = 5000
  let recommendedFPS = 60

  // Ultra tier: High-end desktop with dedicated GPU
  if (
    cores >= 8 &&
    (memory === null || memory >= 8) &&
    webgl2 &&
    !isMobile &&
    maxTextureSize >= 8192
  ) {
    tier = 'ultra'
    maxParticles = 15000
    recommendedFPS = 120
  }
  // High tier: Good desktop or high-end laptop
  else if (cores >= 6 && (memory === null || memory >= 4) && webgl2 && !prefersReducedMotion) {
    tier = 'high'
    maxParticles = 8000
    recommendedFPS = 60
  }
  // Low tier: Mobile, old hardware, or reduced motion preference
  else if (
    cores <= 4 ||
    (memory !== null && memory <= 2) ||
    isMobile ||
    prefersReducedMotion ||
    isLowPowerMode
  ) {
    tier = 'low'
    maxParticles = 2000
    recommendedFPS = 30
  }

  return {
    tier,
    cores,
    memory,
    gpu,
    webgl2,
    webgpu,
    prefersReducedMotion,
    isMobile,
    isLowPowerMode,
    maxTextureSize,
    maxParticles,
    recommendedFPS,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITOR HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ShaderPerformanceConfig = {
  targetFPS: 60,
  autoAdjustQuality: true,
  fpsThresholdLow: 30,
  fpsThresholdHigh: 55,
  measureInterval: 1000,
  historyLength: 60,
}

export function useShaderPerformance(config: Partial<ShaderPerformanceConfig> = {}) {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])

  const [capabilities] = useState<DeviceCapabilities>(() => detectDeviceCapabilities())
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    averageFPS: 60,
    minFPS: 60,
    maxFPS: 60,
    frameDrops: 0,
    memoryUsage: null,
  })
  const [qualityMultiplier, setQualityMultiplier] = useState(1)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const frameTimesRef = useRef<number[]>([])
  const lastFrameRef = useRef(performance.now())
  const animationFrameRef = useRef<number | null>(null)
  const measureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return

    setIsMonitoring(true)
    frameTimesRef.current = []
    lastFrameRef.current = performance.now()

    const measureFrame = () => {
      const now = performance.now()
      const frameTime = now - lastFrameRef.current
      lastFrameRef.current = now

      // Store frame time
      frameTimesRef.current.push(frameTime)
      if (frameTimesRef.current.length > mergedConfig.historyLength) {
        frameTimesRef.current.shift()
      }

      animationFrameRef.current = requestAnimationFrame(measureFrame)
    }

    animationFrameRef.current = requestAnimationFrame(measureFrame)

    // Calculate metrics periodically
    measureIntervalRef.current = setInterval(() => {
      const times = frameTimesRef.current
      if (times.length === 0) return

      const avgFrameTime = times.reduce((a, b) => a + b, 0) / times.length
      const fps = Math.round(1000 / avgFrameTime)
      const minFPS = Math.round(1000 / Math.max(...times))
      const maxFPS = Math.round(1000 / Math.min(...times))
      const frameDrops = times.filter((t) => t > 33.33).length // >30fps

      // Memory usage (Chrome only)
      const memoryUsage =
        (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
          ?.usedJSHeapSize || null

      setMetrics({
        fps,
        frameTime: avgFrameTime,
        averageFPS: fps,
        minFPS,
        maxFPS,
        frameDrops,
        memoryUsage,
      })

      // Auto-adjust quality
      if (mergedConfig.autoAdjustQuality) {
        if (fps < mergedConfig.fpsThresholdLow) {
          setQualityMultiplier((prev) => Math.max(0.3, prev - 0.1))
        } else if (fps > mergedConfig.fpsThresholdHigh && qualityMultiplier < 1) {
          setQualityMultiplier((prev) => Math.min(1, prev + 0.05))
        }
      }
    }, mergedConfig.measureInterval)
  }, [isMonitoring, mergedConfig, qualityMultiplier])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (measureIntervalRef.current) {
      clearInterval(measureIntervalRef.current)
      measureIntervalRef.current = null
    }
  }, [])

  // Reset quality multiplier
  const resetQuality = useCallback(() => {
    setQualityMultiplier(1)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [stopMonitoring])

  // Get recommended settings based on capabilities
  const recommendedSettings = useMemo(() => {
    const { tier, maxParticles, recommendedFPS } = capabilities

    const settings = {
      particleCount: maxParticles,
      targetFPS: recommendedFPS,
      quality: tier,
      turbulence: 0.5,
      effects: {
        bloom: true,
        chromaticAberration: true,
        trails: true,
      },
    }

    switch (tier) {
      case 'ultra':
        settings.turbulence = 0.8
        break
      case 'high':
        settings.turbulence = 0.6
        break
      case 'medium':
        settings.turbulence = 0.4
        settings.effects.chromaticAberration = false
        break
      case 'low':
        settings.turbulence = 0.2
        settings.effects.bloom = false
        settings.effects.chromaticAberration = false
        settings.effects.trails = false
        break
    }

    return settings
  }, [capabilities])

  return {
    capabilities,
    metrics,
    qualityMultiplier,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetQuality,
    recommendedSettings,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VISIBILITY HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true)
  const [isInViewport, setIsInViewport] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return { isVisible, isInViewport, shouldRender: isVisible && isInViewport }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// THROTTLE UTILITY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): T {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallRef.current

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now
        callback(...args)
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now()
          callback(...args)
        }, delay - timeSinceLastCall)
      }
    }) as T,
    [callback, delay],
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// WEBGL CONTEXT MANAGER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const webglContexts = new Set<WebGLRenderingContext | WebGL2RenderingContext>()
const MAX_CONTEXTS = 8

export function registerWebGLContext(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  webglContexts.add(gl)

  // If we have too many contexts, lose the oldest ones
  if (webglContexts.size > MAX_CONTEXTS) {
    const oldest = webglContexts.values().next().value
    if (oldest) {
      const loseContext = oldest.getExtension('WEBGL_lose_context')
      if (loseContext) {
        loseContext.loseContext()
      }
      webglContexts.delete(oldest)
    }
  }
}

export function unregisterWebGLContext(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  webglContexts.delete(gl)
}

export function getActiveContextCount() {
  return webglContexts.size
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { detectDeviceCapabilities }
