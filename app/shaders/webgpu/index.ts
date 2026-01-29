/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 WEBGPU SHADERS INDEX — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Índice de shaders WGSL para WebGPU:
 * - quantum-void.wgsl: Fondo cuántico con distorsión líquida
 * - volumetric-glow.wgsl: Glow volumétrico para orb
 * - particle-swarm.wgsl: Compute shader para 2M+ partículas
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NOTA: Los shaders WGSL son archivos de texto (.wgsl) que se cargan en runtime
// cuando WebGPU está disponible. Este índice documenta los shaders disponibles.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const WEBGPU_SHADERS = {
  /**
   * Quantum Void - Fondo cuántico con distorsión líquida
   * Ubicación: app/shaders/webgpu/quantum-void.wgsl
   *
   * Uniforms:
   * - time: f32 - Tiempo de animación
   * - mood: f32 - 0 = calm violeta, 1 = euphoric oro
   * - pulse: f32 - MediaPipe pulso normalized 0-1
   * - intensity: f32 - Intensidad general 0-1
   * - resolution: vec2<f32> - Resolución de pantalla
   */
  QUANTUM_VOID: "webgpu/quantum-void.wgsl",

  /**
   * Volumetric Glow - Glow volumétrico cinematográfico
   * Ubicación: app/shaders/webgpu/volumetric-glow.wgsl
   *
   * Uniforms:
   * - time: f32
   * - intensity: f32 - 0-2 glow strength
   * - pulse: f32 - MediaPipe pulse 0-1
   * - mood: f32 - 0 calm, 1 euphoric
   * - colorBase: vec3<f32>
   * - innerRadius: f32 - Core radius
   * - outerRadius: f32 - Max glow radius
   * - rayCount: f32 - God rays count (8-16)
   * - rayIntensity: f32 - God rays strength
   */
  VOLUMETRIC_GLOW: "webgpu/volumetric-glow.wgsl",

  /**
   * Particle Swarm - Compute shader para 2M+ partículas
   * Ubicación: app/shaders/webgpu/particle-swarm.wgsl
   *
   * Compute shader con:
   * - Swarm behavior (boids-like)
   * - Attract/repel dynamics
   * - Mood-adaptive colores
   * - Event-triggered explosiones
   *
   * Workgroup size: 256
   */
  PARTICLE_SWARM: "webgpu/particle-swarm.wgsl",
} as const

export type WebGPUShaderName = keyof typeof WEBGPU_SHADERS

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPO DE UNIFORMES PARA CADA SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface QuantumVoidUniforms {
  time: number
  mood: number
  pulse: number
  intensity: number
  resolution: [number, number]
}

export interface VolumetricGlowUniforms {
  time: number
  intensity: number
  pulse: number
  mood: number
  colorBase: [number, number, number]
  innerRadius: number
  outerRadius: number
  rayCount: number
  rayIntensity: number
}

export interface ParticleSwarmUniforms {
  deltaTime: number
  time: number
  mood: number
  eventTrigger: number
  attractorStrength: number
  repelStrength: number
  maxSpeed: number
  damping: number
  noiseStrength: number
  centerAttract: number
  particleCount: number
  explosionActive: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Verifica si WebGPU está disponible en el navegador
 */
export function isWebGPUAvailable(): boolean {
  if (typeof window === "undefined") return false
  return "gpu" in navigator
}

/**
 * Carga un shader WGSL desde el filesystem
 */
export async function loadWGSLShader(shaderPath: string): Promise<string> {
  const response = await fetch(`/shaders/${shaderPath}`)
  if (!response.ok) {
    throw new Error(`Failed to load shader: ${shaderPath}`)
  }
  return response.text()
}

/**
 * Valores por defecto para uniformes de Quantum Void
 */
export const DEFAULT_QUANTUM_VOID_UNIFORMS: QuantumVoidUniforms = {
  time: 0,
  mood: 0.3,
  pulse: 0.5,
  intensity: 1.0,
  resolution: [1920, 1080],
}

/**
 * Valores por defecto para uniformes de Volumetric Glow
 */
export const DEFAULT_VOLUMETRIC_GLOW_UNIFORMS: VolumetricGlowUniforms = {
  time: 0,
  intensity: 1.5,
  pulse: 0.5,
  mood: 0.3,
  colorBase: [0.55, 0.0, 1.0],
  innerRadius: 0.1,
  outerRadius: 0.5,
  rayCount: 12,
  rayIntensity: 0.3,
}

/**
 * Valores por defecto para uniformes de Particle Swarm
 */
export const DEFAULT_PARTICLE_SWARM_UNIFORMS: ParticleSwarmUniforms = {
  deltaTime: 0.016,
  time: 0,
  mood: 0.3,
  eventTrigger: 0,
  attractorStrength: 1.0,
  repelStrength: 2.0,
  maxSpeed: 2.0,
  damping: 0.98,
  noiseStrength: 0.5,
  centerAttract: 0.5,
  particleCount: 500000,
  explosionActive: false,
}
