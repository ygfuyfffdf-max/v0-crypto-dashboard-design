/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎮 CHRONOS 3D ENGINE - Sistema Premium de Gráficos 3D
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Motor de renderizado 3D ultramoderno con soporte para:
 * - WebGL 2.0 con Three.js
 * - WebGPU (experimental) para renderizado de próxima generación
 * - Shaders GLSL/WGSL personalizados
 * - Partículas interactivas de alto rendimiento
 * - Post-procesamiento cinematográfico
 * - Física realista con Rapier3D
 * - Path tracing en tiempo real
 *
 * @version 2.0.0
 * @license MIT
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════

// Core Engine
export * from './engine/RenderPipeline'
export * from './engine/WebGLEngine'
export * from './engine/WebGPUEngine'

// Shaders
export * from './shaders/CustomShaderMaterial'
export * from './shaders/PostProcessing'
export * from './shaders/ShaderLibrary'

// Particles
export * from './particles/GPUParticles'
export * from './particles/InteractiveParticles'
export * from './particles/ParticleSystem'

// Components
export * from './components/CyberGrid'
export * from './components/HolographicDisplay'
export * from './components/ParticleField'
export * from './components/Premium3DCard'
export * from './components/Scene3D'

// Hooks
export * from './hooks'

// Types
export type * from './types'
