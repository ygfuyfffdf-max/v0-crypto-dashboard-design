/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ SAFE EFFECT COMPOSER — Wrapper seguro para @react-three/postprocessing
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Este componente soluciona el error:
 * "Cannot read properties of undefined (reading 'length')" en EffectComposer.tsx:139
 *
 * El error ocurre cuando:
 * 1. El WebGL context no está completamente inicializado
 * 2. No hay efectos hijos en el EffectComposer
 * 3. El canvas se desmonta antes de que los efectos terminen de inicializar
 */

'use client'

import { useThree } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import * as THREE from 'three'

interface SafeEffectComposerProps {
  children?: ReactNode
  enabled?: boolean
  multisampling?: number
}

/**
 * Wrapper seguro para EffectComposer que verifica el contexto WebGL
 */
export function SafeEffectComposer({
  children,
  enabled = true,
  multisampling = 0,
}: SafeEffectComposerProps) {
  const { gl, scene, camera } = useThree()
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    // Verificar que WebGL está completamente inicializado
    const checkWebGLReady = (): boolean => {
      try {
        if (!gl || !scene || !camera) return false

        const context = gl.getContext()
        if (!context) return false

        // Verificar que el renderer tiene las propiedades necesarias
        if (!gl.domElement || gl.domElement.width === 0 || gl.domElement.height === 0) {
          return false
        }

        return true
      } catch {
        return false
      }
    }

    // Esperar un frame para asegurar que todo esté montado
    const timer = setTimeout(() => {
      if (checkWebGLReady()) {
        setIsReady(true)
      } else {
        // Reintentar después de un breve delay
        retryTimer = setTimeout(() => {
          setIsReady(checkWebGLReady())
        }, 200)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [gl, scene, camera])

  // No renderizar si no está habilitado, no está listo, o hay error
  if (!enabled || !isReady || hasError) {
    return null
  }

  // No renderizar si no hay hijos (causa el error .length)
  if (!children) {
    return null
  }

  try {
    return (
      <Suspense fallback={null}>
        <EffectComposer multisampling={multisampling}>
          {children as React.ReactElement}
        </EffectComposer>
      </Suspense>
    )
  } catch {
    setHasError(true)
    return null
  }
}

/**
 * Preset de efectos estándar para Chronos
 */
export function ChronosEffects({
  bloomIntensity = 1.2,
  chromaticAberration = 0.001,
  vignetteIntensity = 0.4,
}: {
  bloomIntensity?: number
  chromaticAberration?: number
  vignetteIntensity?: number
}) {
  return (
    <SafeEffectComposer enabled={true} multisampling={4}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        radius={0.8}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(chromaticAberration, chromaticAberration)}
      />
      <Vignette offset={0.3} darkness={vignetteIntensity} blendFunction={BlendFunction.NORMAL} />
    </SafeEffectComposer>
  )
}

/**
 * Efectos minimalistas para mejor rendimiento
 */
export function MinimalEffects() {
  return (
    <SafeEffectComposer enabled={true} multisampling={0}>
      <Bloom intensity={0.8} luminanceThreshold={0.3} radius={0.6} />
    </SafeEffectComposer>
  )
}

export default SafeEffectComposer
