/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌟 CHRONOS PREMIUM EFFECTS — MASTER INDEX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportación centralizada de TODOS los efectos premium de CHRONOS:
 * - Físicas reales (Rapier3D)
 * - Animaciones orgánicas (React Spring)
 * - Scroll effects 3D + Parallax
 * - Contadores animados + Loading states
 * - Hover effects magnéticos + Tilt 3D
 *
 * IMPORTAR TODO DESDE AQUÍ:
 * ```ts
 * import { MagneticButton, AnimatedCounter, ParallaxSection } from '@/app/_lib/premium-effects'
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FÍSICAS REALES — RAPIER3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  initRapier,
  getRapier,
  createStandardWorld,
  createZeroGravityWorld,
  createLunarWorld,
  createSphere,
  createCube,
  applyImpulse,
  applyForce,
  applyTorque,
  stepSimulation,
  getPosition,
  getRotation,
  getLinearVelocity,
  getAngularVelocity,
  type RigidBodyConfig,
} from './physics/rapier-physics'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ANIMACIONES ORGÁNICAS — REACT SPRING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Configs
  SPRING_CONFIGS,

  // Hooks
  useHoverSpring,
  useCountUpSpring,
  useParallax3DSpring,
  useStaggeredEntranceSpring,
  useLoadingSpring,
  useMagneticSpring,
  useBreathingSpring,
  useLiquidMorphSpring,
  useRippleSpring,

  // Components
  OrganicButton,
  FloatingCard,
  PulsingOrb,

  // Re-exports
  animated,
  useSpring,
  useTrail,
  config,
} from './animations/organic-spring'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL EFFECTS 3D + PARALLAX
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Hooks
  useParallaxScroll,
  useFadeInScroll,
  useRotate3DScroll,
  useStickyScale,
  useZoomInScroll,
  useScrollProgress,
  useRevealScroll,
  useMouseParallax3D,

  // Components
  ParallaxSection,
  FadeInSection,
  Rotate3DSection,
  ScrollProgressBar,
  ZoomInCard,
  RevealSection,
  MouseParallax3DCard,

  // Re-exports
  motion,
  useScroll,
  useTransform,
  useMotionValue,
} from './effects/premium-scroll-effects'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTADORES ANIMADOS + LOADING STATES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Counter Hooks
  useAnimatedCounter,
  useFormattedCounter,
  useCurrencyCounter,
  usePercentageCounter,

  // Counter Components
  AnimatedCounter,
  CurrencyCounter,
  PercentageCounter,

  // Loading States
  PremiumSpinner,
  PulsingDots,
  PremiumProgressBar,
  PremiumSkeleton,
  OrbitalLoader,
} from './animations/premium-counters'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOVER EFFECTS — MAGNÉTICOS + TILT 3D + GLOW
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Hooks
  useMagneticHover,
  useTilt3D,
  useGlowHover,
  useScaleGlow,

  // Components
  MagneticButton,
  Tilt3DCard,
  GlowButton,
  ScaleGlowCard,
  RippleButton,
  FloatingHoverCard,
} from './effects/premium-hover-effects'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS GLOBALES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  OrganicButtonProps,
  FloatingCardProps,
  PulsingOrbProps,
} from './animations/organic-spring'

export type {
  AnimatedCounterProps,
  CurrencyCounterProps,
  PercentageCounterProps,
  SpinnerProps,
  ProgressBarProps,
} from './animations/premium-counters'

export type {
  MagneticButtonProps,
  Tilt3DCardProps,
  GlowButtonProps,
  ScaleGlowCardProps,
} from './effects/premium-hover-effects'
