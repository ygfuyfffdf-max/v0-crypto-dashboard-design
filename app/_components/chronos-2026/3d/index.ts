/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS 2026 — 3D COMPONENTS INDEX
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas de todos los componentes 3D:
 * - Shaders (FBM, Worley, SSAO, HBAO, Compute)
 * - Componentes R3F (FinancialTurbulence, QuantumOrb, etc.)
 * - Utilidades (SplineTools, optimización, WebGPU)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

// Procedural Noise Shaders (FBM, Worley, Hybrid)
export {
  fbmNoise,
  financialFragmentShader,
  financialVertexShader,
  hybridNoise,
  liquidOrbFragmentShader,
  liquidOrbVertexShader,
  noiseCommon,
  shaders as noiseShaders,
  perlinNoise,
  worleyNoise,
} from './shaders/noise-shaders'

// Post-Processing Shaders (SSAO, HBAO+, Quantum Depth)
export {
  hbaoDefaultUniforms,
  hbaoFragmentShader,
  hbaoVertexShader,
  postProcessingShaders,
  quantumDefaultUniforms,
  quantumDepthFragmentShader,
  ssaoDefaultUniforms,
  ssaoFragmentShader,
} from './shaders/postprocessing-shaders'

// Compute Shaders (WGSL/TSL for WebGPU)
export {
  computeShaders,
  fluidComputeShader,
  meshDeformComputeShader,
  particleComputeShader,
  tslFinancialMaterial,
  wgslNoiseLib,
} from './shaders/compute-shaders'

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Quantum Orb
export * from './QuantumOrb3D'

// Financial Turbulence (advanced FBM + Worley)
export * from './FinancialTurbulence3D'

// AI Orb
export * from './AI3DOrb'

// AI Conversational Widget
export * from './AIConversationalWidget'

// Soul Orb Quantum (pulsa con capital + mood + pulso usuario)
export * from './SoulOrbQuantum'

// Bank Vault 3D (Cámaras Acorazadas)
export * from './BankVault3D'

// Warehouse 3D (Almacén Crystal Matrix)
export * from './Warehouse3D'

// WebGPU Particles - Deshabilitado temporalmente (pendiente optimización de tipado)
// export * from './WebGPUParticles'

// KOCMOC Portal (Interdimensional travel portal)
export * from './KocmocPortal'

// Quantum Liquid Void Shader
export {
  quantumLiquidVoidFragment,
  quantumLiquidVoidShaders,
  quantumLiquidVoidUniforms,
  quantumLiquidVoidVertex,
  quantumLiquidVoidWGSL,
} from './shaders/quantum-liquid-void'

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

// Spline Tools & GLTF Utilities
export {
  SPLINE_SCENES,
  checkWebGPUSupport,
  clearSceneCache,
  createInstancedMesh,
  disposeScene,
  extractAnimations,
  extractMaterials,
  extractMeshes,
  getGPUInfo,
  optimizeScene,
  preloadGLTF,
  preloadMultipleGLTF,
  splineTools,
} from './utils/spline-tools'

export type { GLTFLoadResult, OptimizationOptions, SplineSceneData } from './utils/spline-tools'

// ═══════════════════════════════════════════════════════════════════════════════
// SPLINE AVATAR CONTROLLER (CHRONOS INFINITY 2026)
// ═══════════════════════════════════════════════════════════════════════════════

// Avatar Controller
export { default as SplineAvatarController } from './SplineAvatarController'
export type {
  AvatarEmotion,
  AvatarGesture,
  SplineAvatarControllerProps,
  SplineAvatarControllerRef,
} from './SplineAvatarController'

// Avatar Hook
export {
  useSplineAvatar,
  type MoodState,
  type UseSplineAvatarConfig,
  type UseSplineAvatarReturn,
} from './useSplineAvatar'

// Lip Sync Controller
export {
  LipSyncController,
  PHONEME_TO_VISEME,
  VISEME_BLEND_SHAPES,
  useLipSync,
  type LipSyncConfig,
  type LipSyncState,
  type UseLipSyncReturn,
  type Viseme,
} from './LipSyncController'
// ═══════════════════════════════════════════════════════════════════════════════
// 🌟 PREMIUM 3D COMPONENTS (ULTRA-ELEVATED 2026)
// ═══════════════════════════════════════════════════════════════════════════════

// Ultra Premium 3D Engine (Post-processing, Caustics, Volumetric)
export {
  AmbientParticles,
  CausticsPlane,
  PremiumBloomSphere,
  PremiumEnvironment,
  ULTRA_PREMIUM_CONFIG,
  UltraPremiumPostProcessing,
  UltraPremiumScene,
  VolumetricLight,
} from './premium'

// Fluid Simulation (Navier-Stokes WebGL)
export { DEFAULT_FLUID_CONFIG, FluidPlane, useFluidSimulation } from './premium'

export type { FluidConfig } from './premium'

// Instanced Particles (1M+ GPU particles)
export { InstancedParticles, PARTICLE_PRESETS } from './premium'

export type { InstancedParticlesConfig, ParticlePreset } from './premium'

// Procedural SDF (Ray marching, Fractals)
export { ProceduralSDF } from './premium'

export type { SDFShape } from './premium'

// Premium Materials (Iridescent, Glass, Holographic, Liquid Metal)
export {
  useGlassMaterial,
  useHolographicMaterial,
  useIridescentMaterial,
  useLiquidMetalMaterial,
} from './premium'

// Premium Presets
export { PREMIUM_MATERIAL_PRESETS, PREMIUM_SCENE_PRESETS, PREMIUM_SDF_PRESETS } from './premium'
