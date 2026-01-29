/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS SUPREME SHADER SYSTEM — INDEX EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas del sistema de shaders SUPREME.
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══ SHADER SOURCES ═══
export {
  PANEL_SHADER_PRESETS,
  // Collections
  SUPREME_SHADERS,
  supremeGlowOrbFragment,
  supremeGlowOrbVertex,
  supremeLiquidFragment,
  supremeLiquidVertex,
  supremeParticleFragment,
  // Individual shader exports
  supremeParticleVertex,
  supremeRippleFragment,
  type PanelShaderPreset,
  // Types
  type SupremeShaderType,
} from '@/app/lib/shaders/supreme-particle-system'

// ═══ CANVAS COMPONENT ═══
export {
  AIShaderBackground,
  AlmacenShaderBackground,
  BancosShaderBackground,
  ClientesShaderBackground,
  ComprasShaderBackground,
  // Panel-specific backgrounds
  DashboardShaderBackground,
  DistribuidoresShaderBackground,
  GastosShaderBackground,
  MovimientosShaderBackground,
  SupremeShaderCanvas,
  VentasShaderBackground,
  type ShaderConfig,
  // Types
  type SupremeShaderCanvasProps,
} from './SupremeShaderCanvas'

// ═══ CUSTOMIZATION SYSTEM ═══
export {
  SHADER_PRESETS,
  ShaderCustomizationProvider,
  hexToRgb,
  rgbToHex,
  useShaderCustomization,
  type ShaderCustomization,
  type ShaderThemePreset,
} from './ShaderCustomizationContext'

// ═══ CONTROL PANEL ═══
export { ShaderControlPanel, ShaderControlTrigger } from './ShaderControlPanel'

// ═══ PERFORMANCE UTILITIES ═══
export {
  detectDeviceCapabilities,
  getActiveContextCount,
  registerWebGLContext,
  unregisterWebGLContext,
  usePageVisibility,
  useShaderPerformance,
  useThrottledCallback,
  type DeviceCapabilities,
  type PerformanceMetrics,
  type ShaderPerformanceConfig,
} from './ShaderPerformance'

// ═══ UNIFIED BACKGROUND ═══
export {
  AIBackground,
  AlmacenBackground,
  BancosBackground,
  ClientesBackground,
  ComprasBackground,
  DashboardBackground,
  DistribuidoresBackground,
  GastosBackground,
  MovimientosBackground,
  PanelWithShaderBackground,
  UnifiedShaderBackground,
  VentasBackground,
  type PanelWithShaderBackgroundProps,
  type UnifiedShaderBackgroundProps,
} from './UnifiedShaderBackground'

// ═══ LEGACY EXPORTS (from QuantumBackgrounds) ═══
export * from './QuantumBackgrounds'
