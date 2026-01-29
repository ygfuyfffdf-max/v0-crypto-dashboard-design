/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎮 CHRONOS 3D - TIPOS Y INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { Object3D, Camera, Scene, WebGLRenderer, Vector3, Color, Texture } from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 WEBGPU TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WebGPUCapabilities {
  isSupported: boolean
  adapter: GPUAdapter | null
  device: GPUDevice | null
  features: Set<string>
  limits: GPUSupportedLimits | null
}

export interface WebGPURendererOptions {
  canvas: HTMLCanvasElement
  antialias?: boolean
  powerPreference?: GPUPowerPreference
  requiredFeatures?: GPUFeatureName[]
  requiredLimits?: Record<string, number>
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 SHADER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ShaderUniforms {
  [key: string]: {
    value: number | Vector3 | Color | Texture | number[] | Float32Array
    type?: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'mat4' | 'sampler2D'
  }
}

export interface ShaderConfig {
  vertexShader: string
  fragmentShader: string
  uniforms?: ShaderUniforms
  transparent?: boolean
  depthWrite?: boolean
  depthTest?: boolean
  blending?: number
  side?: number
}

export interface CustomShaderProps {
  baseMaterial?: 'standard' | 'physical' | 'basic' | 'lambert' | 'phong' | 'toon'
  vertexShader?: string
  fragmentShader?: string
  uniforms?: ShaderUniforms
  patchMap?: Record<string, string>
  cacheKey?: string
  silent?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// 💫 PARTICLE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ParticleConfig {
  count: number
  size: number
  sizeRange?: [number, number]
  color: string | string[]
  colorMode?: 'solid' | 'gradient' | 'random'
  opacity: number
  opacityRange?: [number, number]
  speed: number
  speedRange?: [number, number]
  lifetime: number
  lifetimeRange?: [number, number]
  emissionRate: number
  emissionShape: 'point' | 'sphere' | 'box' | 'cone' | 'disk' | 'ring'
  emissionRadius?: number
  emissionSize?: [number, number, number]
  gravity?: [number, number, number]
  wind?: [number, number, number]
  turbulence?: number
  attraction?: {
    point: [number, number, number]
    strength: number
    radius: number
  }
  collision?: boolean
  bounce?: number
  friction?: number
  sprite?: string
  blending?: 'additive' | 'normal' | 'multiply' | 'screen'
}

export interface GPUParticleConfig extends ParticleConfig {
  computeShader?: string
  renderShader?: string
  workgroupSize?: number
  bufferCount?: number
}

export interface InteractiveParticleConfig extends ParticleConfig {
  interactionRadius: number
  interactionStrength: number
  interactionType: 'attract' | 'repel' | 'orbit' | 'follow'
  mouseInfluence: boolean
  touchInfluence: boolean
  audioReactive?: boolean
  audioSensitivity?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 POST-PROCESSING TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BloomConfig {
  intensity: number
  threshold: number
  smoothing: number
  radius: number
  luminanceThreshold: number
  luminanceSmoothing: number
  mipmapBlur: boolean
}

export interface ChromaticAberrationConfig {
  offset: [number, number]
  radialModulation: boolean
  modulationOffset: number
}

export interface DepthOfFieldConfig {
  focusDistance: number
  focalLength: number
  bokehScale: number
  height: number
}

export interface GodRaysConfig {
  sun: Object3D
  density: number
  decay: number
  weight: number
  exposure: number
  samples: number
  clampMax: number
}

export interface SSRConfig {
  temporalResolve: boolean
  temporalResolveMix: number
  temporalResolveCorrectionMix: number
  maxSamples: number
  resolutionScale: number
  width: number
  height: number
  velocityResolutionScale: number
  blurMix: number
  blurKernelSize: number
  rayStep: number
  intensity: number
  maxRoughness: number
  jitter: number
  jitterSpread: number
  jitterRough: number
  roughnessFadeOut: number
  rayFadeOut: number
  MAX_STEPS: number
  NUM_BINARY_SEARCH_STEPS: number
  maxDepthDifference: number
  maxDepth: number
  thickness: number
  ior: number
}

export interface PostProcessingPipeline {
  bloom?: BloomConfig
  chromaticAberration?: ChromaticAberrationConfig
  depthOfField?: DepthOfFieldConfig
  godRays?: GodRaysConfig
  ssr?: SSRConfig
  vignette?: { offset: number; darkness: number }
  filmGrain?: { intensity: number; opacity: number }
  scanlines?: { count: number; intensity: number }
  glitch?: { delay: [number, number]; duration: [number, number]; strength: [number, number] }
  noise?: { opacity: number; premultiply: boolean }
  colorGrading?: {
    contrast: number
    saturation: number
    brightness: number
    hue: number
    temperature: number
    tint: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 SCENE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Scene3DProps {
  children: React.ReactNode
  camera?: Partial<CameraConfig>
  controls?: Partial<ControlsConfig>
  environment?: EnvironmentConfig
  postProcessing?: PostProcessingPipeline
  performance?: PerformanceConfig
  debug?: boolean
  className?: string
  style?: React.CSSProperties
}

export interface CameraConfig {
  type: 'perspective' | 'orthographic'
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  near: number
  far: number
  zoom: number
}

export interface ControlsConfig {
  type: 'orbit' | 'fly' | 'firstPerson' | 'trackball' | 'arcball' | 'pointerLock'
  enabled: boolean
  enableDamping: boolean
  dampingFactor: number
  enableZoom: boolean
  enablePan: boolean
  enableRotate: boolean
  autoRotate: boolean
  autoRotateSpeed: number
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  minAzimuthAngle: number
  maxAzimuthAngle: number
}

export interface EnvironmentConfig {
  preset?:
    | 'apartment'
    | 'city'
    | 'dawn'
    | 'forest'
    | 'lobby'
    | 'night'
    | 'park'
    | 'studio'
    | 'sunset'
    | 'warehouse'
  background?: boolean | 'only'
  blur?: number
  files?: string | string[]
  path?: string
  resolution?: number
  encoding?: number
  ground?:
    | boolean
    | {
        height?: number
        radius?: number
        scale?: number
      }
}

export interface PerformanceConfig {
  current: number
  min: number
  max: number
  debounce: number
  regress?: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 COMPONENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface HolographicDisplayProps {
  children: React.ReactNode
  color?: string
  fresnelColor?: string
  scanlineIntensity?: number
  glitchIntensity?: number
  noiseIntensity?: number
  distortionIntensity?: number
  animated?: boolean
  className?: string
}

export interface CyberGridProps {
  size?: [number, number]
  divisions?: [number, number]
  color?: string
  secondaryColor?: string
  fadeDistance?: number
  infiniteGrid?: boolean
  animated?: boolean
  waveAmplitude?: number
  waveFrequency?: number
  className?: string
}

export interface NeuralNetwork3DProps {
  nodes: number
  layers: number
  connectionDensity?: number
  nodeSize?: number
  nodeColor?: string
  connectionColor?: string
  pulseSpeed?: number
  animated?: boolean
  interactive?: boolean
  className?: string
}

export interface DataVisualization3DProps {
  data: number[] | number[][]
  type: 'bars' | 'scatter' | 'surface' | 'network' | 'globe' | 'tree'
  colorScale?: string[]
  animated?: boolean
  interactive?: boolean
  labels?: string[]
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 ANIMATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnimationConfig {
  duration: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'elastic' | 'bounce' | 'back'
  delay?: number
  repeat?: number | 'infinity'
  yoyo?: boolean
  onStart?: () => void
  onUpdate?: (progress: number) => void
  onComplete?: () => void
}

export interface KeyframeAnimation {
  property: string
  keyframes: Array<{
    time: number
    value: number | number[] | string
    easing?: string
  }>
}

export interface SpringConfig {
  mass: number
  tension: number
  friction: number
  clamp?: boolean
  precision?: number
  velocity?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type Vec2 = [number, number]
export type Vec3 = [number, number, number]
export type Vec4 = [number, number, number, number]
export type Mat3 = [number, number, number, number, number, number, number, number, number]
export type Mat4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
]

export type ColorValue = string | number | [number, number, number]
export type EasingFunction = (t: number) => number
export type RenderCallback = (state: RenderState, delta: number) => void

export interface RenderState {
  gl: WebGLRenderer | GPUDevice
  scene: Scene
  camera: Camera
  clock: { elapsedTime: number; delta: number }
  pointer: { x: number; y: number }
  size: { width: number; height: number }
  viewport: { width: number; height: number; aspect: number; factor: number }
  performance: { current: number; min: number; max: number }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 PERFORMANCE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsed: number
  memoryTotal: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  programs: number
  gpuMemory?: number
  cpuUsage?: number
}

export interface QualityLevel {
  name: 'ultra' | 'high' | 'medium' | 'low' | 'potato'
  resolution: number
  shadows: boolean
  shadowMapSize: number
  antialiasing: 'none' | 'fxaa' | 'smaa' | 'msaa'
  postProcessing: boolean
  particleCount: number
  lodBias: number
  textureQuality: 'high' | 'medium' | 'low'
  reflections: boolean
  ambientOcclusion: boolean
}
