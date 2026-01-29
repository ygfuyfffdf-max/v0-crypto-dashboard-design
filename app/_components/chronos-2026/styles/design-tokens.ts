/**
 * 🎨 CHRONOS 2026 DESIGN TOKENS
 * ═══════════════════════════════════════════════════════════════════════════
 * Sistema de tokens de diseño premium inspirado en 1UI.dev Year Wrapped
 * - Paleta de colores vibrantes con gradientes fluidos
 * - Tipografía cinematográfica
 * - Sombras y efectos glassmorphism de última generación
 * - Variables de animación cinematográficas
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// PALETA DE COLORES 2026
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  // Base oscura premium
  void: {
    pure: '#000000',
    deep: '#050506',
    soft: '#0a0a0b',
    elevated: '#111113',
    surface: '#141416',
    subtle: '#1a1a1d',
    muted: '#222225',
  },

  // Texto
  text: {
    primary: '#ffffff',
    secondary: '#b4b4b4',
    muted: '#888888',
    ghost: '#555555',
    inverse: '#000000',
  },

  // Bordes y separadores
  border: {
    invisible: 'rgba(255, 255, 255, 0.02)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    default: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(255, 255, 255, 0.20)',
    active: 'rgba(255, 255, 255, 0.30)',
  },

  // Acentos primarios - Púrpura/Violeta vibrante
  accent: {
    primary: '#a855f7',
    light: '#c084fc',
    dark: '#7c3aed',
    muted: 'rgba(168, 85, 247, 0.15)',
    glow: 'rgba(168, 85, 247, 0.50)',
  },

  // Secundarios - Magenta/Rosa (CYAN PROHIBIDO)
  magenta: {
    primary: '#ec4899',
    light: '#f472b6',
    dark: '#db2777',
    muted: 'rgba(236, 72, 153, 0.15)',
    glow: 'rgba(236, 72, 153, 0.50)',
  },

  // Terciarios - Amarillo/Dorado
  gold: {
    primary: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
    muted: 'rgba(251, 191, 36, 0.15)',
    glow: 'rgba(251, 191, 36, 0.50)',
  },

  // Verde lima vibrante (para top category)
  lime: {
    primary: '#a3e635',
    light: '#bef264',
    dark: '#84cc16',
    muted: 'rgba(163, 230, 53, 0.15)',
    glow: 'rgba(163, 230, 53, 0.50)',
  },

  // Naranja (para productividad)
  orange: {
    primary: '#fb923c',
    light: '#fdba74',
    dark: '#f97316',
    muted: 'rgba(251, 146, 60, 0.15)',
    glow: 'rgba(251, 146, 60, 0.50)',
  },

  // Estados
  success: {
    primary: '#10b981',
    light: '#34d399',
    dark: '#059669',
    muted: 'rgba(16, 185, 129, 0.15)',
  },

  warning: {
    primary: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    muted: 'rgba(245, 158, 11, 0.15)',
  },

  error: {
    primary: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    muted: 'rgba(239, 68, 68, 0.15)',
  },

  // Bancos CHRONOS
  banks: {
    monte: { primary: '#a855f7', gradient: ['#a855f7', '#c084fc'] },
    usa: { primary: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] },
    profit: { primary: '#10b981', gradient: ['#10b981', '#34d399'] },
    leftie: { primary: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] },
    azteca: { primary: '#ef4444', gradient: ['#ef4444', '#f87171'] },
    fleteSur: { primary: '#ec4899', gradient: ['#ec4899', '#f472b6'] },
    utilidades: { primary: '#fbbf24', gradient: ['#fbbf24', '#fcd34d'] },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// GRADIENTES PREMIUM
// ═══════════════════════════════════════════════════════════════════════════

export const gradients = {
  // Hero gradients (como el Year Wrapped principal)
  heroViolet: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 50%, #c084fc 100%)',
  heroMagenta: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)',
  heroRose: 'linear-gradient(135deg, #9f1239 0%, #e11d48 50%, #fb7185 100%)',
  heroGold: 'linear-gradient(135deg, #78350f 0%, #f59e0b 50%, #fcd34d 100%)',
  heroOrange: 'linear-gradient(155deg, #ea580c 0%, #fb923c 50%, #fdba74 100%)',
  heroLime: 'linear-gradient(135deg, #365314 0%, #84cc16 50%, #bef264 100%)',

  // Fluid organic gradients
  fluidPurple:
    'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 25%, #7c3aed 50%, #a855f7 75%, #e879f9 100%)',
  fluidAurora:
    'linear-gradient(135deg, #0f172a 0%, #1e3a8a 20%, #7c3aed 40%, #ec4899 60%, #f43f5e 80%, #fb923c 100%)',

  // Glass/Surface gradients
  glassCard: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
  glassBorder: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)',
  glassShine: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)',

  // Mesh gradients
  meshPrimary: `
    radial-gradient(at 40% 20%, rgba(168, 85, 247, 0.4) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(34, 211, 238, 0.3) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(236, 72, 153, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 50%, rgba(251, 191, 36, 0.2) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(124, 58, 237, 0.3) 0px, transparent 50%),
    linear-gradient(135deg, #0a0a0b 0%, #141416 100%)
  `,

  // Glow effects
  glowPurple: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
  glowCyan: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)',
  glowGold: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',

  // Background patterns
  gridDots: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
  gridLines:
    'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// SOMBRAS PREMIUM
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  // Elevación básica
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',

  // Glass shadows
  glass: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  glassHover: '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  glassActive: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',

  // Glow shadows (para cards activas)
  glowPurple: '0 0 40px rgba(168, 85, 247, 0.25), 0 0 80px rgba(168, 85, 247, 0.15)',
  glowCyan: '0 0 40px rgba(34, 211, 238, 0.25), 0 0 80px rgba(34, 211, 238, 0.15)',
  glowGold: '0 0 40px rgba(251, 191, 36, 0.25), 0 0 80px rgba(251, 191, 36, 0.15)',
  glowOrange: '0 0 40px rgba(251, 146, 60, 0.25), 0 0 80px rgba(251, 146, 60, 0.15)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  innerGlass: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), inset 0 -1px 1px rgba(0, 0, 0, 0.1)',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// TIPOGRAFÍA
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  fonts: {
    display: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", "Fira Code", "Monaco", monospace',
  },

  sizes: {
    '2xs': '0.625rem', // 10px
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
    hero: '10rem', // 160px - Para números hero como "2025"
  },

  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeights: {
    none: 1,
    tight: 1.15,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// ESPACIADO Y TAMAÑOS
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
  full: '9999px',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// ANIMACIONES CINEMATOGRÁFICAS
// ═══════════════════════════════════════════════════════════════════════════

export const animations = {
  // Duraciones
  durations: {
    instant: '0ms',
    fastest: '100ms',
    faster: '150ms',
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
    slower: '500ms',
    slowest: '700ms',
    cinematic: '1000ms',
    epic: '1500ms',
  },

  // Easings cinematográficos
  easings: {
    // Suaves y elegantes
    butter: 'cubic-bezier(0.22, 1, 0.36, 1)',
    silk: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    liquid: 'cubic-bezier(0.16, 1, 0.3, 1)',
    feather: 'cubic-bezier(0.32, 0.72, 0, 1)',

    // Con rebote
    bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    snap: 'cubic-bezier(0.68, -0.4, 0.32, 1.4)',

    // Dramáticos
    dramatic: 'cubic-bezier(0.7, 0, 0.3, 1)',
    anticipate: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

    // Standard
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Spring configs para Framer Motion
  springs: {
    gentle: { stiffness: 120, damping: 14 },
    snappy: { stiffness: 300, damping: 20 },
    bouncy: { stiffness: 400, damping: 10 },
    stiff: { stiffness: 700, damping: 30 },
    slow: { stiffness: 80, damping: 15 },
    responsive: { stiffness: 200, damping: 20 },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════════════

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
  '4xl': '2560px',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// Z-INDEX LAYERS
// ═══════════════════════════════════════════════════════════════════════════

export const zIndex = {
  background: -10,
  base: 0,
  elevated: 10,
  dropdown: 50,
  sticky: 100,
  modal: 200,
  popover: 300,
  tooltip: 400,
  overlay: 500,
  toast: 600,
  max: 9999,
} as const

// ═══════════════════════════════════════════════════════════════════════════
// BLUR VALUES (Glassmorphism)
// ═══════════════════════════════════════════════════════════════════════════

export const blur = {
  none: '0',
  sm: '4px',
  default: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
  extreme: '100px',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS COMBINADOS
// ═══════════════════════════════════════════════════════════════════════════

export const designTokens = {
  colors,
  gradients,
  shadows,
  typography,
  spacing,
  borderRadius,
  animations,
  breakpoints,
  zIndex,
  blur,
} as const

export type DesignTokens = typeof designTokens
export type Colors = typeof colors
export type Gradients = typeof gradients
export type Shadows = typeof shadows
export type Typography = typeof typography
export type Animations = typeof animations
