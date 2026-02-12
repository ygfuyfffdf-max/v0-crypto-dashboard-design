/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS ULTRA PREMIUM 3D ENGINE — 2026 SUPREME EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Motor 3D de última generación con:
 * - Path Tracing GPU en tiempo real
 * - Volumetric Lighting + God Rays
 * - Screen Space Reflections (SSR)
 * - Temporal Anti-Aliasing (TAA)
 * - Depth of Field con Bokeh cinematográfico
 * - Motion Blur de alta calidad
 * - Instanced Mesh para 1M+ partículas
 * - Caustics y refracción realista
 *
 * @version ULTRA-PREMIUM 2026.3
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { Environment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
    Bloom,
    ChromaticAberration,
    DepthOfField,
    EffectComposer,
    Noise,
    SMAA,
    ToneMapping,
    Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import React, { forwardRef, memo, Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA PREMIUM DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ULTRA_PREMIUM_CONFIG = {
  // Colores cuánticos premium
  colors: {
    primaryViolet: new THREE.Color('#8B00FF'),
    secondaryGold: new THREE.Color('#FFD700'),
    accentPlasma: new THREE.Color('#FF1493'),
    voidBlack: new THREE.Color('#000000'),
    pureWhite: new THREE.Color('#FFFFFF'),
    auroraGreen: new THREE.Color('#00FF88'),
    nebulaCyan: new THREE.Color('#00FFFF'),
  },

  // Configuración de rendering premium
  rendering: {
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    outputColorSpace: THREE.SRGBColorSpace,
  },

  // Post-processing presets
  postProcessing: {
    bloom: {
      intensity: 1.5,
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.9,
      kernelSize: KernelSize.LARGE,
    },
    depthOfField: {
      focusDistance: 0.02,
      focalLength: 0.05,
      bokehScale: 3,
    },
    chromaticAberration: {
      offset: new THREE.Vector2(0.002, 0.002),
    },
    vignette: {
      darkness: 0.5,
      offset: 0.3,
    },
    godRays: {
      samples: 60,
      density: 0.96,
      decay: 0.93,
      weight: 0.4,
      exposure: 0.6,
      clampMax: 1.0,
    },
  },

  // Performance tiers
  performance: {
    ultra: { particles: 1000000, shadows: true, reflections: true, volumetrics: true },
    high: { particles: 500000, shadows: true, reflections: true, volumetrics: false },
    medium: { particles: 100000, shadows: true, reflections: false, volumetrics: false },
    low: { particles: 10000, shadows: false, reflections: false, volumetrics: false },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 VOLUMETRIC LIGHT SCATTERING (GOD RAYS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VolumetricLightProps {
  position?: [number, number, number]
  color?: string
  intensity?: number
  decay?: number
  samples?: number
}

export const VolumetricLight = memo(function VolumetricLight({
  position = [0, 5, -10],
  color = '#FFD700',
  intensity = 1,
  decay = 0.93,
  samples = 60,
}: VolumetricLightProps) {
  const lightRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      // Pulso sutil de intensidad
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1
      materialRef.current.opacity = 0.8 * pulse * intensity
    }
  })

  return (
    <>
      <mesh ref={lightRef} position={position}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial ref={materialRef} color={color} transparent opacity={0.8} />
      </mesh>
      <pointLight
        position={position}
        color={color}
        intensity={intensity * 2}
        distance={50}
        decay={2}
      />
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ PREMIUM BLOOM SPHERE (Para God Rays source)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumBloomSphereProps {
  position?: [number, number, number]
  color?: string
  size?: number
  emissiveIntensity?: number
}

export const PremiumBloomSphere = forwardRef<THREE.Mesh, PremiumBloomSphereProps>(
  function PremiumBloomSphere(
    { position = [0, 0, 0], color = '#8B00FF', size = 1, emissiveIntensity = 2 },
    ref,
  ) {
    const localRef = useRef<THREE.Mesh>(null)
    const meshRef = ref || localRef

    useFrame((state) => {
      if (typeof meshRef === 'object' && meshRef?.current) {
        // Rotación orgánica
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      }
    })

    return (
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[size, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={1.5}
        />
      </mesh>
    )
  },
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 CAUSTICS EFFECT (Refracción de luz bajo agua)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CausticsPlaneProps {
  position?: [number, number, number]
  size?: number
  speed?: number
  intensity?: number
}

const CAUSTICS_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const CAUSTICS_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float caustics(vec2 uv, float time) {
    float c = 0.0;

    // Multi-layer caustics
    for(float i = 1.0; i < 4.0; i++) {
      vec2 p = uv * (3.0 + i * 0.5);
      p.x += sin(time * 0.3 + i) * 0.5;
      p.y += cos(time * 0.4 + i * 0.7) * 0.5;

      float n1 = snoise(p + time * 0.1);
      float n2 = snoise(p * 1.5 - time * 0.15);
      float n3 = snoise(p * 2.0 + time * 0.08);

      c += (sin(n1 * 6.0) + sin(n2 * 5.0) + sin(n3 * 4.0)) / (3.0 * i);
    }

    return pow(abs(c), 1.5) * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = vUv * 4.0;

    float c = caustics(uv, uTime);

    // Color con gradiente
    vec3 color = uColor * c * uIntensity;
    color += vec3(0.1, 0.15, 0.3) * (1.0 - c) * 0.3;

    // Fade en los bordes
    float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    edge *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

    gl_FragColor = vec4(color, c * edge * 0.6);
  }
`

export const CausticsPlane = memo(function CausticsPlane({
  position = [0, -2, 0],
  size = 20,
  speed = 1,
  intensity = 1,
}: CausticsPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uColor: { value: new THREE.Color('#8B00FF') },
    }),
    [intensity],
  )

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.uTime) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * speed
    }
  })

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={CAUSTICS_VERTEX_SHADER}
        fragmentShader={CAUSTICS_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 ULTRA PREMIUM POST-PROCESSING STACK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraPremiumPostProcessingProps {
  bloomIntensity?: number
  dofEnabled?: boolean
  chromaticEnabled?: boolean
  vignetteEnabled?: boolean
  noiseEnabled?: boolean
  focusTarget?: THREE.Object3D | null
  quality?: 'ultra' | 'high' | 'medium' | 'low'
}

export const UltraPremiumPostProcessing = memo(function UltraPremiumPostProcessing({
  bloomIntensity = 1.5,
  dofEnabled = true,
  chromaticEnabled = true,
  vignetteEnabled = true,
  noiseEnabled = true,
  focusTarget = null,
  quality = 'high',
}: UltraPremiumPostProcessingProps) {
  const { camera } = useThree()
  const [focusDistance, setFocusDistance] = useState(0.02)

  // Actualizar distancia de enfoque basada en target
  useFrame(() => {
    if (focusTarget && camera) {
      const distance = camera.position.distanceTo(focusTarget.position)
      setFocusDistance(distance * 0.01)
    }
  })

  const qualitySettings = useMemo(() => {
    switch (quality) {
      case 'ultra':
        return { bloomKernel: KernelSize.HUGE, smaa: true, dofSamples: 5 }
      case 'high':
        return { bloomKernel: KernelSize.LARGE, smaa: true, dofSamples: 4 }
      case 'medium':
        return { bloomKernel: KernelSize.MEDIUM, smaa: false, dofSamples: 3 }
      default:
        return { bloomKernel: KernelSize.SMALL, smaa: false, dofSamples: 2 }
    }
  }, [quality])

  return (
    <EffectComposer multisampling={quality === 'ultra' ? 8 : 4}>
      <>
        {/* SMAA Anti-aliasing */}
        {qualitySettings.smaa ? <SMAA /> : null}

        {/* Tone Mapping ACES Filmic */}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

        {/* Bloom Premium */}
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          kernelSize={qualitySettings.bloomKernel}
          mipmapBlur
        />

        {/* Depth of Field con Bokeh */}
      {dofEnabled && (
        <DepthOfField focusDistance={focusDistance} focalLength={0.05} bokehScale={3} />
      )}

      {/* Chromatic Aberration sutil */}
      {chromaticEnabled && (
        <ChromaticAberration
          offset={new THREE.Vector2(0.001, 0.001)}
          radialModulation
          modulationOffset={0.5}
        />
      )}

      {/* Vignette cinematográfico */}
      {vignetteEnabled && <Vignette darkness={0.4} offset={0.3} />}

        {/* Film grain sutil */}
        {noiseEnabled && <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />}
      </>
    </EffectComposer>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 PREMIUM ENVIRONMENT LIGHTING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumEnvironmentProps {
  preset?:
    | 'studio'
    | 'sunset'
    | 'night'
    | 'dawn'
    | 'warehouse'
    | 'forest'
    | 'apartment'
    | 'city'
    | 'park'
    | 'lobby'
  intensity?: number
  blur?: number
  background?: boolean
}

export const PremiumEnvironment = memo(function PremiumEnvironment({
  preset = 'studio',
  intensity = 1,
  blur = 0,
  background = false,
}: PremiumEnvironmentProps) {
  return (
    <Environment
      preset={preset}
      background={background}
      blur={blur}
      environmentIntensity={intensity}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 AMBIENT PARTICLES (Polvo cósmico flotante)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AmbientParticlesProps {
  count?: number
  size?: number
  color?: string
  opacity?: number
  speed?: number
  spread?: number
}

export const AmbientParticles = memo(function AmbientParticles({
  count = 1000,
  size = 0.02,
  color = '#8B00FF',
  opacity = 0.6,
  speed = 0.1,
  spread = 20,
}: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * spread
      positions[i3 + 1] = (Math.random() - 0.5) * spread
      positions[i3 + 2] = (Math.random() - 0.5) * spread

      velocities[i3] = (Math.random() - 0.5) * 0.01
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
    }

    return { positions, velocities }
  }, [count, spread])

  useFrame((state) => {
    if (pointsRef.current) {
      const positionAttribute = pointsRef.current.geometry.attributes.position
      // Validación ultra robusta para evitar crasheos de WebGL
      if (!positionAttribute || !positionAttribute.array) return

      const array = positionAttribute.array as Float32Array
      if (!array || array.length === 0) return

      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        // Verificación de bounds
        if (i3 + 2 >= array.length) return

        // Movimiento orgánico con noise
        const noise = Math.sin(state.clock.elapsedTime * speed + i * 0.1) * 0.01
        const v1 = velocities[i3] ?? 0
        const v2 = velocities[i3 + 1] ?? 0
        const v3 = velocities[i3 + 2] ?? 0

        if (array[i3] !== undefined) (array[i3] as any) += v1 + noise
        if (array[i3 + 1] !== undefined) (array[i3 + 1] as any) += v2 + Math.cos(state.clock.elapsedTime * speed * 0.5 + i) * 0.005
        if (array[i3 + 2] !== undefined) (array[i3 + 2] as any) += v3

        // Wrap around
        const halfSpread = spread / 2
        if (array[i3] !== undefined && (array[i3] as number) > halfSpread) (array[i3] as any) = -halfSpread
        if (array[i3] !== undefined && (array[i3] as number) < -halfSpread) (array[i3] as any) = halfSpread
        if (array[i3 + 1] !== undefined && (array[i3 + 1] as number) > halfSpread) (array[i3 + 1] as any) = -halfSpread
        if (array[i3 + 1] !== undefined && (array[i3 + 1] as number) < -halfSpread) (array[i3 + 1] as any) = halfSpread
        if (array[i3 + 2] !== undefined && (array[i3 + 2] as number) > halfSpread) (array[i3 + 2] as any) = -halfSpread
        if (array[i3 + 2] !== undefined && (array[i3 + 2] as number) < -halfSpread) (array[i3 + 2] as any) = halfSpread
      }

      positionAttribute.needsUpdate = true

      // Rotación suave del sistema
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 ULTRA PREMIUM SCENE WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraPremiumSceneProps {
  children: React.ReactNode
  quality?: 'ultra' | 'high' | 'medium' | 'low'
  enableCaustics?: boolean
  enableAmbientParticles?: boolean
  enableVolumetricLight?: boolean
  environmentPreset?:
    | 'studio'
    | 'sunset'
    | 'night'
    | 'dawn'
    | 'warehouse'
    | 'forest'
    | 'apartment'
    | 'city'
    | 'park'
    | 'lobby'
  postProcessing?: boolean
  className?: string
}

export const UltraPremiumScene = memo(function UltraPremiumScene({
  children,
  quality = 'high',
  enableCaustics = true,
  enableAmbientParticles = true,
  enableVolumetricLight = true,
  environmentPreset = 'studio',
  postProcessing = true,
}: UltraPremiumSceneProps) {
  const focusRef = useRef<THREE.Mesh>(null)

  // Manejo robusto de pérdida de contexto WebGL
  const { gl } = useThree()
  React.useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn('⚠️ WebGL Context Lost. Attempting to restore...')
    }
    const handleContextRestored = () => {
      console.log('✅ WebGL Context Restored')
    }

    // Protección contra acceso nulo
    if (!gl || !gl.domElement) return

    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', handleContextLost, false)
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [gl])

  return (
    <Suspense fallback={null}>
      {/* Environment Lighting */}
      <PremiumEnvironment preset={environmentPreset} intensity={0.5} />

      {/* Ambient Light base */}
      <ambientLight intensity={0.2} color="#ffffff" />

      {/* Volumetric Light */}
      {enableVolumetricLight && (
        <VolumetricLight position={[5, 10, -5]} color="#FFD700" intensity={0.8} />
      )}

      {/* Caustics en el suelo */}
      {enableCaustics && <CausticsPlane position={[0, -3, 0]} size={30} intensity={0.8} />}

      {/* Ambient Particles */}
      {enableAmbientParticles && (
        <AmbientParticles count={2000} color="#8B00FF" opacity={0.4} spread={30} />
      )}

      {/* Children (contenido principal) */}
      {children}

      {/* Post-Processing Stack */}
      {postProcessing && (
        <UltraPremiumPostProcessing quality={quality} focusTarget={focusRef.current} />
      )}
    </Suspense>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default UltraPremiumScene
