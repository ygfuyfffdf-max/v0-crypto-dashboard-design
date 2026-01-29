'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎬 SCENE 3D - Componente Base para Escenas 3D con React Three Fiber
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  OrbitControls,
  PerformanceMonitor,
  PerspectiveCamera,
  Preload,
  Stats,
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import React, { Suspense, useRef } from 'react'
import * as THREE from 'three'

import type { PostProcessingPipeline, Scene3DProps } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 POST-PROCESSING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface PostProcessingProps {
  config?: PostProcessingPipeline
}

function PostProcessingEffects({ config }: PostProcessingProps) {
  if (!config) return null

  return (
    <EffectComposer multisampling={0}>
      {config.bloom && (
        <Bloom
          intensity={config.bloom.intensity}
          luminanceThreshold={config.bloom.luminanceThreshold}
          luminanceSmoothing={config.bloom.luminanceSmoothing}
          kernelSize={KernelSize.LARGE}
          mipmapBlur={config.bloom.mipmapBlur}
        />
      )}
      {config.chromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={
            new THREE.Vector2(
              config.chromaticAberration.offset[0],
              config.chromaticAberration.offset[1],
            )
          }
          radialModulation={config.chromaticAberration.radialModulation}
          modulationOffset={config.chromaticAberration.modulationOffset}
        />
      )}
      {config.vignette && (
        <Vignette
          offset={config.vignette.offset}
          darkness={config.vignette.darkness}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
      {config.noise && (
        <Noise premultiply={config.noise.premultiply} blendFunction={BlendFunction.ADD} />
      )}
    </EffectComposer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 SCENE CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

interface SceneContentProps {
  children: React.ReactNode
  controls?: Scene3DProps['controls']
  environment?: Scene3DProps['environment']
  postProcessing?: PostProcessingPipeline
  debug?: boolean
}

function SceneContent({
  children,
  controls,
  environment,
  postProcessing,
  debug,
}: SceneContentProps) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  // Auto-rotate handler
  useFrame((_, delta) => {
    if (controlsRef.current && controls?.autoRotate) {
      controlsRef.current.update()
    }
  })

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} near={0.1} far={1000} />

      {/* Controls */}
      {controls?.enabled !== false && (
        <OrbitControls
          ref={controlsRef}
          enableDamping={controls?.enableDamping ?? true}
          dampingFactor={controls?.dampingFactor ?? 0.05}
          enableZoom={controls?.enableZoom ?? true}
          enablePan={controls?.enablePan ?? true}
          enableRotate={controls?.enableRotate ?? true}
          autoRotate={controls?.autoRotate ?? false}
          autoRotateSpeed={controls?.autoRotateSpeed ?? 1}
          minDistance={controls?.minDistance ?? 1}
          maxDistance={controls?.maxDistance ?? 100}
          minPolarAngle={controls?.minPolarAngle ?? 0}
          maxPolarAngle={controls?.maxPolarAngle ?? Math.PI}
        />
      )}

      {/* Environment */}
      {environment && (
        <Environment
          preset={environment.preset ?? 'city'}
          background={environment.background ?? false}
          blur={environment.blur ?? 0}
          resolution={environment.resolution ?? 256}
        />
      )}

      {/* Default Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 5, -10]} color="#8866ff" intensity={0.5} />
      <pointLight position={[10, 5, -10]} color="#ff6688" intensity={0.3} />

      {/* Scene Children */}
      {children}

      {/* Post Processing */}
      <PostProcessingEffects config={postProcessing} />

      {/* Debug Stats */}
      {debug && <Stats />}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 MAIN SCENE 3D COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function Scene3D({
  children,
  camera,
  controls,
  environment,
  postProcessing,
  performance,
  debug = false,
  className = '',
  style,
}: Scene3DProps) {
  const [dpr, setDpr] = React.useState(1)

  return (
    <div className={`relative h-full w-full ${className}`} style={style}>
      <Canvas
        shadows
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{
          position: camera?.position ?? [0, 5, 10],
          fov: camera?.fov ?? 75,
          near: camera?.near ?? 0.1,
          far: camera?.far ?? 1000,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.2
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        {/* Performance optimizations */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <PerformanceMonitor
          onIncline={() => setDpr(Math.min(2, dpr + 0.5))}
          onDecline={() => setDpr(Math.max(0.5, dpr - 0.5))}
        />

        <Suspense fallback={null}>
          <SceneContent
            controls={controls}
            environment={environment}
            postProcessing={postProcessing}
            debug={debug}
          >
            {children}
          </SceneContent>
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const Scene3DPresets = {
  // Default cinematic look
  cinematic: {
    environment: {
      preset: 'city' as const,
      background: false,
      blur: 0.5,
    },
    postProcessing: {
      bloom: {
        intensity: 1.5,
        threshold: 0.8,
        smoothing: 0.3,
        radius: 0.8,
        luminanceThreshold: 0.8,
        luminanceSmoothing: 0.3,
        mipmapBlur: true,
      },
      chromaticAberration: {
        offset: [0.001, 0.001] as [number, number],
        radialModulation: true,
        modulationOffset: 0.5,
      },
      vignette: {
        offset: 0.4,
        darkness: 0.5,
      },
    },
    controls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.05,
      enableZoom: true,
      enablePan: true,
      enableRotate: true,
      autoRotate: false,
      autoRotateSpeed: 1,
      minDistance: 2,
      maxDistance: 50,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
      type: 'orbit' as const,
    },
  },

  // Cyberpunk neon style
  cyberpunk: {
    environment: {
      preset: 'night' as const,
      background: false,
    },
    postProcessing: {
      bloom: {
        intensity: 2.5,
        threshold: 0.5,
        smoothing: 0.5,
        radius: 1.0,
        luminanceThreshold: 0.5,
        luminanceSmoothing: 0.5,
        mipmapBlur: true,
      },
      chromaticAberration: {
        offset: [0.005, 0.005] as [number, number],
        radialModulation: false,
        modulationOffset: 0,
      },
    },
    controls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.03,
      enableZoom: true,
      enablePan: false,
      enableRotate: true,
      autoRotate: true,
      autoRotateSpeed: 0.5,
      minDistance: 3,
      maxDistance: 30,
      minPolarAngle: Math.PI * 0.2,
      maxPolarAngle: Math.PI * 0.8,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
      type: 'orbit' as const,
    },
  },

  // Minimal clean look
  minimal: {
    environment: {
      preset: 'studio' as const,
      background: false,
    },
    postProcessing: {
      bloom: {
        intensity: 0.5,
        threshold: 0.95,
        smoothing: 0.1,
        radius: 0.3,
        luminanceThreshold: 0.95,
        luminanceSmoothing: 0.1,
        mipmapBlur: true,
      },
      vignette: {
        offset: 0.6,
        darkness: 0.2,
      },
    },
    controls: {
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.1,
      enableZoom: true,
      enablePan: true,
      enableRotate: true,
      autoRotate: false,
      autoRotateSpeed: 0,
      minDistance: 1,
      maxDistance: 100,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
      type: 'orbit' as const,
    },
  },
}

export default Scene3D
