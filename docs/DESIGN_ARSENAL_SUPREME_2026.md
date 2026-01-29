# 🎨 ARSENAL SUPREMO DE DISEÑO MULTIMEDIA 2026

> **Guía definitiva para explotar al máximo las capacidades de diseño 2D/3D, animaciones
> cinematográficas, efectos visuales ultra-avanzados, física real y experiencias interactivas
> premium con IA generativa.**

---

## 📋 ÍNDICE

1. [Stack Tecnológico Actual](#-stack-tecnológico-actual)
2. [Three.js & WebGPU Avanzado](#-threejs--webgpu-avanzado)
3. [React Three Fiber (R3F) Premium](#-react-three-fiber-r3f-premium)
4. [Animaciones Cinematográficas](#-animaciones-cinematográficas)
5. [Física Real & Simulaciones](#-física-real--simulaciones)
6. [Partículas 3D Avanzadas](#-partículas-3d-avanzadas)
7. [Shaders & TSL (Three Shader Language)](#-shaders--tsl)
8. [Post-Processing Cinematográfico](#-post-processing-cinematográfico)
9. [Hover & Scroll Effects Premium](#-hover--scroll-effects-premium)
10. [IA Generativa para Diseño](#-ia-generativa-para-diseño)
11. [Extensiones VS Code Especializadas](#-extensiones-vs-code-especializadas)
12. [MCP Servers Optimizados](#-mcp-servers-optimizados)
13. [Recursos & Referencias](#-recursos--referencias)

---

## 🚀 Stack Tecnológico Actual

### Librerías Core Instaladas

```json
{
  "@react-three/drei": "latest",
  "@react-three/fiber": "latest",
  "@react-three/postprocessing": "2.16.3",
  "@splinetool/react-spline": "^4.1.0",
  "@splinetool/runtime": "^1.12.0",
  "framer-motion": "latest",
  "gsap": "^3.14.2",
  "lenis": "^1.3.15",
  "postprocessing": "^6.35.0",
  "three": "^0.160.0",
  "three-stdlib": "^2.34.0"
}
```

### Capacidades Disponibles

- ✅ **Three.js** - Motor 3D base
- ✅ **React Three Fiber** - Renderer React para Three.js
- ✅ **Drei** - Helpers y utilidades R3F
- ✅ **PostProcessing** - Efectos cinematográficos
- ✅ **Spline** - Diseño 3D interactivo
- ✅ **Framer Motion** - Animaciones React
- ✅ **GSAP** - Animaciones profesionales
- ✅ **Lenis** - Smooth scroll premium

---

## 🎮 Three.js & WebGPU Avanzado

### WebGPU Renderer (2026 Production-Ready)

```typescript
// Configuración WebGPU moderna (desde Three.js r171+)
import { WebGPURenderer } from "three/webgpu"

const renderer = new WebGPURenderer({
  antialias: false, // Manejado por post-processing
  powerPreference: "high-performance",
})

// CRÍTICO: Init async obligatorio
await renderer.init()

function animate() {
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()
```

### Compatibilidad de Navegadores (2026)

| Navegador   | Soporte WebGPU                            |
| ----------- | ----------------------------------------- |
| Chrome/Edge | ✅ Desde v113 (2023)                      |
| Firefox     | ✅ Desde v141 (Windows), v145 (macOS ARM) |
| Safari      | ✅ Desde v26 (Sept 2025)                  |

### TSL (Three Shader Language) - El Futuro

```typescript
// TSL compila a WGSL (WebGPU) o GLSL (WebGL) automáticamente
import { color, positionLocal, sin, time, mx_noise_float } from "three/tsl"
import { MeshStandardNodeMaterial } from "three/webgpu"

const material = new MeshStandardNodeMaterial()

// Color dinámico basado en tiempo
material.colorNode = color(1, 0, 0).mul(sin(time).mul(0.5).add(0.5))

// Displacement procedural con ruido
const noise = mx_noise_float(positionLocal.mul(2.0))
material.positionNode = positionLocal.add(normalLocal.mul(noise.mul(0.1)))
```

### Compute Shaders para Millones de Partículas

```typescript
import { compute, instancedArray, storage, uniform } from "three/tsl"

const particleCount = 1000000 // 1 millón de partículas
const positions = instancedArray(particleCount, "vec3")
const velocities = instancedArray(particleCount, "vec3")

const physicsCompute = compute(() => {
  const pos = positions.element(instanceIndex)
  const vel = velocities.element(instanceIndex)

  // Física GPU: gravedad, viento, colisiones
  const gravity = vec3(0, -9.8, 0).mul(deltaTime)
  const newVel = vel.add(gravity)
  const newPos = pos.add(newVel.mul(deltaTime))

  positions.element(instanceIndex).assign(newPos)
  velocities.element(instanceIndex).assign(newVel)
})

// Ejecutar en GPU
renderer.compute(physicsCompute)
```

---

## ⚛️ React Three Fiber (R3F) Premium

### Configuración Optimizada

```tsx
import { Canvas } from "@react-three/fiber"
import { Preload, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei"

function App() {
  return (
    <Canvas
      dpr={[1, 2]} // Adaptive DPR
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false, // Manejado por post-processing
      }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      frameloop="demand" // Render on-demand para batería
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <Preload all />
      <Scene />
    </Canvas>
  )
}
```

### Performance Monitor Avanzado

```tsx
import { PerformanceMonitor } from "@react-three/drei"
import { Perf } from "r3f-perf"

function Scene() {
  const [dpr, setDpr] = useState(1.5)
  const [degraded, setDegraded] = useState(false)

  return (
    <>
      <PerformanceMonitor
        bounds={() => [30, 60]} // FPS objetivo
        flipflops={3}
        onDecline={() => setDpr(Math.max(1, dpr * 0.8))}
        onIncline={() => setDpr(Math.min(2, dpr * 1.1))}
        onFallback={() => setDegraded(true)}
      />
      {process.env.NODE_ENV === "development" && <Perf position="top-left" />}
    </>
  )
}
```

### InstancedMesh para Performance Extrema

```tsx
import { Instances, Instance, useGLTF } from "@react-three/drei"
import { useMemo, useRef } from "react"

function Trees({ count = 10000 }) {
  const { nodes } = useGLTF("/tree-low.glb")

  const positions = useMemo(() => {
    return Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 100,
      0,
      (Math.random() - 0.5) * 100,
    ])
  }, [count])

  return (
    <Instances limit={count} geometry={nodes.tree.geometry}>
      <meshStandardMaterial />
      {positions.map((pos, i) => (
        <Instance key={i} position={pos} rotation={[0, Math.random() * Math.PI * 2, 0]} />
      ))}
    </Instances>
  )
}
```

---

## 🎬 Animaciones Cinematográficas

### GSAP + React Integration

```tsx
import gsap from "gsap"
import { ScrollTrigger, SplitText, DrawSVGPlugin } from "gsap/all"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin)

function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      // Secuencia cinematográfica
      tl.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      })
        .from(
          ".hero-subtitle",
          {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .to(".camera-zoom", {
          scale: 1.5,
          duration: 2,
          ease: "power2.inOut",
        })
    },
    { scope: containerRef }
  )

  return <div ref={containerRef}>...</div>
}
```

### Framer Motion Avanzado

```tsx
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

function ParallaxSection() {
  const { scrollYProgress } = useScroll()

  // Transforms con física spring
  const y = useTransform(scrollYProgress, [0, 1], [0, -500])
  const ySpring = useSpring(y, { stiffness: 100, damping: 30 })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 1, 0.5, 0])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])

  return (
    <motion.div
      style={{ y: ySpring, scale, opacity, rotate }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease: [0.6, 0.01, 0.05, 0.95], // Bezier cinematográfico
        }}
      >
        Experiencia Premium
      </motion.h1>
    </motion.div>
  )
}
```

### Lenis Smooth Scroll Cinematográfico

```tsx
import Lenis from "lenis"
import { useEffect } from "react"

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo.out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Integración con GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
    }
  }, [])
}
```

---

## 🔬 Física Real & Simulaciones

### Rapier Physics (GPU-Ready)

```tsx
import { Physics, RigidBody, BallCollider, CuboidCollider } from "@react-three/rapier"

function PhysicsScene() {
  return (
    <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} interpolate={true}>
      {/* Suelo */}
      <RigidBody type="fixed">
        <CuboidCollider args={[50, 0.1, 50]} />
        <mesh receiveShadow>
          <boxGeometry args={[100, 0.2, 100]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      </RigidBody>

      {/* Esferas dinámicas */}
      {Array.from({ length: 100 }).map((_, i) => (
        <RigidBody
          key={i}
          position={[
            (Math.random() - 0.5) * 10,
            Math.random() * 20 + 5,
            (Math.random() - 0.5) * 10,
          ]}
          restitution={0.7}
          friction={0.5}
        >
          <BallCollider args={[0.5]} />
          <mesh castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </RigidBody>
      ))}
    </Physics>
  )
}
```

### Simulación de Fluidos (WebGPU)

```typescript
// Simulación de fluidos con compute shaders TSL
import { compute, storageTexture, textureStore, uvec2, vec4 } from "three/tsl"

const resolution = 512
const velocityField = storageTexture(resolution, resolution)
const pressureField = storageTexture(resolution, resolution)
const dyeField = storageTexture(resolution, resolution)

// Advección de fluido
const advectionCompute = compute(() => {
  const uv = uvec2(instanceIndex.mod(resolution), instanceIndex.div(resolution))
  const vel = textureLoad(velocityField, uv)
  const prevPos = uv.sub(vel.xy.mul(deltaTime))
  const advectedVel = textureSample(velocityField, prevPos.div(resolution))
  textureStore(velocityField, uv, advectedVel)
})

// Difusión viscosa
const diffusionCompute = compute(() => {
  // Implementación Jacobi iterativa
  const uv = uvec2(instanceIndex.mod(resolution), instanceIndex.div(resolution))
  const center = textureLoad(velocityField, uv)
  const left = textureLoad(velocityField, uv.sub(uvec2(1, 0)))
  const right = textureLoad(velocityField, uv.add(uvec2(1, 0)))
  const up = textureLoad(velocityField, uv.sub(uvec2(0, 1)))
  const down = textureLoad(velocityField, uv.add(uvec2(0, 1)))

  const viscosity = 0.1
  const diffused = center.add(left.add(right).add(up).add(down).mul(viscosity))
  textureStore(velocityField, uv, diffused.div(1 + 4 * viscosity))
})
```

---

## ✨ Partículas 3D Avanzadas

### Sistema de Partículas GPU (1M+)

```tsx
import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

function GalaxyParticles({ count = 100000 }) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Distribución espiral galáctica
      const radius = Math.random() * 10
      const spinAngle = radius * 5
      const branchAngle = ((i % 3) / 3) * Math.PI * 2

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
      positions[i3 + 1] = randomY
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

      // Color gradiente centro-exterior
      const mixedColor = new THREE.Color()
      const insideColor = new THREE.Color("#ff6030")
      const outsideColor = new THREE.Color("#1b3984")
      mixedColor.lerpColors(insideColor, outsideColor, radius / 10)

      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b

      sizes[i] = Math.random() * 2
    }

    return { positions, colors, sizes }
  }, [count])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
    }
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
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={galaxyVertexShader}
        fragmentShader={galaxyFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  )
}

const galaxyVertexShader = `
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const galaxyFragmentShader = `
  varying vec3 vColor;

  void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    vec3 finalColor = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(finalColor, strength);
  }
`
```

---

## 🎭 Shaders & TSL

### Custom Shaders con TSL (Recomendado)

```typescript
import {
  Fn,
  float,
  vec3,
  positionLocal,
  normalLocal,
  time,
  mx_noise_float,
  mx_fractal_noise_float,
} from "three/tsl"
import { MeshStandardNodeMaterial } from "three/webgpu"

// Función reutilizable: Fresnel
const fresnel = Fn(([normal, viewDir, power]) => {
  const dotNV = normal.dot(viewDir).saturate()
  return float(1).sub(dotNV).pow(power)
})

// Función reutilizable: Glow pulsante
const pulsingGlow = Fn(([baseColor, glowColor, speed, intensity]) => {
  const pulse = sin(time.mul(speed)).mul(0.5).add(0.5)
  return baseColor.add(glowColor.mul(pulse).mul(intensity))
})

// Material holográfico avanzado
const holographicMaterial = new MeshStandardNodeMaterial()

// Desplazamiento procedural
const displacement = mx_fractal_noise_float(positionLocal.mul(3.0), 4, 2.0, 0.5)
holographicMaterial.positionNode = positionLocal.add(normalLocal.mul(displacement.mul(0.1)))

// Color iridiscente basado en fresnel y tiempo
const fresnelValue = fresnel(normalWorld, viewDirection, float(2.0))
const rainbowColor = vec3(
  sin(time.add(fresnelValue.mul(6.28)))
    .mul(0.5)
    .add(0.5),
  sin(time.add(fresnelValue.mul(6.28)).add(2.09))
    .mul(0.5)
    .add(0.5),
  sin(time.add(fresnelValue.mul(6.28)).add(4.19))
    .mul(0.5)
    .add(0.5)
)

holographicMaterial.colorNode = pulsingGlow(rainbowColor, vec3(1, 1, 1), float(2.0), float(0.3))
holographicMaterial.emissiveNode = rainbowColor.mul(fresnelValue).mul(0.5)
holographicMaterial.roughnessNode = float(0.1)
holographicMaterial.metalnessNode = float(0.9)
```

### Shaders GLSL Clásicos (Compatibilidad)

```glsl
// vertex.glsl
uniform float uTime;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  vec3 pos = position;

  // Onda 3D compleja
  float elevation = sin(pos.x * uWaveFrequency + uTime) *
                    sin(pos.z * uWaveFrequency + uTime) *
                    uWaveAmplitude;

  pos.y += elevation;
  vElevation = elevation;
  vPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// fragment.glsl
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

void main() {
  // Gradiente basado en elevación
  float mixStrength = (vElevation + 0.5) * 2.0;
  vec3 color = mix(uColorA, uColorB, mixStrength);
  color = mix(color, uColorC, vElevation + 0.5);

  // Fresnel edge glow
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
  color += fresnel * 0.5;

  gl_FragColor = vec4(color, 1.0);
}
```

---

## 🌟 Post-Processing Cinematográfico

### Stack de Efectos Premium

```tsx
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  Noise,
  SMAA,
} from "@react-three/postprocessing"
import { BlendFunction, KernelSize } from "postprocessing"

function CinematicPostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      {/* Bloom selectivo */}
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.025}
        kernelSize={KernelSize.LARGE}
      />

      {/* Profundidad de campo */}
      <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={4} height={480} />

      {/* Aberración cromática sutil */}
      <ChromaticAberration offset={[0.001, 0.001]} blendFunction={BlendFunction.NORMAL} />

      {/* Viñeta cinematográfica */}
      <Vignette offset={0.5} darkness={0.5} blendFunction={BlendFunction.NORMAL} />

      {/* Ruido film-like */}
      <Noise opacity={0.02} blendFunction={BlendFunction.SOFT_LIGHT} />

      {/* Anti-aliasing final */}
      <SMAA />
    </EffectComposer>
  )
}
```

### Post-Processing WebGPU Nativo

```typescript
import { pass, bloom, fxaa, dof, vignette } from "three/tsl"
import { PostProcessing } from "three/webgpu"

const postProcessing = new PostProcessing(renderer)

const scenePass = pass(scene, camera)
const sceneDepth = scenePass.getTextureNode("depth")

// Pipeline de efectos
postProcessing.outputNode = scenePass
  .pipe(bloom({ intensity: 1.2, threshold: 0.85 }))
  .pipe(dof({ focusDistance: 5, focalLength: 50, bokehScale: 3 }))
  .pipe(vignette({ offset: 0.5, darkness: 0.4 }))
  .pipe(fxaa())
```

---

## 🖱️ Hover & Scroll Effects Premium

### Hover Effects Magnéticos

```tsx
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

function MagneticButton({ children }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, { stiffness: 300, damping: 20 })
  const ySpring = useSpring(y, { stiffness: 300, damping: 20 })

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      style={{
        x: xSpring,
        y: ySpring,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}
```

### Scroll-Triggered 3D Transformations

```tsx
import { useScroll, useTransform, motion } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"

function ScrollLinked3D() {
  const { scrollYProgress } = useScroll()

  // Transformaciones basadas en scroll
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 4])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.5, 1])
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 0, -5])

  return (
    <motion.div style={{ height: "400vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Canvas>
          <ScrollControlledMesh rotateY={rotateY} scale={scale} z={z} />
        </Canvas>
      </div>
    </motion.div>
  )
}

function ScrollControlledMesh({ rotateY, scale, z }) {
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotateY.get()
      meshRef.current.scale.setScalar(scale.get())
      meshRef.current.position.z = z.get()
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial color="hotpink" metalness={0.9} roughness={0.1} />
    </mesh>
  )
}
```

---

## 🤖 IA Generativa para Diseño

### Capacidades con GitHub Copilot

1. **Generación de Shaders**: Describe el efecto visual deseado en español
2. **Optimización de Performance**: Análisis automático de bottlenecks
3. **Creación de Animaciones**: Secuencias GSAP/Framer Motion desde descripción
4. **Diseño Procedural**: Geometrías y texturas generadas algorítmicamente

### Prompts Efectivos para Diseño 3D

```markdown
# Ejemplo de prompt para shader:

"Crea un shader TSL para un material de agua oceánica con:

- Ondas Gerstner multicapa
- Fresnel para espuma en los bordes
- Reflexiones del cielo dinámicas
- Cáusticas animadas en el fondo"

# Ejemplo para animación:

"Genera una timeline GSAP que:

- Haga aparecer elementos con stagger de 0.1s
- Use easing 'power4.out' para movimiento natural
- Incluya parallax en scroll del 50%
- Tenga efecto magnético en hover"
```

---

## 🔌 Extensiones VS Code Especializadas

### Instaladas y Recomendadas

```vscode-extensions
slevesque.shader,raczzalan.webgl-glsl-editor,dtoplak.vscode-glsllint,boyswan.glsl-literal,simonsiefke.svg-preview,tuur29.lottie-viewer
```

### Adicionales Recomendadas

```vscode-extensions
bierner.color-info,kamikillerto.vscode-colorize,bourhaouta.tailwindshades,developer2006.svg-gallery,hediet.debug-visualizer
```

---

## ⚙️ React Three Rapier — FÍSICA WASM 3D

### Cuerpos Rígidos con Colisiones

```tsx
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier"

;<Physics gravity={[0, -9.81, 0]}>
  {/* Cuerpo dinámico con eventos */}
  <RigidBody
    colliders="ball"
    restitution={0.7}
    friction={0.5}
    onCollisionEnter={({ manifold, target, other }) => {
      console.log("Colisión en:", manifold.solverContactPoint(0))
      console.log(target.rigidBodyObject.name, " colisionó con ", other.rigidBodyObject.name)
    }}
    onContactForce={(payload) => {
      console.log("Fuerza total:", payload.totalForce)
    }}
    onSleep={() => console.log("Objeto dormido")}
    onWake={() => console.log("Objeto despierto")}
  >
    <Sphere>
      <meshPhysicalMaterial color="violet" />
    </Sphere>
  </RigidBody>

  {/* Piso estático */}
  <RigidBody type="fixed">
    <CuboidCollider args={[10, 0.5, 10]} />
  </RigidBody>
</Physics>
```

### Joints (Uniones Físicas)

```tsx
// Spring Joint (resorte)
const springJoint = useSpringJoint(bodyA, bodyB, [
  [0, 0, 0], // Posición en bodyA
  [0, 0, 0], // Posición en bodyB
  0, // Rest length
  1000, // Stiffness
  100, // Damping
])

// Rope Joint (cuerda)
const ropeJoint = useRopeJoint(bodyA, bodyB, [
  [0, 0, 0],
  [0, 0, 0],
  5, // Longitud máxima
])

// Revolute Joint (bisagra/rueda)
const revoluteJoint = useRevoluteJoint(bodyA, bodyB, [
  [0, 0, 0],
  [0, 0, 0],
  [0, 1, 0], // Eje de rotación
])

// Fixed Joint (fijo)
const fixedJoint = useFixedJoint(bodyA, bodyB, [
  [0, 0, 0],
  [0, 0, 0, 1], // Posición y orientación en A
  [0, 0, 0],
  [0, 0, 0, 1], // Posición y orientación en B
])

// Motor en joint revoluto
useFrame(() => {
  revoluteJoint.current?.configureMotorVelocity(10, 2)
})
```

### Instancias con Física (1000+ objetos optimizados)

```tsx
const COUNT = 1000

const instances = useMemo(() =>
  Array.from({ length: COUNT }, (_, i) => ({
    key: `instance_${i}`,
    position: [Math.random() * 10, Math.random() * 10, Math.random() * 10],
    rotation: [Math.random(), Math.random(), Math.random()]
  })), []
)

<InstancedRigidBodies
  ref={rigidBodies}
  instances={instances}
  colliders="ball"
  colliderNodes={[
    <BoxCollider args={[0.5, 0.5, 0.5]} />,
    <SphereCollider args={[0.5]} />
  ]}
>
  <instancedMesh args={[undefined, undefined, COUNT]} count={COUNT}>
    <sphereGeometry args={[0.1]} />
    <meshStandardMaterial />
  </instancedMesh>
</InstancedRigidBodies>
```

### Grupos de Colisión

```tsx
import { interactionGroups } from '@react-three/rapier'

// Colisiona con todos los grupos
<CapsuleCollider collisionGroups={interactionGroups(12)} />

// Grupo 0, interactúa solo con grupos 0, 1, 2
<CapsuleCollider collisionGroups={interactionGroups(0, [0, 1, 2])} />

// Múltiples grupos (0 y 5), interactúa solo con grupo 7
<CapsuleCollider collisionGroups={interactionGroups([0, 5], 7)} />

// Sensor (no genera fuerzas, solo detecta intersección)
<CuboidCollider
  args={[5, 5, 1]}
  sensor
  onIntersectionEnter={() => console.log("¡Gol!")}
/>
```

---

## 🎬 Motion (Framer Motion) — SPRING PHYSICS AVANZADO

### Scroll-Linked Animations con Spring

```tsx
import { motion, useScroll, useSpring, useTransform } from "framer-motion"

function ScrollProgress() {
  const { scrollYProgress } = useScroll()

  // Spring suave para progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Transformar scroll a colores
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#a855f7", "#06b6d4", "#f97316"]
  )

  return <motion.div style={{ scaleX, backgroundColor }} />
}
```

### Spring Configuration API

```tsx
// Spring básico con duración visual
<motion.div
  animate={{ rotateX: 90 }}
  transition={{
    type: "spring",
    visualDuration: 0.5,  // Tiempo visual para llegar al target
    bounce: 0.25          // 0 = sin rebote, 1 = extremo
  }}
/>

// Spring con física personalizada
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 400,    // Rigidez (mayor = más rápido)
    damping: 30,       // Amortiguación (mayor = menos oscilación)
    mass: 1,           // Masa (mayor = más lento)
    velocity: 2        // Velocidad inicial
  }}
/>

// Límites de terminación
<motion.div
  animate={{ rotate: 180 }}
  transition={{
    type: "spring",
    restDelta: 0.5,    // Distancia mínima para terminar
    restSpeed: 2       // Velocidad mínima para terminar
  }}
/>
```

### Gestos 3D con React Three Fiber

```tsx
import { motion } from "framer-motion-3d"

;<motion.mesh
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9, rotateY: Math.PI }}
  onHoverStart={() => console.log("hover start")}
  onTap={() => console.log("tapped!")}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  <boxGeometry />
  <meshStandardMaterial color="violet" />
</motion.mesh>
```

### Scroll-Triggered Animations

```tsx
// Básico: anima al entrar en viewport
<motion.div
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
/>

// Con container de scroll personalizado
const scrollRef = useRef(null)

<div ref={scrollRef} className="overflow-y-scroll h-screen">
  <motion.div
    whileInView={{ scale: 1 }}
    viewport={{ root: scrollRef }}
  />
</div>

// Detectar dirección de scroll
const { scrollY } = useScroll()
const [direction, setDirection] = useState("down")

useMotionValueEvent(scrollY, "change", (current) => {
  const diff = current - scrollY.getPrevious()
  setDirection(diff > 0 ? "down" : "up")
})
```

### Hardware-Accelerated Scroll (Motion DOM)

```tsx
import { animate, scroll } from "motion"

// Animación vinculada al scroll con aceleración GPU
const animation = animate(element, { opacity: [0, 1] })
scroll(animation)
```

### Spring Value (standalone)

```tsx
import { springValue, motionValue, styleEffect } from "motion"

// Spring que sigue un motion value
const pointerX = motionValue(0)
const x = springValue(pointerX, { stiffness: 1000 })

document.addEventListener("pointerMove", (e) => {
  pointerX.set(e.clientX) // x animará con spring
})

styleEffect("div", { x })
```

---

## 🔧 MCP Servers Optimizados

### Servers Activos para Diseño

| Server                | Uso en Diseño                               |
| --------------------- | ------------------------------------------- |
| `filesystem`          | Lectura/escritura de shaders, assets 3D     |
| `memory`              | Persistencia de configuraciones de escena   |
| `fetch`               | Documentación Three.js, GSAP, Framer Motion |
| `context7`            | Docs actualizados de librerías              |
| `playwright`          | Testing visual de animaciones               |
| `serena`              | Navegación de código de shaders             |
| `sequential-thinking` | Razonamiento para optimización              |

---

## 📚 Recursos & Referencias

### Documentación Oficial

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber Docs](https://r3f.docs.pmnd.rs/)
- [Drei Storybook](https://drei.pmnd.rs/)
- [GSAP Docs](https://gsap.com/docs/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [WebGPU Spec](https://www.w3.org/TR/webgpu/)

### Tutoriales Premium

- [Three.js Journey](https://threejs-journey.com/) - Curso completo
- [React Three Fiber Ultimate Guide](https://docs.pmnd.rs/react-three-fiber/)
- [Codrops Tutorials](https://tympanus.net/codrops/category/tutorials/)

### Herramientas de Optimización

- **gltf-transform**: Compresión de assets 3D
- **stats-gl**: Profiling WebGL/WebGPU
- **Spector.js**: Debug de draw calls
- **lil-gui**: Tweaking en tiempo real

### Inspiración

- [Awwwards](https://www.awwwards.com/)
- [Three.js Examples](https://threejs.org/examples/)
- [Codrops Demos](https://tympanus.net/codrops/category/playground/)

---

## 🎯 Checklist de Optimización

### Performance

- [ ] Draw calls < 100 por frame
- [ ] Usar InstancedMesh para objetos repetidos
- [ ] Texturas KTX2 comprimidas
- [ ] Geometría Draco comprimida
- [ ] LOD para objetos distantes
- [ ] Dispose de recursos no usados

### Calidad Visual

- [ ] Post-processing con bloom selectivo
- [ ] Sombras baked para escenas estáticas
- [ ] Environment maps para lighting realista
- [ ] Anti-aliasing final (SMAA/FXAA)

### Experiencia

- [ ] Smooth scroll con Lenis
- [ ] Hover effects fluidos
- [ ] Transiciones cinematográficas
- [ ] Feedback visual inmediato
- [ ] Loading states elegantes

---

**Última actualización**: Enero 2026 **Autor**: GitHub Copilot + CHRONOS Team
