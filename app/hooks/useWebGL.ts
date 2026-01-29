'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface UseWebGLOptions {
  antialias?: boolean
  alpha?: boolean
  powerPreference?: 'high-performance' | 'low-power' | 'default'
  preserveDrawingBuffer?: boolean
}

export interface UseWebGLReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  gl: THREE.WebGLRenderer | null
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  isReady: boolean
  resize: () => void
}

/**
 * Hook personalizado para inicializar y gestionar contexto WebGL con Three.js
 * Maneja automáticamente resize y cleanup
 */
export function useWebGL(options: UseWebGLOptions = {}): UseWebGLReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gl, setGl] = useState<THREE.WebGLRenderer | null>(null)
  const [isReady, setIsReady] = useState(false)

  const sceneRef = useRef(new THREE.Scene())
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(
      75,
      typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1,
      0.1,
      1000,
    ),
  )

  const resize = useCallback(() => {
    if (!gl || typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight

    cameraRef.current.aspect = width / height
    cameraRef.current.updateProjectionMatrix()

    gl.setSize(width, height)
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }, [gl])

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: options.antialias ?? true,
      alpha: options.alpha ?? true,
      powerPreference: options.powerPreference ?? 'high-performance',
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1

    setGl(renderer)
    setIsReady(true)

    // Handle resize
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      renderer.dispose()
    }
  }, [
    options.antialias,
    options.alpha,
    options.powerPreference,
    options.preserveDrawingBuffer,
    resize,
  ])

  return {
    canvasRef,
    gl,
    scene: sceneRef.current,
    camera: cameraRef.current,
    isReady,
    resize,
  }
}
