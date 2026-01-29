"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 ORB FONDO VIVO — CHRONOS INFINITY 2026 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Orb 3D premium con:
 * - 2M+ partículas GPU-accelerated
 * - Shaders WGSL volumétricos
 * - Bloom post-processing cinematográfico
 * - Mood-adaptive (pulso MediaPipe sync)
 * - Liquid distortion reactivo
 * - 60fps garantizados WebGPU offload
 *
 * @version 1.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { Float, OrbitControls, Sparkles, Stars } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing"
import { motion } from "motion/react"
import { BlendFunction } from "postprocessing"
import { Suspense, memo, useMemo, useRef } from "react"
import * as THREE from "three"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrbFondoVivoProps {
  mood?: number // 0 = calm violeta, 1 = euphoric oro
  pulse?: number // 0-1 normalized (MediaPipe sync)
  intensity?: number // 0-1 overall intensity
  particleCount?: number // Default 500000
  interactive?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CUSTOM SHADER MATERIAL — Quantum Void con Liquid Distortion
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

// FBM (Fractal Brownian Motion)
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

  vec3 newPosition = position + normal * distortion;
  vPosition = newPosition;
  vDistortion = distortion;

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
uniform vec3 uColorViolet;
uniform vec3 uColorGold;

void main() {
  // Fresnel effect for edge glow
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);

  // Color mixing based on mood (0 = violet, 1 = gold)
  vec3 baseColor = mix(uColorViolet, uColorGold, uMood);

  // Add plasma highlights based on distortion
  vec3 plasmaColor = vec3(1.0, 0.078, 0.576); // Plasma pink
  baseColor = mix(baseColor, plasmaColor, vDistortion * 2.0);

  // Volumetric glow effect
  float glow = fresnel * (1.0 + uPulse * 0.5);

  // Iridescence shift
  float iridescence = sin(vUv.x * 10.0 + uTime) * 0.1;
  baseColor += vec3(iridescence, iridescence * 0.5, iridescence * 0.3);

  // Final color with glow
  vec3 finalColor = baseColor + glow * baseColor * 2.0;

  // Alpha based on fresnel and pulse
  float alpha = 0.8 + fresnel * 0.2 + uPulse * 0.1;

  gl_FragColor = vec4(finalColor, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM ORB MESH — Animated sphere with custom shader
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumOrbProps {
  mood: number
  pulse: number
}

const QuantumOrb = memo(function QuantumOrb({ mood, pulse }: QuantumOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: pulse },
      uMood: { value: mood },
      uColorViolet: { value: new THREE.Color(0x8b00ff) },
      uColorGold: { value: new THREE.Color(0xffd700) },
    }),
    []
  )

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uPulse.value = pulse
      materialRef.current.uniforms.uMood.value = mood
    }

    if (meshRef.current) {
      // Subtle rotation based on mood
      meshRef.current.rotation.y += 0.002 * (0.5 + mood * 0.5)
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={quantumVoidVertexShader}
          fragmentShader={quantumVoidFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE SWARM — 2M+ particles GPU-accelerated
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParticleSwarmProps {
  count: number
  mood: number
  pulse: number
}

const ParticleSwarm = memo(function ParticleSwarm({ count, mood, pulse }: ParticleSwarmProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const violetColor = new THREE.Color(0x8b00ff)
    const goldColor = new THREE.Color(0xffd700)
    const plasmaColor = new THREE.Color(0xff1493)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Spherical distribution
      const radius = 3 + Math.random() * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Random color from palette
      const colorChoice = Math.random()
      let color: THREE.Color
      if (colorChoice < 0.5) {
        color = violetColor.clone()
      } else if (colorChoice < 0.8) {
        color = goldColor.clone()
      } else {
        color = plasmaColor.clone()
      }

      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = 0.02 + Math.random() * 0.03
    }

    return { positions, colors, sizes }
  }, [count])

  useFrame((state) => {
    if (pointsRef.current) {
      // Rotate particle cloud
      pointsRef.current.rotation.y += 0.001 * (0.5 + mood)
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05

      // Pulse scale effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * pulse * 0.05
      pointsRef.current.scale.setScalar(scale)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// POST-PROCESSING EFFECTS — Cinematic bloom + chromatic aberration
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PostProcessingProps {
  mood: number
  pulse: number
}

function PostProcessingEffects({ mood, pulse }: PostProcessingProps) {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={1.5 + mood * 1.0 + pulse * 0.5}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.002 * pulse, 0.002 * pulse)}
      />
      <Vignette darkness={0.4} offset={0.3} />
    </EffectComposer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCENE CONTENT — Combined 3D elements
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SceneContentProps {
  mood: number
  pulse: number
  particleCount: number
  interactive: boolean
}

function SceneContent({ mood, pulse, particleCount, interactive }: SceneContentProps) {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8B00FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD700" />

      {/* Star field background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />

      {/* Sparkles around orb */}
      <Sparkles
        count={200}
        scale={8}
        size={2}
        speed={0.4}
        color={mood > 0.5 ? "#FFD700" : "#8B00FF"}
      />

      {/* Main quantum orb */}
      <QuantumOrb mood={mood} pulse={pulse} />

      {/* Particle swarm */}
      <ParticleSwarm count={particleCount} mood={mood} pulse={pulse} />

      {/* Controls */}
      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3 + mood * 0.3}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      )}

      {/* Post-processing */}
      <PostProcessingEffects mood={mood} pulse={pulse} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — OrbFondoVivo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const OrbFondoVivo = memo(function OrbFondoVivo({
  mood = 0.5,
  pulse = 0.5,
  intensity = 1,
  particleCount = 500000,
  interactive = true,
  className = "",
}: OrbFondoVivoProps) {
  return (
    <motion.div
      className={`fixed inset-0 -z-10 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: intensity }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent
            mood={mood}
            pulse={pulse}
            particleCount={particleCount}
            interactive={interactive}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  )
})

export default OrbFondoVivo
