/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS 2026 - SISTEMA UNIFICADO DE COMPONENTES PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// 📐 LAYOUT - Sistema de Grid y Contenedores
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  ResponsiveGrid,
  ResponsiveGridItem,
  type ResponsiveGridItemProps,
  type ResponsiveGridProps,
} from "./layout/ResponsiveGrid"

export { ChronosHeader2026 } from "./layout/ChronosHeader2026"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎴 PRIMITIVES - Componentes Base Reutilizables
// ═══════════════════════════════════════════════════════════════════════════════════

// Cards
export {
  GlassCard,
  GlassCardDescription,
  GlassCardIcon,
  GlassCardSubtitle,
  GlassCardTitle,
  GlassCardValue,
  type CardSize,
  type CardVariant,
  type GlassCardProps,
} from "./primitives/GlassCard"

export {
  CategoryCard,
  FeatureBadge,
  HeroCard,
  type CategoryCardProps,
  type HeroCardProps,
} from "./primitives/CategoryCard"

export { BankPersonaCard, PersonaCard, type PersonaCardProps } from "./primitives/PersonaCard"

// Stats & Metrics
export {
  AnimatedCounter,
  CurrencyStat,
  HeroStatCard,
  StatsRow,
  type HeroStatCardProps,
} from "./primitives/StatCards"

// Progress & Bars
export {
  CircularProgress,
  TechStackBar,
  TechStackList,
  type TechStackBarProps,
} from "./primitives/ProgressBars"

// Data Visualization
export {
  HeatmapCalendar,
  type HeatmapCalendarProps,
  type HeatmapDay,
} from "./primitives/HeatmapCalendar"

// Data Table
export {
  ActionsCell,
  AvatarCell,
  CurrencyCell,
  DataTable,
  DateCell,
  StatusCell,
  type ActionItem,
  type ActionsCellProps,
  type Column,
  type DataTableProps,
} from "./primitives/DataTable"

// Forms
export {
  FormField,
  PremiumButton,
  PremiumCheckbox,
  PremiumInput,
  PremiumSelect,
  PremiumTextarea,
  type FormFieldProps,
  type PremiumButtonProps,
  type PremiumCheckboxProps,
  type PremiumInputProps,
  type PremiumSelectProps,
  type PremiumTextareaProps,
  type SelectOption,
} from "./primitives/Forms"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎨 STYLES - Design Tokens y Variables CSS
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  animations,
  blur,
  borderRadius,
  breakpoints,
  colors,
  designTokens,
  gradients,
  shadows,
  spacing,
  typography,
  zIndex,
  type Animations,
  type Colors,
  type DesignTokens,
  type Gradients,
  type Shadows,
  type Typography,
} from "./styles/design-tokens"

// ═══════════════════════════════════════════════════════════════════════════════════
// � VISUAL EFFECTS - Efectos Visuales Cinematográficos
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  AuroraBackground as AuroraBackgroundEffect,
  CyberGrid,
  FloatingParticles,
  ScanLineEffect,
} from "./design/effects"

// ═══════════════════════════════════════════════════════════════════════════════════
// �🖼️ PANELS - Paneles Principales del Dashboard
// ═══════════════════════════════════════════════════════════════════════════════════
export * from "./panels"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🤖 AI COMPONENTS UNIFIED - Sistema IA Consolidado
// ═══════════════════════════════════════════════════════════════════════════════════
// Widget y Panel IA unificados con conexión a Turso/Drizzle
export { AuroraAIPanelUnified } from "./panels/AuroraAIPanelUnified"
export { AuroraAIWidgetUnified } from "./widgets/AuroraAIWidgetUnified"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🌌 3D COMPONENTS - Orbs y Efectos 3D
// ═══════════════════════════════════════════════════════════════════════════════════
export { QuantumOrb3D, type QuantumOrbProps } from "./3d/QuantumOrb3D"

// 3D Ultra Components
export { AIVoiceOrbWidget, type AIVoiceOrbWidgetProps } from "./3d/AIVoiceOrbWidget"
export { NexBot3DAvatar, type NexBot3DAvatarProps, type NexBotState } from "./3d/NexBot3DAvatar"

// 3D Engine & Effects
export {
  ChronosPostProcessing,
  CinematicTransitionEffect,
  FilmGrainEffect,
  HBAOEffect,
  QuantumDepthEffect,
  type ChronosPostProcessingProps,
} from "./3d/effects/ChronosPostProcessing"
export {
  FINANCIAL_FLOW_SHADER,
  FinancialParticleSystem,
  PARTICLE_COMPUTE_SHADER,
  useWebGPUCompute,
  type ComputeShaderPipeline,
  type ParticleSystemConfig,
  type WebGPUCapabilities,
} from "./3d/engine/WebGPUComputeEngine"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🌟 PREMIUM 3D COMPONENTS — ULTRA ELEVATION 2026
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  // Ultra Premium 3D Engine
  AmbientParticles,
  CausticsPlane,
  DEFAULT_FLUID_CONFIG,
  FluidPlane,
  InstancedParticles,
  PARTICLE_PRESETS,
  PremiumBloomSphere,
  PremiumEnvironment,
  PremiumMaterials,
  ProceduralSDF,
  ULTRA_PREMIUM_CONFIG,
  UltraPremiumPostProcessing,
  UltraPremiumScene,
  useFluidSimulation,
  useGlassMaterial,
  useHolographicMaterial,
  useIridescentMaterial,
  useLiquidMetalMaterial,
  VolumetricLight,
  // Types
  type FluidConfig,
  type InstancedParticlesConfig,
  type ParticlePreset,
  type SDFShape,
} from "./3d/premium"

// Premium Scene Presets
export { PREMIUM_MATERIAL_PRESETS, PREMIUM_SCENE_PRESETS, PREMIUM_SDF_PRESETS } from "./3d/premium"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🚀 SUPREME ELEVATION SYSTEM — OMEGA-LEVEL VISUAL COMPONENTS 2026
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  COLORS,
  QuantumParticleField as ElevationParticleField,
  // Quantum Effects (aliases to avoid conflicts)
  QuantumBackground as ElevationQuantumBackground,
  QuantumGlow,
  QuantumRipple,
  // Color System
  SUPREME_COLORS,
  // Core Elevation Components
  SupremeAura,
  SupremeBadge,
  SupremeButton,
  SupremeGlassCard,
  SupremeLoading,
  SupremeStatCard,
  // Ultra Card System
  UltraCard,
  UltraCardBody,
  UltraCardFooter,
  UltraCardHeader,
  UltraCardStack,
  type QuantumBackgroundProps as ElevationQuantumBackgroundProps,
  type SupremeAuraProps,
  type SupremeBadgeProps,
  type SupremeButtonProps,
  // Types
  type SupremeColorKey,
  type SupremeGlassCardProps,
  type SupremeLoadingProps,
  type SupremeStatCardProps,
  type UltraCardProps,
} from "./elevation"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🃏 SUPREME CARDS SYSTEM — ELEVATED PREMIUM CARDS 2026
// ═══════════════════════════════════════════════════════════════════════════════════
export { DistribuidorCard, SupremeDistribuidorCard } from "./cards"

// ═══════════════════════════════════════════════════════════════════════════════════
// ✨ BRANDING - Opening & Login Premium
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  UltraCinematicOpening,
  type UltraCinematicOpeningProps,
} from "./branding/UltraCinematicOpening"
export { UltraLogin, type UltraLoginProps } from "./branding/UltraLogin"

// 🌌 CHRONOS RISING - Animación de inicio cinematográfica SUPREME
export { ChronosRisingAnimation, type ChronosRisingProps } from "./branding/ChronosRisingAnimation"

// 🌌 KOCMOC LOGO — Logo estilo КОСМОС con texto ΧΡΟΝΟΣ
export { KocmocLogo, KocmocLogoCompact, type KocmocLogoProps } from "./branding/KocmocLogo"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🔐 AUTH - Componentes de Autenticación Premium
// ═══════════════════════════════════════════════════════════════════════════════════
export { GlassmorphicGateway } from "./auth/GlassmorphicGateway"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🔮 AI ORACLE - Widget de IA Premium
// ═══════════════════════════════════════════════════════════════════════════════════
export { TheOracleWithin } from "./ai/TheOracleWithin"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎬 CINEMATIC TRANSITIONS - Sistema de Transiciones Cinematográficas
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  // Cinematic Springs
  CINEMATIC_SPRINGS,
  // Cinematic Components
  PageTransition as CinematicPageTransition,
  PanelTransition as CinematicPanelTransition,
  StaggerContainer as CinematicStaggerContainer,
  StaggerItem as CinematicStaggerItem,
  expandFromCenter,
  // Cinematic Variants
  fadeBlur,
  LoadingSkeleton,
  morphFluid,
  scaleRotate,
  slideRight3D,
  slideUp3D,
} from "./transitions/CinematicTransitions"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎬 TRANSITIONS - Sistema de Transiciones Premium
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  dissolveVariants,
  // Variants
  fadeVariants,
  flipVariants,
  glitchVariants,
  HoverCard3D,
  LoadingState,
  MagneticButton,
  morpheusVariants,
  MorphingText,
  NumberCounter,
  // Components
  PageTransition,
  PanelTransition,
  portalVariants,
  quantumVariants,
  RippleEffect,
  rotateVariants,
  scaleVariants,
  Skeleton,
  slideVariants,
  staggerContainer,
  staggerItem,
  StaggerList,
  toastVariants,
  transitionPresets,
  type TransitionConfig,
  type TransitionType,
} from "./transitions/UltraTransitions"

// Microinteractions
export {
  Badge,
  CursorFollower,
  NotificationDot,
  PremiumToggle,
  ProgressBar,
  SkeletonCard,
  SkeletonTable,
  Tooltip,
  CircularProgress as UltraCircularProgress,
  PremiumButton as UltraPremiumButton,
  PremiumInput as UltraPremiumInput,
} from "./transitions/MicroInteractions"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎭 BACKGROUNDS - Fondos Animados
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  LiquidMeshBackground,
  type LiquidMeshBackgroundProps,
} from "./backgrounds/LiquidMeshBackground"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🌌 QUANTUM INFINITY 2026 - NEW ELEVATED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════

// Quantum Dashboard
export { QuantumDashboard } from "./dashboard/QuantumDashboard"

// Quantum 3D GLTF Models
export {
  NexbotCanvas,
  NexbotInOrbCanvas,
  NexbotModel,
  VoiceOrbCanvas,
  VoiceOrbModel,
} from "./3d/GLTFModels"

// Quantum Shaders & Backgrounds
export {
  LiquidDistortionBackground,
  ParticleFieldBackground,
  QuantumBackground,
  useCelebrationParticles,
} from "./shaders/QuantumBackgrounds"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🌌 SUPREME SHADER SYSTEM 2026 — ELITE WEBGL SHADERS
// ═══════════════════════════════════════════════════════════════════════════════════
export {
  AIShaderBackground,
  AIBackground as AIShaderBg,
  AlmacenShaderBackground,
  AlmacenBackground as AlmacenShaderBg,
  BancosShaderBackground,
  BancosBackground as BancosShaderBg,
  ClientesShaderBackground,
  ClientesBackground as ClientesShaderBg,
  ComprasShaderBackground,
  ComprasBackground as ComprasShaderBg,
  DashboardShaderBackground,
  DashboardBackground as DashboardShaderBg,
  detectDeviceCapabilities,
  DistribuidoresShaderBackground,
  DistribuidoresBackground as DistribuidoresShaderBg,
  GastosShaderBackground,
  GastosBackground as GastosShaderBg,
  getActiveContextCount,
  hexToRgb,
  MovimientosShaderBackground,
  MovimientosBackground as MovimientosShaderBg,
  PANEL_SHADER_PRESETS,
  PanelWithShaderBackground,
  registerWebGLContext,
  rgbToHex,
  SHADER_PRESETS,
  // Control panel
  ShaderControlPanel,
  ShaderControlTrigger,
  // Customization system
  ShaderCustomizationProvider,
  // Shader sources
  SUPREME_SHADERS,
  supremeGlowOrbFragment,
  supremeGlowOrbVertex,
  supremeLiquidFragment,
  supremeLiquidVertex,
  supremeParticleFragment,
  supremeParticleVertex,
  supremeRippleFragment,
  // Canvas component
  SupremeShaderCanvas,
  // Unified backgrounds
  UnifiedShaderBackground,
  unregisterWebGLContext,
  usePageVisibility,
  useShaderCustomization,
  // Performance utilities
  useShaderPerformance,
  useThrottledCallback,
  VentasShaderBackground,
  VentasBackground as VentasShaderBg,
  type DeviceCapabilities,
  type PanelShaderPreset,
  type PanelWithShaderBackgroundProps,
  type PerformanceMetrics,
  type ShaderConfig,
  type ShaderCustomization,
  type ShaderPerformanceConfig,
  type ShaderThemePreset,
  type SupremeShaderCanvasProps,
  // Types
  type SupremeShaderType,
  type UnifiedShaderBackgroundProps,
} from "./shaders"

// Quantum Auth
export { QuantumLoginCinematic } from "./auth/QuantumLoginCinematic"

// Quantum Design System
export {
  QUANTUM_GLASS,
  QUANTUM_GRADIENTS,
  QUANTUM_PALETTE,
  QUANTUM_SHADOWS,
  QUANTUM_SPRING,
  type QuantumMood,
} from "@/app/lib/design-system/quantum-infinity-2026"

// Quantum WebGPU Shaders
export {
  createUniformBuffer,
  LIQUID_METAL_FRAGMENT_SHADER,
  LIQUID_METAL_VERTEX_SHADER,
  PARTICLE_FRAGMENT_SHADER,
  PARTICLE_VERTEX_SHADER,
  PORTAL_FRAGMENT_SHADER,
  QUANTUM_SHADER_PROGRAMS,
  SHADER_COLORS,
  updateUniformBuffer,
  VOLUMETRIC_FOG_COMPUTE_SHADER,
  type ShaderProgram,
} from "@/app/lib/shaders/quantum-webgpu-shaders"

// Quantum Bio-Feedback System
export { useBioFeedback, type MoodState } from "@/app/lib/bio-feedback/bio-feedback-system"

// ═══════════════════════════════════════════════════════════════════════════════════
// ✨🎮 INTERACTIVE COMPONENTS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════
// Componentes interactivos premium para UI viva, táctil y adictiva

export {
  // Holo Timeline - Timeline 3D holográfico
  HoloTimeline,
  HoloTimeline2D,
  // Liquid Input - Campos con border líquida + spring
  LiquidInput,
  LiquidSearchInput,
  // Magnetic Ripple - Efecto magnético + ondas líquidas
  MagneticRipple,
  // Particle Explosion - Explosión partículas oro/violeta
  ParticleExplosion,
  SuccessCelebration,
  // Tilt Glow Card - Card KPI con tilt 3D + glow volumétrico
  TiltGlowCard,
} from "./interactive"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🤖🌌 SPLINE AVATAR SYSTEM — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════
// Sistema completo de avatar 3D interactivo con Spline

export {
  // Lip Sync - Sincronización labial con audio
  LipSyncController,
  PHONEME_TO_VISEME,
  // Avatar Controller - Control programático del avatar Nexbot
  SplineAvatarController,
  useLipSync,
  // Avatar Hook - Hook de React para control del avatar
  useSplineAvatar,
  VISEME_BLEND_SHAPES,
  type AvatarEmotion,
  type AvatarGesture,
  type MoodState as AvatarMoodState,
  type LipSyncConfig,
  type LipSyncState,
  type SplineAvatarControllerProps,
  type SplineAvatarControllerRef,
  type UseLipSyncReturn,
  type UseSplineAvatarConfig,
  type UseSplineAvatarReturn,
  type Viseme,
} from "./3d"

// ═══════════════════════════════════════════════════════════════════════════════════
// ⚡ SUPREME ELEVATION SYSTEMS 2026 — PREMIUM INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════════

// Auto-inject cinematographic animations
import "@/app/_components/chronos-2026/animations/CinematicAnimations"

// Physics Engine
export {
  FloatingCardsPhysics,
  InteractiveParticles,
  PhysicsEngine,
} from "@/app/_components/chronos-2026/3d/physics/PhysicsEngine"

// Particle Systems — QUANTUM ELEVATION 2026
export {
  AIBackground,
  AlmacenBackground,
  AuroraParticles,
  AuroraQuantumField,
  AuroraUnifiedBackground,
  BancosBackground,
  ClientesBackground,
  CosmicDust,
  CosmicQuantumField,
  CosmicUnifiedBackground,
  DashboardBackground,
  DistribuidoresBackground,
  EnergyFieldParticles,
  EnergyFlowField,
  EnergyUnifiedBackground,
  GastosBackground,
  MinimalUnifiedBackground,
  MovimientosBackground,
  NebulaField,
  NebulaUnifiedBackground,
  NeuralNetworkField,
  NeuralUnifiedBackground,
  // NEW: Optimized Panel Backgrounds (auto-pause, lazy load, device detection)
  OptimizedPanelBackground,
  OrdenesBackground,
  ParticleSystem,
  // NEW: Quantum Particle Field System
  QuantumParticleField,
  QuantumParticles,
  // NEW: Unified Background System
  UnifiedBackground,
  VentasBackground,
  type PanelType,
} from "@/app/_components/chronos-2026/particles/ParticleSystems"

// Premium Interactions Hooks
export {
  use3DTilt,
  useElementMouse,
  useGlowEffect,
  useMagnetic,
  useParallax as usePremiumParallax,
  useScrollReveal,
  useScrollVelocity,
  useSmoothMouse,
} from "@/app/_components/chronos-2026/interactions/usePremiumInteractions"

// Smooth Scroll System
export {
  FadeInOnScroll,
  gsap,
  HorizontalScrollSection,
  Lenis,
  ParallaxContainer,
  PinnedSection,
  ScrollCounter,
  ScrollTrigger,
  useSmoothScroll as useGlobalSmoothScroll,
  useParallax,
  useScrollAnimation,
  useScrollCounter,
  useSmoothScroll,
} from "@/app/_components/chronos-2026/scroll/SmoothScrollSystem"

// Supreme Panel Wrapper (Universal)
export { SupremePanelWrapper } from "@/app/_components/chronos-2026/wrappers/SupremePanelWrapper"

/**
 * Animaciones premium disponibles
 */
export const PREMIUM_ANIMATIONS = {
  glitch: "animate-glitch",
  hologram: "animate-hologram",
  chromatic: "animate-chromatic",
  neonFlicker: "animate-neon-flicker",
  cyberGlitch: "animate-cyber-glitch",
  scanLine: "animate-scan-line",
  matrixRain: "animate-matrix-rain",
  parallaxFloat: "animate-parallax-float",
  rotate3DX: "animate-3d-rotate-x",
  rotate3DY: "animate-3d-rotate-y",
  perspectiveShift: "animate-perspective-shift",
  depthPulse: "animate-depth-pulse",
  quantumWave: "animate-quantum-wave",
  auroraDance: "animate-aurora-dance",
  nebulaSwirl: "animate-nebula-swirl",
  photonBurst: "animate-photon-burst",
  plasmaFlow: "animate-plasma-flow",
  warpSpeed: "animate-warp-speed",
  crystallize: "animate-crystallize",
  energyPulse: "animate-energy-pulse",
  liquidMorph: "animate-liquid-morph",
  gravityPull: "animate-gravity-pull",
} as const

/**
 * Presets para diferentes tipos de paneles
 */
export const PANEL_PRESETS = {
  dashboard: {
    scroll: { duration: 1.2, smoothWheel: true },
    particles: { count: 80, colors: ["#8b5cf6", "#a78bfa", "#c084fc"] },
    animation: PREMIUM_ANIMATIONS.auroraDance,
  },
  data: {
    scroll: { duration: 1.0, smoothWheel: true },
    particles: { count: 60, colors: ["#06b6d4", "#0ea5e9", "#3b82f6"] },
    animation: PREMIUM_ANIMATIONS.quantumWave,
  },
  interactive: {
    scroll: { duration: 1.5, smoothWheel: true },
    particles: { count: 100, colors: ["#10b981", "#34d399", "#6ee7b7"] },
    animation: PREMIUM_ANIMATIONS.energyPulse,
  },
  ventas: {
    scroll: { duration: 1.1, smoothWheel: true },
    particles: { count: 70, colors: ["#22c55e", "#4ade80", "#86efac"] },
    animation: PREMIUM_ANIMATIONS.energyPulse,
  },
  ordenes: {
    scroll: { duration: 1.2, smoothWheel: true },
    particles: { count: 75, colors: ["#f59e0b", "#fbbf24", "#fcd34d"] },
    animation: PREMIUM_ANIMATIONS.auroraDance,
  },
  bancos: {
    scroll: { duration: 1.3, smoothWheel: true },
    particles: { count: 90, colors: ["#6366f1", "#818cf8", "#a5b4fc"] },
    animation: PREMIUM_ANIMATIONS.quantumWave,
  },
  clientes: {
    scroll: { duration: 1.0, smoothWheel: true },
    particles: { count: 65, colors: ["#ec4899", "#f472b6", "#f9a8d4"] },
    animation: PREMIUM_ANIMATIONS.auroraDance,
  },
  almacen: {
    scroll: { duration: 1.1, smoothWheel: true },
    particles: { count: 60, colors: ["#14b8a6", "#2dd4bf", "#5eead4"] },
    animation: PREMIUM_ANIMATIONS.quantumWave,
  },
  ai: {
    scroll: { duration: 1.4, smoothWheel: true },
    particles: { count: 120, colors: ["#8b5cf6", "#a855f7", "#d946ef"] },
    animation: PREMIUM_ANIMATIONS.energyPulse,
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════
// 🚀 ULTRA PREMIUM SYSTEM 2026 — NUEVOS COMPONENTES AVANZADOS
// ═══════════════════════════════════════════════════════════════════════════════════
export * from "./ultra-premium"

// ═══════════════════════════════════════════════════════════════════════════════════
// 📝 PREMIUM FORMS SYSTEM 2026 — FORMULARIOS GLASSMORPHISM COMPLETOS
// ═══════════════════════════════════════════════════════════════════════════════════

// Complete Premium Forms (Glassmorphism + Zod + React Hook Form)
export {
  // Gastos, Abonos, Transferencias
  AbonoFormPremium,
  // Schemas
  AbonoFormSchema,
  // Almacén
  AlmacenProductoFormPremium,
  BANCO_IDS,
  BancoIdSchema,
  // Base Form Components
  CalculationPanel,
  // Clientes
  ClienteFormPremium,
  ClienteFormSchema,
  // React Hook Form utilities
  Controller,
  // Distribuidores
  DistribuidorFormPremium,
  DistribuidorFormSchema,
  EstadoPagoSchema,
  FormActions,
  FormCurrencyInput,
  FormGrid,
  FormInput,
  FormModal,
  FormProvider,
  FormSection,
  FormSelect,
  FormTextarea,
  GastoFormPremium,
  GastoFormSchema,
  // Movimientos Financieros
  MovimientoFormPremium,
  // Órdenes de Compra
  OrdenCompraFormPremium,
  OrdenCompraFormSchema,
  // Quantum Form Components
  QuantumCheckboxField,
  QuantumCurrencyField,
  QuantumInputField,
  QuantumRadioGroupField,
  QuantumSelectField,
  QuantumSubmitButton,
  QuantumTextareaField,
  QuantumWizard,
  SubmitButton,
  TransferenciaFormPremium,
  TransferenciaFormSchema,
  useForm,
  useFormContext,
  useWatch,
  // Ventas
  VentaFormPremium,
  VentaFormSchema,
  zodResolver,
  // Types
  type AbonoFormData,
  type AlmacenProductoFormData,
  type CalculationItem,
  type CalculationPanelProps,
  type ClienteFormData,
  type DistribuidorFormData,
  type FormActionsProps,
  type FormCurrencyInputProps,
  type FormGridProps,
  type FormInputProps,
  type FormModalProps,
  type FormSectionProps,
  type SelectOption as FormSelectOption,
  type FormSelectProps,
  type FormTextareaProps,
  type GastoFormData,
  type MovimientoFormDataNew,
  type OrdenCompraFormData,
  type SubmitButtonProps,
  type TransferenciaFormData,
  type VentaFormData,
} from "./forms"

// ═══════════════════════════════════════════════════════════════════════════════════
// ✨ ANIMATIONS - Animaciones Cinematográficas Premium 2026
// ═══════════════════════════════════════════════════════════════════════════════════

// Logo Opening Cinematográfico
export { LogoOpeningCinematic } from "./animations/LogoOpeningCinematic"

// Premium KPI Cards con Tilt 3D
export { PremiumKpiCard, PremiumKpiCardGrid } from "./cards/PremiumKpiCard"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🔗 TRANSITIONS - Sistema de Transiciones Avanzadas
// ═══════════════════════════════════════════════════════════════════════════════════

// Shared Element Transitions
export {
  PageMorphTransition,
  SHARED_TRANSITIONS,
  SharedElement,
  SharedElementCard,
  SharedElementImage,
  SharedElementProvider,
  SharedElementText,
  SharedLogo,
  useSharedElement,
} from "./transitions/SharedElementTransitions"

// Liquid Morph Panel Navigation
export {
  BLOB_PATHS,
  LiquidBlob,
  LiquidMorphCard,
  LiquidMorphTabs,
  LiquidPanel,
  LiquidWaveTransition,
  WAVE_PATH,
} from "./transitions/LiquidMorphPanel"

// ═══════════════════════════════════════════════════════════════════════════════════
// ⚡ MOTION PRIMITIVES - Primitivas de Animación Reutilizables
// ═══════════════════════════════════════════════════════════════════════════════════

export {
  BlurReveal,
  FadeIn,
  FadeInDown,
  FadeInScale,
  FadeInUp,
  HoverScale,
  HoverTilt,
  MagneticElement,
  AnimatedCounter as MotionCounter,
  fadeDownVariants as motionFadeDownVariants,
  fadeScaleVariants as motionFadeScaleVariants,
  fadeUpVariants as motionFadeUpVariants,
  fadeVariants as motionFadeVariants,
  scaleUpVariants as motionScaleUpVariants,
  slideLeftVariants as motionSlideLeftVariants,
  slideRightVariants as motionSlideRightVariants,
  staggerContainerVariants as motionStaggerContainerVariants,
  ParallaxScroll,
  SPRING_PRESETS,
  StaggerContainer,
  StaggerItem,
  TypewriterText,
} from "./primitives/MotionPrimitives"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎬 GSAP SCROLL TRIGGER SYSTEM — Premium Scroll Animations
// ═══════════════════════════════════════════════════════════════════════════════════

export {
  ParallaxLayer,
  ParallaxLayers,
  ScrollMagicText,
  ScrollParallax,
  ScrollPin,
  ScrollProgress,
  ScrollReveal,
  ScrollSnapSection,
  ScrollTimeline,
  useGSAPScrollTrigger,
} from "./scroll/GSAPScrollTriggerSystem"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🌌 KOCMOC LOGO OPENING — Logo КОСМОС Cinematográfico
// ═══════════════════════════════════════════════════════════════════════════════════

export { KocmocLogoOpening, KocmocLogoStatic } from "./animations/KocmocLogoOpening"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎉 CELEBRATION EFFECTS — Efectos de Celebración Éxtasis Financiero
// ═══════════════════════════════════════════════════════════════════════════════════

export {
  ConfettiExplosion,
  EcstasyFinancialCelebration,
  Fireworks,
  GoldRain,
  HAPTIC_PATTERNS,
  SuccessPulse,
  triggerHaptic,
  useCelebration,
} from "./animations/PremiumCelebrationEffects"

// ═══════════════════════════════════════════════════════════════════════════════════
// 🎭 PREMIUM MOTION COMPONENTS — Stagger, Gesture, Parallax 3D
// ═══════════════════════════════════════════════════════════════════════════════════

export {
  FollowCursor3D,
  GestureVelocityCard,
  OrchestrateCelebration,
  ParallaxLayer3D,
  PremiumGestureParallax,
  PremiumStaggerEntrance,
  SharedLayoutMorph,
  SplitTextReveal,
} from "./animations/PremiumMotionComponents"
