# 🎨 CHRONOS ADVANCED VISUAL SYSTEM

## Sistema Visual Ultra Avanzado para CHRONOS

Este documento describe la arquitectura completa del sistema visual de CHRONOS, diseñado para crear
experiencias cinematográficas, interactivas, y con calidad de rendering AAA usando tecnologías web
de vanguardia.

---

## 📋 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Stack Tecnológico 3D/2D](#stack-tecnológico-3d2d)
3. [Shaders GLSL Cinematográficos](#shaders-glsl-cinematográficos)
4. [Sistema de Partículas](#sistema-de-partículas)
5. [Motor de Física](#motor-de-física)
6. [IA Generativa Integrada](#ia-generativa-integrada)
7. [Interactividad Avanzada](#interactividad-avanzada)
8. [Optimización de Performance](#optimización-de-performance)
9. [Hooks Personalizados](#hooks-personalizados)
10. [Ejemplos de Código](#ejemplos-de-código)

---

## 🏗️ Arquitectura General

### Estructura de Carpetas

```
app/
├── components/
│   └── advanced/
│       ├── shaders/          # Componentes con efectos shader
│       ├── particles/        # Sistemas de partículas
│       ├── physics/          # Simulaciones físicas
│       ├── ai-generative/    # Generación IA
│       └── interactions/     # Controles avanzados
├── hooks/
│   ├── useWebGL.ts          # Context WebGL/Three.js
│   ├── useShader.ts         # Gestión shaders
│   ├── useFrameLoop.ts      # Loop animación 60fps
│   └── useParticleSystem.ts # Sistema partículas
└── shaders/
    ├── vertex/              # Vertex shaders
    ├── fragment/            # Fragment shaders
    ├── noise/               # Funciones ruido
    ├── effects/             # Efectos cinematográficos
    └── utils/               # Utilidades matemáticas
```

### Principios de Diseño

1. **Performance First**: Todas las animaciones deben correr a 60fps
2. **Modular y Reusable**: Componentes standalone con API clara
3. **Type-Safe**: TypeScript estricto en todo el código
4. **GPU-Optimized**: Usar GPU compute cuando sea posible
5. **Accessible**: Respetar preferencias de motion reducido

---

## 🎯 Stack Tecnológico 3D/2D

### Renderizado 3D

- **Three.js** (v0.182.0): Motor 3D principal
- **React Three Fiber** (R3F): Integración React-Three
- **Drei**: Helpers y abstracciones útiles
- **Postprocessing**: Efectos post-procesamiento

### Animaciones

- **GSAP** (v3.14.2): Animaciones timeline
- **Framer Motion**: Animaciones React declarativas
- **Lenis**: Smooth scrolling premium

### Partículas y Física

- **tsParticles**: Sistema partículas 2D
- **Cannon.js**: Física 3D
- **Rapier**: Física de alto rendimiento (WASM)
- **Matter.js**: Física 2D

### Shaders y Efectos

- **Lamina**: Materials procedurales
- **glslify**: Modularización GLSL
- **simplex-noise**: Generación ruido
- **Postprocessing**: Bloom, DOF, Chromatic Aberration

### IA y ML

- **TensorFlow.js**: ML en navegador
- **MediaPipe Hands**: Hand tracking
- **GPU.js**: Computación paralela

### Matemáticas

- **maath**: Utilidades matemáticas 3D
- **camera-controls**: Control cámara cinematográfico

### Gestos e Interacción

- **@use-gesture/react**: Gestos touch avanzados
- **split-type**: Text splitting para animaciones

---

## 🎨 Shaders GLSL Cinematográficos

### Noise Functions

#### Perlin Noise 3D

```glsl
// app/shaders/noise/perlin.glsl
float perlinNoise3D(vec3 P);
float fbm(vec3 x, int octaves);
```

**Uso**: Terrenos, nubes, efectos orgánicos

#### Simplex Noise 3D

```glsl
// app/shaders/noise/simplex.glsl
float simplexNoise3D(vec3 v);
float turbulence(vec3 p, int octaves);
```

**Uso**: Fluidos, fuego, deformaciones suaves

### Efectos Cinematográficos

#### Bloom

```glsl
// app/shaders/effects/bloom.glsl
uniform float intensity;
uniform float threshold;
```

**Parámetros**:

- `intensity`: 0.0 - 2.0 (1.0 default)
- `threshold`: 0.5 - 1.0 (0.7 default)

#### Chromatic Aberration

```glsl
// app/shaders/effects/chromatic-aberration.glsl
uniform float amount;
uniform vec2 direction;
```

**Parámetros**:

- `amount`: 0.0 - 0.1 (0.002 default)
- `direction`: vec2(1.0, 0.0) horizontal

#### Film Grain

```glsl
// app/shaders/effects/film-grain.glsl
uniform float time;
uniform float amount;
uniform float grainSize;
```

**Parámetros**:

- `amount`: 0.0 - 0.3 (0.1 default)
- `grainSize`: 1.0 - 10.0 (2.5 default)

#### Vignette

```glsl
// app/shaders/effects/vignette.glsl
uniform float intensity;
uniform float smoothness;
uniform vec2 center;
```

**Parámetros**:

- `intensity`: 0.5 - 1.5 (0.8 default)
- `smoothness`: 0.1 - 1.0 (0.5 default)
- `center`: vec2(0.5, 0.5)

### PBR (Physically Based Rendering)

```glsl
// app/shaders/fragment/pbr.glsl
uniform vec3 baseColor;
uniform float metalness;    // 0.0 = dielectric, 1.0 = metal
uniform float roughness;    // 0.0 = smooth, 1.0 = rough
```

**Incluye**:

- GGX Normal Distribution Function
- Schlick-GGX Geometry Function
- Fresnel-Schlick
- ACES Tone Mapping
- Gamma Correction

### Utilidades Matemáticas

```glsl
// app/shaders/utils/math.glsl
float map(float value, float min1, float max1, float min2, float max2);
float smootherstep(float edge0, float edge1, float x);
vec2 rotate2D(vec2 v, float angle);
vec3 rotateY(vec3 v, float angle);

// Easing functions
float easeInOutCubic(float t);
float quintic(float t);
```

### Utilidades de Color

```glsl
// app/shaders/utils/color.glsl
vec3 rgb2hsv(vec3 c);
vec3 hsv2rgb(vec3 c);
float luminance(vec3 color);
vec3 acesFilmic(vec3 x);
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d);
```

---

## ⚡ Sistema de Partículas

### Hook: useParticleSystem

```typescript
import { useParticleSystem } from '@/app/hooks/useParticleSystem'
import * as THREE from 'three'

const particleSystem = useParticleSystem({
  maxParticles: 10000,
  emissionRate: 50,           // partículas/segundo
  lifetime: 5.0,              // segundos
  startSize: 0.1,
  endSize: 0.01,
  startColor: new THREE.Color(0x8b5cf6),
  endColor: new THREE.Color(0xec4899),
  velocity: new THREE.Vector3(0, 1, 0),
  velocityVariation: 0.5,
  gravity: new THREE.Vector3(0, -0.5, 0),
  useGPU: true,               // GPU compute (futuro)
})

// En tu loop de animación
useFrameLoop((deltaTime) => {
  particleSystem.update(deltaTime)
})

// Render
<primitive object={particleSystem.mesh} />
```

### Características

- **Física Realista**: Gravedad, velocidad, aceleración
- **Interpolación de Color**: Gradiente start → end
- **Interpolación de Tamaño**: Shrink/grow con lifetime
- **Rotación**: Cada partícula puede rotar
- **GPU Optimizado**: Buffer attributes actualizados eficientemente
- **Blend Modes**: Aditivo, multiplicativo, normal

### Emisores

#### Punto

```typescript
// Emisión desde un punto
emit(100) // 100 partículas desde (0,0,0)
```

#### Esfera (Futuro)

```typescript
emitFromSphere(radius, count)
```

#### Mesh Surface (Futuro)

```typescript
emitFromMesh(mesh, count)
```

---

## 🎮 Motor de Física

### Cannon.js (3D)

```typescript
import * as CANNON from "cannon-es"

// Crear mundo
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
})

// Crear cuerpo físico
const shape = new CANNON.Sphere(1)
const body = new CANNON.Body({
  mass: 1,
  shape: shape,
  position: new CANNON.Vec3(0, 10, 0),
})
world.addBody(body)

// En loop de animación
world.fixedStep()
```

### Rapier (WASM - Alto Rendimiento)

```typescript
import { useRapier } from '@react-three/rapier'

function PhysicsScene() {
  return (
    <Physics>
      <RigidBody position={[0, 10, 0]}>
        <mesh>
          <sphereGeometry />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed">
        <mesh>
          <boxGeometry args={[10, 0.5, 10]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>
    </Physics>
  )
}
```

### Matter.js (2D)

```typescript
import Matter from "matter-js"

const engine = Matter.Engine.create()
const world = engine.world

// Crear cuerpos
const box = Matter.Bodies.rectangle(400, 200, 80, 80)
const ground = Matter.Bodies.rectangle(400, 610, 810, 60, {
  isStatic: true,
})

Matter.Composite.add(world, [box, ground])
Matter.Engine.run(engine)
```

---

## 🤖 IA Generativa Integrada

### TensorFlow.js

```typescript
import * as tf from "@tensorflow/tfjs"

// Cargar modelo
const model = await tf.loadLayersModel("path/to/model.json")

// Predicción
const input = tf.tensor2d([[...data]])
const prediction = model.predict(input)
```

### MediaPipe Hands

```typescript
import { Hands } from "@mediapipe/hands"
import { Camera } from "@mediapipe/camera_utils"

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  },
})

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
})

hands.onResults((results) => {
  // results.multiHandLandmarks contiene posiciones 3D
})
```

### Uso en Visualizaciones

```typescript
function AIReactiveScene() {
  const [handPosition, setHandPosition] = useState<Vector3>()

  useEffect(() => {
    // Setup MediaPipe
    const hands = new Hands(...)
    hands.onResults((results) => {
      if (results.multiHandLandmarks[0]) {
        const landmark = results.multiHandLandmarks[0][8] // Index finger tip
        setHandPosition(new Vector3(
          landmark.x * 2 - 1,
          -(landmark.y * 2 - 1),
          landmark.z
        ))
      }
    })
  }, [])

  return (
    <mesh position={handPosition}>
      <sphereGeometry args={[0.1]} />
      <meshStandardMaterial color="violet" />
    </mesh>
  )
}
```

---

## 🎮 Interactividad Avanzada

### Gestos Touch

```typescript
import { useGesture } from '@use-gesture/react'
import { animated, useSpring } from '@react-spring/three'

function InteractiveMesh() {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    rotation: [0, 0, 0]
  }))

  const bind = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      api.start({ rotation: [y / 100, x / 100, 0] })
    },
    onPinch: ({ offset: [scale] }) => {
      api.start({ scale: 1 + scale / 200 })
    },
  })

  return (
    <animated.mesh {...bind()} scale={spring.scale} rotation={spring.rotation}>
      <boxGeometry />
      <meshStandardMaterial color="violet" />
    </animated.mesh>
  )
}
```

### Camera Controls Cinematográficos

```typescript
import CameraControls from 'camera-controls'
import { extend, useThree, useFrame } from '@react-three/fiber'

extend({ CameraControls })

function CinematicControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef<CameraControls>()

  useFrame((state, delta) => {
    controlsRef.current?.update(delta)
  })

  return (
    <cameraControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      dampingFactor={0.05}
      draggingDampingFactor={0.25}
    />
  )
}
```

---

## ⚡ Optimización de Performance

### 1. Code Splitting Dinámico

```typescript
import dynamic from 'next/dynamic'

const Heavy3DScene = dynamic(
  () => import('@/app/components/advanced/Heavy3DScene'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />
  }
)
```

### 2. Instanced Rendering

```typescript
function InstancedParticles({ count = 1000 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    if (!meshRef.current) return

    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count])

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.1]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

### 3. LOD (Level of Detail)

```typescript
import { LOD } from 'three'

function AdaptiveModel() {
  const lodRef = useRef<THREE.LOD>()

  useEffect(() => {
    const lod = new LOD()

    // Alta calidad (cerca)
    lod.addLevel(highPolyMesh, 0)

    // Media calidad
    lod.addLevel(mediumPolyMesh, 50)

    // Baja calidad (lejos)
    lod.addLevel(lowPolyMesh, 100)

    lodRef.current = lod
  }, [])

  return <primitive object={lodRef.current} />
}
```

### 4. Frustum Culling Automático

Three.js ya hace frustum culling, pero puedes optimizarlo:

```typescript
mesh.frustumCulled = true // default
mesh.matrixAutoUpdate = false // si no se mueve
```

### 5. Object Pooling

```typescript
class ParticlePool {
  private pool: Particle[] = []

  acquire(): Particle {
    return this.pool.pop() || new Particle()
  }

  release(particle: Particle) {
    particle.reset()
    this.pool.push(particle)
  }
}
```

---

## 🎣 Hooks Personalizados

### useWebGL

```typescript
const { canvasRef, gl, scene, camera, isReady, resize } = useWebGL({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
})
```

**Características**:

- Inicializa WebGLRenderer con configuración óptima
- Gestiona automáticamente resize
- Cleanup en unmount
- Type-safe con TypeScript

### useShader

```typescript
const { material, updateUniforms, setUniform, isCompiled, error } = useShader({
  vertexShader: myVertexShader,
  fragmentShader: myFragmentShader,
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x8b5cf6) },
  },
  transparent: true,
})

// Actualizar uniforms
useFrame((state) => {
  setUniform("time", state.clock.elapsedTime)
})
```

**Características**:

- Compilación automática con error handling
- Gestión de uniforms simplificada
- Cleanup automático
- Type-safe

### useFrameLoop

```typescript
const { start, stop, isRunning, fps } = useFrameLoop(
  (deltaTime, elapsedTime) => {
    // Tu lógica de animación
    mesh.rotation.y += deltaTime
  },
  { autoStart: true, maxFPS: 60 }
)
```

**Características**:

- Delta time preciso
- Control de FPS máximo
- Monitor de FPS real
- Start/stop manual

### useParticleSystem

```typescript
const { particles, mesh, emit, update, clear, setEmissionRate } = useParticleSystem({
  maxParticles: 5000,
  emissionRate: 100,
  lifetime: 3.0,
  startColor: new THREE.Color(0x8b5cf6),
  endColor: new THREE.Color(0xec4899),
  velocity: new THREE.Vector3(0, 2, 0),
  gravity: new THREE.Vector3(0, -1, 0),
})
```

**Características**:

- Física completa (velocidad, aceleración, gravedad)
- Interpolación de color y tamaño
- GPU-optimizado
- Control de emisión

---

## 💡 Ejemplos de Código

### Escena 3D Básica con Shaders

```typescript
'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useShader } from '@/app/hooks/useShader'
import { useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float pattern = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time);
    vec3 finalColor = color * (pattern * 0.5 + 0.5);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

function AnimatedShaderMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  const { material, setUniform } = useShader({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0x8b5cf6) }
    }
  })

  useFrame((state) => {
    if (material) {
      setUniform('time', state.clock.elapsedTime)
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  if (!material) return null

  return (
    <mesh ref={meshRef} material={material}>
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  )
}

export default function ShaderScene() {
  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <AnimatedShaderMesh />
      </Canvas>
    </div>
  )
}
```

### Sistema de Partículas Completo

```typescript
'use client'

import { Canvas } from '@react-three/fiber'
import { useParticleSystem } from '@/app/hooks/useParticleSystem'
import { useFrameLoop } from '@/app/hooks/useFrameLoop'
import * as THREE from 'three'

function ParticleSystem() {
  const system = useParticleSystem({
    maxParticles: 10000,
    emissionRate: 200,
    lifetime: 3.0,
    startSize: 0.2,
    endSize: 0.01,
    startColor: new THREE.Color(0x8b5cf6),
    endColor: new THREE.Color(0xec4899),
    velocity: new THREE.Vector3(0, 1, 0),
    velocityVariation: 2.0,
    gravity: new THREE.Vector3(0, -0.5, 0),
  })

  useFrameLoop((deltaTime) => {
    system.update(deltaTime)
  })

  return <primitive object={system.mesh} />
}

export default function ParticleScene() {
  return (
    <div className="h-screen w-screen bg-gray-950">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <ParticleSystem />
      </Canvas>
    </div>
  )
}
```

### Animaciones Tailwind Avanzadas

```typescript
export function CinematicCard() {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-3xl">
      {/* Fondo con efecto aurora */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-pink-500 to-cyan-500 opacity-50 animate-aurora-dance" />

      {/* Blobs animados */}
      <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl animate-blob" />
      <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-pink-500/30 blur-3xl animate-blob-slow" />

      {/* Contenido */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <h2 className="text-6xl font-bold text-white animate-hologram">
          CHRONOS
        </h2>
      </div>

      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0 animate-scan-line">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </div>
  )
}
```

---

## 🚀 Próximos Pasos

1. **WebGPU**: Migrar a WebGPU para mejor rendimiento
2. **Ray Tracing**: Implementar ray tracing en tiempo real
3. **AI-Powered**: Generación procedural con IA
4. **VR/AR Support**: Integración con WebXR
5. **Multiplayer**: Sincronización multi-usuario con WebRTC

---

## 📚 Recursos Adicionales

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [GSAP Documentation](https://greensock.com/docs/)
- [Shader Reference](<https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)>)
- [The Book of Shaders](https://thebookofshaders.com/)

---

**Versión**: 1.0.0 **Última Actualización**: 2026-01-13 **Autor**: CHRONOS Team
