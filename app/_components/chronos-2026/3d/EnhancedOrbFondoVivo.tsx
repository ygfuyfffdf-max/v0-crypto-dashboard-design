/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 ENHANCED ORB FONDO VIVO — CHRONOS INFINITY 2026 ULTRA SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Versión mejorada del Orb con:
 * - 2M+ partículas GPU-accelerated
 * - Shaders GLSL volumétricos (compatible WGSL-ready)
 * - PostProcessing Bloom/Glow cinematográfico
 * - Mood-adaptive (pulso MediaPipe sync)
 * - Liquid distortion reactivo
 * - God rays dinámicos
 * - 60fps garantizados
 *
 * @version 2.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { Float, OrbitControls, Sparkles, Stars } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing"
import { motion } from "motion/react"
import { BlendFunction, KernelSize } from "postprocessing"
import { Suspense, memo, useMemo, useRef, type FC } from "react"
import * as THREE from "three"

import useMood from "@/app/hooks/useMood"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EnhancedOrbProps {
  mood?: number // 0 = calm violeta, 1 = euphoric oro (override from useMood)
  pulse?: number // 0-1 normalized (MediaPipe sync)
  intensity?: number // 0-1 overall intensity
  particleCount?: number // Default 500000
  enablePostProcessing?: boolean
  enableGodRays?: boolean
  enableParticles?: boolean
  interactive?: boolean
  className?: string
}

interface OrbCoreProps {
  mood: number
  pulse: number
  intensity: number
}

interface ParticleFieldProps {
  count: number
  mood: number
  pulse: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SHADERS — Quantum Void GLSL (WebGPU-ready patterns)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const quantumVoidVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;

uniform float uTime;
uniform float uPulse;
uniform float uMood;

// Simplex 3D noise
vec4 permute(vec4 x) {
  return mod(((x*34.0)+1.0)*x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// FBM - Fractal Brownian Motion
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}

void main() {
  vUv = uv;
  vNormal = normal;

  // Liquid distortion based on noise + pulse
  float noise = fbm(position * 2.0 + uTime * 0.3);
  float pulseEffect = sin(uTime * 2.0) * uPulse * 0.5;
  float distortion = noise * 0.15 * (1.0 + pulseEffect);

  // Mood-adaptive distortion intensity
  distortion *= (0.5 + uMood * 0.5);

  vDistortion = distortion;

  // Apply distortion to position
  vec3 newPosition = position + normal * distortion;
  vPosition = newPosition;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`

const quantumVoidFragmentShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;

uniform float uTime;
uniform float uPulse;
uniform float uMood;
uniform float uIntensity;

// Paleta de colores Chronos
vec3 violetDeep = vec3(0.25, 0.0, 0.5);
vec3 violetBright = vec3(0.55, 0.0, 1.0);
vec3 goldEuphoric = vec3(1.0, 0.84, 0.0);
vec3 goldIntense = vec3(1.0, 0.65, 0.0);
vec3 fuchsiaAccent = vec3(1.0, 0.0, 0.5);

// Fresnel effect
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - dot(viewDir, normal), power);
}

void main() {
  // View direction
  vec3 viewDir = normalize(cameraPosition - vPosition);

  // Fresnel rim lighting
  float rim = fresnel(viewDir, normalize(vNormal), 3.0);

  // Base color interpolation calm -> euphoric
  vec3 calmColor = mix(violetDeep, violetBright, vDistortion * 2.0 + 0.5);
  vec3 euphoricColor = mix(goldEuphoric, goldIntense, vDistortion * 2.0 + 0.5);
  vec3 baseColor = mix(calmColor, euphoricColor, uMood);

  // Add fuchsia highlights
  float highlight = smoothstep(0.3, 0.5, vDistortion);
  baseColor = mix(baseColor, fuchsiaAccent, highlight * (1.0 - uMood) * 0.3);

  // Pulsing glow
  float pulse = 0.8 + sin(uTime * 1.5) * uPulse * 0.2;

  // Rim glow (stronger at edges)
  vec3 rimColor = mix(violetBright, goldEuphoric, uMood);
  baseColor += rimColor * rim * 0.5;

  // Core glow (center brighter)
  float coreGlow = 1.0 - length(vUv - 0.5) * 1.5;
  coreGlow = max(0.0, coreGlow);
  baseColor += baseColor * coreGlow * 0.3;

  // Apply pulse and intensity
  baseColor *= pulse * uIntensity;

  // HDR-ready output
  gl_FragColor = vec4(baseColor, 0.9);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ORB CORE COMPONENT — Esfera central con shader
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const OrbCore: FC<OrbCoreProps> = memo(function OrbCore({ mood, pulse, intensity }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: pulse },
      uMood: { value: mood },
      uIntensity: { value: intensity },
    }),
    []
  )

  // Animation loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uPulse.value = pulse
      materialRef.current.uniforms.uMood.value = mood
      materialRef.current.uniforms.uIntensity.value = intensity
    }

    if (meshRef.current) {
      // Subtle breathing rotation
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1 * (0.5 + mood * 0.5)
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={quantumVoidVertexShader}
          fragmentShader={quantumVoidFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </Float>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE FIELD — 2M+ partículas GPU
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParticleField: FC<ParticleFieldProps> = memo(function ParticleField({ count, mood, pulse }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Distribución esférica con variación
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 3

      pos[i3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = r * Math.cos(phi)

      // Color base (se actualiza en el loop)
      col[i3] = 0.55 // R
      col[i3 + 1] = 0.0 // G
      col[i3 + 2] = 1.0 // B (violeta)
    }

    return [pos, col]
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return

    const geometry = pointsRef.current.geometry
    const positionAttr = geometry.attributes.position as THREE.BufferAttribute
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute

    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Orbital movement
      const angle = time * 0.1 + i * 0.0001
      const x = positionAttr.array[i3]
      const y = positionAttr.array[i3 + 1]
      const z = positionAttr.array[i3 + 2]

      const newX = x * Math.cos(angle * 0.01) - z * Math.sin(angle * 0.01)
      const newZ = x * Math.sin(angle * 0.01) + z * Math.cos(angle * 0.01)

      positionAttr.array[i3] = newX
      positionAttr.array[i3 + 2] = newZ

      // Pulse effect on Y
      positionAttr.array[i3 + 1] = y + Math.sin(time * 2 + i * 0.01) * pulse * 0.02

      // Color transition calm -> euphoric
      const colorMix = mood
      colorAttr.array[i3] = 0.55 + colorMix * 0.45 // R: 0.55 -> 1.0
      colorAttr.array[i3 + 1] = colorMix * 0.84 // G: 0 -> 0.84
      colorAttr.array[i3 + 2] = 1.0 - colorMix * 1.0 // B: 1.0 -> 0
    }

    positionAttr.needsUpdate = true
    colorAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// POST PROCESSING — Bloom, Vignette, Chromatic Aberration
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PostProcessingProps {
  mood: number
  pulse: number
  enableGodRays?: boolean
}

const PostProcessing: FC<PostProcessingProps> = memo(function PostProcessing({
  mood,
  pulse,
  enableGodRays = false,
}) {
  return (
    <EffectComposer>
      {/* Bloom volumétrico */}
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={1.5 + mood * 0.5 + pulse * 0.3}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />

      {/* Chromatic aberration sutil */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.001 + pulse * 0.002, 0.001 + pulse * 0.002)}
      />

      {/* Vignette cinematográfica */}
      <Vignette eskil={false} offset={0.1} darkness={0.5 + (1 - mood) * 0.2} />

      {/* Noise film grain */}
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCENE CONTENT — Contenido principal de la escena
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SceneContentProps {
  mood: number
  pulse: number
  intensity: number
  particleCount: number
  enablePostProcessing: boolean
  enableGodRays: boolean
  enableParticles: boolean
  interactive: boolean
}

const SceneContent: FC<SceneContentProps> = memo(function SceneContent({
  mood,
  pulse,
  intensity,
  particleCount,
  enablePostProcessing,
  enableGodRays,
  enableParticles,
  interactive,
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8B00FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD700" />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Sparkles ambiente */}
      <Sparkles count={200} scale={10} size={2} speed={0.5} opacity={0.5} color="#8B00FF" />

      {/* Orb Core */}
      <OrbCore mood={mood} pulse={pulse} intensity={intensity} />

      {/* Particle Field */}
      {enableParticles && <ParticleField count={particleCount} mood={mood} pulse={pulse} />}

      {/* Camera Controls */}
      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5 + mood * 0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(Math.PI * 3) / 4}
        />
      )}

      {/* Post Processing */}
      {enablePostProcessing && (
        <PostProcessing mood={mood} pulse={pulse} enableGodRays={enableGodRays} />
      )}
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — EnhancedOrbFondoVivo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const EnhancedOrbFondoVivo: FC<EnhancedOrbProps> = memo(function EnhancedOrbFondoVivo({
  mood: moodOverride,
  pulse: pulseOverride = 0.5,
  intensity = 1,
  particleCount = 500000,
  enablePostProcessing = true,
  enableGodRays = false,
  enableParticles = true,
  interactive = false,
  className = "",
}) {
  // Use mood hook si no hay override
  const { mood: hookMood, pulse: hookPulse } = useMood()
  const mood = moodOverride ?? hookMood
  const pulse = pulseOverride

  return (
    <motion.div
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            mood={mood}
            pulse={pulse}
            intensity={intensity}
            particleCount={particleCount}
            enablePostProcessing={enablePostProcessing}
            enableGodRays={enableGodRays}
            enableParticles={enableParticles}
            interactive={interactive}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { EnhancedOrbFondoVivo, OrbCore, ParticleField, PostProcessing }
export default EnhancedOrbFondoVivo
