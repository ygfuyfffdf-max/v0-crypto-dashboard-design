'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface ShaderUniforms {
  [key: string]: THREE.IUniform
}

export interface UseShaderOptions {
  vertexShader: string
  fragmentShader: string
  uniforms?: ShaderUniforms
  transparent?: boolean
  blending?: THREE.Blending
  side?: THREE.Side
  depthTest?: boolean
  depthWrite?: boolean
}

export interface UseShaderReturn {
  material: THREE.ShaderMaterial | null
  updateUniforms: (updates: Partial<ShaderUniforms>) => void
  setUniform: (name: string, value: any) => void
  isCompiled: boolean
  error: string | null
}

/**
 * Hook personalizado para crear y gestionar shader materials
 * Incluye compilación automática, gestión de uniforms y error handling
 */
export function useShader(options: UseShaderOptions): UseShaderReturn {
  const [material, setMaterial] = useState<THREE.ShaderMaterial | null>(null)
  const [isCompiled, setIsCompiled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  const setUniform = useCallback((name: string, value: any) => {
    if (!materialRef.current) return
    if (materialRef.current.uniforms[name]) {
      materialRef.current.uniforms[name].value = value
    }
  }, [])

  const updateUniforms = useCallback((updates: Partial<ShaderUniforms>) => {
    if (!materialRef.current) return
    Object.keys(updates).forEach((key) => {
      if (materialRef.current!.uniforms[key]) {
        materialRef.current!.uniforms[key].value = updates[key]!.value
      }
    })
  }, [])

  useEffect(() => {
    try {
      const mat = new THREE.ShaderMaterial({
        vertexShader: options.vertexShader,
        fragmentShader: options.fragmentShader,
        uniforms: options.uniforms || {},
        transparent: options.transparent ?? false,
        blending: options.blending ?? THREE.NormalBlending,
        side: options.side ?? THREE.FrontSide,
        depthTest: options.depthTest ?? true,
        depthWrite: options.depthWrite ?? true,
      })

      materialRef.current = mat
      setMaterial(mat)
      setIsCompiled(true)
      setError(null)
    } catch (err) {
      console.error('Shader compilation error:', err)
      setError(err instanceof Error ? err.message : 'Unknown shader error')
      setIsCompiled(false)
    }

    return () => {
      if (materialRef.current) {
        materialRef.current.dispose()
      }
    }
  }, [
    options.vertexShader,
    options.fragmentShader,
    options.transparent,
    options.blending,
    options.side,
    options.depthTest,
    options.depthWrite,
  ])

  return {
    material,
    updateUniforms,
    setUniform,
    isCompiled,
    error,
  }
}
