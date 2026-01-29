'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎣 HOOKS 3D - Hooks Personalizados para 3D/WebGL/WebGPU
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { PerformanceMetrics, WebGPUCapabilities } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 useWebGPU - Detección y inicialización de WebGPU
// ═══════════════════════════════════════════════════════════════════════════════

export function useWebGPU() {
  const [capabilities, setCapabilities] = useState<WebGPUCapabilities>({
    isSupported: false,
    adapter: null,
    device: null,
    features: new Set(),
    limits: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined' || !navigator.gpu) {
        setCapabilities({
          isSupported: false,
          adapter: null,
          device: null,
          features: new Set(),
          limits: null,
        })
        setIsLoading(false)
        return
      }

      try {
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance',
        })

        if (!adapter) {
          setIsLoading(false)
          return
        }

        const device = await adapter.requestDevice()

        setCapabilities({
          isSupported: true,
          adapter,
          device,
          features: new Set(adapter.features),
          limits: adapter.limits,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize WebGPU'))
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  return { ...capabilities, isLoading, error }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 useShader - Hook para materiales con shaders personalizados
// ═══════════════════════════════════════════════════════════════════════════════

interface UseShaderOptions {
  vertexShader: string
  fragmentShader: string
  uniforms?: Record<string, { value: unknown }>
  transparent?: boolean
  depthWrite?: boolean
  blending?: THREE.Blending
}

export function useShader({
  vertexShader,
  fragmentShader,
  uniforms = {},
  transparent = true,
  depthWrite = false,
  blending = THREE.AdditiveBlending,
}: UseShaderOptions) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          ...uniforms,
        },
        transparent,
        depthWrite,
        blending,
      }),
    [vertexShader, fragmentShader, transparent, depthWrite, blending],
  )

  const updateUniform = useCallback(
    (name: string, value: unknown) => {
      if (material.uniforms[name]) {
        material.uniforms[name].value = value
      }
    },
    [material],
  )

  const updateTime = useCallback(
    (time: number) => {
      if (material.uniforms?.uTime) {
        material.uniforms.uTime.value = time
      }
    },
    [material],
  )

  useFrame((state) => {
    updateTime(state.clock.elapsedTime)
  })

  return {
    material,
    materialRef,
    updateUniform,
    updateTime,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 💫 useParticles - Hook para sistemas de partículas
// ═══════════════════════════════════════════════════════════════════════════════

interface UseParticlesOptions {
  count: number
  spread?: number
  size?: number
  color?: string | string[]
}

export function useParticles({
  count,
  spread = 10,
  size = 0.1,
  color = '#ffffff',
}: UseParticlesOptions) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const colorArray = Array.isArray(color)
      ? color.map((c) => new THREE.Color(c))
      : [new THREE.Color(color)]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Random position in sphere
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = spread * Math.cbrt(Math.random())

      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      // Random color from array
      const c = colorArray[Math.floor(Math.random() * colorArray.length)] ?? colorArray[0]
      if (c) {
        colors[i3] = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b
      }

      // Random size
      sizes[i] = size * (0.5 + Math.random())
    }

    return { positions, colors, sizes }
  }, [count, spread, size, color])

  const updatePosition = useCallback((index: number, x: number, y: number, z: number) => {
    const posAttr = pointsRef.current?.geometry?.attributes?.position
    if (!posAttr?.array) return
    const positions = posAttr.array as Float32Array
    const i3 = index * 3
    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z
    posAttr.needsUpdate = true
  }, [])

  return {
    pointsRef,
    positions,
    colors,
    sizes,
    updatePosition,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 usePerformance - Monitoreo de rendimiento
// ═══════════════════════════════════════════════════════════════════════════════

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
  })

  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const { gl } = useThree()

  useFrame(() => {
    frameCount.current++

    const now = performance.now()
    const elapsed = now - lastTime.current

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / elapsed)
      const info = gl.info

      setMetrics({
        fps,
        frameTime: 1000 / fps,
        memoryUsed:
          (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
            ?.usedJSHeapSize ?? 0,
        memoryTotal:
          (performance as unknown as { memory?: { totalJSHeapSize: number } }).memory
            ?.totalJSHeapSize ?? 0,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length ?? 0,
      })

      info.reset()
      frameCount.current = 0
      lastTime.current = now
    }
  })

  return metrics
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🖱️ useMouse3D - Posición del mouse en espacio 3D
// ═══════════════════════════════════════════════════════════════════════════════

export function useMouse3D(planeNormal = new THREE.Vector3(0, 0, 1), planeDistance = 0) {
  const mouse3D = useRef(new THREE.Vector3())
  const { pointer, camera, viewport } = useThree()

  useFrame(() => {
    // Create plane
    const plane = new THREE.Plane(planeNormal, planeDistance)
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(pointer, camera)

    // Intersect
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)

    if (intersection) {
      mouse3D.current.copy(intersection)
    }
  })

  return mouse3D.current
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 useAnimation - Controlador de animación
// ═══════════════════════════════════════════════════════════════════════════════

interface AnimationState {
  isPlaying: boolean
  progress: number
  speed: number
  loop: boolean
}

export function useAnimation(duration = 1, loop = false) {
  const [state, setState] = useState<AnimationState>({
    isPlaying: false,
    progress: 0,
    speed: 1,
    loop,
  })

  const play = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: true }))
  }, [])

  const pause = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: false }))
  }, [])

  const reset = useCallback(() => {
    setState((s) => ({ ...s, progress: 0 }))
  }, [])

  const setSpeed = useCallback((speed: number) => {
    setState((s) => ({ ...s, speed }))
  }, [])

  useFrame((_, delta) => {
    if (!state.isPlaying) return

    setState((s) => {
      const newProgress = s.progress + (delta * s.speed) / duration

      if (newProgress >= 1) {
        if (s.loop) {
          return { ...s, progress: newProgress % 1 }
        }
        return { ...s, progress: 1, isPlaying: false }
      }

      return { ...s, progress: newProgress }
    })
  })

  return {
    ...state,
    play,
    pause,
    reset,
    setSpeed,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 useViewportSize - Tamaño del viewport en unidades 3D
// ═══════════════════════════════════════════════════════════════════════════════

export function useViewportSize(distance = 5) {
  const { viewport, camera } = useThree()

  const size = useMemo(() => {
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const cam = camera as THREE.PerspectiveCamera
      const fov = cam.fov * (Math.PI / 180)
      const height = 2 * Math.tan(fov / 2) * distance
      const width = height * cam.aspect
      return { width, height }
    }
    return { width: viewport.width, height: viewport.height }
  }, [camera, viewport, distance])

  return size
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  useAnimation as useAnimationHook,
  useMouse3D as useMouse3DHook,
  useParticles as useParticlesHook,
  usePerformance as usePerformanceHook,
  useShader as useShaderHook,
  useViewportSize as useViewportSizeHook,
  useWebGPU as useWebGPUHook,
}
