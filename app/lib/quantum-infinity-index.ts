/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — ÍNDICE UNIFICADO DE SISTEMA DE DISEÑO HYPER-ELEVADO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exporta todos los módulos del sistema de diseño hiperelevado:
 * - Design System Tokens
 * - Animation Variants
 * - Interactive Effects
 * - R3F Materials
 * - R3F Hooks
 * - WebGPU Shaders
 * - GLSL Materials
 *
 * @version HYPER-INFINITY 2026.1
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN SYSTEM TOKENS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Palette
  QUANTUM_PALETTE,
  // Gradients
  QUANTUM_GRADIENTS,
  // Shadows & Glows
  QUANTUM_SHADOWS,
  // Glass Effects
  QUANTUM_GLASS,
  // Spring Physics
  QUANTUM_SPRING,
  // Tilt Configurations
  QUANTUM_TILT,
  // Mood States
  QUANTUM_MOODS,
  // Layout
  QUANTUM_LAYOUT,
  // Typography
  QUANTUM_TYPOGRAPHY,
  // Bank Colors
  BANK_COLORS,
  // Animations
  QUANTUM_ANIMATIONS,
  // Effects (Scroll & Hover)
  QUANTUM_EFFECTS,
  // Master Export
  QUANTUM_DESIGN_SYSTEM,
  // Types
  type BankId,
  type QuantumPalette,
  type QuantumGradients,
  type QuantumShadows,
  type QuantumGlass,
  type QuantumSpring,
  type QuantumTilt,
  type QuantumMoods,
  type QuantumLayout,
  type QuantumTypography,
  type QuantumAnimations,
  type QuantumEffects as QuantumEffectsType,
  type BankColors,
} from './design-system/quantum-infinity-2026'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 ANIMATION VARIANTS (FRAMER MOTION)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Spring Presets
  SPRING_PRESETS,
  // Container Variants
  containerVariants,
  staggerContainerVariants,
  gridContainerVariants,
  // Item Variants
  itemVariants,
  cardItemVariants,
  listItemVariants,
  // Panel Variants
  panelVariants,
  glassCardVariants,
  // Hover Variants
  hoverLiftVariants,
  hoverGlowVariants,
  magneticHoverVariants,
  buttonHoverVariants,
  // Scroll Variants
  scrollFadeInVariants,
  scrollZoomVariants,
  scrollSlideVariants,
  // Modal Variants
  modalOverlayVariants,
  modalContentVariants,
  drawerVariants,
  // Toast Variants
  toastVariants,
  notificationBadgeVariants,
  // Micro-interaction Variants
  checkmarkVariants,
  spinnerVariants,
  pulseVariants,
  shimmerVariants,
  // Text Variants
  textRevealVariants,
  characterVariants,
  wordVariants,
  // Gradient Variants
  gradientShiftVariants,
  colorPulseVariants,
  // Bank-specific Variants
  bankGlowVariants,
  // Chart Variants
  barChartVariants,
  lineChartVariants,
  pieChartVariants,
  numberCounterVariants,
  // Presence Variants
  presenceFadeVariants,
  presenceSlideVariants,
  presenceScaleVariants,
  // Master Export
  QuantumVariants,
} from './animations/quantum-variants'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ INTERACTIVE EFFECTS (HOOKS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Magnetic Effect
  useMagneticEffect,
  // 3D Tilt Effect
  useTiltEffect,
  // Scroll Parallax
  useScrollParallax,
  // Spotlight Effect
  useSpotlightEffect,
  // Ripple Effect
  useRippleEffect,
  // Hover Glow
  useHoverGlow,
  // Infinite Scroll Animation
  useInfiniteScroll,
  // Master Export
  QuantumEffects,
} from './effects/quantum-effects'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 R3F MATERIALS (THREE.JS / REACT THREE FIBER)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Custom Shader Materials
  QuantumGlassMaterial,
  HolographicMaterial,
  LiquidMetalMaterial,
  PlasmaOrbMaterial,
  VolumetricGlowMaterial,
  // Master Export
  QuantumMaterials,
} from './r3f/quantum-materials'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪝 R3F HOOKS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Particle System Hook
  useQuantumParticles,
  // Fluid Simulation Hook
  useFluidSimulation,
  // Magnetic Cursor Hook (3D)
  useMagneticCursor,
  // Parallax Scroll Hook (3D)
  useParallaxScroll,
  // Spring 3D Hook
  useSpring3D,
  // Gradient Texture Hook
  useGradientTexture,
} from './r3f/quantum-hooks'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🖥️ WEBGPU COMPUTE SHADERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Particle System WGSL
  // Fluid Simulation WGSL
  // SDF Ray Marching WGSL
  WEBGPU_SHADERS,
} from './shaders/webgpu-compute-particles'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 GLSL MATERIALS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Liquid Metal Material
  // Holographic Material
  // Volumetric Fog Material
  // Glass Ultra Material
  GLSL_MATERIALS,
} from './shaders/glsl-advanced-materials'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 UNIFIED QUANTUM SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Sistema unificado de diseño Quantum Infinity 2026
 * Incluye todos los tokens, variantes, efectos y materiales
 */
export const QuantumInfinitySystem = {
  // Versión
  version: 'HYPER-INFINITY 2026.1',

  // Módulos disponibles
  modules: {
    designSystem: 'quantum-infinity-2026',
    animations: 'quantum-variants',
    effects: 'quantum-effects',
    materials: 'quantum-materials',
    hooks: 'quantum-hooks',
    webgpu: 'webgpu-compute-particles',
    glsl: 'glsl-advanced-materials',
  },

  // Características
  features: [
    'WebGPU Compute Shaders (100K+ particles)',
    'Navier-Stokes Fluid Simulation',
    'SDF Ray Marching',
    'PBR Materials (Liquid Metal, Holographic, Glass)',
    'Spring Physics (Critical Damping)',
    'Magnetic Cursor Effects',
    '3D Tilt with Glare',
    'Scroll Parallax',
    'Ripple Effects',
    'Framer Motion Variants',
    'R3F Integration',
  ],

  // Paleta restringida
  palette: {
    primary: '#8B00FF', // Violet
    secondary: '#FFD700', // Gold
    accent: '#FF1493', // Plasma
    background: '#000000', // Void
    foreground: '#FFFFFF', // White
  },
}

export default QuantumInfinitySystem
