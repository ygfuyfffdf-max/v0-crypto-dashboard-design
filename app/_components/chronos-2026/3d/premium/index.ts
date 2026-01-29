/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 CHRONOS PREMIUM 3D — UNIFIED EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas de todos los componentes 3D premium:
 * - UltraPremium3DEngine (Post-processing, Caustics, Volumetric)
 * - FluidSimulation (Navier-Stokes WebGL)
 * - InstancedParticles (1M+ GPU particles)
 * - ProceduralSDF (Ray marching, Fractals)
 * - PremiumMaterials (Iridescent, Glass, Holographic, Liquid Metal)
 *
 * @version UNIFIED-EXPORTS 2026.1
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 ULTRA PREMIUM 3D ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Components
  AmbientParticles,
  CausticsPlane,
  PremiumBloomSphere,
  PremiumEnvironment,
  // Config
  ULTRA_PREMIUM_CONFIG,
  // Default export
  default as UltraPremium3DEngine,
  UltraPremiumPostProcessing,
  UltraPremiumScene,
  VolumetricLight,
} from './UltraPremium3DEngine'

// Types are inlined in component props - use ComponentProps<typeof ComponentName> if needed

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 FLUID SIMULATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Config
  DEFAULT_FLUID_CONFIG,
  // Components
  FluidPlane,
  // Default export
  default as FluidSimulation,
  // Hook
  useFluidSimulation,
} from './FluidSimulation'

export type { FluidConfig } from './FluidSimulation'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ INSTANCED PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Component
  InstancedParticles,
  // Default export
  default as InstancedParticlesSystem,
  // Presets
  PARTICLE_PRESETS,
} from './InstancedParticles'

export type { InstancedParticlesConfig, ParticlePreset } from './InstancedParticles'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔷 PROCEDURAL SDF
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Component
  ProceduralSDF,
  // Default export
  default as ProceduralSDFViewer,
} from './ProceduralSDF'

export type { SDFShape } from './ProceduralSDF'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PREMIUM MATERIALS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Default export
  default as PremiumMaterials,
  // Hooks
  useGlassMaterial,
  useHolographicMaterial,
  useIridescentMaterial,
  useLiquidMetalMaterial,
} from './PremiumMaterials'

// Material props are defined inline in hook parameters

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONVENIENCE PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Presets de escenas premium para diferentes casos de uso
 */
export const PREMIUM_SCENE_PRESETS = {
  dashboard: {
    quality: 'high' as const,
    enableCaustics: true,
    enableAmbientParticles: true,
    enableVolumetricLight: true,
    environmentPreset: 'studio' as const,
    particles: {
      preset: 'quantum' as const,
      count: 50000,
    },
  },
  showcase: {
    quality: 'ultra' as const,
    enableCaustics: true,
    enableAmbientParticles: true,
    enableVolumetricLight: true,
    environmentPreset: 'sunset' as const,
    particles: {
      preset: 'cosmic' as const,
      count: 100000,
    },
  },
  minimal: {
    quality: 'medium' as const,
    enableCaustics: false,
    enableAmbientParticles: true,
    enableVolumetricLight: false,
    environmentPreset: 'night' as const,
    particles: {
      preset: 'fireflies' as const,
      count: 5000,
    },
  },
  financial: {
    quality: 'high' as const,
    enableCaustics: true,
    enableAmbientParticles: true,
    enableVolumetricLight: true,
    environmentPreset: 'city' as const,
    particles: {
      preset: 'financial' as const,
      count: 60000,
    },
  },
  immersive: {
    quality: 'ultra' as const,
    enableCaustics: true,
    enableAmbientParticles: true,
    enableVolumetricLight: true,
    environmentPreset: 'forest' as const,
    particles: {
      preset: 'nebula' as const,
      count: 200000,
    },
  },
} as const

/**
 * Presets de materiales para diferentes estilos
 */
export const PREMIUM_MATERIAL_PRESETS = {
  quantumViolet: {
    type: 'iridescent' as const,
    baseColor: '#8B00FF',
    iridescenceIntensity: 0.6,
    metalness: 0.9,
    emissiveIntensity: 0.4,
  },
  goldLuxury: {
    type: 'iridescent' as const,
    baseColor: '#FFD700',
    iridescenceIntensity: 0.3,
    metalness: 1,
    emissiveIntensity: 0.2,
  },
  plasmaEnergy: {
    type: 'holographic' as const,
    color1: '#FF1493',
    color2: '#8B00FF',
    color3: '#00FFFF',
    glitchIntensity: 0.3,
  },
  crystalGlass: {
    type: 'glass' as const,
    color: '#ffffff',
    ior: 1.5,
    transmission: 0.95,
  },
  mercuryMetal: {
    type: 'liquidMetal' as const,
    color: '#C0C0C0',
    metalness: 1,
    envColor: '#8B00FF',
    noiseStrength: 0.15,
  },
} as const

/**
 * Presets de SDFs para diferentes formas
 */
export const PREMIUM_SDF_PRESETS = {
  morphingOrb: {
    shape: 'morph' as const,
    colors: ['#8B00FF', '#FFD700', '#FF1493'] as [string, string, string],
    rotationSpeed: 0.3,
    scale: 1,
  },
  fractalMandelbulb: {
    shape: 'mandelbulb' as const,
    colors: ['#4B0082', '#8B00FF', '#DA70D6'] as [string, string, string],
    rotationSpeed: 0.1,
    scale: 0.8,
  },
  mengerCube: {
    shape: 'menger' as const,
    colors: ['#FFD700', '#FFA500', '#FF8C00'] as [string, string, string],
    rotationSpeed: 0.2,
    scale: 1.2,
  },
  organicBlob: {
    shape: 'organic' as const,
    colors: ['#00FF88', '#00FFFF', '#8B00FF'] as [string, string, string],
    rotationSpeed: 0.4,
    scale: 1,
  },
  quantumCrystal: {
    shape: 'crystal' as const,
    colors: ['#8B00FF', '#FF1493', '#FFD700'] as [string, string, string],
    rotationSpeed: 0.25,
    scale: 1.1,
  },
} as const
